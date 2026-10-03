import { useEffect, useRef, useState } from "react";
import api from "./services/api";
import PoseDetector from "./PoseDetector";
import PoseAnalyzer from "./PoseAnalyzer";
import UnityWorkout3D from "./UnityWorkout3D";
import { createExerciseEngine } from "./ai/exerciseEngine";
import { speakText, stopSpeech, speakAnimeMentorCue, ANIME_MENTOR_PHRASES, ANIME_MENTOR_VOICE_CONFIG } from "./utils/speechUtils";

function Workout({ onBack }) {
  const exerciseEngineRef = useRef(null);
  const [aiResult, setAiResult] = useState(null);

  // Exercise
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // "split" | "camera" | "3d"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Camera
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const [poseAnalysis, setPoseAnalysis] = useState(null);

  // Workout
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const voiceRecognitionRef = useRef(null);
  const voiceSessionRef = useRef(null);

  // Live Encouragement & Voice Cheer
  const [cheerSoundEnabled, setCheerSoundEnabled] = useState(() => localStorage.getItem("fitai-cheer-sound") !== "false");
  const [encouragement, setEncouragement] = useState({
    message: "พร้อมลุย! ยืนประจำตำแหน่งแล้วเริ่มออกกำลังกายได้เลยครับ 💪",
    emoji: "🔥",
    showBanner: false,
    rep: 0,
  });
  const lastRepCountRef = useRef(0);
  const lastCheerTimeRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const cheerTimerRef = useRef(null);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/exercises");
      const items = response.data?.data || [];
      setExercises(items);

      let assignedExercise = null;
      let assignedPlan = null;

      const savedPlan = sessionStorage.getItem("fitai-active-plan");
      if (savedPlan) {
        try {
          const plan = JSON.parse(savedPlan);
          const targetClean = String(plan.exerciseName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          assignedExercise = items.find((exercise) => {
            const itemClean = exercise.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return itemClean === targetClean || itemClean.includes(targetClean) || targetClean.includes(itemClean);
          });
          if (assignedExercise) {
            assignedPlan = plan;
          }
        } catch (e) {
          console.warn("Could not parse fitai-active-plan:", e);
        }
      }

      if (!assignedExercise && items.length > 0) {
        assignedExercise = items.find((e) => e.name.toLowerCase().includes("squat")) || items[0];
      }

      if (assignedExercise) {
        setSelectedExercise(assignedExercise);
        setActivePlan(
          assignedPlan || {
            exerciseName: assignedExercise.name,
            sets: 3,
            repetitions: "10-12 ครั้ง",
            focus: assignedExercise.category || "Full Body",
          }
        );
        exerciseEngineRef.current = createExerciseEngine(assignedExercise);
      }
    } catch (err) {
      console.error("Load Exercises Error:", err);
      setError(err.response?.data?.message || err.message || "ไม่สามารถโหลดข้อมูลท่าออกกำลังกายได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (!isWorkoutStarted) return;
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isWorkoutStarted]);

  // Periodic Encouragement while working out (every ~16 seconds if user is holding or resting)
  useEffect(() => {
    if (!isWorkoutStarted) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastCheerTimeRef.current > 16000) {
        lastCheerTimeRef.current = now;
        const idleCheers = ANIME_MENTOR_PHRASES.idle_cues;
        const randomCheer = idleCheers[Math.floor(Math.random() * idleCheers.length)];
        setEncouragement({
          message: randomCheer,
          emoji: "💪",
          showBanner: true,
          rep: lastRepCountRef.current,
        });
        speakAnimeMentorCue("idle", { phrase: randomCheer });
        if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
        cheerTimerRef.current = setTimeout(() => {
          setEncouragement((prev) => ({ ...prev, showBanner: false }));
        }, 3500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isWorkoutStarted]);

  const speakCheer = (text, cueType = "praise") => {
    if (!cheerSoundEnabled) return;
    try {
      speakAnimeMentorCue(cueType, { phrase: text }, { force: true });
    } catch (e) {
      console.warn("TTS cheer error:", e);
    }
  };

  const triggerEncouragement = (currentReps, isFormCorrect = true) => {
    const now = Date.now();
    const canSpeak = now - lastCheerTimeRef.current > 2200;

    const targetRepsMatch = String(activePlan?.repetitions || "10-12").match(/\d+/);
    const targetReps = targetRepsMatch ? Number(targetRepsMatch[0]) : 10;

    let cheerMsg = "";
    let emoji = "🔥";
    let cueType = "rep";

    if (!isFormCorrect) {
      cheerMsg = "รักษาหลังให้ตรงครับ ค่อย ๆ ย่อตัวลง";
      emoji = "⚠️";
      cueType = "warning";
    } else {
      cheerMsg = ANIME_MENTOR_PHRASES.getRepCue(currentReps, targetReps);
      emoji = currentReps >= targetReps ? "🏆" : "🔥";
      cueType = (targetReps - currentReps <= 5) ? "rep_count" : "form_praise";
    }

    setEncouragement({
      message: cheerMsg,
      emoji,
      showBanner: true,
      rep: currentReps,
    });

    if (canSpeak && cheerSoundEnabled) {
      lastCheerTimeRef.current = now;
      speakAnimeMentorCue(cueType, { rep: currentReps, target: targetReps, phrase: cheerMsg });
    }

    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
    cheerTimerRef.current = setTimeout(() => {
      setEncouragement((prev) => ({ ...prev, showBanner: false }));
    }, 3500);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handlePoseDetected = (landmarks) => {
    setPoseLandmarks(landmarks);
    const detected = Boolean(landmarks && landmarks.length >= 33);
    setPoseDetected(detected);
    if (!detected || !selectedExercise) return;

    if (!exerciseEngineRef.current) {
      exerciseEngineRef.current = createExerciseEngine(selectedExercise);
    }
    const result = exerciseEngineRef.current.process(landmarks);
    setAiResult(result);

    // Trigger AI encouragement whenever a new repetition is completed
    if (result?.reps !== undefined && result.reps > lastRepCountRef.current) {
      lastRepCountRef.current = result.reps;
      if (isWorkoutStarted) {
        triggerEncouragement(result.reps, result.form === "correct");
      }
    } else if (isWorkoutStarted && result?.form && result.form !== "correct" && result.feedback) {
      const now = Date.now();
      if (now - lastWarningTimeRef.current > 7500 && now - lastCheerTimeRef.current > 3000) {
        lastWarningTimeRef.current = now;
        let warningCue = "รักษาหลังให้ตรงครับ";
        const fb = result.feedback.toLowerCase();
        if (fb.includes("ย่อ") || fb.includes("ต่ำ") || fb.includes("ลึก")) {
          warningCue = "ค่อย ๆ ย่อตัวลงครับ";
        } else if (fb.includes("หลัง") || fb.includes("ตรง") || fb.includes("ลำตัว")) {
          warningCue = "รักษาหลังให้ตรงครับ";
        } else if (fb.includes("เร็ว") || fb.includes("รีบ") || fb.includes("หายใจ")) {
          warningCue = "ค่อย ๆ หายใจ อย่ารีบครับ";
        }
        if (cheerSoundEnabled) {
          speakAnimeMentorCue("warning", { phrase: warningCue });
        }
        setEncouragement({
          message: warningCue,
          emoji: "⚠️",
          showBanner: true,
          rep: lastRepCountRef.current,
        });
        if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
        cheerTimerRef.current = setTimeout(() => {
          setEncouragement((prev) => ({ ...prev, showBanner: false }));
        }, 3200);
      }
    }
  };

  const handlePoseAnalysis = (result) => {
    setPoseAnalysis(result);
  };

  const handleSelectExercise = (exercise) => {
    if (isWorkoutStarted) return;
    setSelectedExercise(exercise);
    setCameraError("");
    setError("");
    setAiResult(null);
    exerciseEngineRef.current = createExerciseEngine(exercise);
  };

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      setCameraError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser นี้ไม่รองรับการเข้าถึงกล้อง");
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera Error:", err);
      let message = "ไม่สามารถเปิดกล้องได้";
      if (err.name === "NotAllowedError") {
        message = "ไม่ได้รับอนุญาตให้เข้าถึงกล้อง กรุณาให้สิทธิ์ Camera ในเบราว์เซอร์";
      } else if (err.name === "NotFoundError") {
        message = "ไม่พบอุปกรณ์กล้องบนอุปกรณ์นี้";
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setPoseLandmarks(null);
    setPoseDetected(false);
    setPoseAnalysis(null);
  };

  const startWorkout = async () => {
    if (!selectedExercise && exercises.length > 0) {
      setSelectedExercise(exercises[0]);
    }
    setError("");
    setCameraError("");
    if (!cameraActive) {
      await startCamera();
    }
    setDuration(0);
    setStartedAt(new Date().toISOString());
    setIsWorkoutStarted(true);
    lastRepCountRef.current = 0;
    lastCheerTimeRef.current = Date.now();
    if (exerciseEngineRef.current) {
      exerciseEngineRef.current.reset();
    }

    const startCheer = "เอาล่ะ เริ่มกันเลยครับ";
    setEncouragement({
      message: startCheer,
      emoji: "🔥",
      showBanner: true,
      rep: 0,
    });
    if (cheerSoundEnabled) speakAnimeMentorCue("start");
    setTimeout(() => {
      setEncouragement((prev) => ({ ...prev, showBanner: false }));
    }, 4000);
  };

  const stopWorkout = () => {
    const confirmed = window.confirm("ต้องการสิ้นสุดการออกกำลังกายใช่หรือไม่?");
    if (!confirmed) return;
    setIsWorkoutStarted(false);
    setDuration(0);
    setStartedAt(null);
    stopCamera();

    const finishCheer = ANIME_MENTOR_PHRASES.finish(aiResult?.reps || 0);
    if (cheerSoundEnabled) {
      speakAnimeMentorCue("finish", { reps: aiResult?.reps || 0 });
    }
    setEncouragement({
      message: finishCheer,
      emoji: "🏆",
      showBanner: true,
      rep: aiResult?.reps || 0,
    });
  };

  const speakCoachReply = (text) => {
    speakText(text, {
      context: "default",
      rate: ANIME_MENTOR_VOICE_CONFIG.default.rate,
      pitch: ANIME_MENTOR_VOICE_CONFIG.default.pitch,
    });
  };

  const sendVoiceMessage = async (text) => {
    if (!text) return;
    setVoiceTranscript(text);
    setVoiceLoading(true);
    try {
      if (!voiceSessionRef.current) {
        const created = await api.post("/chat/sessions", { title: "Mode 3D Voice Coach" });
        voiceSessionRef.current = created.data?.data?.id;
      }
      const response = await api.post("/chat/messages", {
        sessionId: voiceSessionRef.current,
        message: text,
        activePlan,
      });
      const reply = response.data?.data?.assistantMessage?.content || "ยอดเยี่ยมมาก ออกกำลังกายอย่างต่อเนื่องต่อไปครับ";
      setVoiceReply(reply);
      speakCoachReply(reply);
    } catch (voiceError) {
      setVoiceReply(voiceError.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Voice Coach");
    } finally {
      setVoiceLoading(false);
    }
  };

  const toggleVoiceCoach = () => {
    if (voiceListening) {
      voiceRecognitionRef.current?.stop();
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceReply("เบราว์เซอร์นี้ไม่รองรับการสั่งงานด้วยเสียง กรุณาใช้ Chrome หรือ Edge");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "th-TH";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => setVoiceListening(false);
    recognition.onerror = () => {
      setVoiceListening(false);
      setVoiceReply("เกิดข้อผิดพลาดในการฟังเสียง กรุณากดลองใหม่อีกครั้ง");
    };
    recognition.onresult = (event) => sendVoiceMessage(event.results[0][0].transcript.trim());
    voiceRecognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    return () => {
      voiceRecognitionRef.current?.stop();
      stopSpeech();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#3b99e2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-[#64748b] font-medium">กำลังโหลดระบบ Workout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>←</span>
            <span>กลับ</span>
          </button>
          <span className="text-sm font-bold text-[#1e293b] tracking-wide">AI Workout Room</span>
          <span className="px-3 py-1 bg-white/50 border border-white/60 rounded-full text-xs font-semibold text-[#1e293b] shadow-sm">
            AI Training
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-white border border-slate-200/80 rounded-full mb-2 uppercase shadow-sm">
            AI FITNESS ASSISTANT
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>🏋️‍♂️</span>
            <span>AI Workout Room</span>
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            ฝึกออกกำลังกายแบบเรียลไทม์ พร้อมการนับ Rep และตรวจฟอร์มด้วยระบบ AI Vision & 3D Coach
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {cameraError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm">
            <span>📹</span>
            <span>{cameraError}</span>
          </div>
        )}

        {/* Active Plan Recommendation Banner (AI Assigned) */}
        {(activePlan || selectedExercise) && (
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-[#3b99e2] uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span>
                <span>ท่าออกกำลังกายที่ AI กำหนดให้</span>
              </span>
              <h2 className="text-lg font-bold text-[#1e293b] mt-0.5">{selectedExercise?.name || activePlan?.exerciseName}</h2>
              <p className="text-xs text-zinc-400">
                {activePlan ? `เป้าหมาย: ${activePlan.sets} เซ็ต • ${activePlan.repetitions} • โฟกัส ${activePlan.focus}` : `โฟกัส: ${selectedExercise?.category || "Bodyweight"}`}
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#c4d7e6] text-[#1e293b] border border-slate-300 self-start sm:self-auto flex items-center gap-1.5">
              <span>✨</span>
              <span>AI จัดตารางให้</span>
            </span>
          </section>
        )}

        

        {/* View Switcher Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "split" ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "text-[#64748b] hover:text-[#1e293b]"
              }`}
            >
              📱 แยกหน้าจอ (Split)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("camera")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "camera" ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "text-[#64748b] hover:text-[#1e293b]"
              }`}
            >
              📹 กล้อง AI
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "3d" ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "text-[#64748b] hover:text-[#1e293b]"
              }`}
            >
              🏋️ Malong 3D Coach
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCheerSoundEnabled((prev) => {
                  const next = !prev;
                  localStorage.setItem("fitai-cheer-sound", String(next));
                  return next;
                });
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                cheerSoundEnabled
                  ? "bg-[#c4d7e6] text-[#1e293b] border-slate-300 shadow-sm"
                  : "bg-white text-[#64748b] border-slate-200/80 shadow-sm"
              }`}
              title={cheerSoundEnabled ? "ปิดเสียงโค้ชให้กำลังใจ" : "เปิดเสียงโค้ชให้กำลังใจ"}
            >
              <span>{cheerSoundEnabled ? "🔊" : "🔇"}</span>
              <span className="hidden sm:inline">{cheerSoundEnabled ? "เสียงโค้ช: เปิด" : "เสียงโค้ช: ปิด"}</span>
            </button>

            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraLoading}
                className="px-4 py-2 bg-[#3b99e2] hover:bg-[#288ad4] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-[#3b99e2]/25"
              >
                <span>📹</span>
                <span>{cameraLoading ? "กำลังเปิดกล้อง..." : "เปิดกล้อง"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                disabled={isWorkoutStarted}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ปิดกล้อง
              </button>
            )}
          </div>
        </div>

        {/* Main Display: Camera & 3D Coach */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left / Camera View */}
          {(viewMode === "split" || viewMode === "camera") && (
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#1e293b] flex items-center gap-1.5">
                  <span>📹</span>
                  <span>AI Camera View</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    cameraActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cameraActive ? "● ONLINE" : "○ OFFLINE"}
                </span>
              </div>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
                {/* Floating Real-time Encouragement Banner */}
                {isWorkoutStarted && encouragement.showBanner && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 animate-bounce">
                    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-extrabold px-5 py-2.5 rounded-full shadow-2xl shadow-red-950/90 border border-white/25 flex items-center gap-2.5 backdrop-blur-md">
                      <span className="text-xl animate-pulse drop-shadow">{encouragement.emoji}</span>
                      <span className="text-xs sm:text-sm tracking-wide drop-shadow whitespace-nowrap">
                        {encouragement.message}
                      </span>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform -scale-x-100"
                  autoPlay
                  playsInline
                  muted
                />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-center p-4">
                    <span className="text-4xl mb-2">📹</span>
                    <h3 className="text-base font-bold text-white">กล้องยังไม่เปิดใช้งาน</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                      กดปุ่ม "เปิดกล้อง" ด้านบน หรือกด "Start AI Workout" เพื่อเริ่มให้ AI ตรวจจับท่าทาง
                    </p>
                  </div>
                )}

                {cameraActive && (
                  <>
                    <PoseDetector
                      videoRef={videoRef}
                      active={cameraActive}
                      onPoseDetected={handlePoseDetected}
                    />
                    <PoseAnalyzer
                      landmarks={poseLandmarks}
                      exercise={selectedExercise?.name?.toLowerCase() || "squat"}
                      onAnalysis={handlePoseAnalysis}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Right / 3D Coach View */}
          {(viewMode === "split" || viewMode === "3d") && (
            <UnityWorkout3D
              exercise={selectedExercise?.name || "Squat"}
              isWorkoutStarted={isWorkoutStarted}
              repetitions={aiResult?.reps || 0}
              className={viewMode === "3d" ? "lg:col-span-2" : ""}
            />
          )}
        </div>

        {/* Real-time AI Exercise Engine Result Card */}
        {cameraActive && (
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold text-[#3b99e2] uppercase tracking-wider">
                  AI EXERCISE ENGINE
                </span>
                <h2 className="text-lg font-extrabold text-[#1e293b]">
                  {selectedExercise?.name || "Exercise"}
                </h2>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  aiResult?.form === "correct"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {aiResult?.form === "correct" ? "✓ ฟอร์มถูกต้อง" : "⚠️ ปรับฟอร์ม"}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                <span className="text-[11px] text-[#64748b] font-bold">จำนวนครั้ง (Reps)</span>
                <strong className="text-2xl font-black text-[#1e293b]">{aiResult?.reps ?? 0}</strong>
              </div>
              <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                <span className="text-[11px] text-[#64748b] font-bold">คะแนนฟอร์ม (Score)</span>
                <strong className="text-2xl font-black text-[#3b99e2]">{aiResult?.score ?? 0}</strong>
              </div>
              <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                <span className="text-[11px] text-[#64748b] font-bold">มุมข้อต่อ (Angle)</span>
                <strong className="text-2xl font-black text-[#1e293b]">
                  {aiResult?.angles?.averageKneeAngle ??
                    aiResult?.angles?.averageElbowAngle ??
                    aiResult?.angles?.averageHipAngle ??
                    0}°
                </strong>
              </div>
              <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                <span className="text-[11px] text-[#64748b] font-bold">จังหวะ (Phase)</span>
                <strong className="text-2xl font-black text-[#475569]">{aiResult?.phase || "ready"}</strong>
              </div>
            </div>

            {/* Live AI Encouragement & Motivation Card */}
            <div className="bg-[#edf1f4] border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-pulse">{encouragement.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#3b99e2] font-extrabold uppercase tracking-wider">
                      AI COACH MOTIVATION (เสียงให้กำลังใจ)
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white text-[#1e293b] border border-slate-300">
                      LIVE
                    </span>
                  </div>
                  <strong className="text-sm text-[#1e293b] font-bold block mt-0.5">
                    {encouragement.message}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCheerSoundEnabled((prev) => {
                    const next = !prev;
                    localStorage.setItem("fitai-cheer-sound", String(next));
                    return next;
                  });
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  cheerSoundEnabled
                    ? "bg-red-600/20 text-red-300 border-red-500/40"
                    : "bg-zinc-800 text-zinc-500 border-zinc-700"
                }`}
                title={cheerSoundEnabled ? "ปิดเสียงให้กำลังใจ" : "เปิดเสียงให้กำลังใจ"}
              >
                <span>{cheerSoundEnabled ? "🔊" : "🔇"}</span>
                <span className="hidden sm:inline">{cheerSoundEnabled ? "เสียงโค้ช: เปิด" : "เสียงโค้ช: ปิด"}</span>
              </button>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  AI Real-time Feedback
                </span>
                <strong className="text-sm text-[#1e293b] font-medium">
                  {aiResult?.feedback || "พร้อมสำหรับการฝึก ยืนประจำตำแหน่งแล้วเริ่มย่อตัวได้เลย"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Voice Coach Section */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              VOICE COACH
            </div>
            <h2 className="text-base font-bold text-[#1e293b] mt-0.5">คุยกับ AI โค้ชด้วยเสียง</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              {voiceLoading
                ? "AI กำลังประมวลผลคำถาม..."
                : voiceReply ||
                  "กดปุ่มไมโครโฟนเพื่อสอบถามเทคนิค เช่น 'ย่อลึกแค่ไหนดี' หรือ 'ข้อควรระวังของท่านี้'"}
            </p>
            {voiceTranscript && (
              <small className="text-[11px] text-zinc-500 block mt-1">
                คุณพูด: "{voiceTranscript}"
              </small>
            )}
          </div>
          <button
            type="button"
            onClick={toggleVoiceCoach}
            disabled={voiceLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap self-start sm:self-auto ${
              voiceListening
                ? "bg-rose-500 animate-pulse text-white shadow-md shadow-rose-500/30"
                : "bg-[#3b99e2] hover:bg-[#288ad4] text-white shadow-sm shadow-[#3b99e2]/25"
            }`}
          >
            <span>🎙️</span>
            <span>{voiceListening ? "กำลังฟังเสียง..." : "พูดกับ AI โค้ช"}</span>
          </button>
        </section>

        {/* Main Workout Control Panel */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#c4d7e6] border border-slate-300 flex items-center justify-center text-2xl">
              🏋️‍♂️
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                CURRENT WORKOUT
              </span>
              <h3 className="text-lg font-black text-[#1e293b]">
                {selectedExercise ? selectedExercise.name : "กำลังโหลดท่าจาก AI..."}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                <span>⏱️ เวลา: <strong className="text-[#1e293b] font-mono">{formatDuration(duration)}</strong></span>
                <span>•</span>
                <span>🔥 Reps: <strong className="text-[#3b99e2]">{aiResult?.reps ?? 0}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isWorkoutStarted ? (
              <button
                type="button"
                onClick={startWorkout}
                disabled={cameraLoading || loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>▶</span>
                <span>Start AI Workout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopWorkout}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⏹</span>
                <span>จบเซสชัน Workout</span>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Workout;