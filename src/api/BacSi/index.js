import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";
const apiBacSi = {
  // Lấy tất cả bác sĩ (có thể filter theo chuyên khoa và search)
  getAll: async (params = {}) => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BacSi}/`,
        { params }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching all bác sĩ:", err);
      throw err;
    }
  },

  // Lấy bác sĩ theo ID
  getById: async (id_bac_si) => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BacSi}/${id_bac_si}`
      );
      return res.data.data;
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
      return res.data.data;
    } catch (err) {
      console.error("Error updating bác sĩ:", err);
      throw err;
    }
  },
};

export default apiBacSi;
