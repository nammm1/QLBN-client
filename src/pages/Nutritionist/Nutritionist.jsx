import React, { useState, useEffect } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Modal, 
  Pagination, 
  Spin, 
  Empty, 
  Avatar, 
  Space, 
  Tag,
  Rate,
  Divider
} from "antd";
import { 
  UserOutlined, 
  SafetyOutlined, 
  CrownOutlined, 
  FileTextOutlined,
  StarFilled,
  AppleOutlined,
  HeartOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Nutritionist.css";
import apiChuyenGiaDinhDuong from "../../api/ChuyenGiaDinhDuong";
import apiNguoiDung from "../../api/NguoiDung";

const { Title, Paragraph, Text } = Typography;

// Animation components
const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
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

const StaggerChildren = ({ children }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, threshold: 0.1 }}
      transition={{ staggerChildren: 0.15 }}
    >
      {children}
    </motion.div>
  );
};

const SlideInItem = ({ children, index }) => {
  return (
    <motion.div
      variants={{
        visible: { opacity: 1, x: 0 },
        hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
      }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

const Nutritionist = () => {
  const [nutritionists, setNutritionists] = useState([]);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const nutritionistsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chuyenGiaList = await apiChuyenGiaDinhDuong.getAll();

        const mergedData = await Promise.all(
          chuyenGiaList.map(async (cg) => {
            try {
              const user = await apiNguoiDung.getUserById(cg.id_chuyen_gia);
              // Add mock data for demo
              return { 
                ...cg, 
                ...user,
                rating: Math.random() * 2 + 3, // Random rating 3-5
                experience: Math.floor(Math.random() * 15) + 5, // 5-20 years
                clients: Math.floor(Math.random() * 3000) + 500, // 500-3500 clients
                isAvailable: Math.random() > 0.3, // 70% available
                achievements: [
                  "Chuyên gia dinh dưỡng xuất sắc 2023",
                  "Chứng nhận quốc tế",
                  "Top 10 chuyên gia giỏi"
                ].slice(0, Math.floor(Math.random() * 3) + 1)
              };
            } catch (err) {
              console.error("Lỗi lấy user:", err);
              return cg;
            }
          })
        );

        setNutritionists(mergedData);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách chuyên gia:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter nutritionists based on search
  const filteredNutritionists = nutritionists.filter(nutri => {
    const searchLower = searchTerm.toLowerCase().trim();
    return !searchLower || 
           nutri.ho_ten?.toLowerCase().includes(searchLower) ||
           nutri.hoc_vi?.toLowerCase().includes(searchLower) ||
           nutri.linh_vuc_chuyen_sau?.toLowerCase().includes(searchLower) ||
           nutri.chuc_vu?.toLowerCase().includes(searchLower);
  });

  const indexOfLast = currentPage * nutritionistsPerPage;
  const indexOfFirst = indexOfLast - nutritionistsPerPage;
  const currentNutritionists = filteredNutritionists.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredNutritionists.length / nutritionistsPerPage);

  const handleCardClick = (nutritionist) => {
    setSelectedNutritionist(nutritionist);
    setModalVisible(true);
  };

  const getNutritionistColor = () => {
    return "#52c41a"; // Green color for nutritionists
  };

  if (loading) {
    return (
      <div style={{ 
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)", 
        minHeight: "100vh", 
        padding: "60px 0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spin size="large" />
          <Paragraph style={{ textAlign: "center", marginTop: 16, color: "#52c41a" }}>
            Đang tải danh sách chuyên gia dinh dưỡng...
          </Paragraph>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)", 
      minHeight: "100vh", 
      padding: "60px 0",
      overflowX: "hidden",
      width: "100%"
    }}>
      <div className="container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header Section */}
        <FadeInWhenVisible>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Title level={1} style={{ 
                color: "#52c41a", 
                marginBottom: 16, 
                fontSize: "3.5rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}>
                Đội Ngũ Chuyên Gia Dinh Dưỡng
              </Title>
              <Paragraph style={{ 
                fontSize: 18, 
                color: "#666", 
                maxWidth: 600, 
                margin: "0 auto 32px",
                lineHeight: 1.6
              }}>
                Đội ngũ chuyên gia dinh dưỡng giàu kinh nghiệm, tận tâm với sứ mệnh 
                cải thiện sức khỏe và dinh dưỡng cho cộng đồng
              </Paragraph>
            </motion.div>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ maxWidth: 600, margin: "0 auto" }}
            >
              <Card
                style={{
                  borderRadius: 20,
                  border: "none",
                  background: "white",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  marginBottom: 32
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Tìm kiếm chuyên gia dinh dưỡng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <SearchOutlined className="search-icon" />
                </div>
              </Card>
            </motion.div>
          </div>
        </FadeInWhenVisible>

        {/* Nutritionists Grid */}
        {filteredNutritionists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Empty 
              description="Không tìm thấy chuyên gia dinh dưỡng phù hợp" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </motion.div>
        ) : (
          <>
            <StaggerChildren>
              <Row gutter={[24, 24]} className="nutritionist-row">
                {currentNutritionists.map((nutri, index) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={nutri.id_chuyen_gia}>
                    <SlideInItem index={index}>
                      <motion.div 
                        whileHover={{ y: -8 }} 
                        transition={{ duration: 0.3 }}
                        style={{ height: "100%" }}
                      >
                        <Card
                          hoverable
                          onClick={() => handleCardClick(nutri)}
                          className="nutritionist-card"
                          style={{
                            borderRadius: 20,
                            border: "none",
                            background: "white",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            height: "100%",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                          }}
                          styles={{
                            body: {
                            padding: 24, 
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                              height: "100%",
                            },
                          }}
                        >
                          {/* Background glow effect */}
                          <div className="card-glow"></div>
                          
                          <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                            <Space direction="vertical" size="middle" style={{ width: "100%", flex: 1 }}>
                              {/* Avatar and basic info */}
                              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Avatar
                src={nutri.anh_dai_dien}
                                    size={80}
                                    icon={<UserOutlined />}
                                    style={{ 
                                      border: `3px solid ${getNutritionistColor()}`,
                                      boxShadow: `0 4px 12px ${getNutritionistColor()}40`,
                                      flexShrink: 0
                                    }}
                                  />
                                </motion.div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Title 
                                    level={4} 
                                    style={{ 
                                      color: "#52c41a", 
                                      marginBottom: 8,
                                      fontSize: 18,
                                      marginTop: 0,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    {nutri.ho_ten}
                                  </Title>
                                  <Tag 
                                    color={getNutritionistColor()}
                                    style={{ 
                                      border: "none", 
                                      borderRadius: 12,
                                      padding: "4px 12px",
                                      fontWeight: 600,
                                      marginBottom: 8,
                                      display: "inline-block"
                                    }}
                                  >
                                    <AppleOutlined /> Chuyên gia dinh dưỡng
                                  </Tag>
                                  <div style={{ marginTop: 8 }}>
                                    <Rate 
                                      disabled 
                                      defaultValue={nutri.rating} 
                                      style={{ fontSize: 14 }} 
                                      character={<StarFilled />}
                                    />
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                      ({nutri.rating.toFixed(1)})
                                    </Text>
              </div>
            </div>
          </div>

                              <Divider style={{ margin: "12px 0" }} />

                              {/* Details */}
                              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <SafetyOutlined style={{ color: getNutritionistColor(), fontSize: 16 }} />
                                  <Text strong style={{ color: "#333" }}>Học vị: </Text>
                                  <Text style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {nutri.hoc_vi || "Chưa cập nhật"}
                                  </Text>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <CrownOutlined style={{ color: getNutritionistColor(), fontSize: 16 }} />
                                  <Text strong style={{ color: "#333" }}>Lĩnh vực: </Text>
                                  <Text style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {nutri.linh_vuc_chuyen_sau || "Chưa cập nhật"}
                                  </Text>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <TrophyOutlined style={{ color: getNutritionistColor(), fontSize: 16 }} />
                                  <Text strong style={{ color: "#333" }}>Chức vụ: </Text>
                                  <Text style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {nutri.chuc_vu || "Chưa cập nhật"}
                                  </Text>
                                </div>
                              </Space>

                              {/* Stats */}
                              <div style={{ 
                                display: "flex", 
                                justifyContent: "space-around", 
                                padding: "12px 0",
                                borderTop: "1px solid #f0f0f0",
                                marginTop: "auto"
                              }}>
                                <div style={{ textAlign: "center" }}>
                                  <Text strong style={{ fontSize: 16, color: getNutritionistColor() }}>
                                    {nutri.experience}
                                  </Text>
                                  <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Năm kinh nghiệm</Text>
                                  </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <Text strong style={{ fontSize: 16, color: getNutritionistColor() }}>
                                    {nutri.clients?.toLocaleString() || "500+"}
                                  </Text>
              <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Khách hàng</Text>
              </div>
            </div>
          </div>
                            </Space>
                          </div>
                        </Card>
                      </motion.div>
                    </SlideInItem>
                  </Col>
                ))}
              </Row>
            </StaggerChildren>

      {/* Pagination */}
      {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ textAlign: "center", marginTop: 40 }}
              >
                <Pagination
                  current={currentPage}
                  total={filteredNutritionists.length}
                  pageSize={nutritionistsPerPage}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} / ${total} chuyên gia`
                  }
                  style={{ marginTop: 24 }}
                />
              </motion.div>
            )}
          </>
      )}

      {/* Modal chi tiết */}
        <AnimatePresence>
          {modalVisible && (
            <Modal
              className="nutritionist-modal"
              title={
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: "flex", alignItems: "center", gap: 20 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar
                      src={selectedNutritionist?.anh_dai_dien}
                      size={80}
                      icon={<UserOutlined />}
                  style={{
                        border: `4px solid white`,
                        boxShadow: `0 4px 16px rgba(0,0,0,0.2)`
                      }}
                    />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <Title level={2} style={{ color: "white", margin: 0, fontSize: 28 }}>
                      {selectedNutritionist?.ho_ten}
                    </Title>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      <Tag 
                        color="white" 
                        style={{ 
                          color: "#52c41a", 
                          border: "none", 
                          borderRadius: 12,
                          padding: "4px 12px",
                          fontWeight: 600,
                          fontSize: 14
                        }}
                      >
                        <AppleOutlined /> Chuyên gia dinh dưỡng
                      </Tag>
                      {selectedNutritionist?.rating && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Rate 
                            disabled 
                            defaultValue={selectedNutritionist.rating} 
                            style={{ fontSize: 16 }}
                            character={<StarFilled style={{ color: "#ffd700" }} />}
                          />
                          <Text style={{ color: "white", marginLeft: 8, fontSize: 14, fontWeight: 600 }}>
                            ({selectedNutritionist.rating.toFixed(1)})
                          </Text>
                        </div>
                      )}
                </div>
              </div>
                </motion.div>
              }
              open={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                setSelectedNutritionist(null);
              }}
              footer={null}
              width={950}
              styles={{
                content: {
                  padding: 0
                }
              }}
            >
              {selectedNutritionist && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ padding: "32px" }}
                >
                  {/* Stats Cards */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                    <Col xs={12} sm={8}>
                      <Card
                        className="stat-card"
                        style={{
                          borderRadius: 16,
                          border: "none",
                          background: "linear-gradient(135deg, #52c41a15 0%, #73d13d15 100%)",
                          textAlign: "center",
                          height: "100%"
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TrophyOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                          <div>
                            <Text strong style={{ fontSize: 24, color: "#52c41a", display: "block" }}>
                              {selectedNutritionist.experience || "N/A"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>Năm kinh nghiệm</Text>
                          </div>
                        </motion.div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card
                        className="stat-card"
                        style={{
                          borderRadius: 16,
                          border: "none",
                          background: "linear-gradient(135deg, #52c41a15 0%, #73d13d15 100%)",
                          textAlign: "center",
                          height: "100%"
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <HeartOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                          <div>
                            <Text strong style={{ fontSize: 24, color: "#52c41a", display: "block" }}>
                              {selectedNutritionist.clients?.toLocaleString() || "500+"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>Khách hàng</Text>
                          </div>
                        </motion.div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card
                        className="stat-card"
                        style={{
                          borderRadius: 16,
                          border: "none",
                          background: "linear-gradient(135deg, #52c41a15 0%, #73d13d15 100%)",
                          textAlign: "center",
                          height: "100%"
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StarFilled style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                <div>
                            <Text strong style={{ fontSize: 24, color: "#52c41a", display: "block" }}>
                              {selectedNutritionist.rating?.toFixed(1) || "N/A"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>Đánh giá</Text>
                          </div>
                        </motion.div>
                      </Card>
                    </Col>
                  </Row>

                  {/* Information Cards */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                    <Col xs={24} sm={12}>
                      <Card
                        className="info-card"
                        style={{
                          borderRadius: 16,
                          border: "1px solid #e8f5e9",
                          background: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          height: "100%"
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <SafetyOutlined style={{ fontSize: 24, color: "white" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ color: "#52c41a", fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                              Học vị
                            </Text>
                            <Text style={{ fontSize: 16, color: "#333", fontWeight: 500 }}>
                              {selectedNutritionist.hoc_vi || "Chưa cập nhật"}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card
                        className="info-card"
                        style={{
                          borderRadius: 16,
                          border: "1px solid #e8f5e9",
                          background: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          height: "100%"
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <CrownOutlined style={{ fontSize: 24, color: "white" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ color: "#52c41a", fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                              Lĩnh vực chuyên sâu
                            </Text>
                            <Text style={{ fontSize: 16, color: "#333", fontWeight: 500 }}>
                              {selectedNutritionist.linh_vuc_chuyen_sau || "Chưa cập nhật"}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card
                        className="info-card"
                        style={{
                          borderRadius: 16,
                          border: "1px solid #e8f5e9",
                          background: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          height: "100%"
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <TrophyOutlined style={{ fontSize: 24, color: "white" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ color: "#52c41a", fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                              Chức vụ
                            </Text>
                            <Text style={{ fontSize: 16, color: "#333", fontWeight: 500 }}>
                              {selectedNutritionist.chuc_vu || "Chưa cập nhật"}
                            </Text>
                </div>
              </div>
                      </Card>
                    </Col>
                    {selectedNutritionist.email && (
                      <Col xs={24} sm={12}>
                        <Card
                          className="info-card"
                          style={{
                            borderRadius: 16,
                            border: "1px solid #e8f5e9",
                            background: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            height: "100%"
                          }}
                        styles={{ body: { padding: 20 } }}
                        >
                          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}>
                              <MailOutlined style={{ fontSize: 24, color: "white" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ color: "#52c41a", fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                                Email
                              </Text>
                              <Text style={{ fontSize: 16, color: "#333", fontWeight: 500 }}>
                                {selectedNutritionist.email}
                              </Text>
              </div>
            </div>
                        </Card>
                      </Col>
                    )}
                  </Row>

                  {/* Introduction Section */}
                  <Card
                    className="intro-card"
                    style={{
                      borderRadius: 16,
                      border: "1px solid #e8f5e9",
                      background: "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                    styles={{ body: { padding: 24 } }}
                  >
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)"
                      }}>
                        <FileTextOutlined style={{ fontSize: 28, color: "white" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Title level={4} style={{ color: "#52c41a", marginBottom: 16, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
                          Giới thiệu
                        </Title>
                        <Paragraph style={{ 
                          fontSize: 15, 
                          lineHeight: 1.8, 
                          color: "#555", 
                          margin: 0,
                          textAlign: "justify"
                        }}>
                          {selectedNutritionist.gioi_thieu_ban_than || "Chưa có thông tin giới thiệu."}
                        </Paragraph>
          </div>
        </div>
                  </Card>
                </motion.div>
              )}
            </Modal>
      )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Nutritionist;
