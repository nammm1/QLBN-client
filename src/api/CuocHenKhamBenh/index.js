import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiCuocHenKhamBenh = {
  // Tạo cuộc hẹn mới
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error creating cuoc hen kham:", err);
      throw err;
    }
  },
   // Lấy tất cả cuộc hẹn của bệnh nhân
  getById: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/${id_cuoc_hen}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen kham by Id:", err);
      throw err;
    }
  },

  // Lấy tất cả cuộc hẹn của bệnh nhân
  getByBenhNhan: async (id_benh_nhan) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/benh-nhan/${id_benh_nhan}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen kham by benh nhan:", err);
      throw err;
    }
  },
  //Lấy lịch sử khám bệnh của bệnh nhân 
  getLichSuByBenhNhan: async (id_benh_nhan) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/lich-su/${id_benh_nhan}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen kham by benh nhan:", err);
      throw err;
    }
  },

  getByBacSi: async (id_bac_si) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/bac-si/${id_bac_si}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen kham by benh nhan:", err);
      throw err;
    }
  },
  // Lọc cuộc hẹn theo trạng thái
  filterByBenhNhanAndTrangThai: async (id_benh_nhan, trang_thai) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/benh-nhan/${id_benh_nhan}/loc`,
        { trang_thai }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error filtering cuoc hen kham:", err);
      throw err;
    }
  },

  // Cập nhật trạng thái cuộc hẹn
  updateTrangThai: async (id_cuoc_hen, trang_thai) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/${id_cuoc_hen}/trang-thai`,
        { trang_thai }
      );
      return res.data.data;
    } catch (err) {
      console.error("Error updating trang thai cuoc hen:", err);
      throw err;
    }
  },

  // Lấy cuộc hẹn theo ngày và ca
  getByDateAndCa: async (date, ca) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/filter/date-ca?ngay=${date}&ca=${ca}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen kham by date and ca:", err);
      throw err;
    }
  },

  // Xóa cuộc hẹn
  delete: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenKhamBenh}/${id_cuoc_hen}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error deleting cuoc hen kham:", err);
      throw err;
    }
  },
};

export default apiCuocHenKhamBenh;
