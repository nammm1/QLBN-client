import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const DashboardAPI = {
  // Dashboard bác sĩ
  getDoctorDashboard: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}dashboard/doctor`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching doctor dashboard:", err);
      throw err;
    }
  },

  // Dashboard nhân viên quầy
  getReceptionistDashboard: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}dashboard/receptionist`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching receptionist dashboard:", err);
      throw err;
    }
  },

  // Dashboard nhân viên phân công
  getStaffDashboard: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}dashboard/staff`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching staff dashboard:", err);
      throw err;
    }
  },

  // Dashboard admin
  getAdminDashboard: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}dashboard/admin`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching admin dashboard:", err);
      throw err;
    }
  },

  // Dashboard chuyên gia dinh dưỡng
  getNutritionistDashboard: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}dashboard/nutritionist`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching nutritionist dashboard:", err);
      throw err;
    }
  },
};

export default DashboardAPI;

