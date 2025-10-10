import React, { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Progress, 
  DatePicker,
  Select,
  Space,
  Typography,
  Avatar,
  Button
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  MessageOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  StarFilled
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Line, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const DoctorReports = () => {
  const [dateRange, setDateRange] = useState([]);
  const [reportType, setReportType] = useState("monthly");

  // Dữ liệu thống kê
  const statsData = [
    {
      title: "Tổng Bệnh Nhân",
      value: 124,
      prefix: <UserOutlined />,
      valueStyle: { color: '#1890ff' },
      change: +12.5,
      suffix: "bệnh nhân"
    },
    {
      title: "Tư Vấn Online",
      value: 89,
      prefix: <MessageOutlined />,
      valueStyle: { color: '#52c41a' },
      change: +8.3,
      suffix: "cuộc tư vấn"
    },
    {
      title: "Lịch Hẹn",
      value: 67,
      prefix: <CalendarOutlined />,
      valueStyle: { color: '#fa8c16' },
      change: -2.1,
      suffix: "lịch hẹn"
    },
    {
      title: "Doanh Thu",
      value: 28450000,
      prefix: <DollarOutlined />,
      valueStyle: { color: '#eb2f96' },
      change: +15.7,
      suffix: "VND",
      precision: 0
    }
  ];

  // Dữ liệu biểu đồ tư vấn theo tháng
  const consultationData = [
    { month: 'Tháng 1', tư_vấn: 65, lịch_hẹn: 45, doanh_thu: 22000000 },
    { month: 'Tháng 2', tư_vấn: 78, lịch_hẹn: 52, doanh_thu: 24500000 },
    { month: 'Tháng 3', tư_vấn: 89, lịch_hẹn: 67, doanh_thu: 28450000 },
    { month: 'Tháng 4', tư_vấn: 76, lịch_hẹn: 58, doanh_thu: 25600000 },
    { month: 'Tháng 5', tư_vấn: 94, lịch_hẹn: 71, doanh_thu: 31200000 },
    { month: 'Tháng 6', tư_vấn: 102, lịch_hẹn: 78, doanh_thu: 34500000 },
  ];

  // Dữ liệu loại tư vấn
  const consultationTypeData = [
    { name: 'Tư vấn cấp tính', value: 35 },
    { name: 'Theo dõi mãn tính', value: 25 },
    { name: 'Tư vấn thuốc', value: 20 },
    { name: 'Xét nghiệm', value: 15 },
    { name: 'Khác', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Dữ liệu bệnh nhân hàng đầu
  const topPatients = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "NA",
      consultations: 12,
      lastVisit: "15/06/2024",
      status: "active",
      rating: 4.8
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "TB",
      consultations: 8,
      lastVisit: "12/06/2024",
      status: "active",
      rating: 4.9
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "LC",
      consultations: 6,
      lastVisit: "10/06/2024",
      status: "completed",
      rating: 4.7
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar: "PD",
      consultations: 5,
      lastVisit: "08/06/2024",
      status: "active",
      rating: 4.6
    }
  ];

  // Columns cho bảng
  const columns = [
    {
      title: 'Bệnh Nhân',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {record.avatar}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Số Lần Tư Vấn',
      dataIndex: 'consultations',
      key: 'consultations',
      render: (value) => (
        <Tag color="blue">{value} lần</Tag>
      )
    },
    {
      title: 'Lần Cuối',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <StarFilled style={{ color: '#fadb14' }} />
          <Text>{rating}/5.0</Text>
        </Space>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'blue'}>
          {status === 'active' ? 'Đang điều trị' : 'Hoàn thành'}
        </Tag>
      )
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} size="small">
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            📊 Báo Cáo & Thống Kê
          </Title>
          <Text type="secondary">Theo dõi hiệu suất và hoạt động tư vấn của bạn</Text>
        </Space>
      </div>

      {/* Bộ lọc */}
      <Card 
        style={{ marginBottom: 24, borderRadius: 12 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Thời gian:</Text>
          </Col>
          <Col>
            <RangePicker 
              style={{ width: 250 }}
              onChange={setDateRange}
            />
          </Col>
          <Col>
            <Text strong>Loại báo cáo:</Text>
          </Col>
          <Col>
            <Select 
              value={reportType}
              onChange={setReportType}
              style={{ width: 120 }}
            >
              <Option value="daily">Hàng ngày</Option>
              <Option value="weekly">Hàng tuần</Option>
              <Option value="monthly">Hàng tháng</Option>
              <Option value="quarterly">Hàng quý</Option>
            </Select>
          </Col>
          <Col flex="auto">
            <Space style={{ float: 'right' }}>
              <Button icon={<FilterOutlined />}>
                Lọc Nâng Cao
              </Button>
              <Button type="primary" icon={<DownloadOutlined />}>
                Xuất Báo Cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Thống kê chính */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle}
                precision={stat.precision || 0}
              />
              <div style={{ marginTop: 8 }}>
                <Text 
                  type={stat.change >= 0 ? "success" : "danger"}
                  style={{ fontSize: 12 }}
                >
                  {stat.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stat.change)}% so với kỳ trước
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Biểu đồ chính */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Xu Hướng Tư Vấn & Doanh Thu"
            style={{ borderRadius: 12, height: '100%' }}
            extra={
              <Text type="secondary">6 tháng gần nhất</Text>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consultationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip 
                  formatter={(value, name) => {
                    if (name === 'doanh_thu') {
                      return [`${value.toLocaleString()} VND`, 'Doanh Thu'];
                    }
                    return [value, name === 'tư_vấn' ? 'Tư Vấn' : 'Lịch Hẹn'];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="tư_vấn" fill="#8884d8" name="Số lượt tư vấn" />
                <Bar yAxisId="left" dataKey="lịch_hẹn" fill="#82ca9d" name="Số lịch hẹn" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="doanh_thu" 
                  stroke="#ff7300" 
                  name="Doanh thu"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Phân Loại Tư Vấn"
            style={{ borderRadius: 12, height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consultationTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {consultationTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} lượt`, 'Số lượng']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bảng và thống kê phụ */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Bệnh Nhân Thường Xuyên"
            style={{ borderRadius: 12 }}
            extra={
              <Button type="link">Xem tất cả</Button>
            }
          >
            <Table 
              columns={columns} 
              dataSource={topPatients} 
              pagination={false}
              size="middle"
              rowKey="id"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Hiệu Suất Tư Vấn"
            style={{ borderRadius: 12 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Tỷ lệ phản hồi</Text>
                  <Text strong>92%</Text>
                </div>
                <Progress percent={92} strokeColor="#52c41a" />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Độ hài lòng</Text>
                  <Text strong>94%</Text>
                </div>
                <Progress percent={94} strokeColor="#1890ff" />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Thời gian phản hồi TB</Text>
                  <Text strong>15 phút</Text>
                </div>
                <Progress percent={85} strokeColor="#fa8c16" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Tỷ lệ hoàn thành</Text>
                  <Text strong>88%</Text>
                </div>
                <Progress percent={88} strokeColor="#eb2f96" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorReports;