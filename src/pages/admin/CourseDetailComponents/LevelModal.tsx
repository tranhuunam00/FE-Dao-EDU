import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, InputNumber, Checkbox, DatePicker, App } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/api';

interface AddLevelModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  courseId: string;
}

interface EditLevelModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedLevel: {
    id: string;
    levelName: string;
    levelCode: string;
    totalHours: number;
    isFixedHour: boolean;
    canUpgrade: boolean;
    gradebookSetting?: string;
  } | null;
}

export const AddLevelModal: React.FC<AddLevelModalProps> = ({ open, onCancel, onSuccess, courseId }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        levelName: values.levelName,
        levelCode: values.levelCode.trim(),
        totalHours: Number(values.totalHours),
        isFixedHour: !!values.isFixedHour,
        canUpgrade: !!values.canUpgrade,
        gradebookSetting: values.gradebookSetting || undefined,
        pricePerSession: Number(values.pricePerSession),
        teacherWagePerSession: Number(values.teacherWagePerSession),
        taWagePerSession: Number(values.taWagePerSession || 0),
        effectiveFrom: values.effectiveFrom.format('YYYY-MM-DD'),
      };
      await api.post(`/courses/${courseId}/levels`, payload);
      message.success('Thêm Level mới thành công!');
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể thêm Level mới.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Thêm Level mới"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Thêm Level"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
        initialValues={{ isFixedHour: false, canUpgrade: true, effectiveFrom: dayjs() }}
      >
        <Form.Item
          name="levelName"
          label="Tên Level"
          rules={[{ required: true, message: 'Vui lòng nhập tên Level!' }]}
        >
          <Input placeholder="Ví dụ: Toán 6" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="levelCode"
              label="Mã Level"
              rules={[{ required: true, message: 'Vui lòng nhập mã Level!' }]}
            >
              <Input placeholder="Ví dụ: TOAN6" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="totalHours"
              label="Tổng số giờ"
              rules={[{ required: true, message: 'Vui lòng nhập tổng số giờ!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Ví dụ: 200" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="pricePerSession"
              label="Giá học viên / buổi"
              rules={[{ required: true, message: 'Nhập giá học sinh!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="VND"
                placeholder="Ví dụ: 150,000"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="teacherWagePerSession"
              label="Lương giáo viên / buổi"
              rules={[{ required: true, message: 'Nhập lương giáo viên!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="VND"
                placeholder="Ví dụ: 80,000"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="taWagePerSession"
              label="Lương trợ giảng / buổi"
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="VND"
                placeholder="Ví dụ: 50,000"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="effectiveFrom"
          label="Ngày bắt đầu áp dụng"
          rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="gradebookSetting"
          label="Thiết lập đầu điểm (Không bắt buộc)"
        >
          <Input.TextArea placeholder="Ví dụ: Quiz 30%, Project 30%, Final 40%" rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isFixedHour"
              valuePropName="checked"
            >
              <Checkbox>Giờ học cố định</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="canUpgrade"
              valuePropName="checked"
            >
              <Checkbox>Cho phép nâng cấp</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export const EditLevelModal: React.FC<EditLevelModalProps> = ({ open, onCancel, onSuccess, selectedLevel }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && selectedLevel) {
      form.setFieldsValue({
        levelName: selectedLevel.levelName,
        levelCode: selectedLevel.levelCode,
        totalHours: selectedLevel.totalHours,
        isFixedHour: selectedLevel.isFixedHour,
        canUpgrade: selectedLevel.canUpgrade,
        gradebookSetting: selectedLevel.gradebookSetting,
      });
    }
  }, [open, selectedLevel, form]);

  const handleSubmit = async (values: any) => {
    if (!selectedLevel) return;
    setSubmitting(true);
    try {
      const payload = {
        levelName: values.levelName,
        levelCode: values.levelCode.trim(),
        totalHours: Number(values.totalHours),
        isFixedHour: !!values.isFixedHour,
        canUpgrade: !!values.canUpgrade,
        gradebookSetting: values.gradebookSetting || undefined,
      };
      await api.put(`/courses/levels/${selectedLevel.id}`, payload);
      message.success('Cập nhật Level thành công!');
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể cập nhật thông tin Level.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Sửa thông tin Level"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="levelName"
          label="Tên Level"
          rules={[{ required: true, message: 'Vui lòng nhập tên Level!' }]}
        >
          <Input placeholder="Ví dụ: Toán 6" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="levelCode"
              label="Mã Level"
              rules={[{ required: true, message: 'Vui lòng nhập mã Level!' }]}
            >
              <Input placeholder="Ví dụ: TOAN6" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="totalHours"
              label="Tổng số giờ"
              rules={[{ required: true, message: 'Vui lòng nhập tổng số giờ!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Ví dụ: 200" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="gradebookSetting"
          label="Thiết lập đầu điểm (Không bắt buộc)"
        >
          <Input.TextArea placeholder="Ví dụ: Quiz 30%, Project 30%, Final 40%" rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isFixedHour"
              valuePropName="checked"
            >
              <Checkbox>Giờ học cố định</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="canUpgrade"
              valuePropName="checked"
            >
              <Checkbox>Cho phép nâng cấp</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
