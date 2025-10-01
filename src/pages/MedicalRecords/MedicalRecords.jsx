import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MedicalRecords.css";

const personalInfo = {
  ho_ten: "Nguyễn Văn A",
  gioi_tinh: "Nam",
  nam_sinh: 1985,
  tuoi: 39,
  dan_toc: "Kinh",
  sdt: "0123456789",
  dia_chi: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  doi_tuong: "BH",
  ma_bhyt: "DN4010123456789",
};

const medicalData = [
  {
    thoi_gian_kham: "2024-10-01",
    bac_si: "BS. Nguyễn Văn B",
    ly_do_kham: "Đau bụng",
    chuan_doan: "Viêm dạ dày",
    ket_qua_cls: "Nội soi: viêm niêm mạc dạ dày",
    tham_do_chuc_nang: "Không có bất thường",
    dieu_tri: "Thuốc kháng acid, nghỉ ngơi",
    cham_soc: "Ăn uống nhẹ, tránh thức ăn cay nóng",
    ghi_chu: "Tái khám sau 7 ngày",
    don_thuoc: [
      {
        ten_thuoc: "Omeprazole 20mg",
        lieu_dung: "1 viên x 2 lần/ngày",
        so_luong: "14 viên",
      },
      {
        ten_thuoc: "Antacid",
        lieu_dung: "1 viên x 3 lần/ngày",
        so_luong: "21 viên",
      },
    ],
  },
  {
    thoi_gian_kham: "2024-11-15",
    bac_si: "BS. Trần Văn C",
    ly_do_kham: "Ho khan",
    chuan_doan: "Viêm phế quản",
    ket_qua_cls: "X-quang phổi: Tăng ẩm phế quản hai phổi",
    tham_do_chuc_nang: "SpO2: 98%",
    dieu_tri: "Kháng sinh, thuốc long đờm",
    cham_soc: "Uống nhiều nước, nghỉ ngơi đầy đủ",
    ghi_chu: "Tái khám sau 5 ngày nếu không đỡ",
    don_thuoc: [
      {
        ten_thuoc: "Amoxicillin 500mg",
        lieu_dung: "1 viên x 3 lần/ngày",
        so_luong: "21 viên",
      },
      {
        ten_thuoc: "Bromhexine 8mg",
        lieu_dung: "1 viên x 3 lần/ngày",
        so_luong: "15 viên",
      },
    ],
  },
];

const MedicalRecords = () => {
  const [selectedMedical, setSelectedMedical] = useState(null);
  const [showPrescription, setShowPrescription] = useState(true);
  const navigate = useNavigate();

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: "32px 0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <button
            className="btn btn-outline-primary"
            style={{ marginRight: 16 }}
            onClick={() => navigate("/patient-function")}
          >
            ← Quay lại
          </button>
          <h2 style={{
            textAlign: "center",
            color: "#1765ad",
            fontWeight: 700,
            marginBottom: 0,
            letterSpacing: 1,
            flex: 1
          }}>
            HỒ SƠ BỆNH ÁN
          </h2>
        </div>

        {/* Thông tin cá nhân */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "32px 32px 24px 32px",
          marginBottom: 32
        }}>
          <h4 style={{ color: "#1765ad", marginBottom: 18 }}>Thông tin bệnh nhân</h4>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "32px 48px",
            fontSize: 17,
            lineHeight: 1.7
          }}>
            <div>
              <div><b>Họ tên:</b> {personalInfo.ho_ten}</div>
              <div><b>Giới tính:</b> {personalInfo.gioi_tinh}</div>
              <div><b>Năm sinh:</b> {personalInfo.nam_sinh}</div>
              <div><b>Tuổi:</b> {personalInfo.tuoi}</div>
            </div>
            <div>
              <div><b>Dân tộc:</b> {personalInfo.dan_toc}</div>
              <div><b>Số điện thoại:</b> {personalInfo.sdt}</div>
              <div><b>Địa chỉ:</b> {personalInfo.dia_chi}</div>
            </div>
            <div>
              <div>
                <b>Đối tượng:</b> <span style={{
                  background: "#e6f7ff",
                  color: "#1765ad",
                  borderRadius: 6,
                  padding: "2px 10px",
                  fontWeight: 500,
                  marginLeft: 4
                }}>{personalInfo.doi_tuong}</span>
              </div>
              <div>
                <b>Mã BHYT:</b> <span style={{
                  color: "#389e0d",
                  fontWeight: 600,
                  marginLeft: 4
                }}>{personalInfo.ma_bhyt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử khám bệnh */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "32px 32px 24px 32px"
        }}>
          <h4 style={{ color: "#1765ad", marginBottom: 18 }}>Lịch sử khám bệnh</h4>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#f6faff",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <thead>
              <tr style={{ background: "#e6f7ff", color: "#1765ad" }}>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Ngày khám</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Bác sĩ</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Lý do khám</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Chẩn đoán</th>
              </tr>
            </thead>
            <tbody>
              {medicalData.map((record, idx) => (
                <tr
                  key={idx}
                  style={{
                    cursor: "pointer",
                    background: selectedMedical === record ? "#e6f7ff" : "#fff"
                  }}
                  onClick={() => setSelectedMedical(record)}
                >
                  <td style={{ padding: "10px 8px" }}>{record.thoi_gian_kham}</td>
                  <td style={{ padding: "10px 8px" }}>{record.bac_si}</td>
                  <td style={{ padding: "10px 8px" }}>{record.ly_do_kham}</td>
                  <td style={{ padding: "10px 8px" }}>{record.chuan_doan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết khám bệnh */}
      {selectedMedical && (
        <div className="custom-modal">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <span className="modal-title">
                Chi tiết khám bệnh - {selectedMedical.thoi_gian_kham}
              </span>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedMedical(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Cột trái: thông tin khám */}
              <div className="modal-col">
                <h6>Thông tin khám</h6>
                <div className="modal-box">
                  <b>Ngày khám:</b> {selectedMedical.thoi_gian_kham}
                  <br />
                  <b>Bác sĩ:</b> {selectedMedical.bac_si}
                  <br />
                  <b>Lý do khám:</b> {selectedMedical.ly_do_kham}
                  <br />
                  <b>Chẩn đoán:</b>{" "}
                  <span className="modal-box-red">{selectedMedical.chuan_doan}</span>
                </div>
                <h6>Kết quả cận lâm sàng</h6>
                <div className="modal-box modal-box-info">
                  {selectedMedical.ket_qua_cls}
                </div>
                <h6>Thăm dò chức năng</h6>
                <div className="modal-box modal-box-info">
                  {selectedMedical.tham_do_chuc_nang}
                </div>
              </div>
              {/* Cột phải: điều trị, chăm sóc, ghi chú */}
              <div className="modal-col">
                <h6>Điều trị</h6>
                <div className="modal-box modal-box-success">
                  {selectedMedical.dieu_tri}
                </div>
                <h6>Chăm sóc</h6>
                <div className="modal-box modal-box-warning">
                  {selectedMedical.cham_soc}
                </div>
                <h6>Ghi chú</h6>
                <div className="modal-box modal-box-note">
                  {selectedMedical.ghi_chu}
                </div>
              </div>
            </div>
            {/* Đơn thuốc */}
            <div className="prescription-list">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <b>Đơn thuốc</b>
                <button
                  style={{
                    background: "#e6f7ff",
                    color: "#1765ad",
                    border: "none",
                    borderRadius: 6,
                    padding: "2px 10px",
                    cursor: "pointer",
                    fontSize: 14
                  }}
                  onClick={() => setShowPrescription(!showPrescription)}
                >
                  {showPrescription ? "Ẩn đơn thuốc" : "Hiện đơn thuốc"}
                </button>
              </div>
              {showPrescription && (
                <div style={{ marginTop: 8 }}>
                  {selectedMedical.don_thuoc && selectedMedical.don_thuoc.length > 0 ? (
                    selectedMedical.don_thuoc.map((thuoc, idx) => (
                      <div className="prescription-item" key={idx}>
                        <div className="prescription-title">{thuoc.ten_thuoc}</div>
                        <div>Liều dùng: {thuoc.lieu_dung}</div>
                        <div>Số lượng: {thuoc.so_luong}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#aaa" }}>Không có đơn thuốc.</div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedMedical(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;