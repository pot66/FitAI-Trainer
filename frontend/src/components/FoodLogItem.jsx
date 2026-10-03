import { Trash2 } from "lucide-react";

export default function FoodLogItem({ log, onDelete }) {
  const items = log.items || [];
  const timeStr = log.loggedAt
    ? new Date(log.loggedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#c4d7e6] text-[#1e293b] border border-slate-300">
              {log.mealType}
            </span>
            <span className="text-xs text-[#64748b]">{timeStr}</span>
          </div>
          {log.note && <p className="text-xs text-[#64748b] mt-1 italic">{log.note}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-base font-extrabold text-[#3b99e2]">{Math.round(log.totalCalories)}</span>
            <span className="text-xs text-[#64748b] ml-1">kcal</span>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(log.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="ลบรายการนี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Food items list */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center justify-between text-xs text-[#1e293b]">
            <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
              • {item.name} <span className="text-[#64748b]">({item.quantity} {item.unit})</span>
            </span>
            <span className="text-[#64748b] font-semibold">
              {Math.round(item.calories)} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Macro Pills */}
      <div className="flex items-center gap-3 text-[11px] text-[#64748b] pt-1">
        <span>โปรตีน: <strong className="text-[#1e293b]">{Math.round(log.totalProtein)}g</strong></span>
        <span>คาร์บ: <strong className="text-[#1e293b]">{Math.round(log.totalCarbs)}g</strong></span>
        <span>ไขมัน: <strong className="text-[#1e293b]">{Math.round(log.totalFat)}g</strong></span>
      </div>
    </div>
  );
}
