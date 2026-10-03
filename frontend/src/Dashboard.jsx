import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";

function Dashboard({ profile, error }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/ai-trainer-logo.png" alt="Logo" className="w-8 h-8 rounded-full shadow-sm" />
            <span className="text-base font-extrabold text-[#1e293b] tracking-wide">
              FitAI <span className="text-white font-black">Trainer</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>⚙️</span>
              <span>ตั้งค่า</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-[#edf1f4] border border-slate-200/80 rounded-full mb-2 uppercase">
              AI FITNESS DASHBOARD
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1e293b]">
              ยินดีต้อนรับคุณ <span className="text-[#3b99e2]">{user?.name || "User"}</span>
            </h1>
            <p className="text-[#64748b] text-sm mt-1">
              ผู้ช่วยออกกำลังกายและควบคุมโภชนาการส่วนบุคคลด้วยระบบปัญญาประดิษฐ์
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/ai")}
            className="px-5 py-3 bg-[#3b99e2] hover:bg-[#288ad4] text-white font-bold text-sm rounded-2xl shadow-md shadow-[#3b99e2]/25 transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <span>🤖</span>
            <span>เริ่มคุยกับ AI</span>
          </button>
        </div>

        {/* Error Card */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Details Section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
            <span>👤</span>
            <span>ข้อมูลผู้ใช้งาน</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">ชื่อ-นามสกุล</span>
              <strong className="text-lg font-bold text-[#1e293b] truncate">{user?.name || "-"}</strong>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Username</span>
              <strong className="text-lg font-bold text-[#1e293b] truncate">{user?.username || "-"}</strong>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Email</span>
              <strong className="text-lg font-bold text-[#1e293b] truncate">{user?.email || "-"}</strong>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">อายุ</span>
              <strong className="text-lg font-bold text-[#1e293b]">{profile?.age ? `${profile.age} ปี` : "-"}</strong>
            </div>
          </div>
        </section>

        {/* Health Section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
            <span>📊</span>
            <span>ข้อมูลสุขภาพ</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">ส่วนสูง</span>
              <strong className="text-lg font-bold text-[#1e293b]">{profile?.height ? `${profile.height} cm` : "-"}</strong>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">น้ำหนัก</span>
              <strong className="text-lg font-bold text-[#1e293b]">{profile?.weight ? `${profile.weight} kg` : "-"}</strong>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-1 shadow-sm relative overflow-hidden">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">BMI</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <strong className="text-2xl font-black text-[#3b99e2]">{profile?.bmi || "-"}</strong>
                {profile?.bmiStatus && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#c4d7e6] text-[#1e293b] border border-slate-300">
                    {profile.bmiStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Action Deck */}
        <section className="flex flex-col gap-3 pt-2">
          <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
            <span>🚀</span>
            <span>เมนูลัด FitAI Trainer</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => navigate("/ai")}
              className="p-5 bg-gradient-to-br from-[#3b99e2] to-[#2563eb] hover:from-[#288ad4] hover:to-[#1d4ed8] text-white rounded-[24px] text-left shadow-md shadow-[#3b99e2]/25 transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[125px] group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🤖</span>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">แนะนำ</span>
              </div>
              <div>
                <strong className="block text-base font-bold">AI Assistant</strong>
                <span className="text-xs text-blue-100 opacity-95">ปรึกษาและวางแผนการออกกำลังกายกับ AI</span>
              </div>
            </button>

            {/* Food Tracker */}
            <button
              type="button"
              onClick={() => navigate("/food")}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 text-[#1e293b] rounded-[24px] text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[125px] shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🍽️</span>
                <span className="text-[10px] bg-[#c4d7e6] text-[#1e293b] border border-slate-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  AI Calorie
                </span>
              </div>
              <div>
                <strong className="block text-base font-bold group-hover:text-[#3b99e2] transition-colors">
                  AI Food Tracker
                </strong>
                <span className="text-xs text-[#64748b]">ถ่ายรูปคำนวณแคลอรีและบันทึกอาหาร</span>
              </div>
            </button>

            {/* Workout */}
            <button
              type="button"
              onClick={() => navigate("/workout")}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 text-[#1e293b] rounded-[24px] text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[125px] shadow-sm group"
            >
              <span className="text-2xl">🏋️‍♂️</span>
              <div>
                <strong className="block text-base font-bold group-hover:text-[#3b99e2] transition-colors">Workout Mode</strong>
                <span className="text-xs text-[#64748b]">ฝึกออกกำลังกายพร้อมตรวจจับท่าทางด้วย AI</span>
              </div>
            </button>

            {/* Weekly Plan */}
            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 text-[#1e293b] rounded-[24px] text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[125px] shadow-sm group"
            >
              <span className="text-2xl">📅</span>
              <div>
                <strong className="block text-base font-bold group-hover:text-[#3b99e2] transition-colors">Weekly Plan</strong>
                <span className="text-xs text-[#64748b]">ตารางการฝึกรายสัปดาห์เฉพาะตัว</span>
              </div>
            </button>

            {/* Progress */}
            <button
              type="button"
              onClick={() => navigate("/progress")}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 text-[#1e293b] rounded-[24px] text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[125px] shadow-sm group"
            >
              <span className="text-2xl">📈</span>
              <div>
                <strong className="block text-base font-bold group-hover:text-[#3b99e2] transition-colors">Progress</strong>
                <span className="text-xs text-[#64748b]">ติดตามพัฒนาการและสถิติการออกกำลังกาย</span>
              </div>
            </button>

            {/* My Profile */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="p-5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#3b99e2]/60 text-[#1e293b] rounded-[24px] text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[125px] shadow-sm group"
            >
              <span className="text-2xl">👤</span>
              <div>
                <strong className="block text-base font-bold group-hover:text-[#3b99e2] transition-colors">My Profile</strong>
                <span className="text-xs text-[#64748b]">แก้ไขข้อมูลส่วนตัวและเป้าหมาย</span>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
