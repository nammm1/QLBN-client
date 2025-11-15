import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  Avatar,
  Typography,
  Space,
  Tag,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  MinusOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  ReloadOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { medicalChatService } from "../../api/MedicalChat";
import "./MedicalChatBox.css";

const { Text } = Typography;
const { TextArea } = Input;

const MedicalChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Gợi ý câu hỏi thường gặp
  const quickQuestions = [
    "Các triệu chứng cảm cúm thường gặp?",
    "Làm thế nào để đặt lịch khám?",
    "Thời gian làm việc của bệnh viện?",
    "Làm sao để đăng ký khám online?",
    "Các dịch vụ y tế hiện có?",
    "Chế độ ăn uống lành mạnh?",
  ];

  // Message khởi tạo
  const welcomeMessage = {
    id: Date.now(),
    type: "bot",
    content:
      "👋 Xin chào! Tôi là trợ lý y tế AI. Tôi có thể giúp bạn:\n\n• Tư vấn về các triệu chứng bệnh thường gặp\n• Hướng dẫn đặt lịch khám bệnh\n• Thông tin về các dịch vụ y tế\n• Lời khuyên về sức khỏe và dinh dưỡng\n• Giải đáp thắc mắc về quy trình khám bệnh\n\n💡 Bạn có thể hỏi bất kỳ câu hỏi nào về y tế hoặc chọn một trong các câu hỏi gợi ý bên dưới!",
    timestamp: new Date(),
  };

  useEffect(() => {
    if (isOpen) {
      // Load chat history on open
      const savedMessages = medicalChatService.loadHistory();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // Save chat history whenever messages change
    if (messages.length > 0 && isOpen) {
      medicalChatService.saveHistory(messages);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Gửi conversation history để AI có context
      const conversationHistory = updatedMessages
        .filter(msg => msg.id !== welcomeMessage.id) // Loại bỏ welcome message
        .map(msg => ({
          type: msg.type,
          content: msg.content
        }));
      
      const response = await medicalChatService.getResponse(inputValue.trim(), conversationHistory);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực tiếp với bệnh viện qua hotline: 1900-xxxx để được hỗ trợ tốt hơn.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question) => {
    if (isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Gửi conversation history để AI có context
      const conversationHistory = updatedMessages
        .filter(msg => msg.id !== welcomeMessage.id) // Loại bỏ welcome message
        .map(msg => ({
          type: msg.type,
          content: msg.content
        }));
      
      const response = await medicalChatService.getResponse(question, conversationHistory);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực tiếp với bệnh viện qua hotline: 1900-xxxx để được hỗ trợ tốt hơn.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([welcomeMessage]);
    medicalChatService.clearHistory();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    // Thay vì giữ trạng thái cửa sổ tối thiểu (hiển thị header),
    // chuyển về bong bóng chat như ban đầu để tránh lỗi hiển thị header
    setIsMinimized(false);
    setIsOpen(false);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`medical-chatbox ${isOpen ? "open" : ""}`}>
      {/* Floating Button */}
      {!isOpen && (
        <Tooltip title="Chat hỗ trợ y tế" placement="left">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={toggleChat}
            className="chatbox-toggle-btn"
          >
            <span className="notification-badge"></span>
          </Button>
        </Tooltip>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`chatbox-window ${isMinimized ? "minimized" : "expanded"}`}
          ref={chatContainerRef}
        >
          {/* Header */}
          <div className="chatbox-header">
            <div className="chatbox-header-content">
              <Space>
                <Avatar
                  icon={<RobotOutlined />}
                  className="bot-avatar"
                  size="large"
                />
                <div>
                  <Text strong className="chatbox-title">
                    Trợ lý Y tế AI
                  </Text>
                  <div className="chatbox-status">
                    <span className="status-dot"></span>
                    <Text type="secondary" className="status-text">
                      Đang hoạt động
                    </Text>
                  </div>
                </div>
              </Space>
            </div>
            <Space className="chatbox-actions">
              {!isMinimized && (
                <Tooltip title="Thu nhỏ">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={handleMinimize}
                    className="action-btn"
                  />
                </Tooltip>
              )}
              {isMinimized && (
                <Tooltip title="Mở rộng">
                  <Button
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={handleExpand}
                    className="action-btn"
                  />
                </Tooltip>
              )}
              <Tooltip title="Đóng">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={toggleChat}
                  className="action-btn"
                />
              </Tooltip>
            </Space>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <div className="chatbox-messages" ref={messagesEndRef}>
                {messages.length === 0 ? (
                  <Empty
                    description="Chưa có tin nhắn nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-messages"
                  />
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${message.type} ${
                        message.isError ? "error" : ""
                      }`}
                    >
                      <div className="message-wrapper">
                        {message.type === "bot" && (
                          <Avatar
                            icon={<RobotOutlined />}
                            className="message-avatar bot-avatar"
                          />
                        )}
                        {message.type === "user" && (
                          <Avatar
                            icon={<UserOutlined />}
                            className="message-avatar user-avatar"
                          />
                        )}
                        <div className="message-content">
                          <div className="message-bubble">
                            <Text className="message-text">
                              {message.content}
                            </Text>
                            <div className="message-time">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="message-item bot">
                    <div className="message-wrapper">
                      <Avatar
                        icon={<RobotOutlined />}
                        className="message-avatar bot-avatar"
                      />
                      <div className="message-content">
                        <div className="message-bubble">
                          <Spin size="small" />
                          <Text className="typing-indicator">
                            Đang trả lời...
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="quick-questions">
                  <Text type="secondary" className="quick-questions-title">
                    💡 Câu hỏi thường gặp:
                  </Text>
                  <div className="quick-questions-list">
                    {quickQuestions.map((question, index) => (
                      <Tag
                        key={index}
                        className="quick-question-tag"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="chatbox-input-area">
                {messages.length > 1 && (
                  <div className="chatbox-actions-bar">
                    <Tooltip title="Xóa lịch sử chat">
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={handleClearChat}
                        className="action-btn-small"
                        size="small"
                      >
                        Xóa chat
                      </Button>
                    </Tooltip>
                  </div>
                )}
                <div className="chatbox-input-wrapper">
                  <TextArea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập câu hỏi của bạn về y tế..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    className="chatbox-input"
                    disabled={isLoading}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={isLoading}
                    disabled={!inputValue.trim() || isLoading}
                    className="chatbox-send-btn"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalChatBox;

