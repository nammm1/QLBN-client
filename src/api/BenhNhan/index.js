import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiBenhNhan = {
  // Lấy tất cả bệnh nhân
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BenhNhan}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all bệnh nhân:", err);
      throw err;
    }
  },

  // Lấy bệnh nhân theo ID
  getById: async (id_benh_nhan) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BenhNhan}/${id_benh_nhan}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching bệnh nhân by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin bệnh nhân
  update: async (id_benh_nhan, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.BenhNhan}/${id_benh_nhan}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating bệnh nhân:", err);
      throw err;
    }
  },
};

export default apiBenhNhan;
