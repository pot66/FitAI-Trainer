# FitAI Trainer ML Training

## 1. Prepare

Use Python 3.11/3.12 and a CUDA-enabled GPU for practical training speed.

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux
source .venv/bin/activate

pip install -r ml/requirements.txt
```

## 2. Train

```bash
python ml/scripts/train_exercise_pose.py --epochs 100 --imgsz 640 --batch 16 --device 0
```

Ultralytics supports custom pose training directly from a dataset YAML and requires `kpt_shape` in the dataset definition. citeturn400226search0turn400226search5

## 3. Evaluate

```bash
python ml/scripts/evaluate_exercise_pose.py --model ml/runs/exercise-pose-v1/weights/best.pt --split test
```

Do not deploy a model based only on training loss. Check held-out test performance and inspect false positives/false negatives for each of the six exercise classes.

## 4. Deploy

Copy:

```text
ml/runs/exercise-pose-v1/weights/best.pt
```

to:

```text
ai-service/models/best.pt
```

Then:

```bash
docker compose up -d --build
```

Check:

```text
GET /health
GET /exercise/model
```

The AI service reports whether the trained checkpoint was found and loaded.

Ultralytics also supports ONNX/TensorRT export when further deployment optimization is needed. citeturn400226search2turn400226search3
