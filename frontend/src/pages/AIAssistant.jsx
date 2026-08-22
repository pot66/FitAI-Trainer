import {
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../services/api";
import { applyPlanAdjustment, createPersonalizedWeeklyPlan } from "../ai/recommendationEngine";

function AIAssistant({ user, onProfile, onWorkout, onBack }) {
  // =====================================
  // State
  // =====================================

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [sessions, setSessions] =
    useState([]);

  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [planProfile, setPlanProfile] = useState(null);
  const [planExercises, setPlanExercises] = useState([]);
  const [planSummary, setPlanSummary] = useState("");

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] = useState(null);

  // =====================================
  // Refs
  // =====================================

  const recognitionRef =
    useRef(null);

  const shouldListenRef =
    useRef(false);

  const sessionIdRef =
    useRef(null);

  // Auto Scroll
  const chatEndRef =
    useRef(null);

  // =====================================
  // Auto Scroll
  // =====================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    Promise.all([api.get("/profile/me"), api.get("/exercises")])
      .then(async ([profileResponse, exerciseResponse]) => {
        const profile = profileResponse.data?.data || {};
        const exercises = exerciseResponse.data?.data || [];
        const generated = createPersonalizedWeeklyPlan(profile, exercises);
        const saved = localStorage.getItem("fitai-weekly-plan");
        let savedPlan = null;
        try {
          savedPlan = saved ? JSON.parse(saved) : null;
        } catch {
          savedPlan = null;
        }
        setPlanProfile(profile);
        setPlanExercises(exercises);
        setPlanSummary(generated.summary);
        setWeeklyPlan(
          savedPlan?.every((day) => Array.isArray(day.exercises) && day.exercises.length >= 5)
            ? savedPlan
            : generated.plan
        );

        try {
          if (profile?.age && exercises.length) {
            const aiPlanResponse = await api.post('/ai/weekly-plan', {});
            const aiPlan = aiPlanResponse.data?.data;
            if (aiPlan?.days?.length) {
              const keyMap = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
              const normalized = aiPlan.days.map((day, index) => {
                const rawKey = String(day.day || '').toLowerCase();
                const dayKey = keyMap.includes(rawKey) ? rawKey : keyMap[index] || keyMap[0];
                const exercisesForDay = (day.exercises || []).map((item) => ({
                  name: item.name,
                  sets: Number(item.sets || 1),
                  repetitions: item.reps || '8–12 ครั้ง',
                }));
                return {
                  key: dayKey,
                  focus: day.focus || 'AI Plan',
                  exerciseName: exercisesForDay[0]?.name || 'Rest',
                  exercises: exercisesForDay,
                  sets: exercisesForDay[0]?.sets || '',
                  repetitions: exercisesForDay[0]?.repetitions || 'พัก',
                  reason: exercisesForDay[0]?.reason || 'AI ปรับตาม Profile และเป้าหมาย',
                };
              });
              setWeeklyPlan(normalized);
              setPlanSummary(aiPlan.summary || 'สร้างแผนด้วย AI จากข้อมูลส่วนตัวและ Exercise ในระบบ');
              localStorage.setItem('fitai-weekly-plan', JSON.stringify(normalized));
            }
          }
        } catch (aiError) {
          console.warn('Server AI plan unavailable; using local plan:', aiError.message);
        }
      })
      .catch((error) => console.error("Plan load error:", error));
  }, []);

  const todayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
  const todayPlan = weeklyPlan.find((day) => day.key === todayKey);

  const startWorkoutMode = () => {
    if (todayPlan && todayPlan.exerciseName !== "Rest") {
      sessionStorage.setItem("fitai-active-plan", JSON.stringify(todayPlan));
    }
    onWorkout();
  };

  // =====================================
  // New Chat
  // =====================================

  const createNewChat = () => {
    console.log(
      "➕ Creating new chat"
    );

    setSessionId(null);

    setSelectedSessionId(null);

    sessionIdRef.current = null;

    setMessages([]);

    setMessage("");

    // Stop AI Voice
    window.speechSynthesis?.cancel();

    setIsSpeaking(false);

    // Stop Voice Recognition
    shouldListenRef.current = false;

    if (recognitionRef.current) {
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

    const adjustment = applyPlanAdjustment(
      weeklyPlan,
      planProfile || {},
      planExercises,
      userMessage
    );

    if (adjustment.changed) {
      setWeeklyPlan(adjustment.plan);
      localStorage.setItem(
        "fitai-weekly-plan",
        JSON.stringify(adjustment.plan)
      );
    }

    // User message
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

      // Create Session
      if (!currentSessionId) {
        currentSessionId =
          await createSession(
            userMessage
          );
      }

      // Send message
      const response =
        await api.post(
          "/chat/messages",
          {
            sessionId:
              currentSessionId,

            message:
              userMessage,
          }
        );

      console.log(
        "Chat Response:",
        response.data
      );

      const data =
        response.data;

      // AI Response
      let aiResponse =
        data.data
          ?.assistantMessage
          ?.content ||
        data.data
          ?.aiMessage
          ?.content ||
        data.data?.message ||
        data.message ||
        "ขออภัยครับ ไม่พบคำตอบจาก AI";

      if (adjustment.changed) {
        aiResponse = `${adjustment.message}\n\n${aiResponse}`;
      }

      // Add AI message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            aiResponse,
        },
      ]);

      // Update session messages
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

      // Speak
      speakAIResponse(
        aiResponse
      );
    } catch (error) {
      console.error(
        "Chat Error:",
        error
      );

      const errorMessage =
        error.response?.data
          ?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการส่งข้อความ";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `❌ ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Handle Input
  // =====================================

  const handleInputKeyDown = (
    event
  ) => {
    // Enter = Send
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }

    // Shift + Enter
    // Browser จะขึ้นบรรทัดใหม่เอง
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
  // Stop AI Speaking
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

    // Stop previous speech
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      "th-TH";

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

    // STOP
    if (
      shouldListenRef.current
    ) {
      console.log(
        "⏹️ Stop voice"
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

    // START
    shouldListenRef.current =
      true;

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      "th-TH";

    recognition.continuous =
      false;

    recognition.interimResults =
      true;

    recognition.maxAlternatives =
      1;

    recognition.onstart = () => {
      console.log(
        "🎙️ Voice started"
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

      setMessage(
        text
      );

      console.log(
        "🎤 Hearing:",
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
        "🔚 Voice ended"
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

          <h2>
            💬 Chat History
          </h2>

          <button
            type="button"
            className="new-chat-button"
            onClick={
              createNewChat
            }
          >
            ＋ New Chat
          </button>

          <button
            type="button"
            className="workout-mode-button"
            onClick={startWorkoutMode}
          >
            Workout &amp; Pose
          </button>

        </div>

        <div className="session-list">

          {sessions.length ===
          0 ? (
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

                  {/* Chat */}
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

                  {/* Actions */}
                  <div className="session-actions">

                    {/* Rename */}
                    <button
                      type="button"
                      className="session-action rename"
                      title="เปลี่ยนชื่อ"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        renameChat(
                          session
                        );
                      }}
                    >
                      ✏️
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className="session-action delete"
                      title="ลบ Chat"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        deleteChat(
                          session
                        );
                      }}
                    >
                      🗑️
                    </button>

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

          <button
            type="button"
            className="back-button"
            onClick={onBack}
          >
            ← กลับ Dashboard
          </button>

          <div className="assistant-title">

            <button
              type="button"
              className="assistant-profile-button"
              onClick={onProfile}
              title="Profile"
            >
              <span className="assistant-avatar">
                {(user?.name || "U").trim().charAt(0).toUpperCase()}
              </span>
              <span className="assistant-profile-copy">
                <strong>{user?.name || "Profile"}</strong>
                <small>Profile</small>
              </span>
            </button>

            <div className="badge">
              AI FITNESS ASSISTANT
            </div>

            <h1>
              🤖 FitAI Assistant
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

            {weeklyPlan.length > 0 && (
              <section className="chat-plan-card">
                <div className="chat-plan-heading">
                  <div>
                    <span>แผนที่ AI จัดให้</span>
                    <strong>{planSummary}</strong>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={startWorkoutMode}
                  >
                    {todayPlan?.exerciseName === "Rest"
                      ? "ดูโหมดกล้อง"
                      : "เริ่มแผนวันนี้"}
                  </button>
                </div>

                <div className="chat-plan-days">
                  {weeklyPlan.map((day) => (
                    <div
                      className={
                        day.key === todayKey
                          ? "chat-plan-day today"
                          : "chat-plan-day"
                      }
                      key={day.key}
                    >
                      <span>
                        {day.key === todayKey
                          ? "วันนี้"
                          : day.key.slice(0, 3)}
                      </span>
                      <strong>{day.focus}</strong>
                      <ol>
                        {(day.exercises || [{ name: day.exerciseName, sets: day.sets, repetitions: day.repetitions }]).map((exercise, index) => (
                          <li key={`${day.key}-${exercise.name}-${index}`}>
                            <b>{exercise.name}</b>
                            <small>{exercise.sets ? `${exercise.sets} เซ็ต · ${exercise.repetitions}` : exercise.repetitions}</small>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>

                <p>
                  ต้องการปรับแผน? พิมพ์หรือกดไมค์ เช่น
                  “วันนี้เหนื่อยมาก” หรือ “ขอท่าแรงกระแทกต่ำ”
                  แล้ว AI จะเลือกท่าทดแทนให้
                </p>
              </section>
            )}

            {messages.length ===
            0 ? (
              <div className="assistant-empty">

                <div className="assistant-icon">
                  🤖
                </div>

                <h2>
                  สวัสดีครับ 👋
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
                    className={
                      `assistant-message ${item.role}`
                    }
                  >

                    <strong>
                      {item.role ===
                      "user"
                        ? "คุณ"
                        : "FitAI"}
                    </strong>

                    <p>
                      {item.content}
                    </p>

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

            {/* Auto Scroll Target */}
            <div
              ref={chatEndRef}
            />

          </div>


          {/* =====================================
              Input
              ===================================== */}

          <form
            className="assistant-input"
            onSubmit={
              handleSubmit
            }
          >

            <textarea
              value={message}
              onChange={(
                event
              ) =>
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
            >
              {isListening
                ? "⏹️"
                : "🎤"}
            </button>

            {/* Send */}
            <button
              type="submit"
              className="send-button"
              disabled={
                loading ||
                !message.trim()
              }
            >
              {loading
                ? "กำลังส่ง..."
                : "ส่ง"}
            </button>

          </form>


          {/* =====================================
              Status
              ===================================== */}

          <div className="assistant-status">

            {isListening && (
              <span>
                🎙️ กำลังฟัง...
              </span>
            )}

            {isSpeaking && (
              <span>
                🔊 FitAI กำลังพูด...

                <button
                  type="button"
                  className="stop-speaking-button"
                  onClick={
                    stopSpeaking
                  }
                >
                  ⏹ หยุดเสียง
                </button>
              </span>
            )}

            {!isListening &&
              !isSpeaking &&
              !loading && (
                <span>
                  Enter เพื่อส่ง •
                  Shift + Enter
                  เพื่อขึ้นบรรทัดใหม่
                </span>
              )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;
