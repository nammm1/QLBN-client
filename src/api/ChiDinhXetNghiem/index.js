import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiChiDinhXetNghiem = {
  // ➕ Tạo mới chỉ định xét nghiệm
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiDinhXetNghiem}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating chi định xét nghiệm:", err);
      throw err;
    }
  },

  // 🔍 Lấy tất cả chỉ định xét nghiệm (cho nhân viên xét nghiệm)
  getAll: async (trang_thai = null) => {
    try {
      const url = trang_thai 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiDinhXetNghiem}/?trang_thai=${trang_thai}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiDinhXetNghiem}/`;
      const res = await axiosInstance.get(url);
      return res.data.data;
    } catch (err) {
      console.error("Error fetching all chi định xét nghiệm:", err);
      throw err;
    }
  },

  // 🔍 Lấy danh sách chỉ định theo id_ho_so
  getByCuocHen: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiDinhXetNghiem}/cuochen/${id_cuoc_hen}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching chi định xét nghiệm:", err);
      throw err;
    }
  },

  // 🔄 Cập nhật trạng thái chỉ định
  updateTrangThai: async (id_chi_dinh, trang_thai) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiDinhXetNghiem}/${id_chi_dinh}/trang-thai`,
        { trang_thai }
      );
      return res.data;
    } catch (err) {
      console.error("Error updating trạng thái chi định:", err);
      throw err;
    }
  },

  // ❌ Xóa chỉ định xét nghiệm
  delete: async (id_chi_dinh) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiDinhXetNghiem}/${id_chi_dinh}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting chi định xét nghiệm:", err);
      throw err;
    }
  },
};

export default apiChiDinhXetNghiem;
