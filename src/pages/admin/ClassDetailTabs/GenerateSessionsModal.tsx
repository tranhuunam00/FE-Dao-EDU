import React, { useState, useEffect } from 'react';
import { Modal, Radio, DatePicker, Alert, Typography, Space, Form } from 'antd';
import { SyncOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

export type GenerateSessionMode = 'today' | 'startDate' | 'custom';

export interface GenerateSessionsModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (mode: GenerateSessionMode, customDate?: string) => Promise<void>;
  confirmLoading: boolean;
  classStartDate?: string | null;
  classFinishDate?: string | null;
  hasExistingSessions: boolean;
}

export const GenerateSessionsModal: React.FC<GenerateSessionsModalProps> = ({
  open,
  onCancel,
  onConfirm,
  confirmLoading,
  classStartDate,
  classFinishDate,
  hasExistingSessions,
}) => {
  const [mode, setMode] = useState<GenerateSessionMode>('today');
  const [customDate, setCustomDate] = useState<Dayjs | null>(dayjs());

  useEffect(() => {
    if (open) {
      // Default to today or start date if start date is in the future
      if (classStartDate && dayjs(classStartDate).isAfter(dayjs(), 'day')) {
        setMode('startDate');
        setCustomDate(dayjs(classStartDate));
      } else {
        setMode('today');
        setCustomDate(dayjs());
      }
    }
  }, [open, classStartDate]);

  const handleOk = async () => {
    let formattedDate: string | undefined = undefined;
    if (mode === 'custom') {
      if (!customDate) return;
      formattedDate = customDate.format('YYYY-MM-DD');
    }
    await onConfirm(mode, formattedDate);
  };

  const formattedStartDate = classStartDate 
    ? dayjs(classStartDate).format('DD/MM/YYYY') 
    : 'Chưa cấu hình';
  const formattedToday = dayjs().format('DD/MM/YYYY');

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SyncOutlined style={{ color: '#6366f1' }} />
          <span>{hasExistingSessions ? 'Sinh lại & Đồng bộ lịch học' : 'Sinh danh sách buổi học'}</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Xác nhận sinh lịch"
      cancelText="Hủy"
      width={520}
      okButtonProps={{
        style: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' },
      }}
    >
      <div style={{ padding: '8px 0' }}>
        <Text style={{ display: 'block', marginBottom: 16 }}>
          Chọn mốc thời gian bắt đầu sinh lịch học theo thời khóa biểu cố định:
        </Text>

        <Form layout="vertical">
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <Radio value="today">
              <Space direction="vertical" size={2}>
                <Text strong>Từ hôm nay ({formattedToday})</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Khuyên dùng — Chỉ cập nhật/sinh các buổi tương lai, an toàn tuyệt đối cho các buổi cũ.
                </Text>
              </Space>
            </Radio>

            <Radio value="startDate" disabled={!classStartDate}>
              <Space direction="vertical" size={2}>
                <Text strong>Từ ngày khai giảng ({formattedStartDate})</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Sinh lại toàn bộ lịch từ đầu khóa học (các buổi chưa điểm danh).
                </Text>
              </Space>
            </Radio>

            <Radio value="custom">
              <Space direction="vertical" size={2}>
                <Text strong>Chọn ngày bắt đầu cụ thể</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Tự chọn ngày áp dụng để linh hoạt điều chỉnh lịch từ một mốc tùy ý.
                </Text>
              </Space>
            </Radio>
          </Radio.Group>

          {mode === 'custom' && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(99, 102, 241, 0.06)', borderRadius: 8 }}>
              <Form.Item
                label={<Text strong>Ngày bắt đầu sinh lịch</Text>}
                required
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  value={customDate}
                  onChange={(d) => setCustomDate(d)}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  allowClear={false}
                  disabledDate={(current) => {
                    if (classFinishDate && current) {
                      return current.isAfter(dayjs(classFinishDate), 'day');
                    }
                    return false;
                  }}
                />
              </Form.Item>
            </div>
          )}
        </Form>

        <Alert
          style={{ marginTop: 20 }}
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined style={{ color: '#10b981' }} />}
          message="Bảo toàn dữ liệu tài chính & điểm danh"
          description="Hệ thống chỉ xóa và tái tạo các buổi học ở trạng thái Chưa diễn ra (Scheduled) và chưa khóa điểm danh từ ngày được chọn. Các buổi đã hoàn thành, đang học hoặc đã chốt điểm danh sẽ được giữ nguyên 100%."
        />
      </div>
    </Modal>
  );
};
