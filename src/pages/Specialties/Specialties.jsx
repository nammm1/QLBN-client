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
  Tag,
  Space,
  Divider
} from "antd";
import { 
  MedicineBoxOutlined, 
  ClockCircleOutlined,
  ExperimentOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  BuildOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Specialties.css";
import apiChuyenKhoa from "../../api/ChuyenKhoa";

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
        visible: { opacity: 1, x: 0, y: 0 },
        hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50, y: 20 }
      }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
};

// Color mapping for specialties
const getSpecialtyColor = (specialtyName) => {
  const colors = {
    'Tim mạch': '#eb2f96',
    'Thần kinh': '#722ed1',
    'Nhi khoa': '#13c2c2',
    'Nội tiết': '#52c41a',
    'Ngoại khoa': '#faad14',
    'Sản phụ khoa': '#fa8c16',
    'Mắt': '#1890ff',
    'Tai mũi họng': '#2f54eb',
    'Da liễu': '#eb2f96',
  };
  
  // Try to match specialty name
  for (const [key, color] of Object.entries(colors)) {
    if (specialtyName?.includes(key)) {
      return color;
    }
  }
  
  // Default gradient colors
  const defaultColors = ['#096dd9', '#52c41a', '#faad14', '#eb2f96', '#13c2c2', '#722ed1'];
  const index = specialtyName?.charCodeAt(0) || 0;
  return defaultColors[index % defaultColors.length];
};

const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const perPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiChuyenKhoa.getAllChuyenKhoa();
        console.log(data);
        setSpecialties(data); 
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(specialties.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentSpecialties = specialties.slice(indexOfFirst, indexOfLast);

  const handleCardClick = (specialty) => {
    setSelectedSpecialty(specialty);
    setModalVisible(true);
  };

  return (
    <div className="specialties-page" style={{ 
      background: "linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)", 
      minHeight: "100vh", 
      padding: "80px 0 60px" 
    }}>
      <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {/* Header Section */}
        <FadeInWhenVisible>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Title 
                level={1} 
                style={{ 
                  color: "#096dd9", 
                  marginBottom: 16,
                  fontSize: 42,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                Đội Ngũ Chuyên Khoa
              </Title>
            </motion.div>
            <Paragraph 
              style={{ 
                fontSize: 18, 
                color: "#666", 
                maxWidth: 800, 
                margin: "0 auto",
                lineHeight: 1.8
              }}
            >
              Hệ thống chuyên khoa đa dạng, được trang bị thiết bị hiện đại và đội ngũ bác sĩ giàu kinh nghiệm, 
              cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho cộng đồng.
            </Paragraph>
          </div>
        </FadeInWhenVisible>

        {/* Specialties Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spin size="large" />
          </div>
        ) : currentSpecialties.length === 0 ? (
          <Empty description="Không có chuyên khoa nào" />
        ) : (
          <>
            <StaggerChildren>
              <Row gutter={[24, 24]} className="specialty-row">
                {currentSpecialties.map((s, index) => {
                  const specialtyColor = getSpecialtyColor(s.ten_chuyen_khoa);
                  return (
                    <Col xs={12} sm={8} md={6} lg={4} xl={4} key={s.id_chuyen_khoa}>
                      <SlideInItem index={index}>
                        <motion.div 
                          whileHover={{ y: -8 }} 
                          transition={{ duration: 0.3 }}
                          style={{ height: "100%", display: "flex", flexDirection: "column" }}
                        >
                          <Card
                            hoverable
                            onClick={() => handleCardClick(s)}
                            className="specialty-card"
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
                              flexDirection: "column",
                              transition: "all 0.3s ease"
                            }}
                            bodyStyle={{
                              textAlign: "center",
                              padding: 32,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "stretch",
                              justifyContent: "space-between",
                              flex: 1,
                              height: "100%",
                              minHeight: 280
                            }}
                          >
                            {/* Top gradient bar */}
                            <div 
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: `linear-gradient(90deg, ${specialtyColor}, ${specialtyColor}99)`,
                                transform: "scaleX(0)",
                                transformOrigin: "left",
                                transition: "transform 0.3s ease"
                              }}
                              className="specialty-card-top-bar"
                            />

                            {/* Glow effect */}
                            <div 
                              className="specialty-card-glow"
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: `radial-gradient(circle at center, ${specialtyColor}15 0%, transparent 70%)`,
                                opacity: 0,
                                transition: "opacity 0.3s ease",
                                pointerEvents: "none"
                              }}
                            />

                            {/* Content */}
                            <div className="specialty-card-content" style={{ position: "relative", zIndex: 2 }}>
                              <div className="specialty-card-icon-wrapper">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div
                                    style={{
                                      width: 100,
                                      height: 100,
                                      margin: "0 auto",
                                      borderRadius: "50%",
                                      background: `linear-gradient(135deg, ${specialtyColor}20 0%, ${specialtyColor}05 100%)`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: `3px solid ${specialtyColor}30`,
                                      boxShadow: `0 4px 20px ${specialtyColor}20`
                                    }}
                                  >
                                    {s.hinh_anh ? (
        <img
          src={s.hinh_anh}
          alt={s.ten_chuyen_khoa}
                                        style={{
                                          width: 70,
                                          height: 70,
                                          objectFit: "contain"
                                        }}
                                      />
                                    ) : (
                                      <MedicineBoxOutlined 
                                        style={{ 
                                          fontSize: 48, 
                                          color: specialtyColor 
                                        }} 
                                      />
                                    )}
      </div>
                                </motion.div>
    </div>
                              
                              <div className="specialty-card-title-wrapper">
                                <Title 
                                  level={5} 
                                  className="specialty-card-title"
                                  style={{ 
                                    color: "#096dd9", 
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    textAlign: "center",
                                    width: "100%"
                                  }}
                                >
                                  {s.ten_chuyen_khoa}
                                </Title>
</div>

                              <div className="specialty-card-button-wrapper">
                                <Tag 
                                  color={specialtyColor}
                                  style={{
                                    border: "none",
                                    borderRadius: 12,
                                    padding: "4px 12px",
                                    fontWeight: 500
                                  }}
                                >
                                  Xem chi tiết
                                </Tag>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </SlideInItem>
                    </Col>
                  );
                })}
              </Row>
            </StaggerChildren>

        {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: "center", marginTop: 60 }}
              >
                <Pagination
                  current={currentPage}
                  total={specialties.length}
                  pageSize={perPage}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => (
                    <Text strong style={{ color: "#096dd9" }}>
                      {range[0]}-{range[1]} / {total} chuyên khoa
                    </Text>
                  )}
                  itemRender={(page, type, originalElement) => (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {originalElement}
                    </motion.div>
                  )}
                />
              </motion.div>
            )}
          </>
        )}

        {/* Modal chi tiết */}
        <AnimatePresence>
          {modalVisible && (
            <Modal
              title={null}
              open={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                setSelectedSpecialty(null);
              }}
              footer={null}
              width={900}
              style={{ top: 20 }}
              className="specialty-modal"
            >
              {selectedSpecialty && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ padding: "20px 0" }}
                >
                  {/* Header */}
                  <div style={{ marginBottom: 32, textAlign: "center" }}>
                    <div style={{ marginBottom: 16 }}>
                      {selectedSpecialty.hinh_anh && (
                        <img
                          src={selectedSpecialty.hinh_anh}
                          alt={selectedSpecialty.ten_chuyen_khoa}
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "contain",
                            marginBottom: 16,
                            borderRadius: 20,
                            background: `linear-gradient(135deg, ${getSpecialtyColor(selectedSpecialty.ten_chuyen_khoa)}20 0%, transparent 100%)`,
                            padding: 20
                          }}
                        />
                      )}
        </div>
                    <Title 
                      level={2} 
                      style={{ 
                        color: getSpecialtyColor(selectedSpecialty.ten_chuyen_khoa), 
                        margin: 0,
                        fontSize: 32,
                        fontWeight: 700
                      }}
                    >
                      {selectedSpecialty.ten_chuyen_khoa}
                    </Title>
      </div>

                  <Divider style={{ borderColor: "#f0f0f0" }} />

                  {/* Giới thiệu */}
                  <div style={{ marginBottom: 32 }}>
                    <Space style={{ marginBottom: 16 }}>
                      <MedicineBoxOutlined 
                        style={{ 
                          fontSize: 24, 
                          color: getSpecialtyColor(selectedSpecialty.ten_chuyen_khoa) 
                        }} 
                      />
                      <Title level={4} style={{ margin: 0, color: "#096dd9" }}>
                        Giới thiệu
                      </Title>
                    </Space>
                    <Paragraph 
                      style={{ 
                        fontSize: 16, 
                        lineHeight: 1.8, 
                        color: "#666",
                        margin: 0,
                        textAlign: "justify"
                      }}
                    >
                      {selectedSpecialty.mo_ta || "Chuyên khoa này cung cấp các dịch vụ y tế chuyên sâu với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại."}
                    </Paragraph>
              </div>

                  {/* Cơ sở vật chất */}
                  {selectedSpecialty.thiet_bi && (
                    <div style={{ marginBottom: 32 }}>
                      <Space style={{ marginBottom: 16 }}>
                        <BuildOutlined 
                          style={{ 
                            fontSize: 24, 
                            color: getSpecialtyColor(selectedSpecialty.ten_chuyen_khoa) 
                          }} 
                        />
                        <Title level={4} style={{ margin: 0, color: "#096dd9" }}>
                          Cơ sở vật chất
                        </Title>
                      </Space>
                      <Paragraph 
                        style={{ 
                          fontSize: 16, 
                          lineHeight: 1.8, 
                          color: "#666",
                          margin: 0,
                          textAlign: "justify"
                        }}
                      >
                        {selectedSpecialty.thiet_bi}
                      </Paragraph>
                    </div>
                  )}

                  {/* Thời gian hoạt động */}
                  {selectedSpecialty.thoi_gian_hoat_dong && (
                    <div>
                      <Space style={{ marginBottom: 16 }}>
                        <ClockCircleOutlined 
                          style={{ 
                            fontSize: 24, 
                            color: getSpecialtyColor(selectedSpecialty.ten_chuyen_khoa) 
                          }} 
                        />
                        <Title level={4} style={{ margin: 0, color: "#096dd9" }}>
                          Thời gian hoạt động
                        </Title>
                      </Space>
                      <Tag 
                        color={getSpecialtyColor(selectedSpecialty.ten_chuyen_khoa)}
                        style={{ 
                          fontSize: 16, 
                          padding: "8px 20px",
                          borderRadius: 20,
                          border: "none",
                          fontWeight: 600
                        }}
                      >
                        {selectedSpecialty.thoi_gian_hoat_dong}
                      </Tag>
        </div>
      )}
                </motion.div>
              )}
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Specialties;
