import {
  useState,
} from "react";

import PoseDetector from "./PoseDetector";

import PoseAnalyzer from "./PoseAnalyzer";

function PoseTest() {
  const [landmarks, setLandmarks] =
    useState(null);

  const videoRef =
    useState(null);

  return (
    <div>
      <h1>
        FitAI Pose Test
      </h1>
    </div>
  );
}

export default PoseTest;