import React, { useState, useEffect } from "react";
import apiLichLamViec from "../../../api/LichLamViec";

const caList = ["Sáng", "Chiều", "Tối"];
const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const mapCa = (ca) => {
  switch (ca) {
    case "Sang": return "Sáng";
    case "Chieu": return "Chiều";
    case "Toi": return "Tối";
    default: return ca;
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("sv-SE"); // yyyy-mm-dd
};

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0,0,0,0);
  return monday;
};

const WorkSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [schedule, setSchedule] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    setWeekStart(getMonday(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await apiLichLamViec.getByWeek(weekStart, userInfo.user.id_nguoi_dung);
        const data = res?.data?.data || res?.data || res;
        setSchedule(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("Lỗi khi lấy lịch làm việc:", error);
        setSchedule([]);
      }
    };
    fetchSchedule();
  }, [weekStart, userInfo?.user?.id_nguoi_dung]);

  const handleDateChange = (e) => {
    const picked = new Date(e.target.value);
    setSelectedDate(picked);
  };

  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const hasSchedulesFor = (d, displayCa) => {
    const dStr = formatDate(d);
    return schedule.filter(
      (s) => mapCa(s.ca) === displayCa && formatDate(s.ngay_lam_viec) === dStr
    );
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return (
    <div className="container mt-5">
      <h3 className="mb-5 text-primary">
        Lịch làm việc bác sĩ {userInfo?.user?.ho_ten || ""}
      </h3>

      <div className="d-flex align-items-center gap-3 mb-5">
        <div className="d-flex align-items-center gap-2 ">
          <label className="fw-bold">Chọn ngày trong tuần:</label>
          <input
            type="date"
            className="form-control"
            value={formatDate(selectedDate)}
            onChange={handleDateChange}
            style={{ maxWidth: 220 }}
          />
        </div>
        <div>
          <span className="badge bg-info text-dark fs-6 p-2">
            Tuần: {new Date(weekStart).toLocaleDateString("vi-VN")} → {weekEnd.toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle shadow-sm mt-3">
          <thead className="table-primary">
            <tr>
              <th style={{ width: "120px" }}>Ca / Ngày</th>
              {weekDays.map((d, idx) => (
                <th key={idx} style={{ minWidth: "140px" }}>
                  <div className="fw-bold">{dayNames[idx]}</div>
                  <small>{d.toLocaleDateString("vi-VN")}</small>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {caList.map((displayCa) => (
              <tr key={displayCa}>
                <td className="fw-bold bg-light">{displayCa}</td>
                {weekDays.map((d, idx) => {
                  const matched = hasSchedulesFor(d, displayCa);
                  return (
                    <td
                      key={idx}
                      className={`p-2 ${matched.length ? "bg-success text-white" : "bg-light text-muted"}`}
                      style={{ height: "80px", verticalAlign: "middle" }}
                    >
                      {matched.length ? (
                        matched.map((m, k) => (
                          <div
                            key={k}
                            className="rounded p-1 mb-1"
                            style={{ fontSize: "14px" }}
                          >
                            {m.gio_bat_dau && m.gio_ket_thuc
                              ? `${m.gio_bat_dau} - ${m.gio_ket_thuc}`
                              : "Có lịch"}
                          </div>
                        ))
                      ) : (
                        <span>Trống</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkSchedule;
