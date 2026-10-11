import base64
import io
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
from PIL import Image

MODEL_PATH = os.getenv("EXERCISE_YOLO_MODEL", "/app/models/best.pt")
YOLO_CONF = float(os.getenv("EXERCISE_YOLO_CONF", "0.45"))
YOLO_IMGSZ = int(os.getenv("EXERCISE_YOLO_IMGSZ", "416"))

_FALLBACK_CLASS_NAMES = [
    "JumpingJacks_End",
    "JumpingJacks_Start",
    "Lunges_End",
    "Lunges_Start",
    "Push-up_End",
    "Push-up_Start",
    "Sit-ups_End",
    "Sit-ups_Start",
    "Squats_End",
    "Squats_Start",
]

_model = None
_load_error: Optional[str] = None


def _load_model():
    global _model, _load_error
    if _model is not None:
        return _model
    if not Path(MODEL_PATH).exists():
        _load_error = f"model not found: {MODEL_PATH}"
        return None
    try:
        from ultralytics import YOLO
        _model = YOLO(MODEL_PATH)
        _load_error = None
        return _model
    except Exception as exc:  # pragma: no cover
        _load_error = str(exc)
        return None


def get_class_names() -> List[str]:
    model = _load_model()
    if model is not None and hasattr(model, "names") and model.names:
        return [str(model.names[i]) for i in sorted(model.names.keys())]
    return _FALLBACK_CLASS_NAMES


def status() -> Dict[str, Any]:
    names = get_class_names()
    return {
        "enabled": os.getenv("ENABLE_EXERCISE_YOLO", "true").lower() == "true",
        "modelPath": MODEL_PATH,
        "modelExists": Path(MODEL_PATH).exists(),
        "loaded": _model is not None,
        "error": _load_error,
        "totalClasses": len(names),
        "classes": names,
    }


def decode_image(image_base64: str) -> np.ndarray:
    raw = image_base64.split(",", 1)[-1]
    image = Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGB")
    return np.array(image)


def predict(image_base64: str, conf: Optional[float] = None) -> Dict[str, Any]:
    if os.getenv("ENABLE_EXERCISE_YOLO", "true").lower() != "true":
        return {"available": False, "reason": "disabled"}

    model = _load_model()
    if model is None:
        return {"available": False, "reason": _load_error or "model unavailable"}

    image = decode_image(image_base64)
    results = model.predict(
        source=image,
        conf=conf if conf is not None else YOLO_CONF,
        imgsz=YOLO_IMGSZ,
        verbose=False,
    )
    if not results:
        return {"available": True, "detections": []}

    result = results[0]
    detections: List[Dict[str, Any]] = []
    boxes = result.boxes
    keypoints = getattr(result, "keypoints", None)
    class_names = get_class_names()

    for i in range(len(boxes)):
        cls_id = int(boxes.cls[i].item())
        score = float(boxes.conf[i].item())
        xyxy = boxes.xyxy[i].tolist()
        class_label = class_names[cls_id] if 0 <= cls_id < len(class_names) else str(cls_id)

        # Parse base exercise name and rep phase (Start/End)
        base_exercise = class_label
        phase = None
        if "_" in class_label:
            parts = class_label.rsplit("_", 1)
            if parts[1].lower() in {"start", "end"}:
                base_exercise = parts[0].replace("-", " ")
                phase = parts[1].capitalize()

        item: Dict[str, Any] = {
            "classId": cls_id,
            "exercise": base_exercise,
            "label": class_label,
            "phase": phase,
            "confidence": round(score, 4),
            "box": [round(float(v), 2) for v in xyxy],
        }
        if keypoints is not None and len(keypoints) > i:
            data = keypoints.data[i].detach().cpu().numpy()
            item["keypoints"] = [
                [round(float(x), 4), round(float(y), 4), round(float(v), 4)]
                for x, y, v in data
            ]
        detections.append(item)

    detections.sort(key=lambda item: item["confidence"], reverse=True)
    return {"available": True, "detections": detections}
