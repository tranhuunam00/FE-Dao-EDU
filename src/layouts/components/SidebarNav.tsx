import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  ClipboardList,
  BookMarked,
  DollarSign,
  CalendarOff,
  MessagesSquare,
  Search,
  BarChart2,
} from 'lucide-react';
import { TeamOutlined as AntdTeamOutlined, BankOutlined as AntdBankOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useAuth, Role } from '../../context/AuthContext';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function getNavigation(role: Role | undefined): NavItem[] {
  switch (role) {
    case Role.ADMIN:
      return [
        { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Học sinh', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'Giáo viên/Trợ giảng', path: '/admin/teachers', icon: <AntdTeamOutlined style={{ fontSize: '20px' }} /> },
        { name: 'Trung tâm', path: '/admin/centers', icon: <AntdBankOutlined style={{ fontSize: '20px' }} /> },
        { name: 'Chương trình học', path: '/admin/courses', icon: <BookMarked size={20} /> },
        { name: 'Lớp học', path: '/admin/classes', icon: <AntdTeamOutlined style={{ fontSize: '20px' }} /> },
        { name: 'Theo dõi bài tập', path: '/admin/assignments', icon: <ClipboardList size={20} /> },
        { name: 'Đơn xin nghỉ', path: '/admin/leave-requests', icon: <CalendarOff size={20} /> },
        { name: 'Kế Toán', path: '/admin/accounting', icon: <DollarSign size={20} /> },
        { name: 'Báo cáo', path: '/admin/reports', icon: <BarChart2 size={20} /> },
        { name: 'Nhật ký hệ thống', path: '/admin/logs', icon: <Shield size={20} /> },
        { name: 'Ngày nghỉ lễ', path: '/admin/holidays', icon: <CalendarOff size={20} /> },
        { name: 'Yêu cầu liên hệ', path: '/admin/contact-requests', icon: <MessagesSquare size={20} /> },
        { name: 'Quản lý Lead CRM', path: '/admin/facebook-leads', icon: <Search size={20} /> },
      ];
    case Role.TEACHER:
      return [
        { name: 'Tổng quan', path: '/teacher', icon: <LayoutDashboard size={20} /> },
        { name: 'Lịch sử nhận lương', path: '/teacher/salary', icon: <DollarSign size={20} /> },
        { name: 'Lớp & Học sinh', path: '/teacher/students', icon: <Users size={20} /> },
        { name: 'Bài tập & Chấm điểm', path: '/teacher/grades', icon: <ClipboardList size={20} /> },
        { name: 'Đơn xin nghỉ', path: '/teacher/leave-requests', icon: <CalendarOff size={20} /> },
        { name: 'Tài liệu học tập', path: '/teacher/materials', icon: <BookMarked size={20} /> },
      ];
    case Role.STUDENT:
      return [
        { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
        { name: 'Bài tập', path: '/student/assignments', icon: <ClipboardList size={20} /> },
        { name: 'Đơn xin nghỉ', path: '/student/leave-requests', icon: <CalendarOff size={20} /> },
        { name: 'Học phí', path: '/student/tuition', icon: <DollarSign size={20} /> },
        { name: 'Tài liệu học tập', path: '/student/materials', icon: <BookMarked size={20} /> },
      ];
    default:
      return [];
  }
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ collapsed = false, onNavigate }) => {
  const { user } = useAuth();
  const location = useLocation();
  const menuItems = getNavigation(user?.role);

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {!collapsed && (
        <div style={{
          fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
          color: 'var(--text-muted)', paddingLeft: '12px', marginBottom: '8px', letterSpacing: '0.05em'
        }}>
          Chức năng
        </div>
      )}
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const linkEl = (
          <Link
            key={item.name}
            to={item.path}
            onClick={onNavigate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : '12px',
              padding: collapsed ? '11px 0' : '11px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--border-radius-sm)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.08))'
                : 'transparent',
              borderLeft: collapsed ? 'none' : (isActive ? '3px solid var(--primary)' : '3px solid transparent'),
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.92rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              minHeight: '44px',
            }}
          >
            <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}>
              {item.icon}
            </span>
            {!collapsed && item.name}
          </Link>
        );

        return collapsed ? (
          <Tooltip key={item.name} title={item.name} placement="right">
            {linkEl}
          </Tooltip>
        ) : linkEl;
      })}
    </nav>
  );
};
