import React from "react";
import { Modal, Typography, Button, Space, Avatar, Tag } from "antd";
import {
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const CALL_STATE_TEXT = {
  starting: "Đang khởi tạo thiết bị...",
  calling: "Đang gọi...",
  connecting: "Đang kết nối...",
  incoming: "Có cuộc gọi đến",
  in_call: "Đang trong cuộc gọi",
};

const getStatusText = (state) => CALL_STATE_TEXT[state] || "Đang xử lý...";

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

const VideoCallModal = ({
  visible,
  callState,
  otherUser,
  onEndCall,
  onToggleMic,
  onToggleCamera,
  isMicMuted,
  isCameraOff,
  localVideoRef,
  remoteVideoRef,
  callDuration,
  remoteReady,
  localReady,
}) => {
  const statusText = getStatusText(callState);

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      width={900}
      className="video-call-modal"
      centered
      destroyOnHidden={false}
      maskClosable={false}
    >
      <div className="video-call-modal__header">
        <div>
          <Text className="video-call-modal__status">{statusText}</Text>
          {callState === "in_call" && (
            <Text type="secondary" className="video-call-modal__duration">
              Thời lượng: {formatDuration(callDuration)}
            </Text>
          )}
        </div>
        {otherUser && (
          <Space>
            <Avatar
              size={48}
              src={otherUser.avatar}
              icon={<UserOutlined />}
            />
            <div>
              <Text strong>{otherUser.name || "Người dùng"}</Text>
              {otherUser.role && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {otherUser.role}
                </Tag>
              )}
            </div>
          </Space>
        )}
      </div>

      <div className="video-call-modal__body">
        <div className="video-call-modal__remote">
          <video ref={remoteVideoRef} autoPlay playsInline />
          {!remoteReady && (
            <div className="video-call-modal__placeholder">
              <VideoCameraOutlined />
              <Text>Đang chờ đối tác kết nối...</Text>
            </div>
          )}
        </div>
        <div className="video-call-modal__local">
          <video ref={localVideoRef} autoPlay muted playsInline />
          {!localReady && (
            <div className="video-call-modal__placeholder compact">
              <VideoCameraAddOutlined />
              <Text>Đang mở camera...</Text>
            </div>
          )}
          <Text className="video-call-modal__local-label">Bạn</Text>
        </div>
      </div>

      <div className="video-call-modal__controls">
        <Button
          shape="round"
          size="large"
          icon={isMicMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
          onClick={onToggleMic}
        >
          {isMicMuted ? "Bật micro" : "Tắt micro"}
        </Button>
        <Button
          shape="round"
          size="large"
          icon={
            isCameraOff ? <VideoCameraAddOutlined /> : <VideoCameraOutlined />
          }
          onClick={onToggleCamera}
        >
          {isCameraOff ? "Bật camera" : "Tắt camera"}
        </Button>
        <Button
          shape="round"
          size="large"
          danger
          type="primary"
          icon={<PhoneOutlined />}
          onClick={onEndCall}
        >
          Kết thúc
        </Button>
      </div>
    </Modal>
  );
};

export default VideoCallModal;




