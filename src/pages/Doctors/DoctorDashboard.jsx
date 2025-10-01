import React from "react";

const DoctorDashboard = () => {
  return (
    <div>
      <h2 className="mb-4">Trang tổng quan bác sĩ</h2>
      <div className="row">
        <div className="col-md-3">
          <div className="card text-white bg-info mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Bệnh nhân hôm nay</h5>
              <p className="card-text fs-4">12</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Lịch hẹn</h5>
              <p className="card-text fs-4">8</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Hồ sơ chờ duyệt</h5>
              <p className="card-text fs-4">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
