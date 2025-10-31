import React, { useRef } from 'react';
import { App } from 'antd';
import { setMessageApi } from '../utils/toast';

/**
 * MessageProvider component
 * Khởi tạo message API từ Ant Design App hook và set vào toast utility
 * Component này cần được render bên trong <AntdApp>
 */
const MessageProvider = ({ children }) => {
  const { message } = App.useApp();
  const initialized = useRef(false);
  
  // Set message API instance một lần khi mount
  // Sử dụng useRef để tránh set lại mỗi lần re-render
  if (!initialized.current) {
    setMessageApi(message);
    initialized.current = true;
  }

  return <>{children}</>;
};

export default MessageProvider;

