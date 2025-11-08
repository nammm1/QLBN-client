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
  message,
  Spin,
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
  SafetyOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import BookingModal from "./BookingModal";
import NutritionBookingModal from "./NutritionBookingModal";
import LoginRequiredModal from "../LoginRequiredModal/LoginRequiredModal";
import ProfileCompleteModal from "../ProfileCompleteModal/ProfileCompleteModal";
import SearchDropdown from "./SearchDropdown";
import apiBenhNhan from "../../api/BenhNhan";
import apiBacSi from "../../api/BacSi";
import apiChuyenGiaDinhDuong from "../../api/ChuyenGiaDinhDuong";
import apiChuyenKhoa from "../../api/ChuyenKhoa";
import apiDichVu from "../../api/DichVu";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState({
    bac_si: [],
    chuyen_gia: [],
    chuyen_khoa: [],
    dich_vu: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userDropdownVisible, setUserDropdownVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Hàm để refresh userInfo từ localStorage
  const refreshUserInfo = () => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus === "true") {
      setIsLogin(true);
      const savedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
      setUserInfo(savedUser?.user);
    } else {
      setIsLogin(false);
      setUserInfo(null);
    }
  };

  useEffect(() => {
    refreshUserInfo();

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 1024);
    };
    window.addEventListener("resize", handleResize);
    
    // Lắng nghe sự kiện storage để cập nhật khi userInfo thay đổi (từ tab khác)
    const handleStorageChange = (e) => {
      if (e.key === "userInfo" || e.key === "isLogin") {
        refreshUserInfo();
      }
    };
    
    // Lắng nghe custom event để cập nhật khi userInfo thay đổi (trong cùng tab)
    const handleUserInfoUpdated = () => {
      refreshUserInfo();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userInfoUpdated", handleUserInfoUpdated);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userInfoUpdated", handleUserInfoUpdated);
    };
  }, []);

  // Refresh userInfo khi location thay đổi (để cập nhật sau khi upload ảnh)
  useEffect(() => {
    refreshUserInfo();
  }, [location.pathname]);

  // Kiểm tra profile chỉ 1 lần sau khi đăng nhập (chỉ cho benh_nhan)
  useEffect(() => {
    if (isLogin && userInfo?.vai_tro === "benh_nhan") {
      // Với benh_nhan, id_nguoi_dung chính là id_benh_nhan
      const benhNhanId = userInfo.id_benh_nhan || userInfo.id_nguoi_dung;
      if (benhNhanId) {
        const checkNeededKey = `profile_check_needed_${benhNhanId}`;
        const needsCheck = localStorage.getItem(checkNeededKey) === "true";
        
        // Chỉ kiểm tra nếu có flag cần kiểm tra (đặt khi đăng nhập)
        if (needsCheck) {
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

  const handleLogout = async () => {
    // Đóng dropdown menu trước
    setUserDropdownVisible(false);
    setMobileMenuVisible(false);
    
    // Bật loading
    setLogoutLoading(true);
    
    try {
      // Xóa flag profile check nếu là bệnh nhân
      if (userInfo?.vai_tro === "benh_nhan") {
        const benhNhanId = userInfo.id_benh_nhan || userInfo.id_nguoi_dung;
        if (benhNhanId) {
          localStorage.removeItem(`profile_check_needed_${benhNhanId}`);
        }
      }
      
      // Clear all chat data (medical chat + messaging chat)
      medicalChatService.clearAllChatData();
      
      // Clear localStorage
      localStorage.removeItem("isLogin");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      
      // Update state
      setIsLogin(false);
      setUserInfo(null);
      
      // Hiển thị thông báo đăng xuất thành công
      message.success("Đăng xuất thành công. Hẹn gặp lại! 👋", 2);
      
      // Đợi một chút để message hiển thị và loading đẹp hơn
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reload lại trang để đảm bảo tất cả state được reset
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutLoading(false);
      message.error("Có lỗi xảy ra khi đăng xuất");
    }
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
      key: "/privacy",
      icon: <SafetyOutlined />,
      label: <Link to="/privacy">Bảo mật</Link>,
    },
    {
      key: "/terms",
      icon: <FileTextOutlined />,
      label: <Link to="/terms">Điều khoản</Link>,
    },
    {
      key: "/faq",
      icon: <QuestionCircleOutlined />,
      label: <Link to="/faq">FAQ</Link>,
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
      key: "/nutritionists",
      icon: <AppleOutlined />,
      label: <Link to="/nutritionists">Chuyên gia dinh dưỡng</Link>,
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
      key: "chat",
      icon: <MessageOutlined />,
      label: (
        <Link to="/chat" onClick={() => setMobileMenuVisible(false)}>
          Tin nhắn
        </Link>
      ),
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: (
        <Link to="/notifications" onClick={() => setMobileMenuVisible(false)}>
          Thông báo
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

  // Debounce search function
  const searchTimeoutRef = React.useRef(null);

  const handleSearchChange = (value) => {
    setSearchValue(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchResults({
        bac_si: [],
        chuyen_gia: [],
        chuyen_khoa: [],
        dich_vu: [],
      });
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    setSearchLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const [bacSiRes, chuyenGiaRes, chuyenKhoaRes, dichVuRes] =
          await Promise.allSettled([
            apiBacSi.getAll({ search: value }),
            apiChuyenGiaDinhDuong.getAll({ search: value }),
            apiChuyenKhoa.getAll(),
            apiDichVu.getAll(),
          ]);

        const bacSi =
          bacSiRes.status === "fulfilled" ? bacSiRes.value || [] : [];
        const chuyenGia =
          chuyenGiaRes.status === "fulfilled" ? chuyenGiaRes.value || [] : [];
        const chuyenKhoa =
          chuyenKhoaRes.status === "fulfilled" ? chuyenKhoaRes.value || [] : [];
        const dichVu =
          dichVuRes.status === "fulfilled" ? dichVuRes.value?.data || [] : [];

        // Filter client-side cho chuyên khoa và dịch vụ
        const filteredChuyenKhoa = chuyenKhoa.filter(
          (item) =>
            item.ten_chuyen_khoa
              ?.toLowerCase()
              .includes(value.toLowerCase()) ||
            item.mo_ta?.toLowerCase().includes(value.toLowerCase())
        );

        const filteredDichVu = Array.isArray(dichVu)
          ? dichVu.filter(
              (item) =>
                item.ten_dich_vu
                  ?.toLowerCase()
                  .includes(value.toLowerCase()) ||
                item.mo_ta?.toLowerCase().includes(value.toLowerCase())
            )
          : [];

        // Filter client-side cho chuyên gia nếu API không hỗ trợ search
        const filteredChuyenGia = Array.isArray(chuyenGia)
          ? chuyenGia.filter(
              (item) =>
                item.ho_ten?.toLowerCase().includes(value.toLowerCase()) ||
                item.chuyen_nganh_dinh_duong
                  ?.toLowerCase()
                  .includes(value.toLowerCase())
            )
          : [];

        setSearchResults({
          bac_si: Array.isArray(bacSi) ? bacSi.slice(0, 3) : [],
          chuyen_gia: filteredChuyenGia.slice(0, 3),
          chuyen_khoa: filteredChuyenKhoa.slice(0, 3),
          dich_vu: filteredDichVu.slice(0, 3),
        });
      } catch (error) {
        console.error("Error searching:", error);
        setSearchResults({
          bac_si: [],
          chuyen_gia: [],
          chuyen_khoa: [],
          dich_vu: [],
        });
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (value) => {
    if (value.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleSearchFocus = () => {
    if (searchValue.trim()) {
      setShowSearchDropdown(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay để cho phép click vào dropdown
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 200);
  };

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <AntHeader
        className="modern-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          padding: windowWidth <= 768 ? "0 12px" : "0 24px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          height: windowWidth <= 768 ? 64 : 72,
          lineHeight: windowWidth <= 768 ? "64px" : "72px",
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
                marginRight: windowWidth <= 768 ? 12 : 32,
                flexShrink: 0,
              }}
            >
            <div className="logo-container">
              <span className="logo-text">HOSPITAL</span>
              <span className="logo-text-care">CARE</span>
            </div>
            </Link>

          {/* Desktop Menu */}
          <div 
            style={{ 
              flex: 1, 
              display: isMobile ? "none" : "flex", 
              alignItems: "center", 
              minWidth: 0 
            }}
          >
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
          <Space 
            size="small" 
            style={{ 
              marginLeft: windowWidth <= 768 ? 8 : 16, 
              flexShrink: 0 
            }}
          >
            {/* Search */}
            <div 
              className="header-search" 
              style={{ 
                display: isMobile ? "none" : "flex",
                position: "relative",
                alignItems: "center", 
                height: "100%" 
              }}
            >
              <SearchInput
                placeholder="Tìm kiếm..."
                allowClear
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onSearch={handleSearchSubmit}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                style={{ width: windowWidth <= 1200 ? 180 : 220 }}
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                className="modern-search"
              />
              <SearchDropdown
                results={searchResults}
                loading={searchLoading}
                visible={showSearchDropdown}
                onItemClick={() => setShowSearchDropdown(false)}
              />
            </div>

            {/* User Actions */}
            {!isMobile && (
              <>
                {!isLogin ? (
                  <Space size="small">
                    <Button
                      icon={<UserAddOutlined />}
                      onClick={handleLoginClick}
                      style={{ 
                        borderColor: "#096dd9", 
                        color: "#096dd9",
                        fontSize: windowWidth <= 1200 ? 12 : 14,
                        padding: windowWidth <= 1200 ? "4px 8px" : "4px 15px",
                        height: windowWidth <= 1200 ? 32 : 36
                      }}
                    >
                      {windowWidth <= 1200 ? "ĐK" : "Đăng ký"}
                    </Button>
                    <Button
                      type="primary"
                      icon={<LoginOutlined />}
                      onClick={handleLoginClick}
                      style={{
                        background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                        border: "none",
                        fontSize: windowWidth <= 1200 ? 12 : 14,
                        padding: windowWidth <= 1200 ? "4px 8px" : "4px 15px",
                        height: windowWidth <= 1200 ? 32 : 36
                      }}
                    >
                      {windowWidth <= 1200 ? "ĐN" : "Đăng nhập"}
                    </Button>
                  </Space>
                ) : (
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={["click"]}
                    open={userDropdownVisible}
                    onOpenChange={setUserDropdownVisible}
                  >
                    <Space
                      style={{
                        cursor: "pointer",
                        padding: windowWidth <= 1200 ? "4px 8px" : "4px 12px",
                        borderRadius: 8,
                        transition: "all 0.3s",
                      }}
                      className="user-dropdown"
                    >
                      <Avatar
                        size={windowWidth <= 1200 ? "small" : "default"}
                        src={userInfo?.anh_dai_dien}
                        style={{
                          background: userInfo?.anh_dai_dien 
                            ? "transparent" 
                            : "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                        }}
                        icon={!userInfo?.anh_dai_dien ? <UserOutlined /> : undefined}
                      />
                      {windowWidth > 1200 && (
                        <Text strong style={{ fontSize: 14 }}>
                          {userInfo?.ho_ten || "Người dùng"}
                        </Text>
                      )}
                    </Space>
                  </Dropdown>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-btn"
              style={{ 
                fontSize: windowWidth <= 768 ? 18 : 20,
                display: isMobile ? "block" : "none"
              }}
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
                padding: windowWidth <= 480 ? "6px 12px" : "8px 16px",
                borderRadius: 8,
                color: "white",
                fontWeight: "bold",
                fontSize: windowWidth <= 480 ? 14 : 16,
              }}
            >
              HOSPITAL CARE
            </div>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={windowWidth <= 480 ? 280 : 320}
        styles={{
          body: {
            padding: windowWidth <= 480 ? "16px" : "24px",
          }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <SearchInput
            placeholder="Tìm kiếm..."
            allowClear
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onSearch={handleSearchSubmit}
            style={{ width: "100%" }}
            prefix={<SearchOutlined />}
            size={windowWidth <= 480 ? "middle" : "large"}
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
                  <span 
                    onClick={() => setMobileMenuVisible(false)}
                    style={{ fontSize: windowWidth <= 480 ? 14 : 15 }}
                  >
                    {item.label}
                  </span>
                ),
              }))}
            style={{ 
              border: "none",
              fontSize: windowWidth <= 480 ? 14 : 15
            }}
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
              style={{ 
                marginBottom: 8,
                height: windowWidth <= 480 ? 40 : 44,
                fontSize: windowWidth <= 480 ? 14 : 15
              }}
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
              style={{ 
                height: windowWidth <= 480 ? 40 : 44,
                fontSize: windowWidth <= 480 ? 14 : 15
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
                    size={windowWidth <= 480 ? "default" : "large"}
                    src={userInfo?.anh_dai_dien}
                    style={{
                      background: userInfo?.anh_dai_dien 
                        ? "transparent" 
                        : "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                    }}
                    icon={!userInfo?.anh_dai_dien ? <UserOutlined /> : undefined}
                  />
                  <Text strong style={{ fontSize: windowWidth <= 480 ? 14 : 15 }}>
                    {userInfo?.ho_ten || "Người dùng"}
                  </Text>
                </Space>
              </div>
              <Button
                block
                icon={<UserOutlined />}
                onClick={() => {
                  navigate("/updateprofile");
                  setMobileMenuVisible(false);
                }}
                style={{
                  height: windowWidth <= 480 ? 40 : 44,
                  fontSize: windowWidth <= 480 ? 14 : 15
                }}
              >
                Thông tin cá nhân
              </Button>
              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  height: windowWidth <= 480 ? 40 : 44,
                  fontSize: windowWidth <= 480 ? 14 : 15
                }}
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
                style={{
                  height: windowWidth <= 480 ? 40 : 44,
                  fontSize: windowWidth <= 480 ? 14 : 15
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
                  height: windowWidth <= 480 ? 40 : 44,
                  fontSize: windowWidth <= 480 ? 14 : 15
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
      
      {/* Logout Loading Overlay */}
      {logoutLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
        >
          <Spin size="large" />
          <div
            style={{
              marginTop: 24,
              fontSize: 16,
              color: "#1890ff",
              fontWeight: 500,
            }}
          >
            Đang đăng xuất...
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
