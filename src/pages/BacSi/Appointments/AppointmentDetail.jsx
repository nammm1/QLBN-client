import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan"; 
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiDonThuoc from "../../../api/DonThuoc";
import apiThuoc from "../../../api/Thuoc";
import apiHoaDon from "../../../api/HoaDon";
import apiDichVu from "../../../api/DichVu";
import {calculateAge} from "../../../utils/calculateAge";
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
  const [lichSu, setLichSu] = useState([]);
  
  const [dsThuoc, setDsThuoc] = useState([]);
  const [donThuocTamThoi, setDonThuocTamThoi] = useState([]);
  const [ghiChuDonThuoc, setGhiChuDonThuoc] = useState("");

  const [dsDichVu, setDsDichVu] = useState([]);
  const [dichVuTamThoi, setDichVuTamThoi] = useState([]);

  const [hoSo, setHoSo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tách riêng modal
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [modalDonThuoc, setModalDonThuoc] = useState(false);
  const [modalDichVu, setModalDichVu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


  const [formData, setFormData] = useState({});

  // Lấy danh sách dịch vụ khi mở modal
  const handleOpenDichVu = async () => {
    try {
      const res = await apiDichVu.getAll();
      console.log(res.data);
      setDsDichVu(res.data || []);
      setModalDichVu(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Lấy danh sách thuốc khi mở modal kê đơn
  const handleOpenDonThuoc = async () => {
    try {
      const res = await apiThuoc.getAllThuoc();
      console.log(res);
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

  // Thêm dòng thuốc mới
  const handleAddThuocRow = () => {
    setDonThuocTamThoi([...donThuocTamThoi, { id_thuoc: "", so_luong: 1, lieu_dung: "" }]);
  };
  // Thêm dòng dịch vụ
  const handleAddDichVuRow = () => {
    setDichVuTamThoi([...dichVuTamThoi, { id_dich_vu: "", so_luong: 1, don_gia: 0 }]);
  };
  

  // Thay đổi dịch vụ
  const handleChangeDichVu = (index, field, value) => {
    const updated = [...dichVuTamThoi];
    updated[index][field] = value;

    // Nếu chọn dịch vụ thì tự động fill đơn giá
    if (field === "id_dich_vu") {
      const selected = dsDichVu.find((dv) => dv.id_dich_vu === value);
      if (selected) updated[index] = { ...updated[index], don_gia: selected.don_gia || 0, ten_dich_vu: selected.ten_dich_vu };
    }

    setDichVuTamThoi(updated);
  };
  // Cập nhật dữ liệu nhập Thuoc
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
    if (donThuocTamThoi.length > 0 && donThuocTamThoi[0].id_thuoc) {
      // Tạo đơn thuốc
      const donThuoc = await apiDonThuoc.create({
        id_ho_so: hoSo?.id_ho_so,
        ghi_chu: ghiChuDonThuoc || "",
        trang_thai: "Đang điều trị",
        chi_tiet : donThuocTamThoi
      });
    }
    if (dichVuTamThoi.length > 0 && dichVuTamThoi[0].id_dich_vu) {
      // Tạo đơn thuốc
      const tong_tien = dichVuTamThoi.reduce(
        (sum, dv) => sum + dv.so_luong * dv.don_gia,
        0
      );
      const hoaDon = await apiHoaDon.create({
        id_cuoc_hen_kham: appointment?.id_cuoc_hen_kham || null,
        id_cuoc_hen_tu_van: null,
        tong_tien,
        chi_tiet: dichVuTamThoi,
      });
    }
    await apiCuocHenKham.updateTrangThai(id_cuoc_hen ,{trang_thai : "da_hoan_thanh"});
    const input = document.getElementById("invoicePreview");
    if (!input) return;

    // Chuyển div thành canvas
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,     
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4"); 
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Kích thước ảnh trên PDF
    const imgProps = {
      width: pdfWidth,
      height: (canvas.height * pdfWidth) / canvas.width,
    };

    let position = 0;

    // Nếu nội dung cao hơn 1 trang
    if (imgProps.height <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgProps.width, imgProps.height);
    } else {
      // Chia nội dung thành nhiều trang
      let heightLeft = imgProps.height;
      let y = 0;
      while (heightLeft > 0) {
        pdf.addImage(
          imgData,
          "PNG",
          0,
          y,
          imgProps.width,
          imgProps.height
        );
        heightLeft -= pdfHeight;
        y -= pdfHeight;
        if (heightLeft > 0) pdf.addPage();
      }
    }

    pdf.save(`HoaDon_${id_cuoc_hen}.pdf`);

    navigate(`/doctor/appointments`);

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
          if (hs) setHoSo(hs);

          const ls = await apiCuocHenKham.getLichSuByBenhNhan(appt.id_benh_nhan);
          console.log(ls);
          setLichSu(ls);
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

  // Mở modal tạo hồ sơ
  const openCreateModal = () => {
    setFormData({
      ho_ten: benhNhanFull?.data.ho_ten || "",
      gioi_tinh: benhNhanFull?.data.gioi_tinh || "",
      so_dien_thoai: benhNhanFull?.data.so_dien_thoai || "",
      ma_BHYT: benhNhanFull?.data.ma_BHYT || "",
      tuoi: calculateAge(benhNhanFull?.data.ngay_sinh),
      dan_toc: benhNhanFull?.data.dan_toc || "",
      dia_chi: benhNhanFull?.data.dia_chi || "",
      ly_do_kham: "",
      chuan_doan: "",
      ket_qua_cls: "",
      tham_do_chuc_nang: "",
      dieu_tri: "",
      cham_soc: "",
      ghi_chu: "",
      chan_doan: "",
    });
    setModalCreateOpen(true);
  };

  // Mở modal xem + cập nhật hồ sơ
  const openViewModal = () => {
    if (!hoSo) return;
    setFormData({
      ...hoSo,
      ho_ten: benhNhanFull?.data.ho_ten || "",
      tuoi: calculateAge(benhNhanFull?.data.ngay_sinh),
    });
    setModalViewOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitHoSo = async () => {
    try {
      if (!hoSo) {
        // Tạo mới
        await apiHoSoKhamBenh.create({
          id_bac_si_tao: userInfo.user.id_nguoi_dung,
          id_benh_nhan: benhNhanFull.data.id_benh_nhan,
          ...formData
        });
      } else {
        // Cập nhật
        await apiHoSoKhamBenh.update(hoSo.id_ho_so, formData);
      }

      const hs = await apiHoSoKhamBenh.getByBenhNhan(benhNhanFull.data.id_benh_nhan);
      setHoSo(hs);
      setModalCreateOpen(false);
      setModalViewOpen(false);
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


      {/* === Thông tin bệnh nhân === */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-primary text-white">Thông tin bệnh nhân</div>
        <div className="card-body d-flex">
          <div className="me-4" style={{ flexShrink: 0 }}>
            {benhNhanFull?.data.anh_dai_dien ? (
              <img src={benhNhanFull.data.anh_dai_dien} alt="Ảnh đại diện"
                className="img-fluid rounded shadow"
                style={{ width: "200px", height: "200px", objectFit: "cover" }} />
            ) : (
              <div className="border rounded d-flex align-items-center justify-content-center shadow"
                   style={{ width: "200px", height: "200px" }}>Không có ảnh</div>
            )}
          </div>
          <div className="flex-grow-1">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-secondary">Thông tin cá nhân</h6>
                <p><strong>Mã BN:</strong> {benhNhanFull?.data.id_benh_nhan || "Không"}</p>
                <p><strong>Họ tên:</strong> {benhNhanFull?.data.ho_ten || "Không"}</p>
                <p><strong>Giới tính:</strong> {benhNhanFull?.data.gioi_tinh || "Không"}</p>
                <p><strong>Ngày sinh:</strong> {benhNhanFull?.data.ngay_sinh ? new Date(benhNhanFull.data.ngay_sinh).toLocaleDateString("vi-VN") : "Không"}</p>
                <p><strong>SĐT:</strong> {benhNhanFull?.data.so_dien_thoai || "Không"}</p>
              </div>
              <div className="col-md-6">
                <h6 className="text-secondary">Liên hệ & sức khỏe</h6>
                <p><strong>Người liên hệ khẩn cấp:</strong> {benhNhanFull?.data.ten_nguoi_lien_he_khan_cap || "Không"}</p>
                <p><strong>Tiền sử bệnh lý:</strong> {benhNhanFull?.data.tien_su_benh_ly || "Không"}</p>
                <p><strong>Tình trạng sức khỏe hiện tại:</strong> {benhNhanFull?.data.tinh_trang_suc_khoe_hien_tai || "Không"}</p>
                <p><strong>Trạng thái:</strong> {benhNhanFull?.data.trang_thai_hoat_dong ? "Hoạt động" : "Không hoạt động"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* === Nút tạo / xem hồ sơ === */}
      <div className="mt-4">
        {hoSo ? (
          <button className="btn btn-outline-primary me-2" onClick={openViewModal}>
            Xem hồ sơ bệnh án
          </button>
        ) : (
          <button className="btn btn-primary me-2" onClick={openCreateModal}>
            Tạo hồ sơ bệnh án
          </button>
        )}
      </div>

      {/* === Nút hành động === */}
      {!appointment.trang_thai === "da_hoan_thanh" && (
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


      


      {/* === Modal tạo hồ sơ === */}
      {modalCreateOpen && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo hồ sơ bệnh án</h5>
                <button className="btn-close" onClick={() => setModalCreateOpen(false)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ tên</label>
                    <input className="form-control" name="ho_ten" value={formData.ho_ten} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-control" name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tuổi</label>
                    <input className="form-control" name="tuoi" value={formData.tuoi} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Giới tính</label>
                    <input className="form-control" name="gioi_tinh" value={formData.gioi_tinh} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Dân tộc</label>
                    <input className="form-control" name="dan_toc" value={formData.dan_toc} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã BHYT</label>
                    <input className="form-control" name="ma_BHYT" value={formData.ma_BHYT} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ</label>
                    <input className="form-control" name="dia_chi" value={formData.dia_chi} onChange={handleFormChange} />
                  </div>
      
                  <div className="col-12">
                    <label className="form-label">Lý do khám</label>
                    <textarea className="form-control" name="ly_do_kham" value={formData.ly_do_kham} onChange={handleFormChange}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chuẩn đoán</label>
                    <textarea className="form-control" name="chuan_doan" value={formData.chuan_doan} onChange={handleFormChange}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Kết quả CLS</label>
                    <textarea className="form-control" name="ket_qua_cls" value={formData.ket_qua_cls} onChange={handleFormChange}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Điều trị</label>
                    <textarea className="form-control" name="dieu_tri" value={formData.dieu_tri} onChange={handleFormChange}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chăm sóc</label>
                    <textarea className="form-control" name="cham_soc" value={formData.cham_soc} onChange={handleFormChange}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea className="form-control" name="ghi_chu" value={formData.ghi_chu} onChange={handleFormChange}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmitHoSo}>Lưu hồ sơ</button>
                <button className="btn btn-secondary" onClick={() => setModalCreateOpen(false)}>Hủy</button>
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
                      <div style={{ whiteSpace: "pre-wrap" }}>{hoSo.ly_do_kham}</div>
                    </div>

                    <div className="mb-3 p-2 border rounded shadow-sm bg-light">
                      <label className="fw-bold mb-1">Chuẩn đoán bệnh:</label>
                      <div style={{ whiteSpace: "pre-wrap" }}>{hoSo.chuan_doan}</div>
                    </div>

                    <div className="mb-3 p-2 border rounded shadow-sm bg-light">
                      <label className="fw-bold mb-1">Phương án điều trị:</label>
                      <div style={{ whiteSpace: "pre-wrap" }}>{hoSo.dieu_tri}</div>
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




        {/* === Modal xem + cập nhật hồ sơ === */}
        {hoSo && modalViewOpen && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Hồ sơ bệnh án: {benhNhanFull?.data.ho_ten}</h5>
                  <button className="btn-close" onClick={() => setModalViewOpen(false)}></button>
                </div>
                <div className="modal-body text-start">
                  <div className="row g-3">
                    {/* Thông tin bệnh nhân */}
                    <div className="col-md-4 text-center">
                      {benhNhanFull?.data.anh_dai_dien ? (
                        <img
                          src={benhNhanFull.data.anh_dai_dien}
                          alt="Ảnh đại diện"
                          className="img-fluid rounded shadow mb-3"
                          style={{ width: "200px", height: "200px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="border rounded d-flex align-items-center justify-content-center mb-3"
                          style={{ width: "200px", height: "200px" }}
                        >
                          Không có ảnh
                        </div>
                      )}
                      <div className="text-start">
                        <p><strong>Họ tên:</strong> {formData.ho_ten}</p>
                        <p><strong>Tuổi:</strong> {formData.tuoi}</p>
                        <p><strong>Giới tính:</strong> {formData.gioi_tinh}</p>
                        <p><strong>Dân tộc:</strong> {formData.dan_toc}</p>
                        <p><strong>SĐT:</strong> {formData.so_dien_thoai}</p>
                        <p><strong>Mã BHYT:</strong> {formData.ma_BHYT}</p>
                        <p><strong>Địa chỉ:</strong> {formData.dia_chi}</p>
                      </div>
                    </div>
                    
                    {/* Thông tin hồ sơ */}
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Lý do khám</label>
                        <textarea
                          className="form-control"
                          name="ly_do_kham"
                          value={formData.ly_do_kham}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Chuẩn đoán</label>
                        <textarea
                          className="form-control"
                          name="chuan_doan"
                          value={formData.chuan_doan}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Kết quả CLS</label>
                        <textarea
                          className="form-control"
                          name="ket_qua_cls"
                          value={formData.ket_qua_cls}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Điều trị</label>
                        <textarea
                          className="form-control"
                          name="dieu_tri"
                          value={formData.dieu_tri}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Chăm sóc</label>
                        <textarea
                          className="form-control"
                          name="cham_soc"
                          value={formData.cham_soc}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Ghi chú</label>
                        <textarea
                          className="form-control"
                          name="ghi_chu"
                          value={formData.ghi_chu}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                    
                  {/* Lịch sử khám bệnh */}
                  <hr />
                  <h6>Lịch sử khám bệnh</h6>
                  <div className="accordion" id="lichSuAccordion">
                    {lichSu && lichSu.length > 0 ? (
                      lichSu.map((h, i) => {
                        const ngayKham = h.ngay_kham
                          ? new Date(h.ngay_kham).toLocaleDateString("vi-VN")
                          : "Không có";
                        const gioKham =
                          h.gio_bat_dau && h.gio_ket_thuc
                            ? `${h.gio_bat_dau} - ${h.gio_ket_thuc}`
                            : "Không có";
                        const trieuChung = h.trieu_chung || "Không có";
                        const trangThai = h.trang_thai || "Không có";
                      
                        return (
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
                                {ngayKham} - {gioKham} - {trieuChung} - {trangThai}
                              </button>
                            </h2>
                            <div
                              id={`collapse${i}`}
                              className="accordion-collapse collapse"
                              aria-labelledby={`heading${i}`}
                              data-bs-parent="#lichSuAccordion"
                            >
                              <div className="accordion-body">
                                {/* Hóa đơn */}
                                {h.hoa_don ? (
                                  <div className="mb-3">
                                    <h6>Hóa đơn</h6>
                                    <p>
                                      Mã HĐ: {h.hoa_don.id_hoa_don} | Tổng tiền:{" "}
                                      {h.hoa_don.tong_tien} | Trạng thái: {h.hoa_don.trang_thai} | Phương thức thanh toán:{" "}
                                      {h.hoa_don.phuong_thuc_thanh_toan}
                                    </p>
                                    {h.hoa_don.chi_tiet_hoa_don && h.hoa_don.chi_tiet_hoa_don.length > 0 && (
                                      <table className="table table-sm table-bordered">
                                        <thead>
                                          <tr>
                                            <th>Dịch vụ</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {h.hoa_don.chi_tiet_hoa_don.map((ct, j) => (
                                            <tr key={j}>
                                              <td>{ct.id_dich_vu}</td>
                                              <td>{ct.so_luong}</td>
                                              <td>{ct.don_gia}</td>
                                              <td>{ct.thanh_tien}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                ) : (
                                  <p>Chưa có hóa đơn</p>
                                )}

                                {/* Đơn thuốc */}
                                {h.don_thuoc ? (
                                  <div>
                                    <h6>Đơn thuốc</h6>
                                    <p>Mã đơn thuốc: {h.don_thuoc.id_don_thuoc} | Trạng thái: {h.don_thuoc.trang_thai}</p>
                                    {h.don_thuoc.chi_tiet_don_thuoc && h.don_thuoc.chi_tiet_don_thuoc.length > 0 && (
                                      <table className="table table-sm table-bordered">
                                        <thead>
                                          <tr>
                                            <th>Thuốc</th>
                                            <th>Liều dùng</th>
                                            <th>Tần suất</th>
                                            <th>Thời gian dùng</th>
                                            <th>Số lượng</th>
                                            <th>Ghi chú</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {h.don_thuoc.chi_tiet_don_thuoc.map((ct, j) => (
                                            <tr key={j}>
                                              <td>{ct.id_thuoc}</td>
                                              <td>{ct.lieu_dung}</td>
                                              <td>{ct.tan_suat}</td>
                                              <td>{ct.so_luong}</td>
                                              <td>{ct.ghi_chu}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                ) : (
                                  <p>Chưa có đơn thuốc</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p>Chưa có lịch sử khám bệnh</p>
                    )}
                  </div>
                  
                </div>
                  
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleSubmitHoSo}>
                    Cập nhật
                  </button>
                  <button className="btn btn-secondary" onClick={() => setModalViewOpen(false)}>
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
