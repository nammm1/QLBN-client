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
  Select,
  Table,
  Tabs,
  Collapse,
  Statistic,
  Steps,
  message
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
  ExperimentOutlined
} from "@ant-design/icons";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan"; 
import apiHoSoKhamBenh from "../../../api/HoSoKhamBenh";
import apiLichSuKham from "../../../api/LichSuKham"; 
import apiDonThuoc from "../../../api/DonThuoc";
import apiThuoc from "../../../api/Thuoc";
import apiHoaDon from "../../../api/HoaDon";
import apiDichVu from "../../../api/DichVu";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import apiChiDinhXetNghiem from "../../../api/ChiDinhXetNghiem";
import apiKetQuaXetNghiem from "../../../api/KetQuaXetNghiem";
import { calculateAge } from "../../../utils/calculateAge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceHeader, InvoiceSignatureSection } from "../../../components/Invoice/InvoiceBranding";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

const DoctorAppointmentDetail = () => {
  const { id_cuoc_hen } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [benhNhanFull, setBenhNhanFull] = useState(null);
  const [hoSo, setHoSo] = useState(null);
  const [lichSuKhamHienTai, setLichSuKhamHienTai] = useState(null);
  const [lichSuKhamTruoc, setLichSuKhamTruoc] = useState([]);
  const [dsThuoc, setDsThuoc] = useState([]);
  const [donThuocTamThoi, setDonThuocTamThoi] = useState([]);
  const [ghiChuDonThuoc, setGhiChuDonThuoc] = useState("");
  const [dsDichVu, setDsDichVu] = useState([]);
  const [dichVuTamThoi, setDichVuTamThoi] = useState([]);
  const [hoaDon, setHoaDon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Thêm state cho xét nghiệm
  const [chiDinhXetNghiem, setChiDinhXetNghiem] = useState([]);
  const [ketQuaXetNghiem, setKetQuaXetNghiem] = useState({});
  const [modalChiDinhXN, setModalChiDinhXN] = useState(false);
  const [viewKetQuaXN, setViewKetQuaXN] = useState(false);
  const [selectedChiDinh, setSelectedChiDinh] = useState(null);

  // Modal states
  const [modalHoSoOpen, setModalHoSoOpen] = useState(false);
  const [modalLichSuOpen, setModalLichSuOpen] = useState(false);
  const [modalDonThuoc, setModalDonThuoc] = useState(false);
  const [modalDichVu, setModalDichVu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewDonThuoc, setViewDonThuoc] = useState(false);
  const [viewDichVu, setViewDichVu] = useState(false);

  const [formHoSo] = Form.useForm();
  const [formLichSu] = Form.useForm();
  const [formChiDinhXN] = Form.useForm();

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
      const appt = await apiCuocHenKham.getById(id_cuoc_hen);
      setAppointment(appt);

      // Nếu cuộc hẹn đã hủy, không cho xem chi tiết -> quay lại danh sách
      if (appt?.trang_thai === "da_huy") {
        message.warning("Cuộc hẹn này đã bị hủy. Bạn không thể xem chi tiết.");
        navigate("/doctor/appointments");
        return;
      }

      if (appt?.id_benh_nhan) {
        const bnFull = await apiBenhNhan.getById(appt.id_benh_nhan);
        setBenhNhanFull(bnFull);

        const hs = await apiHoSoKhamBenh.getByBenhNhan(appt.id_benh_nhan);
        setHoSo(hs);

        const lichSuTruoc = await apiLichSuKham.getLichSuKhamByBenhNhan(appt.id_benh_nhan);
        setLichSuKhamTruoc(lichSuTruoc || []);

        // Lấy chỉ định xét nghiệm (cho cả 2 trạng thái)
        const chiDinhData = await apiChiDinhXetNghiem.getByCuocHen(id_cuoc_hen);
        setChiDinhXetNghiem(chiDinhData || []);

        // Lấy kết quả xét nghiệm cho từng chỉ định
        if (chiDinhData && chiDinhData.length > 0) {
          const ketQuaMap = {};
          const ketQuaPromises = chiDinhData.map(async (chiDinh) => {
            try {
              // API trả về null nếu chưa có kết quả, không throw error
              const ketQua = await apiKetQuaXetNghiem.getByChiDinh(chiDinh.id_chi_dinh);
              
              // Nếu ketQua là null, không có kết quả
              if (!ketQua) {
                return null;
              }
              
              // Nếu có thuộc tính data, lấy data
              if (ketQua.data) {
                return { 
                  chiDinhId: chiDinh.id_chi_dinh, 
                  data: ketQua.data 
                };
              }
              
              // Nếu không có, có thể response là data trực tiếp
              return { 
                chiDinhId: chiDinh.id_chi_dinh, 
                data: ketQua 
              };
            } catch (error) {
              // Chỉ log lỗi thực sự (không phải lỗi do chưa có kết quả)
              console.error(`Lỗi khi lấy kết quả cho ${chiDinh.id_chi_dinh}:`, error);
              return null;
            }
          });
        
          const ketQuaResults = await Promise.all(ketQuaPromises);

          // Xây dựng map kết quả
          ketQuaResults.forEach(result => {
            if (result && result.data) {
              ketQuaMap[result.chiDinhId] = result.data;
            }
          });

          setKetQuaXetNghiem(ketQuaMap);
        }

        if (appt.trang_thai === "da_hoan_thanh") {
          const lichSuHienTai = await apiLichSuKham.getLichSuKhamByCuocHen(appt.id_cuoc_hen);
          setLichSuKhamHienTai(lichSuHienTai);
          
          // Lấy đơn thuốc đã lưu
          if (lichSuHienTai) {
            try {
              const donThuocData = await apiDonThuoc.getByLichSu(lichSuHienTai.id_lich_su);
              if (donThuocData) {
                setDonThuocTamThoi(donThuocData.chi_tiet || []);
                setGhiChuDonThuoc(donThuocData.ghi_chu || "");
              }
            } catch (error) {
              console.error("Lỗi khi lấy đơn thuốc:", error);
              // Không hiển thị lỗi nếu không tìm thấy đơn thuốc
            }
          }

          // Lấy dịch vụ đã lưu
          try {
            const HoaDon = await apiHoaDon.getByCuocHenKham(appt.id_cuoc_hen);
            if (HoaDon) {
              setHoaDon(HoaDon.data || HoaDon);
              const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDon.data?.id_hoa_don || HoaDon.id_hoa_don);
              if (ChiTietHoaDonData && ChiTietHoaDonData.data) {
                setDichVuTamThoi(ChiTietHoaDonData.data || []);
              }
            }
          } catch (error) {
            console.error("Lỗi khi lấy dịch vụ:", error);
            // Không hiển thị lỗi nếu không tìm thấy hóa đơn
          }
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id_cuoc_hen]);

  // Tự động load dữ liệu vào form hồ sơ khi modal mở
  useEffect(() => {
    if (modalHoSoOpen) {
      if (hoSo) {
        // Nếu có hồ sơ, load dữ liệu hồ sơ vào form
        formHoSo.setFieldsValue({
          ho_ten: hoSo.ho_ten || '',
          so_dien_thoai: hoSo.so_dien_thoai || '',
          tuoi: hoSo.tuoi ? Number(hoSo.tuoi) : '',
          gioi_tinh: hoSo.gioi_tinh || '',
          dan_toc: hoSo.dan_toc || '',
          ma_BHYT: hoSo.ma_BHYT || '',
          dia_chi: hoSo.dia_chi || ''
        });
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
    }
    // Không reset form khi đóng modal để tránh warning
    // Form sẽ được reset khi mở lại modal
  }, [modalHoSoOpen, hoSo, benhNhanFull, formHoSo]);

  // Hàm xử lý chỉ định xét nghiệm
  const handleChiDinhXetNghiem = async (values) => {
    try {
      await apiChiDinhXetNghiem.create({
        id_cuoc_hen: id_cuoc_hen,
        ten_dich_vu: values.ten_dich_vu,
        yeu_cau_ghi_chu: values.yeu_cau_ghi_chu,
        id_bac_si_chi_dinh: userInfo.user.id_nguoi_dung,
        trang_thai: "cho_xy_ly"
      });
      message.success("Chỉ định xét nghiệm thành công");
      setModalChiDinhXN(false);
      formChiDinhXN.resetFields();
      
      // Refresh data
      const chiDinhData = await apiChiDinhXetNghiem.getByCuocHen(id_cuoc_hen);
      setChiDinhXetNghiem(chiDinhData || []);
    } catch (error) {
      console.error("Lỗi khi chỉ định xét nghiệm:", error);
      message.error("Có lỗi xảy ra khi chỉ định xét nghiệm");
    }
  };

  // Hàm xem kết quả xét nghiệm
  const handleViewKetQua = (chiDinh) => {
    setSelectedChiDinh(chiDinh);
    setViewKetQuaXN(true);
  };

  // Các hàm xử lý cũ giữ nguyên
  const handleSubmitHoSo = async (values) => {
    try {
      if (!benhNhanFull?.id_benh_nhan) {
        message.error("Không tìm thấy thông tin bệnh nhân");
        return;
      }

      if (!hoSo) {
        const newHoSo = await apiHoSoKhamBenh.create({
          id_benh_nhan: benhNhanFull.id_benh_nhan,
          id_bac_si_tao: userInfo.user.id_nguoi_dung,
          ...values
        });
        setHoSo(newHoSo);
        message.success("Tạo hồ sơ thành công");
      } else {
        await apiHoSoKhamBenh.update(hoSo.id_ho_so, values);
        const updated = await apiHoSoKhamBenh.getByBenhNhan(benhNhanFull.id_benh_nhan);
        setHoSo(updated);
        message.success("Cập nhật hồ sơ thành công");
      }
      setModalHoSoOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      message.error("Có lỗi xảy ra khi lưu hồ sơ");
    }
  };

  const handleSubmitLichSuKham = async (values) => {
    try {
      if (!benhNhanFull?.id_benh_nhan) {
        message.error("Không tìm thấy thông tin bệnh nhân");
        return;
      }

      if (!lichSuKhamHienTai) {
        const newLichSu = await apiLichSuKham.createLichSuKham({
          id_benh_nhan: benhNhanFull.id_benh_nhan,
          id_bac_si: userInfo.user.id_nguoi_dung,
          id_cuoc_hen: id_cuoc_hen,
          id_ho_so: hoSo?.id_ho_so,
          ...values
        });
        setLichSuKhamHienTai(newLichSu);
        message.success("Ghi thông tin khám thành công");
      } else {
        await apiLichSuKham.updateLichSuKham(lichSuKhamHienTai.id_lich_su, values);
        const updated = await apiLichSuKham.getLichSuKhamById(lichSuKhamHienTai.id_lich_su);
        setLichSuKhamHienTai(updated);
        message.success("Cập nhật thông tin khám thành công");
      }
      setModalLichSuOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi lưu thông tin khám");
    }
  };

  const handleOpenDichVu = async () => {
    try {
      const res = await apiDichVu.getAll();
      setDsDichVu(res.data || []);
      setModalDichVu(true);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi khi tải danh sách dịch vụ");
    }
  };

  const handleOpenDonThuoc = async () => {
    try {
      const res = await apiThuoc.getAllThuoc();
      setDsThuoc(res || []);
      setModalDonThuoc(true);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi khi tải danh sách thuốc");
    }
  };

  const handleRemoveThuoc = (index) => {
    setDonThuocTamThoi(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDichVu = (index) => {
    setDichVuTamThoi(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddThuocRow = () => {
    setDonThuocTamThoi([...donThuocTamThoi, { id_thuoc: "", so_luong: 1, lieu_dung: "", tan_suat: "", ghi_chu: "" }]);
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

  const handleChangeThuoc = (index, field, value) => {
    const updated = [...donThuocTamThoi];
    updated[index][field] = value;
    if (field === "id_thuoc") {
      const selected = dsThuoc.find(t => t.id_thuoc === value);
      if (selected) {
        updated[index] = { ...updated[index], don_gia: selected.don_gia || 0, ten_thuoc: selected.ten_thuoc, ham_luong: selected.ham_luong };
      }
    }
    setDonThuocTamThoi(updated);
  };

  const handleViewDonThuoc = async () => {
    try {
      if (appointment.trang_thai === "da_hoan_thanh" && lichSuKhamHienTai) {
        const donThuocData = await apiDonThuoc.getByLichSu(lichSuKhamHienTai.id_lich_su);
        if (donThuocData) {
          setDonThuocTamThoi(donThuocData.chi_tiet || []);
          setGhiChuDonThuoc(donThuocData.ghi_chu || "");
        }
      }
      setViewDonThuoc(true);
    } catch (error) {
      console.error("Lỗi khi tải đơn thuốc:", error);
      message.error("Không thể tải đơn thuốc");
    }
  };

  const handleViewDichVu = async () => {
    try {
      if (appointment.trang_thai === "da_hoan_thanh") {
        const HoaDon = await apiHoaDon.getByCuocHenKham(id_cuoc_hen);
        if (HoaDon) {
          const ChiTietHoaDonData = await apiChiTietHoaDon.getByHoaDon(HoaDon.id_hoa_don);
          if (ChiTietHoaDonData) {
            setDichVuTamThoi(ChiTietHoaDonData.data || []);
          }
        }
      }
      setViewDichVu(true);
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error);
      message.error("Không thể tải danh sách dịch vụ");
    }
  };

  const handleExportPdf = async () => {
    try {
      // Nếu đã hoàn thành thì chỉ in, không xử lý logic nữa
      if (appointment?.trang_thai === "da_hoan_thanh") {
        const input = document.getElementById("invoicePreview");
        if (!input) return;

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

        pdf.save(`HoaDon_${id_cuoc_hen}.pdf`);
        message.success("Xuất hóa đơn thành công");
        setShowPreview(false);
        return;
      }

      // Logic xử lý khi chưa hoàn thành
      // Kiểm tra và lưu đơn thuốc - kiểm tra tất cả các phần tử có id_thuoc không
      const coDonThuoc = donThuocTamThoi.length > 0 && donThuocTamThoi.some(item => item.id_thuoc && item.id_thuoc !== "" && item.id_thuoc !== null && item.id_thuoc !== undefined);
      if (coDonThuoc) {
        // Lọc ra chỉ những thuốc có id_thuoc hợp lệ
        const donThuocHopLe = donThuocTamThoi.filter(item => item.id_thuoc && item.id_thuoc !== "" && item.id_thuoc !== null && item.id_thuoc !== undefined);
        if (donThuocHopLe.length > 0) {
          await apiDonThuoc.create({
            id_ho_so: hoSo?.id_ho_so, 
            id_lich_su : lichSuKhamHienTai?.id_lich_su,
            ghi_chu: ghiChuDonThuoc || "",
            trang_thai: "dang_su_dung",
            chi_tiet: donThuocHopLe
          });
        }
      }

      // Kiểm tra và lưu dịch vụ - kiểm tra tất cả các phần tử có id_dich_vu không
      const coDichVu = dichVuTamThoi.length > 0 && dichVuTamThoi.some(item => item.id_dich_vu && item.id_dich_vu !== "" && item.id_dich_vu !== null && item.id_dich_vu !== undefined);
      if (coDichVu) {
        // Lọc ra chỉ những dịch vụ có id_dich_vu hợp lệ
        const dichVuHopLe = dichVuTamThoi.filter(item => item.id_dich_vu && item.id_dich_vu !== "" && item.id_dich_vu !== null && item.id_dich_vu !== undefined);
        if (dichVuHopLe.length > 0) {
          const tong_tien = dichVuHopLe.reduce(
            (sum, dv) => sum + (dv.so_luong || 0) * (dv.don_gia || 0),
            0
          );
          const hoaDonCreated = await apiHoaDon.create({
            id_cuoc_hen_kham: id_cuoc_hen,
            tong_tien,
            chi_tiet: dichVuHopLe,
          });
          setHoaDon(hoaDonCreated.data || hoaDonCreated);
        }
      }

      // Update trạng thái cuộc hẹn
      await apiCuocHenKham.updateTrangThai(id_cuoc_hen, "da_hoan_thanh");

      const input = document.getElementById("invoicePreview");
      if (!input) return;

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

      pdf.save(`HoaDon_${id_cuoc_hen}.pdf`);
      message.success("Xuất hóa đơn thành công");
      
      // Refresh lại dữ liệu sau khi lưu thành công
      setShowPreview(false);
      await fetchData();

    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
      message.error("Có lỗi xảy ra khi xuất hóa đơn: " + (err.response?.data?.message || err.message));
    }
  };

  const handleFinish = async () => {
    try {
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra khi xem trước hóa đơn");
    }
  };

  const totalDichVu = dichVuTamThoi
    .filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined)
    .reduce((sum, dv) => sum + (dv.so_luong * (dv.don_gia || 0)), 0);
  const totalThuoc = donThuocTamThoi
    .filter(t => t.id_thuoc && t.id_thuoc !== "" && t.id_thuoc !== null && t.id_thuoc !== undefined)
    .reduce((sum, t) => sum + (t.so_luong * (t.don_gia || t.thuoc?.don_gia || 0)), 0);
  const tongCong = totalDichVu + totalThuoc;

  const doctorProfile = appointment?.bac_si || userInfo?.user || {};
  const doctorFullName = doctorProfile?.ho_ten || "................................";
  const doctorSpecialization =
    doctorProfile?.chuc_danh ||
    doctorProfile?.chuyen_mon ||
    doctorProfile?.chuyen_nganh ||
    "Bác sĩ phụ trách";
  const doctorEmail = doctorProfile?.email || "Chưa cập nhật";
  const doctorPhone = doctorProfile?.so_dien_thoai || "Chưa cập nhật";

  const invoiceIssuedAt = hoaDon?.thoi_gian_tao
    ? new Date(hoaDon.thoi_gian_tao).toLocaleString("vi-VN")
    : new Date().toLocaleString("vi-VN");
  const appointmentTime = appointment?.thoi_gian_bat_dau
    ? new Date(appointment.thoi_gian_bat_dau).toLocaleString("vi-VN")
    : invoiceIssuedAt;

  const invoiceMetadata = [
    { label: "Ngày khám", value: appointmentTime },
    { label: "Ngày lập", value: invoiceIssuedAt },
    { label: "Mã cuộc hẹn", value: id_cuoc_hen },
    hoaDon?.trang_thai && {
      label: "Trạng thái",
      value: hoaDon.trang_thai === "da_thanh_toan" ? "Đã thanh toán" : "Chưa thanh toán",
    },
  ].filter(Boolean);

  const patientFullName =
    hoSo?.ho_ten ||
    benhNhanFull?.ho_ten ||
    appointment?.benh_nhan?.ho_ten ||
    "................................";

  const invoiceSignatureSlots = [
    // {
    //   label: "Nhân viên tài chính/Thu ngân",
    //   name: hoaDon?.nhan_vien_thanh_toan?.ho_ten || "................................",
    //   title: hoaDon?.nhan_vien_thanh_toan?.chuc_danh || "Thu ngân",
    //   note: "Ký, ghi rõ họ tên",
    // },
    {
      label: "Bệnh nhân/Người thanh toán",
      name: patientFullName,
      title: "Bệnh nhân/Người thanh toán",
      note: "Ký, ghi rõ họ tên",
    },
    {
      label: "Bác sĩ phụ trách",
      name: doctorFullName,
      title: doctorSpecialization,
      note: "Ký, ghi rõ họ tên & đóng dấu",
    }
  ];

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
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Mã BN" span={1}>
                      <Text strong>{benhNhanFull?.data?.id_benh_nhan || 'N/A'}</Text>
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
                    <span>Thông tin khám bệnh</span>
                  </Space>
                }
                extra={
                  appointment.trang_thai !== "da_hoan_thanh" ? (
                    <Button 
                      type={lichSuKhamHienTai ? "default" : "primary"}
                      icon={lichSuKhamHienTai ? <EditOutlined /> : <PlusOutlined />}
                      onClick={() => {
                        if (lichSuKhamHienTai) {
                          formLichSu.setFieldsValue(lichSuKhamHienTai);
                        }
                        setModalLichSuOpen(true);
                      }}
                      size="small"
                    >
                      {lichSuKhamHienTai ? "Chỉnh sửa" : "Ghi thông tin"}
                    </Button>
                  ) : (
                    <Button 
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        formLichSu.setFieldsValue(lichSuKhamHienTai);
                        setModalLichSuOpen(true);
                      }}
                      size="small"
                    >
                      Xem chi tiết
                    </Button>
                  )
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                {lichSuKhamHienTai ? (
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Lý do khám">
                      <Text>{lichSuKhamHienTai.ly_do_kham || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuẩn đoán">
                      <Text>{lichSuKhamHienTai.chuan_doan || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Kết quả CLS">
                      <Text>{lichSuKhamHienTai.ket_qua_cls || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Điều trị">
                      <Text>{lichSuKhamHienTai.dieu_tri || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chăm sóc">
                      <Text>{lichSuKhamHienTai.cham_soc || "Không có"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                      <Text>{lichSuKhamHienTai.ghi_chu || "Không có"}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">Chưa có thông tin khám bệnh</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Card chỉ định xét nghiệm (HIỆN CHO CẢ 2 TRẠNG THÁI) */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <ExperimentOutlined style={{ color: '#722ed1' }} />
                    <span>Chỉ định xét nghiệm</span>
                  </Space>
                }
                extra={
                  appointment.trang_thai !== "da_hoan_thanh" && (
                    <Button 
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalChiDinhXN(true)}
                      size="small"
                    >
                      Thêm chỉ định
                    </Button>
                  )
                }
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                {chiDinhXetNghiem.length > 0 ? (
                  <List
                    dataSource={chiDinhXetNghiem}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ExperimentOutlined />} />}
                          title={item.ten_dich_vu}
                          description={item.yeu_cau_ghi_chu || "Không có ghi chú"}
                        />
                        <div>
                          {ketQuaXetNghiem[item.id_chi_dinh] ? (
                            <Space>
                              <Tag color="green">Đã có kết quả</Tag>
                              {ketQuaXetNghiem[item.id_chi_dinh].trang_thai_ket_qua && (
                                <Tag color={
                                  ketQuaXetNghiem[item.id_chi_dinh].trang_thai_ket_qua === 'binh_thuong' ? 'green' :
                                  ketQuaXetNghiem[item.id_chi_dinh].trang_thai_ket_qua === 'bat_thuong' ? 'red' :
                                  'orange'
                                }>
                                  {ketQuaXetNghiem[item.id_chi_dinh].trang_thai_ket_qua === 'binh_thuong' ? 'Bình thường' :
                                   ketQuaXetNghiem[item.id_chi_dinh].trang_thai_ket_qua === 'bat_thuong' ? 'Bất thường' :
                                   'Cần xem lại'}
                                </Tag>
                              )}
                              <Button 
                                size="small" 
                                icon={<EyeOutlined />}
                                onClick={() => handleViewKetQua(item)}
                              >
                                Xem kết quả
                              </Button>
                            </Space>
                          ) : (
                            <Tag color="orange">Đang chờ kết quả</Tag>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">Chưa có chỉ định xét nghiệm nào</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Hiển thị đơn thuốc và dịch vụ khi đã hoàn thành */}
            {appointment.trang_thai === "da_hoan_thanh" && (
              <>
                {/* Đơn thuốc đã kê */}
                <Col xs={24}>
                  <Card 
                    title={
                      <Space>
                        <MedicineBoxOutlined style={{ color: '#52c41a' }} />
                        <span>Đơn thuốc đã kê</span>
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={handleViewDonThuoc}
                        size="small"
                      >
                        Xem đơn thuốc
                      </Button>
                    }
                    className="shadow-sm"
                    style={{ borderRadius: 12 }}
                  >
                    {donThuocTamThoi.length > 0 ? (
                      <List
                        size="small"
                        dataSource={donThuocTamThoi.slice(0, 3)}
                        renderItem={(thuoc, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar size="small" icon={<MedicineBoxOutlined />} />}
                              title={`${thuoc.thuoc?.ten_thuoc || thuoc.ten_thuoc || 'Chưa chọn thuốc'}`}
                              description={`Số lượng: ${thuoc.so_luong} - Liều dùng: ${thuoc.lieu_dung}`}
                            />
                          </List.Item>
                        )}
                        footer={
                          donThuocTamThoi.length > 3 && (
                            <Text type="secondary">
                              Và {donThuocTamThoi.length - 3} thuốc khác...
                            </Text>
                          )
                        }
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Text type="secondary">Chưa có đơn thuốc</Text>
                      </div>
                    )}
                  </Card>
                </Col>

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

            {/* Lịch sử khám trước */}
            {lichSuKhamTruoc.length > 0 && (
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <span>Lịch sử khám trước</span>
                    </Space>
                  }
                  className="shadow-sm"
                  style={{ borderRadius: 12 }}
                >
                  <Timeline>
                    {lichSuKhamTruoc.map((ls, index) => (
                      <Timeline.Item
                        key={index}
                        dot={<CalendarOutlined style={{ fontSize: '12px' }} />}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>
                            {new Date(ls.thoi_gian_kham).toLocaleDateString("vi-VN")} - {ls.ly_do_kham}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Chuẩn đoán: {ls.chuan_doan}
                          </Text>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
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
                  <Col span={8}>
                    <Statistic
                      title="Dịch vụ"
                      value={dichVuTamThoi.length}
                      prefix={<MedicineBoxOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Thuốc"
                      value={donThuocTamThoi.length}
                      prefix={<HeartOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Xét nghiệm"
                      value={chiDinhXetNghiem.length}
                      prefix={<ExperimentOutlined />}
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
                        type="primary" 
                        icon={<MedicineBoxOutlined />}
                        onClick={handleOpenDonThuoc}
                        block
                        size="large"
                      >
                        Kê đơn thuốc
                      </Button>
                      <Button 
                        icon={<PlusOutlined />}
                        onClick={handleOpenDichVu}
                        block
                        size="large"
                      >
                        Chọn dịch vụ
                      </Button>
                      <Button 
                        icon={<ExperimentOutlined />}
                        onClick={() => setModalChiDinhXN(true)}
                        block
                        size="large"
                      >
                        Chỉ định XN
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={handleFinish}
                        block
                        size="large"
                        disabled={!lichSuKhamHienTai}
                      >
                        Kết thúc khám
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={handleViewDonThuoc}
                        block
                        size="large"
                      >
                        Xem đơn thuốc
                      </Button>
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
            <Col span={12}>
              <Form.Item
                label="Chẩn đoán"
              >
                <Input 
                  readOnly 
                  value={lichSuKhamHienTai?.chuan_doan || 'Chưa có chẩn đoán'} 
                  placeholder="Chưa có chẩn đoán"
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

      {/* Modal Lịch sử khám - GIỮ NGUYÊN */}
      <Modal
        title={lichSuKhamHienTai ? "Chỉnh sửa thông tin khám" : "Ghi thông tin khám bệnh"}
        open={modalLichSuOpen}
        onCancel={() => setModalLichSuOpen(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={formLichSu}
          layout="vertical"
          onFinish={handleSubmitLichSuKham}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin khám hiện tại" key="1">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="ly_do_kham" label="Lý do khám">
                    <TextArea rows={3} placeholder="Nhập lý do khám..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="chuan_doan" label="Chuẩn đoán">
                    <TextArea rows={3} placeholder="Nhập chuẩn đoán..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="ket_qua_cls" label="Kết quả CLS">
                    <TextArea rows={3} placeholder="Nhập kết quả cận lâm sàng..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="dieu_tri" label="Điều trị">
                    <TextArea rows={3} placeholder="Nhập phương án điều trị..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="cham_soc" label="Chăm sóc">
                    <TextArea rows={3} placeholder="Nhập hướng dẫn chăm sóc..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="ghi_chu" label="Ghi chú">
                    <TextArea rows={2} placeholder="Nhập ghi chú..." />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            
            {lichSuKhamTruoc.length > 0 && (
              <TabPane tab={`Lịch sử khám (${lichSuKhamTruoc.length})`} key="2">
                <List
                  dataSource={lichSuKhamTruoc}
                  renderItem={(ls, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CalendarOutlined />} />}
                        title={
                          <Space>
                            <Text strong>
                              {new Date(ls.thoi_gian_kham).toLocaleDateString("vi-VN")}
                            </Text>
                            <Tag color="blue">{ls.ly_do_kham}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text><strong>Chuẩn đoán:</strong> {ls.chuan_doan}</Text>
                            <Text><strong>Điều trị:</strong> {ls.dieu_tri}</Text>
                            {ls.ghi_chu && <Text><strong>Ghi chú:</strong> {ls.ghi_chu}</Text>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            )}
          </Tabs>
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => setModalLichSuOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {lichSuKhamHienTai ? "Cập nhật" : "Lưu thông tin"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Đơn thuốc - GIỮ NGUYÊN */}
      <Modal
        title="Kê đơn thuốc"
        open={modalDonThuoc}
        onCancel={() => setModalDonThuoc(false)}
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => setModalDonThuoc(false)}>
            Đóng
          </Button>,
          <Button key="add" type="dashed" icon={<PlusOutlined />} onClick={handleAddThuocRow}>
            Thêm thuốc
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {donThuocTamThoi.map((row, i) => (
            <Card 
              key={i} 
              size="small" 
              title={`Thuốc ${i + 1}`}
              extra={
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleRemoveThuoc(i)}
                  size="small"
                />
              }
            >
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Select
                    showSearch
                    placeholder="Chọn thuốc"
                    value={row.id_thuoc}
                    onChange={(value) => handleChangeThuoc(i, "id_thuoc", value)}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={dsThuoc.map(t => ({
                      value: t.id_thuoc,
                      label: `${t.ten_thuoc}`
                    }))}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={3}>
                  <Input
                    type="number"
                    placeholder="Số lượng"
                    value={row.so_luong}
                    onChange={(e) => handleChangeThuoc(i, "so_luong", parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Liều dùng"
                    value={row.lieu_dung}
                    onChange={(e) => handleChangeThuoc(i, "lieu_dung", e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Tần suất"
                    value={row.tan_suat}
                    onChange={(e) => handleChangeThuoc(i, "tan_suat", e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="Ghi chú"
                    value={row.ghi_chu}
                    onChange={(e) => handleChangeThuoc(i, "ghi_chu", e.target.value)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
          
          {donThuocTamThoi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <MedicineBoxOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Chưa có thuốc nào được thêm vào đơn
              </Text>
            </div>
          )}

          <Card title="Ghi chú đơn thuốc" size="small">
            <TextArea
              rows={3}
              value={ghiChuDonThuoc}
              onChange={(e) => setGhiChuDonThuoc(e.target.value)}
              placeholder="Nhập ghi chú cho toàn bộ đơn thuốc..."
            />
          </Card>
        </Space>
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

      {/* Modal xem đơn thuốc (chỉ xem) - GIỮ NGUYÊN */}
      <Modal
        title="Đơn thuốc đã kê"
        open={viewDonThuoc}
        onCancel={() => setViewDonThuoc(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setViewDonThuoc(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {donThuocTamThoi.length > 0 ? (
            donThuocTamThoi.map((row, i) => (
              <Card 
                key={i} 
                size="small" 
                title={`Thuốc ${i + 1}`}
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tên thuốc" span={2}>
                    <Text strong>{row.thuoc?.ten_thuoc || row.ten_thuoc || 'Chưa chọn thuốc'} ({row.ham_luong || row.thuoc?.ham_luong || ''})</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng">
                    <Tag color="blue">{row.so_luong}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Liều dùng">
                    <Text>{row.lieu_dung || 'Không có'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tần suất">
                    <Text>{row.tan_suat || 'Không có'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <Text>{row.ghi_chu || 'Không có'}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <MedicineBoxOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block' }}>
                Chưa có thuốc nào trong đơn
              </Text>
            </div>
          )}

          {ghiChuDonThuoc && (
            <Card title="Ghi chú đơn thuốc" size="small">
              <Text>{ghiChuDonThuoc}</Text>
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

      {/* THÊM MODAL CHỈ ĐỊNH XÉT NGHIỆM */}
      <Modal
        title="Chỉ định xét nghiệm"
        open={modalChiDinhXN}
        onCancel={() => setModalChiDinhXN(false)}
        footer={null}
        width={600}
      >
        <Form
          form={formChiDinhXN}
          layout="vertical"
          onFinish={handleChiDinhXetNghiem}
        >
          <Form.Item
            name="ten_dich_vu"
            label="Tên xét nghiệm"
            rules={[{ required: true, message: 'Vui lòng nhập tên xét nghiệm' }]}
          >
            <Input placeholder="Ví dụ: Xét nghiệm máu, X-quang ngực, Siêu âm..." />
          </Form.Item>
          <Form.Item
            name="yeu_cau_ghi_chu"
            label="Yêu cầu/Ghi chú"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập yêu cầu cụ thể hoặc ghi chú cho xét nghiệm..." 
            />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalChiDinhXN(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Chỉ định
            </Button>
          </div>
        </Form>
      </Modal>

      {/* THÊM MODAL XEM KẾT QUẢ XÉT NGHIỆM */}
      <Modal
        title="Kết quả xét nghiệm"
        open={viewKetQuaXN}
        onCancel={() => setViewKetQuaXN(false)}
        footer={[
          <Button key="close" onClick={() => setViewKetQuaXN(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedChiDinh && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title={selectedChiDinh.ten_dich_vu} size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Yêu cầu">
                  {selectedChiDinh.yeu_cau_ghi_chu || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian chỉ định">
                  {new Date(selectedChiDinh.thoi_gian_chi_dinh).toLocaleString('vi-VN')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh] ? (
              <Card title="Kết quả xét nghiệm" size="small">
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Trạng thái kết quả">
                    {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].trang_thai_ket_qua ? (
                      <Tag color={
                        ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].trang_thai_ket_qua === 'binh_thuong' ? 'green' :
                        ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].trang_thai_ket_qua === 'bat_thuong' ? 'red' :
                        'orange'
                      }>
                        {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].trang_thai_ket_qua === 'binh_thuong' ? 'Bình thường' :
                         ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].trang_thai_ket_qua === 'bat_thuong' ? 'Bất thường' :
                         'Cần xem lại'}
                      </Tag>
                    ) : (
                      <Tag>Chưa xác định</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kết quả văn bản">
                    <div style={{ 
                      padding: '12px', 
                      background: '#f5f5f5', 
                      borderRadius: '6px',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].ket_qua_van_ban}
                    </div>
                  </Descriptions.Item>
                  {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].ghi_chu_ket_qua && (
                    <Descriptions.Item label="Ghi chú">
                      <Text type="secondary" style={{ fontStyle: 'italic' }}>
                        {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].ghi_chu_ket_qua}
                      </Text>
                    </Descriptions.Item>
                  )}
                  {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].nhan_vien_xet_nghiem && (
                    <Descriptions.Item label="Nhân viên xét nghiệm">
                      <Space>
                        <UserOutlined />
                        <Text>{ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].nhan_vien_xet_nghiem.ho_ten || 'N/A'}</Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Thời gian kết luận">
                    <Space>
                      <ClockCircleOutlined />
                      <Text>{new Date(ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].thoi_gian_ket_luan).toLocaleString('vi-VN')}</Text>
                    </Space>
                  </Descriptions.Item>
                  {ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].duong_dan_file_ket_qua && (
                    <Descriptions.Item label="File đính kèm">
                      <Button 
                        type="link" 
                        icon={<FileTextOutlined />}
                        onClick={() => window.open(ketQuaXetNghiem[selectedChiDinh.id_chi_dinh].duong_dan_file_ket_qua, '_blank')}
                      >
                        Xem file kết quả
                      </Button>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">Chưa có kết quả xét nghiệm</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* Modal Preview Hóa đơn - GIỮ NGUYÊN */}
      <Modal
        title="Xem trước hóa đơn"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width={1400}
        footer={[
          <Button key="cancel" onClick={() => setShowPreview(false)}>
            Đóng
          </Button>,
          <Button key="export" type="primary" icon={<PrinterOutlined />} onClick={handleExportPdf}>
            {appointment?.trang_thai === "da_hoan_thanh" ? "In hóa đơn" : "Xuất PDF & Kết thúc khám"}
          </Button>,
        ]}
      >
        <div id="invoicePreview" style={{ padding: 20, background: 'white', border: '1px solid #f0f0f0' }}>
          <InvoiceHeader
            subtitle="Hóa đơn khám bệnh"
            qrValue={(hoaDon?.id_hoa_don || id_cuoc_hen)?.toString() || ""}
          />

          {/* Thông tin bệnh nhân */}
          <Card title="THÔNG TIN BỆNH NHÂN" size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 8]}>
              <Col span={8}><Text strong>Họ tên:</Text> {hoSo?.ho_ten}</Col>
              <Col span={8}><Text strong>Giới tính:</Text> {hoSo?.gioi_tinh}</Col>
              <Col span={8}><Text strong>Tuổi:</Text> {hoSo?.tuoi}</Col>
              <Col span={8}><Text strong>Mã BHYT:</Text> {hoSo?.ma_BHYT || 'Không có'}</Col>
              <Col span={8}><Text strong>Ngày khám:</Text> {new Date().toLocaleDateString('vi-VN')}</Col>
              <Col span={24}><Text strong>Địa chỉ:</Text> {hoSo?.dia_chi || 'Không có'}</Col>
            </Row>
          </Card>

          <Card title="THÔNG TIN BÁC SĨ PHỤ TRÁCH" size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}><Text strong>Họ tên:</Text> {doctorFullName}</Col>
              <Col span={12}><Text strong>Chuyên môn:</Text> {doctorSpecialization}</Col>
              <Col span={12}><Text strong>Số điện thoại:</Text> {doctorPhone}</Col>
              <Col span={12}><Text strong>Email:</Text> {doctorEmail}</Col>
            </Row>
          </Card>

          {/* Thông tin khám bệnh */}
          <Card title="THÔNG TIN KHÁM BỆNH" size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Lý do khám:</Text>
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                  {lichSuKhamHienTai?.ly_do_kham || 'Không có'}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Chuẩn đoán:</Text>
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                  {lichSuKhamHienTai?.chuan_doan || 'Không có'}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Phương án điều trị:</Text>
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 4 }}>
                  {lichSuKhamHienTai?.dieu_tri || 'Không có'}
                </div>
              </Col>
            </Row>
          </Card>
          {/* Xét nghiệm đã chỉ định */}
          {chiDinhXetNghiem.length > 0 && (
            <Card title="XÉT NGHIỆM CHỈ ĐỊNH" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={chiDinhXetNghiem.map((xn, i) => ({
                  key: i,
                  stt: i + 1,
                  ten_xet_nghiem: xn.ten_dich_vu,
                  yeu_cau: xn.yeu_cau_ghi_chu || 'Không có yêu cầu đặc biệt',
                  trang_thai: xn.trang_thai === 'cho_xy_ly' ? 'Chờ xử lý' : 
                             xn.trang_thai === 'dang_xu_ly' ? 'Đang xử lý' : 
                             xn.trang_thai === 'hoan_thanh' ? 'Hoàn thành' : xn.trang_thai,
                  ket_qua: ketQuaXetNghiem[xn.id_chi_dinh] ? 'Đã có kết quả' : 'Chờ kết quả'
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên xét nghiệm', dataIndex: 'ten_xet_nghiem' },
                  { title: 'Yêu cầu', dataIndex: 'yeu_cau', width: 200 },
                  { title: 'Trạng thái', dataIndex: 'trang_thai', width: 100, align: 'center' },
                  { title: 'Kết quả', dataIndex: 'ket_qua', width: 100, align: 'center' },
                ]}
              />
            </Card>
          )}
          {/* Dịch vụ */}
          {dichVuTamThoi.filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined).length > 0 && (
            <Card title="DỊCH VỤ SỬ DỤNG" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={dichVuTamThoi.filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined).map((d, i) => ({
                  key: i,
                  stt: i + 1,
                  ten: d.dich_vu?.ten_dich_vu,
                  sl: d.so_luong,
                  dongia: d.don_gia?.toLocaleString(),
                  thanhtien: (d.so_luong * d.don_gia)?.toLocaleString()
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên dịch vụ', dataIndex: 'ten' },
                  { title: 'SL', dataIndex: 'sl', width: 80, align: 'center' },
                  { title: 'Đơn giá', dataIndex: 'dongia', width: 120, align: 'right' },
                  { title: 'Thành tiền', dataIndex: 'thanhtien', width: 120, align: 'right' },
                ]}
                summary={() => {
                  const filteredDichVu = dichVuTamThoi.filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined);
                  const totalFiltered = filteredDichVu.reduce((sum, dv) => sum + (dv.so_luong * (dv.don_gia || 0)), 0);
                  return (
                    <Table.Summary>
                      <Table.Summary.Row style={{ background: '#f0f8ff' }}>
                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                          <Text strong>Tổng tiền dịch vụ:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text strong type="danger">{totalFiltered.toLocaleString()} VND</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>
          )}

          {/* Đơn thuốc */}
          {donThuocTamThoi.filter(t => t.id_thuoc && t.id_thuoc !== "" && t.id_thuoc !== null && t.id_thuoc !== undefined).length > 0 && (
            <Card title="ĐƠN THUỐC" size="small" style={{ marginBottom: 20 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={donThuocTamThoi.filter(t => t.id_thuoc && t.id_thuoc !== "" && t.id_thuoc !== null && t.id_thuoc !== undefined).map((t, i) => ({
                  key: i,
                  stt: i + 1,
                  tenthuoc: `${t.thuoc?.ten_thuoc || t.ten_thuoc || 'Chưa chọn thuốc'}`,
                  sl: t.so_luong,
                  lieudung: t.lieu_dung,
                  tansuat: t.tan_suat,
                  ghichu: t.ghi_chu
                }))}
                columns={[
                  { title: 'STT', dataIndex: 'stt', width: 60 },
                  { title: 'Tên thuốc', dataIndex: 'tenthuoc' },
                  { title: 'SL', dataIndex: 'sl', width: 80, align: 'center' },
                  { title: 'Liều dùng', dataIndex: 'lieudung', width: 120 },
                  { title: 'Tần suất', dataIndex: 'tansuat', width: 120 },
                  { title: 'Ghi chú', dataIndex: 'ghichu' },
                ]}
              />
              {ghiChuDonThuoc && (
                <div style={{ marginTop: 16, padding: 12, background: '#fff2e8', borderRadius: 4 }}>
                  <Text strong>Ghi chú đơn thuốc: </Text>
                  <Text>{ghiChuDonThuoc}</Text>
                </div>
              )}
            </Card>
          )}

          {/* Tổng kết */}
          <Card size="small" style={{ background: '#f6ffed' }}>
            <Row justify="end">
              <Col>
                <Space direction="vertical" size="small" align="end">
                  {dichVuTamThoi.filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined).length > 0 && (
                    <Text>Tổng tiền dịch vụ: <Text strong>{dichVuTamThoi.filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined).reduce((sum, dv) => sum + (dv.so_luong * (dv.don_gia || 0)), 0).toLocaleString()} VND</Text></Text>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                  <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
                    TỔNG CỘNG: {(dichVuTamThoi.filter(d => d.id_dich_vu && d.id_dich_vu !== "" && d.id_dich_vu !== null && d.id_dich_vu !== undefined).reduce((sum, dv) => sum + (dv.so_luong * (dv.don_gia || 0)), 0) + donThuocTamThoi.filter(t => t.id_thuoc && t.id_thuoc !== "" && t.id_thuoc !== null && t.id_thuoc !== undefined).reduce((sum, t) => sum + (t.so_luong * (t.don_gia || t.thuoc?.don_gia || 0)), 0)).toLocaleString()} VND
                  </Title>
                </Space>
              </Col>
            </Row>
          </Card>

          <InvoiceSignatureSection slots={invoiceSignatureSlots} />

          {/* Footer - Thông tin liên hệ */}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e8e8e8' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Text style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#333' }}>
                123 Đường ABC, Quận XYZ, TP.HCM
              </Text>
              <Text style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#333' }}>
                Điện thoại: 028 1234 5678 • Email: support@medpro.vn
              </Text>
              <Text style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#333' }}>
                Website: www.medpro.vn
              </Text>
              <Text style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>
                MST: 0312345678
              </Text>
              <Text style={{ display: 'block', fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                Nếu quý khách có nhu cầu hỗ trợ, vui lòng liên hệ theo địa chỉ trên hoặc đến quầy nhân viên quầy
              </Text>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
              <Text style={{ fontSize: 12 }}>
                Hóa đơn được tạo tự động vào lúc {new Date().toLocaleString('vi-VN')}
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAppointmentDetail;