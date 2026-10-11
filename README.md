#  FitAI Trainer — ขั้นตอนการติดตั้งและการรันระบบ (Installation & Getting Started)

### ขั้นตอนที่ 1: ดาวน์โหลดโปรเจกต์และกำหนดค่า Environment Variables

 คัดลอกไฟล์ตัวแปรสภาพแวดล้อม `.env.example` ไปเป็น `.env`:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

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

หากต้องการใช้งานฟีเจอร์ AI Fitness & Nutrition Chatbot ด้วยโมเดลภาษาขนาดใหญ่ (LLM) ในเครื่อง:

 เปิด Terminal และดาวน์โหลดโมเดลที่ต้องการ:
   ```bash
   ollama pull qwen2.5:3b
   # หรือ
   ollama pull llama3.2:3b
   ```

 ตรวจสอบว่า Ollama กำลังทำงานอยู่ที่ `http://127.0.0.1:11434`

---

##  สรุปรายการพอร์ตและบริการ (Service Port Mapping)

| บริการ (Service) | URL / Port | รายละเอียดการทำงาน |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:5173` | หน้าเว็บแอปพลิเคชันหลัก (React 18 + Vite + TailwindCSS) |
| **Backend API** | `http://localhost:5000` | REST API Server (Node.js + Express + Prisma ORM) |
| **AI Vision Service** | `http://localhost:8000` | FastAPI Microservice ตรวจจับท่าทาง YOLO & จำแนกภาพอาหาร |
| **phpMyAdmin** | `http://localhost:8081` | เครื่องมือจัดการฐานข้อมูลผ่านเว็บ GUI |
| **MySQL Database** | `localhost:3307` | ฐานข้อมูลหลักของระบบ (MySQL 8.4) |
| **Ollama (Optional)** | `http://localhost:11434` | บริการ Local LLM API |

---

##  การรันทั้งระบบแบบ Full Container ด้วย Docker (All-in-One)

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
