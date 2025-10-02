import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiChiTietDonThuoc = {
  // Tạo chi tiết đơn thuốc
  create: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietDonThuoc}/`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating chi tiết đơn thuốc:", err);
      throw err;
    }
  },

  // Lấy tất cả chi tiết theo id đơn thuốc
  getByDonThuoc: async (id_don_thuoc) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietDonThuoc}/donthuoc/${id_don_thuoc}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching chi tiết đơn thuốc by id_don_thuoc:", err);
      throw err;
    }
  },

  // Lấy chi tiết theo ID
  getById: async (id_chi_tiet_don_thuoc) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietDonThuoc}/${id_chi_tiet_don_thuoc}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching chi tiết đơn thuốc by id:", err);
      throw err;
    }
  },

  // Cập nhật chi tiết đơn thuốc
  update: async (id_chi_tiet_don_thuoc, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietDonThuoc}/${id_chi_tiet_don_thuoc}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating chi tiết đơn thuốc:", err);
      throw err;
    }
  },

  // Xóa chi tiết đơn thuốc
  delete: async (id_chi_tiet_don_thuoc) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChiTietDonThuoc}/${id_chi_tiet_don_thuoc}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting chi tiết đơn thuốc:", err);
      throw err;
    }
  },
};

export default apiChiTietDonThuoc;
