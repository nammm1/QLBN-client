import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import { Layout } from "antd";
import "./AdminLayout.css";

const { Content } = Layout;

const AdminLayout = () => {
  return (
    <div className="admin-layout-container">
      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Nội dung chính */}
      <Content className="admin-content">
        <Outlet />
      </Content>
    </div>
  );
};

export default AdminLayout;
