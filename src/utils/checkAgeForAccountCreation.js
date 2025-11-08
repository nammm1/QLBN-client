/**
 * Kiểm tra tuổi để tạo tài khoản
 * @param {string|Date} ngaySinh - Ngày sinh của người dùng (format: YYYY-MM-DD hoặc Date object)
 * @returns {Object} - { isValid: boolean, age: number, message: string }
 */
export const checkAgeForAccountCreation = (ngaySinh) => {
  if (!ngaySinh) {
    return {
      isValid: false,
      age: null,
      message: "Ngày sinh là bắt buộc để tạo tài khoản."
    };
  }

  const currentDate = new Date();
  const birthDate = new Date(ngaySinh);
  
  // Kiểm tra ngày sinh hợp lệ
  if (isNaN(birthDate.getTime())) {
    return {
      isValid: false,
      age: null,
      message: "Ngày sinh không hợp lệ."
    };
  }

  // Kiểm tra ngày sinh không được trong tương lai
  if (birthDate > currentDate) {
    return {
      isValid: false,
      age: null,
      message: "Ngày sinh không được là ngày trong tương lai."
    };
  }

  // Tính tuổi
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  const dayDiff = currentDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  // Kiểm tra tuổi >= 6
  if (age < 6) {
    return {
      isValid: false,
      age: age,
      message: `Người dùng phải từ 6 tuổi trở lên mới được tạo tài khoản. Hiện tại bạn ${age} tuổi.`
    };
  }

  return {
    isValid: true,
    age: age,
    message: "Tuổi hợp lệ."
  };
};

