import React, { useState } from "react";
import "./appointments.css";

const Appointments = () => {
  const [selectedTab, setSelectedTab] = useState("kham"); // mặc định

  // State cho lịch hẹn khám bệnh
  const [lichHenKhamBenh, setLichHenKhamBenh] = useState([
    {
      id: 1,
      ngay_kham: "2025-10-05",
      gio_bat_dau: "08:00",
      gio_ket_thuc: "08:30",
      ten_bac_si: "BS. Nguyễn Văn B",
      ten_chuyen_khoa: "Nội tiết",
      loai_hen: "Khám mới",
      trang_thai: "Đã xác nhận",
    },
    {
      id: 2,
      ngay_kham: "2025-10-10",
      gio_bat_dau: "09:00",
      gio_ket_thuc: "09:30",
      ten_bac_si: "BS. Trần Thị C",
      ten_chuyen_khoa: "Tim mạch",
      loai_hen: "Tái khám",
      trang_thai: "Chờ xác nhận",
    },
  ]);

  // State cho lịch hẹn dinh dưỡng
  const [lichHenDinhDuong, setLichHenDinhDuong] = useState([
    {
      id: 1,
      ngay_kham: "2025-10-07",
      gio_bat_dau: "14:00",
      gio_ket_thuc: "14:45",
      ten_chuyen_gia: "CG. Lê Thị D",
      loai_dinh_duong: "Tư vấn giảm cân",
      loai_hen: "Online",
      trang_thai: "Đã xác nhận",
    },
    {
      id: 2,
      ngay_kham: "2025-10-12",
      gio_bat_dau: "10:00",
      gio_ket_thuc: "10:30",
      ten_chuyen_gia: "CG. Phạm Văn E",
      loai_dinh_duong: "Kiểm soát tiểu đường",
      loai_hen: "Trực tiếp",
      trang_thai: "Chờ xác nhận",
    },
  ]);

  // Hàm hủy lịch hẹn
  const handleCancel = (id, type) => {
    const today = new Date();

    const updateList = (list, setList) => {
      const newList = list.map((item) => {
        if (item.id === id) {
          const appointmentDate = new Date(item.ngay_kham);
          const diffTime = appointmentDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 2) {
            alert("✅ Hủy lịch thành công!");
            return { ...item, trang_thai: "Đã hủy" };
          } else {
            alert("❌ Hủy thất bại: Lịch hẹn quá gần, không thể hủy!");
          }
        }
        return item;
      });
      setList(newList);
    };

    if (type === "kham") {
      updateList(lichHenKhamBenh, setLichHenKhamBenh);
    } else {
      updateList(lichHenDinhDuong, setLichHenDinhDuong);
    }
  };

  return (
    <div className="appointments-container">
      {/* Nút chọn loại lịch hẹn */}
      <div className="appointments-buttons">
        <button
          className={selectedTab === "kham" ? "active" : ""}
          onClick={() => setSelectedTab("kham")}
        >
          📅 Lịch Hẹn Khám Bệnh
        </button>
        <button
          className={selectedTab === "dinhduong" ? "active" : ""}
          onClick={() => setSelectedTab("dinhduong")}
        >
          🥗 Lịch Hẹn Tư Vấn Dinh Dưỡng
        </button>
      </div>

      {/* Bảng lịch hẹn khám bệnh */}
      {selectedTab === "kham" && (
        <div>
          <h2>📅 Lịch Hẹn Khám Bệnh</h2>
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Ngày khám</th>
                <th>Thời gian</th>
                <th>Bác sĩ</th>
                <th>Chuyên khoa</th>
                <th>Loại hẹn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lichHenKhamBenh.map((item) => (
                <tr key={item.id}>
                  <td>{item.ngay_kham}</td>
                  <td>
                    {item.gio_bat_dau} - {item.gio_ket_thuc}
                  </td>
                  <td>{item.ten_bac_si}</td>
                  <td>{item.ten_chuyen_khoa}</td>
                  <td>{item.loai_hen}</td>
                  <td
                    className={
                      item.trang_thai === "Đã xác nhận"
                        ? "confirmed"
                        : item.trang_thai === "Đã hủy"
                          ? "canceled"
                          : "pending"
                    }
                  >
                    {item.trang_thai}
                  </td>
                  <td>
                    {item.trang_thai !== "Đã hủy" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(item.id, "kham")}
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bảng lịch hẹn dinh dưỡng */}
      {selectedTab === "dinhduong" && (
        <div>
          <h2>🥗 Lịch Hẹn Tư Vấn Dinh Dưỡng</h2>
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Ngày khám</th>
                <th>Thời gian</th>
                <th>Chuyên gia</th>
                <th>Loại tư vấn</th>
                <th>Loại hẹn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lichHenDinhDuong.map((item) => (
                <tr key={item.id}>
                  <td>{item.ngay_kham}</td>
                  <td>
                    {item.gio_bat_dau} - {item.gio_ket_thuc}
                  </td>
                  <td>{item.ten_chuyen_gia}</td>
                  <td>{item.loai_dinh_duong}</td>
                  <td>{item.loai_hen}</td>
                  <td
                    className={
                      item.trang_thai === "Đã xác nhận"
                        ? "confirmed"
                        : item.trang_thai === "Đã hủy"
                          ? "canceled"
                          : "pending"
                    }
                  >
                    {item.trang_thai}
                  </td>
                  <td>
                    {item.trang_thai !== "Đã hủy" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(item.id, "dinhduong")}
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;
