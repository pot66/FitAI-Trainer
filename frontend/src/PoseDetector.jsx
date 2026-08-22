import {
  useEffect,
  useRef,
  useState,
} from "react";

function PoseDetector({
  videoRef,
  active = false,
  onPoseDetected,
}) {
  const canvasRef =
    useRef(null);

  const poseRef =
    useRef(null);

  const animationRef =
    useRef(null);

  const [poseReady, setPoseReady] =
    useState(false);

  const [poseError, setPoseError] =
    useState("");

  // ==========================================
  // ตรวจสอบ MediaPipe
  // ==========================================

  useEffect(() => {
    if (!active) {
      return;
    }

    let mounted = true;

    const initializePose =
      async () => {
        try {
          setPoseError("");

          // ==================================
          // ตรวจสอบ Global Pose
          // ==================================

          if (
            typeof window.Pose ===
            "undefined"
          ) {
            throw new Error(
              "ไม่พบ MediaPipe Pose กรุณาตรวจสอบ CDN"
            );
          }

          console.log(
            "📦 MediaPipe Pose detected"
          );

          // ==================================
          // สร้าง Pose
          // ==================================

          const pose =
            new window.Pose({
              locateFile: (
                file
              ) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
              },
            });

          // ==================================
          // ตั้งค่า Pose
          // ==================================

          pose.setOptions({
            modelComplexity: 1,

            smoothLandmarks: true,

            enableSegmentation: false,

            smoothSegmentation: true,

            minDetectionConfidence: 0.5,

            minTrackingConfidence: 0.5,
          });

          // ==================================
          // รับผล Pose
          // ==================================

          pose.onResults(
            (results) => {
              if (!mounted) {
                return;
              }

              drawPose(results);

              if (
                results.poseLandmarks &&
                results.poseLandmarks
                  .length > 0
              ) {
                if (
                  onPoseDetected
                ) {
                  onPoseDetected(
                    results.poseLandmarks
                  );
                }
              }
            }
          );

          poseRef.current =
            pose;

          if (mounted) {
            setPoseReady(true);

            setPoseError("");
          }

          console.log(
            "🤖 MediaPipe Pose Ready"
          );
        } catch (error) {
          console.error(
            "❌ MediaPipe Pose Error:",
            error
          );

          if (mounted) {
            setPoseReady(false);

            setPoseError(
              error.message ||
                "ไม่สามารถเริ่ม MediaPipe Pose ได้"
            );
          }
        }
      };

    initializePose();

    // ==========================================
    // Cleanup
    // ==========================================

    return () => {
      mounted = false;

      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current =
          null;
      }

      if (
        poseRef.current
      ) {
        try {
          poseRef.current.close();
        } catch (error) {
          console.log(
            "Pose close error:",
            error
          );
        }

        poseRef.current =
          null;
      }

      setPoseReady(false);
    };
  }, [
    active,
  ]);

  // ==========================================
  // วาด Skeleton
  // ==========================================

  const drawPose = (
    results
  ) => {
    const canvas =
      canvasRef.current;

    const video =
      videoRef.current;

    if (
      !canvas ||
      !video
    ) {
      return;
    }

    const ctx =
      canvas.getContext(
        "2d"
      );

    const width =
      video.videoWidth ||
      video.clientWidth;

    const height =
      video.videoHeight ||
      video.clientHeight;

    if (
      !width ||
      !height
    ) {
      return;
    }

    canvas.width =
      width;

    canvas.height =
      height;

    ctx.save();

    // ==================================
    // Mirror
    // ==================================

    ctx.translate(
      width,
      0
    );

    ctx.scale(
      -1,
      1
    );

    // ==================================
    // Skeleton
    // ==================================

    if (
      results.poseLandmarks &&
      typeof window
        .drawConnectors ===
        "function"
    ) {
      window.drawConnectors(
        ctx,

        results.poseLandmarks,

        window.POSE_CONNECTIONS,

        {
          color:
            "#00e5ff",

          lineWidth: 4,
        }
      );
    }

    // ==================================
    // Landmarks
    // ==================================

    if (
      results.poseLandmarks &&
      typeof window
        .drawLandmarks ===
        "function"
    ) {
      window.drawLandmarks(
        ctx,

        results.poseLandmarks,

        {
          color:
            "#ffffff",

          fillColor:
            "#6366f1",

          lineWidth: 2,

          radius: 5,
        }
      );
    }

    ctx.restore();
  };

  // ==========================================
  // ส่งภาพ Camera → MediaPipe
  // ==========================================

  useEffect(() => {
    if (!active) {
      return;
    }

    if (!poseReady) {
      return;
    }

    const video =
      videoRef.current;

    const pose =
      poseRef.current;

    if (
      !video ||
      !pose
    ) {
      return;
    }

    let running = true;

    const processFrame =
      async () => {
        if (!running) {
          return;
        }

        if (
          video.readyState >=
            2 &&
          video.videoWidth >
            0
        ) {
          try {
            await pose.send({
              image: video,
            });
          } catch (error) {
            console.error(
              "❌ Pose processing error:",
              error
            );
          }
        }

        if (running) {
          animationRef.current =
            requestAnimationFrame(
              processFrame
            );
        }
      };

    processFrame();

    // ==================================
    // Cleanup
    // ==================================

    return () => {
      running = false;

      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current =
          null;
      }
    };
  }, [
    active,
    poseReady,
    videoRef,
  ]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pose-canvas"
      />

      {active && (
        <div className="pose-status">

          <span
            className={
              poseReady
                ? "pose-status-dot ready"
                : "pose-status-dot"
            }
          />

          {poseError
            ? poseError
            : poseReady
            ? "AI Pose Detection Active"
            : "กำลังเริ่ม AI Pose..."}
        </div>
      )}
    </>
  );
}

export default PoseDetector;