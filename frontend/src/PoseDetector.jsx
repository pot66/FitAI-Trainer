import { useEffect, useRef, useState } from "react";

function PoseDetector({ videoRef, active, onPoseDetected }) {
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const animationRef = useRef(null);
  const isProcessingRef = useRef(false);
  const onPoseDetectedRef = useRef(onPoseDetected);
  const smoothedLandmarksRef = useRef(null);

  const [poseReady, setPoseReady] = useState(false);
  const [poseError, setPoseError] = useState("");
  const [trackingStatus, setTrackingStatus] = useState("init"); // 'init' | 'searching' | 'tracking' | 'need_full_body'

  // Keep latest onPoseDetected callback in ref without re-triggering effects
  useEffect(() => {
    onPoseDetectedRef.current = onPoseDetected;
  }, [onPoseDetected]);

  // 1. Initialize MediaPipe Pose ONCE when active
  useEffect(() => {
    if (!active) return;
    let mounted = true;

    const initializePose = async () => {
      try {
        setPoseError("");
        if (typeof window.Pose === "undefined") {
          throw new Error("ไม่พบ MediaPipe Pose ใน Browser");
        }

        const pose = new window.Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!mounted) return;
          handleResults(results);
        });

        poseRef.current = pose;
        if (mounted) {
          setPoseReady(true);
          setPoseError("");
          setTrackingStatus("searching");
        }
      } catch (err) {
        console.error("MediaPipe Pose Init Error:", err);
        if (mounted) {
          setPoseReady(false);
          setPoseError(err.message || "เปิดใช้งานระบบตรวจจับไม่สำเร็จ");
        }
      }
    };

    initializePose();

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch (err) {
          console.warn("Pose close error:", err);
        }
        poseRef.current = null;
      }
      setPoseReady(false);
      isProcessingRef.current = false;
      smoothedLandmarksRef.current = null;
    };
  }, [active]);

  // 2. Handle Pose Results & Rendering
  const handleResults = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    // Synchronize canvas resolution only when dimensions change
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    const rawLandmarks = results.poseLandmarks;
    if (!rawLandmarks || rawLandmarks.length < 33) {
      smoothedLandmarksRef.current = null;
      setTrackingStatus("searching");
      return;
    }

    // Exponential Moving Average (EMA) smoothing for buttery smooth landmarks
    if (!smoothedLandmarksRef.current || smoothedLandmarksRef.current.length !== rawLandmarks.length) {
      smoothedLandmarksRef.current = rawLandmarks.map((p) => ({ ...p }));
    } else {
      const alpha = 0.7; // Responsive and smooth
      smoothedLandmarksRef.current = rawLandmarks.map((curr, idx) => {
        const prev = smoothedLandmarksRef.current[idx];
        return {
          x: prev.x * (1 - alpha) + curr.x * alpha,
          y: prev.y * (1 - alpha) + curr.y * alpha,
          z: (prev.z || 0) * (1 - alpha) + (curr.z || 0) * alpha,
          visibility: curr.visibility !== undefined ? curr.visibility : 1,
        };
      });
    }

    const landmarks = smoothedLandmarksRef.current;

    // Check full-body visibility (knees & hips)
    const hasKnees = (landmarks[25]?.visibility ?? 0) > 0.4 && (landmarks[26]?.visibility ?? 0) > 0.4;
    const hasAnkles = (landmarks[27]?.visibility ?? 0) > 0.35 && (landmarks[28]?.visibility ?? 0) > 0.35;
    if (hasKnees && hasAnkles) {
      setTrackingStatus("tracking");
    } else {
      setTrackingStatus("need_full_body");
    }

    // Call onPoseDetected callback
    if (onPoseDetectedRef.current) {
      onPoseDetectedRef.current(landmarks);
    }

    // Render high-tech cyber skeleton
    drawFuturisticSkeleton(ctx, landmarks, width, height);
  };

  // Draw Futuristic Glowing Skeleton
  const drawFuturisticSkeleton = (ctx, pts, width, height) => {
    ctx.save();

    // Line segments connecting body joints
    const connections = [
      // Torso
      [11, 12], [12, 24], [24, 23], [23, 11],
      // Left Arm
      [11, 13], [13, 15],
      // Right Arm
      [12, 14], [14, 16],
      // Left Leg
      [23, 25], [25, 27], [27, 29], [29, 31],
      // Right Leg
      [24, 26], [26, 28], [28, 30], [30, 32],
    ];

    // 1. Draw glowing neon cyan connection lines
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = Math.max(3, Math.round(width / 320));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 10;

    for (const [i1, i2] of connections) {
      const p1 = pts[i1];
      const p2 = pts[i2];
      if (!p1 || !p2) continue;
      if ((p1.visibility ?? 1) < 0.35 || (p2.visibility ?? 1) < 0.35) continue;

      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // 2. Draw glowing joint nodes
    const keyJoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    const nodeOuterRadius = Math.max(5, Math.round(width / 180));
    const nodeInnerRadius = Math.max(2.5, Math.round(nodeOuterRadius * 0.55));

    for (const idx of keyJoints) {
      const pt = pts[idx];
      if (!pt || (pt.visibility ?? 1) < 0.35) continue;

      const px = pt.x * width;
      const py = pt.y * height;

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(px, py, nodeOuterRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 12;
      ctx.fill();

      // Inner crisp white core
      ctx.beginPath();
      ctx.arc(px, py, nodeInnerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.fill();
    }

    // 3. Clean head marker (Forehead / Nose)
    const nose = pts[0];
    if (nose && (nose.visibility ?? 1) > 0.4) {
      const nx = nose.x * width;
      const ny = nose.y * height;

      ctx.beginPath();
      ctx.arc(nx, ny, nodeOuterRadius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(nx, ny, nodeInnerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.fill();
    }

    ctx.restore();
  };

  // 3. Frame processing animation loop
  useEffect(() => {
    if (!active || !poseReady) return;
    const video = videoRef.current;
    const pose = poseRef.current;
    if (!video || !pose) return;

    let running = true;
    const processFrame = async () => {
      if (!running) return;

      if (
        !isProcessingRef.current &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        !video.paused &&
        !video.ended
      ) {
        isProcessingRef.current = true;
        try {
          await pose.send({ image: video });
        } catch (err) {
          console.warn("Pose inference warning:", err);
        } finally {
          isProcessingRef.current = false;
        }
      }

      if (running) {
        animationRef.current = requestAnimationFrame(processFrame);
      }
    };

    processFrame();

    return () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [active, poseReady, videoRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
      />

      {active && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-semibold shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              poseError
                ? "bg-red-500"
                : trackingStatus === "tracking"
                ? "bg-emerald-400 animate-pulse"
                : trackingStatus === "need_full_body"
                ? "bg-amber-400 animate-pulse"
                : "bg-sky-400 animate-pulse"
            }`}
          />
          <span className="text-white text-[11px] sm:text-xs">
            {poseError
              ? poseError
              : !poseReady
              ? "กำลังเตรียม AI ตรวจจับท่า..."
              : trackingStatus === "tracking"
              ? "AI ตรวจจับข้อต่อพร้อมแล้ว"
              : trackingStatus === "need_full_body"
              ? "กรุณายืนถอยหลังให้เห็นเต็มตัว"
              : "กำลังค้นหาตำแหน่งร่างกาย..."}
          </span>
        </div>
      )}
    </>
  );
}

export default PoseDetector;