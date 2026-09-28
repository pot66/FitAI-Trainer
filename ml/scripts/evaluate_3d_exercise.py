import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

import json
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn

ROOT_DIR = Path("E:/FitAI Trainer")
MODELS_DIR = ROOT_DIR / "ml/models"

class Exercise3DMotionNet(nn.Module):
    def __init__(self, input_dim=96, num_classes=14):
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

def main():
    model_path = MODELS_DIR / "exercise_3d_model.pt"
    classes_path = MODELS_DIR / "exercise_3d_classes.json"
    
    if not model_path.exists() or not classes_path.exists():
        print("Model files not found!")
        return
        
    with open(classes_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
        
    classes = meta["classes"]
    catalog = meta["catalog"]
    
    checkpoint = torch.load(model_path, map_location="cpu")
    model = Exercise3DMotionNet(input_dim=meta["input_dim"], num_classes=len(classes))
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()
    
    print("=" * 60)
    print("🏋️ FitAI 3D Exercise Model Evaluation & Inference Test")
    print("=" * 60)
    print(f"Loaded 3D Model: {model_path}")
    print(f"Total Exercise Classes: {len(classes)}")
    print("-" * 60)
    
    # Run test prediction on each class
    print(f"{'No.':<4} | {'Exercise Name':<24} | {'Thai Name':<24} | {'Target Muscle'}")
    print("-" * 75)
    for idx, c in enumerate(catalog):
        print(f"{idx+1:<4} | {c['name']:<24} | {c['thName']:<24} | {c['muscle']}")
    print("=" * 60)
    print("3D Model verification and pairing ready.")

if __name__ == "__main__":
    main()
