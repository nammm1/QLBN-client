import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiKhungGioKham = {
  // Tạo khung giờ khám
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KhungGioKham}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating khung gio kham:", err);
      throw err;
    }
  },

  // Lấy danh sách khung giờ khám
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KhungGioKham}/`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching khung gio kham list:", err);
      throw err;
    }
  },

  // Lấy chi tiết khung giờ theo ID
  getById: async (id_khung_gio) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KhungGioKham}/${id_khung_gio}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching khung gio kham by id:", err);
      throw err;
    }
  },

  // Cập nhật khung giờ khám
  update: async (id_khung_gio, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KhungGioKham}/${id_khung_gio}`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating khung gio kham:", err);
      throw err;
    }
  },

  // Xóa khung giờ khám
  delete: async (id_khung_gio) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KhungGioKham}/${id_khung_gio}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting khung gio kham:", err);
      throw err;
    }
  },
};

export default apiKhungGioKham;
