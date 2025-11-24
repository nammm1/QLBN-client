import axiosInstance from "../axios.js"
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";


const apiAuth = {
    login: async (payloadLogin) => {
        // dùng axios để bắn request login và nhận lại response
        const { data } = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/login`, payloadLogin);
        if (data) {
            return data
        } else {
            throw new Error('Dữ liệu trả về bị thiếu')
        }
    },
    loginWithGoogle: async (code, redirectUri) => {
        // Đăng nhập với Google - gửi authorization code và redirect URI
        const { data } = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/login/google`, 
            { code, redirectUri }
        );
        if (data) {
            return data
        } else {
            throw new Error('Dữ liệu trả về bị thiếu')
        }
    },
    renewAccessToken: async (refreshToken) => {
        // dùng axios để bắn request refresh token và nhận lại response
        // Sử dụng axios thường thay vì axiosInstance để tránh interceptor loop
        const { data } = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/refresh-token`, 
            { refreshToken }
        );
        if (data) {
            return data
        } else {
            throw new Error('Dữ liệu trả về bị thiếu')
        }
    }
}
export default apiAuth