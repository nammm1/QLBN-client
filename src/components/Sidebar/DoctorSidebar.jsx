import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Space,
  Divider,
  Button,
  Badge,
  Tooltip
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  MessageOutlined,
  ScheduleOutlined,
  UserOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  WechatOutlined
} from "@ant-design/icons";
import apiChat from "../../api/Chat";
import medicalChatService from "../../api/MedicalChat";
import apiCuocHenKham from "../../api/CuocHenKhamBenh";

const { Sider } = Layout;
const { Text, Title } = Typography;

const DoctorSidebar = ({ collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatBadge, setChatBadge] = useState(0);
  const [appointmentsBadge, setAppointmentsBadge] = useState(0);

  const menuItems = useMemo(() => [
    { 
      key: "/doctor", 
      label: "Tổng quan", 
      icon: <DashboardOutlined />,
      path: "/doctor",
    },
    { 
      key: "/doctor/appointments", 
      label: "Lịch hẹn khám", 
      icon: <CalendarOutlined />,
      path: "/doctor/appointments",
      badge: appointmentsBadge > 0 ? appointmentsBadge : undefined,
    },
    { 
      key: "/doctor/records", 
      label: "Hồ sơ bệnh án", 
      icon: <FolderOpenOutlined />,
      path: "/doctor/records"
    },
    { 
      key: "/doctor/chat", 
      label: "Chat", 
      icon: <WechatOutlined />,
      path: "/doctor/chat",
      badge: chatBadge > 0 ? chatBadge : undefined,
    },
    { 
      key: "/doctor/work-schedule", 
      label: "Lịch làm việc", 
      icon: <ScheduleOutlined />,
      path: "/doctor/work-schedule"
    },
  ], [chatBadge, appointmentsBadge]);

  const bottomMenuItems = [
    { 
      key: "/doctor/profile", 
      label: "Hồ sơ cá nhân", 
      icon: <UserOutlined />,
      path: "/doctor/profile"
    }
  ];

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'BS';
  };

  // Fetch badge counts
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Fetch chat unread messages
        try {
          const chatRes = await apiChat.getConversations();
          if (chatRes?.success && chatRes?.data) {
            const totalUnread = chatRes.data.reduce((sum, conv) => {
              return sum + (conv.so_tin_nhan_chua_doc || 0);
            }, 0);
            setChatBadge(totalUnread);
          }
        } catch (err) {
          console.error("Error fetching chat badge:", err);
        }

        // Fetch pending appointments
        if (userInfo?.user?.id_nguoi_dung) {
          try {
            const appointments = await apiCuocHenKham.getByBacSi(userInfo.user.id_nguoi_dung);
            const pendingCount = Array.isArray(appointments) 
              ? appointments.filter(apt => apt.trang_thai === "da_dat").length
              : 0;
            setAppointmentsBadge(pendingCount);
          } catch (err) {
            console.error("Error fetching appointments badge:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
    // Refresh badges every 30 seconds
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sider
      width={collapsed ? 80 : 300}
      collapsed={collapsed}
      collapsedWidth={80}
      style={{
        background: 'linear-gradient(180deg, #27408B 100%)',
        boxShadow: '8px 0 32px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
      }}
      theme="dark"
    >
      {/* Header với gradient đẹp */}
      <div style={{ 
        padding: collapsed ? '24px 12px' : '32px 24px 20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        transition: 'padding 0.2s ease'
      }}>
        <Space 
          direction="vertical" 
          size="middle" 
          style={{ 
            width: '100%', 
            textAlign: collapsed ? 'center' : 'center' 
          }}
        >
          <Badge 
            dot 
            color="#10b981"
            offset={[-5, 60]}
            size="default"
          >
            <Avatar 
              size={collapsed ? 50 : 80} 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '4px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                fontSize: collapsed ? '16px' : '24px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              {getInitials(userInfo?.user?.anh_dai_dien)}
            </Avatar>
          </Badge>
          
          {!collapsed && (
            <div>
              <Title 
                level={4} 
                style={{ 
                  color: '#fff', 
                  margin: 0,
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {userInfo?.user?.ho_ten || 'Bác sĩ'}
              </Title>
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                👨‍⚕️ Bác sĩ chuyên khoa
              </Text>
              
              {/* Thông tin thêm
              <div style={{ 
                marginTop: '8px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
                  🏥 Phòng khám đa khoa
                </Text>
              </div> */}
            </div>
          )}
        </Space>
      </div>

      {/* Navigation Menu chính */}
      <div style={{ 
        padding: '20px 16px',
        flex: 1,
        overflowY: 'auto',
        height: 'calc(100vh - 280px)'
      }}>
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: collapsed ? (
              <Tooltip title={item.label} placement="right">
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: location.pathname === item.key 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: location.pathname === item.key 
                    ? '1px solid rgba(255,255,255,0.3)' 
                    : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </div>
              </Tooltip>
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: location.pathname === item.key 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                border: location.pathname === item.key 
                  ? '1px solid rgba(255,255,255,0.3)' 
                  : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }}>
                {item.icon}
              </div>
            ),
            label: (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <span style={{ flex: 1 }}>
                  {item.label}
                </span>
                {item.badge && !collapsed && (
                  <Badge 
                    count={item.badge} 
                    style={{ 
                      backgroundColor: '#ef4444',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }} 
                    size="small"
                  />
                )}
              </div>
            ),
            onClick: () => navigate(item.path),
            style: {
              marginBottom: '8px',
              borderRadius: '12px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              fontWeight: location.pathname === item.key ? '600' : '400',
              backgroundColor: location.pathname === item.key 
                ? 'rgba(255,255,255,0.15)' 
                : 'transparent',
              border: location.pathname === item.key 
                ? '1px solid rgba(255,255,255,0.3)' 
                : '1px solid transparent',
              color: location.pathname === item.key ? '#fff' : 'rgba(255,255,255,0.85)',
              transition: 'all 0.3s ease',
              padding: '0 16px'
            }
          }))}
        />

        <Divider style={{ 
          background: 'rgba(255,255,255,0.1)', 
          margin: '24px 0 16px',
          borderColor: 'rgba(255,255,255,0.1)'
        }} />

        {/* Menu phụ */}
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          items={bottomMenuItems.map(item => ({
            key: item.key,
            icon: collapsed ? (
              <Tooltip title={item.label} placement="right">
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: location.pathname === item.key 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </div>
              </Tooltip>
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: location.pathname === item.key 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                transition: 'all 0.3s ease'
              }}>
                {item.icon}
              </div>
            ),
            label: item.label,
            onClick: () => navigate(item.path),
            style: {
              marginBottom: '4px',
              borderRadius: '8px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              fontWeight: location.pathname === item.key ? '600' : '400',
              backgroundColor: location.pathname === item.key 
                ? 'rgba(255,255,255,0.1)' 
                : 'transparent',
              color: location.pathname === item.key ? '#fff' : 'rgba(255,255,255,0.75)',
              transition: 'all 0.3s ease',
            }
          }))}
        />
      </div>

      {/* Footer với logout button */}
      <div style={{ 
        padding: collapsed ? '16px 8px' : '20px 16px', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.1)',
        transition: 'padding 0.2s ease'
      }}>
        <Tooltip title={collapsed ? "Đăng xuất khỏi hệ thống" : ""} placement="top">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            block={!collapsed}
            style={{
              height: collapsed ? '40px' : '48px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: collapsed ? '100%' : 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onClick={() => {
              // Clear all chat data before logging out
              medicalChatService.clearAllChatData();
              localStorage.removeItem("userInfo");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("isLogin");
              window.location.href = "/login";
            }}
          >
            {!collapsed && 'Đăng xuất'}
          </Button>
        </Tooltip>
        
        {/* Version info */}
        {!collapsed && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '12px',
            padding: '8px'
          }}>
            <Text style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '11px',
              fontWeight: 500
            }}>
              Phiên bản 2.1.0 • MEDPRO
            </Text>
          </div>
        )}
      </div>

      {/* Custom styling */}
      <style>
        {`
          .ant-layout-sider-children {
            display: flex;
            flex-direction: column;
          }
          
          .ant-menu-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          .ant-menu-item:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            transform: translateX(4px);
          }
          
          .ant-menu-item-selected {
            background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%) !important;
            color: #ffffff !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            font-weight: 600 !important;
            backdrop-filter: blur(10px);
          }
          
          .ant-menu-item-selected a {
            color: #ffffff !important;
            font-weight: 600 !important;
          }
          
          .ant-menu-item a {
            color: rgba(255, 255, 255, 0.85);
            transition: color 0.2s ease;
          }
          
          .ant-menu-item .anticon {
            font-size: 16px;
          }
          
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 4px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 2px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.3);
          }
        `}
      </style>
    </Sider>
  );
};

export default DoctorSidebar;