import argparse
import os
import shutil
from pathlib import Path
from ultralytics import YOLO

def main():
    root = Path(__file__).resolve().parents[2]
    last_pt_default = root / "ml/runs/thai-food-cls/weights/last.pt"

    p = argparse.ArgumentParser(description="Train / Resume Thai Food Classification Model with YOLO")
    p.add_argument("--data", default=str(root / "ml/datasets/thai_food"), help="Path to thai_food dataset (must contain train/ and val/)")
    p.add_argument("--model", default="yolo11n-cls.pt", help="Pretrained model or checkpoint (e.g. yolo11n-cls.pt or path to last.pt)")
    p.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    p.add_argument("--imgsz", type=int, default=224, help="Image size")
    p.add_argument("--batch", type=int, default=32, help="Batch size")
    p.add_argument("--device", default="0", help="CUDA device index (e.g. 0) or cpu")
    p.add_argument("--project", default=str(root / "ml/runs"), help="Project save directory")
    p.add_argument("--name", default="thai-food-cls", help="Run experiment name")
    p.add_argument("--resume", action="store_true", help="Resume from last checkpoint")
    p.add_argument("--export", action="store_true", default=True, help="Auto export to ONNX after training")

    args = p.parse_args()

    # If --resume is given, check for checkpoint
    if args.resume:
        checkpoint = Path(args.model) if Path(args.model).exists() else last_pt_default
        if not checkpoint.exists():
            print(f"Error: Cannot resume, checkpoint not found at: {checkpoint}")
            return
        print("=" * 60)
        print("FitAI Trainer — Resuming Thai Food AI Training Pipeline")
        print(f"Resuming from checkpoint : {checkpoint}")
        print("=" * 60)
        model = YOLO(str(checkpoint))
        results = model.train(resume=True)
    else:
        print("=" * 60)
        print("FitAI Trainer — Thai Food AI Training Pipeline")
        print(f"Dataset : {args.data}")
        print(f"Model   : {args.model}")
        print(f"Epochs  : {args.epochs}")
        print(f"Batch   : {args.batch}")
        print(f"ImageSz : {args.imgsz}")
        print(f"Device  : {args.device}")
        print("=" * 60)
        model = YOLO(args.model)
        results = model.train(
            data=args.data,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            device=args.device,
            project=args.project,
            name=args.name,
            pretrained=True,
            patience=5,
            workers=4,
            cache=False,
            plots=True,
            exist_ok=True,
        )

    print("\nTraining completed successfully!")
    best_pt = Path(args.project) / args.name / "weights" / "best.pt"
    if best_pt.exists():
        print(f"Best model saved at: {best_pt}")

        # Copy to ai-service/models/thai_food_cls.pt
        dest_pt = root / "ai-service/models/thai_food_cls.pt"
        dest_pt.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best_pt, dest_pt)
        print(f"Copied model to: {dest_pt}")

        # Export to ONNX
        if args.export:
            print("\nExporting model to ONNX format...")
            try:
                best_model = YOLO(str(best_pt))
                exported_path = best_model.export(format="onnx", imgsz=args.imgsz, dynamic=True)
                print(f"Exported ONNX model to: {exported_path}")
                dest_onnx = root / "ai-service/models/thai_food_cls.onnx"
                if Path(exported_path).exists():
                    shutil.copy2(exported_path, dest_onnx)
                    print(f"Copied ONNX model to: {dest_onnx}")
            except Exception as e:
                print(f"Notice: ONNX export encountered: {e}")

    print("\nAll done! Model is ready for AI Food Assistant!")

if __name__ == "__main__":
    main()
