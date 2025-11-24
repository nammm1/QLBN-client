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
  message,
  Statistic,
  Segmented,
  theme,
  Radio
} from "antd";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  PlusOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  AppstoreOutlined,
  TableOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import updateLocale from "dayjs/plugin/updateLocale";
import isBetween from "dayjs/plugin/isBetween";
import apiLichLamViec from "../../../api/LichLamViec";
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
  { key: "Sang", label: "Sáng" },
  { key: "Chieu", label: "Chiều" },
  { key: "Toi", label: "Tối" }
];

const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const trangThaiNghiPhep = {
  cho_duyet: { text: "Chờ duyệt", color: "orange" },
  da_duyet: { text: "Đã duyệt", color: "green" },
  tu_choi: { text: "Từ chối", color: "red" }
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

const ReceptionistWorkSchedule = () => {
  const { token } = useToken();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(getMonday(dayjs()));
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalXinNghiVisible, setModalXinNghiVisible] = useState(false);
  const [modalLichSuVisible, setModalLichSuVisible] = useState(false);
  const [nghiPhepData, setNghiPhepData] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table, grid
  const [formNghiPhep] = Form.useForm();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userId = userInfo?.user?.id_nguoi_dung;
  const weekRange = [weekStart, weekStart.add(6, 'day')];

  useEffect(() => {
    setWeekStart(getMonday(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    fetchSchedule();
    fetchNghiPhep();
  }, [weekStart, userId]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const weekStartStr = formatDate(weekStart);
      const res = await apiLichLamViec.getByWeek(weekStartStr, userId);
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
      const res = await apiXinNghiPhep.getByNhanVien(userId);
      setNghiPhepData(res?.data || []);
    } catch (error) {
      // ignore
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

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    weekStart.add(i, "day")
  );

  const hasSchedulesFor = (d, displayCa) => {
    const dStr = formatDate(d);
    const dbCa = displayCa === "Sáng" ? "Sang" : displayCa === "Chiều" ? "Chieu" : displayCa === "Tối" ? "Toi" : displayCa;
    return schedule.some(
      (s) => s.ca === dbCa && formatDate(s.ngay_lam_viec) === dStr
    );
  };

  const isNghiPhepDate = (d) => {
    return nghiPhepData.some(np => 
      dayjs(d).isBetween(dayjs(np.ngay_bat_dau), dayjs(np.ngay_ket_thuc), null, '[]') &&
      np.trang_thai === 'da_duyet'
    );
  };

  // Slot hiển thị chỉ trạng thái: Có lịch / Nghỉ phép / Trống
  const ScheduleSlot = ({ date, ca }) => {
    const hasSchedule = hasSchedulesFor(date, ca);
    const nghi = isNghiPhepDate(date);

    const baseStyle = {
      minHeight: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${nghi ? token.colorWarning : hasSchedule ? token.colorSuccess : token.colorBorderSecondary}`,
      borderRadius: 12,
      background: nghi ? token.colorWarningBg : hasSchedule ? token.colorSuccessBg : token.colorFillAlter,
      color: nghi ? token.colorWarning : hasSchedule ? token.colorSuccess : token.colorTextSecondary,
      fontWeight: 600,
      cursor: 'default'
    };

    if (nghi) return <div style={baseStyle}>Nghỉ phép</div>;
    if (hasSchedule) return <div style={baseStyle}>Có lịch</div>;
    return <div style={baseStyle}>Trống</div>;
  };

  // Grid View
  const GridView = () => (
    <div style={{ padding: '16px 0' }}>
      <Row gutter={[20, 20]}>
        {weekDays.map((date, dayIndex) => {
          const isToday = date.isSame(dayjs(), 'day');
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={dayIndex}>
              <Card
                title={
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ color: token.colorPrimary }}>{dayNames[dayIndex]}</Text>
                    <br />
                    <Text type="secondary">{date.format("DD/MM/YYYY")}</Text>
                  </div>
                }
                size="small"
                style={{
                  borderRadius: 16,
                  border: `2px solid ${isToday ? token.colorPrimary : token.colorBorderSecondary}`
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {caList.map((ca) => (
                    <div key={`${date}-${ca.key}`}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{ca.label}</Text>
                      <ScheduleSlot date={date} ca={ca.label} />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  // Table View
  const TableColumns = [
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
          <span style={{ fontWeight: 600 }}>Ca / Ngày</span>
        </div>
      ),
      dataIndex: "ca",
      key: "ca",
      width: 140,
      render: (ca) => (
        <div style={{ textAlign: 'center', padding: 8, fontWeight: 700 }}>{ca}</div>
      ),
    },
    ...weekDays.map((d, idx) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: token.colorPrimary }}>{dayNames[idx]}</div>
          <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{d.format("DD/MM")}</div>
        </div>
      ),
      dataIndex: `day_${idx}`,
      key: `day_${idx}`,
      width: 180,
      render: (_, record) => (
        <ScheduleSlot date={d} ca={record.ca} />
      ),
    })),
  ];

  const TableDataSource = caList.map(ca => ({
    key: ca.key,
    ca: ca.label,
  }));

  return (
    <div style={{ 
      padding: 24, 
      maxWidth: 1400, 
      margin: '0 auto'
    }}>
      <Card 
        style={{ 
          borderRadius: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          marginBottom: 24,
          overflow: 'hidden'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', marginBottom: 4 }}>
                <CalendarOutlined style={{ marginRight: 12 }} />
                Lịch Làm Việc
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Nhân viên quầy: <Text strong style={{ color: 'white' }}>{userInfo?.user?.ho_ten || ""}</Text>
              </Text>
            </Space>
          </Col>
          <Col>
            <Segmented
              options={[
                { label: <span><TableOutlined /> Bảng</span>, value: 'table' },
                { label: <span><AppstoreOutlined /> Lưới</span>, value: 'grid' }
              ]}
              value={viewMode}
              onChange={setViewMode}
              size="large"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12 }}>
              <Statistic
                title={<span style={{ color: 'white' }}>📅 Tổng số ca tuần</span>}
                value={schedule.length}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12 }}>
              <Statistic
                title={<span style={{ color: 'white' }}>📝 Số đơn nghỉ</span>}
                value={nghiPhepData.length}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card 
        style={{ 
          borderRadius: 16,
          marginBottom: 24
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>🗓️ Chọn ngày trong tuần:</Text>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                suffixIcon={<CalendarOutlined />}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>📅 Chọn tuần:</Text>
              <RangePicker
                value={weekRange}
                onChange={handleWeekChange}
                picker="week"
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Alert
              message={`Tuần: ${weekStart.format("DD/MM/YYYY")} → ${weekStart.add(6, 'day').format("DD/MM/YYYY")}`}
              type="info"
              showIcon
              style={{ borderRadius: 12 }}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Text strong>🗓️ Lịch làm việc tuần này</Text>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSchedule}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalXinNghiVisible(true)}
            >
              Xin nghỉ phép
            </Button>
            <Button 
              icon={<HistoryOutlined />} 
              onClick={() => setModalLichSuVisible(true)}
            >
              Lịch sử
            </Button>
          </Space>
        </div>

        {viewMode === 'table' ? (
          <Table
            columns={TableColumns}
            dataSource={TableDataSource}
            pagination={false}
            loading={loading}
            bordered={false}
            size="middle"
          />
        ) : (
          <GridView />
        )}

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Space size="large" wrap>
            <Space>
              <div style={{ width: 16, height: 16, background: token.colorSuccessBg, border: `1px solid ${token.colorSuccessBorder}`, borderRadius: 4 }} />
              <Text type="secondary">Có lịch</Text>
            </Space>
            <Space>
              <div style={{ width: 16, height: 16, background: token.colorWarningBg, border: `1px solid ${token.colorWarningBorder}`, borderRadius: 4 }} />
              <Text type="secondary">Nghỉ phép</Text>
            </Space>
            <Space>
              <div style={{ width: 16, height: 16, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4 }} />
              <Text type="secondary">Trống</Text>
            </Space>
          </Space>
        </div>
      </Card>

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
          initialValues={{ loai_nghi: 'ca_ngay' }}
          onFinish={async (values) => {
            try {
              // Nếu nghỉ nửa ngày, đảm bảo ngay_ket_thuc = ngay_bat_dau
              let ngayKetThuc = values.ngay_ket_thuc;
              if (values.loai_nghi && values.loai_nghi !== 'ca_ngay') {
                ngayKetThuc = values.ngay_bat_dau;
              }

              await apiXinNghiPhep.create({
                id_nguoi_dung: userId,
                ngay_bat_dau: values.ngay_bat_dau.format('YYYY-MM-DD'),
                ngay_ket_thuc: ngayKetThuc.format('YYYY-MM-DD'),
                ly_do: values.ly_do,
                trang_thai: "cho_duyet",
                buoi_nghi: values.loai_nghi && values.loai_nghi !== 'ca_ngay' ? values.loai_nghi : null
              });
              message.success("Đã gửi đơn xin nghỉ phép!");
              setModalXinNghiVisible(false);
              formNghiPhep.resetFields();
              fetchNghiPhep();
            } catch (_) {
              message.error("Không thể gửi đơn xin nghỉ phép");
            }
          }}
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
            name="ngay_bat_dau"
            label="📅 Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              onChange={(date) => {
                const loaiNghi = formNghiPhep.getFieldValue('loai_nghi');
                if (date && loaiNghi && loaiNghi !== 'ca_ngay') {
                  formNghiPhep.setFieldsValue({ ngay_ket_thuc: date });
                }
              }}
            />
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
              return (
                <Form.Item
                  name="ngay_ket_thuc"
                  label="📅 Ngày kết thúc"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                    disabled={isNuaNgay}
                  />
                </Form.Item>
              );
            }}
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
        width={700}
      >
        <Table
          rowKey={(r, i) => i}
          dataSource={nghiPhepData}
          pagination={{ pageSize: 6 }}
          columns={[
            {
              title: 'Từ ngày',
              dataIndex: 'ngay_bat_dau',
              render: (d) => dayjs(d).format('DD/MM/YYYY')
            },
            {
              title: 'Đến ngày',
              dataIndex: 'ngay_ket_thuc',
              render: (d) => dayjs(d).format('DD/MM/YYYY')
            },
            {
              title: 'Trạng thái',
              dataIndex: 'trang_thai',
              render: (s) => <Tag color={trangThaiNghiPhep[s]?.color}>{trangThaiNghiPhep[s]?.text || s}</Tag>
            },
            {
              title: 'Lý do',
              dataIndex: 'ly_do',
              ellipsis: true
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default ReceptionistWorkSchedule;

