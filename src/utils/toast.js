import { App } from 'antd';

/**
 * Toast utility functions để hiển thị thông báo
 * Sử dụng Ant Design v5 message hook API
 * 
 * Các hàm này sẽ sử dụng message instance từ App.useApp() hook
 * Để sử dụng, cần wrap component trong <AntdApp> và gọi hook useApp()
 */

// Tạo một global message instance holder
let messageApi = null;

/**
 * Set message API instance từ hook
 * @param {object} api - Message API từ App.useApp().message
 */
export const setMessageApi = (api) => {
  messageApi = api;
};

/**
 * Get message API instance
 * @returns {object} Message API instance hoặc null
 */
const getMessageApi = () => {
  return messageApi;
};

/**
 * Hiển thị thông báo thành công
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastSuccess = (content, duration = 3) => {
  const api = getMessageApi();
  if (api) {
    api.success(content, duration);
  } else {
    // Fallback nếu chưa có api instance
    console.warn('Message API not initialized. Make sure to use MessageProvider.');
  }
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastError = (content, duration = 3) => {
  const api = getMessageApi();
  if (api) {
    api.error(content, duration);
  } else {
    console.warn('Message API not initialized. Make sure to use MessageProvider.');
  }
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastWarning = (content, duration = 3) => {
  const api = getMessageApi();
  if (api) {
    api.warning(content, duration);
  } else {
    console.warn('Message API not initialized. Make sure to use MessageProvider.');
  }
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastInfo = (content, duration = 3) => {
  const api = getMessageApi();
  if (api) {
    api.info(content, duration);
  } else {
    console.warn('Message API not initialized. Make sure to use MessageProvider.');
  }
};

/**
 * Object chứa tất cả các hàm toast để import dễ dàng
 */
const toast = {
  success: showToastSuccess,
  error: showToastError,
  warning: showToastWarning,
  info: showToastInfo,
};

export default toast;
