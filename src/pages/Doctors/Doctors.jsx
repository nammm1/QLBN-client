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
  Tag, 
  Space, 
  Button,
  Rate,
  Divider,
  FloatButton
} from "antd";
import { 
  UserOutlined, 
  SafetyOutlined, 
  CrownOutlined, 
  FileTextOutlined,
  StarFilled,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  HeartOutlined,
  ArrowRightOutlined,
  UpCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Doctors.css";
import apiBacSi from "../../api/BacSi";
import apiNguoiDung from "../../api/NguoiDung";
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
      animate="visible"
      variants={{
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        },
        hidden: {
          opacity: 0
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const SlideInItem = ({ children, index }) => {
  return (
    <motion.div
      variants={{
        visible: { 
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            damping: 20,
            stiffness: 100
          }
        },
        hidden: { 
          opacity: 0,
          x: index % 2 === 0 ? -20 : 20
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const Doctors = () => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
  const [availableSpecialties, setAvailableSpecialties] = useState(["Tất cả"]);

  const doctorsPerPage = 8;

  useEffect(() => {
  const fetchDoctors = async () => {
    try {
        setLoading(true);
        const bacSiList = await apiBacSi.getAll();

      const mergedData = await Promise.all(
        bacSiList.map(async (bs) => {
          try {
              const user = await apiNguoiDung.getUserById(bs.id_bac_si);
              // Add mock data for demo
              return { 
                ...bs, 
                ...user,
                rating: Math.random() * 2 + 3, // Random rating 3-5
                experience: Math.floor(Math.random() * 20) + 5, // 5-25 years
                patients: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 patients
                isAvailable: Math.random() > 0.3, // 70% available
                achievements: [
                  "Bác sĩ xuất sắc năm 2023",
                  "Chứng nhận quốc tế",
                  "Top 10 bác sĩ giỏi"
                ].slice(0, Math.floor(Math.random() * 3) + 1)
              };
          } catch (err) {
            console.error("Lỗi lấy user:", err);
            return bs;
          }
        })
      );

      setDoctorsList(mergedData);

        // Extract unique specialties - prioritize API data
        const specialtiesSet = new Set(["Tất cả"]);
        
        // First, try to get specialties from API
        try {
          const chuyenKhoaList = await apiChuyenKhoa.getAllChuyenKhoa();
          chuyenKhoaList.forEach(ck => {
            if (ck.ten_chuyen_khoa) {
              // Remove "Khoa" prefix if exists and normalize
              const specialtyName = ck.ten_chuyen_khoa.replace(/^Khoa\s+/i, '').trim();
              if (specialtyName && specialtyName.length > 2) {
                specialtiesSet.add(specialtyName);
              }
            }
          });
        } catch (err) {
          console.log("Không thể lấy danh sách chuyên khoa từ API, sử dụng dữ liệu từ bác sĩ");
        }
        
        // Also extract from doctors' chuyen_mon as fallback or supplement
        mergedData.forEach(doctor => {
          if (doctor.chuyen_mon) {
            // Normalize the specialty name
            const chuyenMon = doctor.chuyen_mon.trim();
            if (chuyenMon.length > 2) {
              // Remove "Khoa" prefix if exists
              const cleanedSpec = chuyenMon.replace(/^Khoa\s+/i, '').trim();
              if (cleanedSpec.length > 2) {
                // Add the full specialty name first
                specialtiesSet.add(cleanedSpec);
                
                // Split by common delimiters to extract individual specialties
                const specialtyParts = cleanedSpec
                  .split(/[-,•]/)
                  .map(s => s.trim())
                  .filter(s => s.length > 2); // Filter out very short strings
                
                specialtyParts.forEach(spec => {
                  // Clean and normalize each part
                  const normalizedSpec = spec.trim();
                  if (normalizedSpec.length > 2) {
                    specialtiesSet.add(normalizedSpec);
                    
                    // Also add main words (first 1-2 meaningful words)
                    const words = normalizedSpec.split(/\s+/).filter(w => w.length >= 3);
                    if (words.length >= 1) {
                      // Take first meaningful word(s) as main specialty
                      const mainSpec = words.slice(0, Math.min(2, words.length)).join(' ');
                      if (mainSpec.length > 2) {
                        specialtiesSet.add(mainSpec);
                      }
                    }
                  }
                });
              }
            }
          }
        });

        // Sort specialties with "Tất cả" always first
        const sortedSpecialties = ["Tất cả", ...Array.from(specialtiesSet).filter(s => s !== "Tất cả").sort()];
        setAvailableSpecialties(sortedSpecialties);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDoctors();
}, []);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty]);

  // Helper function to check if doctor matches specialty
  const matchesSpecialtyFilter = (doctor, specialty) => {
    if (specialty === "Tất cả") return true;
    
    const doctorSpecialty = doctor.chuyen_mon?.toLowerCase().trim() || "";
    if (!doctorSpecialty) return false;
    
    const specialtyLower = specialty.toLowerCase().trim();
    if (!specialtyLower) return false;
    
    // Remove "Khoa" prefix if exists for both
    const cleanDoctorSpecialty = doctorSpecialty.replace(/^khoa\s+/i, '').trim();
    const cleanSpecialty = specialtyLower.replace(/^khoa\s+/i, '').trim();
    
    // Exact match first (most accurate)
    if (cleanDoctorSpecialty === cleanSpecialty) {
      return true;
    }
    
    // Direct contains match
    if (cleanDoctorSpecialty.includes(cleanSpecialty) || cleanSpecialty.includes(cleanDoctorSpecialty)) {
      return true;
    }
    
    // Split doctor's specialty by common delimiters (comma, dash, bullet)
    const doctorSpecialtyParts = cleanDoctorSpecialty
      .split(/[-,•]/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
    
    // Check if any part of doctor's specialty exactly matches
    for (const docPart of doctorSpecialtyParts) {
      if (docPart === cleanSpecialty || docPart.includes(cleanSpecialty) || cleanSpecialty.includes(docPart)) {
        return true;
      }
    }
    
    // Split specialty into words and check if main words match
    const specialtyWords = cleanSpecialty.split(/\s+/).filter(w => w.length >= 3);
    if (specialtyWords.length > 0) {
      const mainWord = specialtyWords[0]; // First meaningful word
      // Check if main word exists in any part of doctor's specialty
      return doctorSpecialtyParts.some(docPart => docPart.includes(mainWord)) ||
             cleanDoctorSpecialty.includes(mainWord);
    }
    
    return false;
  };

  // Filter doctors based on search and specialty
  const filteredDoctors = doctorsList.filter(doctor => {
    // Search filter - handle multiple keywords
    const searchLower = searchTerm.toLowerCase().trim();
    let matchesSearch = true;
    
    if (searchLower) {
      // Split search term into keywords
      const searchKeywords = searchLower.split(/\s+/).filter(k => k.length > 0);
      
      // All keywords must match at least one field (AND logic)
      matchesSearch = searchKeywords.every(keyword => {
        const hoTen = doctor.ho_ten?.toLowerCase() || "";
        const chuyenMon = doctor.chuyen_mon?.toLowerCase() || "";
        const chucDanh = doctor.chuc_danh?.toLowerCase() || "";
        const email = doctor.email?.toLowerCase() || "";
        
        return hoTen.includes(keyword) ||
               chuyenMon.includes(keyword) ||
               chucDanh.includes(keyword) ||
               email.includes(keyword);
      });
    }
    
    // Specialty filter
    const matchesSpecialty = matchesSpecialtyFilter(doctor, selectedSpecialty);
    
    // Both search and specialty must match (AND logic)
    return matchesSearch && matchesSpecialty;
  });

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleCardClick = (doctor) => {
    setSelectedDoctor(doctor);
    setModalVisible(true);
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      "Tim mạch": "#ff4d4f",
      "Thần kinh": "#1890ff",
      "Tiêu hóa": "#52c41a",
      "Nhi khoa": "#faad14",
      "Sản phụ khoa": "#722ed1",
      "Da liễu": "#fa8c16",
      "Xương khớp": "#13c2c2"
    };
    return colors[specialty] || "#096dd9";
  };

  if (loading) {
    return (
      <div style={{ 
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)", 
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
          <Paragraph style={{ textAlign: "center", marginTop: 16, color: "#096dd9" }}>
            Đang tải danh sách bác sĩ...
          </Paragraph>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)", 
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
                color: "#096dd9", 
                marginBottom: 16, 
                fontSize: "3.5rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #096dd9 0%, #40a9ff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}>
                Đội Ngũ Bác Sĩ
              </Title>
              <Paragraph style={{ 
                fontSize: 18, 
                color: "#666", 
                maxWidth: 600, 
                margin: "0 auto 32px",
                lineHeight: 1.6
              }}>
                Đội ngũ bác sĩ chuyên môn cao, giàu kinh nghiệm và tận tâm với sứ mệnh 
                chăm sóc sức khỏe toàn diện cho cộng đồng
              </Paragraph>
            </motion.div>

            {/* Search and Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ maxWidth: 800, margin: "0 auto" }}
            >
              <Card
                style={{
                  borderRadius: 20,
                  border: "none",
                  background: "white",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  marginBottom: 32
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={12}>
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <UserOutlined className="search-icon" />
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="specialty-filter">
                      <select 
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="specialty-select"
                      >
                        {availableSpecialties.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </div>
        </FadeInWhenVisible>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Empty 
              description="Không tìm thấy bác sĩ phù hợp" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
      <StaggerChildren key={`doctors-${searchTerm}-${selectedSpecialty}`}>
        <Row gutter={[24, 24]} className="doctor-row">
          {currentDoctors.map((doc, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={doc.id_bac_si}>
              <SlideInItem index={index}>
                <motion.div 
                  whileHover={{ y: -8 }} 
                  transition={{ duration: 0.3 }}
                  style={{ height: "100%" }}
                  layout
                >
                        <Card
                          hoverable
                          onClick={() => handleCardClick(doc)}
                          className="doctor-card"
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
                          bodyStyle={{ 
                            padding: 24, 
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            height: "100%"
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
                src={doc.anh_dai_dien}
                                    size={80}
                                    icon={<UserOutlined />}
                                    style={{ 
                                      border: `3px solid ${getSpecialtyColor(doc.chuyen_mon)}`,
                                      boxShadow: `0 4px 12px ${getSpecialtyColor(doc.chuyen_mon)}40`,
                                      flexShrink: 0
                                    }}
                                  />
                                </motion.div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Title 
                                    level={4} 
                                    style={{ 
                                      color: "#096dd9", 
                                      marginBottom: 8,
                                      fontSize: 18,
                                      marginTop: 0,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    {doc.ho_ten}
                                  </Title>
                                  <Tag 
                                    color={getSpecialtyColor(doc.chuyen_mon)}
                                    style={{ 
                                      border: "none", 
                                      borderRadius: 12,
                                      padding: "4px 12px",
                                      fontWeight: 600,
                                      marginBottom: 8,
                                      display: "inline-block"
                                    }}
                                  >
                                    {doc.chuyen_mon}
                                  </Tag>
                                  <div style={{ marginTop: 8 }}>
                                    <Rate 
                                      disabled 
                                      defaultValue={doc.rating} 
                                      style={{ fontSize: 14 }} 
                                      character={<StarFilled />}
                                    />
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                      ({doc.rating.toFixed(1)})
                                    </Text>
              </div>
            </div>
          </div>

                              <Divider style={{ margin: "16px 0", borderColor: "#f0f0f0" }} />

                              {/* Additional info */}
                              <Space direction="vertical" size="small" style={{ width: "100%", flex: 1 }}>
                                <Space style={{ width: "100%" }}>
                                  <CrownOutlined style={{ color: getSpecialtyColor(doc.chuyen_mon), flexShrink: 0 }} />
                                  <Text strong style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.chuc_danh}</Text>
                                </Space>
                                <Space style={{ width: "100%" }}>
                                  <SafetyOutlined style={{ color: getSpecialtyColor(doc.chuyen_mon), flexShrink: 0 }} />
                                  <Text style={{ fontSize: 13 }}>{doc.experience} năm kinh nghiệm</Text>
                                </Space>
                                <Space style={{ width: "100%" }}>
                                  <HeartOutlined style={{ color: getSpecialtyColor(doc.chuyen_mon), flexShrink: 0 }} />
                                  <Text style={{ fontSize: 13 }}>{doc.patients?.toLocaleString()} bệnh nhân</Text>
                                </Space>
                              </Space>

                              {/* Action button */}
                              <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                                style={{ marginTop: "auto", width: "100%" }}
                              >
                                <Button
                                  type="primary"
                                  block
                                  icon={<ArrowRightOutlined />}
                                  style={{
                                    background: `linear-gradient(135deg, ${getSpecialtyColor(doc.chuyen_mon)} 0%, ${getSpecialtyColor(doc.chuyen_mon)}99 100%)`,
                                    border: "none",
                                    borderRadius: 12,
                                    height: 40,
                                    fontWeight: 600
                                  }}
                                >
                                  Xem chi tiết
                                </Button>
                              </motion.div>
                            </Space>
                          </div>
                        </Card>
                </motion.div>
              </SlideInItem>
            </Col>
          ))}
        </Row>
      </StaggerChildren>
    </AnimatePresence>

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
                  total={filteredDoctors.length}
                  pageSize={doctorsPerPage}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => (
                    <Text strong style={{ color: "#096dd9" }}>
                      {range[0]}-{range[1]} / {total} bác sĩ
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

        {/* Doctor Detail Modal */}
        <AnimatePresence>
          {modalVisible && (
            <Modal
              title={null}
              open={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                setSelectedDoctor(null);
              }}
              footer={null}
              width={900}
              style={{ top: 20 }}
              className="doctor-modal"
              closeIcon={
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: "white",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}
                >
                  ✕
                </motion.div>
              }
            >
              {selectedDoctor && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="modal-content">
                    {/* Header Section */}
                    <div style={{ 
                      background: `linear-gradient(135deg, ${getSpecialtyColor(selectedDoctor.chuyen_mon)} 0%, ${getSpecialtyColor(selectedDoctor.chuyen_mon)}99 100%)`,
                      padding: "40px",
                      borderRadius: "20px 20px 0 0",
                      color: "white",
                      textAlign: "center"
                    }}>
                      <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Avatar
                            src={selectedDoctor.anh_dai_dien}
                            size={120}
                            icon={<UserOutlined />}
                            style={{ 
                              border: "4px solid rgba(255,255,255,0.3)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                            }}
                          />
                        </motion.div>
                <div>
                          <Title level={2} style={{ color: "white", margin: 0 }}>
                            {selectedDoctor.ho_ten}
                          </Title>
                          <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, margin: "8px 0 0 0" }}>
                            {selectedDoctor.chuc_danh} • {selectedDoctor.chuyen_mon}
                          </Paragraph>
                        </div>
                      </Space>
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: 40 }}>
                      <Row gutter={[32, 32]}>
                        <Col xs={24} md={12}>
                          <Space direction="vertical" size="large" style={{ width: "100%" }}>
                            {/* Rating and Stats */}
                            <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}>
                              <Space size="large" style={{ width: "100%", justifyContent: "space-around" }}>
                                <div style={{ textAlign: "center" }}>
                                  <Title level={4} style={{ color: "#096dd9", margin: 0 }}>
                                    {selectedDoctor.rating?.toFixed(1)}
                                  </Title>
                                  <Rate disabled defaultValue={selectedDoctor.rating} style={{ fontSize: 16 }} />
                                  <Text type="secondary" style={{ fontSize: 12 }}>Đánh giá</Text>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <Title level={4} style={{ color: "#096dd9", margin: 0 }}>
                                    {selectedDoctor.experience}+
                                  </Title>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Năm KN</Text>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <Title level={4} style={{ color: "#096dd9", margin: 0 }}>
                                    {selectedDoctor.patients?.toLocaleString()}
                                  </Title>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Bệnh nhân</Text>
                </div>
                              </Space>
                            </Card>

                            {/* Contact Info */}
                            <div>
                              <Title level={5} style={{ color: "#096dd9", marginBottom: 16 }}>
                                <PhoneOutlined /> Thông tin liên hệ
                              </Title>
                              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                <Space>
                                  <MailOutlined style={{ color: getSpecialtyColor(selectedDoctor.chuyen_mon) }} />
                                  <Text>Email: {selectedDoctor.email}</Text>
                                </Space>
                                <Space>
                                  <CheckCircleOutlined style={{ color: getSpecialtyColor(selectedDoctor.chuyen_mon) }} />
                                  <Text>Trạng thái: {selectedDoctor.isAvailable ? "Đang tiếp nhận" : "Bận"}</Text>
                                </Space>
                              </Space>
              </div>

                            {/* Achievements */}
                            {selectedDoctor.achievements && selectedDoctor.achievements.length > 0 && (
                              <div>
                                <Title level={5} style={{ color: "#096dd9", marginBottom: 16 }}>
                                  <TrophyOutlined /> Thành tích
                                </Title>
                                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                  {selectedDoctor.achievements.map((ach, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    >
                                      <Tag 
                                        color="gold" 
                                        style={{ 
                                          borderRadius: 12, 
                                          padding: "4px 12px",
                                          marginBottom: 4
                                        }}
                                      >
                                        {ach}
                                      </Tag>
                                    </motion.div>
                                  ))}
                                </Space>
              </div>
                            )}
                          </Space>
                        </Col>

                        <Col xs={24} md={12}>
                          <Space direction="vertical" size="large" style={{ width: "100%" }}>
                            {/* Introduction */}
                            <div>
                              <Title level={5} style={{ color: "#096dd9", marginBottom: 16 }}>
                                <FileTextOutlined /> Giới thiệu
                              </Title>
                              <Paragraph style={{ 
                                fontSize: 15, 
                                lineHeight: 1.8, 
                                color: "#666",
                                textAlign: "justify"
                              }}>
                                {selectedDoctor.gioi_thieu_ban_than || 
                                 `Bác sĩ ${selectedDoctor.ho_ten} là chuyên gia hàng đầu trong lĩnh vực ${selectedDoctor.chuyen_mon} với hơn ${selectedDoctor.experience} năm kinh nghiệm. Với sự tận tâm và chuyên môn cao, bác sĩ đã điều trị thành công cho hàng ngàn bệnh nhân và nhận được sự tin tưởng từ cộng đồng.`}
                              </Paragraph>
            </div>

                            {/* Action Buttons */}
                            <Space direction="vertical" style={{ width: "100%" }}>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  type="primary"
                                  size="large"
                                  icon={<CalendarOutlined />}
                                  block
                                  style={{
                                    background: `linear-gradient(135deg, ${getSpecialtyColor(selectedDoctor.chuyen_mon)} 0%, ${getSpecialtyColor(selectedDoctor.chuyen_mon)}99 100%)`,
                                    border: "none",
                                    borderRadius: 12,
                                    height: 50,
                                    fontWeight: 600
                                  }}
                                >
                                  Đặt lịch khám với bác sĩ
                                </Button>
                              </motion.div>
                              <Button
                                size="large"
                                icon={<TeamOutlined />}
                                block
                                style={{
                                  borderColor: getSpecialtyColor(selectedDoctor.chuyen_mon),
                                  color: getSpecialtyColor(selectedDoctor.chuyen_mon),
                                  borderRadius: 12,
                                  height: 50,
                                  fontWeight: 600
                                }}
                              >
                                Xem lịch làm việc
                              </Button>
                            </Space>
                          </Space>
                        </Col>
                      </Row>
          </div>
        </div>
                </motion.div>
              )}
            </Modal>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <FloatButton.BackTop 
          icon={<UpCircleOutlined />}
          style={{ 
            right: 24,
            bottom: 24,
          }}
        />
      </div>
    </div>
  );
};

// Export the Doctors component
export default Doctors;