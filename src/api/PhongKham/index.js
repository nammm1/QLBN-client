import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiPhongKham = {
  // Lấy tất cả phòng khám
  getAll: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all phòng khám:", err);
      throw err;
    }
  },

  // Lấy tất cả phòng khám cho Admin (không mặc định lọc trạng thái)
  getAllAdmin: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/admin`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all phòng khám for admin:", err);
      throw err;
    }
  },

  // Lấy phòng khám theo ID
  getById: async (id_phong_kham) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/${id_phong_kham}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching phòng khám by id:", err);
      throw err;
    }
  },

  // Tạo phòng khám mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating phòng khám:", err);
      throw err;
    }
  },

  // Cập nhật phòng khám
  update: async (id_phong_kham, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/${id_phong_kham}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating phòng khám:", err);
      throw err;
    }
  },

  // Xóa phòng khám
  delete: async (id_phong_kham) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/${id_phong_kham}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting phòng khám:", err);
      throw err;
    }
  },
};

export default apiPhongKham;
