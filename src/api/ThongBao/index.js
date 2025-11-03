import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiThongBao = {
  // Tạo thông báo mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}thong-bao`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error createThongBao:", err);
      throw err;
    }
  },

  // Lấy thông báo theo người dùng
  getByUser: async (id_nguoi_dung, options = {}) => {
    try {
      const params = {};
      if (options.trang_thai) {
        params.trang_thai = options.trang_thai;
      }
      if (options.limit) {
        params.limit = options.limit;
      }
      
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}thong-bao/user/${id_nguoi_dung}`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error getThongBaoByUser:", err);
      throw err;
    }
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (id_nguoi_dung) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}thong-bao/user/${id_nguoi_dung}/unread-count`
      );
      return res.data;
    } catch (err) {
      console.error("Error getUnreadCount:", err);
      throw err;
    }
  },

  // Đánh dấu đã đọc
  markAsRead: async (id_thong_bao) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}thong-bao/${id_thong_bao}/read`
      );
      return res.data;
    } catch (err) {
      console.error("Error markAsRead:", err);
      throw err;
    }
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (id_nguoi_dung) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}thong-bao/user/${id_nguoi_dung}/read-all`
      );
      return res.data;
    } catch (err) {
      console.error("Error markAllAsRead:", err);
      throw err;
    }
  },

  // Xóa thông báo
  delete: async (id_thong_bao) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}thong-bao/${id_thong_bao}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleteThongBao:", err);
      throw err;
    }
  },

  // Lấy thông báo theo ID
  getById: async (id_thong_bao) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}thong-bao/${id_thong_bao}`
      );
      return res.data;
    } catch (err) {
      console.error("Error getThongBaoById:", err);
      throw err;
    }
  },
};

export default apiThongBao;

