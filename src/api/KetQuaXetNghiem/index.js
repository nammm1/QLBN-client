import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiKetQuaXetNghiem = {
  // ➕ Tạo mới kết quả xét nghiệm (gắn với 1 chỉ định)
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KetQuaXetNghiem}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating kết quả xét nghiệm:", err);
      throw err;
    }
  },

  // 🔍 Lấy kết quả theo id_chi_dinh
  getByChiDinh: async (id_chi_dinh) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KetQuaXetNghiem}/${id_chi_dinh}`
      );
      // API trả về { success: true, data: null } nếu chưa có kết quả
      // Trả về null để FE dễ xử lý
      if (res.data && res.data.success && res.data.data === null) {
        return null;
      }
      return res.data;
    } catch (err) {
      console.error("Error fetching kết quả xét nghiệm:", err);
      throw err;
    }
  },

  // 🔄 Cập nhật kết quả xét nghiệm theo id_chi_dinh
  update: async (id_chi_dinh, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KetQuaXetNghiem}/${id_chi_dinh}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating kết quả xét nghiệm:", err);
      throw err;
    }
  },

  // ❌ Xóa kết quả xét nghiệm
  delete: async (id_chi_dinh) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.KetQuaXetNghiem}/${id_chi_dinh}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting kết quả xét nghiệm:", err);
      throw err;
    }
  },
};

export default apiKetQuaXetNghiem;
