import axiosInstance from "../axios";
import API_CONFIG from "../../configs/api_configs.js";
import axios from "axios";

const apiChat = {
  // Lấy hoặc tạo cuộc trò chuyện
  getOrCreateConversation: async (id_nguoi_nhan) => {
    try {
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}chat/conversations`,
        { id_nguoi_nhan }
      );
      return res.data;
    } catch (err) {
      console.error("Error getOrCreateConversation:", err);
      throw err;
    }
  },

  // Lấy danh sách cuộc trò chuyện
  getConversations: async () => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}chat/conversations`
      );
      return res.data;
    } catch (err) {
      console.error("Error getConversations:", err);
      throw err;
    }
  },

  // Gửi tin nhắn (có thể kèm file)
  sendMessage: async (data, file) => {
    try {
      const formData = new FormData();
      formData.append("id_cuoc_tro_chuyen", data.id_cuoc_tro_chuyen);
      formData.append("noi_dung", data.noi_dung || "");
      formData.append("loai_tin_nhan", data.loai_tin_nhan || "van_ban");
      
      if (file) {
        formData.append("file", file);
      }

      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}chat/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error sendMessage:", err);
      throw err;
    }
  },

  // Lấy danh sách tin nhắn của cuộc trò chuyện
  getMessages: async (id_cuoc_tro_chuyen, page = 1, pageSize = 50) => {
    try {
      const res = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}chat/messages/${id_cuoc_tro_chuyen}`,
        {
          params: { page, pageSize },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error getMessages:", err);
      throw err;
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (id_cuoc_tro_chuyen) => {
    try {
      const res = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}chat/messages/${id_cuoc_tro_chuyen}/read`
      );
      return res.data;
    } catch (err) {
      console.error("Error markAsRead:", err);
      throw err;
    }
  },

  // Xóa tin nhắn
  deleteMessage: async (id_tin_nhan) => {
    try {
      const res = await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}chat/messages/${id_tin_nhan}`
      );
      return res.data;
    } catch (err) {
      console.error("Error deleteMessage:", err);
      throw err;
    }
  },
};

export default apiChat;

