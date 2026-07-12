import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User as UserIcon, Settings, X } from 'lucide-react';
import { useAuth, Role } from '../../context/AuthContext';
import { SidebarNav } from './SidebarNav';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

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

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const settingsPath = user ? `/${user.role.toLowerCase()}/settings` : '/login';

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 199,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <aside
        className="glass-panel mobile-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 16px 16px 0',
          borderLeft: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          padding: '20px 16px',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>DAO EDU</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {getAppTitle(user?.role)}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <SidebarNav collapsed={false} onNavigate={onClose} />

        {/* User card */}
        {user && (
          <div className="glass-panel" style={{
            padding: '14px', borderRadius: 'var(--border-radius-sm)',
            display: 'flex', flexDirection: 'column', gap: '10px',
            background: 'rgba(255, 255, 255, 0.02)', marginTop: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', border: '1px solid var(--card-border)', flexShrink: 0,
              }}>
                <UserIcon size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ marginTop: '3px' }}>
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            <button
              onClick={() => { navigate(settingsPath); onClose(); }}
              className="btn btn-outline"
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              <Settings size={15} />
              Cài đặt
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{
                width: '100%', padding: '8px 12px', fontSize: '0.82rem',
                justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)',
                color: 'var(--text-secondary)',
              }}
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
