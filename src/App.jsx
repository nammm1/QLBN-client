import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import About from "./pages/About/About";
import Layout from "./layouts";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/Doctors/DoctorDashboard";
import DoctorProfile from "./pages/BacSi/Profile/DoctorProfile";
import DoctorAppointments from "./pages/BacSi/Appointments/DoctorAppointments";
import DoctorAppointmentDetail from "./pages/BacSi/Appointments/AppointmentDetail";
import WorkSchedule from "./pages/BacSi/WorkSchedule/WorkSchedule";
import DoctorRecords from "./pages/BacSi/DoctorRecords/DoctorRecords";
import DoctorRecordDetail from "./pages/BacSi/DoctorRecords/DoctorRecordDetail";
import DoctorConsultations from "./pages/BacSi/Consultations/DoctorConsultations";
import Report from "./pages/BacSi/Report/DoctorReports";
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
          <Route path="consultations" element={<DoctorConsultations />} />
          <Route path="reports" element={<Report />} />
        </Route>

        <Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
