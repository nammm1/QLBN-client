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
  Space,
  Divider,
  Tag,
  DatePicker,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  EditOutlined,
  SaveOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import apiNguoiDung from "../../../api/NguoiDung";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const LabStaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.user?.id_nguoi_dung;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiNguoiDung.getUserById(userId);
      if (data) {
        setProfile(data);
        form.setFieldsValue({
          ho_ten: data.ho_ten,
          email: data.email,
          so_dien_thoai: data.so_dien_thoai,
          ngay_sinh: data.ngay_sinh ? moment(data.ngay_sinh) : null,
          gioi_tinh: data.gioi_tinh,
          so_cccd: data.so_cccd,
          dia_chi: data.dia_chi,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        ...values,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format("YYYY-MM-DD") : null,
      };
      await apiNguoiDung.updateUser(userId, updateData);
      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Hồ sơ cá nhân
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={120}
                icon={<ExperimentOutlined />}
                style={{ backgroundColor: "#8e44ad", marginBottom: "16px" }}
              />
              <Title level={4}>{profile.ho_ten}</Title>
              <Tag color="purple" style={{ marginBottom: "16px" }}>
                Nhân viên Xét nghiệm
              </Tag>
              <Divider />
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <MailOutlined /> <Text type="secondary">Email:</Text>
                  <br />
                  <Text>{profile.email}</Text>
                </div>
                <div>
                  <PhoneOutlined /> <Text type="secondary">Số điện thoại:</Text>
                  <br />
                  <Text>{profile.so_dien_thoai || "Chưa cập nhật"}</Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Thông tin cá nhân"
            extra={
              !isEditing && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!isEditing}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="ho_ten"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Số điện thoại" name="so_dien_thoai">
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Ngày sinh" name="ngay_sinh">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Giới tính" name="gioi_tinh">
                    <Select>
                      <Option value="Nam">Nam</Option>
                      <Option value="Nữ">Nữ</Option>
                      <Option value="Khác">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Số CCCD" name="so_cccd">
                    <Input prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Địa chỉ" name="dia_chi">
                    <Input.TextArea
                      rows={3}
                      prefix={<EnvironmentOutlined />}
                      placeholder="Nhập địa chỉ"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {isEditing && (
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Lưu thay đổi
                    </Button>
                    <Button onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}>
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LabStaffProfile;

