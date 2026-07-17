import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { X, Save, Play, CheckCircle2 } from 'lucide-react';
import { message, Switch } from 'antd';

interface StudentAttendance {
  id: string;
  studentId: string;
  isPresent: boolean;
  reason?: string;
  note?: string;
  evaluationScore?: string | null;
  evaluationComment?: string | null;
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

  useEffect(() => {
    setSessionStatus(session.status);
    setAttendanceLocked(session.attendanceLocked);
  }, [session.status, session.attendanceLocked]);

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
          note: a.note,
          evaluationScore: a.evaluationScore !== undefined && a.evaluationScore !== null && String(a.evaluationScore).trim() !== '' ? String(a.evaluationScore).trim() : null,
          evaluationComment: a.evaluationComment || null,
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
      // Save attendance & evaluations first to ensure they are captured when completing
      await api.post(`/classes/sessions/${session.id}/attendance`, {
        attendance: attendances.map(a => ({
          studentId: a.studentId,
          isPresent: a.isPresent,
          reason: a.reason,
          note: a.note,
          evaluationScore: a.evaluationScore !== undefined && a.evaluationScore !== null && String(a.evaluationScore).trim() !== '' ? String(a.evaluationScore).trim() : null,
          evaluationComment: a.evaluationComment || null,
        }))
      });
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

  const saveEvaluationsOnly = async () => {
    try {
      setSubmitting(true);
      await api.post(`/classes/sessions/${session.id}/evaluations`, {
        evaluations: attendances.map(a => ({
          studentId: a.studentId,
          evaluationScore: a.evaluationScore !== undefined && a.evaluationScore !== null && String(a.evaluationScore).trim() !== '' ? String(a.evaluationScore).trim() : null,
          evaluationComment: a.evaluationComment || null,
        }))
      });
      message.success('Cập nhật đánh giá thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật đánh giá.');
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
                    setAttendances(prev => prev.map(a => ({ ...a, isPresent: true, reason: "" })));
                  }}
                  disabled={attendanceLocked || sessionStatus === 'Scheduled'}
                  style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                >
                  Có mặt tất cả
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setAttendances(prev => prev.map(a => ({ ...a, isPresent: false, reason: "Nghỉ có phép" })));
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
                    <th style={{ width: '30%' }}>Lý do vắng mặt / Ghi chú</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Điểm số</th>
                    <th style={{ width: '28%' }}>Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map(a => {
                    const isExcusedDefault = a.reason === 'Nghỉ có phép';
                    const isUnexcused = !a.reason || a.reason.trim() === '';
                    const selectValue = isExcusedDefault ? 'Nghỉ có phép' : isUnexcused ? 'Nghỉ không phép' : 'custom';

                    return (
                      <tr key={a.id} style={{ opacity: (attendanceLocked || sessionStatus === 'Scheduled') ? 0.7 : 1 }}>
                        <td style={{ color: 'var(--text-secondary)' }}>{a.student?.studentId}</td>
                        <td style={{ fontWeight: 500 }}>{a.student?.lastName} {a.student?.firstName}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Switch
                              checked={a.isPresent}
                              disabled={attendanceLocked || sessionStatus === 'Scheduled'}
                              onChange={(checked) => {
                                setAttendances(prev => prev.map(item => 
                                  item.studentId === a.studentId 
                                    ? { ...item, isPresent: checked, reason: checked ? "" : "Nghỉ có phép" } 
                                    : item
                                ));
                              }}
                            />
                            {a.isPresent ? (
                              <span style={{ fontSize: '0.82rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontWeight: 'bold', border: '1px solid rgba(74, 222, 128, 0.3)' }}>Có mặt</span>
                            ) : (
                              <span style={{ fontSize: '0.82rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 'bold', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Vắng</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {!a.isPresent ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select
                                value={selectValue}
                                disabled={attendanceLocked || sessionStatus === 'Scheduled'}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color, #ddd)', fontSize: '0.85rem', width: '100%', background: 'transparent', color: 'inherit' }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let newReason = '';
                                  if (val === 'Nghỉ có phép') newReason = 'Nghỉ có phép';
                                  else if (val === 'Nghỉ không phép') newReason = '';
                                  else newReason = 'Lý do khác';
                                  setAttendances(prev => prev.map(item => 
                                    item.studentId === a.studentId ? { ...item, reason: newReason } : item
                                  ));
                                }}
                              >
                                <option value="Nghỉ có phép" style={{ background: 'var(--card-bg, #fff)', color: 'var(--text-primary, #000)' }}>Nghỉ có phép</option>
                                <option value="Nghỉ không phép" style={{ background: 'var(--card-bg, #fff)', color: 'var(--text-primary, #000)' }}>Nghỉ không phép</option>
                                <option value="custom" style={{ background: 'var(--card-bg, #fff)', color: 'var(--text-primary, #000)' }}>Khác (Nhập lý do)</option>
                              </select>
                              {selectValue === 'custom' && (
                                <input
                                  type="text"
                                  placeholder="Nhập lý do vắng..."
                                  value={a.reason}
                                  disabled={attendanceLocked || sessionStatus === 'Scheduled'}
                                  style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color, #ddd)', fontSize: '0.85rem', width: '100%', background: 'transparent', color: 'inherit' }}
                                  onChange={(e) => {
                                    setAttendances(prev => prev.map(item => 
                                      item.studentId === a.studentId ? { ...item, reason: e.target.value } : item
                                    ));
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="—"
                            value={a.evaluationScore !== undefined && a.evaluationScore !== null ? a.evaluationScore : ''}
                            disabled={sessionStatus === 'Scheduled'}
                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color, #ddd)', fontSize: '0.85rem', width: '100%', textAlign: 'center', background: 'transparent', color: 'inherit' }}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttendances(prev => prev.map(item => 
                                item.studentId === a.studentId ? { ...item, evaluationScore: val === '' ? null : val } : item
                              ));
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Nhận xét..."
                            value={a.evaluationComment || ''}
                            disabled={sessionStatus === 'Scheduled'}
                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color, #ddd)', fontSize: '0.85rem', width: '100%', background: 'transparent', color: 'inherit' }}
                            onChange={(e) => {
                              setAttendances(prev => prev.map(item => 
                                item.studentId === a.studentId ? { ...item, evaluationComment: e.target.value } : item
                              ));
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>Hủy</button>
          {attendanceLocked && sessionStatus !== 'Scheduled' && (
            <button className="btn btn-primary" onClick={saveEvaluationsOnly} disabled={submitting} style={{ display: 'flex', gap: '8px', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
              <Save size={16} /> Cập nhật đánh giá
            </button>
          )}
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
