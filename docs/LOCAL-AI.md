# FitAI Trainer — Local AI (No API Key)

FitAI is now local-first. The chat system works with no OpenAI key.

## 1. Knowledge Retrieval

`backend/knowledge/fitness_knowledge.json` contains curated Thai fitness guidance. The local engine normalizes Thai/English text, detects intent, scores matching topics, and returns the most relevant guidance.

Covered topics include exercise form, squat, push-up, plank, lunge, bird-dog, knee push-up, sets/reps, rest, progressive overload, beginner training, fat loss, muscle gain, cardio, mobility, soreness, pain, red flags, breathing, home workouts, weekly scheduling, plateau, recovery, hydration, sleep, BMI and progress tracking.

## 2. Personalization

The local engine uses the authenticated user's Profile, Workout History and Exercise catalogue. It can answer questions such as:

- วันนี้ควรฝึกอะไร
- ควรพักกี่วินาที
- Squat ทำอย่างไรให้ถูก
- อยากลดไขมันควรฝึกแบบไหน
- ผมเป็นมือใหม่เริ่มอย่างไร
- วันนี้ปวด/ล้า ควรทำอะไร
- ช่วงนี้พัฒนาขึ้นไหม

## 3. Local LLM (Optional)

For more natural free-form answers without any API key, run a local Ollama server and set:

```env
AI_PROVIDER=local
LOCAL_LLM_ENABLED=true
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:3b
```

The backend attempts the local LLM first and automatically falls back to the deterministic knowledge engine when Ollama is unavailable.

No cloud API key is required in either mode.

## 4. Weekly Plans

`/api/ai/weekly-plan` always returns a local plan. An OpenAI plan is only an optional enhancement when explicitly configured with `AI_PROVIDER=openai` and an API key.

## 5. Safety

Local AI is not a medical diagnostic system. Red-flag symptoms trigger a hard safety response before normal fitness guidance.
