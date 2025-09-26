import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs";

const apiUser = {
    login: async (loginData) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/login`,
        loginData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
    },
    getUserById: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/register`,
        userData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (MaNguoiDung, userData) => {
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/update/${MaNguoiDung}`,
        userData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  deleteUser: async (MaNguoiDung) => {
    try {
      const response = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/delete/${MaNguoiDung}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  requestRefreshToken: async (refreshToken) => {
    try {
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/auth/refresh-token`,
        { refreshToken }
      );
      return response.data;
    } catch (error) {
      console.error("Error requesting refresh token:", error);
      throw new Error("Failed to request refresh token");
    }
  }
};

export default apiUser;
