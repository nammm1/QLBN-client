import axios from "axios";
import { store } from "../store/config";
import { login, logout } from "../store/slice/auth";
import authService from "../services/auth";

const axiosInstance = axios.create({
    timeout: 5000,
});

axiosInstance.interceptors.request.use(function (config) {
    // LOGIC ADD ACCESS TOKEN NẾU ACCESS TOKEN CÓ TỒN TẠI TRONG LOCAL STORAGE
    // TỨC LÀ NẾU NGƯỜI DÙNG ĐÃ LOGIN HOẶC TOKEN CHƯA HẾT HẠN

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers['Authorization'] = "Bearer " + accessToken;
    }

    return config;
});

// Add a response interceptor
axiosInstance.interceptors.response.use(function (response) {
    return response;
}, async function (error) {
    if (error.code === 401) {
        if (error.url.includes('/refreshToken')) {
            localStorage.removeItem("refreshToken")
            const { auth: { isLogin } } = store.getState();
            if (isLogin) {
                store.dispatch(logout())
            }
        } else {
            const refreshToken = localStorage.removeItem("refreshToken")
            if (refreshToken) {
                const { accessToken, userInfo } = await authService.renewAccessToken(refreshToken);
                store.dispatch(login({ accessToken, userInfo }))
            } else {
                const { auth: { isLogin } } = store.getState()
                if (isLogin) {
                    store.dispatch(logout())
                }
            }
        }
    }

    return Promise.reject(error);
});


export default axiosInstance