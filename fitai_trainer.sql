-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 07, 2026 at 10:39 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fitai_trainer`
--

-- --------------------------------------------------------

--
-- Table structure for table `chatmessage`
--

CREATE TABLE `chatmessage` (
  `id` int NOT NULL,
  `sessionId` int NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatmessage`
--

INSERT INTO `chatmessage` (`id`, `sessionId`, `role`, `createdAt`, `content`) VALUES
(171, 21, 'user', '2026-08-25 01:08:27.152', 'สวัสดี'),
(172, 21, 'assistant', '2026-08-25 01:08:48.882', 'สวัสดีค่ะ ตอนนี้คุณอยู่ที่การฝึกช่วงบน ฉันได้กำหนดแผนการออกกำลังกายไว้ให้คุณแล้วนะคะ\n\n- Arm Circles (3เซ็ต, 10-12ครั้ง)\n- Biceps Curl (3เซ็ต, 10-12ครั้ง)\n- Bodyweight Row (3เซ็ต, 10-12ครั้ง)\n- Chest Dip (3เซ็ต, 10-12ครั้ง)\n- Chin-up (3เซ็ต, 10-12ครั้ง)\n\nคุณสามารถเริ่มฝึกได้เลยนะคะ ถ้าไม่มีอาการเจ็บหน้าอก หายใจลำบาก หรืออาการอื่นๆ ฉันแนะนำให้ฝึกไปเรื่อยๆ ตามแผนที่กำหนด\n\nระหว่างฝึก ให้ระวังสุขภาพร่างกาย และไม่ลืมพักผ่อนให้เพียงพอค่ะ หากมีความรู้สึกไม่สบาย ให้หยุดฝึกและปรึกษาแพทย์ถ้าจำเป็นนะคะ');

-- --------------------------------------------------------

--
-- Table structure for table `chatsession`
--

CREATE TABLE `chatsession` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatsession`
--

INSERT INTO `chatsession` (`id`, `userId`, `title`, `createdAt`, `updatedAt`) VALUES
(21, 13, 'สวัสดี', '2026-08-25 01:08:27.138', '2026-08-25 01:08:27.138');

-- --------------------------------------------------------

--
-- Table structure for table `emailverificationtoken`
--

CREATE TABLE `emailverificationtoken` (
  `id` int NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `emailverificationtoken`
--

INSERT INTO `emailverificationtoken` (`id`, `token`, `userId`, `expiresAt`, `createdAt`) VALUES
(8, 'cbdd8c811d77e7cc758752fb3a395d96c2d4f073cf2235baa632225bd2b527ac', 13, '2026-08-25 01:21:40.043', '2026-08-25 00:51:40.051'),
(9, '4f44b1ba80571288bcf476a8bc5471d456b9635dd8d65271a428d1756e09d3c0', 14, '2026-09-03 07:56:03.838', '2026-09-03 07:26:03.858');

-- --------------------------------------------------------

--
-- Table structure for table `exercise`
--

CREATE TABLE `exercise` (
  `id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetMuscle` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `aiEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `counterType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primaryJoint` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poseLandmarks` json DEFAULT NULL,
  `downThreshold` double DEFAULT NULL,
  `upThreshold` double DEFAULT NULL,
  `targetAngle` double DEFAULT NULL,
  `formRules` json DEFAULT NULL,
  `feedbackRules` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exercise`
--

INSERT INTO `exercise` (`id`, `name`, `description`, `difficulty`, `targetMuscle`, `instructions`, `createdAt`, `category`, `updatedAt`, `aiEnabled`, `counterType`, `primaryJoint`, `poseLandmarks`, `downThreshold`, `upThreshold`, `targetAngle`, `formRules`, `feedbackRules`) VALUES
(1, 'Squat', 'ท่าสควอตสำหรับบริหารกล้ามเนื้อขาและสะโพก', 'Beginner', 'Quadriceps, Glutes', 'ยืนเท้ากว้างประมาณหัวไหล่ ย่อตัวลงโดยรักษาหลังให้ตรง แล้วดันตัวกลับขึ้น', '2026-08-10 17:09:17.632', 'Strength', '2026-08-11 21:02:31.277', 1, 'angle', 'knee', '{\"leftHip\": 23, \"leftKnee\": 25, \"rightHip\": 24, \"leftAnkle\": 27, \"rightKnee\": 26, \"rightAnkle\": 28}', 120, 160, 90, '[\"knee_alignment\", \"squat_depth\", \"torso_angle\"]', '{\"too_deep\": \"ระวังอย่าย่อลึกเกินไปครับ\", \"correct_depth\": \"ท่าถูกต้องครับ\", \"not_deep_enough\": \"ย่อลงอีกนิดครับ\"}'),
(2, 'Push Up', 'ท่าวิดพื้นสำหรับบริหารกล้ามเนื้อช่วงบน', 'Beginner', 'Chest, Shoulders, Triceps', 'วางมือให้กว้างประมาณหัวไหล่ รักษาลำตัวให้เป็นแนวตรง ลดตัวลงแล้วดันตัวกลับขึ้น', '2026-08-10 17:09:17.641', 'Strength', '2026-08-11 21:02:31.287', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Plank', 'ท่าแพลงก์สำหรับบริหารกล้ามเนื้อแกนกลางลำตัว', 'Beginner', 'Core', 'วางข้อศอกและปลายเท้าบนพื้น รักษาลำตัวให้ตรงและเกร็งหน้าท้อง', '2026-08-10 17:09:17.647', 'Core', '2026-08-11 21:02:31.294', 1, 'timer', 'hip', '{\"leftHip\": 23, \"rightHip\": 24, \"leftAnkle\": 27, \"rightAnkle\": 28, \"leftShoulder\": 11, \"rightShoulder\": 12}', NULL, NULL, 180, '[\"body_alignment\", \"hip_height\", \"head_position\"]', '{\"correct\": \"รักษาท่านี้ไว้ครับ\", \"hip_too_low\": \"ยกสะโพกขึ้นเล็กน้อยครับ\", \"hip_too_high\": \"ลดสะโพกลงเล็กน้อยครับ\"}'),
(4, 'Lunges', 'ท่าลันจ์สำหรับบริหารกล้ามเนื้อขา', 'Beginner', 'Quadriceps, Glutes', 'ก้าวขาข้างหนึ่งไปด้านหน้า ย่อตัวลง แล้วดันตัวกลับสู่ท่าเริ่มต้น', '2026-08-10 17:09:17.652', 'Strength', '2026-08-11 21:02:31.299', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Jumping Jack', 'ท่าคาร์ดิโอสำหรับเพิ่มอัตราการเต้นของหัวใจ', 'Beginner', 'Full Body', 'กระโดดพร้อมกางแขนและขาออก แล้วกลับสู่ท่าเริ่มต้น', '2026-08-10 17:09:17.655', 'Cardio', '2026-08-11 21:02:31.303', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Push-up', 'ท่าวิดพื้นพื้นฐานสำหรับพัฒนากล้ามเนื้อหน้าอก ไหล่ และแขนหลัง', 'Beginner', 'Chest, Triceps, Shoulders', 'วางมือกว้างกว่าหัวไหล่เล็กน้อย รักษาลำตัวให้ตรง ลดหน้าอกลงใกล้พื้น แล้วดันตัวกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 1, 'angle', 'elbow', '{\"leftElbow\": 13, \"leftWrist\": 15, \"rightElbow\": 14, \"rightWrist\": 16, \"leftShoulder\": 11, \"rightShoulder\": 12}', 100, 160, 90, '[\"elbow_angle\", \"body_alignment\", \"hip_position\"]', '{\"correct\": \"วิดพื้นได้ถูกต้องครับ\", \"hip_sag\": \"รักษาลำตัวให้ตรงครับ\", \"not_low_enough\": \"ลดตัวลงอีกนิดครับ\"}'),
(7, 'Wide Push-up', 'ท่าวิดพื้นที่วางมือกว้างกว่าปกติเพื่อเน้นกล้ามเนื้อหน้าอก', 'Beginner', 'Chest', 'วางมือกว้างกว่าหัวไหล่ รักษาลำตัวให้ตรง ลดหน้าอกลง แล้วดันตัวกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Diamond Push-up', 'ท่าวิดพื้นที่เน้นแขนหลังและหน้าอก', 'Intermediate', 'Triceps, Chest', 'วางมือให้หัวแม่มือและนิ้วชี้แตะกันเป็นรูปเพชร รักษาลำตัวตรง ลดตัวลงแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Incline Push-up', 'วิดพื้นโดยวางมือบนพื้นผิวที่สูง เหมาะสำหรับผู้เริ่มต้น', 'Beginner', 'Chest, Shoulders', 'วางมือบนพื้นผิวที่มั่นคงและสูงกว่าพื้น รักษาลำตัวตรง ลดหน้าอกเข้าหาพื้นผิว แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Decline Push-up', 'วิดพื้นโดยยกเท้าสูงเพื่อเพิ่มภาระที่หน้าอกส่วนบนและไหล่', 'Intermediate', 'Upper Chest, Shoulders, Triceps', 'วางเท้าบนพื้นผิวสูง วางมือบนพื้น รักษาลำตัวตรง ลดหน้าอกลงแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Chest Dip', 'ท่า Dip สำหรับพัฒนากล้ามเนื้อหน้าอกและแขนหลัง', 'Intermediate', 'Chest, Triceps, Shoulders', 'จับบาร์ให้มั่นคง โน้มตัวไปด้านหน้าเล็กน้อย ลดตัวลงอย่างควบคุม แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Pull-up', 'ท่าดึงตัวขึ้นสำหรับพัฒนากล้ามเนื้อหลังและแขน', 'Advanced', 'Latissimus Dorsi, Biceps', 'จับบาร์ให้มั่นคง ดึงตัวขึ้นจนคางผ่านบาร์ แล้วลดตัวลงอย่างควบคุม', '2026-08-12 03:30:50.000', 'Back', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Chin-up', 'ท่าดึงตัวแบบหันฝ่ามือเข้าหาตัว', 'Intermediate', 'Latissimus Dorsi, Biceps', 'จับบาร์แบบหงายมือ ดึงตัวขึ้นโดยเกร็งหลังและแขน แล้วลดตัวกลับ', '2026-08-12 03:30:50.000', 'Back', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Inverted Row', 'ท่าดึงตัวในแนวนอนสำหรับพัฒนากล้ามเนื้อหลัง', 'Intermediate', 'Back, Biceps', 'จับบาร์ รักษาลำตัวเป็นเส้นตรง ดึงอกเข้าหาบาร์ แล้วลดตัวกลับ', '2026-08-12 03:30:50.000', 'Back', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Superman', 'Back extension control', 'Beginner', 'Back, Glutes', 'Lift opposite limbs gently without straining the neck.', '2026-08-12 03:30:50.000', 'Strength', '2026-08-11 21:02:31.351', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'Bird Dog', 'Controlled core stability', 'Beginner', 'Core, Back', 'Extend the opposite arm and leg while keeping hips stable.', '2026-08-12 03:30:50.000', 'Core', '2026-08-11 21:02:31.315', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Shoulder Tap', 'ท่าแตะไหล่เพื่อพัฒนาไหล่และความมั่นคงของ Core', 'Beginner', 'Shoulders, Core', 'เริ่มจากท่า Plank ใช้มือแตะไหล่ตรงข้ามสลับข้างโดยรักษาสะโพกให้นิ่ง', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Pike Push-up', 'ท่าวิดพื้นแบบยกสะโพกเพื่อเน้นหัวไหล่', 'Intermediate', 'Shoulders, Triceps', 'ยกสะโพกขึ้นเป็นรูปตัว V ลดศีรษะเข้าหาพื้นแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Lateral Raise', 'ท่ายกแขนออกด้านข้างสำหรับกล้ามเนื้อไหล่ด้านข้าง', 'Beginner', 'Lateral Deltoid', 'ยืนตัวตรง ยกแขนออกด้านข้างถึงระดับไหล่ แล้วลดลงอย่างควบคุม', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Front Raise', 'ท่ายกแขนด้านหน้าสำหรับหัวไหล่ด้านหน้า', 'Beginner', 'Front Deltoid', 'ยืนตัวตรง ยกแขนไปด้านหน้าถึงระดับไหล่ แล้วลดลงอย่างช้า ๆ', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Reverse Fly', 'ท่าบริหารหัวไหล่ด้านหลังและหลังส่วนบน', 'Intermediate', 'Rear Deltoid, Upper Back', 'โน้มตัวไปด้านหน้าเล็กน้อย กางแขนออกด้านข้าง แล้วลดกลับ', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Biceps Curl', 'ท่ายกน้ำหนักพื้นฐานสำหรับกล้ามเนื้อแขนหน้า', 'Beginner', 'Biceps', 'ยืนตัวตรง งอศอกยกน้ำหนักขึ้นโดยไม่แกว่งลำตัว แล้วลดลง', '2026-08-12 03:30:50.000', 'Biceps', '2026-08-12 03:30:50.000', 1, 'angle', 'elbow', '{\"leftElbow\": 13, \"leftWrist\": 15, \"rightElbow\": 14, \"rightWrist\": 16, \"leftShoulder\": 11, \"rightShoulder\": 12}', 150, 55, 45, '[\"elbow_angle\", \"upper_arm_position\", \"body_swing\"]', '{\"correct\": \"Curl ได้ดีครับ\", \"body_swing\": \"พยายามอย่าแกว่งตัวครับ\", \"not_full_curl\": \"งอแขนขึ้นอีกนิดครับ\"}'),
(23, 'Hammer Curl', 'ท่า Curl แบบจับน้ำหนักแนวตั้ง', 'Beginner', 'Biceps, Brachialis', 'จับน้ำหนักโดยหันฝ่ามือเข้าหากัน งอศอกยกขึ้นแล้วลดลง', '2026-08-12 03:30:50.000', 'Biceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'Concentration Curl', 'ท่า Curl ที่เน้นกล้ามเนื้อแขนหน้าแบบแยกข้าง', 'Intermediate', 'Biceps', 'นั่งและวางข้อศอกพาดด้านในต้นขา งอแขนขึ้นแล้วลดลง', '2026-08-12 03:30:50.000', 'Biceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'Triceps Dip', 'ท่า Dip สำหรับกล้ามเนื้อแขนหลัง', 'Intermediate', 'Triceps', 'จับขอบหรือบาร์ให้มั่นคง ลดตัวโดยงอศอก แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Triceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'Overhead Triceps Extension', 'ท่าเหยียดแขนเหนือศีรษะเพื่อพัฒนา Triceps', 'Beginner', 'Triceps', 'ถืออุปกรณ์เหนือศีรษะ งอศอกลดลงด้านหลังศีรษะ แล้วเหยียดกลับขึ้น', '2026-08-12 03:30:50.000', 'Triceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'Triceps Kickback', 'ท่าเหยียดแขนไปด้านหลังเพื่อพัฒนา Triceps', 'Beginner', 'Triceps', 'โน้มตัวไปด้านหน้า รักษาต้นแขนให้นิ่ง แล้วเหยียดแขนไปด้านหลัง', '2026-08-12 03:30:50.000', 'Triceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Forward Lunge', 'ท่า Lunge ก้าวไปด้านหน้าเพื่อพัฒนากล้ามเนื้อขา', 'Beginner', 'Quadriceps, Glutes', 'ก้าวขาหนึ่งข้างไปข้างหน้า งอเข่าลง แล้วดันกลับสู่ท่าเริ่ม', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'Reverse Lunge', 'ท่า Lunge ก้าวถอยหลังเพื่อพัฒนาขาและก้น', 'Beginner', 'Quadriceps, Glutes', 'ก้าวขาหนึ่งข้างไปด้านหลัง งอเข่าลง แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'Split Squat', 'ท่าสควอตแบบขาแยกสำหรับฝึกขาทีละข้าง', 'Intermediate', 'Quadriceps, Glutes', 'ยืนแยกขาหน้าและหลัง ลดตัวลงตรง ๆ แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'Bulgarian Split Squat', 'ท่าสควอตขาเดียวโดยใช้เท้าหลังพาดบนพื้นผิวสูง', 'Advanced', 'Quadriceps, Glutes', 'วางเท้าหลังบนพื้นผิวสูง ลดเข่าหน้าลง แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Step-up', 'ก้าวขึ้นแท่นเพื่อฝึกกำลังขาและการทรงตัว', 'Beginner', 'Quadriceps, Glutes', 'ก้าวเท้าขึ้นแท่น ดันตัวขึ้น แล้วค่อยก้าวลง', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Sumo Squat', 'Squat แบบยืนกว้างเพื่อเน้นก้นและต้นขาด้านใน', 'Beginner', 'Glutes, Adductors, Quadriceps', 'ยืนกว้างกว่าหัวไหล่ ปลายเท้าเปิดออก ย่อตัวลงแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'Romanian Deadlift', 'ท่าฝึก Hamstrings และ Glutes ด้วยการพับสะโพก', 'Intermediate', 'Hamstrings, Glutes', 'รักษาหลังตรง ดันสะโพกไปด้านหลัง ลดอุปกรณ์ตามแนวขา แล้วดันสะโพกกลับ', '2026-08-12 03:30:50.000', 'Hamstrings', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'Single-leg Romanian Deadlift', 'RDL ข้างเดียวเพื่อฝึก Hamstrings และการทรงตัว', 'Advanced', 'Hamstrings, Glutes, Core', 'ยืนข้างเดียว พับสะโพกและเหยียดขาอีกข้างไปด้านหลัง แล้วกลับสู่ท่าเริ่ม', '2026-08-12 03:30:50.000', 'Hamstrings', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'Good Morning', 'ท่าพับสะโพกสำหรับ Hamstrings และหลังส่วนล่าง', 'Intermediate', 'Hamstrings, Lower Back', 'ยืนตรง ดันสะโพกไปด้านหลัง โน้มลำตัวไปข้างหน้าโดยรักษาหลังเป็นกลาง แล้วกลับขึ้น', '2026-08-12 03:30:50.000', 'Hamstrings', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Glute Bridge', 'Hip extension for glutes', 'Beginner', 'Glutes, Hamstrings', 'Lie on your back, press through your heels and lift hips with control.', '2026-08-12 03:30:50.000', 'Strength', '2026-08-11 21:02:31.307', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'Hip Thrust', 'ท่ายกสะโพกที่เน้น Glutes', 'Intermediate', 'Glutes, Hamstrings', 'วางหลังส่วนบนบนม้านั่ง ดันสะโพกขึ้นจนลำตัวเกือบเป็นเส้นตรง แล้วลดลง', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'Donkey Kick', 'ท่าเตะขาขึ้นจากท่าคลานเพื่อพัฒนากล้ามเนื้อก้น', 'Beginner', 'Glutes', 'ตั้งคลาน งอเข่าแล้วยกขาข้างหนึ่งขึ้นด้านหลังโดยไม่บิดสะโพก', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'Fire Hydrant', 'ท่ายกขาด้านข้างเพื่อพัฒนา Glute Medius', 'Beginner', 'Glute Medius', 'ตั้งคลาน ยกเข่าด้านข้างโดยรักษาลำตัวให้นิ่ง แล้วลดกลับ', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'Standing Calf Raise', 'ท่าเขย่งปลายเท้าสำหรับพัฒนากล้ามเนื้อน่อง', 'Beginner', 'Gastrocnemius', 'ยืนตรง ยกส้นเท้าขึ้นให้สูงที่สุด ค้างเล็กน้อย แล้วลดลง', '2026-08-12 03:30:50.000', 'Calves', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'Single-leg Calf Raise', 'ท่าเขย่งขาข้างเดียวเพื่อเพิ่มความหนัก', 'Intermediate', 'Gastrocnemius', 'ยืนขาข้างเดียว ยกส้นขึ้นลงอย่างควบคุม แล้วสลับข้าง', '2026-08-12 03:30:50.000', 'Calves', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'Seated Calf Raise', 'ท่าบริหารน่องในท่านั่ง', 'Beginner', 'Soleus', 'นั่งโดยวางเท้าบนพื้น ยกส้นขึ้นแล้วค่อยลดลง', '2026-08-12 03:30:50.000', 'Calves', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'Crunch', 'ท่า Crunch พื้นฐานสำหรับหน้าท้อง', 'Beginner', 'Rectus Abdominis', 'นอนหงาย งอเข่า ยกศีรษะและไหล่ขึ้นโดยเกร็งหน้าท้อง แล้วลดกลับ', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'Sit-up', 'ท่านั่งขึ้นสำหรับกล้ามเนื้อหน้าท้อง', 'Beginner', 'Rectus Abdominis, Hip Flexors', 'นอนหงาย งอเข่า ยกลำตัวขึ้นจนอยู่ในท่านั่ง แล้วกลับลง', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'Bicycle Crunch', 'Crunch แบบหมุนลำตัวสลับซ้ายขวา', 'Intermediate', 'Abs, Obliques', 'ยกไหล่ขึ้น หมุนข้อศอกเข้าหาเข่าฝั่งตรงข้ามสลับข้าง', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'Reverse Crunch', 'ท่ายกสะโพกเข้าหาหน้าอกเพื่อพัฒนาหน้าท้องส่วนล่าง', 'Intermediate', 'Lower Abs', 'นอนหงาย งอเข่า ดึงเข่าเข้าหาหน้าอกโดยยกสะโพกเล็กน้อย แล้วลดลง', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'Leg Raise', 'ท่ายกขาตรงเพื่อพัฒนาหน้าท้องส่วนล่าง', 'Intermediate', 'Lower Abs, Hip Flexors', 'นอนหงาย ยกขาตรงขึ้นแล้วลดลงอย่างควบคุม', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Side Plank', 'Lateral core strength', 'Intermediate', 'Core', 'Keep hips lifted and the body in a straight line.', '2026-08-12 03:30:50.000', 'Core', '2026-08-11 21:02:31.347', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'Mountain Climber', 'ท่า Cardio และ Core ที่เคลื่อนไหวต่อเนื่อง', 'Intermediate', 'Core, Shoulders, Legs', 'เริ่มจาก Plank ดึงเข่าเข้าหาหน้าอกสลับซ้ายขวาโดยรักษาหลังให้มั่นคง', '2026-08-12 03:30:50.000', 'Core', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'Dead Bug', 'Low-impact core control', 'Beginner', 'Core', 'Keep your lower back supported while lowering opposite arm and leg.', '2026-08-12 03:30:50.000', 'Core', '2026-08-11 21:02:31.319', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'Burpee', 'ท่า Full Body ที่ผสม Squat, Plank และ Jump', 'Intermediate', 'Full Body', 'ย่อตัวลง วางมือ เตะขาไปด้านหลัง กลับเข้าท่า Squat แล้วกระโดดขึ้น', '2026-08-12 03:30:50.000', 'Full Body', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'High Knees', 'Cardio coordination', 'Intermediate', 'Full Body', 'Lift knees with a controlled rhythm and land softly.', '2026-08-12 03:30:50.000', 'Cardio', '2026-08-11 21:02:31.337', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'Squat Jump', 'Squat ที่เพิ่มการกระโดดเพื่อพัฒนาพลังขาและ Cardio', 'Intermediate', 'Quadriceps, Glutes, Calves', 'ย่อตัวเหมือน Squat แล้วออกแรงกระโดดขึ้น จากนั้นลงอย่างนุ่มนวล', '2026-08-12 03:30:50.000', 'Cardio', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'Skater', 'ท่ากระโดดด้านข้างเพื่อพัฒนาขาและการทรงตัว', 'Intermediate', 'Glutes, Legs, Core', 'กระโดดจากขาหนึ่งไปอีกข้างพร้อมแกว่งแขนเพื่อรักษาสมดุล', '2026-08-12 03:30:50.000', 'Cardio', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'Wall Push Up', 'Low-impact upper body push', 'Beginner', 'Chest, Shoulders, Triceps', 'Keep your body straight and press away from a wall.', '2026-08-11 21:02:31.311', 'Strength', '2026-08-11 21:02:31.311', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(60, 'Step Up', 'Low-impact leg and balance work', 'Beginner', 'Quadriceps, Glutes', 'Step onto a stable low platform and control the descent.', '2026-08-11 21:02:31.327', 'Strength', '2026-08-11 21:02:31.327', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 'Calf Raise', 'Lower-leg strength', 'Beginner', 'Calves', 'Rise onto your toes slowly and lower with control.', '2026-08-11 21:02:31.330', 'Strength', '2026-08-11 21:02:31.330', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'March In Place', 'Low-impact cardio', 'Beginner', 'Full Body', 'March at a comfortable pace and keep the torso tall.', '2026-08-11 21:02:31.334', 'Cardio', '2026-08-11 21:02:31.334', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'Arm Circles', 'Shoulder mobility warm-up', 'Beginner', 'Shoulders', 'Make small controlled circles in both directions.', '2026-08-11 21:02:31.341', 'Mobility', '2026-08-11 21:02:31.341', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'Cat Cow', 'Spinal mobility', 'Beginner', 'Back, Core', 'Move slowly between a rounded and extended spine.', '2026-08-11 21:02:31.344', 'Mobility', '2026-08-11 21:02:31.344', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'Bodyweight Row', 'Upper back pulling strength', 'Intermediate', 'Back, Biceps', 'Use a stable support and pull the chest toward the hands.', '2026-08-11 21:02:31.354', 'Strength', '2026-08-11 21:02:31.354', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'Chair Squat', 'Assisted squat for beginners', 'Beginner', 'Quadriceps, Glutes', 'Sit back toward a stable chair, then stand with control.', '2026-08-11 21:02:31.358', 'Strength', '2026-08-11 21:02:31.358', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 'Walking', 'Steady low-impact cardio', 'Beginner', 'Full Body', 'Walk at a pace that allows comfortable conversation.', '2026-08-11 21:02:31.361', 'Cardio', '2026-08-11 21:02:31.361', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(133, 'Aerobic Dance', 'YouTube video reference for Aerobic Dance.', 'Beginner', NULL, 'Follow the linked video for Aerobic Dance technique and instructions.', '2026-08-20 14:42:55.000', 'Dance Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(134, 'Arnold Press', 'YouTube video reference for Arnold Press.', 'Intermediate', NULL, 'Follow the linked video for Arnold Press technique and instructions.', '2026-08-20 14:42:55.000', 'Shoulders', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(135, 'Badminton', 'YouTube video reference for Badminton.', 'Intermediate', NULL, 'Follow the linked video for Badminton technique and instructions.', '2026-08-20 14:42:55.000', 'Sports Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(136, 'Basketball', 'YouTube video reference for Basketball.', 'Intermediate', NULL, 'Follow the linked video for Basketball technique and instructions.', '2026-08-20 14:42:55.000', 'Sports Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(137, 'Bench Press', 'YouTube video reference for Bench Press.', 'Intermediate', NULL, 'Follow the linked video for Bench Press technique and instructions.', '2026-08-20 14:42:55.000', 'Chest', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(138, 'Cable Curl', 'YouTube video reference for Cable Curl.', 'Beginner', NULL, 'Follow the linked video for Cable Curl technique and instructions.', '2026-08-20 14:42:55.000', 'Biceps', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(139, 'Chest Fly', 'YouTube video reference for Chest Fly.', 'Beginner', NULL, 'Follow the linked video for Chest Fly technique and instructions.', '2026-08-20 14:42:55.000', 'Chest', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(140, 'Close-grip Push-up', 'YouTube video reference for Close-grip Push-up.', 'Intermediate', NULL, 'Follow the linked video for Close-grip Push-up technique and instructions.', '2026-08-20 14:42:55.000', 'Triceps', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(141, 'Cycling', 'YouTube video reference for Cycling.', 'Beginner', NULL, 'Follow the linked video for Cycling technique and instructions.', '2026-08-20 14:42:55.000', 'Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(142, 'Dance Fitness Workout', 'YouTube video reference for Dance Fitness Workout.', 'Beginner', NULL, 'Follow the linked video for Dance Fitness Workout technique and instructions.', '2026-08-20 14:42:55.000', 'Dance Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(143, 'Dumbbell Skull Crusher', 'YouTube video reference for Dumbbell Skull Crusher.', 'Intermediate', NULL, 'Follow the linked video for Dumbbell Skull Crusher technique and instructions.', '2026-08-20 14:42:55.000', 'Triceps', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(144, 'Elliptical', 'YouTube video reference for Elliptical.', 'Beginner', NULL, 'Follow the linked video for Elliptical technique and instructions.', '2026-08-20 14:42:55.000', 'Fitness Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(145, 'Football', 'YouTube video reference for Football.', 'Intermediate', NULL, 'Follow the linked video for Football technique and instructions.', '2026-08-20 14:42:55.000', 'Sports Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(146, 'Jogging', 'YouTube video reference for Jogging.', 'Beginner', NULL, 'Follow the linked video for Jogging technique and instructions.', '2026-08-20 14:42:55.000', 'Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(147, 'Jump Rope', 'YouTube video reference for Jump Rope.', 'Intermediate', NULL, 'Follow the linked video for Jump Rope technique and instructions.', '2026-08-20 14:42:55.000', 'Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(148, 'Kpop Hip Hop Dance', 'YouTube video reference for Kpop Hip Hop Dance.', 'Intermediate', NULL, 'Follow the linked video for Kpop Hip Hop Dance technique and instructions.', '2026-08-20 14:42:55.000', 'Dance Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(149, 'Lat Pulldown', 'YouTube video reference for Lat Pulldown.', 'Beginner', NULL, 'Follow the linked video for Lat Pulldown technique and instructions.', '2026-08-20 14:42:55.000', 'Back', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(150, 'Leg Extension', 'YouTube video reference for Leg Extension.', 'Beginner', NULL, 'Follow the linked video for Leg Extension technique and instructions.', '2026-08-20 14:42:55.000', 'Legs', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(151, 'Leg Press', 'YouTube video reference for Leg Press.', 'Beginner', NULL, 'Follow the linked video for Leg Press technique and instructions.', '2026-08-20 14:42:55.000', 'Legs', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(152, 'Preacher Curl', 'YouTube video reference for Preacher Curl.', 'Intermediate', NULL, 'Follow the linked video for Preacher Curl technique and instructions.', '2026-08-20 14:42:55.000', 'Biceps', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(153, 'Prone Leg Curl', 'YouTube video reference for Prone Leg Curl.', 'Beginner', NULL, 'Follow the linked video for Prone Leg Curl technique and instructions.', '2026-08-20 14:42:55.000', 'Legs', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(154, 'Rowing Machine', 'YouTube video reference for Rowing Machine.', 'Intermediate', NULL, 'Follow the linked video for Rowing Machine technique and instructions.', '2026-08-20 14:42:55.000', 'Fitness Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(155, 'Russian Twist', 'YouTube video reference for Russian Twist.', 'Intermediate', NULL, 'Follow the linked video for Russian Twist technique and instructions.', '2026-08-20 14:42:55.000', 'Core', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(156, 'Seated Row', 'YouTube video reference for Seated Row.', 'Beginner', NULL, 'Follow the linked video for Seated Row technique and instructions.', '2026-08-20 14:42:55.000', 'Back', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(157, 'Shoulder Press', 'YouTube video reference for Shoulder Press.', 'Beginner', NULL, 'Follow the linked video for Shoulder Press technique and instructions.', '2026-08-20 14:42:55.000', 'Shoulders', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(158, 'Shuffle Dance Workout', 'YouTube video reference for Shuffle Dance Workout.', 'Intermediate', NULL, 'Follow the linked video for Shuffle Dance Workout technique and instructions.', '2026-08-20 14:42:55.000', 'Dance Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(159, 'Stair Climber', 'YouTube video reference for Stair Climber.', 'Intermediate', NULL, 'Follow the linked video for Stair Climber technique and instructions.', '2026-08-20 14:42:55.000', 'Fitness Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(160, 'Stationary Bike', 'YouTube video reference for Stationary Bike.', 'Beginner', NULL, 'Follow the linked video for Stationary Bike technique and instructions.', '2026-08-20 14:42:55.000', 'Fitness Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(161, 'Swimming', 'YouTube video reference for Swimming.', 'Beginner', NULL, 'Follow the linked video for Swimming technique and instructions.', '2026-08-20 14:42:55.000', 'Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(162, 'Tennis', 'YouTube video reference for Tennis.', 'Intermediate', NULL, 'Follow the linked video for Tennis technique and instructions.', '2026-08-20 14:42:55.000', 'Sports Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(163, 'Treadmill', 'YouTube video reference for Treadmill.', 'Beginner', NULL, 'Follow the linked video for Treadmill technique and instructions.', '2026-08-20 14:42:55.000', 'Fitness Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(164, 'Tricep Pushdown', 'YouTube video reference for Tricep Pushdown.', 'Beginner', NULL, 'Follow the linked video for Tricep Pushdown technique and instructions.', '2026-08-20 14:42:55.000', 'Triceps', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(165, 'Upright Row', 'YouTube video reference for Upright Row.', 'Intermediate', NULL, 'Follow the linked video for Upright Row technique and instructions.', '2026-08-20 14:42:55.000', 'Shoulders', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(166, 'Volleyball', 'YouTube video reference for Volleyball.', 'Intermediate', NULL, 'Follow the linked video for Volleyball technique and instructions.', '2026-08-20 14:42:55.000', 'Sports Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(167, 'Zumba', 'YouTube video reference for Zumba.', 'Beginner', NULL, 'Follow the linked video for Zumba technique and instructions.', '2026-08-20 14:42:55.000', 'Dance Cardio', '2026-08-20 14:42:55.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `exercise1`
--

CREATE TABLE `exercise1` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetMuscle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `aiEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `counterType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primaryJoint` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poseLandmarks` json DEFAULT NULL,
  `downThreshold` double DEFAULT NULL,
  `upThreshold` double DEFAULT NULL,
  `targetAngle` double DEFAULT NULL,
  `formRules` json DEFAULT NULL,
  `feedbackRules` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exercise1`
--

INSERT INTO `exercise1` (`id`, `name`, `description`, `difficulty`, `targetMuscle`, `instructions`, `createdAt`, `category`, `updatedAt`, `aiEnabled`, `counterType`, `primaryJoint`, `poseLandmarks`, `downThreshold`, `upThreshold`, `targetAngle`, `formRules`, `feedbackRules`) VALUES
(1, 'Squat', 'ท่าสควอตสำหรับบริหารกล้ามเนื้อขาและสะโพก', 'Beginner', 'Quadriceps, Glutes', 'ยืนเท้ากว้างประมาณหัวไหล่ ย่อตัวลงโดยรักษาหลังให้ตรง แล้วดันตัวกลับขึ้น', '2026-08-10 17:09:17.632', 'Strength', '2026-08-11 21:02:31.277', 1, 'angle', 'knee', '{\"leftHip\": 23, \"leftKnee\": 25, \"rightHip\": 24, \"leftAnkle\": 27, \"rightKnee\": 26, \"rightAnkle\": 28}', 120, 160, 90, '[\"knee_alignment\", \"squat_depth\", \"torso_angle\"]', '{\"too_deep\": \"ระวังอย่าย่อลึกเกินไปครับ\", \"correct_depth\": \"ท่าถูกต้องครับ\", \"not_deep_enough\": \"ย่อลงอีกนิดครับ\"}'),
(2, 'Push Up', 'ท่าวิดพื้นสำหรับบริหารกล้ามเนื้อช่วงบน', 'Beginner', 'Chest, Shoulders, Triceps', 'วางมือให้กว้างประมาณหัวไหล่ รักษาลำตัวให้เป็นแนวตรง ลดตัวลงแล้วดันตัวกลับขึ้น', '2026-08-10 17:09:17.641', 'Strength', '2026-08-11 21:02:31.287', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Plank', 'ท่าแพลงก์สำหรับบริหารกล้ามเนื้อแกนกลางลำตัว', 'Beginner', 'Core', 'วางข้อศอกและปลายเท้าบนพื้น รักษาลำตัวให้ตรงและเกร็งหน้าท้อง', '2026-08-10 17:09:17.647', 'Core', '2026-08-11 21:02:31.294', 1, 'timer', 'hip', '{\"leftHip\": 23, \"rightHip\": 24, \"leftAnkle\": 27, \"rightAnkle\": 28, \"leftShoulder\": 11, \"rightShoulder\": 12}', NULL, NULL, 180, '[\"body_alignment\", \"hip_height\", \"head_position\"]', '{\"correct\": \"รักษาท่านี้ไว้ครับ\", \"hip_too_low\": \"ยกสะโพกขึ้นเล็กน้อยครับ\", \"hip_too_high\": \"ลดสะโพกลงเล็กน้อยครับ\"}'),
(4, 'Lunges', 'ท่าลันจ์สำหรับบริหารกล้ามเนื้อขา', 'Beginner', 'Quadriceps, Glutes', 'ก้าวขาข้างหนึ่งไปด้านหน้า ย่อตัวลง แล้วดันตัวกลับสู่ท่าเริ่มต้น', '2026-08-10 17:09:17.652', 'Strength', '2026-08-11 21:02:31.299', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Jumping Jack', 'ท่าคาร์ดิโอสำหรับเพิ่มอัตราการเต้นของหัวใจ', 'Beginner', 'Full Body', 'กระโดดพร้อมกางแขนและขาออก แล้วกลับสู่ท่าเริ่มต้น', '2026-08-10 17:09:17.655', 'Cardio', '2026-08-11 21:02:31.303', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Push-up', 'ท่าวิดพื้นพื้นฐานสำหรับพัฒนากล้ามเนื้อหน้าอก ไหล่ และแขนหลัง', 'Beginner', 'Chest, Triceps, Shoulders', 'วางมือกว้างกว่าหัวไหล่เล็กน้อย รักษาลำตัวให้ตรง ลดหน้าอกลงใกล้พื้น แล้วดันตัวกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 1, 'angle', 'elbow', '{\"leftElbow\": 13, \"leftWrist\": 15, \"rightElbow\": 14, \"rightWrist\": 16, \"leftShoulder\": 11, \"rightShoulder\": 12}', 100, 160, 90, '[\"elbow_angle\", \"body_alignment\", \"hip_position\"]', '{\"correct\": \"วิดพื้นได้ถูกต้องครับ\", \"hip_sag\": \"รักษาลำตัวให้ตรงครับ\", \"not_low_enough\": \"ลดตัวลงอีกนิดครับ\"}'),
(7, 'Wide Push-up', 'ท่าวิดพื้นที่วางมือกว้างกว่าปกติเพื่อเน้นกล้ามเนื้อหน้าอก', 'Beginner', 'Chest', 'วางมือกว้างกว่าหัวไหล่ รักษาลำตัวให้ตรง ลดหน้าอกลง แล้วดันตัวกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Diamond Push-up', 'ท่าวิดพื้นที่เน้นแขนหลังและหน้าอก', 'Intermediate', 'Triceps, Chest', 'วางมือให้หัวแม่มือและนิ้วชี้แตะกันเป็นรูปเพชร รักษาลำตัวตรง ลดตัวลงแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Incline Push-up', 'วิดพื้นโดยวางมือบนพื้นผิวที่สูง เหมาะสำหรับผู้เริ่มต้น', 'Beginner', 'Chest, Shoulders', 'วางมือบนพื้นผิวที่มั่นคงและสูงกว่าพื้น รักษาลำตัวตรง ลดหน้าอกเข้าหาพื้นผิว แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Decline Push-up', 'วิดพื้นโดยยกเท้าสูงเพื่อเพิ่มภาระที่หน้าอกส่วนบนและไหล่', 'Intermediate', 'Upper Chest, Shoulders, Triceps', 'วางเท้าบนพื้นผิวสูง วางมือบนพื้น รักษาลำตัวตรง ลดหน้าอกลงแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Chest Dip', 'ท่า Dip สำหรับพัฒนากล้ามเนื้อหน้าอกและแขนหลัง', 'Intermediate', 'Chest, Triceps, Shoulders', 'จับบาร์ให้มั่นคง โน้มตัวไปด้านหน้าเล็กน้อย ลดตัวลงอย่างควบคุม แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Chest', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Pull-up', 'ท่าดึงตัวขึ้นสำหรับพัฒนากล้ามเนื้อหลังและแขน', 'Advanced', 'Latissimus Dorsi, Biceps', 'จับบาร์ให้มั่นคง ดึงตัวขึ้นจนคางผ่านบาร์ แล้วลดตัวลงอย่างควบคุม', '2026-08-12 03:30:50.000', 'Back', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Chin-up', 'ท่าดึงตัวแบบหันฝ่ามือเข้าหาตัว', 'Intermediate', 'Latissimus Dorsi, Biceps', 'จับบาร์แบบหงายมือ ดึงตัวขึ้นโดยเกร็งหลังและแขน แล้วลดตัวกลับ', '2026-08-12 03:30:50.000', 'Back', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Inverted Row', 'ท่าดึงตัวในแนวนอนสำหรับพัฒนากล้ามเนื้อหลัง', 'Intermediate', 'Back, Biceps', 'จับบาร์ รักษาลำตัวเป็นเส้นตรง ดึงอกเข้าหาบาร์ แล้วลดตัวกลับ', '2026-08-12 03:30:50.000', 'Back', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Superman', 'Back extension control', 'Beginner', 'Back, Glutes', 'Lift opposite limbs gently without straining the neck.', '2026-08-12 03:30:50.000', 'Strength', '2026-08-11 21:02:31.351', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'Bird Dog', 'Controlled core stability', 'Beginner', 'Core, Back', 'Extend the opposite arm and leg while keeping hips stable.', '2026-08-12 03:30:50.000', 'Core', '2026-08-11 21:02:31.315', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Shoulder Tap', 'ท่าแตะไหล่เพื่อพัฒนาไหล่และความมั่นคงของ Core', 'Beginner', 'Shoulders, Core', 'เริ่มจากท่า Plank ใช้มือแตะไหล่ตรงข้ามสลับข้างโดยรักษาสะโพกให้นิ่ง', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Pike Push-up', 'ท่าวิดพื้นแบบยกสะโพกเพื่อเน้นหัวไหล่', 'Intermediate', 'Shoulders, Triceps', 'ยกสะโพกขึ้นเป็นรูปตัว V ลดศีรษะเข้าหาพื้นแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Lateral Raise', 'ท่ายกแขนออกด้านข้างสำหรับกล้ามเนื้อไหล่ด้านข้าง', 'Beginner', 'Lateral Deltoid', 'ยืนตัวตรง ยกแขนออกด้านข้างถึงระดับไหล่ แล้วลดลงอย่างควบคุม', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Front Raise', 'ท่ายกแขนด้านหน้าสำหรับหัวไหล่ด้านหน้า', 'Beginner', 'Front Deltoid', 'ยืนตัวตรง ยกแขนไปด้านหน้าถึงระดับไหล่ แล้วลดลงอย่างช้า ๆ', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Reverse Fly', 'ท่าบริหารหัวไหล่ด้านหลังและหลังส่วนบน', 'Intermediate', 'Rear Deltoid, Upper Back', 'โน้มตัวไปด้านหน้าเล็กน้อย กางแขนออกด้านข้าง แล้วลดกลับ', '2026-08-12 03:30:50.000', 'Shoulders', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Biceps Curl', 'ท่ายกน้ำหนักพื้นฐานสำหรับกล้ามเนื้อแขนหน้า', 'Beginner', 'Biceps', 'ยืนตัวตรง งอศอกยกน้ำหนักขึ้นโดยไม่แกว่งลำตัว แล้วลดลง', '2026-08-12 03:30:50.000', 'Biceps', '2026-08-12 03:30:50.000', 1, 'angle', 'elbow', '{\"leftElbow\": 13, \"leftWrist\": 15, \"rightElbow\": 14, \"rightWrist\": 16, \"leftShoulder\": 11, \"rightShoulder\": 12}', 150, 55, 45, '[\"elbow_angle\", \"upper_arm_position\", \"body_swing\"]', '{\"correct\": \"Curl ได้ดีครับ\", \"body_swing\": \"พยายามอย่าแกว่งตัวครับ\", \"not_full_curl\": \"งอแขนขึ้นอีกนิดครับ\"}'),
(23, 'Hammer Curl', 'ท่า Curl แบบจับน้ำหนักแนวตั้ง', 'Beginner', 'Biceps, Brachialis', 'จับน้ำหนักโดยหันฝ่ามือเข้าหากัน งอศอกยกขึ้นแล้วลดลง', '2026-08-12 03:30:50.000', 'Biceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'Concentration Curl', 'ท่า Curl ที่เน้นกล้ามเนื้อแขนหน้าแบบแยกข้าง', 'Intermediate', 'Biceps', 'นั่งและวางข้อศอกพาดด้านในต้นขา งอแขนขึ้นแล้วลดลง', '2026-08-12 03:30:50.000', 'Biceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'Triceps Dip', 'ท่า Dip สำหรับกล้ามเนื้อแขนหลัง', 'Intermediate', 'Triceps', 'จับขอบหรือบาร์ให้มั่นคง ลดตัวโดยงอศอก แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Triceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'Overhead Triceps Extension', 'ท่าเหยียดแขนเหนือศีรษะเพื่อพัฒนา Triceps', 'Beginner', 'Triceps', 'ถืออุปกรณ์เหนือศีรษะ งอศอกลดลงด้านหลังศีรษะ แล้วเหยียดกลับขึ้น', '2026-08-12 03:30:50.000', 'Triceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'Triceps Kickback', 'ท่าเหยียดแขนไปด้านหลังเพื่อพัฒนา Triceps', 'Beginner', 'Triceps', 'โน้มตัวไปด้านหน้า รักษาต้นแขนให้นิ่ง แล้วเหยียดแขนไปด้านหลัง', '2026-08-12 03:30:50.000', 'Triceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Forward Lunge', 'ท่า Lunge ก้าวไปด้านหน้าเพื่อพัฒนากล้ามเนื้อขา', 'Beginner', 'Quadriceps, Glutes', 'ก้าวขาหนึ่งข้างไปข้างหน้า งอเข่าลง แล้วดันกลับสู่ท่าเริ่ม', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'Reverse Lunge', 'ท่า Lunge ก้าวถอยหลังเพื่อพัฒนาขาและก้น', 'Beginner', 'Quadriceps, Glutes', 'ก้าวขาหนึ่งข้างไปด้านหลัง งอเข่าลง แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'Split Squat', 'ท่าสควอตแบบขาแยกสำหรับฝึกขาทีละข้าง', 'Intermediate', 'Quadriceps, Glutes', 'ยืนแยกขาหน้าและหลัง ลดตัวลงตรง ๆ แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'Bulgarian Split Squat', 'ท่าสควอตขาเดียวโดยใช้เท้าหลังพาดบนพื้นผิวสูง', 'Advanced', 'Quadriceps, Glutes', 'วางเท้าหลังบนพื้นผิวสูง ลดเข่าหน้าลง แล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Step-up', 'ก้าวขึ้นแท่นเพื่อฝึกกำลังขาและการทรงตัว', 'Beginner', 'Quadriceps, Glutes', 'ก้าวเท้าขึ้นแท่น ดันตัวขึ้น แล้วค่อยก้าวลง', '2026-08-12 03:30:50.000', 'Quadriceps', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Sumo Squat', 'Squat แบบยืนกว้างเพื่อเน้นก้นและต้นขาด้านใน', 'Beginner', 'Glutes, Adductors, Quadriceps', 'ยืนกว้างกว่าหัวไหล่ ปลายเท้าเปิดออก ย่อตัวลงแล้วดันกลับขึ้น', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'Romanian Deadlift', 'ท่าฝึก Hamstrings และ Glutes ด้วยการพับสะโพก', 'Intermediate', 'Hamstrings, Glutes', 'รักษาหลังตรง ดันสะโพกไปด้านหลัง ลดอุปกรณ์ตามแนวขา แล้วดันสะโพกกลับ', '2026-08-12 03:30:50.000', 'Hamstrings', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'Single-leg Romanian Deadlift', 'RDL ข้างเดียวเพื่อฝึก Hamstrings และการทรงตัว', 'Advanced', 'Hamstrings, Glutes, Core', 'ยืนข้างเดียว พับสะโพกและเหยียดขาอีกข้างไปด้านหลัง แล้วกลับสู่ท่าเริ่ม', '2026-08-12 03:30:50.000', 'Hamstrings', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'Good Morning', 'ท่าพับสะโพกสำหรับ Hamstrings และหลังส่วนล่าง', 'Intermediate', 'Hamstrings, Lower Back', 'ยืนตรง ดันสะโพกไปด้านหลัง โน้มลำตัวไปข้างหน้าโดยรักษาหลังเป็นกลาง แล้วกลับขึ้น', '2026-08-12 03:30:50.000', 'Hamstrings', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Glute Bridge', 'Hip extension for glutes', 'Beginner', 'Glutes, Hamstrings', 'Lie on your back, press through your heels and lift hips with control.', '2026-08-12 03:30:50.000', 'Strength', '2026-08-11 21:02:31.307', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'Hip Thrust', 'ท่ายกสะโพกที่เน้น Glutes', 'Intermediate', 'Glutes, Hamstrings', 'วางหลังส่วนบนบนม้านั่ง ดันสะโพกขึ้นจนลำตัวเกือบเป็นเส้นตรง แล้วลดลง', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'Donkey Kick', 'ท่าเตะขาขึ้นจากท่าคลานเพื่อพัฒนากล้ามเนื้อก้น', 'Beginner', 'Glutes', 'ตั้งคลาน งอเข่าแล้วยกขาข้างหนึ่งขึ้นด้านหลังโดยไม่บิดสะโพก', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'Fire Hydrant', 'ท่ายกขาด้านข้างเพื่อพัฒนา Glute Medius', 'Beginner', 'Glute Medius', 'ตั้งคลาน ยกเข่าด้านข้างโดยรักษาลำตัวให้นิ่ง แล้วลดกลับ', '2026-08-12 03:30:50.000', 'Glutes', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'Standing Calf Raise', 'ท่าเขย่งปลายเท้าสำหรับพัฒนากล้ามเนื้อน่อง', 'Beginner', 'Gastrocnemius', 'ยืนตรง ยกส้นเท้าขึ้นให้สูงที่สุด ค้างเล็กน้อย แล้วลดลง', '2026-08-12 03:30:50.000', 'Calves', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'Single-leg Calf Raise', 'ท่าเขย่งขาข้างเดียวเพื่อเพิ่มความหนัก', 'Intermediate', 'Gastrocnemius', 'ยืนขาข้างเดียว ยกส้นขึ้นลงอย่างควบคุม แล้วสลับข้าง', '2026-08-12 03:30:50.000', 'Calves', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'Seated Calf Raise', 'ท่าบริหารน่องในท่านั่ง', 'Beginner', 'Soleus', 'นั่งโดยวางเท้าบนพื้น ยกส้นขึ้นแล้วค่อยลดลง', '2026-08-12 03:30:50.000', 'Calves', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'Crunch', 'ท่า Crunch พื้นฐานสำหรับหน้าท้อง', 'Beginner', 'Rectus Abdominis', 'นอนหงาย งอเข่า ยกศีรษะและไหล่ขึ้นโดยเกร็งหน้าท้อง แล้วลดกลับ', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'Sit-up', 'ท่านั่งขึ้นสำหรับกล้ามเนื้อหน้าท้อง', 'Beginner', 'Rectus Abdominis, Hip Flexors', 'นอนหงาย งอเข่า ยกลำตัวขึ้นจนอยู่ในท่านั่ง แล้วกลับลง', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'Bicycle Crunch', 'Crunch แบบหมุนลำตัวสลับซ้ายขวา', 'Intermediate', 'Abs, Obliques', 'ยกไหล่ขึ้น หมุนข้อศอกเข้าหาเข่าฝั่งตรงข้ามสลับข้าง', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'Reverse Crunch', 'ท่ายกสะโพกเข้าหาหน้าอกเพื่อพัฒนาหน้าท้องส่วนล่าง', 'Intermediate', 'Lower Abs', 'นอนหงาย งอเข่า ดึงเข่าเข้าหาหน้าอกโดยยกสะโพกเล็กน้อย แล้วลดลง', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'Leg Raise', 'ท่ายกขาตรงเพื่อพัฒนาหน้าท้องส่วนล่าง', 'Intermediate', 'Lower Abs, Hip Flexors', 'นอนหงาย ยกขาตรงขึ้นแล้วลดลงอย่างควบคุม', '2026-08-12 03:30:50.000', 'Abs', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Side Plank', 'Lateral core strength', 'Intermediate', 'Core', 'Keep hips lifted and the body in a straight line.', '2026-08-12 03:30:50.000', 'Core', '2026-08-11 21:02:31.347', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'Mountain Climber', 'ท่า Cardio และ Core ที่เคลื่อนไหวต่อเนื่อง', 'Intermediate', 'Core, Shoulders, Legs', 'เริ่มจาก Plank ดึงเข่าเข้าหาหน้าอกสลับซ้ายขวาโดยรักษาหลังให้มั่นคง', '2026-08-12 03:30:50.000', 'Core', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'Dead Bug', 'Low-impact core control', 'Beginner', 'Core', 'Keep your lower back supported while lowering opposite arm and leg.', '2026-08-12 03:30:50.000', 'Core', '2026-08-11 21:02:31.319', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'Burpee', 'ท่า Full Body ที่ผสม Squat, Plank และ Jump', 'Intermediate', 'Full Body', 'ย่อตัวลง วางมือ เตะขาไปด้านหลัง กลับเข้าท่า Squat แล้วกระโดดขึ้น', '2026-08-12 03:30:50.000', 'Full Body', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'High Knees', 'Cardio coordination', 'Intermediate', 'Full Body', 'Lift knees with a controlled rhythm and land softly.', '2026-08-12 03:30:50.000', 'Cardio', '2026-08-11 21:02:31.337', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'Squat Jump', 'Squat ที่เพิ่มการกระโดดเพื่อพัฒนาพลังขาและ Cardio', 'Intermediate', 'Quadriceps, Glutes, Calves', 'ย่อตัวเหมือน Squat แล้วออกแรงกระโดดขึ้น จากนั้นลงอย่างนุ่มนวล', '2026-08-12 03:30:50.000', 'Cardio', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'Skater', 'ท่ากระโดดด้านข้างเพื่อพัฒนาขาและการทรงตัว', 'Intermediate', 'Glutes, Legs, Core', 'กระโดดจากขาหนึ่งไปอีกข้างพร้อมแกว่งแขนเพื่อรักษาสมดุล', '2026-08-12 03:30:50.000', 'Cardio', '2026-08-12 03:30:50.000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'Wall Push Up', 'Low-impact upper body push', 'Beginner', 'Chest, Shoulders, Triceps', 'Keep your body straight and press away from a wall.', '2026-08-11 21:02:31.311', 'Strength', '2026-08-11 21:02:31.311', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(60, 'Step Up', 'Low-impact leg and balance work', 'Beginner', 'Quadriceps, Glutes', 'Step onto a stable low platform and control the descent.', '2026-08-11 21:02:31.327', 'Strength', '2026-08-11 21:02:31.327', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 'Calf Raise', 'Lower-leg strength', 'Beginner', 'Calves', 'Rise onto your toes slowly and lower with control.', '2026-08-11 21:02:31.330', 'Strength', '2026-08-11 21:02:31.330', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'March In Place', 'Low-impact cardio', 'Beginner', 'Full Body', 'March at a comfortable pace and keep the torso tall.', '2026-08-11 21:02:31.334', 'Cardio', '2026-08-11 21:02:31.334', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'Arm Circles', 'Shoulder mobility warm-up', 'Beginner', 'Shoulders', 'Make small controlled circles in both directions.', '2026-08-11 21:02:31.341', 'Mobility', '2026-08-11 21:02:31.341', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'Cat Cow', 'Spinal mobility', 'Beginner', 'Back, Core', 'Move slowly between a rounded and extended spine.', '2026-08-11 21:02:31.344', 'Mobility', '2026-08-11 21:02:31.344', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'Bodyweight Row', 'Upper back pulling strength', 'Intermediate', 'Back, Biceps', 'Use a stable support and pull the chest toward the hands.', '2026-08-11 21:02:31.354', 'Strength', '2026-08-11 21:02:31.354', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'Chair Squat', 'Assisted squat for beginners', 'Beginner', 'Quadriceps, Glutes', 'Sit back toward a stable chair, then stand with control.', '2026-08-11 21:02:31.358', 'Strength', '2026-08-11 21:02:31.358', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 'Walking', 'Steady low-impact cardio', 'Beginner', 'Full Body', 'Walk at a pace that allows comfortable conversation.', '2026-08-11 21:02:31.361', 'Cardio', '2026-08-11 21:02:31.361', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `exercisevideo`
--

CREATE TABLE `exercisevideo` (
  `id` int NOT NULL,
  `exerciseId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'youtube',
  `description` text COLLATE utf8mb4_unicode_ci,
  `goal` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `difficulty` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intensity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `equipment` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `durationSeconds` int DEFAULT NULL,
  `priority` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exercisevideo`
--

INSERT INTO `exercisevideo` (`id`, `exerciseId`, `title`, `url`, `videoId`, `platform`, `description`, `goal`, `difficulty`, `intensity`, `equipment`, `language`, `durationSeconds`, `priority`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Squat - วิดีโอสอน', 'https://youtu.be/fKrzVBsUIv4', 'fKrzVBsUIv4', 'youtube', 'วิดีโอสาธิตท่า Squat', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(2, 4, 'Lunges - วิดีโอสอน', 'https://youtu.be/ODhwd7BnL0w', 'ODhwd7BnL0w', 'youtube', 'วิดีโอสาธิตท่า Lunges', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(3, 151, 'Leg Press - วิดีโอสอน', 'https://youtu.be/kTM85YKV7ls', 'kTM85YKV7ls', 'youtube', 'วิดีโอสาธิตท่า Leg Press', 'muscle-gain', 'beginner', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(4, 150, 'Leg Extension - วิดีโอสอน', 'https://youtu.be/sYtdnkX0Awg', 'sYtdnkX0Awg', 'youtube', 'วิดีโอสาธิตท่า Leg Extension', 'muscle-gain', 'beginner', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(5, 153, 'Prone Leg Curl - วิดีโอสอน', 'https://youtu.be/WzS7KK4eI0g', 'WzS7KK4eI0g', 'youtube', 'วิดีโอสาธิตท่า Prone Leg Curl', 'muscle-gain', 'beginner', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(6, 38, 'Hip Thrust - วิดีโอสอน', 'https://youtu.be/s1gUMRjpgqM', 's1gUMRjpgqM', 'youtube', 'วิดีโอสาธิตท่า Hip Thrust', 'muscle-gain', 'beginner', 'moderate', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(7, 37, 'Glute Bridge - วิดีโอสอน', 'https://youtu.be/tBSaB_cnVeE', 'tBSaB_cnVeE', 'youtube', 'วิดีโอสาธิตท่า Glute Bridge', 'general-fitness', 'beginner', 'low', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(8, 39, 'Donkey Kick - วิดีโอสอน', 'https://youtu.be/9y_tk7i4tdM', '9y_tk7i4tdM', 'youtube', 'วิดีโอสาธิตท่า Donkey Kick', 'glute-growth', 'beginner', 'low', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(9, 40, 'Fire Hydrant - วิดีโอสอน', 'https://youtu.be/PY259DPls_w', 'PY259DPls_w', 'youtube', 'วิดีโอสาธิตท่า Fire Hydrant', 'glute-growth', 'beginner', 'low', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(10, 31, 'Bulgarian Split Squat - วิดีโอสอน', 'https://youtu.be/l2q-K4HMvAA', 'l2q-K4HMvAA', 'youtube', 'วิดีโอสาธิตท่า Bulgarian Split Squat', 'muscle-gain', 'intermediate', 'high', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(11, 6, 'Push-up - วิดีโอสอน', 'https://youtu.be/s3z0w-82Y00', 's3z0w-82Y00', 'youtube', 'วิดีโอสาธิตท่า Push-up', 'strength', 'beginner', 'moderate', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(12, 137, 'Bench Press - วิดีโอสอน', 'https://youtu.be/AJFf4ATImPA', 'AJFf4ATImPA', 'youtube', 'วิดีโอสาธิตท่า Bench Press', 'muscle-gain', 'intermediate', 'high', 'barbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(13, 139, 'Chest Fly - วิดีโอสอน', 'https://youtu.be/eozdVDA78K0', 'eozdVDA78K0', 'youtube', 'วิดีโอสาธิตท่า Chest Fly', 'muscle-gain', 'beginner', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(14, 9, 'Incline Push-up - วิดีโอสอน', 'https://youtu.be/cfns5VDVVvk', 'cfns5VDVVvk', 'youtube', 'วิดีโอสาธิตท่า Incline Push-up', 'strength', 'beginner', 'low', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(15, 10, 'Decline Push-up - วิดีโอสอน', 'https://youtu.be/KhpYYEyfF1c', 'KhpYYEyfF1c', 'youtube', 'วิดีโอสาธิตท่า Decline Push-up', 'strength', 'intermediate', 'high', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(16, 12, 'Pull-up - วิดีโอสอน', 'https://youtu.be/b-30kO6EmSY', 'b-30kO6EmSY', 'youtube', 'วิดีโอสาธิตท่า Pull-up', 'strength', 'intermediate', 'high', 'pull-up bar', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(17, 149, 'Lat Pulldown - วิดีโอสอน', 'https://youtu.be/4VW-TRijm2E', '4VW-TRijm2E', 'youtube', 'วิดีโอสาธิตท่า Lat Pulldown', 'muscle-gain', 'beginner', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(18, 156, 'Seated Row - วิดีโอสอน', 'https://youtu.be/FIuZtaO4Ac4', 'FIuZtaO4Ac4', 'youtube', 'วิดีโอสาธิตท่า Seated Row', 'muscle-gain', 'beginner', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(19, 15, 'Supermans - วิดีโอสอน', 'https://youtu.be/vHlVow3pteg', 'vHlVow3pteg', 'youtube', 'วิดีโอสาธิตท่า Superman', 'general-fitness', 'beginner', 'low', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(20, 21, 'Reverse Fly - วิดีโอสอน', 'https://youtu.be/FbUOG5qUR9s', 'FbUOG5qUR9s', 'youtube', 'วิดีโอสาธิตท่า Reverse Fly', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(21, 157, 'Shoulder Press - วิดีโอสอน', 'https://youtu.be/U80q6-3MHnQ', 'U80q6-3MHnQ', 'youtube', 'วิดีโอสาธิตท่า Shoulder Press', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(22, 19, 'Lateral Raise - วิดีโอสอน', 'https://youtu.be/1AtgrAhbu-c', '1AtgrAhbu-c', 'youtube', 'วิดีโอสาธิตท่า Lateral Raise', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(23, 20, 'Front Raise - วิดีโอสอน', 'https://youtu.be/xPGIV19x83M', 'xPGIV19x83M', 'youtube', 'วิดีโอสาธิตท่า Front Raise', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(24, 134, 'Arnold Press - วิดีโอสอน', 'https://youtu.be/k75HV0SGvRk', 'k75HV0SGvRk', 'youtube', 'วิดีโอสาธิตท่า Arnold Press', 'muscle-gain', 'intermediate', 'high', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(25, 165, 'Upright Row - วิดีโอสอน', 'https://youtu.be/vLsSYejjkGc', 'vLsSYejjkGc', 'youtube', 'วิดีโอสาธิตท่า Upright Row', 'muscle-gain', 'intermediate', 'moderate', 'barbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(26, 22, 'Bicep Curl - วิดีโอสอน', 'https://youtu.be/TFUznuXdPVo', 'TFUznuXdPVo', 'youtube', 'วิดีโอสาธิตท่า Bicep Curl', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(27, 23, 'Hammer Curl - วิดีโอสอน', 'https://youtu.be/I0WmTzb7viM', 'I0WmTzb7viM', 'youtube', 'วิดีโอสาธิตท่า Hammer Curl', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(28, 24, 'Concentration Curl - วิดีโอสอน', 'https://youtu.be/T-ZBZo6_6hk', 'T-ZBZo6_6hk', 'youtube', 'วิดีโอสาธิตท่า Concentration Curl', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(29, 152, 'Preacher Curl - วิดีโอสอน', 'https://youtu.be/g_YT86IH6hw', 'g_YT86IH6hw', 'youtube', 'วิดีโอสาธิตท่า Preacher Curl', 'muscle-gain', 'intermediate', 'moderate', 'machine', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(30, 138, 'Cable Curl - วิดีโอสอน', 'https://youtu.be/0Pg5w3DUnwg', '0Pg5w3DUnwg', 'youtube', 'วิดีโอสาธิตท่า Cable Curl', 'muscle-gain', 'beginner', 'moderate', 'cable', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(31, 25, 'Tricep Dip - วิดีโอสอน', 'https://youtu.be/ylee-wb_a0U', 'ylee-wb_a0U', 'youtube', 'วิดีโอสาธิตท่า Tricep Dip', 'strength', 'intermediate', 'high', 'bench', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(32, 164, 'Tricep Pushdown - วิดีโอสอน', 'https://youtu.be/vfpQSsiVARM', 'vfpQSsiVARM', 'youtube', 'วิดีโอสาธิตท่า Tricep Pushdown', 'muscle-gain', 'beginner', 'moderate', 'cable', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(33, 26, 'Overhead Tricep Extension - วิดีโอสอน', 'https://youtu.be/IJ6J7EKprsc', 'IJ6J7EKprsc', 'youtube', 'วิดีโอสาธิตท่า Overhead Tricep Extension', 'muscle-gain', 'beginner', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(34, 140, 'Close-grip Push-up - วิดีโอสอน', 'https://youtu.be/G2mlaEfpEIM', 'G2mlaEfpEIM', 'youtube', 'วิดีโอสาธิตท่า Close-grip Push-up', 'strength', 'intermediate', 'high', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(35, 143, 'Dumbbell Skull Crusher - วิดีโอสอน', 'https://youtu.be/7ieru2ySjJ4', '7ieru2ySjJ4', 'youtube', 'วิดีโอสาธิตท่า Dumbbell Skull Crusher', 'muscle-gain', 'intermediate', 'moderate', 'dumbbell', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(36, 45, 'Sit-up - วิดีโอสอน', 'https://youtu.be/jDwoBqPH0jk', 'jDwoBqPH0jk', 'youtube', 'วิดีโอสาธิตท่า Sit-up', 'core', 'beginner', 'moderate', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(37, 3, 'Plank - วิดีโอสอน', 'https://youtu.be/jDZsXIkwWQ4', 'jDZsXIkwWQ4', 'youtube', 'วิดีโอสาธิตท่า Plank', 'core', 'beginner', 'low', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(38, 155, 'Russian Twist - วิดีโอสอน', 'https://youtu.be/paYvkM4DcHE', 'paYvkM4DcHE', 'youtube', 'วิดีโอสาธิตท่า Russian Twist', 'core', 'intermediate', 'moderate', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(39, 46, 'Bicycle Crunch - วิดีโอสอน', 'https://youtu.be/dZ_shAbA1Vw', 'dZ_shAbA1Vw', 'youtube', 'วิดีโอสาธิตท่า Bicycle Crunch', 'core', 'intermediate', 'moderate', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(40, 48, 'Leg Raise - วิดีโอสอน', 'https://youtu.be/I4eRJ3Z_xTA', 'I4eRJ3Z_xTA', 'youtube', 'วิดีโอสาธิตท่า Leg Raise', 'core', 'beginner', 'moderate', 'none', 'th', NULL, 90, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(41, 67, 'เดินเร็ว - วิดีโอสอน', 'https://youtu.be/SuaEzulbalA', 'SuaEzulbalA', 'youtube', 'วิดีโอแนะนำการเดินเร็ว', 'weight-loss', 'beginner', 'low', 'none', 'th', NULL, 100, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(42, 146, 'วิ่ง / Jogging - วิดีโอสอน', 'https://youtu.be/0c5QU_-QErg', '0c5QU_-QErg', 'youtube', 'วิดีโอแนะนำการวิ่งจ็อกกิ้ง', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(43, 141, 'ปั่นจักรยาน - วิดีโอสอน', 'https://youtu.be/4qXe3UHZYO0', '4qXe3UHZYO0', 'youtube', 'วิดีโอแนะนำการปั่นจักรยาน', 'weight-loss', 'beginner', 'moderate', 'bicycle', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(44, 161, 'ว่ายน้ำ - วิดีโอสอน', 'https://youtu.be/8JUoWTLLXhc', '8JUoWTLLXhc', 'youtube', 'วิดีโอแนะนำการว่ายน้ำ', 'weight-loss', 'beginner', 'moderate', 'pool', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(45, 147, 'กระโดดเชือก - วิดีโอสอน', 'https://youtu.be/GxMp3n4vVnQ', 'GxMp3n4vVnQ', 'youtube', 'วิดีโอแนะนำการกระโดดเชือก', 'weight-loss', 'intermediate', 'high', 'jump-rope', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(46, 163, 'ลู่วิ่ง - วิดีโอสอน', 'https://youtu.be/TIIZIY4j5Zs', 'TIIZIY4j5Zs', 'youtube', 'วิดีโอแนะนำการใช้ลู่วิ่ง', 'weight-loss', 'beginner', 'moderate', 'treadmill', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(47, 160, 'จักรยานอยู่กับที่ - วิดีโอสอน', 'https://youtu.be/DfHa3A35ZqI', 'DfHa3A35ZqI', 'youtube', 'วิดีโอแนะนำการใช้จักรยานอยู่กับที่', 'weight-loss', 'beginner', 'moderate', 'stationary-bike', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(48, 144, 'Elliptical - วิดีโอสอน', 'https://youtu.be/FPvBMsd6XOQ', 'FPvBMsd6XOQ', 'youtube', 'วิดีโอแนะนำการใช้เครื่อง Elliptical', 'weight-loss', 'beginner', 'moderate', 'elliptical', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(49, 159, 'Stair Climber / Stepper - วิดีโอสอน', 'https://youtu.be/QE_fOzbUVVA', 'QE_fOzbUVVA', 'youtube', 'วิดีโอแนะนำการใช้ Stair Climber', 'weight-loss', 'intermediate', 'high', 'stair-climber', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(50, 154, 'Rowing Machine - วิดีโอสอน', 'https://youtu.be/1hjNxMLJ4vk', '1hjNxMLJ4vk', 'youtube', 'วิดีโอแนะนำการใช้เครื่อง Rowing', 'weight-loss', 'intermediate', 'moderate', 'rowing-machine', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(51, 133, 'เต้นแอโรบิก - วิดีโอสอน', 'https://youtu.be/_eXFNl7LM4M', '_eXFNl7LM4M', 'youtube', 'วิดีโอเต้นแอโรบิก', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(52, 167, 'Zumba - Playlist', 'https://youtube.com/playlist?list=PLSBnWVM5fIE8G1J253-EGUo0zNDQNIHEu', NULL, 'youtube', 'Playlist สำหรับ Zumba', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(53, 148, 'K-pop / Hip-hop Dance Workout', 'https://youtu.be/a5IPbBwbO-o', 'a5IPbBwbO-o', 'youtube', 'วิดีโอเต้น K-pop และ Hip-hop', 'weight-loss', 'intermediate', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(54, 158, 'Shuffle Dance Workout', 'https://youtu.be/Qg-nuTe4YuI', 'Qg-nuTe4YuI', 'youtube', 'วิดีโอ Shuffle Dance Workout', 'weight-loss', 'intermediate', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(55, 142, 'Dance Fitness Workout', 'https://youtu.be/zmxPXaeEXBU', 'zmxPXaeEXBU', 'youtube', 'วิดีโอ Dance Fitness', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(56, 52, 'Burpees - วิดีโอสอน', 'https://youtu.be/lgrOW8FYBx4', 'lgrOW8FYBx4', 'youtube', 'วิดีโอสาธิตท่า Burpees', 'weight-loss', 'advanced', 'high', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(57, 54, 'Jump Squat - วิดีโอสอน', 'https://youtu.be/uuEi4_f0tAk', 'uuEi4_f0tAk', 'youtube', 'วิดีโอสาธิตท่า Jump Squat', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(58, 50, 'Mountain Climbers - วิดีโอสอน', 'https://youtu.be/hiUddCA-3n4', 'hiUddCA-3n4', 'youtube', 'วิดีโอสาธิตท่า Mountain Climbers', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(59, 53, 'High Knees - วิดีโอสอน', 'https://youtu.be/gnkUDtTpKVA', 'gnkUDtTpKVA', 'youtube', 'วิดีโอสาธิตท่า High Knees', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(60, 5, 'Jumping Jack - วิดีโอสอน', 'https://youtu.be/ski_HWFQUNI', 'ski_HWFQUNI', 'youtube', 'วิดีโอสาธิตท่า Jumping Jack', 'weight-loss', 'beginner', 'moderate', 'none', 'th', NULL, 80, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(61, 145, 'ฟุตบอล - Cardio Workout', 'https://youtu.be/tv1YcYEYKc4', 'tv1YcYEYKc4', 'youtube', 'วิดีโอออกกำลังกายจากฟุตบอล', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 70, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(62, 136, 'บาสเกตบอล - Cardio Workout', 'https://youtu.be/vk-RcMFE8qI', 'vk-RcMFE8qI', 'youtube', 'วิดีโอออกกำลังกายจากบาสเกตบอล', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 70, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(63, 135, 'แบดมินตัน - Cardio Workout', 'https://youtu.be/Wsu74P16Wk4', 'Wsu74P16Wk4', 'youtube', 'วิดีโอออกกำลังกายจากแบดมินตัน', 'weight-loss', 'intermediate', 'moderate', 'none', 'th', NULL, 70, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(64, 162, 'เทนนิส - Cardio Workout', 'https://youtu.be/y6qW6wepnFk', 'y6qW6wepnFk', 'youtube', 'วิดีโอออกกำลังกายจากเทนนิส', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 70, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000'),
(65, 166, 'วอลเลย์บอล - Cardio Workout', 'https://youtu.be/K4ovHd6n72M', 'K4ovHd6n72M', 'youtube', 'วิดีโอออกกำลังกายจากวอลเลย์บอล', 'weight-loss', 'intermediate', 'high', 'none', 'th', NULL, 70, 1, '2026-08-20 14:42:55.000', '2026-08-20 14:42:55.000');

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `age` int NOT NULL,
  `height` double NOT NULL,
  `weight` double NOT NULL,
  `bmi` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `bmiStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trainingGoal` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fitnessLevel` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sessionsPerWeek` int DEFAULT NULL,
  `preferredDuration` int DEFAULT NULL,
  `equipment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`id`, `userId`, `age`, `height`, `weight`, `bmi`, `createdAt`, `updatedAt`, `bmiStatus`, `gender`, `trainingGoal`, `fitnessLevel`, `sessionsPerWeek`, `preferredDuration`, `equipment`) VALUES
(12, 13, 21, 174, 76, 25.1, '2026-08-25 00:51:49.296', '2026-08-25 00:51:49.296', 'Overweight', 'male', NULL, NULL, NULL, NULL, NULL),
(13, 14, 22, 174, 76, 25.1, '2026-09-03 07:26:13.331', '2026-09-03 07:26:13.331', 'Overweight', 'male', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `passwordHash`, `createdAt`, `updatedAt`, `emailVerified`) VALUES
(13, 'Rapeephat Luekhamhan', 'rphiphathnl@gmail.com', '$2b$12$uNrjFc9catpTfRCe/azIFOV1Do.hRTUK2eUHCX9jbjc.L0tkASvhq', '2026-08-25 00:51:40.038', '2026-08-25 00:51:49.306', 0),
(14, 'rr', 'tvhunter37@gmail.com', '$2b$12$.qdPfCZLuDezSr80zQqkd.RiUGi6YZvGDZXRQ0i/wx48PWRlDVV6S', '2026-09-03 07:26:03.813', '2026-09-03 07:26:13.343', 0);

-- --------------------------------------------------------

--
-- Table structure for table `workoutsession`
--

CREATE TABLE `workoutsession` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `exerciseId` int NOT NULL,
  `repetitions` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `score` double DEFAULT NULL,
  `startedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('04e22a2c-e487-4032-9e44-a5a18373375c', '373d16902cd868092e7fba02bcc717efc446ece10778e19c62ca78b96143eb01', '2026-08-11 19:55:08.248', '20260812030000_add_email_verification', NULL, NULL, '2026-08-11 19:55:08.184', 1),
('0f57f2e8-c8af-4473-b6a6-c173348b24e2', '497f4ce6237fd3c0390e704d1bc8ab1b6b7b0c0fe6605d80c5e2a1130ab3d511', '2026-08-10 17:11:33.491', '20260810171133_add_exercise_workout', NULL, NULL, '2026-08-10 17:11:33.438', 1),
('19bbfdde-97ff-4bb5-abf9-26c49baad5d7', '150a61e2be4dbdc59f08d9db9982c90a643aa5d5ca394956d73e5d827e224aac', '2026-08-11 19:45:31.265', '20260812023000_add_profile_gender', NULL, NULL, '2026-08-11 19:45:31.159', 1),
('21c74cf1-1a9a-4b37-9800-771b255911ae', 'e3cf125da9dce9e422f7403809de07778e12c7d0ebdb7fb5e2fe2ee54a6eb46b', '2026-08-09 18:48:24.220', '20260809184823_init', NULL, NULL, '2026-08-09 18:48:24.000', 1),
('339e2288-c6f8-4c89-948b-7317eff85d37', '8683ad950158adb03e254fc50e99bcd8b5c8d2e64ce3c85a7279c0de0d43659d', '2026-08-10 17:44:00.286', '20260810174400_add_chat', NULL, NULL, '2026-08-10 17:44:00.273', 1),
('41a16697-2dea-4246-8492-1af28400bc34', 'f89d24c3d1794954e87d7997bf45744ef32365720765575737d4ecf9ef23bdee', '2026-08-10 17:01:36.387', '20260810170136_add_exercise_workout', NULL, NULL, '2026-08-10 17:01:36.309', 1),
('765d31f6-cc70-4936-8f3e-0f465828ce3b', 'cae9f23fa99b60644892c39e1f96f165b64afcd27d47bb5312151ac938a2f19d', '2026-08-10 16:49:51.323', '20260810164951_add_profile', NULL, NULL, '2026-08-10 16:49:51.291', 1),
('7c6d73d3-00b5-4772-88a2-01beff51c7f4', 'da176b0c6eff1b02f09de642bb44a54fb407de0f55aeb11aae9e37c87af5968b', '2026-08-10 17:05:58.519', '20260810170558_exercise_name_unique', NULL, NULL, '2026-08-10 17:05:58.487', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chatmessage`
--
ALTER TABLE `chatmessage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ChatMessage_sessionId_fkey` (`sessionId`);

--
-- Indexes for table `chatsession`
--
ALTER TABLE `chatsession`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ChatSession_userId_fkey` (`userId`);

--
-- Indexes for table `emailverificationtoken`
--
ALTER TABLE `emailverificationtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `EmailVerificationToken_token_key` (`token`),
  ADD KEY `EmailVerificationToken_userId_idx` (`userId`);

--
-- Indexes for table `exercise`
--
ALTER TABLE `exercise`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Exercise_name_key` (`name`);

--
-- Indexes for table `exercise1`
--
ALTER TABLE `exercise1`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Exercise_name_key` (`name`);

--
-- Indexes for table `exercisevideo`
--
ALTER TABLE `exercisevideo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ExerciseVideo_url_key` (`url`),
  ADD KEY `ExerciseVideo_exerciseId_idx` (`exerciseId`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Profile_userId_key` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `workoutsession`
--
ALTER TABLE `workoutsession`
  ADD PRIMARY KEY (`id`),
  ADD KEY `WorkoutSession_userId_fkey` (`userId`),
  ADD KEY `WorkoutSession_exerciseId_fkey` (`exerciseId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chatmessage`
--
ALTER TABLE `chatmessage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `chatsession`
--
ALTER TABLE `chatsession`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `emailverificationtoken`
--
ALTER TABLE `emailverificationtoken`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `exercise`
--
ALTER TABLE `exercise`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=168;

--
-- AUTO_INCREMENT for table `exercise1`
--
ALTER TABLE `exercise1`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `exercisevideo`
--
ALTER TABLE `exercisevideo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `workoutsession`
--
ALTER TABLE `workoutsession`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chatmessage`
--
ALTER TABLE `chatmessage`
  ADD CONSTRAINT `ChatMessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `chatsession` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chatsession`
--
ALTER TABLE `chatsession`
  ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `emailverificationtoken`
--
ALTER TABLE `emailverificationtoken`
  ADD CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exercisevideo`
--
ALTER TABLE `exercisevideo`
  ADD CONSTRAINT `ExerciseVideo_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `exercise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `workoutsession`
--
ALTER TABLE `workoutsession`
  ADD CONSTRAINT `WorkoutSession_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `exercise1` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `WorkoutSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
