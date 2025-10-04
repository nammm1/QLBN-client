export const calculateAge = (ngaySinh) => {
  if (!ngaySinh) return "";
  const birth = new Date(ngaySinh);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

