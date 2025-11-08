import React, { useState, useEffect, useRef } from "react";
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
  InputNumber,
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
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import apiHoaDon from "../../../api/HoaDon";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import moment from "moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateMomoQR, generateVNPayQR, generateBankQR } from "../../../utils/paymentQR";
import apiPayment from "../../../api/Payment";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [paymentLoading, setPaymentLoading] = useState(false);

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
    form.setFieldsValue({
      so_tien_nhan: record.tong_tien,
      phuong_thuc_thanh_toan: "tien_mat",
    });
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
      const response = await apiPayment.createMomoPayment(selectedInvoice.id_hoa_don);
      if (response.success && response.data.paymentUrl) {
        // Mở payment URL trong tab mới
        window.open(response.data.paymentUrl, '_blank');
        message.success("Đang chuyển đến trang thanh toán Momo...");
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

  // Tạo payment URL cho VNPay
  const handleCreateVNPayPayment = async () => {
    if (!selectedInvoice) return;
    
    setPaymentLoading(true);
    try {
      const response = await apiPayment.createVNPayPayment(selectedInvoice.id_hoa_don);
      if (response.success && response.data.paymentUrl) {
        // Redirect đến payment URL
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

  const handleSubmitPayment = async (values) => {
    try {
      // Nếu là Momo hoặc VNPay, không cập nhật trạng thái ngay (sẽ cập nhật qua callback)
      if (values.phuong_thuc_thanh_toan === "momo" || values.phuong_thuc_thanh_toan === "vnpay") {
        message.info("Vui lòng hoàn tất thanh toán trên trang thanh toán");
        return;
      }

      await apiHoaDon.updateThanhToan(selectedInvoice.id_hoa_don, {
        phuong_thuc_thanh_toan: values.phuong_thuc_thanh_toan,
        trang_thai: "da_thanh_toan",
      });

      message.success("Thu tiền thành công!");
      setIsPaymentModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
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
        const methods = {
          tien_mat: "Tiền mặt",
          chuyen_khoan: "Chuyển khoản",
          momo: "Momo",
          vnpay: "VNPay",
          the: "Thẻ",
          vi_dien_tu: "Ví điện tử",
        };
        return method ? (
          <Tag color="blue">{methods[method] || method}</Tag>
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
              onClick={() => {
                form.setFieldsValue({
                  so_tien_nhan: selectedInvoice.tong_tien,
                  phuong_thuc_thanh_toan: "tien_mat",
                });
                setIsPaymentModalVisible(true);
              }}
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
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitPayment}>
          {/* Thông tin bệnh nhân */}
          {(selectedInvoice?.nguoi_dung || selectedInvoice?.benh_nhan) && (
            <Card
              size="small"
              style={{
                backgroundColor: "#e6f7ff",
                marginBottom: "16px",
                borderRadius: "8px",
              }}
            >
              <Title level={5} style={{ marginBottom: "12px" }}>
                <UserOutlined style={{ marginRight: "8px" }} />
                Thông tin bệnh nhân
              </Title>
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Text strong>Họ tên: </Text>
                  <Text>{selectedInvoice.nguoi_dung?.ho_ten || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Số điện thoại: </Text>
                  <Text>{selectedInvoice.nguoi_dung?.so_dien_thoai || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Mã BHYT: </Text>
                  {selectedInvoice.benh_nhan?.ma_BHYT ? (
                    <Tag color="green">{selectedInvoice.benh_nhan.ma_BHYT}</Tag>
                  ) : (
                    <Text type="secondary">Không có</Text>
                  )}
                </Col>
              </Row>
            </Card>
          )}

          <Card
            size="small"
            style={{
              backgroundColor: "#f9f9f9",
              marginBottom: "24px",
              borderRadius: "8px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Text type="secondary">Tổng tiền cần thanh toán</Text>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f39c12", margin: "12px 0" }}>
                {parseFloat(selectedInvoice?.tong_tien || 0).toLocaleString("vi-VN")} đ
              </div>
            </div>
          </Card>

          <Form.Item
            name="phuong_thuc_thanh_toan"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: "Vui lòng chọn phương thức!" }]}
          >
            <Select placeholder="Chọn phương thức" size="large">
              <Option value="tien_mat">💵 Tiền mặt</Option>
              <Option value="chuyen_khoan">🏦 Chuyển khoản ngân hàng</Option>
              <Option value="momo">💜 Momo</Option>
              <Option value="vnpay">💙 VNPay</Option>
              <Option value="the">💳 Thẻ</Option>
              <Option value="vi_dien_tu">📱 Ví điện tử khác</Option>
            </Select>
          </Form.Item>

          {/* Hiển thị mã thanh toán khi chọn các phương thức */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.phuong_thuc_thanh_toan !== currentValues.phuong_thuc_thanh_toan
            }
          >
            {({ getFieldValue }) => {
              const phuongThuc = getFieldValue("phuong_thuc_thanh_toan");
              const amount = parseFloat(selectedInvoice?.tong_tien || 0);
              const invoiceId = selectedInvoice?.id_hoa_don || "";
              
              // Chuyển khoản ngân hàng
              if (phuongThuc === "chuyen_khoan") {
                const bankQR = generateBankQR("VCB", "0123456789", "PHONG KHAM MEDPRO", amount, invoiceId);
                return (
                  <Card
                    size="small"
                    style={{
                      backgroundColor: "#f0f9ff",
                      border: "2px solid #1890ff",
                      marginBottom: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <Title level={5} style={{ color: "#1890ff", marginBottom: "12px" }}>
                        🏦 Thông tin chuyển khoản
                      </Title>
                      <div style={{ marginBottom: "12px" }}>
                        <Text strong>Ngân hàng: </Text>
                        <Text style={{ fontSize: "16px", color: "#1890ff" }}>Vietcombank</Text>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <Text strong>Số tài khoản: </Text>
                        <Text
                          copyable
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#1890ff",
                            fontFamily: "monospace",
                          }}
                        >
                          0123456789
                        </Text>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <Text strong>Chủ tài khoản: </Text>
                        <Text style={{ fontSize: "16px" }}>PHÒNG KHÁM MEDPRO</Text>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <Text strong>Số tiền: </Text>
                        <Text style={{ fontSize: "18px", fontWeight: "bold", color: "#f39c12" }}>
                          {amount.toLocaleString("vi-VN")} đ
                        </Text>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <Text strong>Nội dung chuyển khoản: </Text>
                        <Text
                          copyable
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#f39c12",
                            fontFamily: "monospace",
                          }}
                        >
                          {invoiceId}
                        </Text>
                      </div>
                      <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#fff", borderRadius: "8px" }}>
                        <QRCodeSVG
                          value={bankQR}
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                          Quét mã QR để chuyển khoản (số tiền: {amount.toLocaleString("vi-VN")} đ)
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              }
              
              // Momo
              if (phuongThuc === "momo") {
                return (
                  <Card
                    size="small"
                    style={{
                      backgroundColor: "#fff0f6",
                      border: "2px solid #eb2f96",
                      marginBottom: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <Title level={5} style={{ color: "#eb2f96", marginBottom: "12px" }}>
                        💜 Thanh toán qua Momo
                      </Title>
                      <div style={{ marginBottom: "16px" }}>
                        <Text strong>Số tiền: </Text>
                        <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#f39c12" }}>
                          {amount.toLocaleString("vi-VN")} đ
                        </Text>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <Text strong>Mã hóa đơn: </Text>
                        <Text
                          copyable
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#eb2f96",
                            fontFamily: "monospace",
                          }}
                        >
                          {invoiceId}
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        loading={paymentLoading}
                        onClick={handleCreateMomoPayment}
                        style={{
                          backgroundColor: "#eb2f96",
                          borderColor: "#eb2f96",
                          height: "50px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          width: "100%",
                          marginTop: "16px",
                        }}
                        icon={<QrcodeOutlined />}
                      >
                        Thanh toán qua Momo
                      </Button>
                      <div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                        Bạn sẽ được chuyển đến trang thanh toán Momo
                      </div>
                    </div>
                  </Card>
                );
              }
              
              // VNPay
              if (phuongThuc === "vnpay") {
                return (
                  <Card
                    size="small"
                    style={{
                      backgroundColor: "#e6f7ff",
                      border: "2px solid #1890ff",
                      marginBottom: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <Title level={5} style={{ color: "#1890ff", marginBottom: "12px" }}>
                        💙 Thanh toán qua VNPay
                      </Title>
                      <div style={{ marginBottom: "16px" }}>
                        <Text strong>Số tiền: </Text>
                        <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#f39c12" }}>
                          {amount.toLocaleString("vi-VN")} đ
                        </Text>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <Text strong>Mã hóa đơn: </Text>
                        <Text
                          copyable
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#1890ff",
                            fontFamily: "monospace",
                          }}
                        >
                          {invoiceId}
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        loading={paymentLoading}
                        onClick={handleCreateVNPayPayment}
                        style={{
                          backgroundColor: "#1890ff",
                          borderColor: "#1890ff",
                          height: "50px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          width: "100%",
                          marginTop: "16px",
                        }}
                        icon={<QrcodeOutlined />}
                      >
                        Thanh toán qua VNPay
                      </Button>
                      <div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                        Bạn sẽ được chuyển đến trang thanh toán VNPay
                      </div>
                    </div>
                  </Card>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="so_tien_nhan"
            label="Số tiền nhận"
            rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              suffix="đ"
              min={0}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.so_tien_nhan !== currentValues.so_tien_nhan
            }
          >
            {({ getFieldValue }) => {
              const received = parseFloat(getFieldValue("so_tien_nhan") || 0);
              const total = parseFloat(selectedInvoice?.tong_tien || 0);
              const change = received - total;

              return change > 0 ? (
                <Card size="small" style={{ backgroundColor: "#e6f7ff", marginTop: "-16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text>Tiền thừa trả khách:</Text>
                    <Text strong style={{ fontSize: "18px", color: "#096dd9" }}>
                      {change.toLocaleString("vi-VN")} đ
                    </Text>
                  </div>
                </Card>
              ) : received < total ? (
                <Card size="small" style={{ backgroundColor: "#fff7e6", marginTop: "-16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text>Còn thiếu:</Text>
                    <Text strong style={{ fontSize: "18px", color: "#faad14" }}>
                      {Math.abs(change).toLocaleString("vi-VN")} đ
                    </Text>
                  </div>
                </Card>
              ) : null;
            }}
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px", textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsPaymentModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                size="large"
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                }}
              >
                Xác nhận thanh toán
              </Button>
            </Space>
          </Form.Item>
        </Form>
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
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '2px solid #1890ff', paddingBottom: 20, position: 'relative' }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>PHÒNG KHÁM MEDPRO</Title>
              <Text style={{ fontSize: 16, color: '#666' }}>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</Text>
              <br />
              <Text style={{ fontSize: 16, color: '#666' }}>Điện thoại: 028 1234 5678</Text>
              
              {/* QR Code */}
              <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'center' }}>
                <QRCodeSVG 
                  value={selectedInvoice.id_hoa_don?.toString() || ''}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#666' }}>
                  Mã: {selectedInvoice.id_hoa_don}
                </div>
              </div>
            </div>

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

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>
                Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
              </Text>
              <Text style={{ fontSize: 12 }}>
                Hóa đơn được tạo tự động vào lúc {moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format("DD/MM/YYYY HH:mm:ss")}
              </Text>
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
