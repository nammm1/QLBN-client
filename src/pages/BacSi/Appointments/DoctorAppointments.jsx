import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorAppointments.css";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // số dòng mỗi trang

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

  // 🔹 Filter theo tên, ngày, trạng thái
  useEffect(() => {
    let filtered = appointments;

    if (searchName.trim()) {
      filtered = filtered.filter(item =>
        item.benhNhan?.ho_ten?.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }

    if (searchDate.trim()) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.ngay_kham);
        const itemDateStr = itemDate.getFullYear() + "-" +
          String(itemDate.getMonth() + 1).padStart(2, "0") + "-" +
          String(itemDate.getDate()).padStart(2, "0");
        return itemDateStr === searchDate;
      });
    }

    if (searchStatus.trim()) {
      filtered = filtered.filter(item => item.trang_thai === searchStatus);
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1); // reset về trang 1 mỗi khi filter
  }, [searchName, searchDate, searchStatus, appointments]);

  const handleSelect = (id_cuoc_hen) => {
    navigate(`/doctor/appointment/${id_cuoc_hen}`);
  };

  // Lấy dữ liệu theo trang
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredAppointments.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);

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
        <select
          value={searchStatus}
          onChange={e => setSearchStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="da_dat">Đã đặt</option>
          <option value="da_huy">Đã hủy</option>
          <option value="da_hoan_thanh">Đã hoàn thành</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Mã BN</th>
              <th>Tên bệnh nhân</th>
              <th>Giới tính</th>
              <th>SĐT</th>
              <th>Ngày khám</th>
              <th>Giờ khám</th>
              <th>Lý do khám</th>
              <th>Trạng thái</th>
              <th>Mã BHYT</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map(item => (
              <tr
                key={item.id_cuoc_hen}
                onClick={() => handleSelect(item.id_cuoc_hen)}
                style={{ cursor: "pointer" }}
              >
                <td>{item.benhNhan?.id_benh_nhan || "Không"}</td>
                <td>{item.benhNhan?.ho_ten || "Không"}</td>
                <td>{item.benhNhan?.gioi_tinh || "Không"}</td>
                <td>{item.benhNhan?.so_dien_thoai || "Không"}</td>
                <td>{new Date(item.ngay_kham).toLocaleDateString("vi-VN")}</td>
                <td>
                  {item.khungGio
                    ? `${item.khungGio.gio_bat_dau} - ${item.khungGio.gio_ket_thuc}`
                    : "Không"}
                </td>
                <td>{item.ly_do_kham}</td>
                <td
                  style={{
                    color:
                      item.trang_thai === "da_dat" ? "green" :
                      item.trang_thai === "da_huy" ? "red" :
                      item.trang_thai === "da_hoan_thanh" ? "blue" :
                      "black"
                  }}
                >
                  {{
                    da_dat: "Đã đặt",
                    da_huy: "Đã hủy",
                    da_hoan_thanh: "Đã hoàn thành",
                  }[item.trang_thai] || "N/A"}
                </td>
                <td>{item.benhNhan?.ma_BHYT || "Không"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination" style={{ textAlign: "center", marginTop: "20px" }}>
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    style={{
      marginRight: "5px",
      padding: "5px 10px",
      cursor: currentPage === 1 ? "not-allowed" : "pointer",
      backgroundColor: currentPage === 1 ? "#eee" : "#f0f0f0",
    }}
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      style={{
        margin: "0 3px",
        padding: "5px 10px",
        backgroundColor: page === currentPage ? "#007bff" : "#f0f0f0",
        color: page === currentPage ? "#fff" : "#000",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {page}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    style={{
      marginLeft: "5px",
      padding: "5px 10px",
      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
      backgroundColor: currentPage === totalPages ? "#eee" : "#f0f0f0",
    }}
  >
    Next
  </button>
</div>

    </div>
  );
};

export default DoctorAppointments;
