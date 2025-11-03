import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiUpload = {
  // Upload ảnh người dùng
  uploadUserImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}upload/user`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error uploading user image:", err);
      throw err;
    }
  },

  // Upload ảnh chuyên khoa
  uploadChuyenKhoaImage: async (file, id_chuyen_khoa = null) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (id_chuyen_khoa) {
        formData.append("id_chuyen_khoa", id_chuyen_khoa);
      }

      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}upload/chuyenkhoa`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error uploading chuyen khoa image:", err);
      throw err;
    }
  },

  // Upload ảnh tổng quát
  uploadImage: async (file, folder = null) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (folder) {
        formData.append("folder", folder);
      }

      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}upload/general`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw err;
    }
  },
};

export default apiUpload;

