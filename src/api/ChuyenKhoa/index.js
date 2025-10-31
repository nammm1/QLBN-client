import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";

const apiChuyenKhoa = {
  // Lấy tất cả chuyên khoa
  getAllChuyenKhoa: async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chuyen khoa:", error);
      throw error;
    }
  },

  // Lấy chi tiết chuyên khoa theo ID
  getChuyenKhoaById: async (id_chuyen_khoa) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chuyen khoa by ID:", error);
      throw error;
    }
  },

  // Tạo mới chuyên khoa
  createChuyenKhoa: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating chuyen khoa:", error);
      throw error;
    }
  },

  // Cập nhật chuyên khoa
  updateChuyenKhoa: async (id_chuyen_khoa, data) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating chuyen khoa:", error);
      throw error;
    }
  },

  // Xóa chuyên khoa
  deleteChuyenKhoa: async (id_chuyen_khoa) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error deleting chuyen khoa:", error);
      throw error;
    }
  },

  // Alias cho getAllChuyenKhoa để tương thích
  getAll: async () => {
    return apiChuyenKhoa.getAllChuyenKhoa();
  },
};

export default apiChuyenKhoa;
