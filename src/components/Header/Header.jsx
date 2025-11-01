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
  CustomerServiceOutlined,
} from "@ant-design/icons";
import BookingModal from "./BookingModal";
import NutritionBookingModal from "./NutritionBookingModal";
import LoginRequiredModal from "../LoginRequiredModal/LoginRequiredModal";
import ProfileCompleteModal from "../ProfileCompleteModal/ProfileCompleteModal";
import apiBenhNhan from "../../api/BenhNhan";
import medicalChatService from "../../api/MedicalChat";
import "./Header.css";

const { Header: AntHeader } = Layout;
const { Search: SearchInput } = Input;
const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showProfileCompleteModal, setShowProfileCompleteModal] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState([]);
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

  // Kiểm tra profile chỉ 1 lần sau khi đăng nhập (chỉ cho benh_nhan)
  useEffect(() => {
    if (isLogin && userInfo?.vai_tro === "benh_nhan") {
      // Với benh_nhan, id_nguoi_dung chính là id_benh_nhan
      const benhNhanId = userInfo.id_benh_nhan || userInfo.id_nguoi_dung;
      if (benhNhanId) {
        const checkNeededKey = `profile_check_needed_${benhNhanId}`;
        const needsCheck = localStorage.getItem(checkNeededKey) === "true";
        
        console.log("Profile check - benhNhanId:", benhNhanId);
        console.log("Profile check - needsCheck:", needsCheck);
        console.log("Profile check - flag value:", localStorage.getItem(checkNeededKey));
        
        // Chỉ kiểm tra nếu có flag cần kiểm tra (đặt khi đăng nhập)
        if (needsCheck) {
          console.log("Profile check - Starting check...");
          checkProfileComplete(userInfo);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, userInfo?.id_nguoi_dung, userInfo?.id_benh_nhan]);

  const checkProfileComplete = async (user) => {
    // Chỉ kiểm tra nếu là bệnh nhân
    if (!user || user.vai_tro !== "benh_nhan") {
      return;
    }

    // Với benh_nhan, id_nguoi_dung chính là id_benh_nhan
    const benhNhanId = user.id_benh_nhan || user.id_nguoi_dung;
    if (!benhNhanId) {
      return;
    }

    const checkNeededKey = `profile_check_needed_${benhNhanId}`;
    
    try {
      const profileData = await apiBenhNhan.getById(benhNhanId);
      
      // Các trường cần kiểm tra
      const requiredFields = [
        'nghe_nghiep',
        'thong_tin_bao_hiem',
        'ten_nguoi_lien_he_khan_cap',
        'sdt_nguoi_lien_he_khan_cap',
        'tien_su_benh_ly',
        'tinh_trang_suc_khoe_hien_tai',
        'ma_BHYT'
      ];

      // Kiểm tra các trường thiếu
      const missing = requiredFields.filter(field => {
        const value = profileData[field];
        // Kiểm tra nếu giá trị null, undefined, hoặc chuỗi rỗng
        return !value || (typeof value === 'string' && value.trim() === '');
      });

      console.log("Profile check - Missing fields:", missing);
      console.log("Profile check - Profile data:", profileData);

      // Xóa flag sau khi đã kiểm tra xong (dù có thiếu hay không)
      localStorage.removeItem(checkNeededKey);

      if (missing.length > 0) {
        setMissingProfileFields(missing);
        setShowProfileCompleteModal(true);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra profile:", error);
      // Xóa flag ngay cả khi có lỗi để tránh kiểm tra lại
      localStorage.removeItem(checkNeededKey);
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const checkLoginAndShowModal = (callback) => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true") {
      setShowLoginRequiredModal(true);
      return;
    }
    callback();
  };

  const handleBookingClick = () => {
    checkLoginAndShowModal(() => {
      setShowBookingModal(true);
    });
  };

  const handleNutritionBookingClick = () => {
    checkLoginAndShowModal(() => {
      setShowNutritionModal(true);
    });
  };

  const handleLogout = () => {
    // Xóa flag profile check nếu là bệnh nhân
    if (userInfo?.vai_tro === "benh_nhan") {
      const benhNhanId = userInfo.id_benh_nhan || userInfo.id_nguoi_dung;
      if (benhNhanId) {
        localStorage.removeItem(`profile_check_needed_${benhNhanId}`);
      }
    }
    
    // Clear all chat data (medical chat + messaging chat)
    medicalChatService.clearAllChatData();
    
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
      key: "/services",
      icon: <CustomerServiceOutlined />,
      label: <Link to="/services">Dịch vụ</Link>,
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
            <span onClick={handleBookingClick}>Đặt lịch khám</span>
          ),
        },
        {
          key: "booking-nutrition",
          label: (
            <span onClick={handleNutritionBookingClick}>
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
                checkLoginAndShowModal(() => {
                  setShowBookingModal(true);
                  setMobileMenuVisible(false);
                });
              }}
              style={{ marginBottom: 8 }}
            >
              Đặt lịch khám
            </Button>
            <Button
              block
              icon={<CalendarOutlined />}
              onClick={() => {
                checkLoginAndShowModal(() => {
                  setShowNutritionModal(true);
                  setMobileMenuVisible(false);
                });
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
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginRequiredModal}
        onCancel={() => setShowLoginRequiredModal(false)}
      />
      
      {/* Profile Complete Modal */}
      <ProfileCompleteModal
        open={showProfileCompleteModal}
        onCancel={() => setShowProfileCompleteModal(false)}
        missingFields={missingProfileFields}
      />
    </>
  );
};

export default Header;
