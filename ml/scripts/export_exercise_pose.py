from ultralytics import YOLO
import argparse

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--model", required=True)
    p.add_argument("--format", default="onnx", choices=["onnx","engine","openvino"])
    p.add_argument("--imgsz", type=int, default=640)
    args=p.parse_args()
    model=YOLO(args.model)
    print(model.export(format=args.format, imgsz=args.imgsz, dynamic=True))
if __name__=="__main__":
    main()
