import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Space,
  Divider,
  Button 
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  MessageOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

const DoctorSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      key: "/doctor", 
      label: "Trang tổng quan", 
      icon: <DashboardOutlined />,
      path: "/doctor"
    },
    { 
      key: "/doctor/appointments", 
      label: "Lịch hẹn", 
      icon: <CalendarOutlined />,
      path: "/doctor/appointments"
    },
    { 
      key: "/doctor/records", 
      label: "Hồ sơ bệnh án", 
      icon: <FolderOpenOutlined />,
      path: "/doctor/records"
    },
    { 
      key: "/doctor/consultations", 
      label: "Tin nhắn", 
      icon: <MessageOutlined />,
      path: "/doctor/consultations"
    },
    { 
      key: "/doctor/work-schedule", 
      label: "Lịch làm việc", 
      icon: <ScheduleOutlined />,
      path: "/doctor/work-schedule"
    },
    { 
      key: "/doctor/reports", 
      label: "Báo cáo", 
      icon: <BarChartOutlined />,
      path: "/doctor/reports"
    },
    { 
      key: "/doctor/profile", 
      label: "Chỉnh sửa hồ sơ", 
      icon: <UserOutlined />,
      path: "/doctor/profile"
    },
  ];

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <Sider
      width={280}
      style={{
        background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      theme="dark"
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
        <Space direction="vertical" size="middle">
          <Avatar 
            size={64} 
            icon={<MedicineBoxOutlined />}
            style={{ 
              backgroundColor: '#fff',
              color: '#1890ff',
              border: '3px solid #fff',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
          <div>
            <Text 
              strong 
              style={{ 
                color: '#fff', 
                fontSize: '16px',
                display: 'block'
              }}
            >
              {userInfo?.user?.ho_ten || 'Bác sĩ'}
            </Text>
            <Text 
              style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '12px' 
              }}
            >
              Bác sĩ chuyên khoa
            </Text>
          </div>
        </Space>
      </div>

      <Divider style={{ background: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />

      {/* Navigation Menu */}
      <Menu
        mode="vertical"
        selectedKeys={[location.pathname]}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '8px 12px',
        }}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: (
            <Link 
              to={item.path} 
              style={{ 
                color: 'inherit',
                textDecoration: 'none'
              }}
            >
              {item.label}
            </Link>
          ),
          style: {
            marginBottom: '4px',
            borderRadius: '8px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: location.pathname === item.key ? '600' : '400',
            backgroundColor: location.pathname === item.key ? 'rgba(255,255,255,0.15)' : 'transparent',
            border: location.pathname === item.key ? '1px solid rgba(255,255,255,0.3)' : 'none',
          }
        }))}
      />

      {/* Logout Button */}
      <div style={{ padding: '20px', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          block
          style={{
            height: '44px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontWeight: '500',
          }}
          onClick={() => {
            // Handle logout logic here
            localStorage.removeItem("userInfo");
            window.location.href = "/login";
          }}
        >
          Đăng xuất
        </Button>
      </div>

      {/* Active indicator styling */}
      <style>
        {`
          .ant-menu-item-selected {
            background-color: rgba(255, 255, 255, 0.25) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
          }
        
          .ant-menu-item-selected a {
            color: #ffffff !important;
            font-weight: 600 !important;
          }
        
          .ant-menu-item:hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: #ffffff !important;
          }
        
          .ant-menu-item a {
            color: rgba(255, 255, 255, 0.95);
            transition: color 0.2s ease;
          }
        
          .ant-menu-item .anticon {
            font-size: 16px;
          }
        `}
      </style>

    </Sider>
  );
};

export default DoctorSidebar;