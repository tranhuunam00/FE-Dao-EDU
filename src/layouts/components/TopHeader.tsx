import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { Badge, Button, Dropdown, Empty } from 'antd';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  notifications: any[];
  unreadCount: number;
  onLoadNotifications: () => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export const NotificationBell: React.FC<{
  notifications: any[];
  unreadCount: number;
  onLoadNotifications: () => void;
}> = ({ notifications, unreadCount, onLoadNotifications }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const notificationsPath = user
    ? `/${user.role.toLowerCase()}/notifications`
    : '/login';

  return (
    <Dropdown
      trigger={['click']}
      dropdownRender={() => (
        <div style={{
          width: 'min(360px, calc(100vw - 32px))',
          maxHeight: 480,
          overflow: 'auto',
          padding: 12,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b>Thông báo</b>
            {unreadCount > 0 && (
              <Button
                size="small"
                type="link"
                onClick={async () => {
                  try {
                    await api.put('/notifications/read-all');
                    onLoadNotifications();
                  } catch (e) {
                    console.error('Failed to mark all read', e);
                  }
                }}
              >
                Đánh dấu đã đọc tất cả
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={async () => {
                  try {
                    if (!n.isRead) {
                      await api.put(`/notifications/${n.id}/read`);
                      onLoadNotifications();
                    }
                    if (n.linkPath) navigate(n.linkPath);
                  } catch (e) {
                    console.error('Failed to mark notification read', e);
                  }
                }}
                style={{
                  padding: '8px 10px',
                  marginBottom: 6,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: n.isRead ? 'transparent' : 'var(--bg-primary)',
                  borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)',
                }}
              >
                <div style={{ fontWeight: n.isRead ? 'normal' : 'bold', fontSize: 13, color: 'var(--text-primary)' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {n.message}
                </div>
              </div>
            ))
          )}

          <div style={{ textAlign: 'center', marginTop: 10, borderTop: '1px solid var(--card-border)', paddingTop: 8 }}>
            <Button type="link" size="small" onClick={() => navigate(notificationsPath)}>
              Xem tất cả thông báo
            </Button>
          </div>
        </div>
      )}
    >
      <button
        type="button"
        className="icon-btn-header"
        aria-label="Thông báo"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Badge count={unreadCount} overflowCount={99} offset={[-2, 2]}>
          <Bell size={19} color="currentColor" />
        </Badge>
      </button>
    </Dropdown>
  );
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  notifications,
  unreadCount,
  onLoadNotifications,
  mobileOpen,
  onToggleMobile,
}) => {
  return (
    <header className="glass-panel top-header">
      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn"
        onClick={onToggleMobile}
        aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onLoadNotifications={onLoadNotifications}
        />
      </div>
    </header>
  );
};
