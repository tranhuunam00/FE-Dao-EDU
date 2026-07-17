import React from 'react';
import { Alert } from 'antd';

interface FormErrorAlertProps {
  error: any; // Có thể là string, array of strings, hoặc error object từ Axios
}

export const FormErrorAlert: React.FC<FormErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  let messageText = 'Lỗi lưu dữ liệu';
  let descriptionText = '';

  if (typeof error === 'string') {
    descriptionText = error;
  } else if (Array.isArray(error)) {
    messageText = 'Lỗi dữ liệu đầu vào';
    descriptionText = error.join(', ');
  } else if (error.response?.data?.message) {
    const backendMsg = error.response.data.message;
    if (Array.isArray(backendMsg)) {
      messageText = 'Lỗi dữ liệu đầu vào';
      descriptionText = backendMsg.join(', ');
    } else {
      descriptionText = backendMsg;
    }
  } else if (error.message) {
    messageText = 'Lỗi kết nối hệ thống';
    descriptionText = error.message;
  } else {
    descriptionText = 'Vui lòng kiểm tra lại thông tin và thử lại.';
  }

  // Tự động phát hiện lỗi trùng lặp SĐT / Email / Tài khoản
  const descriptionLower = descriptionText.toLowerCase();
  const isDuplicate = 
    descriptionLower.includes('already exists') || 
    descriptionLower.includes('trùng') ||
    descriptionLower.includes('tồn tại') ||
    descriptionLower.includes('duplicate') ||
    descriptionLower.includes('conflict') ||
    descriptionLower.includes('email');

  if (isDuplicate) {
    messageText = 'Tài khoản, SĐT hoặc Email đã được sử dụng';
    descriptionText = 'Email, Số điện thoại hoặc Tài khoản đăng nhập này đã tồn tại trên hệ thống. Vui lòng kiểm tra lại và sử dụng thông tin khác để tạo/cập nhật tài khoản.';
  }

  return (
    <Alert
      message={<span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{messageText}</span>}
      description={<span style={{ fontSize: '0.88rem' }}>{descriptionText}</span>}
      type="error"
      showIcon
      closable
      style={{
        marginBottom: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        background: 'rgba(239, 68, 68, 0.08)',
        color: '#f87171',
      }}
    />
  );
};
