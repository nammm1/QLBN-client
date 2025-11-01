import React, { useState, useEffect } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "../../utils/toast";
import { X, Calendar, Clock, User, UtensilsCrossed, MessageSquare, Video, MapPin, Heart, Mail, Phone, Award, Briefcase, GraduationCap, Building2 } from "lucide-react";

import apiChuyenGiaDinhDuong from "../../api/ChuyenGiaDinhDuong";
import apiLichLamViec from "../../api/LichLamViec";
import apiKhungGioTuVan from "../../api/KhungGioKham";
import apiNguoiDung from "../../api/NguoiDung";
import apiCuocHenTuVan from "../../api/CuocHenTuVan";
import { Modal, Card, Pagination, Tag, Empty } from "antd";
import LoginRequiredModal from "../LoginRequiredModal/LoginRequiredModal";
import { useNavigate } from "react-router-dom";

const BookingModalChuyenGia = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [serviceType, setServiceType] = useState(""); // truc_tiep/online
  const [chuyenNganh, setChuyenNganh] = useState(""); // id_chuyen_nganh
  const [expert, setExpert] = useState(null);
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [desc, setDesc] = useState("");

  const [chuyenNganhList, setChuyenNganhList] = useState([]);
  const [experts, setExperts] = useState([]);
  const [expertSchedule, setExpertSchedule] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // Khung giờ còn chỗ
  const [viewingExpert, setViewingExpert] = useState(null); // Chuyên gia đang xem chi tiết (chưa chọn)
  const [showExpertCard, setShowExpertCard] = useState(false);
  const [showExpertSelectModal, setShowExpertSelectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // Hiển thị 6 chuyên gia mỗi trang

  // ✅ Hàm format ngày local (YYYY-MM-DD)
  const formatDateLocal = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // load chuyên ngành dinh dưỡng
  useEffect(() => {
    const fetchChuyenNganh = async () => {
      try {
        const data = await apiChuyenGiaDinhDuong.getAllChuyenNganh();
        setChuyenNganhList(data || []);
      } catch (err) {
        console.error("Lỗi khi tải chuyên ngành:", err);
      }
    };
    fetchChuyenNganh();
  }, []);

  // load chuyên gia theo chuyên ngành
  useEffect(() => {
    const fetchExperts = async () => {
      if (!chuyenNganh) {
        setExperts([]);
        return;
      }

      try {
        const allExperts = await apiChuyenGiaDinhDuong.getByChuyenNganh(chuyenNganh);
        const mergedExperts = await Promise.all(
          (allExperts || []).map(async (cg) => {
            try {
              const user = await apiNguoiDung.getUserById(cg.id_chuyen_gia);
              return { ...cg, ...user };
            } catch (err) {
              console.error("Lỗi khi lấy user cho chuyên gia:", err);
              return cg;
            }
          })
        );
        setExperts(mergedExperts);
        setCurrentPage(1); // Reset về trang đầu khi thay đổi chuyên ngành
      } catch (err) {
        console.error("Lỗi khi tải chuyên gia:", err);
        setExperts([]);
        setCurrentPage(1);
      }
    };
    fetchExperts();
  }, [chuyenNganh]);

  // load lịch làm việc theo chuyên gia
  useEffect(() => {
    if (expert) {
      const fetchSchedule = async () => {
        try {
          const data = await apiLichLamViec.getAll();
          const filtered = data.filter(
            (item) => item.id_nguoi_dung === expert.id_nguoi_dung
          );

          const schedule = {};
          filtered.forEach((item) => {
            const ngay = formatDateLocal(new Date(item.ngay_lam_viec));
            if (!schedule[ngay]) schedule[ngay] = [];
            schedule[ngay].push(item.ca);
          });

          setExpertSchedule(schedule);
        } catch (err) {
          console.error("Lỗi khi tải lịch làm việc:", err);
        }
      };
      fetchSchedule();
    } else {
      setExpertSchedule({});
    }
  }, [expert]);

  // load khung giờ và check số lượng đã đặt
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!session || !expert || !date) {
        setTimeSlots([]);
        setAvailableTimeSlots([]);
        return;
      }

      try {
        const data = await apiKhungGioTuVan.getAll();
        const filtered = data.filter((kg) => kg.ca === session);
        setTimeSlots(filtered);

        // Check số lượng đã đặt cho từng khung giờ
        const dateStr = formatDateLocal(date);
        const availableSlots = [];
        
        for (const slot of filtered) {
          try {
            const countData = await apiCuocHenTuVan.countByTimeSlot(
              expert.id_chuyen_gia,
              slot.id_khung_gio,
              dateStr
            );
            
            // Chỉ thêm vào danh sách nếu chưa đủ 2 người
            if (countData.count < countData.max_count) {
              availableSlots.push({
                ...slot,
                bookedCount: countData.count,
                maxCount: countData.max_count
              });
            }
          } catch (err) {
            console.error(`Lỗi khi check khung giờ ${slot.id_khung_gio}:`, err);
            // Nếu có lỗi, vẫn thêm vào danh sách để không bị thiếu
            availableSlots.push(slot);
          }
        }
        
        setAvailableTimeSlots(availableSlots);
      } catch (err) {
        console.error("Lỗi khi tải khung giờ:", err);
        setTimeSlots([]);
        setAvailableTimeSlots([]);
      }
    };
    
    fetchTimeSlots();
  }, [session, expert, date]);

  if (!show) return null;

  const allowedDates = expert ? Object.keys(expertSchedule) : [];
  const isAllowedDate = (dateObj) => {
    const d = formatDateLocal(dateObj);
    return allowedDates.includes(d);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập trước khi submit
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true") {
      setShowLoginRequiredModal(true);
      return;
    }
    
    if (!serviceType || !chuyenNganh || !expert || !date || !session || !timeSlot || !desc) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      // Lấy tên chuyên ngành từ danh sách
      const selectedChuyenNganh = chuyenNganhList.find(cn => cn.id_chuyen_nganh === chuyenNganh);
      
      const payload = {
        id_chuyen_gia: expert.id_chuyen_gia,
        id_khung_gio: timeSlot,
        ngay_kham: formatDateLocal(date), // ✅ fix timezone
        loai_hen: serviceType, // online | truc_tiep
        loai_dinh_duong: selectedChuyenNganh?.ten_chuyen_nganh || "", // Tên chuyên ngành
        ly_do_tu_van: desc,
      };

      console.log("Payload gửi lên:", payload);

      await apiCuocHenTuVan.create(payload);

      toast.success("Đặt lịch tư vấn thành công!");
      onClose();
    } catch (err) {
      console.error(err);
      // Toast đã được hiển thị tự động bởi axios interceptor với message từ API
      // toast.error("Có lỗi khi đặt lịch tư vấn!");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-wrapper">
          <div className="modal-header-content">
            <UtensilsCrossed className="modal-header-icon" size={28} />
            <h4 className="modal-header-title">Đăng ký tư vấn dinh dưỡng</h4>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {/* loại hẹn */}
          <div className="form-group">
            <label className="form-label">
              <Clock size={16} className="label-icon" />
              Chọn loại hẹn
            </label>
            <div className="service-type-buttons">
              {[
                { label: "Trực tiếp", value: "truc_tiep", icon: MapPin },
                { label: "Online", value: "online", icon: Video },
              ].map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`service-type-btn ${
                      serviceType === opt.value ? "active" : ""
                    }`}
                    onClick={() => setServiceType(opt.value)}
                  >
                    <IconComponent size={18} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* chuyên ngành dinh dưỡng */}
          <div className="form-group">
            <label className="form-label">
              <Heart size={16} className="label-icon" />
              Chọn chuyên ngành dinh dưỡng
            </label>
            <div className="input-wrapper">
              <select
                className="form-select modern-select"
                value={chuyenNganh}
                onChange={(e) => {
                  setChuyenNganh(e.target.value);
                  setExpert(null);
                  setDate(null);
                  setSession("");
                  setTimeSlot("");
                }}
              >
                <option value="">-- Chọn chuyên ngành --</option>
                {chuyenNganhList.map((cn) => (
                  <option key={cn.id_chuyen_nganh} value={cn.id_chuyen_nganh}>
                    {cn.ten_chuyen_nganh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* chuyên gia */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} className="label-icon" />
              Chọn chuyên gia
            </label>
            <div className="input-wrapper">
              {!expert ? (
                <button
                  type="button"
                  className="btn-select-expert"
                  onClick={() => setShowExpertSelectModal(true)}
                  disabled={!chuyenNganh}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#ffffff",
                    fontSize: "15px",
                    color: !chuyenNganh ? "#9ca3af" : "#1f2937",
                    cursor: !chuyenNganh ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>-- Chọn chuyên gia --</span>
                  <User size={18} style={{ opacity: 0.5 }} />
                </button>
              ) : (
                <div 
                  className="expert-info-card"
                  style={{
                    padding: "16px",
                    background: "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)",
                    borderRadius: "12px",
                    border: "2px solid #ffa940",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    position: "relative"
                  }}
                  onClick={() => {
                    setViewingExpert(expert);
                    setShowExpertCard(true);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "#fa8c16",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "18px"
                    }}>
                      {expert.ho_ten?.charAt(0)?.toUpperCase() || "CG"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "16px", color: "#ad6800" }}>
                        {expert.ho_ten}
                      </div>
                      {(expert.chuc_vu || expert.chuc_danh) && (
                        <div style={{ fontSize: "12px", color: "#595959", marginTop: "4px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {expert.chuc_vu && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Briefcase size={12} />
                              {expert.chuc_vu}
                            </span>
                          )}
                          {expert.chuc_danh && <span>• {expert.chuc_danh}</span>}
                        </div>
                      )}
                      {expert.linh_vuc_chuyen_sau && (
                        <div style={{ fontSize: "13px", color: "#595959", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <GraduationCap size={14} />
                          <span>{expert.linh_vuc_chuyen_sau}</span>
                        </div>
                      )}
                      {expert.hoc_vi && (
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <GraduationCap size={12} />
                          <span>{expert.hoc_vi}</span>
                        </div>
                      )}
                      {expert.so_chung_chi_hang_nghe && (
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Award size={12} />
                          <span>Chứng chỉ: {expert.so_chung_chi_hang_nghe}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpert(null);
                        setDate(null);
                        setSession("");
                        setTimeSlot("");
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#ff4d4f",
                        fontSize: "16px",
                        transition: "all 0.3s"
                      }}
                      title="Xóa chọn"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal chọn chuyên gia */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={20} />
                <span>Chọn chuyên gia dinh dưỡng</span>
              </div>
            }
            open={showExpertSelectModal}
            onCancel={() => {
              setShowExpertSelectModal(false);
              setCurrentPage(1); // Reset về trang đầu khi đóng modal
            }}
            footer={null}
            width={1000}
            zIndex={1060}
            maskStyle={{ zIndex: 1059 }}
          >
            {experts.length === 0 ? (
              <Empty
                description={!chuyenNganh ? "Vui lòng chọn chuyên ngành trước" : "Không có chuyên gia nào trong chuyên ngành này"}
                style={{ padding: "40px 0" }}
              />
            ) : (
              <>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                  padding: "10px 0",
                  minHeight: "400px"
                }}>
                  {experts
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((exp) => {
                      const isSelected = expert && expert.id_chuyen_gia === exp.id_chuyen_gia;
                      return (
                        <Card
                          key={exp.id_chuyen_gia}
                          hoverable
                          onClick={() => {
                            setViewingExpert(exp);
                            setShowExpertSelectModal(false);
                            setShowExpertCard(true);
                          }}
                          style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: isSelected ? "2px solid #ffa940" : "1px solid #e5e7eb",
                            background: isSelected 
                              ? "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)" 
                              : "#ffffff",
                            transition: "all 0.3s",
                            cursor: "pointer"
                          }}
                          bodyStyle={{ padding: "20px" }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Header với Avatar và Tên */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                              <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: isSelected
                                  ? "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)"
                                  : "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: isSelected ? "white" : "#8c8c8c",
                                fontWeight: "bold",
                                fontSize: "32px",
                                flexShrink: 0,
                                boxShadow: isSelected ? "0 4px 12px rgba(250, 140, 22, 0.3)" : "none"
                              }}>
                                {exp.ho_ten?.charAt(0)?.toUpperCase() || "CG"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  marginBottom: "8px",
                                  flexWrap: "wrap"
                                }}>
                                  <h3 style={{ 
                                    margin: 0, 
                                    fontSize: "18px", 
                                    fontWeight: "600",
                                    color: "#1f2937",
                                    flex: 1
                                  }}>
                                    {exp.ho_ten}
                                  </h3>
                                  {isSelected && (
                                    <Tag color="orange" style={{ margin: 0 }}>
                                      Đã chọn
                                    </Tag>
                                  )}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                                  {exp.chuc_vu && (
                                    <Tag color="orange">
                                      <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                      {exp.chuc_vu}
                                    </Tag>
                                  )}
                                  {exp.chuc_danh && (
                                    <Tag color="purple">
                                      <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                      {exp.chuc_danh}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Chuyên ngành và Lĩnh vực chuyên sâu */}
                            {(exp.linh_vuc_chuyen_sau || exp.ten_chuyen_nganh) && (
                              <div style={{ 
                                padding: "12px",
                                background: "rgba(250, 140, 22, 0.05)",
                                borderRadius: "8px",
                                border: "1px solid rgba(250, 140, 22, 0.1)"
                              }}>
                                {exp.ten_chuyen_nganh && (
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px",
                                    fontSize: "13px",
                                    color: "#52c41a",
                                    fontWeight: "500",
                                    marginBottom: exp.linh_vuc_chuyen_sau ? "6px" : "0"
                                  }}>
                                    <Heart size={14} />
                                    <span>{exp.ten_chuyen_nganh}</span>
                                  </div>
                                )}
                                {exp.linh_vuc_chuyen_sau && (
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px",
                                    fontSize: "14px",
                                    color: "#fa8c16",
                                    fontWeight: "500"
                                  }}>
                                    <GraduationCap size={16} />
                                    <span>{exp.linh_vuc_chuyen_sau}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Thông tin chi tiết */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {exp.hoc_vi && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <GraduationCap size={14} color="#8c8c8c" />
                                  <span>Học vị: {exp.hoc_vi}</span>
                                </div>
                              )}
                              {exp.so_chung_chi_hang_nghe && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <Award size={14} color="#8c8c8c" />
                                  <span>Số chứng chỉ: {exp.so_chung_chi_hang_nghe}</span>
                                </div>
                              )}
                              {exp.email && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <Mail size={14} color="#8c8c8c" />
                                  <span style={{ 
                                    overflow: "hidden", 
                                    textOverflow: "ellipsis", 
                                    whiteSpace: "nowrap" 
                                  }}>
                                    {exp.email}
                                  </span>
                                </div>
                              )}
                              {exp.so_dien_thoai && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <Phone size={14} color="#8c8c8c" />
                                  <span>{exp.so_dien_thoai}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Button */}
                            <div style={{ 
                              marginTop: "8px",
                              paddingTop: "12px",
                              borderTop: "1px solid #f0f0f0"
                            }}>
                              <div style={{
                                textAlign: "center",
                                padding: "8px",
                                background: isSelected ? "#ffa940" : "#f0f0f0",
                                color: isSelected ? "white" : "#595959",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "500",
                                transition: "all 0.2s"
                              }}>
                                {isSelected ? "✓ Đã chọn chuyên gia này" : "Xem chi tiết"}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>

                {/* Phân trang */}
                {experts.length > pageSize && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f0f0f0"
                  }}>
                    <Pagination
                      current={currentPage}
                      total={experts.length}
                      pageSize={pageSize}
                      onChange={(page) => {
                        setCurrentPage(page);
                        // Scroll to top of modal content
                        const modalContent = document.querySelector('.ant-modal-body');
                        if (modalContent) {
                          modalContent.scrollTop = 0;
                        }
                      }}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} / ${total} chuyên gia`
                      }
                    />
                  </div>
                )}
              </>
            )}
          </Modal>

          {/* Modal hiển thị thông tin chi tiết chuyên gia */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={20} />
                <span>Thông tin chuyên gia</span>
              </div>
            }
            open={showExpertCard}
            onCancel={() => {
              setShowExpertCard(false);
              setViewingExpert(null);
            }}
            footer={null}
            width={600}
            zIndex={1060}
            maskStyle={{ zIndex: 1059 }}
          >
            {viewingExpert && (
              <div style={{ padding: "20px 0" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "36px",
                    margin: "0 auto 16px"
                  }}>
                    {viewingExpert.ho_ten?.charAt(0)?.toUpperCase() || "CG"}
                  </div>
                  <h3 style={{ margin: 0, color: "#ad6800" }}>{viewingExpert.ho_ten}</h3>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                  {/* Chức vụ và Chức danh */}
                  <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {viewingExpert.chuc_vu && (
                      <Tag color="orange" style={{ fontSize: "13px", padding: "4px 12px" }}>
                        <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {viewingExpert.chuc_vu}
                      </Tag>
                    )}
                    {viewingExpert.chuc_danh && (
                      <Tag color="purple" style={{ fontSize: "13px", padding: "4px 12px" }}>
                        <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {viewingExpert.chuc_danh}
                      </Tag>
                    )}
                  </div>

                  {/* Tên chuyên ngành */}
                  {viewingExpert.ten_chuyen_nganh && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "#f6ffed", borderRadius: "6px", border: "1px solid #b7eb8f" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Heart size={14} color="#52c41a" />
                        <strong style={{ color: "#52c41a" }}>Chuyên ngành:</strong>
                      </div>
                      <span style={{ color: "#595959" }}>{viewingExpert.ten_chuyen_nganh}</span>
                    </div>
                  )}

                  {/* Lĩnh vực chuyên sâu */}
                  {viewingExpert.linh_vuc_chuyen_sau && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "#fff7e6", borderRadius: "6px", border: "1px solid #ffe7ba" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <GraduationCap size={14} color="#fa8c16" />
                        <strong style={{ color: "#fa8c16" }}>Lĩnh vực chuyên sâu:</strong>
                      </div>
                      <span style={{ color: "#595959" }}>{viewingExpert.linh_vuc_chuyen_sau}</span>
                    </div>
                  )}

                  {/* Học vị */}
                  {viewingExpert.hoc_vi && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <GraduationCap size={16} color="#8c8c8c" />
                      <strong>Học vị:</strong>
                      <span>{viewingExpert.hoc_vi}</span>
                    </div>
                  )}

                  {/* Số chứng chỉ hành nghề */}
                  {viewingExpert.so_chung_chi_hang_nghe && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Award size={16} color="#8c8c8c" />
                      <strong>Số chứng chỉ hành nghề:</strong>
                      <span>{viewingExpert.so_chung_chi_hang_nghe}</span>
                    </div>
                  )}

                  {/* Email */}
                  {viewingExpert.email && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} color="#8c8c8c" />
                      <strong>Email:</strong>
                      <span style={{ wordBreak: "break-all" }}>{viewingExpert.email}</span>
                    </div>
                  )}

                  {/* Số điện thoại */}
                  {viewingExpert.so_dien_thoai && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={16} color="#8c8c8c" />
                      <strong>Số điện thoại:</strong>
                      <span>{viewingExpert.so_dien_thoai}</span>
                    </div>
                  )}

                  {/* Giới thiệu bản thân */}
                  {viewingExpert.gioi_thieu_ban_than && (
                    <div style={{ 
                      marginTop: "20px", 
                      paddingTop: "16px", 
                      borderTop: "1px solid #f0f0f0" 
                    }}>
                      <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <MessageSquare size={16} color="#fa8c16" />
                        <strong style={{ color: "#fa8c16" }}>Giới thiệu:</strong>
                      </div>
                      <div style={{ 
                        padding: "12px", 
                        background: "#fafafa", 
                        borderRadius: "6px",
                        color: "#595959",
                        lineHeight: "1.6",
                        fontSize: "14px"
                      }}>
                        {viewingExpert.gioi_thieu_ban_than}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Nút chọn chuyên gia */}
                <div style={{ 
                  marginTop: "24px", 
                  paddingTop: "20px", 
                  borderTop: "2px solid #f0f0f0",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end"
                }}>
                  {expert && expert.id_chuyen_gia === viewingExpert.id_chuyen_gia ? (
                    // Đã chọn rồi, chỉ hiển thị nút Đóng
                    <button
                      type="button"
                      onClick={() => {
                        setShowExpertCard(false);
                        setViewingExpert(null);
                      }}
                      style={{
                        padding: "10px 24px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#fa8c16",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.3s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#ffa940";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#fa8c16";
                      }}
                    >
                      Đóng
                    </button>
                  ) : (
                    // Chưa chọn, hiển thị nút Trở lại và Chọn chuyên gia này
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowExpertCard(false);
                          setViewingExpert(null);
                          setShowExpertSelectModal(true);
                        }}
                        style={{
                          padding: "10px 24px",
                          border: "1px solid #d9d9d9",
                          borderRadius: "6px",
                          background: "#ffffff",
                          color: "#595959",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "all 0.3s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = "#ffa940";
                          e.target.style.color = "#ffa940";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = "#d9d9d9";
                          e.target.style.color = "#595959";
                        }}
                      >
                        Trở lại
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpert(viewingExpert);
                          setDate(null);
                          setSession("");
                          setTimeSlot("");
                          setShowExpertCard(false);
                          setViewingExpert(null);
                          toast.success("Đã chọn chuyên gia thành công!");
                        }}
                        style={{
                          padding: "10px 24px",
                          border: "none",
                          borderRadius: "6px",
                          background: "#fa8c16",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "all 0.3s",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#ffa940";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#fa8c16";
                        }}
                      >
                        <User size={16} />
                        Chọn chuyên gia này
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Modal>

          {/* ngày + ca + khung giờ */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} className="label-icon" />
              Chọn ngày tư vấn
            </label>
            <div className="input-wrapper">
              <DatePicker
                selected={date}
                onChange={(d) => {
                  setDate(d);
                  setSession("");
                  setTimeSlot("");
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày tư vấn"
                minDate={new Date()}
                filterDate={isAllowedDate}
                disabled={!expert}
                className="modern-datepicker"
                calendarClassName="modern-calendar"
              />
            </div>

            {date && (
              <div className="session-buttons">
                {(expertSchedule[formatDateLocal(date)] || []).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`session-btn ${
                      session === s ? "active" : ""
                    }`}
                    onClick={() => {
                      setSession(s);
                      setTimeSlot("");
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {session && (
              <div className="time-slots">
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot) => (
                    <button
                      key={slot.id_khung_gio}
                      type="button"
                      className={`time-slot-btn ${
                        timeSlot === slot.id_khung_gio ? "active" : ""
                      }`}
                      onClick={() => setTimeSlot(slot.id_khung_gio)}
                      title={slot.bookedCount !== undefined ? `Đã đặt: ${slot.bookedCount}/${slot.maxCount}` : ""}
                    >
                      <Clock size={14} />
                      <span>{slot.gio_bat_dau} - {slot.gio_ket_thuc}</span>
                      {slot.bookedCount !== undefined && (
                        <span style={{ fontSize: "11px", opacity: 0.7, marginLeft: "4px" }}>
                          ({slot.maxCount - slot.bookedCount} chỗ trống)
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div style={{ 
                    padding: "16px", 
                    textAlign: "center", 
                    color: "#8c8c8c",
                    background: "#fafafa",
                    borderRadius: "8px"
                  }}>
                    Không còn khung giờ trống trong ca này
                  </div>
                )}
              </div>
            )}
          </div>

          {/* lý do tư vấn */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} className="label-icon" />
              Lý do tư vấn
            </label>
            <div className="input-wrapper">
              <textarea
                className="form-control modern-textarea"
                rows="4"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết mong muốn tư vấn và mục tiêu của bạn..."
              ></textarea>
            </div>
          </div>

          {/* buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              <Calendar size={18} />
              <span>Đặt lịch ngay</span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginRequiredModal}
        onCancel={() => {
          setShowLoginRequiredModal(false);
          onClose();
        }}
      />
    </div>
  );
};

export default BookingModalChuyenGia;
