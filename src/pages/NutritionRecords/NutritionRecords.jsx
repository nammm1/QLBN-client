import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Typography,
  Modal,
  Row,
  Col,
  Tag,
  Space,
  Descriptions,
  Divider,
  Empty,
  Collapse,
  Spin,
  Tabs,
  Timeline,
  Badge,
  Statistic,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  AppleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  PrinterOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./NutritionRecords.css";
import apiHoSoDinhDuong from "../../api/HoSoDinhDuong";
import apiBenhNhan from "../../api/BenhNhan";
import apiNguoiDung from "../../api/NguoiDung";
import apiLichSuTuVan from "../../api/LichSuTuVan";
import apiTheoDoiTienDo from "../../api/TheoDoiTienDo";
import apiCuocHenTuVan from "../../api/CuocHenTuVan";
import apiHoaDon from "../../api/HoaDon";
import apiThucDonChiTiet from "../../api/ThucDonChiTiet";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return isNaN(d)
      ? "—"
      : d.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return "—";
  }
};

const unwrap = (res) => {
  if (res?.data !== undefined) return res.data;
  return res ?? null;
};

const NutritionRecords = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [personalInfo, setPersonalInfo] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const patientId =
    userInfo?.user?.id_benh_nhan ||
    userInfo?.user?.id_nguoi_dung ||
    null;

  // Load dữ liệu
  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Load thông tin bệnh nhân
        let personalInfoData = null;
        const benhNhanRes = await apiBenhNhan.getById(patientId).catch(() => null);
        const benhNhan = unwrap(benhNhanRes);
        
        if (benhNhan) {
          const userInfoData = await apiNguoiDung.getUserById(patientId).catch(() => ({}));
          const userData = unwrap(userInfoData) || {};
          
          personalInfoData = {
            ho_ten: benhNhan.ho_ten || userData.ho_ten || "—",
            gioi_tinh: benhNhan.gioi_tinh || userData.gioi_tinh || "—",
            tuoi: benhNhan.tuoi || "—",
            ngay_sinh: benhNhan.ngay_sinh || userData.ngay_sinh || null,
            dan_toc: benhNhan.dan_toc || userData.dan_toc || "—",
            so_dien_thoai: benhNhan.so_dien_thoai || userData.so_dien_thoai || "—",
            dia_chi: benhNhan.dia_chi || userData.dia_chi || "—",
            ma_BHYT: benhNhan.ma_BHYT || "—",
          };
        }

        // 2. Load hồ sơ dinh dưỡng (lấy cái mới nhất)
        const hoSoRes = await apiHoSoDinhDuong.getByBenhNhan(patientId).catch(() => null);
        // API có thể trả về object (findOne) hoặc array (findAll)
        let hoSoList = [];
        if (hoSoRes) {
          if (Array.isArray(hoSoRes)) {
            hoSoList = hoSoRes;
          } else {
            // Nếu là object, chuyển thành array
            hoSoList = [hoSoRes];
          }
        }
        
        // Nếu chưa có thông tin cá nhân từ API bệnh nhân, thử lấy từ hồ sơ
        if (!personalInfoData && hoSoList.length > 0) {
          const latestHoSo = hoSoList[0];
          personalInfoData = {
            ho_ten: latestHoSo.ho_ten || "—",
            gioi_tinh: latestHoSo.gioi_tinh || "—",
            tuoi: latestHoSo.tuoi || "—",
            ngay_sinh: latestHoSo.ngay_sinh || null,
            dan_toc: latestHoSo.dan_toc || "—",
            so_dien_thoai: latestHoSo.so_dien_thoai || "—",
            dia_chi: latestHoSo.dia_chi || "—",
            ma_BHYT: latestHoSo.ma_BHYT || "—",
          };
        }
        
        if (personalInfoData) {
          setPersonalInfo(personalInfoData);
        }

        // 3. Load lịch sử tư vấn để lấy thông tin mới nhất (kế hoạch dinh dưỡng, nhu cầu calo, etc.)
        const lichSuRes = await apiLichSuTuVan.getLichSuTuVanByBenhNhan(patientId).catch(() => []);
        const lichSuList = Array.isArray(lichSuRes) ? lichSuRes : (unwrap(lichSuRes) || []);
        
        // Tìm lịch sử tư vấn mới nhất có đầy đủ thông tin
        const latestLichSu = lichSuList.length > 0 
          ? [...lichSuList].sort((a, b) => {
              const dateA = new Date(a.thoi_gian_tu_van || a.ngay_tao || 0);
              const dateB = new Date(b.thoi_gian_tu_van || b.ngay_tao || 0);
              return dateB - dateA;
            })[0]
          : null;
        
        if (hoSoList.length > 0) {
          const latestHoSo = hoSoList[hoSoList.length - 1]; // Lấy hồ sơ mới nhất
          let ten_chuyen_gia = "—";
          
          if (latestHoSo.id_chuyen_gia) {
            try {
              const cgRes = await apiNguoiDung.getUserById(latestHoSo.id_chuyen_gia);
              const cgData = unwrap(cgRes);
              ten_chuyen_gia = cgData?.ho_ten || "—";
            } catch {}
          }

          // Ưu tiên lấy dữ liệu từ lịch sử tư vấn mới nhất, nếu không có thì lấy từ hồ sơ
          setNutritionProfile({
            id_ho_so: latestHoSo.id_ho_so || latestHoSo.id,
            ngay_tao: latestHoSo.ngay_tao,
            chuyen_gia: ten_chuyen_gia,
            loai_tu_van: latestLichSu?.loai_tu_van || latestHoSo.loai_tu_van || latestHoSo.loai_dinh_duong || "—",
            chi_so: {
              chieu_cao: latestHoSo.chieu_cao,
              can_nang: latestHoSo.can_nang,
              vong_eo: latestHoSo.vong_eo,
              mo_co_the: latestHoSo.mo_co_the,
              khoi_co: latestHoSo.khoi_co,
              nuoc_trong_co_the: latestHoSo.nuoc_trong_co_the,
            },
            nhan_xet: latestLichSu?.ket_qua_cls || latestLichSu?.nhan_xet || latestHoSo.nhan_xet || "—",
            ke_hoach_dinh_duong: latestLichSu?.ke_hoach_dinh_duong || latestHoSo.ke_hoach_dinh_duong || "—",
            nhu_cau_calo: latestLichSu?.nhu_cau_calo || latestHoSo.nhu_cau_calo || 0,
            cham_soc: latestLichSu?.cham_soc || latestHoSo.cham_soc || "—",
            ghi_chu: latestLichSu?.ghi_chu || latestHoSo.ghi_chu || "—",
            muc_tieu_dinh_duong: latestLichSu?.muc_tieu_dinh_duong || "—",
          });
        } else if (latestLichSu) {
          // Nếu không có hồ sơ nhưng có lịch sử tư vấn, vẫn hiển thị thông tin
          let ten_chuyen_gia = "—";
          if (latestLichSu.id_chuyen_gia) {
            try {
              const cgRes = await apiNguoiDung.getUserById(latestLichSu.id_chuyen_gia);
              const cgData = unwrap(cgRes);
              ten_chuyen_gia = cgData?.ho_ten || "—";
            } catch {}
          }

          setNutritionProfile({
            id_ho_so: latestLichSu.id_ho_so || null,
            ngay_tao: latestLichSu.thoi_gian_tu_van || latestLichSu.ngay_tao,
            chuyen_gia: ten_chuyen_gia,
            loai_tu_van: latestLichSu.loai_tu_van || "—",
            chi_so: {
              chieu_cao: null,
              can_nang: null,
              vong_eo: null,
              mo_co_the: null,
              khoi_co: null,
              nuoc_trong_co_the: null,
            },
            nhan_xet: latestLichSu.ket_qua_cls || latestLichSu.nhan_xet || "—",
            ke_hoach_dinh_duong: latestLichSu.ke_hoach_dinh_duong || "—",
            nhu_cau_calo: latestLichSu.nhu_cau_calo || 0,
            cham_soc: latestLichSu.cham_soc || "—",
            ghi_chu: latestLichSu.ghi_chu || "—",
            muc_tieu_dinh_duong: latestLichSu.muc_tieu_dinh_duong || "—",
          });
        }

        // 4. Load lịch sử tư vấn và cuộc hẹn (đã load ở bước 3, tái sử dụng)
        // lichSuList đã được khai báo ở bước 3, không cần khai báo lại

        const cuocHenRes = await apiCuocHenTuVan.getByBenhNhan(patientId).catch(() => []);
        const cuocHenList = Array.isArray(cuocHenRes) ? cuocHenRes : (unwrap(cuocHenRes) || []);

        // Kết hợp lịch sử và cuộc hẹn
        const enrichedHistory = await Promise.all(
          lichSuList.map(async (ls) => {
            // Tìm cuộc hẹn tương ứng
            const cuocHen = cuocHenList.find(
              (ch) => ch.id_cuoc_hen === ls.id_cuoc_hen
            );

            // Lấy thực đơn
            let thucDon = {};
            try {
              const thucDonRes = await apiThucDonChiTiet.getByLichSu(ls.id_lich_su);
              const thucDonList = Array.isArray(thucDonRes) ? thucDonRes : (unwrap(thucDonRes) || []);
              
              thucDonList.forEach((td) => {
                if (td.bua_an) {
                  if (!thucDon[td.bua_an]) {
                    thucDon[td.bua_an] = [];
                  }
                  // Lưu thông tin đầy đủ của món ăn (hoặc chỉ tên nếu không có chi tiết)
                  const monAn = td.ten_mon || td.mon_an || td;
                  thucDon[td.bua_an].push(monAn);
                }
              });
            } catch (err) {
              console.error("Lỗi khi lấy thực đơn:", err);
            }

            // Lấy hóa đơn
            let hoaDon = null;
            let chiTietHoaDon = [];
            if (cuocHen?.id_cuoc_hen) {
              try {
                const hoaDonRes = await apiHoaDon.getByCuocHenTuVan(cuocHen.id_cuoc_hen);
                hoaDon = unwrap(hoaDonRes);
                
                if (hoaDon?.id_hoa_don) {
                  // Lấy chi tiết hóa đơn từ response (nếu có)
                  chiTietHoaDon = hoaDon.chi_tiet || [];
                }
              } catch (err) {
                console.error("Lỗi khi lấy hóa đơn:", err);
              }
            }

            // Lấy tiến độ theo dõi
            let tienDo = [];
            try {
              const tienDoRes = await apiTheoDoiTienDo.getByLichSu(ls.id_lich_su);
              tienDo = Array.isArray(tienDoRes) ? tienDoRes : (unwrap(tienDoRes) || []);
            } catch (err) {
              console.error("Lỗi khi lấy tiến độ:", err);
            }

            return {
              id_lich_su: ls.id_lich_su,
              id_cuoc_hen: ls.id_cuoc_hen || cuocHen?.id_cuoc_hen,
              ngay_tu_van: ls.thoi_gian_tu_van || ls.thoi_gian_tao || cuocHen?.ngay_kham || ls.ngay_tao,
              trang_thai_cuoc_hen: cuocHen?.trang_thai || "—",
              loai_tu_van: ls.loai_tu_van || "—",
              phuong_thuc: cuocHen?.loai_hen === "truc_tiep" ? "Trực tiếp" : cuocHen?.loai_hen === "online" ? "Online" : "—",
              nhan_xet: ls.nhan_xet || ls.ket_qua_cls || "—",
              thuc_don: thucDon,
              hoa_don: hoaDon,
              chi_tiet_hoa_don: chiTietHoaDon,
              tien_do: tienDo,
              ho_so_id: ls.id_ho_so,
              // Lưu thêm các thông tin khác từ lịch sử
              ke_hoach_dinh_duong: ls.ke_hoach_dinh_duong,
              nhu_cau_calo: ls.nhu_cau_calo,
              cham_soc: ls.cham_soc,
              ghi_chu: ls.ghi_chu,
              muc_tieu_dinh_duong: ls.muc_tieu_dinh_duong,
            };
          })
        );

        // Sắp xếp theo ngày (mới nhất trước)
        enrichedHistory.sort((a, b) => {
          const dateA = new Date(a.ngay_tu_van || 0);
          const dateB = new Date(b.ngay_tu_van || 0);
          return dateB - dateA;
        });

        setAppointmentHistory(enrichedHistory);

        // 5. Load dữ liệu tiến độ cho biểu đồ
        const tienDoRes = await apiTheoDoiTienDo.getByBenhNhan(patientId).catch(() => []);
        const tienDoList = Array.isArray(tienDoRes) ? tienDoRes : (unwrap(tienDoRes) || []);

        // Chuẩn bị dữ liệu cho biểu đồ
        const chartData = tienDoList
          .sort((a, b) => {
            const dateA = new Date(a.ngay_kham || 0);
            const dateB = new Date(b.ngay_kham || 0);
            return dateA - dateB;
          })
          .map((td) => ({
            date: formatDate(td.ngay_kham),
            canNang: td.can_nang || null,
            chiSoBMI: td.chi_so_BMI || null,
            vongEo: td.vong_eo || null,
            moCoThe: td.mo_co_the || null,
          }));

        setProgressData(chartData);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Tính BMI
  const calculateBMI = (canNang, chieuCao) => {
    if (!canNang || !chieuCao) return null;
    const heightInMeters = chieuCao / 100;
    return (canNang / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Xử lý click xem chi tiết
  const handleViewDetail = async (record) => {
    setSelectedAppointment(record);
    setModalVisible(true);
  };

  // Render biểu đồ tiến độ
  const renderProgressChart = () => {
    if (progressData.length === 0) {
      return (
        <Empty
          description="Chưa có dữ liệu theo dõi tiến độ"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="progress-chart-container">
        <Row gutter={[24, 24]}>
          {progressData.some((d) => d.canNang !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ Cân nặng (kg)" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="canNang"
                      stroke="#52c41a"
                      fill="#52c41a"
                      fillOpacity={0.3}
                      name="Cân nặng (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {progressData.some((d) => d.chiSoBMI !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ BMI" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="chiSoBMI"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="BMI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {progressData.some((d) => d.vongEo !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ Vòng eo (cm)" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="vongEo"
                      stroke="#ff7875"
                      fill="#ff7875"
                      fillOpacity={0.3}
                      name="Vòng eo (cm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {progressData.some((d) => d.moCoThe !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ Mỡ cơ thể (%)" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="moCoThe"
                      stroke="#faad14"
                      strokeWidth={2}
                      name="Mỡ cơ thể (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // Render lịch sử khám
  const renderAppointmentHistory = () => {
    if (appointmentHistory.length === 0) {
      return (
        <Empty
          description="Chưa có lịch sử tư vấn dinh dưỡng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="appointment-history-container">
        <Timeline mode="left">
          {appointmentHistory.map((appt, index) => {
            const getStatusColor = (status) => {
              switch (status) {
                case "da_hoan_thanh":
                  return "green";
                case "da_dat":
                  return "blue";
                case "da_huy":
                  return "red";
                default:
                  return "default";
              }
            };

            const getStatusText = (status) => {
              switch (status) {
                case "da_hoan_thanh":
                  return "Đã hoàn thành";
                case "da_dat":
                  return "Đã đặt";
                case "da_huy":
                  return "Đã hủy";
                default:
                  return status || "—";
              }
            };

            return (
              <Timeline.Item
                key={appt.id_lich_su || index}
                color={getStatusColor(appt.trang_thai_cuoc_hen)}
                dot={
                  <Badge
                    status={
                      appt.trang_thai_cuoc_hen === "da_hoan_thanh"
                        ? "success"
                        : appt.trang_thai_cuoc_hen === "da_huy"
                        ? "error"
                        : "processing"
                    }
                  />
                }
              >
                <Card
                  className="appointment-card"
                  hoverable
                  onClick={() => handleViewDetail(appt)}
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Space direction="vertical" size="small">
                        <Text strong>
                          <CalendarOutlined /> Ngày tư vấn: {formatDateTime(appt.ngay_tu_van)}
                        </Text>
                        <Tag color={getStatusColor(appt.trang_thai_cuoc_hen)}>
                          {getStatusText(appt.trang_thai_cuoc_hen)}
                        </Tag>
                        {appt.loai_tu_van && (
                          <Tag color="purple">{appt.loai_tu_van}</Tag>
                        )}
                        {appt.phuong_thuc && (
                          <Tag color="cyan">{appt.phuong_thuc}</Tag>
                        )}
                      </Space>
                    </Col>
                    <Col xs={24} sm={12} style={{ textAlign: "right" }}>
                      <Space>
                        {appt.hoa_don && (
                          <Badge count={appt.chi_tiet_hoa_don?.length || 0} showZero>
                            <Tag icon={<ShoppingCartOutlined />} color="orange">
                              Hóa đơn
                            </Tag>
                          </Badge>
                        )}
                        {Object.keys(appt.thuc_don || {}).length > 0 && (
                          <Tag icon={<AppleOutlined />} color="green">
                            Có thực đơn
                          </Tag>
                        )}
                        {appt.tien_do?.length > 0 && (
                          <Tag icon={<TrophyOutlined />} color="gold">
                            Có tiến độ
                          </Tag>
                        )}
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(appt);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="nutrition-records-loading">
        <Spin spinning={true} size="large" tip="Đang tải dữ liệu...">
          <div style={{ minHeight: 200 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="nutrition-records-page">
      <div className="nutrition-records-container">
        {/* Header */}
        <div className="nutrition-records-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/patient-function")}
            className="back-button"
          >
            Quay lại
          </Button>
          <Title level={1} className="page-title">
            <AppleOutlined /> HỒ SƠ DINH DƯỠNG
          </Title>
        </div>

        {/* Thông tin cá nhân */}
        {personalInfo && (
          <Card className="personal-info-card" style={{ marginBottom: 24 }}>
            <Title level={4} className="section-title">
              <UserOutlined /> Thông tin cá nhân
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Họ tên">{personalInfo.ho_ten}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Tag color={personalInfo.gioi_tinh === "Nam" ? "blue" : "pink"}>
                  {personalInfo.gioi_tinh}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">{personalInfo.tuoi}</Descriptions.Item>
              <Descriptions.Item label="Dân tộc">{personalInfo.dan_toc}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{personalInfo.so_dien_thoai}</Descriptions.Item>
              <Descriptions.Item label="Mã BHYT">{personalInfo.ma_BHYT}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={3}>
                {personalInfo.dia_chi}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="nutrition-tabs"
          items={[
            {
              key: "profile",
              label: (
                <span>
                  <FileTextOutlined /> Hồ sơ dinh dưỡng
                </span>
              ),
              children: nutritionProfile ? (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card title="Thông tin tư vấn" className="info-card">
                      <Descriptions column={1} size="middle">
                        <Descriptions.Item label="Ngày tạo">
                          {formatDate(nutritionProfile.ngay_tao)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chuyên gia">
                          {nutritionProfile.chuyen_gia || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại tư vấn">
                          {nutritionProfile.loai_tu_van && nutritionProfile.loai_tu_van !== "—" ? (
                            <Tag color={nutritionProfile.loai_tu_van === "Giảm cân" ? "red" : 
                                    nutritionProfile.loai_tu_van === "Tăng cân" ? "green" : "blue"}>
                              {nutritionProfile.loai_tu_van}
                            </Tag>
                          ) : (
                            <Text type="secondary" style={{ fontStyle: 'italic' }}>—</Text>
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="Các chỉ số cơ thể" className="info-card body-metrics-card" style={{ marginTop: 16 }}>
                      <Row gutter={[16, 16]}>
                        {nutritionProfile.chi_so.chieu_cao ? (
                          <Col xs={12} sm={8}>
                            <Statistic
                              title="Chiều cao"
                              value={nutritionProfile.chi_so.chieu_cao}
                              suffix="cm"
                              valueStyle={{ color: "#1890ff" }}
                            />
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.can_nang ? (
                          <Col xs={12} sm={8}>
                            <Statistic
                              title="Cân nặng"
                              value={nutritionProfile.chi_so.can_nang}
                              suffix="kg"
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.can_nang &&
                          nutritionProfile.chi_so.chieu_cao ? (
                            <Col xs={12} sm={8}>
                              <Statistic
                                title="BMI"
                                value={calculateBMI(
                                  nutritionProfile.chi_so.can_nang,
                                  nutritionProfile.chi_so.chieu_cao
                                )}
                                valueStyle={{ color: "#faad14" }}
                              />
                            </Col>
                          ) : null}
                        {nutritionProfile.chi_so.vong_eo ? (
                          <Col xs={12} sm={8}>
                            <Statistic
                              title="Vòng eo"
                              value={nutritionProfile.chi_so.vong_eo}
                              suffix="cm"
                              valueStyle={{ color: "#ff7875" }}
                            />
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.mo_co_the ? (
                          <Col xs={12} sm={8}>
                            <Statistic
                              title="Mỡ cơ thể"
                              value={nutritionProfile.chi_so.mo_co_the}
                              suffix="%"
                              valueStyle={{ color: "#faad14" }}
                            />
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.khoi_co ? (
                          <Col xs={12} sm={8}>
                            <Statistic
                              title="Khối cơ"
                              value={nutritionProfile.chi_so.khoi_co}
                              suffix="kg"
                              valueStyle={{ color: "#722ed1" }}
                            />
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.nuoc_trong_co_the ? (
                          <Col xs={12} sm={8}>
                            <Statistic
                              title="Nước trong cơ thể"
                              value={nutritionProfile.chi_so.nuoc_trong_co_the}
                              suffix="%"
                              valueStyle={{ color: "#13c2c2" }}
                            />
                          </Col>
                        ) : null}
                        {!nutritionProfile.chi_so.chieu_cao && 
                         !nutritionProfile.chi_so.can_nang && 
                         !nutritionProfile.chi_so.vong_eo && 
                         !nutritionProfile.chi_so.mo_co_the && 
                         !nutritionProfile.chi_so.khoi_co && 
                         !nutritionProfile.chi_so.nuoc_trong_co_the && (
                          <Col xs={24}>
                            <Empty 
                              description="Chưa có thông tin chỉ số cơ thể" 
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              style={{ padding: "20px 0" }}
                            />
                          </Col>
                        )}
                      </Row>
                    </Card>

                    {nutritionProfile.nhu_cau_calo > 0 && (
        <Card
                        title="Nhu cầu calo hàng ngày"
                        className="info-card highlight-card"
                        style={{ marginTop: 16 }}
                      >
                        <Statistic
                          value={nutritionProfile.nhu_cau_calo}
                          suffix="kcal/ngày"
                          valueStyle={{ fontSize: 28, color: "#f5222d", textAlign: "center" }}
                        />
                      </Card>
                    )}
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Nhận xét" className="info-card">
                      {nutritionProfile.nhan_xet && nutritionProfile.nhan_xet !== "—" ? (
                        <div style={{ 
                          padding: "12px 16px", 
                          background: "#f0f5ff",
                          borderRadius: "8px",
                          border: "1px solid #adc6ff",
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.8',
                          color: '#2d3436',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }}>
                          {nutritionProfile.nhan_xet}
                        </div>
                      ) : (
                        <div style={{ 
                          padding: "20px", 
                          textAlign: "center",
                          background: "#fafafa",
                          borderRadius: "8px",
                          border: "1px dashed #d9d9d9"
                        }}>
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                            Chưa có nhận xét
                          </Text>
                        </div>
                      )}
                    </Card>

                    <Card title="Kế hoạch dinh dưỡng" className="info-card nutrition-plan-card" style={{ marginTop: 16 }}>
                      {nutritionProfile.ke_hoach_dinh_duong && nutritionProfile.ke_hoach_dinh_duong !== "—" ? (
                        <div style={{ 
                          padding: "12px 16px", 
                          background: "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
                          borderRadius: "8px",
                          border: "1px solid #d9f7be",
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.8',
                          color: '#2d3436',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }}>
                          {nutritionProfile.ke_hoach_dinh_duong}
                        </div>
                      ) : (
                        <div style={{ 
                          padding: "20px", 
                          textAlign: "center",
                          background: "#fafafa",
                          borderRadius: "8px",
                          border: "1px dashed #d9d9d9"
                        }}>
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                            Chưa có kế hoạch dinh dưỡng
                          </Text>
                        </div>
                      )}
                    </Card>

                    {nutritionProfile.muc_tieu_dinh_duong && nutritionProfile.muc_tieu_dinh_duong !== "—" && (
                      <Card title="Mục tiêu dinh dưỡng" className="info-card" style={{ marginTop: 16 }}>
                        <div style={{ 
                          padding: "12px 16px", 
                          background: "#fff7e6",
                          borderRadius: "8px",
                          border: "1px solid #ffe58f",
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: '1.8',
                          color: '#2d3436'
                        }}>
                          {nutritionProfile.muc_tieu_dinh_duong}
                        </div>
                      </Card>
                    )}

                    <Card title="Chăm sóc" className="info-card" style={{ marginTop: 16 }}>
                      {nutritionProfile.cham_soc && nutritionProfile.cham_soc !== "—" ? (
                        <div style={{ 
                          padding: "12px 16px", 
                          background: "#fff1f0",
                          borderRadius: "8px",
                          border: "1px solid #ffccc7",
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: '1.8',
                          color: '#2d3436'
                        }}>
                          {nutritionProfile.cham_soc}
                        </div>
                      ) : (
                        <div style={{ 
                          padding: "20px", 
                          textAlign: "center",
                          background: "#fafafa",
                          borderRadius: "8px",
                          border: "1px dashed #d9d9d9"
                        }}>
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                            Chưa có thông tin chăm sóc
                          </Text>
                        </div>
                      )}
                    </Card>

                    {nutritionProfile.ghi_chu && nutritionProfile.ghi_chu !== "—" && (
                      <Card title="Ghi chú" className="info-card" style={{ marginTop: 16 }}>
                        <div style={{ 
                          padding: "12px 16px", 
                          background: "#f6ffed",
                          borderRadius: "8px",
                          border: "1px solid #b7eb8f",
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: '1.8',
                          color: '#2d3436'
                        }}>
                          {nutritionProfile.ghi_chu}
                        </div>
                      </Card>
                    )}
                  </Col>
                </Row>
              ) : (
                <Empty
                  description="Chưa có hồ sơ dinh dưỡng"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            },
            {
              key: "progress",
              label: (
                <span>
                  <RiseOutlined /> Biểu đồ tiến độ
                </span>
              ),
              children: renderProgressChart(),
            },
            {
              key: "history",
              label: (
                <span>
                  <CalendarOutlined /> Lịch sử khám
                </span>
              ),
              children: renderAppointmentHistory(),
            },
          ]}
        />
      </div>

      {/* Modal chi tiết cuộc hẹn */}
      <Modal
        title={
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined /> Chi tiết tư vấn dinh dưỡng
          </Title>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedAppointment(null);
        }}
        footer={null}
        width={1000}
        className="appointment-detail-modal"
      >
        {selectedAppointment && (
          <div className="appointment-detail-content">
            <Row gutter={[24, 24]}>
              {/* Thông tin cuộc hẹn */}
              <Col xs={24}>
                <Card title="Thông tin cuộc hẹn" size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Ngày tư vấn">
                      {formatDateTime(selectedAppointment.ngay_tu_van)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={
                          selectedAppointment.trang_thai_cuoc_hen === "da_hoan_thanh"
                            ? "green"
                            : selectedAppointment.trang_thai_cuoc_hen === "da_huy"
                            ? "red"
                            : "blue"
                        }
                      >
                        {selectedAppointment.trang_thai_cuoc_hen === "da_hoan_thanh"
                          ? "Đã hoàn thành"
                          : selectedAppointment.trang_thai_cuoc_hen === "da_huy"
                          ? "Đã hủy"
                          : "Đã đặt"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại tư vấn">
                      {selectedAppointment.loai_tu_van}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức">
                      {selectedAppointment.phuong_thuc}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Nhận xét */}
              {selectedAppointment.nhan_xet && selectedAppointment.nhan_xet !== "—" && (
                <Col xs={24}>
                  <Card title="Nhận xét" size="small">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {selectedAppointment.nhan_xet}
                    </Paragraph>
                </Card>
                </Col>
              )}

              {/* Kế hoạch dinh dưỡng */}
              {selectedAppointment.ke_hoach_dinh_duong && selectedAppointment.ke_hoach_dinh_duong !== "—" && (
                <Col xs={24}>
                  <Card title="Kế hoạch dinh dưỡng" size="small">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {selectedAppointment.ke_hoach_dinh_duong}
                    </Paragraph>
                  </Card>
                </Col>
              )}

              {/* Chăm sóc */}
              {selectedAppointment.cham_soc && selectedAppointment.cham_soc !== "—" && (
                <Col xs={24}>
                  <Card title="Chăm sóc" size="small">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {selectedAppointment.cham_soc}
                    </Paragraph>
                  </Card>
                </Col>
              )}

              {/* Thực đơn */}
              {selectedAppointment.thuc_don &&
                Object.keys(selectedAppointment.thuc_don).length > 0 && (
                  <Col xs={24}>
                <Card
                      title={
                        <span>
                          <AppleOutlined /> Thực đơn
                        </span>
                      }
                  size="small"
                    >
                      <Row gutter={[16, 16]}>
                        {Object.entries(selectedAppointment.thuc_don).map(([bua, monAn]) => (
                          <Col xs={24} sm={12} key={bua}>
                <Card
                              title={bua}
                  size="small"
                              className="meal-card"
                            >
                              {Array.isArray(monAn) ? (
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                  {monAn.map((mon, idx) => {
                                    // Nếu mon là object, hiển thị thông tin chi tiết
                                    if (typeof mon === 'object' && mon !== null) {
                                      const tenMon = mon.ten_mon || mon.mon_an || '—';
                                      const khoiLuong = mon.khoi_luong;
                                      const calo = mon.calo;
                                      return (
                                        <li key={idx}>
                                          <Text strong>{tenMon}</Text>
                                          {khoiLuong && <Text type="secondary"> - {khoiLuong}g</Text>}
                                          {calo && <Text type="secondary"> ({calo} kcal)</Text>}
                                        </li>
                                      );
                                    }
                                    // Nếu mon là string, hiển thị bình thường
                                    return <li key={idx}>{mon}</li>;
                                  })}
                                </ul>
                              ) : (
                                <Paragraph>{monAn}</Paragraph>
                              )}
                </Card>
                          </Col>
                        ))}
                      </Row>
                </Card>
              </Col>
                )}

              {/* Hóa đơn */}
              {selectedAppointment.hoa_don && (
                <Col xs={24}>
            <Card
              title={
                      <span>
                        <ShoppingCartOutlined /> Hóa đơn
                      </span>
                    }
                    size="small"
                    extra={
                      selectedAppointment.hoa_don.trang_thai === "da_thanh_toan" ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Đã thanh toán
                        </Tag>
                      ) : (
                        <Tag color="warning" icon={<ClockCircleOutlined />}>
                          Chưa thanh toán
                        </Tag>
                      )
                    }
                  >
                    <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
                      <Descriptions.Item label="Mã hóa đơn">
                        {selectedAppointment.hoa_don.id_hoa_don}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">
                        {formatDateTime(selectedAppointment.hoa_don.thoi_gian_tao)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng tiền">
                        <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
                          {parseFloat(selectedAppointment.hoa_don.tong_tien || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>

                    {selectedAppointment.chi_tiet_hoa_don &&
                      selectedAppointment.chi_tiet_hoa_don.length > 0 && (
                        <>
                          <Divider>Chi tiết dịch vụ</Divider>
                          <Table
                            size="small"
                            pagination={false}
                            dataSource={selectedAppointment.chi_tiet_hoa_don.map((ct, idx) => ({
                              key: idx,
                              stt: idx + 1,
                              ten_dich_vu:
                                ct.dich_vu?.ten_dich_vu || ct.ten_dich_vu || "—",
                              so_luong: ct.so_luong || 0,
                              don_gia: parseFloat(ct.don_gia || 0).toLocaleString("vi-VN"),
                              thanh_tien: (
                                parseFloat(ct.so_luong || 0) * parseFloat(ct.don_gia || 0)
                              ).toLocaleString("vi-VN"),
                            }))}
                            columns={[
                              { title: "STT", dataIndex: "stt", width: 60 },
                              { title: "Tên dịch vụ", dataIndex: "ten_dich_vu" },
                              {
                                title: "Số lượng",
                                dataIndex: "so_luong",
                                width: 100,
                                align: "center",
                              },
                              {
                                title: "Đơn giá (VNĐ)",
                                dataIndex: "don_gia",
                                width: 120,
                                align: "right",
                              },
                              {
                                title: "Thành tiền (VNĐ)",
                                dataIndex: "thanh_tien",
                                width: 140,
                                align: "right",
                              },
                            ]}
                          />
                        </>
                      )}
                  </Card>
                </Col>
              )}

              {/* Tiến độ theo dõi */}
              {selectedAppointment.tien_do && selectedAppointment.tien_do.length > 0 && (
                <Col xs={24}>
                      <Card
                    title={
                      <span>
                        <TrophyOutlined /> Tiến độ theo dõi
                      </span>
                    }
                        size="small"
                  >
                    <Timeline>
                      {selectedAppointment.tien_do.map((td, idx) => (
                        <Timeline.Item key={idx} color="green">
                          <div style={{ paddingBottom: 8 }}>
                            <Text strong style={{ fontSize: 15 }}>{formatDate(td.ngay_kham)}</Text>
                            {(td.can_nang || td.chieu_cao || td.vong_eo || td.mo_co_the || td.khoi_co || td.nuoc_trong_co_the || td.chi_so_BMI) && (
                              <div style={{ marginTop: 8, lineHeight: 1.8 }}>
                                {td.can_nang && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Cân nặng:</Text> {td.can_nang} kg
                                  </Text>
                                )}
                                {td.chieu_cao && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Chiều cao:</Text> {td.chieu_cao} cm
                                  </Text>
                                )}
                                {td.chi_so_BMI && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>BMI:</Text> {td.chi_so_BMI}
                                  </Text>
                                )}
                                {td.vong_eo && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Vòng eo:</Text> {td.vong_eo} cm
                                  </Text>
                                )}
                                {td.mo_co_the && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Mỡ cơ thể:</Text> {td.mo_co_the}%
                                  </Text>
                                )}
                                {td.khoi_co && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Khối cơ:</Text> {td.khoi_co} kg
                                  </Text>
                                )}
                                {td.nuoc_trong_co_the && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Nước trong cơ thể:</Text> {td.nuoc_trong_co_the}%
                                  </Text>
                                )}
                              </div>
                            )}
                            {td.ghi_chu && (
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                  {td.ghi_chu}
                                </Text>
                              </div>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                      </Card>
                    </Col>
              )}
            </Row>
        </div>
      )}
      </Modal>
    </div>
  );
};

export default NutritionRecords;
