import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  Tooltip,
  Modal,
  Form,
  message,
  Badge,
  Descriptions,
  Upload,
  Spin,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ExperimentOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import apiChiDinhXetNghiem from "../../../api/ChiDinhXetNghiem";
import apiKetQuaXetNghiem from "../../../api/KetQuaXetNghiem";
import apiUpload from "../../../api/Upload";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TestOrders = () => {
  const [testOrders, setTestOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // File mới được chọn nhưng chưa upload

  useEffect(() => {
    fetchTestOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchName, searchStatus, testOrders]);

  const fetchTestOrders = async () => {
    try {
      setLoading(true);
      const data = await apiChiDinhXetNghiem.getAll();
      setTestOrders(Array.isArray(data) ? data : []);
      setFilteredOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching test orders:", error);
      message.error("Không thể tải danh sách chỉ định xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...testOrders];

    if (searchName.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.nguoi_dung?.ho_ten?.toLowerCase().includes(searchName.toLowerCase()) ||
          order.ten_dich_vu?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchStatus) {
      filtered = filtered.filter((order) => order.trang_thai === searchStatus);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setViewModalVisible(true);
  };

  const handleInputResult = (order) => {
    setSelectedOrder(order);
    const fileUrl = order.ket_qua?.duong_dan_file_ket_qua || "";
    form.setFieldsValue({
      ket_qua_van_ban: order.ket_qua?.ket_qua_van_ban || "",
      duong_dan_file_ket_qua: fileUrl,
      trang_thai_ket_qua: order.ket_qua?.trang_thai_ket_qua || "",
      ghi_chu_ket_qua: order.ket_qua?.ghi_chu_ket_qua || "",
    });
    // Set file list nếu đã có file
    if (fileUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'File kết quả hiện tại',
          status: 'done',
          url: fileUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    setSelectedFile(null); // Reset file mới được chọn
    setResultModalVisible(true);
  };

  const handleSubmitResult = async (values) => {
    try {
      let fileUrl = values.duong_dan_file_ket_qua; // Giữ file cũ nếu không có file mới
      
      // Upload file mới nếu có
      if (selectedFile) {
        setUploading(true);
        try {
          const response = await apiUpload.uploadKetQuaXetNghiemFile(selectedFile);
          if (response.success) {
            fileUrl = response.data.fileUrl;
            // Cập nhật fileList với file đã upload thành công
            setFileList([
              {
                uid: selectedFile.uid,
                name: selectedFile.name,
                status: 'done',
                url: fileUrl,
              },
            ]);
            message.success("Upload file thành công");
          } else {
            message.error("Upload file thất bại");
            setUploading(false);
            return;
          }
        } catch (error) {
          message.error("Upload file thất bại: " + (error.response?.data?.message || error.message));
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }
      
      if (selectedOrder.ket_qua) {
        // Cập nhật kết quả đã có - không thay đổi trạng thái chỉ định
        await apiKetQuaXetNghiem.update(selectedOrder.id_chi_dinh, {
          ket_qua_van_ban: values.ket_qua_van_ban,
          duong_dan_file_ket_qua: fileUrl,
          trang_thai_ket_qua: values.trang_thai_ket_qua,
          ghi_chu_ket_qua: values.ghi_chu_ket_qua,
          thoi_gian_ket_luan: new Date(),
        });
        message.success("Cập nhật kết quả xét nghiệm thành công");
      } else {
        // Tạo kết quả mới
        await apiKetQuaXetNghiem.create({
          id_chi_dinh: selectedOrder.id_chi_dinh,
          ket_qua_van_ban: values.ket_qua_van_ban,
          duong_dan_file_ket_qua: fileUrl,
          trang_thai_ket_qua: values.trang_thai_ket_qua,
          ghi_chu_ket_qua: values.ghi_chu_ket_qua,
          thoi_gian_ket_luan: new Date(),
        });
        message.success("Nhập kết quả xét nghiệm thành công");
        
        // Cập nhật trạng thái chỉ định: cho_xu_ly → hoan_thanh
        // Chỉ cập nhật nếu trạng thái hiện tại là "cho_xu_ly"
        // Các trạng thái khác (hoan_thanh, da_huy) giữ nguyên
        if (selectedOrder.trang_thai === "cho_xu_ly") {
          await apiChiDinhXetNghiem.updateTrangThai(selectedOrder.id_chi_dinh, "hoan_thanh");
        }
      }

      setResultModalVisible(false);
      form.resetFields();
      setFileList([]);
      setSelectedFile(null);
      fetchTestOrders();
    } catch (error) {
      console.error("Error submitting result:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu kết quả");
    }
  };

  const getStatusTag = (trangThai) => {
    const statusMap = {
      cho_xu_ly: { color: "orange", text: "Chờ xử lý" },
      hoan_thanh: { color: "green", text: "Hoàn thành" },
      da_huy: { color: "red", text: "Đã hủy" },
    };
    const status = statusMap[trangThai] || { color: "default", text: trangThai };
    return <Tag color={status.color}>{status.text}</Tag>;
  };

  const columns = [
    {
      title: "Mã chỉ định",
      dataIndex: "id_chi_dinh",
      key: "id_chi_dinh",
      width: 150,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Bệnh nhân",
      key: "benh_nhan",
      render: (_, record) => (
        <div>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <Text strong>{record.nguoi_dung?.ho_ten || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <PhoneOutlined /> {record.nguoi_dung?.so_dien_thoai || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Dịch vụ xét nghiệm",
      dataIndex: "ten_dich_vu",
      key: "ten_dich_vu",
      render: (text) => (
        <Space>
          <ExperimentOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Bác sĩ chỉ định",
      key: "bac_si",
      render: (_, record) => (
        <Text>{record.bac_si_nguoi_dung?.ho_ten || "N/A"}</Text>
      ),
    },
    {
      title: "Thời gian chỉ định",
      dataIndex: "thoi_gian_chi_dinh",
      key: "thoi_gian_chi_dinh",
      render: (time) => (
        <Space>
          <CalendarOutlined />
          <Text>{moment(time).format("DD/MM/YYYY HH:mm")}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Kết quả",
      key: "ket_qua",
      render: (_, record) =>
        record.ket_qua ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã có kết quả
          </Tag>
        ) : (
          <Tag color="orange">Chưa có kết quả</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.trang_thai !== "da_huy" && (
            <Tooltip title={record.ket_qua ? "Cập nhật kết quả" : "Nhập kết quả"}>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleInputResult(record)}
                style={{ color: record.ket_qua ? "#1890ff" : "#52c41a" }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Quản lý chỉ định xét nghiệm
      </Title>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên bệnh nhân hoặc dịch vụ"
              prefix={<SearchOutlined />}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              value={searchStatus}
              onChange={setSearchStatus}
              allowClear
            >
              <Option value="cho_xu_ly">Chờ xử lý</Option>
              <Option value="hoan_thanh">Hoàn thành</Option>
              <Option value="da_huy">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={filterOrders}
              >
                Lọc
              </Button>
              <Button onClick={fetchTestOrders}>Làm mới</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id_chi_dinh"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredOrders.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} chỉ định`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* View Detail Modal */}
      <Modal
        title="Chi tiết chỉ định xét nghiệm"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          selectedOrder?.trang_thai !== "da_huy" && (
            <Button
              key="input"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setViewModalVisible(false);
                handleInputResult(selectedOrder);
              }}
            >
              {selectedOrder?.ket_qua ? "Cập nhật kết quả" : "Nhập kết quả"}
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã chỉ định" span={2}>
              <Text code>{selectedOrder.id_chi_dinh}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Bệnh nhân">
              {selectedOrder.nguoi_dung?.ho_ten || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedOrder.nguoi_dung?.so_dien_thoai || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Dịch vụ xét nghiệm" span={2}>
              <Text strong>{selectedOrder.ten_dich_vu}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ chỉ định">
              {selectedOrder.bac_si_nguoi_dung?.ho_ten || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian chỉ định">
              {moment(selectedOrder.thoi_gian_chi_dinh).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Yêu cầu/Ghi chú" span={2}>
              {selectedOrder.yeu_cau_ghi_chu || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              {getStatusTag(selectedOrder.trang_thai)}
            </Descriptions.Item>
            {selectedOrder.ket_qua && (
              <>
                <Descriptions.Item label="Kết quả văn bản" span={2}>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f5f5f5', 
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <Text>{selectedOrder.ket_qua.ket_qua_van_ban || "N/A"}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái kết quả" span={2}>
                  {selectedOrder.ket_qua.trang_thai_ket_qua ? (
                    <Tag color={
                      selectedOrder.ket_qua.trang_thai_ket_qua === 'binh_thuong' ? 'green' :
                      selectedOrder.ket_qua.trang_thai_ket_qua === 'bat_thuong' ? 'red' :
                      'orange'
                    }>
                      {selectedOrder.ket_qua.trang_thai_ket_qua === 'binh_thuong' ? 'Bình thường' :
                       selectedOrder.ket_qua.trang_thai_ket_qua === 'bat_thuong' ? 'Bất thường' :
                       'Cần xem lại'}
                    </Tag>
                  ) : "N/A"}
                </Descriptions.Item>
                {selectedOrder.ket_qua.ghi_chu_ket_qua && (
                  <Descriptions.Item label="Ghi chú kết quả" span={2}>
                    <Text type="secondary">{selectedOrder.ket_qua.ghi_chu_ket_qua}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="File kết quả" span={2}>
                  {selectedOrder.ket_qua.duong_dan_file_ket_qua ? (
                    <Button
                      type="link"
                      icon={<FileTextOutlined />}
                      onClick={() => window.open(selectedOrder.ket_qua.duong_dan_file_ket_qua, "_blank")}
                    >
                      Xem file
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian kết luận" span={2}>
                  {moment(selectedOrder.ket_qua.thoi_gian_ket_luan).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Input Result Modal */}
      <Modal
        title={selectedOrder?.ket_qua ? "Cập nhật kết quả xét nghiệm" : "Nhập kết quả xét nghiệm"}
        open={resultModalVisible}
        onCancel={() => {
          setResultModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        onOk={() => form.submit()}
        okText={selectedOrder?.ket_qua ? "Cập nhật kết quả" : "Lưu kết quả"}
        width={700}
      >
        {selectedOrder && (
          <div style={{ marginBottom: "16px" }}>
            <Text strong>Bệnh nhân: </Text>
            <Text>{selectedOrder.nguoi_dung?.ho_ten || "N/A"}</Text>
            <br />
            <Text strong>Dịch vụ: </Text>
            <Text>{selectedOrder.ten_dich_vu}</Text>
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitResult}
        >
          <Form.Item
            label="Kết quả xét nghiệm"
            name="ket_qua_van_ban"
            rules={[{ required: true, message: "Vui lòng nhập kết quả xét nghiệm" }]}
          >
            <TextArea
              rows={8}
              placeholder="Nhập kết quả xét nghiệm chi tiết..."
            />
          </Form.Item>
          <Form.Item
            label="Trạng thái kết quả"
            name="trang_thai_ket_qua"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái kết quả" }]}
          >
            <Select placeholder="Chọn trạng thái kết quả">
              <Option value="binh_thuong">Bình thường</Option>
              <Option value="bat_thuong">Bất thường</Option>
              <Option value="can_xem_lai">Cần xem lại</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Ghi chú kết quả"
            name="ghi_chu_ket_qua"
            extra="Ghi chú thêm về kết quả (nếu cần)"
          >
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú về kết quả xét nghiệm..."
            />
          </Form.Item>
          <Form.Item
            label="File kết quả xét nghiệm"
            name="duong_dan_file_ket_qua"
            extra="Chọn file kết quả xét nghiệm (PDF, Word, Excel, Image, v.v.). File sẽ được upload khi nhấn nút 'Cập nhật'."
          >
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                // Chỉ lưu file vào state, không upload ngay
                // File sẽ được upload khi nhấn nút "Cập nhật"
                setSelectedFile(file);
                // Xóa file cũ khỏi form value
                form.setFieldsValue({ duong_dan_file_ket_qua: "" });
                setFileList([
                  {
                    uid: file.uid,
                    name: file.name,
                    status: 'ready',
                  },
                ]);
                // Ngăn không cho upload tự động
                return false;
              }}
              onRemove={() => {
                setSelectedFile(null);
                // Khôi phục file cũ nếu có
                const oldFileUrl = selectedOrder?.ket_qua?.duong_dan_file_ket_qua || "";
                form.setFieldsValue({ duong_dan_file_ket_qua: oldFileUrl });
                if (oldFileUrl) {
                  setFileList([
                    {
                      uid: '-1',
                      name: 'File kết quả hiện tại',
                      status: 'done',
                      url: oldFileUrl,
                    },
                  ]);
                } else {
                  setFileList([]);
                }
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                Chọn file
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestOrders;

