import { useCallback, useEffect, useState } from 'react';
import { Card, Select, Space, Table, Tag, Typography, Modal, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

interface NotificationLog {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  eventType: string;
  notificationType: string;
  title: string;
  metadata: Record<string, any>;
  createdAt: string;
}

const eventColors: Record<string, string> = {
  CREATED: 'blue',
  READ: 'green',
  UNREAD: 'gold',
  ARCHIVED: 'default',
  CREATE: 'cyan',
  UPDATE: 'orange',
  DELETE: 'red',
};

const eventLabels: Record<string, string> = {
  CREATED: 'Gửi thông báo',
  READ: 'Đọc thông báo',
  UNREAD: 'Đánh dấu chưa đọc',
  ARCHIVED: 'Lưu trữ thông báo',
  CREATE: 'Thêm mới dữ liệu',
  UPDATE: 'Cập nhật dữ liệu',
  DELETE: 'Xóa dữ liệu',
};

export default function NotificationLogs() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [eventType, setEventType] = useState<string>();
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

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
      render: (value) => <Tag color={eventColors[value] || 'blue'}>{eventLabels[value] || value}</Tag>,
    },
    {
      title: 'Người thực hiện/Nhận',
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
    { title: 'Module/Loại', dataIndex: 'notificationType', width: 180 },
    { title: 'Hành động/Tiêu đề', dataIndex: 'title' },
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
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>Nhật ký hệ thống</Title>
        </Space>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Nhật ký hoạt động hệ thống, ghi nhận thao tác thêm/sửa/xóa và trạng thái thông báo.
        </div>
      </div>
      <Card className="glass-panel" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Lọc loại sự kiện"
          style={{ width: 220 }}
          value={eventType}
          onChange={(value) => {
            setEventType(value);
            setPage(1);
          }}
          options={Object.keys(eventColors).map((value) => ({
            value,
            label: eventLabels[value] || value,
          }))}
        />
      </Card>

      <Card className="glass-panel">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={logs}
          columns={columns}
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => setSelectedLog(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </Card>

      <Modal
        title={<Space><SafetyCertificateOutlined color="var(--primary)" /><span>Chi tiết nhật ký hoạt động</span></Space>}
        visible={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={680}
        destroyOnClose
        className="responsive-log-modal"
      >
        {selectedLog && (
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Hành động">
                <Text strong>{selectedLog.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sự kiện">
                <Tag color={eventColors[selectedLog.eventType] || 'blue'}>{selectedLog.eventType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Module">
                <Tag color="cyan">{selectedLog.notificationType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">
                <div>
                  <div><strong>{selectedLog.userName || 'Hệ thống'}</strong></div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ID: {selectedLog.userId}</div>
                  {selectedLog.userEmail && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Email: {selectedLog.userEmail}</div>}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              {selectedLog.metadata?.url && (
                <Descriptions.Item label="Đường dẫn API">
                  <code style={{ color: 'var(--danger)', fontSize: 11 }}>{selectedLog.metadata.url}</code>
                </Descriptions.Item>
              )}
              {selectedLog.metadata?.ip && (
                <Descriptions.Item label="Địa chỉ IP">
                  <code>{selectedLog.metadata.ip}</code>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedLog.metadata?.body && Object.keys(selectedLog.metadata.body).length > 0 && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Dữ liệu gửi lên (Payload):</div>
                <pre style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 11,
                  overflowX: 'auto',
                  border: '1px solid var(--card-border)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {JSON.stringify(selectedLog.metadata.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

