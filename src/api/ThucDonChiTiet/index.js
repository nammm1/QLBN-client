import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiThucDonChiTiet = {
  // Tạo thực đơn chi tiết
  create: async (data) => {
    try {
      console.log("API ThucDonChiTiet.create - sending data:", data);
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}`,
        data
      );
      console.log("API ThucDonChiTiet.create - response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error creating thực đơn chi tiết:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

  // Lấy thực đơn chi tiết theo ID
  getById: async (id_thuc_don) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}/${id_thuc_don}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching thực đơn chi tiết by ID:", error);
      throw error;
    }
  },

  // Lấy thực đơn chi tiết theo lịch sử tư vấn
  getByLichSu: async (id_lich_su) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}/lich-su/${id_lich_su}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching thực đơn chi tiết by lịch sử:", error);
      throw error;
    }
  },

  // Lấy thực đơn chi tiết theo bữa ăn
  getByBuaAn: async (id_lich_su, bua_an) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}/lich-su/${id_lich_su}/bua-an/${bua_an}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching thực đơn chi tiết by bữa ăn:", error);
      throw error;
    }
  },

  // Cập nhật thực đơn chi tiết
  update: async (id_thuc_don, data) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}/${id_thuc_don}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating thực đơn chi tiết:", error);
      throw error;
    }
  },

  // Xóa thực đơn chi tiết
  delete: async (id_thuc_don) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}/${id_thuc_don}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting thực đơn chi tiết:", error);
      throw error;
    }
  },

  // Xóa tất cả thực đơn chi tiết theo lịch sử
  deleteByLichSu: async (id_lich_su) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ThucDonChiTiet}/lich-su/${id_lich_su}/all`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting thực đơn chi tiết by lịch sử:", error);
      throw error;
    }
  },
};

export default apiThucDonChiTiet;

