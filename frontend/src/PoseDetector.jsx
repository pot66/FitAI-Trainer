import { useEffect, useRef, useState } from "react";

function PoseDetector({ videoRef, active, onPoseDetected }) {
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const animationRef = useRef(null);
  const [poseReady, setPoseReady] = useState(false);
  const [poseError, setPoseError] = useState("");

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    const initializePose = async () => {
      try {
        setPoseError("");
        if (typeof window.Pose === "undefined") {
          throw new Error("ไม่พบ MediaPipe Pose กรุณาตรวจสอบ CDN");
        }

        const pose = new window.Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!mounted) return;
          drawPose(results);
          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            if (onPoseDetected) onPoseDetected(results.poseLandmarks);
          }
        });

        poseRef.current = pose;
        if (mounted) {
          setPoseReady(true);
          setPoseError("");
        }
      } catch (err) {
        console.error("MediaPipe Pose Error:", err);
        if (mounted) {
          setPoseReady(false);
          setPoseError(err.message || "เปิดใช้งาน MediaPipe Pose ไม่สำเร็จ");
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
          console.log("Pose close error:", err);
        }
        poseRef.current = null;
      }
      setPoseReady(false);
    };
  }, [active, onPoseDetected]);

  const drawPose = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    if (results.poseLandmarks && typeof window.drawConnectors === "function") {
      window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
        color: "#00e5ff",
        lineWidth: 4,
      });
    }

    if (results.poseLandmarks && typeof window.drawLandmarks === "function") {
      window.drawLandmarks(ctx, results.poseLandmarks, {
        color: "#ffffff",
        fillColor: "#ef4444",
        lineWidth: 2,
        radius: 5,
      });
    }

    ctx.restore();
  };

  useEffect(() => {
    if (!active || !poseReady) return;
    const video = videoRef.current;
    const pose = poseRef.current;
    if (!video || !pose) return;

    let running = true;
    const processFrame = async () => {
      if (!running) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        try {
          await pose.send({ image: video });
        } catch (err) {
          console.error("Pose processing error:", err);
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
    };
  }, [active, poseReady, videoRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {active && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-200">
          <span
            className={`w-2 h-2 rounded-full ${
              poseReady ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>
            {poseError
              ? poseError
              : poseReady
              ? "AI Pose Detection Active"
              : "กำลังเริ่ม AI Pose..."}
          </span>
        </div>
      )}
    </>
  );
}

export default PoseDetector;