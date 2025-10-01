import React from "react";
import "./DoctorMedicalRecords.css";

const DoctorMedicalRecords = () => {
  // Data ảo để demo
  const records = [
    { id: "HS001", name: "Nguyễn Văn A", diagnosis: "Viêm họng cấp" },
    { id: "HS002", name: "Trần Thị B", diagnosis: "Viêm phế quản" },
    { id: "HS003", name: "Lê Văn C", diagnosis: "Đau dạ dày" },
  ];

  return (
    <div className="doctor-medical-records container py-5">
      <h2 className="text-center fw-bold mb-4 text-primary">
        Hồ sơ bệnh án điện tử
      </h2>

      <div className="table-responsive">
        <table className="table table-bordered table-striped custom-table">
          <thead className="table-header">
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Họ tên bệnh nhân</th>
              <th scope="col">Chuẩn đoán</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id}>
                <td>{index + 1}</td>
                <td>{record.name}</td>
                <td>{record.diagnosis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorMedicalRecords;
