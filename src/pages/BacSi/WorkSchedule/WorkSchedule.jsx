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
  Alert
} from "antd";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import updateLocale from "dayjs/plugin/updateLocale";
import apiLichLamViec from "../../../api/LichLamViec";

dayjs.locale("vi");
dayjs.extend(updateLocale);

// Cập nhật locale để hiển thị thứ tiếng Việt
dayjs.updateLocale("vi", {
  weekdays: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
});

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const caList = [
  { key: "Sang", label: "Sáng", color: "gold" },
  { key: "Chieu", label: "Chiều", color: "orange" },
  { key: "Toi", label: "Tối", color: "blue" }
];

const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

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
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(getMonday(dayjs()));
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    setWeekStart(getMonday(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const weekStartStr = formatDate(weekStart);
        const res = await apiLichLamViec.getByWeek(weekStartStr, userInfo.user.id_nguoi_dung);
        const data = res?.data?.data || res?.data || res;
        setSchedule(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log("Lỗi khi lấy lịch làm việc:", error);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    if (weekStart) fetchSchedule();
  }, [weekStart, userInfo?.user?.id_nguoi_dung]);

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
    return schedule.filter(
      (s) => mapCa(s.ca) === displayCa && formatDate(s.ngay_lam_viec) === dStr
    );
  };

  const weekEnd = weekStart.add(6, "day");

  const columns = [
    {
      title: (
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          Ca / Ngày
        </div>
      ),
      dataIndex: "ca",
      key: "ca",
      width: 120,
      render: (ca) => (
        <div style={{ textAlign: 'center' }}>
          <Tag 
            color={caList.find(c => c.label === ca)?.color} 
            style={{ padding: "4px 12px", fontSize: "14px", fontWeight: 600 }}
          >
            {ca}
          </Tag>
        </div>
      ),
    },
    ...weekDays.map((d, idx) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: "14px" }}>
            {dayNames[idx]}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {d.format("DD/MM/YYYY")}
          </div>
        </div>
      ),
      dataIndex: `day_${idx}`,
      key: `day_${idx}`,
      width: 140,
      render: (_, record) => {
        const matched = hasSchedulesFor(d, record.ca);
        return (
          <div 
            className={`p-2 rounded ${matched.length ? "bg-success" : "bg-light"}`}
            style={{ 
              minHeight: "80px", 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: `2px solid ${matched.length ? "#52c41a" : "#f0f0f0"}`,
              borderRadius: "8px"
            }}
          >
            {matched.length ? (
              <div style={{ textAlign: 'center' }}>
                {matched.map((m, k) => (
                  <Badge 
                    key={k}
                    status="processing"
                    text={
                      <Text strong style={{ color: "white", fontSize: "12px" }}>
                        {m.gio_bat_dau && m.gio_ket_thuc
                          ? `${m.gio_bat_dau} - ${m.gio_ket_thuc}`
                          : "Có lịch"}
                      </Text>
                    }
                  />
                ))}
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Trống
              </Text>
            )}
          </div>
        );
      },
    })),
  ];

  const dataSource = caList.map(ca => ({
    key: ca.key,
    ca: ca.label,
  }));

  const weekRange = [weekStart, weekEnd];

  return (
    <div className="container mt-4">
      <Card 
        variant="borderless"
        className="shadow-sm"
        style={{ borderRadius: "12px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Title level={3} style={{ marginBottom: '4px' }}>
                <CalendarOutlined className="text-primary" style={{ marginRight: '8px' }} />
                Lịch Làm Việc
              </Title>
              <Text type="secondary">
                <UserOutlined style={{ marginRight: '4px' }} />
                Bác sĩ: <Text strong>{userInfo?.user?.ho_ten || ""}</Text>
              </Text>
            </div>

            {/* Controls */}
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>Chọn ngày trong tuần:</Text>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    size="large"
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>Chọn tuần:</Text>
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
                    <Space >
                      <CalendarOutlined />
                      <span>
                        Tuần: {weekStart.format("DD/MM/YYYY")} → {weekEnd.format("DD/MM/YYYY")}
                      </span>
                    </Space>
                  }
                  type="info"
                  showIcon
                  style={{ borderRadius: "8px",marginTop: "25px" }}
                />
              </Col>
            </Row>
          </Space>
        </div>

        {/* Schedule Table */}
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          loading={loading}
          bordered
          size="middle"
          className="custom-schedule-table"
          style={{ borderRadius: "8px", overflow: "hidden" }}
        />

        {/* Legend */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Space size="large">
            <Space>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                backgroundColor: "#52c41a", 
                borderRadius: "4px" 
              }} />
              <Text type="secondary">Có lịch làm việc</Text>
            </Space>
            <Space>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                backgroundColor: "#f0f0f0", 
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }} />
              <Text type="secondary">Trống</Text>
            </Space>
          </Space>
        </div>
      </Card>

      <style>{`
        .custom-schedule-table .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .custom-schedule-table .ant-table-tbody > tr > td {
          transition: all 0.3s ease;
        }
        
        .custom-schedule-table .ant-table-tbody > tr:hover > td {
          background: #f5f5f5 !important;
        }
      `}</style>
    </div>
  );
};

export default WorkSchedule;