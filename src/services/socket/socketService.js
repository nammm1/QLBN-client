import { io } from 'socket.io-client';
import API_CONFIG from '../../configs/api_configs.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.IO server
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found, cannot connect to Socket.IO');
      return;
    }

    // Get server URL from API config
    const serverUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket.id);
      this.isConnected = true;
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.emit('connect_error', error);
    });

    // Register default event listeners
    this.setupDefaultListeners();
  }

  /**
   * Setup default event listeners
   */
  setupDefaultListeners() {
    // New message event
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    // Message deleted event
    this.socket.on('message_deleted', (data) => {
      this.emit('message_deleted', data);
    });

    // Conversation updated event
    this.socket.on('conversation_updated', (data) => {
      this.emit('conversation_updated', data);
    });

    // User typing event
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    // Messages read event
    this.socket.on('messages_read', (data) => {
      this.emit('messages_read', data);
    });

    // User online/offline events
    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    // Video call signaling events
    this.socket.on('video_call_offer', (data) => {
      this.emit('video_call_offer', data);
    });

    this.socket.on('video_call_offer_ack', (data) => {
      this.emit('video_call_offer_ack', data);
    });

    this.socket.on('video_call_answer', (data) => {
      this.emit('video_call_answer', data);
    });

    this.socket.on('video_call_ice_candidate', (data) => {
      this.emit('video_call_ice_candidate', data);
    });

    this.socket.on('video_call_rejected', (data) => {
      this.emit('video_call_rejected', data);
    });

    this.socket.on('video_call_cancelled', (data) => {
      this.emit('video_call_cancelled', data);
    });

    this.socket.on('video_call_ended', (data) => {
      this.emit('video_call_ended', data);
    });

    this.socket.on('video_call_busy', (data) => {
      this.emit('video_call_busy', data);
    });

    this.socket.on('video_call_error', (data) => {
      this.emit('video_call_error', data);
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId) {
    if (this.socket?.connected && conversationId) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId) {
    if (this.socket?.connected && conversationId) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId, isTyping) {
    if (this.socket?.connected && conversationId) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId) {
    if (this.socket?.connected && conversationId) {
      this.socket.emit('mark_read', { conversationId });
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to registered listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Emit custom event to server
   */
  emitToServer(event, payload) {
    if (!this.socket || !this.socket.connected) {
      console.warn(`Socket not connected. Cannot emit ${event}`);
      return;
    }
    this.socket.emit(event, payload);
  }

  startVideoCall(payload) {
    this.emitToServer('video_call_offer', payload);
  }

  answerVideoCall(payload) {
    this.emitToServer('video_call_answer', payload);
  }

  sendVideoIceCandidate(payload) {
    this.emitToServer('video_call_ice_candidate', payload);
  }

  rejectVideoCall(payload) {
    this.emitToServer('video_call_reject', payload);
  }

  cancelVideoCall(payload) {
    this.emitToServer('video_call_cancel', payload);
  }

  endVideoCall(payload) {
    this.emitToServer('video_call_end', payload);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

