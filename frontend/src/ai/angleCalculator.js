// ============================================
// FitAI Trainer
// AI Angle Calculator
// ============================================

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

  const dot =
    vectorBA.x * vectorBC.x +
    vectorBA.y * vectorBC.y +
    vectorBA.z * vectorBC.z;

  const magnitudeBA =
    Math.sqrt(
      vectorBA.x ** 2 +
        vectorBA.y ** 2 +
        vectorBA.z ** 2
    );

  const magnitudeBC =
    Math.sqrt(
      vectorBC.x ** 2 +
        vectorBC.y ** 2 +
        vectorBC.z ** 2
    );

  if (
    magnitudeBA === 0 ||
    magnitudeBC === 0
  ) {
    return 0;
  }

  let cosine =
    dot /
    (magnitudeBA * magnitudeBC);

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

// ============================================
// MediaPipe Landmark Mapping
// ============================================

export const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,

  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,

  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,

  LEFT_HIP: 23,
  RIGHT_HIP: 24,

  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,

  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// ============================================
// Get Landmark
// ============================================

export function getLandmark(
  landmarks,
  index
) {
  if (
    !landmarks ||
    index === undefined ||
    index === null
  ) {
    return null;
  }

  return landmarks[index] || null;
}

// ============================================
// Calculate Joint Angle
// ============================================

export function calculateJointAngle(
  landmarks,
  a,
  b,
  c
) {
  const pointA =
    getLandmark(
      landmarks,
      a
    );

  const pointB =
    getLandmark(
      landmarks,
      b
    );

  const pointC =
    getLandmark(
      landmarks,
      c
    );

  return calculateAngle(
    pointA,
    pointB,
    pointC
  );
}