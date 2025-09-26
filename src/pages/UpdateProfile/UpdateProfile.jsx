import React, { useState } from "react";
import "./UpdateProfile.css";

const UpdateProfile = () => {
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    ho_ten: "",
    ngay_sinh: "",
    gioi_tinh: "",
    email: "",
    so_dien_thoai: "",
    ma_bhyt: "",
    ten_nguoi_than: "",
    sdt_nguoi_than: "",
  });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cập nhật thành công!\n" + JSON.stringify(formData, null, 2));
  };

  return (
    <div className="profile-container">
      {/* Cột trái: Avatar */}
      <div className="profile-left">
        <h3>Profile Picture</h3>
        <div className="profile-avatar">
          <img
            src={
              image ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Avatar"
          />
        </div>
        <p>JPG hoặc PNG dung lượng không lớn hơn 5 MB</p>
        <label htmlFor="upload" className="upload-btn">
          Upload new image
        </label>
        <input
          type="file"
          id="upload"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />
      </div>

      {/* Cột phải: Form */}
      <div className="profile-right">
        <h3>Thông tin cá nhân</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="ho_ten"
                value={formData.ho_ten}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Giới tính</label>
              <select
                name="gioi_tinh"
                value={formData.gioi_tinh}
                onChange={handleChange}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mã BHYT</label>
              <input
                type="text"
                name="ma_bhyt"
                value={formData.ma_bhyt}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Tên người thân</label>
              <input
                type="text"
                name="ten_nguoi_than"
                value={formData.ten_nguoi_than}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>SĐT người thân</label>
              <input
                type="tel"
                name="sdt_nguoi_than"
                value={formData.sdt_nguoi_than}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="save-btn">
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
