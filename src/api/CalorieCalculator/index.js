import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiCalorieCalculator = {
  // Tính calories từ danh sách món ăn
  calculate: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.CalorieCalculator}/calculate`,
        data
      );
      return res.data.data;
    } catch (err) {
      console.error("Error calculating calories:", err);
      throw err;
    }
  },
};

export default apiCalorieCalculator;

