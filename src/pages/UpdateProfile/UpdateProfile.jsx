import React, { useState, useEffect } from "react";
import "./UpdateProfile.css";
import { Modal, message } from "antd";
import apiBenhNhan from "../../api/BenhNhan";
import apiNguoiDung from "../../api/NguoiDung";

const unwrap = (res) => {
  if (res == null) return null;
  const payload = res.data ?? res;
  if (payload && payload.data !== undefined) return payload.data;
  return payload;
};

const toInputDateString = (value) => {
  if (!value) return "";
  // value may be ISO "YYYY-MM-DDT..." or "YYYY-MM-DD"
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  try {
    const d = new Date(value);
    if (isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
};

const UpdateProfile = () => {
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    so_dien_thoai: "",
    ho_ten: "",
    ngay_sinh: "",
    gioi_tinh: "",
    so_cccd: "",
    dia_chi: "",
    anh_dai_dien: "",
    nghe_nghiep: "",
    ten_nguoi_lien_he_khan_cap: "",
    sdt_nguoi_lien_he_khan_cap: "",
    ma_BHYT: "",
  });

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    mat_khau_hien_tai: "",
    mat_khau_moi: "",
    xac_nhan_mat_khau: "",
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const id_nguoi_dung =
    userInfo?.user?.id_benh_nhan || userInfo?.user?.id_nguoi_dung || null;

  // Load both NguoiDung and BenhNhan and merge
  useEffect(() => {
    const fetchData = async () => {
      if (!id_nguoi_dung) {
        console.warn("Không tìm thấy id_nguoi_dung trong localStorage");
        return;
      }
      try {
        const [resUser, resPatient] = await Promise.all([
          apiNguoiDung.getById?.(id_nguoi_dung).catch((e) => null),
          apiBenhNhan.getById?.(id_nguoi_dung).catch((e) => null),
        ]);

        const userData = unwrap(resUser) ?? {};
        const benhNhanData = unwrap(resPatient) ?? {};

        const merged = {
          email: userData.email ?? benhNhanData.email ?? "",
          so_dien_thoai: userData.so_dien_thoai ?? benhNhanData.so_dien_thoai ?? "",
          ho_ten: userData.ho_ten ?? benhNhanData.ho_ten ?? "",
          ngay_sinh: userData.ngay_sinh ?? benhNhanData.ngay_sinh ?? "",
          gioi_tinh: userData.gioi_tinh ?? benhNhanData.gioi_tinh ?? "",
          so_cccd: userData.so_cccd ?? benhNhanData.so_cccd ?? "",
          dia_chi: userData.dia_chi ?? benhNhanData.dia_chi ?? "",
          anh_dai_dien: userData.anh_dai_dien ?? benhNhanData.anh_dai_dien ?? "",
          nghe_nghiep: benhNhanData.nghe_nghiep ?? "",
          ten_nguoi_lien_he_khan_cap: benhNhanData.ten_nguoi_lien_he_khan_cap ?? "",
          sdt_nguoi_lien_he_khan_cap: benhNhanData.sdt_nguoi_lien_he_khan_cap ?? "",
          ma_BHYT: benhNhanData.ma_BHYT ?? "",
        };

        setFormData((p) => ({ ...p, ...merged }));
        if (merged.anh_dai_dien) setImage(merged.anh_dai_dien);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu hồ sơ:", err);
        message.error("Không thể tải thông tin bệnh nhân!");
      }
    };

    fetchData();
  }, [id_nguoi_dung]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setFormData((prev) => ({ ...prev, anh_dai_dien: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save: update NguoiDung (user fields) and BenhNhan (patient fields)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id_nguoi_dung) return message.error("Không xác định được người dùng!");

    const userPayload = {
      email: formData.email,
      so_dien_thoai: formData.so_dien_thoai,
      ho_ten: formData.ho_ten,
      ngay_sinh: formData.ngay_sinh || null, // send YYYY-MM-DD or null
      gioi_tinh: formData.gioi_tinh,
      so_cccd: formData.so_cccd,
      dia_chi: formData.dia_chi,
      anh_dai_dien: formData.anh_dai_dien,
    };

    const patientPayload = {
      nghe_nghiep: formData.nghe_nghiep,
      ten_nguoi_lien_he_khan_cap: formData.ten_nguoi_lien_he_khan_cap,
      sdt_nguoi_lien_he_khan_cap: formData.sdt_nguoi_lien_he_khan_cap,
      ma_BHYT: formData.ma_BHYT,
    };

    try {
      // update user
      if (apiNguoiDung.updateUser) {
        await apiNguoiDung.updateUser(id_nguoi_dung, userPayload);
      } else if (apiNguoiDung.update) {
        await apiNguoiDung.update(id_nguoi_dung, userPayload);
      } else if (apiNguoiDung.put) {
        await apiNguoiDung.put(id_nguoi_dung, userPayload);
      }

      // update patient
      // id_benh_nhan likely same as id_nguoi_dung; try to call with that id
      if (apiBenhNhan.update) {
        await apiBenhNhan.update(id_nguoi_dung, patientPayload);
      } else if (apiBenhNhan.updateCurrent) {
        await apiBenhNhan.updateCurrent(patientPayload);
      } else if (apiBenhNhan.put) {
        await apiBenhNhan.put(id_nguoi_dung, patientPayload);
      }

      message.success("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      message.error("Cập nhật thất bại, vui lòng thử lại!");
    }
  };

  const handleChangePassword = async () => {
    const { mat_khau_hien_tai, mat_khau_moi, xac_nhan_mat_khau } = passwordForm;
    if (!mat_khau_hien_tai || !mat_khau_moi || !xac_nhan_mat_khau)
      return message.warning("Vui lòng nhập đầy đủ thông tin!");
    if (mat_khau_moi !== xac_nhan_mat_khau)
      return message.error("Mật khẩu mới không khớp!");

    try {
      if (apiNguoiDung.changePassword) {
        await apiNguoiDung.changePassword({ mat_khau_hien_tai, mat_khau_moi });
        message.success("Đổi mật khẩu thành công!");
        setPasswordModal(false);
        setPasswordForm({
          mat_khau_hien_tai: "",
          mat_khau_moi: "",
          xac_nhan_mat_khau: "",
        });
      } else {
        message.error("API đổi mật khẩu không có sẵn.");
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      message.error("Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-left">
        <h3>Ảnh đại diện</h3>
        <div className="profile-avatar">
          <img src={image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Avatar" />
        </div>
        <p>JPG hoặc PNG dung lượng ≤ 5 MB</p>
        <label htmlFor="upload" className="upload-btn">Tải ảnh mới</label>
        <input type="file" id="upload" accept="image/*" onChange={handleImageChange} hidden />
      </div>

      <div className="profile-right">
        <h3>Thông tin cá nhân</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {Object.entries({
              ho_ten: "Họ và tên",
              ngay_sinh: "Ngày sinh",
              gioi_tinh: "Giới tính",
              email: "Email",
              so_dien_thoai: "Số điện thoại",
              so_cccd: "Số CCCD",
              dia_chi: "Địa chỉ",
              nghe_nghiep: "Nghề nghiệp",
              ten_nguoi_lien_he_khan_cap: "Tên người liên hệ khẩn cấp",
              sdt_nguoi_lien_he_khan_cap: "SĐT người liên hệ khẩn cấp",
              ma_BHYT: "Mã BHYT",
            }).map(([name, label]) => (
              <div key={name} className="form-group">
                <label>{label}</label>
                {name === "gioi_tinh" ? (
                  <select name="gioi_tinh" value={formData.gioi_tinh} onChange={handleChange}>
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                ) : name === "ngay_sinh" ? (
                  <input
                    type="date"
                    name="ngay_sinh"
                    value={toInputDateString(formData.ngay_sinh)}
                    onChange={(e) => setFormData((p) => ({ ...p, ngay_sinh: e.target.value }))}
                  />
                ) : (
                  <input name={name} value={formData[name] ?? ""} onChange={handleChange} />
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="save-btn">💾 Lưu thay đổi</button>
          <button type="button" className="password-btn" onClick={() => setPasswordModal(true)}>🔒 Đổi mật khẩu</button>
        </form>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={passwordModal}
        onCancel={() => setPasswordModal(false)}
        onOk={handleChangePassword}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
      >
        <div className="form-group">
          <label>Mật khẩu cũ</label>
          <input type="password" value={passwordForm.mat_khau_hien_tai} onChange={(e) => setPasswordForm((p) => ({ ...p, mat_khau_hien_tai: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input type="password" value={passwordForm.mat_khau_moi} onChange={(e) => setPasswordForm((p) => ({ ...p, mat_khau_moi: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Nhập lại mật khẩu mới</label>
          <input type="password" value={passwordForm.xac_nhan_mat_khau} onChange={(e) => setPasswordForm((p) => ({ ...p, xac_nhan_mat_khau: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
};

export default UpdateProfile;