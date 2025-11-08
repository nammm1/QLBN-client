import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Typography,
  Modal,
  Row,
  Col,
  Tag,
  Space,
  Descriptions,
  Divider,
  Empty,
  Collapse,
  Spin,
  Tabs,
  Timeline,
  Badge,
  Statistic,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  AppleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  PrinterOutlined,
  EyeOutlined,
  HeartOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  BulbOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./NutritionRecords.css";
import apiHoSoDinhDuong from "../../../api/HoSoDinhDuong";
import apiBenhNhan from "../../../api/BenhNhan";
import apiNguoiDung from "../../../api/NguoiDung";
import apiLichSuTuVan from "../../../api/LichSuTuVan";
import apiTheoDoiTienDo from "../../../api/TheoDoiTienDo";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiHoaDon from "../../../api/HoaDon";
import apiThucDonChiTiet from "../../../api/ThucDonChiTiet";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return isNaN(d)
      ? "—"
      : d.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return "—";
  }
};

const unwrap = (res) => {
  if (res?.data !== undefined) return res.data;
  return res ?? null;
};

// Format tên bữa ăn
const formatBuaAn = (bua) => {
  if (!bua) return "—";
  const buaLower = bua.toLowerCase().trim();
  const buaMap = {
    'sang': 'Sáng',
    'trua': 'Trưa',
    'toi': 'Tối',
    'phu': 'Phụ',
    'an_phu': 'Ăn phụ',
    'an_them': 'Ăn thêm',
    'snack': 'Snack',
    'breakfast': 'Sáng',
    'lunch': 'Trưa',
    'dinner': 'Tối',
  };
  return buaMap[buaLower] || bua.charAt(0).toUpperCase() + bua.slice(1).toLowerCase();
};

const NutritionRecords = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [personalInfo, setPersonalInfo] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const patientId =
    userInfo?.user?.id_benh_nhan ||
    userInfo?.user?.id_nguoi_dung ||
    null;

  // Load dữ liệu
  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Load thông tin bệnh nhân
        let personalInfoData = null;
        const benhNhanRes = await apiBenhNhan.getById(patientId).catch(() => null);
        const benhNhan = unwrap(benhNhanRes);
        
        if (benhNhan) {
          const userInfoData = await apiNguoiDung.getUserById(patientId).catch(() => ({}));
          const userData = unwrap(userInfoData) || {};
          
          personalInfoData = {
            ho_ten: benhNhan.ho_ten || userData.ho_ten || "—",
            gioi_tinh: benhNhan.gioi_tinh || userData.gioi_tinh || "—",
            tuoi: benhNhan.tuoi || "—",
            ngay_sinh: benhNhan.ngay_sinh || userData.ngay_sinh || null,
            dan_toc: benhNhan.dan_toc || userData.dan_toc || "—",
            so_dien_thoai: benhNhan.so_dien_thoai || userData.so_dien_thoai || "—",
            dia_chi: benhNhan.dia_chi || userData.dia_chi || "—",
            ma_BHYT: benhNhan.ma_BHYT || "—",
          };
        }

        // 2. Load hồ sơ dinh dưỡng (lấy cái mới nhất)
        const hoSoRes = await apiHoSoDinhDuong.getByBenhNhan(patientId).catch(() => null);
        // API có thể trả về object (findOne) hoặc array (findAll)
        let hoSoList = [];
        if (hoSoRes) {
          if (Array.isArray(hoSoRes)) {
            hoSoList = hoSoRes;
          } else {
            // Nếu là object, chuyển thành array
            hoSoList = [hoSoRes];
          }
        }
        
        // Nếu chưa có thông tin cá nhân từ API bệnh nhân, thử lấy từ hồ sơ
        if (!personalInfoData && hoSoList.length > 0) {
          const latestHoSo = hoSoList[0];
          personalInfoData = {
            ho_ten: latestHoSo.ho_ten || "—",
            gioi_tinh: latestHoSo.gioi_tinh || "—",
            tuoi: latestHoSo.tuoi || "—",
            ngay_sinh: latestHoSo.ngay_sinh || null,
            dan_toc: latestHoSo.dan_toc || "—",
            so_dien_thoai: latestHoSo.so_dien_thoai || "—",
            dia_chi: latestHoSo.dia_chi || "—",
            ma_BHYT: latestHoSo.ma_BHYT || "—",
          };
        }
        
        if (personalInfoData) {
          setPersonalInfo(personalInfoData);
        }

        // 3. Load lịch sử tư vấn để lấy thông tin mới nhất (kế hoạch dinh dưỡng, nhu cầu calo, etc.)
        const lichSuRes = await apiLichSuTuVan.getLichSuTuVanByBenhNhan(patientId).catch(() => []);
        const lichSuList = Array.isArray(lichSuRes) ? lichSuRes : (unwrap(lichSuRes) || []);
        
        // Tìm lịch sử tư vấn mới nhất có đầy đủ thông tin
        const latestLichSu = lichSuList.length > 0 
          ? [...lichSuList].sort((a, b) => {
              const dateA = new Date(a.thoi_gian_tu_van || a.ngay_tao || 0);
              const dateB = new Date(b.thoi_gian_tu_van || b.ngay_tao || 0);
              return dateB - dateA;
            })[0]
          : null;
        
        if (hoSoList.length > 0) {
          const latestHoSo = hoSoList[hoSoList.length - 1]; // Lấy hồ sơ mới nhất
          let ten_chuyen_gia = "—";
          
          if (latestHoSo.id_chuyen_gia) {
            try {
              const cgRes = await apiNguoiDung.getUserById(latestHoSo.id_chuyen_gia);
              const cgData = unwrap(cgRes);
              ten_chuyen_gia = cgData?.ho_ten || "—";
            } catch {}
          }

          // Lấy thực đơn từ lịch sử mới nhất
          let thucDon = {};
          if (latestLichSu?.id_lich_su) {
            try {
              console.log(`[DEBUG] Đang lấy thực đơn cho lịch sử mới nhất: ${latestLichSu.id_lich_su}`);
              const thucDonRes = await apiThucDonChiTiet.getByLichSu(latestLichSu.id_lich_su);
              console.log(`[DEBUG] Response từ API (hồ sơ):`, thucDonRes);
              
              // Xử lý response - có thể là array hoặc object có data
              let thucDonList = [];
              if (Array.isArray(thucDonRes)) {
                thucDonList = thucDonRes;
              } else if (thucDonRes?.data && Array.isArray(thucDonRes.data)) {
                thucDonList = thucDonRes.data;
              } else if (thucDonRes?.data) {
                thucDonList = unwrap(thucDonRes);
                if (!Array.isArray(thucDonList)) {
                  thucDonList = thucDonList ? [thucDonList] : [];
                }
              } else {
                thucDonList = unwrap(thucDonRes) || [];
                if (!Array.isArray(thucDonList)) {
                  thucDonList = thucDonList ? [thucDonList] : [];
                }
              }
              
              console.log(`[DEBUG] Thực đơn list (sau xử lý) cho hồ sơ:`, thucDonList);
              
              if (thucDonList && thucDonList.length > 0) {
                thucDonList.forEach((td) => {
                  if (td && td.bua_an) {
                    if (!thucDon[td.bua_an]) {
                      thucDon[td.bua_an] = [];
                    }
                    // Lưu thông tin đầy đủ của món ăn
                    const monAn = {
                      ten_mon: td.ten_mon || td.mon_an || "—",
                      khoi_luong: td.khoi_luong,
                      calo: td.calo,
                      ...td
                    };
                    thucDon[td.bua_an].push(monAn);
                  } else {
                    console.log(`[DEBUG] Bỏ qua item không có bua_an (hồ sơ):`, td);
                  }
                });
                console.log(`[DEBUG] Thực đơn đã được nhóm theo bữa cho hồ sơ:`, thucDon);
              } else {
                console.log(`[DEBUG] Không có thực đơn cho lịch sử mới nhất ${latestLichSu.id_lich_su} (danh sách rỗng)`);
              }
            } catch (err) {
              console.error(`[ERROR] Lỗi khi lấy thực đơn cho hồ sơ:`, err);
              if (err.response) {
                console.error(`[ERROR] Response error:`, err.response.data);
              }
            }
          } else {
            console.log(`[DEBUG] Không có latestLichSu hoặc id_lich_su để lấy thực đơn`);
          }

          // Format mục tiêu dinh dưỡng (có thể là JSON string)
          let formattedMucTieu = latestLichSu?.muc_tieu_dinh_duong || "—";
          if (formattedMucTieu && formattedMucTieu !== "—") {
            try {
              // Thử parse JSON nếu là string JSON
              const parsed = typeof formattedMucTieu === 'string' ? JSON.parse(formattedMucTieu) : formattedMucTieu;
              if (typeof parsed === 'object' && parsed !== null) {
                // Nếu là object, format thành text
                formattedMucTieu = Object.entries(parsed)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n');
              }
            } catch {
              // Nếu không phải JSON, giữ nguyên
            }
          }

          // Ưu tiên lấy dữ liệu từ lịch sử tư vấn mới nhất, nếu không có thì lấy từ hồ sơ
          setNutritionProfile({
            id_ho_so: latestHoSo.id_ho_so || latestHoSo.id,
            ngay_tao: latestHoSo.ngay_tao,
            chuyen_gia: ten_chuyen_gia,
            loai_tu_van: latestLichSu?.loai_tu_van || latestHoSo.loai_tu_van || latestHoSo.loai_dinh_duong || "—",
            chi_so: {
              chieu_cao: latestHoSo.chieu_cao,
              can_nang: latestHoSo.can_nang,
              vong_eo: latestHoSo.vong_eo,
              mo_co_the: latestHoSo.mo_co_the,
              khoi_co: latestHoSo.khoi_co,
              nuoc_trong_co_the: latestHoSo.nuoc_trong_co_the,
            },
            nhan_xet: latestLichSu?.ket_qua_cls || latestLichSu?.nhan_xet || latestHoSo.nhan_xet || "—",
            ke_hoach_dinh_duong: latestLichSu?.ke_hoach_dinh_duong || latestHoSo.ke_hoach_dinh_duong || "—",
            nhu_cau_calo: latestLichSu?.nhu_cau_calo || latestHoSo.nhu_cau_calo || 0,
            cham_soc: latestLichSu?.cham_soc || latestHoSo.cham_soc || "—",
            ghi_chu: latestLichSu?.ghi_chu || latestHoSo.ghi_chu || "—",
            muc_tieu_dinh_duong: formattedMucTieu,
            thuc_don: thucDon,
          });
        } else if (latestLichSu) {
          // Nếu không có hồ sơ nhưng có lịch sử tư vấn, vẫn hiển thị thông tin
          let ten_chuyen_gia = "—";
          if (latestLichSu.id_chuyen_gia) {
            try {
              const cgRes = await apiNguoiDung.getUserById(latestLichSu.id_chuyen_gia);
              const cgData = unwrap(cgRes);
              ten_chuyen_gia = cgData?.ho_ten || "—";
            } catch {}
          }

          // Lấy thực đơn từ lịch sử
          let thucDon = {};
          if (latestLichSu.id_lich_su) {
            try {
              console.log(`[DEBUG] Đang lấy thực đơn cho lịch sử (không có hồ sơ): ${latestLichSu.id_lich_su}`);
              const thucDonRes = await apiThucDonChiTiet.getByLichSu(latestLichSu.id_lich_su);
              console.log(`[DEBUG] Response từ API (không có hồ sơ):`, thucDonRes);
              
              // Xử lý response - có thể là array hoặc object có data
              let thucDonList = [];
              if (Array.isArray(thucDonRes)) {
                thucDonList = thucDonRes;
              } else if (thucDonRes?.data && Array.isArray(thucDonRes.data)) {
                thucDonList = thucDonRes.data;
              } else if (thucDonRes?.data) {
                thucDonList = unwrap(thucDonRes);
                if (!Array.isArray(thucDonList)) {
                  thucDonList = thucDonList ? [thucDonList] : [];
                }
              } else {
                thucDonList = unwrap(thucDonRes) || [];
                if (!Array.isArray(thucDonList)) {
                  thucDonList = thucDonList ? [thucDonList] : [];
                }
              }
              
              console.log(`[DEBUG] Thực đơn list (sau xử lý) không có hồ sơ:`, thucDonList);
              
              if (thucDonList && thucDonList.length > 0) {
                thucDonList.forEach((td) => {
                  if (td && td.bua_an) {
                    if (!thucDon[td.bua_an]) {
                      thucDon[td.bua_an] = [];
                    }
                    const monAn = {
                      ten_mon: td.ten_mon || td.mon_an || "—",
                      khoi_luong: td.khoi_luong,
                      calo: td.calo,
                      ...td
                    };
                    thucDon[td.bua_an].push(monAn);
                  } else {
                    console.log(`[DEBUG] Bỏ qua item không có bua_an (không có hồ sơ):`, td);
                  }
                });
                console.log(`[DEBUG] Thực đơn đã được nhóm theo bữa (không có hồ sơ):`, thucDon);
              } else {
                console.log(`[DEBUG] Không có thực đơn cho lịch sử ${latestLichSu.id_lich_su} (danh sách rỗng)`);
              }
            } catch (err) {
              console.error(`[ERROR] Lỗi khi lấy thực đơn (không có hồ sơ):`, err);
              if (err.response) {
                console.error(`[ERROR] Response error:`, err.response.data);
              }
            }
          }

          // Format mục tiêu dinh dưỡng
          let formattedMucTieu = latestLichSu.muc_tieu_dinh_duong || "—";
          if (formattedMucTieu && formattedMucTieu !== "—") {
            try {
              const parsed = typeof formattedMucTieu === 'string' ? JSON.parse(formattedMucTieu) : formattedMucTieu;
              if (typeof parsed === 'object' && parsed !== null) {
                formattedMucTieu = Object.entries(parsed)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n');
              }
            } catch {
              // Nếu không phải JSON, giữ nguyên
            }
          }

          setNutritionProfile({
            id_ho_so: latestLichSu.id_ho_so || null,
            ngay_tao: latestLichSu.thoi_gian_tu_van || latestLichSu.ngay_tao,
            chuyen_gia: ten_chuyen_gia,
            loai_tu_van: latestLichSu.loai_tu_van || "—",
            chi_so: {
              chieu_cao: null,
              can_nang: null,
              vong_eo: null,
              mo_co_the: null,
              khoi_co: null,
              nuoc_trong_co_the: null,
            },
            nhan_xet: latestLichSu.ket_qua_cls || latestLichSu.nhan_xet || "—",
            ke_hoach_dinh_duong: latestLichSu.ke_hoach_dinh_duong || "—",
            nhu_cau_calo: latestLichSu.nhu_cau_calo || 0,
            cham_soc: latestLichSu.cham_soc || "—",
            ghi_chu: latestLichSu.ghi_chu || "—",
            muc_tieu_dinh_duong: formattedMucTieu,
            thuc_don: thucDon,
          });
        }

        // 4. Load lịch sử tư vấn và cuộc hẹn (đã load ở bước 3, tái sử dụng)
        // lichSuList đã được khai báo ở bước 3, không cần khai báo lại

        const cuocHenRes = await apiCuocHenTuVan.getByBenhNhan(patientId).catch(() => []);
        const cuocHenList = Array.isArray(cuocHenRes) ? cuocHenRes : (unwrap(cuocHenRes) || []);

        // Kết hợp lịch sử và cuộc hẹn
        const enrichedHistory = await Promise.all(
          lichSuList.map(async (ls) => {
            // Tìm cuộc hẹn tương ứng
            const cuocHen = cuocHenList.find(
              (ch) => ch.id_cuoc_hen === ls.id_cuoc_hen
            );

            // Lấy thực đơn
            let thucDon = {};
            try {
              if (ls.id_lich_su) {
                console.log(`[DEBUG] Đang lấy thực đơn cho lịch sử: ${ls.id_lich_su}`);
              const thucDonRes = await apiThucDonChiTiet.getByLichSu(ls.id_lich_su);
                console.log(`[DEBUG] Response từ API:`, thucDonRes);
                
                // Xử lý response - có thể là array hoặc object có data
                let thucDonList = [];
                if (Array.isArray(thucDonRes)) {
                  thucDonList = thucDonRes;
                } else if (thucDonRes?.data && Array.isArray(thucDonRes.data)) {
                  thucDonList = thucDonRes.data;
                } else if (thucDonRes?.data) {
                  thucDonList = unwrap(thucDonRes);
                  if (!Array.isArray(thucDonList)) {
                    thucDonList = thucDonList ? [thucDonList] : [];
                  }
                } else {
                  thucDonList = unwrap(thucDonRes) || [];
                  if (!Array.isArray(thucDonList)) {
                    thucDonList = thucDonList ? [thucDonList] : [];
                  }
                }
                
                console.log(`[DEBUG] Thực đơn list (sau xử lý):`, thucDonList);
                
                if (thucDonList && thucDonList.length > 0) {
              thucDonList.forEach((td) => {
                    if (td && td.bua_an) {
                  if (!thucDon[td.bua_an]) {
                    thucDon[td.bua_an] = [];
                  }
                      // Lưu thông tin đầy đủ của món ăn
                      const monAn = {
                        ten_mon: td.ten_mon || td.mon_an || "—",
                        khoi_luong: td.khoi_luong,
                        calo: td.calo,
                        ...td
                      };
                  thucDon[td.bua_an].push(monAn);
                    } else {
                      console.log(`[DEBUG] Bỏ qua item không có bua_an:`, td);
                    }
                  });
                  console.log(`[DEBUG] Thực đơn đã được nhóm theo bữa:`, thucDon);
                } else {
                  console.log(`[DEBUG] Không có thực đơn cho lịch sử ${ls.id_lich_su} (danh sách rỗng)`);
                }
              } else {
                console.log(`[DEBUG] Không có id_lich_su để lấy thực đơn cho lịch sử:`, ls);
              }
            } catch (err) {
              console.error(`[ERROR] Lỗi khi lấy thực đơn cho lịch sử ${ls.id_lich_su}:`, err);
              if (err.response) {
                console.error(`[ERROR] Response error:`, err.response.data);
              }
            }

            // Lấy hóa đơn
            let hoaDon = null;
            let chiTietHoaDon = [];
            if (cuocHen?.id_cuoc_hen) {
              try {
                const hoaDonRes = await apiHoaDon.getByCuocHenTuVan(cuocHen.id_cuoc_hen);
                hoaDon = unwrap(hoaDonRes);
                
                if (hoaDon?.id_hoa_don) {
                  // Lấy chi tiết hóa đơn từ response (nếu có)
                  chiTietHoaDon = hoaDon.chi_tiet || [];
                }
              } catch (err) {
                console.error("Lỗi khi lấy hóa đơn:", err);
              }
            }

            // Lấy tiến độ theo dõi
            let tienDo = [];
            try {
              const tienDoRes = await apiTheoDoiTienDo.getByLichSu(ls.id_lich_su);
              tienDo = Array.isArray(tienDoRes) ? tienDoRes : (unwrap(tienDoRes) || []);
            } catch (err) {
              console.error("Lỗi khi lấy tiến độ:", err);
            }

            return {
              id_lich_su: ls.id_lich_su,
              id_cuoc_hen: ls.id_cuoc_hen || cuocHen?.id_cuoc_hen,
              ngay_tu_van: ls.thoi_gian_tu_van || ls.thoi_gian_tao || cuocHen?.ngay_kham || ls.ngay_tao,
              trang_thai_cuoc_hen: cuocHen?.trang_thai || "—",
              loai_tu_van: ls.loai_tu_van || "—",
              phuong_thuc: cuocHen?.loai_hen === "truc_tiep" ? "Trực tiếp" : cuocHen?.loai_hen === "online" ? "Online" : "—",
              nhan_xet: ls.nhan_xet || ls.ket_qua_cls || "—",
              thuc_don: thucDon,
              hoa_don: hoaDon,
              chi_tiet_hoa_don: chiTietHoaDon,
              tien_do: tienDo,
              ho_so_id: ls.id_ho_so,
              // Lưu thêm các thông tin khác từ lịch sử
              ke_hoach_dinh_duong: ls.ke_hoach_dinh_duong,
              nhu_cau_calo: ls.nhu_cau_calo,
              cham_soc: ls.cham_soc,
              ghi_chu: ls.ghi_chu,
              muc_tieu_dinh_duong: ls.muc_tieu_dinh_duong,
            };
          })
        );

        // Sắp xếp theo ngày (mới nhất trước)
        enrichedHistory.sort((a, b) => {
          const dateA = new Date(a.ngay_tu_van || 0);
          const dateB = new Date(b.ngay_tu_van || 0);
          return dateB - dateA;
        });

        setAppointmentHistory(enrichedHistory);

        // 5. Load dữ liệu tiến độ cho biểu đồ
        const tienDoRes = await apiTheoDoiTienDo.getByBenhNhan(patientId).catch(() => []);
        const tienDoList = Array.isArray(tienDoRes) ? tienDoRes : (unwrap(tienDoRes) || []);

        // Chuẩn bị dữ liệu cho biểu đồ
        const chartData = tienDoList
          .sort((a, b) => {
            const dateA = new Date(a.ngay_kham || 0);
            const dateB = new Date(b.ngay_kham || 0);
            return dateA - dateB;
          })
          .map((td) => ({
            date: formatDate(td.ngay_kham),
            canNang: td.can_nang || null,
            chiSoBMI: td.chi_so_BMI || null,
            vongEo: td.vong_eo || null,
            moCoThe: td.mo_co_the || null,
          }));

        setProgressData(chartData);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Tính BMI
  const calculateBMI = (canNang, chieuCao) => {
    if (!canNang || !chieuCao) return null;
    const heightInMeters = chieuCao / 100;
    return (canNang / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Xử lý click xem chi tiết
  const handleViewDetail = async (record) => {
    setSelectedAppointment(record);
    setModalVisible(true);
  };

  // Render biểu đồ tiến độ
  const renderProgressChart = () => {
    if (progressData.length === 0) {
      return (
        <Empty
          description="Chưa có dữ liệu theo dõi tiến độ"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="progress-chart-container">
        <Row gutter={[24, 24]}>
          {progressData.some((d) => d.canNang !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ Cân nặng (kg)" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="canNang"
                      stroke="#52c41a"
                      fill="#52c41a"
                      fillOpacity={0.3}
                      name="Cân nặng (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {progressData.some((d) => d.chiSoBMI !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ BMI" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="chiSoBMI"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="BMI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {progressData.some((d) => d.vongEo !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ Vòng eo (cm)" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="vongEo"
                      stroke="#ff7875"
                      fill="#ff7875"
                      fillOpacity={0.3}
                      name="Vòng eo (cm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {progressData.some((d) => d.moCoThe !== null) && (
            <Col xs={24} lg={12}>
              <Card title="Tiến độ Mỡ cơ thể (%)" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="moCoThe"
                      stroke="#faad14"
                      strokeWidth={2}
                      name="Mỡ cơ thể (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // Render lịch sử khám
  const renderAppointmentHistory = () => {
    if (appointmentHistory.length === 0) {
      return (
        <Empty
          description="Chưa có lịch sử tư vấn dinh dưỡng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="appointment-history-container">
        <Timeline mode="left">
          {appointmentHistory.map((appt, index) => {
            const getStatusColor = (status) => {
              switch (status) {
                case "da_hoan_thanh":
                  return "green";
                case "da_dat":
                  return "blue";
                case "da_huy":
                  return "red";
                default:
                  return "default";
              }
            };

            const getStatusText = (status) => {
              switch (status) {
                case "da_hoan_thanh":
                  return "Đã hoàn thành";
                case "da_dat":
                  return "Đã đặt";
                case "da_huy":
                  return "Đã hủy";
                default:
                  return status || "—";
              }
            };

            return (
              <Timeline.Item
                key={appt.id_lich_su || index}
                color={getStatusColor(appt.trang_thai_cuoc_hen)}
                dot={
                  <Badge
                    status={
                      appt.trang_thai_cuoc_hen === "da_hoan_thanh"
                        ? "success"
                        : appt.trang_thai_cuoc_hen === "da_huy"
                        ? "error"
                        : "processing"
                    }
                  />
                }
              >
                <Card
                  className="appointment-card"
                  hoverable
                  onClick={() => handleViewDetail(appt)}
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Space direction="vertical" size="small">
                        <Text strong>
                          <CalendarOutlined /> Ngày tư vấn: {formatDateTime(appt.ngay_tu_van)}
                        </Text>
                        <Tag color={getStatusColor(appt.trang_thai_cuoc_hen)}>
                          {getStatusText(appt.trang_thai_cuoc_hen)}
                        </Tag>
                        {appt.loai_tu_van && (
                          <Tag color="purple">{appt.loai_tu_van}</Tag>
                        )}
                        {appt.phuong_thuc && (
                          <Tag color="cyan">{appt.phuong_thuc}</Tag>
                        )}
                      </Space>
                    </Col>
                    <Col xs={24} sm={12} style={{ textAlign: "right" }}>
                      <Space>
                        {appt.hoa_don && (
                          <Badge count={appt.chi_tiet_hoa_don?.length || 0} showZero>
                            <Tag icon={<ShoppingCartOutlined />} color="orange">
                              Hóa đơn
                            </Tag>
                          </Badge>
                        )}
                        {Object.keys(appt.thuc_don || {}).length > 0 && (
                          <Tag icon={<AppleOutlined />} color="green">
                            Có thực đơn
                          </Tag>
                        )}
                        {appt.tien_do?.length > 0 && (
                          <Tag icon={<TrophyOutlined />} color="gold">
                            Có tiến độ
                          </Tag>
                        )}
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(appt);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="nutrition-records-loading">
        <Spin spinning={true} size="large" tip="Đang tải dữ liệu...">
          <div style={{ minHeight: 200 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="nutrition-records-page">
      <div className="nutrition-records-container">
        {/* Header */}
        <div className="nutrition-records-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/patient-function")}
            className="back-button"
          >
            Quay lại
          </Button>
          <Title level={1} className="page-title">
            <AppleOutlined /> HỒ SƠ DINH DƯỠNG
          </Title>
        </div>

        {/* Thông tin cá nhân */}
        {personalInfo && (
          <Card className="personal-info-card modern-card" style={{ marginBottom: 32 }}>
            <div className="card-header-modern">
              <div className="card-icon-wrapper">
                <UserOutlined className="card-icon" />
              </div>
              <Title level={4} className="section-title-modern">
                Thông tin cá nhân
            </Title>
            </div>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} className="modern-descriptions">
              <Descriptions.Item label={<span className="desc-label"><UserOutlined /> Họ tên</span>}>
                <Text strong className="desc-value">{personalInfo.ho_ten}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="desc-label">Giới tính</span>}>
                <Tag color={personalInfo.gioi_tinh === "Nam" ? "blue" : "pink"} className="gender-tag">
                  {personalInfo.gioi_tinh}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="desc-label">Tuổi</span>}>
                <Text className="desc-value">{personalInfo.tuoi}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="desc-label">Dân tộc</span>}>
                <Text className="desc-value">{personalInfo.dan_toc}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="desc-label"><PhoneOutlined /> Số điện thoại</span>}>
                <Text className="desc-value">{personalInfo.so_dien_thoai}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="desc-label">Mã BHYT</span>}>
                <Tag color="green">{personalInfo.ma_BHYT}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="desc-label"><HomeOutlined /> Địa chỉ</span>} span={3}>
                <Text className="desc-value">{personalInfo.dia_chi}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="nutrition-tabs"
          items={[
            {
              key: "profile",
              label: (
                <span>
                  <FileTextOutlined /> Hồ sơ dinh dưỡng
                </span>
              ),
              children: nutritionProfile ? (
                <div className="nutrition-profile-content">
                  {/* Summary Cards Row */}
                  <Row gutter={[24, 24]} className="summary-cards-row">
                    <Col xs={24} sm={12} lg={8}>
                      <Card className="summary-card consultation-card">
                        <div className="summary-card-icon">
                          <TeamOutlined />
                        </div>
                        <div className="summary-card-content">
                          <Text className="summary-card-label">Chuyên gia tư vấn</Text>
                          <Title level={4} className="summary-card-value">
                          {nutritionProfile.chuyen_gia || "—"}
                          </Title>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <Card className="summary-card date-card">
                        <div className="summary-card-icon">
                          <CalendarOutlined />
                        </div>
                        <div className="summary-card-content">
                          <Text className="summary-card-label">Ngày tạo hồ sơ</Text>
                          <Title level={4} className="summary-card-value">
                            {formatDate(nutritionProfile.ngay_tao)}
                          </Title>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <Card className="summary-card type-card">
                        <div className="summary-card-icon">
                          <HeartOutlined />
                        </div>
                        <div className="summary-card-content">
                          <Text className="summary-card-label">Loại tư vấn</Text>
                          <div className="summary-card-value">
                          {nutritionProfile.loai_tu_van && nutritionProfile.loai_tu_van !== "—" ? (
                              <Tag 
                                color={nutritionProfile.loai_tu_van === "Giảm cân" ? "red" : 
                                       nutritionProfile.loai_tu_van === "Tăng cân" ? "green" : "blue"}
                                className="consultation-type-tag"
                              >
                              {nutritionProfile.loai_tu_van}
                            </Tag>
                          ) : (
                            <Text type="secondary" style={{ fontStyle: 'italic' }}>—</Text>
                          )}
                          </div>
                        </div>
                    </Card>
                    </Col>
                  </Row>

                  {/* Body Metrics Section */}
                  <Card className="info-card body-metrics-card modern-metrics-card" style={{ marginTop: 24 }}>
                    <div className="card-header-modern">
                      <div className="card-icon-wrapper metrics-icon">
                        <ThunderboltOutlined className="card-icon" />
                      </div>
                      <Title level={4} className="section-title-modern">
                        Chỉ số cơ thể
                      </Title>
                    </div>
                    <Row gutter={[20, 20]} className="metrics-grid">
                        {nutritionProfile.chi_so.chieu_cao ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-height">
                            <div className="metric-icon">
                              <RiseOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">Chiều cao</Text>
                              <div className="metric-value">
                                {nutritionProfile.chi_so.chieu_cao}
                                <span className="metric-unit">cm</span>
                              </div>
                            </div>
                          </div>
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.can_nang ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-weight">
                            <div className="metric-icon">
                              <TrophyOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">Cân nặng</Text>
                              <div className="metric-value">
                                {nutritionProfile.chi_so.can_nang}
                                <span className="metric-unit">kg</span>
                              </div>
                            </div>
                          </div>
                          </Col>
                        ) : null}
                      {nutritionProfile.chi_so.can_nang && nutritionProfile.chi_so.chieu_cao ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-bmi">
                            <div className="metric-icon">
                              <AppleOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">BMI</Text>
                              <div className="metric-value">
                                {calculateBMI(
                                  nutritionProfile.chi_so.can_nang,
                                  nutritionProfile.chi_so.chieu_cao
                                )}
                              </div>
                            </div>
                          </div>
                            </Col>
                          ) : null}
                        {nutritionProfile.chi_so.vong_eo ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-waist">
                            <div className="metric-icon">
                              <FallOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">Vòng eo</Text>
                              <div className="metric-value">
                                {nutritionProfile.chi_so.vong_eo}
                                <span className="metric-unit">cm</span>
                              </div>
                            </div>
                          </div>
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.mo_co_the ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-fat">
                            <div className="metric-icon">
                              <MedicineBoxOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">Mỡ cơ thể</Text>
                              <div className="metric-value">
                                {nutritionProfile.chi_so.mo_co_the}
                                <span className="metric-unit">%</span>
                              </div>
                            </div>
                          </div>
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.khoi_co ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-muscle">
                            <div className="metric-icon">
                              <ThunderboltOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">Khối cơ</Text>
                              <div className="metric-value">
                                {nutritionProfile.chi_so.khoi_co}
                                <span className="metric-unit">kg</span>
                              </div>
                            </div>
                          </div>
                          </Col>
                        ) : null}
                        {nutritionProfile.chi_so.nuoc_trong_co_the ? (
                        <Col xs={12} sm={8} md={6}>
                          <div className="metric-item metric-water">
                            <div className="metric-icon">
                              <HeartOutlined />
                            </div>
                            <div className="metric-content">
                              <Text className="metric-label">Nước trong cơ thể</Text>
                              <div className="metric-value">
                                {nutritionProfile.chi_so.nuoc_trong_co_the}
                                <span className="metric-unit">%</span>
                              </div>
                            </div>
                          </div>
                          </Col>
                        ) : null}
                        {!nutritionProfile.chi_so.chieu_cao && 
                         !nutritionProfile.chi_so.can_nang && 
                         !nutritionProfile.chi_so.vong_eo && 
                         !nutritionProfile.chi_so.mo_co_the && 
                         !nutritionProfile.chi_so.khoi_co && 
                         !nutritionProfile.chi_so.nuoc_trong_co_the && (
                          <Col xs={24}>
                            <Empty 
                              description="Chưa có thông tin chỉ số cơ thể" 
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ padding: "40px 0" }}
                            />
                          </Col>
                        )}
                      </Row>
                    </Card>

                  {/* Calorie Requirement - Highlighted */}
                    {nutritionProfile.nhu_cau_calo > 0 && (
                    <Card className="info-card calorie-card calorie-card-prominent" style={{ marginTop: 24 }}>
                      <div className="calorie-card-content">
                        <div className="calorie-icon-wrapper">
                          <FireOutlined className="calorie-icon" />
                        </div>
                        <div className="calorie-info">
                          <Text className="calorie-label">Nhu cầu calo hàng ngày</Text>
                          <div className="calorie-value">
                            {nutritionProfile.nhu_cau_calo.toLocaleString('vi-VN')}
                            <span className="calorie-unit">kcal/ngày</span>
                          </div>
                          <Text className="calorie-description">
                            Lượng calo được khuyến nghị dựa trên tình trạng sức khỏe và mục tiêu của bạn
                          </Text>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Meal Plan Section */}
                  {(() => {
                    console.log('[DEBUG] nutritionProfile.thuc_don:', nutritionProfile.thuc_don);
                    console.log('[DEBUG] Object.keys(nutritionProfile.thuc_don):', nutritionProfile.thuc_don ? Object.keys(nutritionProfile.thuc_don) : 'null');
                    return null;
                  })()}
                  {nutritionProfile.thuc_don && Object.keys(nutritionProfile.thuc_don).length > 0 && (
        <Card
                      className="info-card modern-content-card" 
                      style={{ marginTop: 24 }}
                      title={
                        <span className="card-title-with-icon">
                          <AppleOutlined /> Thực đơn dinh dưỡng
                        </span>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        {Object.entries(nutritionProfile.thuc_don).map(([bua, monAnList]) => {
                          console.log(`[DEBUG] Hiển thị bữa ${bua} với ${monAnList?.length || 0} món ăn:`, monAnList);
                          return (
                          <Col xs={24} sm={12} lg={8} key={bua}>
                            <Card
                              title={
                                <span style={{ fontWeight: 600, color: '#52c41a', fontSize: '16px' }}>
                                  {formatBuaAn(bua)}
                                </span>
                              }
                              size="small"
                              className="meal-card"
                              style={{ height: '100%' }}
                            >
                              {Array.isArray(monAnList) && monAnList.length > 0 ? (
                                <div style={{ margin: 0 }}>
                                  {monAnList.map((mon, idx) => {
                                    // Nếu mon là object, hiển thị thông tin chi tiết
                                    if (typeof mon === 'object' && mon !== null) {
                                      const tenMon = mon.ten_mon || mon.mon_an || '—';
                                      const khoiLuong = mon.khoi_luong;
                                      const calo = mon.calo;
                                      return (
                                        <div 
                                          key={idx} 
                                          style={{ 
                                            marginBottom: 12, 
                                            padding: '12px', 
                                            backgroundColor: '#f8f9fa', 
                                            borderRadius: '8px',
                                            border: '1px solid #e8e8e8',
                                            transition: 'all 0.2s'
                                          }}
                                        >
                                          <div style={{ fontWeight: 600, color: '#2d3436', fontSize: '15px', marginBottom: 8 }}>
                                            {tenMon}
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {khoiLuong && (
                                              <div style={{ fontSize: '13px', color: '#666' }}>
                                                <span style={{ fontWeight: 500 }}>Khối lượng:</span> {khoiLuong}g
                                              </div>
                                            )}
                                            {calo && (
                                              <div style={{ fontSize: '13px', color: '#ff6b6b', fontWeight: 500 }}>
                                                <span style={{ fontWeight: 600 }}>Calo:</span> {calo} kcal
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                    // Nếu mon là string, hiển thị bình thường
                                    return (
                                      <div 
                                        key={idx} 
                                        style={{ 
                                          marginBottom: 8, 
                                          padding: '12px', 
                                          backgroundColor: '#f8f9fa', 
                                          borderRadius: '8px',
                                          border: '1px solid #e8e8e8'
                                        }}
                                      >
                                        <div style={{ color: '#2d3436', fontSize: '15px' }}>{mon}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                                  Chưa có món ăn cho {bua}
                                </div>
                              )}
                            </Card>
                          </Col>
                          );
                        })}
                      </Row>
                    </Card>
                  )}
                  {(!nutritionProfile.thuc_don || Object.keys(nutritionProfile.thuc_don).length === 0) && (
                    <Card 
                      className="info-card modern-content-card" 
                      style={{ marginTop: 24 }}
                      title={
                        <span className="card-title-with-icon">
                          <AppleOutlined /> Thực đơn dinh dưỡng
                        </span>
                      }
                    >
                      <Empty 
                        description="Chưa có thực đơn dinh dưỡng"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: "40px 0" }}
                        />
                      </Card>
                    )}

                  {/* Nutrition Plan and Notes Section */}
                  <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                  <Col xs={24} lg={12}>
                      <Card title={
                        <span className="card-title-with-icon">
                          <BulbOutlined /> Nhận xét
                        </span>
                      } className="info-card modern-content-card">
                      {nutritionProfile.nhan_xet && nutritionProfile.nhan_xet !== "—" ? (
                          <div className="content-box content-comment">
                          {nutritionProfile.nhan_xet}
                        </div>
                      ) : (
                          <div className="empty-content-box">
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                            Chưa có nhận xét
                          </Text>
                        </div>
                      )}
                    </Card>

        <Card
                        title={
                          <span className="card-title-with-icon">
                            <AppleOutlined /> Kế hoạch dinh dưỡng
                          </span>
                        } 
                        className="info-card modern-content-card nutrition-plan-card" 
                        style={{ marginTop: 24 }}
                      >
                      {nutritionProfile.ke_hoach_dinh_duong && nutritionProfile.ke_hoach_dinh_duong !== "—" ? (
                          <div className="content-box content-plan">
                          {nutritionProfile.ke_hoach_dinh_duong}
                        </div>
                      ) : (
                          <div className="empty-content-box">
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                            Chưa có kế hoạch dinh dưỡng
                          </Text>
                        </div>
                      )}
                    </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                    {nutritionProfile.muc_tieu_dinh_duong && nutritionProfile.muc_tieu_dinh_duong !== "—" && (
                        <Card 
                          title={
                            <span className="card-title-with-icon">
                              <TrophyOutlined /> Mục tiêu dinh dưỡng
                            </span>
                          } 
                          className="info-card modern-content-card" 
                          style={{ marginBottom: 24 }}
                        >
                          <div className="content-box content-goal">
                          {nutritionProfile.muc_tieu_dinh_duong}
                        </div>
                      </Card>
                    )}

                      <Card 
                        title={
                          <span className="card-title-with-icon">
                            <MedicineBoxOutlined /> Chăm sóc
                          </span>
                        } 
                        className="info-card modern-content-card" 
                        style={{ marginBottom: 24 }}
                      >
                      {nutritionProfile.cham_soc && nutritionProfile.cham_soc !== "—" ? (
                          <div className="content-box content-care">
                          {nutritionProfile.cham_soc}
                        </div>
                      ) : (
                          <div className="empty-content-box">
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                            Chưa có thông tin chăm sóc
                          </Text>
                        </div>
                      )}
                    </Card>

                    {nutritionProfile.ghi_chu && nutritionProfile.ghi_chu !== "—" && (
                        <Card 
                          title={
                            <span className="card-title-with-icon">
                              <EditOutlined /> Ghi chú
                            </span>
                          } 
                          className="info-card modern-content-card"
                        >
                          <div className="content-box content-note">
                          {nutritionProfile.ghi_chu}
                        </div>
                      </Card>
                    )}
                  </Col>
                </Row>
                </div>
              ) : (
                <Empty
                  description="Chưa có hồ sơ dinh dưỡng"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            },
            {
              key: "progress",
              label: (
                <span>
                  <RiseOutlined /> Biểu đồ tiến độ
                </span>
              ),
              children: renderProgressChart(),
            },
            {
              key: "history",
              label: (
                <span>
                  <CalendarOutlined /> Lịch sử khám
                </span>
              ),
              children: renderAppointmentHistory(),
            },
          ]}
        />
      </div>

      {/* Modal chi tiết cuộc hẹn */}
      <Modal
        title={
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined /> Chi tiết tư vấn dinh dưỡng
          </Title>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedAppointment(null);
        }}
        footer={null}
        width={1000}
        className="appointment-detail-modal"
      >
        {selectedAppointment && (
          <div className="appointment-detail-content">
            <Row gutter={[24, 24]}>
              {/* Thông tin cuộc hẹn */}
              <Col xs={24}>
                <Card title="Thông tin cuộc hẹn" size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Ngày tư vấn">
                      {formatDateTime(selectedAppointment.ngay_tu_van)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={
                          selectedAppointment.trang_thai_cuoc_hen === "da_hoan_thanh"
                            ? "green"
                            : selectedAppointment.trang_thai_cuoc_hen === "da_huy"
                            ? "red"
                            : "blue"
                        }
                      >
                        {selectedAppointment.trang_thai_cuoc_hen === "da_hoan_thanh"
                          ? "Đã hoàn thành"
                          : selectedAppointment.trang_thai_cuoc_hen === "da_huy"
                          ? "Đã hủy"
                          : "Đã đặt"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại tư vấn">
                      {selectedAppointment.loai_tu_van}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức">
                      {selectedAppointment.phuong_thuc}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Nhận xét */}
              {selectedAppointment.nhan_xet && selectedAppointment.nhan_xet !== "—" && (
                <Col xs={24}>
                  <Card title="Nhận xét" size="small">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {selectedAppointment.nhan_xet}
                    </Paragraph>
                </Card>
                </Col>
              )}

              {/* Kế hoạch dinh dưỡng */}
              {selectedAppointment.ke_hoach_dinh_duong && selectedAppointment.ke_hoach_dinh_duong !== "—" && (
                <Col xs={24}>
                  <Card title="Kế hoạch dinh dưỡng" size="small">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {selectedAppointment.ke_hoach_dinh_duong}
                    </Paragraph>
                  </Card>
                </Col>
              )}

              {/* Chăm sóc */}
              {selectedAppointment.cham_soc && selectedAppointment.cham_soc !== "—" && (
                <Col xs={24}>
                  <Card title="Chăm sóc" size="small">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {selectedAppointment.cham_soc}
                    </Paragraph>
                  </Card>
                </Col>
              )}

              {/* Thực đơn */}
              {selectedAppointment.thuc_don &&
                Object.keys(selectedAppointment.thuc_don).length > 0 && (
                  <Col xs={24}>
                <Card
                      title={
                        <span>
                          <AppleOutlined /> Thực đơn
                        </span>
                      }
                  size="small"
                    >
                      <Row gutter={[16, 16]}>
                        {Object.entries(selectedAppointment.thuc_don).map(([bua, monAn]) => (
                          <Col xs={24} sm={12} key={bua}>
                <Card
                              title={
                                <span style={{ fontWeight: 600, color: '#52c41a', fontSize: '16px' }}>
                                  {formatBuaAn(bua)}
                                </span>
                              }
                  size="small"
                              className="meal-card"
                            >
                              {Array.isArray(monAn) && monAn.length > 0 ? (
                                <div style={{ margin: 0 }}>
                                  {monAn.map((mon, idx) => {
                                    // Nếu mon là object, hiển thị thông tin chi tiết
                                    if (typeof mon === 'object' && mon !== null) {
                                      const tenMon = mon.ten_mon || mon.mon_an || '—';
                                      const khoiLuong = mon.khoi_luong;
                                      const calo = mon.calo;
                                      return (
                                        <div key={idx} style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                          <div style={{ fontWeight: 600, color: '#2d3436', fontSize: '15px', marginBottom: 4 }}>
                                            {tenMon}
                                          </div>
                                          {khoiLuong && (
                                            <div style={{ fontSize: '13px', color: '#666', marginTop: 4 }}>
                                              Khối lượng: <span style={{ fontWeight: 500 }}>{khoiLuong}g</span>
                                            </div>
                                          )}
                                          {calo && (
                                            <div style={{ fontSize: '13px', color: '#ff6b6b', marginTop: 4, fontWeight: 500 }}>
                                              Calo: {calo} kcal
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                    // Nếu mon là string, hiển thị bình thường
                                    return (
                                      <div key={idx} style={{ marginBottom: 8, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        <div style={{ color: '#2d3436' }}>{mon}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                                  Chưa có món ăn cho {bua}
                                </div>
                              )}
                </Card>
                          </Col>
                        ))}
                      </Row>
                </Card>
              </Col>
                )}

              {/* Hóa đơn */}
              {selectedAppointment.hoa_don && (
                <Col xs={24}>
            <Card
              title={
                      <span>
                        <ShoppingCartOutlined /> Hóa đơn
                      </span>
                    }
                    size="small"
                    extra={
                      selectedAppointment.hoa_don.trang_thai === "da_thanh_toan" ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Đã thanh toán
                        </Tag>
                      ) : (
                        <Tag color="warning" icon={<ClockCircleOutlined />}>
                          Chưa thanh toán
                        </Tag>
                      )
                    }
                  >
                    <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
                      <Descriptions.Item label="Mã hóa đơn">
                        {selectedAppointment.hoa_don.id_hoa_don}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">
                        {formatDateTime(selectedAppointment.hoa_don.thoi_gian_tao)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng tiền">
                        <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
                          {parseFloat(selectedAppointment.hoa_don.tong_tien || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>

                    {selectedAppointment.chi_tiet_hoa_don &&
                      selectedAppointment.chi_tiet_hoa_don.length > 0 && (
                        <>
                          <Divider>Chi tiết dịch vụ</Divider>
                          <Table
                            size="small"
                            pagination={false}
                            dataSource={selectedAppointment.chi_tiet_hoa_don.map((ct, idx) => ({
                              key: idx,
                              stt: idx + 1,
                              ten_dich_vu:
                                ct.dich_vu?.ten_dich_vu || ct.ten_dich_vu || "—",
                              so_luong: ct.so_luong || 0,
                              don_gia: parseFloat(ct.don_gia || 0).toLocaleString("vi-VN"),
                              thanh_tien: (
                                parseFloat(ct.so_luong || 0) * parseFloat(ct.don_gia || 0)
                              ).toLocaleString("vi-VN"),
                            }))}
                            columns={[
                              { title: "STT", dataIndex: "stt", width: 60 },
                              { title: "Tên dịch vụ", dataIndex: "ten_dich_vu" },
                              {
                                title: "Số lượng",
                                dataIndex: "so_luong",
                                width: 100,
                                align: "center",
                              },
                              {
                                title: "Đơn giá (VNĐ)",
                                dataIndex: "don_gia",
                                width: 120,
                                align: "right",
                              },
                              {
                                title: "Thành tiền (VNĐ)",
                                dataIndex: "thanh_tien",
                                width: 140,
                                align: "right",
                              },
                            ]}
                          />
                        </>
                      )}
                  </Card>
                </Col>
              )}

              {/* Tiến độ theo dõi */}
              {selectedAppointment.tien_do && selectedAppointment.tien_do.length > 0 && (
                <Col xs={24}>
                      <Card
                    title={
                      <span>
                        <TrophyOutlined /> Tiến độ theo dõi
                      </span>
                    }
                        size="small"
                  >
                    <Timeline>
                      {selectedAppointment.tien_do.map((td, idx) => (
                        <Timeline.Item key={idx} color="green">
                          <div style={{ paddingBottom: 8 }}>
                            <Text strong style={{ fontSize: 15 }}>{formatDate(td.ngay_kham)}</Text>
                            {(td.can_nang || td.chieu_cao || td.vong_eo || td.mo_co_the || td.khoi_co || td.nuoc_trong_co_the || td.chi_so_BMI) && (
                              <div style={{ marginTop: 8, lineHeight: 1.8 }}>
                                {td.can_nang && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Cân nặng:</Text> {td.can_nang} kg
                                  </Text>
                                )}
                                {td.chieu_cao && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Chiều cao:</Text> {td.chieu_cao} cm
                                  </Text>
                                )}
                                {td.chi_so_BMI && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>BMI:</Text> {td.chi_so_BMI}
                                  </Text>
                                )}
                                {td.vong_eo && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Vòng eo:</Text> {td.vong_eo} cm
                                  </Text>
                                )}
                                {td.mo_co_the && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Mỡ cơ thể:</Text> {td.mo_co_the}%
                                  </Text>
                                )}
                                {td.khoi_co && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Khối cơ:</Text> {td.khoi_co} kg
                                  </Text>
                                )}
                                {td.nuoc_trong_co_the && (
                                  <Text style={{ display: 'block' }}>
                                    <Text strong>Nước trong cơ thể:</Text> {td.nuoc_trong_co_the}%
                                  </Text>
                                )}
                              </div>
                            )}
                            {td.ghi_chu && (
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                  {td.ghi_chu}
                                </Text>
                              </div>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                      </Card>
                    </Col>
              )}
            </Row>
        </div>
      )}
      </Modal>
    </div>
  );
};

export default NutritionRecords;
