import React, { useState, useEffect } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "../../utils/toast";
import { X, Calendar, Clock, User, Stethoscope, MessageSquare, Building2, Video, MapPin } from "lucide-react";

import apiChuyenKhoa from "../../api/ChuyenKhoa";
import apiBacSi from "../../api/BacSi";
import apiLichLamViec from "../../api/LichLamViec";
import apiKhungGioKham from "../../api/KhungGioKham";
import apiNguoiDung from "../../api/NguoiDung";
import apiCuocHenKhamBenh from "../../api/CuocHenKhamBenh";

// format ngày thành YYYY-MM-DD theo local time (không lệch múi giờ)
const formatDate = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BookingModal = ({ show, onClose }) => {
    const [serviceTypeBooking, setServiceTypeBooking] = useState(""); // truc_tiep/online
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [desc, setDesc] = useState("");

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

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
        } catch (err) {
          console.error("Lỗi khi tải bác sĩ:", err);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
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

  

  // load khung giờ
  useEffect(() => {
    if (session) {
      const fetchTimeSlots = async () => {
        try {
          const data = await apiKhungGioKham.getAll();
          const filtered = data.filter((kg) => kg.ca === session);
          setTimeSlots(filtered);
        } catch (err) {
          console.error("Lỗi khi tải khung giờ khám:", err);
        }
      };
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [session]);

  if (!show) return null;

  const allowedDates = doctor ? Object.keys(doctorSchedule) : [];
  const isAllowedDate = (dateObj) => {
    const d = formatDate(dateObj);
    return allowedDates.includes(d);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceTypeBooking || !specialty || !doctor || !date || !session || !timeSlot || !desc) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const payload = {
        id_bac_si: doctor.id_bac_si,
        id_chuyen_khoa: specialty,
        id_khung_gio: timeSlot,
        ngay_kham: formatDate(date), // dùng formatDate để không lệch múi giờ
        loai_hen: serviceTypeBooking, // truc_tiep/online
        ly_do_kham: desc,
      };

      console.log("Payload gửi lên:", payload);

      await apiCuocHenKhamBenh.create(payload);

      toast.success("Đặt lịch thành công!");
      onClose();
    } catch (err) {
      toast.error("Có lỗi khi đặt lịch!");
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-wrapper">
          <div className="modal-header-content">
            <Stethoscope className="modal-header-icon" size={28} />
            <h4 className="modal-header-title">Đăng ký khám bệnh</h4>
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
              <select
                className="form-select modern-select"
                value={doctor ? doctor.id_bac_si : ""}
                onChange={(e) => {
                  const selectedDoctor = doctors.find(
                    (d) => String(d.id_bac_si) === String(e.target.value)
                  );
                  setDoctor(selectedDoctor || null);
                  setDate(null);
                  setSession("");
                  setTimeSlot("");
                }}
                disabled={!specialty}
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((doc) => (
                  <option key={doc.id_bac_si} value={doc.id_bac_si}>
                    BS. {doc.ho_ten}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          {/* mô tả */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} className="label-icon" />
              Lý do khám
            </label>
            <div className="input-wrapper">
              <textarea
                className="form-control modern-textarea"
                rows="4"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lý do khám và các triệu chứng (nếu có)..."
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

export default BookingModal;
