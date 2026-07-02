import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { X, CheckCircle, Circle, Save, Play, CheckCircle2 } from 'lucide-react';
import { message } from 'antd';

interface StudentAttendance {
  id: string;
  studentId: string;
  isPresent: boolean;
  reason?: string;
  note?: string;
  student: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface AttendanceModalProps {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ session, onClose, onSuccess }) => {
  const [attendances, setAttendances] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [attendanceLocked, setAttendanceLocked] = useState(session.attendanceLocked);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get(`/classes/sessions/${session.id}/attendance`);
        setAttendances(res.data);
      } catch (err) {
        console.error('Error fetching attendance', err);
        message.error('Lỗi khi tải danh sách học sinh.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [session.id]);

  const toggleAttendance = (studentId: string) => {
    if (attendanceLocked || sessionStatus === 'Scheduled') return;
    setAttendances(prev => prev.map(a => 
      a.studentId === studentId ? { ...a, isPresent: !a.isPresent } : a
    ));
  };

  const startSession = async () => {
    try {
      setSubmitting(true);
      await api.post(`/classes/sessions/${session.id}/start-attendance?bypassTimeCheck=true`);
      message.success('Đã bắt đầu điểm danh.');
      setSessionStatus('In-Progress');
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi bắt đầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveAttendance = async () => {
    try {
      setSubmitting(true);
      await api.post(`/classes/sessions/${session.id}/attendance`, {
        attendance: attendances.map(a => ({
          studentId: a.studentId,
          isPresent: a.isPresent,
          reason: a.reason,
          note: a.note
        }))
      });
      message.success('Lưu điểm danh thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu điểm danh.');
    } finally {
      setSubmitting(false);
    }
  };

  const completeSession = async () => {
    try {
      setSubmitting(true);
      await api.post(`/classes/sessions/${session.id}/complete`);
      message.success('Đã chốt điểm danh và kết thúc lớp!');
      setSessionStatus('Completed');
      setAttendanceLocked(true);
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi kết thúc lớp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        padding: '24px', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Điểm danh: {session.className}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Ngày: {session.date} | Thời gian: {session.startTime} - {session.endTime} | Phòng: {session.roomName}
        </p>

        {sessionStatus === 'Scheduled' && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--primary)' }}>Buổi học chưa bắt đầu.</span>
            <button className="btn btn-primary" onClick={startSession} disabled={submitting} style={{ display: 'flex', gap: '8px' }}>
              <Play size={16} /> Bắt đầu điểm danh
            </button>
          </div>
        )}

        {attendanceLocked && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', marginBottom: '20px', color: 'var(--secondary)' }}>
            Buổi học này đã hoàn thành và chốt điểm danh. Không thể thay đổi.
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Đang tải danh sách học sinh...</div>
          ) : attendances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Chưa có học sinh nào trong lớp này.</div>
          ) : (
            <div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setAttendances(prev => prev.map(a => ({ ...a, isPresent: true })));
                  }}
                  disabled={attendanceLocked || sessionStatus === 'Scheduled'}
                  style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                >
                  Có mặt tất cả
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setAttendances(prev => prev.map(a => ({ ...a, isPresent: false })));
                  }}
                  disabled={attendanceLocked || sessionStatus === 'Scheduled'}
                  style={{ padding: '4px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                >
                  Vắng mặt tất cả
                </button>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Mã HS</th>
                    <th>Họ và Tên</th>
                    <th style={{ textAlign: 'center' }}>Điểm danh</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map(a => (
                    <tr key={a.id} onClick={() => toggleAttendance(a.studentId)} style={{ cursor: (attendanceLocked || sessionStatus === 'Scheduled') ? 'default' : 'pointer', opacity: (attendanceLocked || sessionStatus === 'Scheduled') ? 0.7 : 1 }}>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.student?.studentId}</td>
                      <td style={{ fontWeight: 500 }}>{a.student?.lastName} {a.student?.firstName}</td>
                      <td style={{ textAlign: 'center' }}>
                        {a.isPresent ? (
                          <CheckCircle size={24} style={{ color: 'var(--secondary)', margin: '0 auto' }} />
                        ) : (
                          <Circle size={24} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>Hủy</button>
          {!attendanceLocked && sessionStatus !== 'Scheduled' && (
            <>
              <button className="btn btn-primary" onClick={saveAttendance} disabled={submitting} style={{ display: 'flex', gap: '8px', background: 'var(--accent)', borderColor: 'var(--accent)' }}>
                <Save size={16} /> Lưu tạm
              </button>
              <button className="btn btn-primary" onClick={completeSession} disabled={submitting} style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle2 size={16} /> Chốt điểm danh & Kết thúc
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
