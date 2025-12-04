import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useRef } from 'react';
import toast from '../../utils/toast';

/**
 * ProtectedRoute - Bảo vệ route dựa trên role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần render
 * @param {string[]} props.allowedRoles - Danh sách role được phép truy cập
 * @param {boolean} props.requireAuth - Có yêu cầu đăng nhập không (mặc định true)
 */
const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const location = useLocation();
  const hasShownToast = useRef(false);
  
  // Lấy thông tin từ Redux store
  const { isLogin, vai_tro } = useSelector((state) => state.counter || {});
  
  // Fallback: Lấy từ localStorage nếu Redux chưa có
  let userInfo = null;
  let userRole = null;
  let isLoggedIn = false;
  
  try {
    const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    userInfo = savedUserInfo?.user || savedUserInfo;
    userRole = userInfo?.vai_tro || vai_tro;
    isLoggedIn = localStorage.getItem("isLogin") === "true" || isLogin;
  } catch (error) {
    console.error("Error parsing userInfo:", error);
  }

  // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu không yêu cầu đăng nhập hoặc không có allowedRoles, cho phép truy cập
  if (!requireAuth || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Nếu có allowedRoles nhưng user chưa đăng nhập
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role
  if (!userRole) {
    // Nếu không có role, redirect về login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu role không khớp với allowedRoles, redirect về dashboard của role đó
  if (!allowedRoles.includes(userRole)) {
    const roleDashboardMap = {
      'bac_si': '/doctor',
      'benh_nhan': '/',
      'quan_tri_vien': '/admin',
      'nhan_vien_phan_cong': '/staff',
      'nhan_vien_quay': '/receptionist',
      'chuyen_gia_dinh_duong': '/nutritionist',
      'nhan_vien_xet_nghiem': '/lab-staff'
    };

    const dashboardPath = roleDashboardMap[userRole] || '/';
    
    // Hiển thị thông báo toast (chỉ hiển thị 1 lần)
    if (!hasShownToast.current) {
      hasShownToast.current = true;
      toast.warning("Bạn không có quyền truy cập trang này. Đang chuyển về trang của bạn...");
    }
    
    return <Navigate to={dashboardPath} replace />;
  }

  // Role hợp lệ, cho phép truy cập
  return <>{children}</>;
};

export default ProtectedRoute;

