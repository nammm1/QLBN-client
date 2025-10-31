import React, { useState, useEffect } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "../../utils/toast";
import { X, Calendar, Clock, User, UtensilsCrossed, MessageSquare, Video, MapPin, Heart } from "lucide-react";

import apiChuyenGiaDinhDuong from "../../api/ChuyenGiaDinhDuong";
import apiLichLamViec from "../../api/LichLamViec";
import apiKhungGioTuVan from "../../api/KhungGioKham";
import apiNguoiDung from "../../api/NguoiDung";
import apiCuocHenTuVan from "../../api/CuocHenTuVan";

const BookingModalChuyenGia = ({ show, onClose }) => {
  const [serviceType, setServiceType] = useState(""); // truc_tiep/online
  const [topic, setTopic] = useState(""); // loai_dinh_duong
  const [expert, setExpert] = useState(null);
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [desc, setDesc] = useState("");

  const [experts, setExperts] = useState([]);
  const [expertSchedule, setExpertSchedule] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  // ✅ Hàm format ngày local (YYYY-MM-DD)
  const formatDateLocal = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // load chuyên gia
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const allExperts = await apiChuyenGiaDinhDuong.getAll();
        const mergedExperts = await Promise.all(
          allExperts.map(async (cg) => {
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
      } catch (err) {
        console.error("Lỗi khi tải chuyên gia:", err);
      }
    };
    fetchExperts();
  }, []);

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

  // load khung giờ
  useEffect(() => {
    if (session) {
      const fetchTimeSlots = async () => {
        try {
          const data = await apiKhungGioTuVan.getAll();
          const filtered = data.filter((kg) => kg.ca === session);
          setTimeSlots(filtered);
        } catch (err) {
          console.error("Lỗi khi tải khung giờ:", err);
        }
      };
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [session]);

  if (!show) return null;

  const allowedDates = expert ? Object.keys(expertSchedule) : [];
  const isAllowedDate = (dateObj) => {
    const d = formatDateLocal(dateObj);
    return allowedDates.includes(d);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceType || !topic || !expert || !date || !session || !timeSlot || !desc) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const payload = {
        id_chuyen_gia: expert.id_chuyen_gia,
        id_khung_gio: timeSlot,
        ngay_kham: formatDateLocal(date), // ✅ fix timezone
        loai_hen: serviceType, // online | truc_tiep
        loai_dinh_duong: topic, // Giảm cân, Tăng cân...
        ly_do_tu_van: desc,
      };

      console.log("Payload gửi lên:", payload);

      await apiCuocHenTuVan.create(payload);

      toast.success("Đặt lịch tư vấn thành công!");
      onClose();
    } catch (err) {
      toast.error("Có lỗi khi đặt lịch tư vấn!");
      console.error(err);
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

          {/* loại dinh dưỡng */}
          <div className="form-group">
            <label className="form-label">
              <Heart size={16} className="label-icon" />
              Loại dinh dưỡng
            </label>
            <div className="input-wrapper">
              <select
                className="form-select modern-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="">-- Chọn loại dinh dưỡng --</option>
                <option value="Giảm cân">Giảm cân</option>
                <option value="Tăng cân">Tăng cân</option>
                <option value="Dinh dưỡng thể thao">Dinh dưỡng thể thao</option>
                <option value="Tiểu đường">Tiểu đường</option>
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
              <select
                className="form-select modern-select"
                value={expert ? expert.id_chuyen_gia : ""}
                onChange={(e) => {
                  const selectedExpert = experts.find(
                    (d) => String(d.id_chuyen_gia) === String(e.target.value)
                  );
                  setExpert(selectedExpert || null);
                  setDate(null);
                  setSession("");
                  setTimeSlot("");
                }}
              >
                <option value="">-- Chọn chuyên gia --</option>
                {experts.map((cg) => (
                  <option key={cg.id_chuyen_gia} value={cg.id_chuyen_gia}>
                    {cg.ho_ten}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id_khung_gio}
                    type="button"
                    className={`time-slot-btn ${
                      timeSlot === slot.id_khung_gio ? "active" : ""
                    }`}
                    onClick={() => setTimeSlot(slot.id_khung_gio)}
                  >
                    <Clock size={14} />
                    <span>{slot.gio_bat_dau} - {slot.gio_ket_thuc}</span>
                  </button>
                ))}
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
    </div>
  );
};

export default BookingModalChuyenGia;
