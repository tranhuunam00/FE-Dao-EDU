import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  FileText, 
  LogOut, 
  User as UserIcon,
  Shield, 
  GraduationCap,
  Bell,
  Search,
  ClipboardList,
  BookMarked,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { TeamOutlined as AntdTeamOutlined, BankOutlined as AntdBankOutlined } from '@ant-design/icons';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigation = () => {
    if (!user) return [];

    switch (user.role) {
      case Role.ADMIN:
        return [
          { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
          { name: 'Học sinh', path: '/admin/students', icon: <Users size={20} /> },
          { name: 'Giáo viên/Trợ giảng', path: '/admin/teachers', icon: <AntdTeamOutlined style={{ fontSize: '20px' }} /> },
          { name: 'Trung tâm', path: '/admin/centers', icon: <AntdBankOutlined style={{ fontSize: '20px' }} /> },
          { name: 'Chương trình học', path: '/admin/courses', icon: <BookMarked size={20} /> },
          { name: 'Lớp học', path: '/admin/classes', icon: <AntdTeamOutlined style={{ fontSize: '20px' }} /> },
          { name: 'Kế Toán', path: '/admin/accounting', icon: <DollarSign size={20} /> },
          { name: 'Nhật ký hệ thống', path: '/admin/logs', icon: <Shield size={20} /> },
        ];
      case Role.TEACHER:
        return [
          { name: 'Tổng quan', path: '/teacher', icon: <LayoutDashboard size={20} /> },
          { name: 'Danh sách Học sinh', path: '/teacher/students', icon: <Users size={20} /> },
          { name: 'Bài tập & Chấm điểm', path: '/teacher/grades', icon: <ClipboardList size={20} /> },
          { name: 'Tài liệu học tập', path: '/teacher/materials', icon: <BookMarked size={20} /> },
        ];
      case Role.STUDENT:
        return [
          { name: 'Trang cá nhân', path: '/student', icon: <GraduationCap size={20} /> },
          { name: 'Kết quả học tập', path: '/student/grades', icon: <BarChart2 size={20} /> },
          { name: 'Tài liệu môn học', path: '/student/materials', icon: <BookOpen size={20} /> },
          { name: 'Thời khóa biểu', path: '/student/schedule', icon: <FileText size={20} /> },
        ];
      default:
        return [];
    }
  };

  const menuItems = getNavigation();

  const getRoleBadge = (role: Role) => {
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
  };

  const getAppTitle = () => {
    switch (user?.role) {
      case Role.ADMIN: return 'Quản trị';
      case Role.TEACHER: return 'Giảng dạy';
      case Role.STUDENT: return 'Học tập';
      default: return 'Hệ thống';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0px',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        padding: '24px 16px',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>DAO EDU</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{getAppTitle()}</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '12px', marginBottom: '10px', letterSpacing: '0.05em' }}>
            Chức năng
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.08))'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        {user && (
          <div className="glass-panel" style={{
            padding: '16px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', border: '1px solid var(--card-border)'
              }}>
                <UserIcon size={20} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
              style={{
                width: '100%', padding: '8px 12px', fontSize: '0.85rem',
                justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {/* Top Navbar */}
        <header className="glass-panel" style={{
          height: '70px', borderRadius: 0,
          borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 10
        }}>
          {/* Empty spacer for space-between or just change header to flex-end */}
          <div style={{ flex: 1 }}></div>
          {/* System status / Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary-glow)' }}></span>
              Hệ thống kết nối
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '16px 24px', flex: 1 }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
