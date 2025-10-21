import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import BookingModal from "./BookingModal";
import NutritionBookingModal from "./NutritionBookingModal";

const Header = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus === "true") {
      setIsLogin(true);
      const savedUser = JSON.parse(localStorage.getItem("userInfo"));
      setUserInfo(savedUser?.user);
    }
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    setIsLogin(false);
    setUserInfo(null);
    navigate("/");
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
            {!isLogin ? (
              <>
                <button className="btn btn-info text-white">👤 Đăng Ký</button>
                <button
                  className="btn btn-info text-white"
                  onClick={handleLoginClick}
                >
                  👤 Đăng nhập
                </button>
              </>
            ) : (
              <div className="dropdown">
                <button
                  className="btn btn-info text-white dropdown-toggle"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  👤 {userInfo?.ho_ten || "Người dùng"}
                </button>
                <ul className="dropdown-menu" aria-labelledby="userMenuButton">
                  <li>
                    <Link className="dropdown-item" to="/UpdateProfile">
                      Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            )}
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
                <Link
                  className="nav-link text-white fw-bold"
                  to="/nutritionist"
                >
                  Chuyên gia dinh dưỡng
                </Link>
              </li>
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle text-white fw-bold"
                id="bookingDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: "pointer" }}
              >
                Đặt lịch
              </span>
              <ul className="dropdown-menu" aria-labelledby="bookingDropdown">
                <li>
                  <button className="dropdown-item" onClick={() => setShowModal(true)}>
                    Đặt lịch khám
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setShowNutritionModal(true)}
                  >
                    Đặt lịch tư vấn dinh dưỡng
                  </button>
                </li>
              </ul>
            </li>


              <li className="nav-item">
                <Link
                  className="nav-link text-white fw-bold"
                  to="/patient-function"
                >
                  Dành cho Bệnh nhân
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link text-white fw-bold"
                  to="/doctor-function"
                >
                  Dành cho Bác sĩ
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link
                  className="nav-link text-white fw-bold"
                  to="/admin-function"
                >
                  Admin
                </Link>
              </li> */}
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
