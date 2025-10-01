import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";

const apiNguoiDung = {
  // Đăng nhập
  login: async (data) => {
    try {
      const res = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/login`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error login:", err);
      throw err;
    }
  },

  // Đăng ký
  register: async (data) => {
    try {
      const res = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/register`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error register:", err);
      throw err;
    }
  },

  // Tạo người dùng theo role (QTV phân quyền)
  createUser: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/create-user`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error create user:", err);
      throw err;
    }
  },

  // Refresh token
  refreshToken: async (data) => {
    try {
      const res = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/refresh-token`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error refresh token:", err);
      throw err;
    }
  },

  // Lấy danh sách người dùng theo vai trò
  getUsersByRole: async (role) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/vai_tro?role=${role}`
      );
      return res.data;
    } catch (err) {
      console.error("Error get users by role:", err);
      throw err;
    }
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (id_nguoi_dung) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/${id_nguoi_dung}`
      );
      return res.data;
    } catch (err) {
      console.error("Error get user by id:", err);
      throw err;
    }
  },

  // Update trạng thái người dùng
  updateUserStatus: async (id_nguoi_dung, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/updatetrangthai/${id_nguoi_dung}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error update user status:", err);
      throw err;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id_nguoi_dung, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/${id_nguoi_dung}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error update user:", err);
      throw err;
    }
  },

  // Đổi mật khẩu
  changePassword: async (id_nguoi_dung, data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/${id_nguoi_dung}/change-password`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error change password:", err);
      throw err;
    }
  },
};

export default apiNguoiDung;
