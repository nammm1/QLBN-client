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
    renewAccessToken: async (RESOURCES ,localRefreshToken) => {
        // uncomment code ở dưới để gọi api backend

        const { newAccessToken, userInfo, role ,success, newRefreshToken } = await apiAuth.renewAccessToken(RESOURCES,localRefreshToken)
        if (!newAccessToken) {
            throw new Error('Data was empty')
        }
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return {
            userInfo,
            role,
            success,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }

    }
}

export default authService