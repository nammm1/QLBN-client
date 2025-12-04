import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import { Layout, Button, Drawer } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import useMedia from "../hooks/useMedia";
import "./AdminLayout.css";

const { Content } = Layout;

const AdminLayout = () => {
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const isMobile = useMedia("(max-width: 768px)");

  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerVisible(false);
  };

  return (
    <div className="admin-layout-container">
      {/* Sidebar - Desktop */}
      {!isMobile && <AdminSidebar />}

      {/* Sidebar - Mobile Drawer */}
      {isMobile && (
        <>
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={toggleMobileDrawer}
            style={{
              position: "fixed",
              top: "16px",
              left: "16px",
              zIndex: 1000,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "8px",
            }}
            title="Mở menu"
          />
          <Drawer
            title="Menu"
            placement="left"
            onClose={closeMobileDrawer}
            open={mobileDrawerVisible}
            bodyStyle={{ padding: 0 }}
            width={280}
            zIndex={1001}
          >
            <AdminSidebar onNavigate={closeMobileDrawer} />
          </Drawer>
        </>
      )}

      {/* Nội dung chính */}
      <Content className="admin-content">
        <Outlet />
      </Content>
    </div>
  );
};

export default AdminLayout;
