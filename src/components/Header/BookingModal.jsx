import React, { useState, useEffect } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "../../utils/toast";
import { 
  X, Calendar, Clock, User, Stethoscope, MessageSquare, Building2, Video, MapPin,
  Mail, Phone, Award, Briefcase, GraduationCap, Sparkles, Loader2
} from "lucide-react";

import apiChuyenKhoa from "../../api/ChuyenKhoa";
import apiBacSi from "../../api/BacSi";
import apiLichLamViec from "../../api/LichLamViec";
import apiKhungGioKham from "../../api/KhungGioKham";
import apiNguoiDung from "../../api/NguoiDung";
import apiCuocHenKhamBenh from "../../api/CuocHenKhamBenh";
import symptomAnalysisService from "../../api/SymptomAnalysis";
import { Modal, Card, Pagination, Tag, Empty } from "antd";
import LoginRequiredModal from "../LoginRequiredModal/LoginRequiredModal";
import DepositPaymentModal from "../Payment/DepositPaymentModal";
import { useNavigate } from "react-router-dom";

// format ngày thành YYYY-MM-DD theo local time (không lệch múi giờ)
const formatDate = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Convert enum ca ('Sang', 'Chieu', 'Toi') sang hiển thị ('Sáng', 'Chiều', 'Tối')
const formatCaToDisplay = (ca) => {
  const mapping = {
    'Sang': 'Sáng',
    'Chieu': 'Chiều',
    'Toi': 'Tối',
    'sang': 'Sáng',
    'chieu': 'Chiều',
    'toi': 'Tối'
  };
  return mapping[ca] || ca;
};

// Convert hiển thị ('Sáng', 'Chiều', 'Tối') sang enum ca ('Sang', 'Chieu', 'Toi')
const formatCaToEnum = (ca) => {
  const mapping = {
    'Sáng': 'Sang',
    'Chiều': 'Chieu',
    'Tối': 'Toi',
    'sáng': 'Sang',
    'chiều': 'Chieu',
    'tối': 'Toi'
  };
  return mapping[ca] || ca;
};
const DEPOSIT_HOLD_LABEL = "24 giờ";
const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const BookingModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [serviceTypeBooking, setServiceTypeBooking] = useState(""); // truc_tiep/online
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [lyDoKham, setLyDoKham] = useState("");
  const [trieuChung, setTrieuChung] = useState("");

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // Khung giờ còn chỗ
  const [viewingDoctor, setViewingDoctor] = useState(null); // Bác sĩ đang xem chi tiết (chưa chọn)
  const [showDoctorCard, setShowDoctorCard] = useState(false);
  const [showDoctorSelectModal, setShowDoctorSelectModal] = useState(false);
  const [depositModalInfo, setDepositModalInfo] = useState(null);
  const [showDepositNotice, setShowDepositNotice] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [postBookingInfo, setPostBookingInfo] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // Hiển thị 6 bác sĩ mỗi trang
  
  // AI gợi ý chuyên khoa
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // load chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await apiChuyenKhoa.getAllChuyenKhoa();
        setSpecialties(data);
      } catch (err) {
        console.error("Lỗi khi tải chuyên khoa:", err);
      }
    };
    fetchSpecialties();
  }, []);

  // load bác sĩ theo chuyên khoa
  useEffect(() => {
    if (specialty) {
      const fetchDoctors = async () => {
        try {
          const allDoctors = await apiBacSi.getAll();
          const filtered = allDoctors.filter(
            (bs) => String(bs.id_chuyen_khoa) === String(specialty)
          );

          const mergedDoctors = await Promise.all(
            filtered.map(async (bs) => {
              try {
                const user = await apiNguoiDung.getUserById(bs.id_bac_si);
                return { ...bs, ...user };
              } catch (err) {
                console.error("Lỗi khi lấy user cho bác sĩ:", err);
                return bs;
              }
            })
          );

          setDoctors(mergedDoctors);
          setCurrentPage(1); // Reset về trang đầu khi thay đổi chuyên khoa
        } catch (err) {
          console.error("Lỗi khi tải bác sĩ:", err);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
      setCurrentPage(1);
    }
  }, [specialty]);

  // load lịch làm việc theo bác sĩ
  useEffect(() => {
    if (doctor) {
      const fetchSchedule = async () => {
        try {
          const data = await apiLichLamViec.getAll();
          const filtered = data.filter(
            (item) => item.id_nguoi_dung === doctor.id_nguoi_dung
          );

          const schedule = {};
          filtered.forEach((item) => {
            const ngay = formatDate(new Date(item.ngay_lam_viec));
            if (!schedule[ngay]) schedule[ngay] = [];
            schedule[ngay].push(item.ca);
          });

          setDoctorSchedule(schedule);
        } catch (err) {
          console.error("Lỗi khi tải lịch làm việc:", err);
        }
      };
      fetchSchedule();
    } else {
      setDoctorSchedule({});
    }
  }, [doctor]);

  

  // load khung giờ và check số lượng đã đặt
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!session || !doctor || !date) {
        setTimeSlots([]);
        setAvailableTimeSlots([]);
        return;
      }

      try {
        const data = await apiKhungGioKham.getAll();
        const filtered = data.filter((kg) => kg.ca === session);
        setTimeSlots(filtered);

        // Check số lượng đã đặt cho từng khung giờ
        const dateStr = formatDate(date);
        const availableSlots = [];
        
        for (const slot of filtered) {
          try {
            const countData = await apiCuocHenKhamBenh.countByTimeSlot(
              doctor.id_bac_si,
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
        
        // Sắp xếp khung giờ theo thời gian bắt đầu tăng dần (HH:mm)
        availableSlots.sort((a, b) => {
          const toMinutes = (t) => {
            if (!t) return 0;
            const [hh, mm] = String(t).split(":").map((x) => parseInt(x, 10));
            return (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
          };
          return toMinutes(a.gio_bat_dau) - toMinutes(b.gio_bat_dau);
        });
        
        setAvailableTimeSlots(availableSlots);
      } catch (err) {
        console.error("Lỗi khi tải khung giờ khám:", err);
        setTimeSlots([]);
        setAvailableTimeSlots([]);
      }
    };
    
    fetchTimeSlots();
  }, [session, doctor, date]);

  if (!show) return null;

  const allowedDates = doctor ? Object.keys(doctorSchedule) : [];
  const isAllowedDate = (dateObj) => {
    const d = formatDate(dateObj);
    return allowedDates.includes(d);
  };

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setServiceTypeBooking("");
    setSpecialty("");
    setDoctor(null);
    setDate(null);
    setSession("");
    setTimeSlot("");
    setLyDoKham("");
    setTrieuChung("");
    setDoctors([]);
    setDoctorSchedule({});
    setTimeSlots([]);
    setAvailableTimeSlots([]);
    setShowDoctorCard(false);
    setShowDoctorSelectModal(false);
    setAiSuggestions(null);
    setShowAiSuggestions(false);
    setShowDepositNotice(false);
    setPendingPayload(null);
  };

  const handleClose = () => {
    resetForm();
    setPostBookingInfo(null);
    onClose();
  };

  // Xử lý AI gợi ý chuyên khoa
  const handleAiSuggest = async () => {
    if (!lyDoKham || !lyDoKham.trim()) {
      toast.warning("Vui lòng nhập lý do khám trước!");
      return;
    }

    setIsAnalyzing(true);
    setShowAiSuggestions(true);
    
    try {
      const response = await symptomAnalysisService.analyzeSymptoms(lyDoKham, trieuChung);
      
      if (response.success && response.data) {
        setAiSuggestions(response.data);
        
        // Nếu có gợi ý và chưa chọn chuyên khoa, tự động chọn gợi ý đầu tiên
        if (response.data.suggested_specialties && response.data.suggested_specialties.length > 0 && !specialty) {
          const firstSuggestion = response.data.suggested_specialties[0];
          setSpecialty(String(firstSuggestion.id_chuyen_khoa));
          toast.success(`AI đã gợi ý chuyên khoa: ${firstSuggestion.ten_chuyen_khoa}`);
        }
      } else {
        toast.error("Không thể phân tích triệu chứng. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast.error("Có lỗi xảy ra khi phân tích. Vui lòng thử lại!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập trước khi submit
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true") {
      setShowLoginRequiredModal(true);
      return;
    }
    
    if (!serviceTypeBooking || !specialty || !doctor || !date || !session || !timeSlot || !lyDoKham) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

      const payload = {
        id_bac_si: doctor.id_bac_si,
        id_chuyen_khoa: specialty,
        id_khung_gio: timeSlot,
        ngay_kham: formatDate(date), // dùng formatDate để không lệch múi giờ
        loai_hen: serviceTypeBooking, // truc_tiep/online
        ly_do_kham: lyDoKham,
        trieu_chung: trieuChung || null,
      };

    setPendingPayload(payload);
    setShowDepositNotice(true);
  };

  const submitBooking = async () => {
    if (!pendingPayload) return;
    try {
      const booking = await apiCuocHenKhamBenh.create(pendingPayload);
      const depositInfo = booking?.deposit;

      toast.success(
        "Đã gửi yêu cầu đặt lịch. Vui lòng thanh toán cọc trong 1 ngày!"
      );

      if (booking?.id_cuoc_hen && depositInfo) {
        setPostBookingInfo({
          id_cuoc_hen: booking.id_cuoc_hen,
          deposit: depositInfo,
        });
      }

      // Giữ BookingModal mở để 2 popup thanh toán vẫn hiển thị
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setPendingPayload(null);
    }
  };

  const handleStartDepositPayment = async () => {
    if (!postBookingInfo?.id_cuoc_hen) return;
    try {
      setIsCreatingPayment(true);
      const session = await apiCuocHenKhamBenh.initDepositPayment(
        postBookingInfo.id_cuoc_hen
      );

      if (session?.paymentUrl) {
        window.open(session.paymentUrl, "_blank", "noopener");
      }

      toast.success("Đã mở trang thanh toán. Vui lòng hoàn tất trên MoMo.");

      setPostBookingInfo(null);
      handleClose(); // đóng luôn modal đặt lịch sau khi chọn thanh toán ngay
    } catch (error) {
      console.error("Error starting deposit payment:", error);
      toast.error("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <>
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-wrapper">
          <div className="modal-header-content">
            <Stethoscope className="modal-header-icon" size={28} />
            <h4 className="modal-header-title">Đăng ký khám bệnh</h4>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose}>
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
                      serviceTypeBooking === opt.value ? "active" : ""
                  }`}
                    onClick={() => setServiceTypeBooking(opt.value)}
                >
                    <IconComponent size={18} />
                    <span>{opt.label}</span>
                </button>
                );
              })}
            </div>
          </div>

          {/* Lý do khám */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} className="label-icon" />
              Lý do khám <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
            <div className="input-wrapper">
              <textarea
                className="form-control modern-textarea"
                rows="3"
                value={lyDoKham}
                onChange={(e) => setLyDoKham(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lý do khám..."
              ></textarea>
            </div>
          </div>

          {/* Triệu chứng */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} className="label-icon" />
              Triệu chứng (nếu có)
            </label>
            <div className="input-wrapper">
            <textarea
                className="form-control modern-textarea"
              rows="3"
                value={trieuChung}
                onChange={(e) => setTrieuChung(e.target.value)}
                placeholder="Vui lòng mô tả các triệu chứng bạn đang gặp phải (nếu có)..."
            ></textarea>
            </div>
          </div>

          {/* AI gợi ý chuyên khoa */}
          {lyDoKham && lyDoKham.trim() && (
            <div className="form-group">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <Sparkles size={16} className="label-icon" />
                  AI gợi ý chuyên khoa
                </label>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAnalyzing}
                  style={{
                    background: isAnalyzing ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAnalyzing) {
                      e.target.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAnalyzing) {
                      e.target.style.opacity = '1';
                    }
                  }}
                  title="AI sẽ phân tích lý do khám và triệu chứng để gợi ý chuyên khoa phù hợp"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Đang phân tích...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Phân tích và gợi ý</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Hiển thị kết quả AI gợi ý */}
              {showAiSuggestions && aiSuggestions && aiSuggestions.suggested_specialties && (
                <div style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '12px',
                  border: '2px solid #0ea5e9',
                  animation: 'fadeIn 0.3s ease-in'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    color: '#0369a1',
                    fontWeight: '600'
                  }}>
                    <Sparkles size={16} />
                    <span>AI gợi ý chuyên khoa phù hợp:</span>
                  </div>
                  
                  {aiSuggestions.explanation && (
                    <div style={{
                      marginBottom: '12px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {aiSuggestions.explanation}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiSuggestions.suggested_specialties.map((suggestion, index) => {
                      const isSelected = specialty === String(suggestion.id_chuyen_khoa);
                      const confidence = suggestion.confidence || 0;
                      const confidencePercent = Math.round(confidence * 100);
                      
                      return (
                        <div
                          key={suggestion.id_chuyen_khoa}
                          onClick={() => {
                            setSpecialty(String(suggestion.id_chuyen_khoa));
                            setDoctor(null);
                            toast.success(`Đã chọn: ${suggestion.ten_chuyen_khoa}`);
                          }}
                          style={{
                            padding: '12px 16px',
                            background: isSelected 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                              : 'white',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #1e40af' : '1px solid #cbd5e1',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              <span style={{
                                fontWeight: '600',
                                fontSize: '15px',
                                color: isSelected ? 'white' : '#1e293b'
                              }}>
                                {index + 1}. {suggestion.ten_chuyen_khoa}
                              </span>
                              {isSelected && (
                                <span style={{
                                  background: 'rgba(255, 255, 255, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}>
                                  Đã chọn
                                </span>
                              )}
                            </div>
                            {suggestion.reason && (
                              <div style={{
                                fontSize: '12px',
                                color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#64748b',
                                marginTop: '4px'
                              }}>
                                {suggestion.reason}
                              </div>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '4px'
                          }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: isSelected ? 'white' : '#3b82f6'
                            }}>
                              {confidencePercent}%
                            </div>
                            <div style={{
                              width: '60px',
                              height: '6px',
                              background: isSelected ? 'rgba(255, 255, 255, 0.3)' : '#e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${confidencePercent}%`,
                                height: '100%',
                                background: isSelected ? 'white' : '#3b82f6',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {aiSuggestions.urgency_level === 'khẩn_cap' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>⚠️</span>
                      <span>Triệu chứng có thể cần khám khẩn cấp. Vui lòng đến bệnh viện sớm nhất có thể!</span>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiSuggestions(false);
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#64748b',
                      fontSize: '12px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Ẩn gợi ý
                  </button>
                </div>
              )}
            </div>
          )}

          {/* chuyên khoa */}
          <div className="form-group">
            <label className="form-label">
              <Building2 size={16} className="label-icon" />
              Chọn chuyên khoa
            </label>
            <div className="input-wrapper">
              <select
                className="form-select modern-select"
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  setDoctor(null);
                }}
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((sp) => (
                  <option key={sp.id_chuyen_khoa} value={sp.id_chuyen_khoa}>
                    {sp.ten_chuyen_khoa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* bác sĩ */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} className="label-icon" />
              Chọn bác sĩ
            </label>
            <div className="input-wrapper">
              {!doctor ? (
                <button
                  type="button"
                  className="btn-select-doctor"
                  onClick={() => setShowDoctorSelectModal(true)}
                  disabled={!specialty}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#ffffff",
                    fontSize: "15px",
                    color: !specialty ? "#9ca3af" : "#1f2937",
                    cursor: !specialty ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>-- Chọn bác sĩ --</span>
                  <User size={18} style={{ opacity: 0.5 }} />
                </button>
              ) : (
                <div 
                  className="doctor-info-card"
                  style={{
                    padding: "16px",
                    background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                    borderRadius: "12px",
                    border: "2px solid #40a9ff",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    position: "relative"
                  }}
                  onClick={() => {
                    setViewingDoctor(doctor);
                    setShowDoctorCard(true);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "#1890ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "18px"
                    }}>
                      {doctor.ho_ten?.charAt(0)?.toUpperCase() || "BS"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "16px", color: "#0050b3" }}>
                        BS. {doctor.ho_ten}
                      </div>
                      {(doctor.chuc_danh || doctor.chuc_vu) && (
                        <div style={{ fontSize: "12px", color: "#595959", marginTop: "4px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {doctor.chuc_danh && <span>{doctor.chuc_danh}</span>}
                          {doctor.chuc_vu && <span>• {doctor.chuc_vu}</span>}
                        </div>
                      )}
                      {doctor.chuyen_mon && (
                        <div style={{ fontSize: "13px", color: "#595959", marginTop: "4px" }}>
                          {doctor.chuyen_mon}
                        </div>
                      )}
                      {doctor.so_nam_kinh_nghiem && (
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "2px" }}>
                          Kinh nghiệm: {doctor.so_nam_kinh_nghiem} năm
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDoctor(null);
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

          {/* Modal chọn bác sĩ */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={20} />
                <span>Chọn bác sĩ</span>
              </div>
            }
            open={showDoctorSelectModal}
            onCancel={() => {
              setShowDoctorSelectModal(false);
              setCurrentPage(1); // Reset về trang đầu khi đóng modal
            }}
            footer={null}
            width={1000}
            zIndex={1060}
            styles={{ mask: { zIndex: 1059 } }}
          >
            {doctors.length === 0 ? (
              <Empty
                description={!specialty ? "Vui lòng chọn chuyên khoa trước" : "Không có bác sĩ nào trong chuyên khoa này"}
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
                  {doctors
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((doc) => {
                      const isSelected = doctor && doctor.id_bac_si === doc.id_bac_si;
                      return (
                        <Card
                          key={doc.id_bac_si}
                          hoverable
                          onClick={() => {
                            setViewingDoctor(doc);
                            setShowDoctorSelectModal(false);
                            setShowDoctorCard(true);
                          }}
                          style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: isSelected ? "2px solid #40a9ff" : "1px solid #e5e7eb",
                            background: isSelected 
                              ? "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)" 
                              : "#ffffff",
                            transition: "all 0.3s",
                            cursor: "pointer"
                          }}
                          styles={{ body: { padding: "20px" } }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Header với Avatar và Tên */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                              <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: isSelected
                                  ? "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)"
                                  : "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: isSelected ? "white" : "#8c8c8c",
                                fontWeight: "bold",
                                fontSize: "32px",
                                flexShrink: 0,
                                boxShadow: isSelected ? "0 4px 12px rgba(24, 144, 255, 0.3)" : "none"
                              }}>
                                {doc.ho_ten?.charAt(0)?.toUpperCase() || "BS"}
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
                                    BS. {doc.ho_ten}
                                  </h3>
                                  {isSelected && (
                                    <Tag color="blue" style={{ margin: 0 }}>
                                      Đã chọn
                                    </Tag>
                                  )}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                                  {doc.chuc_danh && (
                                    <Tag color="purple">
                                      <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                      {doc.chuc_danh}
                                    </Tag>
                                  )}
                                  {doc.chuc_vu && (
                                    <Tag color="blue">
                                      <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                      {doc.chuc_vu}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Chuyên môn và Tên chuyên khoa */}
                            {(doc.chuyen_mon || doc.ten_chuyen_khoa) && (
                              <div style={{ 
                                padding: "12px",
                                background: "rgba(24, 144, 255, 0.05)",
                                borderRadius: "8px",
                                border: "1px solid rgba(24, 144, 255, 0.1)"
                              }}>
                                {doc.ten_chuyen_khoa && (
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px",
                                    fontSize: "13px",
                                    color: "#096dd9",
                                    fontWeight: "500",
                                    marginBottom: doc.chuyen_mon ? "6px" : "0"
                                  }}>
                                    <Building2 size={14} />
                                    <span>{doc.ten_chuyen_khoa}</span>
                                  </div>
                                )}
                                {doc.chuyen_mon && (
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px",
                                    fontSize: "14px",
                                    color: "#1890ff",
                                    fontWeight: "500"
                                  }}>
                                    <Stethoscope size={16} />
                                    <span>{doc.chuyen_mon}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Thông tin chi tiết */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {doc.so_nam_kinh_nghiem && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <Clock size={14} color="#8c8c8c" />
                                  <span>Kinh nghiệm: {doc.so_nam_kinh_nghiem} năm</span>
                                </div>
                              )}
                              {doc.so_giay_phep_hang_nghe && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <Award size={14} color="#8c8c8c" />
                                  <span>Số GP: {doc.so_giay_phep_hang_nghe}</span>
                                </div>
                              )}
                              {doc.email && (
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
                                    {doc.email}
                                  </span>
                                </div>
                              )}
                              {doc.so_dien_thoai && (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#595959"
                                }}>
                                  <Phone size={14} color="#8c8c8c" />
                                  <span>{doc.so_dien_thoai}</span>
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
                                background: isSelected ? "#40a9ff" : "#f0f0f0",
                                color: isSelected ? "white" : "#595959",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "500",
                                transition: "all 0.2s"
                              }}>
                                {isSelected ? "✓ Đã chọn bác sĩ này" : "Xem chi tiết"}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>

                {/* Phân trang */}
                {doctors.length > pageSize && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f0f0f0"
                  }}>
                    <Pagination
                      current={currentPage}
                      total={doctors.length}
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
                        `${range[0]}-${range[1]} / ${total} bác sĩ`
                      }
                    />
                  </div>
                )}
              </>
            )}
          </Modal>

          {/* Modal hiển thị thông tin chi tiết bác sĩ */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={20} />
                <span>Thông tin bác sĩ</span>
              </div>
            }
            open={showDoctorCard}
            onCancel={() => {
              setShowDoctorCard(false);
              setViewingDoctor(null);
            }}
            footer={null}
            width={600}
            zIndex={1060}
            styles={{ mask: { zIndex: 1059 } }}
          >
            {viewingDoctor && (
              <div style={{ padding: "20px 0" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "36px",
                    margin: "0 auto 16px"
                  }}>
                    {viewingDoctor.ho_ten?.charAt(0)?.toUpperCase() || "BS"}
                  </div>
                  <h3 style={{ margin: 0, color: "#0050b3" }}>BS. {viewingDoctor.ho_ten}</h3>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                  {/* Chức danh và Chức vụ */}
                  <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {viewingDoctor.chuc_danh && (
                      <Tag color="purple" style={{ fontSize: "13px", padding: "4px 12px" }}>
                        <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {viewingDoctor.chuc_danh}
                      </Tag>
                    )}
                    {viewingDoctor.chuc_vu && (
                      <Tag color="blue" style={{ fontSize: "13px", padding: "4px 12px" }}>
                        <Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {viewingDoctor.chuc_vu}
                      </Tag>
                    )}
                  </div>

                  {/* Tên chuyên khoa */}
                  {viewingDoctor.ten_chuyen_khoa && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "#f6ffed", borderRadius: "6px", border: "1px solid #b7eb8f" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Building2 size={14} color="#096dd9" />
                        <strong style={{ color: "#096dd9" }}>Khoa:</strong>
                      </div>
                      <span style={{ color: "#595959" }}>{viewingDoctor.ten_chuyen_khoa}</span>
                    </div>
                  )}

                  {/* Chuyên môn */}
                  {viewingDoctor.chuyen_mon && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "#e6f7ff", borderRadius: "6px", border: "1px solid #91d5ff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Stethoscope size={14} color="#1890ff" />
                        <strong style={{ color: "#1890ff" }}>Chuyên môn:</strong>
                      </div>
                      <span style={{ color: "#595959" }}>{viewingDoctor.chuyen_mon}</span>
                    </div>
                  )}

                  {/* Số năm kinh nghiệm */}
                  {viewingDoctor.so_nam_kinh_nghiem && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={16} color="#8c8c8c" />
                      <strong>Kinh nghiệm:</strong>
                      <span>{viewingDoctor.so_nam_kinh_nghiem} năm</span>
                    </div>
                  )}

                  {/* Số giấy phép hành nghề */}
                  {viewingDoctor.so_giay_phep_hang_nghe && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Award size={16} color="#8c8c8c" />
                      <strong>Số giấy phép hành nghề:</strong>
                      <span>{viewingDoctor.so_giay_phep_hang_nghe}</span>
                    </div>
                  )}

                  {/* Email */}
                  {viewingDoctor.email && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} color="#8c8c8c" />
                      <strong>Email:</strong>
                      <span style={{ wordBreak: "break-all" }}>{viewingDoctor.email}</span>
                    </div>
                  )}

                  {/* Số điện thoại */}
                  {viewingDoctor.so_dien_thoai && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={16} color="#8c8c8c" />
                      <strong>Số điện thoại:</strong>
                      <span>{viewingDoctor.so_dien_thoai}</span>
                    </div>
                  )}

                  {/* Giới thiệu bản thân */}
                  {viewingDoctor.gioi_thieu_ban_than && (
                    <div style={{ 
                      marginTop: "20px", 
                      paddingTop: "16px", 
                      borderTop: "1px solid #f0f0f0" 
                    }}>
                      <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <MessageSquare size={16} color="#1890ff" />
                        <strong style={{ color: "#1890ff" }}>Giới thiệu:</strong>
                      </div>
                      <div style={{ 
                        padding: "12px", 
                        background: "#fafafa", 
                        borderRadius: "6px",
                        color: "#595959",
                        lineHeight: "1.6",
                        fontSize: "14px"
                      }}>
                        {viewingDoctor.gioi_thieu_ban_than}
                      </div>
                    </div>
                  )}
          </div>

                {/* Nút chọn bác sĩ */}
                <div style={{ 
                  marginTop: "24px", 
                  paddingTop: "20px", 
                  borderTop: "2px solid #f0f0f0",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end"
                }}>
                  {doctor && doctor.id_bac_si === viewingDoctor.id_bac_si ? (
                    // Đã chọn rồi, chỉ hiển thị nút Đóng
                    <button
                      type="button"
                      onClick={() => {
                        setShowDoctorCard(false);
                        setViewingDoctor(null);
                      }}
                      style={{
                        padding: "10px 24px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#1890ff",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.3s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#40a9ff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#1890ff";
                      }}
                    >
                      Đóng
                    </button>
                  ) : (
                    // Chưa chọn, hiển thị nút Trở lại và Chọn bác sĩ này
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDoctorCard(false);
                          setViewingDoctor(null);
                          setShowDoctorSelectModal(true);
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
                          e.target.style.borderColor = "#40a9ff";
                          e.target.style.color = "#40a9ff";
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
                          setDoctor(viewingDoctor);
                          setDate(null);
                          setSession("");
                          setTimeSlot("");
                          setShowDoctorCard(false);
                          setViewingDoctor(null);
                          toast.success("Đã chọn bác sĩ thành công!");
                        }}
                        style={{
                          padding: "10px 24px",
                          border: "none",
                          borderRadius: "6px",
                          background: "#1890ff",
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
                          e.target.style.background = "#40a9ff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#1890ff";
                        }}
                      >
                        <User size={16} />
                        Chọn bác sĩ này
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
              Chọn ngày khám
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
                placeholderText="Chọn ngày khám"
              minDate={new Date()}
              filterDate={isAllowedDate}
              disabled={!doctor}
                className="modern-datepicker"
                calendarClassName="modern-calendar"
            />
            </div>

            {date && (
              <div className="session-buttons">
                {(doctorSchedule[formatDate(date)] || []).map((s) => (
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
                    {formatCaToDisplay(s)}
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

          {/* buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
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
          handleClose();
        }}
      />
    </div>
    <Modal
      open={showDepositNotice}
      onCancel={() => {
        setShowDepositNotice(false);
        setPendingPayload(null);
      }}
      onOk={() => {
        setShowDepositNotice(false);
        submitBooking();
      }}
      okText="Tôi đồng ý"
      cancelText="Để tôi xem lại"
      zIndex={3000}
    >
      <div style={{ marginBottom: 4, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "#64748b" }}>
        HospitalCare – Chính sách phí giữ chỗ
      </div>
      <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
        Phí đặt lịch khám 100.000 VNĐ
      </h3>
      <div style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc", marginBottom: 10, fontSize: 14, color: "#475569" }}>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.6 }}>
          <li>Mỗi lịch khám cần thanh toán trước <strong>100.000 VNĐ</strong> để giữ chỗ trong <strong>{DEPOSIT_HOLD_LABEL}</strong>.</li>
          <li>Nếu bạn <strong>hủy trước 7 ngày</strong> so với thời gian hẹn, khoản cọc sẽ được <strong>hoàn lại đầy đủ</strong>.</li>
          <li>Nếu hủy muộn hơn, không đến khám hoặc vắng mặt, khoản cọc được xem là <strong>phí giữ chỗ</strong> và <strong>không hoàn lại</strong>.</li>
        </ul>
      </div>
      <p style={{ lineHeight: 1.6, color: "#475569", fontSize: 13 }}>
        Bằng việc chọn <strong>“Tôi đồng ý”</strong>, bạn xác nhận đã đọc và đồng ý với chính sách phí đặt lịch của <strong>HospitalCare</strong>.
      </p>
    </Modal>
    <Modal
      open={!!postBookingInfo}
      onCancel={() => {
        setPostBookingInfo(null);
        handleClose(); // Để sau -> đóng modal đặt lịch
      }}
      okText="Thanh toán ngay"
      cancelText="Để sau"
      confirmLoading={isCreatingPayment}
      onOk={handleStartDepositPayment}
      zIndex={3100}
    >
      <h3 style={{ marginBottom: 12 }}>Thanh toán tiền cọc</h3>
      <p style={{ lineHeight: 1.6, color: "#475569" }}>
        Bạn có muốn thanh toán ngay {formatCurrency(postBookingInfo?.deposit?.amount || 100000)} VNĐ
        để hoàn tất việc giữ lịch trong {DEPOSIT_HOLD_LABEL} không? Nếu chưa tiện, bạn có thể thanh toán sau
        bất cứ lúc nào trong mục “Hóa đơn”.
      </p>
      <p style={{ lineHeight: 1.6, color: "#475569" }}>
        Nếu tạm thời bỏ qua, hãy hoàn tất thanh toán trong {DEPOSIT_HOLD_LABEL} để lịch hẹn không bị hủy tự động.
      </p>
    </Modal>
    {depositModalInfo && (
      <DepositPaymentModal
        deposit={depositModalInfo}
        onClose={() => setDepositModalInfo(null)}
      />
    )}
    </>
  );
};

export default BookingModal;
