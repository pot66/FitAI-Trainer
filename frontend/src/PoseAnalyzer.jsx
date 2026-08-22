import {
  useEffect,
  useState,
} from "react";

import {
  calculateLegAngles,
  isPoseVisible,
} from "./utils/poseUtils";

function PoseAnalyzer({
  landmarks,
  exercise = "squat",
  onAnalysis,
}) {
  const [analysis, setAnalysis] =
    useState({
      visible: false,

      leftKneeAngle: 0,

      rightKneeAngle: 0,

      leftHipAngle: 0,

      rightHipAngle: 0,

      kneeStatus: "รอข้อมูล",

      feedback:
        "กรุณายืนให้เห็นทั้งตัว",
    });

  useEffect(() => {
    if (!landmarks) {
      return;
    }

    // =====================================
    // ตรวจสอบ Pose
    // =====================================

    const visible =
      isPoseVisible(
        landmarks
      );

    if (!visible) {
      const result = {
        visible: false,

        leftKneeAngle: 0,

        rightKneeAngle: 0,

        leftHipAngle: 0,

        rightHipAngle: 0,

        kneeStatus:
          "ไม่พบร่างกาย",

        feedback:
          "กรุณายืนให้เห็นทั้งตัว",
      };

      setAnalysis(result);

      if (onAnalysis) {
        onAnalysis(result);
      }

      return;
    }

    // =====================================
    // Squat
    // =====================================

    if (
      exercise === "squat"
    ) {
      const angles =
        calculateLegAngles(
          landmarks
        );

      if (!angles) {
        return;
      }

      const averageKneeAngle =
        (
          angles.leftKneeAngle +
          angles.rightKneeAngle
        ) / 2;

      // ===================================
      // ตรวจสอบท่าเบื้องต้น
      // ===================================

      let kneeStatus =
        "ถูกต้อง";

      let feedback =
        "ท่าดีมาก";

      /*
       * ช่วงนี้ยังเป็น Rule-Based
       * ยังไม่ใช่ ML Model
       */

      if (
        averageKneeAngle >
        170
      ) {
        kneeStatus =
          "ยืนตรง";

        feedback =
          "เริ่มย่อตัวลง";
      } else if (
        averageKneeAngle >
        100
      ) {
        kneeStatus =
          "กำลังย่อตัว";

        feedback =
          "ย่อต่อได้เลย";
      } else if (
        averageKneeAngle >=
        70
      ) {
        kneeStatus =
          "ท่า Squat";

        feedback =
          "✅ ลงได้ดี";
      } else {
        kneeStatus =
          "ย่อลึก";

        feedback =
          "⚠️ ระวังอย่าย่อลึกเกินไป";
      }

      const result = {
        visible: true,

        leftKneeAngle:
          angles.leftKneeAngle,

        rightKneeAngle:
          angles.rightKneeAngle,

        leftHipAngle:
          angles.leftHipAngle,

        rightHipAngle:
          angles.rightHipAngle,

        averageKneeAngle:
          Math.round(
            averageKneeAngle
          ),

        kneeStatus,

        feedback,
      };

      setAnalysis(result);

      if (onAnalysis) {
        onAnalysis(result);
      }
    }
  }, [
    landmarks,
    exercise,
    onAnalysis,
  ]);

  // =====================================
  // UI
  // =====================================

  return (
    <div className="pose-analysis">

      <div className="analysis-header">
        <span>
          🤖 AI Pose Analysis
        </span>

        <span
          className={
            analysis.visible
              ? "analysis-online"
              : "analysis-offline"
          }
        >
          {analysis.visible
            ? "● LIVE"
            : "○ WAITING"}
        </span>
      </div>

      <div className="angle-grid">

        <div className="angle-card">
          <span>
            Left Knee
          </span>

          <strong>
            {analysis.leftKneeAngle}°
          </strong>
        </div>

        <div className="angle-card">
          <span>
            Right Knee
          </span>

          <strong>
            {analysis.rightKneeAngle}°
          </strong>
        </div>

        <div className="angle-card">
          <span>
            Left Hip
          </span>

          <strong>
            {analysis.leftHipAngle}°
          </strong>
        </div>

        <div className="angle-card">
          <span>
            Right Hip
          </span>

          <strong>
            {analysis.rightHipAngle}°
          </strong>
        </div>

      </div>

      <div className="pose-feedback">

        <div className="feedback-status">
          {analysis.kneeStatus}
        </div>

        <div className="feedback-text">
          {analysis.feedback}
        </div>

      </div>

    </div>
  );
}

export default PoseAnalyzer;