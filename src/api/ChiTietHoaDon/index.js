import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiChiTietHoaDon = {
  // Thêm chi tiết hóa đơn
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietHoaDon}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating chi tiết hóa đơn:", err);
      throw err;
    }
  },

  // Lấy chi tiết hóa đơn theo id_hoa_don
  getByHoaDon: async (id_hoa_don) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietHoaDon}/hoa-don/${id_hoa_don}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching chi tiết hóa đơn:", err);
      throw err;
    }
  },

  // Xóa chi tiết hóa đơn
  delete: async (id_chi_tiet) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietHoaDon}/${id_chi_tiet}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting chi tiết hóa đơn:", err);
      throw err;
    }
  },
};

export default apiChiTietHoaDon;
