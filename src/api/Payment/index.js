import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiPayment = {
  // Tạo payment URL cho Momo
  createMomoPayment: async (id_hoa_don) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}api/payment/momo/${id_hoa_don}`
      );
      return res.data;
    } catch (err) {
      console.error("Error creating Momo payment:", err);
      throw err;
    }
  },

  // Tạo payment URL cho VNPay
  createVNPayPayment: async (id_hoa_don) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}api/payment/vnpay/${id_hoa_don}`
      );
      return res.data;
    } catch (err) {
      console.error("Error creating VNPay payment:", err);
      throw err;
    }
  },
};

export default apiPayment;

