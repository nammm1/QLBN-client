import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Typography, Space } from "antd";
import { FileTextOutlined, CalendarOutlined, ScheduleOutlined, ExperimentOutlined } from "@ant-design/icons";
import "./DoctorFunction.css";

const { Title, Paragraph } = Typography;

const DoctorFunction = () => {
  const functions = [
    {
      key: "medical-records",
      title: "Hồ sơ bệnh án",
      icon: <FileTextOutlined style={{ fontSize: 48, color: "#096dd9" }} />,
      description: "Truy cập và cập nhật thông tin hồ sơ bệnh án của bệnh nhân.",
      path: "/doctor-medical-records",
      color: "#096dd9"
    },
    {
      key: "schedule",
      title: "Lịch làm việc",
      icon: <ScheduleOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      description: "Xem và quản lý lịch làm việc hằng ngày/tuần.",
      path: "/doctor-schedule",
      color: "#1890ff"
    },
    {
      key: "appointments",
      title: "Lịch hẹn",
      icon: <CalendarOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
      description: "Xem, xác nhận và cập nhật lịch hẹn khám bệnh của bệnh nhân.",
      path: "/doctor-appointments",
      color: "#52c41a"
    },
    {
      key: "tests",
      title: "Chỉ định xét nghiệm",
      icon: <ExperimentOutlined style={{ fontSize: 48, color: "#fa8c16" }} />,
      description: "Đưa ra các chỉ định xét nghiệm cho bệnh nhân.",
      path: "/doctor-tests",
      color: "#fa8c16"
    }
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "60px 0" }}>
      <div className="container">
        <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 48 }}>
          Chức năng dành cho Bác sĩ
        </Title>
        <Row gutter={[32, 32]} justify="center">
          {functions.map((func) => (
            <Col xs={24} sm={12} md={12} lg={6} key={func.key}>
              <Link to={func.path} style={{ textDecoration: "none" }}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 16,
                    border: "2px solid #e6f7ff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "all 0.3s"
                  }}
                  styles={{
                    body: {
                      textAlign: "center",
                      padding: "40px 24px",
                      background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                    },
                  }}
                >
                  <div style={{ marginBottom: 24 }}>
                    {func.icon}
                  </div>
                  <Title level={4} style={{ color: func.color, marginBottom: 16 }}>
                    {func.title}
                  </Title>
                  <Paragraph style={{ color: "#666", margin: 0 }}>
                    {func.description}
                  </Paragraph>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default DoctorFunction;
