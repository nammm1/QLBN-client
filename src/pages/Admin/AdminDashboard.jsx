import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Space, 
  Avatar, 
  Badge, 
  Spin, 
  message,
  Progress
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import DashboardAPI from "../../api/Dashboard";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStaff: 0,
    totalUsers: 0,
    appointmentsToday: 0,
    monthlyRevenue: 0,
    newPatientsThisMonth: 0,
    completionRate: 0
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardAPI.getAdminDashboard();
      if (response.success && response.data) {
        setStats(response.data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "0" }}>
      {/* Welcome Card */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        }}
        styles={{ body: { padding: "32px" } }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <Badge dot color="#10b981" offset={[-5, 60]}>
              <Avatar
                size={80}
                style={{
                  background: "linear-gradient(135deg, #16a085 0%, #2ecc71 100%)",
                  fontSize: "32px",
                }}
              >
                <UserOutlined />
              </Avatar>
            </Badge>
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0, color: "white" }}>
                Xin chào, {userInfo?.user?.ho_ten || "Quản trị viên"}! 👋
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px" }}>
                Chào mừng bạn quay trở lại bảng điều khiển quản trị
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: "14px" }}>
                  Tổng bệnh nhân
                </Text>
              }
              value={stats.totalPatients}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<UserOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #16a085 0%, #2ecc71 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(22, 160, 133, 0.3)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: "14px" }}>
                  Tổng nhân viên
                </Text>
              }
              value={stats.totalStaff}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<TeamOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: "14px" }}>
                  Tổng người dùng
                </Text>
              }
              value={stats.totalUsers}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<UserOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(243, 156, 18, 0.3)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: "14px" }}>
                  Lịch hẹn hôm nay
                </Text>
              }
              value={stats.appointmentsToday}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<CalendarOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(155, 89, 182, 0.3)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: "14px" }}>
                  Doanh thu tháng này
                </Text>
              }
              value={stats.monthlyRevenue}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "28px" }}
              prefix={<DollarCircleOutlined style={{ fontSize: "24px" }} />}
              suffix={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>đ</Text>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, fontSize: "14px" }}>
                  Bệnh nhân mới tháng này
                </Text>
              }
              value={stats.newPatientsThisMonth}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<RiseOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <Text strong style={{ fontSize: "14px", color: "#666" }}>
                Tỷ lệ hoàn thành cuộc hẹn
              </Text>
              <Progress
                type="dashboard"
                percent={stats.completionRate}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                format={(percent) => `${percent}%`}
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <CheckCircleOutlined /> Tổng số cuộc hẹn đã hoàn thành
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#667eea" }} />
                <span>Thống kê tổng quan</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng bệnh nhân"
                    value={stats.totalPatients}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng nhân viên"
                    value={stats.totalStaff}
                    prefix={<TeamOutlined />}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Lịch hẹn hôm nay"
                    value={stats.appointmentsToday}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="BN mới tháng này"
                    value={stats.newPatientsThisMonth}
                    prefix={<RiseOutlined />}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#f39c12" }} />
                <span>Hiệu suất hệ thống</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Tỷ lệ hoàn thành cuộc hẹn
                </Text>
                <Progress
                  percent={stats.completionRate}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  status="active"
                />
              </div>
              <div>
                <Text strong style={{ fontSize: "16px", color: "#667eea" }}>
                  Doanh thu tháng này
                </Text>
                <br />
                <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#9b59b6" }}>
                  {formatCurrency(stats.monthlyRevenue)}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
