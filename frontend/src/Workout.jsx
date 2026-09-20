import { useEffect, useRef, useState } from "react";
import api from "./services/api";
import PoseDetector from "./PoseDetector";
import PoseAnalyzer from "./PoseAnalyzer";
import UnityWorkout3D from "./UnityWorkout3D";
import { createExerciseEngine } from "./ai/exerciseEngine";
import { speakText, stopSpeech } from "./utils/speechUtils";

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
        const idleCheers = [
          "หายใจเข้าลึกๆ นะครับ ค่อยๆ ทำตามจังหวะ คุณทำได้แน่นอน!",
          "ฮึบไว้ครับ! ความพยายามในตอนนี้จะสร้างความแข็งแกร่งให้คุณ!",
          "โฟกัสที่กล้ามเนื้อและฟอร์ม แล้วดันตัวขึ้นมาอีกครั้งครับ สู้ๆ!",
          "อย่าเพิ่งยอมแพ้ครับ อีกนิดเดียวจะบรรลุเป้าหมายแล้ว!",
        ];
        const randomCheer = idleCheers[Math.floor(Math.random() * idleCheers.length)];
        setEncouragement({
          message: randomCheer,
          emoji: "💪",
          showBanner: true,
          rep: lastRepCountRef.current,
        });
        speakCheer(randomCheer);
        if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
        cheerTimerRef.current = setTimeout(() => {
          setEncouragement((prev) => ({ ...prev, showBanner: false }));
        }, 3500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isWorkoutStarted]);

  const speakCheer = (text) => {
    if (!cheerSoundEnabled) return;
    try {
      speakText(text, {
        rate: 1.05,
        pitch: 1.1,
        force: true,
      });
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

    if (currentReps === 1) {
      cheerMsg = "ยอดเยี่ยมมาก! เริ่มต้น Rep แรกได้สวยงาม ลุยต่อเลยครับ!";
      emoji = "🚀";
    } else if (currentReps === Math.floor(targetReps / 2)) {
      cheerMsg = `ครึ่งทางแล้วครับ! ทำได้ ${currentReps} ครั้งแล้ว สู้ๆ!`;
      emoji = "⚡";
    } else if (currentReps === targetReps - 2) {
      cheerMsg = "อีกแค่ 2 ครั้งจะครบเป้าหมายแล้ว ฮึบไว้ครับ!";
      emoji = "💪";
    } else if (currentReps === targetReps - 1) {
      cheerMsg = "ครั้งสุดท้ายแล้วครับ! ใส่ให้สุดพลังเลย!";
      emoji = "🔥";
    } else if (currentReps >= targetReps) {
      cheerMsg = `สุดยอดมาก! คุณทำครบเป้าหมาย ${targetReps} ครั้งแล้ว ยอดเยี่ยมที่สุด 🎉`;
      emoji = "🏆";
    } else {
      const repCheers = [
        "ดีมากครับ รักษาจังหวะไว้!",
        "ฟอร์มสวยมาก ดันตัวขึ้นมาเลย!",
        "เก่งมาก ฮึบไว้ครับ!",
        "สู้ต่อไป ทำได้ดีมากครับ!",
        "กล้ามเนื้อกำลังทำงานได้ยอดเยี่ยม!",
        "คุมลมหายใจแล้วไปต่อครับ!",
      ];
      cheerMsg = repCheers[currentReps % repCheers.length];
      emoji = "🔥";
    }

    setEncouragement({
      message: cheerMsg,
      emoji,
      showBanner: true,
      rep: currentReps,
    });

    if (canSpeak) {
      lastCheerTimeRef.current = now;
      speakCheer(cheerMsg);
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

    const startCheer = "พร้อมแล้วครับ! หายใจเข้าลึกๆ ยืนประจำตำแหน่ง แล้วเริ่มฝึกได้เลยครับ สู้ๆ!";
    setEncouragement({
      message: startCheer,
      emoji: "🔥",
      showBanner: true,
      rep: 0,
    });
    speakCheer("พร้อมแล้วครับ ยืนประจำตำแหน่งแล้วเริ่มฝึกได้เลย สู้ๆ ครับ!");
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

    const finishCheer = `ยอดเยี่ยมมากครับ! คุณออกกำลังกายไปทั้งหมด ${aiResult?.reps || 0} ครั้ง พักผ่อนและดื่มน้ำให้เพียงพอนะครับ 🎉`;
    speakCheer(finishCheer);
    setEncouragement({
      message: finishCheer,
      emoji: "🏆",
      showBanner: true,
      rep: aiResult?.reps || 0,
    });
  };

  const speakCoachReply = (text) => {
    speakText(text, {
      rate: 1.0,
      pitch: 1.0,
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-sm text-zinc-400">กำลังโหลดระบบ Workout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>←</span>
            <span>กลับ Dashboard</span>
          </button>
          <span className="text-sm font-semibold text-zinc-300">AI Workout Room</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full mb-2 uppercase">
            AI FITNESS ASSISTANT
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>🏋️‍♂️</span>
            <span>AI Workout Room</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ฝึกออกกำลังกายแบบเรียลไทม์ พร้อมการนับ Rep และตรวจฟอร์มด้วยระบบ AI Vision & 3D Coach
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {cameraError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-sm flex items-center gap-2">
            <span>📹</span>
            <span>{cameraError}</span>
          </div>
        )}

        {/* Active Plan Recommendation Banner (AI Assigned) */}
        {(activePlan || selectedExercise) && (
          <section className="bg-gradient-to-r from-red-950/40 via-zinc-900/80 to-zinc-900 border border-red-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-red-950/20">
            <div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span>
                <span>ท่าออกกำลังกายที่ AI กำหนดให้</span>
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{selectedExercise?.name || activePlan?.exerciseName}</h2>
              <p className="text-xs text-zinc-400">
                {activePlan ? `เป้าหมาย: ${activePlan.sets} เซ็ต • ${activePlan.repetitions} • โฟกัส ${activePlan.focus}` : `โฟกัส: ${selectedExercise?.category || "Bodyweight"}`}
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 self-start sm:self-auto flex items-center gap-1.5">
              <span>✨</span>
              <span>AI จัดตารางให้</span>
            </span>
          </section>
        )}

        

        {/* View Switcher Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "split" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              📱 แยกหน้าจอ (Split)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("camera")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "camera" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              📹 กล้อง AI
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "3d" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
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
                  ? "bg-red-600/20 text-red-300 border-red-500/40 shadow-sm"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
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
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>📹</span>
                <span>{cameraLoading ? "กำลังเปิดกล้อง..." : "เปิดกล้อง"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                disabled={isWorkoutStarted}
                className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <span>📹</span>
                  <span>AI Camera View</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    cameraActive
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                      : "bg-zinc-800 text-zinc-500"
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-center p-4">
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
          <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  AI EXERCISE ENGINE
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  {selectedExercise?.name || "Exercise"}
                </h2>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  aiResult?.form === "correct"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                    : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                }`}
              >
                {aiResult?.form === "correct" ? "✓ ฟอร์มถูกต้อง" : "⚠️ ปรับฟอร์ม"}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-[11px] text-zinc-500 font-semibold">จำนวนครั้ง (Reps)</span>
                <strong className="text-2xl font-black text-white">{aiResult?.reps ?? 0}</strong>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-[11px] text-zinc-500 font-semibold">คะแนนฟอร์ม (Score)</span>
                <strong className="text-2xl font-black text-red-500">{aiResult?.score ?? 0}</strong>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-[11px] text-zinc-500 font-semibold">มุมข้อต่อ (Angle)</span>
                <strong className="text-2xl font-black text-white">
                  {aiResult?.angles?.averageKneeAngle ??
                    aiResult?.angles?.averageElbowAngle ??
                    aiResult?.angles?.averageHipAngle ??
                    0}°
                </strong>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-[11px] text-zinc-500 font-semibold">จังหวะ (Phase)</span>
                <strong className="text-2xl font-black text-zinc-300">{aiResult?.phase || "ready"}</strong>
              </div>
            </div>

            {/* Live AI Encouragement & Motivation Card */}
            <div className="bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-900 border border-red-500/40 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-pulse">{encouragement.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">
                      AI COACH MOTIVATION (เสียงให้กำลังใจ)
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                      LIVE
                    </span>
                  </div>
                  <strong className="text-sm text-white font-bold block mt-0.5">
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

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  AI Real-time Feedback
                </span>
                <strong className="text-sm text-zinc-200">
                  {aiResult?.feedback || "พร้อมสำหรับการฝึก ยืนประจำตำแหน่งแล้วเริ่มย่อตัวได้เลย"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Voice Coach Section */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              VOICE COACH
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">คุยกับ AI โค้ชด้วยเสียง</h2>
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
                ? "bg-red-600 animate-pulse text-white shadow-lg shadow-red-600/30"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
          >
            <span>🎙️</span>
            <span>{voiceListening ? "กำลังฟังเสียง..." : "พูดกับ AI โค้ช"}</span>
          </button>
        </section>

        {/* Main Workout Control Panel */}
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl">
              🏋️‍♂️
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                CURRENT WORKOUT
              </span>
              <h3 className="text-lg font-black text-white">
                {selectedExercise ? selectedExercise.name : "กำลังโหลดท่าจาก AI..."}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                <span>⏱️ เวลา: <strong className="text-white font-mono">{formatDuration(duration)}</strong></span>
                <span>•</span>
                <span>🔥 Reps: <strong className="text-red-400">{aiResult?.reps ?? 0}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isWorkoutStarted ? (
              <button
                type="button"
                onClick={startWorkout}
                disabled={cameraLoading || loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/25 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>▶</span>
                <span>Start AI Workout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopWorkout}
                className="w-full sm:w-auto px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] text-white border border-zinc-700 font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
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