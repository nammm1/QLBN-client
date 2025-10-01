import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import About from "./pages/About/About";
import Layout from "./layouts";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/Doctors/DoctorDashboard";
import DoctorAppointments from "./pages/BacSi/Appointments/DoctorAppointments";
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
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/doctor-function" element={<DoctorFunction />} />
          <Route path="/doctor-medical-records" element={<DoctorMedicalRecords />} />
        </Route>

        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
        </Route>

        <Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
