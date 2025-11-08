import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  App,
  Space,
  Divider,
  Tag,
  DatePicker,
  Select,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import apiNguoiDung from "../../../api/NguoiDung";
import apiNhanVienQuay from "../../../api/NhanVienQuay";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const ReceptionistProfile = () => {
  const { message } = App.useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const userId = localStorage.getItem("userId") || "NV_quay001";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiNguoiDung.getUserById(userId);
      setProfile(data);
      form.setFieldsValue({
        ...data,
        ngay_sinh: data.ngay_sinh ? moment(data.ngay_sinh) : null,
      });
    } catch (error) {
      message.error("Không thể tải thông tin cá nhân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        ...values,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format("YYYY-MM-DD") : null,
      };

      await apiNguoiDung.updateUser(userId, updateData);
      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      message.error("Không thể cập nhật thông tin");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      ...profile,
      ngay_sinh: profile.ngay_sinh ? moment(profile.ngay_sinh) : null,
    });
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <Card loading={loading} style={{ borderRadius: "12px" }}>
        <Text>Đang tải...</Text>
      </Card>
    );
  }

  return (
    <div>
      <style>
        {`
          .ant-input-disabled,
          .ant-input[disabled] {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }
          .ant-input-disabled::placeholder,
          .ant-input[disabled]::placeholder {
            color: rgba(0, 0, 0, 0.25) !important;
          }
          .ant-picker-disabled,
          .ant-picker[disabled] {
            color: #000 !important;
          }
          .ant-select-disabled .ant-select-selector,
          .ant-select.ant-select-disabled .ant-select-selector {
            color: #000 !important;
          }
        `}
      </style>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          👤 Hồ sơ cá nhân
        </Title>
        <Text type="secondary">Xem và chỉnh sửa thông tin cá nhân</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <Avatar
                size={120}
                src={profile.anh_dai_dien}
                icon={<UserOutlined />}
                style={{
                  border: "4px solid rgba(255,255,255,0.3)",
                  marginBottom: "16px",
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                size="small"
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "0",
                  backgroundColor: "#fff",
                  color: "#f39c12",
                }}
              />
            </div>

            <Title level={3} style={{ color: "#fff", marginTop: "16px", marginBottom: "8px" }}>
              {profile.ho_ten}
            </Title>
            <Tag
              color="gold"
              style={{
                fontSize: "14px",
                padding: "4px 16px",
                borderRadius: "20px",
                marginBottom: "24px",
              }}
            >
              Nhân viên Quầy
            </Tag>

            <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "left" }}>
                <PhoneOutlined style={{ marginRight: "12px", fontSize: "16px" }} />
                <Text style={{ color: "#fff", opacity: 0.9 }}>{profile.so_dien_thoai || "N/A"}</Text>
              </div>
              <div style={{ textAlign: "left" }}>
                <MailOutlined style={{ marginRight: "12px", fontSize: "16px" }} />
                <Text style={{ color: "#fff", opacity: 0.9, fontSize: "13px" }}>
                  {profile.email || "N/A"}
                </Text>
              </div>
              <div style={{ textAlign: "left" }}>
                <IdcardOutlined style={{ marginRight: "12px", fontSize: "16px" }} />
                <Text style={{ color: "#fff", opacity: 0.9 }}>
                  {profile.so_cccd || "Chưa cập nhật"}
                </Text>
              </div>
            </Space>
          </Card>

          <Card
            style={{
              borderRadius: "12px",
              marginTop: "24px",
              background: "#f9f9f9",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Trạng thái tài khoản
                </Text>
                {profile.trang_thai_hoat_dong ? (
                  <Tag color="success">Đang hoạt động</Tag>
                ) : (
                  <Tag color="error">Không hoạt động</Tag>
                )}
              </div>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Ngày tạo tài khoản
                </Text>
                <Text>{moment(profile.thoi_gian_tao).format("DD/MM/YYYY")}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Lần cập nhật cuối
                </Text>
                <Text>{moment(profile.thoi_gian_cap_nhat).format("DD/MM/YYYY HH:mm")}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <span>
                <EditOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
                Thông tin chi tiết
              </span>
            }
            extra={
              !isEditing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                    border: "none",
                  }}
                >
                  Chỉnh sửa
                </Button>
              ) : null
            }
            style={{ borderRadius: "12px" }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="ho_ten"
                    label="Họ và tên"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập họ và tên"
                      disabled={!isEditing}
                      size="large"
                    />
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
                      disabled={!isEditing}
                      style={{ width: "100%" }}
                      size="large"
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
                    <Select placeholder="Chọn giới tính" disabled={!isEditing} size="large">
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
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Nhập số điện thoại"
                      disabled={!isEditing}
                      size="large"
                    />
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
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Nhập email"
                      disabled={!isEditing}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="so_cccd" label="Số CCCD">
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="Nhập số CCCD"
                      disabled={!isEditing}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="dia_chi" label="Địa chỉ">
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập địa chỉ"
                  disabled={!isEditing}
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>

              {isEditing && (
                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                  <Space>
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      style={{
                        background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                        border: "none",
                      }}
                    >
                      Lưu thay đổi
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>

          {/* Additional Info */}
          <Card
            title={
              <span>
                <IdcardOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
                Thông tin công việc
              </span>
            }
            style={{ borderRadius: "12px", marginTop: "24px" }}
          >
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                    Mã nhân viên
                  </Text>
                  <Text strong style={{ fontSize: "15px" }}>
                    {profile.id_nguoi_dung}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                    Vai trò
                  </Text>
                  <Tag color="orange" style={{ fontSize: "14px", padding: "4px 12px" }}>
                    Nhân viên Quầy
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                    Tên đăng nhập
                  </Text>
                  <Text strong>{profile.ten_dang_nhap}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                    Trạng thái
                  </Text>
                  {profile.trang_thai_hoat_dong ? (
                    <Tag color="success">✓ Đang làm việc</Tag>
                  ) : (
                    <Tag color="error">✗ Nghỉ việc</Tag>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReceptionistProfile;

