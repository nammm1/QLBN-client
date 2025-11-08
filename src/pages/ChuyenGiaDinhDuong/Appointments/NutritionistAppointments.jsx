import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import {
  Card,
  Table,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  Tooltip,
  Popover,
  Form,
  DatePicker
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  HomeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "../Appointments/NutritionistAppointments.css";

const { Title, Text } = Typography;
const { Option } = Select;

const NutritionistAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const pageSize = 10;

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await apiCuocHenTuVan.getByChuyenGia(userInfo.user.id_nguoi_dung);
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

    if (searchStatus.trim()) {
      filtered = filtered.filter(item => item.trang_thai === searchStatus);
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

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [searchName, searchStatus, searchDate, appointments]);

  const handleSelect = (id_cuoc_hen) => {
    navigate(`/nutritionist/appointment/${id_cuoc_hen}`);
  };

  const handleApplyFilters = (values) => {
    setSearchStatus(values.status || "");
    setSearchDate(values.date ? values.date.format('YYYY-MM-DD') : "");
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchStatus("");
    setSearchDate("");
    form.resetFields();
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

  // Nội dung Popover Filter
  const filterContent = (
    <div style={{ width: 250 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleApplyFilters}
        initialValues={{
          status: searchStatus,
          date: searchDate ? dayjs(searchDate) : null
        }}
      >
        <Form.Item name="status" label="Trạng thái">
          <Select placeholder="Chọn trạng thái" allowClear>
            <Option value="da_dat">Đã đặt</Option>
            <Option value="da_huy">Đã hủy</Option>
            <Option value="da_hoan_thanh">Đã hoàn thành</Option>
          </Select>
        </Form.Item>

        <Form.Item name="date" label="Ngày tư vấn">
          <DatePicker 
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleResetFilters}
            style={{ flex: 1 }}
          >
            Đặt lại
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            style={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
              border: 'none'
            }}
          >
            Áp dụng
          </Button>
        </div>
      </Form>
    </div>
  );

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
      title: "NGÀY TƯ VẤN",
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
      title: "GIỜ TƯ VẤN",
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
      title: "LOẠI HẸN",
      dataIndex: "loai_hen",
      key: "loai_hen",
      render: (loai_hen) => {
        if (loai_hen === 'online') {
          return (
            <Tag color="blue" icon={<VideoCameraOutlined />}>
              Online
            </Tag>
          );
        } else if (loai_hen === 'truc_tiep') {
          return (
            <Tag color="green" icon={<HomeOutlined />}>
              Trực tiếp
            </Tag>
          );
        }
        return <Tag>{loai_hen || "—"}</Tag>;
      },
      width: 120,
    },
    {
      title: "LOẠI DINH DƯỠNG",
      dataIndex: "loai_dinh_duong",
      key: "loai_dinh_duong",
      render: (loai) => (
        <Tag color="purple">{loai || "Không có"}</Tag>
      ),
      width: 150,
    },
    {
      title: "LÝ DO TƯ VẤN",
      dataIndex: "ly_do_tu_van",
      key: "ly_do_tu_van",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text>{text || "Không có"}</Text>
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
    <div className="nutritionist-appointments-container">
      <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            🥗 Lịch hẹn tư vấn dinh dưỡng
          </Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>
            Quản lý và theo dõi các cuộc hẹn tư vấn dinh dưỡng
          </Text>
        </div>

        {/* Search and Filter Bar */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16} md={18}>
              <Input
                placeholder="🔍 Tìm theo tên bệnh nhân..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                size="large"
                style={{ 
                  maxWidth: 400, 
                  marginRight: 8,
                  borderColor: '#d9d9d9'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#096dd9';
                  e.target.style.boxShadow = '0 0 0 2px rgba(9, 109, 217, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d9d9d9';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Filter Button */}
                <Popover
                  content={filterContent}
                  trigger="click"
                  open={filterOpen}
                  onOpenChange={setFilterOpen}
                  placement="bottomRight"
                >
                  <Button 
                    icon={<FilterOutlined />}
                    size="large"
                    style={{
                      borderColor: '#096dd9',
                      color: '#096dd9'
                    }}
                  >
                    Bộ lọc
                  </Button>
                </Popover>
            </Col>
            
            <Col xs={24} sm={8} md={6}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Text type="secondary">
                  <Text strong>{filteredAppointments.length}</Text> cuộc hẹn
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

export default NutritionistAppointments;
