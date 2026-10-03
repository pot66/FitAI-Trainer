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
- **เมนูทางลัดผู้ใช้ (User Navigation Dropdown ใน `AIAssistant.jsx`)**: มีปุ่มเข้าถึง **ประวัติการออกกำลังกาย (Workout History / Progress)** จัดวางไว้ตรงกลางระหว่างโปรไฟล์ของฉันและการตั้งค่า เพื่อความสะดวกในการตรวจสอบสถิติและประวัติการฝึกย้อนหลัง

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

### 5. 🕺 โค้ช 3 มิติเสมือนจริงและการจับคู่ท่าฝึก (Malong 3D Virtual Coach & Motion Matcher)
- **สถาปัตยกรรมชุดอนิเมชัน 3D จากโครงการ Malong**: สกัดและแปลงคีย์เฟรมการเคลื่อนไหวของกระดูก Mixamo Rig จากไฟล์ Unity `.anim` ครบทั้ง 14 ท่าฝึกหลัก สู่ Three.js KeyframeTracks (`malong_animations.json` และ `malong_catalog.json`)
- **การปรับเทียบมุมควอเทอร์เนียนไร้การบิดเบี้ยว (Zero-Distortion Quaternion Handedness Calibration)**: แปลงพิกัดการหมุนจากระนาบมือซ้ายของ Unity (Left-Handed) สู่ระนาบมือขวาของ Three.js (Right-Handed) ด้วยสูตรทางคณิตศาสตร์ชีวกลศาสตร์ `(qx, -qy, -qz, qw)` แก้ไขปัญหาขาบิดเข้าหากัน ข้อต่อผิดรูป หรือกระดูกไขว้กัน ให้โมเดลเคลื่อนไหวได้อย่างถูกต้อง สง่างาม และเป็นธรรมชาติครบทุกท่าฝึก
- **การจับคู่แสดงผลโมเดล 3D ตรงตามท่าฝึกอัตโนมัติ (Automatic 3D Exercise Matching Engine)**:
  - เชื่อมโยงและจับคู่ชื่อท่าทั้งภาษาไทยและอังกฤษแบบ Real-time:
    1. **Squat (สควอต)**: เน้นขา สะโพก และแกนกลาง
    2. **Push-Up (วิดพื้น / ดันพื้น)**: เน้นกล้ามเนื้อหน้าอกและหัวไหล่
    3. **Lunge (ลันจ์ / ท่าแทงเข่า)**: เน้นต้นขา สะโพก และการทรงตัว
    4. **Plank (แพลงก์ / ท่าไม้กระดาน)**: เน้นแกนกลางลำตัว (Core) และหน้าท้อง
    5. **Sit-up (ซิทอัพ)**: เน้นกล้ามเนื้อหน้าท้องส่วนบน
    6. **Glute Bridge (กลูทบริดจ์ / ยกสะโพก)**: เน้นกล้ามเนื้อก้นและหลังส่วนล่าง
    7. **Donkey Kick (ดองกี้คิก)**: เน้นก้นและต้นขาด้านหลัง
    8. **Bicycle Crunch (ไบซิเคิลครันช์)**: เน้นหน้าท้องด้านข้างและแกนกลาง
    9. **Superman (ซูเปอร์แมน)**: เน้นกล้ามเนื้อหลังส่วนล่างและสะโพก
    10. **Leg Raise (เลกเรส / ยกขา)**: เน้นหน้าท้องส่วนล่าง
    11. **Bulgarian Split Squat (บัลแกเรียนสปลิทสควอต)**: เน้นต้นขาและก้น
    12. **Russian Twist (รัสเซียนทวิสต์)**: เน้นการบิดเอวและกล้ามเนื้อ Obliques
    13. **Fire Hydrant (ไฟร์ไฮดรานต์)**: เน้นสะโพกด้านข้างและก้น
    14. **Close-grip Push-up (โคลสกริดพุชอัพ)**: เน้นหลังแขน (Triceps) และอกชิด
- **การสลับอนิเมชันแบบไร้รอยต่อ (Crossfade Blending)**: เมื่อผู้ใช้สลับท่าฝึก ตัวละคร 3D จะเปลี่ยนท่าทางอย่างนุ่มนวลด้วยระบบ `action.crossFadeTo`
- **เมนูเลือกและพรีวิวท่า 3D ได้อิสระ (Interactive 3D Selector Dropdown)**: สามารถเลือกชมท่าทางสาธิตในมิติ 3 มิติได้ทันทีจากแถบควบคุมด้านบน
- **ป้ายบอกกลุ่มกล้ามเนื้อเป้าหมาย (Target Muscle Badge)**: แสดงส่วนของร่างกายที่ได้ประโยชน์จากท่านั้น ๆ (ขา, อก, หลัง, แขน, ท้อง, สะโพก)
- **ระบบกล้องจัดมุมมองเห็นโมเดลทั้งตัวอัตโนมัติ (Adaptive Full-Body Camera Framing)**: ปรับตำแหน่งและมุมกล้องตามประเภทสรีระของแต่ละท่าฝึก (ท่ายืน, ท่าระนาบพื้น Prone เช่น Push-up/Plank, ท่าหงาย Supine เช่น Sit-up/Glute Bridge และท่าสี่ขา Quadruped) ทำให้เห็นตัวละคร 3D เต็มตัว ชัดเจน ไม่จมพื้น
- **ระบบควบคุมมุมมองและจังหวะฝึก**: หมุนอิสระ 360°, ปุ่มซูมเข้า (`🔍+`), ซูมออก (`🔍-`), ปุ่มจัดมุมมองเต็มตัว (`🔄 เต็มตัว`), ปรับความเร็วอนิเมชัน (0.5x, 1x, 1.5x), ปุ่มพัก/เล่นต่อ และโหมดขยายเต็มหน้าจอ

### 6. 🎥 คลังวิดีโอสาธิตจริงจาก YouTube (Verified Exercise Video Library)
- **รองรับท่าฝึกกว่า 99 ท่าในฐานข้อมูล**: ซิงค์กับฐานข้อมูล Prisma พร้อมวิดีโอสาธิตฟอร์มที่ถูกต้องสำหรับท่ามาตรฐาน (Squat, Push-up, Plank, Lunge, Kettlebell Swing, Crunch, Bird Dog, Dead Bug, Chair Squat ฯลฯ)
- **ระบบจับคู่นามแฝงภาษาไทย (Phonetic & Synonyms Matching)**: ค้นหาวิดีโอได้แม่นยำแม้พิมพ์ชื่อไทย เช่น *คัทลียาบัล, เคตเทิลเบลล์, วิดพื้น, สควอต, แพลงก์, ดึงข้อ*
- **YouTube Demonstration Cards**: แนบการ์ดคลิปวิดีโอ YouTube ในห้องแชทและหน้าฝึกซ้อม สามารถกดเล่นได้ทันที

### 7. 🎨 หน้าต่างจัดการเซสชันแชตแบบพรีเมียม (Custom Popup Modals)
- ออกแบบ Modal สไตล์ Dark Mode สวยงาม ทันสมัย แทนที่ `window.prompt` และ `window.confirm` เดิมของเบราว์เซอร์ สำหรับการเปลี่ยนชื่อบทสนทนาและยืนยันการลบแชต

### 8. 🎙️ ระบบเสียงโค้ช AI สไตล์ Anime Mentor ชายผู้ใหญ่ต้นฉบับ (Original Adult Male Anime Voice Coach Engine)
- **บุคลิกเสียงระดับมาสเตอร์ (Calm Sensei Persona)**: เสียงผู้ชายวัยผู้ใหญ่ ทุ้ม นุ่ม ลึก และอบอุ่น สุขุม เยือกเย็น มั่นใจ มีน้ำหนักเสียงแบบผู้ฝึกสอนหรืออาจารย์ผู้มีประสบการณ์สูง
- **จังหวะการพูดที่สมดุลและเป็นธรรมชาติ**: จังหวะปานกลางค่อนไปทางช้า (Speech Rate: 0.92, Pitch: 0.84) ไม่พูดเร็วเกินไป ไม่ใช้เสียงแหลมสูง และไม่ตะโกน
- **คลังบทพูดการฝึกซ้อมระดับ Anime Mentor (Authentic Workout Cues)**:
  - **ตอนเริ่ม Workout**: *"เอาล่ะ เริ่มกันเลยครับ"* (มีพลังเพิ่มขึ้นเล็กน้อย มั่นใจ)
  - **เมื่อทำท่าผิด (เตือนอย่างสุภาพแต่จริงจัง)**: *"รักษาหลังให้ตรงครับ"*, *"ค่อย ๆ ย่อตัวลงครับ"*, *"ค่อย ๆ หายใจ อย่ารีบครับ"* พร้อมระบบ Cooldown ป้องกันเสียงพูดซ้ำซ้อน
  - **เมื่อทำท่าถูกต้อง (ชมด้วยน้ำเสียงมั่นใจและอบอุ่น)**: *"ดีครับ รักษาฟอร์มแบบนั้นไว้"*, *"ดีมากครับ ทำต่อไป"*
  - **ตอนนับจำนวนครั้ง (ชัดเจนและมีจังหวะ)**: *"เหลืออีกห้าครั้งครับ"*, *"อีกสองครั้งครับ คุมฟอร์มไว้"*, *"ครั้งสุดท้ายแล้วครับ ตั้งสมาธิไว้"*
  - **ตอนพักและจบ Workout (ผ่อนคลายและให้กำลังใจอย่างจริงใจ)**: *"พักได้ครับ คุณทำได้ดีมาก"*, *"พร้อมแล้วนะครับ เซ็ตต่อไปเริ่มได้เลย"*
- **ระบบคัดเลือกเสียงผู้ชายคุณภาพสูง (Adult Male Voice Discovery Engine)**:
  - ตรวจจับและจัดลำดับความสำคัญของเสียงผู้ชายธรรมชาติ (เช่น Microsoft Niwat Online Natural Studio Voice บน Windows/Edge)
  - ปรับความถี่เสียงทุ้มต่ำ (Pitch Shifting & Formant Tuning) บน Chrome Google ภาษาไทย
  - กรองและตัดเสียงแหลมสูงหรือเสียงสังเคราะห์ผู้หญิงออกโดยอัตโนมัติ

### 9. 🎨 ชุดรูปแบบและดีไซน์ UI โทนสีฟ้าอมเทาพรีเมียม (Modern Steel Blue & Off-White UI Palette)
- **ชุดสีมาตรฐาน (Brand Palette)**:
  - พื้นหลังหลัก (Canvas): `#edf1f4` (Cool Off-White)
  - แถบหัวเรื่องและแถบข้าง (Shell & Sidebar): `#abbed2` (Soft Steel/Slate Blue)
  - ช่องกรอกข้อมูล (Inputs): `#c4d7e6` (Soft Pastel Slate Blue)
  - ปุ่มหลักและแอ็กชัน (Primary Action & Active Nav): `#3b99e2` (Vibrant Sky Blue)
  - การ์ดและกล่องข้อความ (Cards): `#ffffff` (Pure White พร้อมมุมมน `rounded-[26px]`)
  - ตัวอักษร (Typography): `#1e293b` (Slate 800) สำหรับหัวข้อ และ `#64748b` สำหรับข้อความรอง
- **การออกแบบหน้า Login & Register ใหม่**:
  - การ์ดครอบนอกทรงมน `rounded-[32px]` สไตล์ Steel Blue `#abbed2` พร้อมตราสัญลักษณ์ AI Trainer Logo สี่เหลี่ยมมนความละเอียดสูง
  - การ์ดฟอร์มสีขาวบริสุทธิ์สไตล์มินิมอล พร้อมช่องกรอก Email และ Password สีพาสเทลและไอคอน SVG แสดงสถานะ
  - ปุ่ม `LOGIN` / `Create Account` สีฟ้าสดใส `#3b99e2` สไตล์โมเดิร์น
- **การปรับปรุงหน้า Onboarding, Chat Assistant และ Workout Plan**:
  - หน้า Onboarding รองรับการกรอกข้อมูล 5 ค่า (ชื่อ, เพศ, อายุ, ส่วนสูง, น้ำหนัก) ตามสไตล์ภาพต้นฉบับ
  - หน้า Chat Assistant ใช้ Sidebar สี `#abbed2`, ปุ่ม `+ New Chat`, ปุ่ม `Profile` ทรงรีสีขาว, คำทักทาย *"Where should we begin?"* และช่องค้นหา/ส่งข้อความแบบลอยตัว (Floating Pill)
  - หน้าตารางฝึกซ้อม (AI Weekly Plan) ใช้แถบหัวสี `#abbed2` พร้อมปุ่ม *"← กลับหน้าแชต"* และการ์ดแสดงผลสีขาวสะอาดตา

---

### 10. 🍲 ระบบแนะนำเมนูอาหารใกล้เคียงและเมนูทดแทนอัจฉริยะ (Intelligent Similar & Substitute Food Recommendation Engine)
- **แนะนำเมนูใกล้เคียงทันทีเมื่อไม่พบในระบบ (Unknown Dish Similarity Matching)**: เมื่อผู้ใช้พิมพ์ค้นหาหรือถามถึงเมนูที่ไม่มีอยู่ในฐานข้อมูลโดยตรง (เช่น *ต้มยำปลาแซลมอน, แกงส้มชะอมไข่, ราเมงหมูชาชู, เบอร์เกอร์หมู, ชานมไข่มุก*) ระบบจะประมาณการค่าพลังงานและสารอาหารตามหมวดหมู่อาหาร พร้อมแนะนำเมนูอาหารที่ใกล้เคียงกัน 2–3 เมนูในระบบ พร้อมระบุเหตุผลความคล้ายคลึง เช่น รสชาติตระกูลเดียวกัน, แหล่งโปรตีนเดียวกัน หรือทางเลือกเพื่อสุขภาพ
- **ระบบแนะนำเมนูทดแทนเมื่อเบื่ออาหาร (Substitute Recommendation Engine)**: เมื่อผู้ใช้ถามคำถามในลักษณะ *"กินอะไรแทน...ดี"*, *"เบื่ออกไก่ กินอะไรแทนดี"*, หรือ *"มีเมนูอะไรคล้ายต้มยำกุ้งบ้าง"* ระบบจะตรวจจับเมนูต้นทางและคัดกรองเมนูทางเลือกที่มีโปรตีนเทียบเท่า แคลอรี่ต่ำกว่า หรือรสชาติสไตล์เดียวกัน พร้อมแสดงปุ่ม Interactive Action Card ให้ผู้ใช้บันทึกลงมื้ออาหารได้ทันที
- **UI แนะนำเมนูใกล้เคียงแบบ Interactive (Smart Autocomplete & Search Suggestions)**: ในหน้า `FoodTracker.jsx` และแถบ Quick Food Log ใน `AIAssistant.jsx` เมื่อค้นหาเมนูแล้วไม่พบ ระบบจะแสดงแบนเนอร์ *"💡 ไม่พบเมนูที่ค้นหา แต่ FitAI แนะนำเมนูที่ใกล้เคียง:"* พร้อมการ์ดเมนูแคลอรี่/โปรตีน และเหตุผลประกอบ คลิกเพื่อเลือกและบันทึกข้อมูลได้ทันที
- **การคำนวณพลังงานที่แม่นยำด้วยสูตร Atwater**: ตรวจสอบและคำนวณแคลอรี่ที่ถูกต้องอัตโนมัติจากโปรตีน คาร์โบไฮเดรต และไขมัน (4P + 4C + 9F) สำหรับข้อมูลอาหารพื้นถิ่นไทยในฐานข้อมูลโภชนาการกว่า 365 เมนู

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
| **Malong 3D Motion Net** | PyTorch / Deep Neural Net | โมเดลจำแนกท่าทางการเคลื่อนไหว 3 มิติ 14 คลาส (`exercise_3d_model.pt`) สกัดจากคีย์เฟรมชีวกลศาสตร์ Malong |
| **Three.js Malong 3D Coach** | FBX Skeletal & KeyframeTracks | อวาตาร์ 3 มิติเคลื่อนไหวตรงตามท่าฝึก 14 ท่าหลัก หมุน 360 องศา สลับท่า Crossfade อัตโนมัติ |

---

## 📡 สรุปรายการ API Endpoints (API Reference)

### 1. ระบบยืนยันตัวตนและโปรไฟล์ผู้ใช้ (`/api/auth` & `/api/profile`)
| Method | Endpoint | คำอธิบาย | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | สมัครสมาชิกใหม่พร้อมตรวจสอบความปลอดภัยรหัสผ่าน | Public |
| `POST` | `/api/auth/login` | เข้าสู่ระบบและรับ JWT Token | Public |
| `GET` | `/api/auth/me` | ดึงข้อมูลบัญชีผู้ใช้ปัจจุบัน | User |
| `GET` | `/api/profile/me` | ดึงข้อมูลสัดส่วนร่างกายและโปรไฟล์สุขภาพ (BMI, ส่วนสูง, น้ำหนัก) | User |
| `PUT` | `/api/profile/me` | ปรับปรุงข้อมูลส่วนตัว (อายุ, ส่วนสูง, น้ำหนัก, คำนวณ BMI อัตโนมัติ) | User |
| `POST` | `/api/profile/me` | สร้างหรือบันทึกข้อมูลส่วนตัว (อายุ, ส่วนสูง, น้ำหนัก) | User |

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
| `GET` | `/api/food/search?q=...` | ค้นหารายการอาหาร พร้อมส่งรายการแนะนำใกล้เคียง (`suggestions`) หากไม่พบเมนูตรง | User |
| `GET` | `/api/food/similar?q=...` | แนะนำเมนูอาหารที่ใกล้เคียงหรือใช้ทดแทนกันได้พร้อมเหตุผลประกอบ | User |

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

## 🧠 สถาปัตยกรรมระบบถาม-ตอบและการโค้ชอัจฉริยะ (AI Coach & Knowledge Engine)

ระบบ AI Assistant ของ FitAI Trainer ได้รับการยกระดับความสามารถในการตอบคำถามและให้คำแนะนำอย่างเป็นธรรมชาติ โดยสังเคราะห์องค์ความรู้จากชุดคำถามฟิตเนสกว่า 10,800 ข้อ ครอบคลุมบริบทชีวิตจริงของคนไทย:

### 1. ฐานข้อมูลองค์ความรู้เฉพาะทาง (Domain Knowledge Datasets)
- **`backend/src/data/lifestyle_coaching_dataset.json`**:
  - **7 กลุ่มผู้ใช้เฉพาะ (Personas)**: คนผอมมีพุง (Skinny Fat / Body Recomp), คนไม่มีเวลา (High-Density Training), คนงบน้อย (โปรตีนครบในงบ ≤ 150 บาท/วัน), มนุษย์เงินเดือน (แก้ออฟฟิศซินโดรม), คนนอนดึก/เข้ากะดึก, นักเรียน/นักศึกษา (ฉบับเด็กหอ), นักวิ่ง (Strength & Injury Resilience)
  - **6 ข้อจำกัดสภาพแวดล้อม (Constraints)**: ฝึกที่คอนโดห้ามเสียงดัง (Low-impact No jumping), ดัมเบลคู่เดียวที่บ้าน, ยิมสปลิต 3-4 วัน, เวลาจำกัด 30 นาที, งบจำกัด 150 บาท, เซฟข้อต่อและป้องกันการบาดเจ็บ
  - **เกร็ดอาหารไทย (Thai Street Food Hacks)**: ทริคเปลี่ยนไข่ดาวเป็นไข่ต้ม (Save 80-110 kcal), เทคนิคสั่งอาหารตามสั่งผัดน้ำลดแคลอรี่ 50%, เทคนิคสั่งก๋วยเตี๋ยวแคลต่ำโปรตีนสูง, รวมเมนูโปรตีนสูงใน 7-Eleven
- **`backend/src/data/exercise_qa_dataset.json`**: ขยายเป็น 852 รายการ ครอบคลุม 160 Intents และ 20 หมวดหมู่หลัก เชื่อมโยงความปลอดภัย โภชนาการ และการฝึก

### 2. การทำงานร่วมกันระหว่าง Ollama LLM และ Local Fitness Fallback
- **Context Injection**: ระบบจะทำการสแกนข้อความของผู้ใช้ด้วย `coachKnowledgeService` เพื่อจำแนก Persona, Constraint, และ Food Hack จากนั้นแนบหลักการเข้าสู่ System Prompt ของ Ollama LLM โดยอัตโนมัติ เพื่อให้ AI ตอบอย่างอิสระ มีชีวิตชีวา และถูกต้องตามหลักการวิทยาศาสตร์การกีฬา
- **Intelligent Local Fallback**: กรณีที่เครื่องไม่ได้เปิดใช้งาน LLM หรือเกิด Timeout ระบบ Local Fitness Fallback Engine จะประมวลผลคำตอบภาษาไทยที่จัดรูปแบบอย่างสวยงาม อธิบายถึงเหตุผล พร้อมแนบคลิปวิดีโอสาธิตจาก YouTube ที่สอดคล้องกับหัวข้อทันที

### 3. ระบบเรียนรู้และจดจำความต้องการรายบุคคลจากประวัติการแชท (User Learning & Memory System)
- **สถาปัตยกรรม `backend/src/services/userLearningService.js`**:
  - วิเคราะห์ประวัติข้อความในอดีตของผู้ใช้จากฐานข้อมูล (`ChatMessage` และ `ChatSession`) โดยอัตโนมัติ
  - สกัดมิติความต้องการสำคัญ 5 ด้าน:
    1. **เป้าหมายหลัก (Goals)**: ลดไขมัน, สร้างกล้ามเนื้อ, เพิ่มความทนทาน, ลีนกระชับ
    2. **ส่วนร่างกายที่เน้น (Focus Areas)**: ช่วงบน, ช่วงล่าง, แขน, หน้าอก, แผ่นหลัง, หน้าท้อง/แกนกลาง
    3. **ข้อจำกัดและอุปกรณ์ (Constraints & Equipment)**: มีดัมเบลคู่เดียว, อยู่คอนโดห้ามเสียงดัง, เวลาจำกัด 15-30 นาที, งบน้อย
    4. **อาการบาดเจ็บและจุดที่ต้องระวัง (Injuries & Health)**: เจ็บเข่า, ปวดหลัง, ออฟฟิศซินโดรม
    5. **พฤติกรรมอาหารและโภชนาการ (Dietary Habits)**: ของกินเซเว่น, อาหารตามสั่งผัดน้ำ, เบื่ออกไก่
  - นำข้อมูลความชอบรายบุคคลฉีดเข้าสู่บริบทของ AI (`promptDirective`) ทำให้ AI จำความต้องการของผู้ใช้ได้โดยไม่ต้องบอกซ้ำ

### 4. ระบบค้นหาข้อมูลภายนอกแบบ Real-time จาก Google และ Live Web Search
- **สถาปัตยกรรม `backend/src/services/googleSearchService.js`**:
  - **การตรวจจับความจำเป็นในการค้นหา (`shouldSearchGoogle`)**: ตรวจจับคำสั่งค้นหาโดยตรง (เช่น *"ค้นหาใน google"*, *"หาข้อมูลให้หน่อย"*) รวมถึงคำถามที่ต้องใช้ข้อมูลตลาดปัจจุบัน (เช่น ราคาสินค้า, รีวิวอาหารเสริม, เวย์ยี่ห้อไหนดี, งานวิจัยล่าสุด)
  - **ระบบค้นหา 3 ระดับ (Multi-tier Architecture)**:
    1. **Tier 1 (Google CSE API)**: รองรับการเชื่อมต่อ Google Custom Search JSON API เมื่อตั้งค่า `GOOGLE_SEARCH_API_KEY` และ `GOOGLE_SEARCH_CX`
    2. **Tier 2 (Live Web Search Engine)**: ค้นหาข้อมูลสดจากอินเทอร์เน็ตแบบ Zero-Key Parser ดึงชื่อบทความ เนื้อหาสรุป และ URL ปลายทางที่สะอาด
    3. **Tier 3 (Safe Knowledge Fallback)**: สรุปข้อมูลทางวิทยาศาสตร์การกีฬาเพื่อความต่อเนื่องในการใช้งาน
  - **การอ้างอิงแหล่งที่มา (Citations)**: AI จะนำข้อมูลที่ค้นพบมาวิเคราะห์และแนบลิงก์อ้างอิงให้ผู้ใช้คลิกอ่านต่อยอดได้ทันที

### 5. สถาปัตยกรรมระบบเสียงโค้ช AI สไตล์ Anime Mentor ชายผู้ใหญ่ (Voice Coach & Speech Synthesis Engine)
- **โครงสร้างไฟล์ `frontend/src/utils/speechUtils.js`**:
  - **การตั้งค่าโปรไฟล์เสียงแยกตามบริบท (Context-Aware Acoustic Modulation)**:
    - `default`: Pitch 0.84, Rate 0.92 (เสียงทุ้ม นุ่ม ลึก สุขุม มั่นใจ)
    - `start`: Pitch 0.88, Rate 0.95 (มีพลัง มั่นใจ เริ่มต้นการฝึก)
    - `form_warning`: Pitch 0.83, Rate 0.90 (สุภาพแต่จริงจัง เน้นความถูกต้องของฟอร์ม)
    - `form_praise`: Pitch 0.85, Rate 0.92 (มั่นใจและอบอุ่น ให้กำลังใจอย่างจริงใจ)
    - `rep_count`: Pitch 0.84, Rate 0.92 (ชัดเจน มีจังหวะ มั่นคง)
    - `rest`: Pitch 0.82, Rate 0.88 (ผ่อนคลาย สบายๆ ฟื้นฟูร่างกาย)
    - `next_set`: Pitch 0.86, Rate 0.93 (พร้อมและมั่นคง เตรียมเริ่มเซ็ตต่อไป)
    - `finish`: Pitch 0.85, Rate 0.90 (ภูมิใจและสรุปผลอย่างทรงคุณค่า)
  - **ระบบออกเสียงและทำความสะอาดข้อความ (Bilingual Fitness Phonetics & Text Sanitization)**:
    - แปลงคำทับศัพท์ฟิตเนสกว่า 60 คำเป็นภาษาไทยที่ออกเสียงเป็นธรรมชาติ (เช่น Squat -> สควอต, Deadlift -> เดดลิฟต์)
    - จัดการคำซ้ำไม้ยมก "ค่อย ๆ" เป็น "ค่อย ค่อย" เพื่อความต่อเนื่อง ลื่นไหล ไร้การสะดุด
    - แบ่งประโยคตามอนุภาคคำพูด (Conversational Particles) เช่น *ครับ*, *นะครับ*, *อย่ารีบครับ* เพื่อสร้างจังหวะการหยุดพักหายใจตามธรรมชาติของมนุษย์

### 6. การปรับปรุงระบบดีไซน์ Frontend สู่ Steel Blue & Off-White Unified Design System
ระบบหน้าจอผู้ใช้งาน (User Interface) ทั้งหมดได้รับการปรับแต่งให้สอดคล้องกับโทนสี Steel Blue & Off-White ตามแบบต้นฉบับอย่างสมบูรณ์แบบ 100% โดยมีองค์ประกอบของ Design Tokens ดังนี้:
- **Canvas / Outer Background**: `#edf1f4` (Off-White สว่างตา เย็นสบาย สะอาดระดับพรีเมียม)
- **Outer Shell / Header / Sidebar**: `#abbed2` (Soft Steel / Slate Blue ให้ความรู้สึกมั่นคง สุขุม ทันสมัย)
- **Input Background**: `#c4d7e6` (พาสเทล Slate Blue สบายตา ข้อความสี `#1e293b` Placeholder สี `#64748b`)
- **Primary Action Buttons**: `#3b99e2` (Hover: `#288ad4`, Active Scale: `0.99`, ข้อความสีขาว, ขอบมน `rounded-2xl` พร้อมเงา `shadow-md shadow-[#3b99e2]/25`)
- **Cards & Data Containers**: `#ffffff` (Pure White พร้อมขอบมนโค้งมน `rounded-[24px]` ขอบเส้นบาง `border-slate-200/80` และเงามิติ `shadow-sm`)
- **Secondary Buttons & Header Badges**: `#ffffff` / `#c4d7e6` (Pill shape มนกลม ข้อความ `#1e293b` ตัดขอบ `border-slate-300`)
- **Typography & Labels**: `#1e293b` (Slate 800 สำหรับหัวข้อหลัก) และ `#475569` / `#64748b` (สำหรับคำอธิบายประกอบ)

#### หน้าระบบและคอมโพเนนต์ทั้งหมดที่ปรับปรุงเข้าสู่ระบบสีเดียวอย่างสมบูรณ์:
1. **Login.jsx**: หน้าเข้าสู่ระบบโครงสร้าง Soft Slate Shell (`#abbed2`) พร้อมตราสัญลักษณ์ AI Trainer แท้, ฟอร์มการ์ดสีขาว (`#ffffff`), ช่องกรอก `#c4d7e6` และปุ่ม LOGIN สีฟ้า `#3b99e2`
2. **Register.jsx**: หน้าลงทะเบียนสไตล์การ์ดขอบมน Soft Slate Blue ครบทุกฟิลด์การใช้งาน
3. **Onboarding.jsx**: หน้าบันทึกสัดส่วนร่างกายแรกเข้า (เพศ, อายุ, ส่วนสูง, น้ำหนัก) ดีไซน์มินิมอลตามต้นฉบับ
4. **AIAssistant.jsx**: แถบนำทางด้านข้างสี `#abbed2`, หน้าต่างแชท `#edf1f4`, กล่องโต้ตอบคำถามลอยตัว, และ Side Panel สำหรับคำนวณแคลอรี/แผนฝึก AI ในโทนสีขาวสะอาดตา
5. **WorkoutPlan.jsx**: แถบหัวเรื่องสี `#abbed2` พร้อมป้ายกำกับ AI WEEKLY PLAN และการ์ดตารางฝึก 7 วันแบบสีขาวขอบมน
6. **ProfileEditor.jsx**: แบบฟอร์มแก้ไขข้อมูลส่วนตัวและการแสดงผลดัชนี BMI ปรับเป็นสีฟ้าอ่อน `#3b99e2` และตารางระดับน้ำหนักสมส่วน
7. **Settings.jsx**: การตั้งค่าเสียง AI Anime Mentor Coach และความเร็วในการออกเสียง
8. **WorkoutProgress.jsx**: กราฟแท่งสถิติการออกกำลังกาย 7 เซสชันและสรุป Best Score ในโทนสีฟ้าสดใส
9. **FoodTracker.jsx**: ระบบสแกนเนอร์กล้อง AI วิเคราะห์อาหาร, สรุปแคลอรี TDEE ประจำวัน, และประวัติการรับประทานอาหาร
10. **Workout.jsx**: ห้องออกกำลังกาย AI Real-time Vision, การนับ Rep, ตรวจจับมุมข้อต่อ และ Malong 3D Coach
11. **Dashboard.jsx**: หน้าแดชบอร์ดเมนูลัดและสรุปข้อมูลสุขภาพผู้ใช้งาน
12. **VerifyEmail.jsx**: หน้าต่างยืนยันอีเมลในโครงสร้างการ์ดดีไซน์ใหม่
13. **Components & Modals**: `FoodCameraModal.jsx`, `FoodLogItem.jsx`, `YouTubeCard.jsx`, `ChatMessageContent.jsx`, `UnityWorkout3D.jsx`, และ `ProtectedRoute.jsx` (LoadingScreen)

---

### 7. สถาปัตยกรรมระบบแนะนำเมนูอาหารใกล้เคียงและเมนูทดแทน (Similar & Substitute Food Recommendation Engine)
ระบบถูกออกแบบมาเพื่อแก้ปัญหาเมื่อผู้ใช้ถามถึงเมนูที่ระบบไม่รู้จัก หรือต้องการหาเมนูทางเลือกทดแทน:
1. **การสกัดมโนทัศน์ทางโภชนาการ (Culinary Concept Extraction)**:
   - จำแนกแหล่งโปรตีน: ไก่/สัตว์ปีก (`chicken`), หมู (`pork`), เนื้อวัว (`beef`), ซีฟู้ด/ปลา (`seafood`), ไข่ (`egg`), โปรตีนพืช/เต้าหู้ (`plant`)
   - จำแนกวิธีการปรุงและสไตล์อาหาร: ต้ม/แกง (`soup_curry`), ต้มยำ (`tom_yum`), แกงส้ม (`gaeng_som`), กะเพรา (`krapow`), ผัด/ทอด (`stir_fry`), ย่าง/อบ (`grill_roast`), นึ่ง/ลวก (`steam_boil`), ยำ/สลัด (`salad_yum`), จานข้าว (`rice`), เส้น/ก๋วยเตี๋ยว (`noodle`), ตะวันตก/สเต็ก (`western`), เครื่องดื่ม (`beverage`), ของหวาน (`dessert`)
   - ป้องกันการจับคู่คำผิดพลาดเฉพาะภาษาไทย (Thai False Positive Guards): กรองคำว่า *"ขนมจีน"* ไม่ให้ปนกับคำว่า *"นม"*, กรองคำว่า *"ไข่มุก"* ไม่ให้ปนกับ *"ไข่"*, กรองคำว่า *"ชาชู / ชาบู"* ไม่ให้ปนกับ *"ชา (Tea)"*
2. **อัลกอริทึมการให้คะแนนความคล้ายคลึง (Intelligent Similarity Scoring)**:
   - เมนูตระกูลรสชาติเดียวกัน (แกงส้ม, ต้มยำ, กะเพรา, สเต็ก): +55 ถึง +65 คะแนน
   - เครื่องดื่มเพื่อสุขภาพทางเลือก (`category === 'beverage'`): +50 ถึง +85 คะแนน
   - แหล่งโปรตีนเดียวกัน: +35 คะแนน
   - วิธีการปรุง/ประเภทอาหารเดียวกัน: +30 คะแนน
   - ทางเลือกสุขภาพแคลอรี่ต่ำทดแทนของทอด/มัน: +25 คะแนน
3. **การนำเสนอและโต้ตอบแบบทันที (Interactive Output & Action Cards)**:
   - ใน AI Chat: แสดงผลแคลอรี่โดยประมาณของเมนูที่ผู้ใช้ถาม พร้อมแสดง 3 เมนูใกล้เคียง และแนบ `[LOG_FOOD_ACTION]` เพื่อให้บันทึกเข้ามื้ออาหารได้ทันที
   - ใน Food Search Modal: แสดงกล่องคำแนะนำดีไซน์ Steel Blue & Off-White พร้อมเหตุผลและข้อมูลโภชนาการ คลิกเพื่อนำเข้าฟอร์มได้ทันที

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
