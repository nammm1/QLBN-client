import React, { useEffect, useState } from "react";
import { Tabs, Table, Typography, Button, Tag, Space, Card, Spin, Empty, Popconfirm, message } from "antd";
import { CalendarOutlined, AppleOutlined, CloseCircleOutlined, VideoCameraOutlined, HomeOutlined } from "@ant-design/icons";
import "./Appointments.css";
import apiCuocHenKhamBenh from "../../../api/CuocHenKhamBenh";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiNguoiDung from "../../../api/NguoiDung";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiKhungGioKham from "../../../api/KhungGioKham";
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

          let ten_chuyen_gia = "—";
          const cgId = it.id_chuyen_gia || it.id_nguoi_dung;
          if (cgId && apiNguoiDung.getUserById) {
            try {
              const eres = await apiNguoiDung.getUserById(cgId);
              const edata = unwrap(eres);
              ten_chuyen_gia = edata?.ho_ten || edata?.ten || "—";
            } catch {}
          }

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
      render: (_, record) =>
        record._raw_trang_thai !== "da_huy" &&
        record._raw_trang_thai !== "da_hoan_thanh" ? (
          <Popconfirm
            title="Bạn có chắc muốn hủy lịch khám này?"
            onConfirm={() => handleCancelKham(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
            >
              Hủy
            </Button>
          </Popconfirm>
        ) : null,
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
      render: (_, record) =>
        record._raw_trang_thai !== "da_huy" &&
        record._raw_trang_thai !== "da_hoan_thanh" ? (
          <Popconfirm
            title="Bạn có chắc muốn hủy lịch tư vấn này?"
            onConfirm={() => handleCancelTuVan(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
            >
              Hủy
            </Button>
          </Popconfirm>
        ) : null,
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
    </div>
  );
};

export default Appointments;
