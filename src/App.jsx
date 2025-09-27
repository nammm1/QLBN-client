import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import About from "./pages/About/About";
import Layout from "./layouts";
import Login from "./pages/Login/LoginRegister";
import Specialties from "./pages/Specialties/Specialties";
import Doctors from "./pages/Doctors/Doctors";
import Nutritionist from "./pages/Nutritionist/Nutritionist";
import UpdateProfile from "./pages/UpdateProfile/UpdateProfile";
import PatientFunction from "./pages/PatientFunction/PatientFunction";
import MedicalRecords from "./pages/MedicalRecords/MedicalRecords";
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
        </Route>

        <Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
