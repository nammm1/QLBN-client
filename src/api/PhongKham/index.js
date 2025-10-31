import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiPhongKham = {
  // Lấy tất cả phòng khám
  getAll: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all phòng khám:", err);
      throw err;
    }
  },

  // Lấy phòng khám theo ID
  getById: async (id_phong_kham) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.PhongKham}/${id_phong_kham}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching phòng khám by id:", err);
      throw err;
    }
  },
};

export default apiPhongKham;
