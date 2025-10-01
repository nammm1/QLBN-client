import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./DoctorSidebar.css";

const DoctorSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/doctor", label: "Trang tổng quan", icon: "bi bi-speedometer2" },
    { path: "/doctor/patients", label: "Bệnh nhân", icon: "bi bi-people" },
    { path: "/doctor/appointments", label: "Lịch hẹn", icon: "bi bi-calendar-check" },
    { path: "/doctor/records", label: "Hồ sơ bệnh án", icon: "bi bi-folder2" },
    { path: "/doctor/prescriptions", label: "Quản lý đơn thuốc", icon: "bi bi-capsule-pill" },
    { path: "/doctor/recheck", label: "Lịch tái khám", icon: "bi bi-calendar-event" },
    { path: "/doctor/consultations", label: "Tư vấn trực tuyến", icon: "bi bi-chat-dots" },
    { path: "/doctor/work-schedule", label: "Lịch làm việc", icon: "bi bi-clock-history" },
    { path: "/doctor/reports", label: "Báo cáo", icon: "bi bi-bar-chart" },
  ];

  return (
    <div
      className="bg-primary text-white vh-100 p-3 shadow"
      style={{ minWidth: "240px" }}
    >
      <h4 className="mb-4 text-center">👨‍⚕️ Bác sĩ</h4>
      <ul className="nav flex-column">
        {menuItems.map((item, index) => (
          <li className="nav-item mb-2" key={index}>
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center ${
                location.pathname === item.path ? "active-link" : "text-white"
              }`}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorSidebar;
