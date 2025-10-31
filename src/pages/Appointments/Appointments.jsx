import React, { useEffect, useState } from "react";
import "./appointments.css";
import apiCuocHenKhamBenh from "../../api/CuocHenKhamBenh";
import apiCuocHenTuVan from "../../api/CuocHenTuVan";
import apiNguoiDung from "../../api/NguoiDung";
import apiChuyenKhoa from "../../api/ChuyenKhoa";
import apiKhungGioKham from "../../api/KhungGioKham";
import toast from "../../utils/toast";

const statusLabel = (s) => {
  switch (s) {
    case "da_dat":
      return "Đã đặt";
    case "da_huy":
      return "Đã hủy";
    case "da_hoan_thanh":
      return "Đã hoàn thành";
    default:
      return s || "—";
  }
};

const loaiHenLabel = (loai) => {
  switch (loai) {
    case "truc_tiep":
      return "Trực tiếp";
    case "online":
      return "Online";
    default:
      return loai || "—";
  }
};

const phuongThucLabel = (loai) => {
  switch (loai) {
    case "truc_tiep":
      return "Trực tiếp";
    case "online":
      return "Online";
    default:
      return loai || "—";
  }
};

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date) ? "—" : date.toISOString().split("T")[0];
};

const Appointments = () => {
  const [selectedTab, setSelectedTab] = useState("kham");
  const [lichKham, setLichKham] = useState([]);
  const [lichTuVan, setLichTuVan] = useState([]);
  const [loadingKham, setLoadingKham] = useState(true);
  const [loadingTuVan, setLoadingTuVan] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const patientId =
    userInfo?.user?.id_benh_nhan ||
    userInfo?.user?.id_nguoi_dung ||
    null;

  const unwrap = (res) =>
    res?.success && res.data !== undefined
      ? res.data
      : res?.data ?? res ?? [];

  // ======================= LOAD LỊCH KHÁM BỆNH ==========================
  const loadLichKhamBenh = async (chuyenKhoaMap) => {
    setLoadingKham(true);
    try {
      let resp;
      if (patientId && apiCuocHenKhamBenh.getByBenhNhan)
        resp = await apiCuocHenKhamBenh.getByBenhNhan(patientId);
      else resp = await apiCuocHenKhamBenh.getAll();

      const raw = unwrap(resp) || [];

      const enriched = await Promise.all(
        raw.map(async (it) => {
          const id =
            it.id_cuoc_hen ||
            it.id ||
            it._id ||
            it.id_cuoc_hen_kham_benh;

          // lấy khung giờ
          let gio_bat_dau = "—",
            gio_ket_thuc = "—";
          if (it.id_khung_gio && apiKhungGioKham.getById) {
            try {
              const kres = await apiKhungGioKham.getById(it.id_khung_gio);
              const khung = unwrap(kres);
              if (khung) {
                gio_bat_dau = khung.gio_bat_dau || "—";
                gio_ket_thuc = khung.gio_ket_thuc || "—";
              }
            } catch {}
          }

          // lấy tên bác sĩ
          let ten_bac_si = "—";
          const bsId =
            it.id_bac_si ||
            it.id_nguoi_dung_bac_si ||
            it.id_nguoi_dung;
          if (bsId && apiNguoiDung.getUserById) {
            try {
              const bres = await apiNguoiDung.getUserById(bsId);
              const bdata = unwrap(bres);
              ten_bac_si = bdata?.ho_ten || bdata?.ten || "—";
            } catch {}
          }

          // lấy tên chuyên khoa
          let ten_chuyen_khoa = "—";
          const ckId =
            it.id_chuyen_khoa ||
            it.id_khoa ||
            it.chuyen_khoa_id;
          if (ckId && chuyenKhoaMap[ckId]) {
            ten_chuyen_khoa =
              chuyenKhoaMap[ckId].ten_chuyen_khoa ||
              chuyenKhoaMap[ckId].ten ||
              "—";
          }

          return {
            id,
            ngay_kham: it.ngay_kham,
            gio_bat_dau,
            gio_ket_thuc,
            ten_bac_si,
            ten_chuyen_khoa,
            loai_hen: loaiHenLabel(it.loai_hen),
            trang_thai: statusLabel(it.trang_thai),
            _raw_trang_thai: it.trang_thai,
          };
        })
      );

      setLichKham(enriched);
    } catch (err) {
      console.error("Lỗi load lịch khám:", err);
    } finally {
      setLoadingKham(false);
    }
  };

  // ======================= LOAD LỊCH TƯ VẤN DINH DƯỠNG ==========================
  const loadLichTuVan = async () => {
    setLoadingTuVan(true);
    try {
      let resp;
      if (patientId && apiCuocHenTuVan.getByBenhNhan)
        resp = await apiCuocHenTuVan.getByBenhNhan(patientId);
      else resp = await apiCuocHenTuVan.getAll();

      const raw = unwrap(resp) || [];

      const enriched = await Promise.all(
        raw.map(async (it) => {
          const id =
            it.id_cuoc_hen ||
            it.id ||
            it._id ||
            it.id_cuoc_hen_tu_van;

          // khung giờ
          let gio_bat_dau = "—",
            gio_ket_thuc = "—";
          if (it.id_khung_gio && apiKhungGioKham.getById) {
            try {
              const kres = await apiKhungGioKham.getById(it.id_khung_gio);
              const khung = unwrap(kres);
              if (khung) {
                gio_bat_dau = khung.gio_bat_dau || "—";
                gio_ket_thuc = khung.gio_ket_thuc || "—";
              }
            } catch {}
          }

          // chuyên gia
          let ten_chuyen_gia = "—";
          const cgId = it.id_chuyen_gia || it.id_nguoi_dung;
          if (cgId && apiNguoiDung.getUserById) {
            try {
              const eres = await apiNguoiDung.getUserById(cgId);
              const edata = unwrap(eres);
              ten_chuyen_gia = edata?.ho_ten || edata?.ten || "—";
            } catch {}
          }

          // loại dinh dưỡng
          const loai_dinh_duong = it.loai_dinh_duong || it.loai_tu_van || "—";

          return {
            id,
            ngay_kham: it.ngay_tu_van || it.ngay_kham,
            gio_bat_dau,
            gio_ket_thuc,
            ten_chuyen_gia,
            loai_dinh_duong,
            loai_hen: phuongThucLabel(it.loai_hen),
            trang_thai: statusLabel(it.trang_thai),
            _raw_trang_thai: it.trang_thai,
          };
        })
      );

      setLichTuVan(enriched);
    } catch (err) {
      console.error("Lỗi load lịch tư vấn:", err);
    } finally {
      setLoadingTuVan(false);
    }
  };

  // ======================= LOAD CHUYÊN KHOA ==========================
  const loadChuyenKhoaMap = async () => {
    try {
      const res = await apiChuyenKhoa.getAllChuyenKhoa();
      const arr = unwrap(res);
      const map = {};
      arr.forEach((ck) => {
        const id = ck.id_chuyen_khoa || ck.id;
        if (id) map[id] = ck;
      });
      return map;
    } catch {
      return {};
    }
  };

  // ======================= HỦY LỊCH ==========================
  const handleCancelKham = async (id) => {
    try {
      await apiCuocHenKhamBenh.updateTrangThai(id, "da_huy");
      setLichKham((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, trang_thai: "Đã hủy", _raw_trang_thai: "da_huy" } : it
        )
      );
      toast.success("Hủy lịch khám thành công!");
    } catch (err) {
      toast.error("Hủy thất bại!");
    }
  };

  const handleCancelTuVan = async (id) => {
    try {
      await apiCuocHenTuVan.updateTrangThai(id, "da_huy");
      setLichTuVan((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, trang_thai: "Đã hủy", _raw_trang_thai: "da_huy" } : it
        )
      );
      toast.success("Hủy lịch tư vấn thành công!");
    } catch (err) {
      toast.error("Hủy thất bại!");
    }
  };

  // ======================= USE EFFECT ==========================
  useEffect(() => {
    (async () => {
      const ckMap = await loadChuyenKhoaMap();
      await Promise.all([loadLichKhamBenh(ckMap), loadLichTuVan()]);
    })();
  }, [patientId]);

  // ======================= RENDER ==========================
  return (
    <div className="appointments-container">
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

      {selectedTab === "kham" && (
        <div>
          <h2>📅 Lịch Hẹn Khám Bệnh</h2>
          {loadingKham ? (
            <p>Đang tải lịch khám...</p>
          ) : (
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
                {lichKham.length === 0 ? (
                  <tr>
                    <td colSpan="7">Không có lịch hẹn khám</td>
                  </tr>
                ) : (
                  lichKham.map((it) => (
                    <tr key={it.id}>
                      <td>{formatDate(it.ngay_kham)}</td>
                      <td>{it.gio_bat_dau} - {it.gio_ket_thuc}</td>
                      <td>{it.ten_bac_si}</td>
                      <td>{it.ten_chuyen_khoa}</td>
                      <td>{it.loai_hen}</td>
                      <td>{it.trang_thai}</td>
                      <td>
                        {it._raw_trang_thai !== "da_huy" &&
                          it._raw_trang_thai !== "da_hoan_thanh" && (
                            <button className="cancel-btn" onClick={() => handleCancelKham(it.id)}>
                              Hủy
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedTab === "dinhduong" && (
        <div>
          <h2>🥗 Lịch Hẹn Tư Vấn Dinh Dưỡng</h2>
          {loadingTuVan ? (
            <p>Đang tải lịch tư vấn...</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Ngày tư vấn</th>
                  <th>Thời gian</th>
                  <th>Chuyên gia</th>
                  <th>Loại tư vấn</th>
                  <th>Loại hẹn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {lichTuVan.length === 0 ? (
                  <tr>
                    <td colSpan="7">Không có lịch tư vấn</td>
                  </tr>
                ) : (
                  lichTuVan.map((it) => (
                    <tr key={it.id}>
                      <td>{formatDate(it.ngay_kham)}</td>
                      <td>{it.gio_bat_dau} - {it.gio_ket_thuc}</td>
                      <td>{it.ten_chuyen_gia}</td>
                      <td>{it.loai_dinh_duong}</td>
                      <td>{it.loai_hen}</td>
                      <td>{it.trang_thai}</td>
                      <td>
                        {it._raw_trang_thai !== "da_huy" &&
                          it._raw_trang_thai !== "da_hoan_thanh" && (
                            <button className="cancel-btn" onClick={() => handleCancelTuVan(it.id)}>
                              Hủy
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
