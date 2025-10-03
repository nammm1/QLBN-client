import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const DoctorDashboard = () => {
  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <h2 className="mb-4 fw-bold text-primary">
        👨‍⚕️ Trang tổng quan bác sĩ
      </h2>

      {/* Stats cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center text-center bg-info text-white rounded">
              <h6 className="card-title">Bệnh nhân hôm nay</h6>
              <p className="fs-3 fw-bold mb-0">12</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center text-center bg-success text-white rounded">
              <h6 className="card-title">Lịch hẹn</h6>
              <p className="fs-3 fw-bold mb-0">8</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center text-center bg-warning text-dark rounded">
              <h6 className="card-title">Hồ sơ chờ duyệt</h6>
              <p className="fs-3 fw-bold mb-0">5</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center text-center bg-danger text-white rounded">
              <h6 className="card-title">Báo cáo mới</h6>
              <p className="fs-3 fw-bold mb-0">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Extra sections */}
      <div className="row g-4">
        {/* Upcoming appointments */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white fw-bold">
              📅 Lịch hẹn sắp tới
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Bệnh nhân A</span> <span>09:00</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Bệnh nhân B</span> <span>10:30</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Bệnh nhân C</span> <span>14:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notifications / Messages */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white fw-bold">
              💬 Thông báo / Tin nhắn
            </div>
            <div className="card-body">
              <div className="alert alert-info">Bệnh nhân D đã gửi tin nhắn.</div>
              <div className="alert alert-warning">
                Hồ sơ E cần duyệt gấp hôm nay.
              </div>
              <div className="alert alert-success">
                Bạn có báo cáo mới từ hệ thống.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
