import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout, List, Input, Button, Avatar, Empty, Badge, message, Upload, Typography, Space, Card, Modal, Select, Tag, Skeleton } from "antd";

import {
  SendOutlined,
  PaperClipOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import apiChat from "../../api/Chat";
import apiNguoiDung from "../../api/NguoiDung";
import socketService from "../../services/socket/socketService";
import VideoCallModal from "../../components/Chat/VideoCallModal.jsx";
import "./Chat.css";

const RTC_CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const INCOMING_CALL_TOAST_KEY = "incoming-call";

const Chat = ({ embedded = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [userSearchText, setUserSearchText] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [autoOpeningConversation, setAutoOpeningConversation] = useState(false);
  const [showDeleteIcon, setShowDeleteIcon] = useState({}); // { messageId: true/false }
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [callState, setCallState] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCallInfo, setCurrentCallInfo] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [typingIndicator, setTypingIndicator] = useState(null);
  const longPressTimerRef = useRef({}); // { messageId: timerId }
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isRestoringFromCacheRef = useRef(false);
  const shouldAutoScrollRef = useRef(true); // Flag để quyết định có auto-scroll không
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentCallRef = useRef(null);
  const incomingCallRef = useRef(null);
  const callTimerRef = useRef(null);
  const typingEmitTimeoutRef = useRef(null);
  const typingIndicatorTimeoutRef = useRef(null);
  const pendingRemoteCandidatesRef = useRef([]);
  const pendingRemoteAnswerRef = useRef(null);
  const applyingRemoteAnswerRef = useRef(false);
  const remoteDescriptionAppliedRef = useRef(false);
  const typingSignalActiveRef = useRef(false);
  const lastConversationIdRef = useRef(null);
  const savedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userInfo = savedUserInfo?.user || savedUserInfo; // Hỗ trợ cả 2 format
  const [messageApi, contextHolder] = message.useMessage();
  const isEmbedded = embedded || searchParams.get("embedded") === "1";
  const hideIncomingCallToast = useCallback(() => {
    messageApi.destroy(INCOMING_CALL_TOAST_KEY);
  }, [messageApi]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cleanupCallState = useCallback(
    ({ notifyServer = false, reason = "hangup" } = {}) => {
      const currentCall = currentCallRef.current;
      if (notifyServer && currentCall) {
        socketService.endVideoCall({
          conversationId: currentCall.conversationId,
          callId: currentCall.callId,
          reason,
        });
      }

      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.ontrack = null;
          peerConnectionRef.current.onicecandidate = null;
          peerConnectionRef.current.close();
        } catch (error) {
          console.warn("peer connection cleanup error", error);
        }
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks?.().forEach((track) => track.stop());
        remoteStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      pendingRemoteCandidatesRef.current = [];
      pendingRemoteAnswerRef.current = null;
      remoteDescriptionAppliedRef.current = false;
      applyingRemoteAnswerRef.current = false;
      currentCallRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      hideIncomingCallToast();
      setCallModalVisible(false);
      setCallState("idle");
      setCurrentCallInfo(null);
      setIncomingCall(null);
      setIsMicMuted(false);
      setIsCameraOff(false);
      setCallDuration(0);
    },
    [hideIncomingCallToast]
  );

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error("Thiết bị không hỗ trợ cuộc gọi video");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    setIsMicMuted(false);
    setIsCameraOff(false);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  const attemptApplyRemoteAnswer = useCallback(async () => {
    if (applyingRemoteAnswerRef.current) {
      return;
    }
    const currentCall = currentCallRef.current;
    const pc = peerConnectionRef.current;
    const pendingAnswer = pendingRemoteAnswerRef.current;
    if (
      !currentCall ||
      !pc ||
      !pendingAnswer ||
      remoteDescriptionAppliedRef.current
    ) {
      return;
    }
    if (pc.currentRemoteDescription) {
      remoteDescriptionAppliedRef.current = true;
      pendingRemoteAnswerRef.current = null;
      return;
    }
    if (pc.signalingState !== "have-local-offer") {
      return;
    }
    applyingRemoteAnswerRef.current = true;
    try {
      await pc.setRemoteDescription(
        new RTCSessionDescription(pendingAnswer)
      );
      remoteDescriptionAppliedRef.current = true;
      pendingRemoteAnswerRef.current = null;
      if (pendingRemoteCandidatesRef.current.length > 0) {
        for (const candidate of pendingRemoteCandidatesRef.current) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (candidateError) {
            console.error("addIceCandidate (pending) error:", candidateError);
          }
        }
        pendingRemoteCandidatesRef.current = [];
      }
      setCallState("connecting");
    } catch (error) {
      console.error("setRemoteDescription error:", error);
    } finally {
      applyingRemoteAnswerRef.current = false;
      if (
        pendingRemoteAnswerRef.current &&
        !remoteDescriptionAppliedRef.current
      ) {
        attemptApplyRemoteAnswer();
      }
    }
  }, []);

  const createPeerConnection = useCallback(
    (conversationId, callId) => {
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (error) {
          console.warn("Previous peer connection close error", error);
        }
        peerConnectionRef.current = null;
      }

      pendingRemoteCandidatesRef.current = [];
      pendingRemoteAnswerRef.current = null;
      remoteDescriptionAppliedRef.current = false;

      const pc = new RTCPeerConnection(RTC_CONFIGURATION);
      peerConnectionRef.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendVideoIceCandidate({
            conversationId,
            callId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setCallState("in_call");
        }
      };

      pc.onsignalingstatechange = () => {
        if (pc.signalingState === "have-local-offer") {
          attemptApplyRemoteAnswer();
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          ["disconnected", "failed", "closed"].includes(pc.connectionState)
        ) {
          cleanupCallState({ notifyServer: false, reason: pc.connectionState });
        }
      };

      return pc;
    },
    [attemptApplyRemoteAnswer, cleanupCallState]
  );

  const handleStartVideoCall = useCallback(async () => {
    if (!selectedConversation) {
      messageApi.warning("Vui lòng chọn cuộc trò chuyện trước khi gọi video");
      return;
    }
    if (callState !== "idle") {
      messageApi.warning("Bạn đang có cuộc gọi khác đang diễn ra");
      return;
    }
    try {
      setCallState("starting");
      setCallModalVisible(true);
      const conversationId = selectedConversation.id_cuoc_tro_chuyen;
      const otherUser = getOtherUserInfo(selectedConversation);
      const callId = `CALL_${Date.now()}`;
      setCurrentCallInfo({
        callId,
        conversationId,
        role: "caller",
        otherUser,
      });

      const stream = await ensureLocalStream();
      const pc = createPeerConnection(conversationId, callId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await attemptApplyRemoteAnswer();

      socketService.startVideoCall({
        conversationId,
        callId,
        offer,
        metadata: {
          callerName: userInfo?.ho_ten,
          callerId: userInfo?.id_nguoi_dung,
          calleeId: otherUser?.id,
          calleeName: otherUser?.name,
        },
      });
      setCallState("calling");
    } catch (error) {
      console.error("handleStartVideoCall error:", error);
      messageApi.error(
        error?.message ||
          "Không thể khởi tạo cuộc gọi video. Vui lòng kiểm tra thiết bị và thử lại."
      );
      cleanupCallState({ notifyServer: false, reason: "init_failed" });
    }
  }, [
    callState,
    createPeerConnection,
    ensureLocalStream,
    selectedConversation,
    userInfo,
    cleanupCallState,
  ]);

  const handleAcceptIncomingCall = useCallback(async () => {
    if (!incomingCall) {
      return;
    }
    try {
      setCallState("starting");
      const { conversationId, callId, offer, callerInfo } = incomingCall;
      const stream = await ensureLocalStream();
      const pc = createPeerConnection(conversationId, callId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.answerVideoCall({ conversationId, callId, answer });
      setCurrentCallInfo({
        callId,
        conversationId,
        role: "callee",
        otherUser: callerInfo,
      });
      setIncomingCall(null);
      setCallModalVisible(true);
      setCallState("connecting");
    } catch (error) {
      console.error("handleAcceptIncomingCall error:", error);
      messageApi.error("Không thể tham gia cuộc gọi. Vui lòng thử lại.");
      socketService.rejectVideoCall({
        conversationId: incomingCall.conversationId,
        callId: incomingCall.callId,
        reason: "failed_to_connect",
      });
      setIncomingCall(null);
      cleanupCallState({ notifyServer: false, reason: "failed_to_connect" });
    }
  }, [incomingCall, ensureLocalStream, createPeerConnection, cleanupCallState]);

  const handleDeclineIncomingCall = useCallback(
    (reason = "declined") => {
      if (incomingCall) {
        socketService.rejectVideoCall({
          conversationId: incomingCall.conversationId,
          callId: incomingCall.callId,
          reason,
        });
                  }
      setIncomingCall(null);
      if (!currentCallRef.current) {
        setCallState("idle");
      }
    },
    [incomingCall]
  );

  const handleEndCall = useCallback(
    (reason = "hangup") => {
      const currentCall = currentCallRef.current;
      if (!currentCall) {
        cleanupCallState({ notifyServer: false, reason });
        return;
      }
      const shouldCancel =
        callState !== "in_call" && callState !== "connecting";
      if (shouldCancel) {
        socketService.cancelVideoCall({
          conversationId: currentCall.conversationId,
          callId: currentCall.callId,
          reason,
        });
        cleanupCallState({ notifyServer: false, reason });
            } else {
        cleanupCallState({ notifyServer: true, reason });
      }
    },
    [callState, cleanupCallState]
  );

  const handleToggleMic = useCallback(() => {
    if (!localStreamRef.current) {
      return;
            }
    const nextMuted = !isMicMuted;
    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = !nextMuted));
    setIsMicMuted(nextMuted);
  }, [isMicMuted]);

  const handleToggleCamera = useCallback(() => {
    if (!localStreamRef.current) {
      return;
    }
    const nextDisabled = !isCameraOff;
    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => (track.enabled = !nextDisabled));
    setIsCameraOff(nextDisabled);
  }, [isCameraOff]);

  const stopTypingSignal = useCallback(() => {
    if (typingEmitTimeoutRef.current) {
      clearTimeout(typingEmitTimeoutRef.current);
      typingEmitTimeoutRef.current = null;
    }
    if (typingSignalActiveRef.current && lastConversationIdRef.current) {
      socketService.sendTyping(lastConversationIdRef.current, false);
    }
    typingSignalActiveRef.current = false;
  }, []);

  const notifyTyping = useCallback(() => {
    const conversationId = selectedConversation?.id_cuoc_tro_chuyen;
    if (!conversationId) {
      return;
    }
    if (!typingSignalActiveRef.current) {
      socketService.sendTyping(conversationId, true);
      typingSignalActiveRef.current = true;
    }
    if (typingEmitTimeoutRef.current) {
      clearTimeout(typingEmitTimeoutRef.current);
    }
    typingEmitTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(conversationId, false);
      typingSignalActiveRef.current = false;
      typingEmitTimeoutRef.current = null;
    }, 2000);
  }, [selectedConversation]);

  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (videoEl) {
      videoEl.muted = true;
      if (localStream) {
        videoEl.srcObject = localStream;
        const playPromise = videoEl.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      } else {
        videoEl.srcObject = null;
      }
    }
  }, [localStream]);

  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (videoEl) {
      if (remoteStream) {
        videoEl.srcObject = remoteStream;
        const playPromise = videoEl.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      } else {
        videoEl.srcObject = null;
      }
    }
  }, [remoteStream]);

  // Lưu trạng thái vào localStorage/sessionStorage
  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem("chat_selected_conversation_id", selectedConversation.id_cuoc_tro_chuyen);
      
      // Nếu có cache messages, load từ server một cách silent để cập nhật
      const savedMessages = sessionStorage.getItem(`chat_messages_${selectedConversation.id_cuoc_tro_chuyen}`);
      if (savedMessages) {
        // Load messages mới một cách silent sau khi khôi phục từ cache
        setTimeout(() => {
          loadMessages(selectedConversation.id_cuoc_tro_chuyen, true);
        }, 500); // Đợi một chút để UI render xong
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (conversations.length > 0) {
      sessionStorage.setItem("chat_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      sessionStorage.setItem(`chat_messages_${selectedConversation.id_cuoc_tro_chuyen}`, JSON.stringify(messages));
    }
  }, [messages, selectedConversation]);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();

    // Setup Socket.IO event listeners
    const handleNewMessage = (messageData) => {
      // Only add message if it belongs to the current conversation
      if (selectedConversation && messageData.id_cuoc_tro_chuyen === selectedConversation.id_cuoc_tro_chuyen) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id_tin_nhan === messageData.id_tin_nhan);
          if (!exists) {
            return [...prev, messageData];
          }
          return prev;
        });
        // Auto-scroll if user is near bottom
        if (shouldAutoScrollRef.current) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }
      // Update conversations list
      loadConversations(true);
    };

    const handleMessageDeleted = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id_cuoc_tro_chuyen) {
        setMessages((prev) => prev.filter((msg) => msg.id_tin_nhan !== data.messageId));
      }
      // Update conversations list
      loadConversations(true);
    };

    const handleConversationUpdated = (data) => {
      // Update conversations list when conversation is updated
      loadConversations(true);
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('message_deleted', handleMessageDeleted);
    socketService.on('conversation_updated', handleConversationUpdated);

    // Load initial conversations
    const hasCache = sessionStorage.getItem("chat_conversations");
    loadConversations(!!hasCache);

    // Cleanup on unmount
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('message_deleted', handleMessageDeleted);
      socketService.off('conversation_updated', handleConversationUpdated);
    };
  }, []);

  useEffect(() => {
    const handleIncomingOffer = (payload) => {
      if (!payload?.conversationId || !payload?.callId) {
        return;
      }
      const resolvedTargetUserId = payload?.resolvedTargetUserId;
      if (
        resolvedTargetUserId &&
        userInfo?.id_nguoi_dung &&
        resolvedTargetUserId !== userInfo.id_nguoi_dung
      ) {
        return;
      }
      if (currentCallRef.current || incomingCallRef.current) {
        socketService.rejectVideoCall({
          conversationId: payload.conversationId,
          callId: payload.callId,
          reason: "user_busy",
        });
        return;
      }
      setIncomingCall(payload);
      setCallState("incoming");
      messageApi.open({
        key: INCOMING_CALL_TOAST_KEY,
        type: "info",
        content: `${payload?.callerInfo?.name || "Người dùng"} đang gọi video...`,
        duration: 0,
      });
    };

    const handleOfferAck = () => {
      setCallState((prev) => (prev === "starting" ? "calling" : prev));
    };

    const handleCallAnswer = async (payload) => {
      const currentCall = currentCallRef.current;
      if (!currentCall || currentCall.callId !== payload?.callId) {
        return;
      }
      if (!peerConnectionRef.current || !payload?.answer) {
        return;
      }
      pendingRemoteAnswerRef.current = payload.answer;
      attemptApplyRemoteAnswer();
    };

    const handleIceCandidate = async (payload) => {
      const currentCall = currentCallRef.current;
      if (
        !currentCall ||
        currentCall.callId !== payload?.callId ||
        !payload?.candidate
      ) {
        return;
      }
      if (!peerConnectionRef.current) {
        return;
      }
      try {
        const rtcCandidate = new RTCIceCandidate(payload.candidate);
        if (!peerConnectionRef.current.remoteDescription) {
          pendingRemoteCandidatesRef.current.push(rtcCandidate);
          return;
        }
        await peerConnectionRef.current.addIceCandidate(rtcCandidate);
      } catch (error) {
        console.error("addIceCandidate error:", error);
      }
    };

    const handleCallRejected = (payload) => {
      const currentCall = currentCallRef.current;
      if (!currentCall || currentCall.callId !== payload?.callId) {
        return;
      }
      hideIncomingCallToast();
      messageApi.warning("Cuộc gọi đã bị từ chối");
      cleanupCallState({ notifyServer: false, reason: "rejected" });
    };

    const handleCallCancelled = (payload) => {
      const pendingCall = incomingCallRef.current;
      if (pendingCall && payload?.callId === pendingCall.callId) {
        hideIncomingCallToast();
        messageApi.info("Người gọi đã huỷ cuộc gọi");
        setIncomingCall(null);
        setCallState("idle");
      }
    };

    const handleCallEnded = (payload) => {
      const currentCall = currentCallRef.current;
      if (!currentCall || currentCall.callId !== payload?.callId) {
        return;
      }
      hideIncomingCallToast();
      if (payload?.reason === "peer_disconnected") {
        messageApi.warning("Cuộc gọi kết thúc do đối tác rời đi");
      } else {
        messageApi.info("Cuộc gọi đã kết thúc");
      }
      cleanupCallState({ notifyServer: false, reason: payload?.reason });
    };

    const handleCallBusy = () => {
      hideIncomingCallToast();
      messageApi.warning("Đối tác đang bận cuộc gọi khác");
      cleanupCallState({ notifyServer: false, reason: "busy" });
    };

    const handleCallError = () => {
      hideIncomingCallToast();
      messageApi.error("Không thể thiết lập cuộc gọi video");
      cleanupCallState({ notifyServer: false, reason: "error" });
    };

    socketService.on("video_call_offer", handleIncomingOffer);
    socketService.on("video_call_offer_ack", handleOfferAck);
    socketService.on("video_call_answer", handleCallAnswer);
    socketService.on("video_call_ice_candidate", handleIceCandidate);
    socketService.on("video_call_rejected", handleCallRejected);
    socketService.on("video_call_cancelled", handleCallCancelled);
    socketService.on("video_call_ended", handleCallEnded);
    socketService.on("video_call_busy", handleCallBusy);
    socketService.on("video_call_error", handleCallError);

    return () => {
      socketService.off("video_call_offer", handleIncomingOffer);
      socketService.off("video_call_offer_ack", handleOfferAck);
      socketService.off("video_call_answer", handleCallAnswer);
      socketService.off("video_call_ice_candidate", handleIceCandidate);
      socketService.off("video_call_rejected", handleCallRejected);
      socketService.off("video_call_cancelled", handleCallCancelled);
      socketService.off("video_call_ended", handleCallEnded);
      socketService.off("video_call_busy", handleCallBusy);
      socketService.off("video_call_error", handleCallError);
    };
  }, [attemptApplyRemoteAnswer, cleanupCallState, incomingCall]);

  // Join/leave conversation room when selected conversation changes
  useEffect(() => {
      if (selectedConversation) {
      socketService.joinConversation(selectedConversation.id_cuoc_tro_chuyen);
      // Mark as read via Socket.IO
      socketService.markAsRead(selectedConversation.id_cuoc_tro_chuyen);
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation.id_cuoc_tro_chuyen);
      }
    };
  }, [selectedConversation]);

  // Tự động mở cuộc trò chuyện khi có user hoặc id_cuoc_tro_chuyen param trong URL
  useEffect(() => {
    const userIdFromUrl = searchParams.get("user");
    const conversationIdFromUrl = searchParams.get("id_cuoc_tro_chuyen");
    
    if (conversationIdFromUrl && !autoOpeningConversation && !loading) {
      // Đợi conversations được load xong
      const timer = setTimeout(() => {
        handleAutoOpenConversationById(conversationIdFromUrl);
      }, 100);

      return () => clearTimeout(timer);
    } else if (userIdFromUrl && !autoOpeningConversation && !loading) {
      // Đợi conversations được load xong (có thể là mảng rỗng nếu chưa có conversation nào)
      // Điều kiện conversations.length >= 0 luôn đúng, nhưng ta cần đảm bảo đã load xong
      const timer = setTimeout(() => {
        handleAutoOpenConversation(userIdFromUrl);
      }, 100); // Đợi một chút để đảm bảo conversations đã được load

      return () => clearTimeout(timer);
    }
  }, [searchParams.get("user"), searchParams.get("id_cuoc_tro_chuyen")]); // Chạy khi user hoặc conversation param thay đổi

  // Hàm tự động mở cuộc trò chuyện theo ID conversation
  const handleAutoOpenConversationById = async (id_cuoc_tro_chuyen) => {
    try {
      setAutoOpeningConversation(true);
      
      // Tìm conversation trong danh sách hiện có
      const existingConv = conversations.find(
        (conv) => conv.id_cuoc_tro_chuyen === id_cuoc_tro_chuyen
      );

      if (existingConv) {
        // Nếu đã có, chọn conversation này
        setSelectedConversation(existingConv);
        loadMessages(existingConv.id_cuoc_tro_chuyen);
        // Xóa param từ URL
        setSearchParams({});
      } else {
        // Nếu chưa có trong danh sách, reload conversations và tìm lại
        await loadConversations();
        const timer = setTimeout(() => {
          const foundConv = conversations.find(
            (conv) => conv.id_cuoc_tro_chuyen === id_cuoc_tro_chuyen
          );
          if (foundConv) {
            setSelectedConversation(foundConv);
            loadMessages(foundConv.id_cuoc_tro_chuyen);
          } else {
            messageApi.warning("Không tìm thấy cuộc trò chuyện");
          }
          setSearchParams({});
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Error opening conversation:", error);
      messageApi.error("Không thể mở cuộc trò chuyện");
    } finally {
      setAutoOpeningConversation(false);
    }
  };

  // Hàm tự động mở cuộc trò chuyện với người dùng từ URL
  const handleAutoOpenConversation = async (id_nguoi_nhan) => {
    try {
      setAutoOpeningConversation(true);
      setLoading(true);
      
      // Kiểm tra xem đã có cuộc trò chuyện với người này chưa
      const existingConv = conversations.find((conv) => {
        const otherUser = getOtherUserInfo(conv);
        return otherUser.id === id_nguoi_nhan;
      });

      if (existingConv) {
        // Nếu đã có, mở cuộc trò chuyện đó
        setSelectedConversation(existingConv);
        loadMessages(existingConv.id_cuoc_tro_chuyen);
        // Xóa param từ URL
        setSearchParams({});
      } else {
        // Nếu chưa có, gọi API để tạo hoặc lấy cuộc trò chuyện (API sẽ tự động trả về conversation nếu đã tồn tại)
        const res = await apiChat.getOrCreateConversation(id_nguoi_nhan);
        if (res.success) {
          const newConversation = {
            ...res.data,
            benh_nhan_id: res.data.id_benh_nhan,
            bac_si_id: res.data.id_bac_si,
            chuyen_gia_id: res.data.id_chuyen_gia_dinh_duong,
            benh_nhan_ten: res.data.benh_nhan_ten,
            bac_si_ten: res.data.bac_si_ten,
            chuyen_gia_ten: res.data.chuyen_gia_ten,
            benh_nhan_avatar: res.data.benh_nhan_avatar,
            bac_si_avatar: res.data.bac_si_avatar,
            chuyen_gia_avatar: res.data.chuyen_gia_avatar,
          };

          // Tìm xem conversation đã có trong danh sách chưa
          const existingIndex = conversations.findIndex(
            (conv) => conv.id_cuoc_tro_chuyen === newConversation.id_cuoc_tro_chuyen
          );

          if (existingIndex >= 0) {
            // Cập nhật conversation hiện có
            const updatedConversations = [...conversations];
            updatedConversations[existingIndex] = newConversation;
            setConversations(updatedConversations);
            setSelectedConversation(newConversation);
            loadMessages(newConversation.id_cuoc_tro_chuyen);
          } else {
            // Thêm conversation mới vào đầu danh sách
            setConversations([newConversation, ...conversations]);
            setSelectedConversation(newConversation);
            loadMessages(newConversation.id_cuoc_tro_chuyen);
          }
          
          messageApi.success("Cuộc trò chuyện đã được mở");
        }
        // Xóa param từ URL
        setSearchParams({});
      }
    } catch (error) {
      console.error("Error auto-opening conversation:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
      setSearchParams({});
    } finally {
      setLoading(false);
      setAutoOpeningConversation(false);
    }
  };

  // Auto scroll xuống tin nhắn mới nhất - chỉ khi cần thiết
  useEffect(() => {
    // Không auto-scroll nếu đang khôi phục từ cache
    if (isRestoringFromCacheRef.current) {
      return;
    }

    // Chỉ auto-scroll nếu:
    // 1. User đang ở gần cuối trang (shouldAutoScrollRef.current = true)
    // 2. Hoặc là lần đầu load conversation (không có scroll position đã lưu)
    const savedScroll = selectedConversation 
      ? sessionStorage.getItem(`chat_scroll_${selectedConversation.id_cuoc_tro_chuyen}`)
      : null;
    
    const shouldScroll = shouldAutoScrollRef.current || !savedScroll;
    
    if (shouldScroll && messages.length > 0) {
      // Đợi một chút để DOM render xong
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages, selectedConversation]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent && conversations.length === 0) {
        setLoading(true);
      }
      const res = await apiChat.getConversations();
      if (res.success) {
        setConversations(res.data || []);
        
        // Nếu đã có conversation được chọn, tìm lại nó trong danh sách mới
        const savedConversationId = localStorage.getItem("chat_selected_conversation_id");
        if (savedConversationId && !selectedConversation) {
          const foundConv = res.data?.find(c => c.id_cuoc_tro_chuyen === savedConversationId);
          if (foundConv) {
            setSelectedConversation(foundConv);
            // Load messages cho conversation này
            const savedMessages = sessionStorage.getItem(`chat_messages_${savedConversationId}`);
            if (savedMessages) {
              try {
                setMessages(JSON.parse(savedMessages));
              } catch (e) {
                // Nếu parse lỗi, load từ server
                loadMessages(savedConversationId);
              }
            } else {
              loadMessages(savedConversationId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor (trừ khi silent)
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadMessages = async (id_cuoc_tro_chuyen, silent = false) => {
    try {
      if (!silent) {
        // Chỉ set loading nếu chưa có messages từ cache
        const savedMessages = sessionStorage.getItem(`chat_messages_${id_cuoc_tro_chuyen}`);
        if (!savedMessages) {
          setLoading(true);
        }
      }
      
      // Lưu số lượng messages hiện tại để kiểm tra có tin nhắn mới không
      const previousMessagesCount = messages.length;
      
      const res = await apiChat.getMessages(id_cuoc_tro_chuyen);
      if (res.success) {
        const newMessages = res.data || [];
        const hasNewMessages = newMessages.length > previousMessagesCount;
        
        setMessages(newMessages);
        
        // Nếu có tin nhắn mới từ polling và user đang ở gần cuối, auto-scroll
        if (silent && hasNewMessages && shouldAutoScrollRef.current) {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
        
        // Đánh dấu đã đọc
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
    isRestoringFromCacheRef.current = false;
    shouldAutoScrollRef.current = true; // Reset flag khi chọn conversation mới
    
    // Kiểm tra cache trước
    const savedMessages = sessionStorage.getItem(`chat_messages_${conversation.id_cuoc_tro_chuyen}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
        // Khôi phục scroll position nếu có
        setTimeout(() => {
          const savedScroll = sessionStorage.getItem(`chat_scroll_${conversation.id_cuoc_tro_chuyen}`);
          if (savedScroll && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = parseInt(savedScroll, 10);
            // Kiểm tra xem có ở gần cuối không
            const container = messagesContainerRef.current;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const distanceFromBottom = scrollHeight - parseInt(savedScroll, 10) - clientHeight;
            shouldAutoScrollRef.current = distanceFromBottom < 150;
          }
        }, 100);
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
      // Load từ server một cách silent để cập nhật
      loadMessages(conversation.id_cuoc_tro_chuyen, true);
    } else {
      // Không có cache, scroll xuống dưới khi load xong
      shouldAutoScrollRef.current = true;
      loadMessages(conversation.id_cuoc_tro_chuyen);
    }
  };

  const handleSendMessage = async (file = null) => {
    if (!selectedConversation) {
      messageApi.warning("Vui lòng chọn cuộc trò chuyện");
      return;
    }

    if (!messageText.trim() && !file) {
      messageApi.warning("Vui lòng nhập nội dung tin nhắn hoặc chọn file");
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
        // Đảm bảo auto-scroll khi user gửi tin nhắn
        shouldAutoScrollRef.current = true;
        // Thêm tin nhắn mới vào danh sách (Socket.IO sẽ emit event, nhưng thêm ngay để UX tốt hơn)
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id_tin_nhan === res.data.id_tin_nhan);
          if (!exists) {
            return [...prev, res.data];
          }
          return prev;
        });
        // Cập nhật danh sách cuộc trò chuyện
        loadConversations(true);
        // Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);
        stopTypingSignal();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        messageApi.error("File không được vượt quá 30MB");
        return;
      }
      handleSendMessage(file);
    }
  };

  useEffect(() => {
    currentCallRef.current = currentCallInfo;
  }, [currentCallInfo]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    const handleUserTyping = (payload) => {
      if (
        !selectedConversation ||
        payload?.conversationId !== selectedConversation.id_cuoc_tro_chuyen ||
        payload?.userId === userInfo?.id_nguoi_dung
      ) {
        return;
      }
      if (payload?.isTyping) {
        const name =
          payload?.userInfo?.ho_ten ||
          payload?.userInfo?.ten_dang_nhap ||
          "Người dùng";
        setTypingIndicator(`${name} đang nhập...`);
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
        }
        typingIndicatorTimeoutRef.current = setTimeout(() => {
          setTypingIndicator(null);
          typingIndicatorTimeoutRef.current = null;
        }, 3000);
      } else {
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
          typingIndicatorTimeoutRef.current = null;
        }
        setTypingIndicator(null);
      }
    };

    socketService.on("user_typing", handleUserTyping);
    return () => {
      socketService.off("user_typing", handleUserTyping);
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
        typingIndicatorTimeoutRef.current = null;
      }
      setTypingIndicator(null);
    };
  }, [selectedConversation, userInfo?.id_nguoi_dung]);

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

  useEffect(() => {
    if (callState === "in_call") {
      if (!callTimerRef.current) {
        callTimerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    } else if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      if (callState === "idle") {
        setCallDuration(0);
      }
    }
  }, [callState]);

  useEffect(() => {
    const currentId = selectedConversation?.id_cuoc_tro_chuyen || null;
    if (
      lastConversationIdRef.current &&
      lastConversationIdRef.current !== currentId &&
      typingSignalActiveRef.current
    ) {
      socketService.sendTyping(lastConversationIdRef.current, false);
      typingSignalActiveRef.current = false;
    }
    lastConversationIdRef.current = currentId;
  }, [selectedConversation]);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      cleanupCallState({ notifyServer: true, reason: "leave_page" });
      stopTypingSignal();
    };
  }, [cleanupCallState, stopTypingSignal]);

  // Lưu vị trí scroll khi scroll
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

  // Khôi phục trạng thái từ localStorage khi component mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem("chat_selected_conversation_id");
    const savedConversations = sessionStorage.getItem("chat_conversations");
    const savedMessages = sessionStorage.getItem(`chat_messages_${savedConversationId}`);
    
    // Khôi phục conversations nếu có
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        
        // Khôi phục conversation đã chọn
        if (savedConversationId && parsed.length > 0) {
          const savedConv = parsed.find(c => c.id_cuoc_tro_chuyen === savedConversationId);
          if (savedConv) {
            setSelectedConversation(savedConv);
            isRestoringFromCacheRef.current = true;
            
            // Khôi phục messages nếu có
            if (savedMessages) {
              try {
                setMessages(JSON.parse(savedMessages));
                // Đợi render xong rồi khôi phục scroll position
                setTimeout(() => {
                  const savedScroll = sessionStorage.getItem(`chat_scroll_${savedConversationId}`);
                  if (savedScroll && messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = parseInt(savedScroll, 10);
                  }
                  isRestoringFromCacheRef.current = false;
                }, 100);
              } catch (e) {
                console.error("Error parsing saved messages:", e);
                isRestoringFromCacheRef.current = false;
              }
            } else {
              isRestoringFromCacheRef.current = false;
            }
          }
        }
        setIsInitialLoading(false);
      } catch (e) {
        console.error("Error parsing saved conversations:", e);
        setIsInitialLoading(false);
      }
    } else {
      setIsInitialLoading(false);
    }
  }, []);

  const getOtherUserInfo = (conversation) => {
    const currentUserId = userInfo?.id_nguoi_dung;
    
    // Kiểm tra người dùng có phải là bệnh nhân trong cuộc trò chuyện không
    if (conversation.benh_nhan_id === currentUserId || conversation.id_benh_nhan === currentUserId) {
      // Người dùng là bệnh nhân hoặc người thứ nhất (lưu trong id_benh_nhan)
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
    } else if (conversation.bac_si_id === currentUserId || conversation.id_bac_si === currentUserId) {
      // Người dùng là bác sĩ hoặc người thứ hai (lưu trong id_bac_si)
      return {
        id: conversation.benh_nhan_id || conversation.id_benh_nhan,
        name: conversation.benh_nhan_ten || "Người dùng",
        avatar: conversation.benh_nhan_avatar,
        role: conversation.benh_nhan_vai_tro,
      };
    } else if (conversation.chuyen_gia_id === currentUserId || conversation.id_chuyen_gia_dinh_duong === currentUserId) {
      // Người dùng là chuyên gia dinh dưỡng
      return {
        id: conversation.benh_nhan_id || conversation.id_benh_nhan,
        name: conversation.benh_nhan_ten || "Người dùng",
        avatar: conversation.benh_nhan_avatar,
        role: conversation.benh_nhan_vai_tro,
      };
    } else {
      // Trường hợp không khớp, thử tìm người còn lại
      // Nếu người dùng không phải là bất kỳ ai trong cuộc trò chuyện, lấy người khác
      if (conversation.benh_nhan_id && conversation.benh_nhan_id !== currentUserId) {
        return {
          id: conversation.benh_nhan_id,
          name: conversation.benh_nhan_ten || "Người dùng",
          avatar: conversation.benh_nhan_avatar,
          role: conversation.benh_nhan_vai_tro,
        };
      }
      if (conversation.bac_si_id && conversation.bac_si_id !== currentUserId) {
        return {
          id: conversation.bac_si_id,
          name: conversation.bac_si_ten || "Người dùng",
          avatar: conversation.bac_si_avatar,
          role: conversation.bac_si_vai_tro,
        };
      }
      if (conversation.chuyen_gia_id && conversation.chuyen_gia_id !== currentUserId) {
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

  // Load danh sách người dùng để tạo cuộc trò chuyện (với tìm kiếm nâng cao)
  const loadUsersForChat = async () => {
    try {
      setLoadingUsers(true);
      
      // Sử dụng API tìm kiếm nâng cao
      const searchParams = {
        exclude_id: userInfo?.id_nguoi_dung, // Loại trừ chính mình
      };
      
      // Thêm filter theo vai trò nếu có
      if (selectedRoleFilter) {
        searchParams.vai_tro = selectedRoleFilter;
      }
      
      // Thêm từ khóa tìm kiếm nếu có
      if (userSearchText) {
        searchParams.search = userSearchText;
      }
      
      const res = await apiNguoiDung.searchUsersForChat(searchParams);
      
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Mở modal tạo cuộc trò chuyện
  const handleOpenCreateModal = () => {
    setModalVisible(true);
    setUserSearchText("");
    setSelectedRoleFilter("");
    loadUsersForChat();
  };

  // Đóng modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setUserSearchText("");
    setSelectedRoleFilter("");
  };

  // Xử lý khi filter thay đổi
  useEffect(() => {
    if (modalVisible) {
      // Debounce tìm kiếm
      const timer = setTimeout(() => {
        loadUsersForChat();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [userSearchText, selectedRoleFilter, modalVisible]);

  // Tạo hoặc mở cuộc trò chuyện với người dùng được chọn
  const handleCreateConversation = async (id_nguoi_nhan) => {
    try {
      setLoading(true);
      const res = await apiChat.getOrCreateConversation(id_nguoi_nhan);
      if (res.success) {
        // Chuyển đổi dữ liệu để phù hợp với format của conversation
        const newConversation = {
          ...res.data,
          benh_nhan_id: res.data.id_benh_nhan,
          bac_si_id: res.data.id_bac_si,
          chuyen_gia_id: res.data.id_chuyen_gia_dinh_duong,
          benh_nhan_ten: res.data.benh_nhan_ten,
          bac_si_ten: res.data.bac_si_ten,
          chuyen_gia_ten: res.data.chuyen_gia_ten,
          benh_nhan_avatar: res.data.benh_nhan_avatar,
          bac_si_avatar: res.data.bac_si_avatar,
          chuyen_gia_avatar: res.data.chuyen_gia_avatar,
          benh_nhan_vai_tro: res.data.benh_nhan_vai_tro,
          bac_si_vai_tro: res.data.bac_si_vai_tro,
          chuyen_gia_vai_tro: res.data.chuyen_gia_vai_tro,
        };

        // Tìm xem cuộc trò chuyện đã có trong danh sách chưa
        const existingIndex = conversations.findIndex(
          (conv) => conv.id_cuoc_tro_chuyen === newConversation.id_cuoc_tro_chuyen
        );

        if (existingIndex >= 0) {
          // Cập nhật cuộc trò chuyện hiện có
          const updatedConversations = [...conversations];
          updatedConversations[existingIndex] = newConversation;
          setConversations(updatedConversations);
        } else {
          // Thêm cuộc trò chuyện mới vào đầu danh sách
          setConversations([newConversation, ...conversations]);
        }

        // Tự động mở cuộc trò chuyện
        setSelectedConversation(newConversation);
        loadMessages(newConversation.id_cuoc_tro_chuyen);
        
        // Đóng modal
        handleCloseModal();
        messageApi.success("Cuộc trò chuyện đã được tạo");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
    } finally {
      setLoading(false);
    }
  };

  // Xử lý bắt đầu long press (3 giây)
  const handleLongPressStart = (messageId) => {
    // Xóa timer cũ nếu có
    if (longPressTimerRef.current[messageId]) {
      clearTimeout(longPressTimerRef.current[messageId]);
    }
    
    // Đặt timer 3 giây
    longPressTimerRef.current[messageId] = setTimeout(() => {
      setShowDeleteIcon((prev) => ({
        ...prev,
        [messageId]: true,
      }));
      // Xóa timer sau khi đã hiện icon
      delete longPressTimerRef.current[messageId];
    }, 3000);
  };

  // Xử lý kết thúc long press (thả tay)
  const handleLongPressEnd = (messageId) => {
    // Hủy timer nếu chưa đủ 3 giây
    if (longPressTimerRef.current[messageId]) {
      clearTimeout(longPressTimerRef.current[messageId]);
      delete longPressTimerRef.current[messageId];
    }
  };

  // Ẩn icon xóa ngay lập tức
  const handleHideDeleteIcon = (messageId) => {
    setShowDeleteIcon((prev) => {
      const newState = { ...prev };
      delete newState[messageId];
      return newState;
    });
  };

  // Tự động ẩn icon xóa sau 5 giây khi đã hiển thị
  useEffect(() => {
    const iconTimeouts = {};
    Object.keys(showDeleteIcon).forEach((messageId) => {
      if (showDeleteIcon[messageId]) {
        iconTimeouts[messageId] = setTimeout(() => {
          handleHideDeleteIcon(messageId);
        }, 5000);
      }
    });

    return () => {
      // Cleanup tất cả timeouts khi component unmount hoặc showDeleteIcon thay đổi
      Object.values(iconTimeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, [showDeleteIcon]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      // Xóa tất cả timers khi component unmount
      Object.values(longPressTimerRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // Xử lý xóa tin nhắn
  const handleDeleteMessage = async (id_tin_nhan) => {
    try {
      const res = await apiChat.deleteMessage(id_tin_nhan);
      if (res.success) {
        // Xóa tin nhắn khỏi danh sách (Socket.IO sẽ emit event, nhưng xóa ngay để UX tốt hơn)
        setMessages((prev) => prev.filter((msg) => msg.id_tin_nhan !== id_tin_nhan));
        // Ẩn icon xóa
        handleHideDeleteIcon(id_tin_nhan);
        messageApi.success("Đã xóa tin nhắn");
        // Update conversations
        loadConversations(true);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      // Toast đã được hiển thị tự động bởi axios interceptor
      // Ẩn icon xóa khi có lỗi
      handleHideDeleteIcon(id_tin_nhan);
    }
  };

  // Lọc danh sách người dùng (đã được filter ở backend)
  const filteredUsers = users;

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUserInfo(conv);
    return otherUser.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <>
      {contextHolder}
    <Layout
      className="chat-layout"
      style={
        isEmbedded
          ? {
              height: "100%",
              minHeight: 0,
            }
          : undefined
      }
    >
      {!isEmbedded && (
      <Sider width={350} className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text strong style={{ fontSize: "18px" }}>
              Tin nhắn
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleOpenCreateModal}
            >
              Tạo mới
            </Button>
          </div>
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
              description="Chưa có cuộc trò chuyện nào"
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
      )}

      <Content
        className="chat-content"
        style={
          isEmbedded
            ? {
                padding: "8px 8px 12px",
              }
            : undefined
        }
      >
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
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
              <div className="chat-header-actions">
                <Button
                  icon={<VideoCameraOutlined />}
                  onClick={handleStartVideoCall}
                  disabled={
                    !selectedConversation ||
                    callState !== "idle" ||
                    !!incomingCall
                  }
                >
                  Gọi video
                </Button>
              </div>
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
                  // So sánh id người gửi với id người dùng hiện tại
                  const currentUserId = userInfo?.id_nguoi_dung;
                  
                  // Lấy id người gửi từ tin nhắn (ưu tiên nguoi_gui_id từ join, fallback về id_nguoi_gui)
                  const msgSenderId = msg.nguoi_gui_id || msg.id_nguoi_gui;
                  
                  // So sánh với chuyển đổi sang string để tránh lỗi kiểu dữ liệu
                  const currentUserIdStr = String(currentUserId || '').trim();
                  const msgSenderIdStr = String(msgSenderId || '').trim();
                  const isMyMessage = currentUserIdStr && msgSenderIdStr && 
                    currentUserIdStr === msgSenderIdStr;
                  
                  return (
                    <div
                      key={msg.id_tin_nhan}
                      className={
                        `chat-message ${isMyMessage ? "my-message" : "other-message"} ${
                          showDeleteIcon[msg.id_tin_nhan] ? "message-selected" : ""
                        }`
                      }
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
              {typingIndicator && (
                <div className="typing-indicator-bubble">
                  {typingIndicator}
                </div>
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
                onChange={(e) => {
                  setMessageText(e.target.value);
                  notifyTyping();
                }}
                onBlur={() => stopTypingSignal()}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                    stopTypingSignal();
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
            description="Chọn một cuộc trò chuyện để bắt đầu"
            style={{ marginTop: "100px" }}
          />
        )}
      </Content>

      <VideoCallModal
        visible={callModalVisible}
        callState={callState}
        otherUser={currentCallInfo?.otherUser}
        onEndCall={() => handleEndCall("hangup")}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callDuration={callDuration}
        remoteReady={!!remoteStream}
        localReady={!!localStream}
      />

      <Modal
        open={!!incomingCall}
        footer={null}
        closable={false}
        onCancel={() => handleDeclineIncomingCall("dismissed")}
        className="incoming-call-modal"
        width={420}
        destroyOnHidden
      >
        {incomingCall && (
          <div className="incoming-call-content">
            <Avatar
              size={80}
              src={incomingCall?.callerInfo?.avatar}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <Typography.Title level={4}>
              {incomingCall?.callerInfo?.name || "Người dùng"}
            </Typography.Title>
            <Text type="secondary">Đang gọi video cho bạn</Text>
            <div className="incoming-call-actions">
              <Button
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => handleDeclineIncomingCall("declined")}
              >
                Từ chối
              </Button>
              <Button
                size="large"
                type="primary"
                icon={<PhoneOutlined />}
                onClick={handleAcceptIncomingCall}
              >
                Trả lời
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal chọn người dùng để tạo cuộc trò chuyện */}
      <Modal
        title="Chọn người dùng để bắt đầu cuộc trò chuyện"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: "16px" }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={userSearchText}
            onChange={(e) => setUserSearchText(e.target.value)}
            style={{ marginBottom: "12px" }}
          />
          <Select
            placeholder="Lọc theo vai trò"
            value={selectedRoleFilter || undefined}
            onChange={(value) => setSelectedRoleFilter(value || "")}
            allowClear
            style={{ width: "100%" }}
          >
            <Select.Option value="bac_si">Bác sĩ</Select.Option>
            <Select.Option value="chuyen_gia_dinh_duong">Chuyên gia dinh dưỡng</Select.Option>
            <Select.Option value="benh_nhan">Bệnh nhân</Select.Option>
            <Select.Option value="nhan_vien_quay">Nhân viên quầy</Select.Option>
            <Select.Option value="nhan_vien_phan_cong">Nhân viên phân công</Select.Option>
            <Select.Option value="quan_tri_vien">Quản trị viên</Select.Option>
          </Select>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text type="secondary">Đang tải...</Text>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Empty description="Không tìm thấy người dùng" />
          ) : (
            <List
              dataSource={filteredUsers}
              renderItem={(user) => {
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

                return (
                  <List.Item
                    style={{ cursor: "pointer", padding: "12px" }}
                    onClick={() => handleCreateConversation(user.id_nguoi_dung)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={user.anh_dai_dien}
                          icon={<UserOutlined />}
                          size={40}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{user.ho_ten}</Text>
                          <Tag color={getRoleColor(user.vai_tro)}>
                            {getRoleName(user.vai_tro)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          {user.email && <Text type="secondary" style={{ fontSize: "12px" }}>📧 {user.email}</Text>}
                          {user.so_dien_thoai && <Text type="secondary" style={{ fontSize: "12px" }}>📱 {user.so_dien_thoai}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Modal>
    </Layout>
    </>
  );
};

export default Chat;

