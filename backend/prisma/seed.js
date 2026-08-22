const prisma = require("../src/services/prisma");

async function main() {
  const exercises = [
    {
      name: "Squat",
      description: "ท่าสควอตสำหรับบริหารกล้ามเนื้อขาและสะโพก",
      category: "Strength",
      difficulty: "Beginner",
      targetMuscle: "Quadriceps, Glutes",
      instructions:
        "ยืนเท้ากว้างประมาณหัวไหล่ ย่อตัวลงโดยรักษาหลังให้ตรง แล้วดันตัวกลับขึ้น",
    },
    {
      name: "Push Up",
      description: "ท่าวิดพื้นสำหรับบริหารกล้ามเนื้อช่วงบน",
      category: "Strength",
      difficulty: "Beginner",
      targetMuscle: "Chest, Shoulders, Triceps",
      instructions:
        "วางมือให้กว้างประมาณหัวไหล่ รักษาลำตัวให้เป็นแนวตรง ลดตัวลงแล้วดันตัวกลับขึ้น",
    },
    {
      name: "Plank",
      description: "ท่าแพลงก์สำหรับบริหารกล้ามเนื้อแกนกลางลำตัว",
      category: "Core",
      difficulty: "Beginner",
      targetMuscle: "Core",
      instructions:
        "วางข้อศอกและปลายเท้าบนพื้น รักษาลำตัวให้ตรงและเกร็งหน้าท้อง",
    },
    {
      name: "Lunges",
      description: "ท่าลันจ์สำหรับบริหารกล้ามเนื้อขา",
      category: "Strength",
      difficulty: "Beginner",
      targetMuscle: "Quadriceps, Glutes",
      instructions:
        "ก้าวขาข้างหนึ่งไปด้านหน้า ย่อตัวลง แล้วดันตัวกลับสู่ท่าเริ่มต้น",
    },
    {
      name: "Jumping Jack",
      description: "ท่าคาร์ดิโอสำหรับเพิ่มอัตราการเต้นของหัวใจ",
      category: "Cardio",
      difficulty: "Beginner",
      targetMuscle: "Full Body",
      instructions:
        "กระโดดพร้อมกางแขนและขาออก แล้วกลับสู่ท่าเริ่มต้น",
    },
    { name: "Glute Bridge", description: "Hip extension for glutes", category: "Strength", difficulty: "Beginner", targetMuscle: "Glutes, Hamstrings", instructions: "Lie on your back, press through your heels and lift hips with control." },
    { name: "Wall Push Up", description: "Low-impact upper body push", category: "Strength", difficulty: "Beginner", targetMuscle: "Chest, Shoulders, Triceps", instructions: "Keep your body straight and press away from a wall." },
    { name: "Bird Dog", description: "Controlled core stability", category: "Core", difficulty: "Beginner", targetMuscle: "Core, Back", instructions: "Extend the opposite arm and leg while keeping hips stable." },
    { name: "Dead Bug", description: "Low-impact core control", category: "Core", difficulty: "Beginner", targetMuscle: "Core", instructions: "Keep your lower back supported while lowering opposite arm and leg." },
    { name: "Step Up", description: "Low-impact leg and balance work", category: "Strength", difficulty: "Beginner", targetMuscle: "Quadriceps, Glutes", instructions: "Step onto a stable low platform and control the descent." },
    { name: "Calf Raise", description: "Lower-leg strength", category: "Strength", difficulty: "Beginner", targetMuscle: "Calves", instructions: "Rise onto your toes slowly and lower with control." },
    { name: "March In Place", description: "Low-impact cardio", category: "Cardio", difficulty: "Beginner", targetMuscle: "Full Body", instructions: "March at a comfortable pace and keep the torso tall." },
    { name: "High Knees", description: "Cardio coordination", category: "Cardio", difficulty: "Intermediate", targetMuscle: "Full Body", instructions: "Lift knees with a controlled rhythm and land softly." },
    { name: "Arm Circles", description: "Shoulder mobility warm-up", category: "Mobility", difficulty: "Beginner", targetMuscle: "Shoulders", instructions: "Make small controlled circles in both directions." },
    { name: "Cat Cow", description: "Spinal mobility", category: "Mobility", difficulty: "Beginner", targetMuscle: "Back, Core", instructions: "Move slowly between a rounded and extended spine." },
    { name: "Side Plank", description: "Lateral core strength", category: "Core", difficulty: "Intermediate", targetMuscle: "Core", instructions: "Keep hips lifted and the body in a straight line." },
    { name: "Superman", description: "Back extension control", category: "Strength", difficulty: "Beginner", targetMuscle: "Back, Glutes", instructions: "Lift opposite limbs gently without straining the neck." },
    { name: "Bodyweight Row", description: "Upper back pulling strength", category: "Strength", difficulty: "Intermediate", targetMuscle: "Back, Biceps", instructions: "Use a stable support and pull the chest toward the hands." },
    { name: "Chair Squat", description: "Assisted squat for beginners", category: "Strength", difficulty: "Beginner", targetMuscle: "Quadriceps, Glutes", instructions: "Sit back toward a stable chair, then stand with control." },
    { name: "Walking", description: "Steady low-impact cardio", category: "Cardio", difficulty: "Beginner", targetMuscle: "Full Body", instructions: "Walk at a pace that allows comfortable conversation." },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: {
        name: exercise.name,
      },
      update: exercise,
      create: exercise,
    });
  }

  console.log("Exercise seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
