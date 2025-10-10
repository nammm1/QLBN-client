import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import {
  Card,
  Table,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  Tooltip,
  Badge
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined,
  IdcardOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "../Appointments/DoctorAppointments.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DoctorRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await apiHoSoKhamBenh.getAll();
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

    if (searchDate.trim()) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.ngay_tao);
        const itemDateStr =
          itemDate.getFullYear() +
          "-" +
          String(itemDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(itemDate.getDate()).padStart(2, "0");
        return itemDateStr === searchDate;
      });
    }

    if (searchStatus.trim()) {
      filtered = filtered.filter((item) => item.trang_thai === searchStatus);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchName, searchDate, searchStatus, records]);

  const handleSelect = (id_ho_so) => {
    navigate(`/doctor/record/${id_ho_so}`);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredRecords.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const getStatusColor = (status) => {
    switch (status) {
      case "dang_dieu_tri": return "orange";
      case "da_ket_thuc": return "green";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "dang_dieu_tri": return "Đang điều trị";
      case "da_ket_thuc": return "Đã kết thúc";
      default: return "N/A";
    }
  };

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
        <Badge count={id} showZero={false} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: "BỆNH NHÂN",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "so_dien_thoai",
      key: "so_dien_thoai",
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <Text>{phone}</Text>
        </Space>
      ),
      width: 140,
    },
    {
      title: "TUỔI",
      dataIndex: "tuoi",
      key: "tuoi",
      render: (age) => (
        <Tag color={getAgeColor(age)} style={{ fontWeight: 600 }}>
          {age}
        </Tag>
      ),
      width: 80,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gioi_tinh",
      key: "gioi_tinh",
      render: (gender) => (
        <Tag color={getGenderColor(gender)}>
          {gender}
        </Tag>
      ),
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
    {
      title: "TRẠNG THÁI",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 600, minWidth: 100 }}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "CHẨN ĐOÁN",
      dataIndex: "chuan_doan",
      key: "chuan_doan",
      render: (diagnosis) => (
        <Tooltip title={diagnosis || "Chưa có chẩn đoán"}>
          <Space>
            <MedicineBoxOutlined style={{ color: '#ff4d4f' }} />
            <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: diagnosis }}>
              {diagnosis ? diagnosis.slice(0, 50) + "..." : "..."}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="doctor-appointments-container">
      <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            📋 Hồ sơ bệnh án
          </Title>
          <Text type="secondary">
            Quản lý và theo dõi hồ sơ bệnh án của bệnh nhân
          </Text>
        </div>

        {/* Filter Bar */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Tìm theo tên bệnh nhân..."
                prefix={<SearchOutlined />}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <DatePicker
                placeholder="Chọn ngày tạo"
                value={searchDate ? dayjs(searchDate) : null}
                onChange={(date) => setSearchDate(date ? date.format('YYYY-MM-DD') : '')}
                style={{ width: '100%' }}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Trạng thái"
                value={searchStatus || null}
                onChange={setSearchStatus}
                style={{ width: '100%' }}
                size="large"
                allowClear
              >
                <Option value="dang_dieu_tri">Đang điều trị</Option>
                <Option value="da_ket_thuc">Đã kết thúc</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={6}>
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
                e.currentTarget.style.backgroundColor = '#f0f7ff';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
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

export default DoctorRecords;