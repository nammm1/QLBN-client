import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import styles from "./LoginRegister.module.css";
import { FaUser, FaEye, FaEyeSlash, FaPhone } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";
import { BsCalendarDateFill } from "react-icons/bs";
import { PiGenderIntersexBold } from "react-icons/pi";
import apiAuth from '../../api/auth/index';
import apiChuyenKhoa from '../../api/ChuyenKhoa/index.js';
import API_CONFIG from "../../configs/api_configs.js";
import { login } from "../../store/slice/auth"; 

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const dispatch = useDispatch();

  // Login form
  const [loginData, setLoginData] = useState({
    ten_dang_nhap: "",
    mat_khau: "",
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    ten_dang_nhap: "",
    mat_khau: "",
    ngay_sinh: "",
    gioi_tinh: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input change
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  // Submit Login
  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await apiChuyenKhoa.getAllChuyenKhoa();
    console.log(response);
    const res  = await apiAuth.login(loginData);
    console.log(res);
    const { success } = res;
    const { user, accessToken, refreshToken } = res.data;
    if (success && accessToken && refreshToken) {

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("userInfo", JSON.stringify({ user }));
      console.log(user);
      dispatch(login({
        userInfo: user,
        accessToken,
        vai_tro: user.vai_tro
      }));
      switch (user.vai_tro) {
        case "bac_si":
          alert("Chào mừng bác sĩ, đăng nhập thành công!");
          navigate("/doctor");
          break;

        case "benh_nhan":
          alert("Chào mừng bệnh nhân, đăng nhập thành công!");
          navigate("/");
          break;

        case "quan_tri":
          alert("Chào mừng quản trị viên, đăng nhập thành công!");
          navigate("/admin");
          break;

        default:
          alert("Đăng nhập thành công!");
          navigate("/");
          break;
      }
    } else {
      alert("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  } catch (err) {
    console.error("Login failed:", err);
    alert("Đăng nhập thất bại!");
  }
};

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5005/nguoi-dung/register", registerData);
      console.log("Register success:", res.data);
      alert("Đăng ký thành công!");
      setIsRegister(false); // Quay lại login
    } catch (err) {
      console.error("Register failed:", err);
      alert("Đăng ký thất bại!");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={`${styles.wrapper} ${isRegister ? styles.active : ""}`}>
        
        {/* Login Form */}
        <div className={`${styles["form-box"]} ${styles.login}`}>
          <form onSubmit={handleLoginSubmit}>
            <h1>Đăng nhập</h1>
            <div className={styles["input-box"]}>
              <input
                type="text"
                name="ten_dang_nhap"
                placeholder="Tên đăng nhập"
                value={loginData.ten_dang_nhap}
                onChange={handleLoginChange}
                required
              />
              <FaUser className={styles.icon} />
            </div>

            <div className={styles["input-box"]}>
              <input
                type={showPassword ? "text" : "password"}
                name="mat_khau"
                placeholder="Mật khẩu"
                value={loginData.mat_khau}
                onChange={handleLoginChange}
                required
              />
              {showPassword ? (
                <FaEye onClick={() => setShowPassword(false)} className={styles.icon} />
              ) : (
                <FaEyeSlash onClick={() => setShowPassword(true)} className={styles.icon} />
              )}
            </div>

            <button type="submit">Đăng nhập</button>
            <div className={styles["register-link"]}>
              <p>
                Bạn chưa có tài khoản?{" "}
                <a href="#" onClick={() => setIsRegister(true)}>
                  Đăng ký
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className={`${styles["form-box"]} ${styles.register}`}>
          <form onSubmit={handleRegisterSubmit}>
            <h1>Đăng ký</h1>

            <div className={styles["input-box"]}>
              <input
                type="text"
                name="ho_ten"
                placeholder="Họ và tên"
                value={registerData.ho_ten}
                onChange={handleRegisterChange}
                required
              />
              <FaUser className={styles.icon} />
            </div>

            <div className={styles["input-box"]}>
              <input
                type="date"
                name="ngay_sinh"
                value={registerData.ngay_sinh}
                onChange={handleRegisterChange}
                required
              />
              <BsCalendarDateFill className={styles.icon} />
            </div>

            <div className={styles["input-box"]}>
              <select
                name="gioi_tinh"
                value={registerData.gioi_tinh}
                onChange={handleRegisterChange}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
              <PiGenderIntersexBold className={styles.icon}/>
            </div>


            <div className={styles["input-box"]}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
              <IoMailSharp className={styles.icon} />
            </div>

            <div className={styles["input-box"]}>
              <input
                type="tel"
                name="so_dien_thoai"
                placeholder="Số điện thoại"
                value={registerData.so_dien_thoai}
                onChange={handleRegisterChange}
                required
              />
              <FaPhone className={styles.icon} />
            </div>

            <div className={styles["input-box"]}>
              <input
                type="text"
                name="ten_dang_nhap"
                placeholder="Tên đăng nhập"
                value={registerData.ten_dang_nhap}
                onChange={handleRegisterChange}
                required
              />
              <FaUser className={styles.icon} />
            </div>

            <div className={styles["input-box"]}>
              <input
                type="password"
                name="mat_khau"
                placeholder="Mật khẩu"
                value={registerData.mat_khau}
                onChange={handleRegisterChange}
                required
              />
              <FaEyeSlash className={styles.icon} />
            </div>

            <button type="submit">Đăng ký</button>
            <div className={styles["register-link"]}>
              <p>
                Bạn đã có tài khoản?{" "}
                <a href="#" onClick={() => setIsRegister(false)}>
                  Đăng nhập
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
