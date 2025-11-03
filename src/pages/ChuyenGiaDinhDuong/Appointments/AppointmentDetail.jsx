import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  List,
  Avatar,
  Descriptions,
  Space,
  Divider,
  Spin,
  Alert,
  Timeline,
  Badge,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  DatePicker,
  Table,
  Tabs,
  Collapse,
  Statistic,
  Steps,
  message,
  Tooltip
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PrinterOutlined,
  LockOutlined,
  VideoCameraOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiBenhNhan from "../../../api/BenhNhan"; 
import apiHoSoDinhDuong from "../../../api/HoSoDinhDuong";
import apiLichSuTuVan from "../../../api/LichSuTuVan"; 
import apiHoaDon from "../../../api/HoaDon";
import apiDichVu from "../../../api/DichVu";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import apiThucDonChiTiet from "../../../api/ThucDonChiTiet";
import apiTheoDoiTienDo from "../../../api/TheoDoiTienDo";
import apiMonAnThamKhao from "../../../api/MonAnThamKhao";
import { calculateAge } from "../../../utils/calculateAge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Step } = Steps;

const NutritionistAppointmentDetail = () => {
  const { id_cuoc_hen } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [benhNhanFull, setBenhNhanFull] = useState(null);
  const [hoSo, setHoSo] = useState(null);
  const [lichSuTuVanHienTai, setLichSuTuVanHienTai] = useState(null);
  const [lichSuTuVanTruoc, setLichSuTuVanTruoc] = useState([]);
  const [dsDichVu, setDsDichVu] = useState([]);
  const [dichVuTamThoi, setDichVuTamThoi] = useState([]);
  const [hoaDon, setHoaDon] = useState(null); // Lưu thông tin hóa đơn
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Tránh double submit

  // Modal states
  const [modalHoSoOpen, setModalHoSoOpen] = useState(false);
  const [modalLichSuOpen, setModalLichSuOpen] = useState(false);
  const [modalDichVu, setModalDichVu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewDichVu, setViewDichVu] = useState(false);

  const [formHoSo] = Form.useForm();
  const [formLichSu] = Form.useForm();
  const [bmi, setBmi] = useState(null);

  // State cho thực đơn chi tiết
  const [thucDonChiTiet, setThucDonChiTiet] = useState({
    sang: [],
    trua: [],
    chieu: [],
    toi: [],
    phu: []
  });
  // State để lưu các món ăn tạm thời chưa có id_lich_su
  const [thucDonTamThoi, setThucDonTamThoi] = useState({
    sang: [],
    trua: [],
    chieu: [],
    toi: [],
    phu: []
  });
  const [modalThucDonOpen, setModalThucDonOpen] = useState(false);
  const [buaAnDangChon, setBuaAnDangChon] = useState(null);
  const [dsMonAnThamKhao, setDsMonAnThamKhao] = useState([]);
  const [modalChonMonAn, setModalChonMonAn] = useState(false);
  const [formThucDon] = Form.useForm();

  // State cho theo dõi tiến độ
  const [theoDoiTienDo, setTheoDoiTienDo] = useState([]);
  const [modalTheoDoiTienDoOpen, setModalTheoDoiTienDoOpen] = useState(false);
  const [formTheoDoiTienDo] = Form.useForm();

  // State cho dữ liệu tạm thời
  const [lichSuTamThoi, setLichSuTamThoi] = useState(null);

  // Key để lưu vào localStorage
  const getTempStorageKey = () => `lich_su_tu_van_temp_${id_cuoc_hen}`;

  const getStatusColor = (status) => {
    switch (status) {
      case "da_dat": return "blue";
      case "da_hoan_thanh": return "green";
      case "da_huy": return "red";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "da_dat": return "Đã đặt";
      case "da_hoan_thanh": return "Đã hoàn thành";
      case "da_huy": return "Đã hủy";
      default: return status;
    }
  };

  const getGenderColor = (gender) => {
    return gender?.toLowerCase() === 'nam' ? 'blue' : 'pink';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const appt = await apiCuocHenTuVan.getById(id_cuoc_hen);
      setAppointment(appt);

      if (appt?.id_benh_nhan) {
        // Bước 1: Lấy thông tin cơ bản của bệnh nhân (từ benhnhan và nguoidung)
        const bnFull = await apiBenhNhan.getById(appt.id_benh_nhan);
        setBenhNhanFull(bnFull);

        // Bước 2: Lấy hồ sơ dinh dưỡng (nếu có)
        try {
          const hs = await apiHoSoDinhDuong.getByBenhNhan(appt.id_benh_nhan);
          setHoSo(hs || null);
        } catch (error) {
          // Nếu chưa có hồ sơ, để null
          setHoSo(null);
        }

        // Bước 3: Lấy lịch sử tư vấn trước đó (để tham khảo)
        try {
          const lichSuTruoc = await apiLichSuTuVan.getLichSuTuVanByBenhNhan(appt.id_benh_nhan);
          setLichSuTuVanTruoc(lichSuTruoc || []);
        } catch (error) {
          console.error("Lỗi khi lấy lịch sử tư vấn trước:", error);
          setLichSuTuVanTruoc([]);
        }

        // Bước 4: Nếu cuộc hẹn đã hoàn thành, lấy lịch sử tư vấn của cuộc hẹn này
        if (appt.trang_thai === "da_hoan_thanh" && appt.id_cuoc_hen) {
          try {
            const lichSuHienTai = await apiLichSuTuVan.getLichSuTuVanByCuocHen(appt.id_cuoc_hen);
            if (lichSuHienTai && lichSuHienTai.id_lich_su) {
              setLichSuTuVanHienTai(lichSuHienTai);

              // Lấy thực đơn chi tiết nếu có
              try {
                const thucDon = await apiThucDonChiTiet.getByLichSu(lichSuHienTai.id_lich_su);
                if (thucDon && Array.isArray(thucDon)) {
                  const grouped = {
                    sang: [],
                    trua: [],
                    chieu: [],
                    toi: [],
                    phu: []
                  };
                  thucDon.forEach(td => {
                    if (grouped[td.bua_an]) {
                      grouped[td.bua_an].push(td);
                    }
                  });
                  setThucDonChiTiet(grouped);
                }
              } catch (error) {
                // Không hiển thị lỗi nếu không tìm thấy thực đơn
                console.log("Chưa có thực đơn chi tiết");
              }
            } else {
              setLichSuTuVanHienTai(null);
            }
          } catch (error) {
            // Chỉ log lỗi nếu không phải 404 (không tìm thấy)
            if (error.response?.status !== 404) {
              console.error("Lỗi khi lấy lịch sử tư vấn hiện tại:", error);
            }
            setLichSuTuVanHienTai(null);
          }

          // Lấy dịch vụ đã lưu và thông tin hóa đơn
          try {
            const HoaDonData = await apiHoaDon.getByCuocHenTuVan(appt.id_cuoc_hen);
            if (HoaDonData && HoaDonData.id_hoa_don) {
              setHoaDon(HoaDonData); // Lưu thông tin hóa đơn
              try {
                const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDonData.id_hoa_don);
                if (ChiTietHoaDonData && ChiTietHoaDonData.data) {
                  setDichVuTamThoi(ChiTietHoaDonData.data || []);
                }
              } catch (error) {
                // Không hiển thị lỗi nếu không tìm thấy chi tiết hóa đơn
                if (error.response?.status !== 404) {
                  console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
                }
              }
            } else {
              setHoaDon(null);
            }
          } catch (error) {
            // Không hiển thị lỗi nếu không tìm thấy hóa đơn (404)
            if (error.response?.status !== 404) {
              console.error("Lỗi khi lấy hóa đơn:", error);
            }
            setHoaDon(null);
          }
        } else {
          // Nếu chưa hoàn thành, reset lịch sử hiện tại
          setLichSuTuVanHienTai(null);
          
          // Không load từ localStorage nữa - chỉ lưu trong state (reload trang sẽ mất)
          // Reset state về rỗng
          setLichSuTamThoi(null);
          setThucDonTamThoi({
            sang: [], trua: [], chieu: [], toi: [], phu: []
          });
        }

        // Bước 5: Lấy theo dõi tiến độ sẽ được thực hiện trong useEffect riêng sau khi hoSo được set

        // Lấy danh sách món ăn tham khảo
        try {
          const monAn = await apiMonAnThamKhao.getAll();
          if (monAn && Array.isArray(monAn)) {
            setDsMonAnThamKhao(monAn);
          }
        } catch (error) {
          console.error("Lỗi khi lấy món ăn tham khảo:", error);
        }
      }
    } catch (error) {
      console.error(error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id_cuoc_hen]);

  // Lấy theo dõi tiến độ theo hồ sơ dinh dưỡng (gắn với hồ sơ, không phụ thuộc vào cuộc hẹn)
  useEffect(() => {
    const loadTheoDoiTienDo = async () => {
      if (!appointment?.id_benh_nhan) return;

      try {
        if (hoSo?.id_ho_so) {
          // Lấy theo hồ sơ dinh dưỡng (cần thêm API getByHoSo)
          // Tạm thời lấy theo bệnh nhân, sẽ cập nhật khi có API getByHoSo
          const tienDoBenhNhan = await apiTheoDoiTienDo.getByBenhNhan(appointment.id_benh_nhan);
          if (tienDoBenhNhan && Array.isArray(tienDoBenhNhan)) {
            // Lọc theo id_ho_so nếu có
            const tienDoFiltered = tienDoBenhNhan.filter(td => td.id_ho_so === hoSo.id_ho_so);
            setTheoDoiTienDo(tienDoFiltered.length > 0 ? tienDoFiltered : tienDoBenhNhan);
          }
        } else {
          // Nếu chưa có hồ sơ, lấy theo bệnh nhân (fallback)
          const tienDoBenhNhan = await apiTheoDoiTienDo.getByBenhNhan(appointment.id_benh_nhan);
          if (tienDoBenhNhan && Array.isArray(tienDoBenhNhan)) {
            setTheoDoiTienDo(tienDoBenhNhan);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy theo dõi tiến độ:", error);
        setTheoDoiTienDo([]);
      }
    };

    if (appointment) {
      loadTheoDoiTienDo();
    }
  }, [hoSo, appointment]);

  // Tự động load dữ liệu vào form hồ sơ khi modal mở
  useEffect(() => {
    if (modalHoSoOpen) {
      if (hoSo) {
        // Nếu có hồ sơ, load dữ liệu hồ sơ vào form
        const chieuCao = hoSo.chieu_cao ? Number(hoSo.chieu_cao) : undefined;
        const canNang = hoSo.can_nang ? Number(hoSo.can_nang) : undefined;
        
        formHoSo.setFieldsValue({
          ho_ten: hoSo.ho_ten || '',
          so_dien_thoai: hoSo.so_dien_thoai || '',
          tuoi: hoSo.tuoi ? Number(hoSo.tuoi) : '',
          gioi_tinh: hoSo.gioi_tinh || '',
          dan_toc: hoSo.dan_toc || '',
          ma_BHYT: hoSo.ma_BHYT || '',
          dia_chi: hoSo.dia_chi || '',
          chieu_cao: chieuCao,
          can_nang: canNang,
          vong_eo: hoSo.vong_eo ? Number(hoSo.vong_eo) : undefined,
          mo_co_the: hoSo.mo_co_the ? Number(hoSo.mo_co_the) : undefined,
          khoi_co: hoSo.khoi_co ? Number(hoSo.khoi_co) : undefined,
          nuoc_trong_co_the: hoSo.nuoc_trong_co_the ? Number(hoSo.nuoc_trong_co_the) : undefined
        });
        
        // Tính BMI nếu có đủ thông tin
        if (chieuCao && canNang) {
          const heightInM = chieuCao / 100;
          const bmiValue = canNang / (heightInM * heightInM);
          setBmi(bmiValue.toFixed(1));
        } else {
          setBmi(null);
        }
      } else if (benhNhanFull) {
        // Nếu chưa có hồ sơ, load dữ liệu từ bệnh nhân
        const tuoiCalculated = calculateAge(benhNhanFull.ngay_sinh);
        formHoSo.setFieldsValue({
          ho_ten: benhNhanFull.ho_ten || '',
          so_dien_thoai: benhNhanFull.so_dien_thoai || '',
          gioi_tinh: benhNhanFull.gioi_tinh || '',
          tuoi: tuoiCalculated ? Number(tuoiCalculated) : '',
          dan_toc: benhNhanFull.dan_toc || '',
          ma_BHYT: benhNhanFull.ma_BHYT || '',
          dia_chi: benhNhanFull.dia_chi || ''
        });
      }
    } else {
      // Reset BMI khi đóng modal
      // Không cần reset form vì form sẽ được unmount khi modal đóng
      setBmi(null);
    }
  }, [modalHoSoOpen, hoSo, benhNhanFull, formHoSo]);

  // Tự động load dữ liệu vào form lịch sử tư vấn khi modal mở
  useEffect(() => {
    if (modalLichSuOpen) {
      if (lichSuTuVanHienTai) {
        // Load dữ liệu lịch sử tư vấn vào form
        formLichSu.setFieldsValue({
          ket_qua_cls: lichSuTuVanHienTai.ket_qua_cls || '',
          ke_hoach_dinh_duong: lichSuTuVanHienTai.ke_hoach_dinh_duong || '',
          nhu_cau_calo: lichSuTuVanHienTai.nhu_cau_calo ? Number(lichSuTuVanHienTai.nhu_cau_calo) : undefined,
          sang: lichSuTuVanHienTai.sang || '',
          trua: lichSuTuVanHienTai.trua || '',
          chieu: lichSuTuVanHienTai.chieu || '',
          toi: lichSuTuVanHienTai.toi || '',
          cham_soc: lichSuTuVanHienTai.cham_soc || '',
          ghi_chu: lichSuTuVanHienTai.ghi_chu || '',
          // Các trường mới
          muc_tieu_dinh_duong: lichSuTuVanHienTai.muc_tieu_dinh_duong || undefined,
          muc_do_hoat_dong: lichSuTuVanHienTai.muc_do_hoat_dong || undefined,
          che_do_an: lichSuTuVanHienTai.che_do_an || '',
          di_ung_thuc_pham: lichSuTuVanHienTai.di_ung_thuc_pham || '',
          mo_ta_muc_tieu: lichSuTuVanHienTai.mo_ta_muc_tieu || '',
          ngay_tai_kham: lichSuTuVanHienTai.ngay_tai_kham ? dayjs(lichSuTuVanHienTai.ngay_tai_kham) : undefined
        });
      }
    } else {
      // Không cần reset form vì form sẽ được unmount khi modal đóng
    }
  }, [modalLichSuOpen, lichSuTuVanHienTai, formLichSu]);

  // Hàm xử lý tạo/cập nhật hồ sơ dinh dưỡng
  const handleSubmitHoSo = async (values) => {
    try {
      if (!benhNhanFull || !benhNhanFull.id_benh_nhan) {
        message.error("Không tìm thấy thông tin bệnh nhân");
        return;
      }

      if (!hoSo) {
        // Tạo mới hồ sơ dinh dưỡng
        const newHoSo = await apiHoSoDinhDuong.create({
          id_benh_nhan: benhNhanFull.id_benh_nhan,
          id_chuyen_gia: userInfo.user.id_nguoi_dung,
          ...values
        });
        setHoSo(newHoSo);
        message.success("Tạo hồ sơ dinh dưỡng thành công");
      } else {
        // Cập nhật hồ sơ dinh dưỡng
        await apiHoSoDinhDuong.update(hoSo.id_ho_so, values);
        const updated = await apiHoSoDinhDuong.getByBenhNhan(benhNhanFull.id_benh_nhan);
        setHoSo(updated);
        message.success("Cập nhật hồ sơ dinh dưỡng thành công");
      }
      setModalHoSoOpen(false);
      // Refresh lại dữ liệu để cập nhật theo dõi tiến độ
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  // Tính toán BMR và TDEE
  const calculateBMR = (canNang, chieuCao, tuoi, gioiTinh) => {
    if (!canNang || !chieuCao || !tuoi) return null;
    
    // Công thức Mifflin-St Jeor
    const weight = canNang;
    const height = chieuCao;
    const age = tuoi;
    
    if (gioiTinh === 'Nam') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calculateTDEE = (bmr, mucDoHoatDong) => {
    if (!bmr || !mucDoHoatDong) return null;
    
    const activityMultipliers = {
      'it': 1.2,           // Ít vận động
      'trung_binh': 1.375, // Vận động nhẹ (1-3 lần/tuần)
      'nhieu': 1.55,       // Vận động vừa (3-5 lần/tuần)
      'rat_nhieu': 1.725  // Vận động nhiều (6-7 lần/tuần)
    };
    
    return bmr * (activityMultipliers[mucDoHoatDong] || 1.2);
  };

  const calculateMacroTargets = (tdee, mucTieu) => {
    if (!tdee || !mucTieu) return null;
    
    let proteinPercent = 0.25;
    let carbPercent = 0.45;
    let fatPercent = 0.30;
    
    switch (mucTieu) {
      case 'tang_co':
        proteinPercent = 0.30;
        carbPercent = 0.40;
        fatPercent = 0.30;
        break;
      case 'giam_can':
        proteinPercent = 0.30;
        carbPercent = 0.35;
        fatPercent = 0.35;
        break;
      case 'tang_can':
        proteinPercent = 0.25;
        carbPercent = 0.50;
        fatPercent = 0.25;
        break;
      default:
        break;
    }
    
    return {
      protein: (tdee * proteinPercent / 4).toFixed(1), // 1g protein = 4 calo
      carb: (tdee * carbPercent / 4).toFixed(1),      // 1g carb = 4 calo
      fat: (tdee * fatPercent / 9).toFixed(1)          // 1g fat = 9 calo
    };
  };

  // Hàm tự động tạo lịch sử từ dữ liệu tạm khi thanh toán hóa đơn
  const createLichSuFromTemp = async () => {
    if (!lichSuTamThoi || !benhNhanFull) return;
    
    try {
      // Tự động tạo hồ sơ dinh dưỡng nếu chưa có
      let currentHoSo = hoSo;
      if (!currentHoSo) {
        const tuoiCalculated = calculateAge(benhNhanFull.ngay_sinh);
        const newHoSoData = {
          id_benh_nhan: benhNhanFull.id_benh_nhan,
          id_chuyen_gia: userInfo.user.id_nguoi_dung,
          ho_ten: benhNhanFull.ho_ten || '',
          so_dien_thoai: benhNhanFull.so_dien_thoai || '',
          tuoi: tuoiCalculated ? Number(tuoiCalculated) : null,
          gioi_tinh: benhNhanFull.gioi_tinh || null,
          dan_toc: benhNhanFull.dan_toc || null,
          ma_BHYT: benhNhanFull.ma_BHYT || null,
          dia_chi: benhNhanFull.dia_chi || null
        };
        currentHoSo = await apiHoSoDinhDuong.create(newHoSoData);
        setHoSo(currentHoSo);
      }

      // Tính toán BMR và TDEE
      let bmr = null;
      let tdee = null;
      let macroTargets = null;

      if (currentHoSo.can_nang && currentHoSo.chieu_cao && currentHoSo.tuoi && currentHoSo.gioi_tinh && lichSuTamThoi.muc_do_hoat_dong) {
        bmr = calculateBMR(currentHoSo.can_nang, currentHoSo.chieu_cao, currentHoSo.tuoi, currentHoSo.gioi_tinh);
        tdee = calculateTDEE(bmr, lichSuTamThoi.muc_do_hoat_dong);
        
        if (tdee && lichSuTamThoi.muc_tieu_dinh_duong) {
          macroTargets = calculateMacroTargets(tdee, lichSuTamThoi.muc_tieu_dinh_duong);
        }
      }

      const submitData = {
        id_benh_nhan: benhNhanFull.id_benh_nhan,
        id_cuoc_hen: id_cuoc_hen,
        id_ho_so: currentHoSo.id_ho_so,
        thoi_gian_tu_van: new Date(),
        ...lichSuTamThoi,
        ...(bmr && { bmr: parseFloat(bmr.toFixed(2)) }),
        ...(tdee && { tdee: parseFloat(tdee.toFixed(2)) }),
        ...(macroTargets && {
          protein_target: parseFloat(macroTargets.protein),
          carb_target: parseFloat(macroTargets.carb),
          fat_target: parseFloat(macroTargets.fat)
        }),
        nhu_cau_calo: lichSuTamThoi.nhu_cau_calo || (tdee ? Math.round(tdee) : null)
      };

      const savedLichSu = await apiLichSuTuVan.createLichSuTuVan(submitData);
      setLichSuTuVanHienTai(savedLichSu);

      // Lưu thực đơn tạm thời
      const allMeals = ['sang', 'trua', 'chieu', 'toi', 'phu'];
      for (const buaAn of allMeals) {
        const tempMeals = thucDonTamThoi[buaAn] || [];
        for (const meal of tempMeals) {
          try {
            const { id_thuc_don, is_temp, ...mealData } = meal;
            const thucDonData = {
              id_lich_su: savedLichSu.id_lich_su,
              ...mealData
            };
            await apiThucDonChiTiet.create(thucDonData);
          } catch (error) {
            console.error(`Lỗi khi lưu món ăn ${buaAn}:`, error);
          }
        }
      }

      // Xóa dữ liệu tạm thời
      localStorage.removeItem(getTempStorageKey());
      setLichSuTamThoi(null);
      setThucDonTamThoi({
        sang: [], trua: [], chieu: [], toi: [], phu: []
      });

      await fetchData();
      message.success("Đã tự động tạo lịch sử tư vấn từ dữ liệu đã lưu");
    } catch (error) {
      console.error("Lỗi khi tạo lịch sử từ dữ liệu tạm:", error);
    }
  };

  // Tự động tạo lịch sử từ dữ liệu tạm khi hóa đơn được thanh toán
  useEffect(() => {
    const autoCreateLichSu = async () => {
      if (
        appointment?.trang_thai === "da_hoan_thanh" &&
        hoaDon?.trang_thai === "da_thanh_toan" &&
        lichSuTamThoi &&
        !lichSuTuVanHienTai &&
        benhNhanFull
      ) {
        await createLichSuFromTemp();
      }
    };
    if (hoaDon && appointment) {
      autoCreateLichSu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoaDon?.trang_thai, appointment?.trang_thai]);

  const handleSubmitLichSuTuVan = async (values) => {
    // Tránh double submit
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!benhNhanFull || !benhNhanFull.id_benh_nhan) {
        message.error("Không tìm thấy thông tin bệnh nhân");
        setIsSubmitting(false);
        return;
      }

      // Nếu chưa hoàn thành hoặc chưa thanh toán, lưu vào localStorage tạm thời
      const canCreateDirectly = appointment?.trang_thai === "da_hoan_thanh" 
        && hoaDon 
        && hoaDon.trang_thai === "da_thanh_toan";

      if (!canCreateDirectly) {
        // Tính toán BMR, TDEE và macro targets nếu có đủ thông tin (từ hồ sơ hiện tại hoặc hồ sơ tạm thời)
        let bmr = null;
        let tdee = null;
        let macroTargets = null;

        // Thử lấy hồ sơ từ state hoặc từ benhNhanFull để tính toán
        let currentHoSo = hoSo;
        if (currentHoSo?.can_nang && currentHoSo?.chieu_cao && currentHoSo?.tuoi && currentHoSo?.gioi_tinh && values.muc_do_hoat_dong) {
          bmr = calculateBMR(currentHoSo.can_nang, currentHoSo.chieu_cao, currentHoSo.tuoi, currentHoSo.gioi_tinh);
          tdee = calculateTDEE(bmr, values.muc_do_hoat_dong);
          
          if (tdee && values.muc_tieu_dinh_duong) {
            macroTargets = calculateMacroTargets(tdee, values.muc_tieu_dinh_duong);
          }
        }

        // Chuẩn bị dữ liệu lưu tạm thời, bao gồm các thông tin tự tính
        const lichSuWithCalculated = {
          ...values,
          ...(bmr && { bmr: parseFloat(bmr.toFixed(2)) }),
          ...(tdee && { tdee: parseFloat(tdee.toFixed(2)) }),
          ...(macroTargets && {
            protein_target: parseFloat(macroTargets.protein),
            carb_target: parseFloat(macroTargets.carb),
            fat_target: parseFloat(macroTargets.fat)
          })
        };

        // Lưu tạm thời vào state (không lưu localStorage, reload trang sẽ mất)
        setLichSuTamThoi(lichSuWithCalculated);
        message.success("Đã lưu thông tin tư vấn. Dữ liệu sẽ được tạo khi hoàn thành thanh toán hóa đơn.");
        setModalLichSuOpen(false);
        setIsSubmitting(false);
        return;
      }

      // Tự động tạo hồ sơ dinh dưỡng nếu chưa có
      let currentHoSo = hoSo;
      if (!currentHoSo) {
        // Tạo hồ sơ mới với thông tin cơ bản từ bệnh nhân
        const tuoiCalculated = calculateAge(benhNhanFull.ngay_sinh);
        const newHoSoData = {
          id_benh_nhan: benhNhanFull.id_benh_nhan,
          id_chuyen_gia: userInfo.user.id_nguoi_dung,
          ho_ten: benhNhanFull.ho_ten || '',
          so_dien_thoai: benhNhanFull.so_dien_thoai || '',
          tuoi: tuoiCalculated ? Number(tuoiCalculated) : null,
          gioi_tinh: benhNhanFull.gioi_tinh || null,
          dan_toc: benhNhanFull.dan_toc || null,
          ma_BHYT: benhNhanFull.ma_BHYT || null,
          dia_chi: benhNhanFull.dia_chi || null
        };
        
        currentHoSo = await apiHoSoDinhDuong.create(newHoSoData);
        setHoSo(currentHoSo);
        message.success("Đã tự động tạo hồ sơ dinh dưỡng");
      }

      // Tính toán BMR và TDEE nếu có đủ thông tin
      let bmr = null;
      let tdee = null;
      let macroTargets = null;

      if (currentHoSo.can_nang && currentHoSo.chieu_cao && currentHoSo.tuoi && currentHoSo.gioi_tinh && values.muc_do_hoat_dong) {
        bmr = calculateBMR(currentHoSo.can_nang, currentHoSo.chieu_cao, currentHoSo.tuoi, currentHoSo.gioi_tinh);
        tdee = calculateTDEE(bmr, values.muc_do_hoat_dong);
        
        if (tdee && values.muc_tieu_dinh_duong) {
          macroTargets = calculateMacroTargets(tdee, values.muc_tieu_dinh_duong);
        }
      }

      const submitData = {
        id_benh_nhan: benhNhanFull.id_benh_nhan,
        id_cuoc_hen: id_cuoc_hen,
        id_ho_so: currentHoSo.id_ho_so,
        thoi_gian_tu_van: new Date(),
        ...values,
        ...(bmr && { bmr: parseFloat(bmr.toFixed(2)) }),
        ...(tdee && { tdee: parseFloat(tdee.toFixed(2)) }),
        ...(macroTargets && {
          protein_target: parseFloat(macroTargets.protein),
          carb_target: parseFloat(macroTargets.carb),
          fat_target: parseFloat(macroTargets.fat)
        }),
        // Nếu không có nhu_cau_calo tự nhập, dùng TDEE
        nhu_cau_calo: values.nhu_cau_calo || (tdee ? Math.round(tdee) : null)
      };

      let savedLichSu;
      if (!lichSuTuVanHienTai) {
        savedLichSu = await apiLichSuTuVan.createLichSuTuVan(submitData);
        setLichSuTuVanHienTai(savedLichSu);
        message.success("Ghi thông tin tư vấn thành công");
      } else {
        await apiLichSuTuVan.updateLichSuTuVan(lichSuTuVanHienTai.id_lich_su, submitData);
        savedLichSu = await apiLichSuTuVan.getLichSuTuVanById(lichSuTuVanHienTai.id_lich_su);
        setLichSuTuVanHienTai(savedLichSu);
        message.success("Cập nhật thông tin tư vấn thành công");
      }

      // Lưu tất cả các món ăn tạm thời vào database
      const allMeals = ['sang', 'trua', 'chieu', 'toi', 'phu'];
      let savedCount = 0;
      for (const buaAn of allMeals) {
        const tempMeals = thucDonTamThoi[buaAn] || [];
        for (const meal of tempMeals) {
          try {
            const { id_thuc_don, is_temp, ...mealData } = meal;
            const thucDonData = {
              id_lich_su: savedLichSu.id_lich_su,
              ...mealData
            };
            const newThucDon = await apiThucDonChiTiet.create(thucDonData);
            setThucDonChiTiet(prev => ({
              ...prev,
              [buaAn]: [...(prev[buaAn] || []), newThucDon]
            }));
            savedCount++;
          } catch (error) {
            console.error(`Lỗi khi lưu món ăn ${buaAn}:`, error);
          }
        }
      }

      // Xóa các món ăn tạm thời sau khi đã lưu
      if (savedCount > 0) {
        setThucDonTamThoi({
          sang: [],
          trua: [],
          chieu: [],
          toi: [],
          phu: []
        });
        message.success(`Đã lưu ${savedCount} món ăn vào thông tin tư vấn`);
      }

      await fetchData(); // Refresh lại dữ liệu
      setModalLichSuOpen(false);
    } catch (error) {
      console.error(error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDichVu = async () => {
    try {
      const res = await apiDichVu.getAll();
      setDsDichVu(res.data || []);
      setModalDichVu(true);
    } catch (err) {
      console.error(err);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };


  const handleRemoveDichVu = (index) => {
    setDichVuTamThoi(prev => prev.filter((_, i) => i !== index));
  };


  const handleAddDichVuRow = () => {
    setDichVuTamThoi([...dichVuTamThoi, { id_dich_vu: "", so_luong: 1, don_gia: 0 }]);
  };

  const handleChangeDichVu = (index, field, value) => {
    const updated = [...dichVuTamThoi];
    updated[index][field] = value;

    if (field === "id_dich_vu") {
      const selected = dsDichVu.find((dv) => dv.id_dich_vu === value);
      if (selected) updated[index] = { ...updated[index], don_gia: selected.don_gia || 0, ten_dich_vu: selected.ten_dich_vu };
    }

    setDichVuTamThoi(updated);
  };


  const handleViewDichVu = async () => {
    try {
      if (appointment.trang_thai === "da_hoan_thanh") {
          const HoaDonData = await apiHoaDon.getByCuocHenTuVan(id_cuoc_hen);
          if (HoaDonData && HoaDonData.id_hoa_don) {
            setHoaDon(HoaDonData); // Cập nhật thông tin hóa đơn
            try {
              const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDonData.id_hoa_don);
              if (ChiTietHoaDonData && ChiTietHoaDonData.data) {
                setDichVuTamThoi(ChiTietHoaDonData.data || []);
              }
            } catch (error) {
              // Không hiển thị lỗi nếu không tìm thấy chi tiết hóa đơn
              if (error.response?.status !== 404) {
                console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
              }
            }
          } else {
            setHoaDon(null);
          }
      }
      setViewDichVu(true);
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    }
  };

  // Hàm xử lý thực đơn chi tiết
  const handleOpenThucDon = (buaAn) => {
    setBuaAnDangChon(buaAn);
    formThucDon.resetFields();
    setModalThucDonOpen(true);
  };

  const handleAddThucDon = async (values) => {
    try {
      console.log("handleAddThucDon - values:", values);
      console.log("handleAddThucDon - lichSuTuVanHienTai:", lichSuTuVanHienTai);
      console.log("handleAddThucDon - buaAnDangChon:", buaAnDangChon);

      if (!buaAnDangChon) {
        message.error("Không xác định được bữa ăn. Vui lòng thử lại.");
        return;
      }

      if (!values.ten_mon || !values.ten_mon.trim()) {
        message.error("Vui lòng nhập tên món ăn");
        return;
      }

      const monAnThamKhao = values.id_mon_an ? dsMonAnThamKhao.find(m => m.id_mon_an === values.id_mon_an) : null;
      const khoiLuong = values.khoi_luong || (monAnThamKhao?.khoi_luong_chuan || 100);
      
      let calo = values.calo;
      let protein = values.protein;
      let carb = values.carb;
      let fat = values.fat;
      let fiber = values.fiber;

      // Tính toán dinh dưỡng từ món ăn tham khảo nếu chọn (sử dụng giá trị từ form nếu đã tính sẵn)
      if (monAnThamKhao) {
        // Nếu không có giá trị dinh dưỡng từ form hoặc muốn tính lại theo khối lượng hiện tại
        const khoiLuongChuan = monAnThamKhao.khoi_luong_chuan || 100;
        const tiLe = khoiLuong / khoiLuongChuan;
        
        // Sử dụng giá trị từ form nếu đã có, nếu không thì tính từ món ăn tham khảo
        calo = calo || Number((monAnThamKhao.calo * tiLe).toFixed(2));
        protein = protein !== undefined && protein !== null ? protein : Number((monAnThamKhao.protein * tiLe).toFixed(2));
        carb = carb !== undefined && carb !== null ? carb : Number((monAnThamKhao.carb * tiLe).toFixed(2));
        fat = fat !== undefined && fat !== null ? fat : Number((monAnThamKhao.fat * tiLe).toFixed(2));
        fiber = fiber !== undefined && fiber !== null ? fiber : Number((monAnThamKhao.fiber * tiLe).toFixed(2));
      }

      const thucDonItem = {
        bua_an: buaAnDangChon,
        ten_mon: values.ten_mon.trim(),
        khoi_luong: parseFloat(khoiLuong),
        calo: calo ? parseFloat(calo) : null,
        protein: protein !== undefined && protein !== null ? parseFloat(protein) : null,
        carb: carb !== undefined && carb !== null ? parseFloat(carb) : null,
        fat: fat !== undefined && fat !== null ? parseFloat(fat) : null,
        fiber: fiber !== undefined && fiber !== null ? parseFloat(fiber) : null,
        ghi_chu: values.ghi_chu ? values.ghi_chu.trim() : null,
        thoi_gian_an: values.thoi_gian_an ? values.thoi_gian_an.trim() : null,
        thu_tu: ((thucDonChiTiet[buaAnDangChon]?.length || 0) + (thucDonTamThoi[buaAnDangChon]?.length || 0)) + 1
      };

      // Nếu đã có lịch sử tư vấn, lưu vào database ngay
      if (lichSuTuVanHienTai?.id_lich_su) {
        const thucDonData = {
          id_lich_su: lichSuTuVanHienTai.id_lich_su,
          ...thucDonItem
        };

        console.log("handleAddThucDon - thucDonData:", thucDonData);

        const newThucDon = await apiThucDonChiTiet.create(thucDonData);
        console.log("handleAddThucDon - newThucDon:", newThucDon);
        
        setThucDonChiTiet(prev => ({
          ...prev,
          [buaAnDangChon]: [...(prev[buaAnDangChon] || []), newThucDon]
        }));
        
        message.success("Thêm món ăn thành công");
      } else {
        // Chưa có lịch sử tư vấn, lưu vào state tạm thời
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setThucDonTamThoi(prev => ({
          ...prev,
          [buaAnDangChon]: [...(prev[buaAnDangChon] || []), { ...thucDonItem, id_thuc_don: tempId, is_temp: true }]
        }));
        
        message.success("Đã thêm món ăn. Món ăn sẽ được lưu khi bạn lưu thông tin tư vấn.");
      }
      
      formThucDon.resetFields();
      setModalThucDonOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm thực đơn chi tiết:", error);
      console.error("Lỗi chi tiết:", error.response);
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi thêm món ăn";
      message.error(errorMessage);
    }
  };

  const handleDeleteThucDon = async (id_thuc_don, buaAn) => {
    try {
      // Kiểm tra xem có phải món ăn tạm thời không
      const isTemp = id_thuc_don.startsWith('temp_');
      
      if (isTemp) {
        // Xóa khỏi state tạm thời
        setThucDonTamThoi(prev => ({
          ...prev,
          [buaAn]: prev[buaAn].filter(td => td.id_thuc_don !== id_thuc_don)
        }));
        message.success("Xóa món ăn thành công");
      } else {
        // Xóa khỏi database
        await apiThucDonChiTiet.delete(id_thuc_don);
        setThucDonChiTiet(prev => ({
          ...prev,
          [buaAn]: prev[buaAn].filter(td => td.id_thuc_don !== id_thuc_don)
        }));
        message.success("Xóa món ăn thành công");
      }
    } catch (error) {
      console.error("Lỗi khi xóa thực đơn chi tiết:", error);
      message.error("Có lỗi xảy ra khi xóa món ăn");
    }
  };

  // Hàm xử lý theo dõi tiến độ
  const handleOpenTheoDoiTienDo = () => {
    formTheoDoiTienDo.resetFields();
    setModalTheoDoiTienDoOpen(true);
  };

  const handleSubmitTheoDoiTienDo = async (values) => {
    try {
      if (!benhNhanFull || !benhNhanFull.id_benh_nhan) {
        message.error("Không tìm thấy thông tin bệnh nhân");
        return;
      }

      // Theo dõi tiến độ gắn với hồ sơ dinh dưỡng, không phụ thuộc vào cuộc hẹn
      if (!hoSo) {
        message.warning("Vui lòng tạo hồ sơ dinh dưỡng trước khi thêm theo dõi tiến độ");
        setModalTheoDoiTienDoOpen(false);
        setModalHoSoOpen(true);
        return;
      }

      // Tính BMI nếu có cân nặng và chiều cao
      let calculatedBMI = null;
      if (values.can_nang && values.chieu_cao) {
        const heightInM = parseFloat(values.chieu_cao) / 100;
        calculatedBMI = parseFloat(values.can_nang) / (heightInM * heightInM);
      }

      const submitData = {
        id_benh_nhan: benhNhanFull.id_benh_nhan,
        id_ho_so: hoSo.id_ho_so, // Gắn với hồ sơ dinh dưỡng
        id_lich_su: lichSuTuVanHienTai?.id_lich_su || null, // Có thể có hoặc không
        ngay_kham: dayjs(values.ngay_kham).format('YYYY-MM-DD'),
        can_nang: values.can_nang ? parseFloat(values.can_nang) : null,
        chieu_cao: values.chieu_cao ? parseFloat(values.chieu_cao) : null,
        vong_eo: values.vong_eo ? parseFloat(values.vong_eo) : null,
        vong_nguc: values.vong_nguc ? parseFloat(values.vong_nguc) : null,
        vong_dui: values.vong_dui ? parseFloat(values.vong_dui) : null,
        mo_co_the: values.mo_co_the ? parseFloat(values.mo_co_the) : null,
        khoi_co: values.khoi_co ? parseFloat(values.khoi_co) : null,
        nuoc_trong_co_the: values.nuoc_trong_co_the ? parseFloat(values.nuoc_trong_co_the) : null,
        bmi: calculatedBMI ? parseFloat(calculatedBMI.toFixed(2)) : null,
        ghi_chu: values.ghi_chu
      };

      await apiTheoDoiTienDo.create(submitData);
      message.success("Thêm theo dõi tiến độ thành công");
      
      // Refresh lại dữ liệu theo dõi tiến độ
      const tienDoBenhNhan = await apiTheoDoiTienDo.getByBenhNhan(benhNhanFull.id_benh_nhan);
      if (tienDoBenhNhan && Array.isArray(tienDoBenhNhan)) {
        const tienDoFiltered = tienDoBenhNhan.filter(td => td.id_ho_so === hoSo.id_ho_so);
        setTheoDoiTienDo(tienDoFiltered.length > 0 ? tienDoFiltered : tienDoBenhNhan);
      }
      
      formTheoDoiTienDo.resetFields();
      setModalTheoDoiTienDoOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm theo dõi tiến độ:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể lưu theo dõi tiến độ";
      message.error(errorMessage);
    }
  };

  const handleExportPdf = async () => {
    try {
      const input = document.getElementById("invoicePreview");
      if (!input) {
        message.error("Không tìm thấy nội dung hóa đơn để xuất PDF");
        return;
      }

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,     
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = {
        width: pdfWidth,
        height: (canvas.height * pdfWidth) / canvas.width,
      };

      let position = 0;
      if (imgProps.height <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgProps.width, imgProps.height);
      } else {
        let heightLeft = imgProps.height;
        let y = 0;
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, y, imgProps.width, imgProps.height);
          heightLeft -= pdfHeight;
          y -= pdfHeight;
          if (heightLeft > 0) pdf.addPage();
        }
      }

      const fileName = hoaDon?.id_hoa_don 
        ? `HoaDon_${hoaDon.id_hoa_don}.pdf`
        : `HoaDon_${id_cuoc_hen}.pdf`;
      
      pdf.save(fileName);
      message.success("Xuất hóa đơn thành công");
      
      // Đóng modal preview sau khi xuất PDF
      setShowPreview(false);

    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
      message.error("Không thể xuất PDF. Vui lòng thử lại.");
    }
  };

  const handleFinish = async () => {
    // Tránh double submit
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Kiểm tra có thông tin bệnh nhân không
      if (!benhNhanFull || !benhNhanFull.id_benh_nhan) {
        message.error("Không tìm thấy thông tin bệnh nhân");
        setIsSubmitting(false);
        return;
      }

      // Bước 1: Nếu chưa có lịch sử tư vấn đã lưu nhưng có dữ liệu tạm thời, tự động lưu trước
      if (!lichSuTuVanHienTai && (lichSuTamThoi || Object.values(thucDonTamThoi).some(meals => meals && meals.length > 0))) {
        if (!lichSuTamThoi) {
          // Chỉ có thực đơn tạm thời mà không có lịch sử tư vấn
          message.warning("Vui lòng ghi thông tin tư vấn trước khi kết thúc");
          setModalLichSuOpen(true);
          setIsSubmitting(false);
          return;
        }

        // Tự động tạo hồ sơ dinh dưỡng nếu chưa có
        let currentHoSo = hoSo;
        if (!currentHoSo) {
          const tuoiCalculated = calculateAge(benhNhanFull.ngay_sinh);
          const newHoSoData = {
            id_benh_nhan: benhNhanFull.id_benh_nhan,
            id_chuyen_gia: userInfo.user.id_nguoi_dung,
            ho_ten: benhNhanFull.ho_ten || '',
            so_dien_thoai: benhNhanFull.so_dien_thoai || '',
            tuoi: tuoiCalculated ? Number(tuoiCalculated) : null,
            gioi_tinh: benhNhanFull.gioi_tinh || null,
            dan_toc: benhNhanFull.dan_toc || null,
            ma_BHYT: benhNhanFull.ma_BHYT || null,
            dia_chi: benhNhanFull.dia_chi || null
          };
          
          currentHoSo = await apiHoSoDinhDuong.create(newHoSoData);
          setHoSo(currentHoSo);
        }

        // Tính toán BMR và TDEE nếu có đủ thông tin
        let bmr = null;
        let tdee = null;
        let macroTargets = null;

        if (currentHoSo.can_nang && currentHoSo.chieu_cao && currentHoSo.tuoi && currentHoSo.gioi_tinh && lichSuTamThoi.muc_do_hoat_dong) {
          bmr = calculateBMR(currentHoSo.can_nang, currentHoSo.chieu_cao, currentHoSo.tuoi, currentHoSo.gioi_tinh);
          tdee = calculateTDEE(bmr, lichSuTamThoi.muc_do_hoat_dong);
          
          if (tdee && lichSuTamThoi.muc_tieu_dinh_duong) {
            macroTargets = calculateMacroTargets(tdee, lichSuTamThoi.muc_tieu_dinh_duong);
          }
        }

        const submitData = {
          id_benh_nhan: benhNhanFull.id_benh_nhan,
          id_cuoc_hen: id_cuoc_hen,
          id_ho_so: currentHoSo.id_ho_so,
          thoi_gian_tu_van: new Date(),
          ...lichSuTamThoi,
          ...(bmr && { bmr: parseFloat(bmr.toFixed(2)) }),
          ...(tdee && { tdee: parseFloat(tdee.toFixed(2)) }),
          ...(macroTargets && {
            protein_target: parseFloat(macroTargets.protein),
            carb_target: parseFloat(macroTargets.carb),
            fat_target: parseFloat(macroTargets.fat)
          }),
          nhu_cau_calo: lichSuTamThoi.nhu_cau_calo || (tdee ? Math.round(tdee) : null)
        };

        const savedLichSu = await apiLichSuTuVan.createLichSuTuVan(submitData);
        setLichSuTuVanHienTai(savedLichSu);

        // Lưu tất cả các món ăn tạm thời vào database
        const allMeals = ['sang', 'trua', 'chieu', 'toi', 'phu'];
        for (const buaAn of allMeals) {
          const tempMeals = thucDonTamThoi[buaAn] || [];
          for (const meal of tempMeals) {
            try {
              const { id_thuc_don, is_temp, ...mealData } = meal;
              const thucDonData = {
                id_lich_su: savedLichSu.id_lich_su,
                ...mealData
              };
              await apiThucDonChiTiet.create(thucDonData);
            } catch (error) {
              console.error(`Lỗi khi lưu món ăn ${buaAn}:`, error);
            }
          }
        }

        // Xóa các món ăn tạm thời sau khi đã lưu
        setThucDonTamThoi({
          sang: [], trua: [], chieu: [], toi: [], phu: []
        });
        setLichSuTamThoi(null);
        localStorage.removeItem(getTempStorageKey());
      }

      // Kiểm tra xem có thông tin tư vấn chưa
      if (!lichSuTuVanHienTai) {
        message.warning("Vui lòng ghi thông tin tư vấn trước khi kết thúc");
        setModalLichSuOpen(true);
        setIsSubmitting(false);
        return;
      }

      // Bước 2: Tạo hóa đơn với dịch vụ (nếu có dịch vụ)
      if (dichVuTamThoi.length > 0 && dichVuTamThoi.some(item => item.id_dich_vu)) {
        const dichVuHopLe = dichVuTamThoi.filter(item => item.id_dich_vu);
        if (dichVuHopLe.length > 0) {
          const tong_tien = dichVuHopLe.reduce(
            (sum, dv) => sum + (dv.so_luong || 0) * (dv.don_gia || 0),
            0
          );
          
          // Tạo hóa đơn (API sẽ tự động set trạng thái cuộc hẹn thành "da_hoan_thanh")
          await apiHoaDon.create({
            id_cuoc_hen_tu_van: id_cuoc_hen,
            tong_tien,
            chi_tiet: dichVuHopLe.map(dv => ({
              id_dich_vu: dv.id_dich_vu,
              so_luong: dv.so_luong,
              don_gia: dv.don_gia
            })),
          });

          message.success("Đã tạo hóa đơn thành công");
        }
      } else {
        // Nếu không có dịch vụ, chỉ cập nhật trạng thái cuộc hẹn
        await apiCuocHenTuVan.updateTrangThai(id_cuoc_hen, "da_hoan_thanh");
        message.success("Đã hoàn thành tư vấn");
      }

      // Bước 3: Load lại thông tin hóa đơn và chi tiết hóa đơn (nếu có)
      try {
        const HoaDonData = await apiHoaDon.getByCuocHenTuVan(id_cuoc_hen);
        if (HoaDonData && HoaDonData.id_hoa_don) {
          setHoaDon(HoaDonData);
          try {
            const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDonData.id_hoa_don);
            if (ChiTietHoaDonData && ChiTietHoaDonData.data) {
              setDichVuTamThoi(ChiTietHoaDonData.data || []);
            }
          } catch (error) {
            // Không hiển thị lỗi nếu không tìm thấy chi tiết hóa đơn
            if (error.response?.status !== 404) {
              console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
            }
          }
        }
      } catch (error) {
        // Không hiển thị lỗi nếu không tìm thấy hóa đơn (404)
        if (error.response?.status !== 404) {
          console.error("Lỗi khi lấy thông tin hóa đơn:", error);
        }
      }

      // Bước 4: Refresh lại dữ liệu và hiển thị hóa đơn
      await fetchData();
      setShowPreview(true);
      message.success("Đã kết thúc tư vấn thành công!");
    } catch (err) {
      console.error("Lỗi khi kết thúc tư vấn:", err);
      message.error("Không thể kết thúc tư vấn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính tổng tiền dịch vụ từ hóa đơn đã tạo hoặc từ dichVuTamThoi
  const totalDichVu = hoaDon?.tong_tien 
    ? hoaDon.tong_tien 
    : dichVuTamThoi.reduce((sum, dv) => sum + (parseFloat(dv.so_luong || 0) * parseFloat(dv.don_gia || 0)), 0);
  const tongCong = totalDichVu;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Alert
          message="Không tìm thấy cuộc hẹn"
          description="Cuộc hẹn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Card className="shadow-sm" style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              style={{ padding: '4px 8px' }}
            >
              Quay lại
            </Button>
            <Divider type="vertical" style={{ height: 24 }} />
            <div>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                🏥 Chi tiết cuộc hẹn khám
              </Title>
              <Text type="secondary">Quản lý thông tin khám bệnh và điều trị</Text>
            </div>
          </div>
          <Space>
            <Badge 
              status="processing" 
              text={
                <Tag color={getStatusColor(appointment.trang_thai)}>
                  {getStatusText(appointment.trang_thai)}
                </Tag>
              } 
            />
            <Text type="secondary">Mã: {id_cuoc_hen}</Text>
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Thông tin chính */}
        <Col xs={24} lg={16}>
          <Row gutter={[24, 24]}>
            {/* Thông tin bệnh nhân */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>Thông tin bệnh nhân</span>
                  </Space>
                }
                extra={
                  <Button 
                    type="primary" 
                    icon={hoSo ? <EditOutlined /> : <PlusOutlined />}
                    onClick={() => {
                      setModalHoSoOpen(true);
                    }}
                    size="small"
                  >
                    {hoSo ? "Chỉnh sửa" : "Tạo hồ sơ"}
                  </Button>
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                {hoSo ? (
                  <>
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Mã BN" span={1}>
                        <Text strong>{benhNhanFull?.id_benh_nhan}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Họ tên" span={1}>
                        <Text strong>{hoSo.ho_ten}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">
                        <Tag color={getGenderColor(hoSo.gioi_tinh)}>
                          {hoSo.gioi_tinh}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tuổi">
                        <Badge count={hoSo.tuoi} style={{ backgroundColor: '#52c41a' }} />
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        <Space>
                          <PhoneOutlined />
                          {hoSo.so_dien_thoai}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã BHYT">
                        {hoSo.ma_BHYT || <Text type="secondary">Không có</Text>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ" span={2}>
                        {hoSo.dia_chi || <Text type="secondary">Không có</Text>}
                      </Descriptions.Item>
                    </Descriptions>
                    
                    {/* Hiển thị các chỉ số nếu có */}
                    {(hoSo.chieu_cao || hoSo.can_nang || hoSo.vong_eo || hoSo.mo_co_the || hoSo.khoi_co || hoSo.nuoc_trong_co_the) && (
                      <Divider orientation="left" style={{ marginTop: 16 }}>Chỉ số dinh dưỡng</Divider>
                    )}
                    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                      {hoSo.chieu_cao && hoSo.can_nang && (
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center', background: '#f0f7ff' }}>
                            <Statistic
                              title="BMI"
                              value={(() => {
                                const heightInM = hoSo.chieu_cao / 100;
                                const bmiValue = hoSo.can_nang / (heightInM * heightInM);
                                return bmiValue.toFixed(1);
                              })()}
                              suffix={
                                (() => {
                                  const heightInM = hoSo.chieu_cao / 100;
                                  const bmiValue = hoSo.can_nang / (heightInM * heightInM);
                                  if (bmiValue < 18.5) return <Tag color="warning">Thiếu cân</Tag>;
                                  if (bmiValue < 23) return <Tag color="success">Bình thường</Tag>;
                                  if (bmiValue < 25) return <Tag color="info">Thừa cân</Tag>;
                                  if (bmiValue < 30) return <Tag color="error">Béo phì độ I</Tag>;
                                  return <Tag color="error">Béo phì độ II</Tag>;
                                })()
                              }
                              valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {hoSo.vong_eo && (
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
                            <Statistic
                              title="Vòng eo (cm)"
                              value={hoSo.vong_eo}
                              precision={1}
                              valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {hoSo.mo_co_the && (
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
                            <Statistic
                              title="Mỡ cơ thể (%)"
                              value={hoSo.mo_co_the}
                              precision={1}
                              suffix="%"
                              valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {hoSo.khoi_co && (
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center', background: '#fff0f6' }}>
                            <Statistic
                              title="Khối cơ (kg)"
                              value={hoSo.khoi_co}
                              precision={1}
                              valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {hoSo.nuoc_trong_co_the && (
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff' }}>
                            <Statistic
                              title="Nước trong cơ thể (%)"
                              value={hoSo.nuoc_trong_co_the}
                              precision={1}
                              suffix="%"
                              valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            />
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <UserOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        Chưa có hồ sơ bệnh nhân
                      </Text>
                      <Button 
                        type="primary" 
                        onClick={() => {
                          setModalHoSoOpen(true);
                        }}
                      >
                        Tạo hồ sơ ngay
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Thông tin khám bệnh */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#52c41a' }} />
                    <span>Thông tin tư vấn dinh dưỡng</span>
                  </Space>
                }
                extra={
                  // Nếu đã hoàn thành và đã có lịch sử, chỉ cho xem
                  appointment.trang_thai === "da_hoan_thanh" && lichSuTuVanHienTai ? (
                    <Button 
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        formLichSu.setFieldsValue({
                          ...lichSuTuVanHienTai,
                          ngay_tai_kham: lichSuTuVanHienTai.ngay_tai_kham ? dayjs(lichSuTuVanHienTai.ngay_tai_kham) : undefined
                        });
                        setModalLichSuOpen(true);
                      }}
                      size="small"
                    >
                      Xem chi tiết
                    </Button>
                  ) : (
                    // Luôn cho phép ghi thông tin (lưu tạm thời nếu chưa thanh toán)
                    <Button 
                      type={lichSuTuVanHienTai || lichSuTamThoi ? "default" : "primary"}
                      icon={lichSuTuVanHienTai || lichSuTamThoi ? <EditOutlined /> : <PlusOutlined />}
                      onClick={() => {
                        // Load dữ liệu tạm thời hoặc lịch sử đã có vào form
                        if (lichSuTuVanHienTai) {
                          formLichSu.setFieldsValue({
                            ...lichSuTuVanHienTai,
                            ngay_tai_kham: lichSuTuVanHienTai.ngay_tai_kham ? dayjs(lichSuTuVanHienTai.ngay_tai_kham) : undefined
                          });
                        } else if (lichSuTamThoi) {
                          formLichSu.setFieldsValue({
                            ...lichSuTamThoi,
                            ngay_tai_kham: lichSuTamThoi.ngay_tai_kham ? dayjs(lichSuTamThoi.ngay_tai_kham) : undefined
                          });
                        }
                        setModalLichSuOpen(true);
                      }}
                      size="small"
                    >
                      {lichSuTuVanHienTai ? "Xem chi tiết" : lichSuTamThoi ? "Chỉnh sửa" : "Ghi thông tin"}
                    </Button>
                  )
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                {(() => {
                  // Kiểm tra có dữ liệu tạm thời không
                  const hasTempMeals = Object.values(thucDonTamThoi).some(meals => meals && meals.length > 0);
                  const hasTempData = lichSuTamThoi || hasTempMeals;
                  
                  return (
                    <>
                      {hasTempData && (() => {
                        // Tính tổng calo cả ngày từ thực đơn tạm thời
                        const tongCaloCảNgay = Object.values(thucDonTamThoi).reduce((total, meals) => {
                          if (Array.isArray(meals)) {
                            return total + meals.reduce((sum, meal) => {
                              return sum + (parseFloat(meal.calo) || 0);
                            }, 0);
                          }
                          return total;
                        }, 0);

                        // Lấy nhu cầu calo từ lichSuTamThoi
                        let nhuCauCalo = null;
                        if (lichSuTamThoi?.nhu_cau_calo) {
                          nhuCauCalo = parseFloat(lichSuTamThoi.nhu_cau_calo);
                        } else if (lichSuTamThoi?.tdee) {
                          nhuCauCalo = parseFloat(lichSuTamThoi.tdee);
                        } else if (hoSo?.can_nang && hoSo?.chieu_cao && hoSo?.tuoi && hoSo?.gioi_tinh && lichSuTamThoi?.muc_do_hoat_dong) {
                          const bmr = calculateBMR(hoSo.can_nang, hoSo.chieu_cao, hoSo.tuoi, hoSo.gioi_tinh);
                          const tdee = calculateTDEE(bmr, lichSuTamThoi.muc_do_hoat_dong);
                          if (tdee) {
                            nhuCauCalo = Math.round(tdee);
                          }
                        }

                        // Tính chênh lệch
                        const chenhLech = nhuCauCalo ? tongCaloCảNgay - nhuCauCalo : null;

                        return (
                          <Card 
                            size="small" 
                            style={{ marginBottom: 16, backgroundColor: '#f0f9ff', borderColor: '#91caff' }}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div>
                                <Text strong>Tổng calo cả ngày: </Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
                                  {tongCaloCảNgay.toFixed(0)} kcal
                                </Text>
                              </div>
                              {nhuCauCalo && (
                                <div>
                                  <Text strong>Nhu cầu calo: </Text>
                                  <Text>{nhuCauCalo} kcal/ngày</Text>
                                  {chenhLech !== null && (
                                    <>
                                      <Text> | </Text>
                                      <Text strong style={{ color: chenhLech < 0 ? '#ff4d4f' : chenhLech > 0 ? '#52c41a' : '#595959' }}>
                                        Chênh lệch: {chenhLech > 0 ? '+' : ''}{chenhLech.toFixed(0)} kcal
                                      </Text>
                                    </>
                                  )}
                                </div>
                              )}
                            </Space>
                          </Card>
                        );
                      })()}
                      {lichSuTuVanHienTai ? (
                        <Descriptions column={1} bordered>
                          <Descriptions.Item label="Kết quả cận lâm sàng">
                            <Text>{lichSuTuVanHienTai.ket_qua_cls || "Không có"}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Kế hoạch dinh dưỡng">
                            <Text>{lichSuTuVanHienTai.ke_hoach_dinh_duong || "Không có"}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Nhu cầu calo">
                            <Text>{lichSuTuVanHienTai.nhu_cau_calo ? `${lichSuTuVanHienTai.nhu_cau_calo} kcal/ngày` : "Không có"}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Hướng dẫn chăm sóc">
                            <Text>{lichSuTuVanHienTai.cham_soc || "Không có"}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Ghi chú">
                            <Text>{lichSuTuVanHienTai.ghi_chu || "Không có"}</Text>
                          </Descriptions.Item>
                        </Descriptions>
                      ) : lichSuTamThoi ? (() => {
                        // Tính toán BMR, TDEE và macro targets nếu có đủ thông tin
                        let bmr = null;
                        let tdee = null;
                        let macroTargets = null;

                        if (hoSo?.can_nang && hoSo?.chieu_cao && hoSo?.tuoi && hoSo?.gioi_tinh && lichSuTamThoi.muc_do_hoat_dong) {
                          bmr = calculateBMR(hoSo.can_nang, hoSo.chieu_cao, hoSo.tuoi, hoSo.gioi_tinh);
                          tdee = calculateTDEE(bmr, lichSuTamThoi.muc_do_hoat_dong);
                          
                          if (tdee && lichSuTamThoi.muc_tieu_dinh_duong) {
                            macroTargets = calculateMacroTargets(tdee, lichSuTamThoi.muc_tieu_dinh_duong);
                          }
                        }

                        // Nếu có dữ liệu tự tính trong lichSuTamThoi, dùng nó
                        const displayBmr = lichSuTamThoi.bmr || bmr;
                        const displayTdee = lichSuTamThoi.tdee || tdee;
                        const displayProtein = lichSuTamThoi.protein_target || (macroTargets ? macroTargets.protein : null);
                        const displayCarb = lichSuTamThoi.carb_target || (macroTargets ? macroTargets.carb : null);
                        const displayFat = lichSuTamThoi.fat_target || (macroTargets ? macroTargets.fat : null);

                        return (
                          <Descriptions column={1} bordered>
                            <Descriptions.Item label="Mục tiêu dinh dưỡng">
                              <Text>{lichSuTamThoi.muc_tieu_dinh_duong || "Không có"}</Text>
                            </Descriptions.Item>
                            {displayBmr && (
                              <Descriptions.Item label="BMR (Tỷ lệ trao đổi chất cơ bản)">
                                <Text>{typeof displayBmr === 'number' ? `${displayBmr.toFixed(2)} kcal/ngày` : `${displayBmr} kcal/ngày`}</Text>
                              </Descriptions.Item>
                            )}
                            {displayTdee && (
                              <Descriptions.Item label="TDEE (Tổng năng lượng tiêu hao)">
                                <Text>{typeof displayTdee === 'number' ? `${displayTdee.toFixed(2)} kcal/ngày` : `${displayTdee} kcal/ngày`}</Text>
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Nhu cầu calo">
                              <Text>{lichSuTamThoi.nhu_cau_calo ? `${lichSuTamThoi.nhu_cau_calo} kcal/ngày` : (displayTdee ? `${Math.round(displayTdee)} kcal/ngày` : "Không có")}</Text>
                            </Descriptions.Item>
                            {displayProtein && displayCarb && displayFat && (
                              <>
                                <Descriptions.Item label="Protein mục tiêu">
                                  <Text>{typeof displayProtein === 'number' ? `${displayProtein.toFixed(2)} g/ngày` : `${displayProtein} g/ngày`}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Carb mục tiêu">
                                  <Text>{typeof displayCarb === 'number' ? `${displayCarb.toFixed(2)} g/ngày` : `${displayCarb} g/ngày`}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Fat mục tiêu">
                                  <Text>{typeof displayFat === 'number' ? `${displayFat.toFixed(2)} g/ngày` : `${displayFat} g/ngày`}</Text>
                                </Descriptions.Item>
                              </>
                            )}
                            <Descriptions.Item label="Kế hoạch dinh dưỡng">
                              <Text>{lichSuTamThoi.ke_hoach_dinh_duong || "Không có"}</Text>
                            </Descriptions.Item>
                          </Descriptions>
                        );
                      })() : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                          <Text type="secondary">Chưa có thông tin tư vấn</Text>
                        </div>
                      )}
                    </>
                  );
                })()}
              </Card>
            </Col>

            {/* Hiển thị dịch vụ khi đã hoàn thành */}
            {appointment.trang_thai === "da_hoan_thanh" && (
              <>
                {/* Dịch vụ đã sử dụng */}
                <Col xs={24}>
                  <Card 
                    title={
                      <Space>
                        <HeartOutlined style={{ color: '#eb2f96' }} />
                        <span>Dịch vụ đã sử dụng</span>
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={handleViewDichVu}
                        size="small"
                      >
                        Xem dịch vụ
                      </Button>
                    }
                    className="shadow-sm"
                    style={{ borderRadius: 12 }}
                  >
                    {dichVuTamThoi.length > 0 ? (
                      <List
                        size="small"
                        dataSource={dichVuTamThoi.slice(0, 3)}
                        renderItem={(dv, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar size="small" icon={<HeartOutlined />} />}
                              title={dv.dich_vu?.ten_dich_vu}
                              description={`Số lượng: ${dv.so_luong} - Đơn giá: ${dv.don_gia?.toLocaleString()} VND`}
                            />
                            <div>
                              <Text strong>{dv.thanh_tien?.toLocaleString()} VND</Text>
                            </div>
                          </List.Item>
                        )}
                        footer={
                          dichVuTamThoi.length > 3 && (
                            <Text type="secondary">
                              Và {dichVuTamThoi.length - 3} dịch vụ khác...
                            </Text>
                          )
                        }
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Text type="secondary">Không có dịch vụ nào</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </>
            )}

            {/* Lịch sử tư vấn trước */}
            {lichSuTuVanTruoc.length > 0 && (
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <span>Lịch sử tư vấn trước</span>
                    </Space>
                  }
                  className="shadow-sm"
                  style={{ borderRadius: 12 }}
                >
                  <Timeline
                    items={lichSuTuVanTruoc.map((ls, index) => ({
                      key: index,
                      dot: <CalendarOutlined style={{ fontSize: '12px' }} />,
                      children: (
                        <Space direction="vertical" size={0}>
                          <Text strong>
                            {new Date(ls.thoi_gian_tu_van).toLocaleDateString("vi-VN")}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {ls.ke_hoach_dinh_duong || 'Không có thông tin'}
                          </Text>
                        </Space>
                      )
                    }))}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Row gutter={[24, 24]}>
            {/* Thông tin cuộc hẹn */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <span>Thông tin cuộc hẹn</span>
                  </Space>
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Ngày khám:</Text>
                    <div>
                      <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      {new Date(appointment.ngay_kham).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <Text strong>Giờ khám:</Text>
                    <div>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
                      {appointment.khungGio ? 
                        `${appointment.khungGio.gio_bat_dau} - ${appointment.khungGio.gio_ket_thuc}` : 
                        "Không có"}
                    </div>
                  </div>
                  <div>
                    <Text strong>Loại hẹn:</Text>
                    <div>
                      {appointment.loai_hen === 'online' ? (
                        <Tag color="blue" icon={<VideoCameraOutlined />}>
                          Online
                        </Tag>
                      ) : appointment.loai_hen === 'truc_tiep' ? (
                        <Tag color="green" icon={<HomeOutlined />}>
                          Trực tiếp
                        </Tag>
                      ) : (
                        <Text type="secondary">Không xác định</Text>
                      )}
                    </div>
                  </div>
                  <div>
                    <Text strong>Lý do khám:</Text>
                    <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: 6 }}>
                      {appointment.ly_do_kham || "Không có"}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Thống kê nhanh */}
            <Col xs={24}>
              <Card 
                title="Thống kê nhanh"
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Statistic
                      title="Dịch vụ"
                      value={dichVuTamThoi.length}
                      prefix={<HeartOutlined />}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title="Tổng tiền"
                      value={tongCong}
                      prefix={<DollarOutlined />}
                      suffix="VND"
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Hành động */}
            <Col xs={24}>
              <Card 
                title="Thao tác"
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {appointment.trang_thai !== "da_hoan_thanh" ? (
                    <>
                      <Button 
                        icon={<PlusOutlined />}
                        onClick={handleOpenDichVu}
                        block
                        size="large"
                      >
                        Chọn dịch vụ
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={handleFinish}
                        block
                        size="large"
                        loading={isSubmitting}
                        disabled={isSubmitting || (!lichSuTuVanHienTai && !lichSuTamThoi && !Object.values(thucDonTamThoi).some(meals => meals && meals.length > 0))}
                      >
                        {isSubmitting ? "Đang xử lý..." : "Kết thúc tư vấn"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={handleViewDichVu}
                        block
                        size="large"
                      >
                        Xem dịch vụ
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<PrinterOutlined />}
                        onClick={() => setShowPreview(true)}
                        block
                        size="large"
                      >
                        In hóa đơn
                      </Button>
                    </>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal Hồ sơ - GIỮ NGUYÊN */}
      <Modal
        title={hoSo ? "Chỉnh sửa hồ sơ" : "Tạo hồ sơ bệnh nhân"}
        open={modalHoSoOpen}
        onCancel={() => setModalHoSoOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={formHoSo}
          layout="vertical"
          onFinish={handleSubmitHoSo}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ho_ten"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="so_dien_thoai"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tuoi"
                label="Tuổi"
                rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gioi_tinh"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dan_toc"
                label="Dân tộc"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ma_BHYT"
                label="Mã BHYT"
              >
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dia_chi"
                label="Địa chỉ"
              >
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
              >
                <Tag color={appointment ? getStatusColor(appointment.trang_thai) : 'default'}>
                  {appointment ? getStatusText(appointment.trang_thai) : 'N/A'}
                </Tag>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Chỉ số dinh dưỡng</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chieu_cao"
                label="Chiều cao (cm)"
                rules={[
                  { required: false },
                  { 
                    type: 'number', 
                    min: 50, 
                    max: 250, 
                    message: 'Chiều cao phải từ 50cm đến 250cm' 
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập chiều cao (50-250cm)" 
                  min={50} 
                  max={250}
                  step={0.1}
                  precision={1}
                  onChange={(value) => {
                    const canNang = formHoSo.getFieldValue('can_nang');
                    if (value && canNang) {
                      const heightInM = value / 100;
                      const bmiValue = canNang / (heightInM * heightInM);
                      setBmi(bmiValue.toFixed(1));
                    } else {
                      setBmi(null);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="can_nang"
                label="Cân nặng (kg)"
                rules={[
                  { required: false },
                  { 
                    type: 'number', 
                    min: 5, 
                    max: 300, 
                    message: 'Cân nặng phải từ 5kg đến 300kg' 
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập cân nặng (5-300kg)" 
                  min={5} 
                  max={300}
                  step={0.1}
                  precision={1}
                  onChange={(value) => {
                    const chieuCao = formHoSo.getFieldValue('chieu_cao');
                    if (value && chieuCao) {
                      const heightInM = chieuCao / 100;
                      const bmiValue = value / (heightInM * heightInM);
                      setBmi(bmiValue.toFixed(1));
                    } else {
                      setBmi(null);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {bmi && (
              <Col span={24}>
                <Form.Item label="Chỉ số BMI">
                  <Alert
                    message={`BMI: ${bmi}`}
                    description={
                      (() => {
                        const bmiNum = parseFloat(bmi);
                        if (bmiNum < 18.5) return 'Thiếu cân';
                        if (bmiNum < 23) return 'Bình thường';
                        if (bmiNum < 25) return 'Thừa cân';
                        if (bmiNum < 30) return 'Béo phì độ I';
                        return 'Béo phì độ II';
                      })()
                    }
                    type={
                      (() => {
                        const bmiNum = parseFloat(bmi);
                        if (bmiNum < 18.5) return 'warning';
                        if (bmiNum < 23) return 'success';
                        if (bmiNum < 25) return 'info';
                        return 'error';
                      })()
                    }
                    showIcon
                    style={{ marginBottom: 0 }}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                name="vong_eo"
                label="Vòng eo (cm)"
                rules={[
                  { required: false },
                  { 
                    type: 'number', 
                    min: 30, 
                    max: 200, 
                    message: 'Vòng eo phải từ 30cm đến 200cm' 
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập vòng eo (30-200cm)" 
                  min={30} 
                  max={200}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mo_co_the"
                label="Mỡ cơ thể (%)"
                rules={[
                  { required: false },
                  { 
                    type: 'number', 
                    min: 0, 
                    max: 100, 
                    message: 'Tỷ lệ mỡ cơ thể phải từ 0% đến 100%' 
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập tỷ lệ mỡ cơ thể (0-100%)" 
                  min={0} 
                  max={100} 
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="khoi_co"
                label="Khối cơ (kg)"
                rules={[
                  { required: false },
                  { 
                    type: 'number', 
                    min: 0, 
                    max: 200, 
                    message: 'Khối cơ phải từ 0kg đến 200kg' 
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập khối cơ (0-200kg)" 
                  min={0} 
                  max={200}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nuoc_trong_co_the"
                label="Nước trong cơ thể (%)"
                rules={[
                  { required: false },
                  { 
                    type: 'number', 
                    min: 0, 
                    max: 100, 
                    message: 'Tỷ lệ nước phải từ 0% đến 100%' 
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Nhập tỷ lệ nước (0-100%)" 
                  min={0} 
                  max={100} 
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalHoSoOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {hoSo ? "Cập nhật" : "Tạo hồ sơ"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Lịch sử tư vấn */}
      <Modal
        title={
          appointment?.trang_thai === "da_hoan_thanh" && lichSuTuVanHienTai 
            ? "Xem thông tin tư vấn" 
            : lichSuTuVanHienTai || lichSuTamThoi
              ? "Chỉnh sửa thông tin tư vấn"
              : "Ghi thông tin tư vấn dinh dưỡng"
        }
        open={modalLichSuOpen}
        onCancel={() => setModalLichSuOpen(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Form
          form={formLichSu}
          layout="vertical"
          onFinish={handleSubmitLichSuTuVan}
          disabled={appointment?.trang_thai === "da_hoan_thanh" && lichSuTuVanHienTai}
        >
          <Tabs 
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Thông tin tư vấn hiện tại',
                children: (
                  <Row gutter={16}>
                    {/* Mục tiêu và mức độ hoạt động */}
                    <Col span={12}>
                      <Form.Item 
                        name="muc_tieu_dinh_duong" 
                        label="Mục tiêu dinh dưỡng"
                        rules={[{ required: true, message: 'Vui lòng chọn mục tiêu dinh dưỡng' }]}
                      >
                        <Select placeholder="Chọn mục tiêu dinh dưỡng">
                          <Select.Option value="giam_can">Giảm cân</Select.Option>
                          <Select.Option value="tang_can">Tăng cân</Select.Option>
                          <Select.Option value="tang_co">Tăng cơ</Select.Option>
                          <Select.Option value="duy_tri">Duy trì</Select.Option>
                          <Select.Option value="cai_thien_suc_khoe">Cải thiện sức khỏe</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="muc_do_hoat_dong" 
                        label="Mức độ hoạt động"
                        rules={[{ required: true, message: 'Vui lòng chọn mức độ hoạt động' }]}
                      >
                        <Select placeholder="Chọn mức độ hoạt động">
                          <Select.Option value="it">Ít vận động (ít hoặc không tập thể dục)</Select.Option>
                          <Select.Option value="trung_binh">Vận động nhẹ (1-3 lần/tuần)</Select.Option>
                          <Select.Option value="nhieu">Vận động vừa (3-5 lần/tuần)</Select.Option>
                          <Select.Option value="rat_nhieu">Vận động nhiều (6-7 lần/tuần)</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="che_do_an" label="Chế độ ăn đặc biệt">
                        <Select placeholder="Chọn chế độ ăn (nếu có)">
                          <Select.Option value="">Không có</Select.Option>
                          <Select.Option value="Keto">Keto (Low Carb, High Fat)</Select.Option>
                          <Select.Option value="Low Carb">Low Carb</Select.Option>
                          <Select.Option value="High Protein">High Protein</Select.Option>
                          <Select.Option value="Vegetarian">Vegetarian (Ăn chay)</Select.Option>
                          <Select.Option value="Vegan">Vegan (Thuần chay)</Select.Option>
                          <Select.Option value="Mediterranean">Mediterranean</Select.Option>
                          <Select.Option value="Khac">Khác</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="ngay_tai_kham" 
                        label="Ngày tái khám tiếp theo"
                        getValueFromEvent={(value) => {
                          // DatePicker always returns dayjs object or null/undefined
                          return value || undefined;
                        }}
                        normalize={(value) => {
                          if (!value || value === null || value === undefined) return undefined;
                          // Check if value is already a dayjs object
                          if (value && typeof value.isValid === 'function') {
                            return value.isValid() ? value : undefined;
                          }
                          // Convert string or other types to dayjs object
                          if (typeof value === 'string' || value instanceof Date) {
                            const dayjsValue = dayjs(value);
                            return dayjsValue.isValid() ? dayjsValue : undefined;
                          }
                          return undefined;
                        }}
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          placeholder="Chọn ngày tái khám"
                          format="DD/MM/YYYY"
                          allowClear
                        />
                      </Form.Item>
                    </Col>
                    {/* Tính toán BMR và TDEE tự động */}
                    {hoSo && hoSo.can_nang && hoSo.chieu_cao && hoSo.tuoi && hoSo.gioi_tinh && (
                      <Col span={24}>
                        <Alert
                          message="Phân tích dinh dưỡng tự động"
                          description={
                            <div>
                              <Form.Item shouldUpdate={(prevValues, currentValues) => 
                                prevValues.muc_do_hoat_dong !== currentValues.muc_do_hoat_dong
                              }>
                                {({ getFieldValue }) => {
                                  const mucDoHoatDong = getFieldValue('muc_do_hoat_dong');
                                  if (mucDoHoatDong) {
                                    const bmr = calculateBMR(hoSo.can_nang, hoSo.chieu_cao, hoSo.tuoi, hoSo.gioi_tinh);
                                    const tdee = calculateTDEE(bmr, mucDoHoatDong);
                                    const macroTargets = calculateMacroTargets(tdee, getFieldValue('muc_tieu_dinh_duong'));
                                    
                                    if (bmr && tdee) {
                                      return (
                                        <Space direction="vertical" size="small">
                                          <Text><strong>BMR:</strong> {bmr.toFixed(0)} kcal/ngày (Tỷ lệ trao đổi chất cơ bản)</Text>
                                          <Text><strong>TDEE:</strong> {tdee.toFixed(0)} kcal/ngày (Tổng năng lượng tiêu hao)</Text>
                                          {macroTargets && (
                                            <>
                                              <Text><strong>Protein mục tiêu:</strong> {macroTargets.protein}g/ngày</Text>
                                              <Text><strong>Carb mục tiêu:</strong> {macroTargets.carb}g/ngày</Text>
                                              <Text><strong>Fat mục tiêu:</strong> {macroTargets.fat}g/ngày</Text>
                                            </>
                                          )}
                                        </Space>
                                      );
                                    }
                                  }
                                  return <Text>Vui lòng chọn mức độ hoạt động để tính toán</Text>;
                                }}
                              </Form.Item>
                            </div>
                          }
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      </Col>
                    )}
                    <Col span={24}>
                      <Form.Item name="mo_ta_muc_tieu" label="Mô tả chi tiết mục tiêu">
                        <TextArea rows={2} placeholder="Mô tả chi tiết mục tiêu dinh dưỡng..." />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="di_ung_thuc_pham" label="Dị ứng thực phẩm">
                        <TextArea rows={2} placeholder="Nhập danh sách dị ứng thực phẩm (nếu có)..." />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="ket_qua_cls" label="Kết quả cận lâm sàng">
                        <TextArea rows={3} placeholder="Nhập kết quả cận lâm sàng (nếu có)..." />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="ke_hoach_dinh_duong" label="Kế hoạch dinh dưỡng">
                        <TextArea rows={4} placeholder="Nhập kế hoạch dinh dưỡng chi tiết..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="nhu_cau_calo" 
                        label="Nhu cầu calo (kcal/ngày)"
                        tooltip="Để trống để tự động sử dụng TDEE"
                      >
                        <InputNumber 
                          style={{ width: '100%' }} 
                          placeholder="Nhập nhu cầu calo (hoặc để tự động)" 
                          min={0} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Divider orientation="left">Thực đơn chi tiết</Divider>
                      {(() => {
                        // Kiểm tra có dữ liệu tạm thời không
                        const hasTempData = Object.values(thucDonTamThoi).some(meals => meals && meals.length > 0) || lichSuTamThoi;
                        if (hasTempData) {
                          // Tính tổng calo cả ngày từ thực đơn tạm thời
                          const tongCaloCảNgay = Object.values(thucDonTamThoi).reduce((total, meals) => {
                            if (Array.isArray(meals)) {
                              return total + meals.reduce((sum, meal) => {
                                return sum + (parseFloat(meal.calo) || 0);
                              }, 0);
                            }
                            return total;
                          }, 0);

                          // Lấy nhu cầu calo từ lichSuTamThoi
                          let nhuCauCalo = null;
                          if (lichSuTamThoi?.nhu_cau_calo) {
                            nhuCauCalo = parseFloat(lichSuTamThoi.nhu_cau_calo);
                          } else if (lichSuTamThoi?.tdee) {
                            nhuCauCalo = parseFloat(lichSuTamThoi.tdee);
                          } else if (hoSo?.can_nang && hoSo?.chieu_cao && hoSo?.tuoi && hoSo?.gioi_tinh && lichSuTamThoi?.muc_do_hoat_dong) {
                            const bmr = calculateBMR(hoSo.can_nang, hoSo.chieu_cao, hoSo.tuoi, hoSo.gioi_tinh);
                            const tdee = calculateTDEE(bmr, lichSuTamThoi.muc_do_hoat_dong);
                            if (tdee) {
                              nhuCauCalo = Math.round(tdee);
                            }
                          }

                          // Tính chênh lệch
                          const chenhLech = nhuCauCalo ? tongCaloCảNgay - nhuCauCalo : null;

                          return (
                            <Card 
                              size="small" 
                              style={{ marginBottom: 16, backgroundColor: '#f0f9ff', borderColor: '#91caff' }}
                            >
                              <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                  <Text strong>Tổng calo cả ngày: </Text>
                                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
                                    {tongCaloCảNgay.toFixed(0)} kcal
                                  </Text>
                                </div>
                                {nhuCauCalo && (
                                  <div>
                                    <Text strong>Nhu cầu calo: </Text>
                                    <Text>{nhuCauCalo} kcal/ngày</Text>
                                    {chenhLech !== null && (
                                      <>
                                        <Text> | </Text>
                                        <Text strong style={{ color: chenhLech < 0 ? '#ff4d4f' : chenhLech > 0 ? '#52c41a' : '#595959' }}>
                                          Chênh lệch: {chenhLech > 0 ? '+' : ''}{chenhLech.toFixed(0)} kcal
                                        </Text>
                                      </>
                                    )}
                                  </div>
                                )}
                              </Space>
                            </Card>
                          );
                        }
                        return null;
                      })()}
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {['sang', 'trua', 'chieu', 'toi'].map(buaAn => {
                          // Gộp món ăn đã lưu và món ăn tạm thời để hiển thị
                          const savedMeals = thucDonChiTiet[buaAn] || [];
                          const tempMeals = thucDonTamThoi[buaAn] || [];
                          const allMeals = [...savedMeals, ...tempMeals];
                          
                          // Tính tổng calo cho bữa ăn
                          const tongCaloBua = allMeals.reduce((sum, meal) => {
                            return sum + (parseFloat(meal.calo) || 0);
                          }, 0);
                          
                          return (
                            <Card
                              key={buaAn}
                              title={
                                <Space>
                                  <span>Bữa {buaAn === 'sang' ? 'sáng' : buaAn === 'trua' ? 'trưa' : buaAn === 'chieu' ? 'chiều' : 'tối'}</span>
                                  {tongCaloBua > 0 && (
                                    <Tag color="blue">{tongCaloBua.toFixed(0)} kcal</Tag>
                                  )}
                                </Space>
                              }
                              size="small"
                              extra={
                                <Button
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                  size="small"
                                  onClick={() => handleOpenThucDon(buaAn)}
                                >
                                  Thêm món
                                </Button>
                              }
                            >
                              {allMeals.length > 0 ? (
                              <Table
                                dataSource={allMeals}
                                pagination={false}
                                size="small"
                                columns={[
                                  {
                                    title: 'Tên món',
                                    dataIndex: 'ten_mon',
                                    key: 'ten_mon',
                                    render: (text, record) => (
                                      <Space>
                                        <span>{text}</span>
                                        {record.is_temp && (
                                          <Tag color="orange" size="small">Chưa lưu</Tag>
                                        )}
                                      </Space>
                                    )
                                  },
                                  {
                                    title: 'Khối lượng (g)',
                                    dataIndex: 'khoi_luong',
                                    key: 'khoi_luong',
                                    render: (val) => val ? `${val}g` : '-'
                                  },
                                  {
                                    title: 'Calo',
                                    dataIndex: 'calo',
                                    key: 'calo',
                                    render: (val) => val ? `${val} kcal` : '-'
                                  },
                                  {
                                    title: 'Protein (g)',
                                    dataIndex: 'protein',
                                    key: 'protein',
                                    render: (val) => val || '-'
                                  },
                                  {
                                    title: 'Carb (g)',
                                    dataIndex: 'carb',
                                    key: 'carb',
                                    render: (val) => val || '-'
                                  },
                                  {
                                    title: 'Fat (g)',
                                    dataIndex: 'fat',
                                    key: 'fat',
                                    render: (val) => val || '-'
                                  },
                                  {
                                    title: 'Thao tác',
                                    key: 'action',
                                    render: (_, record) => (
                                      <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        onClick={() => handleDeleteThucDon(record.id_thuc_don, buaAn)}
                                      >
                                        Xóa
                                      </Button>
                                    )
                                  }
                                ]}
                                rowKey="id_thuc_don"
                              />
                            ) : (
                              <Text type="secondary">Chưa có món ăn. Nhấn "Thêm món" để thêm.</Text>
                            )}
                            </Card>
                          );
                        })}
                        {(() => {
                          // Tính tổng calo cả ngày
                          const allMealsAllDay = [...thucDonChiTiet.sang || [], ...thucDonChiTiet.trua || [], 
                                                   ...thucDonChiTiet.chieu || [], ...thucDonChiTiet.toi || [],
                                                   ...thucDonTamThoi.sang || [], ...thucDonTamThoi.trua || [],
                                                   ...thucDonTamThoi.chieu || [], ...thucDonTamThoi.toi || []];
                          const tongCaloNgay = allMealsAllDay.reduce((sum, meal) => {
                            return sum + (parseFloat(meal.calo) || 0);
                          }, 0);
                          
                          if (tongCaloNgay > 0) {
                            return (
                              <Card size="small" style={{ backgroundColor: '#f0f9ff' }}>
                                <Row justify="space-between" align="middle">
                                  <Col>
                                    <Text strong style={{ fontSize: 16 }}>Tổng calo cả ngày:</Text>
                                  </Col>
                                  <Col>
                                    <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>
                                      {tongCaloNgay.toFixed(0)} kcal
                                    </Tag>
                                  </Col>
                                </Row>
                                {lichSuTamThoi?.nhu_cau_calo && (
                                  <Row style={{ marginTop: 8 }}>
                                    <Col span={24}>
                                      <Text type="secondary">
                                        Nhu cầu calo: {lichSuTamThoi.nhu_cau_calo} kcal/ngày | 
                                        {' '}Chênh lệch: 
                                        <Text strong style={{ 
                                          color: tongCaloNgay > lichSuTamThoi.nhu_cau_calo ? '#ff4d4f' : 
                                                 tongCaloNgay < lichSuTamThoi.nhu_cau_calo * 0.9 ? '#faad14' : '#52c41a'
                                        }}>
                                          {tongCaloNgay > lichSuTamThoi.nhu_cau_calo ? ' +' : ' '}
                                          {(tongCaloNgay - lichSuTamThoi.nhu_cau_calo).toFixed(0)} kcal
                                        </Text>
                                      </Text>
                                    </Col>
                                  </Row>
                                )}
                                {lichSuTuVanHienTai?.nhu_cau_calo && (
                                  <Row style={{ marginTop: 8 }}>
                                    <Col span={24}>
                                      <Text type="secondary">
                                        Nhu cầu calo: {lichSuTuVanHienTai.nhu_cau_calo} kcal/ngày | 
                                        {' '}Chênh lệch: 
                                        <Text strong style={{ 
                                          color: tongCaloNgay > lichSuTuVanHienTai.nhu_cau_calo ? '#ff4d4f' : 
                                                 tongCaloNgay < lichSuTuVanHienTai.nhu_cau_calo * 0.9 ? '#faad14' : '#52c41a'
                                        }}>
                                          {tongCaloNgay > lichSuTuVanHienTai.nhu_cau_calo ? ' +' : ' '}
                                          {(tongCaloNgay - lichSuTuVanHienTai.nhu_cau_calo).toFixed(0)} kcal
                                        </Text>
                                      </Text>
                                    </Col>
                                  </Row>
                                )}
                              </Card>
                            );
                          }
                          return null;
                        })()}
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="cham_soc" label="Hướng dẫn chăm sóc">
                        <TextArea rows={3} placeholder="Nhập hướng dẫn chăm sóc..." />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="ghi_chu" label="Ghi chú">
                        <TextArea rows={2} placeholder="Nhập ghi chú..." />
                      </Form.Item>
                    </Col>
                  </Row>
                )
              },
              ...(lichSuTuVanTruoc.length > 0 ? [{
                key: '2',
                label: `Lịch sử tư vấn (${lichSuTuVanTruoc.length})`,
                children: (
                  <List
                    dataSource={lichSuTuVanTruoc}
                    renderItem={(ls, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<CalendarOutlined />} />}
                          title={
                            <Space>
                              <Text strong>
                                {new Date(ls.thoi_gian_tu_van).toLocaleDateString("vi-VN")}
                              </Text>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              {ls.ke_hoach_dinh_duong && <Text><strong>Kế hoạch:</strong> {ls.ke_hoach_dinh_duong}</Text>}
                              {ls.nhu_cau_calo && <Text><strong>Nhu cầu calo:</strong> {ls.nhu_cau_calo} kcal/ngày</Text>}
                              {ls.ghi_chu && <Text><strong>Ghi chú:</strong> {ls.ghi_chu}</Text>}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )
              }] : []),
              {
                key: '3',
                label: `Theo dõi tiến độ${theoDoiTienDo.length > 0 ? ` (${theoDoiTienDo.length})` : ''}`,
                children: (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div style={{ textAlign: 'right' }}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenTheoDoiTienDo}
                        disabled={!lichSuTuVanHienTai && !benhNhanFull}
                      >
                        Thêm theo dõi tiến độ
                      </Button>
                    </div>
                    {theoDoiTienDo.length > 0 ? (
                      <>
                        <Card title="Biểu đồ tiến độ" size="small">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={theoDoiTienDo.map(td => ({
                              ...td,
                              ngay_kham: dayjs(td.ngay_kham).format('DD/MM/YYYY')
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="ngay_kham" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip />
                              <Legend />
                              <Line yAxisId="left" type="monotone" dataKey="can_nang" stroke="#8884d8" name="Cân nặng (kg)" />
                              <Line yAxisId="left" type="monotone" dataKey="bmi" stroke="#82ca9d" name="BMI" />
                              <Line yAxisId="right" type="monotone" dataKey="vong_eo" stroke="#ffc658" name="Vòng eo (cm)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </Card>
                        <Card title="Lịch sử theo dõi" size="small">
                          <Table
                            dataSource={theoDoiTienDo}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            columns={[
                              {
                                title: 'Ngày khám',
                                dataIndex: 'ngay_kham',
                                key: 'ngay_kham',
                                render: (val) => dayjs(val).format('DD/MM/YYYY')
                              },
                              {
                                title: 'Cân nặng (kg)',
                                dataIndex: 'can_nang',
                                key: 'can_nang',
                                render: (val) => val ? `${val} kg` : '-'
                              },
                              {
                                title: 'Chiều cao (cm)',
                                dataIndex: 'chieu_cao',
                                key: 'chieu_cao',
                                render: (val) => val ? `${val} cm` : '-'
                              },
                              {
                                title: 'BMI',
                                dataIndex: 'bmi',
                                key: 'bmi',
                                render: (val) => val ? val.toFixed(1) : '-'
                              },
                              {
                                title: 'Vòng eo (cm)',
                                dataIndex: 'vong_eo',
                                key: 'vong_eo',
                                render: (val) => val ? `${val} cm` : '-'
                              },
                              {
                                title: 'Mỡ cơ thể (%)',
                                dataIndex: 'mo_co_the',
                                key: 'mo_co_the',
                                render: (val) => val ? `${val}%` : '-'
                              },
                              {
                                title: 'Ghi chú',
                                dataIndex: 'ghi_chu',
                                key: 'ghi_chu',
                                ellipsis: true
                              }
                            ]}
                            rowKey="id_theo_doi"
                          />
                        </Card>
                      </>
                    ) : (
                      <Alert
                        message="Chưa có dữ liệu theo dõi"
                        description="Nhấn 'Thêm theo dõi tiến độ' để bắt đầu theo dõi tiến độ dinh dưỡng của bệnh nhân."
                        type="info"
                        showIcon
                      />
                    )}
                  </Space>
                )
              }
            ]}
          />
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            {appointment?.trang_thai === "da_hoan_thanh" && lichSuTuVanHienTai ? (
              <Button onClick={() => setModalLichSuOpen(false)}>
                Đóng
              </Button>
            ) : (
              <>
                <Button onClick={() => setModalLichSuOpen(false)} style={{ marginRight: 8 }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {lichSuTuVanHienTai ? "Cập nhật" : lichSuTamThoi ? "Cập nhật" : "Lưu thông tin"}
                </Button>
              </>
            )}
          </div>
        </Form>
      </Modal>

      {/* Modal Dịch vụ - GIỮ NGUYÊN */}
      <Modal
        title="Chọn dịch vụ"
        open={modalDichVu}
        onCancel={() => setModalDichVu(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setModalDichVu(false)}>
            Đóng
          </Button>,
          <Button key="add" type="dashed" icon={<PlusOutlined />} onClick={handleAddDichVuRow}>
            Thêm dịch vụ
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {dichVuTamThoi.map((row, i) => (
            <Card 
              key={i} 
              size="small" 
              title={`Dịch vụ ${i + 1}`}
              extra={
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleRemoveDichVu(i)}
                  size="small"
                />
              }
            >
              <Row gutter={16} align="middle">
                <Col span={10}>
                  <Select
                    showSearch
                    placeholder="Chọn dịch vụ"
                    value={row.id_dich_vu}
                    onChange={(value) => handleChangeDichVu(i, "id_dich_vu", value)}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={dsDichVu.map(dv => ({
                      value: dv.id_dich_vu,
                      label: `${dv.ten_dich_vu} - ${dv.don_gia?.toLocaleString()} VND`
                    }))}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    type="number"
                    placeholder="Số lượng"
                    value={row.so_luong}
                    onChange={(e) => handleChangeDichVu(i, "so_luong", parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    type="number"
                    placeholder="Đơn giá"
                    value={row.don_gia}
                    onChange={(e) => handleChangeDichVu(i, "don_gia", parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Thành tiền"
                    value={(row.so_luong * row.don_gia).toLocaleString() + ' VND'}
                    readOnly
                    style={{ fontWeight: 'bold', color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </Card>
          ))}
          
          {dichVuTamThoi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <PlusOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Chưa có dịch vụ nào được chọn
              </Text>
            </div>
          )}

          {dichVuTamThoi.length > 0 && (
            <Card size="small">
              <Statistic
                title="Tổng tiền dịch vụ"
                value={totalDichVu}
                suffix="VND"
                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
              />
            </Card>
          )}
        </Space>
      </Modal>

      {/* Modal xem dịch vụ (chỉ xem) - GIỮ NGUYÊN */}
      <Modal
        title="Dịch vụ đã sử dụng"
        open={viewDichVu}
        onCancel={() => setViewDichVu(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewDichVu(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {dichVuTamThoi.length > 0 ? (
            <>
              <Table
                size="small"
                pagination={false}
                dataSource={dichVuTamThoi.map((d, i) => ({
                  key: i,
                  stt: i + 1,
                  ten_dich_vu: d.ten_dich_vu,
                  so_luong: d.so_luong,
                  don_gia: d.don_gia?.toLocaleString(),
                  thanh_tien: (d.so_luong * d.don_gia)?.toLocaleString()
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên dịch vụ', dataIndex: 'ten_dich_vu' },
                  { title: 'SL', dataIndex: 'so_luong', width: 80, align: 'center' },
                  { title: 'Đơn giá', dataIndex: 'don_gia', width: 120, align: 'right' },
                  { title: 'Thành tiền', dataIndex: 'thanh_tien', width: 120, align: 'right' },
                ]}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row style={{ background: '#f0f8ff' }}>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Tổng tiền dịch vụ:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong type="danger">{totalDichVu.toLocaleString()} VND</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <HeartOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Không có dịch vụ nào được sử dụng
              </Text>
            </div>
          )}
        </Space>
      </Modal>

      {/* Modal Preview Hóa đơn - GIỮ NGUYÊN */}
      <Modal
        title="Xem trước hóa đơn"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setShowPreview(false)}>
            Đóng
          </Button>,
          <Button key="export" type="primary" icon={<PrinterOutlined />} onClick={handleExportPdf}>
            Xuất PDF
          </Button>,
        ]}
      >
        <div id="invoicePreview" style={{ padding: 20, background: 'white', border: '1px solid #f0f0f0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '2px solid #1890ff', paddingBottom: 20, position: 'relative' }}>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>PHÒNG KHÁM MEDPRO</Title>
            <Text style={{ fontSize: 16, color: '#666' }}>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</Text>
            <br />
            <Text style={{ fontSize: 16, color: '#666' }}>Điện thoại: 028 1234 5678</Text>
            
            {/* QR Code */}
            {hoaDon?.id_hoa_don && (
              <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'center' }}>
                <QRCodeSVG 
                  value={hoaDon.id_hoa_don.toString()}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#666' }}>
                  Mã: {hoaDon.id_hoa_don}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin bệnh nhân */}
          <Card title="THÔNG TIN BỆNH NHÂN" size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 8]}>
              {hoaDon?.id_hoa_don && (
                <Col span={8}><Text strong>Mã hóa đơn:</Text> {hoaDon.id_hoa_don}</Col>
              )}
              <Col span={8}><Text strong>Mã cuộc hẹn:</Text> {id_cuoc_hen}</Col>
              <Col span={8}><Text strong>Họ tên:</Text> {hoSo?.ho_ten || benhNhanFull?.ho_ten}</Col>
              <Col span={8}><Text strong>Giới tính:</Text> {hoSo?.gioi_tinh || benhNhanFull?.gioi_tinh}</Col>
              <Col span={8}><Text strong>Tuổi:</Text> {hoSo?.tuoi || (benhNhanFull?.ngay_sinh ? calculateAge(benhNhanFull.ngay_sinh) : 'N/A')}</Col>
              <Col span={8}><Text strong>Mã BHYT:</Text> {hoSo?.ma_BHYT || benhNhanFull?.ma_BHYT || 'Không có'}</Col>
              <Col span={8}><Text strong>Ngày khám:</Text> {hoaDon?.thoi_gian_tao ? new Date(hoaDon.thoi_gian_tao).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</Col>
              <Col span={24}><Text strong>Địa chỉ:</Text> {hoSo?.dia_chi || benhNhanFull?.dia_chi || 'Không có'}</Col>
            </Row>
          </Card>

          {/* Thông tin tư vấn dinh dưỡng */}
          {lichSuTuVanHienTai && (
            <Card title="THÔNG TIN TƯ VẤN DINH DƯỠNG" size="small" style={{ marginBottom: 20 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Kế hoạch dinh dưỡng:</Text>
                  <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                    {lichSuTuVanHienTai?.ke_hoach_dinh_duong || 'Không có'}
                  </div>
                </Col>
                <Col span={24}>
                  <Text strong>Nhu cầu calo:</Text>
                  <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                    {lichSuTuVanHienTai?.nhu_cau_calo ? `${lichSuTuVanHienTai.nhu_cau_calo} kcal/ngày` : 'Không có'}
                  </div>
                </Col>
                <Col span={24}>
                  <Text strong>Hướng dẫn chăm sóc:</Text>
                  <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                    {lichSuTuVanHienTai?.cham_soc || 'Không có'}
                  </div>
                </Col>
                {lichSuTuVanHienTai?.ghi_chu && (
                  <Col span={24}>
                    <Text strong>Ghi chú:</Text>
                    <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                      {lichSuTuVanHienTai.ghi_chu}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}
          {/* Dịch vụ */}
          {dichVuTamThoi.length > 0 && (
            <Card title="DỊCH VỤ SỬ DỤNG" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={dichVuTamThoi.map((d, i) => ({
                  key: i,
                  stt: i + 1,
                  ten: d.dich_vu?.ten_dich_vu || d.ten_dich_vu || 'N/A',
                  sl: d.so_luong,
                  dongia: parseFloat(d.don_gia || 0).toLocaleString('vi-VN'),
                  thanhtien: (parseFloat(d.so_luong || 0) * parseFloat(d.don_gia || 0)).toLocaleString('vi-VN')
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên dịch vụ', dataIndex: 'ten' },
                  { title: 'SL', dataIndex: 'sl', width: 80, align: 'center' },
                  { title: 'Đơn giá (VNĐ)', dataIndex: 'dongia', width: 120, align: 'right' },
                  { title: 'Thành tiền (VNĐ)', dataIndex: 'thanhtien', width: 140, align: 'right' },
                ]}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row style={{ background: '#f0f8ff' }}>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Tổng tiền dịch vụ:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong type="danger">{parseFloat(totalDichVu || 0).toLocaleString('vi-VN')} VNĐ</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          )}


          {/* Tổng kết */}
          <Card size="small" style={{ background: '#f6ffed' }}>
            <Row justify="end">
              <Col>
                <Space direction="vertical" size="small" align="end">
                  {dichVuTamThoi.length > 0 && (
                    <Text>Tổng tiền dịch vụ: <Text strong>{parseFloat(totalDichVu || 0).toLocaleString('vi-VN')} VNĐ</Text></Text>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                  <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
                    TỔNG CỘNG: {parseFloat(tongCong || 0).toLocaleString('vi-VN')} VNĐ
                  </Title>
                  {hoaDon?.trang_thai && (
                    <Text type={hoaDon.trang_thai === 'da_thanh_toan' ? 'success' : 'warning'}>
                      Trạng thái: {hoaDon.trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Text>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>
              Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
            </Text>
            <Text style={{ fontSize: 12 }}>
              Hóa đơn được tạo vào lúc {hoaDon?.thoi_gian_tao ? new Date(hoaDon.thoi_gian_tao).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}
            </Text>
          </div>
        </div>
      </Modal>

      {/* Modal Thêm món ăn */}
      <Modal
        title={`Thêm món ăn - Bữa ${buaAnDangChon === 'sang' ? 'sáng' : buaAnDangChon === 'trua' ? 'trưa' : buaAnDangChon === 'chieu' ? 'chiều' : 'tối'}`}
        open={modalThucDonOpen}
        onCancel={() => {
          setModalThucDonOpen(false);
          formThucDon.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={formThucDon}
          layout="vertical"
          onFinish={handleAddThucDon}
        >
          <Form.Item
            name="id_mon_an"
            label="Chọn món ăn tham khảo (tùy chọn)"
            tooltip="Chọn món ăn từ danh sách để tự động điền thông tin dinh dưỡng"
          >
            <Select
              placeholder="Chọn món ăn tham khảo..."
              showSearch
              allowClear
              notFoundContent={dsMonAnThamKhao.length === 0 ? "Đang tải danh sách món ăn..." : "Không tìm thấy"}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                if (value) {
                  const monAn = dsMonAnThamKhao.find(m => m.id_mon_an === value);
                  if (monAn) {
                    const khoiLuongChuan = monAn.khoi_luong_chuan || 100;
                    formThucDon.setFieldsValue({
                      ten_mon: monAn.ten_mon,
                      khoi_luong: khoiLuongChuan,
                      calo: monAn.calo,
                      protein: monAn.protein,
                      carb: monAn.carb,
                      fat: monAn.fat,
                      fiber: monAn.fiber
                    });
                  }
                } else {
                  // Clear values khi bỏ chọn
                  formThucDon.setFieldsValue({
                    ten_mon: formThucDon.getFieldValue('ten_mon'),
                    khoi_luong: undefined,
                    calo: undefined,
                    protein: undefined,
                    carb: undefined,
                    fat: undefined,
                    fiber: undefined
                  });
                }
              }}
              options={dsMonAnThamKhao.map(mon => ({
                value: mon.id_mon_an,
                label: `${mon.ten_mon} (${mon.calo} kcal/100g)`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="ten_mon"
            label="Tên món ăn"
            rules={[{ required: true, message: 'Vui lòng nhập tên món ăn' }]}
          >
            <Input placeholder="Nhập tên món ăn" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="khoi_luong"
                label="Khối lượng (g)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Khối lượng"
                  min={0}
                  step={10}
                  onChange={(value) => {
                    // Tự động tính lại dinh dưỡng khi thay đổi khối lượng nếu đã chọn món ăn tham khảo
                    const idMonAn = formThucDon.getFieldValue('id_mon_an');
                    if (idMonAn && value) {
                      const monAn = dsMonAnThamKhao.find(m => m.id_mon_an === idMonAn);
                      if (monAn) {
                        const khoiLuongChuan = monAn.khoi_luong_chuan || 100;
                        const tiLe = value / khoiLuongChuan;
                        formThucDon.setFieldsValue({
                          calo: Number((monAn.calo * tiLe).toFixed(2)),
                          protein: Number((monAn.protein * tiLe).toFixed(2)),
                          carb: Number((monAn.carb * tiLe).toFixed(2)),
                          fat: Number((monAn.fat * tiLe).toFixed(2)),
                          fiber: Number((monAn.fiber * tiLe).toFixed(2))
                        });
                      }
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="thoi_gian_an"
                label="Thời gian ăn"
              >
                <Input placeholder="VD: 07:00" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thông tin dinh dưỡng (tự động hoặc nhập thủ công)</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="calo"
                label="Calo (kcal)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Calo"
                  min={0}
                  step={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="protein"
                label="Protein (g)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Protein"
                  min={0}
                  step={0.1}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carb"
                label="Carbohydrate (g)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Carb"
                  min={0}
                  step={0.1}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fat"
                label="Fat (g)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Fat"
                  min={0}
                  step={0.1}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fiber"
                label="Chất xơ (g)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Fiber"
                  min={0}
                  step={0.1}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ghi_chu"
            label="Ghi chú"
          >
            <TextArea rows={2} placeholder="Ghi chú về món ăn..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button
              onClick={() => {
                setModalThucDonOpen(false);
                formThucDon.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Thêm món
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Theo dõi tiến độ */}
      <Modal
        title="Thêm theo dõi tiến độ"
        open={modalTheoDoiTienDoOpen}
        onCancel={() => {
          setModalTheoDoiTienDoOpen(false);
          formTheoDoiTienDo.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={formTheoDoiTienDo}
          layout="vertical"
          onFinish={handleSubmitTheoDoiTienDo}
        >
          <Form.Item
            name="ngay_kham"
            label="Ngày khám"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
            getValueFromEvent={(value) => {
              // DatePicker always returns dayjs object or null/undefined
              return value || undefined;
            }}
            normalize={(value) => {
              if (!value || value === null || value === undefined) return undefined;
              // Check if value is already a dayjs object
              if (value && typeof value.isValid === 'function') {
                return value.isValid() ? value : undefined;
              }
              // Convert string or other types to dayjs object
              if (typeof value === 'string' || value instanceof Date) {
                const dayjsValue = dayjs(value);
                return dayjsValue.isValid() ? dayjsValue : undefined;
              }
              return undefined;
            }}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày khám"
              allowClear
            />
          </Form.Item>

          <Divider orientation="left">Chỉ số cơ thể</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="can_nang"
                label="Cân nặng (kg)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Cân nặng"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chieu_cao"
                label="Chiều cao (cm)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Chiều cao"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Số đo cơ thể</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="vong_eo"
                label="Vòng eo (cm)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Vòng eo"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vong_nguc"
                label="Vòng ngực (cm)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Vòng ngực"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vong_dui"
                label="Vòng đùi (cm)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Vòng đùi"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thành phần cơ thể</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="mo_co_the"
                label="Mỡ cơ thể (%)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Mỡ cơ thể"
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="khoi_co"
                label="Khối cơ (kg)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Khối cơ"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="nuoc_trong_co_the"
                label="Nước trong cơ thể (%)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nước trong cơ thể"
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ghi_chu"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Ghi chú về theo dõi tiến độ..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button
              onClick={() => {
                setModalTheoDoiTienDoOpen(false);
                formTheoDoiTienDo.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu theo dõi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default NutritionistAppointmentDetail;