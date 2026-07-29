/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { TopHeader, NotificationBell } from './components/TopHeader';
import { MobileSidebar } from './components/MobileSidebar';
import { SidebarNav } from './components/SidebarNav';
import api from '../services/api';
import { Select, Modal, Avatar } from 'antd';

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
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  useEffect(() => {
    if (user?.role === Role.STUDENT) {
      api.get('/students/me/profiles').then(({ data }) => {
        setProfiles(data);
        const storedActiveId = localStorage.getItem('activeStudentId');
        const active = data.find((p: any) => p.id === storedActiveId);
        if (active) {
          setActiveProfile(active);
        } else {
          if (data.length > 1) {
            setShowSwitchModal(true);
          } else if (data[0]) {
            setActiveProfile(data[0]);
            localStorage.setItem('activeStudentId', data[0].id);
          }
        }
      }).catch(err => {
        console.error('Lỗi lấy danh sách học sinh:', err);
      });
    }
  }, [user]);

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
    localStorage.removeItem('activeStudentId');
    logout();
    navigate('/login');
  };

  const settingsPath = user ? `/${user.role.toLowerCase()}/settings` : '/login';

  return (
    <div className="dashboard-root">

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        profiles={profiles}
        activeProfile={activeProfile}
      />

      {/* ── Desktop / Tablet Sidebar ──────────────────────────────────────── */}
      <aside className="glass-panel dashboard-sidebar">

        {/* Logo */}
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="sidebar-logo-icon">
              <BookOpen size={22} />
            </div>
            <div className="sidebar-logo-text">
              <h1>DAO EDU</h1>
              <span>{getAppTitle(user?.role)}</span>
            </div>
          </div>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onLoadNotifications={loadNotifications}
          />
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User Card */}
        {user && (
          <div className="glass-panel sidebar-user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="sidebar-avatar">
                {user.role === Role.STUDENT && activeProfile?.avatar ? (
                  <Avatar size={32} src={activeProfile.avatar} />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className="sidebar-username">
                  {user.role === Role.STUDENT && activeProfile
                    ? `${activeProfile.lastName} ${activeProfile.firstName}`
                    : user.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  {getRoleBadge(user.role)}
                </div>
                
                {user.role === Role.STUDENT && profiles.length > 1 && (
                  <div style={{ marginTop: '8px' }}>
                    <Select
                      size="small"
                      style={{ width: '100%' }}
                      dropdownStyle={{ zIndex: 1050 }}
                      value={activeProfile?.id}
                      onChange={(val) => {
                        localStorage.setItem('activeStudentId', val);
                        window.location.reload();
                      }}
                      options={profiles.map(p => ({
                        value: p.id,
                        label: `${p.lastName} ${p.firstName}`
                      }))}
                    />
                  </div>
                )}
                {user.role === Role.STUDENT && profiles.length <= 1 && activeProfile && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Học sinh: {activeProfile.lastName} {activeProfile.firstName}
                  </div>
                )}
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
      {/* Netflix-style Profile Selection Modal */}
      <Modal
        title={null}
        open={showSwitchModal}
        footer={null}
        closable={false}
        centered
        width={600}
        styles={{
          body: {
            background: 'var(--bg-secondary)',
            padding: '32px',
            textAlign: 'center',
            borderRadius: '12px',
          }
        }}
      >
        <style>{`
          .profile-switch-card:hover {
            transform: scale(1.08);
          }
          .profile-switch-card:hover .profile-switch-avatar {
            border-color: #6366f1 !important;
            box-shadow: 0 6px 18px rgba(99,102,241,0.4) !important;
          }
        `}</style>
        <h2 style={{
          color: 'var(--text-primary)',
          fontSize: '1.8rem',
          marginBottom: '24px',
          fontFamily: 'Outfit',
          fontWeight: 600
        }}>
          Chào mừng quay trở lại! Bạn muốn xem hồ sơ của ai?
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginTop: '16px'
        }}>
          {profiles.map(p => (
            <div
              key={p.id}
              onClick={() => {
                localStorage.setItem('activeStudentId', p.id);
                setActiveProfile(p);
                setShowSwitchModal(false);
                window.location.reload();
              }}
              className="profile-switch-card"
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                width: '120px',
                transition: 'transform 0.2s ease',
              }}
            >
              <Avatar
                size={80}
                src={p.avatar}
                icon={!p.avatar ? <UserIcon size={32} /> : undefined}
                className="profile-switch-avatar"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: '3px solid transparent',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                  marginBottom: '12px',
                  transition: 'all 0.2s ease',
                }}
              />
              <div style={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {p.firstName}
              </div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                marginTop: '2px'
              }}>
                {p.studentId}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
