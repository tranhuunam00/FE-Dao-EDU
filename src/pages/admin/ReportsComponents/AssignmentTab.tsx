import React from 'react';
import { Card, Row, Col, Button, Table, Typography, Spin, Statistic } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, WarningOutlined, PercentageOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cardStyle } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface AssignmentTabProps {
  data: any;
  loading: boolean;
}

export const AssignmentTab: React.FC<AssignmentTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byClass } = data;

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tổng bài giao" value={summary.totalAssigned} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Đã nộp" value={summary.totalSubmitted} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Đã chấm" value={summary.totalGraded} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#6366f1' }} /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Chưa nộp" value={summary.totalMissing} prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444' }} /></Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Điểm TB" value={summary.averageScore} precision={1} prefix={<PercentageOutlined />} valueStyle={{ color: '#f59e0b' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Tỉ lệ hoàn thành bài tập theo lớp" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byClass} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis type="category" dataKey="classCode" width={120} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="submitted" name="Đã nộp" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="missing" name="Chưa nộp" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel" title="Chi tiết bài tập theo lớp" style={cardStyle}
        extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(byClass, 'bc-bai-tap.xlsx', ['Mã lớp', 'Tên lớp', 'Tổng giao', 'Đã nộp', 'Đã chấm', 'Chưa nộp', 'Điểm trung bình'], ['classCode', 'className', 'assigned', 'submitted', 'graded', 'missing', 'averageScore'], 'Bài tập theo lớp')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
      >
        <Table
          dataSource={byClass} rowKey="classId" pagination={{ pageSize: 15 }} size="small"
          columns={[
            { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 130 },
            { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
            { title: 'Tổng giao', dataIndex: 'assigned', key: 'assigned', width: 90, align: 'center' },
            { title: 'Đã nộp', dataIndex: 'submitted', key: 'submitted', width: 90, align: 'center' },
            { title: 'Đã chấm', dataIndex: 'graded', key: 'graded', width: 90, align: 'center' },
            { title: 'Chưa nộp', dataIndex: 'missing', key: 'missing', width: 90, align: 'center', render: (v: number) => <span style={{ color: v > 0 ? '#ef4444' : '#10b981' }}>{v}</span> },
            { title: 'Điểm TB', dataIndex: 'averageScore', key: 'averageScore', width: 90, align: 'center', render: (v: number) => v > 0 ? v.toFixed(1) : '-' },
          ]}
        />
      </Card>
    </div>
  );
};
