import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan"; 
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiLichSuKham from "../../../api/LichSuKham"; 
import apiDonThuoc from "../../../api/DonThuoc";
import apiThuoc from "../../../api/Thuoc";
import apiHoaDon from "../../../api/HoaDon";
import apiDichVu from "../../../api/DichVu";
import { calculateAge } from "../../../utils/calculateAge";
import { Select, Button } from "antd";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "./AppointmentDetail.css";

const DoctorAppointmentDetail = () => {
  const { id_cuoc_hen } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [benhNhanFull, setBenhNhanFull] = useState(null);
  const [hoSo, setHoSo] = useState(null); // Hồ sơ hành chính
  const [lichSuKhamHienTai, setLichSuKhamHienTai] = useState(null); // Lịch sử khám cho lần này
  const [lichSuKhamTruoc, setLichSuKhamTruoc] = useState([]); // Các lần khám trước
  
  const [dsThuoc, setDsThuoc] = useState([]);
  const [donThuocTamThoi, setDonThuocTamThoi] = useState([]);
  const [ghiChuDonThuoc, setGhiChuDonThuoc] = useState("");

  const [dsDichVu, setDsDichVu] = useState([]);
  const [dichVuTamThoi, setDichVuTamThoi] = useState([]);

  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalHoSoCreateOpen, setModalHoSoCreateOpen] = useState(false);
  const [modalHoSoViewOpen, setModalHoSoViewOpen] = useState(false);
  const [modalLichSuCreateOpen, setModalLichSuCreateOpen] = useState(false);
  const [modalLichSuViewOpen, setModalLichSuViewOpen] = useState(false);
  const [modalDonThuoc, setModalDonThuoc] = useState(false);
  const [modalDichVu, setModalDichVu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formDataHoSo, setFormDataHoSo] = useState({});
  const [formDataLichSu, setFormDataLichSu] = useState({});

  const handleSubmitHoSo = async () => {
    try {
      if (!hoSo) {
        // Tạo mới hồ sơ
        const newHoSo = await apiHoSoKhamBenh.create({
          id_benh_nhan: benhNhanFull.data.id_benh_nhan,
          id_bac_si_tao: userInfo.user.id_nguoi_dung,
          ...formDataHoSo  // Sửa thành formDataHoSo
        });
        setHoSo(newHoSo);
        setModalHoSoCreateOpen(false);  // Sửa thành modalHoSoCreateOpen
      } else {
        // Cập nhật hồ sơ
        await apiHoSoKhamBenh.update(hoSo.id_ho_so, formDataHoSo);  // Sửa thành formDataHoSo
        const updated = await apiHoSoKhamBenh.getByBenhNhan(benhNhanFull.data.id_benh_nhan);
        setHoSo(updated);
        setModalHoSoViewOpen(false);  // Sửa thành modalHoSoViewOpen
      }
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
    }
  };
  // Lấy danh sách dịch vụ
  const handleOpenDichVu = async () => {
    try {
      const res = await apiDichVu.getAll();
      setDsDichVu(res.data || []);
      setModalDichVu(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Lấy danh sách thuốc
  const handleOpenDonThuoc = async () => {
    try {
      const res = await apiThuoc.getAllThuoc();
      setDsThuoc(res || []);
      setModalDonThuoc(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveThuoc = (index) => {
    setDonThuocTamThoi(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDichVu = (index) => {
    setDichVuTamThoi(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddThuocRow = () => {
    setDonThuocTamThoi([...donThuocTamThoi, { id_thuoc: "", so_luong: 1, lieu_dung: "", tan_suat: "", ghi_chu: "" }]);
  };

  const handleAddDichVuRow = () => {
    setDichVuTamThoi([...dichVuTamThoi, { id_dich_vu: "", so_luong: 1, don_gia: 0 }]);
  };

  const handleChangeDichVu = (index, field, value) => {
    const updated = [...dichVuTamThoi];
    updated[index][field] = value;

    if (field === "id_dich_vu") {
      const selected = dsDichVu.find((dv) => dv.id_dich_vu === value);
      if (selected) updated[index] = { ...updated[index], don_gia: selected.don_gia || 0, ten_dich_vu: selected.ten_dich_vu };
    }

    setDichVuTamThoi(updated);
  };

  const handleChangeThuoc = (index, field, value) => {
    const updated = [...donThuocTamThoi];
    updated[index][field] = value;
    if (field === "id_thuoc") {
      const selected = dsThuoc.find(t => t.id_thuoc === value);
      if (selected) {
        updated[index] = { ...updated[index], don_gia: selected.don_gia || 0, ten_thuoc: selected.ten_thuoc, ham_luong: selected.ham_luong };
      }
    }
    setDonThuocTamThoi(updated);
  };

  const handleExportPdf = async () => {
    try {
      // Tạo đơn thuốc nếu có
      if (donThuocTamThoi.length > 0 && donThuocTamThoi[0].id_thuoc) {
        await apiDonThuoc.create({
          id_ho_so: hoSo?.id_ho_so, 
          ghi_chu: ghiChuDonThuoc || "",
          trang_thai: "dang_su_dung",
          chi_tiet: donThuocTamThoi
        });
      }

      // Tạo hóa đơn nếu có dịch vụ
      if (dichVuTamThoi.length > 0 && dichVuTamThoi[0].id_dich_vu) {
        const tong_tien = dichVuTamThoi.reduce(
          (sum, dv) => sum + dv.so_luong * dv.don_gia,
          0
        );
        await apiHoaDon.create({
          id_cuoc_hen_kham: id_cuoc_hen,
          tong_tien,
          chi_tiet: dichVuTamThoi,
        });
      }

      // Cập nhật trạng thái cuộc hẹn
      await apiCuocHenKham.updateTrangThai(id_cuoc_hen, { trang_thai: "da_hoan_thanh" });

      // Xuất PDF
      const input = document.getElementById("invoicePreview");
      if (!input) return;

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,     
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = {
        width: pdfWidth,
        height: (canvas.height * pdfWidth) / canvas.width,
      };

      let position = 0;
      if (imgProps.height <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgProps.width, imgProps.height);
      } else {
        let heightLeft = imgProps.height;
        let y = 0;
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, y, imgProps.width, imgProps.height);
          heightLeft -= pdfHeight;
          y -= pdfHeight;
          if (heightLeft > 0) pdf.addPage();
        }
      }

      pdf.save(`HoaDon_${id_cuoc_hen}.pdf`);
      navigate(`/doctor/appointments`);

    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
    }
  };

  const handleFinish = async () => {
    try {
      setShowPreview(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appt = await apiCuocHenKham.getById(id_cuoc_hen);
        setAppointment(appt);

        if (appt?.id_benh_nhan) {
          const bnFull = await apiBenhNhan.getById(appt.id_benh_nhan);
          setBenhNhanFull(bnFull);

          const hs = await apiHoSoKhamBenh.getByBenhNhan(appt.id_benh_nhan);
          setHoSo(hs);

          const lichSuTruoc = await apiLichSuKham.getLichSuKhamByBenhNhan(appt.id_benh_nhan);
          setLichSuKhamTruoc(lichSuTruoc || []);

          if (appt.id_lich_su_kham) {
            const lichSuHienTai = await apiLichSuKham.getLichSuKhamById(appt.id_lich_su_kham);
            setLichSuKhamHienTai(lichSuHienTai);
            
            // Nếu cuộc hẹn đã hoàn thành, load dữ liệu thuốc và dịch vụ
            if (appt.trang_thai === "da_hoan_thanh") {
              // Load đơn thuốc
              const donThuocData = await apiDonThuoc.getByLichSuKham(appt.id_lich_su_kham);
              
              if (donThuocData) {
                setDonThuocTamThoi(donThuocData.chi_tiet || []);
                setGhiChuDonThuoc(donThuocData.ghi_chu || "");
              }

              // Load dịch vụ
              const hoaDonData = await apiHoaDon.getByLichSuKham(appt.id_lich_su_kham);
              if (hoaDonData) {
                setDichVuTamThoi(hoaDonData.chi_tiet || []);
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_cuoc_hen]);

  if (loading) return <p>Đang tải thông tin cuộc hẹn...</p>;
  if (!appointment) return <p>Không tìm thấy cuộc hẹn</p>;

  const { khungGio } = appointment;

  const handleSubmitLichSuKham = async () => {
    try {
      if (!lichSuKhamHienTai) {
        const newLichSu = await apiLichSuKham.createLichSuKham({
          id_benh_nhan: benhNhanFull.data.id_benh_nhan,
          id_bac_si: userInfo.user.id_nguoi_dung,
          id_cuoc_hen: id_cuoc_hen,
          id_ho_so : hoSo?.id_ho_so,
          ...formDataLichSu
        });
        setLichSuKhamHienTai(newLichSu);
      } else {
        await apiLichSuKham.updateLichSuKham(lichSuKhamHienTai.id_lich_su, formDataLichSu);
        const updated = await apiLichSuKham.getLichSuKhamById(lichSuKhamHienTai.id_lich_su);
        setLichSuKhamHienTai(updated);
      }
      setModalLichSuCreateOpen(false);
      setModalLichSuViewOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary me-3 d-flex align-items-center" 
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"> &lt;</i>
        </button>
        <h2 className="mb-0 title-align">Chi tiết cuộc hẹn</h2>
      </div>

      {/* === Thông tin bệnh nhân (Hồ sơ hành chính) - Có thể chỉnh sửa === */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span>Thông tin bệnh nhân</span>
          {hoSo ? (
            <button className="btn btn-sm btn-outline-light" onClick={() => setModalHoSoViewOpen(true)}>
              Chỉnh sửa hồ sơ
            </button>
          ) : (
            <button className="btn btn-sm btn-outline-light" onClick={() => setModalHoSoCreateOpen(true)}>
              Tạo hồ sơ
            </button>
          )}
        </div>
        <div className="card-body">
          {hoSo ? (
            // Hiển thị thông tin hồ sơ đã có
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-secondary">Thông tin cá nhân</h6>
                <p><strong>Mã BN:</strong> {benhNhanFull?.data.id_benh_nhan || "Không"}</p>
                <p><strong>Họ tên:</strong> {hoSo.ho_ten || "Không"}</p>
                <p><strong>Giới tính:</strong> {hoSo.gioi_tinh || "Không"}</p>
                <p><strong>Tuổi:</strong> {hoSo.tuoi || "Không"}</p>
                <p><strong>SĐT:</strong> {hoSo.so_dien_thoai || "Không"}</p>
              </div>
              <div className="col-md-6">
                <h6 className="text-secondary">Thông tin khác</h6>
                <p><strong>Dân tộc:</strong> {hoSo.dan_toc || "Không"}</p>
                <p><strong>Mã BHYT:</strong> {hoSo.ma_BHYT || "Không"}</p>
                <p><strong>Địa chỉ:</strong> {hoSo.dia_chi || "Không"}</p>
                <p><strong>Ngày tạo:</strong> {hoSo.created_at ? new Date(hoSo.created_at).toLocaleDateString("vi-VN") : "Không"}</p>
              </div>
            </div>
          ) : (
            // Thông báo chưa có hồ sơ
            <div className="text-center py-4">
              <p className="text-muted">Chưa có hồ sơ bệnh nhân</p>
              <button className="btn btn-primary" onClick={() => setModalHoSoCreateOpen(true)}>
                Tạo hồ sơ ngay
              </button>
            </div>
          )}
        </div>
      </div>
        
      {/* === Modal tạo hồ sơ === */}
      {modalHoSoCreateOpen  && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo hồ sơ bệnh nhân</h5>
                <button className="btn-close" onClick={() => setModalHoSoCreateOpen(false)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ tên *</label>
                    <input 
                      className="form-control" 
                      name="ho_ten" 
                      value={formDataHoSo.ho_ten || benhNhanFull?.data.ho_ten || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, ho_ten: e.target.value}))}
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại *</label>
                    <input 
                      className="form-control" 
                      name="so_dien_thoai" 
                      value={formDataHoSo.so_dien_thoai || benhNhanFull?.data.so_dien_thoai || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, so_dien_thoai: e.target.value}))} 
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tuổi *</label>
                    <input 
                      className="form-control" 
                      name="tuoi" 
                      type="number"
                      value={formDataHoSo.tuoi || calculateAge(benhNhanFull?.data.ngay_sinh) || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, tuoi: e.target.value}))}
                      placeholder="Nhập tuổi"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Giới tính *</label>
                    <select 
                      className="form-control" 
                      name="gioi_tinh" 
                      value={formDataHoSo.gioi_tinh || benhNhanFull?.data.gioi_tinh || ""} 
                     onChange={(e) => setFormDataHoSo(prev => ({...prev, gioi_tinh: e.target.value}))}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Dân tộc</label>
                    <input 
                      className="form-control" 
                      name="dan_toc" 
                      value={formDataHoSo.dan_toc || benhNhanFull?.data.dan_toc || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, dan_toc: e.target.value}))}
                      placeholder="Nhập dân tộc"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã BHYT</label>
                    <input 
                      className="form-control" 
                      name="ma_BHYT" 
                      value={formDataHoSo.ma_BHYT || benhNhanFull?.data.ma_BHYT || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, ma_BHYT: e.target.value}))}
                      placeholder="Nhập mã BHYT"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ</label>
                    <input 
                      className="form-control" 
                      name="dia_chi" 
                      value={formDataHoSo.dia_chi || benhNhanFull?.data.dia_chi || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, dia_chi: e.target.value}))}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmitHoSo}>
                  Tạo hồ sơ
                </button>
                <button className="btn btn-secondary" onClick={() => setModalHoSoCreateOpen(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Modal chỉnh sửa hồ sơ === */}
      {hoSo && modalHoSoViewOpen  && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa hồ sơ bệnh nhân</h5>
                <button className="btn-close" onClick={() => setModalHoSoViewOpen(false)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ tên *</label>
                    <input 
                      className="form-control" 
                      name="ho_ten" 
                      value={formDataHoSo.ho_ten || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, ho_ten: e.target.value}))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại *</label>
                    <input 
                      className="form-control" 
                      name="so_dien_thoai" 
                      value={formDataHoSo.so_dien_thoai || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, so_dien_thoai: e.target.value}))} 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tuổi *</label>
                    <input 
                      className="form-control" 
                      name="tuoi" 
                      type="number"
                      value={formDataHoSo.tuoi || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, tuoi: e.target.value}))} 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Giới tính *</label>
                    <select 
                      className="form-control" 
                      name="gioi_tinh" 
                      value={formDataHoSo.gioi_tinh || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, gioi_tinh: e.target.value}))} 
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Dân tộc</label>
                    <input 
                      className="form-control" 
                      name="dan_toc" 
                      value={formDataHoSo.dan_toc || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, dan_toc: e.target.value}))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã BHYT</label>
                    <input 
                      className="form-control" 
                      name="ma_BHYT" 
                      value={formDataHoSo.ma_BHYT || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, ma_BHYT: e.target.value}))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ</label>
                    <input 
                      className="form-control" 
                      name="dia_chi" 
                      value={formDataHoSo.dia_chi || ""} 
                      onChange={(e) => setFormDataHoSo(prev => ({...prev, dia_chi: e.target.value}))} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmitHoSo}>
                  Cập nhật hồ sơ
                </button>
                <button className="btn btn-secondary" onClick={() => setModalHoSoViewOpen(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Thông tin cuộc hẹn === */}
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-info text-white">Thông tin cuộc hẹn</div>
        <div className="card-body">
          <p><strong>Ngày khám:</strong> {new Date(appointment.ngay_kham).toLocaleDateString("vi-VN")}</p>
          <p><strong>Giờ khám:</strong> {khungGio ? `${khungGio.gio_bat_dau} - ${khungGio.gio_ket_thuc}` : "Không"}</p>
          <p><strong>Lý do khám:</strong> {appointment.ly_do_kham || "Không"}</p>
          <p><strong>Trạng thái:</strong> {appointment.trang_thai || "Không"}</p>
        </div>
      </div>

      {appointment.trang_thai === "da_hoan_thanh" && lichSuKhamHienTai && (
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-success text-white">
            Thông tin khám bệnh
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-12 mb-3">
                <label className="fw-bold">Lý do khám:</label>
                <div className="p-2 border rounded bg-light">
                  {lichSuKhamHienTai.ly_do_kham || "Không có"}
                </div>
              </div>
              <div className="col-12 mb-3">
                <label className="fw-bold">Chuẩn đoán:</label>
                <div className="p-2 border rounded bg-light">
                  {lichSuKhamHienTai.chuan_doan || "Không có"}
                </div>
              </div>
              <div className="col-12 mb-3">
                <label className="fw-bold">Kết quả CLS:</label>
                <div className="p-2 border rounded bg-light">
                  {lichSuKhamHienTai.ket_qua_cls || "Không có"}
                </div>
              </div>
              <div className="col-12 mb-3">
                <label className="fw-bold">Điều trị:</label>
                <div className="p-2 border rounded bg-light">
                  {lichSuKhamHienTai.dieu_tri || "Không có"}
                </div>
              </div>
              <div className="col-12 mb-3">
                <label className="fw-bold">Chăm sóc:</label>
                <div className="p-2 border rounded bg-light">
                  {lichSuKhamHienTai.cham_soc || "Không có"}
                </div>
              </div>
              <div className="col-12 mb-3">
                <label className="fw-bold">Ghi chú:</label>
                <div className="p-2 border rounded bg-light">
                  {lichSuKhamHienTai.ghi_chu || "Không có"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Nút tạo / xem lịch sử khám === */}
      {appointment.trang_thai !== "da_hoan_thanh" && (
        <div className="mt-4">
          {lichSuKhamHienTai ? (
            <button className="btn btn-outline-primary me-2" onClick={() => setModalLichSuViewOpen(true)}>
              Xem/Chỉnh sửa thông tin khám
            </button>
          ) : (
            <button className="btn btn-primary me-2" onClick={() => setModalLichSuCreateOpen(true)}>
              Ghi thông tin khám
            </button>
          )}
        </div>
      )}

      {/* === Nút hành động === */}
      {appointment.trang_thai !== "da_hoan_thanh" && (
        <div className="mt-3 d-flex gap-2 flex-wrap">
          <button className="btn btn-warning" onClick={handleOpenDonThuoc}>
            Kê đơn thuốc
          </button>
          <button className="btn btn-secondary" onClick={handleOpenDichVu}>
            Chọn dịch vụ kèm theo
          </button>
          <button className="btn btn-success" onClick={handleFinish}>
            Kết thúc khám / Xuất hóa đơn
          </button>
        </div>
      )}
      {appointment.trang_thai === "da_hoan_thanh" && (
        <>
          {/* Hiển thị dịch vụ đã chọn */}
          {dichVuTamThoi.length > 0 && (
            <div className="card shadow-sm mt-4">
              <div className="card-header bg-secondary text-white">Dịch vụ đã sử dụng</div>
              <div className="card-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Tên DV</th>
                      <th>SL</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dichVuTamThoi.map((d, i) => (
                      <tr key={i}>
                        <td>{d.ten_dich_vu}</td>
                        <td>{d.so_luong}</td>
                        <td>{d.don_gia?.toLocaleString()}</td>
                        <td>{(d.so_luong * d.don_gia)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hiển thị đơn thuốc */}
          {donThuocTamThoi.length > 0 && (
            <div className="card shadow-sm mt-4">
              <div className="card-header bg-warning text-dark">Đơn thuốc</div>
              <div className="card-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Thuốc</th>
                      <th>SL</th>
                      <th>Liều dùng</th>
                      <th>Tần suất</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donThuocTamThoi.map((t, i) => (
                      <tr key={i}>
                        <td>{t.ten_thuoc} ({t.ham_luong})</td>
                        <td>{t.so_luong}</td>
                        <td>{t.lieu_dung}</td>
                        <td>{t.tan_suat}</td>
                        <td>{t.ghi_chu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ghiChuDonThuoc && (
                  <div className="mt-3">
                    <label className="fw-bold">Ghi chú đơn thuốc:</label>
                    <div className="p-2 border rounded bg-light">{ghiChuDonThuoc}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* === Modal tạo lịch sử khám === */}
      {modalLichSuCreateOpen  && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ghi thông tin khám bệnh</h5>
                <button className="btn-close" onClick={() => setModalLichSuCreateOpen(false)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Lý do khám</label>
                    <textarea 
                      className="form-control" 
                      name="ly_do_kham" 
                      value={formDataLichSu.ly_do_kham} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, ly_do_kham: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chuẩn đoán</label>
                    <textarea 
                      className="form-control" 
                      name="chuan_doan" 
                      value={formDataLichSu.chuan_doan} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, chuan_doan: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Kết quả CLS</label>
                    <textarea 
                      className="form-control" 
                      name="ket_qua_cls" 
                      value={formDataLichSu.ket_qua_cls} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, ket_qua_cls: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Điều trị</label>
                    <textarea 
                      className="form-control" 
                      name="dieu_tri" 
                      value={formDataLichSu.dieu_tri} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, dieu_tri: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chăm sóc</label>
                    <textarea 
                      className="form-control" 
                      name="cham_soc" 
                      value={formDataLichSu.cham_soc} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, cham_soc: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea 
                      className="form-control" 
                      name="ghi_chu" 
                      value={formDataLichSu.ghi_chu} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, ghi_chu: e.target.value}))}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmitLichSuKham}>
                  Lưu thông tin khám
                </button>
                <button className="btn btn-secondary" onClick={() => setModalLichSuCreateOpen(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalDichVu && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm dịch vụ vào hóa đơn</h5>
                <button className="btn-close" onClick={() => setModalDichVu(false)}></button>
              </div>
              <div className="modal-body">
                {dichVuTamThoi.map((row, i) => (
                  <div key={i} className="row g-2 align-items-center mb-2">
                    {/* Dịch vụ */}
                    <div className="col-md-5">
                      <Select
                        showSearch
                        style={{ width: "100%" }}  
                        size="large"
                        placeholder="Chọn dịch vụ"
                        value={row.id_dich_vu}
                        onChange={(value) => handleChangeDichVu(i, "id_dich_vu", value)}
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={dsDichVu.map(dv => ({
                          value: dv.id_dich_vu,
                          label: `${dv.ten_dich_vu} - ${dv.don_gia} VNĐ`
                        }))}
                      />
                    </div>
                      
                    {/* Số lượng */}
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="SL"
                        value={row.so_luong}
                        onChange={(e) => handleChangeDichVu(i, "so_luong", e.target.value)}
                      />
                    </div>
                      
                    {/* Đơn giá */}
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Đơn giá"
                        value={row.don_gia}
                        onChange={(e) => handleChangeDichVu(i, "don_gia", e.target.value)}
                      />
                    </div>
                      
                    {/* Thành tiền */}
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        value={row.so_luong * row.don_gia}
                        readOnly
                      />
                    </div>
                    <div className="col-md-1">
                      <Button 
                        danger 
                        onClick={() => handleRemoveDichVu(i)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ))}

                <button className="btn btn-sm btn-outline-primary mt-2" onClick={handleAddDichVuRow}>
                  + Thêm dịch vụ
                </button>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalDichVu(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {modalDonThuoc && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-xl" >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Kê đơn thuốc</h5>
                <button className="btn-close" onClick={() => setModalDonThuoc(false)}></button>
              </div>
              <div className="modal-body">
                {donThuocTamThoi.map((row, i) => (
                  <div key={i} className="row g-2 align-items-center mb-2">
                    {/* Thuốc */}
                    <div className="col-md-4">
                      <Select
                        showSearch
                        style={{ width: "100%" }}  
                        size="large"
                        placeholder="Chọn thuốc"
                        value={row.id_thuoc}
                        onChange={(value) => handleChangeThuoc(i, "id_thuoc", value)}
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={dsThuoc.map(t => ({
                          value: t.id_thuoc,
                          label: `${t.ten_thuoc} (${t.hang_bao_che})`
                        }))}
                      />
                    </div>
                      
                    {/* Liều dùng */}
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Liều dùng"
                        value={row.lieu_dung}
                        onChange={(e) => handleChangeThuoc(i, "lieu_dung", e.target.value)}
                      />
                    </div>
                      
                    {/* Tần suất */}
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tần suất"
                        value={row.tan_suat}
                        onChange={(e) => handleChangeThuoc(i, "tan_suat", e.target.value)}
                      />
                    </div>
                      
                    {/* Số lượng */}
                    <div className="col-md-1">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="SL"
                        value={row.so_luong}
                        onChange={(e) => handleChangeThuoc(i, "so_luong", e.target.value)}
                      />
                    </div>
                      
                    {/* Ghi chú */}
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ghi chú"
                        value={row.ghi_chu || ""}
                        onChange={(e) => handleChangeThuoc(i, "ghi_chu", e.target.value)}
                      />
                    </div>
                    <div className="col-md-1">
                      <Button 
                        danger 
                        onClick={() => handleRemoveThuoc(i)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ))}

                <button className="btn btn-sm btn-outline-primary mt-2" onClick={handleAddThuocRow}>
                  + Thêm thuốc
                </button>
              
                {/* Ghi chú cho đơn thuốc */}
                <div className="mt-3">
                  <label className="form-label">Ghi chú đơn thuốc</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={ghiChuDonThuoc}
                    onChange={(e) => setGhiChuDonThuoc(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalDonThuoc(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        {showPreview && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content bg-white p-3">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Xem trước hóa đơn</h5>
                  <button className="btn-close" onClick={() => setShowPreview(false)}></button>
                </div>

                <div className="modal-body">
                  <div id="invoicePreview">

                    <h3 className="text-center mb-4">PHÒNG KHÁM ABC</h3>

                    {/* Thông tin bệnh nhân */}
                    <div className="mb-4">
                      <h5 className="text-center mb-3">Thông tin bệnh nhân</h5>
                      <div className="row mb-2 text-start">
                        <div className="col-md-2 fw-bold ">Mã cuộc hẹn:</div>
                        <div className="col-md-4">{id_cuoc_hen}</div>
                        <div className="col-md-2 fw-bold">Họ tên:</div>
                        <div className="col-md-4">{hoSo.ho_ten}</div>
                      </div>
                      <div className="row mb-2 text-start">
                        <div className="col-md-2 fw-bold">Giới tính:</div>
                        <div className="col-md-4">{hoSo.gioi_tinh}</div>
                        <div className="col-md-2 fw-bold">Dân tộc:</div>
                        <div className="col-md-4">{hoSo.dan_toc}</div>
                      </div>
                      <div className="row mb-2 text-start">
                        <div className="col-md-2 fw-bold ">Địa chỉ:</div>
                        <div className="col-md-4">{hoSo.dia_chi}</div>
                        <div className="col-md-2 fw-bold">Mã BHYT:</div>
                        <div className="col-md-4">{hoSo.ma_BHYT}</div>
                      </div>
                      <div className="row mb-2 text-start">
                        <div className="col-md-2 fw-bold">Ngày khám:</div>
                        <div className="col-md-4">{new Date().toLocaleDateString()}</div>
                        <div className="col-md-2 fw-bold"></div>
                        <div className="col-md-4"></div>
                      </div>
                    </div>

                    {/* Lý do khám, Chuẩn đoán, Phương án điều trị */}
                    <div className="mb-3 p-2 border rounded shadow-sm bg-light">
                      <label className="fw-bold mb-1">Lý do khám bệnh:</label>
                      <div style={{ whiteSpace: "pre-wrap" }}>{lichSuKhamHienTai?.ly_do_kham}</div>
                    </div>

                    <div className="mb-3 p-2 border rounded shadow-sm bg-light">
                      <label className="fw-bold mb-1">Chuẩn đoán bệnh:</label>
                      <div style={{ whiteSpace: "pre-wrap" }}>{lichSuKhamHienTai?.chuan_doan}</div>
                    </div>

                    <div className="mb-3 p-2 border rounded shadow-sm bg-light">
                      <label className="fw-bold mb-1">Phương án điều trị:</label>
                      <div style={{ whiteSpace: "pre-wrap" }}>{lichSuKhamHienTai?.dieu_tri}</div>
                    </div>

                    {/* Dịch vụ */}
                    <h5 className="mt-4">Dịch vụ</h5>
                    <table className="table table-bordered table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>STT</th>
                          <th>Tên DV</th>
                          <th>SL</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dichVuTamThoi.map((d, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{d.ten_dich_vu}</td>
                            <td>{d.so_luong}</td>
                            <td>{d.don_gia.toLocaleString()}</td>
                            <td>{(d.don_gia * d.so_luong).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                      
                    {/* Thuốc */}
                    <h5 className="mt-4">Thuốc</h5>
                    <table className="table table-bordered table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>STT</th>
                          <th>Thuốc</th>
                          <th>SL</th>
                          <th>Liều dùng</th>
                          <th>Tần suất</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donThuocTamThoi.map((t, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{t.ten_thuoc} ({t.ham_luong})</td>
                            <td>{t.so_luong}</td>
                            <td>{t.lieu_dung}</td>
                            <td>{t.tan_suat}</td>
                            <td>{t.ghi_chu}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}>
                            <div className="p-2 border rounded shadow-sm bg-light" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              <label className="fw-bold" style={{ minWidth: "120px", marginTop: "6px" }}>Ghi chú:</label>
                              <div style={{ flex: 1, whiteSpace: "pre-wrap" }}>{ghiChuDonThuoc}</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                      
                    {/* Tổng cộng */}
                    <h4 className="text-end mt-3 text-success fw-bold">
                      Tổng cộng: {(dichVuTamThoi.reduce((sum,d)=>sum+d.so_luong*d.don_gia,0) + donThuocTamThoi.reduce((sum,t)=>sum+t.so_luong*t.don_gia,0)).toLocaleString()} VND
                    </h4>
                      
                  </div>
                </div>
                      
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>Đóng</button>
                  <button className="btn btn-success" onClick={handleExportPdf}>
                    Xuất PDF & Kết thúc khám
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      {/* === Modal xem + cập nhật lịch sử khám === */}
      {lichSuKhamHienTai && modalLichSuViewOpen  && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thông tin khám bệnh</h5>
                <button className="btn-close" onClick={() => setModalLichSuViewOpen(false)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Lý do khám</label>
                    <textarea 
                      className="form-control" 
                      name="ly_do_kham" 
                      value={formDataLichSu.ly_do_kham} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, ly_do_kham: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chuẩn đoán</label>
                    <textarea 
                      className="form-control" 
                      name="chuan_doan" 
                      value={formDataLichSu.chuan_doan} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, chuan_doan: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Kết quả CLS</label>
                    <textarea 
                      className="form-control" 
                      name="ket_qua_cls" 
                      value={formDataLichSu.ket_qua_cls} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, ket_qua_cls: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Điều trị</label>
                    <textarea 
                      className="form-control" 
                      name="dieu_tri" 
                      value={formDataLichSu.dieu_tri} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, dieu_tri: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chăm sóc</label>
                    <textarea 
                      className="form-control" 
                      name="cham_soc" 
                      value={formDataLichSu.cham_soc} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, cham_soc: e.target.value}))}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea 
                      className="form-control" 
                      name="ghi_chu" 
                      value={formDataLichSu.ghi_chu} 
                      onChange={(e) => setFormDataLichSu(prev => ({...prev, ghi_chu: e.target.value}))}
                    ></textarea>
                  </div>
                </div>

                {/* Lịch sử khám trước đó */}
                {lichSuKhamTruoc.length > 0 && (
                  <>
                    <hr />
                    <h6>Lịch sử khám bệnh trước đó</h6>
                    <div className="accordion" id="lichSuAccordion">
                      {lichSuKhamTruoc.map((ls, i) => (
                        <div className="accordion-item" key={i}>
                          <h2 className="accordion-header" id={`heading${i}`}>
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse${i}`}
                              aria-expanded="false"
                              aria-controls={`collapse${i}`}
                            >
                              {new Date(ls.thoi_gian_kham).toLocaleDateString("vi-VN")} - {ls.ly_do_kham}
                            </button>
                          </h2>
                          <div
                            id={`collapse${i}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading${i}`}
                            data-bs-parent="#lichSuAccordion"
                          >
                            <div className="accordion-body">
                              <p><strong>Chuẩn đoán:</strong> {ls.chuan_doan}</p>
                              <p><strong>Điều trị:</strong> {ls.dieu_tri}</p>
                              <p><strong>Ghi chú:</strong> {ls.ghi_chu}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmitLichSuKham}>
                  Cập nhật
                </button>
                <button className="btn btn-secondary" onClick={() => setModalLichSuViewOpen(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorAppointmentDetail;