import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiHoSoDinhDuong = {
  // Tạo hồ sơ dinh dưỡng
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoSoDinhDuong}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating ho so dinh duong:", err);
      throw err;
    }
  },

  // Lấy hồ sơ dinh dưỡng theo ID
  getById: async (id_ho_so) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoSoDinhDuong}/${id_ho_so}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching ho so dinh duong by id:", err);
      throw err;
    }
  },

  // Lấy tất cả hồ sơ dinh dưỡng
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoSoDinhDuong}/all/`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching all ho so dinh duong:", err);
      throw err;
    }
  },

  // Lấy danh sách hồ sơ dinh dưỡng theo bệnh nhân
  getByBenhNhan: async (id_benh_nhan) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoSoDinhDuong}/benh-nhan/${id_benh_nhan}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching ho so dinh duong by benh nhan:", err);
      throw err;
    }
  },

  // Cập nhật hồ sơ dinh dưỡng
  update: async (id_ho_so_dinh_duong, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoSoDinhDuong}/${id_ho_so_dinh_duong}`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating ho so dinh duong:", err);
      throw err;
    }
  },

  // Xóa hồ sơ dinh dưỡng
  delete: async (id_ho_so_dinh_duong) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.HoSoDinhDuong}/${id_ho_so_dinh_duong}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting ho so dinh duong:", err);
      throw err;
    }
  },
};

export default apiHoSoDinhDuong;
