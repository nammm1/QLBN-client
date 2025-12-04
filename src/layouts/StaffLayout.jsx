import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button, Space, Drawer } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import StaffSidebar from "../components/Sidebar/StaffSidebar";
import NotificationDropdown from "../components/Notification/NotificationDropdown";
import useMedia from "../hooks/useMedia";

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const isMobile = useMedia("(max-width: 768px)");

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerVisible(!mobileDrawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileDrawer = () => {
    setMobileDrawerVisible(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Sidebar - Desktop */}
      {!isMobile && <StaffSidebar collapsed={collapsed} />}

      {/* Sidebar - Mobile Drawer */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          onClose={closeMobileDrawer}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0 }}
          width={280}
          zIndex={1001}
        >
          <StaffSidebar collapsed={false} onNavigate={closeMobileDrawer} />
        </Drawer>
      )}

      {/* Nội dung chính */}
      <div
        style={{
          flexGrow: 1,
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 300),
          padding: isMobile ? "16px" : "24px",
          backgroundColor: "#f5f6fa",
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {/* Top bar với toggle và notification */}
        <div
          style={{
            position: isMobile ? "sticky" : "fixed",
            top: isMobile ? 0 : "16px",
            left: isMobile ? 0 : (collapsed ? "88px" : "316px"),
            right: isMobile ? 0 : "24px",
            zIndex: 999,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "left 0.2s ease",
            padding: isMobile ? "12px 16px" : "0",
            backgroundColor: isMobile ? "#fff" : "transparent",
            boxShadow: isMobile ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            marginBottom: isMobile ? "16px" : 0,
          }}
        >
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={toggleSidebar}
            style={{
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isMobile ? "transparent" : "#fff",
              boxShadow: isMobile ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            title={isMobile ? "Mở menu" : (collapsed ? "Mở sidebar" : "Đóng sidebar")}
          />
          
          <Space>
            {(() => {
              const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
              const userId = userInfo?.user?.id_nguoi_dung;
              return userId ? <NotificationDropdown userId={userId} /> : null;
            })()}
          </Space>
        </div>

        <div style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', marginTop: isMobile ? '0' : '64px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;

