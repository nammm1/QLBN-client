import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Row,
  Col,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  Segmented,
} from "antd";
import {
  CalendarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  PlusOutlined,
  PhoneOutlined,
  UserOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan";
import apiBacSi from "../../../api/BacSi";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiKhungGioKham from "../../../api/KhungGioKham";
import apiChuyenGiaDinhDuong from "../../../api/ChuyenGiaDinhDuong";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiCuocHenKhamBenh from "../../../api/CuocHenKhamBenh";
import apiLichLamViec from "../../../api/LichLamViec";
import apiNguoiDung from "../../../api/NguoiDung";
import moment from "moment";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [nutritionSpecialties, setNutritionSpecialties] = useState([]); // Chuyên ngành dinh dưỡng
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or calendar
  const [selectedDate, setSelectedDate] = useState(moment());
  const [form] = Form.useForm();
  const [loaiHen, setLoaiHen] = useState("kham_benh"); // kham_benh hoặc tu_van_dinh_duong
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // Khung giờ có bác sĩ/chuyên gia available

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptData, patientData, doctorData, specialtyData, timeSlotData, nutritionSpecialtyData] = await Promise.all([
        apiCuocHenKham.getAll(),
        apiBenhNhan.getAll(),
        apiBacSi.getAll(),
        apiChuyenKhoa.getAllChuyenKhoa(), // Giống AutoBookingModal
        apiKhungGioKham.getAll(),
        apiChuyenGiaDinhDuong.getAllChuyenNganh().catch(() => []),
      ]);

      setAppointments(apptData || []);
      setPatients(patientData || []);
      setDoctors(doctorData || []);
      setSpecialties(specialtyData || []);
      setTimeSlots(timeSlotData || []);
      setNutritionSpecialties(nutritionSpecialtyData || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format date để không lệch timezone - giống AutoBookingModal
  const formatDate = (d) => {
    if (!d) return "";
    if (moment.isMoment(d)) {
      const year = d.year();
      const month = String(d.month() + 1).padStart(2, "0");
      const day = String(d.date()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    if (d instanceof Date) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    // Nếu là string hoặc object khác
    const date = moment(d);
    if (!date.isValid()) return "";
    const year = date.year();
    const month = String(date.month() + 1).padStart(2, "0");
    const day = String(date.date()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Tìm khung giờ available khi chọn ngày và loại hẹn - Logic từ AutoBookingModal
  const fetchAvailableTimeSlots = async (ngayHen, loaiHenValue, idChuyenKhoaOrNganh) => {
    if (!ngayHen || !loaiHenValue) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoading(true);
    try {
      const dateStr = formatDate(ngayHen);
      
      // Lấy tất cả lịch làm việc trong ngày
      const allSchedules = await apiLichLamViec.getAll();
      const schedulesOnDate = allSchedules.filter(
        (schedule) => formatDate(new Date(schedule.ngay_lam_viec)) === dateStr
      );

      // Lấy tất cả khung giờ
      const allTimeSlots = await apiKhungGioKham.getAll();
      const availableSlots = [];

      if (loaiHenValue === "kham_benh" && idChuyenKhoaOrNganh) {
        // Đối với khám bệnh: tìm bác sĩ có lịch trống
        const allDoctors = await apiBacSi.getAll();
        
        // Merge với thông tin user
        const mergedDoctors = await Promise.all(
          allDoctors.map(async (bs) => {
            try {
              const user = await apiNguoiDung.getUserById(bs.id_bac_si);
              return { ...bs, ...user };
            } catch (err) {
              console.error("Lỗi khi lấy user cho bác sĩ:", err);
              return bs;
            }
          })
        );

        // Filter theo chuyên khoa
        const doctorsToCheck = mergedDoctors.filter(
          (bs) => String(bs.id_chuyen_khoa) === String(idChuyenKhoaOrNganh)
        );

        // Với mỗi khung giờ, kiểm tra xem có bác sĩ nào còn chỗ trống
        for (const timeSlot of allTimeSlots) {
          // Tìm các bác sĩ có lịch làm việc trong ca này
          const ca = timeSlot.ca;
          const doctorsInCa = schedulesOnDate
            .filter((s) => s.ca === ca)
            .map((s) => s.id_nguoi_dung);

          const availableDoctors = doctorsToCheck.filter((doctor) =>
            doctorsInCa.includes(doctor.id_bac_si)
          );

          // Kiểm tra từng bác sĩ xem còn chỗ trống không
          for (const doctor of availableDoctors) {
            try {
              const countData = await apiCuocHenKhamBenh.countByTimeSlot(
                doctor.id_bac_si,
                timeSlot.id_khung_gio,
                dateStr
              );

              if (countData.count < countData.max_count) {
                // Lấy tên chuyên khoa từ danh sách specialties
                const specialty = specialties.find(
                  (sp) => sp.id_chuyen_khoa === doctor.id_chuyen_khoa
                );
                
                // Còn chỗ trống, thêm vào danh sách
                availableSlots.push({
                  ...timeSlot,
                  id_bac_si: doctor.id_bac_si,
                  id_chuyen_khoa: doctor.id_chuyen_khoa,
                  ten_bac_si: doctor.ho_ten,
                  ten_chuyen_khoa: specialty?.ten_chuyen_khoa || "",
                  bookedCount: countData.count,
                  maxCount: countData.max_count,
                  availableSlots: countData.max_count - countData.count,
                });
                break; // Chỉ cần 1 bác sĩ còn chỗ là đủ
              }
            } catch (err) {
              console.error(`Lỗi khi check bác sĩ ${doctor.id_bac_si}:`, err);
            }
          }
        }
      } else if (loaiHenValue === "tu_van_dinh_duong" && idChuyenKhoaOrNganh) {
        // Đối với tư vấn dinh dưỡng: tìm chuyên gia có lịch trống
        const allExperts = await apiChuyenGiaDinhDuong.getAll();

        // Merge với thông tin user
        const mergedExperts = await Promise.all(
          (allExperts || []).map(async (cg) => {
            try {
              const user = await apiNguoiDung.getUserById(cg.id_chuyen_gia);
              return { ...cg, ...user };
            } catch (err) {
              console.error("Lỗi khi lấy user cho chuyên gia:", err);
              return cg;
            }
          })
        );

        // Filter theo chuyên ngành nếu có
        let expertsToCheck = mergedExperts;
        if (idChuyenKhoaOrNganh) {
          expertsToCheck = mergedExperts.filter(
            (expert) => String(expert.id_chuyen_nganh) === String(idChuyenKhoaOrNganh)
          );
        }

        // Với mỗi khung giờ, kiểm tra xem có chuyên gia nào còn chỗ trống
        for (const timeSlot of allTimeSlots) {
          // Tìm các chuyên gia có lịch làm việc trong ca này
          const ca = timeSlot.ca;
          const expertsInCa = schedulesOnDate
            .filter((s) => s.ca === ca)
            .map((s) => s.id_nguoi_dung);

          const availableExperts = expertsToCheck.filter((expert) =>
            expertsInCa.includes(expert.id_chuyen_gia)
          );

          // Kiểm tra từng chuyên gia xem còn chỗ trống không
          for (const expert of availableExperts) {
            try {
              const countData = await apiCuocHenTuVan.countByTimeSlot(
                expert.id_chuyen_gia,
                timeSlot.id_khung_gio,
                dateStr
              );

              if (countData.count < countData.max_count) {
                // Còn chỗ trống, thêm vào danh sách
                const selectedChuyenNganh = nutritionSpecialties.find(
                  (cn) => cn.id_chuyen_nganh === expert.id_chuyen_nganh
                );
                
                availableSlots.push({
                  ...timeSlot,
                  id_chuyen_gia: expert.id_chuyen_gia,
                  ten_chuyen_gia: expert.ho_ten,
                  ten_chuyen_nganh: selectedChuyenNganh?.ten_chuyen_nganh || "",
                  bookedCount: countData.count,
                  maxCount: countData.max_count,
                  availableSlots: countData.max_count - countData.count,
                });
                break; // Chỉ cần 1 chuyên gia còn chỗ là đủ
              }
            } catch (err) {
              console.error(`Lỗi khi check chuyên gia ${expert.id_chuyen_gia}:`, err);
            }
          }
        }
      }

      // Sắp xếp theo giờ bắt đầu
      availableSlots.sort((a, b) => {
        const timeA = a.gio_bat_dau;
        const timeB = b.gio_bat_dau;
        return timeA.localeCompare(timeB);
      });

      setAvailableTimeSlots(availableSlots);
    } catch (error) {
      console.error("Lỗi khi tải khung giờ:", error);
      message.error("Không thể tải khung giờ trống");
      setAvailableTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    form.resetFields();
    setLoaiHen("kham_benh");
    setAvailableTimeSlots([]);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const dateStr = formatDate(values.ngay_hen);
      const selectedTimeSlot = availableTimeSlots.find(
        (slot) => slot.id_khung_gio === values.id_khung_gio
      );

      if (!selectedTimeSlot) {
        message.error("Không tìm thấy khung giờ đã chọn!");
        setLoading(false);
        return;
      }

      if (loaiHen === "kham_benh") {
        // Đặt lịch khám bệnh - giống AutoBookingModal
        const payload = {
          id_benh_nhan: values.id_benh_nhan,
          id_bac_si: selectedTimeSlot.id_bac_si,
          id_chuyen_khoa: values.id_chuyen_khoa || selectedTimeSlot.id_chuyen_khoa,
          id_khung_gio: selectedTimeSlot.id_khung_gio,
          ngay_kham: dateStr,
          loai_hen: "truc_tiep",
          ly_do_kham: values.ly_do_kham || "",
          trieu_chung: values.trieu_chung || null,
        };

        await apiCuocHenKhamBenh.create(payload);
        message.success("Đặt lịch khám bệnh thành công!");
      } else if (loaiHen === "tu_van_dinh_duong") {
        // Đặt lịch tư vấn dinh dưỡng - giống AutoBookingModal
        const payload = {
          id_benh_nhan: values.id_benh_nhan,
          id_chuyen_gia: selectedTimeSlot.id_chuyen_gia,
          id_khung_gio: selectedTimeSlot.id_khung_gio,
          ngay_kham: dateStr,
          loai_hen: "truc_tiep",
          loai_dinh_duong: selectedTimeSlot.ten_chuyen_nganh || "",
          ly_do_tu_van: values.ly_do_tu_van || "",
        };

        await apiCuocHenTuVan.create(payload);
        message.success("Đặt lịch tư vấn dinh dưỡng thành công!");
      }

      // Reset form
      form.resetFields();
      setLoaiHen("kham_benh");
      setAvailableTimeSlots([]);
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
      // Error message đã được hiển thị tự động bởi axios interceptor
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi thay đổi loại hẹn
  const handleLoaiHenChange = (value) => {
    setLoaiHen(value);
    form.setFieldsValue({
      id_chuyen_khoa: undefined,
      id_chuyen_nganh: undefined,
      id_khung_gio: undefined,
      ngay_hen: form.getFieldValue("ngay_hen"),
    });
    setAvailableTimeSlots([]);
    
    // Nếu đã chọn ngày, tự động tìm lại khung giờ
    const ngayHen = form.getFieldValue("ngay_hen");
    const idChuyenKhoaOrNganh = form.getFieldValue(
      value === "kham_benh" ? "id_chuyen_khoa" : "id_chuyen_nganh"
    );
    if (ngayHen && idChuyenKhoaOrNganh) {
      fetchAvailableTimeSlots(ngayHen, value, idChuyenKhoaOrNganh);
    }
  };

  // Xử lý khi thay đổi chuyên khoa/chuyên ngành
  const handleSpecialtyChange = (value, type) => {
    if (type === "kham_benh") {
      form.setFieldsValue({ id_chuyen_khoa: value });
    } else {
      form.setFieldsValue({ id_chuyen_nganh: value });
    }
    form.setFieldsValue({ id_khung_gio: undefined });
    setAvailableTimeSlots([]);
    
    // Nếu đã chọn ngày, tìm khung giờ available
    const ngayHen = form.getFieldValue("ngay_hen");
    if (ngayHen && value) {
      fetchAvailableTimeSlots(ngayHen, loaiHen, value);
    }
  };

  // Xử lý khi thay đổi ngày
  const handleDateChange = (date) => {
    form.setFieldsValue({ ngay_hen: date, id_khung_gio: undefined });
    setAvailableTimeSlots([]);
    
    const currentLoaiHen = form.getFieldValue("loai_hen") || loaiHen;
    const idChuyenKhoaOrNganh = form.getFieldValue(
      currentLoaiHen === "kham_benh" ? "id_chuyen_khoa" : "id_chuyen_nganh"
    );
    
    if (date && idChuyenKhoaOrNganh) {
      fetchAvailableTimeSlots(date, currentLoaiHen, idChuyenKhoaOrNganh);
    }
  };

  const handleConfirm = async (record) => {
    try {
      await apiCuocHenKham.update(record.id_cuoc_hen, { trang_thai: "da_xac_nhan" });
      message.success("Xác nhận lịch hẹn thành công!");
      fetchData();
    } catch (error) {
      message.error("Không thể xác nhận lịch hẹn");
      console.error(error);
    }
  };

  const handleCancel = async (record) => {
    Modal.confirm({
      title: "Xác nhận hủy lịch hẹn",
      content: "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      okText: "Hủy lịch",
      cancelText: "Không",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiCuocHenKham.update(record.id_cuoc_hen, { trang_thai: "da_huy" });
          message.success("Đã hủy lịch hẹn");
          fetchData();
        } catch (error) {
          message.error("Không thể hủy lịch hẹn");
          console.error(error);
        }
      },
    });
  };

  const handleViewDetail = (record) => {
    setSelectedAppointment(record);
    setIsDetailModalVisible(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      cho_xac_nhan: {
        color: "warning",
        text: "Chờ xác nhận",
        icon: <SyncOutlined spin />,
      },
      da_xac_nhan: {
        color: "success",
        text: "Đã xác nhận",
        icon: <CheckCircleOutlined />,
      },
      da_kham: {
        color: "processing",
        text: "Đã khám",
        icon: <CheckCircleOutlined />,
      },
      da_huy: {
        color: "error",
        text: "Đã hủy",
        icon: <CloseCircleOutlined />,
      },
      khong_den: {
        color: "default",
        text: "Không đến",
        icon: <CloseCircleOutlined />,
      },
    };
    return configs[status] || configs.cho_xac_nhan;
  };

  const columns = [
    {
      title: "Mã cuộc hẹn",
      dataIndex: "id_cuoc_hen",
      key: "id_cuoc_hen",
      width: 120,
      render: (id) => (
        <Text strong style={{ color: "#f39c12" }}>
          #{id?.substring(0, 8)}
        </Text>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      width: 150,
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined style={{ marginRight: "6px", color: "#f39c12" }} />
            <Text strong>{moment(record.ngay_hen).format("DD/MM/YYYY")}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.gio_bat_dau} - {record.gio_ket_thuc}
          </Text>
        </div>
      ),
    },
    {
      title: "Bệnh nhân",
      key: "patient",
      render: (_, record) => {
        const patient = patients.find((p) => p.id_benh_nhan === record.id_benh_nhan);
        return (
          <div>
            <div>
              <UserOutlined style={{ marginRight: "6px" }} />
              <Text strong>{patient?.ho_ten || "N/A"}</Text>
            </div>
            {patient?.so_dien_thoai && (
              <div>
                <PhoneOutlined style={{ marginRight: "6px", fontSize: "11px" }} />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {patient.so_dien_thoai}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Bác sĩ",
      key: "doctor",
      render: (_, record) => {
        const doctor = doctors.find((d) => d.id_bac_si === record.id_bac_si);
        return <Text>{doctor?.ho_ten || "N/A"}</Text>;
      },
    },
    {
      title: "Chuyên khoa",
      key: "specialty",
      render: (_, record) => {
        const specialty = specialties.find((s) => s.id_chuyen_khoa === record.id_chuyen_khoa);
        return <Tag color="blue">{specialty?.ten_chuyen_khoa || "N/A"}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => {
        const { color, text, icon } = getStatusConfig(status);
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          {record.trang_thai === "cho_xac_nhan" && (
            <>
              <Tooltip title="Xác nhận">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirm(record)}
                  style={{ color: "#52c41a" }}
                />
              </Tooltip>
              <Tooltip title="Hủy">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancel(record)}
                  style={{ color: "#ff4d4f" }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getFilteredAppointments = () => {
    let filtered = appointments.filter(
      (appt) =>
        patients
          .find((p) => p.id_benh_nhan === appt.id_benh_nhan)
          ?.ho_ten?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        doctors
          .find((d) => d.id_bac_si === appt.id_bac_si)
          ?.ho_ten?.toLowerCase()
          .includes(searchText.toLowerCase())
    );

    if (activeTab !== "all") {
      filtered = filtered.filter((appt) => appt.trang_thai === activeTab);
    }

    return filtered;
  };

  const getTabCount = (status) => {
    return appointments.filter((appt) => appt.trang_thai === status).length;
  };

  // Calendar view functions
  const getWeekStart = (date) => {
    const d = moment(date);
    return d.startOf('week');
  };

  const getWeekDays = (date) => {
    const weekStart = getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, 'days'));
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    return getFilteredAppointments().filter(appt => {
      const apptDate = moment(appt.ngay_hen || appt.ngay_kham).format('YYYY-MM-DD');
      return apptDate === dateStr;
    });
  };

  const renderCalendarView = () => {
    const weekDays = getWeekDays(selectedDate);
    
    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Button onClick={() => setSelectedDate(moment(selectedDate).subtract(1, 'week'))}>
              Tuần trước
            </Button>
          </Col>
          <Col>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              picker="week"
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Button onClick={() => setSelectedDate(moment())}>Hôm nay</Button>
          </Col>
          <Col>
            <Button onClick={() => setSelectedDate(moment(selectedDate).add(1, 'week'))}>
              Tuần sau
            </Button>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = day.isSame(moment(), 'day');
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={day.format('YYYY-MM-DD')}>
                <Card
                  title={
                    <div>
                      <Text strong style={{ color: isToday ? '#f39c12' : '#333' }}>
                        {day.format('dddd')}
                      </Text>
                      <br />
                      <Text type="secondary">{day.format('DD/MM/YYYY')}</Text>
                      {dayAppointments.length > 0 && (
                        <Badge count={dayAppointments.length} style={{ marginLeft: 8 }} />
                      )}
                    </div>
                  }
                  style={{
                    borderRadius: '12px',
                    border: isToday ? '2px solid #f39c12' : '1px solid #e8e8e8',
                    height: '100%',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {dayAppointments.length > 0 ? (
                      dayAppointments.map((appt) => {
                        const patient = patients.find(p => p.id_benh_nhan === appt.id_benh_nhan);
                        const doctor = doctors.find(d => d.id_bac_si === appt.id_bac_si);
                        const { color, text, icon } = getStatusConfig(appt.trang_thai);
                        
                        return (
                          <Card
                            key={appt.id_cuoc_hen}
                            size="small"
                            style={{
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: '#f9f9f9',
                            }}
                            onClick={() => handleViewDetail(appt)}
                          >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Text strong style={{ fontSize: '13px' }}>
                                {patient?.ho_ten || 'N/A'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                BS. {doctor?.ho_ten || 'N/A'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                {appt.gio_bat_dau} - {appt.gio_ket_thuc}
                              </Text>
                              <Tag color={color} icon={icon} style={{ fontSize: '10px' }}>
                                {text}
                              </Tag>
                            </Space>
                          </Card>
                        );
                      })
                    ) : (
                      <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                        Không có lịch hẹn
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          📅 Quản lý lịch hẹn
        </Title>
        <Text type="secondary">Quản lý và xác nhận lịch hẹn khám bệnh</Text>
      </div>

      {/* Actions */}
      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Col>
          <Col>
            <Segmented
              options={[
                { label: <span><TableOutlined /> Bảng</span>, value: "table" },
                { label: <span><AppstoreOutlined /> Lịch</span>, value: "calendar" },
              ]}
              value={viewMode}
              onChange={setViewMode}
              size="large"
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreateAppointment}
              style={{
                background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Đặt lịch hẹn mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabs & Table or Calendar */}
      <Card style={{ borderRadius: "12px" }}>
        {viewMode === "calendar" ? (
          renderCalendarView()
        ) : (
          <>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: "all",
                  label: (
                    <span>
                      <CalendarOutlined />
                      Tất cả ({appointments.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={getFilteredAppointments()}
                      loading={loading}
                      rowKey="id_cuoc_hen"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} lịch hẹn`,
                      }}
                    />
                  ),
                },
                {
                  key: "cho_xac_nhan",
                  label: (
                    <Badge count={getTabCount("cho_xac_nhan")} offset={[10, 0]}>
                      <span>
                        <SyncOutlined spin />
                        Chờ xác nhận
                      </span>
                    </Badge>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={getFilteredAppointments()}
                      loading={loading}
                      rowKey="id_cuoc_hen"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} lịch hẹn`,
                      }}
                    />
                  ),
                },
                {
                  key: "da_xac_nhan",
                  label: (
                    <span>
                      <CheckCircleOutlined />
                      Đã xác nhận ({getTabCount("da_xac_nhan")})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={getFilteredAppointments()}
                      loading={loading}
                      rowKey="id_cuoc_hen"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} lịch hẹn`,
                      }}
                    />
                  ),
                },
                {
                  key: "da_huy",
                  label: (
                    <span>
                      <CloseCircleOutlined />
                      Đã hủy ({getTabCount("da_huy")})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={getFilteredAppointments()}
                      loading={loading}
                      rowKey="id_cuoc_hen"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} lịch hẹn`,
                      }}
                    />
                  ),
                },
              ]}
            />
          </>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <PlusOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Đặt lịch hẹn mới
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="id_benh_nhan"
                label="Bệnh nhân"
                rules={[{ required: true, message: "Vui lòng chọn bệnh nhân!" }]}
              >
                <Select
                  placeholder="Chọn bệnh nhân"
                  showSearch
                  filterOption={(input, option) => {
                    const children = option.children || option.label || '';
                    const childrenStr = typeof children === 'string' ? children : String(children);
                    return childrenStr.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {patients.map((patient) => (
                    <Option key={patient.id_benh_nhan} value={patient.id_benh_nhan}>
                      {patient.ho_ten} - {patient.so_dien_thoai}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="loai_hen"
                label="Loại hẹn"
                rules={[{ required: true, message: "Vui lòng chọn loại hẹn!" }]}
                initialValue="kham_benh"
              >
                <Select 
                  placeholder="Chọn loại hẹn"
                  onChange={handleLoaiHenChange}
                >
                  <Option value="kham_benh">Khám bệnh</Option>
                  <Option value="tu_van_dinh_duong">Tư vấn dinh dưỡng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {loaiHen === "kham_benh" ? (
              <Col span={12}>
                <Form.Item
                  name="id_chuyen_khoa"
                  label="Chuyên khoa"
                  rules={[{ required: true, message: "Vui lòng chọn chuyên khoa!" }]}
                >
                  <Select 
                    placeholder="Chọn chuyên khoa"
                    onChange={(value) => handleSpecialtyChange(value, "kham_benh")}
                  >
                    {specialties.map((specialty) => (
                      <Option key={specialty.id_chuyen_khoa} value={specialty.id_chuyen_khoa}>
                        {specialty.ten_chuyen_khoa}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  name="id_chuyen_nganh"
                  label="Chuyên ngành dinh dưỡng"
                  rules={[{ required: true, message: "Vui lòng chọn chuyên ngành dinh dưỡng!" }]}
                >
                  <Select 
                    placeholder="Chọn chuyên ngành dinh dưỡng"
                    onChange={(value) => handleSpecialtyChange(value, "tu_van")}
                  >
                    {nutritionSpecialties.map((specialty) => (
                      <Option key={specialty.id_chuyen_nganh} value={specialty.id_chuyen_nganh}>
                        {specialty.ten_chuyen_nganh}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                name="ngay_hen"
                label="Ngày hẹn"
                rules={[{ required: true, message: "Vui lòng chọn ngày hẹn!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày hẹn"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  disabledDate={(current) => current && current < moment().startOf("day")}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="id_khung_gio"
                label="Khung giờ (đã tự động chọn bác sĩ/chuyên gia có lịch trống)"
                rules={[{ required: true, message: "Vui lòng chọn khung giờ!" }]}
              >
                <Select 
                  placeholder={
                    availableTimeSlots.length === 0 
                      ? "Vui lòng chọn ngày và chuyên khoa/chuyên ngành trước" 
                      : "Chọn khung giờ"
                  }
                  disabled={availableTimeSlots.length === 0}
                >
                  {availableTimeSlots.map((slot) => (
                    <Option key={slot.id_khung_gio} value={slot.id_khung_gio}>
                      {slot.gio_bat_dau} - {slot.gio_ket_thuc}
                      {loaiHen === "kham_benh" && slot.ten_bac_si && (
                        <span style={{ color: "#52c41a", marginLeft: "8px" }}>
                          (BS. {slot.ten_bac_si})
                        </span>
                      )}
                      {loaiHen === "tu_van_dinh_duong" && slot.ten_chuyen_gia && (
                        <span style={{ color: "#52c41a", marginLeft: "8px" }}>
                          (CG. {slot.ten_chuyen_gia})
                        </span>
                      )}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name={loaiHen === "kham_benh" ? "ly_do_kham" : "ly_do_tu_van"} 
            label={loaiHen === "kham_benh" ? "Lý do khám" : "Lý do tư vấn"}
          >
            <Input.TextArea 
              rows={3} 
              placeholder={loaiHen === "kham_benh" ? "Nhập lý do khám bệnh" : "Nhập lý do tư vấn"} 
            />
          </Form.Item>

          {loaiHen === "kham_benh" && (
            <Form.Item 
              name="trieu_chung" 
              label="Triệu chứng"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Nhập triệu chứng bệnh (nếu có)" 
              />
            </Form.Item>
          )}

          {loading && availableTimeSlots.length === 0 && form.getFieldValue("ngay_hen") && (
            <div style={{ textAlign: "center", padding: "20px", color: "#8c8c8c" }}>
              Đang tải khung giờ trống...
            </div>
          )}

          {!loading && form.getFieldValue("ngay_hen") && availableTimeSlots.length === 0 && 
           (form.getFieldValue("id_chuyen_khoa") || form.getFieldValue("id_chuyen_nganh")) && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#8c8c8c",
                background: "#fafafa",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              Không có khung giờ trống trong ngày này
            </div>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)} disabled={loading}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading || availableTimeSlots.length === 0}
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                }}
              >
                Đặt lịch
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <EyeOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Chi tiết lịch hẹn
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedAppointment && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" style={{ borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                    Trạng thái
                  </Text>
                  {(() => {
                    const { color, text, icon } = getStatusConfig(selectedAppointment.trang_thai);
                    return (
                      <Tag color={color} icon={icon} style={{ fontSize: "14px", padding: "4px 12px" }}>
                        {text}
                      </Tag>
                    );
                  })()}
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Bệnh nhân
                </Text>
                <Text strong>
                  {patients.find((p) => p.id_benh_nhan === selectedAppointment.id_benh_nhan)
                    ?.ho_ten || "N/A"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Bác sĩ
                </Text>
                <Text strong>
                  {doctors.find((d) => d.id_bac_si === selectedAppointment.id_bac_si)?.ho_ten ||
                    "N/A"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Ngày hẹn
                </Text>
                <Text strong>{moment(selectedAppointment.ngay_hen).format("DD/MM/YYYY")}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Giờ khám
                </Text>
                <Text strong>
                  {selectedAppointment.gio_bat_dau} - {selectedAppointment.gio_ket_thuc}
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Lý do khám
                </Text>
                <Text>{selectedAppointment.ly_do_kham || "Không có"}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;

