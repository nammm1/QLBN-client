import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import About from "./pages/About/About";
import Layout from "./layouts";
import DoctorLayout from "./layouts/DoctorLayout";
import StaffLayout from "./layouts/StaffLayout";
import ReceptionistLayout from "./layouts/ReceptionistLayout";
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
import Accounts from "./pages/Admin/Accounts/AdminAccounts";
import Medicines from "./pages/Admin/Medicines/AdminMedicines";
import Services from "./pages/Admin/Services/AdminServices";
import AdminSpecialties from "./pages/Admin/Specialties/AdminSpecialties";
import Reports from "./pages/Admin/Reports/AdminReports";
import AdminAccounts from "./pages/Admin/Accounts/AdminAccounts";
import AdminAccountDetail from "./pages/Admin/Accounts/AdminAccountDetail";
import AdminMedicines from "./pages/Admin/Medicines/AdminMedicines";
import AdminServices from "./pages/Admin/Services/AdminServices";
import AdminReports from "./pages/Admin/Reports/AdminReports";
import Chat from "./pages/Chat/Chat";
// import Register from "./Pages/Register/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Trang mặc định */}
          <Route index element={<Home />} />
          {/* Hoặc có thể dùng: <Route path="/" element={<Home />} /> */}
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/nutritionist" element={<Nutritionist />} />
          <Route path="/updateprofile" element={<UpdateProfile />} />
          <Route path="/patient-function" element={<PatientFunction />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/nutrition-records" element={<NutritionRecords />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/doctor-function" element={<DoctorFunction />} />
          <Route path="/doctor-medical-records" element={<DoctorMedicalRecords />} />
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

        <Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
