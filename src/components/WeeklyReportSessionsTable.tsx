import React from 'react';
import { Calendar } from 'lucide-react';

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

const BEHAVIOR_TAG_VI_MAP: Record<string, string> = {
  attentive: 'Tập trung',
  active: 'Hăng hái phát biểu',
  distracted: 'Chưa tập trung',
  talkative: 'Nói chuyện riêng',
  phone: 'Dùng điện thoại',
  disruptive: 'Nhắc nhở nề nếp',
  sleepy: 'Buồn ngủ',
  late_submission: 'Nộp bài muộn',
  cooperative: 'Hợp tác tốt',
  creative: 'Sáng tạo',
};

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

  const formatBehaviorTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    return tags.map((t) => BEHAVIOR_TAG_VI_MAP[t.toLowerCase()] || t).join(', ');
  };

  const thStyle: React.CSSProperties = {
    padding: '5px 6px',
    fontSize: 11,
    fontWeight: 700,
    color: '#1e293b',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    textTransform: 'uppercase',
  };

  const tdStyle: React.CSSProperties = {
    padding: '5px 6px',
    fontSize: 11,
    color: '#0f172a',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    verticalAlign: 'middle',
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

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#ffffff',
            color: '#0f172a',
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '22%' }}>Buổi học / Môn học</th>
              <th style={{ ...thStyle, width: '12%', textAlign: 'center' }}>Điểm danh</th>
              <th style={{ ...thStyle, width: '15%' }}>Bài tập về nhà</th>
              <th style={{ ...thStyle, width: '20%' }}>Tiếp thu & Nề nếp</th>
              <th style={{ ...thStyle, width: '9%', textAlign: 'center' }}>Điểm số</th>
              <th style={{ ...thStyle, width: '22%' }}>Nhận xét của giáo viên</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((row, idx) => {
              const tagsText = formatBehaviorTags(row.behaviorTags);

              return (
                <tr key={row.classSessionId || idx}>
                  {/* MÔN HỌC & NGÀY */}
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.subjectName}</div>
                    {row.date && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} color="#64748b" />
                        <span>{formatDate(row.date)}</span>
                      </div>
                    )}
                  </td>

                  {/* ĐIỂM DANH */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {!row.isPresent ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>Vắng mặt</span>
                    ) : row.isLate ? (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>Đi trễ</span>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Có mặt</span>
                    )}
                  </td>

                  {/* BÀI TẬP VỀ NHÀ */}
                  <td style={tdStyle}>
                    {row.homeworkStatus === 'completed' ? (
                      <span style={{ color: '#16a34a', fontWeight: 500 }}>Đã hoàn thành</span>
                    ) : row.homeworkStatus === 'incomplete' ? (
                      <span style={{ color: '#d97706', fontWeight: 500 }}>Chưa hoàn thiện</span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 500 }}>Chưa làm</span>
                    )}
                  </td>

                  {/* TIẾP THU & NỀ NẾP */}
                  <td style={tdStyle}>
                    <div>
                      {row.understanding === 'understood' && (
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>Hiểu bài nhanh</span>
                      )}
                      {row.understanding === 'partially' && (
                        <span style={{ color: '#d97706', fontWeight: 500 }}>Hiểu cơ bản</span>
                      )}
                      {row.understanding === 'not_understood' && (
                        <span style={{ color: '#dc2626', fontWeight: 500 }}>Cần kèm thêm</span>
                      )}
                    </div>
                    {tagsText && (
                      <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                        {tagsText}
                      </div>
                    )}
                  </td>

                  {/* ĐIỂM SỐ */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {row.score ? (
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.score}đ</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>

                  {/* NHẬN XÉT CỦA GIÁO VIÊN */}
                  <td style={tdStyle}>
                    {row.teacherComment ? (
                      <div style={{ fontStyle: 'italic', color: '#334155' }}>
                        "{row.teacherComment}"
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Đầy đủ nề nếp</span>
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

