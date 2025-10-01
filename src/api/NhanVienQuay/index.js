import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiNhanVienQuay = {
  // Lấy tất cả nhân viên quầy
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienQuay}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all nhân viên quầy:", err);
      throw err;
    }
  },

  // Lấy thông tin nhân viên quầy theo ID
  getById: async (id_nhan_vien_quay) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienQuay}/${id_nhan_vien_quay}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching nhân viên quầy by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin nhân viên quầy
  update: async (id_nhan_vien_quay, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienQuay}/${id_nhan_vien_quay}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating nhân viên quầy:", err);
      throw err;
    }
  },
};

export default apiNhanVienQuay;
