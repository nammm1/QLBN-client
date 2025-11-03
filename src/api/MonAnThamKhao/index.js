import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiMonAnThamKhao = {
  // Tạo món ăn tham khảo
  create: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating món ăn tham khảo:", error);
      throw error;
    }
  },

  // Lấy tất cả món ăn tham khảo
  getAll: async (loai_mon = null) => {
    try {
      const url = loai_mon 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}?loai_mon=${loai_mon}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}`;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching món ăn tham khảo:", error);
      throw error;
    }
  },

  // Tìm kiếm món ăn theo tên
  search: async (ten_mon) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}/search?ten_mon=${ten_mon}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error searching món ăn tham khảo:", error);
      throw error;
    }
  },

  // Lấy món ăn tham khảo theo ID
  getById: async (id_mon_an) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}/${id_mon_an}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching món ăn tham khảo by ID:", error);
      throw error;
    }
  },

  // Cập nhật món ăn tham khảo
  update: async (id_mon_an, data) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}/${id_mon_an}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating món ăn tham khảo:", error);
      throw error;
    }
  },

  // Xóa món ăn tham khảo
  delete: async (id_mon_an) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.MonAnThamKhao}/${id_mon_an}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting món ăn tham khảo:", error);
      throw error;
    }
  },
};

export default apiMonAnThamKhao;

