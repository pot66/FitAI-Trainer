import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Plus,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Flame,
  Search,
  Sparkles,
  History,
  X,
} from "lucide-react";
import api from "./services/api";
import FoodCameraModal from "./components/FoodCameraModal";
import FoodLogItem from "./components/FoodLogItem";
import { getMealLabel, getMealIcon } from "./utils/nutritionCalculator";

export default function FoodTracker({ onBack }) {
  const [activeTab, setActiveTab] = useState("today");
  const [todayData, setTodayData] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);

  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewMealType, setReviewMealType] = useState("LUNCH");
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewTotal, setReviewTotal] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [reviewWarning, setReviewWarning] = useState("");
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [savingLog, setSavingLog] = useState(false);

  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [manualForm, setManualForm] = useState({
    name: "",
    quantity: 1,
    unit: "จาน",
    mealType: "LUNCH",
  });

  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  const loadTodaySummary = async () => {
    try {
      setLoadingToday(true);
      const res = await api.get("/food/logs/today");
      if (res.data?.success) {
        setTodayData(res.data.data);
      }
    } catch (err) {
      console.error("Load today summary error:", err);
    } finally {
      setLoadingToday(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/food/logs?limit=40");
      if (res.data?.success) {
        setHistoryLogs(res.data.data.logs || []);
      }
    } catch (err) {
      console.error("Load history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadTodaySummary();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "กรุณาเลือกไฟล์ภาพ (JPG, PNG, WEBP) เท่านั้น" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: "error", message: "ขนาดไฟล์ภาพต้องไม่เกิน 10MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      analyzeBase64Image(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const analyzeBase64Image = async (base64) => {
    setIsAnalyzing(true);
    setFeedback({ type: "", message: "" });
    setReviewImagePreview(base64);

    try {
      const res = await api.post("/food/analyze-image", { imageBase64: base64 });
      if (res.data?.success) {
        const data = res.data.data;
        const items = data.items || [];
        setReviewItems(items);
        setReviewTotal(
          data.total || { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        setReviewWarning(data.warning || "");

        const hour = new Date().getHours();
        if (hour >= 5 && hour < 10) setReviewMealType("BREAKFAST");
        else if (hour >= 10 && hour < 15) setReviewMealType("LUNCH");
        else if (hour >= 15 && hour < 21) setReviewMealType("DINNER");
        else setReviewMealType("SNACK");

        setReviewModalOpen(true);
      } else {
        setFeedback({
          type: "error",
          message: res.data?.message || "ไม่สามารถวิเคราะห์ภาพได้",
        });
      }
    } catch (err) {
      console.error("Analyze image error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateReviewItem = (index, field, value) => {
    const next = [...reviewItems];
    next[index] = { ...next[index], [field]: value };

    if (field === "quantity") {
      const num = parseFloat(value) || 1;
      const baseCal = next[index].baseCalories || (next[index].calories / (next[index].quantity || 1));
      next[index].baseCalories = baseCal;
      next[index].calories = Math.round(baseCal * num);
    }

    setReviewItems(next);
    recalcReviewTotal(next);
  };

  const recalcReviewTotal = (items) => {
    let cal = 0, p = 0, c = 0, f = 0;
    for (const it of items) {
      cal += Number(it.calories) || 0;
      p += Number(it.protein) || 0;
      c += Number(it.carbs) || 0;
      f += Number(it.fat) || 0;
    }
    setReviewTotal({ calories: cal, protein: p, carbs: c, fat: f });
  };

  const removeReviewItem = (idx) => {
    const next = reviewItems.filter((_, i) => i !== idx);
    setReviewItems(next);
    recalcReviewTotal(next);
  };

  const handleSaveLog = async () => {
    if (reviewItems.length === 0) {
      setFeedback({ type: "error", message: "ต้องมีรายการอาหารอย่างน้อย 1 อย่าง" });
      return;
    }

    try {
      setSavingLog(true);
      const res = await api.post("/food/logs", {
        mealType: reviewMealType,
        items: reviewItems.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "จาน",
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          confidence: item.confidence || 0.8,
        })),
        imageKey: reviewImagePreview ? "uploaded_food" : null,
      });

      if (res.data?.success) {
        setReviewModalOpen(false);
        setReviewItems([]);
        setReviewImagePreview(null);
        setFeedback({ type: "success", message: "บันทึกข้อมูลอาหารสำเร็จเรียบร้อย!" });
        loadTodaySummary();
      }
    } catch (err) {
      console.error("Save log error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "ไม่สามารถบันทึกรายการอาหารได้",
      });
    } finally {
      setSavingLog(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("คุณต้องการลบรายการอาหารนี้ใช่หรือไม่?")) return;
    try {
      await api.delete("/food/logs/" + id);
      setFeedback({ type: "success", message: "ลบรายการอาหารสำเร็จ" });
      loadTodaySummary();
      if (activeTab === "history") loadHistory();
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  const handleSearchFoods = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }
    try {
      const res = await api.get("/food/search?q=" + encodeURIComponent(q));
      if (res.data?.success) {
        setSearchResults(res.data.data || []);
        setSearchSuggestions(res.data.suggestions || []);
      }
    } catch (err) {
      console.error("Search foods error:", err);
    }
  };

  const handleSelectSearchResult = (food) => {
    setManualForm({
      ...manualForm,
      name: food.name,
      unit: food.serving?.unit || "จาน",
      quantity: 1,
    });
    setSearchResults([]);
    setSearchSuggestions([]);
    setSearchQuery(food.name);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name.trim()) return;

    try {
      setSavingLog(true);
      const res = await api.post("/food/logs", {
        mealType: manualForm.mealType,
        items: [
          {
            name: manualForm.name,
            quantity: Number(manualForm.quantity) || 1,
            unit: manualForm.unit || "จาน",
          },
        ],
      });

      if (res.data?.success) {
        setManualModalOpen(false);
        setManualForm({ name: "", quantity: 1, unit: "จาน", mealType: "LUNCH" });
        setSearchQuery("");
        setFeedback({ type: "success", message: "บันทึกอาหารสำเร็จแล้ว!" });
        loadTodaySummary();
      }
    } catch (err) {
      console.error("Manual food save error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSavingLog(false);
    }
  };

  const consumed = todayData?.consumed?.calories || 0;
  const target = todayData?.target?.calories || 2100;
  const remaining = todayData?.remainingCalories ?? Math.max(0, target - consumed);
  const percentCal = Math.min(100, Math.round((consumed / (target || 1)) * 100));

  const protein = todayData?.consumed?.protein || 0;
  const carbs = todayData?.consumed?.carbs || 0;
  const fat = todayData?.consumed?.fat || 0;

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-[#abbed2] border-b border-[#9bb0c4] px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="ย้อนกลับ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับ</span>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#1e293b] flex items-center gap-2">
                <span>AI Food Tracker</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/70 text-[#1e293b] border border-white/80 shadow-sm">
                  Calorie & Nutrition
                </span>
              </h1>
              <p className="text-xs text-[#475569]">วิเคราะห์อาหารและคำนวณแคลอรีด้วย AI</p>
            </div>
          </div>

          <div className="flex items-center bg-white/40 p-1 rounded-xl border border-white/60">
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              className={"flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer " + (activeTab === "today" ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "text-[#1e293b] hover:bg-white/40")}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>วันนี้</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={"flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer " + (activeTab === "history" ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "text-[#1e293b] hover:bg-white/40")}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {feedback.message && (
          <div
            className={"flex items-center justify-between p-3.5 rounded-2xl border text-sm shadow-sm animate-in fade-in duration-200 " + (feedback.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700")}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: "", message: "" })}
              className="text-[#64748b] hover:text-[#1e293b] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="p-8 rounded-[24px] bg-white border border-[#3b99e2]/40 flex flex-col items-center justify-center gap-3 text-center shadow-lg animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[#c4d7e6] border border-[#3b99e2]/30 flex items-center justify-center text-[#3b99e2]">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e293b]">AI กำลังวิเคราะห์รูปภาพอาหาร...</h3>
              <p className="text-xs text-[#64748b] mt-1">
                ระบบกำลังตรวจจับประเภทอาหาร ประมาณขนาด และคำนวณสารอาหาร
              </p>
            </div>
          </div>
        )}

        {activeTab === "today" ? (
          loadingToday ? (
            <div className="p-12 text-center text-sm text-[#64748b] bg-white rounded-2xl border border-slate-200/80 animate-pulse shadow-sm">
              กำลังโหลดข้อมูลโภชนาการประจำวัน...
            </div>
          ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-3.5 p-4.5 rounded-[22px] bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 transition-all group cursor-pointer text-left shadow-sm active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#c4d7e6] border border-slate-300 flex items-center justify-center text-[#3b99e2] group-hover:scale-110 group-hover:bg-[#3b99e2] group-hover:text-white transition-all shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1e293b]">ถ่ายรูปอาหาร</h4>
                  <p className="text-xs text-[#64748b]">สแกนด้วยกล้องมือถือ/คอม</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-3.5 p-4.5 rounded-[22px] bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 transition-all group cursor-pointer text-left shadow-sm active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#c4d7e6] border border-slate-300 flex items-center justify-center text-[#3b99e2] group-hover:scale-110 group-hover:bg-[#3b99e2] group-hover:text-white transition-all shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1e293b]">อัปโหลดรูปภาพ</h4>
                  <p className="text-xs text-[#64748b]">เลือกรูปจากคลังภาพ</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                onClick={() => setManualModalOpen(true)}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-3.5 p-4.5 rounded-[22px] bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 transition-all group cursor-pointer text-left shadow-sm active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#c4d7e6] border border-slate-300 flex items-center justify-center text-[#3b99e2] group-hover:scale-110 group-hover:bg-[#3b99e2] group-hover:text-white transition-all shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1e293b]">กรอกอาหารเอง</h4>
                  <p className="text-xs text-[#64748b]">ค้นหาหรือระบุชื่ออาหาร</p>
                </div>
              </button>
            </section>

            <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#3b99e2] uppercase tracking-wider">
                    Today's Nutrition
                  </span>
                  <h2 className="text-xl font-extrabold text-[#1e293b] mt-0.5">สรุปแคลอรีประจำวัน</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#64748b]">เป้าหมาย TDEE</span>
                  <p className="text-base font-bold text-[#1e293b]">{target} kcal</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 text-center">
                <div>
                  <span className="text-xs text-[#64748b] font-medium">รับประทานแล้ว</span>
                  <p className="text-xl sm:text-2xl font-black text-[#3b99e2] mt-1">{consumed}</p>
                  <span className="text-[11px] text-[#64748b]">kcal</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-xs text-[#64748b] font-medium">เป้าหมายประจำวัน</span>
                  <p className="text-xl sm:text-2xl font-black text-[#1e293b] mt-1">{target}</p>
                  <span className="text-[11px] text-[#64748b]">kcal</span>
                </div>
                <div>
                  <span className="text-xs text-[#64748b] font-medium">คงเหลือ</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{remaining}</p>
                  <span className="text-[11px] text-[#64748b]">kcal</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-[#64748b] font-semibold">
                  <span>ความคืบหน้าแคลอรี</span>
                  <span>{percentCal}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={"h-full transition-all duration-500 rounded-full " + (consumed > target ? "bg-amber-500" : "bg-[#3b99e2] shadow-sm shadow-[#3b99e2]/30")}
                    style={{ width: percentCal + "%" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b]">โปรตีน</span>
                    <strong className="text-[#1e293b]">{protein}g</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#3b99e2] rounded-full"
                      style={{ width: Math.min(100, (protein / 120) * 100) + "%" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b]">คาร์บ</span>
                    <strong className="text-[#1e293b]">{carbs}g</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: Math.min(100, (carbs / 250) * 100) + "%" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b]">ไขมัน</span>
                    <strong className="text-[#1e293b]">{fat}g</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: Math.min(100, (fat / 65) * 100) + "%" }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-[#1e293b]">มื้ออาหารของวันนี้</h3>

              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((mealKey) => {
                const mealData = todayData?.mealBreakdown?.[mealKey];
                const mealCalories = mealData?.calories || 0;
                const mealLogs = mealData?.logs || [];

                return (
                  <div
                    key={mealKey}
                    className="bg-white border border-slate-200/80 rounded-[22px] p-5 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMealIcon(mealKey)}</span>
                        <h4 className="text-sm font-bold text-[#1e293b]">{getMealLabel(mealKey)}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#3b99e2]">{mealCalories}</span>
                        <span className="text-xs text-[#64748b] ml-1">kcal</span>
                      </div>
                    </div>

                    {mealLogs.length === 0 ? (
                      <div className="py-3 text-center text-xs text-[#64748b]">
                        ยังไม่มีรายการอาหารในมื้อนี้
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {mealLogs.map((log) => (
                          <FoodLogItem
                            key={log.id}
                            log={log}
                            onDelete={handleDeleteLog}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </>
          )
        ) : (
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
              <History className="w-5 h-5 text-[#3b99e2]" />
              <span>ประวัติการรับประทานอาหาร</span>
            </h3>

            {loadingHistory ? (
              <div className="py-12 text-center text-xs text-[#64748b]">
                กำลังโหลดประวัติ...
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748b]">
                ยังไม่มีข้อมูลประวัติอาหาร
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {historyLogs.map((log) => (
                  <FoodLogItem
                    key={log.id}
                    log={log}
                    onDelete={handleDeleteLog}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#9bb0c4] bg-[#abbed2]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1e293b]" />
                <h3 className="text-base font-bold text-[#1e293b]">ผลการวิเคราะห์อาหารด้วย AI</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 text-[#1e293b] hover:bg-white/40 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {reviewWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{reviewWarning}</span>
                </div>
              )}

              {reviewImagePreview && (
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                  <img src={reviewImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">เลือกมื้ออาหาร:</label>
                <div className="grid grid-cols-4 gap-2">
                  {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setReviewMealType(m)}
                      className={"px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (reviewMealType === m ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "bg-[#edf1f4] text-[#475569] hover:bg-[#e2e8f0]")}
                    >
                      {getMealLabel(m)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-[#475569]">รายการอาหารที่ตรวจพบ (แก้ไขได้):</span>
                {reviewItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateReviewItem(idx, "name", e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-[#1e293b] flex-1 mr-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeReviewItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[#64748b]">จำนวน:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={item.quantity || 1}
                          onChange={(e) => updateReviewItem(idx, "quantity", e.target.value)}
                          className="w-14 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs text-[#1e293b] text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#64748b]">หน่วย:</span>
                        <input
                          type="text"
                          value={item.unit || "จาน"}
                          onChange={(e) => updateReviewItem(idx, "unit", e.target.value)}
                          className="w-16 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs text-[#1e293b] text-center font-bold"
                        />
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-xs font-extrabold text-[#3b99e2]">
                          {Math.round(item.calories)} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#edf1f4] border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#64748b]">พลังงานรวม:</span>
                  <p className="text-xl font-black text-[#3b99e2]">{Math.round(reviewTotal.calories)} kcal</p>
                </div>
                <div className="text-right text-xs text-[#475569]">
                  <span>โปรตีน: <strong className="text-[#1e293b]">{Math.round(reviewTotal.protein)}g</strong></span> ·{" "}
                  <span>คาร์บ: <strong className="text-[#1e293b]">{Math.round(reviewTotal.carbs)}g</strong></span> ·{" "}
                  <span>ไขมัน: <strong className="text-[#1e293b]">{Math.round(reviewTotal.fat)}g</strong></span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#64748b] hover:text-[#1e293b] rounded-xl bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveLog}
                disabled={savingLog}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#3b99e2] hover:bg-[#288ad4] rounded-xl shadow-md shadow-[#3b99e2]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingLog ? "กำลังบันทึก..." : "ยืนยันและบันทึก (Confirm & Save)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#9bb0c4] bg-[#abbed2]">
              <h3 className="text-base font-bold text-[#1e293b]">กรอกข้อมูลอาหารด้วยตนเอง</h3>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="p-1.5 text-[#1e293b] hover:bg-white/40 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  ค้นหาหรือพิมพ์ชื่ออาหาร
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchFoods(e.target.value)}
                    placeholder="เช่น ข้าวกะเพราไก่, ไข่ต้ม, อกไก่..."
                    className="w-full bg-[#c4d7e6] border border-slate-300 rounded-xl px-3 py-2.5 pl-9 text-sm text-[#1e293b] placeholder-[#64748b] font-medium focus:outline-none focus:ring-2 focus:ring-[#3b99e2]"
                    required
                  />
                  <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-3.5" />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 shadow-xl">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left px-3 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[#1e293b]">{item.name}</span>
                        <span className="text-[#3b99e2] font-semibold">{item.serving?.calories} kcal</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchSuggestions.length > 0 && searchQuery.trim().length >= 2 && (
                  <div className="mt-2.5 bg-[#edf1f4] border border-[#abbed2] rounded-xl p-3 shadow-md animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e293b] mb-2">
                      <Sparkles className="w-4 h-4 text-[#3b99e2]" />
                      <span>ไม่พบเมนูที่ค้นหา แต่ FitAI แนะนำเมนูที่ใกล้เคียง:</span>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {searchSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSearchResult(item)}
                          className="w-full text-left p-2.5 rounded-lg bg-white/90 hover:bg-white border border-[#c4d7e6] hover:border-[#3b99e2] transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                        >
                          <div className="pr-2">
                            <div className="font-bold text-xs text-[#1e293b] group-hover:text-[#3b99e2] transition-colors">
                              {item.name}
                            </div>
                            {item.reason && (
                              <div className="text-[11px] text-[#64748b] mt-0.5">
                                💡 {item.reason}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex flex-col items-end shrink-0">
                            <span className="text-xs font-extrabold text-[#3b99e2]">
                              {item.serving?.calories} kcal
                            </span>
                            <span className="text-[10px] text-[#64748b]">
                              โปรตีน {item.serving?.protein || 0}g
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">ปริมาณ</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={manualForm.quantity}
                    onChange={(e) => setManualForm({ ...manualForm, quantity: e.target.value })}
                    className="w-full bg-[#c4d7e6] border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-[#1e293b] text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#3b99e2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">หน่วย</label>
                  <input
                    type="text"
                    value={manualForm.unit}
                    onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                    className="w-full bg-[#c4d7e6] border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-[#1e293b] text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#3b99e2]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">มื้ออาหาร</label>
                <div className="grid grid-cols-4 gap-2">
                  {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, mealType: m })}
                      className={"px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (manualForm.mealType === m ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25" : "bg-[#edf1f4] text-[#475569] hover:bg-[#e2e8f0]")}
                    >
                      {getMealLabel(m)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingLog}
                className="w-full mt-2 py-3 rounded-2xl bg-[#3b99e2] hover:bg-[#288ad4] text-white font-bold text-sm shadow-md shadow-[#3b99e2]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {savingLog ? "กำลังบันทึก..." : "บันทึกอาหาร"}
              </button>
            </form>
          </div>
        </div>
      )}

      <FoodCameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={analyzeBase64Image}
      />
    </div>
  );
}
