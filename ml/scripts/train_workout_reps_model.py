import os
import sys
import shutil
import json
from pathlib import Path
from ultralytics import YOLO

ROOT_DIR = Path("E:/FitAI Trainer")
DATASET_YAML = ROOT_DIR / "ml/datasets/workout-reps-v6/data.yaml"
BASE_MODEL = ROOT_DIR / "ai-service/models/yolo11n-pose.pt"
RUNS_DIR = ROOT_DIR / "ml/runs"
MODELS_DIR = ROOT_DIR / "ml/models"
AI_MODELS_DIR = ROOT_DIR / "ai-service/models"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
AI_MODELS_DIR.mkdir(parents=True, exist_ok=True)

CLASS_NAMES = [
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

def main():
    print("=" * 70)
    print("🏋️‍♂️ FITAI TRAINER: TRAINING WORKOUT REPS COUNTER V6 POSE MODEL")
    print("=" * 70)
    print(f"Dataset config: {DATASET_YAML}")
    print(f"Base model:     {BASE_MODEL}")
    print(f"Classes ({len(CLASS_NAMES)}): {CLASS_NAMES}")
    print("=" * 70)

    # 1. Backup old best.pt if needed
    old_best = AI_MODELS_DIR / "best.pt"
    backup_best = AI_MODELS_DIR / "best_v4_6class.pt"
    if old_best.exists() and not backup_best.exists():
        print(f"Backing up previous model {old_best} -> {backup_best}")
        shutil.copy2(old_best, backup_best)

    # 2. Copy training script to ml/scripts if desired
    target_script = ROOT_DIR / "ml/scripts/train_workout_reps_model.py"
    try:
        shutil.copy2(__file__, target_script)
        print(f"Saved script copy to {target_script}")
    except Exception as e:
        pass

    # 3. Initialize YOLO Pose model
    model = YOLO(str(BASE_MODEL))

    # 4. Train model with optimized hyperparameters for CPU
    print("\nStarting Training (epochs=3, imgsz=416, batch=16, device=cpu)...")
    results = model.train(
        data=str(DATASET_YAML),
        epochs=3,
        imgsz=416,
        batch=16,
        workers=2,
        device="cpu",
        project=str(RUNS_DIR),
        name="workout-reps-v6",
        exist_ok=True,
        plots=True,
        verbose=True
    )

    # 5. Locate best trained weights
    trained_best = RUNS_DIR / "workout-reps-v6/weights/best.pt"
    if not trained_best.exists():
        trained_best = RUNS_DIR / "workout-reps-v6/weights/last.pt"

    print("\n" + "=" * 70)
    print(f"✅ Training completed! Weights saved at: {trained_best}")

    # 6. Export to ml/models and ai-service/models
    target_ml = MODELS_DIR / "workout_reps_v6_best.pt"
    target_ai = AI_MODELS_DIR / "best.pt"
    target_ai_named = AI_MODELS_DIR / "workout_reps_v6.pt"

    shutil.copy2(trained_best, target_ml)
    shutil.copy2(trained_best, target_ai)
    shutil.copy2(trained_best, target_ai_named)
    print(f"Deployed weights to:")
    print(f"  - {target_ml}")
    print(f"  - {target_ai} (Active for ai-service)")
    print(f"  - {target_ai_named}")

    # 7. Save metadata class mapping
    class_meta = {
        "dataset": "Workout Reps Counter v6",
        "totalClasses": len(CLASS_NAMES),
        "classes": CLASS_NAMES,
        "exercises": [
            {"id": 0, "name": "Jumping Jacks", "phase": "End", "fullName": "JumpingJacks_End"},
            {"id": 1, "name": "Jumping Jacks", "phase": "Start", "fullName": "JumpingJacks_Start"},
            {"id": 2, "name": "Lunges", "phase": "End", "fullName": "Lunges_End"},
            {"id": 3, "name": "Lunges", "phase": "Start", "fullName": "Lunges_Start"},
            {"id": 4, "name": "Push-up", "phase": "End", "fullName": "Push-up_End"},
            {"id": 5, "name": "Push-up", "phase": "Start", "fullName": "Push-up_Start"},
            {"id": 6, "name": "Sit-ups", "phase": "End", "fullName": "Sit-ups_End"},
            {"id": 7, "name": "Sit-ups", "phase": "Start", "fullName": "Sit-ups_Start"},
            {"id": 8, "name": "Squats", "phase": "End", "fullName": "Squats_End"},
            {"id": 9, "name": "Squats", "phase": "Start", "fullName": "Squats_Start"},
        ],
        "kpt_shape": [12, 3]
    }

    meta_path = AI_MODELS_DIR / "workout_reps_classes.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(class_meta, f, ensure_ascii=False, indent=2)
    print(f"Saved class metadata to {meta_path}")

    # 8. Evaluate on test set
    print("\nEvaluating model on test split...")
    best_model = YOLO(str(trained_best))
    metrics = best_model.val(data=str(DATASET_YAML), split="test", imgsz=416)
    print("\nTest Evaluation Metrics:")
    if hasattr(metrics, "box") and metrics.box is not None:
        print(f"  mAP50-95(B): {metrics.box.map:.4f}")
        print(f"  mAP50(B):    {metrics.box.map50:.4f}")
    if hasattr(metrics, "pose") and metrics.pose is not None:
        print(f"  mAP50-95(P): {metrics.pose.map:.4f}")
        print(f"  mAP50(P):    {metrics.pose.map50:.4f}")

    print("\n🎉 ALL DONE! Model is ready and active.")

if __name__ == "__main__":
    main()
