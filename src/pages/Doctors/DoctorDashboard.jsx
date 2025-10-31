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
  Typography
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
  NotificationOutlined
} from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";

const { Title, Text } = Typography;

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    patientsToday: 12,
    appointments: 8,
    pendingRecords: 5,
    newReports: 3
  });

  const upcomingAppointments = [
    { 
      id: 1, 
      patientName: "Nguyễn Văn A", 
      time: "09:00", 
      type: "Khám định kỳ", 
      status: "confirmed",
      avatar: "A"
    },
    { 
      id: 2, 
      patientName: "Trần Thị B", 
      time: "10:30", 
      type: "Tái khám", 
      status: "confirmed",
      avatar: "B"
    },
    { 
      id: 3, 
      patientName: "Lê Văn C", 
      time: "14:00", 
      type: "Khám mới", 
      status: "pending",
      avatar: "C"
    },
    { 
      id: 4, 
      patientName: "Phạm Thị D", 
      time: "15:30", 
      type: "Khám định kỳ", 
      status: "confirmed",
      avatar: "D"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "message",
      title: "Tin nhắn mới",
      content: "Bệnh nhân Nguyễn Văn A đã gửi tin nhắn về tình trạng sức khỏe",
      time: "5 phút trước",
      priority: "high"
    },
    {
      id: 2,
      type: "approval",
      title: "Hồ sơ cần duyệt",
      content: "Hồ sơ bệnh án số HS-2024-001 cần được duyệt gấp",
      time: "30 phút trước",
      priority: "urgent"
    },
    {
      id: 3,
      type: "report",
      title: "Báo cáo mới",
      content: "Báo cáo thống kê tháng 12/2024 đã sẵn sàng",
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

  const recentActivities = [
    { time: "08:30", action: "Hoàn thành khám cho bệnh nhân Trần Văn E" },
    { time: "10:15", action: "Duyệt hồ sơ bệnh án số HS-2024-045" },
    { time: "11:30", action: "Gửi kết quả xét nghiệm cho bệnh nhân Nguyễn Thị F" },
    { time: "13:45", action: "Cập nhật phác đồ điều trị mới" },
  ];

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
      color: '#1890ff',
      progress: 75,
      suffix: '/ 16',
      prefix: <ArrowRightOutlined />
    },
    {
      title: 'Lịch hẹn',
      value: stats.appointments,
      icon: <ScheduleOutlined />,
      color: '#52c41a',
      progress: 60,
      suffix: '/ 12',
      prefix: <CalendarOutlined />
    },
    {
      title: 'Hồ sơ chờ duyệt',
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

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="mb-4">
        <Title level={2} className="mb-2 text-primary">
          👨‍⚕️ Trang tổng quan bác sĩ
        </Title>
        <Text type="secondary">
          Chào mừng trở lại! Dưới đây là tổng quan hoạt động của bạn hôm nay.
        </Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[24, 24]} className="mb-4">
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="shadow-sm border-0 h-100"
              styles={{ body: { padding: '20px' } }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Text type="secondary" className="d-block mb-1">
                    {stat.title}
                  </Text>
                  <Title level={2} className="mb-0" style={{ color: stat.color }}>
                    {stat.value}
                  </Title>
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: `${stat.color}15`,
                    fontSize: '20px',
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
              </div>
              <Progress 
                percent={stat.progress} 
                showInfo={false}
                strokeColor={stat.color}
                size="small"
              />
              <div className="d-flex justify-content-between align-items-center mt-2">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {stat.suffix}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
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
                    <CalendarOutlined className="text-primary" />
                    <span>Lịch hẹn sắp tới</span>
                    <Badge count={upcomingAppointments.length} showZero />
                  </Space>
                }
                className="shadow-sm h-100"
                extra={<Button type="link">Xem tất cả</Button>}
              >
                <List
                  dataSource={upcomingAppointments}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#1890ff' }}>
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
                              <ClockCircleOutlined /> {item.time}
                            </Text>
                            <Text type="secondary">{item.type}</Text>
                          </Space>
                        }
                      />
                      <Button type="primary" size="small">
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
                  items={recentActivities.map((activity, index) => ({
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
                title="Thao tác nhanh"
                className="shadow-sm h-100"
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Button 
                    type="primary" 
                    block 
                    icon={<UserOutlined />}
                    size="large"
                  >
                    Xem lịch bệnh nhân
                  </Button>
                  <Button 
                    block 
                    icon={<CalendarOutlined />}
                    size="large"
                  >
                    Quản lý lịch hẹn
                  </Button>
                  <Button 
                    block 
                    icon={<FileTextOutlined />}
                    size="large"
                  >
                    Duyệt hồ sơ
                  </Button>
                  <Button 
                    block 
                    icon={<MessageOutlined />}
                    size="large"
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
                  description="Tất cả dịch vụ đang hoạt động bình thường"
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

export default DoctorDashboard;