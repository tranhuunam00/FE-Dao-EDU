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

export const TopHeader: React.FC<TopHeaderProps> = ({
  notifications,
  unreadCount,
  onLoadNotifications,
  mobileOpen,
  onToggleMobile,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const notificationsPath = user
    ? `/${user.role.toLowerCase()}/notifications`
    : '/login';

  return (
    <header
      className="glass-panel top-header"
      style={{
        height: '64px',
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        gap: '12px',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn"
        onClick={onToggleMobile}
        aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'none', // shown via CSS media query
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System status — hidden on small mobile */}
        <div
          className="system-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary)',
            boxShadow: '0 0 10px var(--secondary-glow)',
            flexShrink: 0,
          }} />
          <span className="status-text">Hệ thống kết nối</span>
        </div>

        {/* Notifications */}
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
                      await api.patch('/notifications/read-all');
                      onLoadNotifications();
                    }}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo" />
              ) : notifications.map(item => (
                <button
                  key={item.id}
                  onClick={async () => {
                    await api.patch(`/notifications/${item.id}/read`);
                    if (item.linkPath) navigate(item.linkPath);
                    onLoadNotifications();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 0,
                    borderBottom: '1px solid var(--card-border)',
                    padding: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    background: item.readAt ? 'transparent' : 'rgba(99,102,241,.12)',
                  }}
                >
                  <b>{item.title}</b>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.85rem' }}>
                    {item.message}
                  </div>
                </button>
              ))}
              <Button type="link" block onClick={() => navigate(notificationsPath)} style={{ marginTop: 8 }}>
                Xem tất cả thông báo
              </Button>
            </div>
          )}
        >
          <button
            onClick={onLoadNotifications}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
            }}
          >
            <Badge count={unreadCount} size="small">
              <Bell size={20} color="currentColor" />
            </Badge>
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
