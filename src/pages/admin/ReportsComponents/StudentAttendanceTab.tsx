import React from 'react';
import { Card, Button, Table, Typography, Tag, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { cardStyle } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface StudentAttendanceTabProps {
  data: any[] | null;
  loading: boolean;
}

export const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (data === null) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;
  if (data.length === 0) return <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy dữ liệu báo cáo phù hợp với bộ lọc.</Text>;

  return (
    <Card className="glass-panel" title="Báo cáo điểm danh theo Học viên" style={cardStyle}
      extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(data, 'bc-diem-danh-hoc-vien.xlsx', ['Mã HS', 'Tên học sinh', 'Mã lớp', 'Tên lớp', 'Tổng số buổi', 'Có mặt', 'Vắng mặt', 'Tỉ lệ có mặt (%)', 'Điểm đánh giá trung bình'], ['studentCode', 'studentName', 'classCode', 'className', 'totalSessions', 'presentCount', 'absentCount', 'rate', 'avgEvaluationScore'], 'Điểm danh theo học viên')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
    >
      <Table
        dataSource={data} rowKey={(r) => `${r.studentId}-${r.classCode}`} pagination={{ pageSize: 15 }} size="small"
        columns={[
          { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 120 },
          { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName', width: 180 },
          { title: 'Lớp học', dataIndex: 'classCode', key: 'classCode', width: 220, render: (v, r) => `${v} - ${r.className}` },
          { title: 'Tổng số buổi', dataIndex: 'totalSessions', key: 'totalSessions', width: 110, align: 'center' },
          { title: 'Có mặt', dataIndex: 'presentCount', key: 'presentCount', width: 100, align: 'center', render: (v) => <span style={{ color: '#10b981', fontWeight: 600 }}>{v}</span> },
          { title: 'Vắng mặt', dataIndex: 'absentCount', key: 'absentCount', width: 100, align: 'center', render: (v) => v > 0 ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{v}</span> : '0' },
          { title: 'Tỉ lệ có mặt', key: 'rate', width: 130, align: 'center', render: (_, r) => {
              const rate = r.totalSessions > 0 ? ((r.presentCount / r.totalSessions) * 100).toFixed(1) : '0.0';
              return <Tag color={Number(rate) >= 80 ? 'green' : Number(rate) >= 50 ? 'orange' : 'red'}>{rate}%</Tag>;
            }
          },
          { title: 'Điểm ĐG trung bình', dataIndex: 'avgEvaluationScore', key: 'avgEvaluationScore', width: 130, align: 'center' as const, render: (v) => v !== null && v !== undefined ? <b>{Number(v).toFixed(1)}</b> : '—' },
        ]}
      />
    </Card>
  );
};
