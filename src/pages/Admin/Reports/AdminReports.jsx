import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  message,
  DatePicker,
  Button,
  Space,
  Table,
  Tag,
  Progress,
  Divider,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import DashboardAPI from "../../../api/Dashboard";
import dayjs from "dayjs";
import "./AdminReports.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStaff: 0,
    totalUsers: 0,
    appointmentsToday: 0,
    monthlyRevenue: 0,
    newPatientsThisMonth: 0,
    completionRate: 0,
  });
  const [dateRange, setDateRange] = useState(null);

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
      message.error("Không thể tải dữ liệu báo cáo");
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

  const handleExportReport = () => {
    message.info("Chức năng xuất báo cáo đang được phát triển");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const reportTableData = [
    {
      key: "1",
      metric: "Tổng số bệnh nhân",
      value: stats.totalPatients,
      icon: <UserOutlined />,
      color: "#1890ff",
    },
    {
      key: "2",
      metric: "Tổng số nhân viên",
      value: stats.totalStaff,
      icon: <TeamOutlined />,
      color: "#52c41a",
    },
    {
      key: "3",
      metric: "Tổng số người dùng",
      value: stats.totalUsers,
      icon: <UserOutlined />,
      color: "#722ed1",
    },
    {
      key: "4",
      metric: "Cuộc hẹn hôm nay",
      value: stats.appointmentsToday,
      icon: <CalendarOutlined />,
      color: "#fa8c16",
    },
    {
      key: "5",
      metric: "Bệnh nhân mới tháng này",
      value: stats.newPatientsThisMonth,
      icon: <RiseOutlined />,
      color: "#eb2f96",
    },
    {
      key: "6",
      metric: "Tỷ lệ hoàn thành cuộc hẹn",
      value: `${stats.completionRate}%`,
      icon: <CheckCircleOutlined />,
      color: "#13c2c2",
    },
  ];

  const reportColumns = [
    {
      title: "CHỈ SỐ",
      dataIndex: "metric",
      key: "metric",
      render: (text, record) => (
        <Space>
          <span style={{ color: record.color, fontSize: "18px" }}>
            {record.icon}
          </span>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "GIÁ TRỊ",
      dataIndex: "value",
      key: "value",
      render: (value) => (
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>{value}</Text>
      ),
    },
  ];

  return (
    <div className="admin-reports-container">
      {/* Header */}
      <Card
        className="shadow-card"
        style={{ marginBottom: 24 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                <BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                Báo cáo thống kê
              </Title>
              <Text type="secondary">
                Tổng quan các chỉ số và thống kê của hệ thống
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <RangePicker
                format="DD/MM/YYYY"
                onChange={(dates) => setDateRange(dates)}
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
              >
                Xuất báo cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
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
            className="stat-card"
            style={{
              background: "linear-gradient(135deg, #16a085 0%, #2ecc71 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
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
            className="stat-card"
            style={{
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
                  Cuộc hẹn hôm nay
                </Text>
              }
              value={stats.appointmentsToday}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<CalendarOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card"
            style={{
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              border: "none",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
                  BN mới tháng này
                </Text>
              }
              value={stats.newPatientsThisMonth}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: "32px" }}
              prefix={<RiseOutlined style={{ fontSize: "24px" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue and Completion Rate */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="shadow-card">
            <Title level={4}>
              <DollarCircleOutlined style={{ color: "#9b59b6", marginRight: 8 }} />
              Doanh thu tháng này
            </Title>
            <Divider />
            <Statistic
              value={stats.monthlyRevenue}
              prefix={<DollarCircleOutlined />}
              suffix="đ"
              valueStyle={{ fontSize: "36px", fontWeight: "bold", color: "#9b59b6" }}
            />
            <Progress
              percent={Math.min((stats.monthlyRevenue / 100000000) * 100, 100)}
              strokeColor={{
                "0%": "#9b59b6",
                "100%": "#8e44ad",
              }}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="shadow-card">
            <Title level={4}>
              <CheckCircleOutlined style={{ color: "#13c2c2", marginRight: 8 }} />
              Tỷ lệ hoàn thành cuộc hẹn
            </Title>
            <Divider />
            <Progress
              type="dashboard"
              percent={stats.completionRate}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              format={(percent) => `${percent}%`}
            />
            <Text type="secondary" style={{ display: "block", marginTop: 16, textAlign: "center" }}>
              Tổng số cuộc hẹn đã hoàn thành
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Detailed Report Table */}
      <Card className="shadow-card">
        <Title level={4}>
          <BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />
          Bảng thống kê chi tiết
        </Title>
        <Table
          columns={reportColumns}
          dataSource={reportTableData}
          pagination={false}
          size="large"
          className="report-table"
        />
      </Card>
    </div>
  );
};

export default AdminReports;
