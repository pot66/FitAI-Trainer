# 🏋️‍♂️ FitAI Trainer — AI-Powered Smart Fitness Platform

**FitAI Trainer** คือแพลตฟอร์มผู้ช่วยฝึกออกกำลังกายอัจฉริยะแบบครบวงจร (All-in-One AI Fitness Assistant) ที่ผสานพลังของ **Computer Vision (MediaPipe Pose & YOLO)**, **3D Interactive Coach (Three.js)**, และ **Local AI Coach (Ollama / Deterministic Fallback Engine)** เพื่อวิเคราะห์ท่าทางแบบเรียลไทม์ ตรวจจับความถูกต้อง นับจำนวนครั้ง (Rep Counting) และจัดตารางการออกกำลังกายเฉพาะบุคคลได้อย่างแม่นยำ ปลอดภัย และเป็นส่วนตัวโดยไม่ต้องพึ่งพา Cloud API ภายนอก

---

## 🌟 ฟีเจอร์หลัก (Key Features)

- 🤖 **AI Fitness Chat & Coach**: แชทบอทโค้ชออกกำลังกายภาษาไทย ให้คำแนะนำตามสัดส่วนร่างกาย (BMI, น้ำหนัก, ส่วนสูง, ประวัติการฝึก) ซิงโครไนซ์ตารางฝึกประจำวัน และแนบคลิปวิดีโอสอนท่าทางจริงจาก YouTube แบบ Interactive
- 📹 **Real-Time Pose Tracking**: วิเคราะห์ท่าทางผ่านกล้องเว็บแคมด้วย **MediaPipe Pose (33 Landmarks)** ตรวจจับมุมข้อต่อ (Joint Angles) ตรวจสอบความถูกต้องของฟอร์ม และนับจำนวนครั้ง (Reps) อัตโนมัติแบบ Latency ต่ำในเบราว์เซอร์
- 🕺 **3D Virtual Coach**: โค้ชจำลอง 3 มิติ (Three.js FBX Engine) เคลื่อนไหวสาธิตท่าทางแบบ 3D (Squat, Push-up ฯลฯ) พร้อมการหมุนและปรับมุมมองได้ 360 องศา
- 📅 **Personalized Workout Plan**: จัดตารางออกกำลังกาย 7 วันตามระดับความฟิต ปรับเปลี่ยนท่าตามความเหนื่อยล้าหรือข้อจำกัดทางกายภาพ (เช่น ปวดเข่า, มีเวลาจำกัด)
- 📊 **Fitness Analytics Dashboard**: บันทึกสถิติ ประวัติการออกกำลังกาย แคลอรี่ และพัฒนาการความแข็งแรง
- 🔒 **Local-First & Privacy**: ทำงานได้บนเครื่องส่วนตัว 100% ด้วย Local AI (Ollama + Curated Knowledge Base) ข้อมูลสุขภาพและภาพจากกล้องไม่ถูกส่งออกนอกเครื่อง

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```mermaid
graph TD
    Client["💻 Frontend (React + Vite)"]
    Cam["📷 MediaPipe Pose (33 Landmarks)"]
    Three["🕺 3D Coach (Three.js FBX)"]
    API["⚙️ Backend Server (Node.js Express)"]
    DB[("🗄️ Database (MySQL 8.4 + Prisma)")]
    AI["🧠 Local AI (Ollama qwen2.5 / DeepSeek)"]
    KB["📚 Curated Fitness Knowledge (JSON)"]
    YOLO["👁️ AI Vision Service (FastAPI + YOLO Pose)"]

    Client -->|In-Browser CV| Cam
    Client -->|3D Animation| Three
    Client -->|REST API / JWT| API
    API -->|ORM Queries| DB
    API -->|Thai AI Prompts| AI
    AI -.->|Fallback if offline| KB
    API -.->|Frame Detection| YOLO
```

1. **Frontend (`frontend/`)**: React 18 + Vite, Three.js สำหรับเรนเดอร์โมเดล 3D โค้ช, MediaPipe Pose สำหรับคำนวณไบโอเมคานิกส์ในเบราว์เซอร์
2. **Backend (`backend/`)**: Node.js + Express, Prisma ORM, MySQL 8.4, ระบบยืนยันตัวตน JWT และการจับคู่คำแนะนำวิดีโอ YouTube
3. **AI Core (`backend/src/services/`)**: 
   - รองรับ **Ollama** (Local LLM เช่น `qwen2.5:3b`)
   - รองรับ **Deterministic Fallback Engine** จากคลังความรู้ผู้เชี่ยวชาญ (`fitness_knowledge.json`) ตอบคำถามได้ทันทีแม้ไม่มีการ์ดจอหรือต่ออินเทอร์เน็ต
4. **AI Vision Service (`ai-service/` & `ml/`)**: 
   - FastAPI รองรับโมเดล Ultralytics YOLO11n-pose ที่เทรนเพิ่มเติมบนชุดข้อมูลเฉพาะ 6 ท่าฝึก

---

## 🚀 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- [Node.js](https://nodejs.org/) v18 ขึ้นไป
- [Docker](https://www.docker.com/) & Docker Compose
- (ไม่บังคับ) [Ollama](https://ollama.ai/) สำหรับรันโมเดลภาษา Local LLM

---

### ขั้นตอนที่ 1: การตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env` ตามสภาพแวดล้อมของคุณ:
```env
# Database (MySQL)
DATABASE_URL="mysql://fitai:fitai_password@127.0.0.1:3307/fitai_trainer"
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=fitai_trainer
MYSQL_USER=fitai
MYSQL_PASSWORD=fitai_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_fitai_2026

# Local AI Configuration
AI_PROVIDER=local
LOCAL_LLM_ENABLED=true
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

---

### ขั้นตอนที่ 2: รันระบบด้วย Docker (แนะนำสำหรับ Database)

เริ่มต้นฐานข้อมูล MySQL และ phpMyAdmin:
```bash
docker compose up -d mysql phpmyadmin
```
- **MySQL**: พอร์ต `3307` (ภายนอก) ➔ `3306` (ภายใน)
- **phpMyAdmin**: เปิดที่เบราว์เซอร์ `http://localhost:8081`

---

### ขั้นตอนที่ 3: รัน Backend

```bash
cd backend
npm install
npx prisma migrate deploy
node prisma/seed.js
npm run dev
```
- Backend จะทำงานที่: `http://localhost:5000`
- ตรวจสอบสถานะการทำงาน: `curl http://localhost:5000/api/health`

---

### ขั้นตอนที่ 4: รัน Frontend

```bash
cd frontend
npm install
npm run dev
```
- เปิดเบราว์เซอร์ที่: `http://localhost:5173`

---

## 💬 ระบบ Local AI & Exercise Guidance

FitAI Trainer ให้ความสำคัญกับความปลอดภัยและผลลัพธ์ที่เป็นรูปธรรม:

1. **Deterministic Intent & Entity Parsing**: ระบบวิเคราะห์คำขอปรับแผน เช่น *"ขอเน้นช่วงล่าง"*, *"เปลี่ยนท่า Squat เป็น Chair Squat"*, *"วันนี้เหนื่อยมากขอพัก"* เพื่อปรับโครงสร้างตารางออกกำลังกายในฐานข้อมูลโดยตรง
2. **Personalized Context**: ปรับคำแนะนำตามอายุ, ส่วนสูง, น้ำหนัก, ดัชนีมวลกาย (BMI) และข้อจำกัดของผู้ใช้
3. **Red-Flag Health Safety**: มีระบบตรวจจับสัญญาณอันตราย (เช่น เจ็บหน้าอก, หน้ามืด, หายใจไม่ออก) และเตือนให้หยุดพัก/พบแพทย์ทันที
4. **YouTube Demonstration Cards**: แชทบอทจะแนบการ์ดวิดีโอสาธิตจากผู้เชี่ยวชาญสำหรับการฝึกท่าทางที่ถูกต้อง

---

## 📹 โมเดล Machine Learning & ชุดข้อมูล (ML Training)

ระบบมีไปป์ไลน์สำหรับการฝึกโมเดลตรวจจับท่าทางด้วย Ultralytics YOLO Pose:

### 1. โครงสร้างชุดข้อมูล (Dataset)
ชุดข้อมูลภาพท่าทางออกกำลังกายจัดเก็บอยู่ที่ `ml/datasets/exercise-v4`:
- **จำนวนภาพ**: 1,324 ภาพ (Train: 929, Validation: 264, Test: 131)
- **6 ท่าออกกำลังกาย**: `Bird Dog`, `Knee Push up`, `Plank`, `Push up`, `Revese Lunge`, `Squat`
- **Pose Keypoints**: จุดข้อต่อ 13 จุดตามมาตรฐาน Ultralytics Pose

### 2. ข้อมูลลิขสิทธิ์ (Dataset License Attribution)
ชุดข้อมูลดังกล่าวอ้างอิงจากโครงการ [Roboflow Universe: exercise-7efha (v4)](https://universe.roboflow.com/jaew4/exercise-7efha/dataset/4) ภายใต้สัญญาอนุญาต **Creative Commons Attribution 4.0 International (CC BY 4.0)** โดยต้องคงการระบุแหล่งที่มาไว้เสมอ

### 3. คำสั่งการฝึกและทดสอบโมเดล (Training & Evaluation)
```bash
# ติดตั้ง dependencies สำหรับ ML
pip install -r ml/requirements.txt

# สั่งเทรนโมเดลด้วย GPU
python ml/scripts/train_exercise_pose.py --epochs 100 --imgsz 640 --batch 16 --device 0

# ตรวจสอบความถูกต้องกับชุดข้อมูลทดสอบ
python ml/scripts/evaluate_exercise_pose.py --model ml/runs/exercise-pose-v1/weights/best.pt --split test
```

---

## 📁 โครงสร้างโปรเจกต์ (Clean Project Structure)

```text
FitAI Trainer/
├── backend/                  # Node.js + Express API Server
│   ├── knowledge/            # ฐานความรู้ท่าฝึกและโภชนาการ (fitness_knowledge.json)
│   ├── prisma/               # Prisma Schema & Database Migrations
│   ├── scripts/              # DB Smoke Test & Management Scripts
│   └── src/
│       ├── config/           # App, DB, and AI Configuration & Pre-boot Validation
│       ├── controllers/      # Route Request Handlers
│       ├── middlewares/      # JWT Authentication Middleware
│       ├── routes/           # API Endpoints (/api/auth, /api/ai, /api/workout ฯลฯ)
│       ├── services/         # AI Service, Ollama, Video Matcher, Prisma Client
│       └── app.js & server.js
├── frontend/                 # React 18 + Vite Web Application
│   ├── public/               # Static Assets & 3D Models (TestMo.fbx)
│   └── src/
│       ├── ai/               # Form Analyzer, Rep Counter, Recommendation Engine
│       ├── components/       # ChatMessageContent, YouTubeCard
│       ├── contexts/         # AuthProvider & State Management
│       ├── routes/           # Protected/Public Routes & Navigation Paths
│       ├── services/         # Axios API Client
│       ├── utils/            # Pose Geometry & Angle Calculation Utilities
│       ├── AIAssistant.jsx   # AI Coach Chat & Daily Plan View
│       ├── Workout.jsx       # Camera Workout Mode with MediaPipe & 3D Coach
│       ├── UnityWorkout3D.jsx# Three.js 3D Virtual Coach Component
│       ├── WorkoutPlan.jsx   # Weekly Workout Schedule Management
│       └── ProfileEditor.jsx # User Fitness Profile Management
├── ai-service/               # FastAPI Microservice สำหรับ YOLO Inference (ทางเลือก)
├── ml/                       # สคริปต์เทรนและประเมินผลโมเดล Ultralytics YOLO Pose
│   ├── datasets/             # ชุดข้อมูลภาพพร้อม Keypoints Labels
│   └── scripts/              # train_exercise_pose.py, evaluate_exercise_pose.py
├── docker-compose.yml        # Docker Services (MySQL 8.4, phpMyAdmin)
├── fitai_trainer.sql         # ฐานข้อมูลสำรอง (Database Backup Dump)
└── README.md                 # เอกสารคู่มือโครงการฉบับสมบูรณ์ (Master Documentation)
```

---

## 🛡️ Production & Security Checklist

1. **Credentials**: เปลี่ยนรหัสผ่าน MySQL และตั้งค่า `JWT_SECRET` ที่รัดกุมก่อนขึ้นระบบจริง
2. **Reverse Proxy & HTTPS**: ติดตั้ง Nginx / Cloudflare เพื่อทำ TLS/HTTPS ด้านหน้าเว็บแอป
3. **Database Health**: เรียกใช้ `GET /api/health` สำหรับ Health Check ใน Docker / Kubernetes
4. **Database Backup**: สำรองข้อมูลโฟลเดอร์หรือโวลุ่ม `mysql_data` อย่างสม่ำเสมอ

---

© 2026 FitAI Trainer — All Rights Reserved.
