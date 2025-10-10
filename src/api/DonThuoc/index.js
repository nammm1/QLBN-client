import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiDonThuoc = {
  // Tạo đơn thuốc mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DonThuoc}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating don thuoc:", err);
      throw err;
    }
  },

  // Lấy đơn thuốc + chi tiết theo hồ sơ khám
  getByHoSo: async (id_ho_so) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DonThuoc}/ho-so/${id_ho_so}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching don thuoc by ho so:", err);
      throw err;
    }
  },
  getByLichSu: async (id_lich_su) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DonThuoc}/lich-su/${id_lich_su}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching don thuoc by ho so:", err);
      throw err;
    }
  },

  // Xóa đơn thuốc
  delete: async (id_don_thuoc) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.DonThuoc}/${id_don_thuoc}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting don thuoc:", err);
      throw err;
    }
  },
};

export default apiDonThuoc;
