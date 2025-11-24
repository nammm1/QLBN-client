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
  theme,
  Radio
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
import apiLichLamViec from "../../../api/LichLamViec";
import apiXinNghiPhep from "../../../api/XinNghiPhep";

dayjs.locale("vi");
dayjs.extend(updateLocale);

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

const StaffWorkSchedule = () => {
  const { token } = useToken();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(getMonday(dayjs()));
  const [schedule, setSchedule] = useState([]);
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

  const fetchNghiPhep = async () => {
    try {
      const res = await apiXinNghiPhep.getByNhanVien(userInfo.user.id_nguoi_dung);
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
    const dbCa = ca === "Sáng" ? "Sang" : 
                 ca === "Chiều" ? "Chieu" : 
                 ca === "Tối" ? "Toi" : ca;
    
    setSelectedSlot({ date, ca, dateStr });
    setModalVisible(true);
  };

  const handleXinNghiPhep = async (values) => {
    try {
      // Nếu nghỉ nửa ngày, đảm bảo ngay_ket_thuc = ngay_bat_dau
      let ngayKetThuc = values.ngay_ket_thuc;
      if (values.loai_nghi && values.loai_nghi !== 'ca_ngay') {
        ngayKetThuc = values.ngay_bat_dau;
      }

      await apiXinNghiPhep.create({
        id_nguoi_dung: userInfo.user.id_nguoi_dung,
        ngay_bat_dau: values.ngay_bat_dau.format('YYYY-MM-DD'),
        ngay_ket_thuc: ngayKetThuc.format('YYYY-MM-DD'),
        ly_do: values.ly_do,
        trang_thai: "cho_duyet",
        buoi_nghi: values.loai_nghi && values.loai_nghi !== 'ca_ngay' ? values.loai_nghi : null
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
    const dbCa = displayCa === "Sáng" ? "Sang" : 
                 displayCa === "Chiều" ? "Chieu" : 
                 displayCa === "Tối" ? "Toi" : displayCa;
    
    return schedule.filter(
      (s) => s.ca === dbCa && formatDate(s.ngay_lam_viec) === dStr
    );
  };

  const weekEnd = weekStart.add(6, "day");
  const totalWorkSlots = schedule.length;

  // Component hiển thị một slot lịch làm việc
  const ScheduleSlot = ({ date, ca, compact = false }) => {
    const matched = hasSchedulesFor(date, ca);
    const hasNghiPhep = nghiPhepData.some(np => 
      dayjs(date).isBetween(np.ngay_bat_dau, np.ngay_ket_thuc, null, '[]') &&
      np.trang_thai === 'da_duyet'
    );

    const caInfo = caList.find(c => c.label === ca);
    
    const slotStyle = {
      minHeight: compact ? "80px" : "140px",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${hasNghiPhep ? token.colorWarning : matched.length ? '#16a085' : token.colorBorderSecondary}`,
      borderRadius: "12px",
      cursor: "pointer",
      position: "relative",
      background: hasNghiPhep ? 
        `linear-gradient(135deg, ${token.colorWarningBg}, #fff7e6)` : 
        matched.length ? 
        `linear-gradient(135deg, #d5f4e6, #e8f8f5)` : 
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
              <Text strong style={{ 
                color: '#16a085', 
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
                  <Text strong>📅 Ngày:</Text> {date.format("DD/MM/YYYY")}
                </div>
                <div>
                  <Text strong>💼 Ca làm việc:</Text> <Tag color={caInfo?.color}>{ca}</Tag>
                </div>
              </Space>
            }
            trigger="hover"
          >
            <div style={{ textAlign: 'center' }}>
              <Badge 
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
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <CheckCircleOutlined style={{ 
                    color: "white", 
                    fontSize: "24px" 
                  }} />
                </div>
              </Badge>
              <div>
                <Text strong style={{ 
                  color: '#16a085', 
                  fontSize: "13px",
                  display: 'block'
                }}>
                  {matched[0].gio_bat_dau} - {matched[0].gio_ket_thuc}
                </Text>
              </div>
              <div>
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

  // Grid View Component
  const GridView = () => {
    return (
      <div style={{ padding: '16px 0' }}>
        <Row gutter={[20, 20]}>
          {weekDays.map((date, dayIndex) => {
            const isToday = date.isSame(dayjs(), 'day');
            const isWeekend = dayIndex === 6;

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={dayIndex}>
                <Card
                  title={
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                      <Badge 
                        dot 
                        color={isToday ? '#16a085' : 'transparent'}
                        offset={[-5, 0]}
                      >
                        <Text 
                          strong 
                          style={{ 
                            color: isWeekend ? token.colorError : '#16a085', 
                            fontSize: '14px',
                            background: isToday ? '#d5f4e6' : 'transparent',
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
                    </div>
                  }
                  size="small"
                  style={{
                    borderRadius: '16px',
                    border: `2px solid ${isToday ? '#16a085' : token.colorBorderSecondary}`,
                    boxShadow: isToday 
                      ? '0 4px 16px rgba(22, 160, 133, 0.2)'
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                  bodyStyle={{ 
                    padding: '12px',
                    background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
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
                      const hasNghiPhep = nghiPhepData.some(np => 
                        dayjs(date).isBetween(np.ngay_bat_dau, np.ngay_ket_thuc, null, '[]') &&
                        np.trang_thai === 'da_duyet'
                      );
                      
                      return (
                        <div key={caIndex}>
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
                          
                          <ScheduleSlot date={date} ca={ca.label} compact={true} />
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

  // Table View Component
  const TableView = () => {
    const columns = [
      {
        title: "Thời gian",
        dataIndex: "ca",
        key: "ca",
        width: 150,
        fixed: 'left',
        render: (ca) => {
          const caInfo = caList.find(c => c.label === ca);
          return (
            <Space direction="vertical" size={2}>
              <Tag 
                color={caInfo?.color}
                style={{
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                {ca}
              </Tag>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {caInfo?.start} - {caInfo?.end}
              </Text>
            </Space>
          );
        }
      },
      ...weekDays.map((date, index) => {
        const isToday = date.isSame(dayjs(), 'day');
        const isWeekend = index === 6;
        return {
          title: (
            <div style={{ 
              textAlign: 'center',
              background: isToday ? 'linear-gradient(135deg, #d5f4e6, #e8f8f5)' : 'transparent',
              padding: '8px 4px',
              borderRadius: '8px',
              margin: '-8px -4px'
            }}>
              <Badge dot color={isToday ? '#16a085' : 'transparent'}>
                <div>
                  <Text 
                    strong 
                    style={{ 
                      color: isWeekend ? token.colorError : '#2c3e50',
                      fontSize: '13px',
                      display: 'block'
                    }}
                  >
                    {dayNames[index]}
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: '11px',
                      display: 'block'
                    }}
                  >
                    {date.format("DD/MM")}
                  </Text>
                </div>
              </Badge>
            </div>
          ),
          dataIndex: date.format("YYYY-MM-DD"),
          key: date.format("YYYY-MM-DD"),
          width: 160,
          align: 'center',
          render: (_, record) => (
            <ScheduleSlot date={date} ca={record.ca} />
          )
        };
      })
    ];

    const dataSource = caList.map(ca => ({
      key: ca.key,
      ca: ca.label
    }));

    return (
      <div style={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        background: 'white'
      }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: 1200 }}
          loading={loading}
          bordered
          size="middle"
          style={{
            background: 'white'
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px 32px' }}
      >
        <Row align="middle" gutter={[16, 16]}>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0, color: 'white', fontWeight: 700 }}>
                <ScheduleOutlined /> Lịch làm việc
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                👥 Xem và quản lý lịch làm việc của bạn
              </Text>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Button 
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => setModalXinNghiVisible(true)}
                size="large"
                style={{
                  borderRadius: '10px',
                  height: '44px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontWeight: 600,
                  background: '#16a085',
                  borderColor: '#16a085',
                  boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)'
                }}
              >
                Xin nghỉ phép
              </Button>
              <Button 
                icon={<HistoryOutlined />}
                onClick={() => setModalLichSuVisible(true)}
                size="large"
                style={{
                  borderRadius: '10px',
                  height: '44px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontWeight: 600,
                  background: 'white',
                  borderColor: 'white'
                }}
              >
                Lịch sử
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchSchedule();
                  fetchNghiPhep();
                }}
                size="large"
                loading={loading}
                style={{
                  borderRadius: '10px',
                  height: '44px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white'
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Tổng ca làm tuần này</Text>}
              value={totalWorkSlots}
              valueStyle={{ color: 'white', fontWeight: 700 }}
              prefix={<CalendarOutlined />}
              suffix="ca"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Ca sáng</Text>}
              value={schedule.filter(s => s.ca === "Sang").length}
              valueStyle={{ color: 'white', fontWeight: 700 }}
              prefix="🌅"
              suffix="ca"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Ca chiều</Text>}
              value={schedule.filter(s => s.ca === "Chieu").length}
              valueStyle={{ color: 'white', fontWeight: 700 }}
              prefix="☀️"
              suffix="ca"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Ca tối</Text>}
              value={schedule.filter(s => s.ca === "Toi").length}
              valueStyle={{ color: 'white', fontWeight: 700 }}
              prefix="🌙"
              suffix="ca"
            />
          </Card>
        </Col>
      </Row>

      {/* Week Navigation & View Selector */}
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col>
            <Space size="large">
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setSelectedDate(dayjs())}
                type={selectedDate.isSame(dayjs(), 'week') ? 'primary' : 'default'}
                style={{
                  borderRadius: '8px',
                  height: '40px',
                  fontWeight: 500
                }}
              >
                Tuần hiện tại
              </Button>
              <RangePicker
                value={weekRange}
                onChange={handleWeekChange}
                format="DD/MM/YYYY"
                style={{ 
                  borderRadius: '8px',
                  height: '40px'
                }}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
              <Text strong style={{ fontSize: '15px' }}>
                📅 {weekStart.format("DD/MM/YYYY")} - {weekEnd.format("DD/MM/YYYY")}
              </Text>
            </Space>
          </Col>
          <Col>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                {
                  label: (
                    <Space>
                      <TableOutlined />
                      <span>Bảng</span>
                    </Space>
                  ),
                  value: 'table'
                },
                {
                  label: (
                    <Space>
                      <AppstoreOutlined />
                      <span>Lưới</span>
                    </Space>
                  ),
                  value: 'grid'
                }
              ]}
              style={{
                borderRadius: '8px',
                padding: '4px'
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      {viewMode === 'table' ? <TableView /> : <GridView />}

      {/* Modal Chi tiết Slot */}
      <Modal
        title={
          <Space>
            <ScheduleOutlined style={{ color: '#16a085' }} />
            <span>Chi tiết lịch làm việc</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={500}
      >
        {selectedSlot && (
          <div>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>📅 Ngày làm việc:</Text>
                  <br />
                  <Text style={{ fontSize: '16px' }}>
                    {selectedSlot.date.format("dddd, DD/MM/YYYY")}
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text strong>⏰ Ca làm việc:</Text>
                  <br />
                  <Tag color={caList.find(c => c.label === selectedSlot.ca)?.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {selectedSlot.ca}
                  </Tag>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text strong>🕐 Thời gian:</Text>
                  <br />
                  {hasSchedulesFor(selectedSlot.date, selectedSlot.ca).length > 0 ? (
                    <Text style={{ fontSize: '16px' }}>
                      {hasSchedulesFor(selectedSlot.date, selectedSlot.ca)[0].gio_bat_dau} - 
                      {hasSchedulesFor(selectedSlot.date, selectedSlot.ca)[0].gio_ket_thuc}
                    </Text>
                  ) : (
                    <Text type="secondary">Không có lịch làm việc</Text>
                  )}
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Modal>

      {/* Modal Xin nghỉ phép */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#16a085' }} />
            <span>Đơn xin nghỉ phép</span>
          </Space>
        }
        open={modalXinNghiVisible}
        onCancel={() => {
          setModalXinNghiVisible(false);
          formNghiPhep.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={formNghiPhep}
          layout="vertical"
          onFinish={handleXinNghiPhep}
          initialValues={{ loai_nghi: 'ca_ngay' }}
        >
          <Form.Item
            name="loai_nghi"
            label="Loại nghỉ phép"
            rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ phép' }]}
          >
            <Radio.Group
              onChange={(e) => {
                const loaiNghi = e.target.value;
                const ngayBatDau = formNghiPhep.getFieldValue('ngay_bat_dau');
                if (loaiNghi !== 'ca_ngay' && ngayBatDau) {
                  formNghiPhep.setFieldsValue({ ngay_ket_thuc: ngayBatDau });
                }
              }}
            >
              <Radio value="ca_ngay">Cả ngày</Radio>
              <Radio value="sang">Buổi sáng</Radio>
              <Radio value="chieu">Buổi chiều</Radio>
              <Radio value="toi">Buổi tối</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.loai_nghi !== currentValues.loai_nghi
            }
          >
            {({ getFieldValue }) => {
              const loaiNghi = getFieldValue('loai_nghi');
              const isNuaNgay = loaiNghi && loaiNghi !== 'ca_ngay';
              
              if (isNuaNgay) {
                // Nửa ngày: dùng DatePicker đơn
                return (
                  <>
                    <Form.Item
                      name="ngay_bat_dau"
                      label="📅 Ngày nghỉ"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày nghỉ' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY"
                        onChange={(date) => {
                          if (date) {
                            formNghiPhep.setFieldsValue({ ngay_ket_thuc: date });
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="ngay_ket_thuc" hidden>
                      <Input />
                    </Form.Item>
                  </>
                );
              } else {
                // Cả ngày: dùng RangePicker
                return (
                  <>
                    <Form.Item
                      label="Thời gian nghỉ"
                      name="dates"
                      rules={[{ required: true, message: 'Vui lòng chọn thời gian nghỉ!' }]}
                    >
                      <RangePicker 
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        onChange={(dates) => {
                          if (dates) {
                            formNghiPhep.setFieldsValue({
                              ngay_bat_dau: dates[0],
                              ngay_ket_thuc: dates[1]
                            });
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="ngay_bat_dau" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="ngay_ket_thuc" hidden>
                      <Input />
                    </Form.Item>
                  </>
                );
              }
            }}
          </Form.Item>
          <Form.Item
            label="Lý do"
            name="ly_do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập lý do xin nghỉ phép..."
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalXinNghiVisible(false);
                formNghiPhep.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" style={{ background: '#16a085', borderColor: '#16a085' }}>
                Gửi đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Lịch sử nghỉ phép */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#16a085' }} />
            <span>Lịch sử nghỉ phép</span>
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
        <List
          dataSource={nghiPhepData}
          renderItem={(item) => (
            <List.Item>
              <Card style={{ width: '100%' }} size="small">
                <Row align="middle" gutter={16}>
                  <Col flex="auto">
                    <Space direction="vertical" size={4}>
                      <Text strong>
                        {dayjs(item.ngay_bat_dau).format("DD/MM/YYYY")} - {dayjs(item.ngay_ket_thuc).format("DD/MM/YYYY")}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{item.ly_do}</Text>
                    </Space>
                  </Col>
                  <Col>
                    <Tag 
                      color={trangThaiNghiPhep[item.trang_thai]?.color}
                      style={{ fontSize: '12px', padding: '4px 12px' }}
                    >
                      {trangThaiNghiPhep[item.trang_thai]?.icon} {trangThaiNghiPhep[item.trang_thai]?.text}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: "Chưa có đơn xin nghỉ phép nào" }}
        />
      </Modal>
    </div>
  );
};

export default StaffWorkSchedule;

