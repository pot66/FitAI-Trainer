import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Catalog of 14 exercises with 3D animations from malong
export const EXERCISES_3D_CATALOG = [
  {
    id: "Squat",
    name: "Squat",
    thName: "สควอต",
    muscle: "ขาและสะโพก",
    category: "Leg",
    icon: "🦵",
    keywords: ["squat", "สควอต", "สควอท", "ย่อเข่า", "chair squat"],
  },
  {
    id: "Push-Up",
    name: "Push-Up",
    thName: "วิดพื้น / ดันพื้น",
    muscle: "หน้าอกและหัวไหล่",
    category: "Chest",
    icon: "💪",
    keywords: ["push-up", "push up", "วิดพื้น", "ดันพื้น", "pushup", "chest", "knee push up"],
  },
  {
    id: "Lunge",
    name: "Lunge",
    thName: "ลันจ์ / ท่าแทงเข่า",
    muscle: "ต้นขาและสะโพก",
    category: "Leg",
    icon: "🏃",
    keywords: ["lunge", "ลันจ์", "reverse lunge", "forward lunge", "แทงเข่า", "ก้าวขาสลับ"],
  },
  {
    id: "Plank",
    name: "Plank",
    thName: "แพลงก์",
    muscle: "แกนกลางลำตัวและหน้าท้อง",
    category: "Stomach",
    icon: "🪵",
    keywords: ["plank", "แพลงก์", "ท่าไม้กระดาน", "planking", "core"],
  },
  {
    id: "Sit-up",
    name: "Sit-up",
    thName: "ซิทอัพ",
    muscle: "หน้าท้องส่วนบน",
    category: "Stomach",
    icon: "🧘",
    keywords: ["sit-up", "sit up", "ซิทอัพ", "ซิท-อัพ", "situp"],
  },
  {
    id: "Glute Bridge",
    name: "Glute Bridge",
    thName: "กลูทบริดจ์ / ยกสะโพก",
    muscle: "กล้ามเนื้อก้นและหลังส่วนล่าง",
    category: "Hips_Buttocks",
    icon: "🍑",
    keywords: ["glute bridge", "bridge", "กลูทบริดจ์", "ยกสะโพก", "บริดจ์", "glute"],
  },
  {
    id: "Donkey Kick",
    name: "Donkey Kick",
    thName: "ดองกี้คิก",
    muscle: "ก้นและต้นขาด้านหลัง",
    category: "Hips_Buttocks",
    icon: "🐴",
    keywords: ["donkey kick", "ดองกี้คิก", "donkey", "kick"],
  },
  {
    id: "Bicycle Crunch",
    name: "Bicycle Crunch",
    thName: "ไบซิเคิลครันช์",
    muscle: "หน้าท้องด้านข้างและแกนกลาง",
    category: "Stomach",
    icon: "🚲",
    keywords: ["bicycle crunch", "ไบซิเคิลครันช์", "crunch", "ครันช์", "bicycle"],
  },
  {
    id: "Superman",
    name: "Superman",
    thName: "ซูเปอร์แมน",
    muscle: "หลังส่วนล่างและสะโพก",
    category: "Back",
    icon: "🦸",
    keywords: ["superman", "supermans", "ซูเปอร์แมน", "หลังส่วนล่าง", "back extension"],
  },
  {
    id: "Leg Raise",
    name: "Leg Raise",
    thName: "เลกเรส / ยกขา",
    muscle: "หน้าท้องส่วนล่าง",
    category: "Stomach",
    icon: "🤸",
    keywords: ["leg raise", "legraise", "เลกเรส", "ยกขา", "lower abs"],
  },
  {
    id: "Bulgarian Split Squat",
    name: "Bulgarian Split Squat",
    thName: "บัลแกเรียนสปลิทสควอต",
    muscle: "ต้นขา สะโพก และก้น",
    category: "Hips_Buttocks",
    icon: "🏋️",
    keywords: ["bulgarian split squat", "bulgarian", "บัลแกเรียน", "split squat"],
  },
  {
    id: "Russian Twist",
    name: "Russian Twist",
    thName: "รัสเซียนทวิสต์",
    muscle: "หน้าท้องด้านข้าง / Obliques",
    category: "Stomach",
    icon: "🌪️",
    keywords: ["russian twist", "รัสเซียนทวิสต์", "twist", "บิดเอว", "obliques"],
  },
  {
    id: "Fire Hydrant",
    name: "Fire Hydrant",
    thName: "ไฟร์ไฮดรานต์",
    muscle: "สะโพกด้านข้างและก้น",
    category: "Hips_Buttocks",
    icon: "🔥",
    keywords: ["fire hydrant", "ไฟร์ไฮดรานต์", "hydrant"],
  },
  {
    id: "Close-grip Push-up",
    name: "Close-grip Push-up",
    thName: "โคลสกริดพุชอัพ",
    muscle: "หลังแขน (Triceps) และอกชิด",
    category: "Back arm",
    icon: "✊",
    keywords: ["close-grip push-up", "close grip push up", "close grip", "โคลสกริด", "triceps pushup", "diamond pushup"],
  },
];

// Helper to match exercise string to 3D catalog item
export function matchExerciseTo3D(exerciseName) {
  if (!exerciseName) return EXERCISES_3D_CATALOG[0];
  const query = String(exerciseName).trim().toLowerCase();

  // 1. Exact Name match
  const exact = EXERCISES_3D_CATALOG.find(
    (item) =>
      item.name.toLowerCase() === query ||
      item.id.toLowerCase() === query ||
      item.thName.toLowerCase() === query
  );
  if (exact) return exact;

  // 2. Keyword match
  const byKeyword = EXERCISES_3D_CATALOG.find((item) =>
    item.keywords.some((kw) => query.includes(kw.toLowerCase()) || kw.toLowerCase().includes(query))
  );
  if (byKeyword) return byKeyword;

  // 3. Fallback to Squat
  return EXERCISES_3D_CATALOG[0];
}

function UnityWorkout3D({
  exercise = "Squat",
  isWorkoutStarted = false,
  repetitions = 0,
  className = "",
  onSelectExercise,
}) {
  const mountRef = useRef(null);
  const iframeRef = useRef(null);

  // Matching 3D exercise
  const current3D = useMemo(() => matchExerciseTo3D(exercise), [exercise]);
  const [selected3DId, setSelected3DId] = useState(current3D.id);

  useEffect(() => {
    setSelected3DId(current3D.id);
  }, [current3D.id]);

  const activeExercise = useMemo(
    () => EXERCISES_3D_CATALOG.find((e) => e.id === selected3DId) || current3D,
    [selected3DId, current3D]
  );

  const [engineMode, setEngineMode] = useState("three");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Three.js References
  const mixerRef = useRef(null);
  const actionsMapRef = useRef(new Map());
  const currentActionRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const animationsDataRef = useRef(null);

  // Play specified 3D animation clip with crossfade
  const playExerciseAnimation = useCallback((clipId) => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    let targetAction = actionsMapRef.current.get(clipId);
    if (!targetAction && actionsMapRef.current.has("Squat")) {
      targetAction = actionsMapRef.current.get("Squat");
    }
    if (!targetAction && actionsMapRef.current.size > 0) {
      targetAction = Array.from(actionsMapRef.current.values())[0];
    }
    if (!targetAction) return;

    const prevAction = currentActionRef.current;
    if (prevAction && prevAction !== targetAction) {
      prevAction.fadeOut(0.35);
      targetAction.reset().fadeIn(0.35).play();
    } else {
      targetAction.play();
    }
    currentActionRef.current = targetAction;
  }, []);

  // Update animation when selected exercise changes
  useEffect(() => {
    if (mixerRef.current) {
      playExerciseAnimation(activeExercise.id);
    }
  }, [activeExercise.id, playExerciseAnimation]);

  // Three.js Scene Setup & Model Loading
  useEffect(() => {
    if (engineMode !== "three" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0b10);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.25, 3.2);
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
    controls.target.set(0, 0.88, 0);
    controls.update();
    controlsRef.current = controls;

    // Studio Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1f2430, 1.4);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(3, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xef4444, 1.2);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.8);
    fillLight.position.set(5, -2, -3);
    scene.add(fillLight);

    // Floor & Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0xef4444, 0x27272a);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070709,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    setIsLoading(true);
    setHasError(false);
    setLoadingProgress(10);

    // Load Textures
    const textureLoader = new THREE.TextureLoader();
    const diffuseMap = textureLoader.load("/models/Ch03_1001_Diffuse.png", undefined, undefined, () => {
      textureLoader.load("/Ch03_1001_Diffuse.png");
    });
    const normalMap = textureLoader.load("/models/Ch03_1001_Normal.png", undefined, undefined, () => {
      textureLoader.load("/Ch03_1001_Normal.png");
    });

    // Helper to create Three.js AnimationClip from parsed JSON
    const createClipFromJson = (clipData) => {
      if (!clipData || !clipData.tracks) return null;
      const tracks = [];
      for (const tr of clipData.tracks) {
        if (!tr.times || !tr.values || tr.times.length === 0) continue;
        if (tr.type === "quaternion") {
          tracks.push(new THREE.QuaternionKeyframeTrack(tr.name, tr.times, tr.values));
        } else if (tr.type === "vector") {
          tracks.push(new THREE.VectorKeyframeTrack(tr.name, tr.times, tr.values));
        }
      }
      return new THREE.AnimationClip(clipData.name, clipData.duration || 3.0, tracks);
    };

    // Load Animations Dataset from /models/malong_animations.json
    const loadAnimationsPromise = fetch("/models/malong_animations.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load /models/malong_animations.json");
        return res.json();
      })
      .catch((err) => {
        console.warn("Retrying malong_animations.json at root:", err);
        return fetch("/malong_animations.json").then((r) => r.json());
      })
      .catch((e) => {
        console.error("Failed to load malong_animations.json:", e);
        return {};
      });

    // Load FBX Model
    const loader = new FBXLoader();
    const handleModelLoaded = (fbx, animData) => {
      modelRef.current = fbx;
      fbx.scale.setScalar(0.01);
      fbx.position.set(0, 0, 0);

      // Apply Materials & Textures
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.map = diffuseMap;
            child.material.normalMap = normalMap;
            child.material.roughness = 0.55;
            child.material.metalness = 0.15;
            child.material.needsUpdate = true;
          }
        }
      });

      scene.add(fbx);

      const mixer = new THREE.AnimationMixer(fbx);
      mixerRef.current = mixer;
      actionsMapRef.current.clear();

      // Register parsed 3D animations from malong
      if (animData && Object.keys(animData).length > 0) {
        for (const [key, clipJson] of Object.entries(animData)) {
          const clip = createClipFromJson(clipJson);
          if (clip && clip.tracks.length > 0) {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            actionsMapRef.current.set(key, action);
          }
        }
      }

      // If FBX has embedded animations, register fallback
      if (fbx.animations && fbx.animations.length > 0) {
        const defaultAction = mixer.clipAction(fbx.animations[0]);
        defaultAction.setLoop(THREE.LoopRepeat);
        actionsMapRef.current.set("Default", defaultAction);
        if (actionsMapRef.current.size === 1) {
          actionsMapRef.current.set("Squat", defaultAction);
        }
      }

      // Play the matched exercise animation
      playExerciseAnimation(activeExercise.id);

      setIsLoading(false);
      setHasError(false);
      setLoadingProgress(100);
    };

    // Load both Model and 3D Animations concurrently
    loadAnimationsPromise.then((animData) => {
      animationsDataRef.current = animData;
      setLoadingProgress(40);

      loader.load(
        "/models/TestMo.fbx",
        (fbx) => handleModelLoaded(fbx, animData),
        (xhr) => {
          if (xhr.total > 0) {
            setLoadingProgress(40 + Math.round((xhr.loaded / xhr.total) * 55));
          }
        },
        (primaryError) => {
          console.warn("Primary FBX /models/TestMo.fbx load failed, trying /TestMo.fbx:", primaryError);
          loader.load(
            "/TestMo.fbx",
            (fbx) => handleModelLoaded(fbx, animData),
            (xhr) => {
              if (xhr.total > 0) {
                setLoadingProgress(40 + Math.round((xhr.loaded / xhr.total) * 55));
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
    });

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
  }, [engineMode, playExerciseAnimation]);

  // Sync with Unity WebGL Iframe
  useEffect(() => {
    if (!iframeRef.current || engineMode !== "unity") return;
    iframeRef.current.contentWindow?.postMessage(
      {
        type: "FITAI_WORKOUT_UPDATE",
        exercise: activeExercise.name,
        thName: activeExercise.thName,
        muscle: activeExercise.muscle,
        isWorkoutStarted,
        repetitions,
        timestamp: Date.now(),
      },
      "*"
    );
  }, [engineMode, activeExercise, isWorkoutStarted, repetitions]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 1.25, 3.2);
      controlsRef.current.target.set(0, 0.88, 0);
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
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950/90 border-b border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-600/20 border border-red-500/30 text-red-400 uppercase tracking-wide flex items-center gap-1">
            <span>{activeExercise.icon}</span>
            <span>MALONG 3D COACH</span>
          </span>

          {/* Exercise Dropdown Selector (Allows picking any of the 14 exercises) */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">ท่าโมเดล:</span>
            <select
              value={selected3DId}
              onChange={(e) => {
                setSelected3DId(e.target.value);
                if (onSelectExercise) onSelectExercise(e.target.value);
              }}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer py-1"
            >
              {EXERCISES_3D_CATALOG.map((item) => (
                <option key={item.id} value={item.id} className="bg-zinc-900 text-white">
                  {item.icon} {item.name} ({item.thName})
                </option>
              ))}
            </select>
          </div>

          {/* Muscle Focus Badge */}
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            🎯 {activeExercise.muscle}
          </span>

          {isWorkoutStarted && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
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
      <div className="relative w-full flex-1 min-h-[380px] bg-zinc-950 overflow-hidden flex items-center justify-center">
        {engineMode === "three" ? (
          <>
            <div ref={mountRef} className="w-full h-full min-h-[380px]" />

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 z-10 p-4">
                <span className="text-4xl mb-3 animate-bounce">{activeExercise.icon}</span>
                <span className="text-sm font-semibold text-zinc-200">
                  กำลังโหลด Malong 3D Coach... ({loadingProgress}%)
                </span>
                <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div
                    style={{ width: `${loadingProgress}%` }}
                    className="h-full bg-red-600 transition-all duration-200"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2">
                  จับคู่ท่าฝึก: {activeExercise.name} ({activeExercise.thName})
                </span>
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
              <div className="absolute bottom-3 left-3 text-[11px] text-zinc-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none flex items-center gap-2">
                <span>🖱️ คลิกค้างเพื่อหมุน 360° | เลื่อนลูกกลิ้งเพื่อซูม</span>
                <span className="text-zinc-500">•</span>
                <span className="text-red-400 font-semibold">{activeExercise.name}</span>
              </div>
            )}
          </>
        ) : (
          <iframe
            ref={iframeRef}
            src="/malong-3d/index.html"
            title="Malong 3D Unity WebGL"
            className="w-full h-full min-h-[380px] border-0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
          />
        )}
      </div>
    </div>
  );
}

export default UnityWorkout3D;
