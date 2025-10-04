import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiLichSuKham = {
  // Lấy tất cả lịch sử khám
  getAllLichSuKham: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuKham}/all/`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all lịch sử khám:", error);
      throw error;
    }
  },

  // Lấy lịch sử khám theo ID
  getLichSuKhamById: async (id_lich_su) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuKham}/${id_lich_su}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lịch sử khám by ID:", error);
      throw error;
    }
  },

  // Lấy lịch sử khám theo bệnh nhân
  getLichSuKhamByBenhNhan: async (id_benh_nhan) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuKham}/benh-nhan/${id_benh_nhan}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lịch sử khám by bệnh nhân:", error);
      throw error;
    }
  },

  // Tạo mới lịch sử khám
  createLichSuKham: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuKham}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating lịch sử khám:", error);
      throw error;
    }
  },

  // Cập nhật lịch sử khám
  updateLichSuKham: async (id_lich_su, data) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuKham}/${id_lich_su}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating lịch sử khám:", error);
      throw error;
    }
  },

  // Xóa lịch sử khám
  deleteLichSuKham: async (id_lich_su) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuKham}/${id_lich_su}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error deleting lịch sử khám:", error);
      throw error;
    }
  },
};

export default apiLichSuKham;
