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
        </Route>

        <Route>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
        </Route>

        <Route path="/news" element={<Layout />}>
          <Route index element={<News />} />
        </Route>

        <Route path="/about" element={<Layout />}>
          <Route index element={<About />} />
        </Route>

        <Route path="/specialties" element={<Layout />}>
          <Route index element={<Specialties />} />
        </Route>

        <Route path="/doctors" element={<Layout />}>
          <Route index element={<Doctors />} />
        </Route>

        <Route path="/nutritionist" element={<Layout />}>
          <Route index element={<Nutritionist />} />
        </Route>

        <Route path="/updateprofile" element={<Layout />}>
          <Route index element={<UpdateProfile />} />
        </Route>

        <Route path="/patient-function" element={<Layout />}>
          <Route index element={<PatientFunction />} />
        </Route>

        <Route path="/medical-records" element={<Layout />}>
          <Route index element={<MedicalRecords />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
