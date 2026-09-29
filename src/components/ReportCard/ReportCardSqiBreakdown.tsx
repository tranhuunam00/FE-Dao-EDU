import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SqiBreakdown } from '../../services/weekly-report.service';

interface ReportCardSqiBreakdownProps {
  sqiScore?: number | null;
  sqiDelta?: number | null;
  sqiBreakdown?: SqiBreakdown;
  overview?: string;
  isMonthly?: boolean;
}

export const ReportCardSqiBreakdown: React.FC<ReportCardSqiBreakdownProps> = ({
  sqiScore,
  sqiDelta,
  sqiBreakdown,
  overview,
  isMonthly,
}) => {
  const getLevelColor = (score?: number | null) => {
    if (score === null || score === undefined) return { color: '#64748b', label: 'Chưa có dữ liệu' };
    if (score >= 90) return { color: '#16a34a', label: 'Xuất sắc (Mức 5)' };
    if (score >= 75) return { color: '#2563eb', label: 'Giỏi (Mức 4)' };
    if (score >= 60) return { color: '#d97706', label: 'Khá (Mức 3)' };
    if (score >= 45) return { color: '#ea580c', label: 'Trung bình (Mức 2)' };
    return { color: '#dc2626', label: 'Cần cố gắng (Mức 1)' };
  };

  const level = getLevelColor(sqiScore);

  const formatCriterion = (val: number | null | undefined, maxWeight: number) => {
    if (val === null || val === undefined) return '—';
    return `${val} / ${maxWeight}đ`;
  };

  return (
    <div style={{ marginBottom: 10 }}>
      {/* SQI HERO BAR */}
      <div
        className="report-sqi-hero"
        style={{
          border: '1px solid #000',
          borderRadius: 6,
          padding: '8px 12px',
          background: '#ffffff',
          marginBottom: 6,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Chỉ số chất lượng (SQI)
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {sqiScore !== null && sqiScore !== undefined ? sqiScore : '—'}{' '}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/ 100</span>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Xếp loại học lực
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: level.color }}>
                {level.label}
              </div>
            </div>

            {sqiDelta !== undefined && sqiDelta !== null && (
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 12 }}>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  {isMonthly ? 'So với tháng trước' : 'So với tuần trước'}
                </div>
                <div style={{ marginTop: 2 }}>
                  {sqiDelta > 0 ? (
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <TrendingUp size={13} /> +{sqiDelta} điểm
                    </span>
                  ) : sqiDelta < 0 ? (
                    <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <TrendingDown size={13} /> {sqiDelta} điểm
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Minus size={13} /> Duy trì ổn định
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {overview && (
          <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed #e2e8f0', fontSize: 12, color: '#334155', fontStyle: 'italic' }}>
            "{overview}"
          </div>
        )}
      </div>

      {/* 4 FACTOR TABLE (COMPACT 2-COLUMN SPLIT TABLE) */}
      {sqiBreakdown && (
        <div className="report-sqi-table-container" style={{ marginBottom: 6 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: '11px',
              background: '#ffffff',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ width: '36px', textAlign: 'center', padding: '3px 4px', color: '#475569', fontWeight: 600 }}>STT</th>
                <th style={{ textAlign: 'left', padding: '3px 8px', color: '#475569', fontWeight: 600 }}>Chỉ số đánh giá</th>
                <th style={{ width: '85px', textAlign: 'center', padding: '3px 6px', color: '#475569', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>Điểm đạt</th>
                <th style={{ width: '36px', textAlign: 'center', padding: '3px 4px', color: '#475569', fontWeight: 600 }}>STT</th>
                <th style={{ textAlign: 'left', padding: '3px 8px', color: '#475569', fontWeight: 600 }}>Chỉ số đánh giá</th>
                <th style={{ width: '85px', textAlign: 'center', padding: '3px 6px', color: '#475569', fontWeight: 600 }}>Điểm đạt</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: '#64748b' }}>1</td>
                <td style={{ padding: '3px 8px', color: '#1e293b', fontWeight: 500 }}>Chuyên cần (30%)</td>
                <td style={{ textAlign: 'center', padding: '3px 6px', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>
                  {formatCriterion(sqiBreakdown.attendance, 30)}
                </td>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: '#64748b' }}>2</td>
                <td style={{ padding: '3px 8px', color: '#1e293b', fontWeight: 500 }}>Làm bài tập (30%)</td>
                <td style={{ textAlign: 'center', padding: '3px 6px', fontWeight: 600, color: '#0f172a' }}>
                  {formatCriterion(sqiBreakdown.homework, 30)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: '#64748b' }}>3</td>
                <td style={{ padding: '3px 8px', color: '#1e293b', fontWeight: 500 }}>Tuân thủ nội quy (20%)</td>
                <td style={{ textAlign: 'center', padding: '3px 6px', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>
                  {formatCriterion(sqiBreakdown.behavior, 20)}
                </td>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: '#64748b' }}>4</td>
                <td style={{ padding: '3px 8px', color: '#1e293b', fontWeight: 500 }}>Tích cực tham gia (20%)</td>
                <td style={{ textAlign: 'center', padding: '3px 6px', fontWeight: 600, color: '#0f172a' }}>
                  {formatCriterion(sqiBreakdown.participation ?? sqiBreakdown.attitude, 20)}
                </td>
              </tr>
              <tr style={{ background: '#eef2ff' }}>
                <td colSpan={4} style={{ padding: '3px 8px', color: '#3730a3', fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>
                  ★ Tổng điểm chất lượng SQI: {level.label}
                </td>
                <td colSpan={2} style={{ textAlign: 'center', padding: '3px 8px', color: '#3730a3', fontWeight: 700, fontSize: '12px' }}>
                  {sqiScore !== null && sqiScore !== undefined ? `${sqiScore} / 100đ` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
