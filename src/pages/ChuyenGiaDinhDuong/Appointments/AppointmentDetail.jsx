import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  List,
  Avatar,
  Descriptions,
  Space,
  Divider,
  Spin,
  Alert,
  Timeline,
  Badge,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tabs,
  Collapse,
  Statistic,
  Steps,
  message
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiBenhNhan from "../../../api/BenhNhan"; 
import apiHoSoDinhDuong from "../../../api/HoSoDinhDuong";
import apiLichSuTuVan from "../../../api/LichSuTuVan"; 
import apiHoaDon from "../../../api/HoaDon";
import apiDichVu from "../../../api/DichVu";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import { calculateAge } from "../../../utils/calculateAge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

const NutritionistAppointmentDetail = () => {
  const { id_cuoc_hen } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [benhNhanFull, setBenhNhanFull] = useState(null);
  const [hoSo, setHoSo] = useState(null);
  const [lichSuTuVanHienTai, setLichSuTuVanHienTai] = useState(null);
  const [lichSuTuVanTruoc, setLichSuTuVanTruoc] = useState([]);
  const [dsDichVu, setDsDichVu] = useState([]);
  const [dichVuTamThoi, setDichVuTamThoi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalHoSoOpen, setModalHoSoOpen] = useState(false);
  const [modalLichSuOpen, setModalLichSuOpen] = useState(false);
  const [modalDichVu, setModalDichVu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewDichVu, setViewDichVu] = useState(false);

  const [formHoSo] = Form.useForm();
  const [formLichSu] = Form.useForm();

  const getStatusColor = (status) => {
    switch (status) {
      case "da_dat": return "blue";
      case "da_hoan_thanh": return "green";
      case "da_huy": return "red";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "da_dat": return "Đã đặt";
      case "da_hoan_thanh": return "Đã hoàn thành";
      case "da_huy": return "Đã hủy";
      default: return status;
    }
  };

  const getGenderColor = (gender) => {
    return gender?.toLowerCase() === 'nam' ? 'blue' : 'pink';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const appt = await apiCuocHenTuVan.getById(id_cuoc_hen);
      setAppointment(appt);

      if (appt?.id_benh_nhan) {
        const bnFull = await apiBenhNhan.getById(appt.id_benh_nhan);
        setBenhNhanFull(bnFull);

        const hs = await apiHoSoDinhDuong.getByBenhNhan(appt.id_benh_nhan);
        setHoSo(hs);

        const lichSuTruoc = await apiLichSuTuVan.getLichSuTuVanByBenhNhan(appt.id_benh_nhan);
        setLichSuTuVanTruoc(lichSuTruoc || []);

        if (appt.trang_thai === "da_hoan_thanh") {
          const lichSuHienTai = await apiLichSuTuVan.getLichSuTuVanByCuocHen(appt.id_cuoc_hen);
          setLichSuTuVanHienTai(lichSuHienTai);

          // Lấy dịch vụ đã lưu
          try {
            const HoaDon = await apiHoaDon.getByCuocHenTuVan(appt.id_cuoc_hen);
            if (HoaDon) {
              const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDon.id_hoa_don);
              if (ChiTietHoaDonData && ChiTietHoaDonData.data) {
                setDichVuTamThoi(ChiTietHoaDonData.data || []);
              }
            }
          } catch (error) {
            console.error("Lỗi khi lấy dịch vụ:", error);
            // Không hiển thị lỗi nếu không tìm thấy hóa đơn
          }
        }
      }
    } catch (error) {
      console.error(error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id_cuoc_hen]);

  // Tự động load dữ liệu vào form hồ sơ khi modal mở
  useEffect(() => {
    if (modalHoSoOpen) {
      if (hoSo) {
        // Nếu có hồ sơ, load dữ liệu hồ sơ vào form
        formHoSo.setFieldsValue({
          ho_ten: hoSo.ho_ten || '',
          so_dien_thoai: hoSo.so_dien_thoai || '',
          tuoi: hoSo.tuoi ? Number(hoSo.tuoi) : '',
          gioi_tinh: hoSo.gioi_tinh || '',
          dan_toc: hoSo.dan_toc || '',
          ma_BHYT: hoSo.ma_BHYT || '',
          dia_chi: hoSo.dia_chi || ''
        });
      } else if (benhNhanFull?.data) {
        // Nếu chưa có hồ sơ, load dữ liệu từ bệnh nhân
        const tuoiCalculated = calculateAge(benhNhanFull.data.ngay_sinh);
        formHoSo.setFieldsValue({
          ho_ten: benhNhanFull.data.ho_ten || '',
          so_dien_thoai: benhNhanFull.data.so_dien_thoai || '',
          gioi_tinh: benhNhanFull.data.gioi_tinh || '',
          tuoi: tuoiCalculated ? Number(tuoiCalculated) : '',
          dan_toc: benhNhanFull.data.dan_toc || '',
          ma_BHYT: benhNhanFull.data.ma_BHYT || '',
          dia_chi: benhNhanFull.data.dia_chi || ''
        });
      }
    } else {
      // Reset form khi đóng modal
      formHoSo.resetFields();
    }
  }, [modalHoSoOpen, hoSo, benhNhanFull, formHoSo]);

  // Hàm xử lý chỉ định xét nghiệm
  const handleChiDinhXetNghiem = async (values) => {
    try {
      await apiChiDinhXetNghiem.create({
        id_cuoc_hen: id_cuoc_hen,
        ten_dich_vu: values.ten_dich_vu,
        yeu_cau_ghi_chu: values.yeu_cau_ghi_chu,
        id_bac_si_chi_dinh: userInfo.user.id_nguoi_dung,
        trang_thai: "cho_xy_ly"
      });
      message.success("Chỉ định xét nghiệm thành công");
      setModalChiDinhXN(false);
      formChiDinhXN.resetFields();
      
      // Refresh data
      const chiDinhData = await apiChiDinhXetNghiem.getByCuocHen(id_cuoc_hen);
      setChiDinhXetNghiem(chiDinhData || []);
    } catch (error) {
      console.error("Lỗi khi chỉ định xét nghiệm:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  // Hàm xem kết quả xét nghiệm
  const handleViewKetQua = (chiDinh) => {
    console.log("Chi định được chọn:", chiDinh);
    console.log("Kết quả tương ứng:", ketQuaXetNghiem[chiDinh.id_chi_dinh]);
    setSelectedChiDinh(chiDinh);
    setViewKetQuaXN(true);
  };

  // Các hàm xử lý cũ giữ nguyên
  const handleSubmitHoSo = async (values) => {
    try {
      if (!hoSo) {
        const newHoSo = await apiHoSoDinhDuong.create({
          id_benh_nhan: benhNhanFull.data.id_benh_nhan,
          ...values
        });
        setHoSo(newHoSo);
        message.success("Tạo hồ sơ thành công");
      } else {
        await apiHoSoDinhDuong.update(hoSo.id_ho_so, values);
        const updated = await apiHoSoDinhDuong.getByBenhNhan(benhNhanFull.data.id_benh_nhan);
        setHoSo(updated);
        message.success("Cập nhật hồ sơ thành công");
      }
      setModalHoSoOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const handleSubmitLichSuTuVan = async (values) => {
    try {
      if (!lichSuTuVanHienTai) {
        const newLichSu = await apiLichSuTuVan.createLichSuTuVan({
          id_benh_nhan: benhNhanFull.data.id_benh_nhan,
          id_cuoc_hen: id_cuoc_hen,
          id_ho_so: hoSo?.id_ho_so,
          thoi_gian_tu_van: new Date(),
          ...values
        });
        setLichSuTuVanHienTai(newLichSu);
        message.success("Ghi thông tin tư vấn thành công");
      } else {
        await apiLichSuTuVan.updateLichSuTuVan(lichSuTuVanHienTai.id_lich_su, values);
        const updated = await apiLichSuTuVan.getLichSuTuVanById(lichSuTuVanHienTai.id_lich_su);
        setLichSuTuVanHienTai(updated);
        message.success("Cập nhật thông tin tư vấn thành công");
      }
      setModalLichSuOpen(false);
    } catch (error) {
      console.error(error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const handleOpenDichVu = async () => {
    try {
      const res = await apiDichVu.getAll();
      setDsDichVu(res.data || []);
      setModalDichVu(true);
    } catch (err) {
      console.error(err);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const handleOpenDonThuoc = async () => {
    try {
      const res = await apiThuoc.getAllThuoc();
      setDsThuoc(res || []);
      setModalDonThuoc(true);
    } catch (err) {
      console.error(err);
      // Toast đã được hiển thị tự động bởi axios interceptor
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

  const handleViewDonThuoc = async () => {
    try {
      if (appointment.trang_thai === "da_hoan_thanh" && lichSuKhamHienTai) {
        const donThuocData = await apiDonThuoc.getByLichSu(lichSuKhamHienTai.id_lich_su);
        if (donThuocData) {
          setDonThuocTamThoi(donThuocData.chi_tiet || []);
          setGhiChuDonThuoc(donThuocData.ghi_chu || "");
        }
      }
      setViewDonThuoc(true);
    } catch (error) {
      console.error("Lỗi khi tải đơn thuốc:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const handleViewDichVu = async () => {
    try {
      if (appointment.trang_thai === "da_hoan_thanh") {
        const HoaDon = await apiHoaDon.getByCuocHenKham(id_cuoc_hen);
        if (HoaDon) {
          const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDon.id_hoa_don);
          if (ChiTietHoaDonData) {
            setDichVuTamThoi(ChiTietHoaDonData.data || []);
          }
        }
      }
      setViewDichVu(true);
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const handleExportPdf = async () => {
    try {
      // Kiểm tra và lưu dịch vụ - kiểm tra tất cả các phần tử có id_dich_vu không
      const coDichVu = dichVuTamThoi.length > 0 && dichVuTamThoi.some(item => item.id_dich_vu);
      if (coDichVu) {
        // Lọc ra chỉ những dịch vụ có id_dich_vu hợp lệ
        const dichVuHopLe = dichVuTamThoi.filter(item => item.id_dich_vu);
        if (dichVuHopLe.length > 0) {
          const tong_tien = dichVuHopLe.reduce(
            (sum, dv) => sum + (dv.so_luong || 0) * (dv.don_gia || 0),
            0
          );
          await apiHoaDon.create({
            id_cuoc_hen_tu_van: id_cuoc_hen,
            tong_tien,
            chi_tiet: dichVuHopLe,
          });
        }
      }

      // Update trạng thái cuộc hẹn
      await apiCuocHenTuVan.updateTrangThai(id_cuoc_hen, "da_hoan_thanh");

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
      message.success("Xuất hóa đơn thành công");
      
      // Refresh lại dữ liệu sau khi lưu thành công
      setShowPreview(false);
      await fetchData();

    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const handleFinish = async () => {
    try {
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  const totalDichVu = dichVuTamThoi.reduce((sum, dv) => sum + (dv.so_luong * (dv.don_gia || 0)), 0);
  const tongCong = totalDichVu;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Alert
          message="Không tìm thấy cuộc hẹn"
          description="Cuộc hẹn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
        />
      </div>
    );
  }

                      console.log("Chi dinh item:", chiDinhXetNghiem);
      console.log("Ket qua map:", chiDinhXetNghiem.ten_dich_vu);
      console.log("Check ket qua:", chiDinhXetNghiem.yeu_cau_ghi_chu);
  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Card className="shadow-sm" style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              style={{ padding: '4px 8px' }}
            >
              Quay lại
            </Button>
            <Divider type="vertical" style={{ height: 24 }} />
            <div>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                🏥 Chi tiết cuộc hẹn khám
              </Title>
              <Text type="secondary">Quản lý thông tin khám bệnh và điều trị</Text>
            </div>
          </div>
          <Space>
            <Badge 
              status="processing" 
              text={
                <Tag color={getStatusColor(appointment.trang_thai)}>
                  {getStatusText(appointment.trang_thai)}
                </Tag>
              } 
            />
            <Text type="secondary">Mã: {id_cuoc_hen}</Text>
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Thông tin chính */}
        <Col xs={24} lg={16}>
          <Row gutter={[24, 24]}>
            {/* Thông tin bệnh nhân */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>Thông tin bệnh nhân</span>
                  </Space>
                }
                extra={
                  <Button 
                    type="primary" 
                    icon={hoSo ? <EditOutlined /> : <PlusOutlined />}
                    onClick={() => {
                      setModalHoSoOpen(true);
                    }}
                    size="small"
                  >
                    {hoSo ? "Chỉnh sửa" : "Tạo hồ sơ"}
                  </Button>
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                {hoSo ? (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Mã BN" span={1}>
                      <Text strong>{benhNhanFull?.data.id_benh_nhan}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ tên" span={1}>
                      <Text strong>{hoSo.ho_ten}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      <Tag color={getGenderColor(hoSo.gioi_tinh)}>
                        {hoSo.gioi_tinh}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tuổi">
                      <Badge count={hoSo.tuoi} style={{ backgroundColor: '#52c41a' }} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <Space>
                        <PhoneOutlined />
                        {hoSo.so_dien_thoai}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã BHYT">
                      {hoSo.ma_BHYT || <Text type="secondary">Không có</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>
                      {hoSo.dia_chi || <Text type="secondary">Không có</Text>}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <UserOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        Chưa có hồ sơ bệnh nhân
                      </Text>
                      <Button 
                        type="primary" 
                        onClick={() => {
                          setModalHoSoOpen(true);
                        }}
                      >
                        Tạo hồ sơ ngay
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Thông tin khám bệnh */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#52c41a' }} />
                    <span>Thông tin tư vấn dinh dưỡng</span>
                  </Space>
                }
                extra={
                  appointment.trang_thai !== "da_hoan_thanh" ? (
                    <Button 
                      type={lichSuTuVanHienTai ? "default" : "primary"}
                      icon={lichSuTuVanHienTai ? <EditOutlined /> : <PlusOutlined />}
                      onClick={() => {
                        if (lichSuTuVanHienTai) {
                          formLichSu.setFieldsValue(lichSuTuVanHienTai);
                        }
                        setModalLichSuOpen(true);
                      }}
                      size="small"
                    >
                      {lichSuTuVanHienTai ? "Chỉnh sửa" : "Ghi thông tin"}
                    </Button>
                  ) : (
                    <Button 
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        formLichSu.setFieldsValue(lichSuTuVanHienTai);
                        setModalLichSuOpen(true);
                      }}
                      size="small"
                    >
                      Xem chi tiết
                    </Button>
                  )
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                {lichSuTuVanHienTai ? (
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Kết quả cận lâm sàng">
                      <Text>{lichSuTuVanHienTai.ket_qua_cls || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Kế hoạch dinh dưỡng">
                      <Text>{lichSuTuVanHienTai.ke_hoach_dinh_duong || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhu cầu calo">
                      <Text>{lichSuTuVanHienTai.nhu_cau_calo ? `${lichSuTuVanHienTai.nhu_cau_calo} kcal/ngày` : "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hướng dẫn chăm sóc">
                      <Text>{lichSuTuVanHienTai.cham_soc || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                      <Text>{lichSuTuVanHienTai.ghi_chu || "Không có"}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">Chưa có thông tin tư vấn</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Hiển thị dịch vụ khi đã hoàn thành */}
            {appointment.trang_thai === "da_hoan_thanh" && (
              <>
                {/* Dịch vụ đã sử dụng */}
                <Col xs={24}>
                  <Card 
                    title={
                      <Space>
                        <HeartOutlined style={{ color: '#eb2f96' }} />
                        <span>Dịch vụ đã sử dụng</span>
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={handleViewDichVu}
                        size="small"
                      >
                        Xem dịch vụ
                      </Button>
                    }
                    className="shadow-sm"
                    style={{ borderRadius: 12 }}
                  >
                    {dichVuTamThoi.length > 0 ? (
                      <List
                        size="small"
                        dataSource={dichVuTamThoi.slice(0, 3)}
                        renderItem={(dv, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar size="small" icon={<HeartOutlined />} />}
                              title={dv.dich_vu?.ten_dich_vu}
                              description={`Số lượng: ${dv.so_luong} - Đơn giá: ${dv.don_gia?.toLocaleString()} VND`}
                            />
                            <div>
                              <Text strong>{dv.thanh_tien?.toLocaleString()} VND</Text>
                            </div>
                          </List.Item>
                        )}
                        footer={
                          dichVuTamThoi.length > 3 && (
                            <Text type="secondary">
                              Và {dichVuTamThoi.length - 3} dịch vụ khác...
                            </Text>
                          )
                        }
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Text type="secondary">Không có dịch vụ nào</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </>
            )}

            {/* Lịch sử tư vấn trước */}
            {lichSuTuVanTruoc.length > 0 && (
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <span>Lịch sử tư vấn trước</span>
                    </Space>
                  }
                  className="shadow-sm"
                  style={{ borderRadius: 12 }}
                >
                  <Timeline>
                    {lichSuTuVanTruoc.map((ls, index) => (
                      <Timeline.Item
                        key={index}
                        dot={<CalendarOutlined style={{ fontSize: '12px' }} />}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>
                            {new Date(ls.thoi_gian_tu_van).toLocaleDateString("vi-VN")}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {ls.ke_hoach_dinh_duong || 'Không có thông tin'}
                          </Text>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            )}
          </Row>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Row gutter={[24, 24]}>
            {/* Thông tin cuộc hẹn */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <span>Thông tin cuộc hẹn</span>
                  </Space>
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Ngày khám:</Text>
                    <div>
                      <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      {new Date(appointment.ngay_kham).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <Text strong>Giờ khám:</Text>
                    <div>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
                      {appointment.khungGio ? 
                        `${appointment.khungGio.gio_bat_dau} - ${appointment.khungGio.gio_ket_thuc}` : 
                        "Không có"}
                    </div>
                  </div>
                  <div>
                    <Text strong>Lý do khám:</Text>
                    <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: 6 }}>
                      {appointment.ly_do_kham || "Không có"}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Thống kê nhanh */}
            <Col xs={24}>
              <Card 
                title="Thống kê nhanh"
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Statistic
                      title="Dịch vụ"
                      value={dichVuTamThoi.length}
                      prefix={<HeartOutlined />}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title="Tổng tiền"
                      value={tongCong}
                      prefix={<DollarOutlined />}
                      suffix="VND"
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Hành động */}
            <Col xs={24}>
              <Card 
                title="Thao tác"
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {appointment.trang_thai !== "da_hoan_thanh" ? (
                    <>
                      <Button 
                        icon={<PlusOutlined />}
                        onClick={handleOpenDichVu}
                        block
                        size="large"
                      >
                        Chọn dịch vụ
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={handleFinish}
                        block
                        size="large"
                        disabled={!lichSuTuVanHienTai}
                      >
                        Kết thúc tư vấn
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={handleViewDichVu}
                        block
                        size="large"
                      >
                        Xem dịch vụ
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<PrinterOutlined />}
                        onClick={() => setShowPreview(true)}
                        block
                        size="large"
                      >
                        In hóa đơn
                      </Button>
                    </>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal Hồ sơ - GIỮ NGUYÊN */}
      <Modal
        title={hoSo ? "Chỉnh sửa hồ sơ" : "Tạo hồ sơ bệnh nhân"}
        open={modalHoSoOpen}
        onCancel={() => setModalHoSoOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={formHoSo}
          layout="vertical"
          onFinish={handleSubmitHoSo}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ho_ten"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="so_dien_thoai"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tuoi"
                label="Tuổi"
                rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gioi_tinh"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dan_toc"
                label="Dân tộc"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ma_BHYT"
                label="Mã BHYT"
              >
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dia_chi"
                label="Địa chỉ"
              >
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
              >
                <Tag color={appointment ? getStatusColor(appointment.trang_thai) : 'default'}>
                  {appointment ? getStatusText(appointment.trang_thai) : 'N/A'}
                </Tag>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Chỉ số dinh dưỡng</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chieu_cao"
                label="Chiều cao (cm)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập chiều cao" min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="can_nang"
                label="Cân nặng (kg)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập cân nặng" min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vong_eo"
                label="Vòng eo (cm)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập vòng eo" min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mo_co_the"
                label="Mỡ cơ thể (%)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập tỷ lệ mỡ cơ thể" min={0} max={100} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="khoi_co"
                label="Khối cơ (kg)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập khối cơ" min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nuoc_trong_co_the"
                label="Nước trong cơ thể (%)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập tỷ lệ nước" min={0} max={100} step={0.1} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalHoSoOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {hoSo ? "Cập nhật" : "Tạo hồ sơ"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Lịch sử tư vấn */}
      <Modal
        title={lichSuTuVanHienTai ? "Chỉnh sửa thông tin tư vấn" : "Ghi thông tin tư vấn dinh dưỡng"}
        open={modalLichSuOpen}
        onCancel={() => setModalLichSuOpen(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Form
          form={formLichSu}
          layout="vertical"
          onFinish={handleSubmitLichSuTuVan}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin tư vấn hiện tại" key="1">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="ket_qua_cls" label="Kết quả cận lâm sàng">
                    <TextArea rows={3} placeholder="Nhập kết quả cận lâm sàng (nếu có)..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="ke_hoach_dinh_duong" label="Kế hoạch dinh dưỡng">
                    <TextArea rows={4} placeholder="Nhập kế hoạch dinh dưỡng chi tiết..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="nhu_cau_calo" label="Nhu cầu calo (kcal/ngày)">
                    <InputNumber style={{ width: '100%' }} placeholder="Nhập nhu cầu calo" min={0} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Divider orientation="left">Thực đơn theo bữa</Divider>
                </Col>
                <Col span={24}>
                  <Form.Item name="sang" label="Bữa sáng">
                    <TextArea rows={2} placeholder="Nhập thực đơn bữa sáng..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="trua" label="Bữa trưa">
                    <TextArea rows={2} placeholder="Nhập thực đơn bữa trưa..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="chieu" label="Bữa chiều">
                    <TextArea rows={2} placeholder="Nhập thực đơn bữa chiều..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="toi" label="Bữa tối">
                    <TextArea rows={2} placeholder="Nhập thực đơn bữa tối..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="cham_soc" label="Hướng dẫn chăm sóc">
                    <TextArea rows={3} placeholder="Nhập hướng dẫn chăm sóc..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="ghi_chu" label="Ghi chú">
                    <TextArea rows={2} placeholder="Nhập ghi chú..." />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            
            {lichSuTuVanTruoc.length > 0 && (
              <TabPane tab={`Lịch sử tư vấn (${lichSuTuVanTruoc.length})`} key="2">
                <List
                  dataSource={lichSuTuVanTruoc}
                  renderItem={(ls, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CalendarOutlined />} />}
                        title={
                          <Space>
                            <Text strong>
                              {new Date(ls.thoi_gian_tu_van).toLocaleDateString("vi-VN")}
                            </Text>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            {ls.ke_hoach_dinh_duong && <Text><strong>Kế hoạch:</strong> {ls.ke_hoach_dinh_duong}</Text>}
                            {ls.nhu_cau_calo && <Text><strong>Nhu cầu calo:</strong> {ls.nhu_cau_calo} kcal/ngày</Text>}
                            {ls.ghi_chu && <Text><strong>Ghi chú:</strong> {ls.ghi_chu}</Text>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            )}
          </Tabs>
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => setModalLichSuOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {lichSuTuVanHienTai ? "Cập nhật" : "Lưu thông tin"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Đơn thuốc - GIỮ NGUYÊN */}
      <Modal
        title="Kê đơn thuốc"
        open={modalDonThuoc}
        onCancel={() => setModalDonThuoc(false)}
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => setModalDonThuoc(false)}>
            Đóng
          </Button>,
          <Button key="add" type="dashed" icon={<PlusOutlined />} onClick={handleAddThuocRow}>
            Thêm thuốc
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {donThuocTamThoi.map((row, i) => (
            <Card 
              key={i} 
              size="small" 
              title={`Thuốc ${i + 1}`}
              extra={
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleRemoveThuoc(i)}
                  size="small"
                />
              }
            >
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Select
                    showSearch
                    placeholder="Chọn thuốc"
                    value={row.id_thuoc}
                    onChange={(value) => handleChangeThuoc(i, "id_thuoc", value)}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={dsThuoc.map(t => ({
                      value: t.id_thuoc,
                      label: `${t.ten_thuoc}`
                    }))}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={3}>
                  <Input
                    type="number"
                    placeholder="Số lượng"
                    value={row.so_luong}
                    onChange={(e) => handleChangeThuoc(i, "so_luong", parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Liều dùng"
                    value={row.lieu_dung}
                    onChange={(e) => handleChangeThuoc(i, "lieu_dung", e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Tần suất"
                    value={row.tan_suat}
                    onChange={(e) => handleChangeThuoc(i, "tan_suat", e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Ghi chú"
                    value={row.ghi_chu}
                    onChange={(e) => handleChangeThuoc(i, "ghi_chu", e.target.value)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
          
          {donThuocTamThoi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <MedicineBoxOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Chưa có thuốc nào được thêm vào đơn
              </Text>
            </div>
          )}

          <Card title="Ghi chú đơn thuốc" size="small">
            <TextArea
              rows={3}
              value={ghiChuDonThuoc}
              onChange={(e) => setGhiChuDonThuoc(e.target.value)}
              placeholder="Nhập ghi chú cho toàn bộ đơn thuốc..."
            />
          </Card>
        </Space>
      </Modal>

      {/* Modal Dịch vụ - GIỮ NGUYÊN */}
      <Modal
        title="Chọn dịch vụ"
        open={modalDichVu}
        onCancel={() => setModalDichVu(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setModalDichVu(false)}>
            Đóng
          </Button>,
          <Button key="add" type="dashed" icon={<PlusOutlined />} onClick={handleAddDichVuRow}>
            Thêm dịch vụ
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {dichVuTamThoi.map((row, i) => (
            <Card 
              key={i} 
              size="small" 
              title={`Dịch vụ ${i + 1}`}
              extra={
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleRemoveDichVu(i)}
                  size="small"
                />
              }
            >
              <Row gutter={16} align="middle">
                <Col span={10}>
                  <Select
                    showSearch
                    placeholder="Chọn dịch vụ"
                    value={row.id_dich_vu}
                    onChange={(value) => handleChangeDichVu(i, "id_dich_vu", value)}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={dsDichVu.map(dv => ({
                      value: dv.id_dich_vu,
                      label: `${dv.ten_dich_vu} - ${dv.don_gia?.toLocaleString()} VND`
                    }))}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    type="number"
                    placeholder="Số lượng"
                    value={row.so_luong}
                    onChange={(e) => handleChangeDichVu(i, "so_luong", parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    type="number"
                    placeholder="Đơn giá"
                    value={row.don_gia}
                    onChange={(e) => handleChangeDichVu(i, "don_gia", parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Thành tiền"
                    value={(row.so_luong * row.don_gia).toLocaleString() + ' VND'}
                    readOnly
                    style={{ fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </Card>
          ))}
          
          {dichVuTamThoi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <PlusOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Chưa có dịch vụ nào được chọn
              </Text>
            </div>
          )}

          {dichVuTamThoi.length > 0 && (
            <Card size="small">
              <Statistic
                title="Tổng tiền dịch vụ"
                value={totalDichVu}
                suffix="VND"
                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
              />
            </Card>
          )}
        </Space>
      </Modal>

      {/* Modal xem đơn thuốc (chỉ xem) - GIỮ NGUYÊN */}
      <Modal
        title="Đơn thuốc đã kê"
        open={viewDonThuoc}
        onCancel={() => setViewDonThuoc(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setViewDonThuoc(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {donThuocTamThoi.length > 0 ? (
            donThuocTamThoi.map((row, i) => (
              <Card 
                key={i} 
                size="small" 
                title={`Thuốc ${i + 1}`}
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tên thuốc" span={2}>
                    <Text strong>{row.thuoc?.ten_thuoc || row.ten_thuoc || 'Chưa chọn thuốc'} ({row.ham_luong || row.thuoc?.ham_luong || ''})</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng">
                    <Tag color="blue">{row.so_luong}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Liều dùng">
                    <Text>{row.lieu_dung || 'Không có'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tần suất">
                    <Text>{row.tan_suat || 'Không có'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <Text>{row.ghi_chu || 'Không có'}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <MedicineBoxOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Chưa có thuốc nào trong đơn
              </Text>
            </div>
          )}

          {ghiChuDonThuoc && (
            <Card title="Ghi chú đơn thuốc" size="small">
              <Text>{ghiChuDonThuoc}</Text>
            </Card>
          )}
        </Space>
      </Modal>

      {/* Modal xem dịch vụ (chỉ xem) - GIỮ NGUYÊN */}
      <Modal
        title="Dịch vụ đã sử dụng"
        open={viewDichVu}
        onCancel={() => setViewDichVu(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewDichVu(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {dichVuTamThoi.length > 0 ? (
            <>
              <Table
                size="small"
                pagination={false}
                dataSource={dichVuTamThoi.map((d, i) => ({
                  key: i,
                  stt: i + 1,
                  ten_dich_vu: d.ten_dich_vu,
                  so_luong: d.so_luong,
                  don_gia: d.don_gia?.toLocaleString(),
                  thanh_tien: (d.so_luong * d.don_gia)?.toLocaleString()
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên dịch vụ', dataIndex: 'ten_dich_vu' },
                  { title: 'SL', dataIndex: 'so_luong', width: 80, align: 'center' },
                  { title: 'Đơn giá', dataIndex: 'don_gia', width: 120, align: 'right' },
                  { title: 'Thành tiền', dataIndex: 'thanh_tien', width: 120, align: 'right' },
                ]}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row style={{ background: '#f0f8ff' }}>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Tổng tiền dịch vụ:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong type="danger">{totalDichVu.toLocaleString()} VND</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <HeartOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Không có dịch vụ nào được sử dụng
              </Text>
            </div>
          )}
        </Space>
      </Modal>

      {/* THÊM MODAL CHỈ ĐỊNH XÉT NGHIỆM */}
      <Modal
        title="Chỉ định xét nghiệm"
        open={modalChiDinhXN}
        onCancel={() => setModalChiDinhXN(false)}
        footer={null}
        width={600}
      >
        <Form
          form={formChiDinhXN}
          layout="vertical"
          onFinish={handleChiDinhXetNghiem}
        >
          <Form.Item
            name="ten_dich_vu"
            label="Tên xét nghiệm"
            rules={[{ required: true, message: 'Vui lòng nhập tên xét nghiệm' }]}
          >
            <Input placeholder="Ví dụ: Xét nghiệm máu, X-quang ngực, Siêu âm..." />
          </Form.Item>
          <Form.Item
            name="yeu_cau_ghi_chu"
            label="Yêu cầu/Ghi chú"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập yêu cầu cụ thể hoặc ghi chú cho xét nghiệm..." 
            />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalChiDinhXN(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Chỉ định
            </Button>
          </div>
        </Form>
      </Modal>

      {/* THÊM MODAL XEM KẾT QUẢ XÉT NGHIỆM */}
      <Modal
        title="Kết quả xét nghiệm"
        open={viewKetQuaXN}
        onCancel={() => setViewKetQuaXN(false)}
        footer={[
          <Button key="close" onClick={() => setViewKetQuaXN(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedChiDinh && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title={selectedChiDinh.ten_dich_vu} size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Yêu cầu">
                  {selectedChiDinh.yeu_cau_ghi_chu || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian chỉ định">
                  {new Date(selectedChiDinh.thoi_gian_chi_dinh).toLocaleString('vi-VN')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh] ? (
              <Card title="Kết quả" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Kết quả văn bản">
                    <div style={{ 
                      padding: '12px', 
                      background: '#f5f5f5', 
                      borderRadius: '6px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].ket_qua_van_ban}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian kết luận">
                    {new Date(ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].thoi_gian_ket_luan).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].duong_dan_file_ket_qua && (
                    <Descriptions.Item label="File đính kèm">
                      <Button type="link" onClick={() => window.open(ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].duong_dan_file_ket_qua, '_blank')}>
                        Xem file kết quả
                      </Button>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">Chưa có kết quả xét nghiệm</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* Modal Preview Hóa đơn - GIỮ NGUYÊN */}
      <Modal
        title="Xem trước hóa đơn"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setShowPreview(false)}>
            Đóng
          </Button>,
          <Button key="export" type="primary" icon={<PrinterOutlined />} onClick={handleExportPdf}>
            Xuất PDF & Kết thúc khám
          </Button>,
        ]}
      >
        <div id="invoicePreview" style={{ padding: 20, background: 'white', border: '1px solid #f0f0f0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '2px solid #1890ff', paddingBottom: 20 }}>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>PHÒNG KHÁM MEDPRO</Title>
            <Text style={{ fontSize: 16, color: '#666' }}>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</Text>
            <br />
            <Text style={{ fontSize: 16, color: '#666' }}>Điện thoại: 028 1234 5678</Text>
          </div>

          {/* Thông tin bệnh nhân */}
          <Card title="THÔNG TIN BỆNH NHÂN" size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 8]}>
              <Col span={8}><Text strong>Mã cuộc hẹn:</Text> {id_cuoc_hen}</Col>
              <Col span={8}><Text strong>Họ tên:</Text> {hoSo?.ho_ten}</Col>
              <Col span={8}><Text strong>Giới tính:</Text> {hoSo?.gioi_tinh}</Col>
              <Col span={8}><Text strong>Tuổi:</Text> {hoSo?.tuoi}</Col>
              <Col span={8}><Text strong>Mã BHYT:</Text> {hoSo?.ma_BHYT || 'Không có'}</Col>
              <Col span={8}><Text strong>Ngày khám:</Text> {new Date().toLocaleDateString('vi-VN')}</Col>
              <Col span={24}><Text strong>Địa chỉ:</Text> {hoSo?.dia_chi || 'Không có'}</Col>
            </Row>
          </Card>

          {/* Thông tin khám bệnh */}
          <Card title="THÔNG TIN KHÁM BỆNH" size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Lý do khám:</Text>
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                  {lichSuKhamHienTai?.ly_do_kham || 'Không có'}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Chuẩn đoán:</Text>
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                  {lichSuKhamHienTai?.chuan_doan || 'Không có'}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Phương án điều trị:</Text>
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                  {lichSuKhamHienTai?.dieu_tri || 'Không có'}
                </div>
              </Col>
            </Row>
          </Card>
          {/* Xét nghiệm đã chỉ định */}
          {chiDinhXetNghiem.length > 0 && (
            <Card title="XÉT NGHIỆM CHỈ ĐỊNH" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={chiDinhXetNghiem.map((xn, i) => ({
                  key: i,
                  stt: i + 1,
                  ten_xet_nghiem: xn.ten_dich_vu,
                  yeu_cau: xn.yeu_cau_ghi_chu || 'Không có yêu cầu đặc biệt',
                  trang_thai: xn.trang_thai === 'cho_xy_ly' ? 'Chờ xử lý' : 
                             xn.trang_thai === 'dang_xu_ly' ? 'Đang xử lý' : 
                             xn.trang_thai === 'hoan_thanh' ? 'Hoàn thành' : xn.trang_thai,
                  ket_qua: ketQuaXetNghiem[xn.id_chi_dinh] ? 'Đã có kết quả' : 'Chờ kết quả'
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên xét nghiệm', dataIndex: 'ten_xet_nghiem' },
                  { title: 'Yêu cầu', dataIndex: 'yeu_cau', width: 200 },
                  { title: 'Trạng thái', dataIndex: 'trang_thai', width: 100, align: 'center' },
                  { title: 'Kết quả', dataIndex: 'ket_qua', width: 100, align: 'center' },
                ]}
              />
            </Card>
          )}
          {/* Dịch vụ */}
          {dichVuTamThoi.length > 0 && (
            <Card title="DỊCH VỤ SỬ DỤNG" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={dichVuTamThoi.map((d, i) => ({
                  key: i,
                  stt: i + 1,
                  ten: d.dich_vu?.ten_dich_vu,
                  sl: d.so_luong,
                  dongia: d.don_gia?.toLocaleString(),
                  thanhtien: (d.so_luong * d.don_gia)?.toLocaleString()
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên dịch vụ', dataIndex: 'ten' },
                  { title: 'SL', dataIndex: 'sl', width: 80, align: 'center' },
                  { title: 'Đơn giá', dataIndex: 'dongia', width: 120, align: 'right' },
                  { title: 'Thành tiền', dataIndex: 'thanhtien', width: 120, align: 'right' },
                ]}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row style={{ background: '#f0f8ff' }}>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Tổng tiền dịch vụ:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong type="danger">{totalDichVu.toLocaleString()} VND</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          )}

          {/* Đơn thuốc */}
          {donThuocTamThoi.length > 0 && (
            <Card title="ĐƠN THUỐC" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={donThuocTamThoi.map((t, i) => ({
                  key: i,
                  stt: i + 1,
                  tenthuoc: `${t.thuoc?.ten_thuoc || t.ten_thuoc || 'Chưa chọn thuốc'}`,
                  sl: t.so_luong,
                  lieudung: t.lieu_dung,
                  tansuat: t.tan_suat,
                  ghichu: t.ghi_chu
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên thuốc', dataIndex: 'tenthuoc' },
                  { title: 'SL', dataIndex: 'sl', width: 80, align: 'center' },
                  { title: 'Liều dùng', dataIndex: 'lieudung', width: 120 },
                  { title: 'Tần suất', dataIndex: 'tansuat', width: 120 },
                  { title: 'Ghi chú', dataIndex: 'ghichu' },
                ]}
              />
              {ghiChuDonThuoc && (
                <div style={{ marginTop: 16, padding: 12, background: '#fff2e8', borderRadius: 4 }}>
                  <Text strong>Ghi chú đơn thuốc: </Text>
                  <Text>{ghiChuDonThuoc}</Text>
                </div>
              )}
            </Card>
          )}

          {/* Tổng kết */}
          <Card size="small" style={{ background: '#f6ffed' }}>
            <Row justify="end">
              <Col>
                <Space direction="vertical" size="small" align="end">
                  {dichVuTamThoi.length > 0 && (
                    <Text>Tổng tiền dịch vụ: <Text strong>{totalDichVu.toLocaleString()} VND</Text></Text>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                  <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
                    TỔNG CỘNG: {tongCong.toLocaleString()} VND
                  </Title>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>
              Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
            </Text>
            <Text style={{ fontSize: 12 }}>
              Hóa đơn được tạo tự động vào lúc {new Date().toLocaleString('vi-VN')}
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NutritionistAppointmentDetail;