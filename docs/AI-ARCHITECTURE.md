# FitAI Trainer AI Architecture

## Hybrid architecture
1. Browser MediaPipe Pose provides 33 landmarks locally for low latency and privacy.
2. The local exercise engine counts repetitions and scores supported exercises immediately.
3. Node.js combines the user's MySQL Profile, Workout History, Exercise catalog and Chat History.
4. When `OPENAI_API_KEY` is configured, GPT-5 mini handles normal coaching/chat and GPT-5 handles weekly-plan generation through the Responses API.
5. If OpenAI is unavailable, the deterministic local coaching engine remains available.
6. `ai-service/` is an optional FastAPI layer for future trained models and can be deployed independently.

## Recommended evolution
Collect anonymized pose windows + labels (correct/incorrect and issue type), train a small classifier, validate against a held-out set, and keep safety rules as a hard guardrail around any learned model.


## Exercise dataset integration (v4)

The supplied Roboflow dataset is now part of the project under `ml/datasets/exercise-v4`.

Dataset facts:
- 1,324 images total: 929 train / 264 validation / 131 test
- 6 exercise classes: Bird Dog, Knee Push up, Plank, Push up, Revese Lunge, Squat
- 13 pose keypoints per annotated instance, with visibility values

The ML pipeline is:
1. Fine-tune a pretrained Ultralytics pose model on the exercise dataset.
2. Validate on the held-out validation/test splits.
3. Export the trained checkpoint to `ai-service/models/best.pt` (or ONNX for later optimization).
4. FastAPI exposes `/exercise/detect` for image-frame inference.
5. Node.js exposes authenticated `/api/ai/exercise-detect` so the frontend does not have to know the AI service address.
6. MediaPipe's 33 landmarks remain active in the browser for low-latency biomechanical scoring and rep counting.
7. The YOLO model provides learned exercise-class recognition and 13-point pose localization; deterministic biomechanical checks remain the hard safety/quality layer.

The training format follows Ultralytics pose dataset conventions: each image has a matching label file containing class, normalized bounding box, keypoint coordinates and optional visibility. citeturn400226search1turn400226search3
