import React from "react";
import { Typography } from "antd";
import { QRCodeSVG } from "qrcode.react";
import hospitalLogo from "../../assets/hospital-logo.svg";

const { Title, Text } = Typography;

const defaultClinicInfo = {
  name: "PHÒNG KHÁM HOPITALCARE",
  slogan: "Chăm sóc sức khỏe toàn diện",
  address: "123 Đường ABC, Quận XYZ, TP.HCM",
  phone: "028 1234 5678",
  email: "support@medpro.vn",
  website: "www.medpro.vn",
  taxCode: "MST: 0312345678",
};

export const InvoiceHeader = ({
  clinicInfo = defaultClinicInfo,
  subtitle = "HÓA ĐƠN DỊCH VỤ Y TẾ",
  qrValue = "",
  invoiceCode,
  metadata = [],
}) => {
  const effectiveMetadata = [
    invoiceCode
      ? {
          label: "Mã hóa đơn",
          value: invoiceCode,
        }
      : null,
    ...metadata,
  ].filter(Boolean);

  return (
    <div style={{ marginBottom: 30 }}>
      {/* Hàng 1: Logo, PHÒNG KHÁM và QR code cùng hàng */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: "2px solid #1890ff",
        }}
      >
        <img
          src={clinicInfo.logo || hospitalLogo}
          alt="Logo MedPro"
          style={{ width: 50, height: 50, objectFit: "contain" }}
        />
        <Title level={4} style={{ color: "#1890ff", margin: 0, textTransform: "uppercase", flex: 1 }}>
          {clinicInfo.name}
        </Title>
        {qrValue && (
          <div style={{ textAlign: "center" }}>
            <QRCodeSVG value={qrValue} size={120} level="H" includeMargin />
          </div>
        )}
      </div>

      {/* Hàng 2: Hóa đơn khám bệnh */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text strong style={{ fontSize: 30, display: "block" }}>
          {subtitle}
        </Text>
      </div>
    </div>
  );
};

const defaultSignatureSlots = [
  { label: "Người lập hóa đơn", note: "Ký, ghi rõ họ tên" },
  { label: "Bác sĩ/Chuyên gia phụ trách", note: "Ký, ghi rõ họ tên & đóng dấu" },
  { label: "Bệnh nhân/Người thanh toán", note: "Ký, ghi rõ họ tên" },
];

export const InvoiceSignatureSection = ({ slots = [] }) => {
  const preparedSlots = (slots.length ? slots : defaultSignatureSlots).map((slot, index) => ({
    ...slot,
    key: `${slot.label}-${index}`,
    note: slot.note || "Ký, ghi rõ họ tên",
  }));

  return (
    <div
      style={{
        marginTop: 40,
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "space-between",
      }}
    >
      {preparedSlots.map((slot) => (
        <div
          key={slot.key}
          style={{
            flex: "1 1 240px",
            minWidth: 220,
            textAlign: "center",
          }}
        >
          <Text strong style={{ textTransform: "uppercase" }}>
            {slot.label}
          </Text>
          {slot.title && (
            <div style={{ marginTop: 4, color: "#8c8c8c", fontStyle: "italic", fontSize: 12 }}>
              {slot.title}
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              border: "1px dashed #d9d9d9",
              borderRadius: 8,
              height: 90,
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {slot.note}
            </Text>
          </div>
          {slot.name && (
            <Text style={{ display: "block", marginTop: 8, fontWeight: 500 }}>{slot.name}</Text>
          )}
        </div>
      ))}
    </div>
  );
};

export default {
  InvoiceHeader,
  InvoiceSignatureSection,
};


