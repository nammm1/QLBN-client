import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import ReceptionistSidebar from "../components/Sidebar/ReceptionistSidebar";

const ReceptionistLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", position: "relative" }}>
      <ReceptionistSidebar collapsed={collapsed} />
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
        {/* Toggle button */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: "16px",
            left: collapsed ? "88px" : "296px",
            zIndex: 999,
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            transition: "left 0.2s ease",
            cursor: "pointer",
          }}
          title={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        />

        <div style={{ fontSize: '1.05rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ReceptionistLayout;

