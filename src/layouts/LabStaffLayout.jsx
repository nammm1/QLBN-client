import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button, Space } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import LabStaffSidebar from "../components/Sidebar/LabStaffSidebar";
import NotificationDropdown from "../components/Notification/NotificationDropdown";

const LabStaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", position: "relative" }}>
      <LabStaffSidebar collapsed={collapsed} />
      <div
        style={{
          marginLeft: collapsed ? 80 : 280,
          padding: "30px",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          transition: "margin-left 0.2s ease",
        }}
      >
        {/* Top bar với toggle và notification */}
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: collapsed ? "88px" : "296px",
            right: "30px",
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

export default LabStaffLayout;

