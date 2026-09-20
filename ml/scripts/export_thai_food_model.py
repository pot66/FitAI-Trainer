import argparse
import shutil
from pathlib import Path
from ultralytics import YOLO

def main():
    root = Path(__file__).resolve().parents[2]
    p = argparse.ArgumentParser(description="Export Thai Food Model to ONNX")
    p.add_argument("--model", default=str(root / "ml/runs/thai-food-cls/weights/best.pt"), help="Path to .pt model")
    p.add_argument("--format", default="onnx", choices=["onnx", "engine", "openvino"], help="Export format")
    p.add_argument("--imgsz", type=int, default=224, help="Image size")
    args = p.parse_args()

    print(f"Loading model: {args.model}")
    model = YOLO(args.model)
    out_path = model.export(format=args.format, imgsz=args.imgsz, dynamic=True)
    print(f"Exported successfully to: {out_path}")

    # Copy to ai-service/models/
    dest = root / f"ai-service/models/thai_food_cls.{args.format}"
    if Path(out_path).exists():
        shutil.copy2(out_path, dest)
        print(f"Copied to: {dest}")

if __name__ == "__main__":
    main()
