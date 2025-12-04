import React, { useEffect, useState } from "react";
import { Tabs, Table, Typography, Button, Tag, Space, Card, Spin, Empty, Popconfirm, Modal, Descriptions } from "antd";
import { CalendarOutlined, AppleOutlined, CloseCircleOutlined, VideoCameraOutlined, HomeOutlined } from "@ant-design/icons";
import "./Appointments.css";
import apiCuocHenKhamBenh from "../../../api/CuocHenKhamBenh";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiNguoiDung from "../../../api/NguoiDung";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiKhungGioKham from "../../../api/KhungGioKham";
import apiHoaDon from "../../../api/HoaDon";
import toast from "../../../utils/toast";

const { Title, Text } = Typography;

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

const getStatusTag = (s) => {
  switch (s) {
    case "da_dat":
      return <Tag color="blue">Đã đặt</Tag>;
    case "da_huy":
      return <Tag color="red">Đã hủy</Tag>;
    case "da_hoan_thanh":
      return <Tag color="green">Đã hoàn thành</Tag>;
    default:
      return <Tag>{s || "—"}</Tag>;
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
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailType, setDetailType] = useState(null); // 'kham' | 'tu_van'

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
  const loadLichKhamBenh = async (chuyenKhoaMap, khungGioMap, nguoiDungMap) => {
    setLoadingKham(true);
    try {
      let resp;
      if (patientId && apiCuocHenKhamBenh.getByBenhNhan)
        resp = await apiCuocHenKhamBenh.getByBenhNhan(patientId);
      else resp = await apiCuocHenKhamBenh.getAll();

      const raw = unwrap(resp) || [];

      const enriched = raw.map((it) => {
        const id =
          it.id_cuoc_hen ||
          it.id ||
          it._id ||
          it.id_cuoc_hen_kham_benh;

        // Sử dụng khung giờ từ response hoặc từ map cache
        let gio_bat_dau = "—",
          gio_ket_thuc = "—";
        if (it.khungGio) {
          gio_bat_dau = it.khungGio.gio_bat_dau || "—";
          gio_ket_thuc = it.khungGio.gio_ket_thuc || "—";
        } else if (it.id_khung_gio && khungGioMap[it.id_khung_gio]) {
          const khung = khungGioMap[it.id_khung_gio];
          gio_bat_dau = khung.gio_bat_dau || "—";
          gio_ket_thuc = khung.gio_ket_thuc || "—";
        }

        // Sử dụng thông tin từ response hoặc từ map cache
        let ten_bac_si = "—";
        const bsId =
          it.id_bac_si ||
          it.id_nguoi_dung_bac_si ||
          it.id_nguoi_dung;
        if (it.bacSi?.ho_ten) {
          ten_bac_si = it.bacSi.ho_ten;
        } else if (bsId && nguoiDungMap[bsId]) {
          ten_bac_si = nguoiDungMap[bsId].ho_ten || nguoiDungMap[bsId].ten || "—";
        }

        let ten_chuyen_khoa = "—";
        const ckId =
          it.id_chuyen_khoa ||
          it.id_khoa ||
          it.chuyen_khoa_id;
        if (it.chuyenKhoa?.ten_chuyen_khoa) {
          ten_chuyen_khoa = it.chuyenKhoa.ten_chuyen_khoa;
        } else if (ckId && chuyenKhoaMap[ckId]) {
          ten_chuyen_khoa =
            chuyenKhoaMap[ckId].ten_chuyen_khoa ||
            chuyenKhoaMap[ckId].ten ||
            "—";
        }

        let phong_kham_label = "—";
        if (it.phong_kham) {
          const pk = it.phong_kham;
          const parts = [];
          if (pk.ten_phong) parts.push(pk.ten_phong);
          if (pk.so_phong) parts.push(`P.${pk.so_phong}`);
          if (pk.tang) parts.push(`Tầng ${pk.tang}`);
          phong_kham_label = parts.join(" - ") || "—";
        }

        return {
          id,
          ngay_kham: it.ngay_kham,
          gio_bat_dau,
          gio_ket_thuc,
          ten_bac_si,
          ten_chuyen_khoa,
          phong_kham: phong_kham_label,
          loai_hen: loaiHenLabel(it.loai_hen),
          trang_thai: statusLabel(it.trang_thai),
          _raw_trang_thai: it.trang_thai,
        };
      });

      // Sort theo ngày (mới nhất trước)
      enriched.sort((a, b) => {
        const dateA = new Date(a.ngay_kham || 0);
        const dateB = new Date(b.ngay_kham || 0);
        return dateB - dateA; // Descending order
      });

      setLichKham(enriched);
    } catch (err) {
      console.error("Lỗi load lịch khám:", err);
    } finally {
      setLoadingKham(false);
    }
  };

  // ======================= LOAD LỊCH TƯ VẤN DINH DƯỠNG ==========================
  const loadLichTuVan = async (khungGioMap, nguoiDungMap) => {
    setLoadingTuVan(true);
    try {
      let resp;
      if (patientId && apiCuocHenTuVan.getByBenhNhan)
        resp = await apiCuocHenTuVan.getByBenhNhan(patientId);
      else resp = await apiCuocHenTuVan.getAll();

      const raw = unwrap(resp) || [];

      const enriched = raw.map((it) => {
        const id =
          it.id_cuoc_hen ||
          it.id ||
          it._id ||
          it.id_cuoc_hen_tu_van;

        // Sử dụng khung giờ từ response hoặc từ map cache
        let gio_bat_dau = "—",
          gio_ket_thuc = "—";
        if (it.khungGio) {
          gio_bat_dau = it.khungGio.gio_bat_dau || "—";
          gio_ket_thuc = it.khungGio.gio_ket_thuc || "—";
        } else if (it.id_khung_gio && khungGioMap[it.id_khung_gio]) {
          const khung = khungGioMap[it.id_khung_gio];
          gio_bat_dau = khung.gio_bat_dau || "—";
          gio_ket_thuc = khung.gio_ket_thuc || "—";
        }

        // Sử dụng thông tin từ response hoặc từ map cache
        let ten_chuyen_gia = "—";
        const cgId = it.id_chuyen_gia || it.id_nguoi_dung;
        if (it.chuyenGia?.ho_ten) {
          ten_chuyen_gia = it.chuyenGia.ho_ten;
        } else if (cgId && nguoiDungMap[cgId]) {
          ten_chuyen_gia = nguoiDungMap[cgId].ho_ten || nguoiDungMap[cgId].ten || "—";
        }

        const loai_dinh_duong = it.loai_dinh_duong || it.loai_tu_van || "—";

        let phong_kham_label = "—";
        if (it.phong_kham) {
          const pk = it.phong_kham;
          const parts = [];
          if (pk.ten_phong) parts.push(pk.ten_phong);
          if (pk.so_phong) parts.push(`P.${pk.so_phong}`);
          if (pk.tang) parts.push(`Tầng ${pk.tang}`);
          phong_kham_label = parts.join(" - ") || "—";
        }

        return {
          id,
          ngay_kham: it.ngay_tu_van || it.ngay_kham,
          gio_bat_dau,
          gio_ket_thuc,
          ten_chuyen_gia,
          loai_dinh_duong,
          phong_kham: phong_kham_label,
          loai_hen: phuongThucLabel(it.loai_hen),
          trang_thai: statusLabel(it.trang_thai),
          _raw_trang_thai: it.trang_thai,
        };
      });

      // Sort theo ngày (mới nhất trước)
      enriched.sort((a, b) => {
        const dateA = new Date(a.ngay_kham || 0);
        const dateB = new Date(b.ngay_kham || 0);
        return dateB - dateA; // Descending order
      });

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

  // ======================= LOAD KHUNG GIỜ (BATCH) ==========================
  const loadKhungGioMap = async (rawAppointments) => {
    try {
      // Lấy tất cả id_khung_gio unique
      const khungGioIds = new Set();
      rawAppointments.forEach((apt) => {
        if (apt.id_khung_gio) {
          khungGioIds.add(apt.id_khung_gio);
        }
      });

      if (khungGioIds.size === 0) return {};

      // Load tất cả khung giờ một lần
      const allKhungGio = await apiKhungGioKham.getAll();
      const khungGioList = unwrap(allKhungGio) || [];

      // Tạo map
      const map = {};
      khungGioList.forEach((kg) => {
        const id = kg.id_khung_gio || kg.id;
        if (id) map[id] = kg;
      });

      return map;
    } catch (err) {
      console.error("Lỗi load khung giờ:", err);
      return {};
    }
  };

  // ======================= LOAD NGƯỜI DÙNG (BATCH) ==========================
  const loadNguoiDungMap = async (rawAppointments) => {
    try {
      // Lấy tất cả id người dùng unique (bác sĩ, chuyên gia)
      const nguoiDungIds = new Set();
      rawAppointments.forEach((apt) => {
        const bsId = apt.id_bac_si || apt.id_nguoi_dung_bac_si || apt.id_nguoi_dung;
        const cgId = apt.id_chuyen_gia || apt.id_nguoi_dung;
        if (bsId) nguoiDungIds.add(bsId);
        if (cgId) nguoiDungIds.add(cgId);
      });

      if (nguoiDungIds.size === 0) return {};

      // Load từng người dùng (có thể tối ưu thêm bằng batch API nếu có)
      const map = {};
      await Promise.all(
        Array.from(nguoiDungIds).map(async (id) => {
          try {
            const res = await apiNguoiDung.getUserById(id);
            const data = unwrap(res);
            if (data) map[id] = data;
          } catch (err) {
            // Ignore errors for individual users
          }
        })
      );

      return map;
    } catch (err) {
      console.error("Lỗi load người dùng:", err);
      return {};
    }
  };

  // ======================= HỦY LỊCH ==========================
  const handleCancelKham = async (id) => {
    try {
      const response = await apiCuocHenKhamBenh.updateTrangThai(id, "da_huy");
      setLichKham((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, trang_thai: "Đã hủy", _raw_trang_thai: "da_huy" } : it
        )
      );
      
      // Hiển thị thông báo hoàn tiền nếu có
      if (response?.refundInfo?.message) {
        toast.success(response.refundInfo.message, 5);
      } else {
        toast.success("Hủy lịch khám thành công!");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Hủy thất bại!";
      toast.error(errorMessage);
    }
  };

  const handleCancelTuVan = async (id) => {
    try {
      const response = await apiCuocHenTuVan.updateTrangThai(id, "da_huy");
      setLichTuVan((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, trang_thai: "Đã hủy", _raw_trang_thai: "da_huy" } : it
        )
      );
      
      // Hiển thị thông báo hoàn tiền nếu có
      if (response?.refundInfo?.message) {
        toast.success(response.refundInfo.message, 5);
      } else {
        toast.success("Hủy lịch tư vấn thành công!");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Hủy thất bại!";
      toast.error(errorMessage);
    }
  };

  // ======================= XEM CHI TIẾT LỊCH ==========================
  const openKhamDetail = async (record) => {
    if (!record?.id) return;
    setDetailType("kham");
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const [cuocHen, hoaDon] = await Promise.all([
        apiCuocHenKhamBenh.getById(record.id).catch(() => null),
        apiHoaDon.getByCuocHenKham(record.id).catch(() => null),
      ]);
      setDetailData({
        base: record,
        cuocHen,
        hoaDon,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const openTuVanDetail = async (record) => {
    if (!record?.id) return;
    setDetailType("tu_van");
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const [cuocHen, hoaDon] = await Promise.all([
        apiCuocHenTuVan.getById(record.id).catch(() => null),
        apiHoaDon.getByCuocHenTuVan(record.id).catch(() => null),
      ]);
      setDetailData({
        base: record,
        cuocHen,
        hoaDon,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // ======================= USE EFFECT ==========================
  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        // Load chuyên khoa một lần
        const ckMap = await loadChuyenKhoaMap();
        if (!isMounted) return;

        // Load tất cả appointments trước
        let respKham, respTuVan;
        if (patientId && apiCuocHenKhamBenh.getByBenhNhan) {
          respKham = await apiCuocHenKhamBenh.getByBenhNhan(patientId);
        } else {
          respKham = await apiCuocHenKhamBenh.getAll();
        }

        if (patientId && apiCuocHenTuVan.getByBenhNhan) {
          respTuVan = await apiCuocHenTuVan.getByBenhNhan(patientId);
        } else {
          respTuVan = await apiCuocHenTuVan.getAll();
        }

        if (!isMounted) return;

        const rawKham = unwrap(respKham) || [];
        const rawTuVan = unwrap(respTuVan) || [];

        // Batch load khung giờ và người dùng cho cả hai loại
        const allRaw = [...rawKham, ...rawTuVan];
        const [khungGioMap, nguoiDungMap] = await Promise.all([
          loadKhungGioMap(allRaw),
          loadNguoiDungMap(allRaw),
        ]);

        if (!isMounted) return;

        // Load dữ liệu đã được enrich
        await Promise.all([
          loadLichKhamBenh(ckMap, khungGioMap, nguoiDungMap),
          loadLichTuVan(khungGioMap, nguoiDungMap),
        ]);
      } catch (err) {
        console.error("Lỗi load dữ liệu:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const khamColumns = [
    {
      title: "Ngày khám",
      dataIndex: "ngay_kham",
      key: "ngay_kham",
      render: (text) => formatDate(text),
    },
    {
      title: "Thời gian",
      key: "thoi_gian",
      render: (_, record) => `${record.gio_bat_dau} - ${record.gio_ket_thuc}`,
    },
    {
      title: "Phòng / Tầng",
      dataIndex: "phong_kham",
      key: "phong_kham",
      render: (text) => {
        // Nếu phong_kham đã được format thành string từ backend
        if (typeof text === 'string') {
          return text || "—";
        }
        // Nếu phong_kham là object
        if (text && typeof text === 'object') {
          const parts = [];
          if (text.ten_phong) parts.push(text.ten_phong);
          if (text.so_phong) parts.push(`P.${text.so_phong}`);
          if (text.tang) parts.push(`Tầng ${text.tang}`);
          return parts.join(" - ") || "—";
        }
        return "—";
      },
    },
    {
      title: "Bác sĩ",
      dataIndex: "ten_bac_si",
      key: "ten_bac_si",
    },
    {
      title: "Chuyên khoa",
      dataIndex: "ten_chuyen_khoa",
      key: "ten_chuyen_khoa",
    },
    {
      title: "Loại hẹn",
      dataIndex: "loai_hen",
      key: "loai_hen",
      render: (text) => {
        if (text === "Online") {
          return (
            <Tag color="blue" icon={<VideoCameraOutlined />}>
              Online
            </Tag>
          );
        } else if (text === "Trực tiếp") {
          return (
            <Tag color="green" icon={<HomeOutlined />}>
              Trực tiếp
            </Tag>
          );
        }
        return <Tag>{text || "—"}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "_raw_trang_thai",
      key: "trang_thai",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openKhamDetail(record)}>
            Xem chi tiết
          </Button>
          {record._raw_trang_thai !== "da_huy" &&
            record._raw_trang_thai !== "da_hoan_thanh" && (
          <Popconfirm
            title="Bạn có chắc muốn hủy lịch khám này?"
            onConfirm={() => handleCancelKham(record.id)}
            okText="Có"
            cancelText="Không"
          >
                <Button danger icon={<CloseCircleOutlined />} size="small">
              Hủy
            </Button>
          </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  const tuVanColumns = [
    {
      title: "Ngày tư vấn",
      dataIndex: "ngay_kham",
      key: "ngay_kham",
      render: (text) => formatDate(text),
    },
    {
      title: "Thời gian",
      key: "thoi_gian",
      render: (_, record) => `${record.gio_bat_dau} - ${record.gio_ket_thuc}`,
    },
    {
      title: "Phòng / Tầng",
      dataIndex: "phong_kham",
      key: "phong_kham",
      render: (text) => {
        // Nếu phong_kham đã được format thành string từ backend
        if (typeof text === 'string') {
          return text || "—";
        }
        // Nếu phong_kham là object
        if (text && typeof text === 'object') {
          const parts = [];
          if (text.ten_phong) parts.push(text.ten_phong);
          if (text.so_phong) parts.push(`P.${text.so_phong}`);
          if (text.tang) parts.push(`Tầng ${text.tang}`);
          return parts.join(" - ") || "—";
        }
        return "—";
      },
    },
    {
      title: "Chuyên gia",
      dataIndex: "ten_chuyen_gia",
      key: "ten_chuyen_gia",
    },
    {
      title: "Loại tư vấn",
      dataIndex: "loai_dinh_duong",
      key: "loai_dinh_duong",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Loại hẹn",
      dataIndex: "loai_hen",
      key: "loai_hen",
      render: (text) => {
        if (text === "Online") {
          return (
            <Tag color="blue" icon={<VideoCameraOutlined />}>
              Online
            </Tag>
          );
        } else if (text === "Trực tiếp") {
          return (
            <Tag color="green" icon={<HomeOutlined />}>
              Trực tiếp
            </Tag>
          );
        }
        return <Tag>{text || "—"}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "_raw_trang_thai",
      key: "trang_thai",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openTuVanDetail(record)}>
            Xem chi tiết
          </Button>
          {record._raw_trang_thai !== "da_huy" &&
            record._raw_trang_thai !== "da_hoan_thanh" && (
          <Popconfirm
            title="Bạn có chắc muốn hủy lịch tư vấn này?"
            onConfirm={() => handleCancelTuVan(record.id)}
            okText="Có"
            cancelText="Không"
          >
                <Button danger icon={<CloseCircleOutlined />} size="small">
              Hủy
            </Button>
          </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "kham",
      label: (
        <Space>
          <CalendarOutlined />
          <span>Lịch Hẹn Khám Bệnh</span>
        </Space>
      ),
      children: (
        <Card>
          {loadingKham ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : lichKham.length === 0 ? (
            <Empty description="Không có lịch hẹn khám bệnh" />
          ) : (
            <Table
              columns={khamColumns}
              dataSource={lichKham}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ),
    },
    {
      key: "dinhduong",
      label: (
        <Space>
          <AppleOutlined />
          <span>Lịch Hẹn Tư Vấn Dinh Dưỡng</span>
        </Space>
      ),
      children: (
        <Card>
          {loadingTuVan ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
        </div>
          ) : lichTuVan.length === 0 ? (
            <Empty description="Không có lịch tư vấn dinh dưỡng" />
          ) : (
            <Table
              columns={tuVanColumns}
              dataSource={lichTuVan}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 32 }}>
          Quản lý lịch hẹn
        </Title>
        <Tabs
          activeKey={selectedTab}
          onChange={setSelectedTab}
          items={tabItems}
          size="large"
        />
      </div>

      <Modal
        open={detailVisible}
        title={detailType === "kham" ? "Chi tiết lịch khám" : "Chi tiết lịch tư vấn"}
        onCancel={() => {
          setDetailVisible(false);
          setDetailData(null);
        }}
        footer={null}
        width={720}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin />
          </div>
        ) : detailData ? (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Mã cuộc hẹn">
                {detailData.cuocHen?.id_cuoc_hen || detailData.base?.id || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày">
                {formatDate(detailData.cuocHen?.ngay_kham || detailData.base?.ngay_kham)}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ">
                {detailData.cuocHen?.khungGio
                  ? `${detailData.cuocHen.khungGio.gio_bat_dau} - ${detailData.cuocHen.khungGio.gio_ket_thuc}`
                  : `${detailData.base?.gio_bat_dau || "—"} - ${detailData.base?.gio_ket_thuc || "—"}`}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng / Tầng">
                {detailData.base?.phong_kham || "—"}
              </Descriptions.Item>
              {detailType === "kham" ? (
                <>
                  <Descriptions.Item label="Bác sĩ">
                    {detailData.base?.ten_bac_si || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuyên khoa">
                    {detailData.base?.ten_chuyen_khoa || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do khám">
                    {detailData.cuocHen?.ly_do_kham || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Triệu chứng">
                    {detailData.cuocHen?.trieu_chung || "—"}
                  </Descriptions.Item>
                </>
              ) : (
                <>
                  <Descriptions.Item label="Chuyên gia">
                    {detailData.base?.ten_chuyen_gia || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại dinh dưỡng / tư vấn">
                    {detailData.base?.loai_dinh_duong || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do tư vấn">
                    {detailData.cuocHen?.ly_do_tu_van || "—"}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Hình thức">
                {loaiHenLabel(detailData.cuocHen?.loai_hen || detailData.base?.loai_hen)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(detailData.cuocHen?.trang_thai || detailData.base?._raw_trang_thai)}
              </Descriptions.Item>
            </Descriptions>

            {detailData.hoaDon && (
              <>
                <div style={{ height: 16 }} />
                <Descriptions column={1} size="small" bordered title="Thông tin hóa đơn (nếu có)">
                  <Descriptions.Item label="Mã hóa đơn">
                    {detailData.hoaDon.id_hoa_don}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    {parseFloat(detailData.hoaDon.tong_tien || 0).toLocaleString("vi-VN")} đ
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái hóa đơn">
                    {detailData.hoaDon.trang_thai}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </>
        ) : (
          <Empty description="Không có dữ liệu chi tiết" />
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
