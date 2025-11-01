// Medical Chat API Service
// This service handles AI-powered medical chat responses
import axiosInstance from '../axios.js';
import API_CONFIG from '../../configs/api_configs.js';

/**
 * Medical knowledge base - contains common medical Q&A (fallback)
 */
const medicalKnowledgeBase = {
  // General health questions
  "cảm cúm": {
    message: `🤒 **Các triệu chứng cảm cúm thường gặp:**

• Sốt cao (38-40°C)
• Đau đầu, đau mỏi cơ thể
• Ho khan hoặc ho có đờm
• Nghẹt mũi, chảy nước mũi
• Đau họng
• Mệt mỏi, chán ăn

**Cách điều trị:**
• Nghỉ ngơi đầy đủ, uống nhiều nước
• Dùng thuốc hạ sốt (Paracetamol) theo chỉ định
• Ăn uống đầy đủ chất dinh dưỡng
• Rửa tay thường xuyên để tránh lây lan

💡 **Lưu ý:** Nếu sốt cao không giảm sau 3 ngày hoặc có triệu chứng nặng, nên đến bệnh viện khám ngay.`,
  },
  "đặt lịch": {
    message: `📅 **Hướng dẫn đặt lịch khám bệnh:**

**Cách 1: Đặt lịch online**
1. Vào trang "Đặt lịch khám" trên website
2. Chọn chuyên khoa và bác sĩ
3. Chọn ngày và giờ khám phù hợp
4. Điền thông tin bệnh nhân
5. Xác nhận và thanh toán (nếu có)

**Cách 2: Đặt lịch qua điện thoại**
• Hotline: 1900-xxxx
• Thời gian: 7:00 - 20:00 (hàng ngày)

**Cách 3: Đặt lịch trực tiếp tại bệnh viện**
• Quầy tiếp đón: Tầng 1
• Thời gian: 7:00 - 17:00 (hàng ngày)

💡 **Lưu ý:** Nên đặt lịch trước ít nhất 1 ngày để có nhiều lựa chọn thời gian.`,
  },
  "thời gian": {
    message: `⏰ **Thời gian làm việc của bệnh viện:**

**Thời gian khám bệnh:**
• **Thứ 2 - Thứ 6:** 7:00 - 17:00
• **Thứ 7:** 7:00 - 12:00
• **Chủ nhật:** Nghỉ (chỉ khám cấp cứu)

**Phòng cấp cứu:**
• Hoạt động 24/7

**Dịch vụ khác:**
• Xét nghiệm: 7:00 - 16:00
• Chẩn đoán hình ảnh: 7:00 - 17:00
• Phòng thuốc: 7:00 - 17:00

📞 **Liên hệ:** 1900-xxxx để biết thêm chi tiết.`,
  },
  "đăng ký": {
    message: `📝 **Hướng dẫn đăng ký khám online:**

**Bước 1:** Truy cập website và đăng nhập
• Nếu chưa có tài khoản, chọn "Đăng ký"
• Điền đầy đủ thông tin cá nhân

**Bước 2:** Chọn dịch vụ khám
• Chọn chuyên khoa cần khám
• Chọn bác sĩ (hoặc để hệ thống tự phân bổ)
• Chọn ngày và giờ khám

**Bước 3:** Hoàn tất đặt lịch
• Xác nhận thông tin
• Thanh toán phí khám (nếu có)
• Nhận mã đặt lịch qua SMS/Email

**Lợi ích:**
✓ Tiết kiệm thời gian
✓ Chủ động lựa chọn thời gian khám
✓ Không cần đến bệnh viện sớm

💡 **Hỗ trợ:** Gọi 1900-xxxx nếu cần hỗ trợ trong quá trình đăng ký.`,
  },
  "dịch vụ": {
    message: `🏥 **Các dịch vụ y tế hiện có:**

**Chuyên khoa:**
• Khoa Nội
• Khoa Ngoại
• Khoa Sản - Phụ khoa
• Khoa Nhi
• Khoa Tai - Mũi - Họng
• Khoa Mắt
• Khoa Da liễu
• Khoa Thần kinh
• Khoa Tim mạch
• Khoa Tiêu hóa
• Khoa Dinh dưỡng

**Dịch vụ hỗ trợ:**
• Xét nghiệm
• Chẩn đoán hình ảnh (X-quang, Siêu âm, CT, MRI)
• Nội soi
• Phòng thuốc
• Cấp cứu 24/7

**Dịch vụ đặc biệt:**
• Khám sức khỏe tổng quát
• Tư vấn dinh dưỡng
• Chăm sóc sức khỏe tại nhà

📞 Để biết chi tiết về từng dịch vụ, vui lòng gọi: 1900-xxxx`,
  },
  "ăn uống": {
    message: `🍎 **Lời khuyên về chế độ ăn uống lành mạnh:**

**Nguyên tắc cơ bản:**
• Ăn đủ 3 bữa chính + 2 bữa phụ
• Uống đủ 2-2.5 lít nước/ngày
• Ăn đa dạng các loại thực phẩm

**Thực phẩm nên ăn:**
✓ Rau xanh, trái cây (5 phần/ngày)
✓ Ngũ cốc nguyên hạt
✓ Protein từ cá, thịt nạc, đậu
✓ Sữa và sản phẩm từ sữa
✓ Các loại hạt

**Thực phẩm nên hạn chế:**
✗ Đồ ăn nhanh, đồ chiên rán
✗ Đường, bánh kẹo ngọt
✗ Rượu bia, đồ uống có ga
✗ Muối (không quá 5g/ngày)

**Lưu ý:**
• Nhai kỹ, ăn chậm
• Không bỏ bữa sáng
• Ăn vừa đủ, không ăn quá no

💡 **Tư vấn chuyên sâu:** Đặt lịch với chuyên gia dinh dưỡng để được tư vấn chế độ ăn phù hợp với tình trạng sức khỏe của bạn.`,
  },
};

/**
 * Search for relevant answer in knowledge base
 */
const findAnswer = (question) => {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Xử lý lời chào
  if (lowerQuestion === 'chào' || lowerQuestion === 'xin chào' || lowerQuestion === 'hello' || 
      lowerQuestion === 'hi' || lowerQuestion === 'chào bạn' || lowerQuestion === 'chào anh' || 
      lowerQuestion === 'chào chị' || lowerQuestion.startsWith('chào')) {
    return `👋 Xin chào! Tôi rất vui được hỗ trợ bạn!

Tôi là trợ lý y tế AI và có thể giúp bạn:
✅ Tư vấn về các triệu chứng bệnh thường gặp
✅ Hướng dẫn đặt lịch khám bệnh
✅ Thông tin về các dịch vụ y tế
✅ Lời khuyên về sức khỏe và dinh dưỡng
✅ Giải đáp thắc mắc về quy trình khám bệnh

💡 **Lưu ý:** Tôi chỉ cung cấp thông tin tham khảo. Để được chẩn đoán chính xác, vui lòng đến bệnh viện khám trực tiếp.

Bạn có thể hỏi tôi bất kỳ câu hỏi nào về y tế hoặc chọn một trong các câu hỏi gợi ý bên dưới! 😊`;
  }
  
  // Search for keywords
  for (const [keyword, data] of Object.entries(medicalKnowledgeBase)) {
    if (lowerQuestion.includes(keyword)) {
      return data.message;
    }
  }
  
  // Default responses based on question type
  if (lowerQuestion.includes("triệu chứng") || lowerQuestion.includes("bệnh")) {
    return `🏥 Về triệu chứng bạn đang gặp phải, tôi khuyên bạn nên:

1. **Theo dõi triệu chứng:** Ghi lại các triệu chứng, thời gian xuất hiện, mức độ nghiêm trọng
2. **Đến khám bác sĩ:** Nếu triệu chứng kéo dài hoặc nghiêm trọng, nên đến bệnh viện khám ngay
3. **Không tự ý dùng thuốc:** Chỉ dùng thuốc khi có chỉ định của bác sĩ

💡 **Quan trọng:** Tôi không thể thay thế chẩn đoán của bác sĩ. Vui lòng đến bệnh viện để được khám và tư vấn chính xác.

📞 **Đặt lịch khám:** Gọi 1900-xxxx hoặc đặt lịch online trên website.`;
  }
  
  if (lowerQuestion.includes("giá") || lowerQuestion.includes("phí") || lowerQuestion.includes("chi phí")) {
    return `💰 **Thông tin về chi phí khám bệnh:**

Chi phí khám bệnh phụ thuộc vào:
• Chuyên khoa khám
• Các dịch vụ kèm theo (xét nghiệm, chẩn đoán hình ảnh...)
• Bảo hiểm y tế

**Phí khám cơ bản:** Từ 100.000 - 300.000 VNĐ

💡 **Để biết chi phí chính xác:** Vui lòng liên hệ bộ phận tư vấn qua hotline: 1900-xxxx hoặc đến trực tiếp quầy tiếp đón tại bệnh viện.

📋 Bệnh viện hỗ trợ thanh toán qua:
• Tiền mặt
• Thẻ ATM, thẻ tín dụng
• Chuyển khoản
• Bảo hiểm y tế`;
  }
  
  if (lowerQuestion.includes("địa chỉ") || lowerQuestion.includes("địa điểm") || lowerQuestion.includes("ở đâu")) {
    return `📍 **Địa chỉ bệnh viện:**

🏥 **Tên bệnh viện:** [Tên bệnh viện]
📮 **Địa chỉ:** [Địa chỉ đầy đủ]
📞 **Hotline:** 1900-xxxx
📧 **Email:** info@hospital.com

**Hướng dẫn đi lại:**
• **Xe bus:** Tuyến số [X], dừng tại [Tên điểm dừng]
• **Xe máy:** Có bãi giữ xe miễn phí
• **Ô tô:** Có bãi đỗ xe (có phí)

**Giờ làm việc:**
• Thứ 2 - Thứ 6: 7:00 - 17:00
• Thứ 7: 7:00 - 12:00
• Chủ nhật: Nghỉ (chỉ khám cấp cứu)

📍 **Bản đồ:** Xem trên Google Maps: [Link Google Maps]`;
  }
  
  // Default response
  return `Cảm ơn bạn đã liên hệ! Tôi là trợ lý y tế AI và có thể hỗ trợ bạn về:

✅ Tư vấn các triệu chứng bệnh thường gặp
✅ Hướng dẫn đặt lịch khám bệnh
✅ Thông tin về các dịch vụ y tế
✅ Lời khuyên về sức khỏe và dinh dưỡng
✅ Giải đáp thắc mắc về quy trình khám bệnh

💡 **Lưu ý quan trọng:** Tôi chỉ có thể cung cấp thông tin tham khảo. Để được chẩn đoán chính xác, vui lòng đến bệnh viện khám trực tiếp.

📞 **Liên hệ trực tiếp:** Hotline 1900-xxxx (7:00 - 20:00 hàng ngày)

Bạn có thể hỏi cụ thể hơn về:
• Triệu chứng bệnh
• Cách đặt lịch khám
• Thông tin dịch vụ
• Hoặc bất kỳ câu hỏi nào khác về y tế`;
}

/**
 * Medical Chat Service
 */
const medicalChatService = {
  /**
   * Get AI response for medical question using OpenAI API
   * @param {string} question - User's question
   * @param {Array} conversationHistory - Previous messages in conversation
   * @returns {Promise<{message: string}>}
   */
  getResponse: async (question, conversationHistory = []) => {
    try {
      // Try to call OpenAI API via backend
      const response = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}medical-chat/chat`,
        {
          message: question,
          conversationHistory: conversationHistory.slice(-10), // Chỉ gửi 10 tin nhắn gần nhất để tránh quá dài
        }
      );

      // Xử lý cả trường hợp success: true và success: false nhưng vẫn có message
      if (response.data && response.data.message) {
        return {
          message: response.data.message,
          timestamp: response.data.timestamp || new Date().toISOString(),
          success: response.data.success !== false, // Lưu trạng thái success
        };
      }

      // Nếu response không đúng format, fallback về knowledge base
      throw new Error('Invalid response format');
    } catch (error) {
      // Nếu error có response data và có message, trả về message đó
      if (error.response?.data?.message) {
        console.warn('Backend returned error message:', error.response.data.message);
        return {
          message: error.response.data.message,
          timestamp: error.response.data.timestamp || new Date().toISOString(),
          success: false,
        };
      }

      console.warn('OpenAI API call failed, using fallback knowledge base:', error);
      
      // Fallback to knowledge base if API fails completely
      // Simulate API delay for consistency
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      
      const message = findAnswer(question);
      
      return {
        message,
        timestamp: new Date().toISOString(),
        success: true,
      };
    }
  },
  
  /**
   * Clear chat history (local storage)
   */
  clearHistory: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medical_chat_history');
    }
  },
  
  /**
   * Clear all chat data (medical chat + messaging chat)
   * Should be called on logout or login to prevent chat data from persisting between users
   */
  clearAllChatData: () => {
    if (typeof window !== 'undefined') {
      // Clear medical chat history
      localStorage.removeItem('medical_chat_history');
      
      // Clear messaging chat data from sessionStorage
      sessionStorage.removeItem('chat_conversations');
      sessionStorage.removeItem('chat_selected_conversation_id');
      
      // Clear all chat messages and scroll positions from sessionStorage
      // We need to loop through all sessionStorage keys that start with 'chat_messages_' or 'chat_scroll_'
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('chat_messages_') || key.startsWith('chat_scroll_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Also clear from localStorage if any
      localStorage.removeItem('chat_selected_conversation_id');
    }
  },
  
  /**
   * Save chat history
   */
  saveHistory: (messages) => {
    if (typeof window !== 'undefined') {
      try {
        // Serialize messages (convert Date to ISO string)
        const serialized = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        localStorage.setItem('medical_chat_history', JSON.stringify(serialized));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  },
  
  /**
   * Load chat history
   */
  loadHistory: () => {
    if (typeof window !== 'undefined') {
      try {
        const history = localStorage.getItem('medical_chat_history');
        if (history) {
          const parsed = JSON.parse(history);
          // Deserialize messages (convert ISO string back to Date)
          return parsed.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
        }
        return [];
      } catch (error) {
        console.error('Failed to load chat history:', error);
        return [];
      }
    }
    return [];
  },
};

export { medicalChatService };
export default medicalChatService;

