import React from 'react';
import { Card, Row, Col, Button, Table, Typography, Tag, Spin, Statistic } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, WarningOutlined, PercentageOutlined, DownloadOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cardStyle } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface AttendanceTabProps {
  data: any;
  loading: boolean;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byClass, byMonth, topAbsent } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tổng lượt chấm" value={summary.totalSessions} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Có mặt" value={summary.totalPresent} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Vắng mặt" value={summary.totalAbsent} prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tỉ lệ chuyên cần" value={summary.attendanceRate} suffix="%" prefix={<PercentageOutlined />} valueStyle={{ color: '#6366f1' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Xu hướng chuyên cần theo tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="rate" name="Tỉ lệ có mặt" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card className="glass-panel" title="Chuyên cần theo lớp" style={cardStyle}
            extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(byClass, 'bc-diem-danh-lop.xlsx', ['Mã lớp', 'Tên lớp', 'Có mặt', 'Vắng mặt', 'Tỉ lệ %'], ['classCode', 'className', 'presentCount', 'absentCount', 'rate'], 'Điểm danh theo lớp')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
          >
            <Table
              dataSource={byClass} rowKey="classId" pagination={{ pageSize: 10 }} size="small"
              columns={[
                { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 130 },
                { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
                { title: 'Có mặt', dataIndex: 'presentCount', key: 'presentCount', width: 90, align: 'center' },
                { title: 'Vắng', dataIndex: 'absentCount', key: 'absentCount', width: 90, align: 'center' },
                { title: 'Tỉ lệ', dataIndex: 'rate', key: 'rate', width: 90, align: 'center', render: (v: number) => <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}%</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="glass-panel" title="Top học sinh vắng nhiều" style={cardStyle}>
            <Table
              dataSource={topAbsent} rowKey="studentId" pagination={false} size="small"
              columns={[
                { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 110 },
                { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName' },
                { title: 'Vắng', dataIndex: 'absentCount', key: 'absentCount', width: 60, align: 'center' },
                { title: 'Tỉ lệ vắng', dataIndex: 'rate', key: 'rate', width: 90, align: 'center', render: (v: number) => <Tag color={v >= 30 ? 'red' : 'orange'}>{v}%</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
