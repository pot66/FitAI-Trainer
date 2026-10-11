import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import api from "./services/api";
import PoseDetector from "./PoseDetector";
import UnityWorkout3D, { EXERCISES_3D_CATALOG, has3DAnimation } from "./UnityWorkout3D";
import { createExerciseEngine } from "./ai/exerciseEngine";
import { cleanExerciseName, createPersonalizedWeeklyPlan } from "./ai/recommendationEngine";
import {
  markExerciseCompletedToday,
  getTodayCompletedExercises,
  isExerciseCompletedToday,
} from "./utils/workoutCompletionUtils";
import {
  IconCube,
  IconDumbbell,
  IconFlame,
  IconTrophy,
  IconTarget,
  IconCheck,
  IconAlert,
  IconCamera,
  IconScreen,
  IconSplit,
  IconSettings,
  IconClock,
  IconZap,
  IconSave,
  IconVolumeOn,
  IconVolumeOff,
  IconBot,
  IconThinking,
  IconMic,
  IconClose,
  renderEncouragementIcon
} from "./WorkoutIcons";
import {
  speakText,
  stopSpeech,
  speakAnimeMentorCue,
  ANIME_MENTOR_PHRASES,
  ANIME_MENTOR_VOICE_CONFIG
} from "./utils/speechUtils";

function Workout({ onBack }) {
  // Exercise & Plan
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [todayCompleted, setTodayCompleted] = useState(() => getTodayCompletedExercises());

  useEffect(() => {
    const handleCompleted = () => {
      setTodayCompleted(getTodayCompletedExercises());
    };
    window.addEventListener("fitai-workout-completed", handleCompleted);
    return () => window.removeEventListener("fitai-workout-completed", handleCompleted);
  }, []);
  // 3D Exercises Catalog and Filter Tabs
  const [exercises3D, setExercises3D] = useState([]);
  const [allDbExercises, setAllDbExercises] = useState([]);
  const [scheduledExercises, setScheduledExercises] = useState([]);
  const [exerciseFilterTab, setExerciseFilterTab] = useState("3d"); // "3d" | "scheduled" | "all"
  const [selected3DCategory, setSelected3DCategory] = useState("all");

  const displayedExercises = useMemo(() => {
    if (exerciseFilterTab === "3d") {
      if (selected3DCategory === "all") return exercises3D;
      return exercises3D.filter((ex) => (ex.category || "").toLowerCase() === selected3DCategory.toLowerCase());
    }
    if (exerciseFilterTab === "scheduled") {
      return scheduledExercises.length > 0 ? scheduledExercises : exercises3D;
    }
    return allDbExercises.length > 0 ? allDbExercises : exercises3D;
  }, [exerciseFilterTab, selected3DCategory, exercises3D, scheduledExercises, allDbExercises]);

  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Call & Workout State
  const [duration, setDuration] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [isCallActive, setIsCallActive] = useState(true);
  const [viewMode, setViewMode] = useState("3d"); // "3d" | "camera" | "split"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  // Audio / Mute & Coach Speaking
  const [isMuted, setIsMuted] = useState(false);
  const [cheerSoundEnabled, setCheerSoundEnabled] = useState(
    () => localStorage.getItem("fitai-cheer-sound") !== "false"
  );
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);

  // Camera & Vision AI
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("user"); // "user" | "environment"
    const [poseDetected, setPoseDetected] = useState(false);
    const exerciseEngineRef = useRef(null);
  const [aiResult, setAiResult] = useState(null);

  // Live Encouragement & Voice Feedback
  const [encouragement, setEncouragement] = useState({
    message: "พร้อมลุย! จัดตำแหน่งหน้ากล้องแล้วเริ่มออกกำลังกายตามโมเดล 3D ได้เลยครับ",
    iconType: "flame",
    showBanner: true,
    rep: 0,
  });
  const lastRepCountRef = useRef(0);
  const lastCheerTimeRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const cheerTimerRef = useRef(null);

  // Voice Coach Interaction (Talking to Coach)
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const voiceRecognitionRef = useRef(null);
  const voiceSessionRef = useRef(null);

  // Container ref for fullscreen
  const containerRef = useRef(null);

  // 1. Initial Load of Exercises & Active Day's Scheduled Poses
  useEffect(() => {
    let isMounted = true;
    const loadExercises = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/exercises");
        const items = response.data?.data || [];
        if (!isMounted) return;

        // Determine active day schedule:
        // Priority 1: sessionStorage "fitai-active-plan" (when user clicked from a specific day in WorkoutPlan)
        // Priority 2: localStorage "fitai-weekly-plan" for today's dayKey
        // Priority 3: Generate personalized weekly plan from profile
        const todayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
        let daySchedule = null;

        const savedPlanStr = sessionStorage.getItem("fitai-active-plan");
        if (savedPlanStr) {
          try {
            daySchedule = JSON.parse(savedPlanStr);
          } catch (e) {
            console.warn("Could not parse fitai-active-plan:", e);
          }
        }

        if (!daySchedule) {
          try {
            const uid = getCurrentUserId();
            const userPlanKey = uid ? `fitai-weekly-plan-user-${uid}` : "fitai-weekly-plan";
            const weeklyPlanRaw = localStorage.getItem(userPlanKey) || localStorage.getItem("fitai-weekly-plan");
            if (weeklyPlanRaw) {
              const weeklyPlan = JSON.parse(weeklyPlanRaw);
              if (Array.isArray(weeklyPlan) && weeklyPlan.length > 0) {
                daySchedule = weeklyPlan.find((d) => d.key === todayKey) || weeklyPlan[0];
              }
            }
          } catch (e) {
            console.warn("Could not parse fitai-weekly-plan:", e);
          }
        }

        if (!daySchedule) {
          try {
            const profileRes = await api.get("/profile/me");
            const userProfile = profileRes.data?.data || {};
            const generated = createPersonalizedWeeklyPlan(userProfile, items);
            if (generated?.plan && Array.isArray(generated.plan)) {
              daySchedule = generated.plan.find((d) => d.key === todayKey) || generated.plan[0];
            }
          } catch (e) {
            console.warn("Could not fetch profile for workout plan:", e);
          }
        }

        // Extract ONLY the exercises that belong to this day's schedule
        let scheduledExercises = [];
        if (daySchedule) {
          if (Array.isArray(daySchedule.exercises) && daySchedule.exercises.length > 0) {
            scheduledExercises = daySchedule.exercises;
          } else if (daySchedule.exerciseName && daySchedule.exerciseName !== "Rest") {
            scheduledExercises = [{
              name: daySchedule.exerciseName,
              sets: daySchedule.sets || 3,
              repetitions: daySchedule.repetitions || "10-12 ครั้ง"
            }];
          }
        }

        const scheduledList = [];
        const seenNames = new Set();

        for (const planEx of scheduledExercises) {
          const rawName = typeof planEx === "string" ? planEx : planEx.name;
          if (!rawName || rawName === "Rest") continue;
          const cleanName = cleanExerciseName(rawName);
          const targetClean = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

          // Find matching exercise in DB items to obtain id, category, thName, instructions
          let matched = items.find((dbEx) => {
            const itemClean = dbEx.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return itemClean === targetClean || itemClean.includes(targetClean) || targetClean.includes(itemClean);
          });

          const canonicalName = matched ? matched.name : cleanName;
          if (seenNames.has(canonicalName.toLowerCase())) continue;
          seenNames.add(canonicalName.toLowerCase());

          if (matched) {
            scheduledList.push({
              ...matched,
              sets: planEx.sets || matched.sets || 3,
              repetitions: planEx.repetitions || matched.repetitions || "10-12 ครั้ง",
              planReason: planEx.reason || daySchedule.reason || "",
            });
          } else {
            scheduledList.push({
              id: planEx.id || rawName,
              name: cleanName,
              thName: planEx.thName || cleanName,
              category: daySchedule.focus || "General",
              sets: planEx.sets || 3,
              repetitions: planEx.repetitions || "10-12 ครั้ง",
              planReason: planEx.reason || daySchedule.reason || "",
            });
          }
        }

        // 1. Build list of 14 exercises with genuine 3D models and link with DB IDs
        const catalog3DWithDb = EXERCISES_3D_CATALOG.map((catItem) => {
          const dbMatch = items.find((dbEx) => {
            const n1 = dbEx.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const n2 = catItem.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return n1 === n2 || n1.includes(n2) || n2.includes(n1);
          });
          return {
            ...catItem,
            id: dbMatch?.id || catItem.id,
            has3D: true,
            dbId: dbMatch?.id,
            description: dbMatch?.description || `${catItem.name} (${catItem.thName}) - ท่าออกกำลังกายพร้อมโมเดล 3D`,
            instructions: dbMatch?.instructions || "",
            sets: 3,
            repetitions: "10-15 ครั้ง",
          };
        });

        setAllDbExercises(items);
        setExercises3D(catalog3DWithDb);
        setScheduledExercises(scheduledList);
        setExercises(catalog3DWithDb);

        setActivePlan(daySchedule || {
          exerciseName: scheduledList[0]?.name || catalog3DWithDb[0]?.name || "Squat",
          sets: 3,
          repetitions: "10-12 ครั้ง",
          focus: "การออกกำลังกาย 3D",
          exercises: scheduledList.length > 0 ? scheduledList : catalog3DWithDb,
        });

        // Determine currently active/selected exercise
        let assignedExercise = null;
        if (daySchedule?.exerciseName) {
          const targetClean = cleanExerciseName(daySchedule.exerciseName).toLowerCase().replace(/[^a-z0-9]/g, "");
          // Look first in 3D catalog
          assignedExercise = catalog3DWithDb.find((ex) => {
            const itemClean = ex.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return itemClean === targetClean || itemClean.includes(targetClean) || targetClean.includes(itemClean);
          });
          // Then in scheduled list
          if (!assignedExercise) {
            assignedExercise = scheduledList.find((ex) => {
              const itemClean = ex.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              return itemClean === targetClean || itemClean.includes(targetClean) || targetClean.includes(itemClean);
            });
          }
        }
        if (!assignedExercise && catalog3DWithDb.length > 0) {
          assignedExercise = catalog3DWithDb[0];
        }

        if (assignedExercise) {
          setSelectedExercise(assignedExercise);
          exerciseEngineRef.current = createExerciseEngine(assignedExercise);
        }
      } catch (err) {
        console.error("Load Exercises Error:", err);
        if (isMounted) setError("ไม่สามารถโหลดรายการท่าออกกำลังกายได้");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadExercises();

    // Initial greeting from Coach FitAI
    const greetingTimer = setTimeout(() => {
      if (cheerSoundEnabled && !isMuted) {
        speakWithCoachState("start");
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(greetingTimer);
      if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
      stopSpeech();
    };
  }, []);

  // 2. Call Duration Timer (counts up every second)
  useEffect(() => {
    if (!isCallActive) return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCallActive]);

  // 3. Periodic Encouragement while training
  useEffect(() => {
    if (!isCallActive) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastCheerTimeRef.current > 18000) {
        lastCheerTimeRef.current = now;
        const idleCheers = ANIME_MENTOR_PHRASES.idle_cues;
        const randomCheer = idleCheers[Math.floor(Math.random() * idleCheers.length)];
        setEncouragement({
          message: randomCheer,
          iconType: "flame",
          showBanner: true,
          rep: lastRepCountRef.current,
        });

        if (cheerSoundEnabled && !isMuted) {
          speakWithCoachState("idle", { phrase: randomCheer });
        }

        if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
        cheerTimerRef.current = setTimeout(() => {
          setEncouragement((prev) => ({ ...prev, showBanner: false }));
        }, 4000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isCallActive, cheerSoundEnabled, isMuted]);

  // Helper: Speak with Speaking Indicator State
  const speakWithCoachState = (cueType, cueParams = {}) => {
    if (isMuted) return;
    setIsCoachSpeaking(true);
    speakAnimeMentorCue(
      cueType,
      cueParams,
      {
        onStart: () => setIsCoachSpeaking(true),
        onEnd: () => setIsCoachSpeaking(false),
        onError: () => setIsCoachSpeaking(false),
      }
    );
  };

  // Helper: Format call duration e.g. "00:02:34"
  const formatCallDuration = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // 4. Camera Stream Handling
  const startCamera = async (overrideFacingMode = null) => {
    const targetFacing = overrideFacingMode || facingMode;
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
        video: { facingMode: targetFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
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
        message = "กรุณาให้สิทธิ์การใช้งานกล้องใน Browser";
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
    setPoseDetected(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const flipCamera = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (cameraActive) {
      await startCamera(nextMode);
    }
  };

  // Ensure video stream remains attached when user switches viewMode (3d <-> camera <-> split)
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => console.log("Video play on viewMode change error:", err));
      }
    }
  }, [viewMode, cameraActive]);


  // 5. AI Pose Detection & Realtime Encouragement (Throttled & High-Performance)
  const lastPoseDetectedStateRef = useRef(false);
  const lastResultTimeRef = useRef(0);

  const handlePoseDetected = useCallback((landmarks) => {
    const detected = Boolean(landmarks && landmarks.length >= 33);
    if (detected !== lastPoseDetectedStateRef.current) {
      lastPoseDetectedStateRef.current = detected;
      setPoseDetected(detected);
    }
    if (!detected || !selectedExercise) return;

    if (!exerciseEngineRef.current) {
      exerciseEngineRef.current = createExerciseEngine(selectedExercise);
    }
    const result = exerciseEngineRef.current.process(landmarks);
    if (!result) return;

    const now = Date.now();
    const repChanged = result.reps !== undefined && result.reps !== lastRepCountRef.current;

    if (repChanged) {
      lastRepCountRef.current = result.reps;
      setAiResult(result);
      triggerRepEncouragement(result.reps, result.form === "correct");
    } else if (now - lastResultTimeRef.current > 100) {
      lastResultTimeRef.current = now;
      setAiResult(result);
    }

    if (result.form && result.form !== "correct" && result.feedback) {
      if (now - lastWarningTimeRef.current > 7500 && now - lastCheerTimeRef.current > 3000) {
        lastWarningTimeRef.current = now;
        let warningCue = "รักษาหลังให้ตรงครับ";
        const fb = result.feedback.toLowerCase();
        if (fb.includes("ย่อ") || fb.includes("ต่ำ") || fb.includes("ลึก")) {
          warningCue = "ค่อย ๆ ย่อตัวลงช้าๆ ครับ";
        } else if (fb.includes("หลัง") || fb.includes("ตรง") || fb.includes("ลำตัว")) {
          warningCue = "รักษาหลังให้ตรงครับ";
        } else if (fb.includes("เร็ว") || fb.includes("รีบ") || fb.includes("หายใจ")) {
          warningCue = "ค่อย ๆ หายใจ ควบคุมจังหวะครับ";
        }

        if (cheerSoundEnabled && !isMuted) {
          speakWithCoachState("warning", { phrase: warningCue });
        }
        setEncouragement({
          message: warningCue,
          iconType: "alert",
          showBanner: true,
          rep: lastRepCountRef.current,
        });

        if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
        cheerTimerRef.current = setTimeout(() => {
          setEncouragement((prev) => ({ ...prev, showBanner: false }));
        }, 3500);
      }
    }
  }, [selectedExercise, cheerSoundEnabled, isMuted]);

  const triggerRepEncouragement = (currentReps, isFormCorrect = true) => {
    const now = Date.now();
    const canSpeak = now - lastCheerTimeRef.current > 2200;

    const targetRepsMatch = String(activePlan?.repetitions || "10-12").match(/\d+/);
    const targetReps = targetRepsMatch ? Number(targetRepsMatch[0]) : 10;

    let cheerMsg = "";
    let iconType = "flame";
    let cueType = "rep";

    if (!isFormCorrect) {
      cheerMsg = "รักษาหลังให้ตรงครับ ค่อย ๆ ย่อตัวลง";
      iconType = "alert";
      cueType = "warning";
    } else {
      cheerMsg = ANIME_MENTOR_PHRASES.getRepCue(currentReps, targetReps);
      iconType = currentReps >= targetReps ? "trophy" : "flame";
      cueType = targetReps - currentReps <= 3 ? "rep_count" : "form_praise";
    }

    setEncouragement({
      message: cheerMsg,
      iconType,
      showBanner: true,
      rep: currentReps,
    });

    if (canSpeak && cheerSoundEnabled && !isMuted) {
      lastCheerTimeRef.current = now;
      speakWithCoachState(cueType, { rep: currentReps, target: targetReps, phrase: cheerMsg });
    }

    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
    cheerTimerRef.current = setTimeout(() => {
      setEncouragement((prev) => ({ ...prev, showBanner: false }));
    }, 3800);
  };

  // 6. Select Exercise Switcher
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    exerciseEngineRef.current = createExerciseEngine(exercise);
    lastRepCountRef.current = 0;
    setAiResult(null);
    setShowMoreDrawer(false);

    const switchMsg = `สลับมาฝึกท่า ${exercise.thName || exercise.name} แล้วครับ ดูฟอร์ม 3D แล้วเริ่มลุยได้เลย!`;
    setEncouragement({
      message: switchMsg,
      iconType: "dumbbell",
      showBanner: true,
      rep: 0,
    });

    if (cheerSoundEnabled && !isMuted) {
      speakWithCoachState("start");
    }

    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
    cheerTimerRef.current = setTimeout(() => {
      setEncouragement((prev) => ({ ...prev, showBanner: false }));
    }, 3500);
  };

  // 7. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Helper ตรวจสอบว่าผู้ใช้ออกท่าครบตามจำนวนเซ็ตหรือจำนวนครั้งที่กำหนดหรือไม่
  const evaluateWorkoutGoal = useCallback((reps = 0, currentDuration = 0, exercise = selectedExercise, plan = activePlan) => {
    const targetSets = Number(exercise?.sets || plan?.sets || 3);
    const repsStr = String(exercise?.repetitions || plan?.repetitions || "10-12");
    const exNameLower = String(exercise?.name || "").toLowerCase().trim();
    const isTimed =
      repsStr.includes("วินาที") ||
      repsStr.includes("นาที") ||
      ["plank", "side plank", "arm circles", "cat cow"].includes(exNameLower);

    let targetRepsPerSet = 12;
    const repsMatch = repsStr.match(/\d+/);
    if (repsMatch) targetRepsPerSet = Number(repsMatch[0]);

    let targetSeconds = 60;
    if (repsStr.includes("วินาที")) {
      const sm = repsStr.match(/(\d+)\s*วินาที/);
      if (sm) targetSeconds = Number(sm[1]);
    } else if (repsStr.includes("นาที")) {
      const mm = repsStr.match(/(\d+)\s*นาที/);
      if (mm) targetSeconds = Number(mm[1]) * 60;
    }

    const totalTarget = isTimed ? targetSeconds : targetSets * targetRepsPerSet;
    const currentCount = isTimed ? currentDuration : reps;

    const completedSets = isTimed
      ? (currentDuration >= targetSeconds ? targetSets : Math.floor((currentDuration / Math.max(1, targetSeconds)) * targetSets))
      : Math.min(targetSets, Math.floor(reps / Math.max(1, targetRepsPerSet)));

    const currentSetNum = Math.min(
      targetSets,
      isTimed
        ? Math.floor((currentDuration / Math.max(1, targetSeconds)) * targetSets) + 1
        : Math.floor(reps / Math.max(1, targetRepsPerSet)) + 1
    );

    const isGoalReached = isTimed ? currentDuration >= targetSeconds : reps >= totalTarget;
    const missingCount = Math.max(0, totalTarget - currentCount);
    const missingSets = Math.max(0, targetSets - completedSets);
    const completionPercent = Math.min(100, Math.round((currentCount / Math.max(1, totalTarget)) * 100));

    return {
      isTimed,
      targetSets,
      targetRepsPerSet,
      targetSeconds,
      totalTarget,
      currentCount,
      completedSets,
      currentSetNum,
      isGoalReached,
      missingCount,
      missingSets,
      completionPercent,
    };
  }, [selectedExercise, activePlan]);

  // 8. End Call & Save Workout with Goal Completion Check
  const handleEndCallClick = () => {
    setShowEndCallModal(true);
    const totalReps = aiResult?.reps || 0;
    const goalAudit = evaluateWorkoutGoal(totalReps, duration, selectedExercise, activePlan);

    // AI Coach Voice Feedback based on completion check
    if (cheerSoundEnabled && !isMuted) {
      if (goalAudit.isGoalReached) {
        speakText(`ยอดเยี่ยมมากครับ! คุณออกท่าครบตามเป้าหมายทั้ง ${goalAudit.targetSets} เซ็ต เรียบร้อยแล้วครับ`);
      } else {
        const unit = goalAudit.isTimed ? "วินาที" : "ครั้ง";
        speakText(`ระบบ AI ตรวจพบว่าคุณยังออกท่าไม่ครบตามเป้าหมายนะครับ ยังขาดอีก ${goalAudit.missingCount} ${unit} จะสู้ต่อให้ครบเซ็ตไหมครับ?`);
      }
    }
  };

  const handleConfirmSaveWorkout = async () => {
    try {
      setIsSavingWorkout(true);
      const totalReps = aiResult?.reps || 0;
      const goalAudit = evaluateWorkoutGoal(totalReps, duration, selectedExercise, activePlan);

      // คำนวณคะแนนตามสัดส่วนการออกจริง
      const baseScore = goalAudit.isGoalReached
        ? Math.round(90 + Math.random() * 8)
        : Math.max(60, Math.round(70 + (goalAudit.completionPercent / 100) * 20));
      const score = Math.min(100, Math.max(60, baseScore));

      const savedReps = goalAudit.isTimed ? 0 : totalReps;

      // ตรวจสอบความสมบูรณ์: บันทึกสถานะว่าออกแล้วเฉพาะเมื่อออกครบตามเป้าหมาย (isGoalReached === true) เท่านั้น
      // หากผู้ใช้หยุดก่อนหรือออกไม่ครบตามเป้าหมาย จะบันทึกประวัติการออกกำลังกายตามจริง แต่ยังไม่ขึ้นสถานะว่าออกสำเร็จในแผน
      if (selectedExercise?.name && goalAudit.isGoalReached) {
        markExerciseCompletedToday(selectedExercise.name);
      }

      if (selectedExercise?.id) {
        await api.post("/workouts", {
          exerciseId: Number(selectedExercise.id),
          repetitions: savedReps,
          duration: duration,
          score: score,
          startedAt: startedAt,
          completedAt: new Date().toISOString(),
        });
      }
    } catch (saveErr) {
      console.warn("Could not save workout session to API:", saveErr.message);
    } finally {
      setIsSavingWorkout(false);
      setShowEndCallModal(false);
      stopCamera();
      stopSpeech();
      onBack();
    }
  };

  const handleCancelEndCall = () => {
    setShowEndCallModal(false);
  };

  // 9. Voice Coach Mic Query (กดเปิดปิดไมค์เพื่อพูดคุยกับโค้ช)
  const toggleVoiceCoach = () => {
    if (voiceListening) {
      voiceRecognitionRef.current?.stop();
      setVoiceListening(false);
      setEncouragement((prev) => ({ ...prev, showBanner: false }));
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("เบราว์เซอร์นี้ไม่รองรับการสั่งงานด้วยเสียง กรุณาใช้ Google Chrome หรือ Microsoft Edge");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "th-TH";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => {
      setVoiceListening(true);
      setEncouragement({
        message: "กำลังฟังเสียงของคุณ... พูดได้เลยครับ (ถามฟอร์มท่าหรือคำแนะนำ)",
        iconType: "mic",
        showBanner: true,
        rep: lastRepCountRef.current,
      });
    };
    recognition.onend = () => {
      setVoiceListening(false);
    };
    recognition.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);
      setVoiceListening(false);
      if (event.error === "not-allowed") {
        alert("กรุณาอนุญาตการเข้าถึงไมโครโฟนในเบราว์เซอร์");
      }
    };
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript.trim();
      setVoiceTranscript(text);
      setVoiceLoading(true);
      setEncouragement({
        message: `คุณพูดว่า: "${text}" (AI กำลังคิดคำตอบ...)`,
        iconType: "thinking",
        showBanner: true,
        rep: lastRepCountRef.current,
      });
      try {
        if (!voiceSessionRef.current) {
          const created = await api.post("/chat/sessions", { title: "Voice Call Coach" });
          voiceSessionRef.current = created.data?.data?.id;
        }
        const response = await api.post("/chat/messages", {
          sessionId: voiceSessionRef.current,
          message: text,
          activePlan,
        });
        const reply = response.data?.data?.assistantMessage?.content || "ยอดเยี่ยมมากครับ ออกกำลังกายต่อเนื่องต่อไปครับ";
        setVoiceReply(reply);
        setEncouragement({
          message: reply,
          iconType: "bot",
          showBanner: true,
          rep: lastRepCountRef.current,
        });
        if (!isMuted) {
          speakWithCoachState("default", { phrase: reply });
        }
      } catch (err) {
        console.warn("Voice Coach Error:", err);
      } finally {
        setVoiceLoading(false);
      }
    };
    voiceRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn("Recognition start error:", err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeech();
      voiceRecognitionRef.current?.stop();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] text-white flex flex-col items-center justify-center gap-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center font-black text-2xl animate-pulse shadow-lg shadow-sky-500/25">
          A
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <strong className="text-base font-bold text-white tracking-wide">กำลังโหลดระบบ 3D & Vision Camera...</strong>
          <span className="text-xs text-slate-400">เตรียมพร้อมสำหรับเซสชันออกกำลังกาย</span>
        </div>
      </div>
    );
  }

  const currentReps = aiResult?.reps ?? 0;
  const targetRepsMatch = String(activePlan?.repetitions || "10-12").match(/\d+/);
  const targetReps = targetRepsMatch ? Number(targetRepsMatch[0]) : 12;
  const estimatedCalories = Math.round(currentReps * 0.45 + (duration / 60) * 3.8);

  // การวิเคราะห์เป้าหมายสำหรับ Real-time HUD และ Modal สรุปผล
  const goalAudit = evaluateWorkoutGoal(currentReps, duration, selectedExercise, activePlan);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-[#080b11] text-white flex flex-col overflow-hidden font-sans select-none relative"
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER BAR (Video Call Theme from Mockup)         */}
      {/* ======================================================== */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-[2px]">
        {/* Left: Avatar 'A' badge + Online Dot + Title + Timer */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-sky-500/30">
              A
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080b11] animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                FitAI Trainer
              </span>
              {/* Speaking Equalizer Waves (Active when Coach is speaking) */}
              {isCoachSpeaking && (
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-1 inline-block" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-2 inline-block" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-soundwave-3 inline-block" />
                </div>
              )}
            </div>
            {/* Call Duration Timer e.g. 00:02:34 */}
            <span className="text-[11px] sm:text-xs font-mono text-slate-300 tracking-wider">
              {formatCallDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right Desktop Controls (Minimize, Maximize, Close) */}
        <div className="hidden sm:flex items-center gap-2.5 text-slate-300">
          <button
            type="button"
            onClick={() => {
              if (viewMode === "3d") setViewMode("split");
              else if (viewMode === "split") setViewMode("camera");
              else setViewMode("3d");
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/15 text-xs text-white rounded-lg border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
            title="สลับมุมมอง"
          >
            <IconScreen className="w-3.5 h-3.5 text-sky-400" />
            <span>{viewMode === "3d" ? "โมเดล 3D" : viewMode === "split" ? "แบ่งจอครึ่งๆ" : "กล้องหลัก"}</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? "ออกจากเต็มจอ" : "เต็มหน้าจอ"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleEndCallClick}
            className="p-1.5 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer ml-1"
            title="สิ้นสุดเซสชัน"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Right Mobile Controls (Flip Camera, More options) */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={flipCamera}
            className="p-2 text-slate-300 hover:text-white active:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="สลับกล้องหน้า/หลัง"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowMoreDrawer(true)}
            className="p-2 text-slate-300 hover:text-white active:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="ตัวเลือกเพิ่มเติม"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN CENTER STAGE (Only 3D Model and Camera!)         */}
      {/* ======================================================== */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-[#080b11]">
        {/* LAYOUT OPTION 1: 3D MODEL AS MAIN STAGE (Camera in PiP) */}
        {viewMode === "3d" && (
          <div className="w-full h-full relative flex items-center justify-center">
            <UnityWorkout3D
              exercise={selectedExercise?.name || "Squat"}
              isWorkoutStarted={isCallActive}
              repetitions={currentReps}
              theme="dark"
              hideHeader={true}
              className="w-full h-full rounded-none border-0"
            />
          </div>
        )}

        {/* LAYOUT OPTION 2: CAMERA AS MAIN STAGE (3D Model in PiP) */}
        {viewMode === "camera" && (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform -scale-x-100"
              autoPlay
              playsInline
              muted
            />

            {/* Live Real-time Pose Detection Hooks */}
            <PoseDetector
              videoRef={videoRef}
              active={cameraActive}
              onPoseDetected={handlePoseDetected}
            />
            
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d15]/90 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mb-3">
                  <IconCamera className="w-8 h-8 text-sky-400" />
                </div>
                <h3 className="text-lg font-bold text-white">กล้องยังไม่ได้เปิดใช้งาน</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                  กดปุ่ม "เปิดกล้อง" ด้านล่างเพื่อให้ AI ตรวจจับฟอร์มท่าและนับ Reps อัตโนมัติ
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold rounded-full text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  {cameraLoading ? "กำลังเปิดกล้อง..." : "เปิดกล้องทันที"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT OPTION 3: SPLIT VIEW (3D Model & Camera Side-by-Side!) */}
        {viewMode === "split" && (
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-3 p-3 pt-16 pb-20 sm:pb-24">
            {/* Left / Top: 3D Model */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0f141f]">
              <UnityWorkout3D
                exercise={selectedExercise?.name || "Squat"}
                isWorkoutStarted={isCallActive}
                repetitions={currentReps}
                theme="dark"
                hideHeader={true}
                className="w-full h-full rounded-2xl border-0"
              />
            </div>

            {/* Right / Bottom: Camera View */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                autoPlay
                playsInline
                muted
              />

              {/* Realtime Pose Detector */}
              <PoseDetector
                videoRef={videoRef}
                active={cameraActive}
                onPoseDetected={handlePoseDetected}
              />
              
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                <span>กล้อง AI ({cameraActive ? "ตรวจจับท่าสด" : "ปิดอยู่"})</span>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d15]/85 text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mb-2">
                    <IconCamera className="w-6 h-6 text-sky-400" />
                  </div>
                  <p className="text-xs text-slate-300 font-semibold mb-3">กล้องยังไม่ได้เปิดใช้งาน</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                  >
                    {cameraLoading ? "กำลังเปิด..." : "เปิดกล้อง"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* WORKOUT HUD: แสดงเฉพาะชื่อท่า และ จำนวนที่ทำ           */}
        {/* ====================================================== */}
        <div className="absolute top-16 sm:top-18 left-4 sm:left-6 z-20 pointer-events-auto flex flex-col gap-2 max-w-[90vw]">
          <div className="bg-[#121824]/90 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
            {/* ชื่อท่า */}
            <div className="flex items-center gap-2 flex-wrap">
              <IconDumbbell className="w-4 h-4 text-sky-400" />
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
                {selectedExercise?.name || "Squat"}
                {selectedExercise?.thName && (
                  <span className="text-slate-400 font-semibold ml-1.5 text-xs normal-case">
                    ({selectedExercise.thName})
                  </span>
                )}
              </span>
              {has3DAnimation(selectedExercise?.name) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1 shadow-xs">
                  <span>🧊</span>
                  <span>3D Model</span>
                </span>
              )}
            </div>

            <div className="h-4 w-[1px] bg-white/20" />

            {/* จำนวนที่ทำ & เซ็ต */}
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-400 font-bold">
                  จำนวนที่ทำ:
                </span>
                <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono tracking-tight">
                  {currentReps}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  /{goalAudit.totalTarget} {goalAudit.isTimed ? "วิ" : "ครั้ง"}
                </span>
              </div>

              <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-semibold">เซ็ต:</span>
                <span className="font-bold text-amber-300">
                  {goalAudit.currentSetNum}/{goalAudit.targetSets}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  goalAudit.isGoalReached
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                }`}>
                  {goalAudit.completionPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Switcher Filter Tabs & Pills */}
          <div className="flex flex-col gap-1.5 max-w-[88vw]">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setExerciseFilterTab("3d")}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm active:scale-95 ${
                  exerciseFilterTab === "3d"
                    ? "bg-sky-500 text-white border-sky-400 shadow-sky-500/30 ring-1 ring-sky-300"
                    : "bg-[#121824]/85 text-slate-300 border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>🧊</span>
                <span>ท่าโมเดล 3D ({exercises3D.length} ท่า)</span>
              </button>

              {scheduledExercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExerciseFilterTab("scheduled")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm active:scale-95 ${
                    exerciseFilterTab === "scheduled"
                      ? "bg-sky-500 text-white border-sky-400 shadow-sky-500/30 ring-1 ring-sky-300"
                      : "bg-[#121824]/85 text-slate-300 border-white/15 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>📅</span>
                  <span>ตารางวันนี้ ({scheduledExercises.length} ท่า)</span>
                </button>
              )}

              {allDbExercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExerciseFilterTab("all")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm active:scale-95 ${
                    exerciseFilterTab === "all"
                      ? "bg-sky-500 text-white border-sky-400 shadow-sky-500/30 ring-1 ring-sky-300"
                      : "bg-[#121824]/85 text-slate-300 border-white/15 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>📋</span>
                  <span>ท่าทั้งหมด ({allDbExercises.length})</span>
                </button>
              )}
            </div>

            {/* Quick Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[88vw] pb-1 scrollbar-none">
              {displayedExercises.map((item) => {
                const isSelected = (selectedExercise?.id && selectedExercise.id === item.id) || selectedExercise?.name === item.name;
                const isDone = isExerciseCompletedToday(item.name, todayCompleted);
                const is3D = has3DAnimation(item.name);
                return (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleSelectExercise(item)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border backdrop-blur-md shadow-md active:scale-95 shrink-0 ${
                      isSelected
                        ? "bg-sky-500 text-white border-sky-400 shadow-sky-500/30 ring-1 ring-sky-300"
                        : isDone
                        ? "bg-emerald-950/70 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900/80"
                        : "bg-[#121824]/80 text-slate-300 border-white/15 hover:bg-white/10 hover:text-white"
                    }`}
                    title={item.name + (isDone ? " (ออกแล้ววันนี้)" : "")}
                  >
                    {is3D && <span className="text-sky-300 text-[10px]">🧊</span>}
                    {isDone && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                    <span>{item.thName || item.name}</span>
                    {item.muscle && (
                      <span className={`text-[10px] ${isSelected ? "text-sky-100" : "text-slate-400"}`}>
                        ({item.muscle})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* LIVE AI COACH SPEECH SUBTITLE BANNER                   */}
        {/* ====================================================== */}
        {encouragement.showBanner && (
          <div className="absolute top-44 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[90vw] sm:max-w-xl transition-all duration-300">
            <div className="bg-black/75 backdrop-blur-xl border border-white/15 text-white font-semibold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5">
              <span className="p-1 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {renderEncouragementIcon(encouragement.iconType || "flame")}
              </span>
              <span className="text-xs sm:text-sm tracking-wide drop-shadow text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis">
                {encouragement.message}
              </span>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* 3. PICTURE-IN-PICTURE (PiP) WINDOW (Bottom-Right)      */}
        {/* When NOT in split view:                                */}
        {/* - In '3d' mode -> PiP displays User Camera             */}
        {/* - In 'camera' mode -> PiP displays 3D Model            */}
        {/* ====================================================== */}
        {viewMode !== "split" && (
          <div
            onClick={() => {
              if (viewMode === "3d" && !cameraActive) {
                startCamera();
              } else {
                setViewMode(viewMode === "3d" ? "camera" : "3d");
              }
            }}
            className="absolute bottom-22 sm:bottom-24 right-4 sm:right-6 w-36 h-28 sm:w-56 sm:h-38 rounded-2xl overflow-hidden border border-white/20 bg-[#121824]/90 shadow-2xl backdrop-blur-md z-30 transition-all duration-300 cursor-pointer group hover:scale-[1.03] hover:border-sky-400/50"
            title="คลิกเพื่อสลับมุมมองหน้าจอหลัก"
          >
            {/* If Main is 3D -> PiP is CAMERA */}
            {viewMode === "3d" && (
              <>
                {cameraActive ? (
                  <div className="relative w-full h-full bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover transform -scale-x-100"
                      autoPlay
                      playsInline
                      muted
                    />

                    {/* Pose Detection Hooks */}
                    <PoseDetector
                      videoRef={videoRef}
                      active={cameraActive}
                      onPoseDetected={handlePoseDetected}
                    />
                    
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1 border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>กล้องของคุณ</span>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-md p-1 text-[10px] text-white">
                      ⇄
                    </div>
                  </div>
                ) : (
                  /* Camera Off: Silhouette Avatar (Matching reference mockup!) */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2332] to-[#0f1520] text-slate-400 relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 shadow-inner group-hover:bg-white/15 transition-colors">
                      <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 mt-1.5 group-hover:text-sky-300 transition-colors">
                      {cameraLoading ? "กำลังเปิดกล้อง..." : "เปิดกล้อง"}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* If Main is CAMERA -> PiP is 3D MODEL */}
            {viewMode === "camera" && (
              <div className="relative w-full h-full bg-[#0d121c] flex items-center justify-center">
                <UnityWorkout3D
                  exercise={selectedExercise?.name || "Squat"}
                  isWorkoutStarted={isCallActive}
                  repetitions={currentReps}
                  theme="dark"
                  hideHeader={true}
                  className="w-full h-full pointer-events-none rounded-none border-0"
                />
                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1 border border-white/10">
                  <span className="flex items-center gap-1.5"><IconDumbbell className="w-3 h-3 text-sky-400" /> โมเดล 3D</span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-md p-1 text-[10px] text-white">
                  ⇄
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 4. BOTTOM CONTROLS DOCK (The exact 5 buttons!)           */}
      {/* 1) ปิดเสียง 2) ปิดกล้อง 3) จบ 4) สลับมุมมอง 5) เพิ่มเติม */}
      {/* ======================================================== */}
      <footer className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw]">
        <div className="flex items-center justify-center gap-3 sm:gap-6 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-[#131924]/90 backdrop-blur-2xl border border-white/15 shadow-2xl">
          {/* Button 1: เปิด/ปิดไมค์ เพื่อพูดคุย (Microphone Toggle) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={toggleVoiceCoach}
              disabled={voiceLoading}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                voiceListening
                  ? "bg-rose-500 text-white border-2 border-rose-300 shadow-lg shadow-rose-500/50 animate-pulse scale-105"
                  : voiceLoading
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
              title={
                voiceListening
                  ? "กดเพื่อปิดไมค์ (กำลังฟังเสียงคุณ)"
                  : voiceLoading
                  ? "AI กำลังคิดคำตอบ..."
                  : "กดเพื่อเปิดไมค์เพื่อพูดคุยกับโค้ช"
              }
            >
              {voiceLoading ? (
                /* Spinner / Loading Icon */
                <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-amber-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : voiceListening ? (
                /* Active Mic with Speaking Waves */
                <div className="relative flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              ) : (
                /* Idle Mic Icon */
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <span className="text-[10px] sm:text-xs font-medium">
              {voiceListening ? (
                <span className="text-rose-400 font-bold animate-pulse">ปิดไมค์</span>
              ) : voiceLoading ? (
                <span className="text-amber-300">AI คิด...</span>
              ) : (
                <span className="text-slate-300">เปิดไมค์</span>
              )}
            </span>
          </div>

          {/* Button 2: ปิดกล้อง / เปิดกล้อง (Camera) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={toggleCamera}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                !cameraActive
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
              title={cameraActive ? "ปิดกล้อง" : "เปิดกล้อง"}
            >
              {cameraActive ? (
                /* Video Cam On Icon */
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                /* Video Cam Off Icon */
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              )}
            </button>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium">
              {cameraActive ? "ปิดกล้อง" : "เปิดกล้อง"}
            </span>
          </div>

          {/* Button 3: จบ (Red Finish Workout Button) */}
          <div className="flex flex-col items-center gap-1 mx-1 sm:mx-2">
            <button
              type="button"
              onClick={handleEndCallClick}
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-all cursor-pointer"
              title="จบการฝึกซ้อม / สิ้นสุดเซสชัน"
            >
              {/* Stop / Finish Icon */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="5.5" y="5.5" width="13" height="13" rx="2.5" />
              </svg>
            </button>
            <span className="text-[10px] sm:text-xs text-rose-300 font-semibold">
              จบ
            </span>
          </div>

          {/* Button 4: สลับมุมมอง (Display / Screen Toggle) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (viewMode === "3d") setViewMode("split");
                else if (viewMode === "split") setViewMode("camera");
                else setViewMode("3d");
              }}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                viewMode === "split"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
              title="สลับมุมมอง (3D, แบ่งจอครึ่งๆ, กล้องหลัก)"
            >
              {/* Display / Monitor Icon */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium">
              {viewMode === "3d" ? "โมเดล 3D" : viewMode === "split" ? "แบ่งจอ" : "กล้องหลัก"}
            </span>
          </div>

          {/* Button 5: เพิ่มเติม (Three dots More Options) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setShowMoreDrawer(true)}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="ตัวเลือกเพิ่มเติม"
            >
              {/* Three dots horizontal */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium">
              เพิ่มเติม
            </span>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 5. MORE OPTIONS DRAWER / MODAL (เพิ่มเติม)                */}
      {/* ======================================================== */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div
            className="w-full sm:max-w-md bg-[#131924] border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <IconSettings className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">การตั้งค่าเซสชัน & ท่าฝึก</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            {/* 3D Model Catalog Gallery */}
            <div className="border border-sky-500/30 bg-sky-950/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🧊</span>
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                    เลือกดูท่าที่มีโมเดล 3D (14 ท่า):
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full">
                  Three.js 3D Models
                </span>
              </div>

              {/* Muscle Group Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { key: "all", label: "ทั้งหมด (14)" },
                  { key: "Leg", label: "ขา & สะโพก" },
                  { key: "Chest", label: "หน้าอก & ไหล่" },
                  { key: "Core", label: "แกนกลาง & ท้อง" },
                  { key: "Glutes", label: "ก้น" },
                  { key: "Back", label: "หลัง" },
                  { key: "Arms", label: "แขน" },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelected3DCategory(cat.key)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      selected3DCategory === cat.key
                        ? "bg-sky-500 text-white shadow-xs"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 3D Exercises Cards Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {exercises3D
                  .filter((catItem) => selected3DCategory === "all" || (catItem.category || "").toLowerCase() === selected3DCategory.toLowerCase())
                  .map((item) => {
                    const isSelected = (selectedExercise?.id && selectedExercise.id === item.id) || selectedExercise?.name === item.name;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectExercise(item)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-95 ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-400 text-white ring-1 ring-sky-300/60 shadow-md"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                            <span>🧊</span>
                            <span>{item.name}</span>
                          </span>
                          {isSelected && <span className="text-sky-400 text-xs font-bold">✓</span>}
                        </div>
                        <span className="text-[11px] text-sky-300/90 font-medium truncate">
                          {item.thName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          🎯 {item.muscle}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Exercise Switcher Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  หรือเลือกท่าจากรายการ:
                </label>
                <span className="text-[11px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                  {exercises3D.length} ท่า 3D
                </span>
              </div>
              <select
                value={selectedExercise?.id || selectedExercise?.name || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const ex = exercises3D.find((item) => String(item.id) === val || item.name === val)
                    || allDbExercises.find((item) => String(item.id) === val || item.name === val)
                    || scheduledExercises.find((item) => String(item.id) === val || item.name === val);
                  if (ex) handleSelectExercise(ex);
                }}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <optgroup label="🧊 ท่าที่มีโมเดล 3D (14 ท่า)">
                  {exercises3D.map((item) => (
                    <option key={`3d-${item.id}`} value={item.id} className="bg-[#131924] text-white">
                      🧊 {item.name} ({item.thName}) - {item.muscle}
                    </option>
                  ))}
                </optgroup>
                {scheduledExercises.length > 0 && (
                  <optgroup label="📅 ท่าตามตารางวันนี้">
                    {scheduledExercises.map((item) => (
                      <option key={`sch-${item.id || item.name}`} value={item.id || item.name} className="bg-[#131924] text-white">
                        📅 {item.name} {item.thName ? `(${item.thName})` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {allDbExercises.length > 0 && (
                  <optgroup label="📋 ท่าทั้งหมดในระบบ">
                    {allDbExercises.map((item) => (
                      <option key={`all-${item.id}`} value={item.id} className="bg-[#131924] text-white">
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* View Mode Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                เลือกรูปแบบหน้าจอ:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setViewMode("3d"); setShowMoreDrawer(false); }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    viewMode === "3d"
                      ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5"><IconDumbbell className="w-3.5 h-3.5" /> โมเดล 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode("split"); setShowMoreDrawer(false); }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    viewMode === "split"
                      ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5"><IconSplit className="w-3.5 h-3.5" /> แบ่งจอ 50/50</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode("camera"); setShowMoreDrawer(false); }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    viewMode === "camera"
                      ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5"><IconCamera className="w-3.5 h-3.5" /> กล้องเต็มจอ</span>
                </button>
              </div>
            </div>

            {/* Speaker Sound Output Mute Toggle */}
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <strong className="text-xs font-bold text-white block">เสียงพากย์โค้ช (Audio Sound)</strong>
                <span className="text-[11px] text-slate-400">{isMuted ? "ปิดเสียงลำโพงอยู่" : "เปิดเสียงลำโพงปกติ"}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMuted((prev) => {
                    const next = !prev;
                    if (next) stopSpeech();
                    return next;
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isMuted ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {isMuted ? (
                  <span className="flex items-center gap-1.5"><IconVolumeOff className="w-3.5 h-3.5" /> ปิดเสียงลำโพง</span>
                ) : (
                  <span className="flex items-center gap-1.5"><IconVolumeOn className="w-3.5 h-3.5" /> เปิดเสียงลำโพง</span>
                )}
              </button>
            </div>

            {/* Voice Cheer Toggle */}
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <strong className="text-xs font-bold text-white block">เสียงโค้ชให้กำลังใจ (Live Cheers)</strong>
                <span className="text-[11px] text-slate-400">คำชมและคำเตือนฟอร์มจากโค้ช AI อัตโนมัติ</span>
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
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  cheerSoundEnabled ? "bg-sky-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    cheerSoundEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Voice Question to Coach */}
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex flex-col gap-2">
              <strong className="text-xs font-bold text-white flex items-center gap-1.5">
                <IconMic className="w-4 h-4 text-sky-400" />
                <span>คุยกับ AI โค้ชด้วยเสียง</span>
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {voiceLoading
                  ? "AI กำลังคิดคำตอบ..."
                  : voiceReply || "กดปุ่มเพื่อถามคำถาม เช่น 'ย่อตัวลึกแค่ไหนดี' หรือ 'หายใจยังไง'"}
              </p>
              <button
                type="button"
                onClick={toggleVoiceCoach}
                disabled={voiceLoading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  voiceListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-sky-500 hover:bg-sky-400 text-white"
                }`}
              >
                <IconMic className="w-4 h-4" />
                <span>{voiceListening ? "กำลังฟังเสียงของคุณ..." : "กดเพื่อพูดคุยกับโค้ช"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreDrawer(false)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer mt-1"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. WORKOUT SUMMARY & END SESSION MODAL (ตรวจจับเป้าหมาย) */}
      {/* ======================================================== */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#131924] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center">
            
            {/* Header Icon & Status Badge */}
            {goalAudit.isGoalReached ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 text-emerald-950 animate-bounce">
                  <IconTrophy className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  <span>✓</span>
                  <span>ออกกำลังกายครบตามเป้าหมาย (100%)</span>
                </div>
                <h3 className="text-xl font-black text-white">ยอดเยี่ยม! ทำครบตามเป้าหมายแล้ว 🎉</h3>
                <p className="text-xs text-slate-300">
                  ระบบ AI ตรวจจับว่าคุณออกท่าครบทั้ง {goalAudit.targetSets} เซ็ต เต็มจำนวน {goalAudit.totalTarget} {goalAudit.isTimed ? "วินาที" : "ครั้ง"}!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 text-white animate-pulse">
                  <IconAlert className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                  <span>⚠️</span>
                  <span>ยังออกท่าไม่ครบตามเป้าหมาย ({goalAudit.completionPercent}%)</span>
                </div>
                <h3 className="text-xl font-black text-white">คุณยังออกท่าไม่ครบตามเป้าหมาย!</h3>
                <p className="text-xs text-slate-300">
                  ระบบ AI ตรวจพบว่าคุณยังออกท่าไม่ครบจำนวนเซ็ตหรือจำนวนครั้งที่กำหนด
                </p>
              </div>
            )}

            {/* Target vs Detected Audit Breakdown Card */}
            <div className={`p-4 rounded-2xl border text-left flex flex-col gap-3 ${
              goalAudit.isGoalReached
                ? "bg-emerald-950/25 border-emerald-500/35"
                : "bg-amber-950/25 border-amber-500/35"
            }`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <IconTarget className="w-3.5 h-3.5 text-sky-400" />
                  <span>ผลการตรวจจับท่า (Pose Detection Audit)</span>
                </span>
                <span className={`text-xs font-black font-mono ${
                  goalAudit.isGoalReached ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {goalAudit.completionPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    goalAudit.isGoalReached
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-amber-500 to-orange-400"
                  }`}
                  style={{ width: `${goalAudit.completionPercent}%` }}
                />
              </div>

              {/* Comparison Stats: Detected vs Target */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {goalAudit.isTimed ? "เวลาที่ทำได้จริง" : "จำนวนครั้งที่ AI ตรวจจับได้"}
                  </span>
                  <strong className="text-base font-black text-white font-mono mt-0.5 block">
                    {goalAudit.currentCount}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      / {goalAudit.totalTarget} {goalAudit.isTimed ? "วิ" : "ครั้ง"}
                    </span>
                  </strong>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase">จำนวนเซ็ต</span>
                  <strong className="text-base font-black text-white font-mono mt-0.5 block">
                    {goalAudit.completedSets}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      / {goalAudit.targetSets} เซ็ต
                    </span>
                  </strong>
                </div>
              </div>

              {/* Missing Summary Alert */}
              {!goalAudit.isGoalReached && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 text-xs text-amber-200 flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span>
                    ยังขาดอีก <strong>{goalAudit.missingCount} {goalAudit.isTimed ? "วินาที" : "ครั้ง"}</strong> (ขาดอีก <strong>{goalAudit.missingSets} เซ็ต</strong>) ออกต่ออีกนิดเพื่อสุขภาพและความฟิตเต็มร้อย!
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Overview (Time & Calories) */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-2xl border border-white/10 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <IconClock className="w-3 h-3 text-sky-400" /> เวลาทั้งหมด
                </span>
                <strong className="text-sm font-bold text-white font-mono">
                  {formatCallDuration(duration)}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <IconZap className="w-3 h-3 text-amber-400" /> แคลอรี่โดยประมาณ
                </span>
                <strong className="text-sm font-bold text-amber-300 font-mono">
                  ~{estimatedCalories} kcal
                </strong>
              </div>
            </div>

            {/* Action Buttons based on Goal Completion */}
            <div className="flex flex-col gap-2.5">
              {!goalAudit.isGoalReached ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEndCall}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🏃</span>
                    <span>ออกกำลังกายต่อให้ครบ (แนะนำ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmSaveWorkout}
                    disabled={isSavingWorkout}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 active:scale-95 text-slate-300 hover:text-white font-semibold rounded-2xl text-xs border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <IconSave className="w-3.5 h-3.5" />
                    <span>{isSavingWorkout ? "กำลังบันทึก..." : `ยืนยันหยุดและบันทึกตามจริง (${goalAudit.isTimed ? duration + " วินาที" : currentReps + " ครั้ง"})`}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleConfirmSaveWorkout}
                    disabled={isSavingWorkout}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <IconSave className="w-4 h-4" />
                    <span>{isSavingWorkout ? "กำลังบันทึกผล..." : "บันทึกและจบเซสชัน"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEndCall}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    ออกกำลังกายต่ออีกหน่อย
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workout;
