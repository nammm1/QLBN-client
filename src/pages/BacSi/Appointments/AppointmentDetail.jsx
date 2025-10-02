import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan"; 
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiDonThuoc from "../../../api/DonThuoc";
import apiThuoc from "../../../api/Thuoc";
import apiChiTietDonThuoc from "../../../api/ChiTietDonThuoc";
import "./AppointmentDetail.css";
const DoctorAppointmentDetail = () => {
  const { id_cuoc_hen } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [benhNhanFull, setBenhNhanFull] = useState(null);
  const [lichSu, setLichSu] = useState([]);
  
  const [dsThuoc, setDsThuoc] = useState([]);
  const [donThuocTamThoi, setDonThuocTamThoi] = useState([
  { id_thuoc: "", so_luong: 1, lieu_dung: "" }
  ]);
  const [ghiChuDonThuoc, setGhiChuDonThuoc] = useState("");

  const [hoSo, setHoSo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tách riêng modal
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [modalDonThuoc, setModalDonThuoc] = useState(false);

  const [formData, setFormData] = useState({});

  // Hàm tính tuổi
  const calculateAge = (ngaySinh) => {
    if (!ngaySinh) return "";
    const birth = new Date(ngaySinh);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  // Lấy danh sách thuốc khi mở modal kê đơn
  const handleOpenDonThuoc = async () => {
    try {
      const res = await apiThuoc.getAllThuoc();
      setDsThuoc(res || []);
      setModalDonThuoc(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Thêm dòng thuốc mới
  const handleAddThuocRow = () => {
    setDonThuocTamThoi([...donThuocTamThoi, { id_thuoc: "", so_luong: 1, lieu_dung: "" }]);
  };
  
  // Cập nhật dữ liệu nhập
  const handleChangeThuoc = (index, field, value) => {
    const updated = [...donThuocTamThoi];
    updated[index][field] = value;
    setDonThuocTamThoi(updated);
  };

  const handleFinish = async () => {
  try {
    if (donThuocTamThoi.length > 0 && donThuocTamThoi[0].id_thuoc) {
      // Tạo đơn thuốc
      const donThuoc = await apiDonThuoc.create({
        id_ho_so: hoSo?.id_ho_so,
        ghi_chu: ghiChuDonThuoc || "",
        trang_thai: "Đang điều trị"
      });

      const id_don_thuoc = donThuoc.data.id_don_thuoc;

      // Tạo chi tiết đơn thuốc
      for (const ct of donThuocTamThoi) {
        await apiChiTietDonThuoc.create({
          id_don_thuoc,
          id_thuoc: ct.id_thuoc,
          lieu_dung: ct.lieu_dung,
          tan_suat: ct.tan_suat,
          thoi_gian_dung: ct.thoi_gian_dung,
          so_luong: ct.so_luong,
          ghi_chu: ct.ghi_chu
        });
      }
    }
    alert("Kết thúc khám & xuất hóa đơn thành công!");
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
      <div className="mt-3 d-flex gap-2 flex-wrap">
        <button className="btn btn-warning" onClick={handleOpenDonThuoc}>Kê đơn thuốc</button>
        <button className="btn btn-secondary">Chọn dịch vụ kèm theo</button>
        <button className="btn btn-success" onClick={handleFinish}>Kết thúc khám / Xuất hóa đơn</button>
      </div>

      


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
      
      {modalDonThuoc && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Kê đơn thuốc</h5>
                <button className="btn-close" onClick={() => setModalDonThuoc(false)}></button>
              </div>
              <div className="modal-body">
                {donThuocTamThoi.map((row, i) => (
                  <div key={i} className="row g-2 align-items-center mb-2">
                    {/* Thuốc */}
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={row.id_thuoc}
                        onChange={(e) => handleChangeThuoc(i, "id_thuoc", e.target.value)}
                      >
                        <option value="">-- Chọn thuốc --</option>
                        {dsThuoc.map((t) => (
                          <option key={t.id_thuoc} value={t.id_thuoc}>
                            {t.ten_thuoc} ({t.don_vi_tinh})
                          </option>
                        ))}
                      </select>
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
                      
                    {/* Thời gian dùng */}
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Thời gian dùng"
                        value={row.thoi_gian_dung}
                        onChange={(e) => handleChangeThuoc(i, "thoi_gian_dung", e.target.value)}
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
                                              <td>{ct.thoi_gian_dung}</td>
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
