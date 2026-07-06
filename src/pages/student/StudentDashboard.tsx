/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { GraduationCap, BarChart2, Calendar, RefreshCw, ClipboardList, Award, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentCalendar } from './StudentCalendar';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

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
  classesCount?: number;
  grades: Array<{ subject: string; score: number; teacher: string; status: string; }>;
  upcomingExams: Array<{ subject: string; date: string; time: string; type: string; }>;
  sessions: Array<SessionData>;
  stats?: {
    attendance: {
      totalSessionsCompleted: number;
      presentCount: number;
      absentCount: number;
      presentRate: number;
      monthly: Array<{
        month: string;
        completed: number;
        present: number;
        absent: number;
        rate: number;
      }>;
    };
    homework: {
      totalAssignments: number;
      submittedCount: number;
      gradedCount: number;
      pendingCount: number;
      missingCount: number;
      averageScore: number;
    };
    recentComments: Array<{
      date: string;
      type: 'attendance' | 'assignment';
      title: string;
      comment: string;
      score?: number;
      maxScore?: number;
    }>;
  };
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Xin chào, {data?.studentInfo?.name || user?.name || 'Học sinh'} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi thời khóa biểu, chuyên cần và bài tập của bạn</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/student/assignments')} className="btn btn-primary">
            <ClipboardList size={16} /> Bài tập cần làm
          </button>
          <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số lớp học tham gia</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{data?.classesCount ?? 0}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tỷ lệ chuyên cần</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {data?.stats?.attendance.presentRate ?? 0}%
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(168,85,247,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số buổi học sắp tới</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {data?.sessions.filter(s => s.status === 'Scheduled').length ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Comments Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Card: Progress and Attendance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Chuyên cần & Bài tập</h3>
          </div>
          
          {/* Attendance stats */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tỷ lệ đi học (Chuyên cần)</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {data?.stats?.attendance.presentCount || 0}/{data?.stats?.attendance.totalSessionsCompleted || 0} buổi ({data?.stats?.attendance.presentRate || 0}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ 
                width: `${data?.stats?.attendance.presentRate || 0}%`, 
                height: '100%', 
                borderRadius: '4px',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)' 
              }} />
            </div>
            
            {/* Monthly breakdown */}
            {data?.stats?.attendance.monthly && data.stats.attendance.monthly.length > 0 && (
              <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Chi tiết điểm danh theo tháng
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.stats.attendance.monthly.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tháng {m.month}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        Đi học {m.present}/{m.completed} buổi <span style={{ color: m.rate >= 90 ? 'var(--secondary)' : m.rate >= 75 ? '#fbbf24' : 'var(--danger)', marginLeft: '4px' }}>({m.rate}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Homework stats */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tỷ lệ hoàn thành bài tập</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {data?.stats?.homework.submittedCount || 0}/{data?.stats?.homework.totalAssignments || 0} bài ({data?.stats?.homework.totalAssignments ? Math.round(((data?.stats?.homework.submittedCount || 0) / data?.stats?.homework.totalAssignments) * 100) : 0}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ 
                width: `${data?.stats?.homework.totalAssignments ? Math.round(((data?.stats?.homework.submittedCount || 0) / data?.stats?.homework.totalAssignments) * 100) : 0}%`, 
                height: '100%', 
                borderRadius: '4px',
                background: 'linear-gradient(90deg, var(--secondary) 0%, var(--accent) 100%)' 
              }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Chưa làm (Thiếu)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (data?.stats?.homework.missingCount || 0) > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: '2px' }}>
                  {data?.stats?.homework.missingCount || 0}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Điểm TB bài tập</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '2px' }}>
                  {data?.stats?.homework.averageScore || '—'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Card: Recent comments from teacher */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Nhận xét của giáo viên</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '315px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.stats?.recentComments && data.stats.recentComments.length > 0 ? (
              data.stats.recentComments.map((comment, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: comment.type === 'attendance' ? 'rgba(99,102,241,0.05)' : 'rgba(16,185,129,0.05)',
                  border: '1px solid',
                  borderColor: comment.type === 'attendance' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      padding: '2px 8px', 
                      borderRadius: '99px',
                      fontWeight: 600,
                      background: comment.type === 'attendance' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                      color: comment.type === 'attendance' ? 'var(--primary)' : 'var(--secondary)'
                    }}>
                      {comment.type === 'attendance' ? 'Điểm danh' : 'Bài tập'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {dayjs(comment.date).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>
                    {comment.title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                    {comment.comment}
                  </div>
                  {comment.score !== undefined && comment.score !== null && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Điểm số: <span style={{ color: 'var(--secondary)' }}>{comment.score}/{comment.maxScore}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '160px', color: 'var(--text-muted)' }}>
                <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <span>Chưa có nhận xét nào của giáo viên</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* TimeTable (Calendar View) */}
        <StudentCalendar embeddedSessions={data?.sessions || []} />

      </div>
    </div>
  );
};
export default StudentDashboard;
