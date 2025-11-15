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
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tag,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import apiPhongKham from "../../../api/PhongKham";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import "./AdminPhongKham.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminPhongKham = () => {
  const [phongKhams, setPhongKhams] = useState([]);
  const [filteredPhongKhams, setFilteredPhongKhams] = useState([]);
  const [chuyenKhoas, setChuyenKhoas] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [selectedChuyenKhoa, setSelectedChuyenKhoa] = useState(null);
  const [selectedTrangThai, setSelectedTrangThai] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingPhongKham, setEditingPhongKham] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  // Lấy danh sách phòng khám
  const fetchPhongKhams = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedChuyenKhoa) params.id_chuyen_khoa = selectedChuyenKhoa;
      if (selectedTrangThai) params.trang_thai = selectedTrangThai;
      if (searchName) params.search = searchName;
      
      const res = await apiPhongKham.getAllAdmin(params);
      const data = res.data || res; 
      setPhongKhams(data);
      setFilteredPhongKhams(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng khám:", error);
      message.error("Không thể tải danh sách phòng khám");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách chuyên khoa
  const fetchChuyenKhoas = async () => {
    try {
      const res = await apiChuyenKhoa.getAllChuyenKhoa();
      setChuyenKhoas(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
    }
  };

  useEffect(() => {
    fetchPhongKhams();
    fetchChuyenKhoas();
  }, []);

  // Lọc dữ liệu
  useEffect(() => {
    fetchPhongKhams();
  }, [selectedChuyenKhoa, selectedTrangThai, searchName]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredPhongKhams.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(filteredPhongKhams.length / pageSize);

  // Cập nhật trạng thái cục bộ để không bị biến mất trên bảng
  const applyLocalStatusUpdate = (id_phong_kham, newStatus) => {
    setPhongKhams((prev) =>
      prev.map((pk) =>
        pk.id_phong_kham === id_phong_kham ? { ...pk, trang_thai: newStatus } : pk
      )
    );
    setFilteredPhongKhams((prev) =>
      prev.map((pk) =>
        pk.id_phong_kham === id_phong_kham ? { ...pk, trang_thai: newStatus } : pk
      )
    );
  };

  // Thêm phòng khám
  const handleAddPhongKham = async (values) => {
    try {
      setLoading(true);
      await apiPhongKham.create(values);
      message.success("Thêm phòng khám thành công!");
      setIsModalOpen(false);
      form.resetFields();
      fetchPhongKhams();
    } catch (error) {
      console.error("Lỗi khi thêm phòng khám:", error);
      message.error(error?.response?.data?.message || "Không thể thêm phòng khám!");
    } finally {
      setLoading(false);
    }
  };

  // Sửa phòng khám
  const handleEditClick = (record) => {
    setEditingPhongKham(record);
    editForm.setFieldsValue({
      ten_phong: record.ten_phong,
      so_phong: record.so_phong,
      tang: record.tang,
      id_chuyen_khoa: record.id_chuyen_khoa,
      mo_ta: record.mo_ta,
      trang_thai: record.trang_thai,
      thiet_bi: record.thiet_bi,
      so_cho_ngoi: record.so_cho_ngoi,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePhongKham = async (values) => {
    try {
      setLoading(true);
      await apiPhongKham.update(editingPhongKham.id_phong_kham, values);
      message.success("Cập nhật phòng khám thành công!");
      setIsEditModalOpen(false);
      fetchPhongKhams();
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng khám:", error);
      message.error(error?.response?.data?.message || "Không thể cập nhật phòng khám!");
    } finally {
      setLoading(false);
    }
  };

  // Xóa phòng khám
  const handleDelete = async (id_phong_kham) => {
    try {
      await apiPhongKham.delete(id_phong_kham);
      message.success("Đã xóa phòng khám!");
      fetchPhongKhams();
    } catch (error) {
      console.error("Lỗi khi xóa phòng khám:", error);
      message.error("Không thể xóa phòng khám!");
    }
  };

  // Cột bảng
  const columns = [
    {
      title: "SỐ PHÒNG",
      dataIndex: "so_phong",
      key: "so_phong",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "TÊN PHÒNG",
      dataIndex: "ten_phong",
      key: "ten_phong",
    },
    {
      title: "TẦNG",
      dataIndex: "tang",
      key: "tang",
      render: (tang) => tang || "Không",
    },
    {
      title: "CHUYÊN KHOA",
      dataIndex: "ten_chuyen_khoa",
      key: "ten_chuyen_khoa",
      render: (text) => text || "Không",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status, record) => {
        const colorMap = {
          HoatDong: "green",
          BaoTri: "orange",
          Ngung: "red",
        };
        const textMap = {
          HoatDong: "Hoạt động",
          BaoTri: "Bảo trì",
          Ngung: "Ngừng",
        };
        return (
          <Space>
            <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>
            <Select
              size="small"
              value={status}
              onChange={async (value) => {
                try {
                  await apiPhongKham.update(record.id_phong_kham, { trang_thai: value });
                  applyLocalStatusUpdate(record.id_phong_kham, value);
                  message.success("Cập nhật trạng thái thành công!");
                } catch (error) {
                  console.error("Lỗi cập nhật trạng thái:", error);
                  message.error(error?.response?.data?.message || "Không thể cập nhật trạng thái!");
                }
              }}
              style={{ minWidth: 120 }}
            >
              <Option value="HoatDong">Hoạt động</Option>
              <Option value="BaoTri">Bảo trì</Option>
              <Option value="Ngung">Ngừng</Option>
            </Select>
          </Space>
        );
      },
    },
    {
      title: "SỐ CHỖ NGỒI",
      dataIndex: "so_cho_ngoi",
      key: "so_cho_ngoi",
      render: (so) => so || "Không",
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
            title="Bạn có chắc muốn xóa phòng khám này?"
            onConfirm={() => handleDelete(record.id_phong_kham)}
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
    <div className="admin-phongkham-container">
      <Card className="shadow-card">
        <div className="header-section">
          <Title level={3} className="page-title">
            🏥 Quản lý Phòng khám
          </Title>
          <Text type="secondary">
            Xem, thêm, lọc và quản lý các phòng khám trong hệ thống
          </Text>
        </div>

        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm theo tên, số phòng..."
                prefix={<SearchOutlined />}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Chọn chuyên khoa"
                value={selectedChuyenKhoa}
                onChange={setSelectedChuyenKhoa}
                allowClear
                size="large"
                style={{ width: "100%" }}
              >
                {chuyenKhoas.map((ck) => (
                  <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                    {ck.ten_chuyen_khoa}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Chọn trạng thái"
                value={selectedTrangThai}
                onChange={setSelectedTrangThai}
                allowClear
                size="large"
                style={{ width: "100%" }}
              >
                <Option value="HoatDong">Hoạt động</Option>
                <Option value="BaoTri">Bảo trì</Option>
                <Option value="Ngung">Ngừng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsModalOpen(true)}
              >
                Thêm phòng khám
              </Button>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={currentPageData}
          rowKey="id_phong_kham"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredPhongKhams.length,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} phòng khám`,
          }}
        />
      </Card>

      {/* Modal thêm phòng khám */}
      <Modal
        title="Thêm phòng khám mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPhongKham}
        >
          <Form.Item
            name="ten_phong"
            label="Tên phòng"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
          >
            <Input placeholder="Nhập tên phòng" />
          </Form.Item>
          <Form.Item
            name="so_phong"
            label="Số phòng"
            rules={[{ required: true, message: "Vui lòng nhập số phòng" }]}
          >
            <Input placeholder="Nhập số phòng (VD: P101)" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tang" label="Tầng">
                <InputNumber
                  placeholder="Tầng"
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="so_cho_ngoi" label="Số chỗ ngồi">
                <InputNumber
                  placeholder="Số chỗ ngồi"
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="id_chuyen_khoa" label="Chuyên khoa">
            <Select placeholder="Chọn chuyên khoa" allowClear>
              {chuyenKhoas.map((ck) => (
                <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                  {ck.ten_chuyen_khoa}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="trang_thai" label="Trạng thái" initialValue="HoatDong">
            <Select>
              <Option value="HoatDong">Hoạt động</Option>
              <Option value="BaoTri">Bảo trì</Option>
              <Option value="Ngung">Ngừng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="thiet_bi" label="Thiết bị">
            <TextArea rows={3} placeholder="Nhập danh sách thiết bị" />
          </Form.Item>
          <Form.Item name="mo_ta" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả phòng khám" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa phòng khám */}
      <Modal
        title="Sửa phòng khám"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdatePhongKham}
        >
          <Form.Item
            name="ten_phong"
            label="Tên phòng"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
          >
            <Input placeholder="Nhập tên phòng" />
          </Form.Item>
          <Form.Item
            name="so_phong"
            label="Số phòng"
            rules={[{ required: true, message: "Vui lòng nhập số phòng" }]}
          >
            <Input placeholder="Nhập số phòng (VD: P101)" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tang" label="Tầng">
                <InputNumber
                  placeholder="Tầng"
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="so_cho_ngoi" label="Số chỗ ngồi">
                <InputNumber
                  placeholder="Số chỗ ngồi"
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="id_chuyen_khoa" label="Chuyên khoa">
            <Select placeholder="Chọn chuyên khoa" allowClear>
              {chuyenKhoas.map((ck) => (
                <Option key={ck.id_chuyen_khoa} value={ck.id_chuyen_khoa}>
                  {ck.ten_chuyen_khoa}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="trang_thai" label="Trạng thái">
            <Select>
              <Option value="HoatDong">Hoạt động</Option>
              <Option value="BaoTri">Bảo trì</Option>
              <Option value="Ngung">Ngừng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="thiet_bi" label="Thiết bị">
            <TextArea rows={3} placeholder="Nhập danh sách thiết bị" />
          </Form.Item>
          <Form.Item name="mo_ta" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả phòng khám" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPhongKham;

