import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  DatePicker,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Statistic,
  Badge,
  Segmented,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import apiLichLamViec from "../../../api/LichLamViec";
import apiXinNghiPhep from "../../../api/XinNghiPhep";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReceptionistWorkSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState(moment().startOf("week"));
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [form] = Form.useForm();

  const userId = localStorage.getItem("userId") || "NV_quay001";

  useEffect(() => {
    fetchSchedules();
    fetchLeaveRequests();
  }, [selectedWeekStart]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const weekStartStr = selectedWeekStart.format("YYYY-MM-DD");
      const data = await apiLichLamViec.getByWeek(weekStartStr, userId);
      setSchedules(data || []);
    } catch (error) {
      message.error("Không thể tải lịch làm việc");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const data = await apiXinNghiPhep.getByNhanVien(userId);
      setLeaveRequests(data || []);
    } catch (error) {
      console.error("Không thể tải lịch sử nghỉ phép", error);
    }
  };

  const handlePreviousWeek = () => {
    setSelectedWeekStart(selectedWeekStart.clone().subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setSelectedWeekStart(selectedWeekStart.clone().add(1, "week"));
  };

  const handleThisWeek = () => {
    setSelectedWeekStart(moment().startOf("week"));
  };

  const handleSubmitLeave = async (values) => {
    try {
      const leaveData = {
        id_nguoi_dung: userId,
        ngay_bat_dau: values.ngay_bat_dau.format("YYYY-MM-DD"),
        ngay_ket_thuc: values.ngay_ket_thuc.format("YYYY-MM-DD"),
        loai_nghi: values.loai_nghi,
        ly_do: values.ly_do,
        trang_thai: "cho_duyet",
      };

      await apiXinNghiPhep.create(leaveData);
      message.success("Đã gửi đơn xin nghỉ phép!");
      setIsLeaveModalVisible(false);
      form.resetFields();
      fetchLeaveRequests();
    } catch (error) {
      message.error("Không thể gửi đơn xin nghỉ phép");
      console.error(error);
    }
  };

  const getShiftStats = () => {
    const stats = {
      sang: 0,
      chieu: 0,
      toi: 0,
      total: schedules.length,
    };

    schedules.forEach((schedule) => {
      const shift = schedule.ca_lam_viec?.toLowerCase();
      if (shift === "sáng" || shift === "sang") stats.sang++;
      else if (shift === "chiều" || shift === "chieu") stats.chieu++;
      else if (shift === "tối" || shift === "toi") stats.toi++;
    });

    return stats;
  };

  const getStatusConfig = (status) => {
    const configs = {
      cho_duyet: { color: "warning", text: "Chờ duyệt", icon: <SyncOutlined spin /> },
      da_duyet: { color: "success", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
      tu_choi: { color: "error", text: "Từ chối", icon: <CloseCircleOutlined /> },
    };
    return configs[status] || configs.cho_duyet;
  };

  const renderTableView = () => {
    const columns = [
      {
        title: "Ngày",
        dataIndex: "ngay_lam_viec",
        key: "ngay_lam_viec",
        render: (date) => (
          <div>
            <CalendarOutlined style={{ marginRight: "6px", color: "#f39c12" }} />
            <Text strong>{moment(date).format("DD/MM/YYYY")}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {moment(date).format("dddd")}
            </Text>
          </div>
        ),
      },
      {
        title: "Ca làm việc",
        dataIndex: "ca_lam_viec",
        key: "ca_lam_viec",
        render: (shift) => {
          const colors = {
            Sáng: "gold",
            Chiều: "blue",
            Tối: "purple",
          };
          return <Tag color={colors[shift] || "default"}>{shift}</Tag>;
        },
      },
      {
        title: "Giờ làm",
        key: "time",
        render: (_, record) => (
          <div>
            <ClockCircleOutlined style={{ marginRight: "6px" }} />
            <Text>
              {record.gio_bat_dau} - {record.gio_ket_thuc}
            </Text>
          </div>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "ghi_chu",
        key: "ghi_chu",
        render: (note) => note || <Text type="secondary">Không có</Text>,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={schedules}
        loading={loading}
        rowKey="id_lich_lam_viec"
        pagination={false}
      />
    );
  };

  const renderGridView = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(selectedWeekStart.clone().add(i, "days"));
    }

    return (
      <Row gutter={[16, 16]}>
        {weekDays.map((day) => {
          const daySchedules = schedules.filter(
            (s) => moment(s.ngay_lam_viec).format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
          );

          const isToday = day.isSame(moment(), "day");

          return (
            <Col xs={24} md={12} lg={8} key={day.format("YYYY-MM-DD")}>
              <Card
                style={{
                  borderRadius: "12px",
                  border: isToday ? "2px solid #f39c12" : "1px solid #e8e8e8",
                  height: "100%",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <Badge status={isToday ? "processing" : "default"} />
                  <Text strong style={{ fontSize: "16px", color: isToday ? "#f39c12" : "#333" }}>
                    {day.format("dddd")}
                  </Text>
                  <br />
                  <Text type="secondary">{day.format("DD/MM/YYYY")}</Text>
                </div>

                {daySchedules.length > 0 ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {daySchedules.map((schedule) => (
                      <Card
                        key={schedule.id_lich_lam_viec}
                        size="small"
                        style={{
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                        }}
                      >
                        <Tag
                          color={
                            schedule.ca_lam_viec === "Sáng"
                              ? "gold"
                              : schedule.ca_lam_viec === "Chiều"
                              ? "blue"
                              : "purple"
                          }
                        >
                          {schedule.ca_lam_viec}
                        </Tag>
                        <div style={{ marginTop: "8px" }}>
                          <ClockCircleOutlined style={{ marginRight: "6px" }} />
                          <Text style={{ fontSize: "13px" }}>
                            {schedule.gio_bat_dau} - {schedule.gio_ket_thuc}
                          </Text>
                        </div>
                        {schedule.ghi_chu && (
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {schedule.ghi_chu}
                            </Text>
                          </div>
                        )}
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    <Text type="secondary">Không có lịch</Text>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const stats = getShiftStats();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          📅 Lịch làm việc của tôi
        </Title>
        <Text type="secondary">Xem lịch làm việc và xin nghỉ phép</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Ca sáng</span>}
              value={stats.sang}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Ca chiều</span>}
              value={stats.chieu}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Ca tối</span>}
              value={stats.toi}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: "12px", background: "linear-gradient(135deg, #55efc4 0%, #00b894 100%)" }}>
            <Statistic
              title={<span style={{ color: "#fff" }}>Tổng ca</span>}
              value={stats.total}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card style={{ borderRadius: "12px", marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space>
              <Button onClick={handlePreviousWeek} icon={<ClockCircleOutlined />}>
                Tuần trước
              </Button>
              <Button type="primary" onClick={handleThisWeek}>
                Tuần này
              </Button>
              <Button onClick={handleNextWeek} icon={<ClockCircleOutlined />}>
                Tuần sau
              </Button>
              <Text strong style={{ marginLeft: "16px" }}>
                {selectedWeekStart.format("DD/MM/YYYY")} -{" "}
                {selectedWeekStart.clone().add(6, "days").format("DD/MM/YYYY")}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Segmented
                options={[
                  { label: "Bảng", value: "table", icon: <TableOutlined /> },
                  { label: "Lưới", value: "grid", icon: <AppstoreOutlined /> },
                ]}
                value={viewMode}
                onChange={setViewMode}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsLeaveModalVisible(true)}
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                }}
              >
                Xin nghỉ phép
              </Button>
              <Button icon={<HistoryOutlined />} onClick={() => setIsHistoryModalVisible(true)}>
                Lịch sử
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Schedule */}
      <Card style={{ borderRadius: "12px" }}>
        {viewMode === "table" ? renderTableView() : renderGridView()}
      </Card>

      {/* Leave Request Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <FileTextOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Xin nghỉ phép
          </span>
        }
        open={isLeaveModalVisible}
        onCancel={() => setIsLeaveModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitLeave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ngay_bat_dau"
                label="Từ ngày"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày bắt đầu"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ngay_ket_thuc"
                label="Đến ngày"
                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày kết thúc"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="loai_nghi"
            label="Loại nghỉ"
            rules={[{ required: true, message: "Vui lòng chọn loại nghỉ!" }]}
          >
            <Select placeholder="Chọn loại nghỉ">
              <Option value="phep_nam">Nghỉ phép năm</Option>
              <Option value="om">Nghỉ ốm</Option>
              <Option value="ca_nhan">Nghỉ cá nhân</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ly_do"
            label="Lý do"
            rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do xin nghỉ phép" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsLeaveModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                }}
              >
                Gửi đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <HistoryOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Lịch sử xin nghỉ phép
          </span>
        }
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Table
          dataSource={leaveRequests}
          rowKey="id_xin_nghi"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Từ ngày",
              dataIndex: "ngay_bat_dau",
              key: "ngay_bat_dau",
              render: (date) => moment(date).format("DD/MM/YYYY"),
            },
            {
              title: "Đến ngày",
              dataIndex: "ngay_ket_thuc",
              key: "ngay_ket_thuc",
              render: (date) => moment(date).format("DD/MM/YYYY"),
            },
            {
              title: "Loại nghỉ",
              dataIndex: "loai_nghi",
              key: "loai_nghi",
              render: (type) => {
                const types = {
                  phep_nam: "Phép năm",
                  om: "Nghỉ ốm",
                  ca_nhan: "Cá nhân",
                };
                return types[type] || type;
              },
            },
            {
              title: "Lý do",
              dataIndex: "ly_do",
              key: "ly_do",
              ellipsis: true,
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
          ]}
        />
      </Modal>
    </div>
  );
};

export default ReceptionistWorkSchedule;

