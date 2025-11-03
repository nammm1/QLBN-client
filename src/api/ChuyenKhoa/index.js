import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";

const apiChuyenKhoa = {
  // Lấy tất cả chuyên khoa
  getAllChuyenKhoa: async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chuyen khoa:", error);
      throw error;
    }
  },

  // Lấy chi tiết chuyên khoa theo ID
  getChuyenKhoaById: async (id_chuyen_khoa) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chuyen khoa by ID:", error);
      throw error;
    }
  },

  // Tạo mới chuyên khoa (hỗ trợ upload file)
  createChuyenKhoa: async (data, file = null) => {
    try {
      let response;
      
      if (file) {
        // Nếu có file, gửi FormData
        const formData = new FormData();
        formData.append("image", file);
        formData.append("ten_chuyen_khoa", data.ten_chuyen_khoa || "");
        if (data.mo_ta) formData.append("mo_ta", data.mo_ta);
        if (data.thiet_bi) formData.append("thiet_bi", data.thiet_bi);
        if (data.thoi_gian_hoat_dong) formData.append("thoi_gian_hoat_dong", data.thoi_gian_hoat_dong);

        response = await axiosInstance.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Nếu không có file, gửi JSON như cũ
        response = await axiosInstance.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}`,
          data
        );
      }
      
      return response.data.data;
    } catch (error) {
      console.error("Error creating chuyen khoa:", error);
      throw error;
    }
  },

  // Cập nhật chuyên khoa (hỗ trợ upload file)
  updateChuyenKhoa: async (id_chuyen_khoa, data, file = null) => {
    try {
      let response;
      
      if (file) {
        // Nếu có file, gửi FormData
        const formData = new FormData();
        formData.append("image", file);
        if (data.ten_chuyen_khoa) formData.append("ten_chuyen_khoa", data.ten_chuyen_khoa);
        if (data.mo_ta !== undefined) formData.append("mo_ta", data.mo_ta);
        if (data.thiet_bi !== undefined) formData.append("thiet_bi", data.thiet_bi);
        if (data.thoi_gian_hoat_dong !== undefined) formData.append("thoi_gian_hoat_dong", data.thoi_gian_hoat_dong);

        response = await axiosInstance.put(
          `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Nếu không có file, gửi JSON như cũ
        response = await axiosInstance.put(
          `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`,
          data
        );
      }
      
      return response.data.data;
    } catch (error) {
      console.error("Error updating chuyen khoa:", error);
      throw error;
    }
  },

  // Xóa chuyên khoa
  deleteChuyenKhoa: async (id_chuyen_khoa) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.ChuyenKhoa}/${id_chuyen_khoa}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error deleting chuyen khoa:", error);
      throw error;
    }
  },

  // Alias cho getAllChuyenKhoa để tương thích
  getAll: async () => {
    return apiChuyenKhoa.getAllChuyenKhoa();
  },
};

export default apiChuyenKhoa;
