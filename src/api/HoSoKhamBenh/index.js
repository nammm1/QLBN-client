import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const RESOURCE = API_CONFIG.RESOURCES.HoSoKhamBenh;

const apiHoSoKhamBenh = {
  // Tạo hồ sơ khám
  create: async (data) => {
    try {
      const res = await axiosInstance.post(`/${RESOURCE}`, data);
      return res.data?.data;
    } catch (err) {
      console.error("Error creating hồ sơ khám bệnh:", err);
      throw err;
    }
  },

  // Lấy hồ sơ theo ID
  getById: async (id_ho_so) => {
    try {
      const res = await axiosInstance.get(`/${RESOURCE}/${id_ho_so}`);
      return res.data?.data;
    } catch (err) {
      console.error("Error fetching hồ sơ khám bệnh by ID:", err);
      throw err;
    }
  },

  // Lấy danh sách hồ sơ theo bệnh nhân
  getByBenhNhan: async (id_benh_nhan) => {
    try {
      const res = await axiosInstance.get(`/${RESOURCE}/benh-nhan/${id_benh_nhan}`);
      return res.data?.data;
    } catch (err) {
      console.error("Error fetching hồ sơ khám bệnh by bệnh nhân:", err);
      throw err;
    }
  },

  // Cập nhật hồ sơ
  update: async (id_ho_so, data) => {
    try {
      const res = await axiosInstance.put(`/${RESOURCE}/${id_ho_so}`, data);
      return res.data?.data;
    } catch (err) {
      console.error("Error updating hồ sơ khám bệnh:", err);
      throw err;
    }
  },

  // Xóa hồ sơ
  delete: async (id_ho_so) => {
    try {
      const res = await axiosInstance.delete(`/${RESOURCE}/${id_ho_so}`);
      return res.data?.data;
    } catch (err) {
      console.error("Error deleting hồ sơ khám bệnh:", err);
      throw err;
    }
  },
};

export default apiHoSoKhamBenh;
