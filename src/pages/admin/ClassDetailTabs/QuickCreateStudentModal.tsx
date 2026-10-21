import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, Alert, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../../services/api';

interface QuickCreateStudentModalProps {
  visible: boolean;
  classId: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const QuickCreateStudentModal: React.FC<QuickCreateStudentModalProps> = ({
  visible,
  classId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      setSaving(true);
      const payload = {
        lastName: vals.lastName?.trim(),
        firstName: vals.firstName?.trim(),
        mobile: vals.mobile?.trim(),
        gender: vals.gender || 'Khác',
        birthdate: vals.birthdate || '2015-01-01',
        primaryAddress: vals.primaryAddress?.trim() || 'Chưa cập nhật',
        loginEmail: vals.loginEmail?.trim() || undefined,
        loginPassword: vals.loginPassword || '123456',
        status: 'Studying',
        country: 'Việt Nam',
      };

      const res = await api.post('/students', payload);
      const newStudent = res.data;
      await api.post(`/classes/${classId}/students`, { studentId: newStudent.id });

      message.success(
        `Đã tạo và thêm học sinh ${newStudent.lastName} ${newStudent.firstName} vào lớp thành công!`
      );
      form.resetFields();
      onClose();
      await onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      message.error(
        Array.isArray(msg) ? msg.join(', ') : msg || 'Không thể tạo học sinh.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <PlusOutlined style={{ color: '#059669', marginRight: 8 }} />
          Tạo học sinh mới
        </span>
      }
      open={visible}
      confirmLoading={saving}
      okText="Tạo & thêm vào lớp"
      cancelText="Hủy"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 12 }}
        initialValues={{ loginPassword: '123456', gender: 'Khác' }}
      >
        <Row gutter={12}>
          <Col span={10}>
            <Form.Item
              name="lastName"
              label="Họ"
              rules={[{ required: true, message: 'Nhập họ' }]}
            >
              <Input placeholder="Nguyễn" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              name="firstName"
              label="Tên"
              rules={[{ required: true, message: 'Nhập tên' }]}
            >
              <Input placeholder="Văn An" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="mobile"
              label="Số điện thoại phụ huynh"
              rules={[{ required: true, message: 'Nhập SĐT' }]}
            >
              <Input
                placeholder="0912345678"
                prefix={<span style={{ color: '#94a3b8' }}>📞</span>}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính">
                <Select.Option value="Nam">Nam</Select.Option>
                <Select.Option value="Nữ">Nữ</Select.Option>
                <Select.Option value="Khác">Khác</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="loginEmail" label="Email đăng nhập (tuỳ chọn)">
          <Input placeholder="example@email.com" type="email" />
        </Form.Item>
        <Form.Item
          name="loginPassword"
          label="Mật khẩu mặc định"
          rules={[{ required: true, message: 'Nhập mật khẩu' }]}
        >
          <Input.Password placeholder="123456" />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          style={{ marginTop: 4 }}
          message="Học sinh sẽ được tạo và tự động được chọn để thêm vào lớp. Có thể cập nhật đầy đủ thông tin tại trang quản lý học sinh sau."
        />
      </Form>
    </Modal>
  );
};
