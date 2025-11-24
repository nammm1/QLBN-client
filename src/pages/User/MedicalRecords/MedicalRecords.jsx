import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Collapse,
  Empty,
  Spin,
  Alert,
  List,
  message
} from "antd";
import { ArrowLeftOutlined, FileTextOutlined, MedicineBoxOutlined, HeartOutlined, CheckCircleOutlined, ExperimentOutlined, ShoppingOutlined, CalendarOutlined, WarningOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import "./MedicalRecords.css";
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan";
import apiNguoiDung from "../../../api/NguoiDung";
import apiDonThuoc from "../../../api/DonThuoc";
import apiCuocHenKhamBenh from "../../../api/CuocHenKhamBenh";
import apiLichSuKham from "../../../api/LichSuKham";
import apiHoaDon from "../../../api/HoaDon";
import apiPayment from "../../../api/Payment";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
};

const formatDateTime = (date) => {
  if (!date) return "—";
  try {
    // Parse date string - handle UTC timezone correctly
    let d;
    if (typeof date === 'string' && date.includes('T') && date.includes('Z')) {
      // UTC date string - parse and convert to local time
      d = new Date(date);
    } else {
      d = new Date(date);
    }
    if (isNaN(d)) return "—";
    // Format: "DD/MM/YYYY HH:mm" - use UTC methods to avoid timezone issues
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "—";
  }
};

const unwrap = (res) => {
  if (res?.data !== undefined) return res.data;
  return res ?? null;
};

const MedicalRecords = () => {
  const [selectedMedical, setSelectedMedical] = useState(null);
  const [showPrescription, setShowPrescription] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [medicalData, setMedicalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [appointmentWarnings, setAppointmentWarnings] = useState([]);
  const [hoaDon, setHoaDon] = useState(null);
  const [hoaDonLoading, setHoaDonLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const patientId =
    userInfo?.user?.id_benh_nhan ||
    userInfo?.user?.id_nguoi_dung ||
    null;

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Lấy hồ sơ bệnh án cơ bản (hồ sơ đầu tiên của bệnh nhân)
        const hoSoCoBanRes = await apiHoSoKhamBenh.getByBenhNhan(patientId).catch(() => null);
        const hoSoCoBan = unwrap(hoSoCoBanRes);

        // 2. Lấy thông tin bệnh nhân từ hồ sơ bệnh án cơ bản
        if (hoSoCoBan) {
          setPersonalInfo({
            id_ho_so: hoSoCoBan.id_ho_so || "—",
            ho_ten: hoSoCoBan.ho_ten || "—",
            gioi_tinh: hoSoCoBan.gioi_tinh || "—",
            tuoi: hoSoCoBan.tuoi || "—",
            dan_toc: hoSoCoBan.dan_toc || "—",
            so_dien_thoai: hoSoCoBan.so_dien_thoai || "—",
            dia_chi: hoSoCoBan.dia_chi || "—",
            ma_BHYT: hoSoCoBan.ma_BHYT || "—",
            thoi_gian_tao: hoSoCoBan.thoi_gian_tao || "—",
          });
        } else {
          // Fallback: nếu chưa có hồ sơ bệnh án, lấy từ bảng benh_nhan
          const benhNhanRes = await apiBenhNhan.getById(patientId).catch(() => null);
        const benhNhan = unwrap(benhNhanRes);
        if (benhNhan) {
          const userInfoData = await apiNguoiDung.getUserById(patientId).catch(() => ({}));
          const userData = unwrap(userInfoData) || {};
          
          setPersonalInfo({
              id_ho_so: "—",
            ho_ten: benhNhan.ho_ten || userData.ho_ten || "—",
            gioi_tinh: benhNhan.gioi_tinh || userData.gioi_tinh || "—",
            tuoi: benhNhan.tuoi || "—",
            dan_toc: benhNhan.dan_toc || userData.dan_toc || "—",
            so_dien_thoai: benhNhan.so_dien_thoai || userData.so_dien_thoai || "—",
            dia_chi: benhNhan.dia_chi || userData.dia_chi || "—",
            ma_BHYT: benhNhan.ma_BHYT || "—",
              thoi_gian_tao: benhNhan.thoi_gian_tao || userData.thoi_gian_tao || "—",
            });
          }
        }

        // 3. Load lịch sử khám bệnh và lịch hẹn khám hiện tại
        const [lichSuKhamRes, allAppointmentsRes, lichSuKhamListRes] = await Promise.all([
          apiCuocHenKhamBenh.getLichSuByBenhNhan(patientId).catch(() => []),
          apiCuocHenKhamBenh.getByBenhNhan(patientId).catch(() => []),
          apiLichSuKham.getLichSuKhamByBenhNhan(patientId).catch(() => []),
        ]);
        
        // Tạo map lichSuKham theo id_cuoc_hen để dễ tra cứu
        let lichSuKhamMap = {};
        let lichSuKhamList = [];
        
        // Unwrap lichSuKhamListRes
        if (Array.isArray(lichSuKhamListRes)) {
          lichSuKhamList = lichSuKhamListRes;
        } else if (lichSuKhamListRes) {
          const unwrapped = unwrap(lichSuKhamListRes);
          if (Array.isArray(unwrapped)) {
            lichSuKhamList = unwrapped;
          } else if (unwrapped && typeof unwrapped === 'object') {
            lichSuKhamList = [unwrapped];
          }
        }
        
        // Tạo map từ danh sách đã unwrap
        lichSuKhamList.forEach(ls => {
          if (ls.id_cuoc_hen) {
            lichSuKhamMap[ls.id_cuoc_hen] = ls;
          }
        });

        // 4. Kiểm tra các lịch hẹn khám hiện tại (upcoming appointments)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let allAppointments = [];
        if (Array.isArray(allAppointmentsRes)) {
          allAppointments = allAppointmentsRes;
        } else if (allAppointmentsRes) {
          const unwrapped = unwrap(allAppointmentsRes);
          if (Array.isArray(unwrapped)) {
            allAppointments = unwrapped;
          } else if (unwrapped && typeof unwrapped === 'object') {
            allAppointments = [unwrapped];
          }
        }

        // Lọc các lịch hẹn sắp tới (từ hôm nay trở đi, chưa hủy)
        const upcoming = allAppointments.filter(apt => {
          if (!apt.ngay_kham && !apt.ngay_hen) return false;
          const ngayKham = new Date(apt.ngay_kham || apt.ngay_hen);
          ngayKham.setHours(0, 0, 0, 0);
          const isUpcoming = ngayKham >= today;
          const isNotCancelled = apt.trang_thai !== 'da_huy' && apt.trang_thai !== 'cancelled';
          return isUpcoming && isNotCancelled;
        }).sort((a, b) => {
          const dateA = new Date(a.ngay_kham || a.ngay_hen);
          const dateB = new Date(b.ngay_kham || b.ngay_hen);
          return dateA - dateB;
        });

        setUpcomingAppointments(upcoming);

        // Kiểm tra các vấn đề với lịch hẹn
        const warnings = [];
        upcoming.forEach(apt => {
          // Kiểm tra lịch hẹn có thông tin đầy đủ không
          if (!apt.id_bac_si) {
            warnings.push({
              type: 'missing_doctor',
              message: `Lịch hẹn ngày ${formatDate(apt.ngay_kham || apt.ngay_hen)} chưa có bác sĩ được chỉ định`,
              appointment: apt
            });
          }
          if (!apt.id_khung_gio) {
            warnings.push({
              type: 'missing_time',
              message: `Lịch hẹn ngày ${formatDate(apt.ngay_kham || apt.ngay_hen)} chưa có khung giờ`,
              appointment: apt
            });
          }
          // Kiểm tra trạng thái chờ xác nhận quá lâu (quá 3 ngày)
          if (apt.trang_thai === 'cho_xac_nhan' || apt.trang_thai === 'pending') {
            const ngayTao = apt.thoi_gian_tao ? new Date(apt.thoi_gian_tao) : null;
            if (ngayTao) {
              const daysDiff = Math.floor((today - ngayTao) / (1000 * 60 * 60 * 24));
              if (daysDiff > 3) {
                warnings.push({
                  type: 'pending_too_long',
                  message: `Lịch hẹn ngày ${formatDate(apt.ngay_kham || apt.ngay_hen)} đang chờ xác nhận quá 3 ngày`,
                  appointment: apt
                });
              }
            }
          }
        });

        setAppointmentWarnings(warnings);

        // 5. Load danh sách lịch sử khám bệnh (đã có đầy đủ thông tin)
        let lichSuList = [];
        if (Array.isArray(lichSuKhamRes)) {
          lichSuList = lichSuKhamRes;
        } else if (lichSuKhamRes) {
          const unwrapped = unwrap(lichSuKhamRes);
          if (Array.isArray(unwrapped)) {
            lichSuList = unwrapped;
          } else if (unwrapped && typeof unwrapped === 'object') {
            lichSuList = [unwrapped];
          }
        }
        
        // Đảm bảo lichSuList là array trước khi map
        if (!Array.isArray(lichSuList)) {
          console.warn("lichSuList không phải là array:", lichSuList);
          lichSuList = [];
        }
        
        const enrichedData = lichSuList.map((lichSu) => {
          const hoSo = lichSu.hoSo || {};
          const id_ho_so = hoSo.id_ho_so || lichSu.id_cuoc_hen;
          
          // Lấy lichSuKham từ map (có các trường chẩn đoán, kết quả CLS, v.v.)
          const lichSuKham = lichSuKhamMap[lichSu.id_cuoc_hen] || {};
          
          // Lấy tên bác sĩ
          let ten_bac_si = "—";
          if (lichSu.bacSi) {
            try {
              ten_bac_si = `BS. ${lichSu.bacSi.ho_ten || ""}`.trim() || "—";
            } catch {}
          } else {
            const bsId = hoSo.id_bac_si_tao || hoSo.id_bac_si;
            if (bsId) {
              // Fallback: lấy từ hồ sơ nếu không có trong lichSu
              // (sẽ được load sau nếu cần)
            }
          }

          // Lấy đơn thuốc với chi tiết
          // Note: chiTietDonThuoc từ API getLichSuKhamBenhFull không có thuoc object
          // Sẽ load lại từ API getByHoSo/getByLichSu khi mở modal để có đầy đủ thông tin thuốc
          let donThuocList = [];
          // Không load từ lichSu.chiTietDonThuoc vì không có thuoc object, sẽ load khi mở modal

          // Lấy ngày khám - ưu tiên từ lichSu.ngay_kham hoặc lichSuKham.thoi_gian_kham
          const ngay_kham = lichSu.ngay_kham || lichSuKham.thoi_gian_kham || hoSo.ngay_kham || hoSo.thoi_gian_tao || hoSo.ngay_tao || "—";

          return {
            id_ho_so,
            id_cuoc_hen: lichSu.id_cuoc_hen,
            id_lich_su: lichSuKham.id_lich_su || null, // Lưu id_lich_su để load đơn thuốc sau
            ngay_kham: ngay_kham, // Lưu raw date để format sau
            thoi_gian_tao: ngay_kham, // Dùng cho hiển thị trong bảng
            bac_si: ten_bac_si,
            // Lý do khám - ưu tiên từ lichSuKham, sau đó từ lichSu, cuối cùng từ hoSo
            ly_do_kham: lichSuKham.ly_do_kham || lichSu.ly_do_kham || hoSo.ly_do_kham || "—",
            // Chẩn đoán - ưu tiên từ lichSuKham (bảng lichsukham), sau đó mới từ hoSo
            chuan_doan: lichSuKham.chuan_doan || hoSo.chuan_doan || hoSo.chan_doan || "—",
            ket_qua_cls: lichSuKham.ket_qua_cls || hoSo.ket_qua_cls || hoSo.ket_qua_can_lam_sang || "—",
            tham_do_chuc_nang: lichSuKham.tham_do_chuc_nang || hoSo.tham_do_chuc_nang || "—",
            dieu_tri: lichSuKham.dieu_tri || hoSo.dieu_tri || "—",
            cham_soc: lichSuKham.cham_soc || hoSo.cham_soc || "—",
            ghi_chu: lichSuKham.ghi_chu || hoSo.ghi_chu || "—",
            don_thuoc: donThuocList,
            chi_dinh_xet_nghiem: lichSu.chiDinhXetNghiem || [],
            chi_tiet_hoa_don: lichSu.chiTietHoaDon || [],
          };
        });

        setMedicalData(enrichedData);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Load đơn thuốc khi mở modal (luôn load lại từ API để có đầy đủ thông tin thuốc)
  useEffect(() => {
    if (modalVisible && selectedMedical) {
      setPrescriptionLoading(true);
      
      // Luôn load lại từ API để có đầy đủ thông tin thuốc (vì chiTietDonThuoc từ getLichSuKhamBenhFull không có thuoc object)
      const loadDonThuoc = async () => {
        try {
          let donThuocData = null;
          
          // Ưu tiên load từ id_lich_su (vì đơn thuốc mới lưu theo id_lich_su), sau đó mới từ id_ho_so
          if (selectedMedical.id_lich_su) {
            try {
              donThuocData = await apiDonThuoc.getByLichSu(selectedMedical.id_lich_su);
            } catch (err) {
              // Nếu không tìm thấy theo id_lich_su, thử load theo id_ho_so
              if (selectedMedical.id_ho_so) {
                donThuocData = await apiDonThuoc.getByHoSo(selectedMedical.id_ho_so);
              }
            }
          } else if (selectedMedical.id_ho_so) {
            donThuocData = await apiDonThuoc.getByHoSo(selectedMedical.id_ho_so);
          }
          
          if (donThuocData) {
            const unwrapped = unwrap(donThuocData);
            // API trả về chi_tiet (không phải chi_tiet_don_thuoc)
            if (unwrapped && unwrapped.chi_tiet) {
              const chiTiet = Array.isArray(unwrapped.chi_tiet)
                ? unwrapped.chi_tiet
                : [unwrapped.chi_tiet];
            
            setSelectedMedical(prev => ({
              ...prev,
              don_thuoc: chiTiet.map(ct => ({
                  ten_thuoc: ct.thuoc?.ten_thuoc || ct.thuoc?.ten || ct.ten_thuoc || "—",
                  lieu_dung: ct.lieu_dung || ct.cach_dung || ct.tan_suat || "—",
                  so_luong: ct.so_luong ? `${ct.so_luong} ${ct.thuoc?.don_vi || ct.don_vi || ""}`.trim() : "—",
                })),
              }));
            } else {
              // Nếu không có chi_tiet, set mảng rỗng
              setSelectedMedical(prev => ({
                ...prev,
                don_thuoc: [],
              }));
            }
          } else {
            // Nếu không tìm thấy đơn thuốc, set mảng rỗng
            setSelectedMedical(prev => ({
              ...prev,
              don_thuoc: [],
            }));
          }
        } catch (err) {
          console.error("Lỗi load đơn thuốc:", err);
          // Nếu có lỗi, set mảng rỗng
          setSelectedMedical(prev => ({
            ...prev,
            don_thuoc: [],
          }));
        } finally {
          setPrescriptionLoading(false);
        }
      };
      
      loadDonThuoc();
    } else {
      setPrescriptionLoading(false);
    }
  }, [selectedMedical?.id_ho_so, selectedMedical?.id_lich_su, modalVisible]);

  // Load hóa đơn khi mở modal
  useEffect(() => {
    if (modalVisible && selectedMedical?.id_cuoc_hen) {
      setHoaDonLoading(true);
      setHoaDon(null);
      
      const loadHoaDon = async () => {
        try {
          const hoaDonData = await apiHoaDon.getByCuocHenKham(selectedMedical.id_cuoc_hen);
          if (hoaDonData) {
            setHoaDon(hoaDonData);
          }
        } catch (err) {
          // Không có hóa đơn hoặc lỗi - không hiển thị lỗi vì có thể chưa có hóa đơn
          console.log("Không tìm thấy hóa đơn:", err);
          setHoaDon(null);
        } finally {
          setHoaDonLoading(false);
        }
      };
      
      loadHoaDon();
    } else {
      setHoaDon(null);
      setHoaDonLoading(false);
    }
  }, [selectedMedical?.id_cuoc_hen, modalVisible]);

  useEffect(() => {
    if (!location.state?.paymentSuccess) {
      return;
    }

    const paidOrderId = location.state.orderId;
    message.success(
      paidOrderId ? `Thanh toán Momo cho hóa đơn ${paidOrderId} thành công!` : "Thanh toán Momo thành công!"
    );

    const refreshHoaDonAfterPayment = async () => {
      if (!selectedMedical?.id_cuoc_hen) return;
      try {
        setHoaDonLoading(true);
        const hoaDonData = await apiHoaDon.getByCuocHenKham(selectedMedical.id_cuoc_hen);
        if (hoaDonData) {
          setHoaDon(hoaDonData);
        }
      } catch (error) {
        console.error("Không thể làm mới hóa đơn sau thanh toán:", error);
      } finally {
        setHoaDonLoading(false);
      }
    };

    refreshHoaDonAfterPayment();
    navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate, selectedMedical?.id_cuoc_hen]);

  // Hàm xử lý thanh toán Momo
  const handleMomoPayment = async () => {
    if (!hoaDon) return;
    
    setPaymentLoading(true);
    try {
      const response = await apiPayment.createMomoPayment(hoaDon.id_hoa_don, {
        source: "patient",
        redirectPath: "/medical-records",
      });
      if (response.success && response.data.paymentUrl) {
        message.success("Đang chuyển đến trang thanh toán Momo...");
        window.location.href = response.data.paymentUrl;
      } else {
        message.error(response.message || "Không thể tạo payment URL");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Hàm format phương thức thanh toán
  const formatPhuongThucThanhToan = (phuongThuc) => {
    const map = {
      'tien_mat': 'Tiền mặt',
      'chuyen_khoan': 'Chuyển khoản',
      'the': 'Thẻ',
      'vi_dien_tu': 'Ví điện tử'
    };
    return map[phuongThuc] || phuongThuc || '—';
  };

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "thoi_gian_tao",
      key: "thoi_gian_tao",
      width: 120,
      render: (text) => formatDate(text),
    },
    {
      title: "Bác sĩ",
      dataIndex: "bac_si",
      key: "bac_si",
      width: 150,
    },
    {
      title: "Lý do khám",
      dataIndex: "ly_do_kham",
      key: "ly_do_kham",
      width: 150,
    },
    {
      title: "Chẩn đoán",
      dataIndex: "chuan_doan",
      key: "chuan_doan",
      render: (text) => <Tag color="red">{text}</Tag>,
      width: 150,
    },
  ];

  const handleRowClick = (record) => {
    setSelectedMedical(record);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "40px 0", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <Space align="center" style={{ marginBottom: 32, width: "100%" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/patient-function")}
            style={{ background: "#096dd9", color: "white", border: "none" }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ color: "#096dd9", margin: 0, flex: 1, textAlign: "center" }}>
            HỒ SƠ BỆNH ÁN
          </Title>
          <div style={{ width: 100 }}></div>
        </Space>

        {/* Thông tin cá nhân */}
        {personalInfo && (
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #e6f7ff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: 32,
            }}
          >
            <Title level={4} style={{ color: "#096dd9", marginBottom: 24 }}>
              <HeartOutlined /> Thông tin bệnh nhân
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Họ tên">{personalInfo.ho_ten}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{personalInfo.gioi_tinh}</Descriptions.Item>
              <Descriptions.Item label="Tuổi">{personalInfo.tuoi}</Descriptions.Item>
              <Descriptions.Item label="Dân tộc">{personalInfo.dan_toc}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{personalInfo.so_dien_thoai}</Descriptions.Item>
              <Descriptions.Item label="Mã BHYT">
                <Tag color="green">{personalInfo.ma_BHYT}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{personalInfo.dia_chi}</Descriptions.Item>
              <Descriptions.Item label="Mã hồ sơ">{personalInfo.id_ho_so}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{formatDateTime(personalInfo.thoi_gian_tao)}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Cảnh báo về lịch hẹn khám */}
        {appointmentWarnings.length > 0 && (
          <Alert
            message="Cảnh báo về lịch hẹn khám"
            description={
              <List
                size="small"
                dataSource={appointmentWarnings}
                renderItem={(warning) => (
                  <List.Item>
                    <Space>
                      <WarningOutlined style={{ color: "#faad14" }} />
                      <Text>{warning.message}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            }
            type="warning"
            showIcon
            style={{ marginBottom: 32 }}
            closable
          />
        )}

        {/* Lịch hẹn khám sắp tới */}
        {upcomingAppointments.length > 0 && (
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #e6f7ff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: 32,
            }}
          >
            <Title level={4} style={{ color: "#096dd9", marginBottom: 24 }}>
              <CalendarOutlined /> Lịch hẹn khám sắp tới
            </Title>
            <List
              dataSource={upcomingAppointments}
              renderItem={(apt) => {
                const ngayKham = formatDate(apt.ngay_kham || apt.ngay_hen);
                const trangThai = apt.trang_thai === 'da_xac_nhan' || apt.trang_thai === 'confirmed' 
                  ? 'Đã xác nhận' 
                  : apt.trang_thai === 'cho_xac_nhan' || apt.trang_thai === 'pending'
                  ? 'Chờ xác nhận'
                  : apt.trang_thai || '—';
                const tagColor = apt.trang_thai === 'da_xac_nhan' || apt.trang_thai === 'confirmed' 
                  ? 'green' 
                  : apt.trang_thai === 'cho_xac_nhan' || apt.trang_thai === 'pending'
                  ? 'orange'
                  : 'default';
                
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{ngayKham}</Text>
                          <Tag color={tagColor}>{trangThai}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          {apt.bacSi && (
                            <Text>Bác sĩ: {apt.bacSi.ho_ten || "—"}</Text>
                          )}
                          {apt.chuyen_khoa && (
                            <Text>Chuyên khoa: {apt.chuyen_khoa.ten_chuyen_khoa || apt.chuyen_khoa || "—"}</Text>
                          )}
                          {apt.ly_do_kham && (
                            <Text>Lý do: {apt.ly_do_kham}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        )}

        {/* Lịch sử khám bệnh */}
        <Card
                  style={{
            borderRadius: 12,
            border: "1px solid #e6f7ff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Title level={4} style={{ color: "#096dd9", marginBottom: 24 }}>
            <FileTextOutlined /> Lịch sử khám bệnh
          </Title>
          {medicalData.length === 0 ? (
            <Empty description="Không có lịch sử khám bệnh" />
          ) : (
            <Table
              columns={columns}
              dataSource={medicalData}
              rowKey={(record) => record.id_ho_so || record.thoi_gian_tao}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: "pointer" },
              })}
              pagination={false}
              style={{ background: "#fff" }}
            />
          )}
        </Card>
      </div>

      {/* Modal chi tiết */}
      <Modal
        title={
          <Title level={3} style={{ color: "#096dd9", margin: 0 }}>
            <MedicineBoxOutlined /> Chi tiết khám bệnh - {selectedMedical?.thoi_gian_tao}
          </Title>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMedical(null);
        }}
        footer={null}
        width={900}
      >
      {selectedMedical && (
          <div style={{ padding: "20px 0" }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title="Thông tin khám"
                  size="small"
                  style={{ border: "1px solid #e6f7ff", marginBottom: 16 }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày khám">{formatDateTime(selectedMedical.ngay_kham || selectedMedical.thoi_gian_tao)}</Descriptions.Item>
                    <Descriptions.Item label="Bác sĩ">{selectedMedical.bac_si}</Descriptions.Item>
                    <Descriptions.Item label="Lý do khám">{selectedMedical.ly_do_kham}</Descriptions.Item>
                    <Descriptions.Item label="Chẩn đoán">
                      <Tag color="red">{selectedMedical.chuan_doan}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Kết quả cận lâm sàng"
                  size="small"
                  style={{ border: "1px solid #91d5ff", marginBottom: 16 }}
                >
                  <Paragraph>{selectedMedical.ket_qua_cls}</Paragraph>
                </Card>

                <Card
                  title="Thăm dò chức năng"
                  size="small"
                  style={{ border: "1px solid #91d5ff" }}
                >
                  <Paragraph>{selectedMedical.tham_do_chuc_nang}</Paragraph>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title="Điều trị"
                  size="small"
                  style={{ border: "1px solid #b7eb8f", marginBottom: 16 }}
                >
                  <Paragraph>{selectedMedical.dieu_tri}</Paragraph>
                </Card>

                <Card
                  title="Chăm sóc"
                  size="small"
                  style={{ border: "1px solid #ffe58f", marginBottom: 16 }}
                >
                  <Paragraph>{selectedMedical.cham_soc}</Paragraph>
                </Card>

                <Card
                  title="Ghi chú"
                  size="small"
                  style={{ border: "1px solid #ffccc7" }}
                >
                  <Paragraph>{selectedMedical.ghi_chu}</Paragraph>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card
              title={
                <Space>
                  <MedicineBoxOutlined />
                  <span>Đơn thuốc</span>
                  <Button
                    size="small"
                    type="link"
                  onClick={() => setShowPrescription(!showPrescription)}
                    style={{ color: "#096dd9" }}
                >
                  {showPrescription ? "Ẩn đơn thuốc" : "Hiện đơn thuốc"}
                  </Button>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff", marginBottom: 16 }}
            >
              {prescriptionLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Spin />
              </div>
              ) : showPrescription && (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  {selectedMedical.don_thuoc && selectedMedical.don_thuoc.length > 0 ? (
                    selectedMedical.don_thuoc.map((thuoc, idx) => (
                      <Card
                        key={idx}
                        size="small"
                        style={{
                          background: "#f0f9ff",
                          border: "1px solid #91d5ff",
                        }}
                      >
                        <Text strong style={{ color: "#096dd9", fontSize: 16 }}>
                          {thuoc.ten_thuoc}
                        </Text>
                        <br />
                        <Text>Liều dùng: {thuoc.lieu_dung}</Text>
                        <br />
                        <Text>Số lượng: {thuoc.so_luong}</Text>
                      </Card>
                    ))
                  ) : (
                    <Empty description="Không có đơn thuốc" />
                  )}
                </Space>
              )}
            </Card>

            {/* Chỉ định xét nghiệm */}
            <Card
              title={
                <Space>
                  <ExperimentOutlined />
                  <span>Chỉ định xét nghiệm</span>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff", marginBottom: 16 }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {selectedMedical.chi_dinh_xet_nghiem && selectedMedical.chi_dinh_xet_nghiem.length > 0 ? (
                  selectedMedical.chi_dinh_xet_nghiem.map((chiDinh, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{
                        background: "#fff7e6",
                        border: "1px solid #ffd591",
                      }}
                    >
                      <Text strong style={{ color: "#d46b08", fontSize: 16 }}>
                        {chiDinh.ten_dich_vu || "—"}
                      </Text>
                      {chiDinh.yeu_cau_ghi_chu && (
                        <>
                          <br />
                          <Text>Yêu cầu/Ghi chú: {chiDinh.yeu_cau_ghi_chu}</Text>
                        </>
                      )}
                      {chiDinh.trang_thai && (
                        <>
                          <br />
                          <Tag color={
                            chiDinh.trang_thai === "hoan_thanh" ? "green" :
                            chiDinh.trang_thai === "cho_xu_ly" ? "orange" :
                            "red"
                          }>
                            {chiDinh.trang_thai === "hoan_thanh" ? "Hoàn thành" :
                             chiDinh.trang_thai === "cho_xu_ly" ? "Chờ xử lý" :
                             "Đã hủy"}
                          </Tag>
                        </>
                      )}
                      {chiDinh.ket_qua && (
                        <>
                          <br />
                          <Text type="success">Kết quả: {chiDinh.ket_qua.ket_qua || "—"}</Text>
                        </>
                      )}
                    </Card>
                  ))
                ) : (
                  <Empty description="Không có chỉ định xét nghiệm" />
                )}
              </Space>
            </Card>

            {/* Dịch vụ */}
            <Card
              title={
                <Space>
                  <ShoppingOutlined />
                  <span>Dịch vụ đã sử dụng</span>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff" }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {selectedMedical.chi_tiet_hoa_don && selectedMedical.chi_tiet_hoa_don.length > 0 ? (
                  selectedMedical.chi_tiet_hoa_don.map((dichVu, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                      }}
                    >
                      <Text strong style={{ color: "#389e0d", fontSize: 16 }}>
                        {dichVu.ten_dich_vu || "—"}
                      </Text>
                      {dichVu.so_luong && (
                        <>
                          <br />
                          <Text>Số lượng: {dichVu.so_luong}</Text>
                        </>
                      )}
                      {dichVu.don_gia && (
                        <>
                          <br />
                          <Text>Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dichVu.don_gia)}</Text>
                        </>
                      )}
                      {dichVu.thanh_tien && (
                        <>
                          <br />
                          <Text strong>Thành tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dichVu.thanh_tien)}</Text>
                        </>
                      )}
                    </Card>
                  ))
                ) : (
                  <Empty description="Không có dịch vụ" />
                )}
              </Space>
            </Card>

            {/* Hóa đơn */}
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Hóa đơn</span>
                </Space>
              }
              style={{ border: "1px solid #e6f7ff", marginTop: 16 }}
            >
              {hoaDonLoading ? (
                <Spin size="small" />
              ) : hoaDon ? (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Mã hóa đơn">
                      <Text strong style={{ color: "#096dd9" }}>{hoaDon.id_hoa_don}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                      <Text strong style={{ color: "#f5222d", fontSize: 18 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hoaDon.tong_tien || 0)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      {hoaDon.trang_thai === 'da_thanh_toan' ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>Đã thanh toán</Tag>
                      ) : hoaDon.trang_thai === 'da_huy' ? (
                        <Tag color="red">Đã hủy</Tag>
                      ) : (
                        <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa thanh toán</Tag>
                      )}
                    </Descriptions.Item>
                    {hoaDon.trang_thai === 'da_thanh_toan' && (
                      <>
                        <Descriptions.Item label="Phương thức thanh toán">
                          <Text>{formatPhuongThucThanhToan(hoaDon.phuong_thuc_thanh_toan)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian thanh toán">
                          <Text>{formatDateTime(hoaDon.thoi_gian_thanh_toan)}</Text>
                        </Descriptions.Item>
                      </>
                    )}
                    <Descriptions.Item label="Ngày tạo">
                      <Text>{formatDateTime(hoaDon.thoi_gian_tao)}</Text>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Chi tiết hóa đơn */}
                  {hoaDon.chi_tiet && hoaDon.chi_tiet.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Chi tiết dịch vụ:</Text>
                      <List
                        size="small"
                        dataSource={hoaDon.chi_tiet}
                        renderItem={(item) => (
                          <List.Item>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <div>
                                <Text strong>{item.dich_vu?.ten_dich_vu || "—"}</Text>
                                <br />
                                <Text type="secondary">
                                  Số lượng: {item.so_luong} × {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.don_gia || 0)}
                                </Text>
                              </div>
                              <Text strong style={{ color: "#f5222d" }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.thanh_tien || 0)}
                              </Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}

                  {/* Nút thanh toán nếu chưa thanh toán */}
                  {hoaDon.trang_thai === 'chua_thanh_toan' && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Space direction="vertical">
                        <Button
                          type="primary"
                          size="large"
                          icon={<DollarOutlined />}
                          loading={paymentLoading}
                          onClick={handleMomoPayment}
                        >
                          Thanh toán qua Momo
                        </Button>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Sau khi thanh toán thành công, hệ thống sẽ tự quay lại trang hồ sơ khám bệnh.
                        </Text>
                      </Space>
                    </div>
                  )}
                </Space>
              ) : (
                <Empty description="Chưa có hóa đơn" />
              )}
            </Card>
        </div>
      )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
