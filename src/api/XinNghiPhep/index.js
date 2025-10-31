import axiosInstance from "../axios.js";
import API_CONFIG from "../../configs/api_configs.js";

const apiXinNghiPhep = {
    // Lấy tất cả đơn xin nghỉ phép
    getAll: async () => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/`
            );
            return data;
        } catch (error) {
            console.error("Error fetching all leave requests:", error);
            throw error;
        }
    },

    // Lấy đơn xin nghỉ phép theo ID
    getById: async (idXinNghi) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/${idXinNghi}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching leave request by ID:", error);
            throw error;
        }
    },

    // Lấy đơn xin nghỉ phép theo người dùng (bác sĩ, y tá, quản lý, admin)
    getByBacSi: async (idNguoiDung) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/nguoi-dung/${idNguoiDung}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching leave requests by user:", error);
            throw error;
        }
    },

    // Alias cho nhân viên (cùng endpoint)
    getByNhanVien: async (idNguoiDung) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/nguoi-dung/${idNguoiDung}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching leave requests by user:", error);
            throw error;
        }
    },

    // Tạo đơn xin nghỉ phép mới
    create: async (leaveData) => {
        try {
            const { data } = await axiosInstance.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/`,
                leaveData
            );
            return data;
        } catch (error) {
            console.error("Error creating leave request:", error);
            throw error;
        }
    },

    // Cập nhật trạng thái đơn xin nghỉ phép
    updateStatus: async (idXinNghi, trangThai, lyDoTuChoi = null) => {
        try {
            const payload = { trang_thai: trangThai };
            if (lyDoTuChoi) {
                payload.ly_do_tu_choi = lyDoTuChoi;
            }
            const { data } = await axiosInstance.put(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/${idXinNghi}/trang-thai`,
                payload
            );
            return data;
        } catch (error) {
            console.error("Error updating leave request status:", error);
            throw error;
        }
    },

    // Xóa đơn xin nghỉ phép
    delete: async (idXinNghi) => {
        try {
            const { data } = await axiosInstance.delete(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.XinNghiPhep}/${idXinNghi}`
            );
            return data;
        } catch (error) {
            console.error("Error deleting leave request:", error);
            throw error;
        }
    }
};

export default apiXinNghiPhep;