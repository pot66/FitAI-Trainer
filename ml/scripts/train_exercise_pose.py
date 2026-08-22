from pathlib import Path
import argparse
from ultralytics import YOLO

def main():
    root = Path(__file__).resolve().parents[2]
    p=argparse.ArgumentParser()
    p.add_argument("--data", default=str(root / "ml/datasets/exercise-v4/data.yaml"))
    p.add_argument("--model", default="yolo11n-pose.pt")
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--batch", type=int, default=16)
    p.add_argument("--device", default=None, help="cpu, 0, 0,1 or mps")
    p.add_argument("--project", default=str(root / "ml/runs"))
    p.add_argument("--name", default="exercise-pose-v1")
    args=p.parse_args()
    overrides=dict(
        data=args.data, epochs=args.epochs, imgsz=args.imgsz, batch=args.batch,
        project=args.project, name=args.name, pretrained=True, patience=20,
        workers=4, cache=False, plots=True, exist_ok=True,
    )
    if args.device: overrides["device"]=args.device
    model=YOLO(args.model)
    results=model.train(**overrides)
    print(results)
if __name__=="__main__":
    main()
