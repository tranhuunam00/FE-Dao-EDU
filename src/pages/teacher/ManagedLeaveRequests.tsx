import React, { useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import api from '../../services/api';

type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface LeaveRequest {
  id: string;
  studentCode: string;
  studentName: string;
  className: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewNote: string | null;
}

const statusMeta: Record<LeaveStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'gold' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
  cancelled: { label: 'Đã hủy', color: 'default' },
};

const ManagedLeaveRequests: React.FC = () => {
  const { message } = App.useApp();
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LeaveStatus | undefined>('pending');
  const [target, setTarget] = useState<LeaveRequest | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewing, setReviewing] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<LeaveRequest[]>('/leave-requests', {
        params: status ? { status } : undefined,
      });
      setItems(data || []);
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Không thể tải đơn xin nghỉ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
    // Reload when the status filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openReview = (
    request: LeaveRequest,
    nextDecision: 'approved' | 'rejected',
  ) => {
    setTarget(request);
    setDecision(nextDecision);
    form.resetFields();
  };

  const review = async () => {
    if (!target) return;
    const values = await form.validateFields();
    try {
      setReviewing(true);
      await api.patch(`/leave-requests/${target.id}/review`, {
        decision,
        reviewNote: values.reviewNote,
      });
      message.success(
        decision === 'approved' ? 'Đã duyệt đơn xin nghỉ' : 'Đã từ chối đơn',
      );
      setTarget(null);
      await load();
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Không thể xử lý đơn'));
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div>
      <Space
        align="start"
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 20 }}
      >
        <div>
          <h2 style={{ color: '#fff', fontSize: 30, marginBottom: 4 }}>
            Quản lý đơn xin nghỉ
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Duyệt đơn và đồng bộ trạng thái nghỉ có phép vào điểm danh.
          </p>
        </div>
        <Select
          value={status}
          style={{ width: 170 }}
          onChange={setStatus}
          allowClear
          placeholder="Tất cả trạng thái"
          options={[
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'approved', label: 'Đã duyệt' },
            { value: 'rejected', label: 'Từ chối' },
            { value: 'cancelled', label: 'Đã hủy' },
          ]}
        />
      </Space>

      <Card className="glass-panel">
        <Table
          loading={loading}
          dataSource={items}
          rowKey="id"
          scroll={{ x: 1050 }}
          columns={[
            {
              title: 'Học sinh',
              render: (_, record) => (
                <div>
                  <b>{record.studentName}</b>
                  <div style={{ opacity: 0.65 }}>{record.studentCode}</div>
                </div>
              ),
            },
            {
              title: 'Buổi học',
              render: (_, record) => (
                <div>
                  <b>{record.className}</b>
                  <div style={{ opacity: 0.65 }}>
                    {dayjs(record.sessionDate).format('DD/MM/YYYY')} ·{' '}
                    {record.startTime.slice(0, 5)}-{record.endTime.slice(0, 5)}
                  </div>
                </div>
              ),
            },
            { title: 'Lý do', dataIndex: 'reason' },
            {
              title: 'Gửi lúc',
              dataIndex: 'submittedAt',
              render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              render: (value: LeaveStatus) => (
                <Tag color={statusMeta[value].color}>
                  {statusMeta[value].label}
                </Tag>
              ),
            },
            {
              title: 'Phản hồi',
              dataIndex: 'reviewNote',
              render: (value: string | null) => value || '-',
            },
            {
              title: '',
              fixed: 'right',
              width: 170,
              render: (_, record) =>
                record.status === 'pending' ? (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => openReview(record, 'approved')}
                    >
                      Duyệt
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={() => openReview(record, 'rejected')}
                    >
                      Từ chối
                    </Button>
                  </Space>
                ) : null,
            },
          ]}
        />
      </Card>

      <Modal
        title={decision === 'approved' ? 'Duyệt đơn xin nghỉ' : 'Từ chối đơn'}
        open={!!target}
        onCancel={() => setTarget(null)}
        onOk={review}
        okText={decision === 'approved' ? 'Duyệt đơn' : 'Từ chối'}
        okButtonProps={{ danger: decision === 'rejected' }}
        confirmLoading={reviewing}
      >
        {target && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <b>{target.studentName}</b> · {target.className}
            <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
              {dayjs(target.sessionDate).format('DD/MM/YYYY')} ·{' '}
              {target.startTime.slice(0, 5)}-{target.endTime.slice(0, 5)}
            </div>
            <div style={{ marginTop: 8 }}>{target.reason}</div>
          </Card>
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="reviewNote" label="Phản hồi">
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagedLeaveRequests;

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<{ message?: string }>(error)) return fallback;
  return error.response?.data?.message || fallback;
}
