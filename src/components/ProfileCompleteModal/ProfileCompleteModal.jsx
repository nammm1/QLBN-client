import React from "react";
import { Modal, Button } from "antd";
import { UserOutlined, EditOutlined, ArrowRightOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ProfileCompleteModal.css";

const ProfileCompleteModal = ({ open, onCancel, missingFields }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onCancel();
    navigate("/updateprofile");
  };

  const fieldLabels = {
    nghe_nghiep: "Nghề nghiệp",
    thong_tin_bao_hiem: "Thông tin bảo hiểm",
    ten_nguoi_lien_he_khan_cap: "Tên người liên hệ khẩn cấp",
    sdt_nguoi_lien_he_khan_cap: "Số điện thoại người liên hệ khẩn cấp",
    tien_su_benh_ly: "Tiền sử bệnh lý",
    tinh_trang_suc_khoe_hien_tai: "Tình trạng sức khỏe hiện tại",
    ma_BHYT: "Mã BHYT",
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={520}
      className="profile-complete-modal"
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
      closeIcon={<CloseOutlined style={{ fontSize: 18 }} />}
    >
      <div className="profile-complete-content">
        {/* Icon */}
        <div className="profile-complete-icon">
          <div className="profile-complete-icon-circle">
            <UserOutlined />
          </div>
        </div>

        {/* Title */}
        <h2 className="profile-complete-title">
          Cập nhật thông tin hồ sơ
        </h2>

        {/* Description */}
        <p className="profile-complete-description">
          Để sử dụng đầy đủ các tính năng của hệ thống, vui lòng hoàn thiện các thông tin sau trong hồ sơ của bạn:
        </p>

        {/* Missing Fields List */}
        <div className="profile-complete-fields">
          {missingFields.map((field, index) => (
            <div key={field} className="profile-complete-field-item">
              <EditOutlined className="field-icon" />
              <span>{fieldLabels[field] || field}</span>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="profile-complete-note">
          <p>Bạn có thể bỏ qua và cập nhật sau, nhưng việc hoàn thiện thông tin sẽ giúp bạn sử dụng các dịch vụ một cách tốt hơn.</p>
        </div>

        {/* Actions */}
        <div className="profile-complete-actions">
          <Button
            type="default"
            size="large"
            onClick={onCancel}
            className="skip-btn"
          >
            Bỏ qua
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<EditOutlined />}
            onClick={handleGoToProfile}
            className="update-btn"
          >
            Cập nhật ngay
            <ArrowRightOutlined className="arrow-icon" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileCompleteModal;

