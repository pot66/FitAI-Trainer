import { useEffect, useState } from "react";
import { calculateLegAngles, isPoseVisible } from "./utils/poseUtils";

function PoseAnalyzer({ landmarks, exercise = "squat", onAnalysis }) {
  const [analysis, setAnalysis] = useState({
    visible: false,
    leftKneeAngle: 0,
    rightKneeAngle: 0,
    leftHipAngle: 0,
    rightHipAngle: 0,
    kneeStatus: "รอการตรวจจับ",
    feedback: "กรุณายืนให้กล้องเห็นเต็มตัว",
  });

  useEffect(() => {
    if (!landmarks) return;

    const visible = isPoseVisible(landmarks);

    if (!visible) {
      const result = {
        visible: false,
        leftKneeAngle: 0,
        rightKneeAngle: 0,
        leftHipAngle: 0,
        rightHipAngle: 0,
        kneeStatus: "ไม่พบผู้ใช้งาน",
        feedback: "กรุณายืนให้กล้องเห็นเต็มตัว",
      };
      setAnalysis(result);
      if (onAnalysis) onAnalysis(result);
      return;
    }

    if (exercise === "squat") {
      const angles = calculateLegAngles(landmarks);
      if (!angles) return;

      const averageKneeAngle = (angles.leftKneeAngle + angles.rightKneeAngle) / 2;

      let kneeStatus = "กำลังยืน";
      let feedback = "พร้อมเริ่มต้น";

      if (averageKneeAngle > 170) {
        kneeStatus = "ท่ายืนตรง";
        feedback = "พร้อมแล้ว เริ่มต้นย่อตัวลงได้เลยครับ สู้ๆ 💪";
      } else if (averageKneeAngle > 100) {
        kneeStatus = "กำลังย่อเข่า";
        feedback = "ย่อลงอีกนิดครับ คุณทำได้! 🔥";
      } else if (averageKneeAngle >= 70) {
        kneeStatus = "ท่า Squat สวยงาม";
        feedback = "ยอดเยี่ยมมาก! ฟอร์มเป๊ะสุดๆ ดันตัวขึ้นเลย ✨";
      } else {
        kneeStatus = "ย่อลึกเกินไป";
        feedback = "ระวังข้อเข่า ดันตัวขึ้นเล็กน้อยครับ สู้ๆ!";
      }

      const result = {
        visible: true,
        leftKneeAngle: angles.leftKneeAngle,
        rightKneeAngle: angles.rightKneeAngle,
        leftHipAngle: angles.leftHipAngle,
        rightHipAngle: angles.rightHipAngle,
        averageKneeAngle: Math.round(averageKneeAngle),
        kneeStatus,
        feedback,
      };

      setAnalysis(result);
      if (onAnalysis) onAnalysis(result);
    }
  }, [landmarks, exercise, onAnalysis]);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
          <span>🤖</span>
          <span>AI Pose Analysis</span>
        </span>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
            analysis.visible
              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {analysis.visible ? "● LIVE" : "○ WAITING"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[10px] text-zinc-500 font-medium">Left Knee</span>
          <strong className="text-sm font-bold text-zinc-100">{analysis.leftKneeAngle}°</strong>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[10px] text-zinc-500 font-medium">Right Knee</span>
          <strong className="text-sm font-bold text-zinc-100">{analysis.rightKneeAngle}°</strong>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[10px] text-zinc-500 font-medium">Left Hip</span>
          <strong className="text-sm font-bold text-zinc-100">{analysis.leftHipAngle}°</strong>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex flex-col">
          <span className="text-[10px] text-zinc-500 font-medium">Right Hip</span>
          <strong className="text-sm font-bold text-zinc-100">{analysis.rightHipAngle}°</strong>
        </div>
      </div>

      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col gap-1">
        <div className="text-xs font-bold text-red-400">{analysis.kneeStatus}</div>
        <div className="text-xs text-zinc-300">{analysis.feedback}</div>
      </div>
    </div>
  );
}

export default PoseAnalyzer;