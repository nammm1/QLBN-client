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
  Select,
  DatePicker,
  Tag,
  Modal,
  Descriptions,
  message,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import apiHoaDon from "../../../api/HoaDon";
import dayjs from "dayjs";
import "./AdminHoaDon.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminHoaDon = () => {
  const [hoaDons, setHoaDons] = useState([]);
  const [filteredHoaDons, setFilteredHoaDons] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTrangThai, setSelectedTrangThai] = useState(null);
  const [selectedPhuongThuc, setSelectedPhuongThuc] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHoaDon, setSelectedHoaDon] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  // Lấy danh sách hóa đơn
  const fetchHoaDons = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedTrangThai) params.trang_thai = selectedTrangThai;
      if (selectedPhuongThuc) params.phuong_thuc_thanh_toan = selectedPhuongThuc;
      if (dateRange && dateRange.length === 2) {
        params.tu_ngay = dateRange[0].format('YYYY-MM-DD');
        params.den_ngay = dateRange[1].format('YYYY-MM-DD');
      }
      if (searchText) params.search = searchText;

      const res = await apiHoaDon.search(params);
      const data = res.data || res;
      setHoaDons(Array.isArray(data) ? data : []);
      setFilteredHoaDons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hóa đơn:", error);
      message.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoaDons();
  }, [selectedTrangThai, selectedPhuongThuc, dateRange, searchText]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredHoaDons.slice(
    startIndex,
    startIndex + pageSize
  );

  // Xem chi tiết hóa đơn
  const handleViewDetail = async (id_hoa_don) => {
    try {
      const res = await apiHoaDon.getById(id_hoa_don);
      setSelectedHoaDon(res.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
      message.error("Không thể tải chi tiết hóa đơn");
    }
  };

  // Xóa hóa đơn
  const handleDelete = async (id_hoa_don) => {
    try {
      await apiHoaDon.delete(id_hoa_don);
      message.success("Đã xóa hóa đơn!");
      fetchHoaDons();
    } catch (error) {
      console.error("Lỗi khi xóa hóa đơn:", error);
      message.error("Không thể xóa hóa đơn!");
    }
  };

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Cột bảng
  const columns = [
    {
      title: "MÃ HÓA ĐƠN",
      dataIndex: "id_hoa_don",
      key: "id_hoa_don",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "BỆNH NHÂN",
      key: "benh_nhan",
      render: (_, record) => record.nguoi_dung?.ho_ten || "Không",
    },
    {
      title: "TỔNG TIỀN",
      dataIndex: "tong_tien",
      key: "tong_tien",
      render: (amount) => <Text strong style={{ color: "#1890ff" }}>{formatCurrency(amount)}</Text>,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status) => {
        const colorMap = {
          chua_thanh_toan: "orange",
          da_thanh_toan: "green",
          da_huy: "red",
        };
        const textMap = {
          chua_thanh_toan: "Chưa thanh toán",
          da_thanh_toan: "Đã thanh toán",
          da_huy: "Đã hủy",
        };
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: "PHƯƠNG THỨC",
      dataIndex: "phuong_thuc_thanh_toan",
      key: "phuong_thuc_thanh_toan",
      render: (method) => {
        const textMap = {
          tien_mat: "Tiền mặt",
          chuyen_khoan: "Chuyển khoản",
          the: "Thẻ",
          vi_dien_tu: "Ví điện tử",
        };
        return method ? textMap[method] || method : "Chưa chọn";
      },
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "thoi_gian_tao",
      key: "thoi_gian_tao",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "Không",
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() => handleViewDetail(record.id_hoa_don)}
          >
            Chi tiết
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa hóa đơn này?"
            onConfirm={() => handleDelete(record.id_hoa_don)}
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

  // Tính tổng doanh thu
  const totalRevenue = filteredHoaDons
    .filter(hd => hd.trang_thai === 'da_thanh_toan')
    .reduce((sum, hd) => sum + (parseFloat(hd.tong_tien) || 0), 0);

  return (
    <div className="admin-hoadon-container">
      <Card className="shadow-card">
        <div className="header-section">
          <Title level={3} className="page-title">
            💰 Quản lý Hóa đơn
          </Title>
          <Text type="secondary">
            Xem, tìm kiếm và quản lý tất cả hóa đơn trong hệ thống
          </Text>
        </div>

        <Card size="small" className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm theo mã, tên bệnh nhân..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
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
                <Option value="chua_thanh_toan">Chưa thanh toán</Option>
                <Option value="da_thanh_toan">Đã thanh toán</Option>
                <Option value="da_huy">Đã hủy</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Chọn phương thức"
                value={selectedPhuongThuc}
                onChange={setSelectedPhuongThuc}
                allowClear
                size="large"
                style={{ width: "100%" }}
              >
                <Option value="tien_mat">Tiền mặt</Option>
                <Option value="chuyen_khoan">Chuyển khoản</Option>
                <Option value="the">Thẻ</Option>
                <Option value="vi_dien_tu">Ví điện tử</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                size="large"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Text strong style={{ fontSize: 16 }}>
                Tổng doanh thu: <span style={{ color: "#1890ff" }}>{formatCurrency(totalRevenue)}</span>
              </Text>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={currentPageData}
          rowKey="id_hoa_don"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredHoaDons.length,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
        />
      </Card>

      {/* Modal chi tiết hóa đơn */}
      <Modal
        title="Chi tiết hóa đơn"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedHoaDon(null);
        }}
        footer={null}
        width={800}
      >
        {selectedHoaDon && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã hóa đơn" span={2}>
              {selectedHoaDon.id_hoa_don}
            </Descriptions.Item>
            <Descriptions.Item label="Bệnh nhân">
              {selectedHoaDon.nguoi_dung?.ho_ten || "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedHoaDon.nguoi_dung?.so_dien_thoai || "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền" span={2}>
              <Text strong style={{ color: "#1890ff", fontSize: 18 }}>
                {formatCurrency(selectedHoaDon.tong_tien)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedHoaDon.trang_thai === 'da_thanh_toan' ? 'green' : 'orange'}>
                {selectedHoaDon.trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedHoaDon.phuong_thuc_thanh_toan || "Chưa chọn"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={2}>
              {selectedHoaDon.thoi_gian_tao ? dayjs(selectedHoaDon.thoi_gian_tao).format("DD/MM/YYYY HH:mm") : "Không"}
            </Descriptions.Item>
            {selectedHoaDon.chi_tiet && selectedHoaDon.chi_tiet.length > 0 && (
              <Descriptions.Item label="Chi tiết dịch vụ" span={2}>
                <Table
                  dataSource={selectedHoaDon.chi_tiet}
                  rowKey="id_chi_tiet"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: "Dịch vụ", dataIndex: ["dich_vu", "ten_dich_vu"], key: "ten_dich_vu" },
                    { title: "Số lượng", dataIndex: "so_luong", key: "so_luong" },
                    { title: "Đơn giá", dataIndex: "don_gia", key: "don_gia", render: (price) => formatCurrency(price) },
                    { title: "Thành tiền", dataIndex: "thanh_tien", key: "thanh_tien", render: (price) => formatCurrency(price) },
                  ]}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminHoaDon;

