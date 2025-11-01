import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Card,
  Space,
  Divider,
  Timeline,
  Statistic,
  Button,
  Tag,
  Avatar,
  Rate,
  FloatButton
} from "antd";
import {
  HeartOutlined,
  TrophyOutlined,
  SafetyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  UserOutlined,
  StarFilled,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UpCircleOutlined,
  RocketOutlined,
  CrownOutlined,
  LikeOutlined,
  BankOutlined
} from "@ant-design/icons";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import BookingModal from "../../components/Header/BookingModal";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import "./About.css";
import about1 from "../../images/about-img1.jpg";
import about2 from "../../images/about-img2.jpg";

const { Title, Paragraph, Text } = Typography;

// Animation components
const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.6, delay }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
    >
      {children}
    </motion.div>
  );
};

const StaggerChildren = ({ children, className }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, threshold: 0.1 }}
      transition={{ staggerChildren: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SlideInItem = ({ children }) => {
  return (
    <motion.div
      variants={{
        visible: { opacity: 1, x: 0 },
        hidden: { opacity: 0, x: -50 }
      }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const heartValues = [
    {
      letter: "H",
      title: "Humanity (Nhân văn)",
      icon: <HeartOutlined style={{ fontSize: 32, color: "#096dd9" }} />,
      description: "Luôn đặt con người làm trung tâm, chăm sóc với tình thương và sự thấu hiểu. Chúng tôi tin rằng mỗi bệnh nhân đều xứng đáng nhận được sự quan tâm và chăm sóc tốt nhất.",
      color: "#ff4d4f"
    },
    {
      letter: "E",
      title: "Excellence (Xuất sắc)",
      icon: <TrophyOutlined style={{ fontSize: 32, color: "#096dd9" }} />,
      description: "Không ngừng nâng cao chất lượng dịch vụ và chuyên môn để mang lại kết quả tốt nhất. Đội ngũ bác sĩ luôn cập nhật kiến thức mới nhất từ các chuẩn mực y tế quốc tế.",
      color: "#faad14"
    },
    {
      letter: "A",
      title: "Accountability (Trách nhiệm)",
      icon: <SafetyOutlined style={{ fontSize: 32, color: "#096dd9" }} />,
      description: "Chịu trách nhiệm cao nhất trong mọi hành động, vì lợi ích của bệnh nhân và cộng đồng. Minh bạch trong mọi quy trình và thông tin y tế.",
      color: "#52c41a"
    },
    {
      letter: "R",
      title: "Respect (Tôn trọng)",
      icon: <TeamOutlined style={{ fontSize: 32, color: "#096dd9" }} />,
      description: "Tôn trọng người bệnh, đồng nghiệp và các giá trị đạo đức nghề nghiệp. Mỗi cá nhân đều được đối xử công bằng và tôn trọng quyền riêng tư.",
      color: "#722ed1"
    },
    {
      letter: "T",
      title: "Trust (Tin cậy)",
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: "#096dd9" }} />,
      description: "Xây dựng niềm tin vững chắc bằng sự minh bạch, tận tâm và uy tín. Chúng tôi cam kết bảo mật thông tin bệnh nhân và cung cấp dịch vụ chất lượng cao.",
      color: "#1890ff"
    },
  ];

  const stats = [
    { value: "50,000+", label: "Bệnh nhân đã điều trị", icon: <HeartOutlined />, color: "#ff4d4f" },
    { value: "200+", label: "Bác sĩ chuyên khoa", icon: <UserOutlined />, color: "#1890ff" },
    { value: "15", label: "Năm kinh nghiệm", icon: <ClockCircleOutlined />, color: "#52c41a" },
    { value: "98%", label: "Tỷ lệ hài lòng", icon: <StarFilled />, color: "#faad14" },
  ];

  const milestones = [
    {
      year: "2010",
      title: "Thành lập bệnh viện",
      description: "Bệnh viện được thành lập với sứ mệnh chăm sóc sức khỏe cộng đồng, ban đầu với 50 giường bệnh và 30 bác sĩ.",
      icon: <BankOutlined />
    },
    {
      year: "2015",
      title: "Mở rộng quy mô",
      description: "Mở rộng quy mô với 200+ giường bệnh, 200+ bác sĩ, trang bị máy móc hiện đại. Đạt nhiều giải thưởng trong lĩnh vực y tế.",
      icon: <RocketOutlined />
    },
    {
      year: "2020",
      title: "Đạt chứng nhận quốc tế",
      description: "Đạt chứng nhận chất lượng quốc tế JCI, ISO 9001. Triển khai hệ thống quản lý điện tử, đặt lịch online.",
      icon: <CrownOutlined />
    },
    {
      year: "2024",
      title: "Hiện tại",
      description: "Hơn 50,000 bệnh nhân tin tưởng, 98% hài lòng. Tiên phong trong ứng dụng công nghệ AI, telemedicine.",
      icon: <LikeOutlined />
    },
  ];

  const achievements = [
    {
      title: "Giải thưởng Bệnh viện xuất sắc",
      year: "2023",
      description: "Được Bộ Y tế công nhận là bệnh viện xuất sắc trong năm 2023",
      icon: <TrophyOutlined />
    },
    {
      title: "Chứng nhận JCI",
      year: "2020",
      description: "Đạt chứng nhận chất lượng quốc tế Joint Commission International",
      icon: <GlobalOutlined />
    },
    {
      title: "Giải thưởng Đổi mới y tế",
      year: "2022",
      description: "Ghi nhận cho những đổi mới trong ứng dụng công nghệ y tế số",
      icon: <ExperimentOutlined />
    },
    {
      title: "Bệnh viện xanh",
      year: "2021",
      description: "Đạt chứng nhận bệnh viện thân thiện môi trường",
      icon: <CheckCircleOutlined />
    },
  ];

  const Counter = ({ value, label, icon, color }) => {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView({
      threshold: 0.5,
      triggerOnce: true
    });

    useEffect(() => {
      if (inView) {
        const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const steps = 60;
        const step = numericValue / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= numericValue) {
            setCount(numericValue);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    }, [inView, value]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center" }}
      >
        <motion.div
          style={{ fontSize: "3rem", marginBottom: 16, color }}
          whileHover={{ scale: 1.2, rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <Statistic
          title={
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15 }}>
              {label}
            </span>
          }
          value={value.includes('%') ? value : count + value.replace(/[0-9]/g, '')}
          valueStyle={{ color: "white", fontSize: "2.5rem", fontWeight: "bold" }}
        />
      </motion.div>
    );
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)", minHeight: "100vh", padding: "60px 0" }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
          padding: "80px 0",
          marginBottom: 80,
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="container">
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} md={12}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Title level={1} style={{ color: "white", marginBottom: 24, fontSize: "3.5rem", fontWeight: 700 }}>
                  Giới thiệu về chúng tôi
                </Title>
                <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
                  Bệnh viện chúng tôi là hệ thống y tế được xây dựng với sứ mệnh mang lại dịch vụ chăm sóc sức khỏe
                  toàn diện, hiện đại và nhân văn. Chúng tôi hướng đến chuẩn mực y tế quốc tế, kết hợp giữa chuyên môn
                  và sự tận tâm trong chăm sóc bệnh nhân.
                </Paragraph>
                <Space size="middle">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CalendarOutlined />}
                      onClick={handleBookingClick}
                      style={{
                        background: "white",
                        color: "#096dd9",
                        border: "none",
                        height: 50,
                        padding: "0 32px",
                        fontWeight: 600,
                        borderRadius: 12
                      }}
                    >
                      Đặt lịch khám
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="large"
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/news")}
                      style={{
                        color: "white",
                        borderColor: "rgba(255, 255, 255, 0.8)",
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(10px)",
                        height: 50,
                        padding: "0 32px",
                        fontSize: 16,
                        fontWeight: 500,
                        borderRadius: 12
                      }}
                    >
                      Xem tin tức
                    </Button>
                  </motion.div>
                </Space>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ textAlign: "center", position: "relative" }}
              >
                <motion.img
            src={about1}
            alt="Giới thiệu"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    borderRadius: 20,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="floating-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <Card size="small" style={{ background: "white", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                    <Space>
                      <Avatar size="small" style={{ background: "#52c41a" }} icon={<CheckCircleOutlined />} />
                      <Text strong style={{ color: "#096dd9" }}>Đã điều trị 50,000+ bệnh nhân</Text>
                    </Space>
                  </Card>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>

      <div className="container">
        {/* Vision & Mission */}
        <FadeInWhenVisible>
          <Row gutter={[48, 32]} align="middle" style={{ marginBottom: 80 }}>
            <Col xs={24} md={12}>
              <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Card
                  style={{
                    height: "100%",
                    border: "none",
                    borderRadius: 24,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                  }}
                  bodyStyle={{ padding: 48 }}
                >
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <motion.div 
                      style={{ fontSize: "4rem", color: "white", textAlign: "center" }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <GlobalOutlined />
                    </motion.div>
                    <Title level={2} style={{ color: "white", marginBottom: 24, textAlign: "center", fontSize: "2.2rem" }}>
                      Tầm nhìn
                    </Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
                      Trở thành bệnh viện hàng đầu trong khu vực, nơi mang đến chất lượng điều trị xuất sắc, dịch vụ chăm
                      sóc toàn diện và xây dựng niềm tin bền vững cho cộng đồng.
                    </Paragraph>
                  </Space>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Card
                  style={{
                    height: "100%",
                    border: "none",
                    borderRadius: 24,
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    boxShadow: "0 20px 40px rgba(240, 147, 251, 0.3)",
                  }}
                  bodyStyle={{ padding: 48 }}
                >
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <motion.div 
                      style={{ fontSize: "4rem", color: "white", textAlign: "center" }}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HeartOutlined />
                    </motion.div>
                    <Title level={2} style={{ color: "white", marginBottom: 24, textAlign: "center", fontSize: "2.2rem" }}>
                      Sứ mệnh
                    </Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
                      Chăm sóc sức khỏe bằng Tài năng, Y đức và Sự thấu cảm. Luôn đặt con người làm trung tâm trong mọi hoạt
                      động và cam kết mang đến dịch vụ y tế chất lượng cao.
                    </Paragraph>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </FadeInWhenVisible>

        {/* Stats */}
        <FadeInWhenVisible>
          <motion.div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "80px 40px",
              borderRadius: 24,
              marginBottom: 80,
              position: "relative",
              overflow: "hidden"
            }}
            whileInView={{ scale: [0.9, 1] }}
            transition={{ duration: 0.5 }}
          >
            <div className="floating-shapes">
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
            </div>
            <Title level={2} style={{ textAlign: "center", color: "white", marginBottom: 60, fontSize: "2.8rem" }}>
              Thành tựu nổi bật
            </Title>
            <Row gutter={[32, 32]}>
              {stats.map((stat, idx) => (
                <Col xs={12} sm={12} md={6} key={idx}>
                  <Counter {...stat} />
                </Col>
              ))}
            </Row>
          </motion.div>
        </FadeInWhenVisible>

        {/* Core Values */}
        <div style={{ marginBottom: 80 }}>
          <FadeInWhenVisible>
            <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.8rem" }}>
              Giá trị cốt lõi – H.E.A.R.T
            </Title>
            <Paragraph style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}>
              Những giá trị đạo đức và chuyên môn định hướng mọi hoạt động của chúng tôi
            </Paragraph>
          </FadeInWhenVisible>
          
          <StaggerChildren>
            <Row gutter={[24, 24]}>
              {heartValues.map((value, idx) => (
                <Col xs={24} md={12} key={idx}>
                  <SlideInItem>
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                      <Card
                        hoverable
                        style={{
                          height: "100%",
                          border: "none",
                          borderRadius: 20,
                          background: "white",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                          overflow: "hidden",
                          position: "relative"
                        }}
                        bodyStyle={{ padding: 32 }}
                      >
                        <div 
                          className="value-glow"
                          style={{ background: value.color }}
                        ></div>
                        <Space align="start" size="large" style={{ width: "100%", position: "relative", zIndex: 2 }}>
                          <motion.div
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 20,
                              background: `linear-gradient(135deg, ${value.color} 0%, ${value.color}99 100%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 32,
                              fontWeight: "bold",
                              flexShrink: 0,
                            }}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            {value.letter}
                          </motion.div>
                          <div style={{ flex: 1 }}>
                            <Title level={4} style={{ color: "#096dd9", marginBottom: 12, fontSize: 20 }}>
                              {value.title}
                            </Title>
                            <Paragraph style={{ color: "#666", margin: 0, fontSize: 15, lineHeight: 1.8 }}>
                              {value.description}
                            </Paragraph>
            </div>
                        </Space>
                      </Card>
                    </motion.div>
                  </SlideInItem>
                </Col>
              ))}
            </Row>
          </StaggerChildren>
            </div>

        {/* Timeline */}
        <div style={{ marginBottom: 80 }}>
          <FadeInWhenVisible>
            <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.8rem" }}>
              Hành trình phát triển
            </Title>
            <Paragraph style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}>
              Những cột mốc quan trọng trong quá trình xây dựng và phát triển của chúng tôi
            </Paragraph>
          </FadeInWhenVisible>
          
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <StaggerChildren>
              {milestones.map((milestone, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    visible: { opacity: 1, x: 0 },
                    hidden: { opacity: 0, x: idx % 2 === 0 ? -50 : 50 }
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                    <Card
                      style={{
                        marginBottom: 32,
                        border: "none",
                        borderRadius: 20,
                        background: "white",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      bodyStyle={{ padding: 40 }}
                    >
                      <div className="timeline-glow"></div>
                      <Space size="large" align="start" style={{ width: "100%", position: "relative", zIndex: 2 }}>
                        <motion.div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 32,
                            flexShrink: 0,
                          }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {milestone.icon}
                        </motion.div>
                        <div style={{ flex: 1 }}>
                          <Tag color="blue" style={{ fontSize: 16, padding: "6px 16px", marginBottom: 12, borderRadius: 12 }}>
                            {milestone.year}
                          </Tag>
                          <Title level={4} style={{ color: "#096dd9", margin: "8px 0", fontSize: 22 }}>
                            {milestone.title}
                          </Title>
                          <Paragraph style={{ color: "#666", margin: 0, fontSize: 16, lineHeight: 1.8 }}>
                            {milestone.description}
                          </Paragraph>
            </div>
                      </Space>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ marginBottom: 80 }}>
          <FadeInWhenVisible>
            <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 16, fontSize: "2.8rem" }}>
              Giải thưởng & Chứng nhận
            </Title>
            <Paragraph style={{ textAlign: "center", fontSize: 18, color: "#666", marginBottom: 60, maxWidth: 800, margin: "0 auto 60px" }}>
              Những ghi nhận về chất lượng dịch vụ và đóng góp của chúng tôi
            </Paragraph>
          </FadeInWhenVisible>
          
          <StaggerChildren>
            <Row gutter={[24, 24]}>
              {achievements.map((achievement, idx) => (
                <Col xs={24} sm={12} md={6} key={idx}>
                  <SlideInItem>
                    <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                      <Card
                        hoverable
                        style={{
                          height: "100%",
                          border: "none",
                          borderRadius: 20,
                          background: "white",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                          textAlign: "center",
                          position: "relative",
                          overflow: "hidden"
                        }}
                        bodyStyle={{ padding: 32, position: "relative", zIndex: 2 }}
                      >
                        <div className="achievement-glow"></div>
                        <motion.div
                          style={{ fontSize: "3rem", color: "#faad14", marginBottom: 20 }}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {achievement.icon}
                        </motion.div>
                        <Tag color="gold" style={{ fontSize: 13, padding: "4px 12px", marginBottom: 16, borderRadius: 12 }}>
                          {achievement.year}
                        </Tag>
                        <Title level={5} style={{ color: "#096dd9", marginBottom: 12, fontSize: 16 }}>
                          {achievement.title}
                        </Title>
                        <Paragraph style={{ color: "#666", margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                          {achievement.description}
                        </Paragraph>
                      </Card>
                    </motion.div>
                  </SlideInItem>
                </Col>
              ))}
            </Row>
          </StaggerChildren>
        </div>

        {/* Contact Section */}
        <FadeInWhenVisible>
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }}>
            <Card
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: 24,
                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.4)",
                overflow: "hidden",
                position: "relative"
              }}
              bodyStyle={{ padding: 60, position: "relative", zIndex: 2 }}
            >
              <div className="contact-shapes">
                <div className="contact-shape shape-1"></div>
                <div className="contact-shape shape-2"></div>
              </div>
              
              <Row gutter={[48, 32]} align="middle">
                <Col xs={24} md={14}>
                  <Title level={2} style={{ color: "white", marginBottom: 24, fontSize: "2.5rem" }}>
                    Liên hệ với chúng tôi
                  </Title>
                  <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất.
                  </Paragraph>
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    {[
                      { icon: <PhoneOutlined />, text: "1900 123 456" },
                      { icon: <MailOutlined />, text: "hospitalcare@gmail.com" },
                      { icon: <EnvironmentOutlined />, text: "12 Đường Hạnh Thông, Phường 12, Gò Vấp, TP. Hồ Chí Minh" }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Space size="large">
                          <div style={{ fontSize: 24, color: "white", width: 24 }}>{item.icon}</div>
                          <Text style={{ color: "white", fontSize: 16 }}>{item.text}</Text>
                        </Space>
                      </motion.div>
                    ))}
                  </Space>
                </Col>
                <Col xs={24} md={10}>
                  <motion.div
                    style={{ textAlign: "center" }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
          <img
            src={about2}
                      alt="Liên hệ"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        borderRadius: 20,
                        boxShadow: "0 16px 32px rgba(0,0,0,0.3)",
                      }}
                    />
                  </motion.div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </FadeInWhenVisible>
      </div>

      {/* Floating Action Button */}
      <FloatButton.BackTop 
        icon={<UpCircleOutlined />}
        style={{ 
          right: 24,
          bottom: 24,
        }}
      />

      {/* Modals */}
      <BookingModal
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginRequiredModal}
        onCancel={() => {
          setShowLoginRequiredModal(false);
        }}
      />
    </div>
  );
};

export default About;