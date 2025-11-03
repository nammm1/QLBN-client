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
  DatePicker,
  App,
  Typography,
  Avatar,
  Tooltip,
  Statistic,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import apiBenhNhan from "../../../api/BenhNhan";
import apiNguoiDung from "../../../api/NguoiDung";
import moment from "moment";
import AutoBookingModal from "./AutoBookingModal";

const { Title, Text } = Typography;
const { Option } = Select;

const PatientManagement = () => {
  const { message } = App.useApp();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAutoBookingModalVisible, setIsAutoBookingModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await apiBenhNhan.getAll();
      setPatients(data || []);
    } catch (error) {
      message.error("Không thể tải danh sách bệnh nhân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create new patient
  const handleCreatePatient = () => {
    form.resetFields();
    setSelectedPatient(null);
    setIsModalVisible(true);
  };

  // Handle submit form
  const handleSubmit = async (values) => {
    try {
      const userData = {
        ...values,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format("YYYY-MM-DD") : null,
        vai_tro: "benh_nhan",
      };

      if (selectedPatient) {
        // Update
        await apiNguoiDung.updateUser(selectedPatient.id_benh_nhan, userData);
        message.success("Cập nhật thông tin bệnh nhân thành công!");
      } else {
        // Create
        await apiNguoiDung.createUser(userData);
        message.success("Đăng ký bệnh nhân mới thành công!");
      }

      setIsModalVisible(false);
      fetchPatients();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    }
  };

  // Handle view detail
  const handleViewDetail = (record) => {
    setSelectedPatient(record);
    setIsDetailModalVisible(true);
  };

  // Handle edit
  const handleEdit = (record) => {
    setSelectedPatient(record);
    form.setFieldsValue({
      ...record,
      ngay_sinh: record.ngay_sinh ? moment(record.ngay_sinh) : null,
    });
    setIsModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Mã BN",
      dataIndex: "id_benh_nhan",
      key: "id_benh_nhan",
      width: 150,
      render: (id) => (
        <Text strong style={{ color: "#f39c12" }}>
          {id?.substring(0, 20)}...
        </Text>
      ),
    },
    {
      title: "Thông tin bệnh nhân",
      key: "info",
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            <Text strong style={{ fontSize: "15px" }}>
              {record.ho_ten || "N/A"}
            </Text>
          </div>
          <Space size={4} wrap>
            {record.gioi_tinh && (
              <Tag color={record.gioi_tinh === "Nam" ? "blue" : "pink"}>{record.gioi_tinh}</Tag>
            )}
            {record.ngay_sinh && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {moment(record.ngay_sinh).format("DD/MM/YYYY")}
              </Text>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <div>
          {record.so_dien_thoai && (
            <div style={{ marginBottom: "4px" }}>
              <PhoneOutlined style={{ marginRight: "6px", color: "#f39c12" }} />
              <Text>{record.so_dien_thoai}</Text>
            </div>
          )}
          {record.email && (
            <div>
              <MailOutlined style={{ marginRight: "6px", color: "#1890ff" }} />
              <Text style={{ fontSize: "12px" }}>{record.email}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "CCCD",
      dataIndex: "so_cccd",
      key: "so_cccd",
      render: (cccd) => cccd || <Text type="secondary">Chưa có</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai_hoat_dong",
      key: "trang_thai_hoat_dong",
      render: (status) =>
        status ? (
          <Tag color="success">Đang hoạt động</Tag>
        ) : (
          <Tag color="default">Không hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#f39c12" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter patients
  const filteredPatients = patients.filter(
    (patient) =>
      patient.ho_ten?.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.so_dien_thoai?.includes(searchText) ||
      patient.so_cccd?.includes(searchText)
  );

  // Calculate statistics
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.trang_thai_hoat_dong).length;
  const malePatients = patients.filter(p => p.gioi_tinh === "Nam").length;
  const femalePatients = patients.filter(p => p.gioi_tinh === "Nữ").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          👥 Quản lý bệnh nhân
        </Title>
        <Text type="secondary">Đăng ký và quản lý thông tin bệnh nhân</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Tổng bệnh nhân</span>}
              value={totalPatients}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#fff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Đang hoạt động</span>}
              value={activePatients}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#fff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Nam</span>}
              value={malePatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Nữ</span>}
              value={femalePatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fff", fontSize: "24px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, CCCD..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                size="large"
                onClick={() => setIsAutoBookingModalVisible(true)}
                style={{
                  background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Đặt lịch hẹn
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                size="large"
                onClick={handleCreatePatient}
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Đăng ký bệnh nhân mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: "12px" }}>
        <Table
          columns={columns}
          dataSource={filteredPatients}
          loading={loading}
          rowKey="id_benh_nhan"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bệnh nhân`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <UserAddOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            {selectedPatient ? "Chỉnh sửa thông tin bệnh nhân" : "Đăng ký bệnh nhân mới"}
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ho_ten"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ngay_sinh"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gioi_tinh"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="so_dien_thoai"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="so_cccd" label="Số CCCD">
                <Input placeholder="Nhập số CCCD" />
              </Form.Item>
            </Col>
          </Row>

          {!selectedPatient && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ten_dang_nhap"
                  label="Tên đăng nhập"
                  rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                >
                  <Input placeholder="Nhập tên đăng nhập" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="mat_khau"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                }}
              >
                {selectedPatient ? "Cập nhật" : "Đăng ký"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <EyeOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Chi tiết bệnh nhân
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEdit(selectedPatient);
            }}
            style={{
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              border: "none",
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={700}
      >
        {selectedPatient && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar size={80} icon={<IdcardOutlined />} style={{ backgroundColor: "#f39c12" }} />
              <Title level={4} style={{ marginTop: "12px", marginBottom: "4px" }}>
                {selectedPatient.ho_ten}
              </Title>
              <Text type="secondary">{selectedPatient.id_benh_nhan}</Text>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    Ngày sinh
                  </Text>
                  <Text strong>
                    {selectedPatient.ngay_sinh
                      ? moment(selectedPatient.ngay_sinh).format("DD/MM/YYYY")
                      : "N/A"}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    Giới tính
                  </Text>
                  <Text strong>{selectedPatient.gioi_tinh || "N/A"}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    <PhoneOutlined /> Số điện thoại
                  </Text>
                  <Text strong>{selectedPatient.so_dien_thoai || "N/A"}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    <MailOutlined /> Email
                  </Text>
                  <Text strong>{selectedPatient.email || "N/A"}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    <IdcardOutlined /> Số CCCD
                  </Text>
                  <Text strong>{selectedPatient.so_cccd || "Chưa có"}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    Trạng thái
                  </Text>
                  {selectedPatient.trang_thai_hoat_dong ? (
                    <Tag color="success">Đang hoạt động</Tag>
                  ) : (
                    <Tag color="default">Không hoạt động</Tag>
                  )}
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" style={{ borderRadius: "8px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    <EnvironmentOutlined /> Địa chỉ
                  </Text>
                  <Text strong>{selectedPatient.dia_chi || "Chưa cập nhật"}</Text>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Auto Booking Modal */}
      <AutoBookingModal
        visible={isAutoBookingModalVisible}
        onCancel={() => setIsAutoBookingModalVisible(false)}
        onSuccess={() => {
          fetchPatients();
        }}
      />
    </div>
  );
};

export default PatientManagement;

