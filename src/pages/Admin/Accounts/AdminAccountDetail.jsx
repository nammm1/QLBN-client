import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Tag,
  Avatar,
  Divider,
  Descriptions,
  Spin,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  SaveOutlined,
  IdcardOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import apiNguoiDung from "../../../api/NguoiDung";
import dayjs from "dayjs";
import { checkAgeForAccountCreation } from "../../../utils/checkAgeForAccountCreation";
import "./AdminAccountDetail.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminAccountDetail = () => {
  const { id_nguoi_dung } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id_nguoi_dung) {
      fetchUserDetail();
    }
  }, [id_nguoi_dung]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const userData = await apiNguoiDung.getUserById(id_nguoi_dung);
      setUser(userData);
      
      // Convert trang_thai_hoat_dong từ boolean/number sang string cho form
      const isActive = userData.trang_thai_hoat_dong === true || 
                       userData.trang_thai_hoat_dong === 1 || 
                       userData.trang_thai_hoat_dong === "HoatDong" ||
                       userData.trang_thai_hoat_dong === "1";
      
      form.setFieldsValue({
        ...userData,
        ngay_sinh: userData.ngay_sinh ? dayjs(userData.ngay_sinh) : null,
        trang_thai_hoat_dong: isActive ? "HoatDong" : "Ngung",
      });
    } catch (error) {
      console.error("Error fetching user detail:", error);
      message.error("Không thể tải thông tin người dùng");
      navigate("/admin/accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      setSaving(true);
      
      // Convert trang_thai_hoat_dong từ string sang boolean
      const trangThaiHoatDong = values.trang_thai_hoat_dong === "HoatDong" ? true : false;
      
      const formattedValues = {
        ...values,
        ngay_sinh: values.ngay_sinh
          ? dayjs(values.ngay_sinh).format("YYYY-MM-DD")
          : user.ngay_sinh,
        trang_thai_hoat_dong: trangThaiHoatDong,
      };
      
      // Kiểm tra tuổi nếu có cập nhật ngày sinh (phải >= 6 tuổi)
      if (values.ngay_sinh && formattedValues.ngay_sinh) {
        const ageCheck = checkAgeForAccountCreation(formattedValues.ngay_sinh);
        if (!ageCheck.isValid) {
          console.log(`[ADMIN_UPDATE_ACCOUNT] Người dùng không đủ tuổi: ${ageCheck.message}`);
          message.error(ageCheck.message);
          setSaving(false);
          return;
        }
      }
      
      await apiNguoiDung.updateUser(id_nguoi_dung, formattedValues);
      message.success("Cập nhật thông tin thành công!");
      setIsEditModalOpen(false);
      fetchUserDetail();
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.message || "Không thể cập nhật thông tin!";
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getGenderTag = (gender) => {
    if (!gender) return <Tag>Không</Tag>;
    return gender.toLowerCase() === "nam" ? (
      <Tag icon={<ManOutlined />} color="blue">
        Nam
      </Tag>
    ) : (
      <Tag icon={<WomanOutlined />} color="pink">
        Nữ
      </Tag>
    );
  };

  const getRoleTag = (role) => {
    const roleMap = {
      quan_tri_vien: { color: "red", text: "Quản trị viên" },
      bac_si: { color: "green", text: "Bác sĩ" },
      benh_nhan: { color: "purple", text: "Bệnh nhân" },
      chuyen_gia_dinh_duong: { color: "orange", text: "Chuyên gia dinh dưỡng" },
      nhan_vien_quay: { color: "cyan", text: "Nhân viên quầy" },
      nhan_vien_phan_cong: { color: "blue", text: "Nhân viên phân công" },
    };
    const roleInfo = roleMap[role] || { color: "default", text: role };
    return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <Text>Không tìm thấy thông tin người dùng</Text>
      </Card>
    );
  }

  return (
    <div className="admin-account-detail-container">
      <Card className="shadow-card">
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/accounts")}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Chi tiết tài khoản
              </Title>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Chỉnh sửa
            </Button>
          </Col>
        </Row>

        <Divider />

        {/* User Info Card */}
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 12,
            border: "none",
          }}
        >
          <Row align="middle" gutter={24}>
            <Col>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "3px solid white",
                }}
              />
            </Col>
            <Col flex="auto">
              <Space direction="vertical" size={4}>
                <Title level={2} style={{ margin: 0, color: "white" }}>
                  {user.ho_ten || "Chưa có tên"}
                </Title>
                <Space>
                  <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                    {getRoleTag(user.vai_tro)}
                  </Text>
                  {getGenderTag(user.gioi_tinh)}
                </Space>
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  ID: {user.id_nguoi_dung}
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Details */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Thông tin cơ bản" className="detail-card">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên đăng nhập">
                  <Text copyable>{user.ten_dang_nhap}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {user.email || "Chưa có"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <Space>
                    <PhoneOutlined />
                    {user.so_dien_thoai || "Chưa có"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Họ tên">
                  {user.ho_ten || "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {user.ngay_sinh
                    ? dayjs(user.ngay_sinh).format("DD/MM/YYYY")
                    : "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {getGenderTag(user.gioi_tinh)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Thông tin bổ sung" className="detail-card">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Số CCCD">
                  <Space>
                    <IdcardOutlined />
                    {user.so_cccd || "Chưa có"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  <Space>
                    <HomeOutlined />
                    {user.dia_chi || "Chưa có"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  {getRoleTag(user.vai_tro)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hoạt động">
                  <Tag
                    color={
                      user.trang_thai_hoat_dong === true || 
                      user.trang_thai_hoat_dong === 1 || 
                      user.trang_thai_hoat_dong === "HoatDong" ||
                      user.trang_thai_hoat_dong === "1"
                        ? "green"
                        : "red"
                    }
                  >
                    {user.trang_thai_hoat_dong === true || 
                     user.trang_thai_hoat_dong === 1 || 
                     user.trang_thai_hoat_dong === "HoatDong" ||
                     user.trang_thai_hoat_dong === "1"
                      ? "Hoạt động"
                      : "Ngừng"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian tạo">
                  {user.thoi_gian_tao
                    ? dayjs(user.thoi_gian_tao).format("DD/MM/YYYY HH:mm")
                    : "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian cập nhật">
                  {user.thoi_gian_cap_nhat
                    ? dayjs(user.thoi_gian_cap_nhat).format("DD/MM/YYYY HH:mm")
                    : "Chưa có"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleUpdate}>
          <Form.Item label="Email" name="email">
            <Input prefix={<MailOutlined />} placeholder="Nhập email..." />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="so_dien_thoai">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại..."
            />
          </Form.Item>
          <Form.Item label="Họ tên" name="ho_ten">
            <Input placeholder="Nhập họ tên..." />
          </Form.Item>
          <Form.Item label="Ngày sinh" name="ngay_sinh">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Giới tính" name="gioi_tinh">
            <Select placeholder="Chọn giới tính">
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Số CCCD" name="so_cccd">
            <Input placeholder="Nhập số CCCD..." />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="dia_chi">
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ..." />
          </Form.Item>
          <Form.Item label="Vai trò" name="vai_tro">
            <Select placeholder="Chọn vai trò">
              <Option value="benh_nhan">Bệnh nhân</Option>
              <Option value="bac_si">Bác sĩ</Option>
              <Option value="chuyen_gia_dinh_duong">Chuyên gia dinh dưỡng</Option>
              <Option value="nhan_vien_quay">Nhân viên quầy</Option>
              <Option value="nhan_vien_phan_cong">Nhân viên phân công</Option>
              <Option value="nhan_vien_xet_nghiem">Nhân viên xét nghiệm</Option>
              <Option value="quan_tri_vien">Quản trị viên</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Trạng thái hoạt động" name="trang_thai_hoat_dong">
            <Select placeholder="Chọn trạng thái">
              <Option value="HoatDong">Hoạt động</Option>
              <Option value="Ngung">Ngừng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAccountDetail;
