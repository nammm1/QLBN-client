import apiAuth from "../../api/auth";


const authService = {
    login: async (RESOURCES, loginPayload) => {
        try {
            const { accessToken, refreshToken, userInfo, role ,success } = await apiAuth.login(RESOURCES, loginPayload);
            if (accessToken && refreshToken) {
                return {
                    userInfo,
                    accessToken,
                    refreshToken,
                    role,
                    success
                }

            }
        } catch (err) {
            throw new Error(err.message)
        }
    },
    renewAccessToken: async (localRefreshToken) => {
        try {
            const response = await apiAuth.renewAccessToken(localRefreshToken);
            
            // Backend trả về: { success: true, data: { accessToken }, message: "..." }
            if (!response.success || !response.data?.accessToken) {
                throw new Error(response.message || 'Không thể làm mới token');
            }

            const { accessToken } = response.data;
            
            // Cập nhật access token mới vào localStorage
            localStorage.setItem("accessToken", accessToken);
            // Refresh token không đổi, không cần cập nhật
            
            return {
                accessToken,
                success: true
            }
        } catch (err) {
            throw new Error(err.message || 'Lỗi khi làm mới token')
        }
    }
}

export default authService