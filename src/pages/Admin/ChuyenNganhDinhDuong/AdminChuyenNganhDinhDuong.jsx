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
  Image,
  Upload,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import apiChuyenGiaDinhDuong from "../../../api/ChuyenGiaDinhDuong";
import uploadService from "../../../api/Upload";
import "./AdminChuyenNganhDinhDuong.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminChuyenNganhDinhDuong = () => {
  const [chuyenNganhs, setChuyenNganhs] = useState([]);
  const [filteredChuyenNganhs, setFilteredChuyenNganhs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingChuyenNganh, setEditingChuyenNganh] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

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
    return false;
  };

  // Lấy danh sách chuyên ngành dinh dưỡng
  const fetchChuyenNganhs = async () => {
    try {
      setLoading(true);
      const res = await apiChuyenGiaDinhDuong.getAllChuyenNganh();
      setChuyenNganhs(res);
      setFilteredChuyenNganhs(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên ngành dinh dưỡng:", error);
      message.error("Không thể tải danh sách chuyên ngành dinh dưỡng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChuyenNganhs();
  }, []);

  // Lọc theo tên
  useEffect(() => {
    let filtered = chuyenNganhs;
    if (searchName.trim()) {
      filtered = chuyenNganhs.filter((item) =>
        item.ten_chuyen_nganh?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    setFilteredChuyenNganhs(filtered);
    setCurrentPage(1);
  }, [searchName, chuyenNganhs]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredChuyenNganhs.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(filteredChuyenNganhs.length / pageSize);

  // Thêm chuyên ngành dinh dưỡng
  const handleAddChuyenNganh = async (values) => {
    try {
      setLoading(true);
      
      let hinh_anh = null;
      const fileList = values.hinh_anh || [];
      const file = fileList.length > 0 ? fileList[0].originFileObj : null;
      
      if (file) {
        const uploadRes = await uploadService.uploadImage(file, "ChuyenNganhDinhDuong");
        hinh_anh = uploadRes?.data?.imageUrl || null;
      }

      const data = {
        ten_chuyen_nganh: values.ten_chuyen_nganh,
        mo_ta: values.mo_ta,
        hinh_anh: hinh_anh,
        doi_tuong_phuc_vu: values.doi_tuong_phuc_vu,
        thoi_gian_hoat_dong: values.thoi_gian_hoat_dong,
      };

      await apiChuyenGiaDinhDuong.createChuyenNganh(data);
      message.success("Thêm chuyên ngành dinh dưỡng thành công!");
      setIsModalOpen(false);
      form.resetFields();
      fetchChuyenNganhs();
    } catch (error) {
      console.error("Lỗi khi thêm chuyên ngành dinh dưỡng:", error);
      message.error(error?.response?.data?.message || "Không thể thêm chuyên ngành dinh dưỡng!");
    } finally {
      setLoading(false);
    }
  };

  // Sửa chuyên ngành dinh dưỡng
  const handleEditClick = (record) => {
    setEditingChuyenNganh(record);
    
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
      ten_chuyen_nganh: record.ten_chuyen_nganh,
      mo_ta: record.mo_ta,
      hinh_anh: initialFileList,
      doi_tuong_phuc_vu: record.doi_tuong_phuc_vu,
      thoi_gian_hoat_dong: record.thoi_gian_hoat_dong,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateChuyenNganh = async (values) => {
    try {
      setLoading(true);
      
      let hinh_anh = editingChuyenNganh.hinh_anh;
      const fileList = values.hinh_anh || [];
      const newFile = fileList.find(f => f.originFileObj)?.originFileObj;
      
      if (newFile) {
        const uploadRes = await uploadService.uploadImage(newFile, "ChuyenNganhDinhDuong");
        hinh_anh = uploadRes?.data?.imageUrl || hinh_anh;
      }

      const data = {
        ten_chuyen_nganh: values.ten_chuyen_nganh,
        mo_ta: values.mo_ta,
        hinh_anh: hinh_anh,
        doi_tuong_phuc_vu: values.doi_tuong_phuc_vu,
        thoi_gian_hoat_dong: values.thoi_gian_hoat_dong,
      };

      await apiChuyenGiaDinhDuong.updateChuyenNganh(editingChuyenNganh.id_chuyen_nganh, data);
      message.success("Cập nhật chuyên ngành dinh dưỡng thành công!");
      setIsEditModalOpen(false);
      fetchChuyenNganhs();
    } catch (error) {
      console.error("Lỗi khi cập nhật chuyên ngành dinh dưỡng:", error);
      message.error(error?.response?.data?.message || "Không thể cập nhật chuyên ngành dinh dưỡng!");
    } finally {
      setLoading(false);
    }
  };

  // Xóa chuyên ngành dinh dưỡng
  const handleDelete = async (id_chuyen_nganh) => {
    try {
      await apiChuyenGiaDinhDuong.deleteChuyenNganh(id_chuyen_nganh);
      message.success("Đã xóa chuyên ngành dinh dưỡng!");
      fetchChuyenNganhs();
    } catch (error) {
      console.error("Lỗi khi xóa chuyên ngành dinh dưỡng:", error);
      message.error("Không thể xóa chuyên ngành dinh dưỡng!");
    }
  };

  // Cột bảng
  const columns = [
    {
      title: "TÊN CHUYÊN NGÀNH",
      dataIndex: "ten_chuyen_nganh",
      key: "ten_chuyen_nganh",
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
      title: "ĐỐI TƯỢNG PHỤC VỤ",
      dataIndex: "doi_tuong_phuc_vu",
      key: "doi_tuong_phuc_vu",
      render: (text) => text || "Không",
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
            alt="Hình ảnh chuyên ngành"
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
            title="Bạn có chắc muốn xóa chuyên ngành dinh dưỡng này?"
            onConfirm={() => handleDelete(record.id_chuyen_nganh)}
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
    <div className="admin-chuyennganh-container">
      <Card className="shadow-card">
        <div className="header-section">
          <Title level={3} className="page-title">
            🥗 Quản lý Chuyên ngành Dinh dưỡng
          </Title>
          <Text type="secondary">
            Xem, thêm, lọc và quản lý các chuyên ngành dinh dưỡng trong hệ thống
          </Text>
        </div>

        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm theo tên chuyên ngành..."
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
                Thêm chuyên ngành
              </Button>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={currentPageData}
          rowKey="id_chuyen_nganh"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredChuyenNganhs.length,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} chuyên ngành`,
          }}
        />
      </Card>

      {/* Modal thêm chuyên ngành */}
      <Modal
        title="Thêm chuyên ngành dinh dưỡng mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddChuyenNganh}>
          <Form.Item
            name="ten_chuyen_nganh"
            label="Tên chuyên ngành"
            rules={[{ required: true, message: "Vui lòng nhập tên chuyên ngành" }]}
          >
            <Input placeholder="Nhập tên chuyên ngành" />
          </Form.Item>
          <Form.Item name="mo_ta" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả chuyên ngành" />
          </Form.Item>
          <Form.Item name="doi_tuong_phuc_vu" label="Đối tượng phục vụ">
            <Input placeholder="Nhập đối tượng phục vụ" />
          </Form.Item>
          <Form.Item name="thoi_gian_hoat_dong" label="Thời gian hoạt động">
            <Input placeholder="VD: Thứ 2 - Thứ 7: 8h00 - 17h00" />
          </Form.Item>
          <Form.Item
            name="hinh_anh"
            label="Hình ảnh"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="hinh_anh"
              listType="picture-card"
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
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

      {/* Modal sửa chuyên ngành */}
      <Modal
        title="Sửa chuyên ngành dinh dưỡng"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateChuyenNganh}>
          <Form.Item
            name="ten_chuyen_nganh"
            label="Tên chuyên ngành"
            rules={[{ required: true, message: "Vui lòng nhập tên chuyên ngành" }]}
          >
            <Input placeholder="Nhập tên chuyên ngành" />
          </Form.Item>
          <Form.Item name="mo_ta" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả chuyên ngành" />
          </Form.Item>
          <Form.Item name="doi_tuong_phuc_vu" label="Đối tượng phục vụ">
            <Input placeholder="Nhập đối tượng phục vụ" />
          </Form.Item>
          <Form.Item name="thoi_gian_hoat_dong" label="Thời gian hoạt động">
            <Input placeholder="VD: Thứ 2 - Thứ 7: 8h00 - 17h00" />
          </Form.Item>
          <Form.Item
            name="hinh_anh"
            label="Hình ảnh"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="hinh_anh"
              listType="picture-card"
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
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

export default AdminChuyenNganhDinhDuong;

