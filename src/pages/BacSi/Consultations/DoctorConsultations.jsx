import React, { useState } from "react";
import { Card, List, Avatar, Tag, Badge, Input, Button, Space, Typography } from "antd";
import { 
  MessageOutlined, 
  SearchOutlined, 
  FilterOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;

const DoctorConsultations = () => {
  const [searchText, setSearchText] = useState("");
  
  const conversations = [
    { 
      id: 1, 
      name: "Nguyễn Văn A", 
      lastMessage: "Bác sĩ ơi, tôi bị đau đầu kéo dài 3 ngày nay...", 
      time: "10:30 AM",
      unread: 2,
      status: "waiting",
      avatarColor: "#1890ff"
    },
    { 
      id: 2, 
      name: "Trần Thị B", 
      lastMessage: "Em cần tư vấn về đơn thuốc bác sĩ kê ạ", 
      time: "09:15 AM",
      unread: 0,
      status: "replied",
      avatarColor: "#52c41a"
    },
    { 
      id: 3, 
      name: "Lê Văn C", 
      lastMessage: "Cảm ơn bác sĩ, tôi đã đỡ hơn nhiều rồi ạ", 
      time: "Yesterday",
      unread: 0,
      status: "completed",
      avatarColor: "#fa8c16"
    },
    { 
      id: 4, 
      name: "Phạm Thị D", 
      lastMessage: "Bác sĩ có thể giải thích kỹ hơn về kết quả xét nghiệm không ạ?", 
      time: "Yesterday",
      unread: 1,
      status: "waiting",
      avatarColor: "#eb2f96"
    },
  ];

  const statusConfig = {
    waiting: { color: "orange", icon: <ClockCircleOutlined />, text: "Chờ phản hồi" },
    replied: { color: "blue", icon: <MessageOutlined />, text: "Đã phản hồi" },
    completed: { color: "green", icon: <CheckCircleOutlined />, text: "Hoàn thành" }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchText.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                <MessageOutlined style={{ marginRight: 8 }} />
                Tin Nhắn Tư Vấn
              </Title>
              <Badge count={conversations.filter(c => c.unread > 0).length} showZero={false} />
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm bệnh nhân..."
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button icon={<FilterOutlined />}>
                Lọc
              </Button>
            </Space>
          </div>
        }
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredConversations}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #f0f0f0',
                transition: 'all 0.3s ease',
                backgroundColor: item.unread > 0 ? '#f6ffed' : 'white'
              }}
              className="consultation-item"
            >
              <List.Item.Meta
                avatar={
                  <Badge count={item.unread} offset={[-5, 5]} size="small">
                    <Avatar 
                      size="large" 
                      style={{ 
                        backgroundColor: item.avatarColor,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      icon={<UserOutlined />}
                    />
                  </Badge>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Link 
                        to={`/doctor/consultation/${item.id}`}
                        style={{ 
                          fontWeight: item.unread > 0 ? '600' : '400',
                          color: item.unread > 0 ? '#1890ff' : '#262626'
                        }}
                      >
                        {item.name}
                      </Link>
                      <Tag 
                        color={statusConfig[item.status].color} 
                        icon={statusConfig[item.status].icon}
                        style={{ border: 'none', borderRadius: 12 }}
                      >
                        {statusConfig[item.status].text}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.time}
                    </Text>
                  </div>
                }
                description={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4
                  }}>
                    <Text 
                      style={{ 
                        color: item.unread > 0 ? '#000' : '#595959',
                        fontWeight: item.unread > 0 ? '500' : '400'
                      }}
                      ellipsis={{ tooltip: item.lastMessage }}
                    >
                      {item.lastMessage}
                    </Text>
                    {item.unread > 0 && (
                      <Button 
                        type="primary" 
                        size="small"
                        style={{ 
                          borderRadius: 12,
                          fontSize: '12px',
                          height: '24px',
                          padding: '0 8px'
                        }}
                      >
                        Phản hồi ngay
                      </Button>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <Text type="secondary">Chưa có tin nhắn tư vấn nào</Text>
              </div>
            )
          }}
        />
        
        {/* Thống kê nhanh */}
        <div style={{ 
          padding: '16px 24px', 
          background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space size="large">
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ color: '#ff4d4f' }}>
                {conversations.filter(c => c.status === 'waiting').length}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>Chờ phản hồi</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ color: '#1890ff' }}>
                {conversations.filter(c => c.unread > 0).length}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>Tin nhắn mới</Text>
            </div>
          </Space>
          <Button type="primary" size="large" style={{ borderRadius: 8 }}>
            <MessageOutlined />
            Tin nhắn mới
          </Button>
        </div>
      </Card>

      <style jsx>{`
        .consultation-item:hover {
          background-color: #f0f8ff !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default DoctorConsultations;