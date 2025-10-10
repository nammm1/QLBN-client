import React from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/Sidebar/DoctorSidebar";

const DoctorLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar cố định */}
      <DoctorSidebar />

      {/* Nội dung chính */}
      <div
        style={{
          flexGrow: 1,
          marginLeft: 280,
          padding: "24px",
          backgroundColor: "#f5f6fa",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorLayout;
