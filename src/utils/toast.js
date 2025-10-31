import { message } from 'antd';

/**
 * Toast utility functions để hiển thị thông báo
 * Sử dụng Ant Design message API
 */

/**
 * Hiển thị thông báo thành công
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastSuccess = (content, duration = 3) => {
  message.success(content, duration);
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastError = (content, duration = 3) => {
  message.error(content, duration);
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastWarning = (content, duration = 3) => {
  message.warning(content, duration);
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} content - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (giây), mặc định 3s
 */
export const showToastInfo = (content, duration = 3) => {
  message.info(content, duration);
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
