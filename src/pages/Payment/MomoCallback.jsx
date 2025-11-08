import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const MomoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  const resultCode = searchParams.get('resultCode');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const orderInfo = searchParams.get('orderInfo');
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Nếu thanh toán thành công (resultCode = 0)
        if (resultCode === '0' && orderId) {
          // Có thể gọi API để xác nhận lại thanh toán
          // Hoặc backend đã xử lý qua webhook/IPN
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
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
      </div>
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
                Hóa đơn của bạn đã được cập nhật. Vui lòng kiểm tra trong mục "Hóa đơn".
              </p>
            </div>
          }
          extra={[
            <Button 
              type="primary" 
              key="invoices" 
              size="large"
              onClick={() => navigate('/invoices')}
              style={{ marginRight: '8px' }}
            >
              Xem hóa đơn
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
            onClick={() => navigate('/invoices')}
            style={{ marginRight: '8px' }}
          >
            Thử lại
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

