import React from "react";
import { Card, Table, Typography, Tag, Space } from "antd";
import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import "./DoctorMedicalRecords.css";

const { Title } = Typography;

const DoctorMedicalRecords = () => {
  const records = [
    { id: "HS001", name: "Nguyễn Văn A", diagnosis: "Viêm họng cấp" },
    { id: "HS002", name: "Trần Thị B", diagnosis: "Viêm phế quản" },
    { id: "HS003", name: "Lê Văn C", diagnosis: "Đau dạ dày" },
  ];

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Họ tên bệnh nhân",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#096dd9" }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Chẩn đoán",
      dataIndex: "diagnosis",
      key: "diagnosis",
      render: (text) => <Tag color="red">{text}</Tag>,
    },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <Title level={2} style={{ textAlign: "center", color: "#096dd9", marginBottom: 32 }}>
          <FileTextOutlined /> Hồ sơ bệnh án điện tử
        </Title>
        <Card
          style={{
            borderRadius: 12,
            border: "1px solid #e6f7ff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ background: "#fff" }}
          />
        </Card>
      </div>
    </div>
  );
};

export default DoctorMedicalRecords;
