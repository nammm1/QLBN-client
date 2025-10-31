import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";

const apiNhanVienPhanCong = {
  // Lấy tất cả nhân viên phân công
  getAll: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all nhân viên phân công:", err);
      throw err;
    }
  },

  // Lấy thông tin nhân viên phân công theo ID
  getById: async (id_nhan_vien_phan_cong) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/${id_nhan_vien_phan_cong}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching nhân viên phân công by id:", err);
      throw err;
    }
  },

  // Cập nhật thông tin nhân viên phân công
  update: async (id_nhan_vien_phan_cong, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/${id_nhan_vien_phan_cong}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating nhân viên phân công:", err);
      throw err;
    }
  },

  // ==================== API PHÂN CÔNG LỊCH LÀM VIỆC ====================
  
  // Tạo lịch làm việc
  createLichLamViec: async (data) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/lich-lam-viec`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error creating lịch làm việc:", err);
      throw err;
    }
  },

  // Đổi ca làm việc
  swapCa: async (id_lich_lam_viec_1, id_lich_lam_viec_2) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/lich-lam-viec/swap`,
        { id_lich_lam_viec_1, id_lich_lam_viec_2 }
      );
      return res.data;
    } catch (err) {
      console.error("Error swapping ca:", err);
      throw err;
    }
  },

  // Phân công hàng loạt
  phanCongHangLoat: async (danh_sach_phan_cong) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/lich-lam-viec/phan-cong-hang-loat`,
        { danh_sach_phan_cong }
      );
      return res.data;
    } catch (err) {
      console.error("Error phan cong hang loat:", err);
      throw err;
    }
  },

  // Lấy tất cả lịch làm việc
  getAllLichLamViec: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/lich-lam-viec/all`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching all lịch làm việc:", err);
      throw err;
    }
  },

  // Cập nhật lịch làm việc
  updateLichLamViec: async (id_lich_lam_viec, data) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/lich-lam-viec/${id_lich_lam_viec}`,
        data
      );
      return res.data;
    } catch (err) {
      console.error("Error updating lịch làm việc:", err);
      throw err;
    }
  },

  // Xóa lịch làm việc
  deleteLichLamViec: async (id_lich_lam_viec) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/lich-lam-viec/${id_lich_lam_viec}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleting lịch làm việc:", err);
      throw err;
    }
  },

  // Lấy danh sách bác sĩ available (chưa phân công, chưa nghỉ phép) theo chuyên khoa
  getAvailableBacSi: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/bac-si/available`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching available bác sĩ:", err);
      throw err;
    }
  },

  // Lấy danh sách chuyên gia dinh dưỡng available theo chuyên ngành
  getAvailableChuyenGiaDinhDuong: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/chuyen-gia-dinh-duong/available`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching available chuyên gia dinh dưỡng:", err);
      throw err;
    }
  },

  // Lấy danh sách nhân viên khác available theo vai trò
  getAvailableNhanVienKhac: async (params = {}) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/nhan-vien-khac/available`,
        { params }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching available nhân viên khác:", err);
      throw err;
    }
  },

  // Lấy tất cả chuyên ngành dinh dưỡng
  getAllChuyenNganhDinhDuong: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESOURCES.NhanVienPhanCong}/chuyen-nganh-dinh-duong/all`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching chuyên ngành dinh dưỡng:", err);
      throw err;
    }
  },
};

export default apiNhanVienPhanCong;
