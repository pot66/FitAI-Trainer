from ultralytics import YOLO
import argparse

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--model", required=True)
    p.add_argument("--data", default="ml/datasets/exercise-v4/data.yaml")
    p.add_argument("--split", default="test", choices=["val","test"])
    p.add_argument("--imgsz", type=int, default=640)
    args=p.parse_args()
    model=YOLO(args.model)
    metrics=model.val(data=args.data, split=args.split, imgsz=args.imgsz, plots=True)
    print(metrics)
if __name__=="__main__":
    main()
