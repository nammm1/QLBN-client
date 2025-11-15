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
  Typography,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  Segmented,
  App,
  Spin,
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
  const { message } = App.useApp();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nutritionists, setNutritionists] = useState([]); // Chuyên gia dinh dưỡng
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
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // Khung giờ có bác sĩ available
  
  // Watch form values to avoid useForm warning
  const ngayHen = Form.useWatch("ngay_hen", form);
  const idChuyenKhoa = Form.useWatch("id_chuyen_khoa", form);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptKhamData, apptTuVanData, patientData, doctorData, nutritionistData, specialtyData, timeSlotData, nutritionSpecialtyData] = await Promise.all([
        apiCuocHenKham.getAll().catch(() => []),
        apiCuocHenTuVan.getAll().catch(() => []),
        apiBenhNhan.getAll(),
        apiBacSi.getAll(),
        apiChuyenGiaDinhDuong.getAll().catch(() => []),
        apiChuyenKhoa.getAllChuyenKhoa(), // Giống AutoBookingModal
        apiKhungGioKham.getAll(),
        apiChuyenGiaDinhDuong.getAllChuyenNganh().catch(() => []),
      ]);

      // Chỉ hiển thị lịch hẹn khám bệnh cho trang này
      const khamAppointments = (apptKhamData || []).map(apt => ({ ...apt, loai_hen: 'kham_benh' }));

      setAppointments(khamAppointments);
      setPatients(patientData || []);
      setDoctors(doctorData || []);
      setNutritionists(nutritionistData || []);
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

  // Tìm khung giờ available khi chọn ngày và chuyên khoa - Logic từ AutoBookingModal
  const fetchAvailableTimeSlots = async (ngayHen, idChuyenKhoa) => {
    if (!ngayHen || !idChuyenKhoa) {
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

      // Tìm bác sĩ có lịch trống
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
        (bs) => String(bs.id_chuyen_khoa) === String(idChuyenKhoa)
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

  // Tự động fetch khung giờ khi ngày hoặc chuyên khoa thay đổi
  useEffect(() => {
    if (ngayHen && idChuyenKhoa) {
      fetchAvailableTimeSlots(ngayHen, idChuyenKhoa);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [ngayHen, idChuyenKhoa]);

  const handleCreateAppointment = () => {
    form.resetFields();
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

      // Đặt lịch khám bệnh
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

      // Reset form
      form.resetFields();
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

  // Xử lý khi thay đổi chuyên khoa
  const handleSpecialtyChange = (value) => {
    form.setFieldsValue({ id_chuyen_khoa: value, id_khung_gio: undefined });
    // useEffect sẽ tự động fetch khi idChuyenKhoa thay đổi
  };

  // Xử lý khi thay đổi ngày
  const handleDateChange = (date) => {
    form.setFieldsValue({ ngay_hen: date, id_khung_gio: undefined });
    // useEffect sẽ tự động fetch khi ngayHen thay đổi
  };

  const handleConfirm = async (record) => {
    try {
      const isTuVan = record.loai_hen === 'tu_van_dinh_duong' || record.id_chuyen_gia;
      if (isTuVan) {
        await apiCuocHenTuVan.update(record.id_cuoc_hen, { trang_thai: "da_xac_nhan" });
      } else {
        await apiCuocHenKhamBenh.update(record.id_cuoc_hen, { trang_thai: "da_xac_nhan" });
      }
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
          const isTuVan = record.loai_hen === 'tu_van_dinh_duong' || record.id_chuyen_gia;
          if (isTuVan) {
            await apiCuocHenTuVan.update(record.id_cuoc_hen, { trang_thai: "da_huy" });
          } else {
            await apiCuocHenKhamBenh.update(record.id_cuoc_hen, { trang_thai: "da_huy" });
          }
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
      da_dat: {
        color: "blue",
        text: "Đã đặt",
        icon: <CalendarOutlined />,
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
      da_hoan_thanh: {
        color: "success",
        text: "Đã hoàn thành",
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
      title: "Bác sĩ/Chuyên gia",
      key: "doctor",
      render: (_, record) => {
        if (record.loai_hen === 'tu_van_dinh_duong' || record.id_chuyen_gia) {
          const nutritionist = nutritionists.find((n) => n.id_chuyen_gia === record.id_chuyen_gia);
          return <Text>CG. {nutritionist?.ho_ten || "N/A"}</Text>;
        } else {
          const doctor = doctors.find((d) => d.id_bac_si === record.id_bac_si);
          return <Text>BS. {doctor?.ho_ten || "N/A"}</Text>;
        }
      },
    },
    {
      title: "Chuyên khoa/Chuyên ngành",
      key: "specialty",
      render: (_, record) => {
        if (record.loai_hen === 'tu_van_dinh_duong' || record.id_chuyen_gia) {
          const specialty = nutritionSpecialties.find((s) => s.id_chuyen_nganh === record.id_chuyen_nganh);
          return <Tag color="orange">{specialty?.ten_chuyen_nganh || "N/A"}</Tag>;
        } else {
          const specialty = specialties.find((s) => s.id_chuyen_khoa === record.id_chuyen_khoa);
          return <Tag color="blue">{specialty?.ten_chuyen_khoa || "N/A"}</Tag>;
        }
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
                  style={{ color: "#096dd9" }}
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
    let filtered = appointments;

    // Filter theo search text nếu có
    if (searchText.trim()) {
      filtered = filtered.filter((appt) => {
        const patient = patients.find((p) => p.id_benh_nhan === appt.id_benh_nhan);
        const patientName = patient?.ho_ten?.toLowerCase() || "";
        
        // Tìm bác sĩ hoặc chuyên gia tùy loại lịch hẹn
        let providerName = "";
        if (appt.loai_hen === 'tu_van_dinh_duong' || appt.id_chuyen_gia) {
          const nutritionist = nutritionists.find((n) => n.id_chuyen_gia === appt.id_chuyen_gia);
          providerName = nutritionist?.ho_ten?.toLowerCase() || "";
        } else {
          const doctor = doctors.find((d) => d.id_bac_si === appt.id_bac_si);
          providerName = doctor?.ho_ten?.toLowerCase() || "";
        }
        
        const searchLower = searchText.toLowerCase().trim();
        return patientName.includes(searchLower) || providerName.includes(searchLower);
      });
    }

    // Filter theo tab (trạng thái)
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
                        // Kiểm tra loại lịch hẹn
                        const isTuVan = appt.loai_hen === 'tu_van_dinh_duong' || appt.id_chuyen_gia;
                        const doctor = isTuVan ? null : doctors.find(d => d.id_bac_si === appt.id_bac_si);
                        const nutritionist = isTuVan ? nutritionists.find(n => n.id_chuyen_gia === appt.id_chuyen_gia) : null;
                        const { color, text, icon } = getStatusConfig(appt.trang_thai);
                        
                        return (
                          <Card
                            key={appt.id_cuoc_hen}
                            size="small"
                            style={{
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: isTuVan ? '#fff7e6' : '#f9f9f9',
                              border: isTuVan ? '1px solid #ffa940' : 'none',
                            }}
                            onClick={() => handleViewDetail(appt)}
                          >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Text strong style={{ fontSize: '13px' }}>
                                {patient?.ho_ten || 'N/A'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                {isTuVan ? `CG. ${nutritionist?.ho_ten || 'N/A'}` : `BS. ${doctor?.ho_ten || 'N/A'}`}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                {appt.gio_bat_dau} - {appt.gio_ket_thuc}
                              </Text>
                              <Tag color={color} icon={icon} style={{ fontSize: '10px' }}>
                                {text}
                              </Tag>
                              {isTuVan && (
                                <Tag color="orange" style={{ fontSize: '9px' }}>
                                  Tư vấn dinh dưỡng
                                </Tag>
                              )}
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
                  key: "da_dat",
                  label: (
                    <span>
                      <CalendarOutlined />
                      Đã đặt ({getTabCount("da_dat")})
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
                  key: "da_hoan_thanh",
                  label: (
                    <span>
                      <CheckCircleOutlined />
                      Đã hoàn thành ({getTabCount("da_hoan_thanh")})
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
                name="id_chuyen_khoa"
                label="Chuyên khoa"
                rules={[{ required: true, message: "Vui lòng chọn chuyên khoa!" }]}
              >
                <Select 
                  placeholder="Chọn chuyên khoa"
                  onChange={handleSpecialtyChange}
                >
                  {specialties.map((specialty) => (
                    <Option key={specialty.id_chuyen_khoa} value={specialty.id_chuyen_khoa}>
                      {specialty.ten_chuyen_khoa}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
                    !ngayHen || !idChuyenKhoa
                      ? "Vui lòng chọn ngày và chuyên khoa trước" 
                      : loading
                      ? "Đang tải khung giờ..."
                      : availableTimeSlots.length === 0
                      ? "Không có khung giờ trống"
                      : "Chọn khung giờ"
                  }
                  disabled={availableTimeSlots.length === 0 || loading}
                  loading={loading}
                  notFoundContent={loading ? "Đang tải..." : "Không có khung giờ trống"}
                >
                  {availableTimeSlots.map((slot) => (
                    <Option key={slot.id_khung_gio} value={slot.id_khung_gio}>
                      {slot.gio_bat_dau} - {slot.gio_ket_thuc}
                      {slot.ten_bac_si && (
                        <span style={{ color: "#096dd9", marginLeft: "8px" }}>
                          (BS. {slot.ten_bac_si})
                        </span>
                      )}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Thông báo trạng thái */}
          {loading && ngayHen && idChuyenKhoa && (
            <div style={{ 
              textAlign: "center", 
              padding: "12px", 
              color: "#1890ff",
              background: "#e6f7ff",
              borderRadius: "6px",
              marginBottom: "16px",
              border: "1px solid #91d5ff"
            }}>
              <Spin size="small" style={{ marginRight: "8px" }} />
              Đang tải khung giờ trống...
            </div>
          )}

          {!loading && ngayHen && idChuyenKhoa && availableTimeSlots.length > 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "12px", 
              color: "#52c41a",
              background: "#f6ffed",
              borderRadius: "6px",
              marginBottom: "16px",
              border: "1px solid #b7eb8f"
            }}>
              ✓ Tìm thấy {availableTimeSlots.length} khung giờ trống. Vui lòng chọn khung giờ phía trên.
            </div>
          )}

          {!loading && ngayHen && idChuyenKhoa && availableTimeSlots.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "12px", 
              color: "#ff4d4f",
              background: "#fff2f0",
              borderRadius: "6px",
              marginBottom: "16px",
              border: "1px solid #ffccc7"
            }}>
              ⚠ Không có khung giờ trống trong ngày này. Vui lòng chọn ngày khác hoặc chuyên khoa khác.
            </div>
          )}

          <Form.Item 
            name="ly_do_kham" 
            label="Lý do khám"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập lý do khám bệnh" 
            />
          </Form.Item>

          <Form.Item 
            name="trieu_chung" 
            label="Triệu chứng"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập triệu chứng bệnh (nếu có)" 
            />
          </Form.Item>

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
                  {(() => {
                    const isTuVan = selectedAppointment.loai_hen === 'tu_van_dinh_duong' || selectedAppointment.id_chuyen_gia;
                    return isTuVan ? "Chuyên gia" : "Bác sĩ";
                  })()}
                </Text>
                <Text strong>
                  {(() => {
                    const isTuVan = selectedAppointment.loai_hen === 'tu_van_dinh_duong' || selectedAppointment.id_chuyen_gia;
                    if (isTuVan) {
                      const nutritionist = nutritionists.find((n) => n.id_chuyen_gia === selectedAppointment.id_chuyen_gia);
                      return nutritionist?.ho_ten || "N/A";
                    } else {
                      const doctor = doctors.find((d) => d.id_bac_si === selectedAppointment.id_bac_si);
                      return doctor?.ho_ten || "N/A";
                    }
                  })()}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Ngày hẹn
                </Text>
                <Text strong>{moment(selectedAppointment.ngay_hen || selectedAppointment.ngay_kham).format("DD/MM/YYYY")}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Giờ {selectedAppointment.loai_hen === 'tu_van_dinh_duong' ? 'tư vấn' : 'khám'}
                </Text>
                <Text strong>
                  {selectedAppointment.gio_bat_dau} - {selectedAppointment.gio_ket_thuc}
                </Text>
              </Col>
              {selectedAppointment.loai_hen === 'tu_van_dinh_duong' && (
                <Col span={24}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                    Chuyên ngành dinh dưỡng
                  </Text>
                  <Tag color="orange">
                    {nutritionSpecialties.find((s) => s.id_chuyen_nganh === selectedAppointment.id_chuyen_nganh)?.ten_chuyen_nganh || selectedAppointment.loai_dinh_duong || "N/A"}
                  </Tag>
                </Col>
              )}
              <Col span={24}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  {selectedAppointment.loai_hen === 'tu_van_dinh_duong' ? 'Lý do tư vấn' : 'Lý do khám'}
                </Text>
                <Text>{selectedAppointment.ly_do_kham || selectedAppointment.ly_do_tu_van || "Không có"}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;

