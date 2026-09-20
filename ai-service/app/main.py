from math import acos, degrees, isfinite
from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.yolo_detector import predict as yolo_predict, status as yolo_status
from app.food_detector import analyze_food_image

app = FastAPI(title="FitAI AI Service", version="1.1.0")


class Landmark(BaseModel):
    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0


class PoseRequest(BaseModel):
    exercise: str = "Squat"
    landmarks: List[Landmark] = Field(min_length=33)


class ExerciseDetectRequest(BaseModel):
    imageBase64: str = Field(min_length=20)
    confidence: Optional[float] = Field(default=None, ge=0.05, le=0.99)


class FoodDetectRequest(BaseModel):
    imageBase64: str = Field(min_length=20)
    confidence: Optional[float] = Field(default=None, ge=0.05, le=0.99)


class PlanRequest(BaseModel):
    bmi: Optional[float] = None
    age: Optional[int] = None
    goal: str = "general-fitness"
    fitness_level: str = "beginner"


def angle(a: Landmark, b: Landmark, c: Landmark) -> float:
    bax, bay, baz = a.x - b.x, a.y - b.y, a.z - b.z
    bcx, bcy, bcz = c.x - b.x, c.y - b.y, c.z - b.z
    m1 = (bax * bax + bay * bay + baz * baz) ** 0.5
    m2 = (bcx * bcx + bcy * bcy + bcz * bcz) ** 0.5
    if m1 == 0 or m2 == 0:
        return 0.0
    value = max(-1.0, min(1.0, (bax * bcx + bay * bcy + baz * bcz) / (m1 * m2)))
    return degrees(acos(value))


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "fitai-ai-service",
        "version": "1.1.0",
        "exerciseModel": yolo_status(),
        "foodService": "ready",
    }


@app.get("/exercise/model")
def exercise_model_status():
    return {"success": True, **yolo_status()}


@app.post("/exercise/detect")
def exercise_detect(req: ExerciseDetectRequest):
    return {"success": True, **yolo_predict(req.imageBase64, req.confidence)}


@app.post("/food/detect")
@app.post("/analyze-food")
def food_detect(req: FoodDetectRequest):
    result = analyze_food_image(req.imageBase64, req.confidence)
    return {"success": result.get("success", False), **result}


@app.post("/pose/analyze")
def analyze(req: PoseRequest):
    ex = req.exercise.lower().strip().replace("-", " ")
    lm = req.landmarks
    if not all(lm[i].visibility >= 0.45 for i in [11, 12, 23, 24, 25, 26, 27, 28]):
        return {
            "visible": False,
            "score": 0,
            "form": "waiting",
            "feedback": "กรุณาอยู่ห่างจากกล้องให้เห็นทั้งตัว",
        }
    if ex in {"squat", "chair squat"}:
        lk = angle(lm[23], lm[25], lm[27])
        rk = angle(lm[24], lm[26], lm[28])
        knee = (lk + rk) / 2
        score = 95
        feedback = "ท่าดี รักษาการควบคุมต่อไป"
        if knee > 170:
            score, feedback = 75, "เริ่มย่อตัวลงและรักษาแกนลำตัว"
        elif knee < 65:
            score, feedback = 60, "ไม่จำเป็นต้องย่อลึกเกินระดับที่ควบคุมได้"
        return {
            "visible": True,
            "score": score,
            "form": "correct" if score >= 85 else "adjust",
            "feedback": feedback,
            "angles": {
                "leftKnee": round(lk, 1),
                "rightKnee": round(rk, 1),
                "averageKnee": round(knee, 1),
            },
        }
    if ex in {"push up", "pushup"}:
        le = angle(lm[11], lm[13], lm[15])
        re = angle(lm[12], lm[14], lm[16])
        elbow = (le + re) / 2
        score = 95 if 50 <= elbow <= 175 else 70
        feedback = "รักษาลำตัวเป็นแนวเดียวและเคลื่อนไหวอย่างควบคุม"
        if elbow > 175:
            feedback = "เริ่มลดตัวลงอย่างควบคุม"
        if elbow < 50:
            feedback = "อย่าหดข้อศอกมากเกินไป"
        return {
            "visible": True,
            "score": score,
            "form": "correct" if score >= 85 else "adjust",
            "feedback": feedback,
            "angles": {"averageElbow": round(elbow, 1)},
        }
    return {
        "visible": True,
        "score": 70,
        "form": "analyzing",
        "feedback": "กำลังวิเคราะห์ท่านี้จากตำแหน่งข้อต่อ",
    }


@app.post("/recommend")
def recommend(req: PlanRequest):
    low_impact = bool(req.bmi and req.bmi >= 30)
    if req.goal == "muscle-gain":
        focus = ["Squat", "Push Up", "Glute Bridge", "Bodyweight Row"]
    elif req.goal == "strength":
        focus = ["Squat", "Push Up", "Lunges", "Plank"]
    elif req.goal == "mobility":
        focus = ["Cat Cow", "Arm Circles", "Bird Dog", "Walking"]
    else:
        focus = ["Squat", "Push Up", "Glute Bridge", "Walking"]
    if low_impact:
        focus = ["Chair Squat", "Wall Push Up", "Glute Bridge", "Walking"]
    return {
        "goal": req.goal,
        "level": req.fitness_level,
        "lowImpact": low_impact,
        "exercises": focus,
    }