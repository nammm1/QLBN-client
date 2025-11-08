import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiHoSoDinhDuong from "../../../api/HoSoDinhDuong";
import {
  Card,
  Table,
  Input,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  Badge
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import "../Appointments/NutritionistAppointments.css";

const { Title, Text } = Typography;

const NutritionistRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await apiHoSoDinhDuong.getAll();
        setRecords(data);
        setFilteredRecords(data);
      } catch (error) {
        console.error("Lỗi khi lấy hồ sơ:", error);
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (searchName.trim()) {
      filtered = filtered.filter((item) =>
        item.benhNhan?.ho_ten
          ?.toLowerCase()
          .includes(searchName.trim().toLowerCase())
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchName, records]);

  const handleSelect = (id_ho_so) => {
    navigate(`/nutritionist/record/${id_ho_so}`);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredRecords.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "nam": return "blue";
      case "nữ": return "pink";
      default: return "default";
    }
  };

  const getAgeColor = (age) => {
    if (age < 18) return "green";
    if (age < 60) return "blue";
    return "red";
  };

  const columns = [
    {
      title: "MÃ HỒ SƠ",
      dataIndex: "id_ho_so",
      key: "id_ho_so",
      width: 100,
      render: (id) => (
        <Badge count={id} showZero={false} style={{ backgroundColor: '#096dd9' }} />
      ),
    },
    {
      title: "BỆNH NHÂN",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#096dd9' }} />
          <Text strong>{name || record.benhNhan?.ho_ten}</Text>
        </Space>
      ),
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "so_dien_thoai",
      key: "so_dien_thoai",
      render: (phone, record) => (
        <Space>
          <PhoneOutlined style={{ color: '#096dd9' }} />
          <Text>{phone || record.benhNhan?.so_dien_thoai}</Text>
        </Space>
      ),
      width: 140,
    },
    {
      title: "TUỔI",
      dataIndex: "tuoi",
      key: "tuoi",
      render: (age, record) => {
        const ageValue = age || record.benhNhan?.tuoi;
        return (
          <Tag color={getAgeColor(ageValue)} style={{ fontWeight: 600 }}>
            {ageValue}
          </Tag>
        );
      },
      width: 80,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gioi_tinh",
      key: "gioi_tinh",
      render: (gender, record) => {
        const genderValue = gender || record.benhNhan?.gioi_tinh;
        return (
          <Tag color={getGenderColor(genderValue)}>
            {genderValue}
          </Tag>
        );
      },
      width: 100,
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "thoi_gian_tao",
      key: "thoi_gian_tao",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#faad14' }} />
          <Text>
            {date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}
          </Text>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className="doctor-appointments-container" style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
      minHeight: '100vh'
    }}>
      <Card className="shadow-card" style={{
        boxShadow: '0 4px 16px rgba(9, 109, 217, 0.1)',
        borderRadius: '16px',
        border: '1px solid rgba(9, 109, 217, 0.1)'
      }}>
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title" style={{
            background: 'linear-gradient(135deg, #096dd9 0%, #0050b3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700
          }}>
            📋 Hồ sơ dinh dưỡng
          </Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>
            Quản lý và theo dõi hồ sơ dinh dưỡng của bệnh nhân
          </Text>
        </div>

        {/* Filter Bar */}
        <Card size="small" className="filter-card" style={{
          background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
          border: '1px solid rgba(9, 109, 217, 0.15)',
          borderRadius: '12px'
        }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm theo tên bệnh nhân..."
                prefix={<SearchOutlined style={{ color: '#096dd9' }} />}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="large"
                style={{ borderColor: '#d9d9d9' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#096dd9';
                  e.target.style.boxShadow = '0 0 0 2px rgba(9, 109, 217, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d9d9d9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={16}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Text type="secondary">
                  Tổng: <Text strong>{filteredRecords.length}</Text> hồ sơ
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={currentPageData.map(item => ({
              ...item,
              key: item.id_ho_so
            }))}
            pagination={false}
            size="middle"
            onRow={(record) => ({
              onClick: () => handleSelect(record.id_ho_so),
              style: { 
                cursor: 'pointer',
                transition: 'all 0.2s'
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#e6f7ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(9, 109, 217, 0.15)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              },
            })}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Pagination */}
        <div className="pagination-section">
          <Space>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              icon={<span>‹</span>}
            >
              Trước
            </Button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <Button
                key={page}
                type={page === currentPage ? "primary" : "default"}
                onClick={() => setCurrentPage(page)}
                className="pagination-btn"
                style={page === currentPage ? {
                  background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                  border: 'none'
                } : {
                  borderColor: '#d9d9d9'
                }}
              >
                {page}
              </Button>
            ))}
            
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              icon={<span>›</span>}
            >
              Sau
            </Button>
          </Space>
          
          <Text type="secondary">
            Trang {currentPage} / {totalPages} • 
            Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, filteredRecords.length)} trên {filteredRecords.length}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default NutritionistRecords;

