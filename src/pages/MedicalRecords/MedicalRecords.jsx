import React, { useState } from "react";
import "./MedicalRecords.css";

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState("benh-an");
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [selectedMedical, setSelectedMedical] = useState(null);

  // Thông tin bệnh nhân
  const personalInfo = {
    ho_ten: "Nguyễn Văn A",
    sdt: "0909123456",
    tuoi: 30,
    gioi_tinh: "Nam",
    dan_toc: "Kinh",
    BHYT: "123456789",
    dia_chi: "123 Đường ABC, Quận 1, TP.HCM",
  };

  // Hồ sơ bệnh án
  const medicalData = [
    {
      thoi_gian_tao: "2024-10-01",
      bac_si: "BS. Nguyễn Văn A",
      ly_do_kham: "Đau họng, sốt",
      chuan_doan: "Viêm họng cấp",
      ket_qua_cls: "Xét nghiệm máu: bạch cầu tăng",
      tham_do_chuc_nang: "Không có bất thường",
      dieu_tri: "Kháng sinh + hạ sốt",
      cham_soc: "Theo dõi nhiệt độ hàng ngày",
      ghi_chu: "Uống thuốc đủ 5 ngày",
    },
    {
      thoi_gian_tao: "2024-11-15",
      bac_si: "BS. Trần Văn B",
      ly_do_kham: "Ho kéo dài",
      chuan_doan: "Viêm phế quản",
      ket_qua_cls: "X-quang phổi: hình ảnh viêm",
      tham_do_chuc_nang: "SpO2: 97%",
      dieu_tri: "Kháng sinh + siro ho",
      cham_soc: "Nghỉ ngơi, giữ ấm",
      ghi_chu: "Tái khám sau 7 ngày",
    },
  ];

  // Hồ sơ dinh dưỡng
  const nutritionData = [
    {
      thoi_gian_tao: "2024-09-20",
      chuyen_gia: "CN. Lê Thị C",
      ly_do_kham: "Tư vấn chế độ ăn",
      chuan_doan: "Thiếu máu nhẹ do thiếu sắt, thể trạng gầy",
      ket_qua_cls: "Đường huyết: 90 mg/dL, Cholesterol: 180 mg/dL, Thiếu sắt",
      tham_do_chuc_nang: {
        BMI: "18.5",
        chieu_cao: "170 cm",
        can_nang: "53 kg",
        vong_eo: "72 cm",
        mo_co_the: "20%",
        co: "35 kg",
        nuoc: "55%",
      },
      dieu_tri:
        "Tăng protein, bổ sung thịt đỏ, trứng, sữa. Hạn chế thức ăn nhanh.",
      cham_soc: "Ngủ đủ 8h, uống 2 lít nước/ngày, tập thể dục nhẹ",
      ghi_chu: "Theo dõi cân nặng hàng tháng",
      calories: "2000 kcal/ngày",
      menu: {
        Sáng: "Bánh mì + trứng",
        Trưa: "Cơm + thịt bò + rau xanh",
        Chieu: "Trái cây + sữa chua",
        Tối: "Cá + canh rau",
      },
    },
  ];

  const fieldLabels = {
    BMI: "Chỉ số BMI",
    chieu_cao: "Chiều cao",
    can_nang: "Cân nặng",
    vong_eo: "Vòng eo",
    mo_co_the: "Mỡ cơ thể",
    co: "Khối cơ",
    nuoc: "Nước trong cơ thể",
  };

  return (
    <div className="container py-5 medical-records">
      <h2 className="text-center mb-4 fw-bold">Hồ sơ bệnh án điện tử</h2>

      {/* Tabs */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn mx-2 ${
            activeTab === "benh-an" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("benh-an")}
        >
          Hồ sơ bệnh án
        </button>
        <button
          className={`btn mx-2 ${
            activeTab === "dinh-duong" ? "btn-success" : "btn-outline-success"
          }`}
          onClick={() => setActiveTab("dinh-duong")}
        >
          Hồ sơ dinh dưỡng
        </button>
      </div>

      {/* Bảng bệnh án */}
      {activeTab === "benh-an" && (
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>Ngày khám</th>
              <th>Bác sĩ</th>
              <th>Lý do khám</th>
              <th>Chẩn đoán</th>
            </tr>
          </thead>
          <tbody>
            {medicalData.map((record) => (
              <tr
                key={record.id_ho_so}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedMedical(record)}
              >
                <td>{record.thoi_gian_tao}</td>
                <td>{record.bac_si}</td>
                <td>{record.ly_do_kham}</td>
                <td>{record.chuan_doan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Bảng dinh dưỡng */}
      {activeTab === "dinh-duong" && (
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>Ngày tư vấn</th>
              <th>Chuyên gia</th>
              <th>Lý do khám</th>
              <th>Chẩn đoán</th>
              <th>Nhu cầu calo</th>
            </tr>
          </thead>
          <tbody>
            {nutritionData.map((record) => (
              <tr
                key={record.id_ho_so}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedNutrition(record)}
              >
                <td>{record.thoi_gian_tao}</td>
                <td>{record.chuyen_gia}</td>
                <td>{record.ly_do_kham}</td>
                <td>{record.chuan_doan}</td>
                <td>{record.calories}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal chi tiết bệnh án */}
      {selectedMedical && (
        <div className="custom-modal">
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    🩺 Hồ sơ bệnh án - {personalInfo.ho_ten}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedMedical(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <span className="badge bg-secondary me-2">
                      Ngày: {selectedMedical.thoi_gian_tao}
                    </span>
                    <span className="badge bg-warning text-dark">
                      Bác sĩ: {selectedMedical.bac_si}
                    </span>
                  </div>

                  <h6>Thông tin cá nhân</h6>
                  <ul>
                    <li>SĐT: {personalInfo.sdt}</li>
                    <li>Tuổi: {personalInfo.tuoi}</li>
                    <li>Giới tính: {personalInfo.gioi_tinh}</li>
                    <li>Dân tộc: {personalInfo.dan_toc}</li>
                    <li>BHYT: {personalInfo.BHYT}</li>
                    <li>Địa chỉ: {personalInfo.dia_chi}</li>
                  </ul>

                  <h6>Lý do khám</h6>
                  <p>{selectedMedical.ly_do_kham}</p>
                  
                  <h6>Kết quả cận lâm sàng</h6>
                  <p>{selectedMedical.ket_qua_cls}</p>

                  <h6>Thăm dò chức năng</h6>
                  <p>{selectedMedical.tham_do_chuc_nang}</p>

                  <h6>Chẩn đoán</h6>
                  <p>{selectedMedical.chuan_doan}</p>

                  <h6>Điều trị</h6>
                  <p>{selectedMedical.dieu_tri}</p>

                  <h6>Chăm sóc & Ghi chú</h6>
                  <p>
                    <strong>Chăm sóc:</strong> {selectedMedical.cham_soc}
                  </p>
                  <p>
                    <strong>Ghi chú:</strong> {selectedMedical.ghi_chu}
                  </p>
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
          </div>
        </div>
      )}

      {/* Modal chi tiết dinh dưỡng */}
      {selectedNutrition && (
        <div className="custom-modal">
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content shadow-lg">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    Hồ sơ dinh dưỡng - {personalInfo.ho_ten}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedNutrition(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <span className="badge bg-secondary me-2">
                      Ngày: {selectedNutrition.thoi_gian_tao}
                    </span>
                    <span className="badge bg-warning text-dark">
                      Chuyên gia: {selectedNutrition.chuyen_gia}
                    </span>
                  </div>

                  <h6>Thông tin cá nhân</h6>
                  <ul>
                    <li>SĐT: {personalInfo.sdt}</li>
                    <li>Tuổi: {personalInfo.tuoi}</li>
                    <li>Giới tính: {personalInfo.gioi_tinh}</li>
                    <li>Dân tộc: {personalInfo.dan_toc}</li>
                    <li>BHYT: {personalInfo.BHYT}</li>
                    <li>Địa chỉ: {personalInfo.dia_chi}</li>
                  </ul>

                  <h6>Thăm dò chức năng</h6>
                  <table className="table table-sm table-bordered">
                    <tbody>
                      {Object.entries(selectedNutrition.tham_do_chuc_nang).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td>
                              <strong>{fieldLabels[key] || key}</strong>
                            </td>
                            <td>{value}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  <h6>Kết quả cận lâm sàng</h6>
                  <p>{selectedNutrition.ket_qua_cls}</p>

                  <h6>Chẩn đoán</h6>
                  <p>{selectedNutrition.chuan_doan}</p>

                  <h6>Kế hoạch dinh dưỡng</h6>
                  <p>{selectedNutrition.dieu_tri}</p>

                  <h6>Nhu cầu calo</h6>
                  <p>{selectedNutrition.calories}</p>

                  <h6>Thực đơn mẫu</h6>
                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th>Buổi</th>
                        <th>Thực đơn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedNutrition.menu).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  <h6>Chăm sóc & Ghi chú</h6>
                  <p>
                    <strong>Chăm sóc:</strong> {selectedNutrition.cham_soc}
                  </p>
                  <p>
                    <strong>Ghi chú:</strong> {selectedNutrition.ghi_chu}
                  </p>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
