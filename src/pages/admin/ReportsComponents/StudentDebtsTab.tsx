import React from 'react';
import { Card, Button, Table, Typography, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { cardStyle, fmtVND } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface StudentDebtsTabProps {
  data: any[] | null;
  loading: boolean;
}

export const StudentDebtsTab: React.FC<StudentDebtsTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (data === null) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;
  if (data.length === 0) return <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy dữ liệu báo cáo phù hợp với bộ lọc.</Text>;

  return (
    <Card className="glass-panel" title="Báo cáo theo dõi công nợ học viên" style={cardStyle}
      extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(data, 'bc-cong-no-hoc-vien.xlsx', ['Mã HS', 'Tên học sinh', 'Lớp học', 'Phát sinh nợ (₫)', 'Đã đóng (₫)', 'Còn nợ (Công nợ) (₫)'], ['studentCode', 'studentName', 'classCode', 'totalExpected', 'totalPaid', 'debtAmount'], 'Công nợ học viên')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
    >
      <Table
        dataSource={data} rowKey={(r) => `${r.studentId}-${r.classCode}`} pagination={{ pageSize: 15 }} size="small"
        columns={[
          { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 120 },
          { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName', width: 180 },
          { title: 'Lớp học', dataIndex: 'classCode', key: 'classCode', width: 180, render: (v, r) => v ? `${v} - ${r.className}` : '-' },
          { title: 'Phát sinh nợ', dataIndex: 'totalExpected', key: 'totalExpected', width: 150, align: 'right', render: (v) => fmtVND(Number(v)) },
          { title: 'Đã đóng', dataIndex: 'totalPaid', key: 'totalPaid', width: 150, align: 'right', render: (v) => fmtVND(Number(v)) },
          { title: 'Còn nợ (Công nợ)', dataIndex: 'debtAmount', key: 'debtAmount', width: 160, align: 'right', render: (v) => <span style={{ color: Number(v) > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{fmtVND(Number(v))}</span> },
        ]}
      />
    </Card>
  );
};
