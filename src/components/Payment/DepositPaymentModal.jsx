import { useEffect, useMemo, useState } from "react";
import "./DepositPaymentModal.css";

const formatCurrency = (value = 0) =>
  Number(value || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  });

const getTimeParts = (msLeft) => {
  if (!msLeft || msLeft <= 0) return { minutes: 0, seconds: 0 };
  const minutes = Math.floor(msLeft / 60000);
  const seconds = Math.floor((msLeft % 60000) / 1000);
  return { minutes, seconds };
};

const DepositPaymentModal = ({ deposit, onClose }) => {
  const {
    invoice_id,
    amount,
    payment_url,
    qr_code_url,
    order_id,
    expires_at,
    provider,
    mode,
    instructions,
  } = deposit || {};

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLeftMs = useMemo(() => {
    if (!expires_at) return null;
    return new Date(expires_at).getTime() - now;
  }, [expires_at, now]);

  const { minutes, seconds } = getTimeParts(timeLeftMs);
  const isExpired = typeof timeLeftMs === "number" && timeLeftMs <= 0;

  const handleOpenPayment = () => {
    if (payment_url) {
      window.open(payment_url, "_blank", "noopener");
    }
  };

  const handleCopyLink = async () => {
    if (!payment_url || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(payment_url);
    } catch (error) {
      console.error("Cannot copy payment link:", error);
    }
  };

  if (!deposit) return null;

  return (
    <div className="deposit-overlay">
      <div className="deposit-modal">
        <div className="deposit-header">
          <div>
            <p className="deposit-eyebrow">Thanh toán tiền cọc</p>
            <h3>
              {provider?.toUpperCase() || "MoMo"}{" "}
              {mode === "mock" ? "(Mô phỏng)" : ""}
            </h3>
          </div>
          <button className="deposit-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="deposit-content">
          <div className="deposit-summary">
            <div>
              <p className="deposit-label">Số tiền cần thanh toán</p>
              <p className="deposit-amount">{formatCurrency(amount)} VNĐ</p>
            </div>
            <div>
              <p className="deposit-label">Hết hạn trong</p>
              <p className={`deposit-countdown ${isExpired ? "expired" : ""}`}>
                {isExpired ? "Đã hết hạn" : `${minutes}p ${seconds}s`}
              </p>
            </div>
          </div>

          <div className="deposit-field">
            <span className="deposit-label">Mã hóa đơn</span>
            <span className="deposit-value">{invoice_id || "—"}</span>
          </div>

          <div className="deposit-field">
            <span className="deposit-label">Mã giao dịch</span>
            <span className="deposit-value">{order_id || "—"}</span>
          </div>

          {instructions ? (
            <div className="deposit-instructions">{instructions}</div>
          ) : null}

          {qr_code_url ? (
            <div className="deposit-qr-wrapper">
              <img src={qr_code_url} alt="QR thanh toán" />
            </div>
          ) : null}
        </div>

        <div className="deposit-actions">
          <button className="deposit-link-btn" onClick={handleCopyLink}>
            Sao chép liên kết
          </button>
          <button
            className="deposit-pay-btn"
            onClick={handleOpenPayment}
            disabled={!payment_url}
          >
            Mở trang thanh toán
          </button>
        </div>

        <p className="deposit-helper">
          * Vui lòng hoàn tất thanh toán trong thời gian quy định để hệ thống
          giữ lịch của bạn. Nếu đã thanh toán, bạn có thể đóng cửa sổ này.
        </p>
      </div>
    </div>
  );
};

export default DepositPaymentModal;


