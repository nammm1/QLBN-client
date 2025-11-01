import React from "react";
import { Modal, Button } from "antd";
import { LoginOutlined, UserOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginRequiredModal.css";

const LoginRequiredModal = ({ open, onCancel }) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onCancel();
    navigate("/login");
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      className="login-required-modal"
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
    >
      <div className="login-required-content">
        {/* Icon */}
        <div className="login-required-icon">
          <div className="login-required-icon-circle">
            <LockOutlined />
          </div>
        </div>

        {/* Title */}
        <h2 className="login-required-title">
          Yêu cầu đăng nhập
        </h2>

        {/* Description */}
        <p className="login-required-description">
          Để sử dụng chức năng này, bạn cần đăng nhập vào tài khoản của mình.
          Vui lòng đăng nhập để tiếp tục.
        </p>

        {/* Features List */}
        <div className="login-required-features">
          <div className="login-required-feature-item">
            <UserOutlined className="feature-icon" />
            <span>Đặt lịch khám bệnh</span>
          </div>
          <div className="login-required-feature-item">
            <UserOutlined className="feature-icon" />
            <span>Đặt lịch tư vấn dinh dưỡng</span>
          </div>
          <div className="login-required-feature-item">
            <UserOutlined className="feature-icon" />
            <span>Xem hồ sơ bệnh án</span>
          </div>
          <div className="login-required-feature-item">
            <UserOutlined className="feature-icon" />
            <span>Quản lý lịch hẹn</span>
          </div>
        </div>

        {/* Actions */}
        <div className="login-required-actions">
          <Button
            type="default"
            size="large"
            onClick={onCancel}
            className="cancel-btn"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleGoToLogin}
            className="login-btn"
          >
            Đăng nhập ngay
            <ArrowRightOutlined className="arrow-icon" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;
