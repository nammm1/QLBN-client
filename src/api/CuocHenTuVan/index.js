import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiCuocHenTuVan = {
  // Tạo cuộc hẹn tư vấn mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating cuoc hen tu van:", err);
      throw err;
    }
  },

  // Lấy tất cả cuộc hẹn tư vấn của bệnh nhân
  getByBenhNhan: async (id_benh_nhan) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/benh-nhan/${id_benh_nhan}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen tu van by benh nhan:", err);
      throw err;
    }
  },

  // Lọc cuộc hẹn tư vấn theo trạng thái
  filterByBenhNhanAndTrangThai: async (id_benh_nhan, trang_thai) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/benh-nhan/${id_benh_nhan}/loc`,
        { trang_thai }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error filtering cuoc hen tu van:", err);
      throw err;
    }
  },

  // Cập nhật trạng thái cuộc hẹn tư vấn
  updateTrangThai: async (id_cuoc_hen, trang_thai) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/${id_cuoc_hen}/trang-thai`,
        { trang_thai }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating trang thai cuoc hen tu van:", err);
      throw err;
    }
  },

  // Xóa cuộc hẹn tư vấn
  delete: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/${id_cuoc_hen}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting cuoc hen tu van:", err);
      throw err;
    }
  },
};

export default apiCuocHenTuVan;
