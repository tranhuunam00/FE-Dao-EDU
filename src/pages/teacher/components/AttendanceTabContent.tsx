import React from 'react';
import { Switch } from 'antd';

export interface StudentAttendanceItem {
  id: string;
  studentId: string;
  isPresent: boolean;
  reason?: string;
  note?: string;
  attendanceType?: string;
  verifyMethod?: string | null;
  student: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface AttendanceTabContentProps {
  attendances: StudentAttendanceItem[];
  setAttendances: React.Dispatch<React.SetStateAction<StudentAttendanceItem[]>>;
  disabled?: boolean;
}

export const AttendanceTabContent: React.FC<AttendanceTabContentProps> = ({
  attendances,
  setAttendances,
  disabled,
}) => {
  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setAttendances((prev) =>
              prev.map((a) => ({ ...a, isPresent: true, reason: '', attendanceType: 'manual' }))
            );
          }}
          disabled={disabled}
          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
        >
          Có mặt tất cả
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setAttendances((prev) =>
              prev.map((a) => ({ ...a, isPresent: false, reason: 'Nghỉ có phép', attendanceType: 'manual' }))
            );
          }}
          disabled={disabled}
          style={{
            padding: '4px 12px',
            fontSize: '0.85rem',
            color: 'var(--danger, #ef4444)',
            borderColor: 'var(--danger, #ef4444)',
          }}
        >
          Vắng mặt tất cả
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table" style={{ width: '100%', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th style={{ width: '120px' }}>Mã HS</th>
              <th>Họ và Tên</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Điểm danh</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Hình thức</th>
              <th style={{ width: '35%' }}>Lý do vắng mặt / Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((a, index) => {
              const isExcusedDefault = a.reason === 'Nghỉ có phép';
              const isUnexcused = !a.reason || a.reason.trim() === '';
              const selectValue = isExcusedDefault
                ? 'Nghỉ có phép'
                : isUnexcused
                ? 'Nghỉ không phép'
                : 'custom';

              return (
                <tr key={a.id} style={{ opacity: disabled ? 0.7 : 1 }}>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {index + 1}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {a.student?.studentId}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {a.student?.lastName} {a.student?.firstName}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <Switch
                        checked={a.isPresent}
                        disabled={disabled}
                        onChange={(checked) => {
                          setAttendances((prev) =>
                            prev.map((item) =>
                              item.studentId === a.studentId
                                ? {
                                    ...item,
                                    isPresent: checked,
                                    reason: checked ? '' : 'Nghỉ có phép',
                                    attendanceType: 'manual',
                                  }
                                : item
                            )
                          );
                        }}
                      />
                      {a.isPresent ? (
                        <span
                          style={{
                            fontSize: '0.82rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(74, 222, 128, 0.15)',
                            color: '#4ade80',
                            fontWeight: 'bold',
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                          }}
                        >
                          Có mặt
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.82rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            fontWeight: 'bold',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          Vắng
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {a.isPresent ? (
                      a.attendanceType === 'machine' && a.verifyMethod ? (
                        <span
                          title={`Xác thực bởi máy chấm công: ${a.verifyMethod}`}
                          style={{
                            fontSize: '0.82rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                            fontWeight: 'bold',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            display: 'inline-block',
                          }}
                        >
                          {a.verifyMethod === 'face'
                            ? '📸 Khuôn mặt'
                            : a.verifyMethod === 'fingerprint'
                            ? '👆 Vân tay'
                            : a.verifyMethod === 'card'
                            ? '💳 Thẻ'
                            : a.verifyMethod === 'pin'
                            ? '🔢 Mã PIN'
                            : '🤖 Máy'}
                        </span>
                      ) : (
                        <span
                          title="Tích thủ công bởi Giáo viên / Admin"
                          style={{
                            fontSize: '0.82rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(249, 115, 22, 0.15)',
                            color: '#f97316',
                            fontWeight: 'bold',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            display: 'inline-block',
                          }}
                        >
                          ✍️ Thủ công
                        </span>
                      )
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {!a.isPresent ? (
                      <div
                        style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                      >
                        <select
                          value={selectValue}
                          disabled={disabled}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                            fontSize: '0.85rem',
                            width: '100%',
                            background: 'var(--card-bg, rgba(17, 24, 39, 0.7))',
                            color: 'var(--text-primary)',
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            let newReason = '';
                            if (val === 'Nghỉ có phép') newReason = 'Nghỉ có phép';
                            else if (val === 'Nghỉ không phép') newReason = '';
                            else newReason = 'Lý do khác';
                            setAttendances((prev) =>
                              prev.map((item) =>
                                item.studentId === a.studentId
                                  ? { ...item, reason: newReason }
                                  : item
                              )
                            );
                          }}
                        >
                          <option value="Nghỉ có phép">Nghỉ có phép</option>
                          <option value="Nghỉ không phép">Nghỉ không phép</option>
                          <option value="custom">Khác (Nhập lý do)</option>
                        </select>
                        {selectValue === 'custom' && (
                          <input
                            type="text"
                            placeholder="Nhập lý do vắng..."
                            value={a.reason || ''}
                            disabled={disabled}
                            style={{
                              padding: '4px',
                              borderRadius: '4px',
                              border:
                                '1px solid var(--border-color, rgba(255,255,255,0.12))',
                              fontSize: '0.85rem',
                              width: '100%',
                              background: 'transparent',
                              color: 'var(--text-primary)',
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttendances((prev) =>
                                prev.map((item) =>
                                  item.studentId === a.studentId
                                    ? { ...item, reason: val }
                                    : item
                                )
                              );
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
