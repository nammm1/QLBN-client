import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const decodeExtraData = (rawValue) => {
  if (!rawValue) return null;
  try {
    const normalized = rawValue.replace(/ /g, '+');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (error) {
    console.warn('Không thể decode extraData từ Momo:', error);
    return null;
  }
};

const MomoCallback = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [redirectPath, setRedirectPath] = useState('/invoices');
  const [countdown, setCountdown] = useState(3);

  const resultCode = searchParams.get('resultCode');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const orderInfo = searchParams.get('orderInfo');
  const extraDataRaw = searchParams.get('extraData');

  const decodedExtraData = useMemo(() => decodeExtraData(extraDataRaw), [extraDataRaw]);

  useEffect(() => {
    const fallbackRedirect =
      decodedExtraData?.redirectPath && decodedExtraData.redirectPath.startsWith('/')
        ? decodedExtraData.redirectPath
        : decodedExtraData?.source === 'cashier'
        ? '/receptionist/billing'
        : '/invoices';
    setRedirectPath(fallbackRedirect);
  }, [decodedExtraData]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (resultCode === '0' && orderId) {
          setPaymentStatus('success');
          message.success('Thanh toán thành công!');
        } else {
          setPaymentStatus('failed');
          message.error('Thanh toán thất bại hoặc đã bị hủy');
        }
      } catch (error) {
        console.error('Error handling callback:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [resultCode, orderId]);

  useEffect(() => {
    if (paymentStatus !== 'success' || !redirectPath) {
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentStatus, redirectPath]);

  useEffect(() => {
    if (paymentStatus !== 'success' || countdown > 0 || !redirectPath) {
      return;
    }

    navigate(redirectPath, {
      replace: true,
      state: { paymentSuccess: true, orderId },
    });
  }, [paymentStatus, countdown, redirectPath, orderId, navigate]);
  
  if (loading) {
    return (
      <Spin
        size="large"
        tip="Đang xử lý kết quả thanh toán..."
        fullscreen
      />
    );
  }
  
  if (paymentStatus === 'success') {
    return (
      <div style={{ padding: '50px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
          title="Thanh toán thành công!"
          subTitle={
            <div>
              <p><strong>Mã đơn hàng:</strong> {orderId}</p>
              {amount && <p><strong>Số tiền:</strong> {parseInt(amount).toLocaleString('vi-VN')} đ</p>}
              {orderInfo && <p><strong>Nội dung:</strong> {orderInfo}</p>}
              <p style={{ marginTop: '16px', color: '#666' }}>
                Hóa đơn của bạn đã được cập nhật. Hệ thống sẽ tự động chuyển bạn về trang trước sau {countdown} giây.
              </p>
            </div>
          }
          extra={[
            <Button 
              type="primary" 
              key="invoices" 
              size="large"
              onClick={() => navigate(redirectPath, { replace: true, state: { paymentSuccess: true, orderId } })}
              style={{ marginRight: '8px' }}
            >
              Quay lại trang trước
            </Button>,
            <Button 
              key="home" 
              size="large"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    );
  }
  
  return (
    <div style={{ padding: '50px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Result
        icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />}
        title="Thanh toán thất bại"
        subTitle={
          <div>
            {orderId && <p><strong>Mã đơn hàng:</strong> {orderId}</p>}
            <p style={{ marginTop: '16px', color: '#666' }}>
              {resultCode === '1006' && 'Giao dịch đã bị hủy bởi người dùng.'}
              {resultCode === '1004' && 'Giao dịch không thành công do số tiền không hợp lệ.'}
              {resultCode === '1005' && 'Giao dịch không thành công do số tiền vượt quá hạn mức.'}
              {!resultCode && 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
            </p>
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            key="retry" 
            size="large"
            onClick={() => navigate(redirectPath)}
            style={{ marginRight: '8px' }}
          >
            Quay lại trang trước
          </Button>,
          <Button 
            key="home" 
            size="large"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
};

export default MomoCallback;

