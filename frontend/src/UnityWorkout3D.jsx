import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function UnityWorkout3D({
  exercise = "Squat",
  isWorkoutStarted = false,
  repetitions = 0,
  className = "",
}) {
  const mountRef = useRef(null);
  const iframeRef = useRef(null);

  // Engine mode: "three" (Native Three.js with TestMo.fbx) or "unity" (Unity WebGL Build)
  const [engineMode, setEngineMode] = useState("three");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Animation & Three.js refs
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  // ==========================================
  // Three.js Scene Setup & FBX Loading
  // ==========================================
  useEffect(() => {
    if (engineMode !== "three" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f1015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 3.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 1.0;
    controls.maxDistance = 6.0;
    controls.target.set(0, 0.9, 0);
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(2, 4, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // 6. Ground grid
    const gridHelper = new THREE.GridHelper(6, 12, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 7. Load Textures & FBX Model
    setIsLoading(true);
    setHasError(false);

    const textureLoader = new THREE.TextureLoader();
    const diffuseMap = textureLoader.load("/models/Ch03_1001_Diffuse.png");
    const normalMap = textureLoader.load("/models/Ch03_1001_Normal.png");

    const loader = new FBXLoader();
    loader.load(
      "/models/TestMo.fbx",
      (fbx) => {
        // Center & Scale Model
        fbx.scale.set(0.01, 0.01, 0.01);
        fbx.position.set(0, 0, 0);

        // Apply materials & shadows
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.map = diffuseMap;
              child.material.normalMap = normalMap;
              child.material.roughness = 0.6;
              child.material.metalness = 0.1;
              child.material.needsUpdate = true;
            }
          }
        });

        scene.add(fbx);
        modelRef.current = fbx;

        // Animations setup
        if (fbx.animations && fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx);
          mixerRef.current = mixer;
          const action = mixer.clipAction(fbx.animations[0]);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
          actionRef.current = action;
        }

        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(pct);
        }
      },
      (err) => {
        console.warn("Failed to load FBX model:", err);
        setIsLoading(false);
        setHasError(true);
      }
    );

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // 9. Animation Render Loop
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta * animSpeed);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [engineMode]);

  // Adjust animation speed when speed changes
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.timeScale = isPlaying ? animSpeed : 0;
    }
  }, [isPlaying, animSpeed]);

  // Handle postMessage for Unity WebGL iframe if unity mode is active
  useEffect(() => {
    if (engineMode !== "unity" || !iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: "FITAI_WORKOUT_UPDATE",
        exercise,
        isWorkoutStarted,
        repetitions,
        timestamp: Date.now(),
      },
      "*"
    );
  }, [engineMode, exercise, isWorkoutStarted, repetitions]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 1.2, 3.2);
      controlsRef.current.target.set(0, 0.9, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div
      className={`unity-3d-card ${className} ${
        isFullscreen ? "unity-3d-fullscreen" : ""
      }`}
    >
      {/* 3D View Header */}
      <div className="unity-3d-topbar">
        <div className="unity-3d-meta">
          <span className="unity-badge">🎮 MALONG 3D COACH</span>
          <span className="unity-exercise-label">
            ท่าทาง: <strong>{exercise}</strong>
          </span>
          {isWorkoutStarted && (
            <span className="unity-rep-badge">Reps: {repetitions}</span>
          )}
        </div>

        <div className="unity-3d-actions">
          {/* Mode switch */}
          <button
            type="button"
            className="unity-btn"
            onClick={() =>
              setEngineMode((m) => (m === "three" ? "unity" : "three"))
            }
            title="สลับระหว่าง Native 3D และ Unity WebGL"
          >
            {engineMode === "three" ? "🔁 โหมด: Native 3D" : "🔁 โหมด: Unity WebGL"}
          </button>

          {engineMode === "three" && (
            <>
              <button
                type="button"
                className="unity-btn"
                onClick={togglePlay}
                title={isPlaying ? "พักแอนิเมชัน" : "เล่นแอนิเมชัน"}
              >
                {isPlaying ? "⏸️ พัก" : "▶️ เล่น"}
              </button>
              <button
                type="button"
                className="unity-btn"
                onClick={() =>
                  setAnimSpeed((s) => (s === 1 ? 0.5 : s === 0.5 ? 1.5 : 1))
                }
                title="ปรับความเร็วแอนิเมชัน"
              >
                ⚡ {animSpeed}x
              </button>
              <button
                type="button"
                className="unity-btn"
                onClick={handleResetCamera}
                title="รีเซ็ตมุมกล้อง"
              >
                🎯 มุมมอง
              </button>
            </>
          )}

          <button
            type="button"
            className="unity-btn"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? "ออกจากจอใหญ่" : "ขยายเต็มจอ"}
          >
            {isFullscreen ? "🗗 ย่อ" : "⛶ เต็มจอ"}
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="unity-3d-viewport">
        {engineMode === "three" ? (
          <>
            <div
              ref={mountRef}
              style={{ width: "100%", height: "100%", minHeight: "340px" }}
            />

            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(15, 16, 21, 0.85)",
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧍‍♂️</div>
                <div style={{ color: "#60a5fa", fontWeight: 600, fontSize: "14px" }}>
                  กำลังโหลด Malong 3D Model... ({loadingProgress}%)
                </div>
                <div
                  style={{
                    width: "180px",
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${loadingProgress}%`,
                      height: "100%",
                      background: "#3b82f6",
                      transition: "width 0.2s",
                    }}
                  />
                </div>
              </div>
            )}

            {hasError && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(15, 16, 21, 0.9)",
                  color: "#ef4444",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
                <p style={{ color: "#f87171", fontSize: "14px" }}>
                  ไม่สามารถโหลดโมเดล 3D ได้ กรุณาลองใหม่อีกครั้ง
                </p>
              </div>
            )}

            {!isLoading && (
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "12px",
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  pointerEvents: "none",
                  background: "rgba(0,0,0,0.4)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                🖱️ คลิกซ้ายลากเพื่อหมุน 360° | เลื่อนลูกกลิ้งเพื่อซูม
              </div>
            )}
          </>
        ) : (
          <iframe
            ref={iframeRef}
            src="/malong-3d/index.html"
            title="Malong 3D Unity WebGL"
            className="unity-3d-iframe"
            allow="autoplay; fullscreen; xr-spatial-tracking"
          />
        )}
      </div>
    </div>
  );
}

export default UnityWorkout3D;
