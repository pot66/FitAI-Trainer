import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import YouTubeCard from "./components/YouTubeCard";
import { getVideoForExercise } from "./utils/exerciseVideoMap";
import {
  IconDumbbell,
  IconCamera,
  IconTarget,
  IconInfo,
  IconCube,
  IconPause,
  IconPlay,
  IconZap,
  IconZoomIn,
  IconZoomOut,
  IconRotate,
  IconMinimize,
  IconMaximize,
  IconAlert,
  IconMouse,
  IconLightbulb
} from "./WorkoutIcons";


// Catalog of 14 exercises with genuine 3D animations from malong
export const EXERCISES_3D_CATALOG = [
  {
    id: "Squat",
    name: "Squat",
    thName: "สควอต",
    muscle: "ขาและสะโพก",
    category: "Leg",
    icon: "dumbbell",
    type: "standing",
    keywords: ["squat", "squats", "สควอต", "สควอท", "ย่อเข่า"],
  },
  {
    id: "Push-Up",
    name: "Push-Up",
    thName: "วิดพื้น / ดันพื้น",
    muscle: "หน้าอกและหัวไหล่",
    category: "Chest",
    icon: "dumbbell",
    type: "prone",
    keywords: ["push-up", "push up", "pushup", "วิดพื้น", "ดันพื้น"],
  },
  {
    id: "Lunge",
    name: "Lunge",
    thName: "ลันจ์ / ท่าแทงเข่า",
    muscle: "ต้นขาและสะโพก",
    category: "Leg",
    icon: "dumbbell",
    type: "standing",
    keywords: ["lunge", "lunges", "ลันจ์", "reverse lunge", "forward lunge", "แทงเข่า", "ก้าวขาสลับ"],
  },
  {
    id: "Plank",
    name: "Plank",
    thName: "แพลงก์",
    muscle: "แกนกลางลำตัว",
    category: "Core",
    icon: "dumbbell",
    type: "plank",
    keywords: ["plank", "แพลงก์", "แพลงค์", "elbow plank"],
  },
  {
    id: "Sit-up",
    name: "Sit-up",
    thName: "ซิทอัพ",
    muscle: "หน้าท้องส่วนบน",
    category: "Core",
    icon: "dumbbell",
    type: "supine",
    keywords: ["sit-up", "sit up", "situp", "ซิทอัพ", "ซิท-อัพ", "ลุกนั่ง"],
  },
  {
    id: "Glute Bridge",
    name: "Glute Bridge",
    thName: "กลูทบริดจ์ / ยกสะโพก",
    muscle: "ก้นและต้นขาด้านหลัง",
    category: "Glutes",
    icon: "dumbbell",
    type: "bridge",
    keywords: ["glute bridge", "bridge", "กลูทบริดจ์", "บริดจ์", "ยกสะโพก"],
  },
  {
    id: "Donkey Kick",
    name: "Donkey Kick",
    thName: "ดองกี้คิก",
    muscle: "กล้ามเนื้อก้น",
    category: "Glutes",
    icon: "dumbbell",
    type: "allFours",
    keywords: ["donkey kick", "ดองกี้คิก", "เตะขาหลัง"],
  },
  {
    id: "Bicycle Crunch",
    name: "Bicycle Crunch",
    thName: "ไบซิเคิลครันช์",
    muscle: "กล้ามเนื้อหน้าท้องและด้านข้าง",
    category: "Core",
    icon: "dumbbell",
    type: "supine",
    keywords: ["bicycle crunch", "ไบซิเคิลครันช์", "ปั่นจักรยานกลางอากาศ"],
  },
  {
    id: "Superman",
    name: "Superman",
    thName: "ซูเปอร์แมน",
    muscle: "หลังส่วนล่างและก้น",
    category: "Back",
    icon: "dumbbell",
    type: "prone",
    keywords: ["superman", "ซูเปอร์แมน", "ยกแขนขาแอ่นหลัง"],
  },
  {
    id: "Leg Raise",
    name: "Leg Raise",
    thName: "เลกเรส / ยกขา",
    muscle: "หน้าท้องส่วนล่าง",
    category: "Core",
    icon: "dumbbell",
    type: "supine",
    keywords: ["leg raise", "เลกเรส", "ยกขานอน", "บริหารท้องล่าง"],
  },
  {
    id: "Bulgarian Split Squat",
    name: "Bulgarian Split Squat",
    thName: "บัลแกเรียนสปลิทสควอต",
    muscle: "ต้นขาและสะโพกเดี่ยว",
    category: "Leg",
    icon: "dumbbell",
    type: "standing",
    keywords: ["bulgarian split squat", "บัลแกเรียนสปลิทสควอต", "สปลิทสควอต"],
  },
  {
    id: "Russian Twist",
    name: "Russian Twist",
    thName: "รัสเซียนทวิสต์",
    muscle: "หน้าท้องด้านข้าง (Obliques)",
    category: "Core",
    icon: "dumbbell",
    type: "seated",
    keywords: ["russian twist", "รัสเซียนทวิสต์", "บิดเอว"],
  },
  {
    id: "Fire Hydrant",
    name: "Fire Hydrant",
    thName: "ไฟร์ไฮดรานต์",
    muscle: "สะโพกด้านข้าง",
    category: "Glutes",
    icon: "dumbbell",
    type: "allFours",
    keywords: ["fire hydrant", "ไฟร์ไฮดรานต์", "กางขาทรงหมา"],
  },
  {
    id: "Close-grip Push-up",
    name: "Close-grip Push-up",
    thName: "โคลสกริดพุชอัพ",
    muscle: "หลังแขนและอกกลาง",
    category: "Arms",
    icon: "dumbbell",
    type: "prone",
    keywords: ["close-grip push-up", "close grip push up", "โคลสกริดพุชอัพ", "วิดพื้นแคบ", "diamond push up"],
  },
];

// Camera framing presets tailored per exercise pose type
const CAMERA_PRESETS = {
  standing: {
    camera: [0, 1.45, 3.6],
    target: [0, 0.95, 0],
    modelY: 0,
  },
  prone: {
    camera: [0, 1.35, 2.7],
    target: [0, 0.45, 0],
    modelY: 0,
  },
  plank: {
    camera: [0, 1.25, 2.5],
    target: [0, 0.4, 0],
    modelY: 0,
  },
  supine: {
    camera: [0, 1.35, 2.6],
    target: [0, 0.35, 0],
    modelY: 0,
  },
  seated: {
    camera: [0, 1.3, 2.7],
    target: [0, 0.5, 0],
    modelY: 0,
  },
  allFours: {
    camera: [0, 1.35, 2.6],
    target: [0, 0.5, 0],
    modelY: 0,
  },
  bridge: {
    camera: [0, 1.3, 2.6],
    target: [0, 0.4, 0],
    modelY: 0,
  },
};

/**
 * Helper to convert serialized JSON animation data into a Three.js AnimationClip
 */
function createClipFromJson(clipData) {
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
}

/**
 * Strictly match an exercise name to a 3D model.
 * Returns the catalog item if a genuine 3D model animation exists, or null otherwise.
 */
export function matchExerciseTo3D(exerciseName) {
  if (!exerciseName) return null;

  const raw = String(exerciseName).toLowerCase().trim();
  const clean = raw.replace(/[()]/g, "").trim();

  // Explicitly reject non-3D variations that contain generic words (e.g. "wall push up" != "push up")
  const non3DVariations = [
    "chair squat",
    "sumo squat",
    "wall push up",
    "wall push-up",
    "incline push up",
    "decline push up",
    "side plank",
    "reverse plank",
    "bird dog",
    "dead bug",
    "cat cow",
    "arm circles",
    "step up",
    "calf raise",
    "march in place",
    "high knees",
    "jumping jack",
    "walking",
    "bodyweight row",
  ];
  if (non3DVariations.some((v) => clean === v || clean.startsWith(v))) {
    return null;
  }

  // 1. Exact match on ID, Name, or Thai Name
  const exact = EXERCISES_3D_CATALOG.find(
    (item) =>
      clean === item.id.toLowerCase() ||
      clean === item.name.toLowerCase() ||
      clean === item.thName.toLowerCase()
  );
  if (exact) return exact;

  // 2. Keyword match (word-boundary or exact check)
  const byKeyword = EXERCISES_3D_CATALOG.find((item) =>
    item.keywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      if (clean === kwLower) return true;
      const regex = new RegExp(`(^|\\s)${kwLower.replace(/[-\\/\\\\^$*+?.()|[\]{}]/g, "\\$&")}($|\\s)`, "i");
      return regex.test(clean);
    })
  );
  if (byKeyword) return byKeyword;

  return null;
}

/**
 * Check if an exercise has a 3D model.
 */
export function has3DAnimation(exerciseName) {
  return Boolean(matchExerciseTo3D(exerciseName));
}

function UnityWorkout3D({
  exercise = "Squat",
  isWorkoutStarted = false,
  repetitions = 0,
  className = "",
  theme = "dark",
  hideHeader = false,
}) {
  const mountRef = useRef(null);
  const iframeRef = useRef(null);

  // Automatically determine if the current assigned exercise has a 3D model (no user manual selection)
  const activeExercise = useMemo(() => matchExerciseTo3D(exercise), [exercise]);
  const has3DModel = Boolean(activeExercise);

  // Video guide data for the current exercise (used when non-3D)
  const videoData = useMemo(() => getVideoForExercise(exercise), [exercise]);

  const [engineMode, setEngineMode] = useState("three");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [hasError, setHasError] = useState(false);

  const mixerRef = useRef(null);
  const actionsMapRef = useRef(new Map());
  const currentActionRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  // Auto-Frame camera function to guarantee the full body is visible
  const applyCameraPreset = useCallback((exerciseType) => {
    const preset = CAMERA_PRESETS[exerciseType] || CAMERA_PRESETS.standing;
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(...preset.camera);
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
    }
    if (modelRef.current) {
      modelRef.current.position.y = preset.modelY;
    }
  }, []);

  // Play animation with smooth crossfade and auto-frame camera
  const playExerciseAnimation = useCallback(
    (clipId) => {
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
        prevAction.fadeOut(0.3);
        targetAction.reset().fadeIn(0.3).play();
      } else {
        targetAction.play();
      }
      currentActionRef.current = targetAction;

      const exObj = EXERCISES_3D_CATALOG.find((e) => e.id === clipId);
      applyCameraPreset(exObj?.type || "standing");
    },
    [applyCameraPreset]
  );

  useEffect(() => {
    if (mixerRef.current && activeExercise) {
      playExerciseAnimation(activeExercise.id);
    }
  }, [activeExercise, playExerciseAnimation]);

  // Three.js Scene Setup & Model Loading (only when 3D model is active)
  useEffect(() => {
    if (!has3DModel || engineMode !== "three" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0b10);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const initialPreset = CAMERA_PRESETS[activeExercise?.type || "standing"];
    camera.position.set(...initialPreset.camera);
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
    controls.target.set(...initialPreset.target);
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

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 0.8);
    fillLight.position.set(5, -2, -3);
    scene.add(fillLight);

    // Floor & Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x3b82f6, 0x1e293b);
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
    setLoadingProgress(15);

    // Load Textures
    const textureLoader = new THREE.TextureLoader();
    const diffuseMap = textureLoader.load("/models/Ch03_1001_Diffuse.png");
    const normalMap = textureLoader.load("/models/Ch03_1001_Normal.png");

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

    // Helper to handle loaded FBX model & bind animations
    const handleModelLoaded = (fbx, animData) => {
      modelRef.current = fbx;
      fbx.scale.setScalar(0.01);
      fbx.position.set(0, initialPreset.modelY, 0);

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
      if (activeExercise) {
        playExerciseAnimation(activeExercise.id);
      }

      setIsLoading(false);
      setHasError(false);
      setLoadingProgress(100);
    };

    // Filter out non-fatal Three.js FBX internal parser noise (ShininessExponent & >4 skin weights)
    const originalConsoleWarn = console.warn;
    const filterFbxWarn = (...args) => {
      const msg = args[0] != null ? String(args[0]) : "";
      if (
        msg.includes("THREE.FBXLoader: ShininessExponent") ||
        msg.includes("THREE.FBXLoader: Vertex has more than 4 skinning weights")
      ) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    console.warn = filterFbxWarn;

    // Load both Model and 3D Animations concurrently
    const loader = new FBXLoader();

    loadAnimationsPromise.then((animData) => {
      setLoadingProgress(40);

      loader.load(
        "/models/TestMo.fbx",
        (fbx) => handleModelLoaded(fbx, animData),
        (xhr) => {
          if (xhr.total > 0) {
            setLoadingProgress(40 + Math.round((xhr.loaded / xhr.total) * 55));
          }
        },
        (error) => {
          console.error("Three.js FBX loading error:", error);
          setIsLoading(false);
          setHasError(true);
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
      console.warn = originalConsoleWarn;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      if (renderer) renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [has3DModel, engineMode, playExerciseAnimation, activeExercise?.type, activeExercise?.id]);

  // Post update to Unity WebGL if in Unity mode
  useEffect(() => {
    if (!iframeRef.current || engineMode !== "unity" || !activeExercise) return;
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
    if (activeExercise) {
      applyCameraPreset(activeExercise.type);
    }
  };

  const handleZoom = (factor) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const target = controlsRef.current.target;
    camera.position.sub(target).multiplyScalar(factor).add(target);
    controlsRef.current.update();
  };

  return (
    <div
      className={`${theme === "dark" ? "bg-[#0b0f17] border border-white/10 text-white" : "bg-white border border-slate-200/80 text-[#1e293b]"} rounded-2xl overflow-hidden shadow-xl flex flex-col ${className} ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "relative"
      }`}
    >
      {/* 3D / Video View Topbar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b ${theme === "dark" ? "bg-[#131924]/95 border-white/10 text-white" : "bg-[#abbed2] border-[#9bb0c4] text-[#1e293b]"} ${hideHeader ? "hidden" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {has3DModel ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/80 border border-white/90 text-[#1e293b] uppercase tracking-wide flex items-center gap-1.5 shadow-xs">
              <IconDumbbell className="w-3.5 h-3.5 text-sky-600" />
              <span>MALONG 3D COACH</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide flex items-center gap-1.5 shadow-xs">
              <IconCamera className="w-3.5 h-3.5 text-amber-800" />
              <span>VIDEO FORM COACH</span>
            </span>
          )}

          {/* Current Exercise Badge (Automatic - Not selectable by user) */}
          {has3DModel && activeExercise ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-3 py-1 shadow-xs">
              <IconDumbbell className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-xs font-extrabold text-[#1e293b]">{activeExercise.name}</span>
              <span className="text-[11px] text-[#475569] font-semibold hidden sm:inline">
                ({activeExercise.thName})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/90 rounded-xl px-3 py-1 shadow-xs">
              <span className="text-xs font-extrabold text-amber-950">
                {videoData?.name || exercise}
              </span>
              {videoData?.thName && videoData.thName !== (videoData?.name || exercise) && (
                <span className="text-[11px] text-amber-800 font-semibold hidden sm:inline">
                  ({videoData.thName})
                </span>
              )}
            </div>
          )}

          {has3DModel && activeExercise && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-300">
              <span className="flex items-center gap-1"><IconTarget className="w-3 h-3 text-sky-700" /> {activeExercise.muscle}</span>
            </span>
          )}

          {!has3DModel && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-300 flex items-center gap-1">
              <IconInfo className="w-3 h-3" />
              <span>ยังไม่มีโมเดล 3D</span>
            </span>
          )}

          {isWorkoutStarted && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
              Reps: {repetitions}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {has3DModel && (
            <>
              <button
                type="button"
                onClick={() => setEngineMode((m) => (m === "three" ? "unity" : "three"))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
                title="สลับโหมด Native 3D และ Unity WebGL"
              >
                <span className="flex items-center gap-1.5"><IconCube className="w-3.5 h-3.5" /> {engineMode === "three" ? "โหมด: Native 3D" : "โหมด: Unity WebGL"}</span>
              </button>

              {engineMode === "three" && (
                <>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
                    title={isPlaying ? "พักอนิเมชัน" : "เล่นต่อ"}
                  >
                    <span className="flex items-center gap-1.5">{isPlaying ? <IconPause className="w-3 h-3" /> : <IconPlay className="w-3 h-3" />} {isPlaying ? "พัก" : "เล่น"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimSpeed((s) => (s === 1 ? 0.5 : s === 0.5 ? 1.5 : 1))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
                    title="ปรับความเร็วอนิเมชัน"
                  >
                    <span className="flex items-center gap-1"><IconZap className="w-3 h-3 text-amber-400" /> {animSpeed}x</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoom(0.85)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
                    title="ซูมเข้า"
                  >
                    <span className="flex items-center justify-center"><IconZoomIn className="w-3.5 h-3.5" /></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoom(1.18)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
                    title="ซูมออก"
                  >
                    <span className="flex items-center justify-center"><IconZoomOut className="w-3.5 h-3.5" /></span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCamera}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer flex items-center gap-1 ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
                    title="จัดมุมมองให้เห็นตัวโมเดลเต็มตัวอย่างเหมาะสม"
                  >
                    <IconRotate className="w-3.5 h-3.5" />
                    <span>เต็มตัว</span>
                  </button>
                </>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white border-white/10" : "bg-white hover:bg-slate-50 text-[#1e293b] border-white/80"}`}
            title={isFullscreen ? "ย่อหน้าจอ" : "เต็มหน้าจอ"}
          >
            <span className="flex items-center gap-1.5">{isFullscreen ? <IconMinimize className="w-3.5 h-3.5" /> : <IconMaximize className="w-3.5 h-3.5" />} {isFullscreen ? "ย่อ" : "ขยาย"}</span>
          </button>
        </div>
      </div>

      {/* Viewport Content */}
      <div className="relative w-full flex-1 min-h-[460px] bg-slate-900 overflow-hidden flex items-center justify-center">
        {has3DModel ? (
          /* =========================================================
             3D MODEL DISPLAY (Native Three.js or Unity WebGL)
             ========================================================= */
          engineMode === "three" ? (
            <>
              <div ref={mountRef} className="w-full h-full min-h-[460px]" />

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/85 z-10 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 animate-bounce"><IconDumbbell className="w-6 h-6" /></div>
                  <span className="text-sm font-semibold text-zinc-200">
                    กำลังโหลด Malong 3D Coach... ({loadingProgress}%)
                  </span>
                  <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
                    <div
                      style={{ width: `${loadingProgress}%` }}
                      className="h-full bg-[#3b99e2] transition-all duration-200"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-2">
                    โมเดล 3D ท่า: {activeExercise?.name} ({activeExercise?.thName})
                  </span>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2"><IconAlert className="w-6 h-6" /></div>
                  <p className="text-sm text-red-400">
                    ไม่สามารถโหลดโมเดล 3D ได้ กรุณาลองใหม่อีกครั้ง
                  </p>
                </div>
              )}

              {!isLoading && (
                <div className="absolute bottom-3 left-3 text-[11px] text-zinc-300 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none flex items-center gap-2">
                  <span className="flex items-center gap-1.5"><IconMouse className="w-3.5 h-3.5 text-slate-400" /> คลิกค้างเพื่อหมุน 360° | เลื่อนลูกกลิ้งเพื่อซูม</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-red-400 font-bold">
                    {activeExercise?.name} ({activeExercise?.thName})
                  </span>
                </div>
              )}
            </>
          ) : (
            <iframe
              ref={iframeRef}
              src="/malong-3d/index.html"
              title="Malong 3D Unity WebGL"
              className="w-full h-full min-h-[460px] border-0"
              allow="autoplay; fullscreen; xr-spatial-tracking"
            />
          )
        ) : (
          /* =========================================================
             NO 3D MODEL FALLBACK: CLEAR NOTICE & VIDEO TUTORIAL COACH
             ========================================================= */
          <div className="w-full h-full min-h-[460px] overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col gap-5">
            {/* Banner: แจ้งว่ายังไม่มีโมเดล 3D สำหรับท่านี้ */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-lg backdrop-blur-md">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                <IconAlert className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    ตอนนี้ยังไม่มีโมเดล 3D สำหรับท่านี้
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/25 text-amber-200 border border-amber-400/40">
                    {exercise}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  ระบบตรวจพบว่าท่า <strong className="text-amber-200">"{videoData?.thName || exercise}"</strong> ยังไม่มีอนิเมชันโมเดล 3D ในระบบ FitAI จึงได้จัดเตรียม
                  <span className="text-[#3b99e2] font-semibold"> คลิปวิดีโอสาธิตและแนะนำฟอร์มการฝึกที่ถูกต้อง</span> มาให้คุณฝึกตามได้อย่างปลอดภัยและถูกวิธี
                </p>
              </div>
            </div>

            {/* Video Tutorial Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base">
                    <IconCamera className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      RECOMMENDED FORM TUTORIAL
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      คลิปสาธิตท่า: {videoData?.name} ({videoData?.thName})
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {videoData?.targetMuscle && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-700 text-sky-300 border border-slate-600">
                      <span className="flex items-center gap-1"><IconTarget className="w-3 h-3 text-sky-400" /> {videoData.targetMuscle}</span>
                    </span>
                  )}
                  {videoData?.difficulty && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-700 text-emerald-300 border border-slate-600">
                      <span className="flex items-center gap-1"><IconZap className="w-3 h-3 text-amber-400" /> {videoData.difficulty}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* YouTube Player / Card */}
              <div className="w-full">
                <YouTubeCard
                  url={videoData?.url}
                  title={`วิดีโอสาธิตท่า ${videoData?.name} (${videoData?.thName})`}
                />
              </div>

              {/* Training Tips & Cues */}
              {videoData?.tips && (
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3.5 flex items-start gap-2.5">
                  <IconLightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-white block mb-0.5">เทคนิคและคำแนะนำการฝึก:</strong>
                    {videoData.tips}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnityWorkout3D;
