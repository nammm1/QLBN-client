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
  const [revenueStats, setRevenueStats] = useState({
    rangeStart: null,
    rangeEnd: null,
    revenueToday: 0,
    monthlyRevenue: 0,
    revenueByPaymentMethod: {},
    revenueByInvoiceType: {},
  });
  const [appointmentStats, setAppointmentStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    completionRate: 0,
    byStatus: {},
    byType: { kham: 0, tu_van: 0 },
  });
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format("YYYY-MM-DD");
        params.end_date = dateRange[1].format("YYYY-MM-DD");
      }
      const response = await DashboardAPI.getAdminDashboard(params);
      if (response.success && response.data) {
        setStats(response.data.stats || stats);
        if (response.data.revenueStats) {
          setRevenueStats(response.data.revenueStats);
        }
        if (response.data.appointmentStats) {
          setAppointmentStats(response.data.appointmentStats);
        }
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

  const paymentMethodRows = Object.entries(
    revenueStats.revenueByPaymentMethod || {}
  ).map(([method, value]) => ({
    key: method,
    method,
    value,
  }));

  const invoiceTypeRows = Object.entries(
    revenueStats.revenueByInvoiceType || {}
  ).map(([type, value]) => ({
    key: type,
    type,
    value,
  }));

  const appointmentStatusRows = Object.entries(
    appointmentStats.byStatus || {}
  ).map(([status, value]) => ({
    key: status,
    status,
    value,
  }));

  const mapPaymentMethodLabel = (method) => {
    const map = {
      tien_mat: "Tiền mặt",
      chuyen_khoan: "Chuyển khoản",
      the: "Thẻ",
      vi_dien_tu: "Ví điện tử",
      momo: "Momo",
      vnpay: "VNPay",
      khac: "Khác",
      null: "Không xác định",
    };
    return map[method] || method || "Không xác định";
  };

  const mapInvoiceTypeLabel = (type) => {
    const map = {
      dich_vu: "Dịch vụ",
      dat_coc: "Đặt cọc",
      hoan_dat_coc: "Hoàn đặt cọc",
    };
    return map[type] || type || "Khác";
  };

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
                value={dateRange}
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
              Doanh thu trong khoảng thời gian
            </Title>
            <Divider />
            <Statistic
              value={revenueStats.monthlyRevenue || stats.monthlyRevenue}
              prefix={<DollarCircleOutlined />}
              suffix="đ"
              valueStyle={{ fontSize: "36px", fontWeight: "bold", color: "#9b59b6" }}
            />
            <Progress
              percent={Math.min(
                ((revenueStats.monthlyRevenue || stats.monthlyRevenue) / 100000000) *
                  100,
                100
              )}
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
              percent={appointmentStats.completionRate || stats.completionRate}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              format={(percent) => `${percent}%`}
            />
            <Text type="secondary" style={{ display: "block", marginTop: 16, textAlign: "center" }}>
              Tổng số cuộc hẹn đã hoàn thành
            </Text>
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <Text>Tổng cuộc hẹn trong khoảng:</Text>
              <Text strong>{appointmentStats.totalAppointments || 0}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Report Table */}
      <Card className="shadow-card">
        <Title level={4}>
          <BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />
          Bảng thống kê tổng quan
        </Title>
        <Table
          columns={reportColumns}
          dataSource={reportTableData}
          pagination={false}
          size="large"
          className="report-table"
        />
      </Card>

      {/* Revenue & Appointment breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="shadow-card" title="Doanh thu theo phương thức thanh toán">
            <Table
              size="small"
              pagination={false}
              dataSource={paymentMethodRows}
              rowKey="key"
              columns={[
                {
                  title: "Phương thức",
                  dataIndex: "method",
                  key: "method",
                  render: (m) => mapPaymentMethodLabel(m),
                },
                {
                  title: "Doanh thu",
                  dataIndex: "value",
                  key: "value",
                  render: (v) => formatCurrency(v),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="shadow-card" title="Doanh thu theo loại hóa đơn">
            <Table
              size="small"
              pagination={false}
              dataSource={invoiceTypeRows}
              rowKey="key"
              columns={[
                {
                  title: "Loại hóa đơn",
                  dataIndex: "type",
                  key: "type",
                  render: (t) => mapInvoiceTypeLabel(t),
                },
                {
                  title: "Doanh thu",
                  dataIndex: "value",
                  key: "value",
                  render: (v) => formatCurrency(v),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="shadow-card" title="Cuộc hẹn theo trạng thái (trong khoảng thời gian)">
            <Table
              size="small"
              pagination={false}
              dataSource={appointmentStatusRows}
              rowKey="key"
              columns={[
                { title: "Trạng thái", dataIndex: "status", key: "status" },
                { title: "Số lượng", dataIndex: "value", key: "value" },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="shadow-card" title="Cuộc hẹn theo loại (trong khoảng thời gian)">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Text strong>Khám bệnh</Text>
                <Text>{appointmentStats.byType?.kham || 0}</Text>
              </Space>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Text strong>Tư vấn dinh dưỡng</Text>
                <Text>{appointmentStats.byType?.tu_van || 0}</Text>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminReports;
