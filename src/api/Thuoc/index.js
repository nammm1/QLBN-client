import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiThuoc = {
  // Tạo thuốc mới
  createThuoc: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.THUOC}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating thuoc:", err);
      throw err;
    }
  },

  // Lấy danh sách tất cả thuốc
  getAllThuoc: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.THUOC}/`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching all thuoc:", err);
      throw err;
    }
  },

  // Lấy chi tiết thuốc theo ID
  getThuocById: async (id_thuoc) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.THUOC}/${id_thuoc}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching thuoc by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin thuốc
  updateThuoc: async (id_thuoc, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.THUOC}/${id_thuoc}`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating thuoc:", err);
      throw err;
    }
  },

  // Xóa thuốc
  deleteThuoc: async (id_thuoc) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.THUOC}/${id_thuoc}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting thuoc:", err);
      throw err;
    }
  },
};

export default apiThuoc;
