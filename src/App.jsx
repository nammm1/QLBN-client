import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { App as AntdApp } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import About from "./pages/User/About/About";
import Layout from "./layouts";
import DoctorLayout from "./layouts/DoctorLayout";
import StaffLayout from "./layouts/StaffLayout";
import ReceptionistLayout from "./layouts/ReceptionistLayout";
import NutritionistLayout from "./layouts/NutritionistLayout";
import LabStaffLayout from "./layouts/LabStaffLayout";
import DoctorDashboard from "./pages/Doctors/DoctorDashboard";
import DoctorProfile from "./pages/BacSi/Profile/DoctorProfile";
import DoctorAppointments from "./pages/BacSi/Appointments/DoctorAppointments";
import DoctorAppointmentDetail from "./pages/BacSi/Appointments/AppointmentDetail";
import WorkSchedule from "./pages/BacSi/WorkSchedule/WorkSchedule";
import DoctorRecords from "./pages/BacSi/DoctorRecords/DoctorRecords";
import DoctorRecordDetail from "./pages/BacSi/DoctorRecords/DoctorRecordDetail";
import StaffDashboard from "./pages/NhanVienPhanCong/Dashboard/StaffDashboard";
import StaffWorkSchedule from "./pages/NhanVienPhanCong/WorkSchedule/StaffWorkSchedule";
import StaffProfile from "./pages/NhanVienPhanCong/Profile/StaffProfile";
import ManageSchedule from "./pages/NhanVienPhanCong/ManageSchedule/ManageSchedule";
import LeaveRequests from "./pages/NhanVienPhanCong/LeaveRequests/LeaveRequests";
import ReceptionistDashboard from "./pages/NhanVienQuay/Dashboard/ReceptionistDashboard";
import PatientManagement from "./pages/NhanVienQuay/PatientManagement/PatientManagement";
import AppointmentManagement from "./pages/NhanVienQuay/AppointmentManagement/AppointmentManagement";
import ConsultationAppointmentManagement from "./pages/NhanVienQuay/ConsultationAppointmentManagement/ConsultationAppointmentManagement";
import Billing from "./pages/NhanVienQuay/Billing/Billing";
import ReceptionistWorkSchedule from "./pages/NhanVienQuay/WorkSchedule/ReceptionistWorkSchedule";
import ReceptionistProfile from "./pages/NhanVienQuay/Profile/ReceptionistProfile";
import LabStaffDashboard from "./pages/NhanVienXetNghiem/Dashboard/LabStaffDashboard";
import TestOrders from "./pages/NhanVienXetNghiem/TestOrders/TestOrders";
import LabStaffProfile from "./pages/NhanVienXetNghiem/Profile/LabStaffProfile";
import LabStaffWorkSchedule from "./pages/NhanVienXetNghiem/WorkSchedule/LabStaffWorkSchedule";
import Login from "./pages/Login/LoginRegister";
import Specialties from "./pages/Specialties/Specialties";
import PublicServices from "./pages/Services/Services";
import Doctors from "./pages/Doctors/Doctors";
import Nutritionist from "./pages/Nutritionist/Nutritionist";
import UpdateProfile from "./pages/User/UpdateProfile/UpdateProfile";
import PatientFunction from "./pages/User/PatientFunction/PatientFunction";
import MedicalRecords from "./pages/User/MedicalRecords/MedicalRecords";
import Appointments from "./pages/User/Appointments/Appointments";
import DoctorFunction from "./pages/DoctorFunction/DoctorFunction";
import DoctorMedicalRecords from "./pages/DoctorMedicalRecords/DoctorMedicalRecords";
import NutritionRecords from "./pages/User/NutritionRecords/NutritionRecords";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSpecialties from "./pages/Admin/Specialties/AdminSpecialties";
import AdminAccounts from "./pages/Admin/Accounts/AdminAccounts";
import AdminAccountDetail from "./pages/Admin/Accounts/AdminAccountDetail";
import AdminMedicines from "./pages/Admin/Medicines/AdminMedicines";
import AdminServices from "./pages/Admin/Services/AdminServices";
import AdminReports from "./pages/Admin/Reports/AdminReports";
import AdminEmails from "./pages/Admin/Emails/AdminEmails";
import AdminPhongKham from "./pages/Admin/PhongKham/AdminPhongKham";
import AdminChuyenNganhDinhDuong from "./pages/Admin/ChuyenNganhDinhDuong/AdminChuyenNganhDinhDuong";
import AdminHoaDon from "./pages/Admin/HoaDon/AdminHoaDon";
import Chat from "./pages/Chat/Chat";
import PatientChat from "./pages/User/PatientChat/PatientChat";
import PatientNotifications from "./pages/User/PatientNotifications/PatientNotifications";
import Invoices from "./pages/User/Invoices/Invoices";
import NutritionistDashboard from "./pages/ChuyenGiaDinhDuong/Dashboard/NutritionistDashboard";
import NutritionistAppointments from "./pages/ChuyenGiaDinhDuong/Appointments/NutritionistAppointments";
import NutritionistAppointmentDetail from "./pages/ChuyenGiaDinhDuong/Appointments/AppointmentDetail";
import NutritionistRecords from "./pages/ChuyenGiaDinhDuong/Records/NutritionistRecords";
import NutritionistRecordDetail from "./pages/ChuyenGiaDinhDuong/Records/NutritionistRecordDetail";
import NutritionistWorkSchedule from "./pages/ChuyenGiaDinhDuong/WorkSchedule/NutritionistWorkSchedule";
import NutritionistProfile from "./pages/ChuyenGiaDinhDuong/Profile/NutritionistProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse";
import FAQ from "./pages/FAQ/FAQ";
import SearchResults from "./pages/SearchResults/SearchResults";
import MomoCallback from "./pages/Payment/MomoCallback";
import VNPayCallback from "./pages/Payment/VNPayCallback";
// import Register from "./Pages/Register/Register";

function App() {
  // Google Client ID - bạn cần thay bằng Client ID thực tế từ Google Cloud Console
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  
  // Kiểm tra và cảnh báo nếu chưa cấu hình Google Client ID
  const isGoogleOAuthConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id-here';
  
  if (!isGoogleOAuthConfigured) {
    console.warn(
      '⚠️ Google OAuth chưa được cấu hình!\n' +
      'Vui lòng tạo file .env trong thư mục QLBN-client và thêm:\n' +
      'VITE_GOOGLE_CLIENT_ID=your-google-client-id-here\n\n' +
      'Xem hướng dẫn chi tiết tại: HUONG_DAN_CAU_HINH_GOOGLE_OAUTH.md'
    );
  }
  
  // Sử dụng client_id thực hoặc dummy để tránh lỗi khi useGoogleLogin được gọi
  // GoogleOAuthProvider cần một client_id hợp lệ, nhưng sẽ không hoạt động nếu là dummy
  const effectiveClientId = isGoogleOAuthConfigured ? GOOGLE_CLIENT_ID : 'dummy-client-id';
  
  return (
    <GoogleOAuthProvider clientId={effectiveClientId}>
      <AntdApp>
        <Router>
        <Routes>
        <Route path="/" element={<Layout />}>
          {/* Trang mặc định */}
          <Route index element={<Home />} />
          {/* Hoặc có thể dùng: <Route path="/" element={<Home />} /> */}
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/services" element={<PublicServices />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/nutritionists" element={<Nutritionist />} />
          <Route path="/updateprofile" element={<UpdateProfile />} />
          <Route path="/patient-function" element={<PatientFunction />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/nutrition-records" element={<NutritionRecords />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/invoices" element={<Invoices />} />
          {/* Sử dụng component Chat có tích hợp video call cho trang /chat của bệnh nhân */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<PatientNotifications />} />
          <Route path="/doctor-function" element={<DoctorFunction />} />
          <Route path="/doctor-medical-records" element={<DoctorMedicalRecords />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/search" element={<SearchResults />} />
          {/* Payment Callback Routes */}
          <Route path="/payment/callback/momo" element={<MomoCallback />} />
          <Route path="/payment/callback/vnpay" element={<VNPayCallback />} />
        </Route>

        {/* Trang chat tối giản dùng cho bong bóng chat (không bọc trong layout role) */}
        <Route path="/embedded-chat" element={<Chat embedded />} />

        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="appointment/:id_cuoc_hen" element={<DoctorAppointmentDetail />} />
          <Route path="work-schedule" element={<WorkSchedule />} />
          <Route path="records" element={<DoctorRecords />} />
          <Route path="record/:id_ho_so" element={<DoctorRecordDetail />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="accounts/:id_nguoi_dung" element={<AdminAccountDetail />} />
          <Route path="medicines" element={<AdminMedicines />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="specialties" element={<AdminSpecialties />} />
          <Route path="phong-kham" element={<AdminPhongKham />} />
          <Route path="chuyen-nganh-dinh-duong" element={<AdminChuyenNganhDinhDuong />} />
          <Route path="emails" element={<AdminEmails />} />
          <Route path="hoa-don" element={<AdminHoaDon />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="work-schedule" element={<StaffWorkSchedule />} />
          <Route path="schedule-assignment" element={<ManageSchedule />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<ReceptionistDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="consultation-appointments" element={<ConsultationAppointmentManagement />} />
          <Route path="billing" element={<Billing />} />
          <Route path="work-schedule" element={<ReceptionistWorkSchedule />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<ReceptionistProfile />} />
        </Route>

        <Route path="/nutritionist" element={<NutritionistLayout />}>
          <Route index element={<NutritionistDashboard />} />
          <Route path="appointments" element={<NutritionistAppointments />} />
          <Route path="appointment/:id_cuoc_hen" element={<NutritionistAppointmentDetail />} />
          <Route path="records" element={<NutritionistRecords />} />
          <Route path="record/:id_ho_so" element={<NutritionistRecordDetail />} />
          <Route path="work-schedule" element={<NutritionistWorkSchedule />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<NutritionistProfile />} />
        </Route>

        <Route path="/lab-staff" element={<LabStaffLayout />}>
          <Route index element={<LabStaffDashboard />} />
          <Route path="test-orders" element={<TestOrders />} />
          <Route path="work-schedule" element={<LabStaffWorkSchedule />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<LabStaffProfile />} />
        </Route>

        <Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
      </Router>
    </AntdApp>
    </GoogleOAuthProvider>
  );
}

export default App;
