import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { App as AntdApp } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import About from "./pages/About/About";
import Layout from "./layouts";
import DoctorLayout from "./layouts/DoctorLayout";
import StaffLayout from "./layouts/StaffLayout";
import ReceptionistLayout from "./layouts/ReceptionistLayout";
import NutritionistLayout from "./layouts/NutritionistLayout";
import DoctorDashboard from "./pages/Doctors/DoctorDashboard";
import DoctorProfile from "./pages/BacSi/Profile/DoctorProfile";
import DoctorAppointments from "./pages/BacSi/Appointments/DoctorAppointments";
import DoctorAppointmentDetail from "./pages/BacSi/Appointments/AppointmentDetail";
import WorkSchedule from "./pages/BacSi/WorkSchedule/WorkSchedule";
import DoctorRecords from "./pages/BacSi/DoctorRecords/DoctorRecords";
import DoctorRecordDetail from "./pages/BacSi/DoctorRecords/DoctorRecordDetail";
import Report from "./pages/BacSi/Report/DoctorReports";
import StaffDashboard from "./pages/NhanVienPhanCong/Dashboard/StaffDashboard";
import StaffWorkSchedule from "./pages/NhanVienPhanCong/WorkSchedule/StaffWorkSchedule";
import StaffProfile from "./pages/NhanVienPhanCong/Profile/StaffProfile";
import ManageSchedule from "./pages/NhanVienPhanCong/ManageSchedule/ManageSchedule";
import LeaveRequests from "./pages/NhanVienPhanCong/LeaveRequests/LeaveRequests";
import ReceptionistDashboard from "./pages/NhanVienQuay/Dashboard/ReceptionistDashboard";
import PatientManagement from "./pages/NhanVienQuay/PatientManagement/PatientManagement";
import AppointmentManagement from "./pages/NhanVienQuay/AppointmentManagement/AppointmentManagement";
import Billing from "./pages/NhanVienQuay/Billing/Billing";
import ReceptionistWorkSchedule from "./pages/NhanVienQuay/WorkSchedule/ReceptionistWorkSchedule";
import ReceptionistProfile from "./pages/NhanVienQuay/Profile/ReceptionistProfile";
import Login from "./pages/Login/LoginRegister";
import Specialties from "./pages/Specialties/Specialties";
import PublicServices from "./pages/Services/Services";
import Doctors from "./pages/Doctors/Doctors";
import Nutritionist from "./pages/Nutritionist/Nutritionist";
import UpdateProfile from "./pages/UpdateProfile/UpdateProfile";
import PatientFunction from "./pages/PatientFunction/PatientFunction";
import MedicalRecords from "./pages/MedicalRecords/MedicalRecords";
import Appointments from "./pages/Appointments/Appointments";
import DoctorFunction from "./pages/DoctorFunction/DoctorFunction";
import DoctorMedicalRecords from "./pages/DoctorMedicalRecords/DoctorMedicalRecords";
import NutritionRecords from "./pages/NutritionRecords/NutritionRecords";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSpecialties from "./pages/Admin/Specialties/AdminSpecialties";
import AdminAccounts from "./pages/Admin/Accounts/AdminAccounts";
import AdminAccountDetail from "./pages/Admin/Accounts/AdminAccountDetail";
import AdminMedicines from "./pages/Admin/Medicines/AdminMedicines";
import AdminServices from "./pages/Admin/Services/AdminServices";
import AdminReports from "./pages/Admin/Reports/AdminReports";
import AdminEmails from "./pages/Admin/Emails/AdminEmails";
import Chat from "./pages/Chat/Chat";
import PatientChat from "./pages/PatientChat/PatientChat";
import PatientNotifications from "./pages/PatientNotifications/PatientNotifications";
import NutritionistDashboard from "./pages/ChuyenGiaDinhDuong/Dashboard/NutritionistDashboard";
import NutritionistAppointments from "./pages/ChuyenGiaDinhDuong/Appointments/NutritionistAppointments";
import NutritionistAppointmentDetail from "./pages/ChuyenGiaDinhDuong/Appointments/AppointmentDetail";
import NutritionistRecords from "./pages/ChuyenGiaDinhDuong/Records/NutritionistRecords";
import NutritionistRecordDetail from "./pages/ChuyenGiaDinhDuong/Records/NutritionistRecordDetail";
import NutritionistWorkSchedule from "./pages/ChuyenGiaDinhDuong/WorkSchedule/NutritionistWorkSchedule";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse";
import FAQ from "./pages/FAQ/FAQ";
// import Register from "./Pages/Register/Register";

function App() {
  return (
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
          <Route path="/nutritionist" element={<Nutritionist />} />
          <Route path="/updateprofile" element={<UpdateProfile />} />
          <Route path="/patient-function" element={<PatientFunction />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/nutrition-records" element={<NutritionRecords />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/chat" element={<PatientChat />} />
          <Route path="/notifications" element={<PatientNotifications />} />
          <Route path="/doctor-function" element={<DoctorFunction />} />
          <Route path="/doctor-medical-records" element={<DoctorMedicalRecords />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>

        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="appointment/:id_cuoc_hen" element={<DoctorAppointmentDetail />} />
          <Route path="work-schedule" element={<WorkSchedule />} />
          <Route path="records" element={<DoctorRecords />} />
          <Route path="record/:id_ho_so" element={<DoctorRecordDetail />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="chat" element={<Chat />} />
          <Route path="reports" element={<Report />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="accounts/:id_nguoi_dung" element={<AdminAccountDetail />} />
          <Route path="medicines" element={<AdminMedicines />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="specialties" element={<AdminSpecialties />} />
          <Route path="emails" element={<AdminEmails />} />
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
        </Route>

        <Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
      </Router>
    </AntdApp>
  );
}

export default App;
