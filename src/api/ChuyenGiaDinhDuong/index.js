import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiChuyenGia = {
  // Lấy tất cả chuyên gia
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all chuyên gia:", err);
      throw err;
    }
  },

  // Lấy thông tin chuyên gia theo ID
  getById: async (id_chuyen_gia) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/${id_chuyen_gia}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching chuyên gia by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin chuyên gia
  update: async (id_chuyen_gia, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/${id_chuyen_gia}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating chuyên gia:", err);
      throw err;
    }
  },
};

export default apiChuyenGia;
