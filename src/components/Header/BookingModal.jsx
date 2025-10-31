import React, { useState, useEffect } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "../../utils/toast";

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
    <div className="modal-overlay">
      <div className="modal-container">
        <h4 className="modal-header-title fw-bold text-center mb-3">
          Đăng ký khám bệnh
        </h4>

        <form onSubmit={handleSubmit}>
          {/* loại hẹn */}
          <div className="mb-3">
            <label className="form-label">Chọn loại hẹn</label>
            <div className="d-flex gap-2">
              {[
                { label: "Trực tiếp", value: "truc_tiep" },
                { label: "Online", value: "online" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn ${
                    serviceTypeBooking === opt.value ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setServiceTypeBooking(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* chuyên khoa */}
          <div className="mb-3">
            <label className="form-label">Chọn chuyên khoa</label>
            <select
              className="form-select"
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setDoctor(null);
              }}
            >
              <option value="">Chọn chuyên khoa</option>
              {specialties.map((sp) => (
                <option key={sp.id_chuyen_khoa} value={sp.id_chuyen_khoa}>
                  {sp.ten_chuyen_khoa}
                </option>
              ))}
            </select>
          </div>

          {/* bác sĩ */}
          <div className="mb-3">
            <label className="form-label">Chọn bác sĩ</label>
            <select
              className="form-select"
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
              <option value="">Chọn bác sĩ</option>
              {doctors.map((doc) => (
                <option key={doc.id_bac_si} value={doc.id_bac_si}>
                  {doc.ho_ten}
                </option>
              ))}
            </select>
          </div>

          {/* ngày + ca + khung giờ */}
          <div className="mb-3">
            <label className="form-label">Chọn ngày khám</label>
            <DatePicker
              selected={date}
              onChange={(d) => {
                setDate(d);
                setSession("");
                setTimeSlot("");
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              minDate={new Date()}
              filterDate={isAllowedDate}
              disabled={!doctor}
            />

            {date && (
              <div className="session-buttons mt-2">
                {(doctorSchedule[formatDate(date)] || []).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`btn ${
                      session === s ? "btn-success" : "btn-outline-success"
                    } mx-1`}
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
              <div className="time-slots mt-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id_khung_gio}
                    type="button"
                    className={`btn ${
                      timeSlot === slot.id_khung_gio
                        ? "btn-info"
                        : "btn-outline-info"
                    } mx-1 my-1`}
                    onClick={() => setTimeSlot(slot.id_khung_gio)}
                  >
                    {slot.gio_bat_dau} - {slot.gio_ket_thuc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* mô tả */}
          <div className="mb-3">
            <label className="form-label">Lý do khám</label>
            <textarea
              className="form-control"
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Hãy mô tả lý do khám..."
            ></textarea>
          </div>

          {/* buttons */}
          <div className="form-actions d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-success btn-sm">
              Đặt lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
