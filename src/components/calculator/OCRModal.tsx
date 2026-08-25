"use client";
import { useState, useRef } from "react";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";

export function OCRModal() {
  const { activeModal, setActiveModal, setInputLinear, setInputLatex } = useCalcStore();
  const [step, setStep] = useState<"capture" | "review" | "uploading">("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedResult, setEditedResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  if (activeModal !== "ocr") return null;

  const close = () => {
    stopCamera();
    setActiveModal(null);
    setStep("capture");
    setCapturedImage(null);
    setEditedResult("");
    setError("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError("Camera access denied. Please upload an image instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    stopCamera();
    sendToOCR(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      sendToOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const sendToOCR = async (imageData: string) => {
    setStep("uploading");
    setError("");

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "OCR service unavailable" }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const latex = data.latex || data.text || "";

      setEditedResult(latex);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "OCR recognition failed");
      setStep("capture");
    }
  };

  const confirmResult = () => {
    if (editedResult.trim()) {
      setInputLinear(editedResult);
      setInputLatex(editedResult);
      close();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <ChamferedPanel
        style={{ width: "100%", maxWidth: "440px", padding: "20px" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 13, color: "#E8B93F", letterSpacing: "0.08em" }}>
            📷 MATH OCR SCANNER
          </span>
          <button onClick={close} style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {/* Step: capture */}
        {step === "capture" && (
          <div>
            {cameraActive ? (
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <video
                  ref={videoRef}
                  style={{ width: "100%", maxHeight: "240px", borderRadius: "8px", objectFit: "cover" }}
                  autoPlay
                  playsInline
                />
                <button
                  onClick={captureFromCamera}
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px 24px",
                    background: "linear-gradient(135deg, #E8B93F, #8A6A22)",
                    border: "none",
                    borderRadius: "20px",
                    color: "#08090C",
                    fontFamily: '"Rajdhani", sans-serif',
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  📸 CAPTURE
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={startCamera}
                  style={{
                    padding: "16px",
                    background: "rgba(232,185,63,0.1)",
                    border: "1px dashed #E8B93F",
                    borderRadius: "8px",
                    color: "#E8B93F",
                    fontFamily: '"Rajdhani", sans-serif',
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  📷 Use Camera to Scan Equation
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: "16px",
                    background: "#181B22",
                    border: "1px dashed #2A2E38",
                    borderRadius: "8px",
                    color: "#F4EFE4",
                    fontFamily: '"Rajdhani", sans-serif',
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  📁 Upload Image from Device
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {error && (
              <div style={{ marginTop: "10px", color: "#EF4444", fontFamily: '"Rajdhani", sans-serif', fontSize: "12px" }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step: uploading */}
        {step === "uploading" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontFamily: '"Rajdhani", sans-serif', color: "#E8B93F", fontSize: "14px", marginBottom: "8px" }}>
              ⌛ Recognizing equation via Mathpix OCR...
            </div>
          </div>
        )}

        {/* Step: review */}
        {step === "review" && (
          <div>
            <div style={{ marginBottom: "8px", fontFamily: '"Rajdhani", sans-serif', fontSize: "12px", color: "#8A6A22" }}>
              Recognized Expression (review and edit before inserting):
            </div>

            <textarea
              value={editedResult}
              onChange={(e) => setEditedResult(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                background: "#08090C",
                border: "1px solid #E8B93F",
                borderRadius: "8px",
                color: "#F5D785",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "16px",
                padding: "10px",
                outline: "none",
                resize: "none",
                marginBottom: "8px",
              }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={confirmResult}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "linear-gradient(135deg, #E8B93F, #8A6A22)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#08090C",
                  fontFamily: '"Rajdhani", sans-serif',
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                INSERT INTO CALCULATOR
              </button>
              <button
                onClick={() => setStep("capture")}
                style={{
                  padding: "10px 16px",
                  background: "#181B22",
                  border: "1px solid #2A2E38",
                  borderRadius: "8px",
                  color: "#8A6A22",
                  fontFamily: '"Rajdhani", sans-serif',
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Retake
              </button>
            </div>
          </div>
        )}
      </ChamferedPanel>
    </div>
  );
}
