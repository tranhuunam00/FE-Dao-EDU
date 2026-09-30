import React from 'react';
import { Check, X } from 'lucide-react';

interface SessionDetail {
  classSessionId: string;
  className?: string;
  subjectName: string;
  date?: string;
  isPresent: boolean;
  isLate?: boolean;
  attendanceStatus?: string;
  homeworkStatus?: string;
  participation?: string;
  understanding?: string;
  behaviorTags?: string[];
  behaviorStatus?: string;
  score?: string | null;
  teacherComment?: string | null;
}

interface WeeklyReportSessionsTableProps {
  sessions: SessionDetail[];
  isMonthly?: boolean;
}

export const WeeklyReportSessionsTable: React.FC<WeeklyReportSessionsTableProps> = ({
  sessions,
  isMonthly = false,
}) => {
  if (!sessions || sessions.length === 0) return null;

  const formatDate = (dStr?: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  // Gom nhóm các buổi học theo từng Môn học
  const groupedSessions = sessions.reduce<Record<string, SessionDetail[]>>((acc, session) => {
    const key = session.subjectName || 'Môn học chung';
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});

  const thStyle: React.CSSProperties = {
    padding: '7px 6px',
    fontSize: 12,
    fontWeight: 700,
    color: '#1e293b',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '6px 6px',
    fontSize: 12,
    color: '#0f172a',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    verticalAlign: 'middle',
  };

  const totalRowTdStyle: React.CSSProperties = {
    padding: '7px 6px',
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    background: '#f1f5f9',
    borderTop: '2px solid #94a3b8',
    borderBottom: '2px solid #94a3b8',
    borderLeft: '1px solid #cbd5e1',
    borderRight: '1px solid #cbd5e1',
    verticalAlign: 'middle',
  };

  const renderIconCheckOrX = (isPass: boolean | null | undefined, title?: string) => {
    if (isPass === null || isPass === undefined) {
      return <span style={{ color: '#94a3b8' }}>—</span>;
    }
    if (isPass) {
      return (
        <span title={title || 'Đạt'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={18} strokeWidth={2.8} style={{ color: '#16a34a' }} />
        </span>
      );
    }
    return (
      <span title={title || 'Chưa đạt'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={18} strokeWidth={2.8} style={{ color: '#dc2626' }} />
      </span>
    );
  };

  const renderAttendance = (row: SessionDetail) => {
    const st = (row.attendanceStatus || '').toLowerCase();
    if (st === 'yes' || st === 'on_time' || st === 'makeup') {
      return renderIconCheckOrX(true, 'Có mặt / Đúng giờ');
    }
    if (st === 'no' || st === 'absent_unexcused' || st === 'absent_excused') {
      return renderIconCheckOrX(false, 'Vắng mặt');
    }
    if (st === 'late' || st === 'early_leave' || st === 'late_much') {
      return renderIconCheckOrX(true, 'Có mặt');
    }
    // Fallback dữ liệu cũ
    if (row.isPresent !== undefined) {
      return renderIconCheckOrX(row.isPresent, row.isPresent ? 'Có mặt' : 'Vắng mặt');
    }
    return <span style={{ color: '#94a3b8' }}>—</span>;
  };

  const renderHomework = (status?: string) => {
    if (!status) return <span style={{ color: '#94a3b8' }}>—</span>;
    const s = status.toLowerCase();
    if (s === 'no_homework' || s === 'none') {
      return <span style={{ color: '#94a3b8' }} title="Không giao BTVN">—</span>;
    }
    if (s === 'yes' || s === 'excellent' || s === 'completed' || s === 'done') {
      return renderIconCheckOrX(true, 'Đã làm BTVN');
    }
    if (s === 'no' || s === 'not_done' || s === 'missing' || s === 'incomplete' || s === 'missing_many' || s === 'coping') {
      return renderIconCheckOrX(false, 'Chưa hoàn thành BTVN');
    }
    if (s === 'missing_few' || s === 'forgot_notebook') {
      return renderIconCheckOrX(false, 'Thiếu bài / Quên vở');
    }
    return <span style={{ color: '#94a3b8' }}>—</span>;
  };

  const renderBehavior = (tags?: string[], status?: string) => {
    const rawTags = (tags || []).map((x) => x.toLowerCase());
    const st = (status || rawTags[0] || '').toLowerCase();
    if (!st && rawTags.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>;

    if (st === 'yes' || st === 'good' || rawTags.includes('attentive') || rawTags.includes('good')) {
      return renderIconCheckOrX(true, 'Tốt / Nghiêm túc');
    }
    if (st === 'no') {
      return renderIconCheckOrX(false, 'Chưa nghiêm túc');
    }
    const isViolation = ['disruptive', 'phone', 'phone_private', 'talkative', 'sleepy', 'unfocused', 'distracted', 'missing_tools'].includes(st) ||
      rawTags.some((x) => ['disruptive', 'phone', 'talkative', 'sleepy', 'distracted'].includes(x));

    return renderIconCheckOrX(!isViolation, isViolation ? 'Nhắc nhở' : 'Tốt');
  };

  const renderParticipation = (part?: string) => {
    if (!part) return <span style={{ color: '#94a3b8' }}>—</span>;
    const p = part.toLowerCase();
    if (p === 'yes' || p === 'active_raise_hand' || p === 'active' || p === 'proactive_ask' || p === 'answer_well') {
      return renderIconCheckOrX(true, 'Tích cực phát biểu');
    }
    if (p === 'no' || p === 'cannot_answer' || p === 'passive' || p === 'answer_hesitant') {
      return renderIconCheckOrX(false, 'Chưa tích cực');
    }
    if (p === 'attentive_quiet' || p === 'normal') {
      return renderIconCheckOrX(true, 'Chăm chú');
    }
    return <span style={{ color: '#94a3b8' }}>—</span>;
  };

  // Màu theo 4 nấc tỷ lệ: 0->0.25: Đỏ, 0.25->0.5: Xám, 0.5->0.75: Xanh dương (Giỏi), 0.75->1: Xanh lá
  const getRateColor = (ratio: number): string => {
    if (ratio >= 0.75) return '#16a34a'; // Xanh lá (0.75 - 1.0)
    if (ratio >= 0.5) return '#2563eb';  // Xanh dương - Giỏi (0.5 - 0.75)
    if (ratio >= 0.25) return '#64748b'; // Xám (0.25 - 0.5)
    return '#dc2626';                    // Đỏ (0 - 0.25)
  };

  return (
    <div className="report-sessions-table" style={{ marginTop: 8, marginBottom: 8 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#1e293b',
          textTransform: 'uppercase',
          marginBottom: 6,
          letterSpacing: '0.02em',
        }}
      >
        {isMonthly ? 'Chi Tiết Các Buổi Học Trong Tháng' : 'Chi Tiết Các Buổi Học Trong Tuần'} ({sessions.length} buổi)
      </div>

      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            width: '100%',
            minWidth: 620,
            borderCollapse: 'collapse',
            background: '#ffffff',
            color: '#0f172a',
            marginBottom: 10,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '5%', textAlign: 'center' }}>STT</th>
              <th style={{ ...thStyle, width: '17%' }}>Ngày</th>
              <th style={{ ...thStyle, width: '16%', textAlign: 'center' }}>Chuyên cần</th>
              <th style={{ ...thStyle, width: '16%', textAlign: 'center' }}>Làm BTVN</th>
              <th style={{ ...thStyle, width: '16%', textAlign: 'center' }}>Tuân thủ NQ</th>
              <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>Phát biểu</th>
              <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>Điểm kiểm tra</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedSessions).map(([subject, subSessions], gIdx) => {
              // Thống kê hàng tổng của môn
              const totalSub = subSessions.length;
              const presentCount = subSessions.filter((s) => (s.attendanceStatus || '').toLowerCase() === 'yes' || s.isPresent).length;
              const presentRatio = totalSub > 0 ? presentCount / totalSub : 0;

              const hwSessions = subSessions.filter((s) => {
                const st = (s.homeworkStatus || '').toLowerCase();
                return st && st !== 'no_homework' && st !== 'none';
              });
              const hwDone = hwSessions.filter((s) => {
                const st = (s.homeworkStatus || '').toLowerCase();
                return st === 'yes' || st === 'excellent' || st === 'completed' || st === 'done';
              }).length;
              const hwRatio = hwSessions.length > 0 ? hwDone / hwSessions.length : 0;

              const behSessions = subSessions.filter(
                (s) => (Array.isArray(s.behaviorTags) && s.behaviorTags.length > 0) || Boolean(s.behaviorStatus),
              );
              const behGood = behSessions.filter((s) => {
                const t = (s.behaviorTags || []).map((x) => x.toLowerCase());
                const st = (s.behaviorStatus || t[0] || '').toLowerCase();
                if (st === 'yes') return true;
                if (st === 'no') return false;
                const isViolation = ['disruptive', 'phone', 'phone_private', 'talkative'].includes(st) ||
                  t.some((x) => ['disruptive', 'phone', 'talkative'].includes(x));
                return !isViolation;
              }).length;
              const behRatio = behSessions.length > 0 ? behGood / behSessions.length : 0;

              const partSessions = subSessions.filter((s) => Boolean(s.participation));
              const partActive = partSessions.filter((s) => {
                const p = String(s.participation).toLowerCase();
                return p === 'yes' || p === 'active_raise_hand' || p === 'proactive_ask' || p === 'active' || p === 'answer_well';
              }).length;
              const partRatio = partSessions.length > 0 ? partActive / partSessions.length : 0;

              const validScores = subSessions
                .map((s) => (s.score ? Number(String(s.score).replace(',', '.')) : null))
                .filter((sc): sc is number => sc !== null && !isNaN(sc));

              const avgScore = validScores.length > 0
                ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
                : null;
              const scoreRatio = avgScore !== null ? Number(avgScore) / 10 : null;

              return (
                <React.Fragment key={subject || gIdx}>
                  {/* TIÊU ĐỀ PHÂN TÁCH MÔN HỌC */}
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: '7px 10px',
                        background: '#e2e8f0',
                        fontWeight: 700,
                        fontSize: 12.5,
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderTop: gIdx > 0 ? '2px solid #64748b' : '1px solid #cbd5e1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Môn học: {subject}
                    </td>
                  </tr>

                  {/* CÁC BUỔI HỌC CỦA MÔN */}
                  {subSessions.map((row, idx) => {
                    return (
                      <tr key={row.classSessionId || `${gIdx}-${idx}`}>
                        {/* STT */}
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {idx + 1}
                        </td>

                        {/* BUỔI HỌC / NGÀY */}
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {row.date ? formatDate(row.date) : `Buổi ${idx + 1}`}
                          </div>
                        </td>

                        {/* CHUYÊN CẦN */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderAttendance(row)}
                        </td>

                        {/* LÀM BTVN */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderHomework(row.homeworkStatus)}
                        </td>

                        {/* TUÂN THỦ NQ */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderBehavior(row.behaviorTags, row.behaviorStatus)}
                        </td>

                        {/* TÍCH CỰC PHÁT BIỂU */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderParticipation(row.participation)}
                        </td>

                        {/* ĐIỂM KIỂM TRA */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {(() => {
                            if (!row.score) return <span style={{ color: '#94a3b8' }}>—</span>;
                            const numScore = Number(String(row.score).replace(',', '.'));
                            const color = !isNaN(numScore) ? getRateColor(numScore / 10) : '#0f172a';
                            return <span style={{ fontWeight: 700, color, fontSize: 13 }}>{row.score}</span>;
                          })()}
                        </td>
                      </tr>
                    );
                  })}

                  {/* HÀNG TỔNG KẾT CHO MÔN HỌC NÀY */}
                  <tr>
                    <td colSpan={2} style={totalRowTdStyle}>
                      <div>Tổng kết ({totalSub} buổi)</div>
                    </td>
                    <td style={{ ...totalRowTdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ color: getRateColor(presentRatio) }}>{presentCount}/{totalSub}</span>
                    </td>
                    <td style={{ ...totalRowTdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {hwSessions.length > 0 ? (
                        <span style={{ color: getRateColor(hwRatio) }}>{hwDone}/{hwSessions.length}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...totalRowTdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {behSessions.length > 0 ? (
                        <span style={{ color: getRateColor(behRatio) }}>
                          {behGood}/{behSessions.length}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...totalRowTdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {partSessions.length > 0 ? (
                        <span style={{ color: getRateColor(partRatio) }}>{partActive}/{partSessions.length}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...totalRowTdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {avgScore !== null && scoreRatio !== null ? (
                        <span style={{ color: getRateColor(scoreRatio) }}>{avgScore}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
