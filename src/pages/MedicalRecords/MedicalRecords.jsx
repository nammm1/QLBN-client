import React, { useState } from "react";
import "./MedicalRecords.css";

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState("benh-an"); // mặc định tab bệnh án

  // dữ liệu giả (sau này sẽ lấy từ API)
  const medicalData = [
    { id: 1, date: "2024-10-01", doctor: "BS. Nguyễn Văn A", diagnosis: "Viêm họng", notes: "Uống thuốc 5 ngày" },
    { id: 2, date: "2024-11-15", doctor: "BS. Trần Văn B", diagnosis: "Cảm cúm", notes: "Nghỉ ngơi, uống vitamin C" },
  ];

  const nutritionData = [
    { id: 1, date: "2024-09-20", expert: "CN. Lê Thị C", plan: "Chế độ ăn giàu protein", notes: "Bổ sung rau xanh" },
    { id: 2, date: "2024-12-05", expert: "CN. Phạm Văn D", plan: "Giảm tinh bột", notes: "Tăng tập luyện" },
  ];

  return (
    <div className="container py-5 medical-records">
      <h2 className="text-center mb-4 fw-bold">Hồ sơ bệnh án điện tử</h2>

      {/* Tabs */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn mx-2 ${activeTab === "benh-an" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("benh-an")}
        >
          Hồ sơ bệnh án
        </button>
        <button
          className={`btn mx-2 ${activeTab === "dinh-duong" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("dinh-duong")}
        >
          Hồ sơ dinh dưỡng
        </button>
      </div>

      {/* Bảng dữ liệu */}
      {activeTab === "benh-an" ? (
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>Ngày khám</th>
              <th>Bác sĩ</th>
              <th>Chẩn đoán</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {medicalData.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td>{record.doctor}</td>
                <td>{record.diagnosis}</td>
                <td>{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>Ngày tư vấn</th>
              <th>Chuyên gia</th>
              <th>Kế hoạch dinh dưỡng</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {nutritionData.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td>{record.expert}</td>
                <td>{record.plan}</td>
                <td>{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MedicalRecords;
