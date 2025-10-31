import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Input,
  Button,
  Dropdown,
  Space,
  Avatar,
  Drawer,
  Typography,
  Divider,
} from "antd";
import {
  HomeOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  TeamOutlined,
  AppleOutlined,
  CalendarOutlined,
  LoginOutlined,
  UserAddOutlined,
  MenuOutlined,
  SearchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import BookingModal from "./BookingModal";
import NutritionBookingModal from "./NutritionBookingModal";
import "./Header.css";

const { Header: AntHeader } = Layout;
const { Search: SearchInput } = Input;
const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus === "true") {
      setIsLogin(true);
      const savedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
      setUserInfo(savedUser?.user);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    setMobileMenuVisible(false);
  };

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "/about",
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">Giới thiệu</Link>,
    },
    {
      key: "/news",
      icon: <FileTextOutlined />,
      label: <Link to="/news">Tin tức</Link>,
    },
    {
      key: "/specialties",
      icon: <MedicineBoxOutlined />,
      label: <Link to="/specialties">Chuyên khoa</Link>,
    },
    {
      key: "/doctors",
      icon: <UserOutlined />,
      label: <Link to="/doctors">Bác sĩ</Link>,
    },
    {
      key: "/nutritionist",
      icon: <AppleOutlined />,
      label: <Link to="/nutritionist">Chuyên gia dinh dưỡng</Link>,
    },
    {
      key: "booking",
      icon: <CalendarOutlined />,
      label: "Đặt lịch",
      children: [
        {
          key: "booking-exam",
          label: (
            <span onClick={() => setShowBookingModal(true)}>Đặt lịch khám</span>
          ),
        },
        {
          key: "booking-nutrition",
          label: (
            <span onClick={() => setShowNutritionModal(true)}>
              Đặt lịch tư vấn dinh dưỡng
            </span>
          ),
        },
      ],
    },
    {
      key: "/patient-function",
      icon: <TeamOutlined />,
      label: <Link to="/patient-function">Dành cho Bệnh nhân</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <Link to="/updateprofile" onClick={() => setMobileMenuVisible(false)}>
          Thông tin cá nhân
        </Link>
      ),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      danger: true,
    },
  ];

  const currentPath = location.pathname;

  return (
    <>
      <AntHeader
        className="modern-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          padding: "0 24px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          height: 72,
          lineHeight: "72px",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              marginRight: 32,
              flexShrink: 0,
            }}
          >
            <div className="logo-container">
              <span className="logo-text">HOSPITAL</span>
              <span className="logo-text-care">CARE</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
            <Menu
              mode="horizontal"
              selectedKeys={[currentPath]}
              items={menuItems}
              style={{
                flex: 1,
                borderBottom: "none",
                minWidth: 0,
                fontSize: 14,
                background: "transparent",
              }}
              className="header-menu"
            />
          </div>

          {/* Right Side Actions */}
          <Space size="small" style={{ marginLeft: 16, flexShrink: 0 }}>
            {/* Search */}
            <div className="header-search" style={{ display: isMobile ? "none" : "block",display: "flex", alignItems: "center", height: "100%" }}>
              <SearchInput
                placeholder="Tìm kiếm..."
                allowClear
                style={{ width: 220 }}
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                className="modern-search"
              />
            </div>

            {/* User Actions */}
            {!isLogin ? (
              <Space>
                <Button
                  icon={<UserAddOutlined />}
                  onClick={handleLoginClick}
                  style={{ borderColor: "#096dd9", color: "#096dd9" }}
                >
                  Đăng ký
                </Button>
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={handleLoginClick}
                  style={{
                    background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                    border: "none",
                  }}
                >
                  Đăng nhập
                </Button>
              </Space>
            ) : (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Space
                  style={{
                    cursor: "pointer",
                    padding: "4px 12px",
                    borderRadius: 8,
                    transition: "all 0.3s",
                  }}
                  className="user-dropdown"
                >
                  <Avatar
                    style={{
                      background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                    }}
                    icon={<UserOutlined />}
                  />
                  <Text strong>{userInfo?.ho_ten || "Người dùng"}</Text>
                </Space>
              </Dropdown>
            )}

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-btn"
              style={{ fontSize: 20 }}
            />
          </Space>
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                padding: "8px 16px",
                borderRadius: 8,
                color: "white",
                fontWeight: "bold",
              }}
            >
              HOSPITAL CARE
            </div>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <SearchInput
            placeholder="Tìm kiếm..."
            allowClear
            style={{ width: "100%" }}
            prefix={<SearchOutlined />}
          />

          <Divider style={{ margin: "8px 0" }} />

          <Menu
            mode="vertical"
            selectedKeys={[currentPath]}
            items={menuItems
              .filter((item) => item.key !== "booking")
              .map((item) => ({
                ...item,
                label: (
                  <span onClick={() => setMobileMenuVisible(false)}>{item.label}</span>
                ),
              }))}
            style={{ border: "none" }}
          />
          
          {/* Mobile Booking Options */}
          <div style={{ padding: "8px 0" }}>
            <Button
              block
              icon={<CalendarOutlined />}
              onClick={() => {
                setShowBookingModal(true);
                setMobileMenuVisible(false);
              }}
              style={{ marginBottom: 8 }}
            >
              Đặt lịch khám
            </Button>
            <Button
              block
              icon={<CalendarOutlined />}
              onClick={() => {
                setShowNutritionModal(true);
                setMobileMenuVisible(false);
              }}
            >
              Đặt lịch tư vấn dinh dưỡng
            </Button>
          </div>

          <Divider style={{ margin: "8px 0" }} />

          {isLogin ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ padding: "8px 0" }}>
                <Space>
                  <Avatar
                    style={{
                      background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                    }}
                    icon={<UserOutlined />}
                  />
                  <Text strong>{userInfo?.ho_ten || "Người dùng"}</Text>
                </Space>
              </div>
              <Button
                block
                icon={<UserOutlined />}
                onClick={() => {
                  navigate("/updateprofile");
                  setMobileMenuVisible(false);
                }}
              >
                Thông tin cá nhân
              </Button>
              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                block
                icon={<UserAddOutlined />}
                onClick={() => {
                  handleLoginClick();
                  setMobileMenuVisible(false);
                }}
              >
                Đăng ký
              </Button>
              <Button
                block
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => {
                  handleLoginClick();
                  setMobileMenuVisible(false);
                }}
                style={{
                  background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                  border: "none",
                }}
              >
                Đăng nhập
              </Button>
            </Space>
          )}
        </Space>
      </Drawer>

      {/* Booking Modals */}
      <BookingModal show={showBookingModal} onClose={() => setShowBookingModal(false)} />
      <NutritionBookingModal
        show={showNutritionModal}
        onClose={() => setShowNutritionModal(false)}
      />
    </>
  );
};

export default Header;
