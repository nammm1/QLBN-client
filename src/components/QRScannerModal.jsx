import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Space, Alert } from "antd";

const QRScannerModal = ({ open, onCancel, onDetected, title = "Quét mã QR" }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }
    let cancelled = false;
    async function start() {
      setError("");
      setIsStarting(true);
      try {
        // Check BarcodeDetector support
        const isSupported =
          typeof window !== "undefined" &&
          "BarcodeDetector" in window &&
          typeof window.BarcodeDetector === "function";

        if (!isSupported) {
          setError("Trình duyệt không hỗ trợ quét QR (BarcodeDetector). Vui lòng dùng Chrome/Edge mới.");
        } else {
          // @ts-ignore
          detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (detectorRef.current) {
          tick();
        }
      } catch (e) {
        setError("Không thể truy cập camera. Vui lòng cấp quyền hoặc kiểm tra thiết bị.");
        console.error(e);
      } finally {
        setIsStarting(false);
      }
    }
    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open]);

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const tick = async () => {
    if (!videoRef.current || !detectorRef.current) return;
    try {
      const results = await detectorRef.current.detect(videoRef.current);
      if (results && results.length > 0) {
        const val = results[0].rawValue || results[0].rawValue === "" ? results[0].rawValue : "";
        if (val) {
          onDetected?.(val);
          return; // auto close from parent
        }
      }
    } catch (e) {
      // Ignore per-frame errors
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>Đóng</Button>
        </Space>
      }
      width={720}
    >
      {error && (
        <Alert
          type="warning"
          message={error}
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}
      <div style={{ position: "relative", width: "100%", background: "#000", borderRadius: 8, overflow: "hidden" }}>
        <video
          ref={videoRef}
          style={{ width: "100%", height: "auto" }}
          playsInline
          muted
        />
        {isStarting && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            Đang khởi động camera...
          </div>
        )}
      </div>
      <div style={{ marginTop: 8, color: "#8c8c8c", fontSize: 12 }}>
        Gợi ý: Dùng Chrome/Edge mới. Nếu không quét được, kiểm tra quyền camera hoặc thử thiết bị khác.
      </div>
    </Modal>
  );
};

export default QRScannerModal;


