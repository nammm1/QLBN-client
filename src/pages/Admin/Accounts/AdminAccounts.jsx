import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiNguoiDung from "../../../api/NguoiDung";
import {
  Card,
  Table,
  Input,
  Select,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Avatar,
  Modal,
  Form,
  DatePicker,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./AdminAccounts.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminAccounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const pageSize = 10;

  const navigate = useNavigate();

  // 🔹 Lấy danh sách tài khoản
  const fetchUsers = async () => {
    try {
      const res = await apiNguoiDung.getAllUsers();
      setUsers(res);
      setFilteredUsers(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Lọc người dùng
  useEffect(() => {
    let filtered = [...users];

    const name = (searchName || "").trim().toLowerCase();
    const role = (searchRole || "").trim();
    const gender = (searchGender || "").trim().toLowerCase();

    if (name) {
      filtered = filtered.filter((u) =>
        u.ho_ten?.toLowerCase().includes(name)
      );
    }
    if (role) {
      filtered = filtered.filter((u) => u.vai_tro === role);
    }
    if (gender) {
      filtered = filtered.filter(
        (u) => u.gioi_tinh?.toLowerCase() === gender
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchName, searchRole, searchGender, users]);

  const handleSelect = (id_nguoi_dung) => {
    navigate(`/admin/accounts/${id_nguoi_dung}`);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredUsers.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const getGenderTag = (gender) => {
    if (!gender) return <Tag>Không</Tag>;
    return gender.toLowerCase() === "nam" ? (
      <Tag icon={<ManOutlined />} color="blue">Nam</Tag>
    ) : (
      <Tag icon={<WomanOutlined />} color="pink">Nữ</Tag>
    );
  };

  // 🔹 Thêm tài khoản
  const handleAddAccount = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        ngay_sinh: values.ngay_sinh
          ? dayjs(values.ngay_sinh).format("YYYY-MM-DD")
          : null,
      };
      await apiNguoiDung.createUser(formattedValues);
      message.success("Thêm tài khoản thành công!");
      setIsAddModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      message.error("Không thể thêm tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID NGƯỜI DÙNG",
      dataIndex: "id_nguoi_dung",
      key: "id_nguoi_dung",
      render: (id) => <Text copyable>{id}</Text>,
      width: 200,
    },
    {
      title: "HỌ TÊN",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name || "Không"}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined />
          {email || "Không"}
        </Space>
      ),
      width: 200,
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "so_dien_thoai",
      key: "so_dien_thoai",
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone || "Không"}
        </Space>
      ),
      width: 150,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gioi_tinh",
      key: "gioi_tinh",
      render: (gender) => getGenderTag(gender),
      width: 100,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "vai_tro",
      key: "vai_tro",
      render: (role) => {
        let color = "blue";
        if (role === "quan_tri_vien") color = "red";
        else if (role === "bac_si") color = "green";
        else if (role === "benh_nhan") color = "purple";
        else if (role === "chuyen_gia_dinh_duong") color = "orange";
        return <Tag color={color}>{role?.replaceAll("_", " ").toUpperCase()}</Tag>;
      },
      width: 150,
    },
  ];

  return (
    <div className="admin-accounts-container">
      <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            👥 Quản lý tài khoản
          </Title>
          <Text type="secondary">
            Xem, thêm và quản lý người dùng trong hệ thống
          </Text>
        </div>

        {/* Bộ lọc */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Tìm theo họ tên..."
                prefix={<SearchOutlined />}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="large"
              />
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Chọn vai trò"
                value={searchRole || undefined}
                onChange={(value) => setSearchRole(value || "")}
                style={{ width: "100%" }}
                size="large"
                allowClear
              >
                <Option value="benh_nhan">Bệnh nhân</Option>
                <Option value="bac_si">Bác sĩ</Option>
                <Option value="chuyen_gia_dinh_duong">Chuyên gia dinh dưỡng</Option>
                <Option value="nhan_vien_quay">Nhân viên quầy</Option>
                <Option value="nhan_vien_phan_cong">Nhân viên phân công</Option>
                <Option value="quan_tri_vien">Quản trị viên</Option>
              </Select>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Giới tính"
                value={searchGender || undefined}
                onChange={(value) => setSearchGender(value || "")}
                style={{ width: "100%" }}
                size="large"
                allowClear
              >
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={6}>
              <Row justify="end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Thêm tài khoản
                </Button>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Bảng */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={currentPageData.map((item) => ({
              ...item,
              key: item.id_nguoi_dung,
            }))}
            pagination={false}
            size="middle"
            onRow={(record) => ({
              onClick: () => handleSelect(record.id_nguoi_dung),
              style: { cursor: "pointer" },
            })}
          />
        </Card>

        {/* Modal thêm tài khoản */}
        <Modal
          title="➕ Thêm tài khoản mới"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          onOk={() => form.submit()}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
        >
          <Form layout="vertical" form={form} onFinish={handleAddAccount}>
            <Form.Item
              label="Tên đăng nhập"
              name="ten_dang_nhap"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
              <Input placeholder="Nhập tên đăng nhập..." />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="mat_khau"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu..." />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="Nhập email..." />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="so_dien_thoai">
              <Input placeholder="Nhập số điện thoại..." />
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
              <Input placeholder="Nhập địa chỉ..." />
            </Form.Item>
            <Form.Item
              label="Vai trò"
              name="vai_tro"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="benh_nhan">Bệnh nhân</Option>
                <Option value="bac_si">Bác sĩ</Option>
                <Option value="chuyen_gia_dinh_duong">Chuyên gia dinh dưỡng</Option>
                <Option value="nhan_vien_quay">Nhân viên quầy</Option>
                <Option value="nhan_vien_phan_cong">Nhân viên phân công</Option>
                <Option value="quan_tri_vien">Quản trị viên</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Phân trang */}
        <div className="pagination-section">
          <Space>
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹ Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                type={page === currentPage ? "primary" : "default"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau ›
            </Button>
          </Space>
          <Text type="secondary">
            Trang {currentPage}/{totalPages}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminAccounts;
