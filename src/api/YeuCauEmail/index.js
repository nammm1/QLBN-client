import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiYeuCauEmail = {
  // Đăng ký nhận tin tức (công khai)
  create: async (data) => {
    try {
      console.log("🚀 [API] Calling create yeu cau email with data:", data);
      console.log("🚀 [API] URL:", `${API_CONFIG.BASE_URL}yeu-cau-email`);
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}yeu-cau-email`,
        data
      );
      console.log("✅ [API] Response:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ [API] Error creating yeu cau email:", err);
      console.error("❌ [API] Error response:", err.response?.data);
      throw err;
    }
  },

  // Lấy tất cả yêu cầu email (admin)
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.trang_thai) queryParams.append('trang_thai', params.trang_thai);
      if (params.loai_yeu_cau) queryParams.append('loai_yeu_cau', params.loai_yeu_cau);
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);

      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}yeu-cau-email?${queryParams.toString()}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching yeu cau email:", err);
      throw err;
    }
  },

  // Lấy yêu cầu email theo ID
  getById: async (id_yeu_cau) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}yeu-cau-email/${id_yeu_cau}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching yeu cau email by id:", err);
      throw err;
    }
  },

  // Cập nhật trạng thái
  updateTrangThai: async (id_yeu_cau, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}yeu-cau-email/${id_yeu_cau}/trang-thai`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating trang thai:", err);
      throw err;
    }
  },

  // Xóa yêu cầu email
  delete: async (id_yeu_cau) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}yeu-cau-email/${id_yeu_cau}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting yeu cau email:", err);
      throw err;
    }
  },

  // Gửi email đơn lẻ
  sendEmail: async (data) => {
    try {
      console.log("🚀 [API] Sending email with data:", data);
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}yeu-cau-email/send-email`,
        data
      );
      console.log("✅ [API] Email sent successfully:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ [API] Error sending email:", err);
      console.error("❌ [API] Error response:", err.response?.data);
      throw err;
    }
  },

  // Gửi email hàng loạt
  sendBulkEmail: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}yeu-cau-email/send-bulk-email`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error sending bulk email:", err);
      throw err;
    }
  },

  // Lấy lịch sử gửi email
  getLichSuGuiEmail: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);

      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}yeu-cau-email/lich-su?${queryParams.toString()}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching lich su gui email:", err);
      throw err;
    }
  },
};

export default apiYeuCauEmail;

