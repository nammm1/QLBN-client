import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiTheoDoiTienDo = {
  // Tạo theo dõi tiến độ
  create: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.TheoDoiTienDo}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating theo dõi tiến độ:", error);
      throw error;
    }
  },

  // Lấy theo dõi tiến độ theo ID
  getById: async (id_theo_doi) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.TheoDoiTienDo}/${id_theo_doi}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching theo dõi tiến độ by ID:", error);
      throw error;
    }
  },

  // Lấy theo dõi tiến độ theo bệnh nhân
  getByBenhNhan: async (id_benh_nhan) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.TheoDoiTienDo}/benh-nhan/${id_benh_nhan}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching theo dõi tiến độ by bệnh nhân:", error);
      throw error;
    }
  },

  // Lấy theo dõi tiến độ theo lịch sử tư vấn
  getByLichSu: async (id_lich_su) => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.TheoDoiTienDo}/lich-su/${id_lich_su}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching theo dõi tiến độ by lịch sử:", error);
      throw error;
    }
  },

  // Cập nhật theo dõi tiến độ
  update: async (id_theo_doi, data) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.TheoDoiTienDo}/${id_theo_doi}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating theo dõi tiến độ:", error);
      throw error;
    }
  },

  // Xóa theo dõi tiến độ
  delete: async (id_theo_doi) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.TheoDoiTienDo}/${id_theo_doi}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting theo dõi tiến độ:", error);
      throw error;
    }
  },
};

export default apiTheoDoiTienDo;

