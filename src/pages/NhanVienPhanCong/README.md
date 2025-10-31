# 👥 Module Nhân Viên Phân Công

## 📋 Tổng quan

Module này cung cấp giao diện quản lý cho **Nhân viên phân công** trong hệ thống quản lý bệnh nhân.

## 🎯 Tính năng chính

### 1. **Dashboard** (`/staff`)
- Tổng quan thống kê nhanh
- Hiển thị công việc cần làm hôm nay
- Thống kê nhân viên, lịch làm việc, yêu cầu nghỉ phép

### 2. **Lịch làm việc** (`/staff/work-schedule`)
- Xem lịch làm việc của mình theo tuần
- 2 chế độ xem: **Bảng** (Table) và **Lưới** (Grid)
- Xin nghỉ phép trực tiếp
- Xem lịch sử đơn nghỉ phép
- Thống kê chi tiết theo ca (Sáng, Chiều, Tối)

### 3. **Hồ sơ cá nhân** (`/staff/profile`)
- Xem và cập nhật thông tin cá nhân
- Chỉnh sửa: Họ tên, SĐT, Email, Địa chỉ

## 🎨 Thiết kế UI

### Color Scheme
- **Primary**: `#2c3e50` (Dark Slate)
- **Secondary**: `#16a085` (Teal Green)
- **Accent**: `#2ecc71` (Emerald)
- **Gradient Background**: `linear-gradient(135deg, #2c3e50 0%, #34495e 100%)`

### Layout
- **Sidebar**: 300px, fixed position
- **Main Content**: Dynamic width với margin-left 280px
- **Card Border Radius**: 12-16px
- **Box Shadow**: Soft shadows với rgba(0,0,0,0.06-0.08)

## 📁 Cấu trúc thư mục

```
pages/NhanVienPhanCong/
├── Dashboard/
│   └── StaffDashboard.jsx          # Trang tổng quan
├── WorkSchedule/
│   └── StaffWorkSchedule.jsx       # Trang lịch làm việc
├── Profile/
│   └── StaffProfile.jsx            # Trang hồ sơ cá nhân
└── README.md                        # File này
```

## 🔗 Routes

```javascript
/staff                    → StaffDashboard
/staff/work-schedule     → StaffWorkSchedule  
/staff/profile           → StaffProfile
```

## 🛠️ API Endpoints sử dụng

### Lịch làm việc
- `GET /lichLamViec/week/:weekStart/:idNguoiDung` - Lấy lịch theo tuần
- `POST /lichLamViec` - Tạo lịch mới (nếu cần)

### Xin nghỉ phép
- `GET /xin-nghi-phep/nguoi-dung/:idNguoiDung` - Lấy đơn nghỉ phép
- `POST /xin-nghi-phep` - Tạo đơn mới
- `PUT /xin-nghi-phep/:id/trang-thai` - Cập nhật trạng thái

### Nhân viên phân công
- `GET /nhan-vien-phan-cong/:id` - Lấy thông tin
- `PUT /nhan-vien-phan-cong/:id` - Cập nhật thông tin

## 🚀 Hướng dẫn sử dụng

### Đăng nhập
1. Truy cập `/login`
2. Đăng nhập với tài khoản nhân viên phân công
3. Hệ thống redirect đến `/staff`

### Xem lịch làm việc
1. Click menu "Lịch làm việc" hoặc truy cập `/staff/work-schedule`
2. Chọn tuần muốn xem (mặc định là tuần hiện tại)
3. Chuyển đổi giữa 2 chế độ xem: Bảng/Lưới
4. Click vào slot để xem chi tiết

### Xin nghỉ phép
1. Tại trang Lịch làm việc, click "Xin nghỉ phép"
2. Chọn khoảng thời gian nghỉ
3. Nhập lý do
4. Click "Gửi đơn"
5. Xem lịch sử tại "Lịch sử" button

### Cập nhật hồ sơ
1. Click menu "Hồ sơ cá nhân"
2. Click "Chỉnh sửa"
3. Cập nhật thông tin
4. Click "Lưu thay đổi"

## 📊 Components chính

### StaffSidebar
- Navigation menu với 6 mục chính
- User avatar với status badge
- Logout button
- Version info

### ScheduleSlot
- Component hiển thị slot lịch làm việc
- Support 2 modes: compact (grid) và full (table)
- Hiển thị trạng thái: Có lịch / Trống / Nghỉ phép
- Hover effects và tooltips

### Statistics Cards
- Real-time statistics
- Gradient backgrounds
- Icon prefix
- Responsive grid layout

## 🎭 Trạng thái

### Trạng thái nghỉ phép
- `cho_duyet` - Chờ duyệt (Orange, ⏳)
- `da_duyet` - Đã duyệt (Green, ✅)
- `tu_choi` - Từ chối (Red, ❌)

### Ca làm việc
- `Sang` - Sáng (07:00-12:00, Gold)
- `Chieu` - Chiều (13:00-18:00, Orange)
- `Toi` - Tối (18:00-22:00, Blue)

## 🔧 Customization

### Thay đổi màu theme
Sửa trong StaffSidebar và các component:
```javascript
background: 'linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2)'
```

### Thay đổi sidebar width
Trong `StaffLayout.jsx`:
```javascript
marginLeft: YOUR_WIDTH_px
```

Trong `StaffSidebar.jsx`:
```javascript
width={YOUR_WIDTH}
```

## 📝 Notes

- Module này được xây dựng dựa trên module BacSi (Doctor) với UI theme riêng
- Sử dụng Ant Design components
- Responsive design support
- LocalStorage để lưu userInfo
- Dayjs cho date manipulation

## 🐛 Known Issues

- Dashboard statistics hiện đang dùng mock data, cần integrate với API thực
- Menu items "Quản lý nhân sự", "Phân công lịch", "Duyệt nghỉ phép" chưa implement

## 🔜 Future Improvements

1. Thêm trang quản lý nhân sự
2. Thêm trang phân công lịch làm việc
3. Thêm trang duyệt nghỉ phép
4. Thêm notifications real-time
5. Export lịch làm việc ra PDF/Excel
6. Dark mode support

