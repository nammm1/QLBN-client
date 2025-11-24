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
  Input,
  Form,
  InputNumber,
  Select,
  message,
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
  CalculatorOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  AlertOutlined,
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
import apiCalorieCalculator from "../../../api/CalorieCalculator";

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

// Format mục tiêu dinh dưỡng
const formatMucTieuDinhDuong = (mucTieu) => {
  if (!mucTieu || mucTieu === "—") return "—";
  
  const mucTieuMap = {
    'giam_can': 'Giảm cân',
    'tang_can': 'Tăng cân',
    'duy_tri_can_nang': 'Duy trì cân nặng',
    'tang_co': 'Tăng cơ',
    'giam_mo': 'Giảm mỡ',
    'tang_suc_khoe': 'Tăng sức khỏe',
    'cai_thien_dinh_duong': 'Cải thiện dinh dưỡng',
  };
  
  const mucTieuLower = mucTieu.toLowerCase().trim();
  return mucTieuMap[mucTieuLower] || mucTieu.charAt(0).toUpperCase() + mucTieu.slice(1).toLowerCase().replace(/_/g, ' ');
};

const invalidMealReasonMap = {
  ten_mon_khong_hop_le: "Tên món ăn không hợp lệ hoặc bị bỏ trống.",
  khong_co_so_luong_hop_le: "Chưa nhập lượng tiêu thụ cho món ăn này.",
};

const getInvalidMealReason = (reason) => {
  if (!reason) return "Món ăn không hợp lệ.";
  return invalidMealReasonMap[reason] || "Món ăn bị bỏ qua do thông tin không hợp lệ.";
};

const aiHighlightRules = [
  { key: "high_calo", label: "Năng lượng cao", color: "volcano", pattern: /(calo|calorie|năng lượng|tăng cân)/i },
  { key: "carb_focus", label: "Nhiều tinh bột", color: "orange", pattern: /(tinh bột|cơm|xôi|ngũ cốc)/i },
  { key: "lack_greens", label: "Thiếu rau quả", color: "green", pattern: /(rau xanh|trái cây|rau củ)/i },
  { key: "sugar_high", label: "Đường cao", color: "magenta", pattern: /(đường|trà sữa|đồ uống có đường)/i },
  { key: "fat_high", label: "Chất béo cao", color: "red", pattern: /(chất béo|chiên xào|mỡ|béo bão hòa)/i },
];

const warningToneRules = [
  { key: "blood_sugar", label: "Đường huyết", color: "magenta", level: "high", pattern: /(đường huyết|tiểu đường|đường)/i },
  { key: "heart", label: "Tim mạch", color: "volcano", level: "high", pattern: /(tim mạch|cholesterol)/i },
  { key: "weight", label: "Kiểm soát cân nặng", color: "orange", level: "medium", pattern: /(tăng cân|béo phì|thừa cân)/i },
  { key: "micronutrients", label: "Thiếu vi chất", color: "geekblue", level: "info", pattern: /(vitamin|khoáng chất|thiếu hụt|thiếu)/i },
];

const extractAIHighlights = (textList = []) => {
  const combined = textList.filter(Boolean).join(" ").toLowerCase();
  if (!combined) return [];

  const matched = aiHighlightRules.filter((rule) => rule.pattern.test(combined));
  if (matched.length > 0) return matched;

  return [{ key: "balance", label: "Cần cân bằng khẩu phần", color: "geekblue" }];
};

const splitTextIntoParagraphs = (text) => {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const splitTextIntoBullets = (text) => {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const getWarningTone = (warning = "") => {
  const normalized = warning.toLowerCase();
  const matched = warningToneRules.find((rule) => rule.pattern.test(normalized));
  return matched || { key: "general", label: "Cảnh báo chung", color: "gold", level: "medium" };
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
  const [calorieForm] = Form.useForm();
  // Cấu trúc mới: theo buổi, mỗi buổi có danh sách món
  const [calorieMealsByMeal, setCalorieMealsByMeal] = useState({
    sang: [],
    trua: [],
    chieu: [],
    toi: []
  });
  const [calorieResult, setCalorieResult] = useState(null);
  const [calorieLoading, setCalorieLoading] = useState(false);
  const [isCalorieStarted, setIsCalorieStarted] = useState(false);
  
  const aiInsights = calorieResult?.goi_y_ai;
  const aiHighlightTags = aiInsights
    ? extractAIHighlights([
        aiInsights.tong_quan_suc_khoe,
        aiInsights.phan_tich_nguon_an,
        Array.isArray(aiInsights.de_xuat_che_do_an) ? aiInsights.de_xuat_che_do_an.join(" ") : "",
        Array.isArray(aiInsights.canh_bao) ? aiInsights.canh_bao.join(" ") : "",
      ])
    : [];
  const aiOverviewParagraphs = splitTextIntoParagraphs(aiInsights?.tong_quan_suc_khoe);
  const aiDietAnalysisItems = splitTextIntoBullets(aiInsights?.phan_tich_nguon_an);
  const aiSuggestionItems = Array.isArray(aiInsights?.de_xuat_che_do_an) ? aiInsights.de_xuat_che_do_an : [];
  const aiWarnings = Array.isArray(aiInsights?.canh_bao) ? aiInsights.canh_bao : [];
  
  // Đơn vị có sẵn
  const unitOptions = [
    { value: "gram", label: "Gram (g)" },
    { value: "bat", label: "Bát" },
    { value: "dia", label: "Đĩa" },
    { value: "ly", label: "Ly" },
    { value: "coc", label: "Cốc" },
    { value: "mieng", label: "Miếng" },
    { value: "phan", label: "Phần" },
    { value: "cai", label: "Cái" },
    { value: "qua", label: "Quả" },
    { value: "lon", label: "Lon" },
    { value: "chai", label: "Chai" },
  ];
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

        // 1. Load hồ sơ dinh dưỡng (lấy cái mới nhất) - ƯU TIÊN LẤY THÔNG TIN TỪ ĐÂY
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
        
        // Sắp xếp theo ngày tạo để lấy hồ sơ mới nhất
        if (hoSoList.length > 0) {
          hoSoList.sort((a, b) => {
            const dateA = new Date(a.ngay_tao || 0);
            const dateB = new Date(b.ngay_tao || 0);
            return dateB - dateA;
          });
        }
        
        // Ưu tiên lấy thông tin cá nhân từ hồ sơ dinh dưỡng mới nhất
        let personalInfoData = null;
        if (hoSoList.length > 0) {
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
        
        // 2. Nếu không có hồ sơ dinh dưỡng, fallback sang thông tin bệnh nhân
        if (!personalInfoData) {
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
          const latestHoSo = hoSoList[0]; // Lấy hồ sơ mới nhất (đã sắp xếp ở trên)
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

          // Lấy mục tiêu dinh dưỡng (giữ nguyên để format sau)
          let formattedMucTieu = latestLichSu?.muc_tieu_dinh_duong || latestHoSo.muc_tieu_dinh_duong || "—";
          if (formattedMucTieu && formattedMucTieu !== "—") {
            try {
              // Thử parse JSON nếu là string JSON
              const parsed = typeof formattedMucTieu === 'string' ? JSON.parse(formattedMucTieu) : formattedMucTieu;
              if (typeof parsed === 'object' && parsed !== null) {
                // Nếu là object, lấy giá trị đầu tiên hoặc giá trị mục tiêu
                formattedMucTieu = parsed.muc_tieu || parsed.goal || Object.values(parsed)[0] || formattedMucTieu;
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

          // Lấy mục tiêu dinh dưỡng (giữ nguyên để format sau)
          let formattedMucTieu = latestLichSu.muc_tieu_dinh_duong || "—";
          if (formattedMucTieu && formattedMucTieu !== "—") {
            try {
              // Thử parse JSON nếu là string JSON
              const parsed = typeof formattedMucTieu === 'string' ? JSON.parse(formattedMucTieu) : formattedMucTieu;
              if (typeof parsed === 'object' && parsed !== null) {
                // Nếu là object, lấy giá trị đầu tiên hoặc giá trị mục tiêu
                formattedMucTieu = parsed.muc_tieu || parsed.goal || Object.values(parsed)[0] || formattedMucTieu;
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
  // Xử lý tính calories - cấu trúc mới theo buổi
  const handleAddMealToMeal = (mealType) => {
    const newId = Date.now() + Math.random();
    setCalorieMealsByMeal({
      ...calorieMealsByMeal,
      [mealType]: [
        ...calorieMealsByMeal[mealType],
        { id: newId, name: "", amount: "", unit: "gram" }
      ]
    });
  };

  const handleRemoveMealFromMeal = (mealType, id) => {
    setCalorieMealsByMeal({
      ...calorieMealsByMeal,
      [mealType]: calorieMealsByMeal[mealType].filter(meal => meal.id !== id)
    });
  };

  const handleMealChange = (mealType, id, field, value) => {
    setCalorieMealsByMeal({
      ...calorieMealsByMeal,
      [mealType]: calorieMealsByMeal[mealType].map(meal =>
        meal.id === id ? { ...meal, [field]: value } : meal
      )
    });
  };

  const handleCalculateCalories = async () => {
    // Validate form
    const allMeals = [
      ...calorieMealsByMeal.sang,
      ...calorieMealsByMeal.trua,
      ...calorieMealsByMeal.chieu,
      ...calorieMealsByMeal.toi
    ];

    if (allMeals.length === 0) {
      message.error("Vui lòng thêm ít nhất một món ăn");
      return;
    }

    const hasEmptyMeal = allMeals.some(meal => !meal.name.trim());
    if (hasEmptyMeal) {
      message.error("Vui lòng nhập tên món ăn cho tất cả các món");
      return;
    }

    const hasEmptyAmount = allMeals.some(meal => !meal.amount || meal.amount <= 0);
    if (hasEmptyAmount) {
      message.error("Vui lòng nhập lượng tiêu thụ cho tất cả các món");
      return;
    }

    try {
      setCalorieLoading(true);
      setCalorieResult(null);

      // Format data để gửi lên server - chuyển từ cấu trúc theo buổi sang cấu trúc theo món
      const mealsMap = {};
      
      // Tổng hợp món ăn từ các buổi
      ["sang", "trua", "chieu", "toi"].forEach(mealType => {
        calorieMealsByMeal[mealType].forEach(meal => {
          const key = meal.name.trim();
          if (!mealsMap[key]) {
            mealsMap[key] = {
              ten_mon: key,
              sang: { amount: 0, unit: "gram" },
              trua: { amount: 0, unit: "gram" },
              chieu: { amount: 0, unit: "gram" },
              toi: { amount: 0, unit: "gram" }
            };
          }
          mealsMap[key][mealType] = {
            amount: parseFloat(meal.amount),
            unit: meal.unit
          };
        });
      });

      // Chuyển sang format array
      const mealsData = Object.values(mealsMap).map(meal => ({
        ten_mon: meal.ten_mon,
        sang: meal.sang.amount,
        sang_unit: meal.sang.unit,
        trua: meal.trua.amount,
        trua_unit: meal.trua.unit,
        chieu: meal.chieu.amount,
        chieu_unit: meal.chieu.unit,
        toi: meal.toi.amount,
        toi_unit: meal.toi.unit,
      }));

      const response = await apiCalorieCalculator.calculate({
        meals: mealsData
      });

      setCalorieResult(response);
      message.success("Tính calories thành công!");
    } catch (error) {
      console.error("Error calculating calories:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi tính calories");
    } finally {
      setCalorieLoading(false);
    }
  };

  const handleResetCalories = () => {
    setCalorieMealsByMeal({
      sang: [],
      trua: [],
      chieu: [],
      toi: []
    });
    setCalorieResult(null);
    setIsCalorieStarted(false);
    calorieForm.resetFields();
  };

  const handleStartCalorie = () => {
    setIsCalorieStarted(true);
    message.success("Bắt đầu tính calories! Hãy thêm các món ăn của bạn.");
  };

  // Render tính calories
  const renderCalorieCalculator = () => {
    return (
      <div className="calorie-calculator-container">
        <Card 
          title={
            <span>
              <CalculatorOutlined /> Tính calories
            </span>
          }
          className="calorie-calculator-card"
        >
          <div className="calorie-feature-banner">
            <div className="calorie-banner-content">
              <div className="calorie-banner-icon">
                <FireOutlined />
              </div>
              <div className="calorie-banner-text">
                <Title level={4} style={{ margin: 0, color: "#fff" }}>
                  <ThunderboltOutlined style={{ marginRight: 8 }} />
                  Tính Calories Thông Minh với AI
                </Title>
                <Paragraph style={{ margin: "8px 0 0 0", color: "#fff", fontSize: "15px" }}>
                  Theo dõi lượng calo tiêu thụ hàng ngày một cách chính xác và dễ dàng. 
                  Chỉ cần nhập món ăn và lượng tiêu thụ, AI sẽ tự động tính toán calories cho bạn!
                </Paragraph>
                <div className="calorie-banner-features">
                  <Tag color="rgba(255,255,255,0.3)" style={{ marginTop: 12, color: "#fff", border: "1px solid rgba(255,255,255,0.5)" }}>
                    <CheckCircleOutlined /> Tính toán chính xác
                  </Tag>
                  <Tag color="rgba(255,255,255,0.3)" style={{ marginTop: 12, color: "#fff", border: "1px solid rgba(255,255,255,0.5)" }}>
                    <CheckCircleOutlined /> Hỗ trợ đa dạng đơn vị
                  </Tag>
                  <Tag color="rgba(255,255,255,0.3)" style={{ marginTop: 12, color: "#fff", border: "1px solid rgba(255,255,255,0.5)" }}>
                    <CheckCircleOutlined /> Báo cáo chi tiết
                  </Tag>
                </div>
              </div>
            </div>
            <div className="calorie-banner-guide">
              <Text type="secondary" style={{ fontSize: "13px" }}>
                <BulbOutlined style={{ marginRight: 4 }} />
                <strong>Hướng dẫn:</strong> Chọn buổi ăn → Thêm món ăn với tên, lượng và đơn vị → Nhấn "Tính calories"
              </Text>
            </div>
          </div>

          <Form form={calorieForm} layout="vertical">
            {!isCalorieStarted ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <FireOutlined style={{ fontSize: "64px", color: "#1890ff", marginBottom: "24px" }} />
                <Title level={3} style={{ marginBottom: "16px" }}>
                  Sẵn sàng tính calories?
                </Title>
                <Paragraph style={{ marginBottom: "32px", fontSize: "16px", color: "#666" }}>
                  Nhấn nút "Bắt đầu" để bắt đầu thêm các món ăn và tính toán lượng calories tiêu thụ trong ngày.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={handleStartCalorie}
                  style={{
                    height: "50px",
                    fontSize: "18px",
                    padding: "0 40px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                  }}
                >
                  Bắt đầu
                </Button>
              </div>
            ) : (
              <>
            {/* Bữa sáng */}
            <Card
              title={
                <span>
                  <AppleOutlined style={{ color: "#ff9800" }} /> Bữa sáng
                </span>
              }
              style={{ marginBottom: 16 }}
              extra={
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddMealToMeal("sang")}
                  size="small"
                  disabled={!isCalorieStarted}
                >
                  Thêm món
                </Button>
              }
            >
              {calorieMealsByMeal.sang.length === 0 ? (
                <Empty
                  description="Chưa có món ăn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              ) : (
                calorieMealsByMeal.sang.map((meal, index) => (
                  <Card
                    key={meal.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMealFromMeal("sang", meal.id)}
                        size="small"
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={10}>
                        <Form.Item label="Tên món ăn" required>
                          <Input
                            placeholder="Ví dụ: Cơm trắng, Phở..."
                            value={meal.name}
                            onChange={(e) => handleMealChange("sang", meal.id, "name", e.target.value)}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Item label="Lượng" required>
                          <InputNumber
                            placeholder="0"
                            min={0}
                            style={{ width: "100%" }}
                            value={meal.amount}
                            onChange={(value) => handleMealChange("sang", meal.id, "amount", value || "")}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={8}>
                        <Form.Item label="Đơn vị" required>
                          <Select
                            value={meal.unit}
                            onChange={(value) => handleMealChange("sang", meal.id, "unit", value)}
                            style={{ width: "100%" }}
                            options={unitOptions}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </Card>

            {/* Bữa trưa */}
            <Card
              title={
                <span>
                  <AppleOutlined style={{ color: "#4caf50" }} /> Bữa trưa
                </span>
              }
              style={{ marginBottom: 16 }}
              extra={
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddMealToMeal("trua")}
                  size="small"
                  disabled={!isCalorieStarted}
                >
                  Thêm món
                </Button>
              }
            >
              {calorieMealsByMeal.trua.length === 0 ? (
                <Empty
                  description="Chưa có món ăn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              ) : (
                calorieMealsByMeal.trua.map((meal, index) => (
                  <Card
                    key={meal.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMealFromMeal("trua", meal.id)}
                        size="small"
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={10}>
                        <Form.Item label="Tên món ăn" required>
                          <Input
                            placeholder="Ví dụ: Cơm trắng, Thịt gà..."
                            value={meal.name}
                            onChange={(e) => handleMealChange("trua", meal.id, "name", e.target.value)}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Item label="Lượng" required>
                          <InputNumber
                            placeholder="0"
                            min={0}
                            style={{ width: "100%" }}
                            value={meal.amount}
                            onChange={(value) => handleMealChange("trua", meal.id, "amount", value || "")}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={8}>
                        <Form.Item label="Đơn vị" required>
                          <Select
                            value={meal.unit}
                            onChange={(value) => handleMealChange("trua", meal.id, "unit", value)}
                            style={{ width: "100%" }}
                            options={unitOptions}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </Card>

            {/* Bữa chiều */}
            <Card
              title={
                <span>
                  <AppleOutlined style={{ color: "#2196f3" }} /> Bữa chiều
                </span>
              }
              style={{ marginBottom: 16 }}
              extra={
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddMealToMeal("chieu")}
                  size="small"
                  disabled={!isCalorieStarted}
                >
                  Thêm món
                </Button>
              }
            >
              {calorieMealsByMeal.chieu.length === 0 ? (
                <Empty
                  description="Chưa có món ăn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              ) : (
                calorieMealsByMeal.chieu.map((meal, index) => (
                  <Card
                    key={meal.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMealFromMeal("chieu", meal.id)}
                        size="small"
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={10}>
                        <Form.Item label="Tên món ăn" required>
                          <Input
                            placeholder="Ví dụ: Bánh mì, Sữa chua..."
                            value={meal.name}
                            onChange={(e) => handleMealChange("chieu", meal.id, "name", e.target.value)}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Item label="Lượng" required>
                          <InputNumber
                            placeholder="0"
                            min={0}
                            style={{ width: "100%" }}
                            value={meal.amount}
                            onChange={(value) => handleMealChange("chieu", meal.id, "amount", value || "")}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={8}>
                        <Form.Item label="Đơn vị" required>
                          <Select
                            value={meal.unit}
                            onChange={(value) => handleMealChange("chieu", meal.id, "unit", value)}
                            style={{ width: "100%" }}
                            options={unitOptions}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </Card>

            {/* Bữa tối */}
            <Card
              title={
                <span>
                  <AppleOutlined style={{ color: "#9c27b0" }} /> Bữa tối
                </span>
              }
              style={{ marginBottom: 24 }}
              extra={
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddMealToMeal("toi")}
                  size="small"
                  disabled={!isCalorieStarted}
                >
                  Thêm món
                </Button>
              }
            >
              {calorieMealsByMeal.toi.length === 0 ? (
                <Empty
                  description="Chưa có món ăn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              ) : (
                calorieMealsByMeal.toi.map((meal, index) => (
                  <Card
                    key={meal.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMealFromMeal("toi", meal.id)}
                        size="small"
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={10}>
                        <Form.Item label="Tên món ăn" required>
                          <Input
                            placeholder="Ví dụ: Cơm trắng, Canh chua..."
                            value={meal.name}
                            onChange={(e) => handleMealChange("toi", meal.id, "name", e.target.value)}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Item label="Lượng" required>
                          <InputNumber
                            placeholder="0"
                            min={0}
                            style={{ width: "100%" }}
                            value={meal.amount}
                            onChange={(value) => handleMealChange("toi", meal.id, "amount", value || "")}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={8}>
                        <Form.Item label="Đơn vị" required>
                          <Select
                            value={meal.unit}
                            onChange={(value) => handleMealChange("toi", meal.id, "unit", value)}
                            style={{ width: "100%" }}
                            options={unitOptions}
                            disabled={!isCalorieStarted}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </Card>

            <Space>
              <Button
                type="primary"
                icon={<CalculatorOutlined />}
                onClick={handleCalculateCalories}
                loading={calorieLoading}
                size="large"
                disabled={!isCalorieStarted}
              >
                Tính calories
              </Button>
              <Button 
                onClick={handleResetCalories}
                disabled={!isCalorieStarted}
              >
                Đặt lại
              </Button>
            </Space>
              </>
            )}
          </Form>
        </Card>

        {calorieResult && (
          <Card
            title={
              <span>
                <FireOutlined /> Kết quả tính calories
              </span>
            }
            className="calorie-result-card"
            style={{ marginTop: 24 }}
          >
            <Row gutter={[24, 24]}>
              {/* Tổng calories cả ngày */}
              <Col xs={24}>
                <Card
                  type="inner"
                  style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}
                >
                  <Statistic
                    title={<span style={{ color: "white" }}>Tổng calories cả ngày</span>}
                    value={calorieResult.tong_calo_ngay || 0}
                    suffix="kcal"
                    valueStyle={{ color: "white", fontSize: "32px", fontWeight: "bold" }}
                  />
                </Card>
              </Col>

              {/* Calories theo buổi */}
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" style={{ background: "#fff7e6" }}>
                  <Statistic
                    title="Bữa sáng"
                    value={calorieResult.calo_sang || 0}
                    suffix="kcal"
                    prefix={<FireOutlined style={{ color: "#faad14" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" style={{ background: "#e6f7ff" }}>
                  <Statistic
                    title="Bữa trưa"
                    value={calorieResult.calo_trua || 0}
                    suffix="kcal"
                    prefix={<FireOutlined style={{ color: "#1890ff" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" style={{ background: "#f6ffed" }}>
                  <Statistic
                    title="Bữa chiều"
                    value={calorieResult.calo_chieu || 0}
                    suffix="kcal"
                    prefix={<FireOutlined style={{ color: "#52c41a" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" style={{ background: "#fff1f0" }}>
                  <Statistic
                    title="Bữa tối"
                    value={calorieResult.calo_toi || 0}
                    suffix="kcal"
                    prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
                  />
                </Card>
              </Col>

              {/* Chi tiết từng món */}
              {calorieResult.chi_tiet_mon && calorieResult.chi_tiet_mon.length > 0 && (
                <Col xs={24}>
                  <Divider orientation="left">Chi tiết calories theo món</Divider>
                  <Table
                    dataSource={calorieResult.chi_tiet_mon}
                    rowKey={(record, index) => index}
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Tên món",
                        dataIndex: "ten_mon",
                        key: "ten_mon",
                        width: "20%",
                      },
                      {
                        title: "Lượng tiêu thụ",
                        key: "luong_tieu_thu",
                        align: "center",
                        children: [
                          {
                            title: "Sáng",
                            dataIndex: "luong_sang",
                            key: "luong_sang",
                            align: "center",
                            width: "15%",
                            render: (value) => value || '-',
                          },
                          {
                            title: "Trưa",
                            dataIndex: "luong_trua",
                            key: "luong_trua",
                            align: "center",
                            width: "15%",
                            render: (value) => value || '-',
                          },
                          {
                            title: "Chiều",
                            dataIndex: "luong_chieu",
                            key: "luong_chieu",
                            align: "center",
                            width: "15%",
                            render: (value) => value || '-',
                          },
                          {
                            title: "Tối",
                            dataIndex: "luong_toi",
                            key: "luong_toi",
                            align: "center",
                            width: "15%",
                            render: (value) => value || '-',
                          },
                        ],
                      },
                      {
                        title: "Calories",
                        key: "calories",
                        align: "center",
                        children: [
                          {
                            title: "Sáng (kcal)",
                            dataIndex: "calo_sang",
                            key: "calo_sang",
                            align: "center",
                            width: "10%",
                            render: (value) => value || 0,
                          },
                          {
                            title: "Trưa (kcal)",
                            dataIndex: "calo_trua",
                            key: "calo_trua",
                            align: "center",
                            width: "10%",
                            render: (value) => value || 0,
                          },
                          {
                            title: "Chiều (kcal)",
                            dataIndex: "calo_chieu",
                            key: "calo_chieu",
                            align: "center",
                            width: "10%",
                            render: (value) => value || 0,
                          },
                          {
                            title: "Tối (kcal)",
                            dataIndex: "calo_toi",
                            key: "calo_toi",
                            align: "center",
                            width: "10%",
                            render: (value) => value || 0,
                          },
                        ],
                      },
                      {
                        title: "Tổng (kcal)",
                        key: "tong",
                        align: "center",
                        width: "10%",
                        render: (_, record) => {
                          const total = (record.calo_sang || 0) + 
                                       (record.calo_trua || 0) + 
                                       (record.calo_chieu || 0) + 
                                       (record.calo_toi || 0);
                          return <Text strong>{total}</Text>;
                        },
                      },
                    ]}
                  />
                </Col>
              )}

              {calorieResult.invalid_meals && calorieResult.invalid_meals.length > 0 && (
                <Col xs={24}>
                  <Alert
                    type="warning"
                    showIcon
                    className="invalid-meals-alert"
                    message="Một số món ăn đã bị bỏ qua khi tính toán"
                    description={
                      <div className="invalid-meals-list">
                        {calorieResult.invalid_meals.map((meal, idx) => (
                          <div key={`${meal.index || idx}-${meal.ten_mon || idx}`} className="invalid-meal-item">
                            <Tag color="volcano" className="invalid-meal-tag">
                              {meal.ten_mon || `Món #${(meal.index ?? idx) + 1}`}
                            </Tag>
                            <Text type="secondary">{getInvalidMealReason(meal.reason)}</Text>
                          </div>
                        ))}
                      </div>
                    }
                  />
                </Col>
              )}

              {aiInsights && (
                <>
                  <Col xs={24}>
                    <div className="section-heading ai-section-heading">
                      <div className="section-heading-icon">
                        <RobotOutlined />
                      </div>
                      <div className="section-heading-info">
                        <Text className="section-heading-title">Gợi ý chăm sóc từ AI</Text>
                        <Text className="section-heading-desc">
                          Phân tích khẩu phần & cảnh báo sức khỏe cá nhân hóa
                        </Text>
                      </div>
                      {aiHighlightTags.length > 0 && (
                        <div className="ai-highlight-tags">
                          {aiHighlightTags.map((tag) => (
                            <Tag key={tag.key} color={tag.color} bordered={false}>
                              {tag.label}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card
                      type="inner"
                      className="ai-insight-card"
                      title={
                        <span className="card-title-with-icon">
                          <BulbOutlined /> Tổng quan & Phân tích
                        </span>
                      }
                    >
                      <Space direction="vertical" size="large">
                        {aiOverviewParagraphs.length > 0 ? (
                          aiOverviewParagraphs.map((paragraph, index) => (
                            <Paragraph key={index} className="ai-paragraph ai-paragraph-block">
                              <span className="ai-paragraph-index">{index + 1}</span>
                              <span>{paragraph}</span>
                            </Paragraph>
                          ))
                        ) : (
                          <Text type="secondary">Chưa có tổng quan sức khỏe.</Text>
                        )}

                        {aiDietAnalysisItems.length > 0 && (
                          <div className="ai-analysis-panel">
                            <div className="ai-analysis-header">
                              <InfoCircleOutlined />
                              <Text strong>Phân tích khẩu phần</Text>
                            </div>
                            <ul className="ai-analysis-list">
                              {aiDietAnalysisItems.map((item, idx) => (
                                <li key={idx}>
                                  <span className="ai-analysis-bullet" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Space>
                    </Card>
                  </Col>

                  {aiSuggestionItems.length > 0 && (
                      <Col xs={24} md={12}>
                        <Card
                          type="inner"
                          className="ai-suggestion-card"
                          title={
                            <span className="card-title-with-icon">
                              <FireOutlined /> Đề xuất chế độ ăn
                            </span>
                          }
                        >
                          <ul className="ai-suggestion-list">
                            {aiSuggestionItems.map((suggestion, index) => (
                              <li key={index} className="ai-suggestion-item">
                                <span className="ai-step-index">{index + 1}</span>
                                <div>
                                  <Text className="ai-suggestion-title">Mẹo {index + 1}</Text>
                                  <Paragraph className="ai-suggestion-text">{suggestion}</Paragraph>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      </Col>
                    )}

                  {aiWarnings.length > 0 && (
                      <Col xs={24}>
                        <Card
                          type="inner"
                          className="ai-warning-card"
                          title={
                            <span className="card-title-with-icon">
                              <ExclamationCircleOutlined /> Cảnh báo sức khỏe
                            </span>
                          }
                        >
                          <div className="ai-warning-timeline">
                            {aiWarnings.map((warning, index) => {
                              const tone = getWarningTone(warning);
                              return (
                                <div key={index} className="ai-warning-item">
                                  <div className={`ai-warning-dot ai-warning-dot--${tone.level}`} />
                                  <div className="ai-warning-content">
                                    <div className="ai-warning-header">
                                      <Tag color={tone.color} bordered={false}>
                                        {tone.label}
                                      </Tag>
                                      <Text type="secondary">Cảnh báo #{index + 1}</Text>
                                    </div>
                                    <Paragraph className="ai-warning-text">
                                      <AlertOutlined className="ai-warning-text-icon" />
                                      {warning}
                                    </Paragraph>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </Col>
                    )}
                </>
              )}

              {calorieResult.patient_context && (
                <>
                  <Col xs={24}>
                    <Divider orientation="left">Hồ sơ sức khỏe tham chiếu</Divider>
                  </Col>
                  {calorieResult.patient_context.ho_so && (
                    <Col xs={24} lg={12}>
                      <Card
                        type="inner"
                        className="patient-context-card"
                        title={
                          <span className="card-title-with-icon">
                            <UserOutlined /> Hồ sơ gần nhất
                          </span>
                        }
                      >
                        <Descriptions column={1} size="small">
                          {calorieResult.patient_context.ho_so.ho_ten && (
                            <Descriptions.Item label="Họ tên">
                              {calorieResult.patient_context.ho_so.ho_ten}
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.ho_so.gioi_tinh && (
                            <Descriptions.Item label="Giới tính">
                              {calorieResult.patient_context.ho_so.gioi_tinh}
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.ho_so.tuoi && (
                            <Descriptions.Item label="Tuổi">
                              {calorieResult.patient_context.ho_so.tuoi}
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.ho_so.chieu_cao && (
                            <Descriptions.Item label="Chiều cao">
                              {calorieResult.patient_context.ho_so.chieu_cao} cm
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.ho_so.can_nang && (
                            <Descriptions.Item label="Cân nặng">
                              {calorieResult.patient_context.ho_so.can_nang} kg
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.ho_so.vong_eo && (
                            <Descriptions.Item label="Vòng eo">
                              {calorieResult.patient_context.ho_so.vong_eo} cm
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.ho_so.mo_co_the && (
                            <Descriptions.Item label="Mỡ cơ thể">
                              {calorieResult.patient_context.ho_so.mo_co_the} %
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </Card>
                    </Col>
                  )}

                  {calorieResult.patient_context.tu_van_gan_nhat && (
                    <Col xs={24} lg={12}>
                      <Card
                        type="inner"
                        className="patient-context-card"
                        title={
                          <span className="card-title-with-icon">
                            <MedicineBoxOutlined /> Tư vấn gần nhất
                          </span>
                        }
                      >
                        <Descriptions column={1} size="small">
                          {calorieResult.patient_context.tu_van_gan_nhat.thoi_gian_tu_van && (
                            <Descriptions.Item label="Thời gian tư vấn">
                              {formatDateTime(calorieResult.patient_context.tu_van_gan_nhat.thoi_gian_tu_van)}
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.tu_van_gan_nhat.ke_hoach_dinh_duong && (
                            <Descriptions.Item label="Kế hoạch dinh dưỡng">
                              {calorieResult.patient_context.tu_van_gan_nhat.ke_hoach_dinh_duong}
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.tu_van_gan_nhat.nhu_cau_calo && (
                            <Descriptions.Item label="Nhu cầu calo">
                              {calorieResult.patient_context.tu_van_gan_nhat.nhu_cau_calo} kcal
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.tu_van_gan_nhat.muc_tieu_dinh_duong && (
                            <Descriptions.Item label="Mục tiêu">
                              {formatMucTieuDinhDuong(calorieResult.patient_context.tu_van_gan_nhat.muc_tieu_dinh_duong)}
                            </Descriptions.Item>
                          )}
                          {calorieResult.patient_context.tu_van_gan_nhat.di_ung_thuc_pham && (
                            <Descriptions.Item label="Dị ứng thực phẩm">
                              {calorieResult.patient_context.tu_van_gan_nhat.di_ung_thuc_pham}
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </Card>
                    </Col>
                  )}
                </>
              )}
            </Row>
          </Card>
        )}
      </div>
    );
  };

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
                            <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                              {formatMucTieuDinhDuong(nutritionProfile.muc_tieu_dinh_duong)}
                            </Text>
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
            {
              key: "calorie",
              label: (
                <span>
                  <CalculatorOutlined /> Tính calories
                </span>
              ),
              children: renderCalorieCalculator(),
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
                                <div className="meal-list-container">
                                  {monAn.map((mon, idx) => {
                                    // Nếu mon là object, hiển thị thông tin chi tiết
                                    if (typeof mon === 'object' && mon !== null) {
                                      const tenMon = mon.ten_mon || mon.mon_an || '—';
                                      const khoiLuong = mon.khoi_luong;
                                      const calo = mon.calo;
                                      return (
                                        <div key={idx} className="meal-item">
                                          <div className="meal-item-name">
                                            {tenMon}
                                          </div>
                                          <div className="meal-item-details">
                                            {khoiLuong && (
                                              <div className="meal-detail-item">
                                                <span className="meal-detail-label">Khối lượng:</span>
                                                <span className="meal-detail-value">{khoiLuong}g</span>
                                              </div>
                                            )}
                                            {calo && (
                                              <div className="meal-detail-item calorie-detail">
                                                <span className="meal-detail-label">Calo:</span>
                                                <span className="meal-detail-value">{calo} kcal</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                    // Nếu mon là string, hiển thị bình thường
                                    return (
                                      <div key={idx} className="meal-item meal-item-simple">
                                        <div className="meal-item-name">{mon}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="meal-empty-state">
                                  Chưa có món ăn cho {formatBuaAn(bua)}
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
