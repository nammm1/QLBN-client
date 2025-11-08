import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
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
  Empty,
  InputNumber,
  Tabs,
  Badge,
} from "antd";
import {
  DollarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import apiHoaDon from "../../../api/HoaDon";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import moment from "moment";
import { generateMomoQR, generateVNPayQR, generateBankQR } from "../../../utils/paymentQR";
import apiPayment from "../../../api/Payment";
import "./Invoices.css";

const { Title, Text } = Typography;
const { Option } = Select;

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("chua_thanh_toan");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userInfo = savedUserInfo?.user || savedUserInfo;
  const userId = userInfo?.id_nguoi_dung;

  // Kiểm tra đăng nhập
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true" || !userId) {
      message.warning("Vui lòng đăng nhập để xem hóa đơn");
      navigate("/login");
      return;
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, activeTab]);

  const fetchData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Lấy id_benh_nhan từ userInfo (có thể là id_benh_nhan hoặc id_nguoi_dung)
      const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userInfo = savedUserInfo?.user || savedUserInfo;
      const idBenhNhan = userInfo?.id_benh_nhan || userId;

      // Lấy hóa đơn theo id_benh_nhan
      const response = await apiHoaDon.search({ id_benh_nhan: idBenhNhan });
      const invoiceData = response?.data || response || [];
      let filteredInvoices = Array.isArray(invoiceData) ? invoiceData : [];

      // Filter theo tab
      if (activeTab !== "all") {
        filteredInvoices = filteredInvoices.filter((inv) => inv.trang_thai === activeTab);
      }

      setInvoices(filteredInvoices);
    } catch (error) {
      message.error("Không thể tải dữ liệu hóa đơn");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record) => {
    try {
      setSelectedInvoice(record);
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
      phuong_thuc_thanh_toan: "chuyen_khoan",
    });
    setIsPaymentModalVisible(true);
  };

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

      message.success("Thanh toán thành công! Vui lòng chờ xác nhận từ nhân viên.");
      setIsPaymentModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Đã sao chép!");
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "id_hoa_don",
      key: "id_hoa_don",
      width: 150,
      render: (id) => (
        <Text strong style={{ color: "#f39c12", fontFamily: "monospace" }}>
          {id?.substring(0, 12)}...
        </Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "thoi_gian_tao",
      key: "thoi_gian_tao",
      width: 130,
      render: (date) => moment(date).format("DD/MM/YYYY"),
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
          chua_thanh_toan: { color: "warning", text: "Chưa thanh toán", icon: <ClockCircleOutlined /> },
          da_thanh_toan: { color: "success", text: "Đã thanh toán", icon: <CheckCircleOutlined /> },
          da_huy: { color: "error", text: "Đã hủy", icon: <ClockCircleOutlined /> },
        };
        const { color, text, icon } = configs[status] || configs.chua_thanh_toan;
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
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
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(record)}
              style={{ background: "#52c41a", border: "none" }}
              title="Thanh toán"
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getTabCount = (status) => {
    return invoices.filter((inv) => inv.trang_thai === status).length;
  };

  return (
    <div className="invoices-page">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          💰 Hóa đơn của tôi
        </Title>
        <Text type="secondary">Xem và thanh toán hóa đơn khám chữa bệnh</Text>
      </div>

      <Card style={{ borderRadius: "12px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "chua_thanh_toan",
              label: (
                <Badge count={getTabCount("chua_thanh_toan")} offset={[10, 0]}>
                  <span>
                    <ClockCircleOutlined />
                    Chưa thanh toán
                  </span>
                </Badge>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={invoices}
                  loading={loading}
                  rowKey="id_hoa_don"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hóa đơn`,
                  }}
                  locale={{
                    emptyText: <Empty description="Không có hóa đơn chưa thanh toán" />,
                  }}
                />
              ),
            },
            {
              key: "da_thanh_toan",
              label: (
                <span>
                  <CheckCircleOutlined />
                  Đã thanh toán ({getTabCount("da_thanh_toan")})
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={invoices}
                  loading={loading}
                  rowKey="id_hoa_don"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hóa đơn`,
                  }}
                  locale={{
                    emptyText: <Empty description="Không có hóa đơn đã thanh toán" />,
                  }}
                />
              ),
            },
            {
              key: "all",
              label: (
                <span>
                  <EyeOutlined />
                  Tất cả ({invoices.length})
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={invoices}
                  loading={loading}
                  rowKey="id_hoa_don"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hóa đơn`,
                  }}
                  locale={{
                    emptyText: <Empty description="Không có hóa đơn nào" />,
                  }}
                />
              ),
            },
          ]}
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
                  phuong_thuc_thanh_toan: "chuyen_khoan",
                });
                setIsPaymentModalVisible(true);
              }}
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                border: "none",
              }}
            >
              Thanh toán
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
                {moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format(
                  "DD/MM/YYYY HH:mm"
                )}
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
                      const thanhTien =
                        parseFloat(record.don_gia || 0) * parseFloat(record.so_luong || 0);
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
            <DollarOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
            Thanh toán hóa đơn
          </span>
        }
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitPayment}>
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
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#f39c12",
                  margin: "12px 0",
                }}
              >
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
                          copyable={{
                            text: "0123456789",
                            tooltips: ["Sao chép", "Đã sao chép"],
                          }}
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
                          copyable={{
                            text: invoiceId,
                            tooltips: ["Sao chép", "Đã sao chép"],
                          }}
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
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "12px",
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                        }}
                      >
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
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "12px",
                          backgroundColor: "#fff7e6",
                          borderRadius: "8px",
                        }}
                      >
                        <Text type="warning" style={{ fontSize: "13px" }}>
                          ⚠️ Vui lòng chuyển khoản đúng số tiền và nội dung. Sau khi chuyển khoản,
                          vui lòng chờ nhân viên xác nhận thanh toán.
                        </Text>
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
                          copyable={{
                            text: invoiceId,
                            tooltips: ["Sao chép", "Đã sao chép"],
                          }}
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
                        icon={<DollarOutlined />}
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
                          copyable={{
                            text: invoiceId,
                            tooltips: ["Sao chép", "Đã sao chép"],
                          }}
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
                        icon={<DollarOutlined />}
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

          <Form.Item style={{ marginBottom: 0, marginTop: "24px", textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsPaymentModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                size="large"
                style={{
                  background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  border: "none",
                }}
              >
                Xác nhận đã thanh toán
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Invoices;

