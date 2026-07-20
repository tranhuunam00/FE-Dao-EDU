import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';
import dayjs from 'dayjs';

export const StudentCalendar: React.FC<{ embeddedSessions?: any[] }> = ({ embeddedSessions }) => {
  const [sessions, setSessions] = useState<any[]>(embeddedSessions || []);
  const [loading, setLoading] = useState(!embeddedSessions);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const res = await api.get('/dashboard/student');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isMobile = windowWidth < 768;

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay();
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

  // Get all sessions in the selected month for Mobile List View
  const getSessionsForMonth = () => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return sessions
      .filter(s => s.date && s.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Đang tải lịch học...</div>;

  const monthSessions = getSessionsForMonth();

  const getAttendanceStyle = (color: string) => {
    switch (color) {
      case 'green':
        return { bgColor: 'rgba(16, 185, 129, 0.12)', textColor: 'var(--secondary)', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'red':
        return { bgColor: 'rgba(239, 68, 68, 0.12)', textColor: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'gray':
        return { bgColor: 'rgba(156, 163, 175, 0.12)', textColor: 'var(--text-muted)', border: '1px solid rgba(156, 163, 175, 0.3)' };
      default:
        return { bgColor: 'rgba(59, 130, 246, 0.12)', textColor: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.3)' };
    }
  };

  const calendarHeader = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {monthNames[month]} {year}
        </h3>
        <button onClick={todayMonth} className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>Hôm nay</button>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={prevMonth} className="btn" style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}><ChevronLeft size={16} /></button>
        <button onClick={nextMonth} className="btn" style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );

  const legend = (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div> Sắp diễn ra
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }}></div> Có mặt
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div> Vắng mặt
      </div>
    </div>
  );

  const content = (
    <>
      {calendarHeader}
      {legend}

      {isMobile ? (
        // Mobile Agenda/List View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {monthSessions.length > 0 ? (
            monthSessions.map(s => {
              const styles = getAttendanceStyle(s.attendanceColor);
              return (
                <div key={s.id} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.classCode}</span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{s.className}</h4>
                    </div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '99px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: styles.bgColor,
                      color: styles.textColor,
                      border: styles.border
                    }}>
                      {s.attendanceText}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} style={{ opacity: 0.7 }} />
                      <span>{dayjs(s.date).format('DD/MM/YYYY')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} style={{ opacity: 0.7 }} />
                      <span>{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ opacity: 0.7 }} />
                      <span>{s.roomName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} style={{ opacity: 0.7 }} />
                      <span>{s.teacherName}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Không có lịch học nào trong tháng này
            </div>
          )}
        </div>
      ) : (
        // Desktop Grid View
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {weekDays.map(d => (
              <div key={d} style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(110px, auto)' }}>
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.08)' }}></div>;
              }

              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const daySessions = getSessionsForDay(day);

              return (
                <div key={day} style={{
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  padding: '6px',
                  background: isToday ? 'rgba(99,102,241,0.04)' : 'transparent'
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isToday ? 700 : 500,
                    marginBottom: '6px',
                    fontSize: '0.82rem'
                  }}>
                    {day}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {daySessions.map(s => {
                      const styles = getAttendanceStyle(s.attendanceColor);
                      return (
                        <div key={s.id} style={{
                          padding: '4px 6px',
                          borderRadius: '4px',
                          backgroundColor: styles.bgColor,
                          color: styles.textColor,
                          border: styles.border,
                          fontSize: '0.72rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px'
                        }} title={`${s.className}\n${s.startTime} - ${s.endTime}\nGV: ${s.teacherName}\nPhòng: ${s.roomName}`}>
                          <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.classCode}</strong>
                          <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{s.startTime.substring(0, 5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {content}
    </div>
  );
};

export default StudentCalendar;
