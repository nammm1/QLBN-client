import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Dropdown, List, Empty, Button, Space, Typography, Divider } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import apiThongBao from "../../api/ThongBao";
import "./NotificationDropdown.css";

const { Text } = Typography;

const NotificationDropdown = ({ userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const res = await apiThongBao.getByUser(userId, { limit: 10 });
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const res = await apiThongBao.getUnreadCount(userId);
      if (res.success) {
        setUnreadCount(res.data?.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id_thong_bao) => {
    try {
      await apiThongBao.markAsRead(id_thong_bao);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Get user role from localStorage
  const getUserRole = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return userInfo?.user?.vai_tro || "";
  };

  // Get navigation path based on notification type and user role
  const getNavigationPath = (loai_thong_bao, id_lien_ket) => {
    const role = getUserRole();
    
    switch (loai_thong_bao) {
      case 'chat':
        // Navigate to chat with conversation ID
        if (id_lien_ket) {
          switch (role) {
            case 'bac_si':
              return `/doctor/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
            case 'nhan_vien_phan_cong':
              return `/staff/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
            case 'nhan_vien_quay':
              return `/receptionist/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
            case 'chuyen_gia_dinh_duong':
              return `/nutritionist/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
            case 'benh_nhan':
              return `/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
            default:
              return `/chat?id_cuoc_tro_chuyen=${id_lien_ket}`;
          }
        } else {
          // Navigate to general chat page
          switch (role) {
            case 'bac_si':
              return '/doctor/chat';
            case 'nhan_vien_phan_cong':
              return '/staff/chat';
            case 'nhan_vien_quay':
              return '/receptionist/chat';
            case 'chuyen_gia_dinh_duong':
              return '/nutritionist/chat';
            case 'benh_nhan':
              return '/chat';
            default:
              return '/chat';
          }
        }
      
      case 'cuoc_hen':
        // Navigate to appointment detail
        if (id_lien_ket) {
          switch (role) {
            case 'bac_si':
              return `/doctor/appointment/${id_lien_ket}`;
            case 'chuyen_gia_dinh_duong':
              return `/nutritionist/appointment/${id_lien_ket}`;
            case 'nhan_vien_quay':
              return `/receptionist/appointments`;
            default:
              return '/appointments';
          }
        } else {
          switch (role) {
            case 'bac_si':
              return '/doctor/appointments';
            case 'chuyen_gia_dinh_duong':
              return '/nutritionist/appointments';
            case 'nhan_vien_quay':
              return '/receptionist/appointments';
            default:
              return '/appointments';
          }
        }
      
      case 'hoa_don':
        // Navigate to billing/invoice page
        switch (role) {
          case 'nhan_vien_quay':
            return '/receptionist/billing';
          default:
            return '/billing';
        }
      
      default:
        return null;
    }
  };

  // Handle notification click with navigation
  const handleNotificationClick = async (notification) => {
    // Mark as read first
    await handleMarkAsRead(notification.id_thong_bao);
    
    // Navigate to appropriate page
    const path = getNavigationPath(notification.loai_thong_bao, notification.id_lien_ket);
    if (path) {
      navigate(path);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiThongBao.markAllAsRead(userId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const handleDelete = async (id_thong_bao) => {
    try {
      await apiThongBao.delete(id_thong_bao);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId]);

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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const dropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={handleMarkAllAsRead}
            icon={<CheckOutlined />}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <List
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: <Empty description="Không có thông báo" /> }}
        renderItem={(item) => (
          <List.Item
            className={`notification-item ${item.trang_thai === 'chua_doc' ? 'unread' : ''} ${item.id_lien_ket ? 'clickable' : ''}`}
            onClick={() => handleNotificationClick(item)}
            style={{ cursor: item.id_lien_ket ? 'pointer' : 'default' }}
          >
            <List.Item.Meta
              avatar={
                <div className="notification-icon">
                  {getNotificationIcon(item.loai_thong_bao)}
                </div>
              }
              title={
                <Space>
                  <Text strong={item.trang_thai === 'chua_doc'}>
                    {item.tieu_de}
                  </Text>
                  {item.trang_thai === 'chua_doc' && (
                    <Badge status="processing" />
                  )}
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {item.noi_dung}
                  </Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatTime(item.thoi_gian_tao)}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id_thong_bao);
                      }}
                      style={{ float: 'right' }}
                    />
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div className="notification-footer">
            <Button 
              type="link" 
              block 
              onClick={() => {
                const role = getUserRole();
                if (role === 'benh_nhan') {
                  navigate('/notifications');
                } else {
                  window.location.href = '/notifications';
                }
              }}
            >
              Xem tất cả thông báo
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="notification-dropdown-overlay"
      onOpenChange={(open) => {
        if (open) {
          fetchNotifications();
          fetchUnreadCount();
        }
      }}
    >
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '18px' }} />}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;

