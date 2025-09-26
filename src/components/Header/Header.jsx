import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import BookingModal from "./BookingModal"; // import modal đặt lịch khám
import NutritionBookingModal from "./NutritionBookingModal"; // import modal tư vấn dinh dưỡng

const Header = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <header>
      {/* Top bar */}
      <div className="container-fluid bg-white py-2 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {/* Logo */}
            <Link
              to="/"
              className="btn btn-info fw-bold text-white"
              style={{
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              LOGO
            </Link>

            {/* Search */}
            <input
              type="text"
              className="form-control ms-2"
              placeholder="🔍  Search"
              style={{ height: "40px", width: "400px" }}
            />
          </div>

          {/* Buttons bên phải */}
          <div className="d-flex gap-2">
            <button className="btn btn-info text-white">👤 Đăng Ký</button>
            <button className="btn btn-info text-white" onClick={handleLoginClick}>
              👤 Đăng nhập
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg" style={{ background: "#00B5F1" }}>
        <div className="container">
          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/">
                  Trang chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/about">
                  Giới thiệu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/news">
                  Tin tức
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/specialties">
                  Chuyên khoa
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/doctors">
                  Bác sĩ
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/nutritionist">
                  Chuyên gia dinh dưỡng
                </Link>
              </li>
              <li className="nav-item">
                <span
                  className="nav-link text-white fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowNutritionModal(true)}
                >
                  Đặt lịch tư vấn dinh dưỡng
                </span>
              </li>
              <li className="nav-item">
                <span
                  className="nav-link text-white fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowModal(true)}
                >
                  Đặt lịch khám
                </span>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-bold" to="/patient-function">
                  Dành cho Bệnh nhân
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modal đặt lịch khám */}
      <BookingModal show={showModal} onClose={() => setShowModal(false)} />

      {/* Modal đặt lịch tư vấn dinh dưỡng */}
      <NutritionBookingModal
        show={showNutritionModal}
        onClose={() => setShowNutritionModal(false)}
      />
    </header>
  );
};

export default Header;
