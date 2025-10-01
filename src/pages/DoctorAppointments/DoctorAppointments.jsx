import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorAppointments.css";

const mockAppointments = [
  {
    id: 1,
    thoi_gian: "08:00 01/10/2025",
    ly_do_kham: "Khám tổng quát",
    trang_thai: "Chờ khám",
    benhNhan: {
      ho_ten: "Nguyễn Văn A",
      tuoi: 30,
      nam_sinh: 1995,
      gioi_tinh: "Nam",
      so_dien_thoai: "0912345678",
    },
    dich_vu_kham: "Khám tổng quát",
    chuyen_khoa: "Nội tổng hợp",
    ngay_kham: "01/10/2025",
    khung_gio: "08:00 - 09:00",
    mo_ta_van_de: "Đau đầu, mệt mỏi",
    trang_thai_ho_so: "Đã có hồ sơ",
    id_ho_so: 101,
  },
  {
    id: 2,
    thoi_gian: "09:00 01/10/2025",
    ly_do_kham: "Khám dinh dưỡng",
    trang_thai: "Chờ khám",
    benhNhan: {
      ho_ten: "Trần Thị B",
      tuoi: 25,
      nam_sinh: 2000,
      gioi_tinh: "Nữ",
      so_dien_thoai: "0987654321",
    },
    dich_vu_kham: "Tư vấn dinh dưỡng",
    chuyen_khoa: "Dinh dưỡng",
    ngay_kham: "01/10/2025",
    khung_gio: "09:00 - 10:00",
    mo_ta_van_de: "Muốn tăng cân",
    trang_thai_ho_so: "Chưa có hồ sơ",
    id_ho_so: null,
  },
];

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [hasMedicalRecord, setHasMedicalRecord] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setAppointments(mockAppointments);
    setFilteredAppointments(mockAppointments);
  }, []);

  useEffect(() => {
    let filtered = appointments;
    if (searchName.trim()) {
      filtered = filtered.filter(item =>
        item.benhNhan.ho_ten.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }
    if (searchDate.trim()) {
      filtered = filtered.filter(item =>
        item.ngay_kham === searchDate
      );
    }
    setFilteredAppointments(filtered);
  }, [searchName, searchDate, appointments]);

  const handleSelect = (item) => {
    setSelected(item);
    setPatientInfo(item.benhNhan);
    setAppointmentInfo(item);
    setHasMedicalRecord(item.trang_thai_ho_so === "Đã có hồ sơ");
    setShowCreateModal(false);
  };

  const handleViewMedicalRecord = () => {
    if (hasMedicalRecord) {
      navigate(`/medical-records/${selected.id_ho_so}`);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleFinishAppointment = () => {
    alert("Đã kết thúc khám! (Chức năng cập nhật trạng thái sẽ kết nối API sau)");
    setSelected(null);
  };

  return (
    <div className="doctor-appointments-container">
      <h2>Lịch hẹn của bác sĩ</h2>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />
      </div>
      <div className="table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên bệnh nhân</th>
              <th>Thời gian</th>
              <th>Lý do khám</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((item, idx) => (
              <tr
                key={item.id}
                className={selected?.id === item.id ? "selected-row" : ""}
                onClick={() => handleSelect(item)}
                style={{ cursor: "pointer" }}
              >
                <td>{idx + 1}</td>
                <td>{item.benhNhan?.ho_ten}</td>
                <td>{item.thoi_gian}</td>
                <td>{item.ly_do_kham}</td>
                <td>{item.trang_thai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="appointment-detail-card">
          <div className="info-columns">
            <div className="left-info">
              <h3>Thông tin bệnh nhân</h3>
              <div className="info-group">
                <span><b>Tên:</b> {patientInfo?.ho_ten}</span>
                <span><b>Tuổi:</b> {patientInfo?.tuoi}</span>
                <span><b>Năm sinh:</b> {patientInfo?.nam_sinh}</span>
                <span><b>Giới tính:</b> {patientInfo?.gioi_tinh}</span>
                <span><b>Số điện thoại:</b> {patientInfo?.so_dien_thoai}</span>
              </div>
            </div>
            <div className="right-info">
              <h3>Thông tin hẹn khám</h3>
              <div className="info-group">
                <span><b>Dịch vụ khám:</b> {appointmentInfo?.dich_vu_kham}</span>
                <span><b>Chuyên khoa:</b> {appointmentInfo?.chuyen_khoa}</span>
                <span><b>Ngày khám:</b> {appointmentInfo?.ngay_kham}</span>
                <span><b>Khung giờ:</b> {appointmentInfo?.khung_gio}</span>
                <span><b>Mô tả vấn đề sức khỏe:</b> {appointmentInfo?.mo_ta_van_de}</span>
              </div>
              <div className="record-status">
                <b>Trạng thái hồ sơ:</b>{" "}
                {hasMedicalRecord ? (
                  <button onClick={handleViewMedicalRecord}>Xem hồ sơ</button>
                ) : (
                  <button onClick={handleViewMedicalRecord}>Tạo hồ sơ</button>
                )}
              </div>
              <button className="finish-btn" onClick={handleFinishAppointment}>
                Kết thúc khám
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Tạo hồ sơ bệnh nhân</h3>
            <p>Chức năng tạo hồ sơ sẽ bổ sung sau.</p>
            <button onClick={() => setShowCreateModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;