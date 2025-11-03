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
  Popconfirm,
  Select,
  Tag,
  Badge,
  Divider,
  Tabs,
  App,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  SendOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiYeuCauEmail from "../../../api/YeuCauEmail";
import "./AdminEmails.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Cấu hình ReactQuill
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'script',
  'indent', 'direction',
  'color', 'background',
  'align',
  'link', 'image', 'video'
];

const AdminEmails = () => {
  const { message } = App.useApp();
  const [yeuCauEmails, setYeuCauEmails] = useState([]);
  const [filteredYeuCauEmails, setFilteredYeuCauEmails] = useState([]);
  const [lichSuGuiEmail, setLichSuGuiEmail] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [filterLoaiYeuCau, setFilterLoaiYeuCau] = useState("");
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [isSendBulkEmailModalOpen, setIsSendBulkEmailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendEmailForm] = Form.useForm();
  const [sendBulkEmailForm] = Form.useForm();
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Lấy danh sách yêu cầu email
  const fetchYeuCauEmails = async () => {
    try {
      setLoading(true);
      const res = await apiYeuCauEmail.getAll({
        trang_thai: filterTrangThai || undefined,
        loai_yeu_cau: filterLoaiYeuCau || undefined,
        page: currentPage,
        pageSize,
      });
      
      if (res.success) {
        setYeuCauEmails(res.data || []);
        setFilteredYeuCauEmails(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu email:", error);
      message.error("Không thể tải danh sách yêu cầu email!");
      setYeuCauEmails([]);
      setFilteredYeuCauEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch sử gửi email
  const fetchLichSuGuiEmail = async () => {
    try {
      const res = await apiYeuCauEmail.getLichSuGuiEmail({
        page: 1,
        pageSize: 50,
      });
      
      if (res.success) {
        setLichSuGuiEmail(res.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử gửi email:", error);
    }
  };

  useEffect(() => {
    fetchYeuCauEmails();
    fetchLichSuGuiEmail();
  }, [filterTrangThai, filterLoaiYeuCau, currentPage]);

  // Lọc theo tìm kiếm
  useEffect(() => {
    let filtered = yeuCauEmails;
    if (searchText.trim()) {
      filtered = yeuCauEmails.filter((item) =>
        item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ho_ten?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredYeuCauEmails(filtered);
  }, [searchText, yeuCauEmails]);

  // Cập nhật trạng thái
  const handleUpdateTrangThai = async (id_yeu_cau, trang_thai, ghi_chu) => {
    try {
      setLoading(true);
      await apiYeuCauEmail.updateTrangThai(id_yeu_cau, {
        trang_thai,
        ghi_chu,
      });
      message.success("Cập nhật trạng thái thành công!");
      fetchYeuCauEmails();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Không thể cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  // Xóa yêu cầu
  const handleDelete = async (id_yeu_cau) => {
    try {
      setLoading(true);
      await apiYeuCauEmail.delete(id_yeu_cau);
      message.success("Xóa yêu cầu thành công!");
      fetchYeuCauEmails();
    } catch (error) {
      console.error("Lỗi khi xóa yêu cầu:", error);
      message.error("Không thể xóa yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal gửi email
  const handleOpenSendEmailModal = (record) => {
    setSelectedYeuCau(record);
    sendEmailForm.setFieldsValue({
      id_yeu_cau: record?.id_yeu_cau,
      email_nguoi_nhan: record?.email,
      tieu_de: record?.loai_yeu_cau === 'dang_ky_nhan_tin_tuc' 
        ? 'Chào mừng đến với Bản tin Y tế!' 
        : 'Thông tin từ Hệ thống Quản lý Bệnh viện',
      noi_dung: '',
      loai_email: record?.loai_yeu_cau === 'dang_ky_nhan_tin_tuc' ? 'tin_tuc_y_te' : 'tu_van',
    });
    setIsSendEmailModalOpen(true);
  };

  // Gửi email đơn lẻ
  const handleSendEmail = async (values) => {
    try {
      setLoading(true);
      const res = await apiYeuCauEmail.sendEmail(values);
      if (res.success) {
        message.success("Gửi email thành công!");
        // Reset form và đóng modal
        sendEmailForm.resetFields();
        setIsSendEmailModalOpen(false);
        setSelectedYeuCau(null);
        // Refresh data
        await fetchYeuCauEmails();
        await fetchLichSuGuiEmail();
      } else {
        message.error(res.message || "Gửi email thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể gửi email!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gửi email hàng loạt
  const handleSendBulkEmail = async (values) => {
    try {
      setLoading(true);
      
      // Lấy danh sách email từ yêu cầu
      const emailList = values.emails.split('\n').map(e => e.trim()).filter(e => e);
      
      if (emailList.length === 0) {
        message.error("Vui lòng nhập ít nhất một email!");
        return;
      }

      const res = await apiYeuCauEmail.sendBulkEmail({
        emails: emailList,
        tieu_de: values.tieu_de,
        noi_dung: values.noi_dung,
        loai_email: values.loai_email,
      });

      if (res.success) {
        message.success(res.message || "Gửi email thành công!");
        // Reset form và đóng modal
        sendBulkEmailForm.resetFields();
        setIsSendBulkEmailModalOpen(false);
        // Refresh data
        await fetchLichSuGuiEmail();
      } else {
        message.error(res.message || "Gửi email thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi email hàng loạt:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể gửi email hàng loạt!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Định dạng trạng thái
  const getTrangThaiTag = (trang_thai) => {
    const statusConfig = {
      chua_xu_ly: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chưa xử lý' },
      dang_xu_ly: { color: 'blue', icon: <ClockCircleOutlined />, text: 'Đang xử lý' },
      da_xu_ly: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã xử lý' },
      da_huy: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
    };
    const config = statusConfig[trang_thai] || statusConfig.chua_xu_ly;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  // Định dạng loại yêu cầu
  const getLoaiYeuCauTag = (loai_yeu_cau) => {
    const typeConfig = {
      dang_ky_nhan_tin_tuc: { color: 'purple', text: 'Đăng ký nhận tin tức' },
      tu_van_y_te: { color: 'cyan', text: 'Tư vấn y tế' },
      thong_bao_hanh_chinh: { color: 'blue', text: 'Thông báo hành chính' },
      khac: { color: 'default', text: 'Khác' },
    };
    const config = typeConfig[loai_yeu_cau] || typeConfig.khac;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Định dạng thời gian
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cột bảng yêu cầu email
  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 150,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'so_dien_thoai',
      key: 'so_dien_thoai',
      width: 130,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'loai_yeu_cau',
      key: 'loai_yeu_cau',
      width: 150,
      render: (text) => getLoaiYeuCauTag(text),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      width: 120,
      render: (text) => getTrangThaiTag(text),
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'thoi_gian_tao',
      key: 'thoi_gian_tao',
      width: 150,
      render: (text) => formatTime(text),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={() => handleOpenSendEmailModal(record)}
          >
            Gửi email
          </Button>
          {record.trang_thai === 'chua_xu_ly' && (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateTrangThai(record.id_yeu_cau, 'da_xu_ly')}
            >
              Đã xử lý
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa yêu cầu này?"
            onConfirm={() => handleDelete(record.id_yeu_cau)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cột bảng lịch sử gửi email
  const historyColumns = [
    {
      title: 'Email người nhận',
      dataIndex: 'email_nguoi_nhan',
      key: 'email_nguoi_nhan',
      width: 200,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'tieu_de',
      key: 'tieu_de',
      width: 250,
    },
    {
      title: 'Loại email',
      dataIndex: 'loai_email',
      key: 'loai_email',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai_gui',
      key: 'trang_thai_gui',
      width: 120,
      render: (text) => {
        const statusConfig = {
          thanh_cong: { color: 'green', text: 'Thành công' },
          that_bai: { color: 'red', text: 'Thất bại' },
          cho_gui: { color: 'orange', text: 'Chờ gửi' },
          dang_gui: { color: 'blue', text: 'Đang gửi' },
        };
        const config = statusConfig[text] || statusConfig.cho_gui;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'thoi_gian_gui',
      key: 'thoi_gian_gui',
      width: 150,
      render: (text) => formatTime(text),
    },
  ];

  return (
    <div className="admin-emails-container">
      <Card className="admin-emails-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <MailOutlined /> Quản lý Email
            </Title>
            <Text type="secondary">
              Quản lý yêu cầu email và gửi email cho người dùng
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setIsSendBulkEmailModalOpen(true)}
              >
                Gửi email hàng loạt
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs 
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: <span><MailOutlined /> Yêu cầu Email</span>,
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                      <Input
                        placeholder="Tìm kiếm theo email hoặc tên..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Select
                        placeholder="Lọc theo trạng thái"
                        value={filterTrangThai || undefined}
                        onChange={setFilterTrangThai}
                        allowClear
                        style={{ width: '100%' }}
                      >
                        <Option value="chua_xu_ly">Chưa xử lý</Option>
                        <Option value="dang_xu_ly">Đang xử lý</Option>
                        <Option value="da_xu_ly">Đã xử lý</Option>
                        <Option value="da_huy">Đã hủy</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Select
                        placeholder="Lọc theo loại"
                        value={filterLoaiYeuCau || undefined}
                        onChange={setFilterLoaiYeuCau}
                        allowClear
                        style={{ width: '100%' }}
                      >
                        <Option value="dang_ky_nhan_tin_tuc">Đăng ký nhận tin tức</Option>
                        <Option value="tu_van_y_te">Tư vấn y tế</Option>
                        <Option value="thong_bao_hanh_chinh">Thông báo hành chính</Option>
                        <Option value="khac">Khác</Option>
                      </Select>
                    </Col>
                  </Row>

                  <Table
                    columns={columns}
                    dataSource={filteredYeuCauEmails}
                    rowKey="id_yeu_cau"
                    loading={loading}
                    pagination={{
                      current: currentPage,
                      pageSize,
                      total,
                      onChange: (page) => setCurrentPage(page),
                    }}
                    scroll={{ x: 1200 }}
                  />
                </Space>
              ),
            },
            {
              key: '2',
              label: <span><HistoryOutlined /> Lịch sử gửi Email</span>,
              children: (
                <Table
                  columns={historyColumns}
                  dataSource={lichSuGuiEmail}
                  rowKey="id_lich_su"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Modal gửi email đơn lẻ */}
      <Modal
        title="Gửi Email"
        open={isSendEmailModalOpen}
        onCancel={() => {
          setIsSendEmailModalOpen(false);
          sendEmailForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={sendEmailForm}
          layout="vertical"
          onFinish={handleSendEmail}
        >
          <Form.Item name="id_yeu_cau" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="email_nguoi_nhan"
            label="Email người nhận"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="tieu_de"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="noi_dung"
            label="Nội dung Email"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung!' },
              {
                validator: (_, value) => {
                  // Kiểm tra xem có nội dung thực sự không (không chỉ là thẻ HTML rỗng)
                  if (!value || value.replace(/<[^>]*>/g, '').trim() === '') {
                    return Promise.reject(new Error('Vui lòng nhập nội dung!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            getValueFromEvent={(value) => value}
          >
            <ReactQuill
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              placeholder="Nhập nội dung email (có thể format như Word)"
              style={{ minHeight: '200px', marginBottom: '50px', background: 'white' }}
            />
          </Form.Item>
          <Form.Item name="loai_email" hidden>
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi Email
              </Button>
              <Button onClick={() => {
                setIsSendEmailModalOpen(false);
                sendEmailForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal gửi email hàng loạt */}
      <Modal
        title="Gửi Email Hàng Loạt"
        open={isSendBulkEmailModalOpen}
        onCancel={() => {
          setIsSendBulkEmailModalOpen(false);
          sendBulkEmailForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={sendBulkEmailForm}
          layout="vertical"
          onFinish={handleSendBulkEmail}
        >
          <Form.Item
            name="emails"
            label="Danh sách Email (mỗi email một dòng)"
            rules={[{ required: true, message: 'Vui lòng nhập danh sách email!' }]}
          >
            <TextArea rows={8} placeholder="email1@example.com&#10;email2@example.com&#10;..." />
          </Form.Item>
          <Form.Item
            name="tieu_de"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="noi_dung"
            label="Nội dung Email"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung!' },
              {
                validator: (_, value) => {
                  // Kiểm tra xem có nội dung thực sự không (không chỉ là thẻ HTML rỗng)
                  if (!value || value.replace(/<[^>]*>/g, '').trim() === '') {
                    return Promise.reject(new Error('Vui lòng nhập nội dung!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            getValueFromEvent={(value) => value}
          >
            <ReactQuill
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              placeholder="Nhập nội dung email (có thể format như Word)"
              style={{ minHeight: '200px', marginBottom: '50px', background: 'white' }}
            />
          </Form.Item>
          <Form.Item
            name="loai_email"
            label="Loại email"
            initialValue="tin_tuc_y_te"
          >
            <Select>
              <Option value="tin_tuc_y_te">Tin tức y tế</Option>
              <Option value="tu_van">Tư vấn</Option>
              <Option value="thong_bao">Thông báo</Option>
              <Option value="khac">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi Email
              </Button>
              <Button onClick={() => {
                setIsSendBulkEmailModalOpen(false);
                sendBulkEmailForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminEmails;

