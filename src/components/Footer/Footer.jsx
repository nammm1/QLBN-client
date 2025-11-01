import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Space, Divider, Input, Button, Card, Badge, Tag } from "antd";
import {
  HomeOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  HeartOutlined,
  SendOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  GlobalOutlined,
  MessageOutlined,
  BookOutlined,
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Stethoscope, Award, Shield, Clock, Users } from "lucide-react";
import "./Footer.css";

const { Title, Text } = Typography;

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email) {
      // Handle subscription logic here
      console.log("Subscribing:", email);
      setEmail("");
    }
  };

  return (
    <footer className="modern-footer">
      {/* Animated Background Elements */}
      <div className="footer-background-effects">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="footer-container">
        {/* Top Section - Newsletter & Stats */}
        <div className="footer-top-section">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div className="newsletter-section">
                <div className="newsletter-icon">
                  <MailOutlined />
                </div>
                <Title level={4} className="newsletter-title">
                  Đăng ký nhận tin tức y tế
                </Title>
                <Text className="newsletter-description">
                  Nhận các thông tin mới nhất về sức khỏe, dịch vụ và khuyến mãi
                </Text>
                <Space.Compact style={{ width: "100%", marginTop: 20 }}>
                  <Input
                    size="large"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    prefix={<MailOutlined style={{ color: "#40a9ff" }} />}
                    className="newsletter-input"
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSubscribe}
                    className="newsletter-button"
                  >
                    Đăng ký
                  </Button>
                </Space.Compact>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="stats-section">
                <Row gutter={[24, 24]}>
                  <Col xs={12} sm={6}>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Users size={32} />
                      </div>
                      <div className="stat-number">50K+</div>
                      <div className="stat-label">Bệnh nhân</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <UserOutlined style={{ fontSize: 32 }} />
                      </div>
                      <div className="stat-number">200+</div>
                      <div className="stat-label">Bác sĩ</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Award size={32} />
                      </div>
                      <div className="stat-number">15+</div>
                      <div className="stat-label">Năm kinh nghiệm</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <StarOutlined style={{ fontSize: 32 }} />
                      </div>
                      <div className="stat-number">4.9</div>
                      <div className="stat-label">Đánh giá</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>

        <Divider className="footer-main-divider" />

        {/* Main Content */}
        <div className="footer-content">
          <Row gutter={[32, 32]}>
            {/* Logo & Giới thiệu */}
            <Col xs={24} sm={24} md={12} lg={6}>
              <div className="footer-logo">
                <Link to="/" className="logo-gradient">
                  <Stethoscope size={28} style={{ marginRight: "12px" }} />
                  <span>HOSPITAL CARE</span>
                </Link>
              </div>
              <p className="footer-description">
                Trung tâm Chăm sóc Bệnh viện hàng đầu với đội ngũ y bác sĩ giàu kinh nghiệm. 
                Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao, chăm sóc tận tâm 
                cho từng bệnh nhân.
              </p>
              
              {/* Certificates */}
              <div className="certificates-section">
                <Tag icon={<SafetyCertificateOutlined />} color="blue" className="cert-tag">
                  ISO 9001
                </Tag>
                <Tag icon={<TrophyOutlined />} color="gold" className="cert-tag">
                  TOP 10
                </Tag>
              </div>

              <Space className="social-links">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button facebook"
                  aria-label="Facebook"
                >
                  <FacebookOutlined />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button youtube"
                  aria-label="Youtube"
                >
                  <YoutubeOutlined />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button twitter"
                  aria-label="Twitter"
                >
                  <TwitterOutlined />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button linkedin"
                  aria-label="LinkedIn"
                >
                  <LinkedinOutlined />
                </a>
              </Space>
            </Col>

            {/* Liên kết nhanh */}
            <Col xs={24} sm={12} md={6} lg={5}>
              <Title level={5} className="footer-title">
                <HomeOutlined style={{ marginRight: "8px", color: "#40a9ff" }} />
                Liên kết nhanh
              </Title>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Link to="/" className="footer-link-item">
                  <HomeOutlined className="footer-link-icon" />
                  <span>Trang chủ</span>
                </Link>
                <Link to="/about" className="footer-link-item">
                  <InfoCircleOutlined className="footer-link-icon" />
                  <span>Giới thiệu</span>
                </Link>
                <Link to="/services" className="footer-link-item">
                  <MedicineBoxOutlined className="footer-link-icon" />
                  <span>Dịch vụ</span>
                </Link>
                <Link to="/doctors" className="footer-link-item">
                  <TeamOutlined className="footer-link-icon" />
                  <span>Đội ngũ bác sĩ</span>
                </Link>
                <Link to="/specialties" className="footer-link-item">
                  <MedicineBoxOutlined className="footer-link-icon" />
                  <span>Chuyên khoa</span>
                </Link>
                <Link to="/appointment" className="footer-link-item">
                  <CalendarOutlined className="footer-link-icon" />
                  <span>Đặt lịch khám</span>
                </Link>
              </Space>
            </Col>

            {/* Dịch vụ */}
            <Col xs={24} sm={12} md={6} lg={6}>
              <Title level={5} className="footer-title">
                <MedicineBoxOutlined style={{ marginRight: "8px", color: "#40a9ff" }} />
                Dịch vụ
              </Title>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div className="service-item">
                  <MessageOutlined className="service-icon" />
                  <div className="service-content">
                    <Text className="support-title">Tư vấn trực tuyến</Text>
                    <Text className="service-description">
                      Tư vấn online với bác sĩ qua video call
                    </Text>
                  </div>
                </div>
                <Divider className="footer-divider" />
                <div className="service-item">
                  <BookOutlined className="service-icon" />
                  <div className="service-content">
                    <Text className="support-title">Khám trực tiếp</Text>
                    <Text className="service-description">
                      Đặt lịch khám tại bệnh viện với bác sĩ chuyên khoa
                    </Text>
                  </div>
                </div>
                <Divider className="footer-divider" />
                <div className="service-item">
                  <Clock className="service-icon lucide" size={18} />
                  <div className="service-content">
                    <Text className="support-title">Hỗ trợ 24/7</Text>
                    <Text className="service-description">
                      Tư vấn và hỗ trợ khách hàng mọi lúc, mọi nơi
                    </Text>
                  </div>
                </div>
              </Space>
            </Col>

            {/* Thông tin liên hệ */}
            <Col xs={24} sm={12} md={6} lg={7}>
              <Title level={5} className="footer-title">
                <MailOutlined style={{ marginRight: "8px", color: "#40a9ff" }} />
                Thông tin liên hệ
              </Title>
              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <MailOutlined className="contact-icon" />
                  </div>
                  <div className="contact-details">
                    <span className="contact-label">Email</span>
                    <a
                      href="mailto:hospitalcarecenter@gmail.com"
                      className="contact-value"
                    >
                      hospitalcarecenter@gmail.com
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <PhoneOutlined className="contact-icon" />
                  </div>
                  <div className="contact-details">
                    <span className="contact-label">Hotline</span>
                    <a href="tel:1900123456" className="contact-value">
                      1900 123 456
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <EnvironmentOutlined className="contact-icon" />
                  </div>
                  <div className="contact-details">
                    <span className="contact-label">Địa chỉ</span>
                    <span className="contact-value">
                      123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
                    </span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <ClockCircleOutlined className="contact-icon" />
                  </div>
                  <div className="contact-details">
                    <span className="contact-label">Giờ làm việc</span>
                    <span className="contact-value">
                      Thứ 2 - CN: 7:00 - 20:00
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="quick-actions">
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  className="quick-action-btn"
                  block
                >
                  Đặt lịch ngay
                </Button>
                <Button
                  icon={<MessageOutlined />}
                  className="quick-action-btn secondary"
                  block
                >
                  Tư vấn online
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Footer Bottom */}
        <Divider className="footer-main-divider" />
        <div className="footer-bottom">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12}>
              <Text className="copyright-text">
                &copy; {currentYear} <strong>HOSPITAL CARE CENTER</strong>. Tất cả quyền được bảo lưu.
              </Text>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div className="footer-bottom-links">
                <Link to="/privacy" className="footer-bottom-link">
                  Chính sách bảo mật
                </Link>
                <Divider type="vertical" className="footer-bottom-divider" />
                <Link to="/terms" className="footer-bottom-link">
                  Điều khoản sử dụng
                </Link>
                <Divider type="vertical" className="footer-bottom-divider" />
                <Link to="/faq" className="footer-bottom-link">
                  FAQ
                </Link>
              </div>
            </Col>
          </Row>
          <div className="made-with-section">
            <Text className="made-with-text">
              Được tạo bằng <HeartOutlined className="heart-icon" /> với sự chăm sóc cho sức khỏe cộng đồng
            </Text>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
