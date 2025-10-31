import React, { useState, useEffect } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "../../utils/toast";

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
    <div className="modal-overlay">
      <div className="modal-container">
        <h4 className="modal-header-title fw-bold text-center mb-3">
          Đăng ký tư vấn dinh dưỡng
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
                    serviceType === opt.value ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setServiceType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* loại dinh dưỡng */}
          <div className="mb-3">
            <label className="form-label">Loại dinh dưỡng</label>
            <select
              className="form-select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Chọn loại dinh dưỡng</option>
              <option value="Giảm cân">Giảm cân</option>
              <option value="Tăng cân">Tăng cân</option>
              <option value="Dinh dưỡng thể thao">Dinh dưỡng thể thao</option>
              <option value="Tiểu đường">Tiểu đường</option>
            </select>
          </div>

          {/* chuyên gia */}
          <div className="mb-3">
            <label className="form-label">Chọn chuyên gia</label>
            <select
              className="form-select"
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
              <option value="">Chọn chuyên gia</option>
              {experts.map((cg) => (
                <option key={cg.id_chuyen_gia} value={cg.id_chuyen_gia}>
                  {cg.ho_ten}
                </option>
              ))}
            </select>
          </div>

          {/* ngày + ca + khung giờ */}
          <div className="mb-3">
            <label className="form-label">Chọn ngày tư vấn</label>
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
              disabled={!expert}
            />

            {date && (
              <div className="session-buttons mt-2">
                {(expertSchedule[formatDateLocal(date)] || []).map((s) => (
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
                      timeSlot === slot.id_khung_gio ? "btn-info" : "btn-outline-info"
                    } mx-1 my-1`}
                    onClick={() => setTimeSlot(slot.id_khung_gio)}
                  >
                    {slot.gio_bat_dau} - {slot.gio_ket_thuc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* lý do tư vấn */}
          <div className="mb-3">
            <label className="form-label">Lý do tư vấn</label>
            <textarea
              className="form-control"
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Hãy mô tả chi tiết mong muốn tư vấn..."
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

export default BookingModalChuyenGia;
