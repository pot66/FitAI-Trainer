import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";

function Dashboard({ profile, error }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full mb-2 uppercase">
              AI FITNESS ASSISTANT
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              FitAI <span className="text-red-500 font-black">Trainer</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              ยินดีต้อนรับคุณ <strong className="text-zinc-200">{user?.name || "User"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>ตั้งค่า</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Error Card */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-5 text-red-400">
            <h2 className="text-base font-semibold mb-1">ไม่สามารถโหลด Profile ได้</h2>
            <p className="text-sm text-red-400/90">{error}</p>
          </div>
        )}

        {/* User Information Section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
            <span>👤</span>
            <span>ข้อมูลผู้ใช้งาน</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">ชื่อ</span>
              <strong className="text-lg font-bold text-zinc-100">{user?.name || "-"}</strong>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</span>
              <strong className="text-lg font-bold text-zinc-100 truncate">{user?.email || "-"}</strong>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">อายุ</span>
              <strong className="text-lg font-bold text-zinc-100">{profile?.age ? `${profile.age} ปี` : "-"}</strong>
            </div>
          </div>
        </section>

        {/* Health Section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
            <span>📊</span>
            <span>ข้อมูลสุขภาพ</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">ส่วนสูง</span>
              <strong className="text-lg font-bold text-zinc-100">{profile?.height ? `${profile.height} cm` : "-"}</strong>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">น้ำหนัก</span>
              <strong className="text-lg font-bold text-zinc-100">{profile?.weight ? `${profile.weight} kg` : "-"}</strong>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-1 relative overflow-hidden">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">BMI</span>
              <div className="flex items-baseline gap-2">
                <strong className="text-xl font-black text-red-500">{profile?.bmi || "-"}</strong>
                {profile?.bmiStatus && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {profile.bmiStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Action Deck */}
        <section className="flex flex-col gap-3 pt-2">
          <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
            <span>🚀</span>
            <span>เมนูลัด FitAI Trainer</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => navigate("/ai")}
              className="p-5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl text-left shadow-lg shadow-red-600/20 transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[120px] group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🤖</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">แนะนำ</span>
              </div>
              <div>
                <strong className="block text-base font-bold">AI Assistant</strong>
                <span className="text-xs text-red-100 opacity-90">ปรึกษาและวางแผนการออกกำลังกายกับ AI</span>
              </div>
            </button>

            {/* Food Tracker */}
            <button
              type="button"
              onClick={() => navigate("/food")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500/40 text-zinc-100 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[120px] group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🍽️</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  AI Calorie
                </span>
              </div>
              <div>
                <strong className="block text-base font-bold group-hover:text-red-400 transition-colors">
                  AI Food Tracker
                </strong>
                <span className="text-xs text-zinc-400">ถ่ายรูปคำนวณแคลอรีและบันทึกอาหาร</span>
              </div>
            </button>

            {/* Workout */}
            <button
              type="button"
              onClick={() => navigate("/workout")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[120px]"
            >
              <span className="text-2xl">🏋️‍♂️</span>
              <div>
                <strong className="block text-base font-bold">Workout Mode</strong>
                <span className="text-xs text-zinc-400">ฝึกออกกำลังกายพร้อมตรวจจับท่าทางด้วย AI</span>
              </div>
            </button>

            {/* Weekly Plan */}
            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[120px]"
            >
              <span className="text-2xl">📅</span>
              <div>
                <strong className="block text-base font-bold">Weekly Plan</strong>
                <span className="text-xs text-zinc-400">ตารางการฝึกรายสัปดาห์เฉพาะตัว</span>
              </div>
            </button>

            {/* Progress */}
            <button
              type="button"
              onClick={() => navigate("/progress")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[120px]"
            >
              <span className="text-2xl">📈</span>
              <div>
                <strong className="block text-base font-bold">Progress</strong>
                <span className="text-xs text-zinc-400">ติดตามพัฒนาการและสถิติการออกกำลังกาย</span>
              </div>
            </button>

            {/* My Profile */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[120px]"
            >
              <span className="text-2xl">👤</span>
              <div>
                <strong className="block text-base font-bold">My Profile</strong>
                <span className="text-xs text-zinc-400">แก้ไขข้อมูลส่วนตัวและเป้าหมาย</span>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;