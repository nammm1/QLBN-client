import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";

const DoctorRecordDetail = () => {
  const { id_ho_so } = useParams(); // id hồ sơ / cuộc hẹn
  const [record, setRecord] = useState(null);
  const [benhNhanFull, setBenhNhanFull] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lichSu, setLichSu] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // gọi API lấy hồ sơ bệnh án
        const data = await apiHoSoKhamBenh.getById(id_ho_so);
        console.log(data);
        setRecord(data);
        const bnFull = await apiBenhNhan.getById(data.id_benh_nhan);
        console.log(bnFull);
        setBenhNhanFull(bnFull);
        const ls = await apiCuocHenKham.getLichSuByBenhNhan(data.id_benh_nhan);
        console.log(ls);
        setLichSu(ls);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_ho_so]);

  if (loading) return <p>Đang tải...</p>;
  if (!record) return <p>Không tìm thấy hồ sơ.</p>;

  return (
    <div className="doctor-appointment-detail-container">
      <h2>Chi tiết hồ sơ khám bệnh</h2>

      {/* Thông tin bệnh nhân */}
      <div className="section-card">
        <h3>Thông tin bệnh nhân</h3>
        <p><strong>Họ tên:</strong> {record.ho_ten}</p>
        <p><strong>Giới tính:</strong> {record.gioi_tinh}</p>
        <p><strong>Tuổi:</strong> {record.tuoi}</p>
        <p><strong>Số điện thoại:</strong> {record.so_dien_thoai}</p>
        <p><strong>Địa chỉ:</strong> {record.dia_chi}</p>
        <p><strong>Mã BHYT:</strong> {record.ma_BHYT}</p>
      </div>

      {/* Hồ sơ bệnh án */}
      <div className="section-card">
        <h3>Hồ sơ bệnh án</h3>
        <p><strong>Ngày tạo:</strong> {new Date(record.thoi_gian_tao).toLocaleDateString("vi-VN")}</p>
        <p><strong>Lý do khám:</strong> {record.ly_do_kham}</p>
        <p><strong>Chẩn đoán:</strong> {record.chuan_doan}</p>
        <p><strong>Kết quả CLS:</strong> {record.ket_qua_cls || "Không có"}</p>
        <p><strong>Điều trị:</strong> {record.dieu_tri}</p>
        <p><strong>Chăm sóc:</strong> {record.cham_soc}</p>
        <p><strong>Ghi chú:</strong> {record.ghi_chu}</p>
      </div>

      {/* Lịch sử hóa đơn */}

    </div>
  );
};

export default DoctorRecordDetail;
