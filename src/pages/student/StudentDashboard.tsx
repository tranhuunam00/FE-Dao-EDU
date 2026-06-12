import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { GraduationCap, BarChart2, BookOpen, Calendar, RefreshCw, Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SessionData {
  id: string;
  className: string;
  classCode: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  teacherName: string;
  status: string;
  attendanceColor: string; // 'blue' | 'green' | 'red'
  attendanceText: string;
  isPresent: boolean;
}

interface StudentDashData {
  message: string;
  studentInfo: { id: string; name: string; role: string; };
  grades: Array<{ subject: string; score: number; teacher: string; status: string; }>;
  upcomingExams: Array<{ subject: string; date: string; time: string; type: string; }>;
  sessions: Array<SessionData>;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/student');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '40px' }}>Đang tải dữ liệu học tập...</div>;

  if (error) return (
    <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
      <h3 style={{ marginBottom: '12px' }}>Không thể kết nối đến máy chủ</h3>
      <p>{error}</p>
      <button onClick={fetchData} className="btn btn-outline" style={{ marginTop: '16px' }}>
        <RefreshCw size={16} /> Thử lại
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
            Xin chào, {data?.studentInfo?.name || user?.name || 'Học sinh'} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi thời khóa biểu, điểm danh và kết quả học tập của bạn</p>
        </div>
        <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số môn học</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.grades.length ?? 0}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPA trung bình</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {data?.grades.length
                ? (data.grades.reduce((s, g) => s + g.score, 0) / data.grades.length).toFixed(1)
                : '—'}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(168,85,247,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số buổi học sắp tới</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {data?.sessions.filter(s => s.status === 'Scheduled').length ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* TimeTable (Calendar style cards) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Thời khóa biểu & Lịch điểm danh</h3>
          </div>

          {data?.sessions && data.sessions.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {data.sessions.map((session) => {
                // Determine CSS background / borders based on color coding
                let cardBorder = 'rgba(255,255,255,0.06)';
                let badgeBg = 'rgba(59, 130, 246, 0.1)';
                let badgeText = 'var(--primary)';
                let statusIcon = <Clock size={16} />;

                if (session.attendanceColor === 'green') {
                  cardBorder = 'rgba(16, 185, 129, 0.2)';
                  badgeBg = 'rgba(16, 185, 129, 0.12)';
                  badgeText = 'var(--secondary)';
                  statusIcon = <CheckCircle2 size={16} style={{ color: 'var(--secondary)' }} />;
                } else if (session.attendanceColor === 'red') {
                  cardBorder = 'rgba(239, 68, 68, 0.25)';
                  badgeBg = 'rgba(239, 68, 68, 0.12)';
                  badgeText = 'var(--danger)';
                  statusIcon = <XCircle size={16} style={{ color: 'var(--danger)' }} />;
                }

                return (
                  <div
                    key={session.id}
                    className="glass-panel"
                    style={{
                      padding: '18px',
                      borderColor: cardBorder,
                      background: 'rgba(17,24,39,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{session.classCode}</span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{session.className}</h4>
                        </div>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '99px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: badgeBg,
                          color: badgeText,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          {statusIcon} {session.attendanceText}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={14} style={{ color: 'var(--primary)' }} />
                          <span>{session.date} | {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                          <span>Phòng: {session.roomName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--accent)' }} />
                          <span>GV: {session.teacherName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Bạn chưa được xếp lịch học nào. Vui lòng liên hệ Admin để được xếp lớp.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Grades Table */}
          <div className="glass-panel" style={{ flex: '2 1 460px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BarChart2 size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Kết quả học tập</h3>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th>Điểm số</th>
                    <th>Giáo viên</th>
                    <th>Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.grades.map((g, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{g.subject}</td>
                      <td>
                        <span style={{
                          fontSize: '1.1rem', fontWeight: 700,
                          color: g.score >= 8 ? 'var(--secondary)' : g.score >= 5 ? '#f59e0b' : 'var(--danger)'
                        }}>{g.score}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{g.teacher}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600,
                          background: g.status === 'Đạt' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: g.status === 'Đạt' ? 'var(--secondary)' : 'var(--danger)',
                          border: `1px solid ${g.status === 'Đạt' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}>{g.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="glass-panel" style={{ flex: '1 1 280px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BookOpen size={20} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Lịch thi sắp tới</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.upcomingExams.map((exam, i) => (
                <div key={i} className="glass-panel" style={{ padding: '14px 16px', background: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.15)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{exam.date} · {exam.time}</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>{exam.subject}</div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '99px', background: 'rgba(168,85,247,0.15)', color: 'var(--accent)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      {exam.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default StudentDashboard;
