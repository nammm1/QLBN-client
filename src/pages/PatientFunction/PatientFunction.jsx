import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Typography, Space } from "antd";
import { FileTextOutlined, AppleOutlined, CalendarOutlined } from "@ant-design/icons";
import "./PatientFunction.css";

const { Title, Paragraph } = Typography;

const PatientFunction = () => {
  const functions = [
    {
      key: "medical-records",
      title: "Hồ sơ bệnh án",
      icon: <FileTextOutlined style={{ fontSize: 48, color: "#096dd9" }} />,
      description: "Xem thông tin hồ sơ và lịch sử khám chữa bệnh.",
      path: "/medical-records",
      color: "#096dd9"
    },
    {
      key: "nutrition-records",
      title: "Hồ sơ dinh dưỡng",
      icon: <AppleOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
      description: "Xem thông tin hồ sơ và lịch sử tư vấn dinh dưỡng",
      path: "/nutrition-records",
      color: "#52c41a"
    },
    {
      key: "appointments",
      title: "Lịch hẹn",
      icon: <CalendarOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      description: "Theo dõi và quản lý lịch hẹn khám bệnh.",
      path: "/appointments",
      color: "#1890ff"
    }
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "60px 0" }}>
      <div className="container">
        <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 48 }}>
          Chức năng dành cho Bệnh nhân
        </Title>
        <Row gutter={[32, 32]} justify="center">
          {functions.map((func) => (
            <Col xs={24} sm={12} md={8} key={func.key}>
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
                  bodyStyle={{
                    textAlign: "center",
                    padding: "40px 24px",
                    background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)"
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

export default PatientFunction;
