import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TeacherCalendar: React.FC<{ embeddedSessions?: any[], onSessionClick?: (session: any) => void }> = ({ embeddedSessions, onSessionClick }) => {
  const [sessions, setSessions] = useState<any[]>(embeddedSessions || []);
  const [loading, setLoading] = useState(!embeddedSessions);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!embeddedSessions) {
      fetchSessions();
    } else {
      setSessions(embeddedSessions);
      setLoading(false);
    }
  }, [embeddedSessions]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/teacher');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay();
    // JS getDay(): 0=Sun, 1=Mon... We want Mon=0, Sun=6
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Build grid
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getSessionsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessions.filter(s => s.date === dateStr);
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Đang tải lịch học...</div>;

  const isEmbedded = !!embeddedSessions;

  const content = (
    <>
      {/* Calendar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {monthNames[month]} {year}
            </h3>
            <button onClick={todayMonth} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)' }}>Hôm nay</button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={prevMonth} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)' }}><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)' }}><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div> Sắp diễn ra
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }}></div> Đã dạy (Đã điểm danh)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div> Đã dạy (Chưa điểm danh!)
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Week Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {weekDays.map(d => (
              <div key={d} style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, auto)' }}>
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}></div>;
              }

              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const daySessions = getSessionsForDay(day);

              return (
                <div key={day} style={{ 
                  borderRight: '1px solid rgba(255,255,255,0.05)', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  padding: '8px',
                  background: isToday ? 'rgba(99,102,241,0.05)' : 'transparent'
                }}>
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isToday ? 700 : 500,
                    marginBottom: '8px',
                    fontSize: '0.9rem'
                  }}>
                    {day}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {daySessions.map(s => {
                      let bgColor = 'rgba(59, 130, 246, 0.15)';
                      let textColor = 'var(--primary)';
                      let border = '1px solid rgba(59, 130, 246, 0.3)';

                      if (s.attendanceColor === 'green') {
                        bgColor = 'rgba(16, 185, 129, 0.15)';
                        textColor = 'var(--secondary)';
                        border = '1px solid rgba(16, 185, 129, 0.3)';
                      } else if (s.attendanceColor === 'red') {
                        bgColor = 'rgba(239, 68, 68, 0.15)';
                        textColor = 'var(--danger)';
                        border = '1px solid rgba(239, 68, 68, 0.3)';
                      }

                      return (
                        <div key={s.id} 
                          onClick={() => onSessionClick && onSessionClick(s)}
                          style={{ 
                          padding: '6px', 
                          borderRadius: '6px', 
                          backgroundColor: bgColor, 
                          color: textColor,
                          border: border,
                          fontSize: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          cursor: onSessionClick ? 'pointer' : 'default'
                        }} title={`${s.className}\n${s.startTime} - ${s.endTime}\nPhòng: ${s.roomName}`}>
                          <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.classCode}</strong>
                          <span style={{ fontSize: '0.7rem' }}>{s.startTime.substring(0,5)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </>
  );

  if (isEmbedded) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Lịch học & Điểm danh
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi lịch học và chuyên cần của bạn</p>
        </div>
      </div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        {content}
      </div>
    </div>
  );
};

export default TeacherCalendar;
