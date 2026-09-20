export function calculateBMRAndTDEE(profile) {
  if (!profile || !profile.weight || !profile.height || !profile.age) {
    return { bmr: 1600, tdee: 2100 };
  }

  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  const gender = String(profile.gender || "").toLowerCase();

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male" || gender === "ชาย") {
    bmr += 5;
  } else if (gender === "female" || gender === "หญิง") {
    bmr -= 161;
  } else {
    bmr -= 78;
  }

  // TDEE multiplier based on sessions per week
  let multiplier = 1.375;
  const sessions = Number(profile.sessionsPerWeek) || 3;
  if (sessions <= 1) multiplier = 1.2;
  else if (sessions <= 3) multiplier = 1.375;
  else if (sessions <= 5) multiplier = 1.55;
  else multiplier = 1.725;

  const tdee = Math.round(bmr * multiplier);
  return { bmr: Math.round(bmr), tdee };
}

export function getMealLabel(type) {
  switch (String(type || "").toUpperCase()) {
    case "BREAKFAST":
      return "มื้อเช้า (Breakfast)";
    case "LUNCH":
      return "มื้อกลางวัน (Lunch)";
    case "DINNER":
      return "มื้อเย็น (Dinner)";
    case "SNACK":
      return "ของว่าง / อื่นๆ (Snack)";
    default:
      return "มื้ออาหาร";
  }
}

export function getMealIcon(type) {
  switch (String(type || "").toUpperCase()) {
    case "BREAKFAST":
      return "🍳";
    case "LUNCH":
      return "🍛";
    case "DINNER":
      return "🥗";
    case "SNACK":
      return "🍎";
    default:
      return "🍽️";
  }
}