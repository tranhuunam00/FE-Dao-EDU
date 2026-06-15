import { useCallback, useEffect, useState } from 'react';
import { App, Card, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { MessagesSquare } from 'lucide-react';
import api from '../../services/api';

const { Title, Text } = Typography;

type ContactRequestType =
  | 'ENROLLMENT'
  | 'COURSE_CONSULTATION'
  | 'TECHNICAL_SUPPORT'
  | 'PARTNERSHIP'
  | 'OTHER';
type ContactRequestStatus = 'NEW' | 'CONTACTED' | 'RESOLVED';

interface ContactRequest {
  id: string;
  fullName: string;
  phone: string;
  type: ContactRequestType;
  status: ContactRequestStatus;
  createdAt: string;
}

const typeLabels: Record<ContactRequestType, string> = {
  ENROLLMENT: 'Đăng ký học',
  COURSE_CONSULTATION: 'Tư vấn khóa học',
  TECHNICAL_SUPPORT: 'Hỗ trợ kỹ thuật',
  PARTNERSHIP: 'Hợp tác',
  OTHER: 'Khác',
};

const statusOptions = [
  { value: 'NEW', label: 'Mới' },
  { value: 'CONTACTED', label: 'Đã liên hệ' },
  { value: 'RESOLVED', label: 'Đã xử lý' },
];

function ContactRequestsInner() {
  const { message } = App.useApp();
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState<ContactRequestType>();
  const [status, setStatus] = useState<ContactRequestStatus>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact-requests', {
        params: { page, limit: 20, type, status },
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      message.error('Không thể tải danh sách liên hệ.');
    } finally {
      setLoading(false);
    }
  }, [message, page, status, type]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateStatus = async (
    id: string,
    nextStatus: ContactRequestStatus,
  ) => {
    try {
      await api.patch(`/contact-requests/${id}/status`, {
        status: nextStatus,
      });
      message.success('Đã cập nhật trạng thái liên hệ.');
      await load();
    } catch (error: unknown) {
      message.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Không thể cập nhật trạng thái.'
          : 'Không thể cập nhật trạng thái.',
      );
    }
  };

  const columns: ColumnsType<ContactRequest> = [
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 240,
      render: (_, row) => (
        <div>
          <strong>{row.fullName}</strong>
          <div>
            <a href={`tel:${row.phone}`}>{row.phone}</a>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại liên hệ',
      dataIndex: 'type',
      width: 190,
      render: (value: ContactRequestType) => (
        <Tag color={value === 'ENROLLMENT' ? 'purple' : 'default'}>
          {typeLabels[value]}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 190,
      render: (value: ContactRequestStatus, row) => (
        <Select
          value={value}
          style={{ width: 150 }}
          options={statusOptions}
          onChange={(nextStatus) =>
            void updateStatus(row.id, nextStatus as ContactRequestStatus)
          }
        />
      ),
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'createdAt',
      width: 190,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Space>
          <MessagesSquare size={28} color="var(--primary)" />
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
            Yêu cầu liên hệ
          </Title>
        </Space>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Tiếp nhận đăng ký học, tư vấn, hỗ trợ kỹ thuật và các yêu cầu khác.
        </div>
      </div>

      <Card className="glass-panel" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Loại liên hệ"
            style={{ width: 200 }}
            value={type}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
            options={Object.entries(typeLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 180 }}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={statusOptions}
          />
          <Text type="secondary">{total} yêu cầu</Text>
        </Space>
      </Card>

      <Card className="glass-panel">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={items}
          columns={columns}
          scroll={{ x: 820 }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </Card>
    </div>
  );
}

export default function ContactRequests() {
  return (
    <App>
      <ContactRequestsInner />
    </App>
  );
}
