import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button, Space } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import DoctorSidebar from "../components/Sidebar/DoctorSidebar";
import NotificationDropdown from "../components/Notification/NotificationDropdown";

const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Sidebar */}
      <DoctorSidebar collapsed={collapsed} />

      {/* Nội dung chính */}
      <div
        style={{
          flexGrow: 1,
          marginLeft: collapsed ? 80 : 300,
          padding: "24px",
          backgroundColor: "#f5f6fa",
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >
        {/* Top bar với toggle và notification */}
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: collapsed ? "88px" : "316px",
            right: "24px",
            zIndex: 999,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "left 0.2s ease",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            title={collapsed ? "Mở sidebar" : "Đóng sidebar"}
          />
          
          <Space>
            {(() => {
              const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
              const userId = userInfo?.user?.id_nguoi_dung;
              return userId ? <NotificationDropdown userId={userId} /> : null;
            })()}
          </Space>
        </div>

        <div style={{ fontSize: '1.05rem', marginTop: '64px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
