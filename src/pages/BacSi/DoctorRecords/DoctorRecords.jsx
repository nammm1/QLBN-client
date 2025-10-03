import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import "../Appointments/DoctorAppointments.css"; 

const DoctorRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await apiHoSoKhamBenh.getAll();
        setRecords(data);
        setFilteredRecords(data);
      } catch (error) {
        console.error("Lỗi khi lấy hồ sơ:", error);
      }
    };
    fetchRecords();
  }, []);

  // 🔹 Filter
  useEffect(() => {
    let filtered = records;

    if (searchName.trim()) {
      filtered = filtered.filter((item) =>
        item.benhNhan?.ho_ten
          ?.toLowerCase()
          .includes(searchName.trim().toLowerCase())
      );
    }

    if (searchDate.trim()) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.ngay_tao);
        const itemDateStr =
          itemDate.getFullYear() +
          "-" +
          String(itemDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(itemDate.getDate()).padStart(2, "0");
        return itemDateStr === searchDate;
      });
    }

    if (searchStatus.trim()) {
      filtered = filtered.filter((item) => item.trang_thai === searchStatus);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchName, searchDate, searchStatus, records]);

  const handleSelect = (id_ho_so) => {
    navigate(`/doctor/record/${id_ho_so}`);
  };

  // phân trang
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredRecords.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  return (
    <div className="doctor-appointments-container">
      <h2>Hồ sơ bệnh án</h2>

      {/* Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="dang_dieu_tri">Đang điều trị</option>
          <option value="da_ket_thuc">Đã kết thúc</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Mã hồ sơ</th>
              <th>Tên bệnh nhân</th>
              <th>Số điện thoại</th>
              <th>Tuổi</th>
              <th>Giới tính</th>
              <th>Ngày tạo</th>
              <th>Chẩn đoán</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item) => (
              <tr
                key={item.id_ho_so}
                onClick={() => handleSelect(item.id_ho_so)}
                style={{ cursor: "pointer" }}
              >
                <td>{item.id_ho_so}</td>
                <td>{item.ho_ten}</td>
                <td>{item.so_dien_thoai}</td>
                <td>{item.tuoi}</td>
                <td>{item.gioi_tinh}</td>
                <td>
                  {item.thoi_gian_tao
                    ? new Date(item.thoi_gian_tao).toLocaleDateString("vi-VN")
                    : "N/A"}
                </td>
                <td>{item.chuan_doan ? item.chuan_doan.slice(0, 50) + "..." : "..."}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="pagination" style={{ marginTop: "20px" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={page === currentPage ? "active" : ""}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DoctorRecords;
