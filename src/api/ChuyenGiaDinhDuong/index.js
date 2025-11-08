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
      const res = await axiosInstance.get(
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

  // Lấy chuyên gia theo chuyên ngành dinh dưỡng
  getByChuyenNganh: async (id_chuyen_nganh) => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/chuyen-nganh/${id_chuyen_nganh}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching chuyên gia by chuyên ngành:", err);
      throw err;
    }
  },

  // Lấy tất cả chuyên ngành dinh dưỡng
  getAllChuyenNganh: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/chuyen-nganh`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching all chuyên ngành dinh dưỡng:", err);
      throw err;
    }
  },

  // Lấy chuyên ngành dinh dưỡng theo ID
  getChuyenNganhById: async (id_chuyen_nganh) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/chuyen-nganh/detail/${id_chuyen_nganh}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching chuyên ngành dinh dưỡng by id:", err);
      throw err;
    }
  },

  // Tạo chuyên ngành dinh dưỡng mới
  createChuyenNganh: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/chuyen-nganh`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating chuyên ngành dinh dưỡng:", err);
      throw err;
    }
  },

  // Cập nhật chuyên ngành dinh dưỡng
  updateChuyenNganh: async (id_chuyen_nganh, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/chuyen-nganh/${id_chuyen_nganh}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating chuyên ngành dinh dưỡng:", err);
      throw err;
    }
  },

  // Xóa chuyên ngành dinh dưỡng
  deleteChuyenNganh: async (id_chuyen_nganh) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenGiaDinhDuong}/chuyen-nganh/${id_chuyen_nganh}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting chuyên ngành dinh dưỡng:", err);
      throw err;
    }
  },
};

export default apiChuyenGiaDinhDuong;