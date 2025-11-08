import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Tag, 
  Avatar, 
  Badge, 
  Progress,
  Timeline,
  Alert,
  Button,
  Space,
  Typography,
  Spin,
  message
} from "antd";
import { 
  UserOutlined, 
  CalendarOutlined, 
  FileTextOutlined, 
  BellOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  ScheduleOutlined,
  ProfileOutlined,
  NotificationOutlined,
  AppleOutlined
} from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import DashboardAPI from "../../../api/Dashboard";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const NutritionistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientsToday: 0,
    appointments: 0,
    pendingRecords: 0,
    newReports: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardAPI.getNutritionistDashboard();
      if (response.success && response.data) {
        setStats(response.data.stats || stats);
        setUpcomingAppointments(response.data.upcomingAppointments || []);
        setRecentActivities(response.data.recentActivities || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatAppointmentTime = (dateTime) => {
    if (!dateTime) return "";
    return moment(dateTime).format("HH:mm");
  };

  const formatAppointmentDate = (dateTime) => {
    if (!dateTime) return "";
    return moment(dateTime).format("DD/MM/YYYY");
  };

  const getAppointmentType = (loaiHen, loaiDinhDuong) => {
    const types = {
      truc_tiep: "Trực tiếp",
      online: "Online",
    };
    return types[loaiHen] || loaiDinhDuong || "Tư vấn";
  };

  const getStatusFromApi = (trangThai) => {
    const statusMap = {
      da_xac_nhan: "confirmed",
      da_dat: "pending",
      cho_xac_nhan: "pending",
      da_huy: "cancelled",
      da_hoan_thanh: "confirmed",
      hoan_thanh: "confirmed",
      completed: "confirmed",
      pending: "pending",
      confirmed: "confirmed",
      cancelled: "cancelled"
    };
    return statusMap[trangThai] || "pending";
  };

  // Format upcoming appointments from API
  const formattedUpcomingAppointments = upcomingAppointments.map((apt, index) => ({
    id: apt.id_cuoc_hen || index,
    patientName: apt.nguoi_dung?.ho_ten || apt.benh_nhan?.ho_ten || "N/A",
    time: formatAppointmentTime(apt.ngay_kham || apt.ngay_tu_van || apt.ngay_hen),
    date: formatAppointmentDate(apt.ngay_kham || apt.ngay_tu_van || apt.ngay_hen),
    type: getAppointmentType(apt.loai_hen, apt.loai_dinh_duong),
    status: getStatusFromApi(apt.trang_thai),
    avatar: (apt.nguoi_dung?.ho_ten || apt.benh_nhan?.ho_ten || "N")[0].toUpperCase(),
    raw: apt
  }));

  const notifications = [
    {
      id: 1,
      type: "message",
      title: "Tin nhắn mới",
      content: "Bệnh nhân đã gửi tin nhắn về tình trạng dinh dưỡng",
      time: "5 phút trước",
      priority: "high"
    },
    {
      id: 2,
      type: "approval",
      title: "Hồ sơ cần duyệt",
      content: "Hồ sơ dinh dưỡng số HS-2024-001 cần được duyệt gấp",
      time: "30 phút trước",
      priority: "urgent"
    },
    {
      id: 3,
      type: "report",
      title: "Báo cáo mới",
      content: "Báo cáo thống kê tư vấn dinh dưỡng tháng 12/2024 đã sẵn sàng",
      time: "2 giờ trước",
      priority: "medium"
    },
    {
      id: 4,
      type: "system",
      title: "Cập nhật hệ thống",
      content: "Hệ thống sẽ bảo trì vào 02:00 - 04:00 ngày mai",
      time: "4 giờ trước",
      priority: "low"
    }
  ];

  const formattedRecentActivities = recentActivities.map((activity) => ({
    time: activity.time || "",
    action: activity.action || ""
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const statCards = [
    {
      title: 'Bệnh nhân hôm nay',
      value: stats.patientsToday,
      icon: <TeamOutlined />,
      color: '#096dd9',
      progress: 75,
      suffix: '/ 16',
      prefix: <ArrowRightOutlined />
    },
    {
      title: 'Lịch tư vấn',
      value: stats.appointments,
      icon: <ScheduleOutlined />,
      color: '#096dd9',
      progress: 60,
      suffix: '/ 12',
      prefix: <CalendarOutlined />
    },
    {
      title: 'Hồ sơ dinh dưỡng chờ duyệt',
      value: stats.pendingRecords,
      icon: <ProfileOutlined />,
      color: '#faad14',
      progress: 45,
      suffix: '/ 11',
      prefix: <FileTextOutlined />
    },
    {
      title: 'Báo cáo mới',
      value: stats.newReports,
      icon: <NotificationOutlined />,
      color: '#ff4d4f',
      progress: 30,
      suffix: '/ 10',
      prefix: <BellOutlined />
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-4 bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ 
      background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 50%, #fff7e6 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="mb-4">
        <Title level={2} className="mb-2" style={{ 
          background: 'linear-gradient(135deg, #096dd9 0%, #0050b3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 700,
          fontSize: '32px'
        }}>
          🍎 Trang tổng quan chuyên gia dinh dưỡng
        </Title>
        <Text type="secondary" style={{ fontSize: '15px' }}>
          Chào mừng trở lại! Dưới đây là tổng quan hoạt động tư vấn dinh dưỡng của bạn hôm nay.
        </Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[24, 24]} className="mb-4">
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="shadow-sm border-0 h-100"
              styles={{ body: { padding: '20px' } }}
              style={{
                background: stat.color === '#096dd9' 
                  ? 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${stat.color === '#096dd9' ? 'rgba(9, 109, 217, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color === '#096dd9' ? 'rgba(9, 109, 217, 0.2)' : 'rgba(0, 0, 0, 0.12)'}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Text type="secondary" className="d-block mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {stat.title}
                  </Text>
                  <Title level={2} className="mb-0" style={{ 
                    color: stat.color,
                    fontWeight: 700,
                    fontSize: '32px'
                  }}>
                    {stat.value}
                  </Title>
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ 
                    width: '56px', 
                    height: '56px', 
                    background: stat.color === '#096dd9'
                      ? 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)'
                      : `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                    fontSize: '24px',
                    color: '#ffffff',
                    boxShadow: `0 4px 12px ${stat.color}40`
                  }}
                >
                  {stat.icon}
                </div>
              </div>
              <Progress 
                percent={stat.progress} 
                showInfo={false}
                strokeColor={stat.color === '#096dd9' 
                  ? { '0%': '#096dd9', '100%': '#40a9ff' }
                  : stat.color}
                size="small"
                style={{ height: '6px', borderRadius: '3px' }}
              />
              <div className="d-flex justify-content-between align-items-center mt-2">
                <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
                  {stat.suffix}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
                  {stat.progress}% hoàn thành
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          <Row gutter={[24, 24]}>
            {/* Upcoming Appointments */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <AppleOutlined style={{ color: '#096dd9', fontSize: '18px' }} />
                    <span style={{ fontWeight: 600 }}>Lịch tư vấn sắp tới</span>
                    <Badge count={upcomingAppointments.length} showZero style={{ backgroundColor: '#096dd9' }} />
                  </Space>
                }
                className="shadow-sm h-100"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e6f7ff 100%)',
                  border: '1px solid rgba(9, 109, 217, 0.15)'
                }}
                extra={
                  <Button 
                    type="link" 
                    onClick={() => navigate('/nutritionist/appointments')}
                    style={{ color: '#096dd9', fontWeight: 500 }}
                  >
                    Xem tất cả →
                  </Button>
                }
              >
                <List
                  dataSource={formattedUpcomingAppointments}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ 
                            background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                            boxShadow: '0 2px 8px rgba(9, 109, 217, 0.3)'
                          }}>
                            {item.avatar}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong>{item.patientName}</Text>
                            <Tag color={getStatusColor(item.status)}>
                              {getStatusText(item.status)}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              <ClockCircleOutlined /> {item.date} - {item.time}
                            </Text>
                            <Text type="secondary">{item.type}</Text>
                          </Space>
                        }
                      />
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => navigate(`/nutritionist/appointment/${item.id}`)}
                        style={{
                          background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                          border: 'none',
                          fontWeight: 500
                        }}
                      >
                        Chi tiết
                      </Button>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Recent Activities */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <CheckCircleOutlined className="text-success" />
                    <span>Hoạt động gần đây</span>
                  </Space>
                }
                className="shadow-sm h-100"
              >
                <Timeline
                  items={formattedRecentActivities.map((activity, index) => ({
                    key: index,
                    dot: <ClockCircleOutlined style={{ fontSize: '12px' }} />,
                    children: (
                      <Space direction="vertical" size={0}>
                        <Text strong>{activity.action}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {activity.time}
                        </Text>
                      </Space>
                    )
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          <Row gutter={[24, 24]}>
            {/* Notifications */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <BellOutlined className="text-warning" />
                    <span>Thông báo & Tin nhắn</span>
                    <Badge count={notifications.length} showZero />
                  </Space>
                }
                className="shadow-sm h-100"
                extra={<Button type="link">Đánh dấu đã đọc</Button>}
              >
                <List
                  dataSource={notifications}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Badge dot color={getPriorityColor(item.priority)}>
                            <Avatar 
                              size="small" 
                              icon={<BellOutlined />}
                              style={{ backgroundColor: getPriorityColor(item.priority) }}
                            />
                          </Badge>
                        }
                        title={
                          <Text strong>{item.title}</Text>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {item.content}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {item.time}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24}>
              <Card 
                title={<span style={{ fontWeight: 600 }}>Thao tác nhanh</span>}
                className="shadow-sm h-100"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e6f7ff 100%)',
                  border: '1px solid rgba(9, 109, 217, 0.15)'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Button 
                    type="primary" 
                    block 
                    icon={<UserOutlined />}
                    size="large"
                    onClick={() => navigate('/nutritionist/patients')}
                    style={{
                      background: 'linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)',
                      border: 'none',
                      height: '48px',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(9, 109, 217, 0.3)'
                    }}
                  >
                    Xem danh sách bệnh nhân
                  </Button>
                  <Button 
                    block 
                    icon={<CalendarOutlined />}
                    size="large"
                    onClick={() => navigate('/nutritionist/appointments')}
                    style={{
                      height: '48px',
                      borderColor: '#096dd9',
                      color: '#096dd9',
                      fontWeight: 500
                    }}
                  >
                    Quản lý lịch tư vấn
                  </Button>
                  <Button 
                    block 
                    icon={<FileTextOutlined />}
                    size="large"
                    onClick={() => navigate('/nutritionist/records')}
                    style={{
                      height: '48px',
                      borderColor: '#096dd9',
                      color: '#096dd9',
                      fontWeight: 500
                    }}
                  >
                    Duyệt hồ sơ dinh dưỡng
                  </Button>
                  <Button 
                    block 
                    icon={<MessageOutlined />}
                    size="large"
                    onClick={() => navigate('/nutritionist/chat')}
                    style={{
                      height: '48px',
                      borderColor: '#096dd9',
                      color: '#096dd9',
                      fontWeight: 500
                    }}
                  >
                    Tin nhắn
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* System Status */}
      <Row gutter={[24, 24]} className="mt-4">
        <Col xs={24}>
          <Card title="Trạng thái hệ thống" className="shadow-sm">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Alert 
                  message="Hệ thống ổn định" 
                  description="Tất cả dịch vụ tư vấn dinh dưỡng đang hoạt động bình thường"
                  type="success" 
                  showIcon 
                />
              </Col>
              <Col xs={24} sm={8}>
                <Alert 
                  message="Lưu lượng truy cập" 
                  description="Bình thường - 45% công suất"
                  type="info" 
                  showIcon 
                />
              </Col>
              <Col xs={24} sm={8}>
                <Alert 
                  message="Cập nhật dữ liệu" 
                  description="Lần cuối: 10 phút trước"
                  type="warning" 
                  showIcon 
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NutritionistDashboard;

