import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Upload,
  message,
  Popconfirm,
  Image,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import apiChuyenKhoa from "../../../api/ChuyenKhoa";
import "./AdminSpecialties.css";

const { Title, Text } = Typography;

const AdminSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  // Hàm xử lý file upload - chỉ cho phép 1 file
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Validate và chuẩn bị file
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ chấp nhận file hình ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // Không tự động upload, để submit form xử lý
  };

  // --- Lấy danh sách chuyên khoa ---
  const fetchSpecialties = async () => {
    try {
      const res = await apiChuyenKhoa.getAllChuyenKhoa();
      setSpecialties(res);
      setFilteredSpecialties(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  // --- Lọc theo tên ---
  useEffect(() => {
    let filtered = specialties;
    if (searchName.trim()) {
      filtered = specialties.filter((item) =>
        item.ten_chuyen_khoa?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    setFilteredSpecialties(filtered);
    setCurrentPage(1);
  }, [searchName, specialties]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredSpecialties.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(filteredSpecialties.length / pageSize);

  // --- Thêm chuyên khoa ---
  const handleAddSpecialty = async (values) => {
    try {
      setLoading(true);
      
      // Lấy file từ form nếu có
      const fileList = values.hinh_anh || [];
      const file = fileList.length > 0 ? fileList[0].originFileObj : null;

      const data = {
        ten_chuyen_khoa: values.ten_chuyen_khoa,
        mo_ta: values.mo_ta,
        thiet_bi: values.thiet_bi,
        thoi_gian_hoat_dong: values.thoi_gian_hoat_dong,
      };

      await apiChuyenKhoa.createChuyenKhoa(data, file);
      message.success("Thêm chuyên khoa thành công!");
      setIsModalOpen(false);
      form.resetFields();
      fetchSpecialties();
    } catch (error) {
      console.error("Lỗi khi thêm chuyên khoa:", error);
      message.error("Không thể thêm chuyên khoa!");
    } finally {
      setLoading(false);
    }
  };

  // --- Sửa chuyên khoa ---
  const handleEditClick = (record) => {
    setEditingSpecialty(record);
    
    // Chuẩn bị fileList cho ảnh hiện tại nếu có
    const initialFileList = record.hinh_anh
      ? [
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: record.hinh_anh,
          },
        ]
      : [];

    editForm.setFieldsValue({
      ten_chuyen_khoa: record.ten_chuyen_khoa,
      mo_ta: record.mo_ta,
      thiet_bi: record.thiet_bi,
      thoi_gian_hoat_dong: record.thoi_gian_hoat_dong,
      hinh_anh: initialFileList,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSpecialty = async (values) => {
    try {
      setLoading(true);
      
      // Lấy file mới từ form nếu có
      const fileList = values.hinh_anh || [];
      const newFile = fileList.find(f => f.originFileObj)?.originFileObj || null;

      const data = {
        ten_chuyen_khoa: values.ten_chuyen_khoa,
        mo_ta: values.mo_ta,
        thiet_bi: values.thiet_bi,
        thoi_gian_hoat_dong: values.thoi_gian_hoat_dong,
      };

      await apiChuyenKhoa.updateChuyenKhoa(editingSpecialty.id_chuyen_khoa, data, newFile);
      message.success("Cập nhật chuyên khoa thành công!");
      setIsEditModalOpen(false);
      fetchSpecialties();
    } catch (error) {
      console.error("Lỗi khi cập nhật chuyên khoa:", error);
      message.error("Không thể cập nhật chuyên khoa!");
    } finally {
      setLoading(false);
    }
  };

  // --- Xóa chuyên khoa ---
  const handleDelete = async (id_chuyen_khoa) => {
    try {
      await apiChuyenKhoa.deleteChuyenKhoa(id_chuyen_khoa);
      message.success("Đã xóa chuyên khoa!");
      fetchSpecialties();
    } catch (error) {
      console.error("Lỗi khi xóa chuyên khoa:", error);
      message.error("Không thể xóa chuyên khoa!");
    }
  };

  // --- Cột bảng ---
  const columns = [
    {
      title: "TÊN CHUYÊN KHOA",
      dataIndex: "ten_chuyen_khoa",
      key: "ten_chuyen_khoa",
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
      title: "THIẾT BỊ",
      dataIndex: "thiet_bi",
      key: "thiet_bi",
      render: (device) => device || "Không",
    },
    {
      title: "THỜI GIAN HOẠT ĐỘNG",
      dataIndex: "thoi_gian_hoat_dong",
      key: "thoi_gian_hoat_dong",
      render: (time) => time || "Không",
    },
    {
      title: "HÌNH ẢNH",
      dataIndex: "hinh_anh",
      key: "hinh_anh",
      render: (img) =>
        img ? (
          <Image
            src={img}
            alt="Hình ảnh chuyên khoa"
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          "Không có"
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
            title="Bạn có chắc muốn xóa chuyên khoa này?"
            onConfirm={() => handleDelete(record.id_chuyen_khoa)}
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
    <div className="admin-specialties-container">
      <Card className="shadow-card">
        {/* Header */}
        <div className="header-section">
          <Title level={3} className="page-title">
            🏥 Quản lý chuyên khoa
          </Title>
          <Text type="secondary">
            Xem, thêm, lọc và quản lý các chuyên khoa trong hệ thống
          </Text>
        </div>

        {/* Bộ lọc */}
        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm theo tên chuyên khoa..."
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
                Thêm chuyên khoa
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Bảng danh sách */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={currentPageData.map((item) => ({
              ...item,
              key: item.id_chuyen_khoa,
            }))}
            pagination={false}
            size="middle"
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Modal thêm chuyên khoa */}
        <Modal
          title="➕ Thêm chuyên khoa mới"
          open={isModalOpen}
          onOk={() => form.submit()}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
        >
          <Form layout="vertical" form={form} onFinish={handleAddSpecialty}>
            <Form.Item
              label="Tên chuyên khoa"
              name="ten_chuyen_khoa"
              rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa" }]}
            >
              <Input placeholder="Nhập tên chuyên khoa..." />
            </Form.Item>

            <Form.Item label="Mô tả" name="mo_ta">
              <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
            </Form.Item>

            <Form.Item label="Thiết bị" name="thiet_bi">
              <Input placeholder="Các thiết bị chuyên dụng..." />
            </Form.Item>

            <Form.Item label="Thời gian hoạt động" name="thoi_gian_hoat_dong">
              <Input placeholder="VD: 7h00 - 17h00" />
            </Form.Item>

            <Form.Item
              label="Hình ảnh"
              name="hinh_anh"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="image"
                listType="picture-card"
                maxCount={1}
                beforeUpload={beforeUpload}
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal sửa chuyên khoa */}
        <Modal
          title="✏️ Sửa thông tin chuyên khoa"
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            editForm.resetFields();
          }}
          onOk={() => editForm.submit()}
          okText="Cập nhật"
          cancelText="Hủy"
          confirmLoading={loading}
          width={600}
        >
          <Form layout="vertical" form={editForm} onFinish={handleUpdateSpecialty}>
            <Form.Item
              label="Tên chuyên khoa"
              name="ten_chuyen_khoa"
              rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Mô tả" name="mo_ta">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Thiết bị" name="thiet_bi">
              <Input />
            </Form.Item>
            <Form.Item label="Thời gian hoạt động" name="thoi_gian_hoat_dong">
              <Input />
            </Form.Item>
            <Form.Item
              label="Hình ảnh"
              name="hinh_anh"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="image"
                listType="picture-card"
                maxCount={1}
                beforeUpload={beforeUpload}
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminSpecialties;
