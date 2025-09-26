import React, { useState } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const services = ["Khám trong giờ", "Khám ngoài giờ"];
const specialties = ["Tim mạch", "Thần kinh", "Nhi khoa"];
const doctorsBySpecialty = {
  "Tim mạch": ["BS A", "BS B"],
  "Thần kinh": ["BS C", "BS D"],
  "Nhi khoa": ["BS E", "BS F"],
};

// Giả sử lịch làm việc của bác sĩ
const doctorSchedule = {
  "BS A": {
    "2025-09-25": ["Sáng"],
    "2025-09-26": ["Chiều"],
    "2025-09-27": ["Sáng", "Chiều"],
  },
  "BS B": {
    "2025-09-29": ["Chiều"],
    "2025-09-30": ["Sáng"],
  },
};

const timeSlotsBySession = {
  Sáng: [
    "7:00-7:30",
    "7:30-8:00",
    "8:00-8:30",
    "8:30-9:00",
    "9:00-9:30",
    "9:30-10:00",
    "10:00-10:30",
    "10:30-11:00",
  ],
  Chiều: [
    "13:00-13:30",
    "13:30-14:00",
    "14:00-14:30",
    "14:30-15:00",
    "15:00-15:30",
    "15:30-16:00",
    "16:00-16:30",
    "16:30-17:00",
  ],
};

const BookingModal = ({ show, onClose }) => {
  const [service, setService] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [desc, setDesc] = useState("");

  if (!show) return null;

  // danh sách ngày bác sĩ có lịch
  const allowedDates = doctor ? Object.keys(doctorSchedule[doctor] || {}) : [];

  const isAllowedDate = (dateObj) => {
    const d = dateObj.toISOString().split("T")[0];
    return allowedDates.includes(d);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!service || !specialty || !doctor || !date || !session || !timeSlot) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }
    alert(
      `Đặt lịch thành công với ${doctor} - ${specialty} vào ${date.toLocaleDateString()} (${session}, ${timeSlot})`
    );
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h4 className="modal-header-title fw-bold text-center mb-3">
          Đăng ký khám bệnh
        </h4>

        <form onSubmit={handleSubmit}>
          {/* Dịch vụ */}
          <div className="mb-3">
            <label className="form-label">Chọn loại dịch vụ</label>
            <div className="service-buttons">
              {services.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn ${
                    service === s ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setService(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Chuyên khoa */}
          <div className="mb-3">
            <label className="form-label">Chọn chuyên khoa</label>
            <select
              className="form-select"
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setDoctor("");
              }}
              disabled={!service}
            >
              <option value="">Chọn chuyên khoa</option>
              {specialties.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          {/* Bác sĩ */}
          <div className="mb-3">
            <label className="form-label">Chọn bác sĩ</label>
            <select
              className="form-select"
              value={doctor}
              onChange={(e) => {
                setDoctor(e.target.value);
                setDate(null);
                setSession("");
                setTimeSlot("");
              }}
              disabled={!specialty}
            >
              <option value="">Chọn bác sĩ</option>
              {specialty &&
                doctorsBySpecialty[specialty].map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
            </select>
          </div>

          {/* Ngày & Buổi */}
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
              showIcon
              popperPlacement="bottom"
              calendarClassName="custom-calendar"
              dayClassName={(d) => {
                const dStr = d.toISOString().split("T")[0];
                return allowedDates.includes(dStr) ? "highlight-day" : undefined;
              }}
              disabled={!doctor}
            />

            {/* Chọn buổi */}
            {date && (
              <div className="session-buttons mt-2">
                {(doctorSchedule[doctor][date.toISOString().split("T")[0]] ||
                  []).map((s) => (
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

            {/* Chọn khung giờ */}
            {session && (
              <div className="time-slots mt-2">
                {timeSlotsBySession[session].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`btn ${
                      timeSlot === slot ? "btn-info" : "btn-outline-info"
                    } mx-1 my-1`}
                    onClick={() => setTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div className="mb-3">
            <label className="form-label">Mô tả vấn đề sức khỏe</label>
            <textarea
              className="form-control"
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Hãy mô tả vấn đề sức khỏe bạn gặp phải..."
            ></textarea>
          </div>

          {/* Buttons */}
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
