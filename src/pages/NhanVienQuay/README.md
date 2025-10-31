# 👥 Module Nhân Viên Quầy (Receptionist)

## 📋 Tổng quan

Module này cung cấp giao diện quản lý cho **Nhân viên quầy** (Receptionist) trong hệ thống quản lý bệnh viện. Nhân viên quầy đóng vai trò tiếp nhận bệnh nhân, quản lý lịch hẹn, và thu ngân.

## 🎯 Tính năng chính

### 1. **Dashboard** (`/receptionist`)
- Tổng quan công việc hàng ngày
- Thống kê nhanh:
  - Số bệnh nhân tiếp nhận hôm nay
  - Số lịch hẹn
  - Số lịch hẹn chờ xác nhận
  - Doanh thu hôm nay
- Timeline hoạt động trong ngày
- Danh sách lịch hẹn sắp tới
- Thống kê công việc đã hoàn thành

### 2. **Quản lý bệnh nhân** (`/receptionist/patients`)
- **Đăng ký bệnh nhân mới**
  - Form đăng ký đầy đủ thông tin
  - Tạo tài khoản tự động
  - Validation dữ liệu
- **Tìm kiếm bệnh nhân**
  - Tìm theo tên, SĐT, CCCD
  - Filter nhanh
- **Xem & chỉnh sửa thông tin bệnh nhân**
  - Modal xem chi tiết
  - Chỉnh sửa thông tin
- **Hiển thị danh sách**
  - Table với pagination
  - Hiển thị trạng thái hoạt động

### 3. **Quản lý lịch hẹn** (`/receptionist/appointments`)
- **Đặt lịch hẹn mới**
  - Chọn bệnh nhân
  - Chọn chuyên khoa, bác sĩ
  - Chọn ngày & khung giờ khám
  - Nhập lý do khám
- **Xác nhận lịch hẹn**
  - Badge đếm lịch hẹn chờ xác nhận
  - Nút xác nhận nhanh
  - Xác nhận hoặc hủy lịch
- **Tabs phân loại**
  - Tất cả lịch hẹn
  - Chờ xác nhận
  - Đã xác nhận
  - Đã hủy
- **Tìm kiếm & filter**
  - Tìm theo tên bệnh nhân, bác sĩ
  - Lọc theo trạng thái

### 4. **Thu ngân** (`/receptionist/billing`)
- **Thống kê doanh thu**
  - Doanh thu hôm nay
  - Số hóa đơn chờ thanh toán
  - Số hóa đơn đã thanh toán hôm nay
- **Danh sách hóa đơn**
  - Hiển thị mã HĐ, ngày tạo, bệnh nhân
  - Tổng tiền, trạng thái, phương thức
  - Tìm kiếm theo mã HĐ, tên bệnh nhân
- **Thu tiền**
  - Modal thu tiền với calculator
  - Chọn phương thức: Tiền mặt / Chuyển khoản / Thẻ
  - Tính tiền thừa tự động
  - Xác nhận thanh toán
- **Chi tiết hóa đơn**
  - Xem chi tiết dịch vụ
  - Bảng tính toán đầy đủ
- **In hóa đơn**
  - Nút in hóa đơn (UI ready)

### 5. **Lịch làm việc** (`/receptionist/work-schedule`)
- **Xem lịch làm việc cá nhân**
  - Xem theo tuần
  - 2 chế độ hiển thị: Table & Grid
  - Chuyển tuần: trước/sau/hiện tại
- **Thống kê ca làm việc**
  - Số ca sáng, chiều, tối
  - Tổng số ca trong tuần
- **Xin nghỉ phép**
  - Form xin nghỉ phép
  - Chọn ngày bắt đầu - kết thúc
  - Chọn loại nghỉ: Phép năm / Ốm / Cá nhân
  - Nhập lý do
- **Lịch sử nghỉ phép**
  - Xem danh sách đơn đã gửi
  - Trạng thái: Chờ duyệt / Đã duyệt / Từ chối

### 6. **Hồ sơ cá nhân** (`/receptionist/profile`)
- **Xem thông tin cá nhân**
  - Avatar, tên, vai trò
  - Thông tin liên hệ
  - Thông tin công việc
- **Chỉnh sửa thông tin**
  - Toggle edit mode
  - Form với validation
  - Cập nhật: Tên, SĐT, Email, Địa chỉ, CCCD
- **Upload avatar** (UI ready)
- **Thông tin tài khoản**
  - Mã nhân viên
  - Trạng thái
  - Ngày tạo, cập nhật

## 🎨 Thiết kế UI

### Color Scheme
- **Primary**: `#f39c12` (Orange) - Màu chủ đạo
- **Secondary**: `#e67e22` (Dark Orange)
- **Gradient**: `linear-gradient(135deg, #f39c12 0%, #e67e22 100%)`
- **Background**: `#fafafa` (Light Gray)

### Layout
- **Sidebar**: 280px, fixed position, gradient orange
- **Main Content**: Responsive với padding 30px
- **Card Border Radius**: 12-16px
- **Box Shadow**: Soft & modern

### Components
- **Buttons**: Gradient backgrounds với hover effects
- **Cards**: Rounded corners, subtle shadows
- **Tables**: Responsive, pagination, search
- **Modals**: Clean design với icons
- **Tags**: Color-coded cho status
- **Statistics**: Gradient cards với icons

## 📁 Cấu trúc thư mục

```
pages/NhanVienQuay/
├── Dashboard/
│   └── ReceptionistDashboard.jsx          # Trang tổng quan
├── PatientManagement/
│   └── PatientManagement.jsx              # Quản lý bệnh nhân
├── AppointmentManagement/
│   └── AppointmentManagement.jsx          # Quản lý lịch hẹn
├── Billing/
│   └── Billing.jsx                        # Thu ngân
├── WorkSchedule/
│   └── ReceptionistWorkSchedule.jsx       # Lịch làm việc
├── Profile/
│   └── ReceptionistProfile.jsx            # Hồ sơ cá nhân
└── README.md                               # File này
```

## 🔗 Routes

```javascript
/receptionist                    → Dashboard
/receptionist/patients          → Quản lý bệnh nhân
/receptionist/appointments      → Quản lý lịch hẹn
/receptionist/billing           → Thu ngân
/receptionist/work-schedule     → Lịch làm việc
/receptionist/profile           → Hồ sơ cá nhân
```

## 🛠️ API Endpoints sử dụng

### Bệnh nhân
- `GET /benh-nhan/` - Lấy tất cả bệnh nhân
- `GET /benh-nhan/:id` - Lấy bệnh nhân theo ID
- `POST /nguoi-dung/create` - Đăng ký bệnh nhân mới
- `PUT /nguoi-dung/:id` - Cập nhật thông tin bệnh nhân

### Lịch hẹn
- `GET /cuocHenKhamBenh/` - Lấy tất cả lịch hẹn
- `POST /cuocHenKhamBenh/create` - Tạo lịch hẹn mới
- `PUT /cuocHenKhamBenh/:id` - Cập nhật lịch hẹn
- `GET /khungGioKham/` - Lấy danh sách khung giờ

### Hóa đơn
- `GET /hoaDon/` - Lấy tất cả hóa đơn
- `GET /chiTietHoaDon/hoa-don/:id` - Lấy chi tiết hóa đơn
- `PUT /hoaDon/:id` - Cập nhật trạng thái thanh toán

### Lịch làm việc
- `GET /lichLamViec/week/:weekStart/:idNguoiDung` - Lấy lịch theo tuần
- `GET /xin-nghi-phep/nhan-vien/:idNguoiDung` - Lấy lịch sử nghỉ phép
- `POST /xin-nghi-phep/create` - Tạo đơn nghỉ phép

### Nhân viên quầy
- `GET /nhan-vien-quay/` - Lấy tất cả nhân viên quầy
- `GET /nhan-vien-quay/:id` - Lấy thông tin nhân viên theo ID
- `PUT /nhan-vien-quay/:id` - Cập nhật thông tin

## 💡 Điểm đặc biệt

### 1. **User Experience**
- ✅ Form validation đầy đủ
- ✅ Loading states
- ✅ Success/Error messages
- ✅ Responsive design
- ✅ Intuitive navigation

### 2. **Data Management**
- ✅ Real-time data fetching
- ✅ Optimistic UI updates
- ✅ Error handling
- ✅ Data validation

### 3. **Visual Design**
- ✅ Modern gradient colors
- ✅ Icon-based navigation
- ✅ Consistent spacing
- ✅ Professional typography
- ✅ Smooth animations

### 4. **Accessibility**
- ✅ Clear labels
- ✅ Tooltips for actions
- ✅ Keyboard navigation support
- ✅ Color contrast compliance

## 🔄 So sánh với các module khác

| Tính năng | Bác sĩ | Nhân viên Phân công | Nhân viên Quầy |
|-----------|--------|---------------------|----------------|
| Theme Color | Blue (#27408B) | Teal (#16a085) | Orange (#f39c12) |
| Dashboard | ✅ | ✅ | ✅ |
| Lịch làm việc | ✅ | ✅ | ✅ |
| Xin nghỉ phép | ✅ | ✅ | ✅ |
| Quản lý bệnh nhân | ❌ | ❌ | ✅ |
| Quản lý lịch hẹn | ✅ (Xem) | ❌ | ✅ (Đặt & Xác nhận) |
| Thu ngân | ❌ | ❌ | ✅ |
| Hồ sơ khám bệnh | ✅ | ❌ | ❌ |
| Cuộc hẹn khám | ✅ | ❌ | ❌ |
| Tư vấn online | ✅ | ❌ | ❌ |

## 🚀 Hướng dẫn sử dụng

### 1. Khởi động ứng dụng
```bash
cd QLBN-client
npm start
```

### 2. Truy cập module
- URL: `http://localhost:3000/receptionist`
- Login với tài khoản: `nhanvienquay` / `password`

### 3. Quy trình công việc

#### Đăng ký bệnh nhân mới
1. Vào **Quản lý bệnh nhân**
2. Click "Đăng ký bệnh nhân mới"
3. Điền thông tin đầy đủ
4. Click "Đăng ký"

#### Đặt lịch hẹn
1. Vào **Lịch hẹn khám**
2. Click "Đặt lịch hẹn mới"
3. Chọn bệnh nhân, chuyên khoa, bác sĩ, ngày giờ
4. Nhập lý do khám
5. Click "Đặt lịch"

#### Xác nhận lịch hẹn
1. Vào tab "Chờ xác nhận"
2. Click nút ✓ để xác nhận
3. Hoặc click nút ✗ để hủy

#### Thu tiền
1. Vào **Thu ngân**
2. Tìm hóa đơn cần thu
3. Click nút ✓ (Xác nhận thanh toán)
4. Chọn phương thức thanh toán
5. Nhập số tiền nhận
6. Click "Xác nhận thanh toán"

#### Xin nghỉ phép
1. Vào **Lịch làm việc**
2. Click "Xin nghỉ phép"
3. Chọn ngày, loại nghỉ, nhập lý do
4. Click "Gửi đơn"

## 📝 Notes

### Dữ liệu mẫu
- Tài khoản demo: `nhanvienquay` (ID: `NV_quay001`)
- Các dữ liệu hiện tại được load từ backend
- Một số tính năng cần backend API hỗ trợ

### Tính năng sắp tới
- [ ] In hóa đơn (PDF export)
- [ ] Upload avatar thực tế
- [ ] Thống kê chi tiết
- [ ] Export báo cáo Excel
- [ ] Notification system
- [ ] Chat support

## 🐛 Troubleshooting

### Không tải được dữ liệu
- Kiểm tra backend server đã chạy chưa
- Kiểm tra API endpoint trong `api_configs.js`
- Xem console log để debug

### Lỗi khi tạo/cập nhật
- Kiểm tra validation form
- Đảm bảo tất cả field required đã điền
- Xem network tab để kiểm tra request/response

### Layout bị lỗi
- Clear cache và reload
- Kiểm tra import components
- Kiểm tra antd version

## 👨‍💻 Development

### Thêm tính năng mới
1. Tạo component trong folder tương ứng
2. Thêm route vào `App.jsx`
3. Thêm menu item vào `ReceptionistSidebar.jsx`
4. Implement API calls
5. Test & debug

### Customize theme
- Edit colors trong `ReceptionistLayout.jsx`
- Customize sidebar trong `ReceptionistSidebar.jsx`
- Adjust styles trong từng component

## 📞 Support

Nếu có vấn đề, liên hệ team development hoặc tạo issue trên repository.

---

**Version**: 1.0.0  
**Last Updated**: October 30, 2025  
**Author**: AI Assistant

