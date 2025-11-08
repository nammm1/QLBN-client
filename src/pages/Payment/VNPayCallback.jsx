import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const VNPayCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
  const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // VNPay: ResponseCode = '00' là thành công
        if (vnp_ResponseCode === '00' && vnp_TxnRef) {
          setPaymentStatus('success');
          message.success('Thanh toán thành công!');
        } else {
          setPaymentStatus('failed');
          const errorMessage = getVNPayErrorMessage(vnp_ResponseCode);
          message.error(errorMessage || 'Thanh toán thất bại');
        }
      } catch (error) {
        console.error('Error handling callback:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [vnp_ResponseCode, vnp_TxnRef]);
  
  const getVNPayErrorMessage = (code) => {
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản bị khóa.',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Lỗi không xác định được. Vui lòng liên hệ bộ phận hỗ trợ.',
    };
    return errorMessages[code] || 'Giao dịch không thành công.';
  };
  
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
    const amount = vnp_Amount ? parseInt(vnp_Amount) / 100 : null; // VNPay trả về số tiền * 100
    
    return (
      <div style={{ padding: '50px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
          title="Thanh toán thành công!"
          subTitle={
            <div>
              <p><strong>Mã giao dịch VNPay:</strong> {vnp_TransactionNo}</p>
              <p><strong>Mã đơn hàng:</strong> {vnp_TxnRef}</p>
              {amount && <p><strong>Số tiền:</strong> {amount.toLocaleString('vi-VN')} đ</p>}
              {vnp_OrderInfo && <p><strong>Nội dung:</strong> {vnp_OrderInfo}</p>}
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
            {vnp_TxnRef && <p><strong>Mã đơn hàng:</strong> {vnp_TxnRef}</p>}
            <p style={{ marginTop: '16px', color: '#666' }}>
              {getVNPayErrorMessage(vnp_ResponseCode)}
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

export default VNPayCallback;

