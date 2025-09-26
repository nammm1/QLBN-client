import React from "react";
import { Link } from "react-router-dom";
import "./PatientFunction.css";

const PatientFunction = () => {
  return (
    <div className="patient-function container py-5">
      <h2 className="mb-4 text-center fw-bold">Chức năng dành cho Bệnh nhân</h2>
      <div className="row g-4 justify-content-center">
        {/* Hồ sơ bệnh án */}
        <div className="col-md-4">
          <Link to="/medical-records" className="function-card">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">📋 Hồ sơ bệnh án</h5>
                <p className="card-text">Xem thông tin hồ sơ và lịch sử khám chữa bệnh.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Lịch hẹn */}
        <div className="col-md-4">
          <Link to="/appointments" className="function-card">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">📅 Lịch hẹn</h5>
                <p className="card-text">Theo dõi và quản lý lịch hẹn khám bệnh.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientFunction;
