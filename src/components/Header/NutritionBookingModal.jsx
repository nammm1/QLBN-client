import React, { useState } from "react";
import "./BookingModal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const services = ["Tư vấn trực tiếp", "Tư vấn online"];
const topics = ["Dinh dưỡng thể thao", "Giảm cân", "Tăng cân"];
const expertsByTopic = {
  "Dinh dưỡng thể thao": ["CG A", "CG B"],
  "Giảm cân": ["CG C", "CG D"],
  "Tăng cân": ["CG E", "CG F"],
};

// Giả sử lịch làm việc của chuyên gia
const expertSchedule = {
  "CG A": {
    "2025-09-25": ["Sáng"],
    "2025-09-26": ["Chiều"],
    "2025-09-27": ["Sáng", "Chiều"],
  },
  "CG B": {
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

const NutritionBookingModal = ({ show, onClose }) => {
  const [service, setService] = useState("");
  const [topic, setTopic] = useState("");
  const [expert, setExpert] = useState("");
  const [date, setDate] = useState(null);
  const [session, setSession] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [desc, setDesc] = useState("");

  if (!show) return null;

  // danh sách ngày chuyên gia có lịch
  const allowedDates = expert ? Object.keys(expertSchedule[expert] || {}) : [];

  const isAllowedDate = (dateObj) => {
    const d = dateObj.toISOString().split("T")[0];
    return allowedDates.includes(d);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!service || !topic || !expert || !date || !session || !timeSlot) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }
    alert(
      `Đặt lịch thành công với ${expert} - ${topic} vào ${date.toLocaleDateString()} (${session}, ${timeSlot})`
    );
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h4 className="modal-header-title fw-bold text-center mb-3">
          Đặt lịch tư vấn dinh dưỡng
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

          {/* Tư vấn về */}
          <div className="mb-3">
            <label className="form-label">Tư vấn về</label>
            <select
              className="form-select"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setExpert("");
              }}
              disabled={!service}
            >
              <option value="">Chọn chủ đề</option>
              {topics.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>

          {/* Chuyên gia */}
          <div className="mb-3">
            <label className="form-label">Chọn chuyên gia</label>
            <select
              className="form-select"
              value={expert}
              onChange={(e) => {
                setExpert(e.target.value);
                setDate(null);
                setSession("");
                setTimeSlot("");
              }}
              disabled={!topic}
            >
              <option value="">Chọn chuyên gia</option>
              {topic &&
                expertsByTopic[topic].map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
            </select>
          </div>

          {/* Ngày & Buổi */}
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
              showIcon
              popperPlacement="bottom"
              calendarClassName="custom-calendar"
              dayClassName={(d) => {
                const dStr = d.toISOString().split("T")[0];
                return allowedDates.includes(dStr) ? "highlight-day" : undefined;
              }}
              disabled={!expert}
            />

            {/* Chọn buổi */}
            {date && (
              <div className="session-buttons mt-2">
                {(expertSchedule[expert][date.toISOString().split("T")[0]] ||
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
            <label className="form-label">Mô tả vấn đề dinh dưỡng</label>
            <textarea
              className="form-control"
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Hãy mô tả vấn đề dinh dưỡng bạn cần tư vấn..."
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

export default NutritionBookingModal;
