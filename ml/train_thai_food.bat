@echo off
chcp 65001 >nul
echo ======================================================================
echo          FitAI Trainer — Thai Food Model Training (THFOOD-50)
echo ======================================================================
echo.
echo Dataset: ml/datasets/thai_food (50 iconic Thai dishes, 15,770 images)
echo GPU    : NVIDIA GeForce RTX 3050 Laptop GPU (CUDA enabled)
echo Target : ai-service/models/thai_food_cls.pt and thai_food_cls.onnx
echo.
echo Checkpoint found: ml/runs/thai-food-cls/weights/last.pt
echo.
echo Select action:
echo   [1] Resume training from last checkpoint (Recommended)
echo   [2] Start new training from scratch
echo.
set /p choice="Enter your choice (1 or 2, default is 1): "
if "%choice%"=="" set choice=1

if "%choice%"=="1" (
    echo.
    echo [Docker GPU] Resuming training from checkpoint with NVIDIA RTX 3050...
    docker run --gpus all --ipc=host -v "%~dp0..:/app" -w /app ultralytics/ultralytics:latest python ml/scripts/train_thai_food_classifier.py --resume
) else (
    echo.
    echo [Docker GPU] Starting new training from scratch...
    docker run --gpus all --ipc=host -v "%~dp0..:/app" -w /app ultralytics/ultralytics:latest python ml/scripts/train_thai_food_classifier.py --data ml/datasets/thai_food --epochs 15 --batch 32 --device 0
)

echo.
echo ======================================================================
echo Training process finished!
echo ======================================================================
pause
