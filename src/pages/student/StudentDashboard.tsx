/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { GraduationCap, Calendar, RefreshCw, ClipboardList, MessageSquare, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentCalendar } from './StudentCalendar';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

import { Tag } from 'antd';
import { CustomModal } from '../../components/CustomModal';

dayjs.extend(relativeTime);
dayjs.locale('vi');

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
  note?: string | null;
  reason?: string | null;
  hasAttendanceRecord?: boolean;
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
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, assignRes] = await Promise.all([
        api.get('/dashboard/student'),
        api.get('/assignments/student')
      ]);
      setData(dashRes.data);
      setAssignments(assignRes.data.assignments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group sessions by class code
  const classesMap: Record<string, { classCode: string; className: string; teacherName: string; sessions: SessionData[]; completedCount: number; presentCount: number; }> = {};
  data?.sessions.forEach(s => {
    const code = s.classCode;
    if (!classesMap[code]) {
      classesMap[code] = {
        classCode: s.classCode,
        className: s.className,
        teacherName: s.teacherName,
        sessions: [],
        completedCount: 0,
        presentCount: 0,
      };
    }
    classesMap[code].sessions.push(s);
    if (s.status === 'Completed' || s.hasAttendanceRecord) {
      classesMap[code].completedCount++;
      if (s.isPresent) {
        classesMap[code].presentCount++;
      }
    }
  });
  const activeClasses = Object.values(classesMap);

  // Get closest upcoming session
  const upcomingSessions = data?.sessions
    .filter(s => s.status === 'Scheduled')
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  const nextSession = upcomingSessions && upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  // Filter urgent pending assignments
  const pendingAssignments = assignments
    .filter(a => !a.submission)
    .sort((a, b) => {
      const diffA = a.dueAt ? dayjs(a.dueAt).diff(dayjs()) : 99999999999;
      const diffB = b.dueAt ? dayjs(b.dueAt).diff(dayjs()) : 99999999999;
      return diffA - diffB;
    })
    .slice(0, 3);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="responsive-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Xin chào, {data?.studentInfo?.name || user?.name || 'Học sinh'} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi thời khóa biểu, chuyên cần và bài tập của bạn</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/student/assignments')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardList size={16} /> Bài tập cần làm
          </button>
          <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {/* Grid: Stats & Next Session */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Next Session Card */}
        {nextSession ? (
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lớp học tiếp theo</span>
              <Tag color="processing">Sắp diễn ra</Tag>
            </div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>{nextSession.className}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Mã lớp: {nextSession.classCode}</p>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '6px', color: 'var(--text-primary)' }}>
                <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{dayjs(nextSession.date).format('dd, DD/MM/YYYY')} · {nextSession.startTime.slice(0, 5)} - {nextSession.endTime.slice(0, 5)}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', color: 'var(--text-secondary)' }}>
                <span>Phòng: <b style={{ color: 'var(--text-primary)' }}>{nextSession.roomName}</b></span>
                <span>·</span>
                <span>GV: <b style={{ color: 'var(--text-primary)' }}>{nextSession.teacherName}</b></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', minHeight: '138px' }}>
            <Calendar size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <span style={{ fontSize: '0.9rem' }}>Không có lịch học nào sắp tới</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Lớp tham gia</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              {data?.classesCount ?? 0}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Chuyên cần</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={20} style={{ color: 'var(--secondary)' }} />
              {data?.stats?.attendance.presentRate ?? 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Classes & Homework / Comments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Active Classes List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Danh sách lớp học của bạn</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeClasses.length > 0 ? (
              activeClasses.map((cls, idx) => {
                const attRate = cls.completedCount > 0 ? Math.round((cls.presentCount / cls.completedCount) * 100) : 100;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedClass(cls)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{cls.className}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Mã lớp: {cls.classCode} · GV: {cls.teacherName}</div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Đã học: <b>{cls.completedCount}/{cls.sessions.length}</b> buổi</span>
                        <span style={{ color: attRate >= 80 ? 'var(--secondary)' : 'var(--danger)' }}>Đi học: <b>{attRate}%</b></span>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Bạn chưa tham gia lớp học nào</div>
            )}
          </div>
        </div>

        {/* Right Section: Pending homework & Recent comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pending Homework */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ClipboardList size={20} style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Bài tập chưa hoàn thành</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map(a => {
                  const isUrgent = a.dueAt && dayjs(a.dueAt).diff(dayjs(), 'hours') < 24;
                  return (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.classEntity?.className}</div>
                      </div>
                      <Tag color={isUrgent ? 'red' : 'gold'} style={{ margin: 0 }}>
                        {a.dueAt ? dayjs(a.dueAt).fromNow() : 'Không hạn'}
                      </Tag>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tuyệt vời! Bạn đã hoàn thành tất cả bài tập 🎉</div>
              )}
            </div>
          </div>

          {/* Teacher Comments */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Nhận xét gần đây</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {data?.stats?.recentComments && data.stats.recentComments.length > 0 ? (
                data.stats.recentComments.map((comment, index) => (
                  <div key={index} style={{ padding: '10px', borderRadius: '8px', background: comment.type === 'attendance' ? 'rgba(99,102,241,0.04)' : 'rgba(16,185,129,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: comment.type === 'attendance' ? 'var(--primary)' : 'var(--secondary)' }}>
                        {comment.type === 'attendance' ? 'Điểm danh' : 'Bài tập'}
                      </span>
                      <span>{dayjs(comment.date).format('DD/MM/YYYY')}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{comment.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{comment.comment}</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có nhận xét nào từ giáo viên</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <StudentCalendar embeddedSessions={data?.sessions || []} />

      {/* Modal: Class Detail & Session Timeline */}
      <CustomModal
        title={selectedClass ? `${selectedClass.className} (${selectedClass.classCode})` : 'Chi tiết lớp học'}
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        width={700}
      >
        {selectedClass && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
              <div>Giảng viên: <b style={{ color: 'var(--text-primary)' }}>{selectedClass.teacherName}</b></div>
              <div>Tiến độ: <b style={{ color: 'var(--text-primary)' }}>{selectedClass.completedCount}/{selectedClass.sessions.length} buổi</b></div>
            </div>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Nhật ký buổi học & Chuyên cần</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {selectedClass.sessions.map((s: any, idx: number) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      Buổi học {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Thời gian: {dayjs(s.date).format('DD/MM/YYYY')} · {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                    </div>
                    {s.note && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
                        Nhận xét: {s.note}
                      </div>
                    )}
                    {s.reason && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '6px' }}>
                        Lý do vắng: {s.reason}
                      </div>
                    )}
                  </div>
                  <Tag color={s.isPresent ? 'green' : s.status === 'Scheduled' ? 'blue' : 'red'}>
                    {s.isPresent ? 'Có mặt' : s.status === 'Scheduled' ? 'Lịch học' : 'Vắng mặt'}
                  </Tag>
                </div>
              ))}
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default StudentDashboard;
