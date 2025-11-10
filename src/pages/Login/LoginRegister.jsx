import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "./LoginRegister.module.css";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";
import { PiGenderIntersexBold } from "react-icons/pi";
import apiAuth from '../../api/auth/index';
import apiNguoiDung from '../../api/NguoiDung';
import { login } from "../../store/slice/auth";
import toast from "../../utils/toast";
import medicalChatService from "../../api/MedicalChat";
import { checkAgeForAccountCreation } from "../../utils/checkAgeForAccountCreation"; 

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

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [fpIdentifier, setFpIdentifier] = useState(""); // email or username
  const [fpToken, setFpToken] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpStep, setFpStep] = useState(1); // 1: enter identifier, 2: enter code
  const [fpLoading, setFpLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  // Countdown cho gửi lại mã
  useEffect(() => {
    if (!showForgot) return;
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds, showForgot]);

  // Register form
  const [registerData, setRegisterData] = useState({
    ho_ten: "",
    email: "",
    ten_dang_nhap: "",
    mat_khau: "",
    ngay_sinh: "",
    gioi_tinh: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Register verification
  const [regStep, setRegStep] = useState(1); // 1: nhập thông tin, 2: nhập mã
  const [regToken, setRegToken] = useState("");
  const [regOtp, setRegOtp] = useState(["","","","","",""]);
  const [regLoading, setRegLoading] = useState(false);
  const [regResendSeconds, setRegResendSeconds] = useState(0);

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
        ten_dang_nhap: "",
        mat_khau: "",
        ngay_sinh: "",
        gioi_tinh: "",
      });
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
      setConfirmPassword("");
      setRegStep(1);
      setRegToken("");
      setRegOtp(["","","","","",""]);
      setRegResendSeconds(0);
      setRegLoading(false);
    }
  }, [isRegister]);

  // Countdown resend cho đăng ký
  useEffect(() => {
    if (!isRegister || regStep !== 2) return;
    if (regResendSeconds <= 0) return;
    const t = setInterval(() => {
      setRegResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [isRegister, regStep, regResendSeconds]);

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
            navigate("/nutritionist");
            break;

          case "nhan_vien_xet_nghiem":
            toast.success("Chào mừng nhân viên xét nghiệm, đăng nhập thành công!");
            navigate("/lab-staff");
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

  const handleForgotSubmitIdentifier = async (e) => {
    e.preventDefault();
    if (!fpIdentifier) {
      toast.error("Vui lòng nhập email hoặc tên đăng nhập");
      return;
    }
    setFpLoading(true);
    try {
      const res = await apiNguoiDung.requestResetCode(fpIdentifier);
      if (res?.success) {
        setFpToken(res.data?.token || "");
        setFpStep(2);
        toast.success("Đã gửi mã xác thực qua email!");
        setResendSeconds(60);
      } else {
        toast.error(res?.message || "Không thể gửi mã xác thực");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi gửi mã";
      toast.error(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotVerifyCode = async (e) => {
    e.preventDefault();
    const code = otpDigits.join("").trim();
    if (!code || code.length !== 6 || !fpToken) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }
    setFpLoading(true);
    try {
      const res = await apiNguoiDung.verifyResetCode(fpToken, code);
      if (res?.success) {
        toast.success("Đã gửi mật khẩu mới qua email!");
        setShowForgot(false);
        setFpIdentifier("");
        setOtpDigits(["", "", "", "", "", ""]);
        setFpToken("");
        setFpStep(1);
        setResendSeconds(0);
      } else {
        toast.error(res?.message || "Mã xác thực không đúng");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Xác thực thất bại";
      toast.error(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!fpIdentifier) {
      toast.error("Thiếu email hoặc tên đăng nhập để gửi lại mã.");
      return;
    }
    if (resendSeconds > 0) return;
    setFpLoading(true);
    try {
      const res = await apiNguoiDung.requestResetCode(fpIdentifier);
      if (res?.success) {
        setFpToken(res.data?.token || "");
        toast.success("Đã gửi lại mã xác thực!");
        setResendSeconds(60);
      } else {
        toast.error(res?.message || "Không thể gửi lại mã");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi gửi lại mã";
      toast.error(msg);
    } finally {
      setFpLoading(false);
    }
  };

  // Submit Register (Step 1: gửi mã)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate giới tính
    if (!registerData.gioi_tinh) {
      toast.error("Vui lòng chọn giới tính!");
      return;
    }
    
    // Validate mật khẩu và xác nhận mật khẩu
    if (!registerData.mat_khau) {
      toast.error("Vui lòng nhập mật khẩu!");
      return;
    }
    
    if (registerData.mat_khau.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    
    if (!confirmPassword) {
      toast.error("Vui lòng xác nhận mật khẩu!");
      return;
    }
    
    if (registerData.mat_khau !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }
    
    // Kiểm tra tuổi (phải >= 6 tuổi mới được tạo tài khoản)
    if (registerData.ngay_sinh) {
      const ageCheck = checkAgeForAccountCreation(registerData.ngay_sinh);
      if (!ageCheck.isValid) {
        console.log(`[REGISTER] Người dùng không đủ tuổi: ${ageCheck.message}`);
        toast.error(ageCheck.message);
        return;
      }
    }
    
    // Yêu cầu mã xác thực email trước khi cho đăng ký
    try {
      setRegLoading(true);
      const res = await apiNguoiDung.requestRegisterCode(registerData.email, registerData.ho_ten);
      if (res?.success) {
        setRegToken(res.data?.token || "");
        setRegStep(2);
        setRegResendSeconds(60);
        toast.success("Đã gửi mã xác thực đến email của bạn!");
      } else {
        toast.error(res?.message || "Không thể gửi mã xác thực");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi gửi mã xác thực";
      toast.error(msg);
    } finally {
      setRegLoading(false);
    }
  };

  // Verify code and create account (Step 2)
  const handleRegisterVerifyAndCreate = async (e) => {
    e.preventDefault();
    const code = regOtp.join("").trim();
    if (!regToken || code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số mã xác thực");
      return;
    }

    try {
      setRegLoading(true);
      const verifyRes = await apiNguoiDung.verifyRegisterCode(regToken, code);
      if (!verifyRes?.success) {
        toast.error(verifyRes?.message || "Mã xác thực không đúng");
        setRegLoading(false);
        return;
      }

      // Nếu server trả registerToken riêng, ưu tiên dùng
      const registerToken = verifyRes.data?.registerToken || regToken;

      // Gọi đăng ký kèm token xác thực email
      const payload = { ...registerData, register_token: registerToken };
      const regRes = await apiNguoiDung.register(payload);
      if (regRes?.success === false) {
        const errorMessage = regRes.message || "Đăng ký thất bại!";
        toast.error(errorMessage);
      } else {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        // Reset toàn bộ state đăng ký
        setIsRegister(false);
        setRegStep(1);
        setRegToken("");
        setRegOtp(["","","","","",""]);
        setRegResendSeconds(0);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đăng ký thất bại!";
      toast.error(errorMessage);
    } finally {
      setRegLoading(false);
    }
  };

  const handleRegisterResendCode = async () => {
    if (regResendSeconds > 0) return;
    if (!registerData.email) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    try {
      setRegLoading(true);
      const res = await apiNguoiDung.requestRegisterCode(registerData.email, registerData.ho_ten);
      if (res?.success) {
        setRegToken(res.data?.token || "");
        setRegResendSeconds(60);
        toast.success("Đã gửi lại mã xác thực!");
      } else {
        toast.error(res?.message || "Không thể gửi lại mã");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi gửi lại mã";
      toast.error(msg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleBack = () => {
    // Luôn chuyển về trang home
    navigate("/");
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
          {!showForgot ? (
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
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>
                    Quên mật khẩu?
                  </a>
                </p>
              </div>

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
          ) : (
            <div>
              <h1>{fpStep === 1 ? "Quên mật khẩu" : "Nhập mã xác thực"}</h1>
              <div style={{ marginTop: 12, background: '#fafafa', padding: 12, borderRadius: 8 }}>
                {fpStep === 1 ? (
                  <form onSubmit={handleForgotSubmitIdentifier}>
                    <div className={styles["input-box"]}>
                      <input
                        type="text"
                        name="fpIdentifier"
                        placeholder="Email hoặc tên đăng nhập"
                        value={fpIdentifier}
                        onChange={(e) => setFpIdentifier(e.target.value)}
                      />
                      <IoMailSharp className={styles.icon} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={fpLoading}>{fpLoading ? 'Đang gửi...' : 'Gửi mã'}</button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(false);
                          setFpIdentifier('');
                          setFpCode('');
                          setFpToken('');
                          setFpStep(1);
                          setResendSeconds(0);
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotVerifyCode}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                      {otpDigits.map((d, idx) => (
                        <input
                          key={idx}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={otpDigits[idx]}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0,1);
                            const next = [...otpDigits];
                            next[idx] = val;
                            setOtpDigits(next);
                            if (val && idx < 5) {
                              const nextEl = e.target.parentElement.querySelectorAll('input')[idx + 1];
                              nextEl && nextEl.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
                              const prevEl = e.currentTarget.parentElement.querySelectorAll('input')[idx - 1];
                              prevEl && prevEl.focus();
                            }
                          }}
                          onPaste={(e) => {
                            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0,6);
                            if (pasted) {
                              e.preventDefault();
                              const arr = pasted.split("").slice(0,6);
                              const next = ["","","","","",""];
                              for (let i = 0; i < arr.length; i++) next[i] = arr[i];
                              setOtpDigits(next);
                              const lastIndex = Math.min(arr.length - 1, 5);
                              const inputs = e.currentTarget.parentElement.querySelectorAll('input');
                              inputs[lastIndex] && inputs[lastIndex].focus();
                            }
                          }}
                          style={{ width: 40, height: 44, textAlign: 'center', fontSize: 18, borderRadius: 8, border: '1px solid #ddd' }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="submit" disabled={fpLoading}>{fpLoading ? 'Đang xác thực...' : 'Xác thực'}</button>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={fpLoading || resendSeconds > 0}
                      >
                        {resendSeconds > 0 ? `Gửi lại mã (${resendSeconds}s)` : 'Gửi lại mã'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(false);
                          setFpIdentifier('');
                          setOtpDigits(["", "", "", "", "", ""]);
                          setFpToken('');
                          setFpStep(1);
                          setResendSeconds(0);
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Register Form */}
        <div className={`${styles["form-box"]} ${styles.register}`}>
          {regStep === 1 ? (
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
                  paddingRight: '20px'
                }}
                onFocus={(e) => {
                  if (typeof e.target.showPicker === 'function') {
                    try {
                      e.target.showPicker();
                    } catch (error) {
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

            <div className={styles["input-box"]}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {showConfirmPassword ? (
                <FaEye 
                  onClick={() => setShowConfirmPassword(false)} 
                  className={styles.icon} 
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <FaEyeSlash 
                  onClick={() => setShowConfirmPassword(true)} 
                  className={styles.icon} 
                  style={{ cursor: 'pointer' }}
                />
              )}
            </div>

            <button type="submit" disabled={regLoading}>
              {regLoading ? "Đang gửi mã..." : "Gửi mã xác thực"}
            </button>
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
          ) : (
            <form onSubmit={handleRegisterVerifyAndCreate}>
              <h1>Nhập mã xác thực</h1>
              <div style={{ marginTop: 12, background: '#fafafa', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                  {regOtp.map((d, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={regOtp[idx]}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0,1);
                        const next = [...regOtp];
                        next[idx] = val;
                        setRegOtp(next);
                        if (val && idx < 5) {
                          const inputs = e.target.parentElement.querySelectorAll('input');
                          inputs[idx + 1] && inputs[idx + 1].focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !regOtp[idx] && idx > 0) {
                          const inputs = e.currentTarget.parentElement.querySelectorAll('input');
                          inputs[idx - 1] && inputs[idx - 1].focus();
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0,6);
                        if (pasted) {
                          e.preventDefault();
                          const arr = pasted.split("").slice(0,6);
                          const next = ["","","","","",""];
                          for (let i = 0; i < arr.length; i++) next[i] = arr[i];
                          setRegOtp(next);
                          const lastIndex = Math.min(arr.length - 1, 5);
                          const inputs = e.currentTarget.parentElement.querySelectorAll('input');
                          inputs[lastIndex] && inputs[lastIndex].focus();
                        }
                      }}
                      style={{ width: 40, height: 44, textAlign: 'center', fontSize: 18, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button type="submit" disabled={regLoading}>
                    {regLoading ? "Đang xác thực..." : "Xác thực & Tạo tài khoản"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterResendCode}
                    disabled={regLoading || regResendSeconds > 0}
                  >
                    {regResendSeconds > 0 ? `Gửi lại mã (${regResendSeconds}s)` : 'Gửi lại mã'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegStep(1);
                      setRegOtp(["","","","","",""]);
                      setRegToken("");
                      setRegResendSeconds(0);
                    }}
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
