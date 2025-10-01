import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiDichVu = {
  // Tạo dịch vụ mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DichVu}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating dịch vụ:", err);
      throw err;
    }
  },

  // Lấy tất cả dịch vụ
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DichVu}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all dịch vụ:", err);
      throw err;
    }
  },

  // Lấy dịch vụ theo ID
  getById: async (id_dich_vu) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DichVu}/${id_dich_vu}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching dịch vụ by id:", err);
      throw err;
    }
  },

  // Cập nhật dịch vụ
  update: async (id_dich_vu, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DichVu}/${id_dich_vu}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating dịch vụ:", err);
      throw err;
    }
  },

  // Xóa dịch vụ
  delete: async (id_dich_vu) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DichVu}/${id_dich_vu}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting dịch vụ:", err);
      throw err;
    }
  },
};

export default apiDichVu;
