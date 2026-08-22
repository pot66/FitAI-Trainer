import base64
import io
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
from PIL import Image

MODEL_PATH = os.getenv("EXERCISE_YOLO_MODEL", "/app/models/best.pt")
YOLO_CONF = float(os.getenv("EXERCISE_YOLO_CONF", "0.45"))
YOLO_IMGSZ = int(os.getenv("EXERCISE_YOLO_IMGSZ", "640"))

_CLASS_NAMES = [
    "Bird Dog",
    "Knee Push up",
    "Plank",
    "Push up",
    "Revese Lunge",
    "Squat",
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


def status() -> Dict[str, Any]:
    return {
        "enabled": os.getenv("ENABLE_EXERCISE_YOLO", "true").lower() == "true",
        "modelPath": MODEL_PATH,
        "modelExists": Path(MODEL_PATH).exists(),
        "loaded": _model is not None,
        "error": _load_error,
        "classes": _CLASS_NAMES,
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

    for i in range(len(boxes)):
        cls_id = int(boxes.cls[i].item())
        score = float(boxes.conf[i].item())
        xyxy = boxes.xyxy[i].tolist()
        item: Dict[str, Any] = {
            "classId": cls_id,
            "exercise": _CLASS_NAMES[cls_id] if 0 <= cls_id < len(_CLASS_NAMES) else str(cls_id),
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
