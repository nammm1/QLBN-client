import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserAddOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  WechatOutlined,
  AppleOutlined,
} from "@ant-design/icons";
import { Menu, Avatar, Typography, Tooltip, Badge } from "antd";
import apiChat from "../../api/Chat";
import apiCuocHenKham from "../../api/CuocHenKhamBenh";
import medicalChatService from "../../api/MedicalChat";

const { Title, Text } = Typography;

const ReceptionistSidebar = ({ collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatBadge, setChatBadge] = useState(0);
  const [appointmentsBadge, setAppointmentsBadge] = useState(0);

  const menuItems = useMemo(() => [
    {
      key: "/receptionist",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      path: "/receptionist",
    },
    {
      key: "/receptionist/patients",
      icon: <UserAddOutlined />,
      label: "Quản lý bệnh nhân",
      path: "/receptionist/patients",
    },
    {
      key: "/receptionist/appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn khám",
      path: "/receptionist/appointments",
      badge: appointmentsBadge > 0 ? appointmentsBadge : undefined,
    },
    {
      key: "/receptionist/consultation-appointments",
      icon: <AppleOutlined />,
      label: "Lịch hẹn tư vấn",
      path: "/receptionist/consultation-appointments",
    },
    {
      key: "/receptionist/billing",
      icon: <DollarOutlined />,
      label: "Thu ngân",
      path: "/receptionist/billing",
    },
    {
      key: "/receptionist/work-schedule",
      icon: <ClockCircleOutlined />,
      label: "Lịch làm việc",
      path: "/receptionist/work-schedule",
    },
    {
      key: "/receptionist/chat",
      icon: <WechatOutlined />,
      label: "Chat",
      path: "/receptionist/chat",
      badge: chatBadge > 0 ? chatBadge : undefined,
    },
    {
      type: "divider",
    },
    {
      key: "/receptionist/profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
      path: "/receptionist/profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ], [chatBadge, appointmentsBadge]);

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
        try {
          const appointments = await apiCuocHenKham.getAll();
          const pendingCount = Array.isArray(appointments)
            ? appointments.filter(apt => apt.trang_thai === "da_dat" || apt.trang_thai === "cho_xac_nhan").length
            : 0;
          setAppointmentsBadge(pendingCount);
        } catch (err) {
          console.error("Error fetching appointments badge:", err);
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
    <div
      style={{
        width: collapsed ? 80 : 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        transition: "width 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: collapsed ? "20px 10px" : "30px 20px",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          transition: "padding 0.2s ease",
        }}
      >
        <Avatar
          size={collapsed ? 50 : 80}
          icon={<TeamOutlined />}
          style={{
            backgroundColor: "#fff",
            color: "#f39c12",
            marginBottom: collapsed ? "10px" : "15px",
            border: "4px solid rgba(255,255,255,0.3)",
            transition: "all 0.2s ease",
          }}
        />
        {!collapsed && (
          <>
            <Title
              level={4}
              style={{
                color: "#fff",
                margin: "10px 0 5px 0",
                fontWeight: 600,
              }}
            >
              Nhân viên Quầy
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>
              Receptionist Portal
            </Text>
          </>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflowY: "auto", padding: collapsed ? "20px 5px" : "20px 10px", transition: "padding 0.2s ease" }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => {
            if (item.type === "divider") return item;
            
            const menuItem = {
              key: item.key,
              icon: item.icon,
              label: item.badge && !collapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>{item.label}</span>
                  <Badge 
                    count={item.badge} 
                    style={{ 
                      backgroundColor: '#ef4444',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }} 
                    size="small"
                  />
                </div>
              ) : item.label,
              danger: item.danger,
            };
            
            if (item.key === "logout") {
              menuItem.onClick = () => {
                // Clear all chat data before logging out
                medicalChatService.clearAllChatData();
                localStorage.removeItem("userInfo");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("isLogin");
                window.location.href = "/login";
              };
            } else if (item.path) {
              menuItem.onClick = () => navigate(item.path);
            }
            
            return menuItem;
          })}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
          }}
          theme="dark"
          inlineCollapsed={collapsed}
        />
      </div>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
            © 2025 Hospital Management
          </Text>
        </div>
      )}
    </div>
  );
};

export default ReceptionistSidebar;

