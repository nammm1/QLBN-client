import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Tag,
  DatePicker,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Row,
  Col,
  Popconfirm,
  Tooltip,
  Checkbox,
  Divider,
  theme,
  Tabs,
  Badge,
  Alert,
  Dropdown
} from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  TeamOutlined,
  ReloadOutlined,
  CheckSquareOutlined,
  TableOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  UserOutlined,
  MoreOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import apiNhanVienPhanCong from "../../../api/NhanVienPhanCong";
import apiBacSi from "../../../api/BacSi";
import apiLichLamViec from "../../../api/LichLamViec";
import apiPhongKham from "../../../api/PhongKham";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiNguoiDung from "../../../api/NguoiDung";

dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { useToken } = theme;

const caList = [
  { value: "Sang", label: "Sáng", color: "gold" },
  { value: "Chieu", label: "Chiều", color: "orange" },
  { value: "Toi", label: "Tối", color: "blue" }
];

// Component Calendar View - Improved UI
const CalendarView = ({ schedules, loading, dateRange, onDateRangeChange, filters, onScheduleClick, onAssignRoom, onDelete, onSelectForSwap, selectedSwapSchedules = [], isBacSi = true }) => {
  const { token } = useToken();
  const [weekStart, setWeekStart] = useState(() => {
    const start = dateRange?.[0] || dayjs().startOf('week');
    return dayjs(start).startOf('week');
  });
  const [viewMoreModalVisible, setViewMoreModalVisible] = useState(false);
  const [viewMoreSchedules, setViewMoreSchedules] = useState([]);
  const [viewMoreDate, setViewMoreDate] = useState(null);
  const [viewMoreCa, setViewMoreCa] = useState(null);
  
  const MAX_DISPLAY = 2; // Giới hạn hiển thị tối đa 2 nhân viên trong mỗi cell

  // Đồng bộ weekStart khi dateRange thay đổi từ bên ngoài
  useEffect(() => {
    if (dateRange?.[0]) {
      const newWeekStart = dayjs(dateRange[0]).startOf('week');
      setWeekStart(newWeekStart);
    }
  }, [dateRange?.[0]?.format('YYYY-MM-DD')]);

  // Tính toán các ngày trong tuần
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

  // Nhóm lịch theo ngày và ca
  const groupedSchedules = React.useMemo(() => {
    const grouped = {};
    schedules.forEach(schedule => {
      const date = dayjs(schedule.ngay_lam_viec).format('YYYY-MM-DD');
      const key = `${date}_${schedule.ca}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });
    return grouped;
  }, [schedules]);

  const getScheduleForSlot = (date, ca) => {
    const dateStr = date.format('YYYY-MM-DD');
    const key = `${dateStr}_${ca.value}`;
    return groupedSchedules[key] || [];
  };

  const handlePrevWeek = () => {
    const newWeekStart = weekStart.subtract(7, 'day');
    setWeekStart(newWeekStart);
    onDateRangeChange([newWeekStart, newWeekStart.add(6, 'day')]);
  };

  const handleNextWeek = () => {
    const newWeekStart = weekStart.add(7, 'day');
    setWeekStart(newWeekStart);
    onDateRangeChange([newWeekStart, newWeekStart.add(6, 'day')]);
  };

  const handleToday = () => {
    const today = dayjs().startOf('week');
    setWeekStart(today);
    onDateRangeChange([today, today.add(6, 'day')]);
  };

  const handleCardClick = (schedule, e) => {
    // Nếu click vào phần "Chưa phân phòng" và là bác sĩ, mở modal phân phòng
    if (isBacSi && !schedule.id_phong_kham && schedule.ten_phong === 'Chưa phân phòng' && onAssignRoom) {
      e.stopPropagation();
      onAssignRoom(schedule);
    } else {
      onScheduleClick(schedule);
    }
  };

  const handleViewMore = (schedules, date, ca) => {
    setViewMoreSchedules(schedules);
    setViewMoreDate(date);
    setViewMoreCa(ca);
    setViewMoreModalVisible(true);
  };

  return (
    <Card 
      loading={loading}
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ marginBottom: '20px', padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              onClick={handlePrevWeek}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderColor: 'transparent',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              ← Tuần trước
            </Button>
            <Button 
              onClick={handleToday}
              style={{ 
                background: 'rgba(255,255,255,0.3)', 
                borderColor: 'transparent',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Hôm nay
            </Button>
            <Button 
              onClick={handleNextWeek}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderColor: 'transparent',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Tuần sau →
            </Button>
          </Space>
          <Text strong style={{ color: 'white', fontSize: '16px' }}>
            Tuần {weekStart.format('DD/MM')} - {weekStart.add(6, 'day').format('DD/MM/YYYY')}
          </Text>
        </Space>
      </div>

      <Table
        columns={[
          {
            title: 'Ca',
            dataIndex: 'ca',
            key: 'ca',
            width: 120,
            render: (_, record) => {
              const ca = caList.find(c => c.value === record.value);
              const colorMap = {
                'Sang': { bg: '#fff7e6', border: '#ffd591', text: '#ad6800' },
                'Chieu': { bg: '#fff4e6', border: '#ffcc80', text: '#d46b08' },
                'Toi': { bg: '#e6f7ff', border: '#91d5ff', text: '#0050b3' }
              };
              const colors = colorMap[record.value] || { bg: '#f0f0f0', border: '#d9d9d9', text: '#595959' };
              return (
                <div style={{
                  padding: '8px 12px',
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: colors.text,
                  fontSize: '13px'
                }}>
                  {ca?.label || record.value}
                </div>
              );
            }
          },
          ...weekDays.map((date, idx) => ({
            title: (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                  {dayNames[idx]}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: token.colorTextSecondary,
                  background: date.isSame(dayjs(), 'day') ? token.colorPrimaryBg : 'transparent',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {date.format('DD/MM')}
                </div>
              </div>
            ),
            key: `day_${idx}`,
            width: 180,
            render: (_, record) => {
              const slotSchedules = getScheduleForSlot(date, record);
              const isToday = date.isSame(dayjs(), 'day');
              return (
                <div style={{ 
                  minHeight: '90px',
                  padding: '4px',
                  background: isToday ? token.colorPrimaryBgHover : 'transparent',
                  borderRadius: '4px'
                }}>
                  {slotSchedules.length > 0 ? (
                    <>
                      {slotSchedules.slice(0, MAX_DISPLAY).map((schedule, idx) => {
                        const needsRoom = isBacSi && !schedule.id_phong_kham;
                        const isSelected = selectedSwapSchedules.some(s => s.id_lich_lam_viec === schedule.id_lich_lam_viec);
                        const canSelect = selectedSwapSchedules.length < 2;
                        const menuItems = [
                          {
                            key: 'edit',
                            label: (
                              <Space>
                                <EditOutlined />
                                <span>Chỉnh sửa</span>
                              </Space>
                            ),
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              onScheduleClick(schedule);
                            }
                          },
                          {
                            key: 'swap',
                            label: (
                              <Space>
                                <SwapOutlined />
                                <span>{isSelected ? 'Bỏ chọn' : 'Chọn để đổi ca'}</span>
                              </Space>
                            ),
                            disabled: !canSelect && !isSelected,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              if (onSelectForSwap) {
                                onSelectForSwap(schedule);
                              }
                            }
                          },
                          {
                            type: 'divider'
                          },
                          {
                            key: 'delete',
                            label: (
                              <Space style={{ color: '#ff4d4f' }}>
                                <DeleteOutlined />
                                <span>Xóa</span>
                              </Space>
                            ),
                            danger: true,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              if (onDelete) {
                                onDelete(schedule.id_lich_lam_viec);
                              }
                            }
                          }
                        ];
                        return (
                          <Card
                            key={idx}
                            size="small"
                            hoverable
                            onClick={(e) => handleCardClick(schedule, e)}
                            style={{
                              marginBottom: '6px',
                              background: isSelected
                                ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                                : needsRoom 
                                ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                                : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                              border: isSelected
                                ? `3px solid ${token.colorPrimary}`
                                : needsRoom 
                                ? `2px solid #ff9a56` 
                                : `2px solid ${token.colorPrimaryBorder}`,
                              cursor: 'pointer',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                              position: 'relative'
                            }}
                            bodyStyle={{ padding: '10px' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                          >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Text strong style={{ fontSize: '12px', display: 'block', color: '#1f1f1f', flex: 1 }}>
                                  <UserOutlined style={{ marginRight: '4px' }} />
                                  {schedule.ho_ten}
                                </Text>
                                <Dropdown
                                  menu={{ items: menuItems }}
                                  trigger={['click']}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<MoreOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ padding: '0 4px', minWidth: 'auto' }}
                                  />
                                </Dropdown>
                              </Space>
                              <Text 
                                style={{ 
                                  fontSize: '11px', 
                                  display: 'block',
                                  color: needsRoom ? '#d4380d' : '#595959',
                                  fontWeight: needsRoom ? 'bold' : 'normal',
                                  cursor: needsRoom ? 'pointer' : 'default'
                                }}
                                onClick={(e) => {
                                  if (needsRoom && onAssignRoom) {
                                    e.stopPropagation();
                                    onAssignRoom(schedule);
                                  }
                                }}
                              >
                                {needsRoom ? (
                                  <>
                                    <HomeOutlined style={{ marginRight: '4px' }} />
                                    Chưa phân phòng (Click để phân phòng)
                                  </>
                                ) : (
                                  <>
                                    <HomeOutlined style={{ marginRight: '4px' }} />
                                    {schedule.ten_phong || 'Chưa có phòng'}
                                  </>
                                )}
                              </Text>
                              {schedule.ten_chuyen_khoa && (
                                <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
                                  {schedule.ten_chuyen_khoa}
                                </Tag>
                              )}
                              {isSelected && (
                                <Tag color={token.colorPrimary} style={{ fontSize: '10px', margin: 0 }}>
                                  <SwapOutlined style={{ marginRight: '4px' }} />
                                  Đã chọn để đổi ca
                                </Tag>
                              )}
                            </Space>
                          </Card>
                        );
                      })}
                      {slotSchedules.length > MAX_DISPLAY && (
                        <Button
                          type="primary"
                          size="small"
                          block
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMore(slotSchedules, date, record);
                          }}
                          style={{
                            marginTop: '4px',
                            height: '32px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        >
                          <TeamOutlined style={{ marginRight: '4px' }} />
                          Xem thêm ({slotSchedules.length - MAX_DISPLAY})
                        </Button>
                      )}
                    </>
                  ) : (
                    <div style={{ 
                      height: '70px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: token.colorTextTertiary,
                      fontSize: '12px',
                      background: '#fafafa',
                      borderRadius: '6px',
                      border: '1px dashed #d9d9d9'
                    }}>
                      Trống
                    </div>
                  )}
                </div>
              );
            }
          }))
        ]}
        dataSource={caList.map(ca => ({ ca: ca.label, value: ca.value, key: ca.value }))}
        pagination={false}
        bordered={false}
        style={{
          background: 'white',
          borderRadius: '8px'
        }}
      />

      {/* Modal hiển thị danh sách đầy đủ nhân viên */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Danh sách nhân viên - {viewMoreDate?.format('DD/MM/YYYY')} - {viewMoreCa ? caList.find(c => c.value === viewMoreCa.value)?.label : ''}</span>
          </Space>
        }
        open={viewMoreModalVisible}
        onCancel={() => setViewMoreModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewMoreModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {viewMoreSchedules.length > 0 ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {viewMoreSchedules.map((schedule, idx) => {
                const needsRoom = isBacSi && !schedule.id_phong_kham;
                const isSelected = selectedSwapSchedules.some(s => s.id_lich_lam_viec === schedule.id_lich_lam_viec);
                const canSelect = selectedSwapSchedules.length < 2;
                const menuItems = [
                  {
                    key: 'edit',
                    label: (
                      <Space>
                        <EditOutlined />
                        <span>Chỉnh sửa</span>
                      </Space>
                    ),
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      setViewMoreModalVisible(false);
                      onScheduleClick(schedule);
                    }
                  },
                  {
                    key: 'swap',
                    label: (
                      <Space>
                        <SwapOutlined />
                        <span>{isSelected ? 'Bỏ chọn' : 'Chọn để đổi ca'}</span>
                      </Space>
                    ),
                    disabled: !canSelect && !isSelected,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      if (onSelectForSwap) {
                        onSelectForSwap(schedule);
                      }
                    }
                  },
                  {
                    type: 'divider'
                  },
                  {
                    key: 'delete',
                    label: (
                      <Space style={{ color: '#ff4d4f' }}>
                        <DeleteOutlined />
                        <span>Xóa</span>
                      </Space>
                    ),
                    danger: true,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      if (onDelete) {
                        onDelete(schedule.id_lich_lam_viec);
                      }
                    }
                  }
                ];
                return (
                  <Card
                    key={idx}
                    hoverable
                    onClick={(e) => {
                      setViewMoreModalVisible(false);
                      handleCardClick(schedule, e);
                    }}
                    style={{
                      marginBottom: '8px',
                      background: isSelected
                        ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                        : needsRoom 
                        ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                        : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      border: isSelected
                        ? `3px solid ${token.colorPrimary}`
                        : needsRoom 
                        ? `2px solid #ff9a56` 
                        : `2px solid ${token.colorPrimaryBorder}`,
                      cursor: 'pointer',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <UserOutlined style={{ fontSize: '16px', color: token.colorPrimary }} />
                          <Text strong style={{ fontSize: '14px' }}>
                            {schedule.ho_ten}
                          </Text>
                        </Space>
                        <Dropdown
                          menu={{ items: menuItems }}
                          trigger={['click']}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ padding: '0 4px', minWidth: 'auto' }}
                          />
                        </Dropdown>
                      </Space>
                      <Text 
                        style={{ 
                          fontSize: '12px',
                          color: needsRoom ? '#d4380d' : '#595959',
                          fontWeight: needsRoom ? 'bold' : 'normal',
                          cursor: needsRoom ? 'pointer' : 'default'
                        }}
                        onClick={(e) => {
                          if (needsRoom && onAssignRoom) {
                            e.stopPropagation();
                            setViewMoreModalVisible(false);
                            onAssignRoom(schedule);
                          }
                        }}
                      >
                        <HomeOutlined style={{ marginRight: '6px' }} />
                        {needsRoom 
                          ? 'Chưa phân phòng (Click để phân phòng)'
                          : schedule.ten_phong || 'Chưa có phòng'}
                      </Text>
                      {schedule.ten_chuyen_khoa && (
                        <Tag color="blue" style={{ fontSize: '11px' }}>
                          {schedule.ten_chuyen_khoa}
                        </Tag>
                      )}
                      {schedule.ten_chuyen_nganh && (
                        <Tag color="green" style={{ fontSize: '11px' }}>
                          {schedule.ten_chuyen_nganh}
                        </Tag>
                      )}
                      {schedule.vai_tro && (
                        <Tag color="purple" style={{ fontSize: '11px' }}>
                          {schedule.vai_tro}
                        </Tag>
                      )}
                      {isSelected && (
                        <Tag color={token.colorPrimary} style={{ fontSize: '11px' }}>
                          <SwapOutlined style={{ marginRight: '4px' }} />
                          Đã chọn để đổi ca
                        </Tag>
                      )}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: token.colorTextTertiary }}>
              Không có dữ liệu
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

const ManageSchedule = () => {
  const { token } = useToken();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [bacSiList, setBacSiList] = useState([]);
  const [allBacSiList, setAllBacSiList] = useState([]); // Tất cả bác sĩ (không filter) để lookup chuyên khoa
  const [chuyenGiaDinhDuongList, setChuyenGiaDinhDuongList] = useState([]); // Chuyên gia dinh dưỡng
  const [nhanVienKhacList, setNhanVienKhacList] = useState([]); // Nhân viên khác (không phải bác sĩ, không phải chuyên gia dinh dưỡng)
  const [phongKhamList, setPhongKhamList] = useState([]);
  const [allPhongKhamList, setAllPhongKhamList] = useState([]); // Tất cả phòng khám
  const [chuyenKhoaList, setChuyenKhoaList] = useState([]);
  const [chuyenNganhDinhDuongList, setChuyenNganhDinhDuongList] = useState([]); // Chuyên ngành dinh dưỡng
  const [selectedChuyenKhoa, setSelectedChuyenKhoa] = useState(null);
  const [selectedChuyenNganh, setSelectedChuyenNganh] = useState(null); // Chuyên ngành dinh dưỡng được chọn
  const [availableBacSi, setAvailableBacSi] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSwapVisible, setModalSwapVisible] = useState(false);
  const [modalHangLoatVisible, setModalHangLoatVisible] = useState(false);
  const [modalAvailableBacSiVisible, setModalAvailableBacSiVisible] = useState(false);
  const [modalSelectDateCaVisible, setModalSelectDateCaVisible] = useState(false);
  const [modalAssignRoomVisible, setModalAssignRoomVisible] = useState(false); // Modal phân phòng
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSwapSchedules, setSelectedSwapSchedules] = useState([]);
  const [scheduleToAssignRoom, setScheduleToAssignRoom] = useState(null); // Lịch cần phân phòng
  const [form] = Form.useForm();
  const [formHangLoat] = Form.useForm();
  const [formSelectDateCa] = Form.useForm();
  const [formAssignRoom] = Form.useForm(); // Form phân phòng
  const [dateRange, setDateRange] = useState([dayjs().startOf('week'), dayjs().endOf('week')]);
  const [viewMode, setViewMode] = useState('table'); // 'table' hoặc 'calendar'
  const [activeTab, setActiveTab] = useState('bac-si'); // 'bac-si', 'chuyen-gia-dinh-duong', hoặc 'nhan-vien-khac'
  // Filters
  const [filters, setFilters] = useState({
    id_chuyen_khoa: null,
    id_bac_si: null,
    id_phong_kham: null,
    id_chuyen_nganh: null, // Filter chuyên ngành dinh dưỡng
    vai_tro: null, // Filter vai trò cho nhân viên khác
    ca: null
  });
  const [selectedBacSiInForm, setSelectedBacSiInForm] = useState(null); // Track bác sĩ đã chọn trong form để filter phòng khám
  const [listsInitialized, setListsInitialized] = useState(false); // Đánh dấu các list đã được load lần đầu

  // Load danh sách nhân viên khi activeTab thay đổi
  useEffect(() => {
    setListsInitialized(false); // Reset flag khi tab thay đổi
    if (activeTab === 'bac-si') {
      Promise.all([
        fetchBacSiList(),
        fetchPhongKhamList(),
        fetchChuyenKhoaList()
      ]).then(() => {
        setListsInitialized(true);
      });
    } else if (activeTab === 'chuyen-gia-dinh-duong') {
      Promise.all([
        fetchChuyenGiaDinhDuongList(),
        fetchChuyenNganhDinhDuongList()
      ]).then(() => {
        setListsInitialized(true);
      });
    } else {
      fetchNhanVienKhacList().then(() => {
        setListsInitialized(true);
      });
    }
  }, [activeTab]);

  // Load schedules khi dateRange/filters thay đổi (chỉ khi các list đã được load)
  useEffect(() => {
    if (listsInitialized) {
      fetchSchedules();
    }
  }, [dateRange, filters]);

  // Load schedules khi các list được update (sau khi load xong)
  useEffect(() => {
    if (listsInitialized) {
      // Chờ một chút để đảm bảo state đã được update
      const timer = setTimeout(() => {
        fetchSchedules();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [listsInitialized, bacSiList, chuyenGiaDinhDuongList, nhanVienKhacList]);

  useEffect(() => {
    // Reload danh sách bác sĩ khi chuyên khoa thay đổi
    if (activeTab === 'bac-si' && listsInitialized) {
      fetchBacSiList().then(() => {
        // Sau khi reload xong, gọi lại fetchSchedules
        fetchSchedules();
      });
    }
  }, [selectedChuyenKhoa, activeTab]);

  useEffect(() => {
    // Reload danh sách chuyên gia dinh dưỡng khi chuyên ngành thay đổi
    if (activeTab === 'chuyen-gia-dinh-duong' && listsInitialized) {
      fetchChuyenGiaDinhDuongList().then(() => {
        // Sau khi reload xong, gọi lại fetchSchedules
        fetchSchedules();
      });
    }
  }, [selectedChuyenNganh, activeTab]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await apiNhanVienPhanCong.getAllLichLamViec();
      let data = res?.data || [];
      
      // Filter theo date range nếu có
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        data = data.filter(item => {
          const itemDate = dayjs(item.ngay_lam_viec).format('YYYY-MM-DD');
          return itemDate >= start && itemDate <= end;
        });
      }

      // Filter theo tab đang active
      if (activeTab === 'bac-si') {
        // Chỉ lấy lịch của bác sĩ (id bắt đầu bằng BS_)
        data = data.filter(item => {
          const bacSi = bacSiList.find(bs => bs.id_bac_si === item.id_nguoi_dung);
          return !!bacSi;
        });
      } else if (activeTab === 'chuyen-gia-dinh-duong') {
        // Chỉ lấy lịch của chuyên gia dinh dưỡng
        data = data.filter(item => {
          const chuyenGia = chuyenGiaDinhDuongList.find(cg => cg.id_chuyen_gia === item.id_nguoi_dung);
          return !!chuyenGia;
        });
      } else {
        // Chỉ lấy lịch của nhân viên khác (không phải bác sĩ, không phải chuyên gia dinh dưỡng)
        data = data.filter(item => {
          const bacSi = bacSiList.find(bs => bs.id_bac_si === item.id_nguoi_dung);
          const chuyenGia = chuyenGiaDinhDuongList.find(cg => cg.id_chuyen_gia === item.id_nguoi_dung);
          return !bacSi && !chuyenGia;
        });
      }

      // Apply filters
      if (activeTab === 'bac-si') {
        if (filters.id_chuyen_khoa !== null && filters.id_chuyen_khoa !== undefined) {
          data = data.filter(item => {
            const bacSi = bacSiList.find(bs => bs.id_bac_si === item.id_nguoi_dung);
            return bacSi?.id_chuyen_khoa === filters.id_chuyen_khoa;
          });
        }
        if (filters.id_bac_si !== null && filters.id_bac_si !== undefined) {
          data = data.filter(item => item.id_nguoi_dung === filters.id_bac_si);
        }
        if (filters.id_phong_kham !== null && filters.id_phong_kham !== undefined) {
          data = data.filter(item => item.id_phong_kham === filters.id_phong_kham);
        }
      } else if (activeTab === 'chuyen-gia-dinh-duong') {
        if (filters.id_chuyen_nganh !== null && filters.id_chuyen_nganh !== undefined) {
          data = data.filter(item => {
            const chuyenGia = chuyenGiaDinhDuongList.find(cg => cg.id_chuyen_gia === item.id_nguoi_dung);
            return chuyenGia?.id_chuyen_nganh === filters.id_chuyen_nganh;
          });
        }
      } else {
        if (filters.vai_tro !== null && filters.vai_tro !== undefined) {
          data = data.filter(item => {
            const nhanVien = nhanVienKhacList.find(nv => nv.id_nguoi_dung === item.id_nguoi_dung);
            return nhanVien?.vai_tro === filters.vai_tro;
          });
        }
      }
      if (filters.ca !== null && filters.ca !== undefined) {
        data = data.filter(item => item.ca === filters.ca);
      }

      // Fetch thông tin người dùng cho mỗi lịch
      const schedulesWithInfo = await Promise.all(
        data.map(async (schedule) => {
          try {
            if (activeTab === 'bac-si') {
              let bacSi = bacSiList.find(bs => bs.id_bac_si === schedule.id_nguoi_dung);
              
              // Nếu không tìm thấy trong bacSiList (do filter), tìm trong allBacSiList
              if (!bacSi) {
                bacSi = allBacSiList.find(bs => bs.id_bac_si === schedule.id_nguoi_dung);
              }
              
              const phongKham = allPhongKhamList.find(pk => pk.id_phong_kham === schedule.id_phong_kham);
              return {
                ...schedule,
                ho_ten: bacSi?.ho_ten || 'N/A',
                ten_chuyen_khoa: bacSi?.ten_chuyen_khoa || null,
                ten_phong: phongKham?.ten_phong || null,
                bacSiInfo: bacSi || null
              };
            } else if (activeTab === 'chuyen-gia-dinh-duong') {
              const chuyenGia = chuyenGiaDinhDuongList.find(cg => cg.id_chuyen_gia === schedule.id_nguoi_dung);
              return {
                ...schedule,
                ho_ten: chuyenGia?.ho_ten || 'N/A',
                ten_chuyen_nganh: chuyenGia?.ten_chuyen_nganh || null,
                ten_phong: null, // Chuyên gia dinh dưỡng không có phòng
                chuyenGiaInfo: chuyenGia || null
              };
            } else {
              // Tìm nhân viên trong danh sách
              const nhanVien = nhanVienKhacList.find(nv => nv.id_nguoi_dung === schedule.id_nguoi_dung);
              return {
                ...schedule,
                ho_ten: nhanVien?.ho_ten || 'N/A',
                vai_tro: nhanVien?.vai_tro || null,
                ten_phong: null, // Nhân viên khác không có phòng
                nhanVienInfo: nhanVien || null
              };
            }
          } catch (error) {
            return schedule;
          }
        })
      );

      setSchedules(schedulesWithInfo);
    } catch (error) {
      console.error("Lỗi khi lấy lịch làm việc:", error);
      message.error("Không thể tải danh sách lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const fetchChuyenGiaDinhDuongList = async () => {
    try {
      const params = {};
      if (selectedChuyenNganh) {
        params.id_chuyen_nganh = selectedChuyenNganh;
      }
      const res = await apiNhanVienPhanCong.getAvailableChuyenGiaDinhDuong(params);
      // API trả về { data: { available: [], da_phan_cong: [], nghi_phep: [], all: [] } }
      const allList = res?.data?.all || res?.data || [];
      setChuyenGiaDinhDuongList(allList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên gia dinh dưỡng:", error);
    }
  };

  const fetchChuyenNganhDinhDuongList = async () => {
    try {
      const res = await apiNhanVienPhanCong.getAllChuyenNganhDinhDuong();
      setChuyenNganhDinhDuongList(res?.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên ngành dinh dưỡng:", error);
    }
  };

  const fetchNhanVienKhacList = async () => {
    try {
      // Lấy danh sách nhân viên khác (không phải bác sĩ, không phải chuyên gia dinh dưỡng)
      const params = {};
      if (filters.vai_tro) {
        params.vai_tro = filters.vai_tro;
      }
      const res = await apiNhanVienPhanCong.getAvailableNhanVienKhac(params);
      // API trả về { data: { available: [], da_phan_cong: [], nghi_phep: [], all: [] } }
      const allList = res?.data?.all || res?.data || [];
      setNhanVienKhacList(allList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên khác:", error);
    }
  };

  const fetchBacSiList = async () => {
    try {
      const params = {};
      if (selectedChuyenKhoa) {
        params.id_chuyen_khoa = selectedChuyenKhoa;
      }
      const res = await apiBacSi.getAll(params);
      setBacSiList(res || []);
      
      // Lưu tất cả bác sĩ (không filter) để lookup chuyên khoa
      if (!selectedChuyenKhoa) {
        setAllBacSiList(res || []);
      } else {
        // Fetch lại tất cả bác sĩ để lưu vào allBacSiList
        try {
          const allRes = await apiBacSi.getAll({});
          setAllBacSiList(allRes || []);
        } catch (error) {
          console.error("Lỗi khi lấy tất cả bác sĩ:", error);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", error);
    }
  };

  const fetchPhongKhamList = async (id_chuyen_khoa = null) => {
    try {
      const params = {};
      if (id_chuyen_khoa) {
        params.id_chuyen_khoa = id_chuyen_khoa;
      }
      const res = await apiPhongKham.getAll(params);
      setPhongKhamList(res?.data || []);
      // Lưu tất cả phòng khám để filter sau
      if (!id_chuyen_khoa) {
        setAllPhongKhamList(res?.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng khám:", error);
    }
  };

  const fetchAvailableBacSi = async (params = {}) => {
    try {
      // Chuyển đổi tên param từ 'ngay' sang 'ngay_lam_viec' cho API
      const apiParams = {
        ngay_lam_viec: params.ngay || params.ngay_lam_viec,
        ca: params.ca || null,
        id_chuyen_khoa: params.id_chuyen_khoa || null
      };
      const res = await apiNhanVienPhanCong.getAvailableBacSi(apiParams);
      // API trả về { data: { available: [], da_phan_cong: [], nghi_phep: [], all: [] } }
      const availableList = res?.data?.available || res?.data || [];
      setAvailableBacSi(availableList);
      return availableList;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bác sĩ available:", error);
      message.error(error?.response?.data?.message || "Không thể tải danh sách bác sĩ available");
      return [];
    }
  };

  const fetchChuyenKhoaList = async () => {
    try {
      const data = await apiChuyenKhoa.getAllChuyenKhoa();
      setChuyenKhoaList(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setSelectedChuyenKhoa(null);
    setSelectedBacSiInForm(null);
    form.resetFields();
    fetchPhongKhamList(); // Reset về tất cả phòng khám
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedSchedule(record);
    
    // Xử lý theo loại nhân viên
    if (activeTab === 'bac-si') {
      setSelectedBacSiInForm(record.id_nguoi_dung);
      // Lấy chuyên khoa của bác sĩ để filter phòng khám (tìm trong allBacSiList trước)
      let bacSi = allBacSiList.find(bs => bs.id_bac_si === record.id_nguoi_dung);
      if (!bacSi) {
        bacSi = bacSiList.find(bs => bs.id_bac_si === record.id_nguoi_dung);
      }
      // Nếu không tìm thấy, thử dùng ten_chuyen_khoa từ record
      const idChuyenKhoa = bacSi?.id_chuyen_khoa || (record.ten_chuyen_khoa && record.id_chuyen_khoa) ? record.id_chuyen_khoa : null;
      
      if (idChuyenKhoa) {
        setSelectedChuyenKhoa(idChuyenKhoa);
        fetchPhongKhamList(idChuyenKhoa);
      } else {
        fetchPhongKhamList();
      }
      form.setFieldsValue({
        id_nguoi_dung: record.id_nguoi_dung,
        ngay_lam_viec: dayjs(record.ngay_lam_viec),
        ca: record.ca,
        id_phong_kham: record.id_phong_kham || undefined,
        id_chuyen_khoa_filter: idChuyenKhoa || undefined
      });
    } else if (activeTab === 'chuyen-gia-dinh-duong') {
      const chuyenGia = chuyenGiaDinhDuongList.find(cg => cg.id_chuyen_gia === record.id_nguoi_dung);
      form.setFieldsValue({
        id_nguoi_dung: record.id_nguoi_dung,
        ngay_lam_viec: dayjs(record.ngay_lam_viec),
        ca: record.ca,
        id_chuyen_nganh_filter: chuyenGia?.id_chuyen_nganh || undefined
      });
    } else {
      form.setFieldsValue({
        id_nguoi_dung: record.id_nguoi_dung,
        ngay_lam_viec: dayjs(record.ngay_lam_viec),
        ca: record.ca
      });
    }
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiNhanVienPhanCong.deleteLichLamViec(id);
      message.success("Xóa lịch làm việc thành công");
      // Xóa khỏi danh sách swap nếu có
      setSelectedSwapSchedules(prev => prev.filter(s => s.id_lich_lam_viec !== id));
      fetchSchedules();
    } catch (error) {
      console.error("Lỗi khi xóa lịch làm việc:", error);
      message.error("Không thể xóa lịch làm việc");
    }
  };

  const handleSelectForSwapInCalendar = (schedule) => {
    const isSelected = selectedSwapSchedules.some(s => s.id_lich_lam_viec === schedule.id_lich_lam_viec);
    if (isSelected) {
      // Bỏ chọn
      setSelectedSwapSchedules(prev => prev.filter(s => s.id_lich_lam_viec !== schedule.id_lich_lam_viec));
    } else {
      // Chọn (chỉ cho phép tối đa 2)
      if (selectedSwapSchedules.length < 2) {
        setSelectedSwapSchedules(prev => [...prev, schedule]);
      } else {
        message.warning("Chỉ có thể chọn tối đa 2 lịch để đổi ca");
      }
    }
  };

  const handleDeleteWithConfirm = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lịch làm việc này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDelete(id)
    });
  };

  const handleAssignRoom = (schedule) => {
    // Chỉ cho phép phân phòng cho bác sĩ
    if (activeTab !== 'bac-si') {
      message.warning("Chỉ bác sĩ mới có thể được phân phòng khám");
      return;
    }
    setScheduleToAssignRoom(schedule);
    // Lấy chuyên khoa của bác sĩ để filter phòng khám
    const bacSi = bacSiList.find(bs => bs.id_bac_si === schedule.id_nguoi_dung);
    if (bacSi?.id_chuyen_khoa) {
      fetchPhongKhamList(bacSi.id_chuyen_khoa);
    } else {
      fetchPhongKhamList();
    }
    formAssignRoom.setFieldsValue({
      id_phong_kham: schedule.id_phong_kham || undefined
    });
    setModalAssignRoomVisible(true);
  };

  const handleAssignRoomSubmit = async (values) => {
    try {
      if (!scheduleToAssignRoom) return;
      
      await apiNhanVienPhanCong.updateLichLamViec(scheduleToAssignRoom.id_lich_lam_viec, {
        id_nguoi_dung: scheduleToAssignRoom.id_nguoi_dung,
        ngay_lam_viec: scheduleToAssignRoom.ngay_lam_viec,
        ca: scheduleToAssignRoom.ca,
        id_phong_kham: values.id_phong_kham || null
      });
      
      message.success("Phân phòng thành công");
      setModalAssignRoomVisible(false);
      setScheduleToAssignRoom(null);
      formAssignRoom.resetFields();
      fetchSchedules();
    } catch (error) {
      console.error("Lỗi khi phân phòng:", error);
      message.error(error?.response?.data?.message || "Không thể phân phòng");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Nếu chọn nhiều nhân viên, tạo lịch cho từng người
      const danhSachNhanVien = Array.isArray(values.id_nguoi_dung) 
        ? values.id_nguoi_dung 
        : [values.id_nguoi_dung];

      if (selectedSchedule) {
        // Update chỉ cho 1 lịch
        const data = {
          id_nguoi_dung: values.id_nguoi_dung,
          ngay_lam_viec: values.ngay_lam_viec.format('YYYY-MM-DD'),
          ca: values.ca
        };
        // Chỉ thêm phòng khám nếu là bác sĩ
        if (activeTab === 'bac-si') {
          data.id_phong_kham = values.id_phong_kham || null;
        }
        await apiNhanVienPhanCong.updateLichLamViec(selectedSchedule.id_lich_lam_viec, data);
        message.success("Cập nhật lịch làm việc thành công");
      } else {
        // Tạo lịch cho tất cả nhân viên đã chọn
        const promises = danhSachNhanVien.map(id_nguoi_dung => {
          const data = {
            id_nguoi_dung,
            ngay_lam_viec: values.ngay_lam_viec.format('YYYY-MM-DD'),
            ca: values.ca
          };
          // Chỉ thêm phòng khám nếu là bác sĩ
          if (activeTab === 'bac-si') {
            data.id_phong_kham = values.id_phong_kham || null;
          }
          return apiNhanVienPhanCong.createLichLamViec(data);
        });

        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        if (successCount > 0) {
          message.success(`Tạo thành công ${successCount} lịch làm việc${failCount > 0 ? `, thất bại ${failCount}` : ''}`);
        } else {
          message.error("Không thể tạo lịch làm việc");
        }
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedChuyenKhoa(null);
      setSelectedChuyenNganh(null);
      setSelectedBacSiInForm(null);
      fetchPhongKhamList(); // Reset phòng khám về tất cả
      fetchSchedules();
    } catch (error) {
      console.error("Lỗi khi lưu lịch làm việc:", error);
      message.error(error?.response?.data?.message || "Không thể lưu lịch làm việc");
    }
  };

  const handleSwap = () => {
    if (selectedSwapSchedules.length !== 2) {
      message.warning("Vui lòng chọn đúng 2 lịch làm việc để đổi ca");
      return;
    }

    setModalSwapVisible(true);
  };

  const handleConfirmSwap = async () => {
    try {
      const [schedule1, schedule2] = selectedSwapSchedules;
      await apiNhanVienPhanCong.swapCa(
        schedule1.id_lich_lam_viec,
        schedule2.id_lich_lam_viec
      );
      message.success("Đổi ca làm việc thành công");
      setModalSwapVisible(false);
      setSelectedSwapSchedules([]);
      fetchSchedules();
    } catch (error) {
      console.error("Lỗi khi đổi ca:", error);
      message.error(error?.response?.data?.message || "Không thể đổi ca");
    }
  };

  const handlePhanCongHangLoat = async (values) => {
    try {
      const { weekStart, weekEnd, selectedCa, id_phong_kham } = values;
      
      // Lấy danh sách nhân viên đã chọn theo tab
      let selectedNhanVien = [];
      if (activeTab === 'bac-si') {
        selectedNhanVien = values.selectedBacSi || [];
      } else if (activeTab === 'chuyen-gia-dinh-duong') {
        selectedNhanVien = values.selectedChuyenGia || [];
      } else {
        selectedNhanVien = values.selectedNhanVien || [];
      }

      if (!selectedNhanVien || selectedNhanVien.length === 0) {
        message.warning("Vui lòng chọn ít nhất một nhân viên");
        return;
      }

      const danhSachPhanCong = [];

      // Tạo lịch cho mỗi nhân viên đã chọn, mỗi ca đã chọn, trong khoảng thời gian
      const start = dayjs(weekStart);
      const end = dayjs(weekEnd);

      for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
        // Bỏ qua chủ nhật (ngày 0)
        if (d.day() !== 0) {
          selectedNhanVien.forEach(idNhanVien => {
            selectedCa.forEach(ca => {
              const item = {
                id_nguoi_dung: idNhanVien,
                ngay_lam_viec: d.format('YYYY-MM-DD'),
                ca: ca
              };
              // Chỉ thêm phòng khám nếu là bác sĩ
              if (activeTab === 'bac-si') {
                item.id_phong_kham = id_phong_kham || null;
              }
              danhSachPhanCong.push(item);
            });
          });
        }
      }

      if (danhSachPhanCong.length === 0) {
        message.warning("Không có lịch nào được tạo. Vui lòng kiểm tra lại các lựa chọn.");
        return;
      }

      const res = await apiNhanVienPhanCong.phanCongHangLoat(danhSachPhanCong);
      message.success(
        `Phân công thành công ${res.data?.thanhCong?.length || 0}/${danhSachPhanCong.length} lịch làm việc`
      );
      
      if (res.data?.thatBai && res.data.thatBai.length > 0) {
        console.warn("Các lịch không được tạo:", res.data.thatBai);
      }

      setModalHangLoatVisible(false);
      formHangLoat.resetFields();
      setSelectedChuyenKhoa(null);
      setSelectedChuyenNganh(null);
      fetchSchedules();
    } catch (error) {
      console.error("Lỗi khi phân công hàng loạt:", error);
      message.error(error?.response?.data?.message || "Không thể phân công hàng loạt");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: activeTab === 'bac-si' ? "Bác sĩ" : activeTab === 'chuyen-gia-dinh-duong' ? "Chuyên gia dinh dưỡng" : "Nhân viên",
      dataIndex: activeTab === 'bac-si' ? "bacSiInfo" : activeTab === 'chuyen-gia-dinh-duong' ? "chuyenGiaInfo" : "nhanVienInfo",
      key: "nhanVien",
      width: 200,
      render: (info, record) => {
        if (activeTab === 'bac-si') {
          return info?.ho_ten || record.ho_ten || record.id_nguoi_dung || "N/A";
        } else if (activeTab === 'chuyen-gia-dinh-duong') {
          return info?.ho_ten || record.ho_ten || record.id_nguoi_dung || "N/A";
        } else {
          return info?.ho_ten || record.ho_ten || record.id_nguoi_dung || "N/A";
        }
      }
    },
    {
      title: "Ngày làm việc",
      dataIndex: "ngay_lam_viec",
      key: "ngay_lam_viec",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "Ca",
      dataIndex: "ca",
      key: "ca",
      width: 100,
      render: (ca) => {
        const caInfo = caList.find(c => c.value === ca);
        return (
          <Tag color={caInfo?.color}>
            {caInfo?.label || ca}
          </Tag>
        );
      }
    },
    {
      title: "Khung giờ",
      dataIndex: "khung_gios",
      key: "khung_gios",
      width: 250,
      render: (khungGios) => {
        if (!khungGios || khungGios.length === 0) {
          return <Text type="secondary">Chưa có khung giờ</Text>;
        }
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {khungGios.map((kg, index) => (
              <Tag key={kg.id_khung_gio || index} color="blue">
                {kg.gio_bat_dau} - {kg.gio_ket_thuc}
                {kg.mo_ta && (
                  <Tooltip title={kg.mo_ta}>
                    <span style={{ marginLeft: 4 }}>ℹ️</span>
                  </Tooltip>
                )}
              </Tag>
            ))}
          </Space>
        );
      }
    },
    ...(activeTab === 'bac-si' ? [{
      title: "Phòng khám",
      dataIndex: "id_phong_kham",
      key: "id_phong_kham",
      width: 200,
      render: (id, record) => {
        if (!id) return "-";
        const phongKham = allPhongKhamList.find(pk => pk.id_phong_kham === id) || record.ten_phong;
        return phongKham?.ten_phong || phongKham || id;
      }
    }] : []),
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lịch làm việc này?"
            onConfirm={() => handleDelete(record.id_lich_lam_viec)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedSwapSchedules.map(s => s.id_lich_lam_viec),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedSwapSchedules(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: false
    })
  };

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
              <CalendarOutlined style={{ marginRight: '12px' }} />
              Quản lý lịch làm việc
            </Title>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates) {
                    setDateRange(dates);
                  }
                }}
                format="DD/MM/YYYY"
                style={{ background: 'white' }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchSchedules}
                loading={loading}
                style={{ background: 'white' }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          borderRadius: "16px",
          marginBottom: '24px'
        }}
      >
        {/* Tabs để tách Bác sĩ và Nhân viên khác */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setFilters({
              id_chuyen_khoa: null,
              id_bac_si: null,
              id_phong_kham: null,
              id_chuyen_nganh: null,
              vai_tro: null,
              ca: null
            });
          }}
          items={[
            {
              key: 'bac-si',
              label: (
                <Space>
                  <UserOutlined />
                  <span>Bác sĩ</span>
                </Space>
              )
            },
            {
              key: 'chuyen-gia-dinh-duong',
              label: (
                <Space>
                  <UserOutlined />
                  <span>Chuyên gia dinh dưỡng</span>
                </Space>
              )
            },
            {
              key: 'nhan-vien-khac',
              label: (
                <Space>
                  <TeamOutlined />
                  <span>Nhân viên khác</span>
                </Space>
              )
            }
          ]}
          style={{ marginBottom: '16px' }}
        />

        {/* Filter Bar - Bác sĩ */}
        {activeTab === 'bac-si' && (
          <Card
            size="small"
            style={{ marginBottom: '16px', background: '#f5f5f5' }}
            title={
              <Space>
                <FilterOutlined />
                <span>Bộ lọc</span>
              </Space>
            }
            extra={
              <Button
                size="small"
                onClick={() => {
                  setFilters({
                    id_chuyen_khoa: null,
                    id_bac_si: null,
                    id_phong_kham: null,
                    id_chuyen_nganh: null,
                    vai_tro: null,
                    ca: null
                  });
                }}
              >
                Xóa bộ lọc
              </Button>
            }
          >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo chuyên khoa"
                style={{ width: '100%' }}
                allowClear
                value={filters.id_chuyen_khoa}
                onChange={(value) => setFilters({ ...filters, id_chuyen_khoa: value })}
              >
                {chuyenKhoaList.map(ck => (
                  <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                    {ck.ten_chuyen_khoa}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo bác sĩ"
                style={{ width: '100%' }}
                allowClear
                value={filters.id_bac_si}
                onChange={(value) => setFilters({ ...filters, id_bac_si: value })}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
              >
                {bacSiList.map(bs => (
                  <Option key={bs.id_bac_si} value={bs.id_bac_si}>
                    {bs.ho_ten || bs.id_bac_si}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo phòng khám"
                style={{ width: '100%' }}
                allowClear
                value={filters.id_phong_kham}
                onChange={(value) => setFilters({ ...filters, id_phong_kham: value })}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
              >
                {allPhongKhamList.map(pk => (
                  <Option key={pk.id_phong_kham} value={pk.id_phong_kham}>
                    {pk.ten_phong} ({pk.so_phong})
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo ca"
                style={{ width: '100%' }}
                allowClear
                value={filters.ca}
                onChange={(value) => setFilters({ ...filters, ca: value })}
              >
                {caList.map(ca => (
                  <Option key={ca.value} value={ca.value}>
                    {ca.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
        )}

        {/* Filter Bar - Chuyên gia dinh dưỡng */}
        {activeTab === 'chuyen-gia-dinh-duong' && (
          <Card
            size="small"
            style={{ marginBottom: '16px', background: '#f5f5f5' }}
            title={
              <Space>
                <FilterOutlined />
                <span>Bộ lọc</span>
              </Space>
            }
            extra={
              <Button
                size="small"
                onClick={() => {
                  setFilters({
                    id_chuyen_khoa: null,
                    id_bac_si: null,
                    id_phong_kham: null,
                    id_chuyen_nganh: null,
                    vai_tro: null,
                    ca: null
                  });
                }}
              >
                Xóa bộ lọc
              </Button>
            }
          >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo chuyên ngành dinh dưỡng"
                style={{ width: '100%' }}
                allowClear
                value={filters.id_chuyen_nganh}
                onChange={(value) => {
                  setSelectedChuyenNganh(value);
                  setFilters({ ...filters, id_chuyen_nganh: value });
                }}
              >
                {chuyenNganhDinhDuongList.map(cnd => (
                  <Option key={cnd.id_chuyen_nganh} value={cnd.id_chuyen_nganh}>
                    {cnd.ten_chuyen_nganh}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo ca"
                style={{ width: '100%' }}
                allowClear
                value={filters.ca}
                onChange={(value) => setFilters({ ...filters, ca: value })}
              >
                {caList.map(ca => (
                  <Option key={ca.value} value={ca.value}>
                    {ca.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
        )}

        {/* Filter Bar - Nhân viên khác */}
        {activeTab === 'nhan-vien-khac' && (
          <Card
            size="small"
            style={{ marginBottom: '16px', background: '#f5f5f5' }}
            title={
              <Space>
                <FilterOutlined />
                <span>Bộ lọc</span>
              </Space>
            }
            extra={
              <Button
                size="small"
                onClick={() => {
                  setFilters({
                    id_chuyen_khoa: null,
                    id_bac_si: null,
                    id_phong_kham: null,
                    id_chuyen_nganh: null,
                    vai_tro: null,
                    ca: null
                  });
                }}
              >
                Xóa bộ lọc
              </Button>
            }
          >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo vai trò"
                style={{ width: '100%' }}
                allowClear
                value={filters.vai_tro}
                onChange={(value) => setFilters({ ...filters, vai_tro: value })}
              >
                <Option value="nhan_vien_quay">Nhân viên quầy</Option>
                <Option value="nhan_vien_phan_cong">Nhân viên phân công</Option>
                <Option value="nhan_vien_xet_nghiem">Nhân viên xét nghiệm</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo ca"
                style={{ width: '100%' }}
                allowClear
                value={filters.ca}
                onChange={(value) => setFilters({ ...filters, ca: value })}
              >
                {caList.map(ca => (
                  <Option key={ca.value} value={ca.value}>
                    {ca.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
        )}

        <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo lịch làm việc
            </Button>
            <Button
              type="primary"
              icon={<CheckSquareOutlined />}
              onClick={() => setModalHangLoatVisible(true)}
              style={{ background: '#16a085', borderColor: '#16a085' }}
            >
              Phân công hàng loạt
            </Button>
            <Button
              type="default"
              icon={<SwapOutlined />}
              onClick={handleSwap}
              disabled={selectedSwapSchedules.length !== 2}
            >
              Đổi ca ({selectedSwapSchedules.length}/2)
            </Button>
            {activeTab === 'bac-si' && (
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  formSelectDateCa.resetFields();
                  formSelectDateCa.setFieldsValue({
                    ngay_lam_viec: dayjs(),
                    ca: undefined
                  });
                  setModalSelectDateCaVisible(true);
                }}
              >
                Xem bác sĩ available
              </Button>
            )}
          </Space>
          <Space>
            <Button
              icon={<TableOutlined />}
              onClick={() => setViewMode('table')}
              type={viewMode === 'table' ? 'primary' : 'default'}
            >
              Bảng
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => setViewMode('calendar')}
              type={viewMode === 'calendar' ? 'primary' : 'default'}
            >
              Lịch
            </Button>
          </Space>
        </Space>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={schedules}
            rowKey="id_lich_lam_viec"
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} lịch làm việc`
            }}
            rowSelection={rowSelection}
          />
        ) : (
          <CalendarView 
            schedules={schedules} 
            loading={loading}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={filters}
            isBacSi={activeTab === 'bac-si'}
            selectedSwapSchedules={selectedSwapSchedules}
            onScheduleClick={(schedule) => {
              setSelectedSchedule(schedule);
              if (activeTab === 'bac-si') {
                setSelectedBacSiInForm(schedule.id_nguoi_dung);
                // Lấy chuyên khoa từ schedule hoặc từ allBacSiList
                let idChuyenKhoa = schedule.id_chuyen_khoa;
                if (!idChuyenKhoa && schedule.ten_chuyen_khoa) {
                  // Tìm trong allBacSiList để lấy id_chuyen_khoa
                  const bacSi = allBacSiList.find(bs => bs.id_bac_si === schedule.id_nguoi_dung);
                  idChuyenKhoa = bacSi?.id_chuyen_khoa;
                }
                if (idChuyenKhoa) {
                  setSelectedChuyenKhoa(idChuyenKhoa);
                  fetchPhongKhamList(idChuyenKhoa);
                } else {
                  fetchPhongKhamList();
                }
                form.setFieldsValue({
                  id_nguoi_dung: schedule.id_nguoi_dung,
                  ngay_lam_viec: dayjs(schedule.ngay_lam_viec),
                  ca: schedule.ca,
                  id_phong_kham: schedule.id_phong_kham || undefined,
                  id_chuyen_khoa_filter: idChuyenKhoa || undefined,
                  ghi_chu: schedule.ghi_chu || ''
                });
              } else {
                form.setFieldsValue({
                  id_nguoi_dung: schedule.id_nguoi_dung,
                  ngay_lam_viec: dayjs(schedule.ngay_lam_viec),
                  ca: schedule.ca,
                  ghi_chu: schedule.ghi_chu || ''
                });
              }
              setModalVisible(true);
            }}
            onAssignRoom={(schedule) => {
              handleAssignRoom(schedule);
            }}
            onDelete={handleDeleteWithConfirm}
            onSelectForSwap={handleSelectForSwapInCalendar}
          />
        )}
      </Card>

      {/* Modal tạo/chỉnh sửa lịch làm việc */}
      <Modal
        title={selectedSchedule ? "Chỉnh sửa lịch làm việc" : "Tạo lịch làm việc mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedChuyenKhoa(null);
          setSelectedBacSiInForm(null);
          fetchPhongKhamList(); // Reset phòng khám về tất cả
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {activeTab === 'bac-si' && (
            <Form.Item
              name="id_chuyen_khoa_filter"
              label={selectedSchedule ? "Chuyên khoa" : "Lọc theo chuyên khoa (tùy chọn)"}
            >
              <Select 
                placeholder={selectedSchedule ? "Chuyên khoa hiện tại" : "Chọn chuyên khoa để lọc bác sĩ"} 
                allowClear={!selectedSchedule}
                disabled={selectedSchedule ? true : false}
                onChange={(value) => {
                  if (!selectedSchedule) {
                    setSelectedChuyenKhoa(value);
                    form.setFieldsValue({ id_nguoi_dung: undefined }); // Reset bác sĩ khi đổi chuyên khoa
                  }
                }}
              >
                {chuyenKhoaList.map(ck => (
                  <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                    {ck.ten_chuyen_khoa}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {activeTab === 'chuyen-gia-dinh-duong' && (
            <Form.Item
              name="id_chuyen_nganh_filter"
              label="Lọc theo chuyên ngành dinh dưỡng (tùy chọn)"
            >
              <Select 
                placeholder="Chọn chuyên ngành dinh dưỡng để lọc chuyên gia" 
                allowClear
                onChange={(value) => {
                  setSelectedChuyenNganh(value);
                  form.setFieldsValue({ id_nguoi_dung: undefined }); // Reset chuyên gia khi đổi chuyên ngành
                }}
              >
                {chuyenNganhDinhDuongList.map(cn => (
                  <Option key={cn.id_chuyen_nganh} value={cn.id_chuyen_nganh}>
                    {cn.ten_chuyen_nganh}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="id_nguoi_dung"
            label={
              activeTab === 'bac-si' 
                ? (selectedSchedule ? "Bác sĩ" : "Chọn bác sĩ (có thể chọn nhiều)")
                : activeTab === 'chuyen-gia-dinh-duong'
                ? (selectedSchedule ? "Chuyên gia dinh dưỡng" : "Chọn chuyên gia dinh dưỡng (có thể chọn nhiều)")
                : (selectedSchedule ? "Nhân viên" : "Chọn nhân viên (có thể chọn nhiều)")
            }
            rules={[{ required: true, message: activeTab === 'bac-si' ? "Vui lòng chọn ít nhất một bác sĩ" : activeTab === 'chuyen-gia-dinh-duong' ? "Vui lòng chọn ít nhất một chuyên gia dinh dưỡng" : "Vui lòng chọn ít nhất một nhân viên" }]}
          >
            {activeTab === 'bac-si' ? (
              <Select 
                mode={selectedSchedule ? undefined : "multiple"}
                placeholder={selectedSchedule ? "Bác sĩ hiện tại" : "Chọn một hoặc nhiều bác sĩ"} 
                showSearch 
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
                disabled={selectedSchedule ? true : bacSiList.length === 0}
                onChange={(value) => {
                  if (!selectedSchedule) {
                    setSelectedBacSiInForm(Array.isArray(value) ? value[0] : value);
                    // Khi chọn bác sĩ, filter phòng khám theo chuyên khoa của bác sĩ đầu tiên
                    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
                      const firstBacSiId = Array.isArray(value) ? value[0] : value;
                      let bacSi = bacSiList.find(bs => bs.id_bac_si === firstBacSiId);
                      if (!bacSi) {
                        bacSi = allBacSiList.find(bs => bs.id_bac_si === firstBacSiId);
                      }
                      if (bacSi?.id_chuyen_khoa) {
                        fetchPhongKhamList(bacSi.id_chuyen_khoa);
                      } else {
                        fetchPhongKhamList();
                      }
                    } else {
                      fetchPhongKhamList();
                    }
                  }
                }}
              >
                {(selectedSchedule ? allBacSiList : bacSiList).map(bacSi => (
                  <Option key={bacSi.id_bac_si} value={bacSi.id_bac_si}>
                    {bacSi.ho_ten || bacSi.id_bac_si}
                    {bacSi.ten_chuyen_khoa && ` - ${bacSi.ten_chuyen_khoa}`}
                    {bacSi.chuyen_mon && ` (${bacSi.chuyen_mon})`}
                  </Option>
                ))}
              </Select>
            ) : activeTab === 'chuyen-gia-dinh-duong' ? (
              <Select 
                mode={selectedSchedule ? undefined : "multiple"}
                placeholder={selectedSchedule ? "Chọn chuyên gia dinh dưỡng" : "Chọn một hoặc nhiều chuyên gia dinh dưỡng"} 
                showSearch 
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
                disabled={selectedSchedule ? false : chuyenGiaDinhDuongList.length === 0}
              >
                {chuyenGiaDinhDuongList.map(cg => (
                  <Option key={cg.id_chuyen_gia} value={cg.id_chuyen_gia}>
                    {cg.ho_ten || cg.id_chuyen_gia}
                    {cg.ten_chuyen_nganh && ` - ${cg.ten_chuyen_nganh}`}
                    {cg.linh_vuc_chuyen_sau && ` (${cg.linh_vuc_chuyen_sau})`}
                  </Option>
                ))}
              </Select>
            ) : (
              <Select 
                mode={selectedSchedule ? undefined : "multiple"}
                placeholder={selectedSchedule ? "Chọn nhân viên" : "Chọn một hoặc nhiều nhân viên"} 
                showSearch 
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
                disabled={selectedSchedule ? false : nhanVienKhacList.length === 0}
              >
                {nhanVienKhacList.map(nv => (
                  <Option key={nv.id_nguoi_dung} value={nv.id_nguoi_dung}>
                    {nv.ho_ten || nv.id_nguoi_dung}
                    {nv.vai_tro && ` - ${nv.vai_tro.replace('_', ' ')}`}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            name="ngay_lam_viec"
            label="Ngày làm việc"
            rules={[{ required: true, message: "Vui lòng chọn ngày làm việc" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="ca"
            label="Ca làm việc"
            rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
          >
            <Select placeholder="Chọn ca làm việc">
              {caList.map(ca => (
                <Option key={ca.value} value={ca.value}>
                  {ca.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {activeTab === 'bac-si' && (
            <Form.Item
              name="id_phong_kham"
              label="Phòng khám (tùy chọn)"
              extra={
                selectedBacSiInForm 
                  ? "Phòng khám đã được lọc theo chuyên khoa của bác sĩ đã chọn" 
                  : "Phòng khám sẽ được lọc theo chuyên khoa của bác sĩ khi bạn chọn bác sĩ"
              }
            >
              <Select 
                placeholder="Chọn phòng khám" 
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
                disabled={!selectedBacSiInForm && !selectedSchedule}
              >
                {phongKhamList.map(pk => (
                  <Option key={pk.id_phong_kham} value={pk.id_phong_kham}>
                    {pk.ten_phong} ({pk.so_phong})
                    {pk.ten_chuyen_khoa && ` - ${pk.ten_chuyen_khoa}`}
                    {pk.tang && ` - Tầng ${pk.tang}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setSelectedChuyenKhoa(null);
                setSelectedChuyenNganh(null);
                setSelectedBacSiInForm(null);
                fetchPhongKhamList(); // Reset phòng khám về tất cả
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedSchedule ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận đổi ca */}
      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: token.colorPrimary }} />
            <span>Xác nhận đổi ca làm việc</span>
          </Space>
        }
        open={modalSwapVisible}
        onOk={handleConfirmSwap}
        onCancel={() => {
          setModalSwapVisible(false);
          setSelectedSwapSchedules([]);
        }}
        okText="Xác nhận đổi ca"
        cancelText="Hủy"
        width={600}
      >
        <Alert
          message="Cảnh báo"
          description="Thao tác này sẽ hoán đổi ca làm việc giữa 2 nhân viên. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        {selectedSwapSchedules.length === 2 && (
          <div>
            <Card 
              size="small" 
              style={{ 
                marginBottom: '16px', 
                border: `2px solid ${token.colorPrimary}`,
                background: '#f0f7ff'
              }}
              title={
                <Space>
                  <UserOutlined />
                  <span>Lịch 1</span>
                </Space>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>Nhân viên:</Text> <Text>{selectedSwapSchedules[0].ho_ten || selectedSwapSchedules[0].id_nguoi_dung}</Text>
                </div>
                <div>
                  <Text strong>Ngày:</Text> <Text>{dayjs(selectedSwapSchedules[0].ngay_lam_viec).format("DD/MM/YYYY")}</Text>
                </div>
                <div>
                  <Text strong>Ca hiện tại:</Text>{' '}
                  <Tag color={caList.find(c => c.value === selectedSwapSchedules[0].ca)?.color}>
                    {caList.find(c => c.value === selectedSwapSchedules[0].ca)?.label}
                  </Tag>
                </div>
                <div>
                  <Text strong>Ca sau đổi:</Text>{' '}
                  <Tag color={caList.find(c => c.value === selectedSwapSchedules[1].ca)?.color}>
                    {caList.find(c => c.value === selectedSwapSchedules[1].ca)?.label}
                  </Tag>
                </div>
                {selectedSwapSchedules[0].ten_phong && (
                  <div>
                    <Text strong>Phòng:</Text> <Text>{selectedSwapSchedules[0].ten_phong}</Text>
                  </div>
                )}
              </Space>
            </Card>
            
            <Card 
              size="small" 
              style={{ 
                border: `2px solid ${token.colorWarning}`,
                background: '#fffbe6'
              }}
              title={
                <Space>
                  <UserOutlined />
                  <span>Lịch 2</span>
                </Space>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>Nhân viên:</Text> <Text>{selectedSwapSchedules[1].ho_ten || selectedSwapSchedules[1].id_nguoi_dung}</Text>
                </div>
                <div>
                  <Text strong>Ngày:</Text> <Text>{dayjs(selectedSwapSchedules[1].ngay_lam_viec).format("DD/MM/YYYY")}</Text>
                </div>
                <div>
                  <Text strong>Ca hiện tại:</Text>{' '}
                  <Tag color={caList.find(c => c.value === selectedSwapSchedules[1].ca)?.color}>
                    {caList.find(c => c.value === selectedSwapSchedules[1].ca)?.label}
                  </Tag>
                </div>
                <div>
                  <Text strong>Ca sau đổi:</Text>{' '}
                  <Tag color={caList.find(c => c.value === selectedSwapSchedules[0].ca)?.color}>
                    {caList.find(c => c.value === selectedSwapSchedules[0].ca)?.label}
                  </Tag>
                </div>
                {selectedSwapSchedules[1].ten_phong && (
                  <div>
                    <Text strong>Phòng:</Text> <Text>{selectedSwapSchedules[1].ten_phong}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </div>
        )}
      </Modal>

      {/* Modal phân công hàng loạt */}
      <Modal
        title="Phân công hàng loạt"
        open={modalHangLoatVisible}
        onCancel={() => {
          setModalHangLoatVisible(false);
          formHangLoat.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={formHangLoat}
          layout="vertical"
          onFinish={handlePhanCongHangLoat}
        >
          <Form.Item
            name="weekStart"
            label="Tuần bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn tuần bắt đầu" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              picker="week"
            />
          </Form.Item>

          <Form.Item
            name="weekEnd"
            label="Tuần kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn tuần kết thúc" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              picker="week"
            />
          </Form.Item>

          {activeTab === 'bac-si' && (
            <Form.Item
              name="id_chuyen_khoa_filter_hang_loat"
              label="Lọc theo chuyên khoa (tùy chọn)"
            >
              <Select 
                placeholder="Chọn chuyên khoa để lọc bác sĩ" 
                allowClear
                onChange={(value) => {
                  setSelectedChuyenKhoa(value);
                }}
              >
                {chuyenKhoaList.map(ck => (
                  <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                    {ck.ten_chuyen_khoa}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {activeTab === 'chuyen-gia-dinh-duong' && (
            <Form.Item
              name="id_chuyen_nganh_filter_hang_loat"
              label="Lọc theo chuyên ngành dinh dưỡng (tùy chọn)"
            >
              <Select 
                placeholder="Chọn chuyên ngành dinh dưỡng để lọc chuyên gia" 
                allowClear
                onChange={(value) => {
                  setSelectedChuyenNganh(value);
                }}
              >
                {chuyenNganhDinhDuongList.map(cn => (
                  <Option key={cn.id_chuyen_nganh} value={cn.id_chuyen_nganh}>
                    {cn.ten_chuyen_nganh}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name={activeTab === 'bac-si' ? 'selectedBacSi' : activeTab === 'chuyen-gia-dinh-duong' ? 'selectedChuyenGia' : 'selectedNhanVien'}
            label={
              activeTab === 'bac-si' 
                ? "Chọn bác sĩ (có thể chọn nhiều)"
                : activeTab === 'chuyen-gia-dinh-duong'
                ? "Chọn chuyên gia dinh dưỡng (có thể chọn nhiều)"
                : "Chọn nhân viên (có thể chọn nhiều)"
            }
            rules={[{ 
              required: true, 
              message: activeTab === 'bac-si' 
                ? "Vui lòng chọn ít nhất một bác sĩ" 
                : activeTab === 'chuyen-gia-dinh-duong'
                ? "Vui lòng chọn ít nhất một chuyên gia dinh dưỡng"
                : "Vui lòng chọn ít nhất một nhân viên"
            }]}
          >
            {activeTab === 'bac-si' ? (
              <Select
                mode="multiple"
                placeholder="Chọn một hoặc nhiều bác sĩ"
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
              >
                {bacSiList.map(bacSi => (
                  <Option key={bacSi.id_bac_si} value={bacSi.id_bac_si}>
                    {bacSi.ho_ten || bacSi.id_bac_si}
                    {bacSi.ten_chuyen_khoa && ` - ${bacSi.ten_chuyen_khoa}`}
                    {bacSi.chuyen_mon && ` (${bacSi.chuyen_mon})`}
                  </Option>
                ))}
              </Select>
            ) : activeTab === 'chuyen-gia-dinh-duong' ? (
              <Select
                mode="multiple"
                placeholder="Chọn một hoặc nhiều chuyên gia dinh dưỡng"
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
              >
                {chuyenGiaDinhDuongList.map(cg => (
                  <Option key={cg.id_chuyen_gia} value={cg.id_chuyen_gia}>
                    {cg.ho_ten || cg.id_chuyen_gia}
                    {cg.ten_chuyen_nganh && ` - ${cg.ten_chuyen_nganh}`}
                    {cg.linh_vuc_chuyen_sau && ` (${cg.linh_vuc_chuyen_sau})`}
                  </Option>
                ))}
              </Select>
            ) : (
              <Select
                mode="multiple"
                placeholder="Chọn một hoặc nhiều nhân viên"
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
              >
                {nhanVienKhacList.map(nv => (
                  <Option key={nv.id_nguoi_dung} value={nv.id_nguoi_dung}>
                    {nv.ho_ten || nv.id_nguoi_dung}
                    {nv.vai_tro && ` - ${nv.vai_tro.replace('_', ' ')}`}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            name="selectedCa"
            label="Chọn ca làm việc (có thể chọn nhiều)"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất một ca" }]}
          >
            <Select mode="multiple" placeholder="Chọn ca làm việc">
              {caList.map(ca => (
                <Option key={ca.value} value={ca.value}>
                  {ca.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {activeTab === 'bac-si' && (
            <Form.Item
              name="id_phong_kham"
              label="Phòng khám (tùy chọn)"
              extra="Phòng khám sẽ được lọc theo chuyên khoa của bác sĩ đã chọn"
            >
              <Select 
                placeholder="Chọn phòng khám" 
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.children?.toString().toLowerCase() || '';
                  return label.includes(input.toLowerCase());
                }}
              >
                {phongKhamList.map(pk => (
                  <Option key={pk.id_phong_kham} value={pk.id_phong_kham}>
                    {pk.ten_phong} ({pk.so_phong})
                    {pk.ten_chuyen_khoa && ` - ${pk.ten_chuyen_khoa}`}
                    {pk.tang && ` - Tầng ${pk.tang}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setModalHangLoatVisible(false);
                formHangLoat.resetFields();
                setSelectedChuyenKhoa(null);
                setSelectedChuyenNganh(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" style={{ background: '#16a085', borderColor: '#16a085' }}>
                Phân công hàng loạt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chọn ngày và ca để xem bác sĩ available */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Chọn ngày và ca để xem bác sĩ available</span>
          </Space>
        }
        open={modalSelectDateCaVisible}
        onCancel={() => setModalSelectDateCaVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={formSelectDateCa}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setLoading(true);
              setModalSelectDateCaVisible(false);
              const params = {
                ngay_lam_viec: dayjs(values.ngay_lam_viec).format('YYYY-MM-DD'),
                ca: values.ca || null
              };
              await fetchAvailableBacSi(params);
              setModalAvailableBacSiVisible(true);
              setLoading(false);
            } catch (error) {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            name="ngay_lam_viec"
            label="Ngày làm việc"
            rules={[{ required: true, message: "Vui lòng chọn ngày làm việc" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày làm việc"
            />
          </Form.Item>

          <Form.Item
            name="ca"
            label="Ca làm việc (tùy chọn)"
            extra="Để trống nếu muốn xem tất cả các ca"
          >
            <Select placeholder="Chọn ca làm việc (tùy chọn)" allowClear>
              {caList.map(ca => (
                <Option key={ca.value} value={ca.value}>
                  {ca.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setModalSelectDateCaVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xem danh sách
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal hiển thị bác sĩ available */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Danh sách bác sĩ available</span>
          </Space>
        }
        open={modalAvailableBacSiVisible}
        onCancel={() => setModalAvailableBacSiVisible(false)}
        footer={null}
        width={800}
      >
        <Alert
          message="Bác sĩ available"
          description="Danh sách bác sĩ chưa được phân công hoặc chưa nghỉ phép trong ngày được chọn"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Table
          columns={[
            {
              title: "STT",
              key: "stt",
              width: 60,
              render: (_, __, index) => index + 1
            },
            {
              title: "Tên bác sĩ",
              dataIndex: "ho_ten",
              key: "ho_ten"
            },
            {
              title: "Chuyên khoa",
              dataIndex: "ten_chuyen_khoa",
              key: "ten_chuyen_khoa"
            },
            {
              title: "Chuyên môn",
              dataIndex: "chuyen_mon",
              key: "chuyen_mon"
            },
            {
              title: "Trạng thái",
              key: "status",
              render: () => (
                <Tag color="green">Available</Tag>
              )
            }
          ]}
          dataSource={availableBacSi}
          rowKey="id_bac_si"
          pagination={{
            pageSize: 10,
            showSizeChanger: true
          }}
        />
      </Modal>

      {/* Modal phân phòng */}
      <Modal
        title={
          <Space>
            <HomeOutlined />
            <span>Phân phòng cho bác sĩ</span>
          </Space>
        }
        open={modalAssignRoomVisible}
        onCancel={() => {
          setModalAssignRoomVisible(false);
          setScheduleToAssignRoom(null);
          formAssignRoom.resetFields();
        }}
        footer={null}
        width={500}
      >
        {scheduleToAssignRoom && (
          <Alert
            message={`Phân phòng cho ${scheduleToAssignRoom.ho_ten || 'bác sĩ'}`}
            description={`Ngày: ${dayjs(scheduleToAssignRoom.ngay_lam_viec).format('DD/MM/YYYY')} - Ca: ${caList.find(c => c.value === scheduleToAssignRoom.ca)?.label || scheduleToAssignRoom.ca}`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        <Form
          form={formAssignRoom}
          layout="vertical"
          onFinish={handleAssignRoomSubmit}
        >
          <Form.Item
            name="id_phong_kham"
            label="Chọn phòng khám"
            rules={[{ required: true, message: "Vui lòng chọn phòng khám" }]}
          >
            <Select 
              placeholder="Chọn phòng khám" 
              showSearch
              filterOption={(input, option) => {
                const label = option?.children?.toString().toLowerCase() || '';
                return label.includes(input.toLowerCase());
              }}
            >
              {phongKhamList.map(pk => (
                <Option key={pk.id_phong_kham} value={pk.id_phong_kham}>
                  {pk.ten_phong} ({pk.so_phong})
                  {pk.ten_chuyen_khoa && ` - ${pk.ten_chuyen_khoa}`}
                  {pk.tang && ` - Tầng ${pk.tang}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setModalAssignRoomVisible(false);
                setScheduleToAssignRoom(null);
                formAssignRoom.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Phân phòng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSchedule;

