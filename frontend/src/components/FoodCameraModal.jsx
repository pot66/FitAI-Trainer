import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Check } from "lucide-react";

export default function FoodCameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [previewImage, setPreviewImage] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const startCamera = async (mode = "environment") => {
    setCameraError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed, falling back to user facing:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPreviewImage(null);
      startCamera(facingMode);
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreviewImage(dataUrl);
  };

  const handleConfirm = () => {
    if (previewImage) {
      onCapture(previewImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-semibold text-zinc-100">ถ่ายรูปอาหารด้วยกล้อง</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-sm text-red-400 max-w-xs">{cameraError}</div>
          ) : previewImage ? (
            <img src={previewImage} alt="Food snapshot" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlay target frame */}
              <div className="absolute inset-8 border-2 border-dashed border-red-500/60 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="bg-black/60 px-3 py-1 rounded-full text-xs text-zinc-300 backdrop-blur-sm">
                  จัดอาหารให้อยู่ในกรอบ
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-zinc-950/80 border-t border-white/10 flex items-center justify-between">
          {previewImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ถ่ายใหม่</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>ใช้นี้ในการวิเคราะห์</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                title="สลับกล้องหน้า/หลัง"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                disabled={Boolean(cameraError)}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="กดถ่ายรูป"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white/80" />
              </button>
              <div className="w-9" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}