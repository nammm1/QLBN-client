import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, List, Empty, Button, Space, Typography, Tag, Badge, message, Spin, Divider, Select } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import apiThongBao from "../../api/ThongBao";
import "./PatientNotifications.css";

const { Title, Text } = Typography;
const { Option } = Select;

const PatientNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userInfo = savedUserInfo?.user || savedUserInfo;
  const userId = userInfo?.id_nguoi_dung;

  // Kiểm tra đăng nhập
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true" || !userId) {
      message.warning("Vui lòng đăng nhập để xem thông báo");
      navigate("/login");
    }
  }, [userId, navigate]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const options = {};
      if (filter === "unread") {
        options.trang_thai = "chua_doc";
      } else if (filter === "read") {
        options.trang_thai = "da_doc";
      }
      
      const res = await apiThongBao.getByUser(userId, options);
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id_thong_bao) => {
    try {
      await apiThongBao.markAsRead(id_thong_bao);
      await fetchNotifications();
      message.success("Đã đánh dấu đã đọc");
    } catch (error) {
      console.error("Error marking as read:", error);
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiThongBao.markAllAsRead(userId);
      await fetchNotifications();
      message.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
      message.error("Không thể đánh dấu tất cả đã đọc");
    }
  };

  // Delete notification
  const handleDelete = async (id_thong_bao) => {
    try {
      await apiThongBao.delete(id_thong_bao);
      await fetchNotifications();
      message.success("Đã xóa thông báo");
    } catch (error) {
      console.error("Error deleting notification:", error);
      message.error("Không thể xóa thông báo");
    }
  };

  // Get navigation path based on notification type
  const getNavigationPath = (loai_thong_bao, id_lien_ket) => {
    switch (loai_thong_bao) {
      case 'chat':
        if (id_lien_ket) {
          return `/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
        }
        return '/chat';
      case 'cuoc_hen':
        if (id_lien_ket) {
          return `/appointments`;
        }
        return '/appointments';
      case 'hoa_don':
        return '/appointments';
      default:
        return null;
    }
  };

  // Handle notification click with navigation
  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (notification.trang_thai === 'chua_doc') {
      await handleMarkAsRead(notification.id_thong_bao);
    }
    
    // Navigate to appropriate page
    const path = getNavigationPath(notification.loai_thong_bao, notification.id_lien_ket);
    if (path) {
      navigate(path);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId, filter]);

  const getNotificationIcon = (loai_thong_bao) => {
    switch (loai_thong_bao) {
      case 'cuoc_hen':
        return '📅';
      case 'hoa_don':
        return '💰';
      case 'chat':
        return '💬';
      case 'he_thong':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationTypeName = (loai_thong_bao) => {
    const typeMap = {
      cuoc_hen: "Cuộc hẹn",
      hoa_don: "Hóa đơn",
      chat: "Tin nhắn",
      he_thong: "Hệ thống",
      khac: "Khác"
    };
    return typeMap[loai_thong_bao] || loai_thong_bao;
  };

  const getNotificationTypeColor = (loai_thong_bao) => {
    const colorMap = {
      cuoc_hen: "blue",
      hoa_don: "green",
      chat: "purple",
      he_thong: "orange",
      khac: "default"
    };
    return colorMap[loai_thong_bao] || "default";
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => n.trang_thai === 'chua_doc').length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => 
        filter === 'unread' ? n.trang_thai === 'chua_doc' : n.trang_thai === 'da_doc'
      );

  return (
    <div className="patient-notifications-container">
      <Card className="notifications-header-card">
        <div className="notifications-header">
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BellOutlined /> Thông báo
            </Title>
            <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
              Quản lý tất cả thông báo của bạn
            </Text>
          </div>
          <Space>
            {unreadCount > 0 && (
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc ({unreadCount})
              </Button>
            )}
          </Space>
        </div>
      </Card>

      <Card className="notifications-content-card">
        <div className="notifications-filter">
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="unread">Chưa đọc ({notifications.filter(n => n.trang_thai === 'chua_doc').length})</Option>
            <Option value="read">Đã đọc ({notifications.filter(n => n.trang_thai === 'da_doc').length})</Option>
          </Select>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Spin spinning={loading}>
          {filteredNotifications.length === 0 ? (
            <Empty
              description={
                filter === 'unread' 
                  ? "Không có thông báo chưa đọc"
                  : filter === 'read'
                  ? "Không có thông báo đã đọc"
                  : "Không có thông báo nào"
              }
              style={{ marginTop: '50px' }}
            />
          ) : (
            <List
              dataSource={filteredNotifications}
              renderItem={(item) => (
                <List.Item
                  className={`notification-item ${item.trang_thai === 'chua_doc' ? 'unread' : ''} ${item.id_lien_ket ? 'clickable' : ''}`}
                  onClick={() => handleNotificationClick(item)}
                  style={{ cursor: item.id_lien_ket ? 'pointer' : 'default' }}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="notification-icon-large">
                        {getNotificationIcon(item.loai_thong_bao)}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong={item.trang_thai === 'chua_doc'}>
                          {item.tieu_de}
                        </Text>
                        <Tag color={getNotificationTypeColor(item.loai_thong_bao)}>
                          {getNotificationTypeName(item.loai_thong_bao)}
                        </Tag>
                        {item.trang_thai === 'chua_doc' && (
                          <Badge status="processing" />
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {item.noi_dung}
                        </Text>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatTime(item.thoi_gian_tao)}
                          </Text>
                          <Space>
                            {item.trang_thai === 'chua_doc' && (
                              <Button
                                type="link"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(item.id_thong_bao);
                                }}
                              >
                                Đánh dấu đã đọc
                              </Button>
                            )}
                            <Button
                              type="link"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id_thong_bao);
                              }}
                            >
                              Xóa
                            </Button>
                          </Space>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default PatientNotifications;

