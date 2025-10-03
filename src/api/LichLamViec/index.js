import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiLichLamViec = {
  // Tạo lịch làm việc mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating lich lam viec:", err);
      throw err;
    }
  },

  // Lấy tất cả lịch làm việc
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching lich lam viec list:", err);
      throw err;
    }
  },

  // Lấy chi tiết lịch làm việc theo ID
  getById: async (id_lich_lam_viec) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/${id_lich_lam_viec}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching lich lam viec by id:", err);
      throw err;
    }
  },

  // Cập nhật lịch làm việc
  update: async (id_lich_lam_viec, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/${id_lich_lam_viec}`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating lich lam viec:", err);
      throw err;
    }
  },

  // Xóa lịch làm việc
  delete: async (id_lich_lam_viec) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/${id_lich_lam_viec}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting lich lam viec:", err);
      throw err;
    }
  },

  // Lọc theo ngày
  getByNgay: async (ngay) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/ngay`,
        { params: { ngay } }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching lich lam viec by ngay:", err);
      throw err;
    }
  },

  // Lọc theo tuần
  getByWeek: async (ngay,id) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/week/${id}`,{
         params: { ngay }});
      return res.data.data;
    } catch (err) {
      console.error("Error fetching lich lam viec by week:", err);
      throw err;
    }
  },

  // Lọc theo tháng
  getByMonth: async (thang, nam) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/month`,
        { params: { thang, nam } }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching lich lam viec by month:", err);
      throw err;
    }
  },

  // Lọc theo năm
  getByYear: async (nam) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/year`,
        { params: { nam } }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching lich lam viec by year:", err);
      throw err;
    }
  },
};

export default apiLichLamViec;
