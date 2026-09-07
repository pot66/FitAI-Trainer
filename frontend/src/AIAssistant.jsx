import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Mic,
  Square,
  Send,
  Volume2,
  User,
  Settings,
  LogOut,
  ArrowRight,
  Plus,
  Dumbbell,
} from "lucide-react";

import api from "./services/api";

import {
  applyPlanAdjustment,
  createPersonalizedWeeklyPlan,
} from "./ai/recommendationEngine";
import ChatMessageContent from "./components/ChatMessageContent";

function AIAssistant({
  user,
  onProfile,
  onSettings,
  onWorkout,
  onBack,
  onLogout,
}) {
  // =====================================
  // State
  // =====================================

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [sessionId, setSessionId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [sessions, setSessions] = useState([]);

  // Weekly Plan
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [planProfile, setPlanProfile] = useState(null);
  const [planExercises, setPlanExercises] = useState([]);
  const [planSummary, setPlanSummary] = useState("");
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [planAnalytics, setPlanAnalytics] = useState(null);
  const [justUpdatedPlan, setJustUpdatedPlan] = useState(false);

  // Profile menu
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Chat context menu
  const [openSessionMenu, setOpenSessionMenu] = useState(null);

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] = useState(null);

  // =====================================
  // Refs
  // =====================================

  const recognitionRef = useRef(null);

  const shouldListenRef = useRef(false);

  const sessionIdRef = useRef(null);

  const profileMenuRef = useRef(null);

  const sessionMenuRef = useRef(null);

  const chatEndRef = useRef(null);

  // =====================================
  // Auto Scroll
  // =====================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =====================================
  // Close Profile Menu
  // =====================================

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (
        !profileMenuRef.current?.contains(
          event.target
        )
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      closeProfileMenu
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeProfileMenu
      );
    };
  }, []);

  // =====================================
  // Close Chat Context Menu
  // =====================================

  useEffect(() => {
    const closeSessionMenu = (event) => {
      if (
        !sessionMenuRef.current?.contains(
          event.target
        )
      ) {
        setOpenSessionMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      closeSessionMenu
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeSessionMenu
      );
    };
  }, []);

  // =====================================
  // Load Profile + Exercise Catalog
  // =====================================

  useEffect(() => {
    Promise.all([
      api.get("/profile/me"),
      api.get("/exercises"),
    ])
      .then(
        ([
          profileResponse,
          exerciseResponse,
        ]) => {
          const profile =
            profileResponse.data?.data || {};

          const exercises =
            exerciseResponse.data?.data || [];

          const generated =
            createPersonalizedWeeklyPlan(
              profile,
              exercises
            );

          const saved =
            localStorage.getItem(
              "fitai-weekly-plan"
            );

          let savedPlan = null;

          try {
            savedPlan = saved
              ? JSON.parse(saved)
              : null;
          } catch {
            savedPlan = null;
          }

          setPlanProfile(profile);
          setPlanExercises(exercises);

          setPlanSummary(
            generated.summary
          );

          const profileSignature = `${profile.id || profile.userId || ""}_${profile.height || ""}_${profile.weight || ""}_${profile.age || ""}_${profile.gender || ""}`;
          const savedSignature = localStorage.getItem("fitai-plan-signature");
          const isSameProfile = Boolean(savedSignature && savedSignature === profileSignature);

          const hasCurrentPlan =
            isSameProfile &&
            Array.isArray(savedPlan) &&
            savedPlan.every(
              (day) =>
                day.catalogVersion === 2 &&
                (
                  day.exerciseName ===
                  "Rest" ||
                  (
                    Array.isArray(
                      day.exercises
                    ) &&
                    day.exercises.length >= 5
                  )
                )
            );

          const planToUse =
            hasCurrentPlan
              ? savedPlan
              : generated.plan;

          setWeeklyPlan(planToUse);

          if (!hasCurrentPlan) {
            localStorage.setItem(
              "fitai-weekly-plan",
              JSON.stringify(planToUse)
            );
            localStorage.setItem(
              "fitai-plan-signature",
              profileSignature
            );
          }
        }
      )
      .catch((error) => {
        console.error(
          "Plan load error:",
          error
        );
      });
  }, []);

  // =====================================
  // Load Plan Analytics
  // =====================================

  useEffect(() => {
    if (
      !showPlanDetails ||
      planAnalytics
    ) {
      return;
    }

    api
      .get("/analytics/dashboard")
      .then((response) => {
        setPlanAnalytics(
          response.data?.data || null
        );
      })
      .catch((error) => {
        console.warn(
          "Plan analytics unavailable",
          error
        );
      });
  }, [
    showPlanDetails,
    planAnalytics,
  ]);

  // =====================================
  // Today Plan
  // =====================================

  const todayKey =
    [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][new Date().getDay()];

  const todayPlan =
    weeklyPlan.find(
      (day) =>
        day.key === todayKey
    );

  // =====================================
  // Start Workout Mode
  // =====================================

  const startWorkoutMode = (targetExercise = null) => {
    if (
      todayPlan &&
      todayPlan.exerciseName !== "Rest"
    ) {
      const planToStart = targetExercise
        ? {
            ...todayPlan,
            exerciseName: targetExercise.name,
            sets: targetExercise.sets || todayPlan.sets,
            repetitions: targetExercise.repetitions || todayPlan.repetitions,
          }
        : todayPlan;

      sessionStorage.setItem(
        "fitai-active-plan",
        JSON.stringify(planToStart)
      );
    }

    onWorkout();
  };

  // =====================================
  // New Chat
  // =====================================

  const createNewChat = () => {
    console.log(
      "Creating new chat"
    );

    setSessionId(null);

    setSelectedSessionId(null);

    sessionIdRef.current = null;

    setMessages([]);

    setMessage("");

    setOpenSessionMenu(null);

    // Stop AI Voice
    window.speechSynthesis?.cancel();

    setIsSpeaking(false);

    // Stop Voice Recognition
    shouldListenRef.current =
      false;

    if (
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Stop recognition error:",
          error
        );
      }

      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  // =====================================
  // Create Chat Session
  // =====================================

  const createSession = async (
    firstMessage = ""
  ) => {
    try {
      const cleanMessage =
        firstMessage.trim();

      const autoTitle =
        cleanMessage.length > 35
          ? cleanMessage.slice(0, 35) +
            "..."
          : cleanMessage ||
            "FitAI Assistant";

      console.log(
        "Creating session:",
        autoTitle
      );

      const response =
        await api.post(
          "/chat/sessions",
          {
            title: autoTitle,
          }
        );

      console.log(
        "Chat Session:",
        response.data
      );

      const id =
        response.data?.data?.id ||
        response.data?.data
          ?.session?.id;

      if (!id) {
        throw new Error(
          "ไม่พบ Session ID"
        );
      }

      setSessionId(id);

      setSelectedSessionId(id);

      sessionIdRef.current = id;

      const newSession = {
        id,
        title: autoTitle,
        messages: [],
      };

      setSessions((prev) => [
        newSession,
        ...prev,
      ]);

      return id;
    } catch (error) {
      console.error(
        "Create Session Error:",
        error
      );

      throw new Error(
        error.response?.data
          ?.message ||
          "ไม่สามารถสร้าง Chat Session ได้"
      );
    }
  };

  // =====================================
  // Load Chat History
  // =====================================

  const loadChatHistory = async () => {
    try {
      const response =
        await api.get(
          "/chat/sessions"
        );

      console.log(
        "Chat History:",
        response.data
      );

      const sessionList =
        response.data?.data || [];

      setSessions(sessionList);

      if (
        sessionList.length === 0
      ) {
        setSessionId(null);

        setSelectedSessionId(
          null
        );

        sessionIdRef.current =
          null;

        setMessages([]);

        return;
      }

      // Latest Session
      const latestSession =
        sessionList[0];

      const id =
        latestSession.id;

      setSessionId(id);

      setSelectedSessionId(id);

      sessionIdRef.current = id;

      const history =
        (
          latestSession.messages ||
          []
        ).map((item) => ({
          role:
            item.role === "user"
              ? "user"
              : "assistant",

          content:
            item.content,
        }));

      setMessages(history);
    } catch (error) {
      console.error(
        "Load Chat History Error:",
        error
      );
    }
  };

  // =====================================
  // Load History
  // =====================================

  useEffect(() => {
    loadChatHistory();
  }, []);

  // =====================================
  // Rename Chat
  // =====================================

  const renameChat = async (
    session
  ) => {
    const currentTitle =
      session.title ||
      "FitAI Assistant";

    const newTitle =
      window.prompt(
        "ตั้งชื่อ Chat ใหม่",
        currentTitle
      );

    if (newTitle === null) {
      return;
    }

    const title =
      newTitle.trim();

    if (!title) {
      alert(
        "กรุณาระบุชื่อ Chat"
      );

      return;
    }

    try {
      const response =
        await api.patch(
          `/chat/sessions/${session.id}`,
          {
            title,
          }
        );

      console.log(
        "Rename response:",
        response.data
      );

      setSessions((prev) =>
        prev.map((item) =>
          item.id === session.id
            ? {
                ...item,
                title,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Rename Chat Error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "ไม่สามารถเปลี่ยนชื่อ Chat ได้"
      );
    }
  };

  // =====================================
  // Delete Chat
  // =====================================

  const deleteChat = async (
    session
  ) => {
    const title =
      session.title ||
      "FitAI Assistant";

    const confirmed =
      window.confirm(
        `ต้องการลบ "${title}" หรือไม่?\n\nข้อความทั้งหมดใน Chat นี้จะถูกลบด้วย`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/chat/sessions/${session.id}`
      );

      console.log(
        "Deleted Chat:",
        session.id
      );

      setSessions((prev) =>
        prev.filter(
          (item) =>
            item.id !== session.id
        )
      );

      if (
        selectedSessionId ===
        session.id
      ) {
        setSelectedSessionId(
          null
        );

        setSessionId(null);

        sessionIdRef.current =
          null;

        setMessages([]);

        setMessage("");
      }

      setOpenSessionMenu(null);
    } catch (error) {
      console.error(
        "Delete Chat Error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "ไม่สามารถลบ Chat ได้"
      );
    }
  };

  // =====================================
  // Send Message
  // =====================================

  const sendMessage = async () => {
    if (
      !message.trim() ||
      loading
    ) {
      return;
    }

    const userMessage =
      message.trim();

    // =====================================
    // Generic Plan Change Request
    // =====================================

    const isStartingPlanChange =
      /^(?:ต้องการ|อยาก|ขอ)?\s*(?:เปลี่ยน|ปรับ)\s*(?:แผน|ตาราง)(?:\s*(?:ออกกำลังกาย|วันนี้))?[.!?]*$/i.test(
        userMessage
      );

    // =====================================
    // Local Plan Adjustment
    // =====================================

    let adjustment =
      applyPlanAdjustment(
        weeklyPlan,
        planProfile || {},
        planExercises,
        userMessage
      );

    if (isStartingPlanChange) {
      adjustment = {
        plan: weeklyPlan,
        changed: false,
      };
    }

    // =====================================
    // AI Plan Request Detection
    // =====================================

    const asksForAiPlan =
      /(แนะนำ.*(ท่า|แผน|ออกกำลัง)|เลือก.*ท่า|จัด.*แผน|suggest.*exercise|recommend.*exercise|เปลี่ยน|ปรับ|แก้ไข|กิจกรรม|แทน|สลับ|ขอลด|ขอเซ็ต)/i.test(
        userMessage
      );

    // =====================================
    // Ollama Plan Adjustment
    // =====================================

    if (
      adjustment.changed ||
      asksForAiPlan
    ) {
      try {
        const planResponse =
          await api.post(
            "/ai/plan-adjustment",
            {
              plan: weeklyPlan,
              message: userMessage,
              todayKey,
            },
            { timeout: 6000 }
          );

        const aiAdjustment =
          planResponse.data?.data;

        if (
          aiAdjustment?.changed &&
          Array.isArray(
            aiAdjustment.plan
          )
        ) {
          adjustment =
            aiAdjustment;
        }
      } catch (error) {
        console.warn(
          "Ollama plan adjustment unavailable; using safe local adjustment.",
          error
        );
      }
    }

    const activePlanForMessage =
      adjustment.changed
        ? adjustment.plan.find(
            (day) =>
              day.key === todayKey
          )
        : todayPlan;

    // =====================================
    // Save Updated Plan
    // =====================================

    if (adjustment.changed) {
      setWeeklyPlan(
        adjustment.plan
      );

      localStorage.setItem(
        "fitai-weekly-plan",
        JSON.stringify(
          adjustment.plan
        )
      );

      setJustUpdatedPlan(true);
      setTimeout(() => setJustUpdatedPlan(false), 8000);
    }

    // =====================================
    // Add User Message
    // =====================================

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");

    setLoading(true);

    try {
      let currentSessionId =
        sessionIdRef.current;

      // Create session if needed
      if (!currentSessionId) {
        currentSessionId =
          await createSession(
            userMessage
          );
      }

      // =====================================
      // Send Message To Backend
      // =====================================

      const response =
        await api.post(
          "/chat/messages",
          {
            sessionId:
              currentSessionId,

            message:
              userMessage,

            activePlan:
              activePlanForMessage,

            planUpdated:
              adjustment.changed,
          }
        );

      console.log(
        "Chat Response:",
        response.data
      );

      const data =
        response.data;

      // =====================================
      // Extract AI Response
      // =====================================

      let aiResponse =
        data.data
          ?.assistantMessage
          ?.content ||
        data.data
          ?.aiMessage
          ?.content ||
        data.data?.message ||
        data.message ||
        "";

      if (!aiResponse) {
        aiResponse = adjustment.changed
          ? adjustment.message
          : "ขออภัยครับ ไม่พบคำตอบจาก AI";
      }

      // =====================================
      // Add AI Message
      // =====================================

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            aiResponse,
        },
      ]);

      // =====================================
      // Update Session Messages
      // =====================================

      setSessions((prev) =>
        prev.map((session) =>
          session.id ===
          currentSessionId
            ? {
                ...session,

                messages: [
                  ...(session.messages ||
                    []),

                  {
                    role: "user",
                    content:
                      userMessage,
                  },

                  {
                    role: "assistant",
                    content:
                      aiResponse,
                  },
                ],
              }
            : session
        )
      );

      // =====================================
      // Text To Speech
      // =====================================

      speakAIResponse(
        aiResponse
      );
    } catch (error) {
      console.error(
        "Chat Error:",
        error
      );

      const isTimeout =
        error.code === "ECONNABORTED" ||
        /timeout/i.test(error.message || "");

      let fallbackText = "";
      if (isTimeout) {
        fallbackText =
          "ขออภัยครับ ขณะนี้ระบบประมวลผลนานกว่าปกติ FitAI ขอแนะนำท่าออกกำลังกายพื้นฐานที่คุณสามารถทำได้ทันทีครับ:\n\n" +
          "- Squat (3 เซ็ต, 10–12 ครั้ง)  ▶️ [วิดีโอสอน: Squat](https://youtu.be/fKrzVBsUIv4)\n" +
          "- Push-up (3 เซ็ต, 8–10 ครั้ง)  ▶️ [วิดีโอสอน: Push-up](https://youtu.be/s3z0w-82Y00)\n" +
          "- Plank (3 เซ็ต, 20–30 วินาที)  ▶️ [วิดีโอสอน: Plank](https://youtu.be/jDZsXIkwWQ4)\n" +
          "- Glute Bridge (3 เซ็ต, 12–15 ครั้ง)  ▶️ [วิดีโอสอน: Glute Bridge](https://youtu.be/tBSaB_cnVeE)\n\n" +
          "คุณสามารถส่งคำถามใหม่เพื่อสอบถามท่าอื่น ๆ หรือข้อมูลสุขภาพเพิ่มเติมได้เลยครับ";
      } else {
        const errorMsg =
          error.response?.data?.message ||
          "ขณะนี้ระบบการสื่อสารขัดข้องชั่วคราว กรุณาลองส่งข้อความใหม่อีกครั้งครับ";
        fallbackText = `⚠️ ${errorMsg}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Handle Input Key Down
  // =====================================

  const handleInputKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  // =====================================
  // Submit
  // =====================================

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    sendMessage();
  };

  // =====================================
  // Stop Speaking
  // =====================================

  const stopSpeaking = () => {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // =====================================
  // Text To Speech
  // =====================================

  const speakAIResponse = (
    text
  ) => {
    if (
      localStorage.getItem(
        "fitai-ai-voice-enabled"
      ) === "false"
    ) {
      return;
    }

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      console.log(
        "Browser ไม่รองรับ Text-to-Speech"
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang = "th-TH";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  // =====================================
  // Select Chat
  // =====================================

  const selectSession = (
    session
  ) => {
    console.log(
      "Selected session:",
      session
    );

    setSelectedSessionId(
      session.id
    );

    setSessionId(
      session.id
    );

    sessionIdRef.current =
      session.id;

    setOpenSessionMenu(null);

    const history =
      (
        session.messages || []
      ).map((item) => ({
        role:
          item.role === "user"
            ? "user"
            : "assistant",

        content:
          item.content,
      }));

    setMessages(history);

    stopSpeaking();
  };

  // =====================================
  // Voice Recognition
  // =====================================

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Browser นี้ไม่รองรับ Voice Recognition"
      );

      return;
    }

    // =====================================
    // STOP
    // =====================================

    if (
      shouldListenRef.current
    ) {
      console.log(
        "Stop voice"
      );

      shouldListenRef.current =
        false;

      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(
            "Stop recognition error:",
            error
          );
        }
      }

      setIsListening(false);

      return;
    }

    // =====================================
    // START
    // =====================================

    shouldListenRef.current =
      true;

    const recognition =
      new SpeechRecognition();

    recognition.lang = "th-TH";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log(
        "Voice started"
      );

      setIsListening(true);
    };

    recognition.onresult = (
      event
    ) => {
      let text = "";

      for (
        let i =
          event.resultIndex;
        i <
          event.results.length;
        i++
      ) {
        text +=
          event.results[i][0]
            .transcript;
      }

      setMessage(text);

      console.log(
        "Hearing:",
        text
      );
    };

    recognition.onerror = (
      event
    ) => {
      console.error(
        "Speech Error:",
        event.error
      );

      shouldListenRef.current =
        false;

      setIsListening(false);

      recognitionRef.current =
        null;
    };

    recognition.onend = () => {
      console.log(
        "Voice ended"
      );

      shouldListenRef.current =
        false;

      setIsListening(false);

      recognitionRef.current =
        null;
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Recognition Start Error:",
        error
      );

      shouldListenRef.current =
        false;

      setIsListening(false);

      recognitionRef.current =
        null;
    }
  };

  // =====================================
  // Cleanup
  // =====================================

  useEffect(() => {
    return () => {
      shouldListenRef.current =
        false;

      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(error);
        }
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  // =====================================
  // UI
  // =====================================

  return (
    <div className="assistant-page">

      {/* =====================================
          Sidebar
          ===================================== */}

      <aside className="assistant-sidebar">

        <div className="sidebar-header">

          <button
  type="button"
  className="new-chat-button"
  onClick={createNewChat}
>
  <Plus size={18} strokeWidth={2} />
  <span>New Chat</span>
</button>

          <button
  type="button"
  className="workout-mode-button"
  onClick={startWorkoutMode}
>
  <Dumbbell size={18} strokeWidth={2} />
  <span>Mode 3D</span>
</button>

        </div>

        <div className="sidebar-history-title">
          <span>ประวัติการแชท</span>
        </div>

        <div className="session-list">

          {sessions.length === 0 ? (
            <div className="empty-history">
              ยังไม่มีบทสนทนา
            </div>
          ) : (
            sessions.map(
              (session) => (

                <div
                  className="session-item-wrapper"
                  key={session.id}
                >

                  {/* ===========================
                      Chat
                      =========================== */}

                  <button
                    type="button"
                    className={
                      selectedSessionId ===
                      session.id
                        ? "session-item active"
                        : "session-item"
                    }
                    onClick={() =>
                      selectSession(
                        session
                      )
                    }
                  >

                    <strong>
                      {session.title ||
                        "FitAI Assistant"}
                    </strong>

                    <small>
                      {session.messages
                        ?.length ||
                        0}{" "}
                      messages
                    </small>

                  </button>

                  {/* ===========================
                      Chat Actions
                      =========================== */}

                  <div
                    className="session-actions"
                    ref={
                      openSessionMenu ===
                      session.id
                        ? sessionMenuRef
                        : null
                    }
                  >

                    <button
                      type="button"
                      className="session-more-button"
                      title="ตัวเลือก"
                      aria-label="ตัวเลือก Chat"
                      onMouseDown={(
                        event
                      ) => {
                        event.stopPropagation();
                      }}
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setOpenSessionMenu(
                          (current) =>
                            current ===
                            session.id
                              ? null
                              : session.id
                        );
                      }}
                    >
                      <MoreHorizontal
                        size={18}
                        strokeWidth={2}
                      />
                    </button>

                    {openSessionMenu ===
                      session.id && (
                      <div
                        className="session-context-menu"
                        role="menu"
                        onMouseDown={(
                          event
                        ) => {
                          event.stopPropagation();
                        }}
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();
                        }}
                      >

                        {/* Rename */}

                        <button
                          type="button"
                          className="context-menu-item"
                          onClick={() => {
                            setOpenSessionMenu(
                              null
                            );

                            renameChat(
                              session
                            );
                          }}
                        >
                          <Pencil
                            size={16}
                            strokeWidth={2}
                          />

                          <span>
                            เปลี่ยนชื่อ
                          </span>
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          className="context-menu-item danger"
                          onClick={() => {
                            setOpenSessionMenu(
                              null
                            );

                            deleteChat(
                              session
                            );
                          }}
                        >
                          <Trash2
                            size={16}
                            strokeWidth={2}
                          />

                          <span>
                            ลบ
                          </span>
                        </button>

                      </div>
                    )}

                  </div>

                </div>

              )
            )
          )}

        </div>

      </aside>

      {/* =====================================
          Main
          ===================================== */}

      <div className="assistant-main">

        {/* =====================================
            Top Bar
            ===================================== */}

        <div className="assistant-topbar">

          <div
            className="assistant-title"
            ref={profileMenuRef}
          >

            {/* Profile Button */}

            <button
              type="button"
              className="assistant-profile-button"
              onClick={() =>
                setProfileMenuOpen(
                  (open) => !open
                )
              }
              title="Profile"
              aria-label="เปิดเมนู Profile"
            >

              <span className="assistant-avatar">

                {user?.avatarUrl ||
                user?.profileImage ||
                user?.image ? (
                  <img
                    src={
                      user.avatarUrl ||
                      user.profileImage ||
                      user.image
                    }
                    alt={
                      user?.name ||
                      "User profile"
                    }
                  />
                ) : (
                  (
                    user?.name ||
                    "U"
                  )
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                )}

              </span>

              <span className="assistant-profile-copy">

                <strong>
                  {user?.name ||
                    "Profile"}
                </strong>

                <small>
                  Profile
                </small>

              </span>

            </button>

            {/* Profile Menu */}

            {profileMenuOpen && (
              <div
                className="profile-menu"
                role="menu"
              >

                {/* Account */}

                <button
                  className="profile-menu-account"
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(
                      false
                    );

                    onProfile();
                  }}
                >

                  <span className="profile-menu-avatar">
                    {(
                      user?.name ||
                      "U"
                    )
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span>
                    <strong>
                      {user?.name ||
                        "FitAI User"}
                    </strong>

                    <small>
                      {user?.email ||
                        "บัญชีผู้ใช้"}
                    </small>
                  </span>

                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                  />

                </button>

                <div className="profile-menu-divider" />

                {/* Profile */}

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(
                      false
                    );

                    onProfile();
                  }}
                >
                  <User
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    โปรไฟล์
                  </span>
                </button>

                {/* Settings */}

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(
                      false
                    );

                    onSettings();
                  }}
                >
                  <Settings
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    การตั้งค่า
                  </span>
                </button>

                <div className="profile-menu-divider" />

                {/* Logout */}

                <button
                  type="button"
                  className="profile-menu-logout"
                  onClick={() => {
                    setProfileMenuOpen(
                      false
                    );

                    onLogout();
                  }}
                >
                  <LogOut
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    ออกจากระบบ
                  </span>
                </button>

              </div>
            )}

            <div className="badge">
              AI FITNESS ASSISTANT
            </div>

            <h1>
              FitAI Assistant
            </h1>

            <p>
              ผู้ช่วยออกกำลังกายอัจฉริยะ
            </p>

          </div>

        </div>

        {/* =====================================
            Chat
            ===================================== */}

        <div className="assistant-container">

          <div className="assistant-chat">

            {/* Weekly Plan */}

            {weeklyPlan.length > 0 && (
              <section
                className={
                  showPlanDetails
                    ? "assistant-plan-rail chat-plan-card expanded"
                    : "assistant-plan-rail chat-plan-card"
                }
                role={
                  showPlanDetails
                    ? undefined
                    : "button"
                }
                tabIndex={
                  showPlanDetails
                    ? undefined
                    : 0
                }
                onClick={() =>
                  !showPlanDetails &&
                  setShowPlanDetails(
                    true
                  )
                }
                onKeyDown={(event) => {
                  if (
                    !showPlanDetails &&
                    (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    )
                  ) {
                    event.preventDefault();

                    setShowPlanDetails(
                      true
                    );
                  }
                }}
              >

                <div className="chat-plan-heading">

                  <div>
                    <div className="chat-plan-title-row">
                      <span>แผนออกกำลังกาย AI</span>
                      {justUpdatedPlan && (
                        <span className="badge-plan-updated">✨ ปรับตามคำขอแล้ว</span>
                      )}
                    </div>

                    <strong>
                      {todayPlan ? `${todayPlan.focus} · ${todayPlan.exerciseName}` : planSummary}
                    </strong>
                  </div>

                  <div className="chat-plan-header-actions">
                    <button
                      type="button"
                      className="plan-details-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        setShowPlanDetails(
                          (visible) =>
                            !visible
                        );
                      }}
                    >
                      {showPlanDetails
                        ? "แผนวันนี้"
                        : "ดูทั้งสัปดาห์"}
                    </button>
                  </div>

                </div>

                <div className="chat-plan-days">

                  {(
                    showPlanDetails
                      ? weeklyPlan
                      : [
                          todayPlan,
                        ].filter(
                          Boolean
                        )
                  ).map((day) => (

                    <div
                      className={
                        day.key ===
                        todayKey
                          ? "chat-plan-day today"
                          : "chat-plan-day"
                      }
                      key={day.key}
                    >

                      <span>
                        {day.key ===
                        todayKey
                          ? "วันนี้"
                          : day.key.slice(
                              0,
                              3
                            )}
                      </span>

                      <strong>
                        {day.focus}
                      </strong>

                      <ol>

                        {(
                          day.exercises ||
                          [
                            {
                              name:
                                day.exerciseName,

                              sets:
                                day.sets,

                              repetitions:
                                day.repetitions,
                            },
                          ]
                        ).map(
                          (
                            exercise,
                            index
                          ) => (

                            <li
                              key={`${day.key}-${exercise.name}-${index}`}
                              className="chat-plan-exercise-row"
                            >
                              <div className="chat-plan-exercise-meta">
                                <b>
                                  {
                                    exercise.name
                                  }
                                </b>

                                <small>
                                  {exercise.sets
                                    ? `${exercise.sets} เซ็ต · ${exercise.repetitions}`
                                    : exercise.repetitions}
                                </small>
                              </div>
                            </li>

                          )
                        )}

                      </ol>

                    </div>

                  ))}

                </div>

                <p>
                  ต้องการปรับแผน?
                  พิมพ์หรือกดไมค์ เช่น
                  “วันนี้เหนื่อยมาก”
                  หรือ “ขอท่าแรงกระแทกต่ำ”
                  แล้ว AI จะเลือกท่าทดแทนให้
                </p>

                {showPlanDetails && (
                  <section className="plan-analytics-summary">

                    <h3>
                      สถิติการออกกำลังกาย
                    </h3>

                    <div>
                      <span>
                        <b>
                          {
                            planAnalytics
                              ?.totals
                              ?.sessions ??
                            "–"
                          }
                        </b>{" "}
                        ครั้งที่ฝึก
                      </span>

                      <span>
                        <b>
                          {
                            planAnalytics
                              ?.totals
                              ?.repetitions ??
                            "–"
                          }
                        </b>{" "}
                        ครั้งรวม
                      </span>

                      <span>
                        <b>
                          {
                            planAnalytics
                              ?.totals
                              ?.uniqueDays ??
                            "–"
                          }
                        </b>{" "}
                        วันที่ฝึก
                      </span>

                      <span>
                        <b>
                          {
                            planAnalytics
                              ?.totals
                              ?.averageScore ||
                            "–"
                          }
                        </b>{" "}
                        คะแนนเฉลี่ย
                      </span>
                    </div>

                    <h3>
                      ประวัติล่าสุด
                    </h3>

                    <ul>

                      {(
                        planAnalytics
                          ?.recent ||
                        []
                      )
                        .slice(
                          0,
                          4
                        )
                        .map(
                          (
                            workout
                          ) => (

                            <li
                              key={
                                workout.id
                              }
                            >
                              {
                                workout
                                  .exercise
                                  ?.name ||
                                "Exercise"
                              }

                              <small>
                                {new Date(
                                  workout.startedAt
                                ).toLocaleDateString(
                                  "th-TH"
                                )}
                              </small>
                            </li>

                          )
                        )}

                      {!planAnalytics
                        ?.recent
                        ?.length && (
                        <li>
                          ยังไม่มีประวัติการออกกำลังกาย
                        </li>
                      )}

                    </ul>

                  </section>
                )}

              </section>
            )}

            {/* Empty State */}

            {messages.length === 0 ? (
              <div className="assistant-empty">

                <h2>
                  สวัสดีครับ 
                </h2>

                <p>
                  ผมคือ FitAI Trainer
                </p>

                <p>
                  สามารถถามผมเกี่ยวกับ
                  การออกกำลังกายได้เลยครับ
                </p>

              </div>
            ) : (
              messages.map(
                (item, index) => (

                  <div
                    key={index}
                    className={`assistant-message ${item.role}`}
                  >

                    <strong>
                      {item.role ===
                      "user"
                        ? "คุณ"
                        : "FitAI"}
                    </strong>

                    {item.role === "user" ? (
                      <p className="user-message-text">
                        {item.content}
                      </p>
                    ) : (
                      <ChatMessageContent content={item.content} />
                    )}

                  </div>

                )
              )
            )}

            {/* Loading */}

            {loading && (
              <div className="assistant-message assistant">

                <strong>
                  FitAI
                </strong>

                <p>
                  กำลังคิด...
                </p>

              </div>
            )}

            {/* Auto Scroll */}

            <div ref={chatEndRef} />

          </div>

          {/* Suggestion Chips */}
          <div className="assistant-chips">
            {[
              "🎯 เปลี่ยนท่าวันนี้เป็น Squat",
              "🦵 แนะนำท่าช่วงล่างพร้อมคลิป 🎥",
              "💪 ปรับแผนวันนี้เน้นช่วงบน",
              "🔥 ขอท่าเล่นหน้าท้อง/ลดพุง",
              "🛡️ ขอท่าแรงกระแทกต่ำ",
              "🌿 วันนี้ล้ามาก ขอพักฟื้นฟู",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => {
                  setMessage(chip.replace(/[🎯🎥🦵🔥💪🛡️🌿]/g, "").trim());
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            className="assistant-input"
            onSubmit={handleSubmit}
          >

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={
                handleInputKeyDown
              }
              placeholder="ถาม FitAI Trainer..."
              disabled={loading}
              rows={1}
            />

            {/* Voice */}

            <button
              type="button"
              className={
                isListening
                  ? "voice-button listening"
                  : "voice-button"
              }
              onClick={
                toggleVoice
              }
              disabled={loading}
              title={
                isListening
                  ? "หยุดฟัง"
                  : "พูดกับ FitAI"
              }
              aria-label={
                isListening
                  ? "หยุดฟัง"
                  : "พูดกับ FitAI"
              }
            >

              {isListening ? (
                <Square
                  size={18}
                  strokeWidth={2}
                />
              ) : (
                <Mic
                  size={18}
                  strokeWidth={2}
                />
              )}

            </button>

            {/* Send */}

            <button
              type="submit"
              className="send-button"
              disabled={
                loading ||
                !message.trim()
              }
              title="ส่งข้อความ"
              aria-label="ส่งข้อความ"
            >

              {loading ? (
                <span className="send-loading-dot">
                  ...
                </span>
              ) : (
                <Send
                  size={18}
                  strokeWidth={2}
                />
              )}

            </button>

          </form>

          {/* =====================================
              Status
              ===================================== */}

          <div className="assistant-status">

            {isListening && (
              <span className="status-item">

                <Mic
                  size={15}
                  strokeWidth={2}
                />

                กำลังฟัง...

              </span>
            )}

            {isSpeaking && (
              <span className="status-item">

                <Volume2
                  size={15}
                  strokeWidth={2}
                />

                FitAI กำลังพูด...

                <button
                  type="button"
                  className="stop-speaking-button"
                  onClick={
                    stopSpeaking
                  }
                >

                  <Square
                    size={14}
                    strokeWidth={2}
                  />

                  <span>
                    หยุดเสียง
                  </span>

                </button>

              </span>
            )}

            {!isListening &&
              !isSpeaking &&
              !loading && (
                <span>
                  Enter เพื่อส่ง • Shift +
                  Enter เพื่อขึ้นบรรทัดใหม่
                </span>
              )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;