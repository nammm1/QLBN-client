import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Button, Space, Badge } from "antd";
import {
  FileTextOutlined,
  AppleOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  DollarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  SettingOutlined,
  FormOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import BookingModal from "../../components/Header/BookingModal";
import NutritionBookingModal from "../../components/Header/NutritionBookingModal";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import "./PatientFunction.css";

const { Title, Paragraph } = Typography;

const PatientFunction = () => {
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const functions = [
    {
      key: "medical-records",
      title: "Hồ sơ bệnh án",
      icon: <FileTextOutlined />,
      description: "Xem thông tin hồ sơ và lịch sử khám chữa bệnh",
      path: "/medical-records",
      color: "#1890ff",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "rgba(102, 126, 234, 0.1)",
    },
    {
      key: "nutrition-records",
      title: "Hồ sơ dinh dưỡng",
      icon: <AppleOutlined />,
      description: "Xem thông tin hồ sơ và lịch sử tư vấn dinh dưỡng",
      path: "/nutrition-records",
      color: "#52c41a",
      gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      iconBg: "rgba(82, 196, 26, 0.1)",
    },
    {
      key: "appointments",
      title: "Lịch hẹn",
      icon: <CalendarOutlined />,
      description: "Theo dõi và quản lý lịch hẹn khám bệnh",
      path: "/appointments",
      color: "#fa8c16",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      iconBg: "rgba(250, 140, 22, 0.1)",
    },
    {
      key: "book-exam",
      title: "Đặt lịch khám",
      icon: <FormOutlined />,
      description: "Đặt lịch hẹn khám với bác sĩ",
      action: () => setShowBookingModal(true),
      color: "#722ed1",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      iconBg: "rgba(114, 46, 209, 0.1)",
      badge: "Mới",
    },
    {
      key: "book-nutrition",
      title: "Đặt lịch tư vấn",
      icon: <HeartOutlined />,
      description: "Đặt lịch tư vấn dinh dưỡng",
      action: () => setShowNutritionModal(true),
      color: "#eb2f96",
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      iconBg: "rgba(235, 47, 150, 0.1)",
      badge: "Mới",
    },
    {
      key: "test-results",
      title: "Kết quả xét nghiệm",
      icon: <ExperimentOutlined />,
      description: "Xem kết quả xét nghiệm và chẩn đoán",
      path: "/appointments", // Temporary redirect
      color: "#13c2c2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "rgba(19, 194, 194, 0.1)",
      comingSoon: true,
    },
    {
      key: "billing",
      title: "Thanh toán hóa đơn",
      icon: <DollarOutlined />,
      description: "Xem và thanh toán hóa đơn khám chữa bệnh",
      path: "/appointments", // Temporary redirect
      color: "#f5222d",
      gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
      iconBg: "rgba(245, 34, 45, 0.1)",
      comingSoon: true,
    },
    {
      key: "profile",
      title: "Hồ sơ cá nhân",
      icon: <UserOutlined />,
      description: "Quản lý thông tin cá nhân và tài khoản",
      path: "/updateprofile",
      color: "#595959",
      gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      iconBg: "rgba(89, 89, 89, 0.1)",
    },
  ];

  const checkLoginAndShowModal = (callback) => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true") {
      setShowLoginRequiredModal(true);
      return;
    }
    callback();
  };

  const handleCardClick = (func) => {
    // Các chức năng cần đăng nhập
    const requiresLogin = [
      "medical-records",
      "nutrition-records",
      "appointments",
      "book-exam",
      "book-nutrition",
      "test-results",
      "billing",
      "profile"
    ];

    if (requiresLogin.includes(func.key) && !func.comingSoon) {
      checkLoginAndShowModal(() => {
        if (func.action) {
          func.action();
        } else if (func.path) {
          navigate(func.path);
        }
      });
    } else if (func.action) {
      func.action();
    } else if (func.path) {
      navigate(func.path);
    }
  };

  return (
    <div className="patient-function-page">
      {/* Hero Section */}
      <div className="patient-function-hero">
        <div className="patient-function-hero-content">
          <Title level={1} className="patient-function-hero-title">
            Trung tâm Chăm sóc Sức khỏe
          </Title>
          <Paragraph className="patient-function-hero-description">
            Quản lý toàn diện thông tin y tế và dịch vụ chăm sóc sức khỏe của bạn
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div className="patient-function-container">
        <div className="patient-function-header">
          <Title level={2} className="patient-function-main-title">
            Chức năng dành cho Bệnh nhân
          </Title>
          <Paragraph className="patient-function-subtitle">
            Truy cập nhanh các dịch vụ và thông tin chăm sóc sức khỏe
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="patient-function-grid">
          {functions.map((func) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={func.key}>
              <Card
                className={`patient-function-card ${func.comingSoon ? "coming-soon" : ""}`}
                hoverable={!func.comingSoon}
                onClick={() => !func.comingSoon && handleCardClick(func)}
                style={{
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  background: "#ffffff",
                }}
                bodyStyle={{
                  padding: "32px 24px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* Badge */}
                {func.badge && (
                  <Badge.Ribbon
                    text={func.badge}
                    color={func.color}
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "-8px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  />
                )}

                {/* Coming Soon Badge */}
                {func.comingSoon && (
                  <Badge.Ribbon
                    text="Sắp ra mắt"
                    color="#888"
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: func.badge ? "-28px" : "-8px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  />
                )}

                {/* Icon Container */}
                <div
                  className="patient-function-icon-container"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    background: func.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      color: func.color,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {func.icon}
                  </div>
                </div>

                {/* Content */}
                <Title
                  level={4}
                  className="patient-function-card-title"
                  style={{
                    color: "#1a1a1a",
                    marginBottom: "12px",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                >
                  {func.title}
                </Title>
                <Paragraph
                  className="patient-function-card-description"
                  style={{
                    color: "#666",
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  {func.description}
                </Paragraph>

                {/* Hover Gradient Overlay */}
                <div
                  className="patient-function-card-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: func.gradient,
                    opacity: 0,
                    transition: "opacity 0.4s ease",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Modals */}
      <BookingModal
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
      <NutritionBookingModal
        show={showNutritionModal}
        onClose={() => setShowNutritionModal(false)}
      />
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginRequiredModal}
        onCancel={() => setShowLoginRequiredModal(false)}
      />
    </div>
  );
};

export default PatientFunction;
