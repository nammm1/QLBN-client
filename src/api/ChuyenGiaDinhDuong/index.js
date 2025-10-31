import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";
const apiChuyenGiaDinhDuong = {
  // Lấy tất cả chuyên gia dinh dưỡng (có thể filter theo chuyên ngành và search)
  getAll: async (params = {}) => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/`,
        { params }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching all chuyên gia dinh dưỡng:", err);
      throw err;
    }
  },

  // Lấy chuyên gia dinh dưỡng theo ID
  getById: async (id_chuyen_gia) => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/${id_chuyen_gia}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching chuyên gia dinh dưỡng by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin chuyên gia dinh dưỡng
  update: async (id_chuyen_gia, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/${id_chuyen_gia}`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating chuyên gia dinh dưỡng:", err);
      throw err;
    }
  },
};

export default apiChuyenGiaDinhDuong;