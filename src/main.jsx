import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/toast.css"; // Import custom toast styles
import { store } from './store/config.js';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import MessageProvider from './components/MessageProvider';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#096dd9',
            colorSuccess: '#52c41a',
            colorWarning: '#faad14',
            colorError: '#ff4d4f',
            borderRadius: 8,
          },
        }}
      >
        <AntdApp>
          <MessageProvider>
            <App />
          </MessageProvider>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);