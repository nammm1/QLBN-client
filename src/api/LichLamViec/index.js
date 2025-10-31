import axiosInstance from "../axios.js";
import API_CONFIG from "../../configs/api_configs.js";

const apiLichLamViec = {
    // Lấy lịch làm việc theo tuần cho bác sĩ
    getByWeek: async (weekStart, idBacSi) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/week/${idBacSi}?ngay=${weekStart}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching schedule by week:", error);
            throw error;
        }
    },

    // Lấy tất cả lịch làm việc
    getAll: async () => {
        try {
            const res = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/`
            );
            return res.data.data;
        } catch (error) {
            console.error("Error fetching all schedules:", error);
            throw error;
        }
    },

    // Lấy lịch làm việc theo ID
    getById: async (idLichLamViec) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/${idLichLamViec}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching schedule by ID:", error);
            throw error;
        }
    },

    // Tạo lịch làm việc mới
    create: async (scheduleData) => {
        try {
            const { data } = await axiosInstance.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/`,
                scheduleData
            );
            return data;
        } catch (error) {
            console.error("Error creating schedule:", error);
            throw error;
        }
    },

    // Cập nhật lịch làm việc
    update: async (idLichLamViec, updateData) => {
        try {
            const { data } = await axiosInstance.put(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/${idLichLamViec}`,
                updateData
            );
            return data;
        } catch (error) {
            console.error("Error updating schedule:", error);
            throw error;
        }
    },

    // Xóa lịch làm việc
    delete: async (idLichLamViec) => {
        try {
            const { data } = await axiosInstance.delete(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/${idLichLamViec}`
            );
            return data;
        } catch (error) {
            console.error("Error deleting schedule:", error);
            throw error;
        }
    },

    // Lấy lịch làm việc theo ngày
    getByDate: async (date) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/ngay?date=${date}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching schedule by date:", error);
            throw error;
        }
    },

    // Lấy lịch làm việc theo tháng
    getByMonth: async (month, year) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/month?month=${month}&year=${year}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching schedule by month:", error);
            throw error;
        }
    },

    // Lấy lịch làm việc theo năm
    getByYear: async (year) => {
        try {
            const { data } = await axiosInstance.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.LichLamViec}/filter/year?year=${year}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching schedule by year:", error);
            throw error;
        }
    }
};

export default apiLichLamViec;