import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Space,
  Tag,
  Spin,
  Empty,
  Statistic,
  Badge,
} from "antd";
import {
  HeartOutlined,
  ExperimentOutlined,
  SafetyOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./Services.css";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// Data giả với hình ảnh từ Unsplash
const mockServices = [
  {
    id: "DV_001",
    ten_dich_vu: "Khám bệnh tổng quát",
    mo_ta: "Khám sức khỏe tổng quát với các xét nghiệm cơ bản, đánh giá tình trạng sức khỏe tổng thể và tư vấn chế độ dinh dưỡng phù hợp.",
    don_gia: 200000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    category: "Khám bệnh",
    rating: 4.8,
    reviews: 1245,
    featured: true,
  },
  {
    id: "DV_002",
    ten_dich_vu: "Xét nghiệm máu tổng quát",
    mo_ta: "Xét nghiệm công thức máu đầy đủ bao gồm hồng cầu, bạch cầu, tiểu cầu và các chỉ số sinh hóa quan trọng.",
    don_gia: 120000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1582719201953-5c2fab346359?w=800&h=600&fit=crop",
    category: "Xét nghiệm",
    rating: 4.9,
    reviews: 892,
  },
  {
    id: "DV_003",
    ten_dich_vu: "Chụp X-quang",
    mo_ta: "Chụp X-quang ngực, xương khớp và các bộ phận khác với công nghệ kỹ thuật số hiện đại, an toàn và chính xác.",
    don_gia: 150000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    category: "Chẩn đoán hình ảnh",
    rating: 4.7,
    reviews: 654,
  },
  {
    id: "DV_004",
    ten_dich_vu: "Siêu âm",
    mo_ta: "Siêu âm 2D, 3D, 4D với máy móc hiện đại, hỗ trợ chẩn đoán bệnh lý và theo dõi thai kỳ an toàn.",
    don_gia: 200000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    category: "Chẩn đoán hình ảnh",
    rating: 4.8,
    reviews: 1123,
    featured: true,
  },
  {
    id: "DV_005",
    ten_dich_vu: "Nội soi dạ dày",
    mo_ta: "Nội soi dạ dày - tá tràng với công nghệ cao, ít đau đớn, hỗ trợ chẩn đoán và điều trị hiệu quả.",
    don_gia: 800000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop",
    category: "Nội soi",
    rating: 4.6,
    reviews: 456,
  },
  {
    id: "DV_006",
    ten_dich_vu: "Điện tim (ECG)",
    mo_ta: "Ghi điện tim 12 chuyển đạo để phát hiện các rối loạn nhịp tim và bệnh lý tim mạch sớm nhất.",
    don_gia: 100000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop",
    category: "Tim mạch",
    rating: 4.7,
    reviews: 789,
  },
  {
    id: "DV_007",
    ten_dich_vu: "Tư vấn dinh dưỡng",
    mo_ta: "Tư vấn dinh dưỡng cá nhân hóa với chuyên gia dinh dưỡng, lập kế hoạch ăn uống khoa học và hiệu quả.",
    don_gia: 300000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
    category: "Tư vấn",
    rating: 4.9,
    reviews: 567,
    featured: true,
  },
  {
    id: "DV_008",
    ten_dich_vu: "Khám mắt chuyên sâu",
    mo_ta: "Khám mắt tổng quát và chuyên sâu, đo thị lực, kiểm tra các bệnh lý về mắt với thiết bị hiện đại.",
    don_gia: 250000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    category: "Mắt",
    rating: 4.8,
    reviews: 445,
  },
  {
    id: "DV_009",
    ten_dich_vu: "Xét nghiệm nước tiểu",
    mo_ta: "Phân tích nước tiểu đầy đủ để phát hiện các bệnh lý về thận, đường tiết niệu và các vấn đề sức khỏe khác.",
    don_gia: 80000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1582719471384-8946dc7c0f59?w=800&h=600&fit=crop",
    category: "Xét nghiệm",
    rating: 4.6,
    reviews: 334,
  },
  {
    id: "DV_010",
    ten_dich_vu: "Xét nghiệm chức năng gan",
    mo_ta: "Xét nghiệm đánh giá chức năng gan với các chỉ số SGOT, SGPT, Bilirubin và các men gan quan trọng.",
    don_gia: 200000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop",
    category: "Xét nghiệm",
    rating: 4.7,
    reviews: 678,
  },
  {
    id: "DV_011",
    ten_dich_vu: "Chụp CT Scanner",
    mo_ta: "Chụp cắt lớp vi tính (CT) với công nghệ đa lát cắt, hỗ trợ chẩn đoán chính xác các bệnh lý phức tạp.",
    don_gia: 1500000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    category: "Chẩn đoán hình ảnh",
    rating: 4.8,
    reviews: 234,
    featured: true,
  },
  {
    id: "DV_012",
    ten_dich_vu: "Khám sức khỏe định kỳ",
    mo_ta: "Gói khám sức khỏe định kỳ toàn diện với các xét nghiệm cơ bản, tầm soát bệnh lý và đánh giá tổng thể.",
    don_gia: 500000,
    trang_thai: "Hoạt động",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    category: "Khám bệnh",
    rating: 4.9,
    reviews: 1567,
  },
];

// Mapping icons theo tên dịch vụ
const getServiceIcon = (category) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("khám")) {
    return <HeartOutlined />;
  } else if (cat.includes("xét nghiệm")) {
    return <ExperimentOutlined />;
  } else if (cat.includes("hình ảnh") || cat.includes("ct") || cat.includes("scanner")) {
    return <ExperimentOutlined />;
  } else if (cat.includes("nội soi")) {
    return <SafetyOutlined />;
  } else if (cat.includes("dinh dưỡng") || cat.includes("tư vấn")) {
    return <TeamOutlined />;
  } else if (cat.includes("tim")) {
    return <HeartOutlined />;
  } else if (cat.includes("mắt")) {
    return <EyeOutlined />;
  } else {
    return <CustomerServiceOutlined />;
  }
};

// Mapping màu sắc
const getServiceColor = (index) => {
  const colors = [
    "#ff4d4f",
    "#1890ff",
    "#52c41a",
    "#722ed1",
    "#fa8c16",
    "#eb2f96",
    "#13c2c2",
    "#faad14",
    "#2f54eb",
    "#f5222d",
    "#52c41a",
    "#fa541c",
  ];
  return colors[index % colors.length];
};

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Sử dụng data giả thay vì API
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setServices(mockServices);
      setFilteredServices(mockServices);
      setLoading(false);
    }, 500);
  }, []);

  // Get unique categories
  const categories = ["Tất cả", ...new Set(mockServices.map((s) => s.category))];

  // Filter services
  useEffect(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.ten_dich_vu?.toLowerCase().includes(searchText.toLowerCase()) ||
          service.mo_ta?.toLowerCase().includes(searchText.toLowerCase()) ||
          service.category?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchText, services, selectedCategory]);

  // Scroll animation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll(".animate-on-scroll");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.disconnect());
    };
  }, []);

  // Format price
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Statistics
  const totalServices = services.length;
  const activeCount = services.filter(
    (s) => s.trang_thai === "Hoạt động" || s.trang_thai === "hoạt động"
  ).length;

  return (
    <div className="services-page">
      {/* Hero Section */}
      <div className="services-hero animate-on-scroll">
        <div className="services-hero-overlay" />
        <div className="container">
          <div className="services-hero-content">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 10,
              }}
            >
              Quay lại
            </Button>
            <Space direction="vertical" size="large" align="center" style={{ position: "relative", zIndex: 2 }}>
              <Title
                level={1}
                className={`services-main-title ${isVisible ? "animate-fade-in-up" : ""}`}
              >
                Dịch vụ y tế
              </Title>
              <Paragraph
                className={`services-subtitle ${isVisible ? "animate-fade-in-up-delay" : ""}`}
              >
                Khám phá các dịch vụ y tế chất lượng cao với đội ngũ chuyên gia giàu kinh nghiệm
              </Paragraph>
              <Search
                placeholder="Tìm kiếm dịch vụ..."
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={setSearchText}
                style={{
                  maxWidth: 600,
                  width: "100%",
                }}
                className={`services-search ${isVisible ? "animate-fade-in-up-delay" : ""}`}
              />
            </Space>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="section-gradient animate-on-scroll" id="stats">
        <div className="container">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} sm={8} md={6}>
              <div className={`stat-card ${isVisible ? "animate-scale-in" : ""}`}>
                <Statistic
                  title="Tổng dịch vụ"
                  value={totalServices}
                  prefix={<CustomerServiceOutlined />}
                  valueStyle={{ color: "#fff", fontSize: "2.5rem", fontWeight: "bold" }}
                />
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div className={`stat-card ${isVisible ? "animate-scale-in" : ""}`} style={{ animationDelay: "0.15s" }}>
                <Statistic
                  title="Dịch vụ đang hoạt động"
                  value={activeCount}
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: "#fff", fontSize: "2.5rem", fontWeight: "bold" }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Services Grid */}
      <div className="section-white animate-on-scroll" id="services-grid" style={{ padding: "80px 0" }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Spin size="large" />
            </div>
          ) : filteredServices.length === 0 ? (
            <Empty
              description={
                searchText
                  ? "Không tìm thấy dịch vụ phù hợp với từ khóa của bạn"
                  : "Chưa có dịch vụ nào"
              }
              style={{ padding: "80px 0" }}
            />
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <Title level={2} style={{ color: "#096dd9", marginBottom: 16 }}>
                  Tất cả dịch vụ
                </Title>
                <Paragraph style={{ fontSize: 16, color: "#666" }}>
                  {filteredServices.length} dịch vụ được tìm thấy
                </Paragraph>
              </div>
              {/* Category Filter */}
              <div style={{ marginBottom: 32, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                {categories.map((category) => (
                  <Button
                    key={category}
                    type={selectedCategory === category ? "primary" : "default"}
                    size="large"
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      borderRadius: 20,
                      height: 40,
                      padding: "0 24px",
                      fontWeight: selectedCategory === category ? 600 : 400,
                      boxShadow: selectedCategory === category ? "0 4px 12px rgba(9, 109, 217, 0.3)" : "none",
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <Row gutter={[32, 32]}>
                {filteredServices.map((service, idx) => {
                  const color = getServiceColor(idx);
                  const icon = getServiceIcon(service.category);

                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={service.id || idx}>
                      <Badge.Ribbon
                        text="Nổi bật"
                        color="gold"
                        style={{ display: service.featured ? "block" : "none" }}
                      >
                        <Card
                          hoverable
                          className={`service-card-item ${isVisible ? "animate-stagger" : ""}`}
                          style={{
                            animationDelay: `${idx * 0.1}s`,
                            height: "100%",
                            borderRadius: 20,
                            border: "1px solid #e6f7ff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            transition: "all 0.3s",
                            position: "relative",
                            overflow: "hidden",
                            padding: 0,
                          }}
                          styles={{ body: { padding: 0 } }}
                          cover={
                            <div
                              style={{
                                position: "relative",
                                height: 200,
                                overflow: "hidden",
                                borderRadius: "20px 20px 0 0",
                              }}
                            >
                              <img
                                alt={service.ten_dich_vu}
                                src={service.image}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.4s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)`,
                                }}
                              />
                              <Tag
                                color={color}
                                style={{
                                  position: "absolute",
                                  top: 16,
                                  left: 16,
                                  borderRadius: 20,
                                  padding: "4px 16px",
                                  fontWeight: 600,
                                  border: "none",
                                  fontSize: 12,
                                }}
                              >
                                {service.category}
                              </Tag>
                              {service.rating && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 16,
                                    right: 16,
                                    background: "rgba(255, 255, 255, 0.95)",
                                    borderRadius: 20,
                                    padding: "4px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontWeight: 600,
                                    fontSize: 13,
                                  }}
                                >
                                  <StarOutlined style={{ color: "#faad14" }} />
                                  <span>{service.rating}</span>
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div style={{ padding: 24 }}>
                            {/* Content */}
                            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                              <Title
                                level={4}
                                style={{
                                  color: "#096dd9",
                                  margin: "0 0 8px 0",
                                  fontSize: 18,
                                  fontWeight: 600,
                                  minHeight: 54,
                                }}
                              >
                                {service.ten_dich_vu}
                              </Title>

                              <Paragraph
                                style={{
                                  color: "#666",
                                  margin: "0 0 16px 0",
                                  fontSize: 14,
                                  lineHeight: 1.6,
                                  minHeight: 66,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {service.mo_ta}
                              </Paragraph>

                              {/* Rating & Reviews */}
                              {service.rating && (
                                <div style={{ marginBottom: 12 }}>
                                  <Space>
                                    <StarOutlined style={{ color: "#faad14", fontSize: 14 }} />
                                    <Text strong style={{ fontSize: 14 }}>
                                      {service.rating}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      ({service.reviews} đánh giá)
                                    </Text>
                                  </Space>
                                </div>
                              )}

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: 16,
                                  borderTop: "1px solid #f0f0f0",
                                }}
                              >
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Giá:
                                  </Text>
                                  <br />
                                  <Text
                                    strong
                                    style={{
                                      color: color,
                                      fontSize: 20,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {formatPrice(service.don_gia)}
                                  </Text>
                                </div>
                                <Tag
                                  color="success"
                                  icon={<CheckCircleOutlined />}
                                  style={{ borderRadius: 12, padding: "4px 12px" }}
                                >
                                  {service.trang_thai}
                                </Tag>
                              </div>
                            </Space>
                          </div>

                          {/* Hover overlay */}
                          <div className="service-card-overlay" />
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  );
                })}
              </Row>
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="section-white animate-on-scroll" style={{ background: "#f0f2f5", padding: "80px 0" }}>
        <div className="container">
          <Card
            className="cta-card"
            style={{
              background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
              border: "none",
              borderRadius: 24,
              textAlign: "center",
              color: "white",
            }}
            styles={{ body: { padding: 60 } }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Title level={2} style={{ color: "white", margin: 0 }}>
                Sẵn sàng đặt lịch khám?
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, margin: 0 }}>
                Chọn dịch vụ phù hợp và đặt lịch hẹn ngay hôm nay
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate("/specialties")}
                style={{
                  background: "white",
                  color: "#096dd9",
                  border: "none",
                  height: 50,
                  padding: "0 40px",
                  fontSize: 16,
                  fontWeight: 600,
                  marginTop: 16,
                }}
              >
                Đặt lịch khám ngay
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;

