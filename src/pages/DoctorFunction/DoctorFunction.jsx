import React from "react";
import { Link } from "react-router-dom";
import "./DoctorFunction.css";

const DoctorFunction = () => {
  return (
    <div className="doctor-function container py-5">
      <h2 className="mb-4 text-center fw-bold">Chức năng dành cho Bác sĩ</h2>
      <div className="row g-4 justify-content-center">

        {/* Hồ sơ bệnh án */}
        <div className="col-md-3">
          <Link to="/doctor-medical-records" className="function-card">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">Hồ sơ bệnh án</h5>
                <p className="card-text">Truy cập và cập nhật thông tin hồ sơ bệnh án của bệnh nhân.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Lịch làm việc */}
        <div className="col-md-3">
          <Link to="/doctor-schedule" className="function-card">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">Lịch làm việc</h5>
                <p className="card-text">Xem và quản lý lịch làm việc hằng ngày/tuần.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Lịch hẹn */}
        <div className="col-md-3">
          <Link to="/doctor-appointments" className="function-card">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">Lịch hẹn</h5>
                <p className="card-text">Xem, xác nhận và cập nhật lịch hẹn khám bệnh của bệnh nhân.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Chỉ định xét nghiệm */}
        <div className="col-md-3">
          <Link to="/doctor-tests" className="function-card">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">Chỉ định xét nghiệm</h5>
                <p className="card-text">Đưa ra các chỉ định xét nghiệm cho bệnh nhân.</p>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DoctorFunction;
