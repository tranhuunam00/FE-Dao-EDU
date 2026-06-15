import React, { useEffect, useMemo, useState } from 'react';
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

interface Session {
  id: string;
  className: string;
  classCode: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceLocked: boolean;
}

interface LeaveRequest {
  id: string;
  classSessionId: string;
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

const StudentLeaveRequests: React.FC = () => {
  const { message } = App.useApp();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const [requestResponse, dashboardResponse] = await Promise.all([
        api.get<LeaveRequest[]>('/leave-requests/mine'),
        api.get('/dashboard/student'),
      ]);
      setRequests(requestResponse.data || []);
      setSessions(dashboardResponse.data.sessions || []);
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Không thể tải danh sách xin nghỉ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableSessions = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const activeSessionIds = new Set(
      requests
        .filter((item) => ['pending', 'approved'].includes(item.status))
        .map((item) => item.classSessionId),
    );
    return sessions
      .filter(
        (session) =>
          session.date >= today &&
          !session.attendanceLocked &&
          session.status !== 'Completed' &&
          !activeSessionIds.has(session.id),
      )
      .sort((a, b) =>
        `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
      );
  }, [requests, sessions]);

  const submit = async () => {
    const values = await form.validateFields();
    try {
      setSubmitting(true);
      await api.post('/leave-requests', values);
      message.success('Đã gửi đơn xin nghỉ');
      form.resetFields();
      setOpen(false);
      await load();
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Không thể gửi đơn'));
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      await api.patch(`/leave-requests/${id}/cancel`);
      message.success('Đã hủy đơn xin nghỉ');
      await load();
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Không thể hủy đơn'));
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
            Đơn xin nghỉ
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gửi đơn cho buổi học sắp tới và theo dõi kết quả duyệt.
          </p>
        </div>
        <Button type="primary" onClick={() => setOpen(true)}>
          Gửi đơn xin nghỉ
        </Button>
      </Space>

      <Card className="glass-panel">
        <Table
          loading={loading}
          dataSource={requests}
          rowKey="id"
          scroll={{ x: 850 }}
          columns={[
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
              title: 'Trạng thái',
              dataIndex: 'status',
              render: (status: LeaveStatus) => (
                <Tag color={statusMeta[status].color}>
                  {statusMeta[status].label}
                </Tag>
              ),
            },
            {
              title: 'Gửi lúc',
              dataIndex: 'submittedAt',
              render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
            },
            {
              title: 'Phản hồi',
              dataIndex: 'reviewNote',
              render: (value: string | null) => value || '-',
            },
            {
              title: '',
              render: (_, record) =>
                record.status === 'pending' ? (
                  <Button danger size="small" onClick={() => cancel(record.id)}>
                    Hủy đơn
                  </Button>
                ) : null,
            },
          ]}
        />
      </Card>

      <Modal
        title="Gửi đơn xin nghỉ"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        okText="Gửi đơn"
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="classSessionId"
            label="Buổi học"
            rules={[{ required: true, message: 'Vui lòng chọn buổi học' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn buổi học sắp tới"
              options={availableSessions.map((session) => ({
                value: session.id,
                label: `${dayjs(session.date).format('DD/MM/YYYY')} · ${session.startTime.slice(0, 5)} · ${session.classCode || session.className}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Lý do"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do' },
              { min: 3, message: 'Lý do cần ít nhất 3 ký tự' },
            ]}
          >
            <Input.TextArea rows={4} maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentLeaveRequests;

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<{ message?: string }>(error)) return fallback;
  return error.response?.data?.message || fallback;
}
