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
  Utensils,
  Camera,
  Search,
  Flame,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";

import api from "./services/api";

import {
  applyPlanAdjustment,
  createPersonalizedWeeklyPlan,
} from "./ai/recommendationEngine";
import ChatMessageContent from "./components/ChatMessageContent";
import FoodCameraModal from "./components/FoodCameraModal";
import { calculateBMRAndTDEE, getMealIcon } from "./utils/nutritionCalculator";
import { speakText, stopSpeech, isSpeakingNow } from "./utils/speechUtils";

function AIAssistant({
  user,
  onProfile,
  onSettings,
  onWorkout,
  onFood,
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
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [sessions, setSessions] = useState([]);

  // Weekly Plan
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [planProfile, setPlanProfile] = useState(null);
  const [planExercises, setPlanExercises] = useState([]);
  const [planSummary, setPlanSummary] = useState("");
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [planAnalytics, setPlanAnalytics] = useState(null);
  const [justUpdatedPlan, setJustUpdatedPlan] = useState(false);

  // Dual-mode Right Sidebar ("calorie" or "workout")
  const [sidebarTab, setSidebarTab] = useState("calorie");

  // Calorie & Food Data
  const [todayFoodData, setTodayFoodData] = useState(null);
  const [loadingFoodToday, setLoadingFoodToday] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const [selectedSearchItem, setSelectedSearchItem] = useState(null);
  const [searchMealType, setSearchMealType] = useState("LUNCH");
  const [isLoggingFood, setIsLoggingFood] = useState(false);
  const [foodToast, setFoodToast] = useState(null);

  // In-Chat Food Camera & Scanning
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const chatFileInputRef = useRef(null);

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
    stopSpeech();

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
          "à¹„à¸¡à¹ˆà¸žà¸š Session ID"
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
          "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸ªà¸£à¹‰à¸²à¸‡ Chat Session à¹„à¸”à¹‰"
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
  // Calorie & Food Tracker Handlers
  // =====================================
  const loadTodayFoodSummary = async () => {
    try {
      setLoadingFoodToday(true);
      const res = await api.get("/food/logs/today");
      if (res.data?.success) {
        setTodayFoodData(res.data.data);
      }
    } catch (err) {
      console.error("Load today food summary error:", err);
    } finally {
      setLoadingFoodToday(false);
    }
  };

  useEffect(() => {
    loadTodayFoodSummary();
  }, []);

  const handleSearchFood = async (q) => {
    setFoodSearchQuery(q);
    if (!q || !q.trim()) {
      setFoodSearchResults([]);
      return;
    }
    try {
      setIsSearchingFood(true);
      const res = await api.get(`/food/search?q=${encodeURIComponent(q.trim())}`);
      if (res.data?.success) {
        setFoodSearchResults(res.data.data || []);
      }
    } catch (err) {
      console.error("Search food error:", err);
    } finally {
      setIsSearchingFood(false);
    }
  };

  const handleQuickLogFood = async (item, mealType = "LUNCH", quantity = 1) => {
    try {
      setIsLoggingFood(true);
      const numQty = Number(quantity) || 1;
      const itemCalories = Math.round((Number(item.calories || item.serving?.calories || 0)) * numQty);
      const itemProtein = Math.round((Number(item.protein || item.serving?.protein || 0)) * numQty * 10) / 10;
      const itemCarbs = Math.round((Number(item.carbs || item.serving?.carbs || 0)) * numQty * 10) / 10;
      const itemFat = Math.round((Number(item.fat || item.serving?.fat || 0)) * numQty * 10) / 10;

      const payload = {
        mealType,
        items: [
          {
            name: item.name,
            matchedId: item.matchedId || item.id || null,
            quantity: numQty,
            unit: item.unit || item.serving?.unit || "จาน",
            calories: itemCalories,
            protein: itemProtein,
            carbs: itemCarbs,
            fat: itemFat,
          },
        ],
        totalCalories: itemCalories,
        totalProtein: itemProtein,
        totalCarbs: itemCarbs,
        totalFat: itemFat,
        note: "บันทึกผ่าน AI Assistant",
      };

      const res = await api.post("/food/logs", payload);
      if (res.data?.success) {
        setFoodToast({ type: "success", message: `บันทึก "${item.name}" (${itemCalories} kcal) เรียบร้อยแล้ว!` });
        setTimeout(() => setFoodToast(null), 3500);
        setSelectedSearchItem(null);
        setFoodSearchQuery("");
        setFoodSearchResults([]);
        await loadTodayFoodSummary();
      }
    } catch (err) {
      console.error("Log food error:", err);
      setFoodToast({ type: "error", message: "ไม่สามารถบันทึกอาหารได้ กรุณาลองใหม่อีกครั้ง" });
      setTimeout(() => setFoodToast(null), 3500);
    } finally {
      setIsLoggingFood(false);
    }
  };

  const handleDeleteFoodLog = async (logId) => {
    if (!window.confirm("คุณต้องการลบรายการอาหารนี้ใช่หรือไม่?")) return;
    try {
      const res = await api.delete(`/food/logs/${logId}`);
      if (res.data?.success) {
        await loadTodayFoodSummary();
      }
    } catch (err) {
      console.error("Delete food log error:", err);
    }
  };

  const handleAnalyzeFoodImage = async (base64) => {
    try {
      setIsAnalyzingFood(true);
      setCameraModalOpen(false);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: "📷 [ส่งภาพอาหารเพื่อสแกนและคำนวณแคลอรี่]" },
      ]);
      setLoading(true);

      const res = await api.post("/food/analyze", { imageBase64: base64 });
      if (res.data?.success) {
        const d = res.data.data;
        const firstItem = d.items?.[0] || { name: "อาหารไทย", calories: d.total?.calories || 400 };
        const logData = {
          name: firstItem.name,
          calories: d.total?.calories || firstItem.calories,
          protein: d.total?.protein || firstItem.protein || 0,
          carbs: d.total?.carbs || firstItem.carbs || 0,
          fat: d.total?.fat || firstItem.fat || 0,
          unit: firstItem.unit || "จาน",
          confidence: firstItem.confidence || 0.9,
        };

        let aiReply = `FitAI ตรวจจับและคำนวณแคลอรี่อาหารของคุณเรียบร้อยครับ! 📸🍽️\n\n`;
        aiReply += `### 🍛 **${firstItem.name}**`;
        if (firstItem.nameEn) aiReply += ` (${firstItem.nameEn})`;
        aiReply += `\n- ⚡ พลังงานโดยประมาณ: **${logData.calories} kcal**\n`;
        aiReply += `- 🍗 โปรตีน: **${logData.protein} g** | 🍚 คาร์บ: **${logData.carbs} g** | 🥑 ไขมัน: **${logData.fat} g**\n\n`;
        if (d.advice) {
          aiReply += `💡 **คำแนะนำโภชนาการ:** ${d.advice}\n\n`;
        }
        aiReply += `[LOG_FOOD_ACTION:${JSON.stringify(logData)}]`;

        setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
        await loadTodayFoodSummary();
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "ขออภัยครับ ไม่สามารถวิเคราะห์ภาพอาหารได้ กรุณาลองใหม่อีกครั้ง หรือพิมพ์ชื่ออาหารในช่องค้นหาครับ" },
        ]);
      }
    } catch (err) {
      console.error("Analyze food image error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "เกิดข้อผิดพลาดในการเชื่อมต่อระบบวิเคราะห์อาหาร กรุณาลองใหม่อีกครั้งครับ" },
      ]);
    } finally {
      setIsAnalyzingFood(false);
      setLoading(false);
    }
  };

  const handleChatFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleAnalyzeFoodImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };


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
        "à¸•à¸±à¹‰à¸‡à¸Šà¸·à¹ˆà¸­ Chat à¹ƒà¸«à¸¡à¹ˆ",
        currentTitle
      );

    if (newTitle === null) {
      return;
    }

    const title =
      newTitle.trim();

    if (!title) {
      alert(
        "à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸à¸Šà¸·à¹ˆà¸­ Chat"
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
          "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸Šà¸·à¹ˆà¸­ Chat à¹„à¸”à¹‰"
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
        `à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸¥à¸š "${title}" à¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ?\n\nà¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹ƒà¸™ Chat à¸™à¸µà¹‰à¸ˆà¸°à¸–à¸¹à¸à¸¥à¸šà¸”à¹‰à¸§à¸¢`
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
          "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¥à¸š Chat à¹„à¸”à¹‰"
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
      /^(?:à¸•à¹‰à¸­à¸‡à¸à¸²à¸£|à¸­à¸¢à¸²à¸|à¸‚à¸­)?\s*(?:à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™|à¸›à¸£à¸±à¸š)\s*(?:à¹à¸œà¸™|à¸•à¸²à¸£à¸²à¸‡)(?:\s*(?:à¸­à¸­à¸à¸à¸³à¸¥à¸±à¸‡à¸à¸²à¸¢|à¸§à¸±à¸™à¸™à¸µà¹‰))?[.!?]*$/i.test(
        userMessage
      );

    // =====================================
    // Local Plan Adjustment
    // =====================================

    // Guard: Food & Nutrition queries must not alter workout plans
    const isFoodQuery = /(อาหาร|เมนู|กิน|ทาน|แดก|แคล|แคลอรี่|กี่แคล|calorie|calories|nutrition|โภชนาการ|โปรตีน|คาร์บ|ไขมัน|ข้าว|อกไก่|สลัด|กะเพรา|ก๋วยเตี๋ยว|ส้มตำ|มื้อ|diet|food|bmr|tdee|น้ำหนักเกิน|ลดความอ้วน|เพิ่มกล้าม|สร้างกล้าม|คลีน)/i.test(userMessage);
    const isExplicitPlanRequest = /(เปลี่ยนท่า|เปลี่ยนตาราง|ปรับตาราง|แก้ตาราง|ขอเปลี่ยนตาราง|ตารางออกกำลังกาย|ท่าออกกำลังกาย)/i.test(userMessage);

    let adjustment = { plan: weeklyPlan, changed: false };
    if (!isFoodQuery || isExplicitPlanRequest) {
      adjustment = applyPlanAdjustment(
        weeklyPlan,
        planProfile || {},
        planExercises,
        userMessage
      );
    }

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
      /(à¹à¸™à¸°à¸™à¸³.*(à¸—à¹ˆà¸²|à¹à¸œà¸™|à¸­à¸­à¸à¸à¸³à¸¥à¸±à¸‡)|à¹€à¸¥à¸·à¸­à¸.*à¸—à¹ˆà¸²|à¸ˆà¸±à¸”.*à¹à¸œà¸™|suggest.*exercise|recommend.*exercise|à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™|à¸›à¸£à¸±à¸š|à¹à¸à¹‰à¹„à¸‚|à¸à¸´à¸ˆà¸à¸£à¸£à¸¡|à¹à¸—à¸™|à¸ªà¸¥à¸±à¸š|à¸‚à¸­à¸¥à¸”|à¸‚à¸­à¹€à¸‹à¹‡à¸•)/i.test(
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
          : "à¸‚à¸­à¸­à¸ à¸±à¸¢à¸„à¸£à¸±à¸š à¹„à¸¡à¹ˆà¸žà¸šà¸„à¸³à¸•à¸­à¸šà¸ˆà¸²à¸ AI";
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
          "à¸‚à¸­à¸­à¸ à¸±à¸¢à¸„à¸£à¸±à¸š à¸‚à¸“à¸°à¸™à¸µà¹‰à¸£à¸°à¸šà¸šà¸›à¸£à¸°à¸¡à¸§à¸¥à¸œà¸¥à¸™à¸²à¸™à¸à¸§à¹ˆà¸²à¸›à¸à¸•à¸´ FitAI à¸‚à¸­à¹à¸™à¸°à¸™à¸³à¸—à¹ˆà¸²à¸­à¸­à¸à¸à¸³à¸¥à¸±à¸‡à¸à¸²à¸¢à¸žà¸·à¹‰à¸™à¸à¸²à¸™à¸—à¸µà¹ˆà¸„à¸¸à¸“à¸ªà¸²à¸¡à¸²à¸£à¸–à¸—à¸³à¹„à¸”à¹‰à¸—à¸±à¸™à¸—à¸µà¸„à¸£à¸±à¸š:\n\n" +
          "- Squat (3 à¹€à¸‹à¹‡à¸•, 10â€“12 à¸„à¸£à¸±à¹‰à¸‡)  â–¶ï¸ [à¸§à¸´à¸”à¸µà¹‚à¸­à¸ªà¸­à¸™: Squat](https://youtu.be/fKrzVBsUIv4)\n" +
          "- Push-up (3 à¹€à¸‹à¹‡à¸•, 8â€“10 à¸„à¸£à¸±à¹‰à¸‡)  â–¶ï¸ [à¸§à¸´à¸”à¸µà¹‚à¸­à¸ªà¸­à¸™: Push-up](https://youtu.be/s3z0w-82Y00)\n" +
          "- Plank (3 à¹€à¸‹à¹‡à¸•, 20â€“30 à¸§à¸´à¸™à¸²à¸—à¸µ)  â–¶ï¸ [à¸§à¸´à¸”à¸µà¹‚à¸­à¸ªà¸­à¸™: Plank](https://youtu.be/jDZsXIkwWQ4)\n" +
          "- Glute Bridge (3 à¹€à¸‹à¹‡à¸•, 12â€“15 à¸„à¸£à¸±à¹‰à¸‡)  â–¶ï¸ [à¸§à¸´à¸”à¸µà¹‚à¸­à¸ªà¸­à¸™: Glute Bridge](https://youtu.be/tBSaB_cnVeE)\n\n" +
          "à¸„à¸¸à¸“à¸ªà¸²à¸¡à¸²à¸£à¸–à¸ªà¹ˆà¸‡à¸„à¸³à¸–à¸²à¸¡à¹ƒà¸«à¸¡à¹ˆà¹€à¸žà¸·à¹ˆà¸­à¸ªà¸­à¸šà¸–à¸²à¸¡à¸—à¹ˆà¸²à¸­à¸·à¹ˆà¸™ à¹† à¸«à¸£à¸·à¸­à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸¸à¸‚à¸ à¸²à¸žà¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡à¹„à¸”à¹‰à¹€à¸¥à¸¢à¸„à¸£à¸±à¸š";
      } else {
        const errorMsg =
          error.response?.data?.message ||
          "à¸‚à¸“à¸°à¸™à¸µà¹‰à¸£à¸°à¸šà¸šà¸à¸²à¸£à¸ªà¸·à¹ˆà¸­à¸ªà¸²à¸£à¸‚à¸±à¸”à¸‚à¹‰à¸­à¸‡à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¸ªà¹ˆà¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡à¸„à¸£à¸±à¸š";
        fallbackText = `âš ï¸ ${errorMsg}`;
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

  const handleCopyMessage = (content, index) => {
    if (!content) return;
    const clean = content.replace(/\[LOG_FOOD_ACTION:[\s\S]*?\]/g, "").trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(clean);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const stopSpeaking = () => {
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMsgIndex(null);
  };

  // =====================================
  // Text To Speech (HD Bilingual Voice Engine)
  // =====================================

  const speakAIResponse = (text, index = null) => {
    if (localStorage.getItem("fitai-ai-voice-enabled") === "false") {
      return;
    }

    if (index !== null) {
      setSpeakingMsgIndex(index);
    }

    speakText(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMsgIndex(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingMsgIndex(null);
      },
    });
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
        "Browser à¸™à¸µà¹‰à¹„à¸¡à¹ˆà¸£à¸­à¸‡à¸£à¸±à¸š Voice Recognition"
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
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* =====================================
          Sidebar (Left)
          ===================================== */}
      <aside className="w-64 sm:w-72 bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0">
        <div className="p-3 flex flex-col gap-2">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            onClick={createNewChat}
          >
            <Plus size={16} strokeWidth={2} />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer active:scale-[0.99]"
            onClick={startWorkoutMode}
          >
            <Dumbbell size={16} strokeWidth={2} />
            <span>Mode 3D Coach</span>
          </button>
        </div>

        <div className="px-4 pt-2 pb-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          ประวัติห้องแชท
        </div>

        <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1 pb-4">
          {sessions.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-6">
              ไม่มีประวัติการแชท
            </div>
          ) : (
            sessions.map((session) => (
              <div
                className="relative group flex items-center w-full"
                key={session.id}
              >
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 truncate pr-8 cursor-pointer ${
                    selectedSessionId === session.id
                      ? "bg-zinc-800/90 text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <strong className="truncate block">
                    {session.title || "FitAI Assistant"}
                  </strong>
                  <small className="text-[10px] text-zinc-500">
                    {session.messages?.length || 0} ข้อความ
                  </small>
                </button>

                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  ref={openSessionMenu === session.id ? sessionMenuRef : null}
                >
                  <button
                    type="button"
                    className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="ตัวเลือกห้องแชท"
                    aria-label="ตัวเลือกห้องแชท"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSessionMenu((curr) => (curr === session.id ? null : session.id));
                    }}
                  >
                    <MoreHorizontal size={16} strokeWidth={2} />
                  </button>

                  {openSessionMenu === session.id && (
                    <div
                      className="absolute right-0 top-full mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-30 flex flex-col"
                      role="menu"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="px-3 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                        onClick={() => {
                          setOpenSessionMenu(null);
                          renameChat(session);
                        }}
                      >
                        <Pencil size={14} strokeWidth={2} />
                        <span>เปลี่ยนชื่อ</span>
                      </button>

                      <button
                        type="button"
                        className="px-3 py-2 text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                        onClick={() => {
                          setOpenSessionMenu(null);
                          deleteChat(session);
                        }}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                        <span>ลบห้องแชท</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* =====================================
          Main Area
          ===================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/30 relative">
        {/* Topbar */}
        <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md shrink-0 relative z-50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full mb-0.5 uppercase">
              AI FITNESS ASSISTANT
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>FitAI Assistant</span>
              <span className="text-xs font-normal text-zinc-400">· ผู้ช่วยวางแผนออกกำลังกายเฉพาะคุณ</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative z-50" ref={profileMenuRef}>
            <button
              type="button"
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-zinc-800/60 transition-colors cursor-pointer"
              onClick={() => setProfileMenuOpen((open) => !open)}
              title="Profile"
              aria-label="เปิดเมนู Profile"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm">
                {user?.avatarUrl || user?.profileImage || user?.image ? (
                  <img
                    src={user.avatarUrl || user.profileImage || user.image}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user?.name || "U").trim().charAt(0).toUpperCase()
                )}
              </span>
              <div className="text-left hidden sm:block">
                <strong className="block text-xs text-zinc-200 font-semibold leading-tight">
                  {user?.name || "Profile"}
                </strong>
                <small className="text-[10px] text-zinc-500">Profile</small>
              </div>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-2 z-[100] flex flex-col gap-1"
                role="menu"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full p-2 rounded-xl hover:bg-zinc-800 flex items-center justify-between text-left cursor-pointer transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onProfile?.();
                  }}
                >
                  <div>
                    <strong className="block text-xs text-white font-bold">{user?.name || "FitAI User"}</strong>
                    <small className="text-[11px] text-zinc-400 truncate block">{user?.email || "บัญชีผู้ใช้"}</small>
                  </div>
                  <ArrowRight size={14} className="text-zinc-500" />
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  type="button"
                  className="w-full px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onProfile?.();
                  }}
                >
                  <User size={15} />
                  <span>โปรไฟล์ของฉัน</span>
                </button>

                <button
                  type="button"
                  className="w-full px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onSettings?.();
                  }}
                >
                  <Settings size={15} />
                  <span>การตั้งค่า</span>
                </button>

                <div className="h-px bg-zinc-800 my-1" />

                <button
                  type="button"
                  className="w-full px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/50 flex items-center gap-2 cursor-pointer transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  <LogOut size={15} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* =====================================
            Container: Chat (Center) + Plan (Right)
            ===================================== */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row relative overflow-hidden">
          {/* Chat Column */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col gap-5">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3 my-auto">

                  <h2 className="text-xl font-bold text-white">ยินดีต้อนรับ</h2>
                  <p className="text-sm text-zinc-400">คุยกับ FitAI Trainer</p>
                  <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                    สอบถามคำแนะนำท่าออกกำลังกาย ตรวจสอบความถูกต้อง หรือปรับเปลี่ยนแผนฝึกประจำสัปดาห์ได้ทันที
                  </p>
                </div>
              ) : (
                messages.map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-col gap-1.5 ${
                      item.role === "user"
                        ? "items-end self-end max-w-[85%] sm:max-w-[75%]"
                        : "items-start self-start w-full"
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-zinc-500 px-1">
                      {item.role === "user" ? "คุณ" : "FitAI"}
                    </div>

                    {item.role === "user" ? (
                      <div className="bg-zinc-800 text-zinc-100 px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm break-words">
                        {item.content}
                      </div>
                    ) : (
                      <div className="bg-zinc-900/60 border border-zinc-800/60 text-zinc-100 px-4 py-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm w-full">
                        <ChatMessageContent content={item.content} onLogFood={(foodAction) => handleQuickLogFood(foodAction, "LUNCH", 1)} />

                        {/* Action Bar: Listen Aloud & Copy */}
                        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-400">
                          <button
                            type="button"
                            onClick={() => {
                              if (speakingMsgIndex === index && isSpeaking) {
                                stopSpeaking();
                              } else {
                                speakAIResponse(item.content, index);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                              speakingMsgIndex === index && isSpeaking
                                ? "bg-red-950/70 text-red-400 border border-red-800/60 animate-pulse"
                                : "hover:bg-zinc-800 hover:text-zinc-200"
                            }`}
                            title={speakingMsgIndex === index && isSpeaking ? "หยุดเสียงพูด" : "ฟังเสียงพูด (ภาษาไทย & อังกฤษ)"}
                          >
                            <span>{speakingMsgIndex === index && isSpeaking ? "⏹ หยุดเสียง" : "🔊 ฟังเสียง"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyMessage(item.content, index)}
                            className="px-2.5 py-1 rounded-lg font-medium hover:bg-zinc-800 hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="คัดลอกข้อความ"
                          >
                            <span>{copiedIndex === index ? "✓ คัดลอกแล้ว" : "📋 คัดลอก"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/60 px-4 py-3 rounded-2xl w-fit">
                  <svg className="animate-spin h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>FitAI กำลังตอบ...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2 px-4 sm:px-8 pb-2">
              {[
                "🥗 แนะนำเมนูอาหารเสริมกล้ามเนื้อ",
                "🔥 วันนี้กินไปกี่แคลแล้ว",
                "🍛 ข้าวมันไก่กี่แคล",
                "🥑 แนะนำเมนูลดน้ำหนักคุมแคล",
                "🏋️‍♂️ แนะนำท่าฝึกแทน Squat",
                "📅 ปรับตารางฝึกให้เน้นช่วงล่าง",
                "😴 วันนี้เหนื่อยมาก ขอนอนพัก",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-red-400 text-zinc-300 transition-all cursor-pointer shadow-sm"
                  onClick={() => {
                    setMessage(chip.replace(/^[^a-zA-Z0-9ก-๙]+/u, "").trim());
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form className="px-4 sm:px-8 pb-2 pt-1" onSubmit={handleSubmit}>
              <div className="relative bg-zinc-900/90 border border-zinc-800 focus-within:border-zinc-700 rounded-2xl p-3 flex items-end gap-2 shadow-xl backdrop-blur-sm">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="พิมพ์คุยกับ FitAI Trainer..."
                  disabled={loading}
                  rows={1}
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-32 min-h-[24px] py-1"
                />

                <input
                  type="file"
                  ref={chatFileInputRef}
                  accept="image/*"
                  onChange={handleChatFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setCameraModalOpen(true)}
                  disabled={loading}
                  title="ถ่ายรูปสแกนอาหารคำนวณแคลอรี่"
                  aria-label="ถ่ายรูปสแกนอาหาร"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Camera size={16} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={loading}
                  title="อัปโหลดภาพอาหาร"
                  aria-label="อัปโหลดภาพอาหาร"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Upload size={16} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={loading}
                  title={isListening ? "กำลังฟังเสียง" : "พูดคุยด้วยเสียง"}
                  aria-label={isListening ? "กำลังฟังเสียง" : "พูดคุยด้วยเสียง"}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isListening
                      ? "bg-red-600 text-white animate-pulse"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {isListening ? <Square size={16} strokeWidth={2} /> : <Mic size={16} strokeWidth={2} />}
                </button>

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  title="ส่งข้อความ"
                  aria-label="ส่งข้อความ"
                  className="p-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  <Send size={16} strokeWidth={2} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 px-2 pt-2">
                <div className="flex items-center gap-2">
                  {isListening && <span className="text-red-400 animate-pulse">● กำลังฟังเสียงของคุณ...</span>}
                  {isSpeaking && (
                    <span className="text-sky-400 flex items-center gap-1">
                      <Volume2 size={13} />
                      <span>FitAI กำลังพูด...</span>
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="ml-1 text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        หยุดเสียง
                      </button>
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่</span>
              </div>
            </form>
          </div>

          {/* =====================================
              Right Rail: ระบบคำนวณแคลอรี่ & แผนฝึก AI (Unified Side Panel)
              ===================================== */}
          <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-800/80 bg-zinc-950/90 overflow-y-auto flex flex-col p-4 gap-4 shadow-2xl backdrop-blur-md">
            {/* Tab Navigation: คำนวณแคลอรี่ vs แผนออกกำลังกาย AI */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSidebarTab("calorie")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === "calorie"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Utensils size={13} className={sidebarTab === "calorie" ? "text-white" : "text-red-400"} />
                <span>คำนวณแคลอรี่</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("workout")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === "workout"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Dumbbell size={13} className={sidebarTab === "workout" ? "text-white" : "text-red-400"} />
                <span>แผนฝึก AI</span>
              </button>
            </div>

            {/* TAB 1: CALORIE & NUTRITION TRACKER */}
            {sidebarTab === "calorie" && (() => {
              const nutritionTargets = calculateBMRAndTDEE(planProfile || user);
              const targetCal = todayFoodData?.target?.calories || nutritionTargets.tdee || 2100;
              const consumedCal = Number(todayFoodData?.consumed?.calories) || 0;
              const remainingCal = typeof todayFoodData?.remainingCalories === "number" ? todayFoodData.remainingCalories : Math.max(0, targetCal - consumedCal);
              const calPercent = Math.min(100, Math.round((consumedCal / targetCal) * 100)) || 0;
              const consumedPro = Number(todayFoodData?.consumed?.protein) || 0;
              const consumedCarb = Number(todayFoodData?.consumed?.carbs) || 0;
              const consumedFat = Number(todayFoodData?.consumed?.fat) || 0;
              const foodLogs = todayFoodData?.logs || [];

              return (
                <div className="flex flex-col gap-4">
                  {/* Calorie Card */}
                  <div className="bg-gradient-to-br from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame size={14} className="text-red-500" />
                        <span>แคลอรี่วันนี้</span>
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/30">
                        เป้าหมาย: {targetCal} kcal
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-0.5">
                      <div>
                        <span className="text-2xl font-black text-white">{Math.round(consumedCal)}</span>
                        <span className="text-xs text-zinc-400 font-medium ml-1">/ {targetCal} kcal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">คงเหลือ</span>
                        <span className={`text-xs font-bold ${remainingCal > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                          {remainingCal > 0 ? `${remainingCal} kcal` : "ครบตามเป้า"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500 rounded-full"
                        style={{ width: `${calPercent}%` }}
                      />
                    </div>

                    {/* Macro Breakdown */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-center">
                      <div className="bg-zinc-900/90 rounded-xl p-1.5 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block font-medium">โปรตีน</span>
                        <span className="text-xs font-bold text-sky-400">{Math.round(consumedPro * 10) / 10}g</span>
                      </div>
                      <div className="bg-zinc-900/90 rounded-xl p-1.5 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block font-medium">คาร์บ</span>
                        <span className="text-xs font-bold text-amber-400">{Math.round(consumedCarb * 10) / 10}g</span>
                      </div>
                      <div className="bg-zinc-900/90 rounded-xl p-1.5 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block font-medium">ไขมัน</span>
                        <span className="text-xs font-bold text-emerald-400">{Math.round(consumedFat * 10) / 10}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Food Search & Calculator */}
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        <Search size={13} className="text-red-400" />
                        <span>ค้นหา & คำนวณแคลอรี่</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCameraModalOpen(true)}
                        className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Camera size={12} />
                        <span>สแกนกล้อง</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={foodSearchQuery}
                        onChange={(e) => handleSearchFood(e.target.value)}
                        placeholder="พิมพ์ชื่ออาหาร เช่น ข้าวมันไก่, ส้มตำ..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                      />
                      {isSearchingFood && (
                        <div className="absolute right-2.5 top-2.5 text-zinc-500 animate-spin text-xs">⟳</div>
                      )}

                      {/* Autocomplete Dropdown */}
                      {foodSearchResults.length > 0 && !selectedSearchItem && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-zinc-800 backdrop-blur-md">
                          {foodSearchResults.map((dish) => (
                            <button
                              key={dish.id}
                              type="button"
                              onClick={() => {
                                setSelectedSearchItem(dish);
                                setFoodSearchResults([]);
                              }}
                              className="w-full text-left p-2.5 hover:bg-zinc-800/80 flex items-center justify-between text-xs transition-colors cursor-pointer"
                            >
                              <div>
                                <b className="text-zinc-200 block">{dish.name}</b>
                                <small className="text-zinc-400 text-[10px]">1 {dish.serving?.unit || "จาน"} ({dish.serving?.weightGrams || 300}g)</small>
                              </div>
                              <span className="text-xs font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">
                                {dish.serving?.calories || 0} kcal
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Item Preview & Add Action */}
                    {selectedSearchItem && (
                      <div className="bg-zinc-950/90 border border-zinc-700 rounded-xl p-3 flex flex-col gap-2 animate-fadeIn">
                        <div className="flex items-start justify-between">
                          <div>
                            <b className="text-xs font-bold text-white block">{selectedSearchItem.name}</b>
                            <span className="text-[11px] text-zinc-400">
                              {selectedSearchItem.serving?.calories} kcal · โปรตีน {selectedSearchItem.serving?.protein}g
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedSearchItem(null)}
                            className="text-zinc-500 hover:text-zinc-300 text-xs p-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <select
                            value={searchMealType}
                            onChange={(e) => setSearchMealType(e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                          >
                            <option value="BREAKFAST">มื้อเช้า</option>
                            <option value="LUNCH">มื้อกลางวัน</option>
                            <option value="DINNER">มื้อเย็น</option>
                            <option value="SNACK">ของว่าง / อื่นๆ</option>
                          </select>

                          <button
                            type="button"
                            disabled={isLoggingFood}
                            onClick={() => handleQuickLogFood(selectedSearchItem, searchMealType, 1)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/40 transition-all flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            <span>+ บันทึกมื้อนี้</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toast Alert */}
                  {foodToast && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      foodToast.type === "success"
                        ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                        : "bg-red-950/60 border border-red-500/40 text-red-300"
                    }`}>
                      <span>{foodToast.type === "success" ? "✓" : "⚠️"}</span>
                      <span>{foodToast.message}</span>
                    </div>
                  )}

                  {/* Today's Meals List */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        มื้ออาหารวันนี้ ({foodLogs.length})
                      </span>
                      <button
                        type="button"
                        onClick={loadTodayFoodSummary}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        รีเฟรช
                      </button>
                    </div>

                    {foodLogs.length === 0 ? (
                      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 text-center flex flex-col items-center gap-1 text-zinc-500">
                        <span className="text-2xl">🍽️</span>
                        <span className="text-xs font-medium text-zinc-400">ยังไม่มีบันทึกอาหารวันนี้</span>
                        <p className="text-[10px] text-zinc-500">
                          พิมพ์ถามแคลอรี่ในแชท หรือกดปุ่ม 📷 เพื่อสแกนอาหารได้เลย
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {foodLogs.map((log) => {
                          const time = log.loggedAt ? new Date(log.loggedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "";
                          const itemsText = (log.items || []).map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(", ");
                          return (
                            <div
                              key={log.id}
                              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs transition-colors hover:border-zinc-700"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-base">{getMealIcon(log.mealType)}</span>
                                <div className="overflow-hidden">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.2 bg-red-950/40 rounded border border-red-900/30">
                                      {log.mealType}
                                    </span>
                                    <small className="text-zinc-500 text-[10px]">{time}</small>
                                  </div>
                                  <p className="text-zinc-200 font-medium truncate mt-0.5">{itemsText || "มื้ออาหาร"}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-white text-xs">{Math.round(log.totalCalories)} kcal</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFoodLog(log.id)}
                                  className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                  title="ลบมื้อนี้"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onFood}
                    className="text-center text-xs text-zinc-400 hover:text-white py-2 px-3 rounded-xl border border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/40 transition-colors cursor-pointer"
                  >
                    เปิดหน้า Food Tracker ประวัติแบบเต็ม ↗
                  </button>
                </div>
              );
            })()}

            {/* TAB 2: WORKOUT PLAN */}
            {sidebarTab === "workout" && (
              <div className="flex flex-col gap-4">
              {/* Heading */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      แผนออกกำลังกาย AI
                    </span>
                    {justUpdatedPlan && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold">
                        ✨ ปรับตามคำขอแล้ว
                      </span>
                    )}
                  </div>
                  <strong className="block text-sm font-bold text-white mt-1">
                    {todayPlan ? `${todayPlan.focus} · ${todayPlan.exerciseName}` : planSummary}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlanDetails((v) => !v);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {showPlanDetails ? "แผนวันนี้" : "ดูทั้งสัปดาห์"}
                </button>
              </div>

              {/* Day Cards */}
              <div className="flex flex-col gap-2.5">
                {(showPlanDetails ? weeklyPlan : [todayPlan].filter(Boolean)).map((day) => {
                  const isToday = day.key === todayKey;
                  return (
                    <div
                      key={day.key}
                      className={`p-3 rounded-xl border flex flex-col gap-1.5 text-xs transition-all ${
                        isToday
                          ? "bg-red-950/25 border-red-500/40 shadow-sm"
                          : "bg-zinc-900/60 border-zinc-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400 font-bold">
                          {isToday ? "วันนี้" : day.key.slice(0, 3)}
                        </span>
                        <strong className="text-zinc-200 text-xs truncate">{day.focus}</strong>
                      </div>

                      <ol className="flex flex-col gap-1 pt-1 border-t border-zinc-800/60">
                        {(
                          day.exercises || [
                            {
                              name: day.exerciseName,
                              sets: day.sets,
                              repetitions: day.repetitions,
                            },
                          ]
                        ).map((exercise, index) => (
                          <li
                            key={`${day.key}-${exercise.name}-${index}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <b className="font-semibold text-zinc-300">{exercise.name}</b>
                            <small className="text-[11px] text-zinc-400">
                              {exercise.sets
                                ? `${exercise.sets} เซ็ต · ${exercise.repetitions}`
                                : exercise.repetitions}
                            </small>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>

              {/* Helper Hint */}
              <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60">
                ต้องการปรับแผน? พิมพ์หรือกดไมค์ เช่น “วันนี้เหนื่อยมาก” หรือ “ขอท่าแรงกระแทกต่ำ” แล้ว AI จะเลือกท่าทดแทนให้
              </p>

              {/* Plan Analytics Summary (Expanded) */}
              {showPlanDetails && (
                <section className="flex flex-col gap-3 pt-3 border-t border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    สถิติการออกกำลังกาย
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5">
                      <b className="block text-sm font-bold text-white">{planAnalytics?.totals?.sessions ?? "–"}</b>
                      <span className="text-[10px] text-zinc-400">ครั้งที่ฝึก</span>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5">
                      <b className="block text-sm font-bold text-white">{planAnalytics?.totals?.repetitions ?? "–"}</b>
                      <span className="text-[10px] text-zinc-400">ครั้งรวม</span>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5">
                      <b className="block text-sm font-bold text-white">{planAnalytics?.totals?.uniqueDays ?? "–"}</b>
                      <span className="text-[10px] text-zinc-400">วันที่ฝึก</span>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5">
                      <b className="block text-sm font-bold text-red-400">{planAnalytics?.totals?.averageScore || "–"}</b>
                      <span className="text-[10px] text-zinc-400">คะแนนเฉลี่ย</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-2">
                    ประวัติล่าสุด
                  </h3>

                  <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
                    {(planAnalytics?.recent || []).slice(0, 4).map((workout) => (
                      <li key={workout.id} className="flex items-center justify-between bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/60">
                        <span className="font-medium text-zinc-200">{workout.exercise?.name || "Exercise"}</span>
                        <small className="text-[10px] text-zinc-500">
                          {new Date(workout.startedAt).toLocaleDateString("th-TH")}
                        </small>
                      </li>
                    ))}
                    {!planAnalytics?.recent?.length && (
                      <li className="text-[11px] text-zinc-500 py-1">ยังไม่มีประวัติการออกกำลังกาย</li>
                    )}
                  </ul>
                </section>
              )}
              </div>
            )}
          </aside>

          {/* Food Camera Modal */}
          <FoodCameraModal
            isOpen={cameraModalOpen}
            onClose={() => setCameraModalOpen(false)}
            onCapture={handleAnalyzeFoodImage}
          />
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;