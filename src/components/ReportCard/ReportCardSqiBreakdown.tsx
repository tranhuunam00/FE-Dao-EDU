import React from 'react';
import { Row, Col } from 'antd';
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
    return `${((val / maxWeight) * 10).toFixed(1)}/10`;
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

      {/* 7 FACTOR GRID (COMPACT SCIENTIFIC) */}
      {sqiBreakdown && (
        <div className="report-sqi-grid" style={{ borderRadius: 6, background: '#f8fafc', marginBottom: 8, padding: '0 4px' }}>
          <Row gutter={[8, 8]}>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Học tập (30%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.academic, 30)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Tiến bộ (20%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.progress, 20)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Tiếp thu (15%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.competency, 15)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Chuyên cần (10%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.attendance, 10)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Bài tập (10%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.homework, 10)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Thái độ (10%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.attitude, 10)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={boxStyle}>
                <span style={labelStyle}>Kỷ luật (5%)</span>
                <strong style={valStyle}>{formatCriterion(sqiBreakdown.behavior, 5)}</strong>
              </div>
            </Col>
            <Col span={3}>
              <div style={{ ...boxStyle, background: '#e0e7ff', borderColor: '#000' }}>
                <span style={{ ...labelStyle, color: '#3730a3', fontWeight: 700 }}>Tổng SQI</span>
                <strong style={{ ...valStyle, color: '#3730a3' }}>
                  {sqiScore !== null && sqiScore !== undefined ? `${sqiScore}đ` : '—'}
                </strong>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

const boxStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #000',
  borderRadius: 4,
  padding: '2px 0',
  textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#64748b',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const valStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#0f172a',
  display: 'block',
  marginTop: 1,
};
