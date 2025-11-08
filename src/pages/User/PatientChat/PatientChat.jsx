import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout, List, Input, Button, Avatar, Empty, Badge, message, Upload, Typography, Space, Card, Tag, Skeleton, Alert } from "antd";

import {
  SendOutlined,
  PaperClipOutlined,
  UserOutlined,
  SearchOutlined,
  DeleteOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import apiChat from "../../../api/Chat";
import "./PatientChat.css";

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const PatientChat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showDeleteIcon, setShowDeleteIcon] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const longPressTimerRef = useRef({});
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isRestoringFromCacheRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userInfo = savedUserInfo?.user || savedUserInfo;

  // Kiểm tra user có phải bệnh nhân không
  const isPatient = userInfo?.vai_tro === "benh_nhan";

  // Kiểm tra đăng nhập
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin");
    if (loginStatus !== "true" || !isPatient) {
      message.warning("Vui lòng đăng nhập với tài khoản bệnh nhân");
      navigate("/login");
    }
  }, [isPatient, navigate]);

  // Tự động mở cuộc trò chuyện khi có id_cuoc_tro_chuyen param trong URL
  useEffect(() => {
    const conversationIdFromUrl = searchParams.get("id_cuoc_tro_chuyen");
    
    if (conversationIdFromUrl && !loading) {
      const timer = setTimeout(() => {
        handleAutoOpenConversationById(conversationIdFromUrl);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams.get("id_cuoc_tro_chuyen")]);

  // Lưu vị trí scroll trước khi unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messagesContainerRef.current && selectedConversation) {
        const scrollTop = messagesContainerRef.current.scrollTop;
        sessionStorage.setItem(
          `chat_scroll_${selectedConversation.id_cuoc_tro_chuyen}`,
          scrollTop.toString()
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedConversation]);

  // Lưu vị trí scroll khi scroll và cập nhật shouldAutoScrollRef
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !selectedConversation) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Kiểm tra nếu user đang ở gần cuối trang (trong vòng 150px)
      const isNearBottom = distanceFromBottom < 150;
      shouldAutoScrollRef.current = isNearBottom;
      
      // Lưu vị trí scroll
      sessionStorage.setItem(
        `chat_scroll_${selectedConversation.id_cuoc_tro_chuyen}`,
        scrollTop.toString()
      );
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedConversation, messages]);

  // Lấy danh sách cuộc trò chuyện và load dữ liệu mới từ server
  useEffect(() => {
    loadConversations();
    
    // Polling để cập nhật tin nhắn mới mỗi 3 giây
    const interval = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.id_cuoc_tro_chuyen, true);
      }
      loadConversations(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Auto scroll xuống tin nhắn mới nhất - ĐÃ TẮT
  // useEffect(() => {
  //   // Tắt auto-scroll hoàn toàn
  //   return;
  // }, [messages, selectedConversation]);

  const handleAutoOpenConversationById = async (id_cuoc_tro_chuyen) => {
    try {
      const existingConv = conversations.find(
        (conv) => conv.id_cuoc_tro_chuyen === id_cuoc_tro_chuyen
      );

      if (existingConv) {
        setSelectedConversation(existingConv);
        loadMessages(existingConv.id_cuoc_tro_chuyen);
        setSearchParams({});
      } else {
        await loadConversations();
        const timer = setTimeout(() => {
          const foundConv = conversations.find(
            (conv) => conv.id_cuoc_tro_chuyen === id_cuoc_tro_chuyen
          );
          if (foundConv) {
            setSelectedConversation(foundConv);
            loadMessages(foundConv.id_cuoc_tro_chuyen);
          } else {
            message.warning("Không tìm thấy cuộc trò chuyện");
          }
          setSearchParams({});
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Error opening conversation:", error);
      message.error("Không thể mở cuộc trò chuyện");
    }
  };

  const loadConversations = async (silent = false) => {
    try {
      if (!silent && conversations.length === 0) {
        setLoading(true);
        setIsInitialLoading(true);
      }
      const res = await apiChat.getConversations();
      if (res.success) {
        setConversations(res.data || []);
        setIsInitialLoading(false);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadMessages = async (id_cuoc_tro_chuyen, silent = false) => {
    try {
      if (!silent) {
        const savedMessages = sessionStorage.getItem(`chat_messages_${id_cuoc_tro_chuyen}`);
        if (!savedMessages) {
          setLoading(true);
        }
      }
      
      const res = await apiChat.getMessages(id_cuoc_tro_chuyen);
      if (res.success) {
        setMessages(res.data || []);
        await apiChat.markAsRead(id_cuoc_tro_chuyen);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Không tự động scroll khi chọn conversation
    // shouldAutoScrollRef.current = true;
    
    const savedMessages = sessionStorage.getItem(`chat_messages_${conversation.id_cuoc_tro_chuyen}`);
    if (savedMessages) {
      // Đang khôi phục từ cache, không auto-scroll
      isRestoringFromCacheRef.current = true;
      try {
        setMessages(JSON.parse(savedMessages));
        setTimeout(() => {
          const savedScroll = sessionStorage.getItem(`chat_scroll_${conversation.id_cuoc_tro_chuyen}`);
          if (savedScroll && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = parseInt(savedScroll, 10);
            const container = messagesContainerRef.current;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const distanceFromBottom = scrollHeight - parseInt(savedScroll, 10) - clientHeight;
            shouldAutoScrollRef.current = distanceFromBottom < 150;
          }
          // Đánh dấu đã khôi phục xong
          isRestoringFromCacheRef.current = false;
        }, 100);
      } catch (e) {
        console.error("Error parsing saved messages:", e);
        isRestoringFromCacheRef.current = false;
      }
      loadMessages(conversation.id_cuoc_tro_chuyen, true);
    } else {
      isRestoringFromCacheRef.current = false;
      // Không tự động scroll khi load conversation mới
      // shouldAutoScrollRef.current = true;
      loadMessages(conversation.id_cuoc_tro_chuyen);
    }
  };

  const handleSendMessage = async (file = null) => {
    if (!selectedConversation) {
      message.warning("Vui lòng chọn cuộc trò chuyện");
      return;
    }

    if (!messageText.trim() && !file) {
      message.warning("Vui lòng nhập nội dung tin nhắn hoặc chọn file");
      return;
    }

    try {
      setSending(true);
      const res = await apiChat.sendMessage(
        {
          id_cuoc_tro_chuyen: selectedConversation.id_cuoc_tro_chuyen,
          noi_dung: messageText,
          loai_tin_nhan: file
            ? file.type?.startsWith("image/")
              ? "hinh_anh"
              : "tap_tin"
            : "van_ban",
        },
        file
      );

      if (res.success) {
        setMessageText("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Không tự động scroll khi gửi tin nhắn
        // shouldAutoScrollRef.current = true;
        setMessages((prev) => [...prev, res.data]);
        loadConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error("File không được vượt quá 10MB");
        return;
      }
      handleSendMessage(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUserInfo = (conversation) => {
    const currentUserId = userInfo?.id_nguoi_dung;
    
    if (conversation.benh_nhan_id === currentUserId || conversation.id_benh_nhan === currentUserId) {
      if (conversation.bac_si_id) {
        return {
          id: conversation.bac_si_id,
          name: conversation.bac_si_ten || "Người dùng",
          avatar: conversation.bac_si_avatar,
          role: conversation.bac_si_vai_tro,
        };
      }
      if (conversation.chuyen_gia_id) {
        return {
          id: conversation.chuyen_gia_id,
          name: conversation.chuyen_gia_ten || "Người dùng",
          avatar: conversation.chuyen_gia_avatar,
          role: conversation.chuyen_gia_vai_tro,
        };
      }
    }
    return { id: null, name: "Người dùng", avatar: null, role: null };
  };

  const getRoleName = (vai_tro) => {
    const roleMap = {
      bac_si: "Bác sĩ",
      chuyen_gia_dinh_duong: "Chuyên gia dinh dưỡng",
      benh_nhan: "Bệnh nhân",
      nhan_vien_quay: "Nhân viên quầy",
      nhan_vien_phan_cong: "Nhân viên phân công",
      quan_tri_vien: "Quản trị viên"
    };
    return roleMap[vai_tro] || vai_tro;
  };

  const getRoleColor = (vai_tro) => {
    const colorMap = {
      bac_si: "blue",
      chuyen_gia_dinh_duong: "green",
      benh_nhan: "default",
      nhan_vien_quay: "orange",
      nhan_vien_phan_cong: "purple",
      quan_tri_vien: "red"
    };
    return colorMap[vai_tro] || "default";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return "Vừa xong";
    }
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} phút trước`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} giờ trước`;
    }
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLongPressStart = (messageId) => {
    if (longPressTimerRef.current[messageId]) {
      clearTimeout(longPressTimerRef.current[messageId]);
    }
    
    longPressTimerRef.current[messageId] = setTimeout(() => {
      setShowDeleteIcon((prev) => ({
        ...prev,
        [messageId]: true,
      }));
      delete longPressTimerRef.current[messageId];
    }, 3000);
  };

  const handleLongPressEnd = (messageId) => {
    if (longPressTimerRef.current[messageId]) {
      clearTimeout(longPressTimerRef.current[messageId]);
      delete longPressTimerRef.current[messageId];
    }
  };

  const handleDeleteMessage = async (id_tin_nhan) => {
    try {
      const res = await apiChat.deleteMessage(id_tin_nhan);
      if (res.success) {
        setMessages((prev) => prev.filter((msg) => msg.id_tin_nhan !== id_tin_nhan));
        setShowDeleteIcon((prev) => {
          const newState = { ...prev };
          delete newState[id_tin_nhan];
          return newState;
        });
        message.success("Đã xóa tin nhắn");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setShowDeleteIcon((prev) => {
        const newState = { ...prev };
        delete newState[id_tin_nhan];
        return newState;
      });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUserInfo(conv);
    return otherUser.name.toLowerCase().includes(searchText.toLowerCase());
  });

  if (!isPatient) {
    return null;
  }

  return (
    <Layout className="patient-chat-layout">
      <Sider width={350} className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text strong style={{ fontSize: "18px" }}>
              <MessageOutlined /> Tin nhắn
            </Text>
          </div>
          <Alert
            message="Bạn chỉ có thể trả lời tin nhắn từ bác sĩ, chuyên gia dinh dưỡng hoặc nhân viên"
            type="info"
            showIcon
            style={{ marginTop: "12px", fontSize: "12px" }}
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginTop: "12px" }}
          />
        </div>
        <div className="chat-conversations-list">
          {isInitialLoading && conversations.length === 0 ? (
            <div style={{ padding: "16px" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  active
                  avatar={{ size: 48 }}
                  title={false}
                  paragraph={{ rows: 2 }}
                  style={{ marginBottom: "16px" }}
                />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <Empty
              description="Chưa có cuộc trò chuyện nào. Bạn sẽ nhận được tin nhắn khi bác sĩ, chuyên gia dinh dưỡng hoặc nhân viên liên hệ với bạn."
              style={{ marginTop: "50px" }}
            />
          ) : (
            <List
              dataSource={filteredConversations}
              loading={loading}
              renderItem={(conversation) => {
                const otherUser = getOtherUserInfo(conversation);
                const unreadCount = conversation.so_tin_nhan_chua_doc || 0;
                return (
                  <List.Item
                    className={`chat-conversation-item ${
                      selectedConversation?.id_cuoc_tro_chuyen ===
                      conversation.id_cuoc_tro_chuyen
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                    style={{ cursor: "pointer", padding: "12px 16px" }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={unreadCount} size="small">
                          <Avatar
                            src={otherUser.avatar}
                            icon={<UserOutlined />}
                            size={48}
                          />
                        </Badge>
                      }
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <Space>
                            <Text strong>{otherUser.name}</Text>
                            {otherUser.role && (
                              <Tag color={getRoleColor(otherUser.role)}>
                                {getRoleName(otherUser.role)}
                              </Tag>
                            )}
                          </Space>
                          {conversation.thoi_gian_tin_nhan_cuoi && (
                            <Text
                              type="secondary"
                              style={{ fontSize: "12px" }}
                            >
                              {formatTime(conversation.thoi_gian_tin_nhan_cuoi)}
                            </Text>
                          )}
                        </div>
                      }
                      description={
                        <Text ellipsis style={{ fontSize: "13px" }}>
                          {conversation.tin_nhan_cuoi || "Chưa có tin nhắn"}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Sider>

      <Content className="chat-content">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              {(() => {
                const otherUser = getOtherUserInfo(selectedConversation);
                return (
                  <Space>
                    <Avatar
                      src={otherUser.avatar}
                      icon={<UserOutlined />}
                      size={40}
                    />
                    <Space>
                      <Text strong style={{ fontSize: "16px" }}>
                        {otherUser.name}
                      </Text>
                      {otherUser.role && (
                        <Tag color={getRoleColor(otherUser.role)}>
                          {getRoleName(otherUser.role)}
                        </Tag>
                      )}
                    </Space>
                  </Space>
                );
              })()}
            </div>

            <div className="chat-messages" ref={messagesContainerRef}>
              {isInitialLoading && messages.length === 0 ? (
                <div style={{ padding: "16px" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                      key={i}
                      active
                      avatar
                      title={false}
                      paragraph={{ rows: 1, width: ["60%", "40%"][i % 2] }}
                      style={{
                        marginBottom: "16px",
                        display: "flex",
                        justifyContent: i % 2 === 0 ? "flex-end" : "flex-start",
                      }}
                    />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <Empty description="Chưa có tin nhắn nào" />
              ) : (
                messages.map((msg) => {
                  const currentUserId = userInfo?.id_nguoi_dung;
                  const msgSenderId = msg.nguoi_gui_id || msg.id_nguoi_gui;
                  const currentUserIdStr = String(currentUserId || '').trim();
                  const msgSenderIdStr = String(msgSenderId || '').trim();
                  const isMyMessage = currentUserIdStr && msgSenderIdStr && 
                    currentUserIdStr === msgSenderIdStr;
                  
                  return (
                    <div
                      key={msg.id_tin_nhan}
                      className={`chat-message ${isMyMessage ? "my-message" : "other-message"} ${
                        showDeleteIcon[msg.id_tin_nhan] ? "message-selected" : ""
                      }`}
                      onMouseDown={() => handleLongPressStart(msg.id_tin_nhan)}
                      onMouseUp={() => handleLongPressEnd(msg.id_tin_nhan)}
                      onMouseLeave={() => handleLongPressEnd(msg.id_tin_nhan)}
                      onTouchStart={() => handleLongPressStart(msg.id_tin_nhan)}
                      onTouchEnd={() => handleLongPressEnd(msg.id_tin_nhan)}
                      onTouchCancel={() => handleLongPressEnd(msg.id_tin_nhan)}
                    >
                      {!isMyMessage && (
                        <Avatar
                          src={msg.nguoi_gui_avatar}
                          icon={<UserOutlined />}
                          size={32}
                          style={{ marginRight: "8px" }}
                        />
                      )}
                      <div className="message-content">
                        {showDeleteIcon[msg.id_tin_nhan] && (
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(msg.id_tin_nhan);
                            }}
                            className="delete-message-btn-visible"
                            style={{ 
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              color: "#ff4d4f",
                              padding: "0",
                              width: "24px",
                              height: "24px",
                              minWidth: "24px",
                              fontSize: "14px",
                              zIndex: 10,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "50%",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                            }}
                            danger
                          />
                        )}
                        {msg.loai_tin_nhan === "hinh_anh" && (
                          <img
                            src={msg.duong_dan_tap_tin}
                            alt="Hình ảnh"
                            style={{
                              maxWidth: "300px",
                              borderRadius: "8px",
                              marginBottom: "4px",
                            }}
                          />
                        )}
                        {msg.loai_tin_nhan === "tap_tin" && (
                          <Card
                            size="small"
                            style={{
                              marginBottom: "4px",
                              maxWidth: "300px",
                            }}
                          >
                            <Space>
                              <PaperClipOutlined />
                              <a
                                href={msg.duong_dan_tap_tin}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {msg.noi_dung || "Tải file"}
                              </a>
                            </Space>
                          </Card>
                        )}
                        {msg.loai_tin_nhan === "van_ban" && (
                          <div className="message-text">{msg.noi_dung}</div>
                        )}
                        <div className="message-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                          <Text
                            type="secondary"
                            style={{ fontSize: "11px" }}
                          >
                            {formatTime(msg.thoi_gian_gui)}
                          </Text>
                        </div>
                      </div>
                      {isMyMessage && (
                        <Avatar
                          src={userInfo?.anh_dai_dien}
                          icon={<UserOutlined />}
                          size={32}
                          style={{ marginLeft: "8px" }}
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept="*/*"
              />
              <Button
                icon={<PaperClipOutlined />}
                onClick={() => fileInputRef.current?.click()}
                style={{ marginRight: "8px" }}
              />
              <TextArea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ flex: 1, marginRight: "8px" }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSendMessage()}
                loading={sending}
              >
                Gửi
              </Button>
            </div>
          </>
        ) : (
          <Empty
            description="Chọn một cuộc trò chuyện để bắt đầu. Bạn sẽ nhận được tin nhắn khi bác sĩ, chuyên gia dinh dưỡng hoặc nhân viên liên hệ với bạn."
            style={{ marginTop: "100px" }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default PatientChat;

