import { useCallback, useEffect, useState } from 'react';
import { Card, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title } = Typography;

interface NotificationLog {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  eventType: string;
  notificationType: string;
  title: string;
  createdAt: string;
}

const eventColors: Record<string, string> = {
  CREATED: 'blue',
  READ: 'green',
  UNREAD: 'gold',
  ARCHIVED: 'default',
};

export default function NotificationLogs() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [eventType, setEventType] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/logs', {
        params: { page, limit: 20, eventType },
      });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [eventType, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const columns: ColumnsType<NotificationLog> = [
    {
      title: 'Sự kiện',
      dataIndex: 'eventType',
      width: 120,
      render: (value) => <Tag color={eventColors[value]}>{value}</Tag>,
    },
    {
      title: 'Người nhận',
      key: 'user',
      width: 240,
      render: (_, row) => (
        <div>
          <strong>{row.userName || 'Tài khoản hệ thống'}</strong>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {row.userEmail || row.userId}
          </div>
        </div>
      ),
    },
    { title: 'Loại thông báo', dataIndex: 'notificationType', width: 220 },
    { title: 'Tiêu đề', dataIndex: 'title' },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 180,
      render: (value) => new Date(value).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Space>
          <SafetyCertificateOutlined style={{ color: 'var(--primary)', fontSize: 24 }} />
          <Title level={2} style={{ margin: 0 }}>Nhật ký thông báo</Title>
        </Space>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Audit log bất biến cho các sự kiện tạo, đọc, đánh dấu chưa đọc và lưu trữ.
        </div>
      </div>
      <Card className="glass-panel" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Lọc sự kiện"
          style={{ width: 220 }}
          value={eventType}
          onChange={(value) => {
            setEventType(value);
            setPage(1);
          }}
          options={Object.keys(eventColors).map((value) => ({ value, label: value }))}
        />
      </Card>
      <Card className="glass-panel">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={logs}
          columns={columns}
          scroll={{ x: 980 }}
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
