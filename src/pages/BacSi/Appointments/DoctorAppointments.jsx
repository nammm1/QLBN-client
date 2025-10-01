import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorAppointments.css";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // 🔹 Load danh sách lịch hẹn của bác sĩ
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await apiCuocHenKham.getByBacSi(userInfo.user.id_nguoi_dung);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  // 🔹 Filter theo tên và ngày
  useEffect(() => {
    let filtered = appointments;

    if (searchName.trim()) {
      filtered = filtered.filter(item =>
        item.benhNhan?.ho_ten?.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }

    if (searchDate.trim()) {
      filtered = filtered.filter(
        item => item.ngay_kham.split("T")[0] === searchDate
      );
    }

    setFilteredAppointments(filtered);
  }, [searchName, searchDate, appointments]);

  // 🔹 Chọn 1 lịch hẹn -> chuyển sang trang chi tiết
  const handleSelect = (id) => {
    navigate(`/appointment/${id}`);
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
              <th>Ngày khám</th>
              <th>Giờ khám</th>
              <th>Lý do khám</th>
              <th>Trạng thái</th>
              <th>Mã BHYT</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((item, idx) => (
              <tr
                key={item.id_cuoc_hen}
                onClick={() => handleSelect(item.id_cuoc_hen)}
                style={{ cursor: "pointer" }}
              >
                <td>{idx + 1}</td>
                <td>{item.benhNhan?.ho_ten || "N/A"}</td>
                <td>{new Date(item.ngay_kham).toLocaleDateString("vi-VN")}</td>
                <td>
                  {item.khungGio
                    ? `${item.khungGio.gio_bat_dau} - ${item.khungGio.gio_ket_thuc}`
                    : "N/A"}
                </td>
                <td>{item.ly_do_kham}</td>
                <td>{item.trang_thai}</td>
                <td>{item.benhNhan?.ma_BHYT || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorAppointments;
