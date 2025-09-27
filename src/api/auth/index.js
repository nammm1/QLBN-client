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
    renewAccessToken: async (RESOURCES, payloadRenewToken) => {
        // dùng axios để bắn request login và nhận lại response
        const { data } = await axiosInstance.post(`${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NguoiDung}/auth/refreshToken`, payloadRenewToken)
        if (data) {
            return data
        } else {
            throw new Error('Dữ liệu trả về bị thiếu')
        }
    }
}
export default apiAuth