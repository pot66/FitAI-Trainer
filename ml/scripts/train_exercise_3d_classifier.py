import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

import json
import random
import shutil
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
np.random.seed(42)
random.seed(42)

ROOT_DIR = Path("E:/FitAI Trainer")
MODELS_DIR = ROOT_DIR / "ml/models"
RUNS_DIR = ROOT_DIR / "ml/runs/exercise-3d"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
RUNS_DIR.mkdir(parents=True, exist_ok=True)

ANIMATIONS_PATH = ROOT_DIR / "frontend/public/models/malong_animations.json"
CATALOG_PATH = ROOT_DIR / "frontend/public/models/malong_catalog.json"

print("--- Loading 3D Animation Dataset from malong ---")
with open(ANIMATIONS_PATH, "r", encoding="utf-8") as f:
    animations = json.load(f)

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    catalog = json.load(f)

classes = [item["name"] for item in catalog]
class_to_idx = {name: idx for idx, name in enumerate(classes)}
idx_to_class = {idx: name for idx, name in enumerate(classes)}
num_classes = len(classes)

print(f"Total 3D exercise classes: {num_classes}")
for idx, name in enumerate(classes):
    print(f"  [{idx:2d}] {name} ({catalog[idx]['thName']}) - {catalog[idx]['muscle']}")

FEATURE_DIM = 96

def extract_features_from_clip(clip_data):
    tracks = clip_data.get("tracks", [])
    duration = clip_data.get("duration", 3.0)
    
    key_bones = [
        "mixamorig:Hips", "mixamorig:Spine", "mixamorig:Spine2", "mixamorig:Head",
        "mixamorig:LeftArm", "mixamorig:RightArm", "mixamorig:LeftForeArm", "mixamorig:RightForeArm",
        "mixamorig:LeftUpLeg", "mixamorig:RightUpLeg", "mixamorig:LeftLeg", "mixamorig:RightLeg"
    ]
    
    # 8 time points across the exercise cycle: 0%, 14%, 28%, 42%, 57%, 71%, 85%, 100%
    sample_times = np.linspace(0, duration, 8)
    feature_vector = []
    
    for t_sample in sample_times:
        for bone in key_bones:
            track_name = f"{bone}.quaternion"
            matching = [tr for tr in tracks if tr["name"] == track_name]
            if matching and matching[0]["times"] and matching[0]["values"]:
                times = np.array(matching[0]["times"])
                vals = matching[0]["values"]
                closest_idx = int(np.argmin(np.abs(times - t_sample)))
                q = vals[closest_idx * 4 : (closest_idx + 1) * 4]
                if len(q) == 4:
                    feature_vector.append(q[0]) # x
                    # feature_vector.append(q[1]) # y
            else:
                feature_vector.append(0.0)
                
    feats = np.array(feature_vector[:FEATURE_DIM], dtype=np.float32)
    if len(feats) < FEATURE_DIM:
        feats = np.pad(feats, (0, FEATURE_DIM - len(feats)), 'constant')
    return feats

X_list = []
y_list = []

SAMPLES_PER_CLASS = 200

for class_name, clip_data in animations.items():
    if class_name not in class_to_idx:
        continue
    label = class_to_idx[class_name]
    base_feat = extract_features_from_clip(clip_data)
    
    for _ in range(SAMPLES_PER_CLASS):
        # Biomechanical variation: slight tempo shifting and posture noise
        noise = np.random.normal(0, 0.02, size=base_feat.shape)
        scale = np.random.uniform(0.95, 1.05)
        augmented = (base_feat + noise) * scale
        norm = np.linalg.norm(augmented)
        if norm > 1e-6:
            augmented = augmented / norm
        X_list.append(augmented)
        y_list.append(label)

X = np.array(X_list, dtype=np.float32)
y = np.array(y_list, dtype=np.int64)

indices = np.arange(len(X))
np.random.shuffle(indices)
split = int(0.8 * len(X))

train_idx, val_idx = indices[:split], indices[split:]
X_train, y_train = torch.tensor(X[train_idx]), torch.tensor(y[train_idx])
X_val, y_val = torch.tensor(X[val_idx]), torch.tensor(y[val_idx])

train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
val_loader = DataLoader(TensorDataset(X_val, y_val), batch_size=32, shuffle=False)

print(f"Dataset prepared: {len(X_train)} training samples, {len(X_val)} validation samples.")

class Exercise3DMotionNet(nn.Module):
    def __init__(self, input_dim=FEATURE_DIM, num_classes=num_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.2),
            
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.15),
            
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x):
        return self.net(x)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on device: {device}")

model = Exercise3DMotionNet(FEATURE_DIM, num_classes).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=0.005, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=30)

EPOCHS = 30
best_acc = 0.0

print("\n--- Starting 3D Exercise Model Training ---")
for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss, correct, total = 0.0, 0, 0
    
    for batch_X, batch_y in train_loader:
        batch_X, batch_y = batch_X.to(device), batch_y.to(device)
        optimizer.zero_grad()
        out = model(batch_X)
        loss = criterion(out, batch_y)
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item() * len(batch_y)
        preds = out.argmax(dim=1)
        correct += (preds == batch_y).sum().item()
        total += len(batch_y)
        
    scheduler.step()
    train_loss = total_loss / total
    train_acc = correct / total
    
    model.eval()
    val_loss, val_correct, val_total = 0.0, 0, 0
    with torch.no_grad():
        for batch_X, batch_y in val_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            out = model(batch_X)
            loss = criterion(out, batch_y)
            val_loss += loss.item() * len(batch_y)
            preds = out.argmax(dim=1)
            val_correct += (preds == batch_y).sum().item()
            val_total += len(batch_y)
            
    val_acc = val_correct / val_total
    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), MODELS_DIR / "exercise_3d_model_best.pt")
        
    if epoch % 5 == 0 or epoch == EPOCHS:
        print(f"Epoch {epoch:2d}/{EPOCHS} | Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}% | Val Acc: {val_acc*100:.2f}%")

print(f"\nTraining completed! Best Validation Accuracy: {best_acc*100:.2f}%")

# Save final model & metadata
torch.save({
    "state_dict": model.state_dict(),
    "classes": classes,
    "input_dim": FEATURE_DIM,
    "num_classes": num_classes,
    "best_acc": best_acc
}, MODELS_DIR / "exercise_3d_model.pt")

with open(MODELS_DIR / "exercise_3d_classes.json", "w", encoding="utf-8") as f:
    json.dump({
        "classes": classes,
        "catalog": catalog,
        "input_dim": FEATURE_DIM,
        "accuracy": best_acc
    }, f, indent=2, ensure_ascii=False)

# Export ONNX model if onnx is available
try:
    import onnx
    model.eval()
    dummy_input = torch.randn(1, FEATURE_DIM).to(device)
    onnx_path = MODELS_DIR / "exercise_3d_model.onnx"
    torch.onnx.export(
        model, dummy_input, onnx_path,
        input_names=["joint_trajectories"],
        output_names=["exercise_probabilities"],
        dynamic_axes={"joint_trajectories": {0: "batch_size"}, "exercise_probabilities": {0: "batch_size"}},
        opset_version=13
    )
    print(f"ONNX Model exported: {onnx_path} ({os.path.getsize(onnx_path)/1024:.1f} KB)")
except Exception as e:
    print(f"ONNX Export skipped: {e}")

print(f"PyTorch Weights saved: {MODELS_DIR / 'exercise_3d_model.pt'}")

dest_script = ROOT_DIR / "ml/scripts/train_exercise_3d_classifier.py"
shutil.copy(__file__, dest_script)
print(f"Copied training script to {dest_script}")
print("3D Model Training pipeline finished successfully.")
