import React from 'react';
import { Check, X } from 'lucide-react';

interface SessionDetail {
  classSessionId: string;
  className?: string;
  subjectName: string;
  date?: string;
  isPresent: boolean;
  isLate?: boolean;
  homeworkStatus?: string;
  participation?: string;
  understanding?: string;
  behaviorTags?: string[];
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
    padding: '5px 4px',
    fontSize: 10,
    fontWeight: 700,
    color: '#1e293b',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '4px 4px',
    fontSize: 10,
    color: '#0f172a',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    verticalAlign: 'middle',
  };

  const totalRowTdStyle: React.CSSProperties = {
    padding: '5px 4px',
    fontSize: 10,
    fontWeight: 700,
    color: '#0f172a',
    background: '#f1f5f9',
    borderTop: '2px solid #94a3b8',
    borderBottom: '2px solid #94a3b8',
    borderLeft: '1px solid #cbd5e1',
    borderRight: '1px solid #cbd5e1',
    verticalAlign: 'middle',
  };

  const renderHomework = (status?: string) => {
    if (!status) return <span style={{ color: '#94a3b8' }}>—</span>;
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'done') {
      return <span style={{ color: '#16a34a', fontWeight: 600 }}>Đã làm</span>;
    }
    if (s === 'incomplete') {
      return <span style={{ color: '#d97706', fontWeight: 600 }}>Chưa xong</span>;
    }
    if (s === 'not_done' || s === 'missing') {
      return <span style={{ color: '#dc2626', fontWeight: 600 }}>Chưa làm</span>;
    }
    if (s === 'none') {
      return <span style={{ color: '#64748b' }}>Không có</span>;
    }
    return <span style={{ color: '#94a3b8' }}>—</span>;
  };

  const renderUnderstanding = (und?: string) => {
    if (!und) return <span style={{ color: '#94a3b8' }}>—</span>;
    const u = und.toLowerCase();
    if (u === 'understood' || u === 'quick') {
      return <span style={{ color: '#2563eb', fontWeight: 600 }}>Hiểu nhanh</span>;
    }
    if (u === 'partially' || u === 'normal') {
      return <span style={{ color: '#16a34a', fontWeight: 600 }}>Hiểu bài</span>;
    }
    if (u === 'not_understood' || u === 'slow') {
      return <span style={{ color: '#dc2626', fontWeight: 600 }}>Cần kèm</span>;
    }
    return <span style={{ color: '#94a3b8' }}>—</span>;
  };

  const renderParticipation = (part?: string) => {
    if (!part) return <span style={{ color: '#94a3b8' }}>—</span>;
    const p = part.toLowerCase();
    if (p === 'active') {
      return <span style={{ color: '#16a34a', fontWeight: 600 }}>Hăng hái</span>;
    }
    if (p === 'normal') {
      return <span style={{ color: '#64748b', fontWeight: 500 }}>Bình thường</span>;
    }
    if (p === 'passive') {
      return <span style={{ color: '#d97706', fontWeight: 600 }}>Ít nói</span>;
    }
    return <span style={{ color: '#94a3b8' }}>—</span>;
  };

  const renderBehavior = (tags?: string[]) => {
    if (!tags || tags.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>;
    const t = tags.map((x) => x.toLowerCase());
    if (t.includes('unfocused') || t.includes('distracted') || t.includes('phone') || t.includes('sleepy')) {
      return <span style={{ color: '#ef4444', fontWeight: 600 }}>Mất tập trung</span>;
    }
    if (t.includes('talkative') || t.includes('disruptive')) {
      return <span style={{ color: '#f59e0b', fontWeight: 600 }}>Nói chuyện</span>;
    }
    if (t.includes('good') || t.includes('attentive') || t.includes('cooperative') || t.includes('creative')) {
      return <span style={{ color: '#10b981', fontWeight: 600 }}>Tốt</span>;
    }
    return <span style={{ color: '#10b981', fontWeight: 600 }}>Tốt</span>;
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
              <th style={{ ...thStyle, width: '4%', textAlign: 'center' }}>STT</th>
              <th style={{ ...thStyle, width: '11%' }}>Ngày</th>
              <th style={{ ...thStyle, width: '5%', textAlign: 'center' }}>Điểm danh</th>
              <th style={{ ...thStyle, width: '8%', textAlign: 'center' }}>Bài tập</th>
              <th style={{ ...thStyle, width: '8%', textAlign: 'center' }}>Tiếp thu</th>
              <th style={{ ...thStyle, width: '8%', textAlign: 'center' }}>Tương tác</th>
              <th style={{ ...thStyle, width: '8%', textAlign: 'center' }}>Nề nếp</th>
              <th style={{ ...thStyle, width: '7%', textAlign: 'center' }}>Điểm số</th>
              <th style={{ ...thStyle, width: '41%' }}>Nhận xét của giáo viên</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedSessions).map(([subject, subSessions], gIdx) => {
              // Thống kê hàng tổng của môn
              const totalSub = subSessions.length;
              const presentCount = subSessions.filter((s) => s.isPresent).length;
              const presentRatio = totalSub > 0 ? presentCount / totalSub : 0;

              const hwSessions = subSessions.filter((s) => Boolean(s.homeworkStatus));
              const hwDone = hwSessions.filter(
                (s) => s.homeworkStatus === 'completed' || s.homeworkStatus === 'done',
              ).length;
              const hwRatio = hwSessions.length > 0 ? hwDone / hwSessions.length : 0;

              const underSessions = subSessions.filter((s) => Boolean(s.understanding));
              const underGood = underSessions.filter(
                (s) => s.understanding === 'understood' || s.understanding === 'quick' || s.understanding === 'normal',
              ).length;
              const underRatio = underSessions.length > 0 ? underGood / underSessions.length : 0;

              const partSessions = subSessions.filter((s) => Boolean(s.participation));
              const partActive = partSessions.filter((s) => s.participation === 'active').length;
              const partRatio = partSessions.length > 0 ? partActive / partSessions.length : 0;

              const behSessions = subSessions.filter(
                (s) => Array.isArray(s.behaviorTags) && s.behaviorTags.length > 0,
              );
              const behGood = behSessions.filter((s) => {
                const t = (s.behaviorTags || []).map((x) => x.toLowerCase());
                const isWarning = t.some((x) =>
                  ['unfocused', 'distracted', 'phone', 'sleepy', 'talkative', 'disruptive'].includes(x),
                );
                return !isWarning;
              }).length;
              const behRatio = behSessions.length > 0 ? behGood / behSessions.length : 0;

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
                      colSpan={9}
                      style={{
                        padding: '6px 10px',
                        background: '#e2e8f0',
                        fontWeight: 700,
                        fontSize: 11.5,
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

                        {/* ĐIỂM DANH: TÍCH XANH HOẶC X ĐỎ */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {row.isPresent ? (
                            <span title="Có mặt" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={16} strokeWidth={2.8} style={{ color: '#16a34a' }} />
                            </span>
                          ) : (
                            <span title="Vắng mặt" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={16} strokeWidth={2.8} style={{ color: '#dc2626' }} />
                            </span>
                          )}
                        </td>

                        {/* BÀI TẬP */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderHomework(row.homeworkStatus)}
                        </td>

                        {/* TIẾP THU */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderUnderstanding(row.understanding)}
                        </td>

                        {/* TƯƠNG TÁC */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderParticipation(row.participation)}
                        </td>

                        {/* NỀ NẾP */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {renderBehavior(row.behaviorTags)}
                        </td>

                        {/* ĐIỂM SỐ */}
                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {(() => {
                            if (!row.score) return <span style={{ color: '#94a3b8' }}>—</span>;
                            const numScore = Number(String(row.score).replace(',', '.'));
                            const color = !isNaN(numScore) ? getRateColor(numScore / 10) : '#0f172a';
                            return <span style={{ fontWeight: 700, color }}>{row.score}</span>;
                          })()}
                        </td>

                        {/* NHẬN XÉT CỦA GIÁO VIÊN */}
                        <td style={{ ...tdStyle, minWidth: 180 }}>
                          {row.teacherComment ? (
                            <div style={{ fontStyle: 'italic', color: '#334155', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              "{row.teacherComment}"
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
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
                      {underSessions.length > 0 ? (
                        <span style={{ color: getRateColor(underRatio) }}>{underGood}/{underSessions.length}</span>
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
                      {behSessions.length > 0 ? (
                        <span style={{ color: getRateColor(behRatio) }}>
                          {behGood}/{behSessions.length}
                        </span>
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
                    <td style={totalRowTdStyle}></td>
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

