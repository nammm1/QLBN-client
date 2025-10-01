import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiBacSi = {
  // Lấy tất cả bác sĩ
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BacSi}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all bác sĩ:", err);
      throw err;
    }
  },

  // Lấy bác sĩ theo ID
  getById: async (id_bac_si) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BacSi}/${id_bac_si}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching bác sĩ by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin bác sĩ
  update: async (id_bac_si, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BacSi}/${id_bac_si}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating bác sĩ:", err);
      throw err;
    }
  },
};

export default apiBacSi;
