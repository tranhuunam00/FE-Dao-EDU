import React from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import { Calendar, CheckCircle2, XCircle, Clock, MessageSquare, Award } from 'lucide-react';

const { Text } = Typography;

interface SessionDetail {
  classSessionId: string;
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
}

export const WeeklyReportSessionsTable: React.FC<WeeklyReportSessionsTableProps> = ({ sessions }) => {
  if (!sessions || sessions.length === 0) return null;

  const formatDate = (dStr?: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const columns = [
    {
      title: 'Buổi học / Môn học',
      key: 'subject',
      render: (_: any, row: SessionDetail) => (
        <div>
          <Text strong style={{ color: 'var(--text-primary, #111827)' }}>
            {row.subjectName}
          </Text>
          {row.date && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)', marginTop: 2 }}>
              <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {formatDate(row.date)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Điểm danh',
      key: 'attendance',
      width: 110,
      render: (_: any, row: SessionDetail) => {
        if (!row.isPresent) {
          return (
            <Tag color="error" icon={<XCircle size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />}>
              Vắng mặt
            </Tag>
          );
        }
        if (row.isLate) {
          return (
            <Tag color="warning" icon={<Clock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />}>
              Đi trễ
            </Tag>
          );
        }
        return (
          <Tag color="success" icon={<CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />}>
            Có mặt
          </Tag>
        );
      },
    },
    {
      title: 'Bài tập về nhà',
      key: 'homework',
      width: 130,
      render: (_: any, row: SessionDetail) => {
        const hw = row.homeworkStatus;
        if (hw === 'completed') return <Tag color="green">Đã hoàn thành</Tag>;
        if (hw === 'incomplete') return <Tag color="orange">Chưa hoàn thiện</Tag>;
        return <Tag color="red">Chưa làm</Tag>;
      },
    },
    {
      title: 'Tiếp thu & Nề nếp',
      key: 'understanding',
      render: (_: any, row: SessionDetail) => {
        const und = row.understanding;
        return (
          <Space direction="vertical" size={2}>
            {und === 'understood' && <Tag color="blue">Hiểu bài nhanh</Tag>}
            {und === 'partially' && <Tag color="gold">Hiểu cơ bản</Tag>}
            {und === 'not_understood' && <Tag color="red">Cần kèm thêm</Tag>}
            {row.behaviorTags && row.behaviorTags.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary, #6b7280)' }}>
                {row.behaviorTags.join(', ')}
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Điểm số',
      key: 'score',
      width: 90,
      align: 'center' as const,
      render: (_: any, row: SessionDetail) =>
        row.score ? (
          <Tag color="purple" icon={<Award size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />}>
            {row.score}đ
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Nhận xét của giáo viên',
      key: 'comment',
      render: (_: any, row: SessionDetail) =>
        row.teacherComment ? (
          <div style={{ fontSize: 13, color: 'var(--text-primary, #1f2937)', fontStyle: 'italic' }}>
            <MessageSquare size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#6366f1' }} />
            "{row.teacherComment}"
          </div>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Chưa có ghi chú</Text>
        ),
    },
  ];

  return (
    <div style={{ marginTop: 24, marginBottom: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #6b7280)' }}>
        📋 Chi Tiết Từng Buổi Học Trong Tuần
      </Text>
      <Table
        size="small"
        pagination={false}
        style={{ marginTop: 8 }}
        rowKey={(record) => record.classSessionId}
        dataSource={sessions}
        columns={columns}
      />
    </div>
  );
};
