import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiHoaDon = {
  // Tạo hóa đơn mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating hóa đơn:", err);
      throw err;
    }
  },

  // Lấy tất cả hóa đơn
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all hóa đơn:", err);
      throw err;
    }
  },

  // Lấy hóa đơn theo ID
  getById: async (id_hoa_don) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/${id_hoa_don}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching hóa đơn by id:", err);
      throw err;
    }
  },

  // Lấy hóa đơn theo id_cuoc_hen_kham
  getByCuocHenKham: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/kham/${id_cuoc_hen}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching hóa đơn by cuộc hẹn khám:", err);
      throw err;
    }
  },

  // Lấy hóa đơn theo id_cuoc_hen_tu_van
  getByCuocHenTuVan: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/tu-van/${id_cuoc_hen}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching hóa đơn by cuộc hẹn tư vấn:", err);
      throw err;
    }
  },

  // Cập nhật trạng thái/thanh toán hóa đơn
  updateThanhToan: async (id_hoa_don, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/${id_hoa_don}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating thanh toán hóa đơn:", err);
      throw err;
    }
  },

  // Xóa hóa đơn
  delete: async (id_hoa_don) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoaDon}/${id_hoa_don}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting hóa đơn:", err);
      throw err;
    }
  },
};

export default apiHoaDon;
