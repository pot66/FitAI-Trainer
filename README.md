# 🏋️‍♂️ FitAI Trainer — AI-Powered Smart Fitness & Nutrition Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose_33_Landmarks-007ACC?logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Virtual_Coach-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

**FitAI Trainer** คือแพลตฟอร์มผู้ช่วยฝึกออกกำลังกายและโภชนาการอัจฉริยะแบบครบวงจร (**All-in-One AI Fitness & Nutrition Platform**) ที่ผสานเทคโนโลยี **Computer Vision (MediaPipe Pose 33 Landmarks & YOLO)**, **3D Interactive Virtual Coach (Three.js FBX Engine)**, **AI Nutrition & Thai Food Scanner (FastAPI Deep Learning)**, และ **Local AI Coach (Ollama LLM + 420-Item Sports Science Knowledge Base)** 

ระบบสามารถวิเคราะห์ท่าทางแบบเรียลไทม์ ตรวจจับข้อผิดพลาดของฟอร์ม นับจำนวนครั้งอัตโนมัติ สแกนแคลอรี่อาหารไทย และจัดตารางการฝึกเฉพาะบุคคลได้อย่างแม่นยำ ปลอดภัย และเป็นส่วนตัวสูง (**Privacy-First**) โดยสามารถทำงานแบบ Local ได้ 100% โดยไม่ต้องพึ่งพา Cloud API ภายนอก

---

## 🌟 ฟีเจอร์หลักของระบบ (Core Features)

### 1. 🤖 ผู้ช่วยโค้ช AI อัจฉริยะ (AI Fitness & Nutrition Coach)
- **สนทนาภาษาไทยอย่างเป็นธรรมชาติ**: โค้ช AI มีอิสระในการตอบคำถามอย่างสร้างสรรค์ ภายใต้ขอบเขตวิทยาศาสตร์การกีฬาและโภชนาการที่ถูกต้อง
- **ฐานความรู้วิทยาศาสตร์การกีฬา 420 หัวข้อ (`exercise_qa_dataset.json`)**: ครอบคลุม 14 หมวดหมู่สำคัญ เช่น กล้ามเนื้ออก หลัง แขน ไหล่ ขา ก้น แกนกลางลำตัว คาร์ดิโอ การฟื้นฟูกล้ามเนื้อ การป้องกันการบาดเจ็บ และโภชนาการ
- **แยกแยะเจตนาผู้ใช้อัจฉริยะ (Intent Separation Guard)**: แยกคำถามโภชนาการ (เช่น *"แนะนำเมนูลดน้ำหนัก"*, *"ข้าวมันไก่กี่แคล"*) ออกจากคำขอปรับตารางฝึก ไม่ให้เกิดการปรับตารางออกกำลังกายโดยไม่ตั้งใจ
- **ระบบความปลอดภัยทางการแพทย์ (Red-Flag Health Safety)**: ตรวจจับสัญญาณอันตราย เช่น เจ็บแน่นหน้าอก หายใจไม่ออก เวียนศีรษะเฉียบพลัน และเตือนให้หยุดพักพร้อมแนะนำพบแพทย์ทันที
- **ระบบอ่านออกเสียง 2 ภาษา (HD Bilingual TTS)**: ฟังเสียงโค้ชอ่านคำแนะนำผ่านปุ่ม `🔊 ฟังเสียง` / `⏹️ หยุดพูด` และปุ่ม `📋 คัดลอกข้อความ`

### 2. 🥗 สแกนอาหารและคำนวณแคลอรี่อัตโนมัติ (AI Food Scanner & Nutrition Tracker)
- **ตรวจจับอาหารไทยกว่า 40 เมนูยอดนิยม**: อัปโหลดรูปภาพหรือเปิดกล้องถ่ายภาพอาหาร ระบบจะประมวลผลด้วยโมเดล Deep Learning (MobileNetV3 / ONNX ผ่าน FastAPI)
- **การ์ดบันทึกอาหารแบบโต้ตอบ (Interactive Food Action Card)**: แสดงปริมาณแคลอรี่ (kcal) และสัดส่วนสารอาหารหลัก (โปรตีน, คาร์โบไฮเดรต, ไขมัน) พร้อมปุ่ม `+ บันทึกลงมื้ออาหาร` บันทึกเข้ามื้อเช้า/กลางวัน/เย็นได้ทันทีในคลิกเดียว
- **แสดงรูปอาหารในแชตพร้อมระบบ Lightbox**: แสดงรูปที่ผู้ใช้ส่งในกล่องข้อความ และสามารถคลิก `🔍 ดูรูปใหญ่` แบบ Fullscreen Preview ได้
- **แดชบอร์ดติดตามโภชนาการ (`FoodTracker.jsx`)**: คำนวณค่า BMR และ TDEE ตามหลัก Mifflin-St Jeor แสดงวงแหวนสารอาหารประจำวัน และบันทึกประวัติย้อนหลัง

### 3. 📅 ตารางการออกกำลังกายอัจฉริยะ (Personalized Workout Plan & Sanitizer)
- **ตารางฝึก 7 วันเฉพาะบุคคล**: คำนวณตามสัดส่วนร่างกาย (อายุ, น้ำหนัก, ส่วนสูง, BMI, เพศ) แบ่งวันฝึก Lower, Upper, Core, Cardio, Full Body, Mobility และ Rest
- **เชื่อมโยงบริบทคำสั่ง (Anaphoric Context Reference)**: เมื่อโค้ชสอนขั้นตอนฝึกหรือแนะนำท่า ผู้ใช้สามารถสั่ง *"นำมาใช้ในตาราง"*, *"เอาท่านี้ใส่ตาราง"* หรือ *"จัดตามนี้"* ได้ทันที
- **ตัวกรองประโยคคำอธิบาย (Instruction Sentence Filtering)**: ป้องกันไม่ให้ประโยคขั้นตอนสอน (เช่น *"1. ยืนตรง วางคัทลียาบัล..."*, *"2. ขับขาข้างที่..."*) หลุดเข้าไปเป็นชื่อท่าในตาราง โดยจะตรวจจับและแปลงเป็นชื่อท่าหลักที่ถูกต้อง เช่น `Kettlebell Swing (3 เซ็ต · 10–12 ครั้ง)`
- **แสดงผลตารางอย่างสะอาดตา**: ตารางฝึกทั้งในแชตและแถบด้านขวาจะแสดงเฉพาะ **ชื่อท่า** และ **จำนวนเซ็ต/ครั้ง** อย่างเป็นระเบียบ
- **ระบบทำความสะอาดข้อมูลอัตโนมัติ (Plan Sanitizer)**: ทำความสะอาดและตัดข้อมูลซ้ำซ้อนใน `localStorage` อัตโนมัติทุกครั้งที่โหลดหรือปรับปรุงแผน

### 4. 📹 วิเคราะห์ท่าทางและนับครั้งเรียลไทม์ (Real-Time Pose Tracking & Rep Counting)
- **ตรวจจับจุดข้อต่อ 33 จุดด้วย MediaPipe Pose**: ทำงานบนเบราว์เซอร์ผ่าน WebAssembly (WASM) ด้วยความเร็วสูง Latency ต่ำ ปลอดภัยต่อความเป็นส่วนตัว (ภาพไม่ถูกส่งไปเซิร์ฟเวอร์)
- **คำนวณมุมชีวกลศาสตร์ (Joint Biomechanics)**: ตรวจจับองศาข้อเข่า ข้อศอก สะโพก และกระดูกสันหลังแบบเรียลไทม์
- **State Machine Rep Counting**: ตรวจจับจังหวะ Eccentric / Concentric พร้อมระบบนับจำนวนครั้งและส่งเสียงแจ้งเตือนอัตโนมัติ

### 5. 🕺 โค้ช 3 มิติเสมือนจริง (3D Virtual Coach)
- **โมเดล 3D เคลื่อนไหวสมจริง (`Three.js` + FBX Animation)**: แสดงท่าทางสาธิตการออกกำลังกายในมิติ 3D ควบคู่ไปกับหน้าจอกล้อง
- **หมุนและซูมอิสระ 360 องศา**: ผู้ใช้สามารถใช้เมาส์หมุนมุมมองเพื่อดูตำแหน่งข้อต่อและแนวระนาบของร่างกายได้จากทุกทิศทาง

### 6. 🎥 คลังวิดีโอสาธิตจริงจาก YouTube (Verified Exercise Video Library)
- **รองรับท่าฝึกกว่า 99 ท่าในฐานข้อมูล**: ซิงค์กับฐานข้อมูล Prisma พร้อมวิดีโอสาธิตฟอร์มที่ถูกต้องสำหรับท่ามาตรฐาน (Squat, Push-up, Plank, Lunge, Kettlebell Swing, Crunch, Bird Dog, Dead Bug, Chair Squat ฯลฯ)
- **ระบบจับคู่นามแฝงภาษาไทย (Phonetic & Synonyms Matching)**: ค้นหาวิดีโอได้แม่นยำแม้พิมพ์ชื่อไทย เช่น *คัทลียาบัล, เคตเทิลเบลล์, วิดพื้น, สควอต, แพลงก์, ดึงข้อ*
- **YouTube Demonstration Cards**: แนบการ์ดคลิปวิดีโอ YouTube ในห้องแชทและหน้าฝึกซ้อม สามารถกดเล่นได้ทันที

### 7. 🎨 หน้าต่างจัดการเซสชันแชตแบบพรีเมียม (Custom Popup Modals)
- ออกแบบ Modal สไตล์ Dark Mode สวยงาม ทันสมัย แทนที่ `window.prompt` และ `window.confirm` เดิมของเบราว์เซอร์ สำหรับการเปลี่ยนชื่อบทสนทนาและยืนยันการลบแชต

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```mermaid
graph TB
    subgraph Client ["💻 Frontend (React 18 + Vite)"]
        UI["React UI (TailwindCSS)"]
        Cam["📷 MediaPipe Pose (33 Landmarks)"]
        Three["🕺 3D Coach (Three.js FBX)"]
        TTS["🔊 Bilingual Voice Engine (Web Speech API)"]
        UI --> Cam
        UI --> Three
        UI --> TTS
    end

    subgraph Backend ["⚙️ Backend API Server (Node.js + Express)"]
        Router["Express Router (/api)"]
        AuthMiddleware["JWT Authentication Middleware"]
        AIService["AI Orchestration Service"]
        VideoService["Exercise Video Matcher (99+ Videos)"]
        NutritionService["Nutrition & Meal Tracking Service"]
        CoachService["Coach Knowledge RAG (420 Q&As)"]
        PrismaClient["Prisma ORM Client"]

        Router --> AuthMiddleware
        AuthMiddleware --> AIService
        AuthMiddleware --> NutritionService
        AIService --> VideoService
        AIService --> CoachService
        AIService --> PrismaClient
        NutritionService --> PrismaClient
    end

    subgraph DataServices ["🗄️ Data & AI Engine"]
        MySQL[("MySQL 8.4 Database\n(Port 3307)")]
        Ollama["🧠 Local LLM\n(Ollama qwen2.5 / llama3.2)"]
        QAData[("📚 420-Item QA Dataset\n(exercise_qa_dataset.json)")]
        NutriData[("🥗 Thai Food Database\n(nutritionDatabase.json)")]
        AISvcFastAPI["👁️ AI Vision Microservice\n(FastAPI Port 8000)"]
    end

    UI -->|REST API / Bearer JWT| Router
    UI -->|Image Upload / Scan| Router
    Router -->|Proxy Predict| AISvcFastAPI
    PrismaClient -->|Connection Pool| MySQL
    AIService -->|Stream Prompts| Ollama
    AIService -.->|Offline Fallback| QAData
    NutritionService --> NutriData
    AISvcFastAPI -->|Classify (40+ Foods)| NutriData
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
FitAI Trainer/
├── backend/                              # Node.js + Express API Backend Server
│   ├── prisma/                           # โครงสร้างฐานข้อมูลและการย้ายสคีมา (Prisma)
│   │   ├── migrations/                   # ประวัติการทำ Database Migrations
│   │   ├── schema.prisma                 # นิยามโมเดลฐานข้อมูล (User, Profile, Exercise, FoodLog ฯลฯ)
│   │   └── seed.js                       # สคริปต์ตั้งต้นข้อมูลท่าฝึกและวิดีโอ (Seeding)
│   ├── src/
│   │   ├── ai/                           # Form Analyzer & Rules Engine
│   │   ├── config/                       # รวมศูนย์ Configuration (App, DB, AI, Env Validation)
│   │   │   ├── ai.config.js              # ค่าคอนฟิกโมเดล AI และ Timeout
│   │   │   ├── app.config.js             # พอร์ต เซิร์ฟเวอร์ และ CORS
│   │   │   ├── db.config.js              # พูลการเชื่อมต่อฐานข้อมูล
│   │   │   └── env.js                    # ตัวโหลดและตรวจสอบตัวแปรสภาพแวดล้อม
│   │   ├── controllers/                  # ตัวควบคุมคำขอ API (Auth, AI, Nutrition, Workout)
│   │   ├── data/                         # ฐานข้อมูลเฉพาะทาง
│   │   │   ├── exercise_qa_dataset.json  # ชุดข้อมูลวิทยาศาสตร์การกีฬา 420 หัวข้อ (14 หมวด)
│   │   │   └── nutritionDatabase.json    # ฐานข้อมูลคุณค่าทางโภชนาการอาหารไทย
│   │   ├── middlewares/                  # มิดเดิลแวร์ตรวจจับ JWT Token และ Error Handling
│   │   ├── routes/                       # ตัวกำหนดเส้นทาง API (/api/auth, /api/ai, /api/food ฯลฯ)
│   │   ├── services/                     # Business Logic Services
│   │   │   ├── aiService.js              # บริการหลัก AI แชทและวิเคราะห์แผนออกกำลังกาย
│   │   │   ├── coachKnowledgeService.js  # บริการจับคู่คำถามกับฐานความรู้ 420 ข้อ
│   │   │   ├── exerciseVideoService.js   # ค้นหาและแคชวิดีโอสาธิต YouTube (99+ ท่า)
│   │   │   ├── foodAiService.js          # เชื่อมต่อกับ FastAPI Food Classifier
│   │   │   ├── nutritionService.js       # บันทึกมื้ออาหารและวิเคราะห์แคลอรี่
│   │   │   ├── ollamaService.js          # เชื่อมต่อ Local LLM (Ollama)
│   │   │   └── prisma.js                 # Prisma Database Client พร้อมระบบ Reconnect
│   │   ├── app.js                        # กำหนดค่า Express App, CORS และ Routing
│   │   └── server.js                     # จุดเริ่มต้นการทำงานของเซิร์ฟเวอร์ Backend
│   ├── package.json
│   └── .env.example
├── frontend/                             # เว็บแอปพลิเคชัน React 18 + Vite
│   ├── public/                           # ไฟล์ภาพและ 3D Assets (TestMo.fbx)
│   └── src/
│       ├── ai/                           # ตรรกะฝั่ง Client
│       │   ├── recommendationEngine.js   # วางแผนออกกำลังกาย 7 วัน & สกัดข้อมูลท่า
│       │   ├── formAnalyzer.js           # วิเคราะห์ความถูกต้องของมุมข้อต่อ
│       │   └── repCounter.js             # ตัวนับจำนวนครั้งตามชีวกลศาสตร์
│       ├── components/                   # คอมโพเนนต์ UI แบบ Reusable
│       │   ├── ChatMessageContent.jsx    # ตัวเรนเดอร์ Markdown, การ์ด YouTube, การ์ดบันทึกอาหาร
│       │   ├── FoodCameraModal.jsx       # โมดอลถ่ายภาพ/สแกนอาหารด้วยกล้อง
│       │   ├── FoodLogItem.jsx           # การ์ดแสดงรายการอาหารที่บันทึก
│       │   └── YouTubeCard.jsx           # การ์ดเล่นคลิปวิดีโอ YouTube
│       ├── contexts/                     # State Management (AuthContext)
│       ├── utils/                        # ยูทิลิตี้เสริม
│       │   ├── nutritionCalculator.js    # คำนวณ BMR, TDEE และสัดส่วนสารอาหาร
│       │   ├── poseGeometry.js           # คำนวณมุมระหว่างจุดข้อต่อ (Vectors & Trigonometry)
│       │   └── speechUtils.js            # ระบบเสียงสังเคราะห์ภาษาไทย/อังกฤษ (Web Speech TTS)
│       ├── AIAssistant.jsx               # หน้าจอแชทโค้ช AI, ตารางฝึกประจำวัน, Lightbox
│       ├── FoodTracker.jsx               # หน้าจอติดตามอาหาร แคลอรี่ และสารอาหารหลัก
│       ├── Workout.jsx                   # โหมดออกกำลังกายผ่านกล้องเรียลไทม์ พร้อมตรวจจับท่า
│       ├── UnityWorkout3D.jsx            # โค้ชจำลอง 3 มิติ (Three.js Animated Coach)
│       ├── WorkoutPlan.jsx               # หน้าจัดการตารางออกกำลังกายประจำสัปดาห์
│       ├── WorkoutProgress.jsx           # แดชบอร์ดสรุปสถิติ ประวัติ และพัฒนาการ
│       ├── Dashboard.jsx                 # หน้าแรกแสดงภาพรวมของผู้ใช้
│       ├── ProfileEditor.jsx             # หน้าแก้ไขข้อมูลส่วนตัวและเป้าหมายสุขภาพ
│       ├── Settings.jsx                  # หน้าตั้งค่าระบบ
│       ├── App.jsx & main.jsx            # รูทคอมโพเนนต์และการกำหนดเส้นทาง (Routing)
│       └── index.css                     # สไตล์ชีตระบบ Dark Theme (TailwindCSS)
├── ai-service/                           # Microservice สำหรับงานประมวลผล AI หนัก (FastAPI)
│   ├── app/                              # โมเดล FastAPI และ Endpoint การพยากรณ์
│   ├── models/                           # ไฟล์โมเดล (thai_food_classes.json, weights)
│   ├── Dockerfile                        # คอนเทนเนอร์ FastAPI
│   └── requirements.txt                  # Python Dependencies (PyTorch, Ultralytics, Pillow)
├── ml/                                   # ชุดคำสั่งและสคริปต์การเทรนโมเดล YOLO Pose
│   ├── datasets/exercise-v4/             # ชุดข้อมูลภาพพร้อม Keypoints 13 จุด
│   └── scripts/                          # train_exercise_pose.py, evaluate_exercise_pose.py
├── docker-compose.yml                    # จัดการคอนเทนเนอร์ (MySQL 8.4, phpMyAdmin, ai-service)
├── fitai_trainer.sql                     # ไฟล์สำรองฐานข้อมูลฉบับเต็ม
└── README.md                             # เอกสารคู่มือโครงการฉบับสมบูรณ์
```

---

## 🚀 ข้อกำหนดเบื้องต้นและการติดตั้ง (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)
1. **Node.js**: เวอร์ชัน 18.x หรือ 20.x ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
2. **Docker & Docker Compose**: สำหรับรัน MySQL 8.4, phpMyAdmin และ AI Microservice ([ดาวน์โหลด Docker](https://www.docker.com/))
3. **(ทางเลือก) Ollama**: สำหรับใช้งานโมเดลภาษา Local LLM ([ดาวน์โหลด Ollama](https://ollama.ai/))

---

### ขั้นตอนที่ 1: กำหนดค่าตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ `.env.example` ไปเป็น `.env` ในโฟลเดอร์หลัก:

```bash
cp .env.example .env
```

ตรวจสอบค่าการเชื่อมต่อใน `.env`:

```env
# ==========================================
# ฐานข้อมูล (MySQL 8.4)
# ==========================================
DATABASE_URL="mysql://fitai:fitai_password@127.0.0.1:3307/fitai_trainer"
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=fitai_trainer
MYSQL_USER=fitai
MYSQL_PASSWORD=fitai_password

# ==========================================
# ความปลอดภัยและยืนยันตัวตน
# ==========================================
JWT_SECRET=fitai_super_secret_jwt_key_production_2026
JWT_EXPIRES_IN=7d
PORT=5000

# ==========================================
# การกำหนดค่า AI โค้ช (Local LLM)
# ==========================================
AI_PROVIDER=local
LOCAL_LLM_ENABLED=true
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b

# ==========================================
# AI Vision & Food Classifier Microservice
# ==========================================
AI_SERVICE_URL=http://127.0.0.1:8000
ENABLE_EXERCISE_YOLO=true
```

---

### ขั้นตอนที่ 2: เริ่มต้นบริการด้วย Docker Compose

สั่งรันฐานข้อมูล MySQL, phpMyAdmin และ AI Service:

```bash
docker compose up -d
```

ตรวจสอบความพร้อมของบริการ:
- **MySQL 8.4**: ทำงานที่พอร์ต `3307` (ภายนอก) ➔ `3306` (ภายใน)
- **phpMyAdmin**: เปิดใช้งานที่ `http://localhost:8081` (เข้าสู่ระบบด้วย User: `fitai`, Password: `fitai_password`)
- **AI Microservice**: ทำงานที่ `http://localhost:8000` (ตรวจสอบสถานะ: `http://localhost:8000/health`)

---

### ขั้นตอนที่ 3: ติดตั้งและเริ่มต้นเซิร์ฟเวอร์ Backend

เปิด Terminal ในโฟลเดอร์ `backend`:

```bash
cd backend
npm install

# รัน Migration เพื่อสร้างตารางในฐานข้อมูล
npx prisma migrate deploy

# นำเข้าข้อมูลเริ่มต้น (ท่าฝึก 99 ท่า, วิดีโอสอน, ข้อมูลโภชนาการ)
node prisma/seed.js

# เริ่มต้นเซิร์ฟเวอร์ในโหมดพัฒนา (Development Mode)
npm run dev
```

- **Backend API**: พร้อมให้บริการที่ `http://localhost:5000`
- **Health Check**: ทดสอบสถานะได้ที่ `curl http://localhost:5000/api/health`

---

### ขั้นตอนที่ 4: ติดตั้งและเริ่มต้นเว็บแอปพลิเคชัน Frontend

เปิด Terminal ใหม่ในโฟลเดอร์ `frontend`:

```bash
cd frontend
npm install

# เริ่มต้นแอปพลิเคชันด้วย Vite
npm run dev
```

- **Frontend Web App**: เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

### ขั้นตอนที่ 5: (ทางเลือก) ตั้งค่า Local LLM ด้วย Ollama

หากต้องการใช้งาน AI แชทบอทแบบออฟไลน์ด้วยโมเดลภาษาในเครื่อง:

```bash
# ดาวน์โหลดและรันโมเดลภาษาไทยยอดนิยม
ollama pull qwen2.5:3b
# หรือ
ollama pull llama3.2:3b
```

> [!NOTE]
> หากไม่ได้เปิดใช้งาน Ollama ระบบจะสลับไปใช้ **Knowledge-Based Deterministic Engine** จากชุดข้อมูลวิทยาศาสตร์การกีฬา 420 หัวข้อและฐานข้อมูลโภชนาการโดยอัตโนมัติ ทำให้ผู้ใช้ยังคงได้รับคำแนะนำที่ถูกต้องและแม่นยำ 100%

---

## 🤖 สรุปโมเดลปัญญาประดิษฐ์และชุดข้อมูลในระบบ (AI Models & Datasets)

| โมเดล / ชุดข้อมูล | เทคโนโลยี | รายละเอียดและหน้าที่ |
| :--- | :--- | :--- |
| **MediaPipe Pose** | WebAssembly / JS | ตรวจจับ 33 จุดพิกัดร่างกายแบบ 3D บนเบราว์เซอร์ คำนวณองศาข้อต่อและนับจำนวนครั้งแบบ Latency ต่ำ |
| **Thai Food Classifier** | PyTorch / ONNX / MobileNetV3 | ตรวจจับและจำแนกประเภทอาหารไทยยอดนิยมกว่า 40 เมนู ส่งผลลัพธ์เป็นแคลอรี่และสารอาหารหลัก |
| **Ultralytics YOLO Pose** | YOLO11n-pose (PyTorch) | โมเดลตรวจจับ 13 Keypoints ฝึกฝนบน 1,324 ภาพ (6 ท่าออกกำลังกาย) สำหรับงานประมวลผลบนเซิร์ฟเวอร์ |
| **Sports Science QA Dataset** | JSON Semantic Mapping | ชุดข้อมูลถาม-ตอบโค้ชออกกำลังกาย 420 รายการ ครอบคลุม 14 หมวดหมู่ชีวกลศาสตร์และการป้องกันการบาดเจ็บ |
| **Thai Nutrition Database** | JSON Knowledge Engine | ฐานข้อมูลแคลอรี่ โปรตีน คาร์โบไฮเดรต และไขมันของอาหารไทย เมนูสุขภาพ และสูตรอาหารลดน้ำหนัก |
| **Three.js Virtual Avatar** | FBX Skeletal Animation | อวาตาร์ 3 มิติเคลื่อนไหวตามคีย์เฟรมชีวกลศาสตร์ แสดงท่าทางสาธิตที่ถูกต้องหมุนได้ 360 องศา |

---

## 📡 สรุปรายการ API Endpoints (API Reference)

### 1. ระบบยืนยันตัวตนและบัญชีผู้ใช้ (`/api/auth`)
| Method | Endpoint | คำอธิบาย | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | สมัครสมาชิกใหม่พร้อมตรวจสอบความปลอดภัยรหัสผ่าน | Public |
| `POST` | `/api/auth/login` | เข้าสู่ระบบและรับ JWT Token | Public |
| `GET` | `/api/auth/me` | ดึงข้อมูลบัญชีผู้ใช้ปัจจุบัน | User |
| `GET` | `/api/auth/profile` | ดึงข้อมูลสัดส่วนร่างกายและเป้าหมายสุขภาพ | User |
| `PUT` | `/api/auth/profile` | ปรับปรุงข้อมูลส่วนตัว (น้ำหนัก, ส่วนสูง, เป้าหมาย) | User |

### 2. ระบบโค้ช AI และการจัดตารางฝึก (`/api/ai`)
| Method | Endpoint | คำอธิบาย | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | สนทนากับ AI โค้ช รองรับถาม-ตอบท่าฝึก โภชนาการ และการฟังเสียง | User |
| `POST` | `/api/ai/plan-adjustment` | วิเคราะห์และปรับเปลี่ยนตารางฝึกตามคำขอ เช่น "นำมาใช้ในตาราง" | User |
| `POST` | `/api/ai/weekly-plan` | สร้างตารางการออกกำลังกาย 7 วันเฉพาะบุคคลตามโปรไฟล์ | User |

### 3. ระบบสแกนอาหารและโภชนาการ (`/api/food` & `/api/nutrition`)
| Method | Endpoint | คำอธิบาย | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/food/predict` | อัปโหลดรูปภาพเพื่อจำแนกเมนูอาหารและคำนวณแคลอรี่ | User |
| `GET` | `/api/nutrition/today` | ดึงสรุปแคลอรี่และสารอาหารที่บริโภคในวันนี้เทียบกับเป้าหมาย TDEE | User |
| `POST` | `/api/nutrition/log` | บันทึกมื้ออาหาร (เช้า, กลางวัน, เย็น, ของว่าง) | User |
| `DELETE`| `/api/nutrition/log/:id` | ลบรายการอาหารที่บันทึกไว้ | User |

### 4. ท่าออกกำลังกายและวิดีโอสาธิต (`/api/exercises`)
| Method | Endpoint | คำอธิบาย | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exercises` | ดึงรายการท่าออกกำลังกายทั้งหมดในฐานข้อมูล (99 ท่า) | User |
| `GET` | `/api/exercises/videos` | ดึงรายการวิดีโอสาธิต YouTube ที่ผ่านการตรวจสอบฟอร์ม | User |

### 5. สถิติและประวัติการออกกำลังกาย (`/api/workout`)
| Method | Endpoint | คำอธิบาย | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/workout/session` | บันทึกประวัติการออกกำลังกาย จำนวนครั้ง และระยะเวลา | User |
| `GET` | `/api/workout/history` | ดึงประวัติการฝึกซ้อมย้อนหลังและสถิติรายสัปดาห์ | User |

---

## 📹 รายละเอียดชุดข้อมูลท่าฝึก (ML Dataset & Attribution)

ชุดข้อมูลภาพสำหรับการฝึกสอนโมเดลตรวจจับท่าทางด้วย YOLO Pose:
- **โฟลเดอร์จัดเก็บ**: `ml/datasets/exercise-v4`
- **จำนวนภาพทั้งหมด**: 1,324 ภาพ (ชุดฝึก: 929 ภาพ, ชุดตรวจสอบ: 264 ภาพ, ชุดทดสอบ: 131 ภาพ)
- **ท่าฝึกมาตรฐาน 6 ท่า**: `Bird Dog`, `Knee Push up`, `Plank`, `Push up`, `Reverse Lunge`, `Squat`
- **จุดพิกัดข้อต่อ**: 13 Pose Keypoints ตามมาตรฐาน Ultralytics Pose

### สัญญาอนุญาตและการอ้างอิงแหล่งที่มา (Dataset Attribution)
ชุดข้อมูลภาพอ้างอิงจากโครงการ [Roboflow Universe: exercise-7efha (v4)](https://universe.roboflow.com/jaew4/exercise-7efha/dataset/4) เผยแพร่ภายใต้สัญญาอนุญาต **Creative Commons Attribution 4.0 International (CC BY 4.0)** 

---

## 🛡️ ข้อควรปฏิบัติด้านความปลอดภัยสำหรับระบบจริง (Production Checklist)

1. **Credentials & Secrets**: เปลี่ยนรหัสผ่าน `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` และตั้งค่า `JWT_SECRET` ให้เป็นสตริงสุ่มที่มีความยาวอย่างน้อย 32 ตัวอักษร
2. **Reverse Proxy & TLS**: ติดตั้ง Nginx หรือ Cloudflare ด้านหน้าเว็บแอปเพื่อเปิดใช้งานการเข้ารหัส HTTPS สำหรับการใช้งานกล้องเว็บแคมบนเบราว์เซอร์อย่างปลอดภัย
3. **Database Health & Backups**: ทำการสำรองข้อมูล MySQL Volume อย่างสม่ำเสมอด้วยคำสั่ง:
   ```bash
   docker exec fitai-mysql mysqldump -u fitai -pfitai_password fitai_trainer > backup_$(date +%Y%m%d).sql
   ```
4. **Service Healthchecks**: ใช้ Endpoint `GET /api/health` สำหรับตั้งค่า Container Liveness Probe ใน Docker Swarm หรือ Kubernetes

---

## 📄 ใบอนุญาตการใช้งาน (License)

โครงการนี้พัฒนาขึ้นเพื่อการศึกษาและการวิจัยทางด้านสุขภาพและปัญญาประดิษฐ์ 
- **โค้ดโปรแกรมทั้งหมด**: เผยแพร่ภายใต้มาตรฐานกรรมสิทธิ์โครงการ FitAI Trainer
- **ชุดข้อมูลท่าทางออกกำลังกาย**: เผยแพร่ภายใต้สัญญาอนุญาต [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

---

© 2026 **FitAI Trainer** — Smart AI-Powered Fitness & Nutrition Platform. All Rights Reserved.
