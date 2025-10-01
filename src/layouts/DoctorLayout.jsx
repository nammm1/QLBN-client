import React from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/Sidebar/DoctorSidebar";

const DoctorLayout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Nội dung */}
      <div className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorLayout;
