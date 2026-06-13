import React from 'react';
import { Form, Input, Card } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

interface AccountTabProps {
  student: any;
}

export const AccountTab: React.FC<AccountTabProps> = ({ student }) => {
  return (
    <Card
      title={<span style={{ fontFamily: 'Outfit' }}><LockOutlined /> Tài khoản đăng nhập học sinh</span>}
      className="glass-panel"
      style={{ maxWidth: '600px', margin: '0 auto', border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
    >
      {student.loginEmail ? (
        <div
          style={{
            background: 'rgba(74, 222, 128, 0.08)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#4ade80',
            fontSize: '0.9rem',
          }}
        >
          ✓ Học sinh này đã có tài khoản đăng nhập: <strong>{student.loginEmail}</strong>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#f59e0b',
            fontSize: '0.9rem',
          }}
        >
          ⚠ Học sinh này chưa có tài khoản đăng nhập. Điền email và mật khẩu để tạo tài khoản.
        </div>
      )}

      <Form.Item
        name="loginEmail"
        label="Email đăng nhập"
        rules={[
          { required: true, message: 'Vui lòng điền email đăng nhập' },
          { type: 'email', message: 'Địa chỉ email không hợp lệ' }
        ]}
      >
        <Input placeholder="student.login@gmail.com" prefix={<MailOutlined style={{ color: '#6b7280' }} />} />
      </Form.Item>

      <Form.Item name="loginPassword" label="Mật khẩu mới (để trống nếu không đổi)">
        <Input.Password placeholder="Nhập mật khẩu mới..." prefix={<LockOutlined style={{ color: '#6b7280' }} />} />
      </Form.Item>
    </Card>
  );
};
