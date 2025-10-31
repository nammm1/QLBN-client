import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import apiHoaDon from "../../../api/HoaDon";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import apiBenhNhan from "../../../api/BenhNhan";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [form] = Form.useForm();

  const [stats, setStats] = useState({
    todayRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoiceData, patientData, appointmentData] = await Promise.all([
        apiHoaDon.getAll(),
        apiBenhNhan.getAll(),
        apiCuocHenKham.getAll(),
      ]);

      setInvoices(invoiceData || []);
      setPatients(patientData || []);
      setAppointments(appointmentData || []);

      // Calculate stats
      const today = moment().format("YYYY-MM-DD");
      const todayInvoices = (invoiceData || []).filter(
        (inv) => moment(inv.ngay_tao).format("YYYY-MM-DD") === today
      );

      const todayRevenue = todayInvoices
        .filter((inv) => inv.trang_thai_thanh_toan === "da_thanh_toan")
        .reduce((sum, inv) => sum + (inv.tong_tien || 0), 0);

      const pendingPayments = (invoiceData || []).filter(
        (inv) => inv.trang_thai_thanh_toan === "chua_thanh_toan"
      ).length;

      const completedPayments = todayInvoices.filter(
        (inv) => inv.trang_thai_thanh_toan === "da_thanh_toan"
      ).length;

      setStats({
        todayRevenue,
        pendingPayments,
        completedPayments,
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
      // Fetch invoice details
      const details = await apiChiTietHoaDon.getByHoaDon(record.id_hoa_don);
      setInvoiceDetails(details || []);
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

  const handleSubmitPayment = async (values) => {
    try {
      await apiHoaDon.update(selectedInvoice.id_hoa_don, {
        trang_thai_thanh_toan: "da_thanh_toan",
        phuong_thuc_thanh_toan: values.phuong_thuc_thanh_toan,
        ngay_thanh_toan: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      message.success("Thu tiền thành công!");
      setIsPaymentModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    }
  };

  const handlePrintInvoice = (record) => {
    message.info("Tính năng in hóa đơn sẽ được phát triển!");
    // TODO: Implement print functionality
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "id_hoa_don",
      key: "id_hoa_don",
      width: 120,
      render: (id) => (
        <Text strong style={{ color: "#f39c12" }}>
          #{id?.substring(0, 8)}
        </Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngay_tao",
      key: "ngay_tao",
      width: 120,
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: "6px", color: "#f39c12" }} />
          {moment(date).format("DD/MM/YYYY")}
        </div>
      ),
    },
    {
      title: "Bệnh nhân",
      key: "patient",
      render: (_, record) => {
        const appointment = appointments.find((a) => a.id_cuoc_hen === record.id_cuoc_hen);
        const patient = patients.find((p) => p.id_benh_nhan === appointment?.id_benh_nhan);
        return (
          <div>
            <UserOutlined style={{ marginRight: "6px" }} />
            <Text strong>{patient?.ho_ten || "N/A"}</Text>
          </div>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      render: (amount) => (
        <Text strong style={{ color: "#f39c12", fontSize: "15px" }}>
          {amount?.toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai_thanh_toan",
      key: "trang_thai_thanh_toan",
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
      render: (method) => {
        const methods = {
          tien_mat: "Tiền mặt",
          chuyen_khoan: "Chuyển khoản",
          the: "Thẻ",
        };
        return method ? <Tag>{methods[method]}</Tag> : <Text type="secondary">-</Text>;
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
          />
          {record.trang_thai_thanh_toan === "chua_thanh_toan" && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePayment(record)}
              style={{ color: "#52c41a" }}
            />
          )}
          {record.trang_thai_thanh_toan === "da_thanh_toan" && (
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record)}
              style={{ color: "#f39c12" }}
            />
          )}
        </Space>
      ),
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const appointment = appointments.find((a) => a.id_cuoc_hen === invoice.id_cuoc_hen);
    const patient = patients.find((p) => p.id_benh_nhan === appointment?.id_benh_nhan);
    return (
      patient?.ho_ten?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.id_hoa_don?.includes(searchText)
    );
  });

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
        <Col xs={24} md={8}>
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
        <Col xs={24} md={8}>
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
        <Col xs={24} md={8}>
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
      </Row>

      {/* Search */}
      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Input
          placeholder="Tìm kiếm theo mã hóa đơn, tên bệnh nhân..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          style={{ borderRadius: "8px" }}
        />
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: "12px" }}>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          rowKey="id_hoa_don"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
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
          </Button>,
        ]}
        width={700}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã hóa đơn" span={2}>
                <Text strong>{selectedInvoice.id_hoa_don}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedInvoice.ngay_tao).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedInvoice.trang_thai_thanh_toan === "da_thanh_toan" ? (
                  <Tag color="success">Đã thanh toán</Tag>
                ) : (
                  <Tag color="warning">Chưa thanh toán</Tag>
                )}
              </Descriptions.Item>
              {selectedInvoice.phuong_thuc_thanh_toan && (
                <Descriptions.Item label="Phương thức" span={2}>
                  {selectedInvoice.phuong_thuc_thanh_toan === "tien_mat"
                    ? "Tiền mặt"
                    : selectedInvoice.phuong_thuc_thanh_toan === "chuyen_khoan"
                    ? "Chuyển khoản"
                    : "Thẻ"}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Chi tiết dịch vụ</Title>
            <Table
              dataSource={invoiceDetails}
              rowKey="id_chi_tiet"
              pagination={false}
              size="small"
              columns={[
                { title: "Dịch vụ", dataIndex: "ten_dich_vu", key: "ten_dich_vu" },
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
                  render: (price) => `${price?.toLocaleString("vi-VN")} đ`,
                },
                {
                  title: "Thành tiền",
                  dataIndex: "thanh_tien",
                  key: "thanh_tien",
                  align: "right",
                  render: (total) => (
                    <Text strong style={{ color: "#f39c12" }}>
                      {total?.toLocaleString("vi-VN")} đ
                    </Text>
                  ),
                },
              ]}
            />

            <Divider />

            <div style={{ textAlign: "right" }}>
              <Space direction="vertical" style={{ width: "300px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Tổng tiền:</Text>
                  <Text strong style={{ fontSize: "20px", color: "#f39c12" }}>
                    {selectedInvoice.tong_tien?.toLocaleString("vi-VN")} đ
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
                {selectedInvoice?.tong_tien?.toLocaleString("vi-VN")} đ
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
              <Option value="chuyen_khoan">🏦 Chuyển khoản</Option>
              <Option value="the">💳 Thẻ</Option>
            </Select>
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
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.so_tien_nhan !== currentValues.so_tien_nhan
            }
          >
            {({ getFieldValue }) => {
              const received = getFieldValue("so_tien_nhan") || 0;
              const total = selectedInvoice?.tong_tien || 0;
              const change = received - total;

              return change > 0 ? (
                <Card size="small" style={{ backgroundColor: "#e6f7ff", marginTop: "-16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text>Tiền thừa trả khách:</Text>
                    <Text strong style={{ fontSize: "18px", color: "#52c41a" }}>
                      {change.toLocaleString("vi-VN")} đ
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
    </div>
  );
};

export default Billing;

