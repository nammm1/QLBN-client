import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Divider,
  Button,
  Tag,
  Timeline,
  Avatar,
  Rate,
} from "antd";
import {
  HeartOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  TrophyOutlined,
  SafetyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StarFilled,
  UserOutlined,
} from "@ant-design/icons";
import "./Home.css";
import banner1 from "../../images/banner1.jpg";
import banner2 from "../../images/banner2.jpg";
import doctorImg from "../../images/doctor.jpg";
import Glide from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css";
import "@glidejs/glide/dist/css/glide.theme.min.css";
import partner1 from "../../images/partner1.webp";
import partner2 from "../../images/partner2.webp";
import partner3 from "../../images/partner3.webp";
import partner4 from "../../images/partner4.webp";
import partner5 from "../../images/partner5.webp";
import partner6 from "../../images/partner6.webp";
import partner7 from "../../images/partner7.webp";

const { Title, Paragraph, Text } = Typography;
const partners = [
  partner1,
  partner2,
  partner3,
  partner4,
  partner5,
  partner6,
  partner7,
];

const Home = () => {
  const navigate = useNavigate();
  const glideRef = useRef(null);
  const [isVisible, setIsVisible] = useState({});
  const [counters, setCounters] = useState({
    patients: 0,
    doctors: 0,
    years: 0,
    satisfaction: 0,
  });

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll(".animate-on-scroll");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.disconnect());
    };
  }, []);

  // Animated counters
  useEffect(() => {
    if (isVisible.achievements) {
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;

      const animate = (start, end, key) => {
        let current = start;
        const step = (end - start) / steps;
        const timer = setInterval(() => {
          current += step;
          if (current >= end) {
            current = end;
            clearInterval(timer);
          }
          setCounters((prev) => ({ ...prev, [key]: Math.floor(current) }));
        }, increment);
      };

      animate(0, 50000, "patients");
      animate(0, 200, "doctors");
      animate(0, 15, "years");
      animate(0, 98, "satisfaction");
    }
  }, [isVisible.achievements]);

  useEffect(() => {
    glideRef.current = new Glide(".partners-glide", {
      type: "carousel",
      perView: 3,
      gap: 30,
      autoplay: 2000,
      hoverpause: true,
      animationDuration: 400,
      animationTimingFunc: "cubic-bezier(0.165, 0.84, 0.44, 1)",
      breakpoints: {
        992: { perView: 2 },
        576: { perView: 1 },
      },
    });

    glideRef.current.mount();
    return () => {
      if (glideRef.current) glideRef.current.destroy();
    };
  }, []);

  const bannerItems = [
    {
      key: "1",
      image: banner1,
      title: "Sức khỏe của bạn – Sứ mệnh của chúng tôi",
      subtitle: "Chăm sóc tận tâm, dịch vụ chuyên nghiệp",
      description:
        "Đội ngũ y bác sĩ giàu kinh nghiệm với trang thiết bị hiện đại, luôn sẵn sàng chăm sóc sức khỏe cho bạn và gia đình.",
    },
    {
      key: "2",
      image: banner2,
      title: "Chăm sóc sức khỏe toàn diện",
      subtitle: "Từ tư vấn đến điều trị, chúng tôi luôn đồng hành",
      description:
        "Từ khám tổng quát đến chuyên khoa, từ điều trị nội trú đến phẫu thuật, chúng tôi mang đến giải pháp y tế toàn diện.",
    },
  ];

  const features = [
    {
      icon: <HeartOutlined />,
      title: "Chăm sóc tận tâm",
      text: "Đội ngũ y bác sĩ luôn đặt bệnh nhân làm trung tâm, chăm sóc với tình thương và sự thấu hiểu.",
      color: "#ff4d4f",
    },
    {
      icon: <ExperimentOutlined />,
      title: "Trang thiết bị hiện đại",
      text: "Ứng dụng công nghệ và máy móc tiên tiến trong chẩn đoán, điều trị, đảm bảo độ chính xác cao.",
      color: "#1890ff",
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Phục vụ nhanh chóng",
      text: "Quy trình khám chữa bệnh tối ưu, giảm thiểu thời gian chờ đợi, đặt lịch online tiện lợi.",
      color: "#52c41a",
    },
    {
      icon: <GlobalOutlined />,
      title: "Uy tín & chất lượng",
      text: "Được hàng ngàn bệnh nhân trong và ngoài nước tin tưởng, chứng nhận chất lượng quốc tế.",
      color: "#722ed1",
    },
  ];

  const achievements = [
    { value: "50,000+", label: "Bệnh nhân tin tưởng điều trị", icon: <HeartOutlined /> },
    { value: "200+", label: "Bác sĩ chuyên khoa", icon: <UserOutlined /> },
    { value: "15", label: "Năm kinh nghiệm", icon: <TrophyOutlined /> },
    { value: "98%", label: "Bệnh nhân hài lòng", icon: <StarFilled /> },
  ];

  const services = [
    {
      title: "Khám tổng quát",
      description: "Khám sức khỏe định kỳ, tầm soát bệnh lý",
      icon: <HeartOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Chẩn đoán hình ảnh",
      description: "CT, MRI, X-quang, siêu âm hiện đại",
      icon: <ExperimentOutlined />,
      color: "#1890ff",
    },
    {
      title: "Phẫu thuật",
      description: "Phẫu thuật nội soi, phẫu thuật ít xâm lấn",
      icon: <SafetyOutlined />,
      color: "#52c41a",
    },
    {
      title: "Tư vấn dinh dưỡng",
      description: "Chế độ ăn uống khoa học, dinh dưỡng cá nhân hóa",
      icon: <TeamOutlined />,
      color: "#722ed1",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Bệnh nhân",
      content:
        "Dịch vụ rất chuyên nghiệp, bác sĩ tận tâm. Tôi rất hài lòng với chất lượng khám chữa bệnh tại đây.",
      rating: 5,
    },
    {
      name: "Trần Thị B",
      role: "Bệnh nhân",
      content:
        "Trang thiết bị hiện đại, đội ngũ y bác sĩ giàu kinh nghiệm. Chắc chắn sẽ quay lại trong tương lai.",
      rating: 5,
    },
    {
      name: "Lê Văn C",
      role: "Bệnh nhân",
      content:
        "Quy trình đặt lịch online rất tiện lợi, không phải chờ đợi lâu. Cảm ơn bệnh viện đã chăm sóc tốt.",
      rating: 5,
    },
  ];

  const milestones = [
    { year: "2010", title: "Thành lập", description: "Bệnh viện được thành lập với sứ mệnh chăm sóc sức khỏe cộng đồng" },
    { year: "2015", title: "Mở rộng", description: "Mở rộng quy mô với 200+ giường bệnh và 200+ bác sĩ" },
    { year: "2020", title: "Đạt chuẩn", description: "Đạt chứng nhận chất lượng quốc tế JCI" },
    { year: "2024", title: "Hiện tại", description: "Hơn 50,000 bệnh nhân tin tưởng, 98% hài lòng" },
  ];

  return (
    <div className="home-container">
      {/* Hero Banner Carousel */}
      <div style={{ position: "relative", marginBottom: 0 }}>
        <Carousel autoplay autoplaySpeed={4000} effect="fade" dots={{ className: "custom-dots" }}>
          {bannerItems.map((item) => (
            <div key={item.key}>
              <div
                className="hero-banner"
                style={{
                  position: "relative",
                  height: "600px",
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <div className="hero-overlay" />
                <div className="hero-content" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px", maxWidth: 800 }}>
                  <Title level={1} style={{ color: "white", marginBottom: 16, fontSize: "3.5rem", fontWeight: "bold" }}>
                    {item.title}
                  </Title>
                  <Title level={3} style={{ color: "rgba(255,255,255,0.95)", marginBottom: 24, fontSize: "1.8rem", fontWeight: "normal" }}>
                    {item.subtitle}
                  </Title>
                  <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem", marginBottom: 32 }}>
                    {item.description}
                  </Paragraph>
                  <Space size="large">
                    <Button
                      type="primary"
                      size="large"
                      icon={<CalendarOutlined />}
                      onClick={() => navigate("/specialties")}
                      style={{
                        background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                        border: "none",
                        height: 50,
                        padding: "0 32px",
                        fontSize: 16,
                      }}
                    >
                      Đặt lịch khám
                    </Button>
                    <Button
                      size="large"
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/about")}
                      style={{
                        color: "white",
                        borderColor: "rgba(255, 255, 255, 0.8)",
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(10px)",
                        height: 50,
                        padding: "0 32px",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                        e.currentTarget.style.borderColor = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                      }}
                    >
                      Tìm hiểu thêm
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Why Choose Us */}
      <div className="section-white animate-on-scroll" id="why-choose" style={{ background: "#fff", padding: "80px 0" }}>
        <div className="container">
          <Title 
            level={2} 
            className={`section-title ${isVisible["why-choose"] ? "animate-fade-in-up" : ""}`}
            style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.5rem" }}
          >
            Vì sao nên chọn bệnh viện chúng tôi?
          </Title>
          <Paragraph 
            className={`section-subtitle ${isVisible["why-choose"] ? "animate-fade-in-up-delay" : ""}`}
            style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}
          >
            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất với đội ngũ chuyên gia giàu kinh nghiệm
          </Paragraph>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={10}>
              <div 
                className={`doctor-image-wrapper ${isVisible["why-choose"] ? "animate-slide-in-left" : ""}`}
                style={{ textAlign: "center" }}
              >
                <img
                  src={doctorImg}
                  alt="Doctor"
                  className="doctor-image"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: 20,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </Col>
            <Col xs={24} md={14}>
              <Row gutter={[24, 24]}>
                {features.map((feature, idx) => (
                  <Col xs={24} sm={12} key={idx}>
                    <Card
                      hoverable
                      className={`feature-card ${isVisible["why-choose"] ? "animate-stagger" : ""}`}
                      style={{
                        animationDelay: `${idx * 0.15}s`,
                        height: "100%",
                        border: "1px solid #e6f7ff",
                        borderRadius: 16,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        transition: "all 0.3s",
                      }}
                      styles={{ body: { padding: 32, textAlign: "center" } }}
                    >
                      <div className="feature-icon-wrapper" style={{ fontSize: "3.5rem", color: feature.color, marginBottom: 20 }}>
                        {feature.icon}
                      </div>
                      <Title level={4} style={{ color: "#096dd9", marginBottom: 16, fontSize: 20 }}>
                        {feature.title}
                      </Title>
                      <Paragraph style={{ color: "#666", margin: 0, fontSize: 15, lineHeight: 1.8 }}>
                        {feature.text}
                      </Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* Achievements */}
      <div
        className="section-gradient animate-on-scroll"
        id="achievements"
        style={{
          background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
          padding: "80px 0",
          color: "white",
        }}
      >
        <div className="container">
          <Title 
            level={2} 
            className={`section-title ${isVisible.achievements ? "animate-fade-in-up" : ""}`}
            style={{ textAlign: "center", color: "white", marginBottom: 16, fontSize: "2.5rem" }}
          >
            Thành tựu nổi bật
          </Title>
          <Paragraph 
            className={`section-subtitle ${isVisible.achievements ? "animate-fade-in-up-delay" : ""}`}
            style={{ textAlign: "center", color: "rgba(255,255,255,0.9)", fontSize: 18, marginBottom: 60 }}
          >
            Những con số ấn tượng thể hiện chất lượng dịch vụ của chúng tôi
          </Paragraph>
          <Row gutter={[32, 32]}>
            {achievements.map((achievement, idx) => {
              let value = achievement.value;
              if (achievement.value === "50,000+") {
                value = `${counters.patients.toLocaleString()}+`;
              } else if (achievement.value === "200+") {
                value = `${counters.doctors}+`;
              } else if (achievement.value === "15") {
                value = counters.years;
              } else if (achievement.value === "98%") {
                value = `${counters.satisfaction}%`;
              }
              return (
                <Col xs={12} sm={12} md={6} key={idx}>
                  <div 
                    className={`achievement-item ${isVisible.achievements ? "animate-scale-in" : ""}`}
                    style={{ 
                      textAlign: "center",
                      animationDelay: `${idx * 0.15}s`,
                    }}
                  >
                    <div className="achievement-icon pulse-animation" style={{ fontSize: "3rem", marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>
                      {achievement.icon}
                    </div>
                    <Statistic
                      title={
                        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                          {achievement.label}
                        </span>
                      }
                      value={value}
                      valueStyle={{ color: "white", fontSize: "3rem", fontWeight: "bold" }}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>

      {/* Services */}
      <div className="section-white animate-on-scroll" id="services" style={{ background: "#f0f2f5", padding: "80px 0" }}>
        <div className="container">
          <Title 
            level={2} 
            className={`section-title ${isVisible.services ? "animate-fade-in-up" : ""}`}
            style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.5rem" }}
          >
            Dịch vụ của chúng tôi
          </Title>
          <Paragraph 
            className={`section-subtitle ${isVisible.services ? "animate-fade-in-up-delay" : ""}`}
            style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}
          >
            Đa dạng dịch vụ y tế đáp ứng mọi nhu cầu chăm sóc sức khỏe của bạn
          </Paragraph>
          <Row gutter={[32, 32]}>
            {services.map((service, idx) => (
              <Col xs={24} sm={12} md={6} key={idx}>
                <Card
                  hoverable
                  className={`service-card ${isVisible.services ? "animate-stagger" : ""}`}
                  style={{
                    height: "100%",
                    border: "1px solid #e6f7ff",
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    textAlign: "center",
                    transition: "all 0.3s",
                    animationDelay: `${idx * 0.15}s`,
                  }}
                  styles={{ body: { padding: 32 } }}
                >
                  <div className="service-icon-wrapper" style={{ fontSize: "3rem", color: service.color, marginBottom: 20 }}>
                    {service.icon}
                  </div>
                  <Title level={4} style={{ color: "#096dd9", marginBottom: 12 }}>
                    {service.title}
                  </Title>
                  <Paragraph style={{ color: "#666", margin: 0 }}>
                    {service.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/services")}
              style={{
                background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                border: "none",
                height: 50,
                padding: "0 40px",
                fontSize: 16,
              }}
            >
              Xem tất cả dịch vụ
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="section-white animate-on-scroll" id="testimonials" style={{ background: "#fff", padding: "80px 0" }}>
        <div className="container">
          <Title 
            level={2} 
            className={`section-title ${isVisible.testimonials ? "animate-fade-in-up" : ""}`}
            style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.5rem" }}
          >
            Ý kiến bệnh nhân
          </Title>
          <Paragraph 
            className={`section-subtitle ${isVisible.testimonials ? "animate-fade-in-up-delay" : ""}`}
            style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}
          >
            Những phản hồi tích cực từ bệnh nhân đã tin tưởng và sử dụng dịch vụ của chúng tôi
          </Paragraph>
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card
                  className={`testimonial-card ${isVisible.testimonials ? "animate-stagger" : ""}`}
                  style={{
                    height: "100%",
                    border: "1px solid #e6f7ff",
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    animationDelay: `${idx * 0.2}s`,
                    transition: "all 0.3s",
                  }}
                  styles={{ body: { padding: 32 } }}
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Rate disabled defaultValue={testimonial.rating} style={{ color: "#faad14" }} />
                    <Paragraph style={{ color: "#666", fontSize: 15, lineHeight: 1.8, fontStyle: "italic" }}>
                      "{testimonial.content}"
                    </Paragraph>
                    <Divider style={{ margin: "16px 0" }} />
                    <Space>
                      <Avatar
                        style={{
                          background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                        }}
                        icon={<UserOutlined />}
                      />
                      <div>
                        <Text strong style={{ display: "block" }}>
                          {testimonial.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {testimonial.role}
                        </Text>
                      </div>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Milestones */}
      <div className="section-white animate-on-scroll" id="milestones" style={{ background: "#f0f2f5", padding: "80px 0" }}>
        <div className="container">
          <Title 
            level={2} 
            className={`section-title ${isVisible.milestones ? "animate-fade-in-up" : ""}`}
            style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.5rem" }}
          >
            Hành trình phát triển
          </Title>
          <Paragraph 
            className={`section-subtitle ${isVisible.milestones ? "animate-fade-in-up-delay" : ""}`}
            style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}
          >
            Những cột mốc quan trọng trong quá trình xây dựng và phát triển
          </Paragraph>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Timeline
              items={milestones.map((milestone, idx) => ({
                color: "#096dd9",
                dot: <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#096dd9", border: "4px solid #e6f7ff" }} />,
                children: (
                  <Card
                    style={{
                      marginBottom: 16,
                      border: "1px solid #e6f7ff",
                      borderRadius: 12,
                    }}
                    styles={{ body: { padding: 24 } }}
                  >
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                        {milestone.year}
                      </Tag>
                      <Title level={4} style={{ color: "#096dd9", margin: "8px 0" }}>
                        {milestone.title}
                      </Title>
                      <Paragraph style={{ color: "#666", margin: 0 }}>
                        {milestone.description}
                      </Paragraph>
                    </Space>
                  </Card>
                ),
              }))}
            />
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="section-white animate-on-scroll" id="partners" style={{ background: "white", padding: "80px 0" }}>
        <div className="container">
          <Title 
            level={2} 
            className={`section-title ${isVisible.partners ? "animate-fade-in-up" : ""}`}
            style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.5rem" }}
          >
            Đối tác của chúng tôi
          </Title>
          <Paragraph 
            className={`section-subtitle ${isVisible.partners ? "animate-fade-in-up-delay" : ""}`}
            style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}
          >
            Hợp tác với các tổ chức y tế hàng đầu trong và ngoài nước
          </Paragraph>
          <Divider style={{ borderColor: "#096dd9", marginBottom: 40 }} />
          <div className="partners-glide glide">
            <div className="glide__track" data-glide-el="track">
              <ul className="glide__slides">
                {partners.map((src, idx) => (
                  <li className="glide__slide" key={idx}>
                    <figure className="item hospital_slide">
                      <img loading="lazy" src={src} alt={`partner${idx + 1}`} style={{ borderRadius: 8 }} />
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="section-white" style={{ background: "#f0f2f5", padding: "80px 0" }}>
        <div className="container">
          <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.5rem" }}>
            Vị trí bệnh viện
          </Title>
          <Paragraph style={{ textAlign: "center", fontSize: 18, marginBottom: 32, maxWidth: 800, margin: "0 auto 32px" }}>
            12 Đường Hạnh Thông, Phường 12, Gò Vấp, TP. Hồ Chí Minh
          </Paragraph>
          <div
            style={{
              width: "100%",
              height: "560px",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1959.428585080572!2d106.68555793611127!3d10.82224055898329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s!4v1758710417162!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
