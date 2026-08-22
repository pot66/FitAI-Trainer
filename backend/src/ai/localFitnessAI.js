const fs = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(__dirname, '../../knowledge/fitness_knowledge.json');
let knowledge = null;

function getKnowledge() {
  if (!knowledge) knowledge = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, 'utf8'));
  return knowledge;
}

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[-_/.,!?()[\]{}:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text) {
  const t = normalize(text);
  const words = t.match(/[a-z0-9]+|[ก-๙]{2,}/g) || [];
  return new Set(words);
}

function scoreEntry(query, entry) {
  const q = normalize(query);
  const qTokens = tokens(query);
  let score = 0;
  for (const tag of entry.tags || []) {
    const n = normalize(tag);
    if (q.includes(n)) score += n.length >= 5 ? 7 : 4;
  }
  const bag = tokens(`${entry.title} ${entry.answer} ${(entry.mistakes || []).join(' ')} ${(entry.tips || []).join(' ')}`);
  for (const t of qTokens) if (bag.has(t)) score += 1.2;
  return score;
}

function retrieve(query, limit = 3) {
  return getKnowledge()
    .map(entry => ({ entry, score: scoreEntry(query, entry) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.entry);
}

function bmiInfo(profile) {
  const bmi = Number(profile?.bmi);
  if (!Number.isFinite(bmi) || bmi <= 0) return '';
  return `BMI ${bmi.toFixed(1)} (${profile?.bmiStatus || 'ไม่ระบุ'})`;
}

function summarizeWorkouts(workouts = []) {
  if (!workouts.length) return 'ยังไม่มีประวัติการฝึก';
  const completed = workouts.filter(w => w.completedAt);
  const scores = completed.map(w => Number(w.score)).filter(Number.isFinite);
  const avgScore = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
  const reps = completed.reduce((sum, w) => sum + (Number(w.repetitions) || 0), 0);
  const minutes = completed.reduce((sum, w) => sum + ((Number(w.duration) || 0) / 60), 0);
  return `${completed.length} ครั้ง, ${reps} reps, ${Math.round(minutes)} นาที${avgScore !== null ? `, คะแนนเฉลี่ย ${avgScore}/100` : ''}`;
}

function detectIntent(text) {
  const t = normalize(text);
  if (/เจ็บหน้าอก|หายใจไม่ออก|เป็นลม|หมดสติ|อ่อนแรงฉับพลัน/.test(t)) return 'red-flag';
  if (/เจ็บ|ปวด|บวม|ชา/.test(t)) return 'pain';
  if (/วันนี้.*(ทำ|ฝึก|เล่น|workout)|workout.*วันนี้|ตาราง.*วันนี้/.test(t)) return 'today';
  if (/ตาราง.*สัปดาห์|weekly|กี่วัน.*ฝึก|จัดโปรแกรม/.test(t)) return 'weekly-plan';
  if (/ประวัติ|progress|พัฒน|สถิติ/.test(t)) return 'progress';
  if (/bmi|ดัชนีมวลกาย/.test(t)) return 'bmi';
  if (/พักกี่|พักระหว่าง|rest|พัก.*เซ็ต|ระหว่าง.*เซ็ต/.test(t)) return 'rest';
  if (/จำนวนครั้ง|กี่ครั้ง|reps|ครั้งต่อเซ็ต/.test(t)) return 'reps';
  if (/กี่เซ็ต|sets|จำนวนเซ็ต/.test(t)) return 'sets';
  if (/ลดน้ำหนัก|ลดไขมัน|เผาผลาญ/.test(t)) return 'fat-loss';
  if (/สร้างกล้าม|เพิ่มกล้าม|muscle/.test(t)) return 'muscle-gain';
  if (/วอร์ม|warm up|warmup/.test(t)) return 'warmup';
  if (/คูลดาวน์|cooldown|หลังออกกำลัง/.test(t)) return 'cooldown';
  if (/หายใจ|breathing/.test(t)) return 'breathing';
  if (/ฟอร์ม|ท่าถูก|ท่าทาง/.test(t)) return 'form';
  if (/มือใหม่|เริ่มต้น/.test(t)) return 'beginner';
  if (/ที่บ้าน|ไม่มีอุปกรณ์|home workout/.test(t)) return 'home';
  return 'knowledge';
}

function localPlan(context) {
  const exercises = context.exercises || [];
  const goal = normalize(context.profile?.trainingGoal || 'general-fitness');
  const level = normalize(context.profile?.fitnessLevel || 'beginner');
  const lowImpact = Number(context.profile?.bmi) >= 30;
  const preferred = goal.includes('muscle') || goal.includes('strength')
    ? ['Squat','Push Up','Knee Push Up','Lunge','Plank']
    : goal.includes('weight') || goal.includes('fat')
      ? ['Squat','Walking','Push Up','Bird Dog','Plank']
      : ['Squat','Push Up','Plank','Bird Dog','Lunge'];
  const byName = new Map(exercises.map(e => [normalize(e.name), e]));
  const pick = (names) => names.map(n => byName.get(normalize(n))).filter(Boolean).filter(e => !(lowImpact && /jump|burpee|running/i.test(e.name)));
  const fallback = exercises.filter(e => !lowImpact || !/jump|burpee|running/i.test(e.name)).slice(0,5);
  const chosen = pick(preferred).concat(fallback).filter((e,i,a) => a.findIndex(x => x.id === e.id) === i).slice(0,5);
  const sets = level.includes('advanced') ? 4 : level.includes('intermediate') ? 3 : 2;
  const reps = level.includes('advanced') ? '8–15' : '8–12';
  const days = [
    ['วันจันทร์','strength',chosen.slice(0,4)],['วันอังคาร','cardio + mobility',chosen.slice(1,4)],['วันพุธ','พัก/ฟื้นฟู',[]],
    ['วันพฤหัสบดี','strength',chosen.slice(0,5)],['วันศุกร์','conditioning',chosen.slice(1,4)],['วันเสาร์','mobility',chosen.slice(2,5)],['วันอาทิตย์','พัก',[]]
  ];
  return { summary: `แผน Local AI · เป้าหมาย ${context.profile?.trainingGoal || 'ทั่วไป'} · ระดับ ${context.profile?.fitnessLevel || 'beginner'}${lowImpact ? ' · เน้นแรงกระแทกต่ำ' : ''}`,
    days: days.map(([day, focus, list]) => ({ day, focus, exercises: list.map(e => ({ name:e.name, sets, reps, restSeconds:60, reason:'เลือกจากเป้าหมายและ Exercise ที่มีในระบบ' })) })) };
}

function answerLocal(message, context = {}) {
  const text = String(message || '').trim();
  const intent = detectIntent(text);
  const profile = context.profile || null;
  const workouts = context.workouts || [];

  if (!text) return 'ถามผมได้เลยครับ เช่น “วันนี้ควรฝึกอะไร”, “Squat ทำอย่างไร”, “พักกี่วินาที”, “อยากลดไขมันควรฝึกแบบไหน”';
  if (intent === 'red-flag') return 'ถ้ามีเจ็บหน้าอก หายใจลำบากผิดปกติ เป็นลม สับสน หรืออ่อนแรงฉับพลัน ให้หยุดออกกำลังกายทันทีและขอความช่วยเหลือทางการแพทย์ครับ อย่าฝืนต่อและอย่าใช้ AI แทนการประเมินของแพทย์';
  if (intent === 'pain') return 'ถ้ามีอาการเจ็บหรือปวด ให้ลด/หยุดท่าที่กระตุ้นอาการก่อนครับ อย่าฝืนเพื่อให้ครบจำนวนครั้ง หากเจ็บมาก บวมมาก ชา อ่อนแรง หรืออาการไม่ดีขึ้น ควรพบผู้เชี่ยวชาญ\n\nเคล็ดลับ: บอกผมได้ว่าปวดตรงไหน เกิดตอนทำท่าไหน และเจ็บระดับไหน ผมจะช่วยหาท่าทดแทนที่เหมาะกว่าให้ได้';
  if (intent === 'bmi') return profile ? `${bmiInfo(profile)}\n\nBMI เป็นเพียงค่าคัดกรอง ไม่ได้บอกมวลกล้ามหรือความฟิตทั้งหมดครับ ผมจะไม่ใช้ BMI เพียงตัวเดียวตัดสินว่าคุณควรฝึกหนักแค่ไหน` : 'เพิ่มส่วนสูงและน้ำหนักใน Profile ก่อนครับ แล้วผมจะคำนวณและอธิบาย BMI ให้';
  if (intent === 'progress') return `จากประวัติที่ผมเข้าถึงได้: ${summarizeWorkouts(workouts)}\n\nดูแนวโน้มเป็นสัปดาห์จะมีประโยชน์กว่าการเทียบวันเดียวครับ หากคะแนนฟอร์มตกต่อเนื่องให้ลดความยากก่อนเพิ่มปริมาณ`;
  if (intent === 'rest') return 'เริ่มพักประมาณ 45–120 วินาทีสำหรับท่าทั่วไปได้ครับ ถ้าเป็นท่าหนักหรือยังหอบมากให้พักนานขึ้น จนกลับมาควบคุมฟอร์มได้';
  if (intent === 'reps') return 'สำหรับการฝึกทั่วไป เริ่มราว 8–12 ครั้งต่อเซ็ตได้ครับ แต่ควรปรับตามความยาก เป้าหมาย และคุณภาพฟอร์ม ไม่จำเป็นต้องไล่จำนวนครั้งจนท่าเสีย';
  if (intent === 'sets') return 'ผู้เริ่มต้นมักเริ่ม 2–3 เซ็ตต่อท่าได้ครับ แล้วเพิ่มปริมาณเมื่อฟื้นตัวดีและยังรักษาคุณภาพฟอร์มได้';
  if (intent === 'fat-loss') return 'ถ้าเป้าหมายคือ ลดไขมัน ให้ผสม resistance training กับกิจกรรมที่ทำต่อเนื่องได้ และดูพลังงานรวมกับความสม่ำเสมอเป็นหลักครับ ไม่จำเป็นต้องออกกำลังกายหนักสุดทุกวัน';
  if (intent === 'muscle-gain') return 'ถ้าเป้าหมายคือ เพิ่มกล้าม ให้เน้น resistance training อย่างสม่ำเสมอ เพิ่มความยากทีละน้อย และจัดวันพักให้เพียงพอครับ';
  if (intent === 'today') {
    const plan = localPlan(context); const today = plan.days[(new Date().getDay()+6)%7];
    return today.exercises.length ? `วันนี้แนะนำ ${today.focus}\n${today.exercises.map(e => `• ${e.name}: ${e.sets} เซ็ต × ${e.reps} ครั้ง พัก ${e.restSeconds} วินาที`).join('\n')}` : 'วันนี้เป็นวันพัก/ฟื้นฟูครับ เดินเบา ๆ หรือทำ mobility ตามความสบายได้';
  }
  if (intent === 'weekly-plan') {
    const plan = localPlan(context);
    return `${plan.summary}\n\n${plan.days.map(d => `${d.day}: ${d.focus}${d.exercises.length ? ` — ${d.exercises.map(e => e.name).join(', ')}` : ''}`).join('\n')}`;
  }
  const results = retrieve(text, 2);
  if (results.length) {
    const lead = results[0];
    let answer = `${lead.title}\n${lead.answer}`;
    if (lead.mistakes?.length) answer += `\n\nข้อผิดพลาดที่พบบ่อย: ${lead.mistakes.join(' • ')}`;
    if (lead.tips?.length) answer += `\n\nเคล็ดลับ: ${lead.tips.join(' • ')}`;
    if (profile?.fitnessLevel) answer += `\n\nระดับของคุณ: ${profile.fitnessLevel}${profile.trainingGoal ? ` · เป้าหมาย: ${profile.trainingGoal}` : ''}`;
    return answer;
  }
  return 'ผมตอบเรื่องการออกกำลังกายได้หลายด้าน เช่น ท่าต่าง ๆ เซ็ต/ครั้ง เวลาพัก วอร์มอัพ คูลดาวน์ การลดไขมัน การสร้างกล้าม คาร์ดิโอ mobility การฟื้นตัว อาการปวดเบื้องต้น และการปรับตารางให้เข้ากับ Profile ของคุณครับ ลองถามแบบเจาะจงได้เลย';
}

async function callOllama(message, context) {
  if (process.env.LOCAL_LLM_ENABLED !== 'true') return null;
  const base = process.env.OLLAMA_URL || 'http://ollama:11434';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const system = `คุณคือ FitAI Trainer ภาษาไทย ตอบเรื่องฟิตเนสอย่างปลอดภัย ใช้ข้อมูลผู้ใช้เท่าที่ให้ ห้ามวินิจฉัยโรค หากมีสัญญาณอันตรายให้หยุดและพบผู้เชี่ยวชาญ\nProfile:${JSON.stringify(context.profile||{})}\nWorkout:${JSON.stringify((context.workouts||[]).slice(0,10))}`;
    const response = await fetch(`${base}/api/chat`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ model, stream:false, messages:[{role:'system',content:system},{role:'user',content:String(message)}], options:{temperature:0.2} }), signal:controller.signal });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.message?.content?.trim() || null;
  } catch { return null; } finally { clearTimeout(timer); }
}

async function generateLocalAIResponse(message, context = {}) {
  const llm = await callOllama(message, context);
  return llm || answerLocal(message, context);
}

function generateLocalWeeklyPlan(context = {}) { return localPlan(context); }

module.exports = { generateLocalAIResponse, generateLocalWeeklyPlan, retrieve, answerLocal, getKnowledge };
