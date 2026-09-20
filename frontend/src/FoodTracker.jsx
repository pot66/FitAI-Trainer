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
    try {
      setIsAnalyzing(true);
      setFeedback({ type: "", message: "" });
      setReviewImagePreview(base64);

      const res = await api.post("/food/analyze", {
        imageBase64: base64,
      });

      if (res.data?.success) {
        const data = res.data.data;
        setReviewMealType(data.mealType || "LUNCH");
        setReviewItems(data.items || []);
        setReviewTotal(data.total || { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setReviewWarning(data.warning || "");
        setReviewModalOpen(true);
      } else {
        setFeedback({
          type: "error",
          message: res.data?.message || "ไม่สามารถวิเคราะห์รูปอาหารได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    } catch (err) {
      console.error("Analyze food error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "ไม่สามารถวิเคราะห์รูปอาหารได้ กรุณาลองถ่ายรูปใหม่",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateReviewItem = async (index, field, value) => {
    const updated = [...reviewItems];
    updated[index] = { ...updated[index], [field]: value };

    try {
      const res = await api.post("/food/calculate", { items: updated });
      if (res.data?.success) {
        setReviewItems(res.data.data.items);
        setReviewTotal(res.data.data.total);
      } else {
        setReviewItems(updated);
      }
    } catch {
      setReviewItems(updated);
    }
  };

  const removeReviewItem = (index) => {
    const updated = reviewItems.filter((_, i) => i !== index);
    setReviewItems(updated);
    if (updated.length > 0) {
      api.post("/food/calculate", { items: updated }).then((res) => {
        if (res.data?.success) setReviewTotal(res.data.data.total);
      });
    } else {
      setReviewTotal({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  };

  const addReviewItem = () => {
    const newItem = {
      name: "ข้าวสวย (ข้าวหอมมะลิ)",
      quantity: 1,
      unit: "จาน",
      calories: 195,
      protein: 4.1,
      carbs: 42.3,
      fat: 0.5,
      confidence: 1.0,
      isCustom: false,
    };
    const updated = [...reviewItems, newItem];
    setReviewItems(updated);
    api.post("/food/calculate", { items: updated }).then((res) => {
      if (res.data?.success) setReviewTotal(res.data.data.total);
    });
  };

  const handleSaveLog = async () => {
    if (!reviewItems.length) {
      setFeedback({ type: "error", message: "กรุณาระบุรายการอาหารอย่างน้อย 1 รายการ" });
      return;
    }
    try {
      setSavingLog(true);
      const res = await api.post("/food/logs", {
        mealType: reviewMealType,
        items: reviewItems,
        imageUrl: reviewImagePreview ? reviewImagePreview.slice(0, 2000) : null,
      });

      if (res.data?.success) {
        setReviewModalOpen(false);
        setFeedback({ type: "success", message: "บันทึกข้อมูลอาหารเรียบร้อยแล้ว!" });
        loadTodaySummary();
      }
    } catch (err) {
      console.error("Save log error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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
      return;
    }
    try {
      const res = await api.get("/food/search?q=" + encodeURIComponent(q));
      if (res.data?.success) {
        setSearchResults(res.data.data || []);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="ย้อนกลับ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>AI Food Tracker</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                  Calorie & Nutrition
                </span>
              </h1>
              <p className="text-xs text-zinc-400">วิเคราะห์อาหารและคำนวณแคลอรีด้วย AI</p>
            </div>
          </div>

          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer " + (activeTab === "today" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-zinc-400 hover:text-white")}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>วันนี้</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer " + (activeTab === "history" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-zinc-400 hover:text-white")}
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
            className={"flex items-center justify-between p-3.5 rounded-xl border text-sm animate-in fade-in duration-200 " + (feedback.type === "error" ? "bg-red-950/40 border-red-500/30 text-red-300" : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300")}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: "", message: "" })}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="p-8 rounded-2xl bg-zinc-900/90 border border-red-500/40 flex flex-col items-center justify-center gap-3 text-center shadow-xl animate-pulse">
            <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">AI กำลังวิเคราะห์รูปภาพอาหาร...</h3>
              <p className="text-xs text-zinc-400 mt-1">
                ระบบกำลังตรวจจับประเภทอาหาร ประมาณขนาด และคำนวณสารอาหาร
              </p>
            </div>
          </div>
        )}

        {activeTab === "today" ? (
          loadingToday ? (
            <div className="p-12 text-center text-sm text-zinc-500 bg-zinc-900/60 rounded-2xl border border-white/5 animate-pulse">
              กำลังโหลดข้อมูลโภชนาการประจำวัน...
            </div>
          ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-red-500/40 transition-all group cursor-pointer text-left shadow-lg"
              >
                <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">ถ่ายรูปอาหาร</h4>
                  <p className="text-xs text-zinc-400">สแกนด้วยกล้องมือถือ/คอม</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-red-500/40 transition-all group cursor-pointer text-left shadow-lg"
              >
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">อัปโหลดรูปภาพ</h4>
                  <p className="text-xs text-zinc-400">เลือกรูปจากคลังภาพ</p>
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
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-red-500/40 transition-all group cursor-pointer text-left shadow-lg"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">กรอกอาหารเอง</h4>
                  <p className="text-xs text-zinc-400">ค้นหาหรือระบุชื่ออาหาร</p>
                </div>
              </button>
            </section>

            <section className="bg-zinc-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Today's Nutrition
                  </span>
                  <h2 className="text-xl font-extrabold text-zinc-100 mt-0.5">สรุปแคลอรีประจำวัน</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">เป้าหมาย TDEE</span>
                  <p className="text-base font-bold text-zinc-200">{target} kcal</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-950/60 border border-white/5 text-center">
                <div>
                  <span className="text-xs text-zinc-400">รับประทานแล้ว</span>
                  <p className="text-xl sm:text-2xl font-black text-red-500 mt-1">{consumed}</p>
                  <span className="text-[11px] text-zinc-500">kcal</span>
                </div>
                <div className="border-x border-white/10">
                  <span className="text-xs text-zinc-400">เป้าหมายประจำวัน</span>
                  <p className="text-xl sm:text-2xl font-black text-zinc-100 mt-1">{target}</p>
                  <span className="text-[11px] text-zinc-500">kcal</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400">คงเหลือ</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{remaining}</p>
                  <span className="text-[11px] text-zinc-500">kcal</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>ความคืบหน้าแคลอรี</span>
                  <span>{percentCal}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={"h-full transition-all duration-500 rounded-full " + (consumed > target ? "bg-amber-500" : "bg-red-600 shadow-sm shadow-red-600/50")}
                    style={{ width: percentCal + "%" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">โปรตีน</span>
                    <strong className="text-zinc-200">{protein}g</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: Math.min(100, (protein / 120) * 100) + "%" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">คาร์บ</span>
                    <strong className="text-zinc-200">{carbs}g</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: Math.min(100, (carbs / 250) * 100) + "%" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">ไขมัน</span>
                    <strong className="text-zinc-200">{fat}g</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: Math.min(100, (fat / 65) * 100) + "%" }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-zinc-200">มื้ออาหารของวันนี้</h3>

              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((mealKey) => {
                const mealData = todayData?.mealBreakdown?.[mealKey];
                const mealCalories = mealData?.calories || 0;
                const mealLogs = mealData?.logs || [];

                return (
                  <div
                    key={mealKey}
                    className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMealIcon(mealKey)}</span>
                        <h4 className="text-sm font-bold text-zinc-100">{getMealLabel(mealKey)}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-red-400">{mealCalories}</span>
                        <span className="text-xs text-zinc-500 ml-1">kcal</span>
                      </div>
                    </div>

                    {mealLogs.length > 0 ? (
                      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        {mealLogs.map((log) => (
                          <FoodLogItem key={log.id} log={log} onDelete={handleDeleteLog} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 text-center text-xs text-zinc-500 italic">
                        ยังไม่มีรายการอาหารในมื้อนี้
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )) : (
          <section className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-zinc-200">ประวัติการรับประทานอาหาร</h3>
            {loadingHistory ? (
              <div className="p-8 text-center text-sm text-zinc-500">กำลังโหลดประวัติ...</div>
            ) : historyLogs.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 bg-zinc-900/60 rounded-2xl border border-white/5">
                ยังไม่มีประวัติการบันทึกอาหาร
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {historyLogs.map((log) => (
                  <FoodLogItem key={log.id} log={log} onDelete={handleDeleteLog} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-8">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-zinc-100">ผลการวิเคราะห์อาหาร (AI Review)</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {reviewWarning && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{reviewWarning}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  เลือกมื้ออาหาร (Meal Type)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setReviewMealType(m)}
                      className={"px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer " + (reviewMealType === m ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "bg-zinc-800/80 text-zinc-400 hover:text-white")}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">รายการอาหารที่ตรวจพบ:</span>
                  <button
                    type="button"
                    onClick={addReviewItem}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการ</span>
                  </button>
                </div>

                {reviewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/70 border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateReviewItem(idx, "name", e.target.value)}
                        className="bg-transparent text-sm font-bold text-zinc-100 border-b border-transparent hover:border-zinc-600 focus:border-red-500 focus:outline-none flex-1"
                        placeholder="ชื่ออาหาร"
                      />
                      <button
                        type="button"
                        onClick={() => removeReviewItem(idx)}
                        className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <label className="text-xs text-zinc-500">จำนวน:</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateReviewItem(idx, "quantity", parseFloat(e.target.value) || 1)
                          }
                          className="w-16 bg-zinc-800 border border-white/10 rounded px-2 py-1 text-xs text-zinc-100 text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-xs text-zinc-500">หน่วย:</label>
                        <input
                          type="text"
                          value={item.unit || "จาน"}
                          onChange={(e) => updateReviewItem(idx, "unit", e.target.value)}
                          className="w-16 bg-zinc-800 border border-white/10 rounded px-2 py-1 text-xs text-zinc-100 text-center"
                        />
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-xs font-bold text-zinc-200">
                          {Math.round(item.calories)} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400">พลังงานรวม:</span>
                  <p className="text-xl font-extrabold text-red-400">{Math.round(reviewTotal.calories)} kcal</p>
                </div>
                <div className="text-right text-xs text-zinc-300">
                  <span>โปรตีน: <strong>{Math.round(reviewTotal.protein)}g</strong></span> ·{" "}
                  <span>คาร์บ: <strong>{Math.round(reviewTotal.carbs)}g</strong></span> ·{" "}
                  <span>ไขมัน: <strong>{Math.round(reviewTotal.fat)}g</strong></span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/90 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveLog}
                disabled={savingLog}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingLog ? "กำลังบันทึก..." : "ยืนยันและบันทึก (Confirm & Save)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/80">
              <h3 className="text-base font-bold text-zinc-100">กรอกข้อมูลอาหารด้วยตนเอง</h3>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  ค้นหาหรือพิมพ์ชื่ออาหาร
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchFoods(e.target.value)}
                    placeholder="เช่น ข้าวกะเพราไก่, ไข่ต้ม, อกไก่..."
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 pl-9 text-sm text-zinc-100 focus:border-red-500 focus:outline-none"
                    required
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-1.5 bg-zinc-950 border border-white/10 rounded-xl max-h-48 overflow-y-auto divide-y divide-white/5 shadow-xl">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-zinc-200">{item.name}</span>
                        <span className="text-zinc-500">{item.serving?.calories} kcal</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">ปริมาณ</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={manualForm.quantity}
                    onChange={(e) => setManualForm({ ...manualForm, quantity: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100 text-center focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">หน่วย</label>
                  <input
                    type="text"
                    value={manualForm.unit}
                    onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100 text-center focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">มื้ออาหาร</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, mealType: m })}
                      className={"px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer " + (manualForm.mealType === m ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white")}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingLog}
                className="w-full mt-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
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
