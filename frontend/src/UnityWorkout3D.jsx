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

  const [engineMode, setEngineMode] = useState("three");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [hasError, setHasError] = useState(false);

  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    if (engineMode !== "three" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f1015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 1.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0.9, 0);
    controls.update();
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222235, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(3, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xef4444, 0.8);
    dirLight2.position.set(-5, 5, -5);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(10, 20, 0xef4444, 0x27272a);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    setIsLoading(true);
    setHasError(false);
    setLoadingProgress(0);

    const loader = new FBXLoader();
    const handleModelLoaded = (fbx) => {
      modelRef.current = fbx;
      fbx.scale.setScalar(0.01);
      fbx.position.set(0, 0, 0);

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.roughness = 0.5;
            child.material.metalness = 0.1;
          }
        }
      });

      scene.add(fbx);

      if (fbx.animations && fbx.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(fbx);
        mixerRef.current = mixer;
        const action = mixer.clipAction(fbx.animations[0]);
        actionRef.current = action;
        action.play();
      }

      setIsLoading(false);
      setHasError(false);
    };

    // Load from /models/TestMo.fbx with fallback to /TestMo.fbx
    loader.load(
      "/models/TestMo.fbx",
      handleModelLoaded,
      (xhr) => {
        if (xhr.total > 0) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (primaryError) => {
        console.warn("Primary FBX /models/TestMo.fbx load failed, trying /TestMo.fbx:", primaryError);
        loader.load(
          "/TestMo.fbx",
          handleModelLoaded,
          (xhr) => {
            if (xhr.total > 0) {
              setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
            }
          },
          (secondaryError) => {
            console.error("Three.js FBX loading error:", secondaryError);
            setIsLoading(false);
            setHasError(true);
          }
        );
      }
    );

    const timer = new THREE.Timer();
    let animFrameId;

    const animate = (timestamp) => {
      animFrameId = requestAnimationFrame(animate);
      timer.update(timestamp);
      const delta = timer.getDelta();
      if (mixerRef.current && isPlaying) {
        mixerRef.current.update(delta * animSpeed);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      if (renderer) renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [engineMode]);

  useEffect(() => {
    if (!iframeRef.current || engineMode !== "unity") return;
    iframeRef.current.contentWindow?.postMessage(
      {
        type: "FITAI_SYNC",
        exercise,
        isWorkoutStarted,
        repetitions,
        timestamp: Date.now(),
      },
      "*"
    );
  }, [engineMode, exercise, isWorkoutStarted, repetitions]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 1.2, 3.2);
      controlsRef.current.target.set(0, 0.9, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${className} ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "relative"
      }`}
    >
      {/* 3D View Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-600/20 border border-red-500/30 text-red-400 uppercase tracking-wide">
            MALONG 3D COACH
          </span>
          <span className="text-xs text-zinc-300">
            ท่าฝึก: <strong className="text-white">{exercise}</strong>
          </span>
          {isWorkoutStarted && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
              Reps: {repetitions}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setEngineMode((m) => (m === "three" ? "unity" : "three"))}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
            title="สลับโหมด Native 3D และ Unity WebGL"
          >
            {engineMode === "three" ? "🎮 โหมด: Native 3D" : "🎮 โหมด: Unity WebGL"}
          </button>

          {engineMode === "three" && (
            <>
              <button
                type="button"
                onClick={togglePlay}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                title={isPlaying ? "พักอนิเมชัน" : "เล่นต่อ"}
              >
                {isPlaying ? "⏸ พัก" : "▶ เล่น"}
              </button>
              <button
                type="button"
                onClick={() => setAnimSpeed((s) => (s === 1 ? 0.5 : s === 0.5 ? 1.5 : 1))}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                title="ปรับความเร็วอนิเมชัน"
              >
                ⚡ {animSpeed}x
              </button>
              <button
                type="button"
                onClick={handleResetCamera}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                title="รีเซ็ตมุมมองกล้อง"
              >
                🔄 รีเซ็ตมุม
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
            title={isFullscreen ? "ย่อหน้าจอ" : "เต็มหน้าจอ"}
          >
            {isFullscreen ? "🗗 ย่อ" : "⛶ ขยาย"}
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative w-full flex-1 min-h-[360px] bg-zinc-950 overflow-hidden flex items-center justify-center">
        {engineMode === "three" ? (
          <>
            <div ref={mountRef} className="w-full h-full min-h-[360px]" />

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 z-10 p-4">
                <span className="text-3xl mb-3 animate-pulse">🏋️‍♂️</span>
                <span className="text-sm font-semibold text-zinc-200">
                  กำลังโหลด Malong 3D Model... ({loadingProgress}%)
                </span>
                <div className="w-44 h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div
                    style={{ width: `${loadingProgress}%` }}
                    className="h-full bg-red-600 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 p-4 text-center">
                <span className="text-3xl mb-2">⚠️</span>
                <p className="text-sm text-red-400">
                  ไม่สามารถโหลดโมเดล 3D ได้ กรุณาลองใหม่อีกครั้ง
                </p>
              </div>
            )}

            {!isLoading && (
              <div className="absolute bottom-3 left-3 text-[11px] text-zinc-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                🖱️ คลิกค้างเพื่อหมุน 360° | เลื่อนลูกกลิ้งเพื่อซูม
              </div>
            )}
          </>
        ) : (
          <iframe
            ref={iframeRef}
            src="/malong-3d/index.html"
            title="Malong 3D Unity WebGL"
            className="w-full h-full min-h-[360px] border-0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
          />
        )}
      </div>
    </div>
  );
}

export default UnityWorkout3D;