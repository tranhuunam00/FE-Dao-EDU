/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { TopHeader } from './components/TopHeader';
import { MobileSidebar } from './components/MobileSidebar';
import { SidebarNav } from './components/SidebarNav';
import api from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleBadge(role: Role) {
  switch (role) {
    case Role.ADMIN:
      return <span className="badge badge-admin">Quản trị</span>;
    case Role.TEACHER:
      return <span className="badge badge-doctor">Giáo viên</span>;
    case Role.STUDENT:
      return <span className="badge badge-patient">Học sinh</span>;
    default:
      return null;
  }
}

function getAppTitle(role?: Role) {
  switch (role) {
    case Role.ADMIN: return 'Quản trị';
    case Role.TEACHER: return 'Giảng dạy';
    case Role.STUDENT: return 'Học tập';
    default: return 'Hệ thống';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Notifications must not block the rest of the application.
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(loadNotifications, 0);
    const timer = window.setInterval(loadNotifications, 60000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadNotifications]);

  // Close mobile sidebar when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsPath = user ? `/${user.role.toLowerCase()}/settings` : '/login';

  return (
    <div className="dashboard-root">

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ── Desktop / Tablet Sidebar ──────────────────────────────────────── */}
      <aside className="glass-panel dashboard-sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BookOpen size={22} />
          </div>
          <div className="sidebar-logo-text">
            <h1>DAO EDU</h1>
            <span>{getAppTitle(user?.role)}</span>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User Card */}
        {user && (
          <div className="glass-panel sidebar-user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="sidebar-avatar">
                <UserIcon size={20} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div className="sidebar-username">{user.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(settingsPath)}
              className="btn btn-outline sidebar-action-btn"
            >
              <Settings size={16} />
              Cài đặt
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-outline sidebar-action-btn sidebar-logout-btn"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        )}
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="dashboard-main">
        <TopHeader
          notifications={notifications}
          unreadCount={unreadCount}
          onLoadNotifications={loadNotifications}
          mobileOpen={mobileOpen}
          onToggleMobile={() => setMobileOpen(v => !v)}
        />
        <main className="dashboard-content">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
