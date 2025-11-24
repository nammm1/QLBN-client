import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Row,
  Col,
  Select,
  message,
  Typography,
  Descriptions,
  Divider,
  Statistic,
  DatePicker,
  Drawer,
  Empty,
} from "antd";
import {
  DollarOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  RiseOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  QrcodeOutlined,
  ScanOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Html5QrcodeScanner } from "html5-qrcode";
import apiHoaDon from "../../../api/HoaDon";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import moment from "moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import apiPayment from "../../../api/Payment";
import { InvoiceHeader, InvoiceSignatureSection } from "../../../components/Invoice/InvoiceBranding";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const deriveCareStaffInfo = (invoice) => {
  if (!invoice) return { type: null, label: "", info: null };
  if (invoice.id_cuoc_hen_kham) {
    return {
      type: "medical",
      label: "Bác sĩ khám bệnh",
      info: invoice.bac_si_kham || null,
    };
  }
  if (invoice.id_cuoc_hen_tu_van) {
    return {
      type: "nutrition",
      label: "Chuyên gia dinh dưỡng",
      info: invoice.chuyen_gia_tu_van || null,
    };
  }
  return { type: null, label: "", info: null };
};

const PAYMENT_METHOD_LABELS = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
  momo: "Momo",
  vnpay: "VNPay",
  the: "Thẻ",
  vi_dien_tu: "Ví điện tử",
};

const formatVnd = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")} đ`;
};

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [isQRScannerVisible, setIsQRScannerVisible] = useState(false);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const qrScannerRef = useRef(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [filterForm] = Form.useForm();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cashProcessing, setCashProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const staffInfo = deriveCareStaffInfo(selectedInvoice);

  const invoiceSubtitle = selectedInvoice
    ? selectedInvoice.id_cuoc_hen_kham
      ? "Hóa đơn khám bệnh"
      : selectedInvoice.id_cuoc_hen_tu_van
      ? "Hóa đơn tư vấn dinh dưỡng"
      : "Hóa đơn dịch vụ y tế"
    : "Hóa đơn dịch vụ y tế";

  const invoiceCreatedAt = selectedInvoice
    ? moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format("DD/MM/YYYY HH:mm")
    : null;

  const invoiceMetadata = selectedInvoice
    ? [
        invoiceCreatedAt && { label: "Ngày lập", value: invoiceCreatedAt },
        selectedInvoice.phuong_thuc_thanh_toan && {
          label: "Phương thức",
          value: PAYMENT_METHOD_LABELS[selectedInvoice.phuong_thuc_thanh_toan] ||
            selectedInvoice.phuong_thuc_thanh_toan,
        },
        {
          label: "Trạng thái",
          value: selectedInvoice.trang_thai === "da_thanh_toan" ? "Đã thanh toán" : "Chưa thanh toán",
        },
      ].filter(Boolean)
    : [];

  const patientName =
    selectedInvoice?.nguoi_dung?.ho_ten ||
    selectedInvoice?.benh_nhan?.ho_ten ||
    "................................";

  const cashierName =
    selectedInvoice?.nhan_vien_thanh_toan?.ho_ten ||
    selectedInvoice?.nhan_vien_quay?.ho_ten ||
    selectedInvoice?.nguoi_tao?.ho_ten ||
    null;

  const cashierTitle =
    selectedInvoice?.nhan_vien_thanh_toan?.chuc_danh ||
    selectedInvoice?.nhan_vien_quay?.chuc_danh ||
    "Thu ngân";

  const specialization =
    staffInfo.type === "medical"
      ? staffInfo.info?.chuc_danh || staffInfo.info?.chuyen_mon
      : staffInfo.info?.chuyen_nganh;

  const signatureSlots = [
    {
      label: "Nhân viên thu ngân",
      name: cashierName || "................................",
      title: cashierTitle,
      note: "Ký, ghi rõ họ tên",
    },
    {
      label:
        staffInfo.type === "medical"
          ? "Bác sĩ phụ trách"
          : staffInfo.type === "nutrition"
          ? "Chuyên gia dinh dưỡng"
          : "Nhân sự phụ trách chuyên môn",
      name: staffInfo.info?.ho_ten || "................................",
      title: specialization,
      note: "Ký, ghi rõ họ tên & đóng dấu (nếu có)",
    },
    {
      label: "Bệnh nhân/Người thanh toán",
      name: patientName,
      note: "Ký, ghi rõ họ tên",
    },
  ];

  const [filters, setFilters] = useState({
    trang_thai: undefined,
    phuong_thuc_thanh_toan: undefined,
    dateRange: null,
  });

  const [stats, setStats] = useState({
    todayRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Xây dựng params cho API - luôn dùng search để có thông tin bệnh nhân
      const params = {};
      
      if (filters.trang_thai) {
        params.trang_thai = filters.trang_thai;
      }
      if (filters.phuong_thuc_thanh_toan) {
        params.phuong_thuc_thanh_toan = filters.phuong_thuc_thanh_toan;
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.tu_ngay = moment(filters.dateRange[0]).format("YYYY-MM-DD");
        params.den_ngay = moment(filters.dateRange[1]).format("YYYY-MM-DD");
      }
      if (searchText) {
        params.search = searchText;
      }

      // Luôn dùng API search để có thông tin bệnh nhân (tên, SĐT, BHYT)
      const response = await apiHoaDon.search(params);

      const invoiceData = response?.data || response || [];
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

      // Tính toán thống kê
      const today = moment().format("YYYY-MM-DD");
      const todayInvoices = invoiceData.filter(
        (inv) => moment(inv.thoi_gian_tao || inv.ngay_tao).format("YYYY-MM-DD") === today
      );

      const todayRevenue = todayInvoices
        .filter((inv) => inv.trang_thai === "da_thanh_toan")
        .reduce((sum, inv) => sum + (parseFloat(inv.tong_tien) || 0), 0);

      const pendingPayments = invoiceData.filter(
        (inv) => inv.trang_thai === "chua_thanh_toan"
      ).length;

      const completedPayments = todayInvoices.filter(
        (inv) => inv.trang_thai === "da_thanh_toan"
      ).length;

      const totalRevenue = invoiceData
        .filter((inv) => inv.trang_thai === "da_thanh_toan")
        .reduce((sum, inv) => sum + (parseFloat(inv.tong_tien) || 0), 0);

      setStats({
        todayRevenue,
        pendingPayments,
        completedPayments,
        totalRevenue,
      });
    } catch (error) {
      message.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.paymentSuccess) {
      return;
    }

    const successMessage = location.state.orderId
      ? `Hóa đơn ${location.state.orderId} đã thanh toán thành công`
      : "Thanh toán Momo thành công";
    message.success(successMessage);
    fetchData();
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.pathname, navigate]);

  const handleViewDetail = async (record) => {
    try {
      setSelectedInvoice(record);
      // Fetch chi tiết hóa đơn
      const response = await apiChiTietHoaDon.getByHoaDon(record.id_hoa_don);
      const details = response?.data || response || [];
      setInvoiceDetails(Array.isArray(details) ? details : []);
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error("Không thể tải chi tiết hóa đơn");
      console.error(error);
    }
  };

  const handlePayment = (record) => {
    setSelectedInvoice(record);
    setIsPaymentModalVisible(true);
  };

  // Hàm xử lý quét QR code
  const handleQRScanSuccess = async (decodedText) => {
    try {
      // QR code chứa ID hóa đơn
      const invoiceId = decodedText;
      
      // Dừng scanner trước
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      }
      
      // Tìm hóa đơn bằng API search để có thông tin bệnh nhân đầy đủ
      const response = await apiHoaDon.search({ search: invoiceId });
      const invoices = response?.data || response || [];
      const invoice = Array.isArray(invoices) ? invoices.find(inv => inv.id_hoa_don?.toString() === invoiceId) : null;
      
      if (!invoice && invoiceId) {
        // Thử lại với getById nếu search không tìm thấy
        const singleResponse = await apiHoaDon.getById(invoiceId);
        const singleInvoice = singleResponse?.data || singleResponse;
        if (singleInvoice) {
          // Fetch chi tiết
          const detailResponse = await apiChiTietHoaDon.getByHoaDon(invoiceId);
          const details = detailResponse?.data || detailResponse || [];
          
          setSelectedInvoice(singleInvoice);
          setInvoiceDetails(Array.isArray(details) ? details : []);
          setIsQRScannerVisible(false);
          setIsDetailModalVisible(true);
          
          message.success("Đã tìm thấy hóa đơn!");
          return;
        }
      }
      
      if (invoice) {
        // Fetch chi tiết và hiển thị
        const detailResponse = await apiChiTietHoaDon.getByHoaDon(invoiceId);
        const details = detailResponse?.data || detailResponse || [];
        
        setSelectedInvoice(invoice);
        setInvoiceDetails(Array.isArray(details) ? details : []);
        setIsQRScannerVisible(false);
        setIsDetailModalVisible(true);
        
        message.success("Đã tìm thấy hóa đơn!");
      } else {
        message.error("Không tìm thấy hóa đơn!");
      }
    } catch (error) {
      console.error("Error scanning QR:", error);
      message.error("Không thể tìm hóa đơn từ QR code!");
      
      // Dừng scanner nếu có lỗi
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      }
    }
  };

  const handleQRScanError = (errorMessage) => {
    // Chỉ log, không hiển thị lỗi cho user trừ khi cần
  };

  // Khởi tạo QR scanner
  useEffect(() => {
    if (!isQRScannerVisible) {
      // Cleanup khi đóng modal
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(() => {});
        qrScannerRef.current = null;
      }
      return;
    }

    // Khởi tạo scanner
    if (!qrScannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        false
      );
      
      scanner.render(
        handleQRScanSuccess,
        handleQRScanError
      );
      
      qrScannerRef.current = scanner;
    }
  }, [isQRScannerVisible]);

  // Tạo payment URL cho Momo
  const handleCreateMomoPayment = async () => {
    if (!selectedInvoice) return;
    
    setPaymentLoading(true);
    try {
      const response = await apiPayment.createMomoPayment(selectedInvoice.id_hoa_don, {
        source: "cashier",
        redirectPath: "/receptionist/billing",
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

  const handleCashPayment = async () => {
    if (!selectedInvoice) return;

    setCashProcessing(true);
    try {
      await apiHoaDon.updateThanhToan(selectedInvoice.id_hoa_don, {
        phuong_thuc_thanh_toan: "tien_mat",
        trang_thai: "da_thanh_toan",
      });

      message.success("Đã cập nhật thanh toán tiền mặt");
      setIsPaymentModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Không thể cập nhật thanh toán tiền mặt. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setCashProcessing(false);
    }
  };

  const handlePrintInvoice = (record) => {
    setSelectedInvoice(record);
    setIsPrintModalVisible(true);
  };

  const handleExportPdf = async () => {
    try {
      const input = document.getElementById("invoicePrintPreview");
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

      pdf.save(`HoaDon_${selectedInvoice.id_hoa_don}.pdf`);
      message.success("Xuất hóa đơn thành công!");
      setIsPrintModalVisible(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      message.error("Có lỗi xảy ra khi xuất hóa đơn!");
    }
  };

  const handleFilterSubmit = (values) => {
    setFilters({
      trang_thai: values.trang_thai,
      phuong_thuc_thanh_toan: values.phuong_thuc_thanh_toan,
      dateRange: values.dateRange,
    });
    setIsFilterDrawerVisible(false);
  };

  const handleClearFilters = () => {
    try {
      if (filterForm && typeof filterForm.resetFields === 'function') {
        filterForm.resetFields();
      }
    } catch (error) {
      console.warn("Could not reset filter form:", error);
    }
    setFilters({
      trang_thai: undefined,
      phuong_thuc_thanh_toan: undefined,
      dateRange: null,
    });
    setSearchText("");
  };

  const handleSearch = () => {
    fetchData();
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "id_hoa_don",
      key: "id_hoa_don",
      width: 150,
      fixed: "left",
      render: (id) => (
        <Text strong style={{ color: "#f39c12", fontFamily: "monospace" }}>
          {id?.substring(0, 12)}...
        </Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "thoi_gian_tao",
      key: "ngay_tao",
      width: 130,
      render: (date) => {
        const dateValue = date || selectedInvoice?.thoi_gian_tao || selectedInvoice?.ngay_tao;
        return (
          <div>
            <CalendarOutlined style={{ marginRight: "6px", color: "#f39c12" }} />
            {moment(dateValue).format("DD/MM/YYYY")}
          </div>
        );
      },
    },
    {
      title: "Bệnh nhân",
      key: "patient",
      width: 220,
      render: (_, record) => {
        // Lấy thông tin từ nguoi_dung (từ API search)
        const nguoiDung = record.nguoi_dung;
        const benhNhan = record.benh_nhan;
        const hoTen = nguoiDung?.ho_ten || "N/A";
        const soDienThoai = nguoiDung?.so_dien_thoai || "";
        const maBHYT = benhNhan?.ma_BHYT || "";
        
        return (
          <div>
            <UserOutlined style={{ marginRight: "6px", color: "#1890ff" }} />
            <Text strong>{hoTen}</Text>
            {soDienThoai && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  📞 {soDienThoai}
                </Text>
              </div>
            )}
            {maBHYT && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px", color: "#096dd9" }}>
                  🏥 BHYT: {maBHYT}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      width: 150,
      render: (amount) => (
        <Text strong style={{ color: "#f39c12", fontSize: "15px" }}>
          {parseFloat(amount || 0).toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 130,
      render: (status) => {
        const configs = {
          chua_thanh_toan: { color: "warning", text: "Chưa thanh toán" },
          da_thanh_toan: { color: "success", text: "Đã thanh toán" },
          da_huy: { color: "error", text: "Đã hủy" },
        };
        const { color, text } = configs[status] || configs.chua_thanh_toan;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Phương thức",
      dataIndex: "phuong_thuc_thanh_toan",
      key: "phuong_thuc_thanh_toan",
      width: 150,
      render: (method) => {
        return method ? (
          <Tag color="blue">{PAYMENT_METHOD_LABELS[method] || method}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ color: "#1890ff" }}
            title="Xem chi tiết"
          />
          {record.trang_thai === "chua_thanh_toan" && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePayment(record)}
              style={{ color: "#096dd9" }}
              title="Thanh toán"
            />
          )}
          {record.trang_thai === "da_thanh_toan" && (
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record)}
              style={{ color: "#f39c12" }}
              title="In hóa đơn"
            />
          )}
        </Space>
      ),
    },
  ];

  const filteredInvoices = invoices;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          💰 Thu ngân
        </Title>
        <Text type="secondary">Quản lý thanh toán và hóa đơn</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Doanh thu hôm nay</span>}
              value={stats.todayRevenue}
              prefix={<RiseOutlined />}
              suffix="đ"
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Chờ thanh toán</span>}
              value={stats.pendingPayments}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Đã thanh toán hôm nay</span>}
              value={stats.completedPayments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Tổng doanh thu</span>}
              value={stats.totalRevenue}
              prefix={<RiseOutlined />}
              suffix="đ"
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16} md={17}>
            <Input
              placeholder="Tìm kiếm theo mã hóa đơn, tên bệnh nhân, số điện thoại..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Col>
          <Col xs={8} sm={4} md={2}>
            <Button
              icon={<ScanOutlined />}
              onClick={() => setIsQRScannerVisible(true)}
              size="large"
              block
              type="primary"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Quét QR
            </Button>
          </Col>
          <Col xs={8} sm={4} md={2}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsFilterDrawerVisible(true)}
              size="large"
              block
            >
              Lọc
            </Button>
          </Col>
          <Col xs={8} sm={4} md={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleClearFilters}
              size="large"
              block
            >
              Làm mới
            </Button>
          </Col>
        </Row>

        {/* Active filters display */}
        {(filters.trang_thai || filters.phuong_thuc_thanh_toan || filters.dateRange || searchText) && (
          <div style={{ marginTop: "16px" }}>
            <Space wrap>
              <Text type="secondary">Bộ lọc đang áp dụng:</Text>
              {filters.trang_thai && (
                <Tag closable onClose={() => {
                  filterForm.setFieldsValue({ trang_thai: undefined });
                  setFilters({ ...filters, trang_thai: undefined });
                }}>
                  Trạng thái: {filters.trang_thai === "da_thanh_toan" ? "Đã thanh toán" : filters.trang_thai === "chua_thanh_toan" ? "Chưa thanh toán" : "Đã hủy"}
                </Tag>
              )}
              {filters.phuong_thuc_thanh_toan && (
                <Tag closable onClose={() => {
                  filterForm.setFieldsValue({ phuong_thuc_thanh_toan: undefined });
                  setFilters({ ...filters, phuong_thuc_thanh_toan: undefined });
                }}>
                  Phương thức: {filters.phuong_thuc_thanh_toan}
                </Tag>
              )}
              {filters.dateRange && (
                <Tag closable onClose={() => {
                  filterForm.setFieldsValue({ dateRange: null });
                  setFilters({ ...filters, dateRange: null });
                }}>
                  Từ {moment(filters.dateRange[0]).format("DD/MM/YYYY")} đến {moment(filters.dateRange[1]).format("DD/MM/YYYY")}
                </Tag>
              )}
              {searchText && (
                <Tag closable onClose={() => setSearchText("")}>
                  Tìm kiếm: {searchText}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: "12px" }}>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          rowKey="id_hoa_don"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
          locale={{
            emptyText: <Empty description="Không có hóa đơn nào" />,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <EyeOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Chi tiết hóa đơn
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedInvoice?.trang_thai === "chua_thanh_toan" && (
            <Button
              key="payment"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => setIsPaymentModalVisible(true)}
              style={{
                background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                border: "none",
              }}
            >
              Thanh toán
            </Button>
          ),
          selectedInvoice?.trang_thai === "da_thanh_toan" && (
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(selectedInvoice)}
              style={{
                background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                border: "none",
              }}
            >
              In hóa đơn
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã hóa đơn" span={2}>
                <Text strong style={{ fontFamily: "monospace" }}>
                  {selectedInvoice.id_hoa_don}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedInvoice.trang_thai === "da_thanh_toan" ? (
                  <Tag color="success">Đã thanh toán</Tag>
                ) : selectedInvoice.trang_thai === "chua_thanh_toan" ? (
                  <Tag color="warning">Chưa thanh toán</Tag>
                ) : (
                  <Tag color="error">Đã hủy</Tag>
                )}
              </Descriptions.Item>
              {selectedInvoice.phuong_thuc_thanh_toan && (
                <Descriptions.Item label="Phương thức thanh toán" span={2}>
                  {selectedInvoice.phuong_thuc_thanh_toan === "tien_mat"
                    ? "Tiền mặt"
                    : selectedInvoice.phuong_thuc_thanh_toan === "chuyen_khoan"
                    ? "Chuyển khoản"
                    : selectedInvoice.phuong_thuc_thanh_toan === "the"
                    ? "Thẻ"
                    : "Ví điện tử"}
                </Descriptions.Item>
              )}
              {selectedInvoice.thoi_gian_thanh_toan && (
                <Descriptions.Item label="Ngày thanh toán" span={2}>
                  {moment(selectedInvoice.thoi_gian_thanh_toan).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              {/* Thông tin bệnh nhân */}
              {(selectedInvoice.nguoi_dung || selectedInvoice.benh_nhan) && (
                <>
                  <Divider orientation="left">Thông tin bệnh nhân</Divider>
                  <Descriptions.Item label="Họ tên" span={2}>
                    {selectedInvoice.nguoi_dung?.ho_ten || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {selectedInvoice.nguoi_dung?.so_dien_thoai || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedInvoice.nguoi_dung?.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã BHYT">
                    {selectedInvoice.benh_nhan?.ma_BHYT ? (
                      <Tag color="green">{selectedInvoice.benh_nhan.ma_BHYT}</Tag>
                    ) : (
                      <Text type="secondary">Không có</Text>
                    )}
                  </Descriptions.Item>
                  {selectedInvoice.benh_nhan?.id_benh_nhan && (
                    <Descriptions.Item label="Mã bệnh nhân">
                      {selectedInvoice.benh_nhan.id_benh_nhan}
                    </Descriptions.Item>
                  )}
                </>
              )}
              {staffInfo.info && (
                <>
                  <Divider orientation="left">
                    Thông tin {staffInfo.type === "medical" ? "bác sĩ khám" : "chuyên gia dinh dưỡng"}
                  </Divider>
                  <Descriptions.Item label="Họ tên" span={2}>
                    {staffInfo.info.ho_ten || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {staffInfo.info.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {staffInfo.info.so_dien_thoai || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label={staffInfo.type === "medical" ? "Chuyên môn" : "Chuyên ngành"} span={2}>
                    {staffInfo.type === "medical"
                      ? staffInfo.info.chuyen_mon || staffInfo.info.chuc_danh || "N/A"
                      : staffInfo.info.chuyen_nganh || "N/A"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Chi tiết dịch vụ</Title>
            {invoiceDetails.length > 0 ? (
              <Table
                dataSource={invoiceDetails}
                rowKey="id_chi_tiet"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Dịch vụ",
                    key: "ten_dich_vu",
                    render: (_, record) => record.dich_vu?.ten_dich_vu || "N/A",
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "so_luong",
                    key: "so_luong",
                    align: "center",
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "don_gia",
                    key: "don_gia",
                    align: "right",
                    render: (price) => `${parseFloat(price || 0).toLocaleString("vi-VN")} đ`,
                  },
                  {
                    title: "Thành tiền",
                    key: "thanh_tien",
                    align: "right",
                    render: (_, record) => {
                      const thanhTien = parseFloat(record.don_gia || 0) * parseFloat(record.so_luong || 0);
                      return (
                        <Text strong style={{ color: "#f39c12" }}>
                          {thanhTien.toLocaleString("vi-VN")} đ
                        </Text>
                      );
                    },
                  },
                ]}
              />
            ) : (
              <Empty description="Không có chi tiết dịch vụ" />
            )}

            <Divider />

            <div style={{ textAlign: "right" }}>
              <Space direction="vertical" style={{ width: "300px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Tổng tiền:</Text>
                  <Text strong style={{ fontSize: "20px", color: "#f39c12" }}>
                    {parseFloat(selectedInvoice.tong_tien || 0).toLocaleString("vi-VN")} đ
                  </Text>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <DollarOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Thu tiền
          </span>
        }
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        width={860}
        bodyStyle={{ paddingTop: 12 }}
      >
        {selectedInvoice ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                background: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Row gutter={[24, 16]} align="middle">
                <Col xs={24} md={12}>
                  <Statistic
                    title={<Text type="secondary">Tổng tiền cần thanh toán</Text>}
                    value={Number(selectedInvoice?.tong_tien || 0)}
                    formatter={(value) => formatVnd(value)}
                    valueStyle={{ fontSize: 34, color: "#fa8c16", fontWeight: 700 }}
                  />
                  <Space direction="vertical" size={4} style={{ marginTop: 16 }}>
                    <Text type="secondary">Mã hóa đơn</Text>
                    <Text strong style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16 }}>
                      {selectedInvoice?.id_hoa_don}
                    </Text>
                  </Space>
                  <Space direction="horizontal" size="middle" style={{ marginTop: 16, flexWrap: "wrap" }}>
                    <Tag color="blue">
                      {invoiceSubtitle}
                    </Tag>
                    <Tag color={selectedInvoice?.trang_thai === "da_thanh_toan" ? "green" : "orange"}>
                      {selectedInvoice?.trang_thai === "da_thanh_toan" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </Tag>
                    {selectedInvoice?.phuong_thuc_thanh_toan && (
                      <Tag color="geekblue">
                        {PAYMENT_METHOD_LABELS[selectedInvoice?.phuong_thuc_thanh_toan] || "Chưa xác định"}
                      </Tag>
                    )}
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: "#e6f7ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UserOutlined style={{ color: "#1890ff", fontSize: 22 }} />
                    </div>
                    <div>
                      <Text type="secondary">Bệnh nhân</Text>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>
                        {selectedInvoice?.nguoi_dung?.ho_ten || selectedInvoice?.benh_nhan?.ho_ten || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Số điện thoại">
                      {selectedInvoice?.nguoi_dung?.so_dien_thoai || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã BHYT">
                      {selectedInvoice?.benh_nhan?.ma_BHYT ? (
                        <Tag color="green">{selectedInvoice?.benh_nhan?.ma_BHYT}</Tag>
                      ) : (
                        <Text type="secondary">Không có</Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            <Card
              size="small"
              style={{
                borderRadius: 10,
                border: "1px solid #f0f0f0",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                      Nhân sự phụ trách
                    </Text>
                    <Text strong>
                      {selectedInvoice?.id_cuoc_hen_kham
                        ? selectedInvoice?.bac_si_kham?.ho_ten || "Đang cập nhật"
                        : selectedInvoice?.chuyen_gia_tu_van?.ho_ten || "Đang cập nhật"}
                    </Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">
                      <RiseOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                      Ngày tạo hóa đơn
                    </Text>
                    <Text strong>
                      {selectedInvoice?.thoi_gian_tao
                        ? moment(selectedInvoice.thoi_gian_tao).format("DD/MM/YYYY HH:mm")
                        : "--"}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Divider plain style={{ margin: "12px 0" }}>
              Chọn phương thức thanh toán
            </Divider>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 12,
                    border: "1px solid #b7eb8f",
                    background:
                      "linear-gradient(145deg, rgba(246,255,237,1) 0%, rgba(255,255,255,1) 100%)",
                  }}
                  bodyStyle={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                  <Space direction="vertical" size={12}>
                    <Title level={5} style={{ color: "#389e0d", margin: 0 }}>
                      💵 Thanh toán tiền mặt
                    </Title>
                    <Text type="secondary">
                      Xác nhận ngay sau khi đã nhận tiền từ khách hàng. Hệ thống sẽ cập nhật phương thức là "Tiền mặt".
                    </Text>
                    <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                      <Text strong>Ghi nhớ</Text>
                      <Text>- In và bàn giao biên nhận cho khách</Text>
                      <Text>- Kiểm tra số tiền đã thu trước khi xác nhận</Text>
                    </Space>
                  </Space>
                  <Divider style={{ margin: "12px 0" }} />
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={cashProcessing}
                    onClick={handleCashPayment}
                    style={{
                      width: "100%",
                      height: 50,
                      marginTop: "auto",
                      background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                      border: "none",
                      fontWeight: 600,
                      letterSpacing: 0.3,
                    }}
                  >
                    Xác nhận đã thu tiền mặt
                  </Button>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 12,
                    border: "1px solid #ffadd2",
                    background:
                      "linear-gradient(145deg, rgba(255,240,246,1) 0%, rgba(255,255,255,1) 100%)",
                  }}
                  bodyStyle={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                  <Space direction="vertical" size={12}>
                    <Title level={5} style={{ color: "#c41d7f", margin: 0 }}>
                      💜 Thanh toán qua Momo
                    </Title>
                    <Text type="secondary">
                      Thu ngân sẽ được chuyển sang cổng Momo để hoàn tất giao dịch, sau đó hệ thống tự quay lại và làm
                      mới danh sách.
                    </Text>
                    <Descriptions
                      size="small"
                      column={1}
                      colon={false}
                      style={{ marginTop: 8 }}
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Descriptions.Item label="Số tiền">
                        <Text strong style={{ fontSize: 20, color: "#fa8c16" }}>
                          {formatVnd(selectedInvoice?.tong_tien)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã hóa đơn">
                        <Text strong style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {selectedInvoice?.id_hoa_don}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                  <Divider style={{ margin: "12px 0" }} />
                  <Button
                    type="primary"
                    size="large"
                    loading={paymentLoading}
                    onClick={handleCreateMomoPayment}
                    style={{
                      width: "100%",
                      height: 50,
                      marginTop: "auto",
                      background: "#eb2f96",
                      borderColor: "#eb2f96",
                      fontWeight: 600,
                    }}
                    icon={<QrcodeOutlined />}
                  >
                    Chuyển sang Momo
                  </Button>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                    Nếu gặp sự cố với cổng thanh toán, vui lòng thử lại hoặc hướng dẫn khách đổi sang phương thức tiền
                    mặt.
                  </Text>
                </Card>
              </Col>
            </Row>
          </Space>
        ) : (
          <Empty description="Chưa chọn hóa đơn để thanh toán" />
        )}
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <ScanOutlined style={{ marginRight: "8px", color: "#667eea" }} />
            Quét QR code hóa đơn
          </span>
        }
        open={isQRScannerVisible}
        onCancel={() => {
          setIsQRScannerVisible(false);
          if (qrScannerRef.current) {
            qrScannerRef.current.clear();
            qrScannerRef.current = null;
          }
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsQRScannerVisible(false);
            if (qrScannerRef.current) {
              qrScannerRef.current.clear();
              qrScannerRef.current = null;
            }
          }}>
            Đóng
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: "center" }}>
          <div id="qr-reader" style={{ marginBottom: "16px" }}></div>
          <Text type="secondary">
            Đưa camera vào mã QR code trên hóa đơn để tự động tìm kiếm
          </Text>
        </div>
      </Modal>

      {/* Print Invoice Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <PrinterOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Xem trước hóa đơn
          </span>
        }
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPrintModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handleExportPdf}
            style={{
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              border: "none",
            }}
          >
            In hóa đơn
          </Button>,
        ]}
        width={900}
      >
        {selectedInvoice && (
          <div id="invoicePrintPreview" style={{ padding: 20, background: 'white', border: '1px solid #f0f0f0' }}>
            <InvoiceHeader
              subtitle={invoiceSubtitle}
              qrValue={selectedInvoice.id_hoa_don?.toString() || ""}
            />

            {/* Thông tin hóa đơn */}
            <Card title="THÔNG TIN HÓA ĐƠN" size="small" style={{ marginBottom: 20 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}><Text strong>Mã hóa đơn:</Text> {selectedInvoice.id_hoa_don}</Col>
                <Col span={12}><Text strong>Ngày tạo:</Text> {moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format("DD/MM/YYYY HH:mm")}</Col>
                <Col span={12}><Text strong>Trạng thái:</Text> 
                  {selectedInvoice.trang_thai === "da_thanh_toan" ? (
                    <Tag color="success">Đã thanh toán</Tag>
                  ) : (
                    <Tag color="warning">Chưa thanh toán</Tag>
                  )}
                </Col>
                {selectedInvoice.phuong_thuc_thanh_toan && (
                  <Col span={12}><Text strong>Phương thức:</Text> 
                    {selectedInvoice.phuong_thuc_thanh_toan === "tien_mat" ? "Tiền mặt" :
                     selectedInvoice.phuong_thuc_thanh_toan === "chuyen_khoan" ? "Chuyển khoản" :
                     selectedInvoice.phuong_thuc_thanh_toan === "the" ? "Thẻ" : "Ví điện tử"}
                  </Col>
                )}
              </Row>
            </Card>

            {/* Thông tin bệnh nhân */}
            {(selectedInvoice.nguoi_dung || selectedInvoice.benh_nhan) && (
              <Card title="THÔNG TIN BỆNH NHÂN" size="small" style={{ marginBottom: 20 }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}><Text strong>Họ tên:</Text> {selectedInvoice.nguoi_dung?.ho_ten || "N/A"}</Col>
                  <Col span={12}><Text strong>Số điện thoại:</Text> {selectedInvoice.nguoi_dung?.so_dien_thoai || "N/A"}</Col>
                  <Col span={12}><Text strong>Email:</Text> {selectedInvoice.nguoi_dung?.email || "N/A"}</Col>
                  <Col span={12}><Text strong>Mã BHYT:</Text> {selectedInvoice.benh_nhan?.ma_BHYT || "Không có"}</Col>
                </Row>
              </Card>
            )}

            {/* Nhân sự phụ trách */}
            {staffInfo.info && (
              <Card
                title={staffInfo.type === "medical" ? "BÁC SĨ PHỤ TRÁCH" : "CHUYÊN GIA DINH DƯỠNG"}
                size="small"
                style={{ marginBottom: 20 }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={12}><Text strong>Họ tên:</Text> {staffInfo.info.ho_ten || "N/A"}</Col>
                  <Col span={12}><Text strong>Email:</Text> {staffInfo.info.email || "N/A"}</Col>
                  <Col span={12}><Text strong>Số điện thoại:</Text> {staffInfo.info.so_dien_thoai || "N/A"}</Col>
                  <Col span={12}>
                    <Text strong>{staffInfo.type === "medical" ? "Chuyên môn:" : "Chuyên ngành:"}</Text>{" "}
                    {staffInfo.type === "medical"
                      ? staffInfo.info.chuyen_mon || staffInfo.info.chuc_danh || "N/A"
                      : staffInfo.info.chuyen_nganh || "N/A"}
                  </Col>
                </Row>
              </Card>
            )}

            {/* Chi tiết dịch vụ */}
            {invoiceDetails.length > 0 && (
              <Card title="DỊCH VỤ SỬ DỤNG" size="small" style={{ marginBottom: 20 }}>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={invoiceDetails}
                  rowKey="id_chi_tiet"
                  columns={[
                    { title: 'STT', dataIndex: 'key', width: 60, render: (_, __, index) => index + 1 },
                    { title: 'Tên dịch vụ', dataIndex: 'ten', render: (_, record) => record.dich_vu?.ten_dich_vu || "N/A" },
                    { title: 'Số lượng', dataIndex: 'so_luong', width: 100, align: 'center' },
                    { title: 'Đơn giá (VNĐ)', dataIndex: 'don_gia', width: 120, align: 'right', render: (price) => parseFloat(price || 0).toLocaleString('vi-VN') },
                    { title: 'Thành tiền (VNĐ)', key: 'thanh_tien', width: 140, align: 'right', 
                      render: (_, record) => (parseFloat(record.don_gia || 0) * parseFloat(record.so_luong || 0)).toLocaleString('vi-VN') },
                  ]}
                />
              </Card>
            )}

            {/* Tổng kết */}
            <Card size="small" style={{ background: '#f6ffed' }}>
              <Row justify="end">
                <Col>
                  <Space direction="vertical" size="small" align="end">
                    <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
                      TỔNG CỘNG: {parseFloat(selectedInvoice.tong_tien || 0).toLocaleString('vi-VN')} VNĐ
                    </Title>
                  </Space>
                </Col>
              </Row>
            </Card>

            <InvoiceSignatureSection slots={signatureSlots} />

            {/* Footer - Thông tin liên hệ */}
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e8e8e8' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#333' }}>
                  123 Đường ABC, Quận XYZ, TP.HCM
                </Text>
                <Text style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#333' }}>
                  Điện thoại: 028 1234 5678 • Email: support@medpro.vn
                </Text>
                <Text style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#333' }}>
                  Website: www.medpro.vn
                </Text>
                <Text style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>
                  MST: 0312345678
                </Text>
                <Text style={{ display: 'block', fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                  Nếu quý khách có nhu cầu hỗ trợ, vui lòng liên hệ theo địa chỉ trên hoặc đến quầy nhân viên quầy
                </Text>
              </div>
              <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
                <Text style={{ fontSize: 12 }}>
                  Hóa đơn được tạo tự động vào lúc {moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format("DD/MM/YYYY HH:mm:ss")}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Filter Drawer */}
      <Drawer
        title="Bộ lọc nâng cao"
        placement="right"
        onClose={() => setIsFilterDrawerVisible(false)}
        open={isFilterDrawerVisible}
        width={350}
      >
        <Form form={filterForm} layout="vertical" onFinish={handleFilterSubmit} initialValues={filters}>
          <Form.Item name="trang_thai" label="Trạng thái">
            <Select placeholder="Chọn trạng thái" allowClear>
              <Option value="chua_thanh_toan">Chưa thanh toán</Option>
              <Option value="da_thanh_toan">Đã thanh toán</Option>
              <Option value="da_huy">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phuong_thuc_thanh_toan" label="Phương thức thanh toán">
            <Select placeholder="Chọn phương thức" allowClear>
              <Option value="tien_mat">Tiền mặt</Option>
              <Option value="chuyen_khoan">Chuyển khoản</Option>
              <Option value="momo">Momo</Option>
              <Option value="vnpay">VNPay</Option>
              <Option value="the">Thẻ</Option>
              <Option value="vi_dien_tu">Ví điện tử</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Khoảng thời gian">
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
              <Button type="primary" htmlType="submit">
                Áp dụng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Billing;
