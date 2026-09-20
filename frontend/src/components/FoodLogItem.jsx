import { Trash2 } from "lucide-react";

export default function FoodLogItem({ log, onDelete }) {
  const items = log.items || [];
  const timeStr = log.loggedAt
    ? new Date(log.loggedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="bg-zinc-900/80 border border-white/5 hover:border-white/15 rounded-xl p-4 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {log.mealType}
            </span>
            <span className="text-xs text-zinc-400">{timeStr}</span>
          </div>
          {log.note && <p className="text-xs text-zinc-400 mt-1 italic">{log.note}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-base font-bold text-zinc-100">{Math.round(log.totalCalories)}</span>
            <span className="text-xs text-zinc-400 ml-1">kcal</span>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(log.id)}
              className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
              title="ลบรายการนี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Food items list */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center justify-between text-xs text-zinc-300">
            <span className="truncate max-w-[200px] sm:max-w-xs">
              • {item.name} <span className="text-zinc-500">({item.quantity} {item.unit})</span>
            </span>
            <span className="text-zinc-400 font-medium">
              {Math.round(item.calories)} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Macro Pills */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
        <span>โปรตีน: <strong className="text-zinc-200">{Math.round(log.totalProtein)}g</strong></span>
        <span>คาร์บ: <strong className="text-zinc-200">{Math.round(log.totalCarbs)}g</strong></span>
        <span>ไขมัน: <strong className="text-zinc-200">{Math.round(log.totalFat)}g</strong></span>
      </div>
    </div>
  );
}