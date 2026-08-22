// ============================================
// FitAI Trainer
// Pose Utilities
// ============================================

/**
 * คำนวณระยะห่างระหว่างจุด 2 จุด
 */
export function calculateDistance(
  point1,
  point2
) {
  if (!point1 || !point2) {
    return 0;
  }

  const dx =
    point1.x - point2.x;

  const dy =
    point1.y - point2.y;

  const dz =
    (point1.z || 0) -
    (point2.z || 0);

  return Math.sqrt(
    dx * dx +
      dy * dy +
      dz * dz
  );
}

/**
 * คำนวณมุมจากจุด 3 จุด
 *
 * pointA
 *    \
 *     \
 *    pointB
 *       \
 *        \
 *       pointC
 *
 * มุมที่ pointB
 */
export function calculateAngle(
  pointA,
  pointB,
  pointC
) {
  if (
    !pointA ||
    !pointB ||
    !pointC
  ) {
    return 0;
  }

  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
    z:
      (pointA.z || 0) -
      (pointB.z || 0),
  };

  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
    z:
      (pointC.z || 0) -
      (pointB.z || 0),
  };

  const dotProduct =
    vectorBA.x *
      vectorBC.x +
    vectorBA.y *
      vectorBC.y +
    vectorBA.z *
      vectorBC.z;

  const magnitudeBA =
    Math.sqrt(
      vectorBA.x *
        vectorBA.x +
        vectorBA.y *
        vectorBA.y +
        vectorBA.z *
        vectorBA.z
    );

  const magnitudeBC =
    Math.sqrt(
      vectorBC.x *
        vectorBC.x +
        vectorBC.y *
        vectorBC.y +
        vectorBC.z *
        vectorBC.z
    );

  if (
    magnitudeBA === 0 ||
    magnitudeBC === 0
  ) {
    return 0;
  }

  let cosine =
    dotProduct /
    (magnitudeBA *
      magnitudeBC);

  // ป้องกัน floating point
  cosine = Math.max(
    -1,
    Math.min(1, cosine)
  );

  const angle =
    Math.acos(cosine) *
    (180 / Math.PI);

  return Math.round(
    angle * 10
  ) / 10;
}

/**
 * MediaPipe Pose Landmark
 *
 * 11 = Left Shoulder
 * 12 = Right Shoulder
 * 23 = Left Hip
 * 24 = Right Hip
 * 25 = Left Knee
 * 26 = Right Knee
 * 27 = Left Ankle
 * 28 = Right Ankle
 */

/**
 * วิเคราะห์มุมขาทั้งสองข้าง
 */
export function calculateLegAngles(
  landmarks
) {
  if (
    !landmarks ||
    landmarks.length < 33
  ) {
    return null;
  }

  const leftHip =
    landmarks[23];

  const leftKnee =
    landmarks[25];

  const leftAnkle =
    landmarks[27];

  const rightHip =
    landmarks[24];

  const rightKnee =
    landmarks[26];

  const rightAnkle =
    landmarks[28];

  const leftKneeAngle =
    calculateAngle(
      leftHip,
      leftKnee,
      leftAnkle
    );

  const rightKneeAngle =
    calculateAngle(
      rightHip,
      rightKnee,
      rightAnkle
    );

  const leftHipAngle =
    calculateAngle(
      landmarks[11],
      leftHip,
      leftKnee
    );

  const rightHipAngle =
    calculateAngle(
      landmarks[12],
      rightHip,
      rightKnee
    );

  return {
    leftKneeAngle,
    rightKneeAngle,
    leftHipAngle,
    rightHipAngle,
  };
}

/**
 * ตรวจสอบว่าร่างกายอยู่ในตำแหน่ง
 * ที่สามารถวิเคราะห์ได้หรือไม่
 */
export function isPoseVisible(
  landmarks
) {
  if (
    !landmarks ||
    landmarks.length < 33
  ) {
    return false;
  }

  const importantPoints = [
    11, // left shoulder
    12, // right shoulder
    23, // left hip
    24, // right hip
    25, // left knee
    26, // right knee
    27, // left ankle
    28, // right ankle
  ];

  return importantPoints.every(
    (index) => {
      const point =
        landmarks[index];

      return (
        point &&
        point.visibility !== undefined &&
        point.visibility > 0.5
      );
    }
  );
}