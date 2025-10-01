import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NutritionRecords.css";

const personalInfo = {
  ho_ten: "Nguyễn Văn A",
  gioi_tinh: "Nam",
  tuoi: 39,
  dan_toc: "Kinh",
  sdt: "0123456789",
  dia_chi: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
};

const nutritionData = [
  {
    ngay_tu_van: "2024-10-01",
    chuyen_gia: "PGS.TS Nguyễn Thị B",
    loai_tu_van: "Giảm cân",
    phuong_thuc: "Trực tiếp",
    chi_so: {
      chieu_cao: "170 cm",
      can_nang: "75 kg",
      vong_eo: "85 cm",
      mo_co_the: "22%",
      khoi_co: "58 kg",
      nuoc: "60%",
    },
    nhan_xet: "Thừa cân nhẹ, tỷ lệ mỡ cơ thể cao hơn bình thường. Cần điều chỉnh chế độ ăn và tăng vận động.",
    ke_hoach: "Giảm 500-750 kcal/ngày so với nhu cầu duy trì. Tăng protein, giảm carb đơn giản, tăng chất xơ.",
    calo: "1800 kcal/ngày",
    cham_soc: "Uống đủ nước, tập thể dục 150 phút/tuần, theo dõi cân nặng hàng tuần",
    ghi_chu: "Tái khám sau 2 tuần để đánh giá tiến triển",
    thuc_don: {
      "Bữa sáng": "1 bát cháo yến mạch + 1 quả chuối + 1 ly sữa tươi không đường",
      "Bữa trưa": "100g cơm gạo lứt + 150g thịt gà luộc + Canh rau mồng tơi + 1 quả táo",
      "Bữa chiều": "1 ly nước ép cà chua + 10 hạt hạnh nhân",
      "Bữa tối": "100g cá hồi nướng + Salad rau xanh + 50g khoai lang luộc",
      "Bữa phụ": "1 hộp sữa chua không đường + 1 thìa hạt chia",
    },
  },
  {
    ngay_tu_van: "2024-11-15",
    chuyen_gia: "ThS. Trần Văn C",
    loai_tu_van: "Thể thao",
    phuong_thuc: "Online",
    chi_so: {
      chieu_cao: "170 cm",
      can_nang: "78 kg",
      vong_eo: "83 cm",
      mo_co_the: "20%",
      khoi_co: "60 kg",
      nuoc: "62%",
    },
    nhan_xet: "Thể trạng tốt, cần tăng cường protein và tập luyện sức mạnh.",
    ke_hoach: "Tăng 300 kcal/ngày, bổ sung thực phẩm giàu protein, tập gym 3 buổi/tuần.",
    calo: "2300 kcal/ngày",
    cham_soc: "Ngủ đủ 8h, uống 2 lít nước/ngày, tập thể dục đều đặn",
    ghi_chu: "Theo dõi cân nặng và khối cơ hàng tháng",
    thuc_don: {
      "Bữa sáng": "2 quả trứng + 1 lát bánh mì đen + 1 ly sữa tươi",
      "Bữa trưa": "150g thịt bò + 200g cơm + rau xanh",
      "Bữa chiều": "1 quả chuối + 1 ly whey protein",
      "Bữa tối": "100g cá + 100g ức gà + salad",
      "Bữa phụ": "1 hộp sữa chua + 1 quả táo",
    },
  },
];

const NutritionRecords = () => {
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: "32px 0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <button
            className="btn btn-outline-success"
            style={{ marginRight: 16 }}
            onClick={() => navigate("/patient-function")}
          >
            ← Quay lại
          </button>
          <h2 style={{
            textAlign: "center",
            color: "#389e0d",
            fontWeight: 700,
            marginBottom: 0,
            letterSpacing: 1,
            flex: 1
          }}>
            HỒ SƠ DINH DƯỠNG
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
          <h4 style={{ color: "#389e0d", marginBottom: 18 }}>Thông tin cá nhân</h4>
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
              <div><b>Tuổi:</b> {personalInfo.tuoi}</div>
            </div>
            <div>
              <div><b>Dân tộc:</b> {personalInfo.dan_toc}</div>
              <div><b>Số điện thoại:</b> {personalInfo.sdt}</div>
              <div><b>Địa chỉ:</b> {personalInfo.dia_chi}</div>
            </div>
          </div>
        </div>

        {/* Lịch sử tư vấn dinh dưỡng */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "32px 32px 24px 32px"
        }}>
          <h4 style={{ color: "#389e0d", marginBottom: 18 }}>Lịch sử tư vấn dinh dưỡng</h4>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#f6fff6",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <thead>
              <tr style={{ background: "#e6ffed", color: "#389e0d" }}>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Ngày tư vấn</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Chuyên gia</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Loại tư vấn</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Phương thức</th>
              </tr>
            </thead>
            <tbody>
              {nutritionData.map((record, idx) => (
                <tr
                  key={idx}
                  style={{
                    cursor: "pointer",
                    background: selectedNutrition === record ? "#e6ffed" : "#fff"
                  }}
                  onClick={() => {
                    setSelectedNutrition(record);
                    setShowMenu(false);
                  }}
                >
                  <td style={{ padding: "10px 8px" }}>{record.ngay_tu_van}</td>
                  <td style={{ padding: "10px 8px" }}>{record.chuyen_gia}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      background: record.loai_tu_van === "Giảm cân" ? "#ffccc7" : "#bae7ff",
                      color: record.loai_tu_van === "Giảm cân" ? "#cf1322" : "#096dd9",
                      borderRadius: 6,
                      padding: "2px 10px",
                      fontWeight: 500,
                    }}>
                      {record.loai_tu_van}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      background: record.phuong_thuc === "Trực tiếp" ? "#b7eb8f" : "#91d5ff",
                      color: record.phuong_thuc === "Trực tiếp" ? "#389e0d" : "#096dd9",
                      borderRadius: 6,
                      padding: "2px 10px",
                      fontWeight: 500,
                    }}>
                      {record.phuong_thuc}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết tư vấn dinh dưỡng */}
      {selectedNutrition && (
        <div className="custom-modal">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header" style={{ background: "#fff" }}>
              <span className="modal-title" style={{ color: "#389e0d" }}>
                Chi tiết tư vấn dinh dưỡng - {selectedNutrition.ngay_tu_van}
              </span>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedNutrition(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Cột trái: thông tin tư vấn */}
              <div className="modal-col">
                <h6>Thông tin tư vấn</h6>
                <div className="modal-box">
                  <b>Ngày tư vấn:</b> {selectedNutrition.ngay_tu_van}
                  <br />
                  <b>Chuyên gia:</b> {selectedNutrition.chuyen_gia}
                  <br />
                  <b>Loại tư vấn:</b>{" "}
                  <span style={{
                    background: selectedNutrition.loai_tu_van === "Giảm cân" ? "#ffccc7" : "#bae7ff",
                    color: selectedNutrition.loai_tu_van === "Giảm cân" ? "#cf1322" : "#096dd9",
                    borderRadius: 6,
                    padding: "2px 10px",
                    fontWeight: 500,
                  }}>
                    {selectedNutrition.loai_tu_van}
                  </span>
                  <br />
                  <b>Phương thức:</b>{" "}
                  <span style={{
                    background: selectedNutrition.phuong_thuc === "Trực tiếp" ? "#b7eb8f" : "#91d5ff",
                    color: selectedNutrition.phuong_thuc === "Trực tiếp" ? "#389e0d" : "#096dd9",
                    borderRadius: 6,
                    padding: "2px 10px",
                    fontWeight: 500,
                  }}>
                    {selectedNutrition.phuong_thuc}
                  </span>
                </div>
                <h6>Các chỉ số dinh dưỡng/cơ thể</h6>
                <div className="modal-box modal-box-info">
                  <div><b>Chiều cao:</b> {selectedNutrition.chi_so.chieu_cao}</div>
                  <div><b>Cân nặng:</b> {selectedNutrition.chi_so.can_nang}</div>
                  <div><b>Vòng eo:</b> {selectedNutrition.chi_so.vong_eo}</div>
                  <div><b>Mỡ cơ thể:</b> {selectedNutrition.chi_so.mo_co_the}</div>
                  <div><b>Khối cơ:</b> {selectedNutrition.chi_so.khoi_co}</div>
                  <div><b>Nước trong cơ thể:</b> {selectedNutrition.chi_so.nuoc}</div>
                </div>
                <h6>Nhu cầu calo hàng ngày</h6>
                <div className="modal-box" style={{
                  background: "#fff7e6",
                  color: "#d46b08",
                  fontWeight: 600,
                  fontSize: 18,
                  textAlign: "center"
                }}>
                  {selectedNutrition.calo}
                </div>
              </div>
              {/* Cột phải: nhận xét, kế hoạch, chăm sóc, ghi chú */}
              <div className="modal-col">
                <h6>Nhận xét</h6>
                <div className="modal-box modal-box-warning">
                  {selectedNutrition.nhan_xet}
                </div>
                <h6>Kế hoạch dinh dưỡng</h6>
                <div className="modal-box modal-box-success">
                  {selectedNutrition.ke_hoach}
                </div>
                <h6>Chăm sóc</h6>
                <div className="modal-box modal-box-note">
                  {selectedNutrition.cham_soc}
                </div>
                <h6>Ghi chú</h6>
                <div className="modal-box modal-box-note">
                  {selectedNutrition.ghi_chu}
                </div>
              </div>
            </div>
            {/* Thực đơn mẫu */}
            <div className="prescription-list">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <b>Thực đơn mẫu</b>
                <button
                  style={{
                    background: "#e6ffed",
                    color: "#389e0d",
                    border: "none",
                    borderRadius: 6,
                    padding: "2px 10px",
                    cursor: "pointer",
                    fontSize: 14
                  }}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {showMenu ? "Ẩn thực đơn" : "Xem thực đơn mẫu"}
                </button>
              </div>
              {showMenu && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {Object.entries(selectedNutrition.thuc_don).map(([buoi, thucdon], idx) => (
                    <div
                      key={buoi}
                      style={{
                        background:
                          buoi === "Bữa sáng" ? "#fff7e6" :
                          buoi === "Bữa trưa" ? "#fffbe6" :
                          buoi === "Bữa chiều" ? "#e6f7ff" :
                          buoi === "Bữa tối" ? "#f9f0ff" :
                          "#fff0f6",
                        borderRadius: 8,
                        padding: "10px 14px",
                        minWidth: 180,
                        flex: "1 1 180px",
                        fontSize: 15,
                        border: "1px solid #f0f0f0"
                      }}
                    >
                      <div style={{
                        fontWeight: 600,
                        color:
                          buoi === "Bữa sáng" ? "#d46b08" :
                          buoi === "Bữa trưa" ? "#ad8b00" :
                          buoi === "Bữa chiều" ? "#1765ad" :
                          buoi === "Bữa tối" ? "#722ed1" :
                          "#eb2f96",
                        marginBottom: 4
                      }}>
                        {buoi}
                      </div>
                      <div>{thucdon}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedNutrition(null)}
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

export default NutritionRecords;