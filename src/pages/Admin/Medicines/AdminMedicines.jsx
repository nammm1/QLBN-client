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
import apiThuoc from "../../../api/Thuoc";
import "./AdminMedicines.css";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminMedicines = () => {
  const [thuocs, setThuocs] = useState([]);
  const [filteredThuocs, setFilteredThuocs] = useState([]);
  const [searchTen, setSearchTen] = useState("");
  const [searchHoatChat, setSearchHoatChat] = useState("");
  const [searchHang, setSearchHang] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingThuoc, setEditingThuoc] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const pageSize = 10;

  // --- Lấy danh sách thuốc ---
  const fetchThuocs = async () => {
    try {
      const res = await apiThuoc.getAllThuoc();
      setThuocs(res);
      setFilteredThuocs(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thuốc:", error);
      message.error("Không thể tải danh sách thuốc!");
    }
  };

  useEffect(() => {
    fetchThuocs();
  }, []);

  // --- Lọc thuốc ---
  useEffect(() => {
    let filtered = thuocs;

    if (searchTen.trim()) {
      filtered = filtered.filter((item) =>
        item.ten_thuoc?.toLowerCase().includes(searchTen.toLowerCase())
      );
    }
    if (searchHoatChat.trim()) {
      filtered = filtered.filter((item) =>
        item.hoatchat?.toLowerCase().includes(searchHoatChat.toLowerCase())
      );
    }
    if (searchHang.trim()) {
      filtered = filtered.filter(
        (item) => item.hang_bao_che === searchHang
      );
    }

    setFilteredThuocs(filtered);
    setCurrentPage(1);
  }, [searchTen, searchHoatChat, searchHang, thuocs]);

  // --- Danh sách hãng để đổ dropdown ---
  const hangList = Array.from(
    new Set(thuocs.map((item) => item.hang_bao_che).filter(Boolean))
  );

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredThuocs.slice(startIndex, startIndex + pageSize);

  // --- Thêm thuốc ---
  const handleAddThuoc = async (values) => {
    try {
      setLoading(true);
      await apiThuoc.createThuoc(values);
      message.success("Thêm thuốc thành công!");
      setIsAddModalOpen(false);
      form.resetFields();
      fetchThuocs();
    } catch (error) {
      console.error("Lỗi khi thêm thuốc:", error);
      message.error("Không thể thêm thuốc!");
    } finally {
      setLoading(false);
    }
  };

  // --- Sửa thuốc ---
  const handleEditClick = (record) => {
    setEditingThuoc(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateThuoc = async (values) => {
    try {
      setLoading(true);
      await apiThuoc.updateThuoc(editingThuoc.id_thuoc, values);
      message.success("Cập nhật thuốc thành công!");
      setIsEditModalOpen(false);
      fetchThuocs();
    } catch (error) {
      console.error("Lỗi khi cập nhật thuốc:", error);
      message.error("Không thể cập nhật thuốc!");
    } finally {
      setLoading(false);
    }
  };

  // --- Xóa thuốc ---
  const handleDelete = async (id_thuoc) => {
    try {
      await apiThuoc.deleteThuoc(id_thuoc);
      message.success("Đã xóa thuốc!");
      fetchThuocs();
    } catch (error) {
      console.error("Lỗi khi xóa thuốc:", error);
      message.error("Không thể xóa thuốc!");
    }
  };

  // --- Cột bảng ---
  const columns = [
    {
      title: "TÊN THUỐC",
      dataIndex: "ten_thuoc",
      key: "ten_thuoc",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "HOẠT CHẤT",
      dataIndex: "hoatchat",
      key: "hoatchat",
    },
    {
      title: "HÃNG BÀO CHẾ",
      dataIndex: "hang_bao_che",
      key: "hang_bao_che",
    },
    {
      title: "ĐƠN VỊ TÍNH",
      dataIndex: "don_vi_tinh",
      key: "don_vi_tinh",
    },
    {
      title: "MÔ TẢ",
      dataIndex: "mo_ta",
      key: "mo_ta",
      render: (desc) =>
        desc?.length > 50 ? desc.slice(0, 50) + "..." : desc || "Không có",
    },
    {
      title: "CHỐNG CHỈ ĐỊNH",
      dataIndex: "chong_chi_dinh",
      key: "chong_chi_dinh",
      render: (desc) =>
        desc?.length > 50 ? desc.slice(0, 50) + "..." : desc || "Không có",
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
            title="Bạn có chắc muốn xóa thuốc này?"
            onConfirm={() => handleDelete(record.id_thuoc)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger type="link" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-medicines-container">
      <Card className="shadow-card">
        <div className="header-section">
          <Title level={3} className="page-title">
            💊 Quản lý thuốc
          </Title>
          <Text type="secondary">
            Xem, thêm, lọc và quản lý danh sách thuốc trong hệ thống
          </Text>
        </div>

        {/* Bộ lọc */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Input
                placeholder="Tìm theo tên thuốc..."
                prefix={<SearchOutlined />}
                value={searchTen}
                onChange={(e) => setSearchTen(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Tìm theo hoạt chất..."
                prefix={<SearchOutlined />}
                value={searchHoatChat}
                onChange={(e) => setSearchHoatChat(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Chọn hãng bào chế..."
                allowClear
                value={searchHang || undefined}
                onChange={(value) => setSearchHang(value || "")}
                size="large"
                style={{ width: "100%" }}
              >
                {hangList.map((hang, index) => (
                  <Option key={index} value={hang}>
                    {hang}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row justify="end" style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsAddModalOpen(true)}
            >
              Thêm thuốc
            </Button>
          </Row>
        </Card>

        {/* Bảng danh sách */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={currentPageData.map((item) => ({
              ...item,
              key: item.id_thuoc,
            }))}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredThuocs.length,
              onChange: (page) => setCurrentPage(page),
            }}
            size="middle"
            bordered
          />
        </Card>

        {/* Modal thêm thuốc */}
        <Modal
          title="➕ Thêm thuốc mới"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          onOk={() => form.submit()}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
        >
          <Form layout="vertical" form={form} onFinish={handleAddThuoc}>
            <Form.Item
              label="Tên thuốc"
              name="ten_thuoc"
              rules={[{ required: true, message: "Vui lòng nhập tên thuốc!" }]}
            >
              <Input placeholder="Nhập tên thuốc..." />
            </Form.Item>
            <Form.Item
              label="Hoạt chất"
              name="hoatchat"
              rules={[{ required: true, message: "Vui lòng nhập hoạt chất!" }]}
            >
              <Input placeholder="VD: Paracetamol" />
            </Form.Item>
            <Form.Item
              label="Hãng bào chế"
              name="hang_bao_che"
              rules={[{ required: true, message: "Vui lòng nhập hãng bào chế!" }]}
            >
              <Input placeholder="VD: Dược Hậu Giang" />
            </Form.Item>
            <Form.Item
              label="Đơn vị tính"
              name="don_vi_tinh"
              rules={[{ required: true, message: "Vui lòng nhập đơn vị tính!" }]}
            >
              <Input placeholder="VD: Viên, Chai, Ống..." />
            </Form.Item>
            <Form.Item label="Mô tả" name="mo_ta">
              <Input.TextArea rows={3} placeholder="Thông tin thêm về thuốc..." />
            </Form.Item>
            <Form.Item label="Chống chỉ định" name="chong_chi_dinh">
              <Input.TextArea rows={2} placeholder="VD: Người suy gan, phụ nữ mang thai..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal sửa thuốc */}
        <Modal
          title="✏️ Cập nhật thông tin thuốc"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onOk={() => editForm.submit()}
          okText="Cập nhật"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
        >
          <Form layout="vertical" form={editForm} onFinish={handleUpdateThuoc}>
            <Form.Item
              label="Tên thuốc"
              name="ten_thuoc"
              rules={[{ required: true, message: "Vui lòng nhập tên thuốc!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Hoạt chất" name="hoatchat">
              <Input />
            </Form.Item>
            <Form.Item label="Hãng bào chế" name="hang_bao_che">
              <Input />
            </Form.Item>
            <Form.Item label="Đơn vị tính" name="don_vi_tinh">
              <Input />
            </Form.Item>
            <Form.Item label="Mô tả" name="mo_ta">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Chống chỉ định" name="chong_chi_dinh">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminMedicines;
