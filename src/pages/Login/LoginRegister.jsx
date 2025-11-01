import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "./LoginRegister.module.css";
import { FaUser, FaEye, FaEyeSlash, FaPhone } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";
import { PiGenderIntersexBold } from "react-icons/pi";
import apiAuth from '../../api/auth/index';
import { login } from "../../store/slice/auth";
import toast from "../../utils/toast";
import medicalChatService from "../../api/MedicalChat"; 

const LoginRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const handleGenderSelect = (gender) => {
    setRegisterData({ ...registerData, gioi_tinh: gender });
  };

  // Kiểm tra session expired từ query param
  useEffect(() => {
    const sessionExpired = searchParams.get('sessionExpired');
    if (sessionExpired === 'true') {
      toast.error("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
      // Xóa query param để tránh hiển thị lại thông báo khi refresh
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  // Reset forms khi chuyển đổi
  useEffect(() => {
    if (isRegister) {
      // Reset form đăng nhập khi chuyển sang đăng ký
      setLoginData({
        ten_dang_nhap: "",
        mat_khau: "",
      });
      setShowPassword(false);
    } else {
      // Reset form đăng ký khi chuyển sang đăng nhập
      setRegisterData({
        ho_ten: "",
        email: "",
        so_dien_thoai: "",
        ten_dang_nhap: "",
        mat_khau: "",
        ngay_sinh: "",
        gioi_tinh: "",
      });
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isRegister]);

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiAuth.login(loginData);
      const { success } = res;
      
      // Nếu success: false, hiển thị toast lỗi
      if (success === false) {
        const errorMessage = res.message || "Tên đăng nhập hoặc mật khẩu không đúng!";
        toast.error(errorMessage);
        return;
      }
      
      const { user, accessToken, refreshToken } = res.data;
      if (success && accessToken && refreshToken) {
        // Clear all chat data before logging in (to prevent chat from previous user)
        medicalChatService.clearAllChatData();
        
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
            toast.success("Chào mừng bác sĩ, đăng nhập thành công!");
            navigate("/doctor");
            break;

          case "benh_nhan":
            toast.success("Chào mừng bệnh nhân, đăng nhập thành công!");
            // Đánh dấu cần kiểm tra profile sau khi đăng nhập (chỉ 1 lần)
            // Với benh_nhan, id_nguoi_dung chính là id_benh_nhan
            const benhNhanId = user.id_benh_nhan || user.id_nguoi_dung;
            if (benhNhanId) {
              const checkKey = `profile_check_needed_${benhNhanId}`;
              localStorage.setItem(checkKey, "true");
              console.log("Login - Set profile check flag:", checkKey);
            } else {
              console.warn("Login - Cannot set profile check flag: no benhNhanId", user);
            }
            navigate("/");
            break;

          case "quan_tri_vien":
            toast.success("Chào mừng quản trị viên, đăng nhập thành công!");
            navigate("/admin");
            break;

          case "nhan_vien_phan_cong":
            toast.success("Chào mừng nhân viên phân công, đăng nhập thành công!");
            navigate("/staff");
            break;

          case "nhan_vien_quay":
            toast.success("Chào mừng nhân viên quầy, đăng nhập thành công!");
            navigate("/receptionist");
            break;

          case "chuyen_gia_dinh_duong":
            toast.success("Chào mừng chuyên gia dinh dưỡng, đăng nhập thành công!");
            navigate("/");
            break;

          default:
            toast.success("Đăng nhập thành công!");
            navigate("/");
            break;
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Hiển thị toast lỗi từ response hoặc message mặc định
      const errorMessage = err.response?.data?.message || err.message || "Đăng nhập thất bại!";
      toast.error(errorMessage);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate giới tính
    if (!registerData.gioi_tinh) {
      toast.error("Vui lòng chọn giới tính!");
      return;
    }
    
    try {
      const res = await axios.post("http://localhost:5005/nguoi-dung/register", registerData);
      console.log("Register success:", res.data);
      if (res.data?.success === false) {
        // Nếu success: false, hiển thị toast lỗi
        const errorMessage = res.data.message || "Đăng ký thất bại!";
        toast.error(errorMessage);
      } else {
        toast.success("Đăng ký thành công!");
        setIsRegister(false); // Quay lại login
      }
    } catch (err) {
      console.error("Register failed:", err);
      // Hiển thị toast lỗi từ response hoặc message mặc định
      const errorMessage = err.response?.data?.message || err.message || "Đăng ký thất bại!";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    // Quay lại trang trước hoặc về trang chủ nếu không có
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          border: "none",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          padding: "8px 16px",
          height: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Quay lại
      </Button>
      
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
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(true);
                }}>
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
                style={{
                  color: registerData.ngay_sinh ? '#333' : '#999',
                  cursor: 'pointer',
                  paddingRight: '20px' // Giảm padding để không bị trùng icon
                }}
                onFocus={(e) => {
                  if (typeof e.target.showPicker === 'function') {
                    try {
                      e.target.showPicker();
                    } catch (error) {
                      // Ignore error
                    }
                  }
                }}
              />
            </div>

            <div className={styles["gender-selector"]}>
              <label className={styles["gender-label"]}>Giới tính</label>
              <div className={styles["gender-buttons"]}>
                <button
                  type="button"
                  className={`${styles["gender-btn"]} ${registerData.gioi_tinh === "Nam" ? styles["gender-btn-active"] : ""}`}
                  onClick={() => handleGenderSelect("Nam")}
                >
                  <span className={styles["gender-icon"]}>♂</span>
                  <span>Nam</span>
                </button>
                <button
                  type="button"
                  className={`${styles["gender-btn"]} ${registerData.gioi_tinh === "Nữ" ? styles["gender-btn-active"] : ""}`}
                  onClick={() => handleGenderSelect("Nữ")}
                >
                  <span className={styles["gender-icon"]}>♀</span>
                  <span>Nữ</span>
                </button>
              </div>
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
                type={showRegisterPassword ? "text" : "password"}
                name="mat_khau"
                placeholder="Mật khẩu"
                value={registerData.mat_khau}
                onChange={handleRegisterChange}
                required
              />
              {showRegisterPassword ? (
                <FaEye 
                  onClick={() => setShowRegisterPassword(false)} 
                  className={styles.icon} 
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <FaEyeSlash 
                  onClick={() => setShowRegisterPassword(true)} 
                  className={styles.icon} 
                  style={{ cursor: 'pointer' }}
                />
              )}
            </div>

            <button type="submit">Đăng ký</button>
            <div className={styles["register-link"]}>
              <p>
                Bạn đã có tài khoản?{" "}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(false);
                }}>
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
