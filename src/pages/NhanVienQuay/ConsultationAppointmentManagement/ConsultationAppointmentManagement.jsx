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
  AppleOutlined,
} from "@ant-design/icons";
import apiBenhNhan from "../../../api/BenhNhan";
import apiKhungGioKham from "../../../api/KhungGioKham";
import apiChuyenGiaDinhDuong from "../../../api/ChuyenGiaDinhDuong";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiLichLamViec from "../../../api/LichLamViec";
import apiNguoiDung from "../../../api/NguoiDung";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const ConsultationAppointmentManagement = () => {
  const { message } = App.useApp();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [nutritionSpecialties, setNutritionSpecialties] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [form] = Form.useForm();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  const ngayHen = Form.useWatch("ngay_hen", form);
  const idChuyenNganh = Form.useWatch("id_chuyen_nganh", form);

  useEffect(() => {
    fetchData();
  }, []);

  // Tự động fetch khung giờ khi ngày hoặc chuyên ngành thay đổi
  useEffect(() => {
    if (ngayHen && idChuyenNganh) {
      fetchAvailableTimeSlots(ngayHen, idChuyenNganh);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [ngayHen, idChuyenNganh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptTuVanData, patientData, nutritionistData, timeSlotData, nutritionSpecialtyData] = await Promise.all([
        apiCuocHenTuVan.getAll().catch(() => []),
        apiBenhNhan.getAll(),
        apiChuyenGiaDinhDuong.getAll().catch(() => []),
        apiKhungGioKham.getAll(),
        apiChuyenGiaDinhDuong.getAllChuyenNganh().catch(() => []),
      ]);

      // Ghép dữ liệu chuyên gia với thông tin người dùng để có họ tên hiển thị
      const mergedNutritionists = await Promise.all(
        (nutritionistData || []).map(async (cg) => {
          try {
            // Backend hiện đang ánh xạ ho_ten từ NguoiDung qua id_chuyen_gia
            const user = await apiNguoiDung.getUserById(cg.id_chuyen_gia);
            return { ...cg, ...user };
          } catch {
            return cg;
          }
        })
      );

      // Chỉ lấy lịch hẹn tư vấn dinh dưỡng
      const tuVanAppointments = (apptTuVanData || []).map(apt => ({ ...apt, loai_hen: 'tu_van_dinh_duong' }));

      // Tạo map cho chuyên gia để tra cứu nhanh theo nhiều khóa khác nhau
      const nList = mergedNutritionists || [];
      const nutritionistByChuyenGiaId = Object.fromEntries(
        nList.filter(n => n?.id_chuyen_gia).map(n => [n.id_chuyen_gia, n])
      );
      const nutritionistByUserId = Object.fromEntries(
        nList.filter(n => n?.id_nguoi_dung).map(n => [n.id_nguoi_dung, n])
      );

      // Chuẩn hóa dữ liệu cuộc hẹn, gán object chuyên gia và khung giờ nếu tìm được
      const normalizedApts = (tuVanAppointments || []).map(appt => {
        const cgId =
          appt.id_chuyen_gia ||
          appt.id_chuyen_gia_dinh_duong ||
          appt.chuyenGia?.id_chuyen_gia ||
          appt.nutritionist?.id_chuyen_gia ||
          null;
        const userId =
          appt.id_nguoi_dung ||
          appt.chuyenGia?.id_nguoi_dung ||
          appt.nutritionist?.id_nguoi_dung ||
          null;
        const cg =
          (cgId ? nutritionistByChuyenGiaId[cgId] : null) ||
          (userId ? nutritionistByUserId[userId] : null) ||
          null;

        const id_khung_gio =
          appt.id_khung_gio ||
          appt.khungGio?.id_khung_gio ||
          appt.khung_gio?.id_khung_gio ||
          null;
        const kg =
          appt.khungGio ||
          appt.khung_gio ||
          (id_khung_gio ? (timeSlotData || []).find(ts => ts.id_khung_gio === id_khung_gio) : null);

        return { 
          ...appt, 
          chuyenGiaObj: cg,
          khungGio: kg || null,
          gio_bat_dau: appt.gio_bat_dau || kg?.gio_bat_dau || null,
          gio_ket_thuc: appt.gio_ket_thuc || kg?.gio_ket_thuc || null,
        };
      });

      setAppointments(normalizedApts);
      setPatients(patientData || []);
      setNutritionists(nList);
      setTimeSlots(timeSlotData || []);
      setNutritionSpecialties(nutritionSpecialtyData || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    const date = moment(d);
    if (!date.isValid()) return "";
    const year = date.year();
    const month = String(date.month() + 1).padStart(2, "0");
    const day = String(date.date()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAvailableTimeSlots = async (ngayHen, idChuyenNganh) => {
    if (!ngayHen || !idChuyenNganh) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoading(true);
    try {
      const dateStr = formatDate(ngayHen);
      
      const allSchedules = await apiLichLamViec.getAll();
      const schedulesOnDate = allSchedules.filter(
        (schedule) => formatDate(new Date(schedule.ngay_lam_viec)) === dateStr
      );

      const allTimeSlots = await apiKhungGioKham.getAll();
      const availableSlots = [];

      // Tìm chuyên gia có lịch trống
      const allExperts = await apiChuyenGiaDinhDuong.getAll();

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

      const expertsToCheck = mergedExperts.filter(
        (expert) => String(expert.id_chuyen_nganh) === String(idChuyenNganh)
      );

      for (const timeSlot of allTimeSlots) {
        const ca = timeSlot.ca;
        const expertsInCa = schedulesOnDate
          .filter((s) => s.ca === ca)
          .map((s) => s.id_nguoi_dung);

        const availableExperts = expertsToCheck.filter((expert) =>
          expertsInCa.includes(expert.id_chuyen_gia)
        );

        for (const expert of availableExperts) {
          try {
            const countData = await apiCuocHenTuVan.countByTimeSlot(
              expert.id_chuyen_gia,
              timeSlot.id_khung_gio,
              dateStr
            );

            if (countData.count < countData.max_count) {
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
              break;
            }
          } catch (err) {
            console.error(`Lỗi khi check chuyên gia ${expert.id_chuyen_gia}:`, err);
          }
        }
      }

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

      form.resetFields();
      setAvailableTimeSlots([]);
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (value) => {
    form.setFieldsValue({ id_chuyen_nganh: value, id_khung_gio: undefined });
    // useEffect sẽ tự động fetch khi idChuyenNganh thay đổi
  };

  const handleDateChange = (date) => {
    form.setFieldsValue({ ngay_hen: date, id_khung_gio: undefined });
    // useEffect sẽ tự động fetch khi ngayHen thay đổi
  };

  const handleConfirm = async (record) => {
    try {
      await apiCuocHenTuVan.update(record.id_cuoc_hen, { trang_thai: "da_xac_nhan" });
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
          const response = await apiCuocHenTuVan.update(record.id_cuoc_hen, { trang_thai: "da_huy" });
          
          // Hiển thị thông báo hoàn tiền nếu có
          if (response?.refundInfo?.message) {
            message.success(response.refundInfo.message, 5);
          } else {
            message.success("Đã hủy lịch hẹn");
          }
          fetchData();
        } catch (error) {
          const errorMessage = error?.response?.data?.message || "Không thể hủy lịch hẹn";
          message.error(errorMessage);
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

  // Helper: tìm chuyên gia cho 1 bản ghi
  const resolveNutritionist = (record) => {
    if (record?.chuyenGiaObj) return record.chuyenGiaObj;
    const byCg = nutritionists.find((n) => n.id_chuyen_gia === record.id_chuyen_gia || n.id_chuyen_gia === record?.chuyenGia?.id_chuyen_gia || n.id_chuyen_gia === record?.nutritionist?.id_chuyen_gia || n.id_chuyen_gia === record?.id_chuyen_gia_dinh_duong);
    if (byCg) return byCg;
    const byUser = nutritionists.find((n) => n.id_nguoi_dung === record.id_nguoi_dung || n.id_nguoi_dung === record?.chuyenGia?.id_nguoi_dung || n.id_nguoi_dung === record?.nutritionist?.id_nguoi_dung);
    return byUser || null;
  };

  const columns = [
    {
      title: "Mã cuộc hẹn",
      dataIndex: "id_cuoc_hen",
      key: "id_cuoc_hen",
      width: 120,
      render: (id) => (
        <Text strong style={{ color: "#ff9800" }}>
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
            <CalendarOutlined style={{ marginRight: "6px", color: "#ff9800" }} />
            <Text strong>{moment(record.ngay_hen || record.ngay_kham).format("DD/MM/YYYY")}</Text>
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
      title: "Chuyên gia",
      key: "nutritionist",
      render: (_, record) => {
        const nutritionist = resolveNutritionist(record);
        return <Text>CG. {nutritionist?.ho_ten || "N/A"}</Text>;
      },
    },
    {
      title: "Chuyên ngành",
      key: "specialty",
      render: (_, record) => {
        const specialty = nutritionSpecialties.find((s) => s.id_chuyen_nganh === record.id_chuyen_nganh);
        return <Tag color="orange">{specialty?.ten_chuyen_nganh || record.loai_dinh_duong || "N/A"}</Tag>;
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

    if (searchText.trim()) {
      filtered = filtered.filter((appt) => {
        const patient = patients.find((p) => p.id_benh_nhan === appt.id_benh_nhan);
        const patientName = patient?.ho_ten?.toLowerCase() || "";
        const nutritionist = appt.chuyenGiaObj || nutritionists.find((n) => n.id_chuyen_gia === appt.id_chuyen_gia || n.id_nguoi_dung === appt.id_nguoi_dung);
        const providerName = nutritionist?.ho_ten?.toLowerCase() || "";
        const searchLower = searchText.toLowerCase().trim();
        return patientName.includes(searchLower) || providerName.includes(searchLower);
      });
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((appt) => appt.trang_thai === activeTab);
    }

    return filtered;
  };

  const getTabCount = (status) => {
    return appointments.filter((appt) => appt.trang_thai === status).length;
  };

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
                      <Text strong style={{ color: isToday ? '#ff9800' : '#333' }}>
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
                    border: isToday ? '2px solid #ff9800' : '1px solid #e8e8e8',
                    height: '100%',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {dayAppointments.length > 0 ? (
                      dayAppointments.map((appt) => {
                        const patient = patients.find(p => p.id_benh_nhan === appt.id_benh_nhan);
                        const nutritionist = appt.chuyenGiaObj || nutritionists.find(n => n.id_chuyen_gia === appt.id_chuyen_gia || n.id_nguoi_dung === appt.id_nguoi_dung);
                        const { color, text, icon } = getStatusConfig(appt.trang_thai);
                        
                        return (
                          <Card
                            key={appt.id_cuoc_hen}
                            size="small"
                            style={{
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: '#fff7e6',
                              border: '1px solid #ffa940',
                            }}
                            onClick={() => handleViewDetail(appt)}
                          >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Text strong style={{ fontSize: '13px' }}>
                                {patient?.ho_ten || 'N/A'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                CG. {nutritionist?.ho_ten || 'N/A'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                {appt.gio_bat_dau} - {appt.gio_ket_thuc}
                              </Text>
                              <Tag color={color} icon={icon} style={{ fontSize: '10px' }}>
                                {text}
                              </Tag>
                              <Tag color="orange" style={{ fontSize: '9px' }}>
                                Tư vấn dinh dưỡng
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
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          🍎 Quản lý lịch hẹn tư vấn dinh dưỡng
        </Title>
        <Text type="secondary">Quản lý và xác nhận lịch hẹn tư vấn dinh dưỡng</Text>
      </div>

      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên bệnh nhân, chuyên gia..."
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
                background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Đặt lịch tư vấn mới
            </Button>
          </Col>
        </Row>
      </Card>

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
                      <AppleOutlined />
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

      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <PlusOutlined style={{ marginRight: "8px", color: "#ff9800" }} />
            Đặt lịch tư vấn dinh dưỡng mới
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
                name="id_chuyen_nganh"
                label="Chuyên ngành dinh dưỡng"
                rules={[{ required: true, message: "Vui lòng chọn chuyên ngành dinh dưỡng!" }]}
              >
                <Select 
                  placeholder="Chọn chuyên ngành dinh dưỡng"
                  onChange={handleSpecialtyChange}
                >
                  {nutritionSpecialties.map((specialty) => (
                    <Option key={specialty.id_chuyen_nganh} value={specialty.id_chuyen_nganh}>
                      {specialty.ten_chuyen_nganh}
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
                label="Khung giờ (đã tự động chọn chuyên gia có lịch trống)"
                rules={[{ required: true, message: "Vui lòng chọn khung giờ!" }]}
              >
                <Select 
                  placeholder={
                    !ngayHen || !idChuyenNganh
                      ? "Vui lòng chọn ngày và chuyên ngành trước" 
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
                      {slot.ten_chuyen_gia && (
                        <span style={{ color: "#096dd9", marginLeft: "8px" }}>
                          (CG. {slot.ten_chuyen_gia})
                        </span>
                      )}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Thông báo trạng thái */}
          {loading && ngayHen && idChuyenNganh && (
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

          {!loading && ngayHen && idChuyenNganh && availableTimeSlots.length > 0 && (
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

          {!loading && ngayHen && idChuyenNganh && availableTimeSlots.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "12px", 
              color: "#ff4d4f",
              background: "#fff2f0",
              borderRadius: "6px",
              marginBottom: "16px",
              border: "1px solid #ffccc7"
            }}>
              ⚠ Không có khung giờ trống trong ngày này. Vui lòng chọn ngày khác hoặc chuyên ngành khác.
            </div>
          )}

          <Form.Item 
            name="ly_do_tu_van" 
            label="Lý do tư vấn"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập lý do tư vấn" 
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
                  background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  border: "none",
                }}
              >
                Đặt lịch
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <EyeOutlined style={{ marginRight: "8px", color: "#ff9800" }} />
            Chi tiết lịch hẹn tư vấn
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
                  Chuyên gia
                </Text>
                <Text strong>
                  {(() => {
                    const nutritionist = selectedAppointment.chuyenGiaObj || nutritionists.find((n) =>
                      n.id_chuyen_gia === selectedAppointment.id_chuyen_gia ||
                      n.id_nguoi_dung === selectedAppointment.id_nguoi_dung
                    );
                    return nutritionist?.ho_ten || "N/A";
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
                  Giờ tư vấn
                </Text>
                <Text strong>
                  {selectedAppointment.gio_bat_dau} - {selectedAppointment.gio_ket_thuc}
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Chuyên ngành dinh dưỡng
                </Text>
                <Tag color="orange">
                  {nutritionSpecialties.find((s) => s.id_chuyen_nganh === selectedAppointment.id_chuyen_nganh)?.ten_chuyen_nganh || selectedAppointment.loai_dinh_duong || "N/A"}
                </Tag>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ display: "block", marginBottom: "4px" }}>
                  Lý do tư vấn
                </Text>
                <Text>{selectedAppointment.ly_do_tu_van || "Không có"}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsultationAppointmentManagement;

