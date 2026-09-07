import React from 'react';
import { Card, Tag, Row, Col, Progress, Table, Typography, Space, Button } from 'antd';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertCircle,
  Printer,
  Calendar,
  BookOpen,
} from 'lucide-react';
import type { WeeklyReportData } from '../services/weekly-report.service';
import { WeeklyReportSessionsTable } from './WeeklyReportSessionsTable';

const { Title, Text, Paragraph } = Typography;

interface WeeklyReportCardProps {
  report: WeeklyReportData;
  onPrint?: () => void;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({ report: rawReport, onPrint }) => {
  const r = (rawReport || {}) as any;
  const report = {
    ...rawReport,
    studentName: rawReport?.studentName || r._studentName || 'Học sinh',
    studentCode: rawReport?.studentCode || r._studentCode || '',
    weekNumber: rawReport?.weekNumber || r._weekNumber || 0,
    year: rawReport?.year || r._year || new Date().getFullYear(),
    startDate: rawReport?.startDate || r._startDate || '',
    endDate: rawReport?.endDate || r._endDate || '',
    sqiScore: rawReport?.sqiScore ?? r._sqiScore ?? 0,
    sqiDelta: rawReport?.sqiDelta ?? r._sqiDelta ?? 0,
    sqiBreakdown: rawReport?.sqiBreakdown || r._sqiBreakdown,
    subjectPerformances: rawReport?.subjectPerformances || r._subjectPerformances || [],
    overview: rawReport?.overview || r._overview || '',
    strengths: rawReport?.strengths || r._strengths || '',
    improvements: rawReport?.improvements || r._improvements || '',
    recommendations: rawReport?.recommendations || r._recommendations || [],
    sessions: rawReport?.sessions || r._sessions || [],
  };

  const getLevelColor = (score: number) => {
    if (score >= 90) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Level 5 - Xuất sắc' };
    if (score >= 75) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', label: 'Level 4 - Giỏi' };
    if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Level 3 - Khá' };
    if (score >= 45) return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', label: 'Level 2 - Trung bình' };
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', label: 'Level 1 - Yếu' };
  };

  const levelInfo = getLevelColor(report.sqiScore);

  const formatDate = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const handleDefaultPrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="weekly-report-container" style={{ maxWidth: 880, margin: '0 auto', paddingBottom: 24 }}>
      {/* ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<Printer size={16} />}
          onClick={handleDefaultPrint}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            borderColor: 'transparent',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
          }}
        >
          In / Tải thiệp báo cáo
        </Button>
      </div>

      {/* MAIN REPORT CARD */}
      <Card
        className="glass-panel"
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-color, rgba(229, 231, 235, 0.5))',
          background: 'var(--card-bg, #ffffff)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: '24px 28px' } }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            paddingBottom: 20,
            borderBottom: '1px dashed var(--border-color, #e5e7eb)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                }}
              >
                Educare AI
              </span>
              <Text style={{ fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>
                Báo cáo chất lượng học tập
              </Text>
            </div>
            <Title level={3} style={{ margin: '8px 0 0', color: 'var(--text-primary, #111827)' }}>
              {report.studentName || 'Học sinh'}{' '}
              {report.studentCode && (
                <Text style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  ({report.studentCode})
                </Text>
              )}
            </Title>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Tag
              icon={<Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
              style={{
                fontSize: 13,
                padding: '4px 12px',
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.08)',
                color: '#4f46e5',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Tuần {report.weekNumber} / {report.year}
            </Tag>
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)', marginTop: 4 }}>
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </div>
          </div>
        </div>

        {/* HERO SQI SECTION */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            margin: '24px 0',
            padding: '20px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
          }}
        >
          {/* SQI SCORE & LEVEL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: levelInfo.bg,
                border: `3px solid ${levelInfo.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 20px ${levelInfo.bg}`,
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 800, color: levelInfo.color, lineHeight: 1 }}>
                {report.sqiScore}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary, #6b7280)', marginTop: 2 }}>
                / 100 SQI
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: levelInfo.color }}>
                  {levelInfo.label}
                </span>
                {report.sqiDelta > 0 ? (
                  <Tag color="success" style={{ borderRadius: 6, fontWeight: 700 }}>
                    <TrendingUp size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                    +{report.sqiDelta} điểm
                  </Tag>
                ) : report.sqiDelta < 0 ? (
                  <Tag color="error" style={{ borderRadius: 6, fontWeight: 700 }}>
                    <TrendingDown size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                    {report.sqiDelta} điểm
                  </Tag>
                ) : (
                  <Tag color="default" style={{ borderRadius: 6, fontWeight: 600 }}>
                    <Minus size={13} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                    Giữ vững
                  </Tag>
                )}
              </div>
              <Paragraph style={{ margin: '6px 0 0', color: 'var(--text-secondary, #4b5563)', fontSize: 14 }}>
                {report.overview}
              </Paragraph>
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: 160 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)', marginBottom: 4 }}>
              Đánh giá chất lượng tổng thể
            </div>
            <Progress
              percent={report.sqiScore}
              strokeColor={{ '0%': '#6366f1', '100%': levelInfo.color }}
              showInfo={false}
              size={['100%', 10]}
            />
          </div>
        </div>

        {/* 7 FACTORS SQI BREAKDOWN GRID */}
        {report.sqiBreakdown && (
          <div style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #6b7280)' }}>
              Cấu trúc 7 Yếu Tố Đánh Giá SQI
            </Text>
            <Row gutter={[12, 12]} style={{ marginTop: 10 }}>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Học tập (30%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.academic}/30</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Tiến bộ (20%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.progress}/20</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Năng lực (15%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.competency}/15</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Chuyên cần (10%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.attendance}/10</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Bài tập (10%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.homework}/10</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Thái độ (10%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.attitude}/10</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={factorBoxStyle}>
                  <Text style={factorTitleStyle}>Kỹ năng (5%)</Text>
                  <span style={factorValStyle}>{report.sqiBreakdown.behavior}/5</span>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <div style={{ ...factorBoxStyle, background: 'rgba(99, 102, 241, 0.08)' }}>
                  <Text style={{ ...factorTitleStyle, color: '#4f46e5' }}>Tổng SQI</Text>
                  <span style={{ ...factorValStyle, color: '#4f46e5' }}>{report.sqiScore}đ</span>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* SUBJECT PERFORMANCES TABLE */}
        {report.subjectPerformances && report.subjectPerformances.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #6b7280)' }}>
              Kết Quả Học Tập Theo Môn
            </Text>
            <Table
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              rowKey="subjectName"
              dataSource={report.subjectPerformances}
              columns={[
                {
                  title: 'Môn học',
                  dataIndex: 'subjectName',
                  render: (name: string) => (
                    <Space orientation="horizontal" size={8}>
                      <BookOpen size={15} color="#4f46e5" />
                      <Text strong>{name}</Text>
                    </Space>
                  ),
                },
                {
                  title: 'Điểm số tuần',
                  key: 'score',
                  render: (_: any, row: any) => (
                    <Space size={8} wrap>
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color: row.score >= 8 ? '#10b981' : row.score >= 6.5 ? '#3b82f6' : '#f59e0b',
                        }}
                      >
                        {row.score} / 10
                      </Text>
                      {row.isEstimated ? (
                        <Tag color="cyan" style={{ fontSize: 11, borderRadius: 10, margin: 0 }}>
                          Theo mức tiếp thu
                        </Tag>
                      ) : (
                        <Tag color="purple" style={{ fontSize: 11, borderRadius: 10, margin: 0 }}>
                          Điểm kiểm tra
                        </Tag>
                      )}
                    </Space>
                  ),
                },
                {
                  title: 'Xu hướng',
                  dataIndex: 'trend',
                  render: (tr: string) =>
                    tr === 'up' ? (
                      <Tag color="success">
                        <TrendingUp size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Tăng tiến
                      </Tag>
                    ) : tr === 'down' ? (
                      <Tag color="error">
                        <TrendingDown size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Cần chú ý
                      </Tag>
                    ) : (
                      <Tag color="default">
                        <Minus size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Ổn định
                      </Tag>
                    ),
                },
              ]}
            />
          </div>
        )}

        {/* CHI TIẾT TỪNG BUỔI HỌC TRONG TUẦN */}
        <WeeklyReportSessionsTable sessions={report.sessions} />

        {/* 3 PEDAGOGICAL CARDS (STRENGTHS, IMPROVEMENTS, RECOMMENDATIONS) */}
        <Row gutter={[16, 16]}>
          {/* STRENGTHS */}
          <Col xs={24} md={12}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 12,
                padding: '16px 18px',
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Trophy size={18} color="#10b981" />
                <Text strong style={{ color: '#047857', fontSize: 14 }}>
                  🎯 Điểm Mạnh Trong Tuần
                </Text>
              </div>
              <Paragraph style={{ margin: 0, color: 'var(--text-primary, #1f2937)', fontSize: 13.5, lineHeight: 1.6 }}>
                {report.strengths || 'Học sinh duy trì nỗ lực trong các buổi học.'}
              </Paragraph>
            </div>
          </Col>

          {/* IMPROVEMENTS */}
          <Col xs={24} md={12}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 12,
                padding: '16px 18px',
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={18} color="#d97706" />
                <Text strong style={{ color: '#b45309', fontSize: 14 }}>
                  ⚠️ Cần Cải Thiện
                </Text>
              </div>
              <Paragraph style={{ margin: 0, color: 'var(--text-primary, #1f2937)', fontSize: 13.5, lineHeight: 1.6 }}>
                {report.improvements || 'Tiếp tục phát huy nề nếp học tập.'}
              </Paragraph>
            </div>
          </Col>

          {/* RECOMMENDATIONS FOR PARENTS */}
          <Col span={24}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 12,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={18} color="#6366f1" />
                <Text strong style={{ color: '#4338ca', fontSize: 14.5 }}>
                  🤖 Khuyến Nghị Tuần Tới Dành Cho Phụ Huynh
                </Text>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {(report.recommendations || []).map((rec, idx) => (
                  <li key={idx} style={{ color: 'var(--text-primary, #1f2937)', fontSize: 13.5, marginBottom: 6 }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

const factorBoxStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.02)',
  border: '1px solid var(--border-color, #e5e7eb)',
  borderRadius: 8,
  padding: '8px 10px',
  textAlign: 'center',
};

const factorTitleStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #6b7280)',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const factorValStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-primary, #111827)',
  display: 'block',
  marginTop: 2,
};
