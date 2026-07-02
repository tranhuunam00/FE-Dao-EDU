import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Badge,
  Button,
  Card,
  Empty,
  Pagination,
  Segmented,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  linkPath: string | null;
  priority: 'normal' | 'important' | 'urgent';
  readAt: string | null;
  createdAt: string;
}

const priorityConfig = {
  normal: { label: 'Thông thường', color: 'blue' },
  important: { label: 'Quan trọng', color: 'gold' },
  urgent: { label: 'Khẩn cấp', color: 'red' },
};

export default function Notifications() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [view, setView] = useState<'all' | 'unread'>('all');
  const [priority, setPriority] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', {
        params: {
          page,
          limit: 12,
          unreadOnly: view === 'unread',
          priority,
        },
      });
      setItems(data.notifications || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  }, [page, priority, view]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const update = async (
    item: NotificationItem,
    action: 'read' | 'unread' | 'archive',
  ) => {
    await api.patch(`/notifications/${item.id}/${action}`);
    await load();
  };

  const openItem = async (item: NotificationItem) => {
    if (!item.readAt) await api.patch(`/notifications/${item.id}/read`);
    if (item.linkPath) navigate(item.linkPath);
    else load();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    message.success('Đã đánh dấu tất cả là đã đọc');
    await load();
  };

  const archiveRead = async () => {
    await api.patch('/notifications/archive-read');
    message.success('Đã lưu trữ các thông báo đã đọc');
    await load();
  };

  return (
    <App>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <Space>
              <BellOutlined style={{ color: 'var(--primary)', fontSize: 24 }} />
              <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>Trung tâm thông báo</Title>
              <Badge count={unreadCount} />
            </Space>
            <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
              Theo dõi bài tập, học phí, lịch học và các hoạt động quan trọng.
            </div>
          </div>
          <Space wrap>
            <Button icon={<CheckOutlined />} disabled={!unreadCount} onClick={markAllRead}>
              Đọc tất cả
            </Button>
            <Button icon={<DeleteOutlined />} onClick={archiveRead}>
              Lưu trữ đã đọc
            </Button>
          </Space>
        </div>

        <Card className="glass-panel" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Segmented
              value={view}
              onChange={(value) => {
                setView(value as 'all' | 'unread');
                setPage(1);
              }}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: `Chưa đọc (${unreadCount})`, value: 'unread' },
              ]}
            />
            <Select
              allowClear
              placeholder="Mức ưu tiên"
              value={priority}
              onChange={(value) => {
                setPriority(value);
                setPage(1);
              }}
              style={{ width: 170 }}
              options={Object.entries(priorityConfig).map(([value, item]) => ({
                value,
                label: item.label,
              }))}
            />
          </Space>
        </Card>

        <Spin spinning={loading}>
          {items.length === 0 ? (
            <Card className="glass-panel">
              <Empty description="Không có thông báo phù hợp" />
            </Card>
          ) : (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {items.map((item) => {
                const config = priorityConfig[item.priority] || priorityConfig.normal;
                return (
                  <Card
                    key={item.id}
                    className="glass-panel"
                    styles={{ body: { padding: 18 } }}
                    style={{
                      borderLeft: `4px solid ${item.priority === 'urgent' ? '#ef4444' : item.priority === 'important' ? '#f59e0b' : 'var(--primary)'}`,
                      background: item.readAt ? 'var(--card-bg)' : 'rgba(99,102,241,.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <button
                        onClick={() => openItem(item)}
                        style={{ flex: 1, padding: 0, border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <Space wrap size={8}>
                          {!item.readAt && <Badge status="processing" />}
                          <Text strong style={{ color: 'var(--text-primary)', fontSize: 16 }}>{item.title}</Text>
                          <Tag color={config.color}>{config.label}</Tag>
                        </Space>
                        <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{item.message}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </button>
                      <Space>
                        <Button
                          type="text"
                          title={item.readAt ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                          icon={item.readAt ? <EyeInvisibleOutlined /> : <CheckOutlined />}
                          onClick={() => update(item, item.readAt ? 'unread' : 'read')}
                        />
                        <Button
                          type="text"
                          danger
                          title="Lưu trữ"
                          icon={<DeleteOutlined />}
                          onClick={() => update(item, 'archive')}
                        />
                      </Space>
                    </div>
                  </Card>
                );
              })}
            </Space>
          )}
        </Spin>

        {total > 12 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <Pagination current={page} pageSize={12} total={total} onChange={setPage} showSizeChanger={false} />
          </div>
        )}
      </div>
    </App>
  );
}
