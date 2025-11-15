import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Descriptions,
  Alert,
  Tooltip,
  Popconfirm,
  List,
  Empty,
  Divider
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  ReloadOutlined,
  EyeOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import apiXinNghiPhep from "../../../api/XinNghiPhep";
import apiNhanVienPhanCong from "../../../api/NhanVienPhanCong";
import apiNguoiDung from "../../../api/NguoiDung";
import apiBacSi from "../../../api/BacSi";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiPhongKham from "../../../api/PhongKham";
import apiChuyenGiaDinhDuong from "../../../api/ChuyenGiaDinhDuong";

dayjs.locale("vi");

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LeaveRequests = () => {
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [chuyenKhoaMap, setChuyenKhoaMap] = useState({}); // Map id_bac_si -> ten_chuyen_khoa
  const [chuyenNganhMap, setChuyenNganhMap] = useState({}); // Map id_chuyen_gia -> ten_chuyen_nganh
  const [usersMap, setUsersMap] = useState({}); // Map id_nguoi_dung -> {ho_ten, vai_tro}
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestUser, setSelectedRequestUser] = useState(null);
  const [selectedRequestBacSi, setSelectedRequestBacSi] = useState(null);
  const [selectedRequestChuyenKhoa, setSelectedRequestChuyenKhoa] = useState(null);
  const [selectedRequestSchedules, setSelectedRequestSchedules] = useState([]);
  const [allPhongKhamList, setAllPhongKhamList] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Filters
  const [filters, setFilters] = useState({
    trang_thai: null,
    ngay_bat_dau: null,
    ngay_ket_thuc: null
  });

  useEffect(() => {
    fetchLeaveRequests();
    fetchPhongKhamList();
  }, []);

  const fetchPhongKhamList = async () => {
    try {
      const res = await apiPhongKham.getAll();
      const data = res?.data || res || [];
      setAllPhongKhamList(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng khám:", error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [leaveRequests, filters]);

  // Debug: Log khi selectedRequestSchedules thay đổi
  useEffect(() => {
    // State changed
  }, [selectedRequestSchedules]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await apiXinNghiPhep.getAll();
      const data = res?.data || res || [];
      setLeaveRequests(data);
      
      // Lấy danh sách ID người dùng duy nhất
      const userIds = [...new Set(data.map(item => item.id_nguoi_dung).filter(Boolean))];
      
      const newUsersMap = { ...usersMap };
      const newChuyenKhoaMap = { ...chuyenKhoaMap };
      const newChuyenNganhMap = { ...chuyenNganhMap };
      
      // Fetch thông tin người dùng song song
      await Promise.all(userIds.map(async (userId) => {
        try {
          const user = await apiNguoiDung.getUserById(userId);
          if (user) {
            newUsersMap[userId] = {
              ho_ten: user.ho_ten || userId,
              vai_tro: user.vai_tro
            };
          }
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
        }
      }));
      
      // Lấy thông tin chuyên khoa cho các đơn nghỉ phép của bác sĩ
      const bacSiIds = [...new Set(data
        .filter(item => {
          const userInfo = newUsersMap[item.id_nguoi_dung];
          return userInfo?.vai_tro === 'bac_si' || item.id_nguoi_dung?.startsWith('BS_');
        })
        .map(item => item.id_nguoi_dung)
      )];
      
      // Fetch thông tin bác sĩ và chuyên khoa song song
      await Promise.all(bacSiIds.map(async (bacSiId) => {
        try {
          const bacSiRes = await apiBacSi.getById(bacSiId);
          const bacSi = bacSiRes?.data || bacSiRes;
          if (bacSi?.id_chuyen_khoa) {
            try {
              const chuyenKhoaRes = await apiChuyenKhoa.getChuyenKhoaById(bacSi.id_chuyen_khoa);
              const chuyenKhoa = chuyenKhoaRes?.data || chuyenKhoaRes;
              if (chuyenKhoa?.ten_chuyen_khoa) {
                newChuyenKhoaMap[bacSiId] = chuyenKhoa.ten_chuyen_khoa;
              }
            } catch (error) {
              console.error(`Lỗi khi lấy chuyên khoa ${bacSi.id_chuyen_khoa}:`, error);
            }
          }
        } catch (error) {
          console.error(`Lỗi khi lấy bác sĩ ${bacSiId}:`, error);
        }
      }));

      // Lấy thông tin chuyên ngành cho các đơn nghỉ phép của chuyên gia dinh dưỡng
      const chuyenGiaIds = [...new Set(data
        .filter(item => {
          const userInfo = newUsersMap[item.id_nguoi_dung];
          return userInfo?.vai_tro === 'chuyen_gia_dinh_duong';
        })
        .map(item => item.id_nguoi_dung)
      )];

      // Fetch thông tin chuyên gia dinh dưỡng và chuyên ngành song song
      await Promise.all(chuyenGiaIds.map(async (chuyenGiaId) => {
        try {
          const chuyenGiaRes = await apiChuyenGiaDinhDuong.getById(chuyenGiaId);
          const chuyenGia = chuyenGiaRes?.data || chuyenGiaRes;
          if (chuyenGia?.id_chuyen_nganh) {
            try {
              const chuyenNganhRes = await apiChuyenGiaDinhDuong.getChuyenNganhById(chuyenGia.id_chuyen_nganh);
              const chuyenNganh = chuyenNganhRes?.data || chuyenNganhRes;
              if (chuyenNganh?.ten_chuyen_nganh) {
                newChuyenNganhMap[chuyenGiaId] = chuyenNganh.ten_chuyen_nganh;
              }
            } catch (error) {
              console.error(`Lỗi khi lấy chuyên ngành ${chuyenGia.id_chuyen_nganh}:`, error);
            }
          }
        } catch (error) {
          console.error(`Lỗi khi lấy chuyên gia dinh dưỡng ${chuyenGiaId}:`, error);
        }
      }));
      
      setUsersMap(newUsersMap);
      setChuyenKhoaMap(newChuyenKhoaMap);
      setChuyenNganhMap(newChuyenNganhMap);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn nghỉ phép:", error);
      message.error("Không thể tải danh sách đơn nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaveRequests];
    
    if (filters.trang_thai) {
      filtered = filtered.filter(item => item.trang_thai === filters.trang_thai);
    }
    
    if (filters.ngay_bat_dau) {
      filtered = filtered.filter(item => 
        dayjs(item.ngay_bat_dau).isAfter(dayjs(filters.ngay_bat_dau).subtract(1, 'day'))
      );
    }
    
    if (filters.ngay_ket_thuc) {
      filtered = filtered.filter(item => 
        dayjs(item.ngay_ket_thuc).isBefore(dayjs(filters.ngay_ket_thuc).add(1, 'day'))
      );
    }
    
    setFilteredRequests(filtered);
  };

  const fetchDetailData = async (request) => {
    setLoadingDetail(true);
    try {
      // Lấy thông tin người dùng
      const user = await apiNguoiDung.getUserById(request.id_nguoi_dung);
      setSelectedRequestUser(user);

      // Nếu là bác sĩ, lấy thông tin bác sĩ (chuyên khoa)
      if (user?.vai_tro === 'bac_si' || request.id_nguoi_dung?.startsWith('BS_')) {
        try {
          const bacSiRes = await apiBacSi.getById(request.id_nguoi_dung);
          const bacSi = bacSiRes?.data || bacSiRes;
          setSelectedRequestBacSi(bacSi);
          
          // Lấy tên chuyên khoa nếu có id_chuyen_khoa
          if (bacSi?.id_chuyen_khoa) {
            try {
              const chuyenKhoaRes = await apiChuyenKhoa.getChuyenKhoaById(bacSi.id_chuyen_khoa);
              const chuyenKhoa = chuyenKhoaRes?.data || chuyenKhoaRes;
              setSelectedRequestChuyenKhoa(chuyenKhoa);
            } catch (error) {
              console.error("Lỗi khi lấy thông tin chuyên khoa:", error);
              setSelectedRequestChuyenKhoa(null);
            }
          } else {
            setSelectedRequestChuyenKhoa(null);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin bác sĩ:", error);
          setSelectedRequestBacSi(null);
          setSelectedRequestChuyenKhoa(null);
        }
      } else if (user?.vai_tro === 'chuyen_gia_dinh_duong') {
        // Nếu là chuyên gia dinh dưỡng, lấy thông tin chuyên ngành
        try {
          const chuyenGiaRes = await apiChuyenGiaDinhDuong.getById(request.id_nguoi_dung);
          const chuyenGia = chuyenGiaRes?.data || chuyenGiaRes;
          setSelectedRequestBacSi(null); // Không dùng cho chuyên gia
          
          // Lấy tên chuyên ngành nếu có id_chuyen_nganh
          if (chuyenGia?.id_chuyen_nganh) {
            try {
              const chuyenNganhRes = await apiChuyenGiaDinhDuong.getChuyenNganhById(chuyenGia.id_chuyen_nganh);
              const chuyenNganh = chuyenNganhRes?.data || chuyenNganhRes;
              // Sử dụng selectedRequestChuyenKhoa để lưu chuyên ngành (tái sử dụng state)
              setSelectedRequestChuyenKhoa({
                ten_chuyen_khoa: chuyenNganh.ten_chuyen_nganh, // Map để tái sử dụng component hiển thị
                ten_chuyen_nganh: chuyenNganh.ten_chuyen_nganh
              });
            } catch (error) {
              console.error("Lỗi khi lấy thông tin chuyên ngành:", error);
              setSelectedRequestChuyenKhoa(null);
            }
          } else {
            setSelectedRequestChuyenKhoa(null);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin chuyên gia dinh dưỡng:", error);
          setSelectedRequestBacSi(null);
          setSelectedRequestChuyenKhoa(null);
        }
      } else {
        setSelectedRequestBacSi(null);
        setSelectedRequestChuyenKhoa(null);
      }

      // Lấy lịch làm việc trong khoảng thời gian xin nghỉ
      try {
        const schedulesRes = await apiNhanVienPhanCong.getAllLichLamViec({
          id_nguoi_dung: request.id_nguoi_dung
        });
        
        // Xử lý cấu trúc response: có thể là { success: true, data: [...] } hoặc { data: [...] } hoặc array trực tiếp
        let allSchedules = [];
        if (Array.isArray(schedulesRes)) {
          allSchedules = schedulesRes;
        } else if (schedulesRes?.data && Array.isArray(schedulesRes.data)) {
          allSchedules = schedulesRes.data;
        } else if (schedulesRes?.data?.data && Array.isArray(schedulesRes.data.data)) {
          allSchedules = schedulesRes.data.data;
        }
        
        if (!Array.isArray(allSchedules)) {
          console.warn('Schedules is not an array:', allSchedules);
          setSelectedRequestSchedules([]);
          return;
        }
        
        // Filter lịch làm việc trong khoảng thời gian xin nghỉ
        if (!request.ngay_bat_dau || !request.ngay_ket_thuc) {
          setSelectedRequestSchedules([]);
          return;
        }
        
        const startDate = dayjs(request.ngay_bat_dau).startOf('day');
        const endDate = dayjs(request.ngay_ket_thuc).endOf('day');
        
        const schedulesInRange = allSchedules.filter(schedule => {
          try {
            if (!schedule || !schedule.ngay_lam_viec) {
              console.warn('Schedule missing ngay_lam_viec:', schedule);
              return false;
            }
            
            const scheduleDate = dayjs(schedule.ngay_lam_viec);
            if (!scheduleDate.isValid()) {
              console.warn('Invalid schedule date:', schedule.ngay_lam_viec, 'Type:', typeof schedule.ngay_lam_viec);
              return false;
            }
            
            // So sánh ở mức ngày (không tính giờ)
            // Sử dụng isAfter, isSame, isBefore thay vì isSameOrAfter/isSameOrBefore
            const isAfterOrSame = scheduleDate.isAfter(startDate, 'day') || scheduleDate.isSame(startDate, 'day');
            const isBeforeOrSame = scheduleDate.isBefore(endDate, 'day') || scheduleDate.isSame(endDate, 'day');
            const isInRange = isAfterOrSame && isBeforeOrSame;
            
            return isInRange;
          } catch (filterError) {
            console.error('Error filtering schedule:', schedule, filterError);
            return false;
          }
        });
        
        // Đảm bảo set state với array hợp lệ
        const finalSchedules = Array.isArray(schedulesInRange) ? schedulesInRange : [];
        
        setSelectedRequestSchedules(finalSchedules);
      } catch (error) {
        console.error("Lỗi khi lấy lịch làm việc:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        message.error("Không thể tải lịch làm việc: " + (error.message || 'Lỗi không xác định'));
        setSelectedRequestSchedules([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết:", error);
      message.error("Không thể tải thông tin chi tiết");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewDetail = async (record) => {
    // Reset state trước khi fetch dữ liệu mới
    setSelectedRequest(record);
    setSelectedRequestSchedules([]);
    setSelectedRequestUser(null);
    setSelectedRequestBacSi(null);
    setSelectedRequestChuyenKhoa(null);
    setModalVisible(true);
    await fetchDetailData(record);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      
      // Duyệt đơn nghỉ phép
      await apiXinNghiPhep.updateStatus(selectedRequest.id_xin_nghi, 'da_duyet');
      
      // Tự động xóa lịch làm việc trong khoảng thời gian nghỉ phép
      await deleteSchedulesDuringLeave(selectedRequest);
      
      message.success("Đã duyệt đơn nghỉ phép và xóa lịch làm việc tương ứng");
      setApproveModalVisible(false);
      setSelectedRequest(null);
      fetchLeaveRequests();
    } catch (error) {
      console.error("Lỗi khi duyệt đơn nghỉ phép:", error);
      message.error(error?.response?.data?.message || "Không thể duyệt đơn nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedulesDuringLeave = async (leaveRequest) => {
    try {
      // Lấy tất cả lịch làm việc của nhân viên
      const schedulesRes = await apiNhanVienPhanCong.getAllLichLamViec({
        id_nguoi_dung: leaveRequest.id_nguoi_dung
      });
      
      // Xử lý cấu trúc response: { success: true, data: [...] }
      let allSchedules = [];
      if (Array.isArray(schedulesRes)) {
        allSchedules = schedulesRes;
      } else if (schedulesRes?.data && Array.isArray(schedulesRes.data)) {
        allSchedules = schedulesRes.data;
      } else if (schedulesRes?.data?.data && Array.isArray(schedulesRes.data.data)) {
        allSchedules = schedulesRes.data.data;
      }
      
      // Lọc các lịch làm việc trong khoảng thời gian nghỉ phép
      const startDate = dayjs(leaveRequest.ngay_bat_dau).startOf('day');
      const endDate = dayjs(leaveRequest.ngay_ket_thuc).endOf('day');
      
      const schedulesToDelete = allSchedules.filter(schedule => {
        // Kiểm tra nhân viên
        if (schedule.id_nguoi_dung !== leaveRequest.id_nguoi_dung) {
          return false;
        }
        
        // Kiểm tra ngày
        if (!schedule.ngay_lam_viec) {
          return false;
        }
        
        const scheduleDate = dayjs(schedule.ngay_lam_viec);
        if (!scheduleDate.isValid()) {
          console.warn('Invalid schedule date:', schedule.ngay_lam_viec);
          return false;
        }
        
        // So sánh ở mức ngày (không tính giờ)
        const isAfterOrSame = scheduleDate.isAfter(startDate, 'day') || scheduleDate.isSame(startDate, 'day');
        const isBeforeOrSame = scheduleDate.isBefore(endDate, 'day') || scheduleDate.isSame(endDate, 'day');
        const isInRange = isAfterOrSame && isBeforeOrSame;
        
        return isInRange;
      });
      
      if (schedulesToDelete.length === 0) {
        return;
      }
      
      // Xóa từng lịch làm việc
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const schedule of schedulesToDelete) {
        try {
          await apiNhanVienPhanCong.deleteLichLamViec(schedule.id_lich_lam_viec);
          deletedCount++;
        } catch (err) {
          failedCount++;
        }
      }
      
      if (deletedCount > 0) {
        message.success(`Đã xóa ${deletedCount} lịch làm việc trong khoảng thời gian nghỉ phép`);
      }
      if (failedCount > 0) {
        message.warning(`Có ${failedCount} lịch làm việc không thể xóa`);
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch làm việc:", error);
      message.error("Có lỗi xảy ra khi xóa lịch làm việc: " + (error.message || 'Lỗi không xác định'));
      // Không throw error để không ảnh hưởng đến việc duyệt đơn
    }
  };

  const handleReject = async (values) => {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      await apiXinNghiPhep.updateStatus(
        selectedRequest.id_xin_nghi, 
        'tu_choi', 
        values.ly_do_tu_choi
      );
      message.success("Đã từ chối đơn nghỉ phép");
      setRejectModalVisible(false);
      form.resetFields();
      setSelectedRequest(null);
      fetchLeaveRequests();
    } catch (error) {
      console.error("Lỗi khi từ chối đơn nghỉ phép:", error);
      message.error(error?.response?.data?.message || "Không thể từ chối đơn nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'cho_duyet': { color: 'warning', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
      'da_duyet': { color: 'success', text: 'Đã duyệt', icon: <CheckCircleOutlined /> },
      'tu_choi': { color: 'error', text: 'Từ chối', icon: <CloseCircleOutlined /> }
    };
    return configs[status] || { color: 'default', text: status, icon: null };
  };

  const getCaText = (ca) => {
    const caMap = {
      'sang': 'Sáng',
      'chieu': 'Chiều',
      'toi': 'Tối'
    };
    return caMap[ca] || ca;
  };

  const getVaiTroText = (vaiTro) => {
    const vaiTroMap = {
      'benh_nhan': 'Bệnh nhân',
      'bac_si': 'Bác sĩ',
      'chuyen_gia_dinh_duong': 'Chuyên gia dinh dưỡng',
      'nhan_vien_quay': 'Nhân viên quầy',
      'nhan_vien_phan_cong': 'Nhân viên phân công',
      'quan_tri_vien': 'Quản trị viên'
    };
    return vaiTroMap[vaiTro] || vaiTro;
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: "Nhân viên",
      key: "nhan_vien",
      width: 200,
      render: (_, record) => {
        const userInfo = usersMap[record.id_nguoi_dung];
        const hoTen = userInfo?.ho_ten || record.ho_ten || record.id_nguoi_dung || 'N/A';
        return (
          <Space direction="vertical" size={0}>
            <Space>
              <UserOutlined />
              <Text strong>{hoTen}</Text>
            </Space>
            {userInfo?.vai_tro && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {getVaiTroText(userInfo.vai_tro)}
              </Text>
            )}
          </Space>
        );
      }
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngay_bat_dau",
      key: "ngay_bat_dau",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngay_ket_thuc",
      key: "ngay_ket_thuc",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "Số ngày",
      key: "so_ngay",
      width: 100,
      render: (_, record) => {
        const days = dayjs(record.ngay_ket_thuc).diff(dayjs(record.ngay_bat_dau), 'day') + 1;
        return <Text strong>{days} ngày</Text>;
      }
    },
    {
      title: "Chuyên khoa/Chuyên ngành",
      key: "chuyen_khoa_nganh",
      width: 180,
      render: (_, record) => {
        const userInfo = usersMap[record.id_nguoi_dung];
        const vaiTro = userInfo?.vai_tro;
        
        // Hiển thị chuyên khoa cho bác sĩ
        if (vaiTro === 'bac_si' || record.id_nguoi_dung?.startsWith('BS_')) {
          const tenChuyenKhoa = chuyenKhoaMap[record.id_nguoi_dung];
          return (
            <Space>
              <MedicineBoxOutlined />
              <Text>{tenChuyenKhoa || '-'}</Text>
            </Space>
          );
        }
        
        // Hiển thị chuyên ngành cho chuyên gia dinh dưỡng
        if (vaiTro === 'chuyen_gia_dinh_duong') {
          const tenChuyenNganh = chuyenNganhMap[record.id_nguoi_dung];
          return (
            <Space>
              <MedicineBoxOutlined />
              <Text>{tenChuyenNganh || '-'}</Text>
            </Space>
          );
        }
        
        return '-';
      }
    },
    {
      title: "Lý do",
      dataIndex: "ly_do",
      key: "ly_do",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (lyDo) => (
        <Tooltip title={lyDo}>
          {lyDo ? `${lyDo.substring(0, 30)}...` : '-'}
        </Tooltip>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        const canApprove = record.trang_thai === 'cho_duyet';
        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                Chi tiết
              </Button>
            </Tooltip>
            {canApprove && (
              <>
                <Popconfirm
                  title="Duyệt đơn nghỉ phép"
                  description="Bạn có chắc chắn muốn duyệt đơn nghỉ phép này? Hệ thống sẽ tự động xóa lịch làm việc trong khoảng thời gian nghỉ phép."
                  onConfirm={() => {
                    setSelectedRequest(record);
                    setApproveModalVisible(true);
                  }}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="small"
                  >
                    Duyệt
                  </Button>
                </Popconfirm>
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  onClick={() => {
                    setSelectedRequest(record);
                    setRejectModalVisible(true);
                  }}
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        style={{
          borderRadius: "16px",
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          border: 'none'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              <CheckCircleOutlined style={{ marginRight: '12px' }} />
              Duyệt nghỉ phép
            </Title>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLeaveRequests}
              loading={loading}
              style={{ background: 'white' }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: "16px", marginBottom: '24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={filters.trang_thai}
              onChange={(value) => setFilters({ ...filters, trang_thai: value })}
            >
              <Option value="cho_duyet">Chờ duyệt</Option>
              <Option value="da_duyet">Đã duyệt</Option>
              <Option value="tu_choi">Từ chối</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker
              placeholder="Từ ngày"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={filters.ngay_bat_dau ? dayjs(filters.ngay_bat_dau) : null}
              onChange={(date) => setFilters({ ...filters, ngay_bat_dau: date ? date.format('YYYY-MM-DD') : null })}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker
              placeholder="Đến ngày"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={filters.ngay_ket_thuc ? dayjs(filters.ngay_ket_thuc) : null}
              onChange={(date) => setFilters({ ...filters, ngay_ket_thuc: date ? date.format('YYYY-MM-DD') : null })}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id_xin_nghi"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn nghỉ phép`
          }}
        />
      </Card>

      {/* Modal chi tiết đơn nghỉ phép */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết đơn nghỉ phép</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRequest(null);
          setSelectedRequestUser(null);
          setSelectedRequestBacSi(null);
          setSelectedRequestChuyenKhoa(null);
          setSelectedRequestSchedules([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setModalVisible(false);
            setSelectedRequest(null);
            setSelectedRequestUser(null);
            setSelectedRequestBacSi(null);
            setSelectedRequestChuyenKhoa(null);
            setSelectedRequestSchedules([]);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedRequest && (
          <div>
            {loadingDetail && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text>Đang tải thông tin...</Text>
              </div>
            )}
            {!loadingDetail && (
              <>
                <Descriptions bordered column={2} style={{ marginBottom: '20px' }}>
                  <Descriptions.Item label="Nhân viên" span={2}>
                    <Space>
                      <UserOutlined />
                      <Text strong>{selectedRequestUser?.ho_ten || selectedRequest?.id_nguoi_dung || 'N/A'}</Text>
                    </Space>
                  </Descriptions.Item>
                  {selectedRequestUser && (
                    <>
                      <Descriptions.Item label="Email">
                        {selectedRequestUser.email || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {selectedRequestUser.so_dien_thoai || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Vai trò">
                        {selectedRequestUser.vai_tro ? getVaiTroText(selectedRequestUser.vai_tro) : '-'}
                      </Descriptions.Item>
                    </>
                  )}
                  {selectedRequestChuyenKhoa && (
                    <Descriptions.Item label={selectedRequestUser?.vai_tro === 'chuyen_gia_dinh_duong' ? 'Chuyên ngành' : 'Chuyên khoa'}>
                      <Space>
                        <MedicineBoxOutlined />
                        <Text>{selectedRequestChuyenKhoa.ten_chuyen_nganh || selectedRequestChuyenKhoa.ten_chuyen_khoa || '-'}</Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {selectedRequestBacSi?.id_chuyen_khoa && !selectedRequestChuyenKhoa && (
                    <Descriptions.Item label="Chuyên khoa">
                      <Space>
                        <MedicineBoxOutlined />
                        <Text>{selectedRequestBacSi.id_chuyen_khoa}</Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Trạng thái">
                    {(() => {
                      const config = getStatusConfig(selectedRequest.trang_thai);
                      return (
                        <Tag color={config.color} icon={config.icon}>
                          {config.text}
                        </Tag>
                      );
                    })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu" span={1}>
                    <Space>
                      <CalendarOutlined />
                      <Text>{dayjs(selectedRequest.ngay_bat_dau).format("DD/MM/YYYY")}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày kết thúc" span={1}>
                    <Space>
                      <CalendarOutlined />
                      <Text>{dayjs(selectedRequest.ngay_ket_thuc).format("DD/MM/YYYY")}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số ngày nghỉ">
                    <Text strong>
                      {dayjs(selectedRequest.ngay_ket_thuc).diff(dayjs(selectedRequest.ngay_bat_dau), 'day') + 1} ngày
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do" span={2}>
                    <Text>{selectedRequest.ly_do || '-'}</Text>
                  </Descriptions.Item>
                  {selectedRequest.trang_thai === 'tu_choi' && selectedRequest.ly_do_tu_choi && (
                    <Descriptions.Item label="Lý do từ chối" span={2}>
                      <Alert
                        message={<Text type="danger">{selectedRequest.ly_do_tu_choi}</Text>}
                        type="error"
                        showIcon
                        style={{ marginTop: '8px' }}
                      />
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Ngày tạo">
                    {selectedRequest.ngay_tao ? dayjs(selectedRequest.ngay_tao).format("DD/MM/YYYY") : '-'}
                  </Descriptions.Item>
                </Descriptions>

                {/* Danh sách lịch làm việc trong khoảng thời gian nghỉ */}
                <Divider orientation="left">
                  <Text strong>Lịch làm việc trong khoảng thời gian nghỉ</Text>
                </Divider>
                {(() => {
                  if (!selectedRequestSchedules || !Array.isArray(selectedRequestSchedules) || selectedRequestSchedules.length === 0) {
                    return <Empty description="Không có lịch làm việc trong khoảng thời gian này" />;
                  }
                  
                  return (
                    <List
                      bordered
                      dataSource={selectedRequestSchedules}
                      renderItem={(schedule) => {
                        const phongKham = schedule.id_phong_kham 
                          ? allPhongKhamList.find(pk => pk.id_phong_kham === schedule.id_phong_kham)
                          : null;
                        const tenPhong = phongKham?.ten_phong || schedule.id_phong_kham;
                        
                        return (
                          <List.Item>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Space>
                                <CalendarOutlined />
                                <Text strong>{dayjs(schedule.ngay_lam_viec).format("DD/MM/YYYY")}</Text>
                                <Tag>{getCaText(schedule.ca)}</Tag>
                                {schedule.id_phong_kham && (
                                  <Tag color="blue">Phòng: {tenPhong}</Tag>
                                )}
                              </Space>
                            {schedule.ghi_chu && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Ghi chú: {schedule.ghi_chu}
                              </Text>
                            )}
                          </Space>
                        </List.Item>
                        );
                      }}
                    />
                  );
                })()}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal xác nhận duyệt */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#096dd9' }} />
            <span>Xác nhận duyệt đơn nghỉ phép</span>
          </Space>
        }
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedRequest(null);
        }}
        okText="Xác nhận duyệt"
        cancelText="Hủy"
        width={600}
        confirmLoading={loading}
      >
        <Alert
          message="Thông báo"
          description="Khi duyệt đơn nghỉ phép, hệ thống sẽ tự động xóa tất cả lịch làm việc của nhân viên trong khoảng thời gian nghỉ phép."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        {selectedRequest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Nhân viên">
              {selectedRequest.ho_ten || selectedRequest.id_nguoi_dung || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Khoảng thời gian">
              {dayjs(selectedRequest.ngay_bat_dau).format("DD/MM/YYYY")} - {dayjs(selectedRequest.ngay_ket_thuc).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Số ngày">
              {dayjs(selectedRequest.ngay_ket_thuc).diff(dayjs(selectedRequest.ngay_bat_dau), 'day') + 1} ngày
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">
              {selectedRequest.ly_do || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal từ chối */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Từ chối đơn nghỉ phép</span>
          </Space>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
          setSelectedRequest(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReject}
        >
          {selectedRequest && (
            <Alert
              message="Thông tin đơn nghỉ phép"
              description={
                <Space direction="vertical" size="small">
                  <Text><strong>Nhân viên:</strong> {selectedRequest.ho_ten || selectedRequest.id_nguoi_dung || 'N/A'}</Text>
                  <Text><strong>Thời gian:</strong> {dayjs(selectedRequest.ngay_bat_dau).format("DD/MM/YYYY")} - {dayjs(selectedRequest.ngay_ket_thuc).format("DD/MM/YYYY")}</Text>
                  <Text><strong>Lý do:</strong> {selectedRequest.ly_do || '-'}</Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}
          <Form.Item
            name="ly_do_tu_choi"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối đơn nghỉ phép..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setRejectModalVisible(false);
                form.resetFields();
                setSelectedRequest(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
