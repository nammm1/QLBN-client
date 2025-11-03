import axios from "axios";
import { store } from "../store/config";
import { login, logout } from "../store/slice/auth";
import authService from "../services/auth";
import { showToastError } from "../utils/toast";
import medicalChatService from "./MedicalChat";

// Biến để tránh refresh token nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

const axiosInstance = axios.create({
    timeout: 30000, // 30 giây - tăng timeout để xử lý các request gửi email có thể mất thời gian
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
    // Kiểm tra nếu response có success: false thì xử lý như lỗi
    if (response.data && response.data.success === false && response.data.message) {
        showToastError(response.data.message);
        return Promise.reject(new Error(response.data.message));
    }
    return response;
}, async function (error) {
    const originalRequest = error.config;
    
    // Xử lý lỗi từ response
    if (error.response) {
        const { data, status } = error.response;
        
        // Xử lý lỗi 401 (Unauthorized)
        if (status === 401) {
            const url = originalRequest?.url || '';
            
            // Nếu đây là request refresh token bị lỗi 401, nghĩa là refresh token đã hết hạn
            if (url.includes('/refresh-token') || url.includes('/refreshToken')) {
                // Clear all chat data before logging out
                medicalChatService.clearAllChatData();
                
                // Xóa tokens và logout
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("isLogin");
                localStorage.removeItem("userInfo");
                
                const { auth: { isLogin } } = store.getState();
                if (isLogin) {
                    store.dispatch(logout());
                }
                
                // Redirect đến trang login với thông báo hết phiên
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?sessionExpired=true';
                }
                
                return Promise.reject(error);
            }
            
            // Nếu không phải request refresh token, thử refresh token
            const refreshToken = localStorage.getItem("refreshToken");
            
            if (!refreshToken) {
                // Clear all chat data before logging out
                medicalChatService.clearAllChatData();
                
                // Không có refresh token, logout và redirect
                localStorage.removeItem("accessToken");
                localStorage.removeItem("isLogin");
                localStorage.removeItem("userInfo");
                
                const { auth: { isLogin } } = store.getState();
                if (isLogin) {
                    store.dispatch(logout());
                }
                
                // Redirect đến trang login với thông báo hết phiên
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?sessionExpired=true';
                }
                
                return Promise.reject(error);
            }
            
            // Nếu đang refresh token rồi, thêm request vào queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axiosInstance(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }
            
            // Bắt đầu refresh token
            isRefreshing = true;
            
            try {
                const result = await authService.renewAccessToken(refreshToken);
                
                if (result && result.accessToken) {
                    // Cập nhật access token mới
                    localStorage.setItem("accessToken", result.accessToken);
                    
                    // Cập nhật store nếu cần - lấy userInfo từ localStorage
                    const { auth: { isLogin } } = store.getState();
                    const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                    
                    if (isLogin && savedUserInfo?.user) {
                        store.dispatch(login({ 
                            accessToken: result.accessToken, 
                            userInfo: savedUserInfo.user,
                            vai_tro: savedUserInfo.user.vai_tro
                        }));
                    }
                    
                    // Cập nhật header cho request gốc và retry
                    originalRequest.headers['Authorization'] = 'Bearer ' + result.accessToken;
                    
                    // Xử lý queue
                    processQueue(null, result.accessToken);
                    isRefreshing = false;
                    
                    // Retry request gốc
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error('Không thể làm mới token');
                }
            } catch (refreshError) {
                // Clear all chat data before logging out
                medicalChatService.clearAllChatData();
                
                // Refresh token thất bại, logout và redirect
                processQueue(refreshError, null);
                isRefreshing = false;
                
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("isLogin");
                localStorage.removeItem("userInfo");
                
                const { auth: { isLogin } } = store.getState();
                if (isLogin) {
                    store.dispatch(logout());
                }
                
                // Redirect đến trang login với thông báo hết phiên
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?sessionExpired=true';
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        // Hiển thị toast với message từ response nếu có (nhưng không phải 401)
        if (status !== 401) {
            if (data && data.success === false && data.message) {
                showToastError(data.message);
            } else if (data && data.message) {
                // Nếu không có success field nhưng có message, vẫn hiển thị
                showToastError(data.message);
            } else {
                // Hiển thị message mặc định nếu không có message
                showToastError(`Lỗi ${status}: ${error.message || 'Có lỗi xảy ra'}`);
            }
        }
    } else if (error.request) {
        // Không có response từ server (network error)
        showToastError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else {
        // Lỗi khi setup request
        showToastError(error.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    }

    return Promise.reject(error);
});


export default axiosInstance