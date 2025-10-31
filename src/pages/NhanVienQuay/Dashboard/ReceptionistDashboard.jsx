import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Timeline, Table, Tag, Avatar, Typography, Badge } from "antd";
import {
  UserAddOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    patientsToday: 42,
    appointmentsToday: 28,
    pendingAppointments: 8,
    revenue: 15750000,
  });

  const [todayActivities, setTodayActivities] = useState([
    {
      time: "08:30",
      type: "check-in",
      content: "Tiếp nhận BN Nguyễn Văn A - Khám tim mạch",
      status: "completed",
    },
    {
      time: "09:15",
      type: "appointment",
      content: "Xác nhận lịch hẹn cho BN Trần Thị B - Khám nội tiết",
      status: "completed",
    },
    {
      time: "10:00",
      type: "payment",
      content: "Thu phí khám cho BN Lê Văn C - 350,000 VNĐ",
      status: "completed",
    },
    {
      time: "11:20",
      type: "check-in",
      content: "Tiếp nhận BN Phạm Thị D - Khám da liễu",
      status: "in-progress",
    },
  ]);

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      key: "1",
      time: "14:00",
      patient: "Hoàng Văn E",
      phone: "0912345678",
      specialty: "Tim mạch",
      doctor: "BS. Nguyễn A",
      status: "confirmed",
    },
    {
      key: "2",
      time: "14:30",
      patient: "Ngô Thị F",
      phone: "0923456789",
      specialty: "Nội tiết",
      doctor: "BS. Trần B",
      status: "pending",
    },
    {
      key: "3",
      time: "15:00",
      patient: "Vũ Văn G",
      phone: "0934567890",
      specialty: "Da liễu",
      doctor: "BS. Lê C",
      status: "confirmed",
    },
  ]);

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      width: 100,
      render: (time) => (
        <Text strong style={{ color: "#f39c12" }}>
          <ClockCircleOutlined /> {time}
        </Text>
      ),
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patient",
      key: "patient",
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.phone}
          </Text>
        </div>
      ),
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          confirmed: { color: "success", text: "Đã xác nhận", icon: <CheckCircleOutlined /> },
          pending: { color: "warning", text: "Chờ xác nhận", icon: <SyncOutlined spin /> },
          cancelled: { color: "error", text: "Đã hủy", icon: <CloseCircleOutlined /> },
        };
        const { color, text, icon } = config[status] || config.pending;
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "check-in":
        return <UserAddOutlined style={{ color: "#52c41a" }} />;
      case "appointment":
        return <CalendarOutlined style={{ color: "#1890ff" }} />;
      case "payment":
        return <DollarCircleOutlined style={{ color: "#f39c12" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          👋 Chào mừng trở lại!
        </Title>
        <Text type="secondary">
          Tổng quan công việc tiếp nhận hôm nay - {new Date().toLocaleDateString("vi-VN")}
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "30px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Bệnh nhân hôm nay</span>}
              value={stats.patientsToday}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
              suffix={<Badge count={"+12"} style={{ backgroundColor: "#52c41a" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Lịch hẹn hôm nay</span>}
              value={stats.appointmentsToday}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Chờ xác nhận</span>}
              value={stats.pendingAppointments}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <Statistic
              title={<span style={{ color: "#fff", opacity: 0.9 }}>Doanh thu hôm nay</span>}
              value={stats.revenue}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#fff", fontWeight: "bold", fontSize: "20px" }}
              suffix="đ"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Today's Activities */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
                Hoạt động hôm nay
              </span>
            }
            style={{ borderRadius: "12px", height: "100%" }}
            bodyStyle={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <Timeline>
              {todayActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  dot={getActivityIcon(activity.type)}
                  color={activity.status === "completed" ? "green" : "blue"}
                >
                  <div>
                    <Text strong style={{ color: "#f39c12" }}>
                      {activity.time}
                    </Text>
                    <br />
                    <Text>{activity.content}</Text>
                    {activity.status === "in-progress" && (
                      <Tag color="processing" style={{ marginLeft: "8px" }}>
                        Đang xử lý
                      </Tag>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Upcoming Appointments */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <span>
                <CalendarOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
                Lịch hẹn sắp tới
              </span>
            }
            style={{ borderRadius: "12px" }}
          >
            <Table
              columns={columns}
              dataSource={upcomingAppointments}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                <RiseOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
                Thống kê nhanh
              </span>
            }
            style={{ borderRadius: "12px" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Avatar
                    size={64}
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: "#52c41a", marginBottom: "12px" }}
                  />
                  <div>
                    <Text type="secondary" style={{ display: "block", fontSize: "13px" }}>
                      Đã hoàn thành
                    </Text>
                    <Text strong style={{ fontSize: "24px", color: "#52c41a" }}>
                      24
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Avatar
                    size={64}
                    icon={<SyncOutlined />}
                    style={{ backgroundColor: "#1890ff", marginBottom: "12px" }}
                  />
                  <div>
                    <Text type="secondary" style={{ display: "block", fontSize: "13px" }}>
                      Đang xử lý
                    </Text>
                    <Text strong style={{ fontSize: "24px", color: "#1890ff" }}>
                      8
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Avatar
                    size={64}
                    icon={<CalendarOutlined />}
                    style={{ backgroundColor: "#f39c12", marginBottom: "12px" }}
                  />
                  <div>
                    <Text type="secondary" style={{ display: "block", fontSize: "13px" }}>
                      Lịch hẹn mới
                    </Text>
                    <Text strong style={{ fontSize: "24px", color: "#f39c12" }}>
                      12
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Avatar
                    size={64}
                    icon={<UserAddOutlined />}
                    style={{ backgroundColor: "#722ed1", marginBottom: "12px" }}
                  />
                  <div>
                    <Text type="secondary" style={{ display: "block", fontSize: "13px" }}>
                      BN mới đăng ký
                    </Text>
                    <Text strong style={{ fontSize: "24px", color: "#722ed1" }}>
                      6
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReceptionistDashboard;

