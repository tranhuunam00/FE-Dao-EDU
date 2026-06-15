import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, BookOpen, RefreshCw } from 'lucide-react';
import TeacherCalendar from './TeacherCalendar';
import { AttendanceModal } from './AttendanceModal';

interface TeacherData {
  message: string;
  teacherInfo: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  sessions: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    classCode: string;
    className: string;
    roomName: string;
    status: string;
    attendanceLocked: boolean;
    isPast: boolean;
    attendanceColor?: string;
  }>;
  pendingGradingCount: number;
}

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const fetchTeacherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/teacher');
      
      // Process sessions for calendar colors
      if (response.data && response.data.sessions) {
        response.data.sessions = response.data.sessions.map((s: any) => {
          let color = 'blue';
          if (s.isPast) {
            // Check if attendance is done. For now we assume if it's past and attendanceLocked is true, or status is Completed
            if (s.attendanceLocked || s.status === 'Completed') {
              color = 'green';
            } else {
              color = 'red';
            }
          }
          return { ...s, attendanceColor: color };
        });
      }

      setData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu Giáo viên. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
        <h3 style={{ marginBottom: '12px' }}>Không thể kết nối đến máy chủ</h3>
        <p>{error}</p>
        <button onClick={fetchTeacherData} className="btn btn-outline" style={{ marginTop: '16px', gap: '8px' }}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Khu vực giảng dạy</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Quản lý lớp học và lịch dạy hôm nay</p>
        </div>
        <button onClick={fetchTeacherData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Grid status cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Classes */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lịch dạy hôm nay</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {data?.sessions?.filter((s: any) => s.date === new Date().toISOString().split('T')[0]).length || 0} ca dạy
            </div>
          </div>
        </div>

        {/* Pending grading */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bài kiểm tra chờ chấm</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.pendingGradingCount} bài</div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', flexDirection: 'column' }}>
        
        {/* Calendar View */}
        <TeacherCalendar 
          embeddedSessions={data?.sessions} 
          onSessionClick={handleSessionClick} 
        />

        {/* Quick info Card */}
        <div className="glass-panel" style={{ padding: '24px', background: 'var(--card-bg)' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>Thông tin giảng viên</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Họ tên: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{data?.teacherInfo.name}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mã giáo viên: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{data?.teacherInfo.id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Quyền truy cập: </span>
              <span className="badge badge-doctor" style={{ marginLeft: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>
                {data?.teacherInfo.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedSession && (
        <AttendanceModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
          onSuccess={fetchTeacherData} 
        />
      )}
    </div>
  );
};
export default TeacherDashboard;
