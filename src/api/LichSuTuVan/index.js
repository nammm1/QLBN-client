import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
// import axios from "axios";

const apiLichSuTuVan = {
  // Lấy tất cả lịch sử tư vấn
  getAllLichSuTuVan: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}/all/`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all lịch sử tư vấn:", error);
      throw error;
    }
  },

  // Lấy lịch sử tư vấn theo ID
  getLichSuTuVanById: async (id_lich_su) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}/${id_lich_su}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lịch sử tư vấn by ID:", error);
      throw error;
    }
  },

  // Lấy lịch sử tư vấn theo bệnh nhân
  getLichSuTuVanByBenhNhan: async (id_benh_nhan) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}/benh-nhan/${id_benh_nhan}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lịch sử tư vấn by bệnh nhân:", error);
      throw error;
    }
  },

  // Lấy lịch sử tư vấn theo cuộc hẹn
  getLichSuTuVanByCuocHen: async (id_cuoc_hen) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}/cuoc-hen/${id_cuoc_hen}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lịch sử tư vấn by cuộc hẹn:", error);
      throw error;
    }
  },

  // Tạo mới lịch sử tư vấn
  createLichSuTuVan: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating lịch sử tư vấn:", error);
      throw error;
    }
  },

  // Cập nhật lịch sử tư vấn
  updateLichSuTuVan: async (id_lich_su, data) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}/${id_lich_su}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating lịch sử tư vấn:", error);
      throw error;
    }
  },

  // Xóa lịch sử tư vấn
  deleteLichSuTuVan: async (id_lich_su) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichSuTuVan}/${id_lich_su}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error deleting lịch sử tư vấn:", error);
      throw error;
    }
  },
};

export default apiLichSuTuVan;
