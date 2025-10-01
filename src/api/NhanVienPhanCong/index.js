import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiNhanVienPhanCong = {
  // Lấy tất cả nhân viên phân công
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all nhân viên phân công:", err);
      throw err;
    }
  },

  // Lấy thông tin nhân viên phân công theo ID
  getById: async (id_nhan_vien_phan_cong) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/${id_nhan_vien_phan_cong}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching nhân viên phân công by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin nhân viên phân công
  update: async (id_nhan_vien_phan_cong, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/${id_nhan_vien_phan_cong}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating nhân viên phân công:", err);
      throw err;
    }
  },
};

export default apiNhanVienPhanCong;
