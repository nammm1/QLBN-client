import React, { useRef, useLayoutEffect } from 'react';
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
  
  // Set message API instance ngay lập tức khi component render
  // Sử dụng useLayoutEffect để set trước khi browser paint, đảm bảo API sẵn sàng
  // và useRef để tránh set lại mỗi lần re-render
  if (!initialized.current && message) {
    setMessageApi(message);
    initialized.current = true;
  }

  // Fallback: đảm bảo API được set ngay cả khi message thay đổi
  useLayoutEffect(() => {
    if (message) {
      setMessageApi(message);
    }
  }, [message]);

  return <>{children}</>;
};

export default MessageProvider;

