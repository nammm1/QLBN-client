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
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
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
  const pageSize = 10;

  const navigate = useNavigate();

  // Gọi API lấy danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiNguoiDung.getUsersByRole(""); // lấy tất cả
        setUsers(res);
        setFilteredUsers(res);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };
    fetchUsers();
  }, []);

  // Bộ lọc người dùng
  useEffect(() => {
    let filtered = users;

    if (searchName.trim()) {
      filtered = filtered.filter((user) =>
        user.ho_ten?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchRole.trim()) {
      filtered = filtered.filter((user) => user.vai_tro === searchRole);
    }

    if (searchGender.trim()) {
      filtered = filtered.filter(
        (user) => user.gioi_tinh?.toLowerCase() === searchGender.toLowerCase()
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

  const columns = [
    {
      title: "ID NGƯỜI DÙNG",
      dataIndex: "id_nguoi_dung",
      key: "id_nguoi_dung",
      render: (id) => (
        <Text copyable style={{ color: "#555" }}>
          {id}
        </Text>
      ),
      width: 250,
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
      title: "NGÀY SINH",
      dataIndex: "ngay_sinh",
      key: "ngay_sinh",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "Không",
      width: 120,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gioi_tinh",
      key: "gioi_tinh",
      render: (gender) => getGenderTag(gender),
      width: 100,
    },
    {
      title: "SỐ CCCD",
      dataIndex: "so_cccd",
      key: "so_cccd",
      render: (cccd) => (
        <Space>
          <IdcardOutlined />
          {cccd || "Không"}
        </Space>
      ),
      width: 150,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "vai_tro",
      key: "vai_tro",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : role === "bac_si" ? "green" : "blue"}>
          {role?.toUpperCase() || "Không"}
        </Tag>
      ),
      width: 120,
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
          <Text type="secondary">Xem, lọc và quản lý người dùng trong hệ thống</Text>
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
                value={searchRole || null}
                onChange={setSearchRole}
                style={{ width: "100%" }}
                size="large"
                allowClear
              >
                <Option value="benh_nhan">Bệnh nhân</Option>
                <Option value="bac_si">Bác sĩ</Option>
                <Option value="admin">Quản trị viên</Option>
              </Select>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Giới tính"
                value={searchGender || null}
                onChange={setSearchGender}
                style={{ width: "100%" }}
                size="large"
                allowClear
              >
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={6}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Text type="secondary">
                  Tổng: <Text strong>{filteredUsers.length}</Text> người dùng
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Bảng danh sách người dùng */}
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
              style: {
                cursor: "pointer",
                transition: "all 0.2s",
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = "#f0f7ff";
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = "";
              },
            })}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Phân trang */}
        <div className="pagination-section">
          <Space>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹ Trước
            </Button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <Button
                key={page}
                type={page === currentPage ? "primary" : "default"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau ›
            </Button>
          </Space>

          <Text type="secondary">
            Trang {currentPage}/{totalPages} • Hiển thị {startIndex + 1}-
            {Math.min(startIndex + pageSize, filteredUsers.length)} trên {filteredUsers.length}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminAccounts;
