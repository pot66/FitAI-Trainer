# 🏋️‍♂️ FitAI Trainer — ขั้นตอนการติดตั้งและการรันระบบ (Installation & Getting Started)

คู่มือฉบับสมบูรณ์สำหรับติดตั้ง กำหนดค่าตัวแปรสภาพแวดล้อม และรันระบบ **FitAI Trainer** ทั้งฝั่ง Frontend, Backend, AI Microservice และฐานข้อมูล

---

## 📋 ข้อกำหนดเบื้องต้น (Prerequisites)

ก่อนเริ่มต้นติดตั้งระบบ กรุณาตรวจสอบว่าเครื่องของคุณมีเครื่องมือดังต่อไปนี้ครบถ้วน:

1. **Node.js**: เวอร์ชัน 18.x หรือ 20.x ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
2. **Docker & Docker Compose**: สำหรับรัน MySQL 8.4, phpMyAdmin และ AI Vision Microservice ([ดาวน์โหลด Docker Desktop](https://www.docker.com/))
3. **Git**: สำหรับดาวน์โหลดและจัดการซอร์สโค้ด ([ดาวน์โหลด Git](https://git-scm.com/))
4. **(ทางเลือก) Ollama**: สำหรับใช้งาน Local LLM ออฟไลน์ในเครื่อง ([ดาวน์โหลด Ollama](https://ollama.ai/))

---

## 🚀 ขั้นตอนการติดตั้งและการรันระบบ (Step-by-Step Guide)

### ขั้นตอนที่ 1: ดาวน์โหลดโปรเจกต์และกำหนดค่า Environment Variables

1. Clone โปรเจกต์ลงมาในเครื่อง:
   ```bash
   git clone https://github.com/pot66/FitAI-Trainer.git
   cd FitAI-Trainer
   ```

2. คัดลอกไฟล์ตัวแปรสภาพแวดล้อม `.env.example` ไปเป็น `.env`:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. ตรวจสอบและกำหนดค่าในไฟล์ `.env` หลัก:
   ```env
   # ==========================================
   # ฐานข้อมูล (MySQL 8.4 via Docker)
   # ==========================================
   DATABASE_URL="mysql://fitai:fitai_password@127.0.0.1:3307/fitai_trainer"
   MYSQL_ROOT_PASSWORD=root_password
   MYSQL_DATABASE=fitai_trainer
   MYSQL_USER=fitai
   MYSQL_PASSWORD=fitai_password

   # ==========================================
   # ความปลอดภัยและการเชื่อมต่อ Backend API
   # ==========================================
   PORT=5000
   JWT_SECRET=fitai_super_secret_jwt_key_production_2026
   JWT_EXPIRES_IN=7d

   # ==========================================
   # การกำหนดค่า AI โค้ช (Local LLM via Ollama)
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

### ขั้นตอนที่ 2: เริ่มต้นบริการด้วย Docker Compose (MySQL, phpMyAdmin, AI Service)

สั่งรันฐานข้อมูลและบริการเสริมทั้งหมดผ่าน Docker:

```bash
docker compose up -d
```

> **ตรวจสอบสถานะบริการที่เปิดใช้งาน:**
> - **MySQL 8.4**: พร้อมใช้งานที่พอร์ต `3307` (ภายนอก) ➔ `3306` (ภายใน Container)
> - **phpMyAdmin**: เปิดดูหน้าจัดการฐานข้อมูลได้ที่ `http://localhost:8081`  
>   *(Username: `fitai` | Password: `fitai_password`)*
> - **AI Vision Microservice**: พร้อมให้บริการที่ `http://localhost:8000`  
>   *(ตรวจสอบสถานะ: `http://localhost:8000/health`)*

---

### ขั้นตอนที่ 3: ติดตั้งและเริ่มต้นเซิร์ฟเวอร์ Backend

เปิด Terminal แล้วเข้าไปที่โฟลเดอร์ `backend`:

```bash
cd backend

# 1. ติดตั้ง Dependencies
npm install

# 2. รัน Database Migration เพื่อสร้างตารางในฐานข้อมูล
npx prisma migrate deploy

# 3. นำเข้าข้อมูลเริ่มต้น (ท่าฝึก 99 ท่า, วิดีโอสาธิต, ข้อมูลโภชนาการ)
node prisma/seed.js

# 4. เริ่มต้นเซิร์ฟเวอร์ในโหมดพัฒนา (Development Mode)
npm run dev
```

- **Backend API Server**: พร้อมให้บริการที่ `http://localhost:5000`
- **Health Check**: ทดสอบสถานะได้ที่ `http://localhost:5000/api/health`

---

### ขั้นตอนที่ 4: ติดตั้งและเริ่มต้นเว็บแอปพลิเคชัน Frontend

เปิด Terminal ใหม่อีกหน้าต่าง แล้วเข้าไปที่โฟลเดอร์ `frontend`:

```bash
cd frontend

# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรัน Frontend Server ด้วย Vite
npm run dev
```

- **Frontend Web App**: เปิดเบราว์เซอร์และเข้าใช้งานได้ทันทีที่ **`http://localhost:5173`**

---

### ขั้นตอนที่ 5: (ทางเลือก) ตั้งค่า Local LLM ด้วย Ollama

หากต้องการใช้งานฟีเจอร์ AI Fitness & Nutrition Chatbot ด้วยโมเดลภาษาขนาดใหญ่ (LLM) ในเครื่อง:

1. เปิด Terminal และดาวน์โหลดโมเดลที่ต้องการ:
   ```bash
   ollama pull qwen2.5:3b
   # หรือ
   ollama pull llama3.2:3b
   ```

2. ตรวจสอบว่า Ollama กำลังทำงานอยู่ที่ `http://127.0.0.1:11434`

> 💡 **หมายเหตุ:** หากไม่ได้เปิดใช้งาน Ollama ระบบจะสลับไปใช้ **Knowledge-Based Deterministic Engine** จากชุดข้อมูลวิทยาศาสตร์การกีฬาและโภชนาการในตัวโดยอัตโนมัติ ทำให้ผู้ใช้ยังคงได้รับคำแนะนำที่ถูกต้องและแม่นยำได้ตามปกติ

---

## 🌐 สรุปรายการพอร์ตและบริการ (Service Port Mapping)

| บริการ (Service) | URL / Port | รายละเอียดการทำงาน |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:5173` | หน้าเว็บแอปพลิเคชันหลัก (React 18 + Vite + TailwindCSS) |
| **Backend API** | `http://localhost:5000` | REST API Server (Node.js + Express + Prisma ORM) |
| **AI Vision Service** | `http://localhost:8000` | FastAPI Microservice ตรวจจับท่าทาง YOLO & จำแนกภาพอาหาร |
| **phpMyAdmin** | `http://localhost:8081` | เครื่องมือจัดการฐานข้อมูลผ่านเว็บ GUI |
| **MySQL Database** | `localhost:3307` | ฐานข้อมูลหลักของระบบ (MySQL 8.4) |
| **Ollama (Optional)** | `http://localhost:11434` | บริการ Local LLM API |

---

## 🐳 การรันทั้งระบบแบบ Full Container ด้วย Docker (All-in-One)

หากต้องการรันทุกบริการทั้ง Frontend, Backend, AI Service และ Database ร่วมกันใน Docker Container ชุดเดียว:

```bash
docker compose up -d --build
```

หากต้องการหยุดการทำงานของระบบทั้งหมด:
```bash
docker compose down
```

---

© 2026 **FitAI Trainer** — Smart AI-Powered Fitness & Nutrition Platform. All Rights Reserved.
