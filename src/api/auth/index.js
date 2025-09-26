import axiosInstance from "../axios"
import API_CONFIG from "../../configs/api_configs";
import axios from "axios";


const apiAuth = {
    login: async (RESOURCES, payloadLogin) => {
        // dùng axios để bắn request login và nhận lại response
        const { data } = await axios.post(API_CONFIG.BASE_URL + RESOURCES+ '/login', payloadLogin)
        if (data) {
            return data
        } else {
            throw new Error('Dữ liệu trả về bị thiếu')
        }
    },
    // renewAccessToken: async (RESOURCES, payloadRenewToken) => {
    //     // dùng axios để bắn request login và nhận lại response
    //     const { data } = await axiosInstance.post(API_CONFIG.BASE_URL + RESOURCES + '/auth/refreshToken', payloadRenewToken)

    //     if (data) {
    //         return data
    //     } else {
    //         throw new Error('Dữ liệu trả về bị thiếu')
    //     }
    // }
}
export default apiAuth