import React, { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  DatePicker, 
  Typography, 
  Space,
  Badge,
  Row,
  Col,
  Alert,
  Button,
  Modal,
  Form,
  Select,
  Input,
  List,
  Popover,
  message,
  Dropdown,
  Tooltip,
  Statistic,
  Divider,
  Tabs, 
  Avatar,
  Progress,
  Segmented,
  theme
} from "antd";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  PlusOutlined,
  EyeOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  SwapOutlined,
  ReloadOutlined,
  FilterOutlined,
  ScheduleOutlined,
  TeamOutlined,
  StarOutlined,
  RocketOutlined,
  AppstoreOutlined,
  TableOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import updateLocale from "dayjs/plugin/updateLocale";
import isBetween from "dayjs/plugin/isBetween";
import apiLichLamViec from "../../../api/LichLamViec";
import apiCuocHenTuVan from "../../../api/CuocHenTuVan";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiXinNghiPhep from "../../../api/XinNghiPhep";

dayjs.locale("vi");
dayjs.extend(updateLocale);
dayjs.extend(isBetween);

// Cập nhật locale để hiển thị thứ tiếng Việt
dayjs.updateLocale("vi", {
  weekdays: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
});

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { useToken } = theme;

const caList = [
  { key: "Sang", label: "Sáng", color: "gold", start: "07:00", end: "12:00", gradient: "linear-gradient(135deg, #FFD700, #FFA500)" },
  { key: "Chieu", label: "Chiều", color: "orange", start: "13:00", end: "18:00", gradient: "linear-gradient(135deg, #FFA500, #FF6347)" },
  { key: "Toi", label: "Tối", color: "blue", start: "18:00", end: "22:00", gradient: "linear-gradient(135deg, #1890ff, #722ed1)" }
];

const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const trangThaiNghiPhep = {
  cho_duyet: { text: "Chờ duyệt", color: "orange", icon: "⏳" },
  da_duyet: { text: "Đã duyệt", color: "green", icon: "✅" },
  tu_choi: { text: "Từ chối", color: "red", icon: "❌" }
};

const mapCa = (ca) => {
  switch (ca) {
    case "Sang": return "Sáng";
    case "Chieu": return "Chiều";
    case "Toi": return "Tối";
    default: return ca;
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
};

const getMonday = (date) => {
  const d = dayjs(date);
  const day = d.day();
  const diff = day === 0 ? -6 : 1 - day;
  return d.add(diff, "day").startOf("day");
};

const WorkSchedule = () => {
  const { token } = useToken();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(getMonday(dayjs()));
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalXinNghiVisible, setModalXinNghiVisible] = useState(false);
  const [modalLichSuVisible, setModalLichSuVisible] = useState(false);
  const [nghiPhepData, setNghiPhepData] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table, grid
  const [formNghiPhep] = Form.useForm();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const weekRange = [weekStart, weekStart.add(6, 'day')];

  useEffect(() => {
    setWeekStart(getMonday(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    fetchSchedule();
    fetchNghiPhep();
  }, [weekStart, userInfo?.user?.id_nguoi_dung]);

  // Tự động load cuộc hẹn cho tất cả slot có lịch làm việc
  useEffect(() => {
    if (schedule.length > 0) {
      schedule.forEach(slot => {
        const dateStr = formatDate(slot.ngay_lam_viec);
        const slotKey = `${dateStr}_${slot.ca}`;
        
        // Chỉ load nếu chưa có dữ liệu
        if (!appointments[slotKey]) {
          fetchAppointments(dayjs(slot.ngay_lam_viec), slot.ca);
        }
      });
    }
  }, [schedule]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const weekStartStr = formatDate(weekStart);
      const res = await apiLichLamViec.getByWeek(weekStartStr, userInfo.user.id_nguoi_dung);
      const data = res?.data || [];
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (date, ca) => {
    try {
      const dateStr = formatDate(date);
      const res = await apiCuocHenKham.getByDateAndCa(dateStr, ca);
      setAppointments(prev => ({
        ...prev,
        [`${dateStr}_${ca}`]: res || []
      }));
    } catch (error) {
      // Error fetching appointments
    }
  };

  const fetchNghiPhep = async () => {
    try {
      const res = await apiXinNghiPhep.getByBacSi(userInfo.user.id_nguoi_dung);
      setNghiPhepData(res?.data || []);
    } catch (error) {
      // Error fetching leave requests
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleWeekChange = (dates) => {
    if (dates && dates[0]) {
      setSelectedDate(dates[0]);
    }
  };

  const handleSlotClick = (date, ca) => {
    const dateStr = formatDate(date);
    // Chuyển đổi từ display ca sang database ca
    const dbCa = ca === "Sáng" ? "Sang" : 
                 ca === "Chiều" ? "Chieu" : 
                 ca === "Tối" ? "Toi" : ca;
    const slotKey = `${dateStr}_${dbCa}`;
    
    if (!appointments[slotKey]) {
      fetchAppointments(date, dbCa);
    }
    
    setSelectedSlot({ date, ca, dateStr });
    setModalVisible(true);
  };

  const handleXinNghiPhep = async (values) => {
    try {
      await apiXinNghiPhep.create({
        id_nguoi_dung: userInfo.user.id_nguoi_dung,
        ngay_bat_dau: values.ngay_bat_dau.format('YYYY-MM-DD'),
        ngay_ket_thuc: values.ngay_ket_thuc.format('YYYY-MM-DD'),
        ly_do: values.ly_do,
        trang_thai: "cho_duyet"
      });
      message.success("🎉 Gửi đơn xin nghỉ phép thành công!");
      setModalXinNghiVisible(false);
      formNghiPhep.resetFields();
      fetchNghiPhep();
    } catch (error) {
      console.error("Lỗi khi xin nghỉ phép:", error);
      message.error("❌ Có lỗi xảy ra khi gửi đơn");
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    weekStart.add(i, "day")
  );

  const hasSchedulesFor = (d, displayCa) => {
    const dStr = formatDate(d);
    // Chuyển đổi từ display ca sang database ca
    const dbCa = displayCa === "Sáng" ? "Sang" : 
                 displayCa === "Chiều" ? "Chieu" : 
                 displayCa === "Tối" ? "Toi" : displayCa;
    
    return schedule.filter(
      (s) => s.ca === dbCa && formatDate(s.ngay_lam_viec) === dStr
    );
  };

  const getAppointmentsForSlot = (date, ca) => {
    const dateStr = formatDate(date);
    // Chuyển đổi từ display ca sang database ca
    const dbCa = ca === "Sáng" ? "Sang" : 
                 ca === "Chiều" ? "Chieu" : 
                 ca === "Tối" ? "Toi" : ca;
    return appointments[`${dateStr}_${dbCa}`] || [];
  };

  const weekEnd = weekStart.add(6, "day");

  // Tính toán thống kê
  const totalAppointments = Object.values(appointments).flat().length;
  const totalWorkSlots = schedule.length;
  const occupancyRate = totalWorkSlots > 0 ? Math.round((totalAppointments / (totalWorkSlots * 5)) * 100) : 0;

  // Component hiển thị một slot lịch làm việc - ĐÃ SỬA ĐỂ PHÙ HỢP VỚI GRID
  const ScheduleSlot = ({ date, ca, compact = false }) => {
    const matched = hasSchedulesFor(date, ca);
    const slotAppointments = getAppointmentsForSlot(date, ca);
    const hasNghiPhep = nghiPhepData.some(np => 
      dayjs(date).isBetween(dayjs(np.ngay_bat_dau), dayjs(np.ngay_ket_thuc), null, '[]') &&
      np.trang_thai === 'da_duyet'
    );

    const caInfo = caList.find(c => c.label === ca);
    
    const slotStyle = {
      minHeight: compact ? "80px" : "140px",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${hasNghiPhep ? token.colorWarning : matched.length ? token.colorSuccess : token.colorBorderSecondary}`,
      borderRadius: "12px",
      cursor: "pointer",
      position: "relative",
      background: hasNghiPhep ? 
        `linear-gradient(135deg, ${token.colorWarningBg}, #fff7e6)` : 
        matched.length ? 
        `linear-gradient(135deg, ${token.colorSuccessBg}, #f6ffed)` : 
        `linear-gradient(135deg, ${token.colorFillAlter}, #fafafa)`,
      padding: compact ? "8px" : "16px",
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden'
    };

    if (compact) {
      return (
        <div 
          style={slotStyle}
          onClick={() => handleSlotClick(date, ca)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }}
        >
          {hasNghiPhep ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <CloseCircleOutlined style={{ 
                color: token.colorWarning, 
                fontSize: "16px", 
                marginBottom: "4px",
                display: 'block'
              }} />
              <Text strong style={{ 
                color: token.colorWarning, 
                fontSize: "10px",
                display: 'block',
                lineHeight: '1.2'
              }}>
                Nghỉ phép
              </Text>
            </div>
          ) : matched.length ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <Badge 
                count={slotAppointments.length}
                style={{ 
                  backgroundColor: token.colorSuccess,
                  fontSize: '9px',
                  height: '16px',
                  minWidth: '16px',
                  lineHeight: '16px',
                  boxShadow: `0 0 0 2px ${token.colorBgContainer}`
                }}
                size="small"
              >
                <div style={{
                  background: caInfo?.gradient,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  <CheckCircleOutlined style={{ 
                    color: "white", 
                    fontSize: "14px" 
                  }} />
                </div>
              </Badge>
              <Text strong style={{ 
                color: token.colorSuccess, 
                fontSize: "9px",
                display: 'block',
                lineHeight: '1.2'
              }}>
                {matched[0].gio_bat_dau}
              </Text>
              <Text style={{ 
                fontSize: "8px", 
                color: token.colorTextSecondary,
                display: 'block'
              }}>
                - {matched[0].gio_ket_thuc}
              </Text>
            </div>
          ) : (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: token.colorFillSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px',
                opacity: 0.5
              }}>
                <PlusOutlined style={{ color: token.colorTextDisabled, fontSize: '12px' }} />
              </div>
              <Text type="secondary" style={{ 
                fontSize: "9px", 
                display: 'block',
                lineHeight: '1.2'
              }}>
                Trống
              </Text>
            </div>
          )}
        </div>
      );
    }

    // Phiên bản gốc cho table view
    return (
      <div 
        style={slotStyle}
        onClick={() => handleSlotClick(date, ca)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
      >
        {hasNghiPhep ? (
          <div style={{ textAlign: 'center' }}>
            <CloseCircleOutlined style={{ 
              color: token.colorWarning, 
              fontSize: "28px", 
              marginBottom: "8px" 
            }} />
            <div>
              <Text strong style={{ 
                color: token.colorWarning, 
                fontSize: "12px",
                display: 'block'
              }}>
                🏖️ Nghỉ phép
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: "10px", display: 'block', marginTop: '4px' }}>
              {date.format("DD/MM")}
            </Text>
          </div>
        ) : matched.length ? (
          <Popover
            title={
              <Space>
                <ScheduleOutlined />
                <span>Lịch làm việc - {ca}</span>
              </Space>
            }
            content={
              <Space direction="vertical" size="small">
                <div>
                  <Text strong>🕐 Giờ làm:</Text> {matched[0].gio_bat_dau} - {matched[0].gio_ket_thuc}
                </div>
                <div>
                  <Text strong>📋 Cuộc hẹn:</Text> {slotAppointments.length} cuộc hẹn
                </div>
                <Progress 
                  percent={Math.min((slotAppointments.length / 5) * 100, 100)} 
                  size="small" 
                  showInfo={false}
                />
                <Button 
                  type="primary" 
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleSlotClick(date, ca)}
                >
                  Xem chi tiết
                </Button>
              </Space>
            }
          >
            <div style={{ textAlign: 'center' }}>
              <Badge 
                count={slotAppointments.length}
                style={{ 
                  backgroundColor: token.colorSuccess,
                  boxShadow: `0 0 0 2px ${token.colorBgContainer}`
                }}
                size="small"
              >
                <div style={{
                  background: caInfo?.gradient,
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <CheckCircleOutlined style={{ 
                    color: "white", 
                    fontSize: "24px" 
                  }} />
                </div>
              </Badge>
              <div style={{ marginTop: "8px" }}>
                <Text strong style={{ 
                  color: token.colorSuccess, 
                  fontSize: "12px",
                  display: 'block'
                }}>
                  {matched[0].gio_bat_dau} - {matched[0].gio_ket_thuc}
                </Text>
              </div>
              <div>
                <Text style={{ 
                  fontSize: "11px", 
                  color: token.colorTextSecondary,
                  display: 'block'
                }}>
                  {slotAppointments.length} cuộc hẹn
                </Text>
                <Text type="secondary" style={{ fontSize: "10px", display: 'block', marginTop: '2px' }}>
                  {date.format("DD/MM")}
                </Text>
              </div>
            </div>
          </Popover>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: token.colorFillSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              opacity: 0.6
            }}>
              <PlusOutlined style={{ color: token.colorTextDisabled, fontSize: '18px' }} />
            </div>
            <Text type="secondary" style={{ fontSize: "12px", display: 'block' }}>
              Trống
            </Text>
            <Text type="secondary" style={{ fontSize: "10px", display: 'block', marginTop: '2px' }}>
              {date.format("DD/MM")}
            </Text>
          </div>
        )}
      </div>
    );
  };

  // Grid View Component - ĐÃ ĐƯỢC CẢI TIẾN
  const GridView = () => {
    const totalAppointmentsPerDay = weekDays.map(date => 
      caList.reduce((total, ca) => total + getAppointmentsForSlot(date, ca.label).length, 0)
    );

    return (
      <div style={{ padding: '16px 0' }}>
        <Row gutter={[20, 20]}>
          {weekDays.map((date, dayIndex) => {
            const isToday = date.isSame(dayjs(), 'day');
            const isWeekend = dayIndex === 6; // Chủ nhật
            const dayAppointments = totalAppointmentsPerDay[dayIndex];

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={dayIndex}>
                <Card
                  title={
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                      <Badge 
                        dot 
                        color={isToday ? token.colorPrimary : 'transparent'}
                        offset={[-5, 0]}
                      >
                        <Text 
                          strong 
                          style={{ 
                            color: isWeekend ? token.colorError : token.colorPrimary, 
                            fontSize: '14px',
                            background: isToday ? token.colorPrimaryBg : 'transparent',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            display: 'inline-block'
                          }}
                        >
                          {dayNames[dayIndex]}
                        </Text>
                      </Badge>
                      <br />
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: '12px',
                          fontWeight: 500,
                          marginTop: '2px',
                          display: 'block'
                        }}
                      >
                        {date.format("DD/MM/YYYY")}
                      </Text>
                      {dayAppointments > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: token.colorSuccess,
                          color: 'white',
                          borderRadius: '10px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {dayAppointments}
                        </div>
                      )}
                    </div>
                  }
                  size="small"
                  style={{
                    borderRadius: '16px',
                    border: `2px solid ${isToday ? token.colorPrimary : token.colorBorderSecondary}`,
                    boxShadow: isToday 
                      ? `0 4px 16px ${token.colorPrimaryBg}`
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                  styles={{ 
                    body: {
                      padding: '12px',
                      background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
                    }
                  }}
                  headStyle={{
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    padding: '12px'
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {caList.map((ca, caIndex) => {
                      const matched = hasSchedulesFor(date, ca.label);
                      const slotAppointments = getAppointmentsForSlot(date, ca.label);
                      const hasNghiPhep = nghiPhepData.some(np => 
                        dayjs(date).isBetween(np.ngay_bat_dau, np.ngay_ket_thuc, null, '[]') &&
                        np.trang_thai === 'da_duyet'
                      );
                      
                      return (
                        <div key={caIndex}>
                          {/* Header ca làm việc */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                            padding: '0 2px'
                          }}>
                            <Text strong style={{ 
                              fontSize: '11px',
                              color: token.colorTextSecondary
                            }}>
                              {ca.label}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '10px' }}>
                              {ca.start} - {ca.end}
                            </Text>
                          </div>
                          
                          {/* Slot */}
                          <ScheduleSlot date={date} ca={ca.label} compact={true} />
                          
                          {/* Thông tin thêm cho ca có lịch */}
                          {matched.length > 0 && !hasNghiPhep && slotAppointments.length > 0 && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '4px',
                              padding: '2px 6px',
                              background: token.colorSuccessBg,
                              borderRadius: '6px',
                              border: `1px solid ${token.colorSuccessBorder}`
                            }}>
                              <Text style={{ fontSize: '9px', color: token.colorSuccess }}>
                                {slotAppointments.length} cuộc hẹn
                              </Text>
                              <Progress 
                                percent={Math.min((slotAppointments.length / 5) * 100, 100)} 
                                size="small" 
                                showInfo={false}
                                style={{ width: '30px', margin: 0 }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // Table View Component (giữ nguyên từ code trước)
  const TableColumns = [
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: '8px', color: token.colorPrimary }} />
          <span style={{ fontWeight: 600, color: token.colorTextHeading }}>Ca / Ngày</span>
        </div>
      ),
      dataIndex: "ca",
      key: "ca",
      width: 140,
      render: (ca) => {
        const caInfo = caList.find(c => c.label === ca);
        return (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div 
              style={{
                background: caInfo?.gradient,
                padding: '12px 8px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginBottom: '8px'
              }}
            >
              {ca}
            </div>
            <div style={{ fontSize: "12px", color: token.colorTextSecondary, fontWeight: 500 }}>
              ⏰ {caInfo?.start} - {caInfo?.end}
            </div>
          </div>
        );
      },
    },
    ...weekDays.map((d, idx) => ({
      title: (
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: "14px",
            color: token.colorPrimary 
          }}>
            {dayNames[idx]}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: token.colorTextSecondary,
            background: token.colorFillAlter,
            padding: '4px 8px',
            borderRadius: '6px',
            marginTop: '4px'
          }}>
            {d.format("DD/MM")}
          </div>
        </div>
      ),
      dataIndex: `day_${idx}`,
      key: `day_${idx}`,
      width: 180,
      render: (_, record) => (
        <ScheduleSlot date={d} ca={record.ca} compact={false} />
      ),
    })),
  ];

  const TableDataSource = caList.map(ca => ({
    key: ca.key,
    ca: ca.label,
  }));

  const TableView = () => (
    <Table
      columns={TableColumns}
      dataSource={TableDataSource}
      pagination={false}
      loading={loading}
      bordered={false}
      size="middle"
      style={{ borderRadius: "12px" }}
    />
  );

  const menuItems = [
    {
      key: '1',
      icon: <FileTextOutlined />,
      label: '📝 Xin nghỉ phép',
      onClick: () => setModalXinNghiVisible(true)
    },
    {
      key: '2',
      icon: <HistoryOutlined />,
      label: '📊 Lịch sử yêu cầu',
      onClick: () => setModalLichSuVisible(true)
    },
    {
      key: '3',
      icon: <ReloadOutlined />,
      label: '🔄 Làm mới dữ liệu',
      onClick: fetchSchedule
    }
  ];

  const AppointmentList = ({ appointments }) => (
    <List
      size="small"
      dataSource={appointments}
      renderItem={(appt, index) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar 
                size="large"
                style={{ 
                  background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})` 
                }}
                icon={<UserOutlined />} 
              />
            }
            title={
              <Space>
                <Text strong style={{ fontSize: '14px' }}>{appt.benhNhan?.ho_ten}</Text>
                <Tag 
                  color={appt.trang_thai === 'da_dat' ? 'blue' : 'green'}
                  icon={appt.trang_thai === 'da_dat' ? '⏳' : '✅'}
                >
                  {appt.trang_thai === 'da_dat' ? 'Đã đặt' : 'Đã xác nhận'}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size={0} style={{ fontSize: '12px' }}>
                <Text><PhoneOutlined /> {appt.benhNhan?.so_dien_thoai}</Text>
                <Text><MedicineBoxOutlined /> {appt.ly_do_kham}</Text>
                <Text type="secondary">🕐 {appt.khungGio?.gio_bat_dau} - {appt.khungGio?.gio_ket_thuc}</Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <FileTextOutlined />
          Đơn xin nghỉ phép
        </span>
      ),
      children: (
        <List
          dataSource={nghiPhepData}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={
                  <Space>
                    <Text>📅 Nghỉ phép từ {dayjs(item.ngay_bat_dau).format('DD/MM/YYYY')} đến {dayjs(item.ngay_ket_thuc).format('DD/MM/YYYY')}</Text>
                    <Tag 
                      color={trangThaiNghiPhep[item.trang_thai]?.color}
                      icon={trangThaiNghiPhep[item.trang_thai]?.icon}
                    >
                      {trangThaiNghiPhep[item.trang_thai]?.text}
                    </Tag>
                  </Space>
                }
                description={item.ly_do}
              />
            </List.Item>
          )}
        />
      )
    }
  ];

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: 1400, 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header với background gradient đẹp */}
      <Card 
        style={{ 
          borderRadius: "20px",
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          marginBottom: '24px',
          overflow: 'hidden',
          position: 'relative'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={0}>
                <Title level={2} style={{ 
                  color: 'white', 
                  marginBottom: '4px',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <CalendarOutlined style={{ marginRight: '12px' }} />
                  Lịch Làm Việc
                </Title>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '16px'
                }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  Bác sĩ: <Text strong style={{ color: 'white' }}>{userInfo?.user?.ho_ten || ""}</Text>
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Segmented
                  options={[
                    { label: <span><TableOutlined /> Bảng</span>, value: 'table' },
                    { label: <span><AppstoreOutlined /> Lưới</span>, value: 'grid' }
                  ]}
                  value={viewMode}
                  onChange={setViewMode}
                  size="large"
                />
                <Dropdown 
                  menu={{ items: menuItems }} 
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Button 
                    type="primary" 
                    icon={<MoreOutlined />}
                    size="large"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Thao tác
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>

          {/* Thống kê nhanh với card đẹp */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} sm={8}>
              <Card 
                size="small" 
                style={{ 
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px'
                }}
                styles={{ body: { padding: '16px' } }}
              >
                <Statistic
                  title={<span style={{ color: 'white' }}>📅 Ca làm việc</span>}
                  value={schedule.length}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 700 }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                size="small" 
                style={{ 
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px'
                }}
                styles={{ body: { padding: '16px' } }}
              >
                <Statistic
                  title={<span style={{ color: 'white' }}>📝 Đơn xin nghỉ</span>}
                  value={nghiPhepData.length}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 700 }}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Controls Section */}
      <Card 
        style={{ 
          borderRadius: "16px",
          marginBottom: '24px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong style={{ color: token.colorTextHeading, fontSize: '14px' }}>
                🗓️ Chọn ngày trong tuần:
              </Text>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                size="large"
                suffixIcon={<CalendarOutlined style={{ color: token.colorPrimary }} />}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong style={{ color: token.colorTextHeading, fontSize: '14px' }}>
                📅 Chọn tuần:
              </Text>
              <RangePicker
                value={weekRange}
                onChange={handleWeekChange}
                picker="week"
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                size="large"
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Alert
              message={
                <Space>
                  <RocketOutlined />
                  <span>
                    Tuần: {weekStart.format("DD/MM/YYYY")} → {weekEnd.format("DD/MM/YYYY")}
                  </span>
                </Space>
              }
              type="info"
              showIcon
              style={{ 
                borderRadius: "12px",
                background: token.colorInfoBg,
                border: `1px solid ${token.colorInfoBorder}`
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Schedule - Hiển thị theo view mode */}
      <Card 
        style={{ 
          borderRadius: "16px",
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '18px', color: token.colorTextHeading }}>
            🗓️ Lịch làm việc tuần này ({viewMode === 'table' ? 'Dạng bảng' : 'Dạng lưới'})
          </Text>
          <Space>
            <Progress 
              percent={occupancyRate} 
              size="small" 
              style={{ width: '120px' }}
              format={percent => `📊 ${percent}%`}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSchedule}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {viewMode === 'table' ? <TableView /> : <GridView />}

        {/* Legend */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Space size="large" wrap>
            <Space>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                borderRadius: "4px" 
              }} />
              <Text type="secondary">Có lịch làm việc</Text>
            </Space>
            <Space>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                background: 'linear-gradient(135deg, #faad14, #ffc53d)',
                borderRadius: "4px" 
              }} />
              <Text type="secondary">Nghỉ phép</Text>
            </Space>
            <Space>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                backgroundColor: token.colorFillSecondary,
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }} />
              <Text type="secondary">Trống</Text>
            </Space>
          </Space>
        </div>
      </Card>

      {/* Các Modal giữ nguyên */}
      {/* Modal chi tiết cuộc hẹn */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Cuộc hẹn - {selectedSlot?.dateStr} - {selectedSlot?.ca}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
        styles={{
          body: { padding: '16px' }
        }}
      >
        {selectedSlot && (
          <AppointmentList 
            appointments={getAppointmentsForSlot(selectedSlot.date, selectedSlot.ca)} 
          />
        )}
      </Modal>

      {/* Modal xin nghỉ phép */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Xin nghỉ phép</span>
          </Space>
        }
        open={modalXinNghiVisible}
        onCancel={() => setModalXinNghiVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={formNghiPhep}
          layout="vertical"
          onFinish={handleXinNghiPhep}
        >
          <Form.Item
            name="ngay_bat_dau"
            label="📅 Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="ngay_ket_thuc"
            label="📅 Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="ly_do"
            label="📝 Lý do nghỉ phép"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do nghỉ phép..." />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalXinNghiVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" icon={<FileTextOutlined />}>
              Gửi đơn
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal lịch sử yêu cầu */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Lịch sử yêu cầu</span>
          </Space>
        }
        open={modalLichSuVisible}
        onCancel={() => setModalLichSuVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalLichSuVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Tabs 
          defaultActiveKey="1"
          items={tabItems}
        />
      </Modal>
    </div>
  );
};

export default WorkSchedule;