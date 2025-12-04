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
  initDepositPayment: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/${id_cuoc_hen}/deposit-payment`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error initializing consultation deposit payment:", err);
      throw err;
    }
  },

  // Lấy cuộc hẹn tư vấn theo ID
  getById: async (id_cuoc_hen) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/${id_cuoc_hen}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen tu van by Id:", err);
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

  // Lấy tất cả cuộc hẹn tư vấn của chuyên gia dinh dưỡng
  getByChuyenGia: async (id_chuyen_gia) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/chuyen-gia/${id_chuyen_gia}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen tu van by chuyen gia:", err);
      throw err;
    }
  },

  // Lấy cuộc hẹn theo ngày và ca
  getByDateAndCa: async (date, ca) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/filter/date-ca?ngay=${date}&ca=${ca}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error fetching cuoc hen tu van by date and ca:", err);
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
      // Trả về toàn bộ response để có thể truy cập refundInfo
      return { ...res.data.data, refundInfo: res.data.refundInfo };
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

  // Đếm số lượng appointments đã đặt cho một khung giờ (tư vấn)
  countByTimeSlot: async (id_chuyen_gia, id_khung_gio, ngay_kham) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/count/time-slot?id_chuyen_gia=${id_chuyen_gia}&id_khung_gio=${id_khung_gio}&ngay_kham=${ngay_kham}`
      );
      return res.data.data;
    } catch (err) {
      console.error("Error counting appointments by time slot:", err);
      throw err;
    }
  },

  // Lấy tất cả cuộc hẹn tư vấn
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/`
      );
      return res.data.data || [];
    } catch (err) {
      console.error("Error fetching all cuoc hen tu van:", err);
      throw err;
    }
  },

  // Cập nhật cuộc hẹn tư vấn (alias cho updateTrangThai để tương thích)
  update: async (id_cuoc_hen, data) => {
    try {
      if (data.trang_thai) {
        const res = await axiosInstance.put(
          `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CuocHenTuVan}/${id_cuoc_hen}/trang-thai`,
          { trang_thai: data.trang_thai }
        );
        // Trả về toàn bộ response để có thể truy cập refundInfo
        return { ...res.data.data, refundInfo: res.data.refundInfo };
      }
      // Nếu có các trường khác, có thể mở rộng sau
      throw new Error("Chỉ hỗ trợ cập nhật trạng thái");
    } catch (err) {
      console.error("Error updating cuoc hen tu van:", err);
      throw err;
    }
  },
};

export default apiCuocHenTuVan;
