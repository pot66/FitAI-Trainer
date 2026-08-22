import { useEffect, useRef, useState } from "react";
import api from "./services/api";
import PoseDetector from "./PoseDetector";
import PoseAnalyzer from "./PoseAnalyzer";
import {
  createExerciseEngine,
} from "./ai/exerciseEngine";

function Workout({ onBack }) {

  const exerciseEngineRef =
  useRef(null);

const [
  aiResult,
  setAiResult,
] = useState(null);
  // =====================================
  // Exercise
  // =====================================

  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] =
    useState(null);
  const [activePlan, setActivePlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // Camera
  // =====================================

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

    const [poseLandmarks, setPoseLandmarks] =
  useState(null);

const [poseDetected, setPoseDetected] =
  useState(false);

  const [poseAnalysis, setPoseAnalysis] =
    useState(null);

  // =====================================
  // Workout
  // =====================================

  const [isWorkoutStarted, setIsWorkoutStarted] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  const [startedAt, setStartedAt] =
    useState(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const voiceRecognitionRef = useRef(null);
  const voiceSessionRef = useRef(null);

  // =====================================
  // Load Exercises
  // =====================================

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/exercises");

      console.log(
        "Exercises:",
        response.data
      );

        const items = response.data?.data || [];
        setExercises(items);
        const savedPlan = sessionStorage.getItem("fitai-active-plan");
        if (savedPlan) {
          const plan = JSON.parse(savedPlan);
          const recommendedExercise = items.find((exercise) => exercise.name.toLowerCase() === String(plan.exerciseName).toLowerCase());
          if (recommendedExercise) {
            setSelectedExercise(recommendedExercise);
            setActivePlan(plan);
          }
        }
    } catch (error) {
      console.error(
        "Load Exercises Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "ไม่สามารถโหลดรายการท่าออกกำลังกายได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  // =====================================
  // Timer
  // =====================================

  useEffect(() => {
    if (!isWorkoutStarted) {
      return;
    }

    const timer =
      setInterval(() => {
        setDuration(
          (previous) =>
            previous + 1
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isWorkoutStarted]);

  // =====================================
  // Format Duration
  // =====================================

  const formatDuration = (seconds) => {
    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handlePoseDetected = (
  landmarks
) => {
  setPoseLandmarks(
    landmarks
  );

  const detected =
    Boolean(
      landmarks &&
        landmarks.length >= 33
    );

  setPoseDetected(
    detected
  );

  if (
    !detected ||
    !selectedExercise
  ) {
    return;
  }

  if (
    !exerciseEngineRef.current
  ) {
    exerciseEngineRef.current =
      createExerciseEngine(
        selectedExercise
      );
  }

  const result =
    exerciseEngineRef.current.process(
      landmarks
    );

  setAiResult(
    result
  );
};

  // =====================================
  // Pose Analysis
  // =====================================

  const handlePoseAnalysis = (result) => {
    setPoseAnalysis(result);
  };

  // =====================================
  // Select Exercise
  // =====================================

  const handleSelectExercise = (
  exercise
) => {
  if (isWorkoutStarted) {
    return;
  }

  setSelectedExercise(
    exercise
  );

  setCameraError("");
  setError("");

  setAiResult(null);

  exerciseEngineRef.current =
    createExerciseEngine(
      exercise
    );
};

  // =====================================
  // Start Camera
  // =====================================

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      setCameraError("");

      // ตรวจสอบ Browser
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Browser นี้ไม่รองรับการใช้งานกล้อง"
        );
      }

      // ถ้ามี Stream เดิม
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          }
        );

      streamRef.current =
        stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();
      }

      setCameraActive(true);

      console.log(
        "📷 Camera started"
      );
    } catch (error) {
      console.error(
        "Camera Error:",
        error
      );

      let message =
        "ไม่สามารถเปิดกล้องได้";

      if (
        error.name ===
        "NotAllowedError"
      ) {
        message =
          "ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาต Camera ใน Browser";
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        message =
          "ไม่พบกล้องในอุปกรณ์";
      } else if (
        error.name ===
        "NotReadableError"
      ) {
        message =
          "ไม่สามารถใช้งานกล้องได้ อาจมีโปรแกรมอื่นกำลังใช้กล้องอยู่";
      } else if (
        error.message
      ) {
        message =
          error.message;
      }

      setCameraError(
        message
      );

      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  // =====================================
  // Stop Camera
  // =====================================

  const stopCamera = () => {
    console.log(
      "📷 Stopping camera"
    );

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraActive(false);

    setPoseLandmarks(null);
    setPoseDetected(false);
    setPoseAnalysis(null);
  };

  // =====================================
  // Start Workout
  // =====================================

  const startWorkout = async () => {
    if (!selectedExercise) {
      setError(
        "กรุณาเลือกท่าออกกำลังกายก่อน"
      );

      return;
    }

    setError("");
    setCameraError("");

    // เปิดกล้องก่อน
    if (!cameraActive) {
      await startCamera();
    }

    setDuration(0);

    setStartedAt(
      new Date().toISOString()
    );

    setIsWorkoutStarted(true);
  };

  // =====================================
  // Stop Workout
  // =====================================

  const stopWorkout = () => {
    const confirmed =
      window.confirm(
        "ต้องการหยุด Workout หรือไม่?"
      );

    if (!confirmed) {
      return;
    }

    setIsWorkoutStarted(false);

    setDuration(0);

    setStartedAt(null);

    stopCamera();
  };

  const speakCoachReply = (text) => {
    if (localStorage.getItem("fitai-ai-voice-enabled") === "false" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    window.speechSynthesis.speak(utterance);
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
      const reply = response.data?.data?.assistantMessage?.content || "ขออภัยครับ ยังตอบไม่ได้ในขณะนี้";
      setVoiceReply(reply);
      speakCoachReply(reply);
    } catch (voiceError) {
      setVoiceReply(voiceError.response?.data?.message || "ไม่สามารถเชื่อมต่อ Voice Coach ได้");
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
      setVoiceReply("เบราว์เซอร์นี้ไม่รองรับการรับเสียง กรุณาใช้ Chrome หรือ Edge");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "th-TH";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => setVoiceListening(false);
    recognition.onerror = () => { setVoiceListening(false); setVoiceReply("ไม่สามารถรับเสียงได้ โปรดอนุญาตการใช้ไมโครโฟน"); };
    recognition.onresult = (event) => sendVoiceMessage(event.results[0][0].transcript.trim());
    voiceRecognitionRef.current = recognition;
    recognition.start();
  };

  // =====================================
  // Cleanup
  // =====================================

  useEffect(() => {
    return () => {
      voiceRecognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current =
          null;
      }
    };
  }, []);

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="workout-page">

        <div className="workout-loading">

          <div className="workout-loading-icon">
            🏋️
          </div>

          <h2>
            กำลังโหลด Workout...
          </h2>

          <p>
            กรุณารอสักครู่
          </p>

        </div>

      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="workout-page">

      {/* =====================================
          Header
      ===================================== */}

      <header className="workout-header">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← กลับ Dashboard
        </button>

        <div className="workout-header-title">

          <div className="badge">
            AI FITNESS ASSISTANT
          </div>

          <h1>
            🏋️ AI Workout
          </h1>

          <p>
            AI ช่วยวิเคราะห์ท่าออกกำลังกาย
          </p>

        </div>

      </header>

      <main className="workout-container">

        {/* =====================================
            Error
        ===================================== */}

        {error && (
          <div className="workout-message error">
            ❌ {error}
          </div>
        )}

        {cameraError && (
          <div className="workout-message error">
            📷 {cameraError}
          </div>
        )}

        {/* =====================================
            Exercise Selection
        ===================================== */}

        {activePlan && <section className="workout-plan-summary">
          <span>AI แนะนำสำหรับวันนี้</span>
          <strong>{activePlan.exerciseName}</strong>
          <ol className="workout-plan-exercise-list">
            {(activePlan.exercises || [{ name: activePlan.exerciseName, sets: activePlan.sets, repetitions: activePlan.repetitions }]).map((exercise, index) => (
              <li
                className={exercise.name === selectedExercise?.name ? "active" : ""}
                key={`${exercise.name}-${index}`}
              >
                <span>{index + 1}</span>
                <div>
                  <strong>{exercise.name}</strong>
                  <small>{exercise.sets ? `${exercise.sets} เซ็ต · ${exercise.repetitions}` : exercise.repetitions}</small>
                </div>
              </li>
            ))}
          </ol>
          <p>{activePlan.sets} เซ็ต · {activePlan.repetitions} · {activePlan.focus}</p>
        </section>}

        <section className={activePlan ? "workout-card exercise-selection is-guided" : "workout-card exercise-selection"}>

          <div className="workout-card-header">

            <div className="workout-card-icon">
              💪
            </div>

            <div>
              <h2>
                เลือกท่าออกกำลังกาย
              </h2>

              <p>
                เลือกท่าที่ต้องการให้ AI วิเคราะห์
              </p>
            </div>

          </div>

          {exercises.length === 0 ? (
            <div className="workout-empty">

              <div>
                🏋️
              </div>

              <h3>
                ยังไม่มี Exercise
              </h3>

              <p>
                กรุณาเพิ่มข้อมูล Exercise
                ใน Database
              </p>

            </div>
          ) : (
            <div className="exercise-list">

              {exercises.map(
                (exercise) => {

                  const active =
                    selectedExercise?.id ===
                    exercise.id;

                  return (
                    <button
                      type="button"
                      key={exercise.id}
                      className={
                        active
                          ? "exercise-item active"
                          : "exercise-item"
                      }
                      onClick={() =>
                        handleSelectExercise(
                          exercise
                        )
                      }
                      disabled={
                        isWorkoutStarted
                      }
                    >

                      <div className="exercise-icon">
                        💪
                      </div>

                      <div className="exercise-info">

                        <strong>
                          {exercise.name ||
                            `Exercise #${exercise.id}`}
                        </strong>

                        {exercise.description && (
                          <small>
                            {
                              exercise.description
                            }
                          </small>
                        )}

                      </div>

                      {active && (
                        <div className="exercise-check">
                          ✓
                        </div>
                      )}

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =====================================
            Camera
        ===================================== */}

        <section className="workout-card camera-card">

          <div className="workout-card-header">

            <div className="workout-card-icon">
              📷
            </div>

            <div>

              <h2>
                AI Camera
              </h2>

              <p>
                กล้องสำหรับตรวจจับท่าทาง
              </p>

            </div>

            <div className="camera-status">

              <span
                className={
                  cameraActive
                    ? "status-dot active"
                    : "status-dot"
                }
              />

              {cameraActive
                ? "Camera Active"
                : "Camera Off"}

            </div>

          </div>

          {/* =====================================
              Camera View
          ===================================== */}

          <div className="camera-wrapper">

            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />

            {!cameraActive && (
              <div className="camera-placeholder">

                <div className="camera-placeholder-icon">
                  📷
                </div>

                <h3>
                  กล้องยังไม่เปิด
                </h3>

                <p>
                  เลือกท่าออกกำลังกาย
                  แล้วกด Start Workout
                </p>

              </div>
            )}

            {/* AI Overlay Placeholder */}

            {cameraActive && (
  <div className="camera-overlay">

    <PoseDetector
      videoRef={videoRef}
      active={cameraActive}
      onPoseDetected={
        handlePoseDetected
      }
    />

    <PoseAnalyzer
      landmarks={poseLandmarks}
      exercise={
        selectedExercise?.name?.toLowerCase() ||
        "squat"
      }
      onAnalysis={
        handlePoseAnalysis
      }
    />

    <div className="camera-ai-label">
      🤖 AI READY
    </div>

    <div className="camera-guide">

      <div className="guide-corner top-left" />

      <div className="guide-corner top-right" />

      <div className="guide-corner bottom-left" />

      <div className="guide-corner bottom-right" />

    </div>

  </div>
)}

          </div>

          {/* =====================================
              Camera Controls
          ===================================== */}

          <div className="camera-controls">

            {!cameraActive ? (
              <button
                type="button"
                className="camera-start-button"
                onClick={startCamera}
                disabled={
                  cameraLoading
                }
              >
                {cameraLoading
                  ? "กำลังเปิดกล้อง..."
                  : "📷 เปิดกล้อง"}
              </button>
            ) : (
              <button
                type="button"
                className="camera-stop-button"
                onClick={stopCamera}
                disabled={
                  isWorkoutStarted
                }
              >
                ⏹️ ปิดกล้อง
              </button>
            )}

          </div>

          

        </section>
        {cameraActive && (
  <section className="ai-result-card">

    <div className="ai-result-header">

      <div>
        <span>
          🤖 AI EXERCISE ENGINE
        </span>

        <h2>
          {selectedExercise?.name ||
            "Exercise"}
        </h2>
      </div>

      <div
        className={
          aiResult?.form ===
          "correct"
            ? "ai-correct"
            : "ai-warning"
        }
      >
        {aiResult?.form ===
        "correct"
          ? "✓ CORRECT"
          : "⚠ CHECK FORM"}
      </div>

    </div>

    <div className="ai-result-grid">

      <div className="ai-result-stat">

        <span>
          🔢 Reps
        </span>

        <strong>
          {aiResult?.reps ??
            0}
        </strong>

      </div>

      <div className="ai-result-stat">

        <span>
          ⭐ Score
        </span>

        <strong>
          {aiResult?.score ??
            0}
        </strong>

      </div>

      <div className="ai-result-stat">

        <span>
          📐 Angle
        </span>

        <strong>
          {aiResult
            ?.angles
            ?.averageKneeAngle ??
            aiResult
              ?.angles
              ?.averageElbowAngle ??
            aiResult
              ?.angles
              ?.averageHipAngle ??
            0}
          °
        </strong>

      </div>

      <div className="ai-result-stat">

        <span>
          🔄 Phase
        </span>

        <strong>
          {aiResult?.phase ||
            "waiting"}
        </strong>

      </div>

    </div>

    <div className="ai-feedback">

      <span>
        AI Feedback
      </span>

      <strong>
        {aiResult?.feedback ||
          "กำลังวิเคราะห์..."}
      </strong>

    </div>

  </section>
)}

        {/* =====================================
            Workout Control
        ===================================== */}

        <section className="workout-card voice-coach-card">
          <div>
            <span>VOICE COACH</span>
            <h2>พูดคุยกับ AI ระหว่างฝึก</h2>
            <p>{voiceLoading ? "AI กำลังคิดคำตอบ..." : voiceReply || "กดไมโครโฟนแล้วถามเรื่องท่า ฟอร์ม หรือแผนการฝึกได้เลย"}</p>
            {voiceTranscript && <small>คุณพูด: {voiceTranscript}</small>}
          </div>
          <button type="button" className={voiceListening ? "voice-coach-button listening" : "voice-coach-button"} onClick={toggleVoiceCoach} disabled={voiceLoading}>
            {voiceListening ? "หยุดฟัง" : "🎙 พูดกับ AI"}
          </button>
        </section>

        <section className="workout-card">

          <div className="current-workout">

            <div className="selected-exercise">

              <div className="selected-exercise-icon">
                🏋️
              </div>

              <div>

                <small>
                  Exercise
                </small>

                <h3>
                  {selectedExercise
                    ? selectedExercise.name ||
                      `Exercise #${selectedExercise.id}`
                    : "ยังไม่ได้เลือกท่า"}
                </h3>

              </div>

            </div>

            {/* Timer */}

            <div className="workout-timer">

              <span>
                WORKOUT TIME
              </span>

              <strong>
                {formatDuration(
                  duration
                )}
              </strong>

            </div>

            {/* Future AI Status */}

            <div className="ai-workout-status">

  <div className="ai-status-item">

    <span>
      🤖 AI Pose
    </span>

    <strong>
      {!cameraActive
        ? "Waiting"
        : poseDetected
        ? "Detected"
        : "Searching..."}
    </strong>

  </div>

  <div className="ai-status-item">

    <span>
      📐 Knee Angle
    </span>

    <strong>
      {poseAnalysis?.averageKneeAngle
        ? `${poseAnalysis.averageKneeAngle}°`
        : "--"}
    </strong>

  </div>

  <div className="ai-status-item">

    <span>
      ✓ Form
    </span>

    <strong>
      {!poseDetected
        ? "Waiting"
        : poseAnalysis?.kneeStatus ||
          "Analyzing..."}
    </strong>

  </div>

</div>

            {/* Actions */}

            {!isWorkoutStarted ? (
              <button
                type="button"
                className="workout-start-button"
                onClick={
                  startWorkout
                }
                disabled={
                  !selectedExercise ||
                  cameraLoading
                }
              >
                ▶️ Start AI Workout
              </button>
            ) : (
              <button
                type="button"
                className="workout-finish-button"
                onClick={
                  stopWorkout
                }
              >
                ⏹️ หยุด Workout
              </button>
            )}

          </div>

        </section>

        {/* =====================================
            AI Information
        ===================================== */}

        <section className="workout-card ai-info-card">

          <div className="ai-info-icon">
            🤖
          </div>

          <div>

            <h2>
              AI Trainer
            </h2>

            <p>
              ระบบกำลังเตรียมสำหรับ
              Pose Detection, Rep Counter
              และ Real-time Form Analysis
            </p>

            <div className="ai-roadmap">

              <span className="roadmap-active">
                ✓ Camera
              </span>

              <span className="roadmap-active">
                ✓ Pose Detection
              </span>

              <span>
                ○ Rep Counter
              </span>

              <span className="roadmap-active">
                ✓ Form Analysis
              </span>

              <span>
                ○ 3D Avatar
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Workout;
