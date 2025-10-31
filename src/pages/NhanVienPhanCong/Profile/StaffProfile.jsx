import React, { useState, useEffect } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Space, 
  Row, 
  Col,
  message,
  Divider,
  Upload
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined
} from "@ant-design/icons";
import apiNhanVienPhanCong from "../../../api/NhanVienPhanCong";

const { Title, Text } = Typography;

const StaffProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiNhanVienPhanCong.getById(userInfo.user.id_nguoi_dung);
      setProfileData(res?.data);
      form.setFieldsValue(res?.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin:", error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await apiNhanVienPhanCong.update(userInfo.user.id_nguoi_dung, values);
      message.success("✅ Cập nhật thông tin thành công!");
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      message.error("❌ Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          border: 'none'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <div style={{ position: 'relative' }}>
              <Avatar 
                size={100} 
                style={{ 
                  background: 'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',
                  fontSize: '40px',
                  border: '4px solid white'
                }}
              >
                <UserOutlined />
              </Avatar>
              {editMode && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#16a085',
                    borderColor: '#16a085'
                  }}
                />
              )}
            </div>
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0, color: 'white' }}>
                {userInfo?.user?.ho_ten || 'Nhân viên'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                👥 Nhân viên phân công
              </Text>
            </Space>
          </Col>
          <Col>
            {!editMode ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditMode(true)}
                size="large"
                style={{
                  borderRadius: '10px',
                  height: '44px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontWeight: 600,
                  background: '#16a085',
                  borderColor: '#16a085'
                }}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Space>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    form.resetFields();
                  }}
                  size="large"
                  style={{
                    borderRadius: '10px',
                    height: '44px',
                    background: 'white',
                    borderColor: 'white'
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                  loading={loading}
                  size="large"
                  style={{
                    borderRadius: '10px',
                    height: '44px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontWeight: 600,
                    background: '#16a085',
                    borderColor: '#16a085'
                  }}
                >
                  Lưu thay đổi
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* Profile Form */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={!editMode}
        >
          <Title level={5} style={{ marginBottom: 24 }}>
            📋 Thông tin cá nhân
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Họ và tên"
                name="ho_ten"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Nhập họ và tên"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại"
                name="so_dien_thoai"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Nhập email"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Ngày sinh"
                name="ngay_sinh"
              >
                <Input 
                  type="date"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa chỉ"
            name="dia_chi"
          >
            <Input 
              prefix={<HomeOutlined />} 
              placeholder="Nhập địa chỉ"
              size="large"
            />
          </Form.Item>

          <Divider />

          <Title level={5} style={{ marginBottom: 24 }}>
            🔒 Thông tin tài khoản
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên đăng nhập"
                name="ten_dang_nhap"
              >
                <Input 
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Vai trò"
              >
                <Input 
                  value="Nhân viên phân công"
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default StaffProfile;

