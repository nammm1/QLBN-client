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
} from "@ant-design/icons";
import apiCuocHenKham from "../../../api/CuocHenKhamBenh";
import apiBenhNhan from "../../../api/BenhNhan";
import apiBacSi from "../../../api/BacSi";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import apiKhungGioKham from "../../../api/KhungGioKham";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptData, patientData, doctorData, specialtyData, timeSlotData] = await Promise.all([
        apiCuocHenKham.getAll(),
        apiBenhNhan.getAll(),
        apiBacSi.getAll(),
        apiChuyenKhoa.getAll(),
        apiKhungGioKham.getAll(),
      ]);

      setAppointments(apptData || []);
      setPatients(patientData || []);
      setDoctors(doctorData || []);
      setSpecialties(specialtyData || []);
      setTimeSlots(timeSlotData || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const appointmentData = {
        ...values,
        ngay_hen: values.ngay_hen.format("YYYY-MM-DD"),
        trang_thai: "cho_xac_nhan",
      };

      await apiCuocHenKham.create(appointmentData);
      message.success("Đặt lịch hẹn thành công!");
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
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

      {/* Tabs & Table */}
      <Card style={{ borderRadius: "12px" }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Tất cả ({appointments.length})
              </span>
            }
            key="all"
          />
          <TabPane
            tab={
              <Badge count={getTabCount("cho_xac_nhan")} offset={[10, 0]}>
                <span>
                  <SyncOutlined spin />
                  Chờ xác nhận
                </span>
              </Badge>
            }
            key="cho_xac_nhan"
          />
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                Đã xác nhận ({getTabCount("da_xac_nhan")})
              </span>
            }
            key="da_xac_nhan"
          />
          <TabPane
            tab={
              <span>
                <CloseCircleOutlined />
                Đã hủy ({getTabCount("da_huy")})
              </span>
            }
            key="da_huy"
          />
        </Tabs>

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
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
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
                <Select placeholder="Chọn chuyên khoa">
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
                name="id_bac_si"
                label="Bác sĩ"
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
              >
                <Select placeholder="Chọn bác sĩ">
                  {doctors.map((doctor) => (
                    <Option key={doctor.id_bac_si} value={doctor.id_bac_si}>
                      BS. {doctor.ho_ten}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
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
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="id_khung_gio"
                label="Khung giờ khám"
                rules={[{ required: true, message: "Vui lòng chọn khung giờ!" }]}
              >
                <Select placeholder="Chọn khung giờ">
                  {timeSlots.map((slot) => (
                    <Option key={slot.id_khung_gio} value={slot.id_khung_gio}>
                      {slot.gio_bat_dau} - {slot.gio_ket_thuc}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ly_do_kham" label="Lý do khám">
            <Input.TextArea rows={3} placeholder="Nhập lý do khám bệnh" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
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

