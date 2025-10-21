import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Modal,
  Form,
  message,
  Popconfirm,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import apiDichVu from "../../../api/DichVu";
import "./AdminServices.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingService, setEditingService] = useState(null);
  const pageSize = 10;

  // --- Lấy danh sách dịch vụ ---
const fetchServices = async () => {
  try {
    const res = await apiDichVu.getAll();
    setServices(res?.data || []); // Thêm ?. và fallback []
    setFilteredServices(res?.data || []); 
  } catch (error) {
    console.error("Lỗi khi lấy danh sách dịch vụ:", error);
    message.error("Không thể tải danh sách dịch vụ!");
    setServices([]); // Set empty array khi lỗi
    setFilteredServices([]);
  }
};

  useEffect(() => {
    fetchServices();
  }, []);

  // --- Lọc theo tên ---
  useEffect(() => {
    let filtered = services;
    if (searchName.trim()) {
      filtered = services.filter((item) =>
        item.ten_dich_vu?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    setFilteredServices(filtered);
  }, [searchName, services]);

  // --- Thêm dịch vụ ---
  const handleAddService = async (values) => {
    try {
      setLoading(true);
      await apiDichVu.create(values);
      message.success("Thêm dịch vụ thành công!");
      setIsModalOpen(false);
      form.resetFields();
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      message.error("Không thể thêm dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  // --- Mở modal sửa ---
  const handleEditClick = (record) => {
    setEditingService(record);
    editForm.setFieldsValue({
      ten_dich_vu: record.ten_dich_vu,
      mo_ta: record.mo_ta,
      don_gia: record.don_gia,
      trang_thai: record.trang_thai,
    });
    setIsEditModalOpen(true);
  };

  // --- Cập nhật dịch vụ ---
  const handleUpdateService = async (values) => {
    try {
      setLoading(true);
      await apiDichVu.update(editingService.id_dich_vu, values);
      message.success("Cập nhật dịch vụ thành công!");
      setIsEditModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ:", error);
      message.error("Không thể cập nhật dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  // --- Xóa dịch vụ ---
  const handleDelete = async (id_dich_vu) => {
    try {
      await apiDichVu.delete(id_dich_vu);
      message.success("Đã xóa dịch vụ!");
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      message.error("Không thể xóa dịch vụ!");
    }
  };

  // --- Cột bảng ---
  const columns = [
    {
      title: "TÊN DỊCH VỤ",
      dataIndex: "ten_dich_vu",
      key: "ten_dich_vu",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "MÔ TẢ",
      dataIndex: "mo_ta",
      key: "mo_ta",
      render: (desc) => (
        <Text style={{ color: "#666" }}>
          {desc?.length > 60 ? desc.slice(0, 60) + "..." : desc || "Không"}
        </Text>
      ),
    },
    {
      title: "ĐƠN GIÁ (VNĐ)",
      dataIndex: "don_gia",
      key: "don_gia",
      render: (price) => (
        <Text strong style={{ color: "#1677ff" }}>
          {price?.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => (
        <Text
          style={{
            color: status === "HoatDong" ? "green" : "red",
            fontWeight: 500,
          }}
        >
          {status === "HoatDong" ? "Hoạt động" : "Ngừng"}
        </Text>
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEditClick(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa dịch vụ này?"
            onConfirm={() => handleDelete(record.id_dich_vu)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
<div className="admin-services-container">
        <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            💊 Quản lý dịch vụ
          </Title>
          <Text type="secondary">
            Xem, thêm, sửa, xóa các dịch vụ y tế trong hệ thống
          </Text>
        </div>

        {/* Bộ lọc */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm theo tên dịch vụ..."
                prefix={<SearchOutlined />}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="large"
              />
            </Col>

            <Col xs={24} sm={12} md={8} offset={8} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsModalOpen(true)}
              >
                Thêm dịch vụ
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Bảng danh sách */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={filteredServices.map((item) => ({
              ...item,
              key: item.id_dich_vu,
            }))}
            pagination={{ pageSize }}
            size="middle"
          />
        </Card>

        {/* Modal thêm dịch vụ */}
        <Modal
          title="➕ Thêm dịch vụ mới"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
        >
          <Form layout="vertical" form={form} onFinish={handleAddService}>
            <Form.Item
              label="Tên dịch vụ"
              name="ten_dich_vu"
              rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
            >
              <Input placeholder="Nhập tên dịch vụ..." />
            </Form.Item>

            <Form.Item label="Mô tả" name="mo_ta">
              <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
            </Form.Item>

            <Form.Item
              label="Đơn giá (VNĐ)"
              name="don_gia"
              rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
            >
              <Input type="number" placeholder="VD: 200000" />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="trang_thai"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="HoatDong">Hoạt động</Option>
                <Option value="Ngung">Ngừng</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal sửa dịch vụ */}
        <Modal
          title="✏️ Sửa thông tin dịch vụ"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onOk={() => editForm.submit()}
          okText="Cập nhật"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
        >
          <Form layout="vertical" form={editForm} onFinish={handleUpdateService}>
            <Form.Item
              label="Tên dịch vụ"
              name="ten_dich_vu"
              rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Mô tả" name="mo_ta">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="Đơn giá (VNĐ)"
              name="don_gia"
              rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Trạng thái" name="trang_thai">
              <Select>
                <Option value="HoatDong">Hoạt động</Option>
                <Option value="Ngung">Ngừng</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminServices;
