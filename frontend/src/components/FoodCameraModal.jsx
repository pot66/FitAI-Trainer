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
      console.error("Camera access error:", err);
      setCameraError("ไม่สามารถเข้าถึงกล้องได้: " + (err.message || ""));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#9bb0c4] bg-[#abbed2]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1e293b]" />
            <h3 className="text-sm font-bold text-[#1e293b]">ถ่ายรูปอาหารด้วยกล้อง AI</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#1e293b] hover:bg-white/40 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative aspect-4/3 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-sm text-rose-400 max-w-xs">{cameraError}</div>
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
              <div className="absolute inset-8 border-2 border-dashed border-[#3b99e2]/80 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="bg-black/60 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm">
                  จัดอาหารให้อยู่ในกรอบ
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          {previewImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#1e293b] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ถ่ายใหม่</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#3b99e2] hover:bg-[#288ad4] rounded-xl shadow-md shadow-[#3b99e2]/25 transition-all cursor-pointer"
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
                className="p-2.5 text-[#475569] hover:text-[#1e293b] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="สลับกล้องหน้า/หลัง"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                disabled={Boolean(cameraError)}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-[#3b99e2] hover:bg-[#288ad4] text-white shadow-lg shadow-[#3b99e2]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="กดถ่ายรูป"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white/90" />
              </button>
              <div className="w-9" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
