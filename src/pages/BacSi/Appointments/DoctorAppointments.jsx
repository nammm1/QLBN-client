import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
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
  Tooltip
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  FilterOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./DoctorAppointments.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await apiCuocHenKham.getByBacSi(userInfo.user.id_nguoi_dung);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    if (searchName.trim()) {
      filtered = filtered.filter(item =>
        item.benhNhan?.ho_ten?.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }

    if (searchDate.trim()) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.ngay_kham);
        const itemDateStr = itemDate.getFullYear() + "-" +
          String(itemDate.getMonth() + 1).padStart(2, "0") + "-" +
          String(itemDate.getDate()).padStart(2, "0");
        return itemDateStr === searchDate;
      });
    }

    if (searchStatus.trim()) {
      filtered = filtered.filter(item => item.trang_thai === searchStatus);
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [searchName, searchDate, searchStatus, appointments]);

  const handleSelect = (id_cuoc_hen) => {
    navigate(`/doctor/appointment/${id_cuoc_hen}`);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredAppointments.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);

  const getStatusColor = (status) => {
    switch (status) {
      case "da_dat": return "blue";
      case "da_huy": return "red";
      case "da_hoan_thanh": return "green";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "da_dat": return "Đã đặt";
      case "da_huy": return "Đã hủy";
      case "da_hoan_thanh": return "Đã hoàn thành";
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

  const columns = [
    {
      title: "MÃ BN",
      dataIndex: ["benhNhan", "id_benh_nhan"],
      key: "id_benh_nhan",
      render: (id) => id || "Không",
      width: 100,
    },
    {
      title: "BỆNH NHÂN",
      dataIndex: ["benhNhan", "ho_ten"],
      key: "ho_ten",
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name || "Không"}</Text>
        </Space>
      ),
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: ["benhNhan", "gioi_tinh"],
      key: "gioi_tinh",
      render: (gender) => (
        <Tag color={getGenderColor(gender)}>
          {gender || "Không"}
        </Tag>
      ),
      width: 100,
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: ["benhNhan", "so_dien_thoai"],
      key: "so_dien_thoai",
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone || "Không"}
        </Space>
      ),
    },
    {
      title: "NGÀY KHÁM",
      dataIndex: "ngay_kham",
      key: "ngay_kham",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString("vi-VN")}
        </Space>
      ),
      width: 120,
    },
    {
      title: "GIỜ KHÁM",
      dataIndex: "khungGio",
      key: "gio_kham",
      render: (khungGio) => (
        <Space>
          <ClockCircleOutlined />
          {khungGio ? `${khungGio.gio_bat_dau} - ${khungGio.gio_ket_thuc}` : "Không"}
        </Space>
      ),
      width: 150,
    },
    {
      title: "LÝ DO KHÁM",
      dataIndex: "ly_do_kham",
      key: "ly_do_kham",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 600 }}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 130,
    },
    {
      title: "MÃ BHYT",
      dataIndex: ["benhNhan", "ma_BHYT"],
      key: "ma_BHYT",
      render: (bhyt) => (
        <Space>
          <IdcardOutlined />
          {bhyt || "Không"}
        </Space>
      ),
    },
  ];

  return (
    <div className="doctor-appointments-container">
      <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            📅 Lịch hẹn của bác sĩ
          </Title>
          <Text type="secondary">
            Quản lý và theo dõi các cuộc hẹn khám bệnh
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
                onChange={e => setSearchName(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <DatePicker
                placeholder="Chọn ngày khám"
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
                <Option value="da_dat">Đã đặt</Option>
                <Option value="da_huy">Đã hủy</Option>
                <Option value="da_hoan_thanh">Đã hoàn thành</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Text type="secondary">
                  Tổng: <Text strong>{filteredAppointments.length}</Text> cuộc hẹn
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
              key: item.id_cuoc_hen
            }))}
            pagination={false}
            size="middle"
            onRow={(record) => ({
              onClick: () => handleSelect(record.id_cuoc_hen),
              style: { 
                cursor: 'pointer',
                transition: 'all 0.2s'
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f0f7ff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.transform = '';
              },
            })}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Pagination */}
        <div className="pagination-section">
          <Space>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              icon={<span>‹</span>}
            >
              Trước
            </Button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              icon={<span>›</span>}
            >
              Sau
            </Button>
          </Space>
          
          <Text type="secondary">
            Trang {currentPage} / {totalPages} • 
            Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAppointments.length)} trên {filteredAppointments.length}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default DoctorAppointments;