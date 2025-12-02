import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Typography,
  Descriptions,
  Divider,
  Empty,
  Tabs,
  Badge,
} from "antd";
import {
  DollarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import apiHoaDon from "../../../api/HoaDon";
import apiChiTietHoaDon from "../../../api/ChiTietHoaDon";
import moment from "moment";
import apiPayment from "../../../api/Payment";
import "./Invoices.css";

const { Title, Text } = Typography;
const STATUS_CONFIGS = {
  chua_thanh_toan: { color: "warning", text: "Chưa thanh toán", icon: <ClockCircleOutlined /> },
  da_thanh_toan: { color: "success", text: "Đã thanh toán", icon: <CheckCircleOutlined /> },
  da_huy: { color: "error", text: "Đã hủy", icon: <CloseCircleOutlined /> },
  dang_hoan_tien: {
    color: "processing",
    text: "Đang hoàn tiền",
    icon: <SyncOutlined spin />,
  },
  da_hoan_tien: { color: "cyan", text: "Đã hoàn tiền", icon: <CheckCircleOutlined /> },
  hoan_that_bai: { color: "error", text: "Hoàn tiền thất bại", icon: <CloseCircleOutlined /> },
};

const renderStatusTag = (status) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.chua_thanh_toan;
  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

const Invoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("chua_thanh_toan");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [allInvoices, setAllInvoices] = useState([]);

  const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userInfo = savedUserInfo?.user || savedUserInfo;
  const userId = userInfo?.id_nguoi_dung;

  const closePaymentModal = () => {
    setIsPaymentModalVisible(false);
  };

  const openPaymentModal = (invoice) => {
    if (invoice) {
      setSelectedInvoice(invoice);
    }
    setIsPaymentModalVisible(true);
  };

  // Kiểm tra đăng nhập
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true" || !userId) {
      message.warning("Vui lòng đăng nhập để xem hóa đơn");
      navigate("/login");
      return;
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Lấy id_benh_nhan từ userInfo (có thể là id_benh_nhan hoặc id_nguoi_dung)
      const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userInfo = savedUserInfo?.user || savedUserInfo;
      const idBenhNhan = userInfo?.id_benh_nhan || userId;

      // Lấy hóa đơn theo id_benh_nhan (một lần, rồi lọc trên FE)
      const response = await apiHoaDon.search({ id_benh_nhan: idBenhNhan });
      const invoiceData = response?.data || response || [];
      const all = Array.isArray(invoiceData) ? invoiceData : [];

      setAllInvoices(all);
      // Filter ban đầu theo tab hiện tại
      setInvoices(
        activeTab === "all"
          ? all
          : all.filter((inv) => inv.trang_thai === activeTab)
      );
    } catch (error) {
      message.error("Không thể tải dữ liệu hóa đơn");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.paymentSuccess) {
      return;
    }

    const orderId = location.state.orderId;
    message.success(
      orderId ? `Thanh toán Momo cho hóa đơn ${orderId} thành công!` : "Thanh toán Momo thành công!"
    );
    fetchData();
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.pathname, navigate]);

  const handleViewDetail = async (record) => {
    try {
      setSelectedInvoice(record);
      try {
        const response = await apiChiTietHoaDon.getByHoaDon(record.id_hoa_don);
        const details = response?.data || response || [];
        setInvoiceDetails(Array.isArray(details) ? details : []);
      } catch (error) {
        // Nếu không có chi tiết (404) thì vẫn cho mở modal, chỉ không có bảng dịch vụ
        if (error?.response?.status === 404) {
          setInvoiceDetails([]);
        } else {
          throw error;
        }
      }
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error("Không thể tải chi tiết hóa đơn");
      console.error(error);
    }
  };

  const handlePayment = (record) => {
    openPaymentModal(record);
  };

  // Tạo payment URL cho Momo
  const handleCreateMomoPayment = async () => {
    if (!selectedInvoice) return;
    
    setPaymentLoading(true);
    try {
      const response = await apiPayment.createMomoPayment(selectedInvoice.id_hoa_don, {
        source: "patient",
        redirectPath: "/invoices",
      });
      if (response.success && response.data.paymentUrl) {
        message.success("Đang chuyển đến trang thanh toán Momo...");
        window.location.href = response.data.paymentUrl;
      } else {
        message.error(response.message || "Không thể tạo payment URL");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Đã sao chép!");
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "id_hoa_don",
      key: "id_hoa_don",
      width: 150,
      render: (id) => (
        <Text strong style={{ color: "#f39c12", fontFamily: "monospace" }}>
          {id?.substring(0, 12)}...
        </Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "thoi_gian_tao",
      key: "thoi_gian_tao",
      width: 130,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      width: 150,
      render: (amount) => (
        <Text strong style={{ color: "#f39c12", fontSize: "15px" }}>
          {parseFloat(amount || 0).toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 150,
      render: (status) => renderStatusTag(status),
    },
    {
      title: "Phương thức",
      dataIndex: "phuong_thuc_thanh_toan",
      key: "phuong_thuc_thanh_toan",
      width: 150,
      render: (method) => {
        const methods = {
          tien_mat: "Tiền mặt",
          chuyen_khoan: "Chuyển khoản",
          momo: "Momo",
          vnpay: "VNPay",
          the: "Thẻ",
          vi_dien_tu: "Ví điện tử",
        };
        return method ? (
          <Tag color="blue">{methods[method] || method}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ color: "#1890ff" }}
            title="Xem chi tiết"
          />
          {record.trang_thai === "chua_thanh_toan" && (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(record)}
              style={{ background: "#52c41a", border: "none" }}
              title="Thanh toán"
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getTabCount = (status) => {
    return allInvoices.filter((inv) => inv.trang_thai === status).length;
  };

  const renderTabTable = (emptyMessage) => (
    <Table
      columns={columns}
      dataSource={invoices}
      loading={loading}
      rowKey="id_hoa_don"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} hóa đơn`,
      }}
      locale={{
        emptyText: <Empty description={emptyMessage} />,
      }}
    />
  );

  // Re-filter khi đổi tab hoặc khi allInvoices thay đổi
  useEffect(() => {
    if (!allInvoices || !Array.isArray(allInvoices)) {
      setInvoices([]);
      return;
    }
    if (activeTab === "all") {
      setInvoices(allInvoices);
    } else {
      setInvoices(allInvoices.filter((inv) => inv.trang_thai === activeTab));
    }
  }, [activeTab, allInvoices]);

  return (
    <div className="invoices-page">
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          💰 Hóa đơn của tôi
        </Title>
        <Text type="secondary">Xem và thanh toán hóa đơn khám chữa bệnh</Text>
      </div>

      <Card style={{ borderRadius: "12px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "chua_thanh_toan",
              label: (
                <Badge count={getTabCount("chua_thanh_toan")} offset={[10, 0]}>
                  <span>
                    <ClockCircleOutlined />
                    Chưa thanh toán
                  </span>
                </Badge>
              ),
              children: renderTabTable("Không có hóa đơn chưa thanh toán"),
            },
            {
              key: "da_thanh_toan",
              label: (
                <span>
                  <CheckCircleOutlined />
                  Đã thanh toán ({getTabCount("da_thanh_toan")})
                </span>
              ),
              children: renderTabTable("Không có hóa đơn đã thanh toán"),
            },
            {
              key: "dang_hoan_tien",
              label: (
                <span>
                  <SyncOutlined spin />
                  Đang hoàn tiền ({getTabCount("dang_hoan_tien")})
                </span>
              ),
              children: renderTabTable("Không có hóa đơn đang hoàn tiền"),
            },
            {
              key: "da_hoan_tien",
              label: (
                <span>
                  <CheckCircleOutlined />
                  Hoàn tiền xong ({getTabCount("da_hoan_tien")})
                </span>
              ),
              children: renderTabTable("Không có hóa đơn đã hoàn tiền"),
            },
            {
              key: "hoan_that_bai",
              label: (
                <span>
                  <CloseCircleOutlined />
                  Hoàn tiền thất bại ({getTabCount("hoan_that_bai")})
                </span>
              ),
              children: renderTabTable("Không có hóa đơn bị lỗi hoàn tiền"),
            },
            {
              key: "all",
              label: (
                <span>
                  <EyeOutlined />
                  Tất cả ({allInvoices.length})
                </span>
              ),
              children: renderTabTable("Không có hóa đơn nào"),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <EyeOutlined style={{ marginRight: "8px", color: "#f39c12" }} />
            Chi tiết hóa đơn
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedInvoice?.trang_thai === "chua_thanh_toan" && (
            <Button
              key="payment"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => openPaymentModal(selectedInvoice)}
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                border: "none",
              }}
            >
              Thanh toán
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã hóa đơn" span={2}>
                <Text strong style={{ fontFamily: "monospace" }}>
                  {selectedInvoice.id_hoa_don}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedInvoice.thoi_gian_tao || selectedInvoice.ngay_tao).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {renderStatusTag(selectedInvoice.trang_thai)}
              </Descriptions.Item>
              {selectedInvoice.phuong_thuc_thanh_toan && (
                <Descriptions.Item label="Phương thức thanh toán" span={2}>
                  {selectedInvoice.phuong_thuc_thanh_toan === "tien_mat"
                    ? "Tiền mặt"
                    : selectedInvoice.phuong_thuc_thanh_toan === "chuyen_khoan"
                    ? "Chuyển khoản"
                    : selectedInvoice.phuong_thuc_thanh_toan === "the"
                    ? "Thẻ"
                    : "Ví điện tử"}
                </Descriptions.Item>
              )}
              {selectedInvoice.thoi_gian_thanh_toan && (
                <Descriptions.Item label="Ngày thanh toán" span={2}>
                  {moment(selectedInvoice.thoi_gian_thanh_toan).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Chi tiết dịch vụ</Title>
            {invoiceDetails.length > 0 ? (
              <Table
                dataSource={invoiceDetails}
                rowKey="id_chi_tiet"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Dịch vụ",
                    key: "ten_dich_vu",
                    render: (_, record) => record.dich_vu?.ten_dich_vu || "N/A",
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "so_luong",
                    key: "so_luong",
                    align: "center",
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "don_gia",
                    key: "don_gia",
                    align: "right",
                    render: (price) => `${parseFloat(price || 0).toLocaleString("vi-VN")} đ`,
                  },
                  {
                    title: "Thành tiền",
                    key: "thanh_tien",
                    align: "right",
                    render: (_, record) => {
                      const thanhTien =
                        parseFloat(record.don_gia || 0) * parseFloat(record.so_luong || 0);
                      return (
                        <Text strong style={{ color: "#f39c12" }}>
                          {thanhTien.toLocaleString("vi-VN")} đ
                        </Text>
                      );
                    },
                  },
                ]}
              />
            ) : (
              <Empty description="Không có chi tiết dịch vụ" />
            )}

            <Divider />

            <div style={{ textAlign: "right" }}>
              <Space direction="vertical" style={{ width: "300px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Tổng tiền:</Text>
                  <Text strong style={{ fontSize: "20px", color: "#f39c12" }}>
                    {parseFloat(selectedInvoice.tong_tien || 0).toLocaleString("vi-VN")} đ
                  </Text>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            <DollarOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
            Thanh toán hóa đơn
          </span>
        }
        open={isPaymentModalVisible}
        onCancel={closePaymentModal}
        footer={null}
        width={520}
      >
        {selectedInvoice ? (
          <>
            <Card
              size="small"
              style={{
                backgroundColor: "#f9f9f9",
                marginBottom: "24px",
                borderRadius: "8px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Tổng tiền cần thanh toán</Text>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#f39c12",
                    margin: "12px 0",
                  }}
                >
                  {parseFloat(selectedInvoice?.tong_tien || 0).toLocaleString("vi-VN")} đ
                </div>
                <Text type="secondary">
                  Mã hóa đơn:{" "}
                  <Text strong style={{ fontFamily: "monospace" }}>
                    {selectedInvoice?.id_hoa_don}
                  </Text>
                </Text>
              </div>
            </Card>

            <Card
              size="small"
              style={{
                backgroundColor: "#fff0f6",
                border: "2px solid #eb2f96",
                marginBottom: "16px",
                borderRadius: "8px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Title level={5} style={{ color: "#eb2f96", marginBottom: "12px" }}>
                  💜 Thanh toán qua Momo
                </Title>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Số tiền: </Text>
                  <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#f39c12" }}>
                    {parseFloat(selectedInvoice?.tong_tien || 0).toLocaleString("vi-VN")} đ
                  </Text>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Mã hóa đơn: </Text>
                  <Text
                    copyable={{
                      text: selectedInvoice?.id_hoa_don,
                      tooltips: ["Sao chép", "Đã sao chép"],
                    }}
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#eb2f96",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedInvoice?.id_hoa_don}
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  loading={paymentLoading}
                  onClick={handleCreateMomoPayment}
                  style={{
                    backgroundColor: "#eb2f96",
                    borderColor: "#eb2f96",
                    height: "50px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    width: "100%",
                    marginTop: "16px",
                  }}
                  icon={<DollarOutlined />}
                >
                  Thanh toán qua Momo
                </Button>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                  Bạn sẽ được chuyển đến trang thanh toán Momo và tự động quay lại trang Hóa đơn sau khi hoàn tất.
                </div>
              </div>
            </Card>

            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                ⚠️ Nếu gặp sự cố với cổng thanh toán, vui lòng thử lại sau vài phút hoặc liên hệ nhân viên hỗ trợ.
              </Text>
            </Space>
          </>
        ) : (
          <Empty description="Chưa chọn hóa đơn để thanh toán" />
        )}
      </Modal>
    </div>
  );
};

export default Invoices;

