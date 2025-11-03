import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Space, Avatar, Badge, Spin, message } from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from "@ant-design/icons";
import DashboardAPI from "../../../api/Dashboard";

const { Title, Text } = Typography;

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingSchedules: 0,
    leaveRequests: 0,
    completedThisWeek: 0
  });
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardAPI.getStaffDashboard();
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Welcome Card */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          border: 'none'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <Badge dot color="#10b981" offset={[-5, 60]}>
              <Avatar 
                size={80} 
                style={{ 
                  background: 'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',
                  fontSize: '32px'
                }}
              >
                <UserOutlined />
              </Avatar>
            </Badge>
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                Xin chào, {userInfo?.user?.ho_ten || 'Nhân viên'}! 👋
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                Chào mừng bạn quay trở lại hệ thống quản lý phân công
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '14px' }}>Tổng nhân viên</Text>}
              value={stats.totalStaff}
              valueStyle={{ color: 'white', fontWeight: 700, fontSize: '32px' }}
              prefix={<TeamOutlined style={{ fontSize: '24px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '14px' }}>Lịch chờ phân công</Text>}
              value={stats.pendingSchedules}
              valueStyle={{ color: 'white', fontWeight: 700, fontSize: '32px' }}
              prefix={<CalendarOutlined style={{ fontSize: '24px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '14px' }}>Yêu cầu nghỉ phép</Text>}
              value={stats.leaveRequests}
              valueStyle={{ color: 'white', fontWeight: 700, fontSize: '32px' }}
              prefix={<ClockCircleOutlined style={{ fontSize: '24px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '14px' }}>Hoàn thành tuần này</Text>}
              value={stats.completedThisWeek}
              valueStyle={{ color: 'white', fontWeight: 700, fontSize: '32px' }}
              prefix={<CheckCircleOutlined style={{ fontSize: '24px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="🎯 Công việc hôm nay"
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text>Phân công lịch làm việc tuần tới</Text>
              <Text>Duyệt 3 đơn xin nghỉ phép</Text>
              <Text>Cập nhật thông tin nhân viên mới</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="📊 Thống kê nhanh"
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text>Tỷ lệ điền đầy lịch: <Text strong style={{ color: '#16a085' }}>85%</Text></Text>
              <Text>Nhân viên đang làm việc: <Text strong style={{ color: '#3498db' }}>42/45</Text></Text>
              <Text>Nghỉ phép hôm nay: <Text strong style={{ color: '#f39c12' }}>3</Text></Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard;

