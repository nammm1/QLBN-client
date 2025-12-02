const API_CONFIG = {
  BASE_URL: "http://localhost:5005/",
  RESOURCES: {
    // Người dùng & Tài khoản
    NguoiDung: "nguoi-dung",
    BenhNhan: "benh-nhan",
    BacSi: "bac-si",
    ChuyenGiaDinhDuong: "chuyen-gia-dinh-duong",
    NhanVienQuay: "nhan-vien-quay",
    NhanVienPhanCong: "nhan-vien-phan-cong",
    // QuanTriVien: "quan-tri-vien", // Nếu bạn mở route này thì bật luôn

    // Chuyên khoa & Lịch làm việc
    ChuyenKhoa: "chuyenKhoa",
    LichLamViec: "lichLamViec",
    KhungGioKham: "khungGioKham",
    PhongKham: "phong-kham",

    // Đặt lịch
    CuocHenKhamBenh: "cuocHenKhamBenh",
    CuocHenTuVan: "cuocHenTuVan",
    LichSuKham: "lichSuKham",
    LichSuTuVan: "lichSuTuVan",

    // Hồ sơ khám bệnh
    HoSoKhamBenh: "hoSoKhamBenh",
    HoSoDinhDuong: "hoSoDinhDuong",

    // Đơn thuốc
    DonThuoc: "donThuoc",
    ChiTietDonThuoc: "chiTietDonThuoc",
    Thuoc: "thuoc",

    // Xét nghiệm
    ChiDinhXetNghiem: "chiDinhXetNghiem",
    KetQuaXetNghiem: "ketQuaXetNghiem",

    // Hóa đơn & Dịch vụ
    HoaDon: "hoaDon",
    ChiTietHoaDon: "chiTietHoaDon",
    DichVu: "dichVu",

    // Dinh dưỡng
    ThucDonChiTiet: "thuc-don-chi-tiet",
    TheoDoiTienDo: "theo-doi-tien-do",
    MonAnThamKhao: "mon-an-tham-khao",

    // AI & Tính năng thông minh
    CalorieCalculator: "calorie-calculator",
    SymptomAnalysis: "symptom-analysis",
    NutritionAnalysis: "nutrition-analysis",

    // Khác
    Chat: "chat",
    XinNghiPhep: "xin-nghi-phep",
  },
};

export default API_CONFIG;
