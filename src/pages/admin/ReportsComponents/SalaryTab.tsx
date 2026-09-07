import React from 'react';
import { Card, Row, Col, Button, Table, Typography, Tag, Spin, Statistic } from 'antd';
import { TeamOutlined, DollarOutlined, CheckCircleOutlined, WarningOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cardStyle, fmtVND } from './utils';
import { calculateSalaryBreakdown } from '../../../utils/salary';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface SalaryTabProps {
  data: any;
  loading: boolean;
}

export const SalaryTab: React.FC<SalaryTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byTeacher, byMonth } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Lương GV chính (Gross)" value={summary.totalMainTeacher} formatter={(v) => fmtVND(Number(v))} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Lương Trợ giảng (Gross)" value={summary.totalTA} formatter={(v) => fmtVND(Number(v))} prefix={<TeamOutlined />} valueStyle={{ color: '#8b5cf6' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tổng chi (Gross)" value={summary.totalExpense} formatter={(v) => fmtVND(Number(v))} prefix={<DollarOutlined />} valueStyle={{ color: '#ef4444' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Đã chi (Thực trả)" value={calculateSalaryBreakdown(summary.totalPaid).net} formatter={(v) => fmtVND(Number(v))} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Chưa chi (Cần chi)" value={calculateSalaryBreakdown(summary.totalUnpaid).net} formatter={(v) => fmtVND(Number(v))} prefix={<WarningOutlined />} valueStyle={{ color: '#f59e0b' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="So sánh lương GV chính vs Trợ giảng theo tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <RechartsTooltip formatter={(v: any) => fmtVND(Number(v))} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="mainTeacher" name="GV Chính" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ta" name="Trợ giảng" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel" title="Chi tiết lương từng giáo viên" style={cardStyle}
        extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => {
          const mappedReport = (byTeacher || []).map((t: any) => {
            const net = t.totalAmount || 0;
            const gross = Math.round(net / 0.9);
            const tax = Math.round((net * 0.1) / 0.9);
            const netPaid = t.status === 'Paid' ? (t.paidAmount || 0) : 0;
            return {
              ...t,
              gross,
              tax,
              net,
              netPaid,
            };
          });
          exportToExcel(
            mappedReport,
            'bc-luong-giao-vien.xlsx',
            ['Mã GV', 'Họ tên', 'Loại', 'Số buổi', 'Tổng lương (Gross) (₫)', 'Thuế TNCN (10%) (₫)', 'Thực nhận (Net) (₫)', 'Thực chi (Thực trả) (₫)', 'Trạng thái'],
            ['teacherCode', 'teacherName', 'type', 'sessions', 'gross', 'tax', 'net', 'netPaid', 'status'],
            'Chi tiết lương giáo viên'
          );
        }} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
      >
        <Table
          dataSource={byTeacher} rowKey="teacherId" pagination={{ pageSize: 15 }} size="small"
          columns={[
            { title: 'Mã GV', dataIndex: 'teacherCode', key: 'teacherCode', width: 120 },
            { title: 'Họ tên', dataIndex: 'teacherName', key: 'teacherName', width: 200 },
            { title: 'Loại', dataIndex: 'type', key: 'type', width: 150, render: (v: string) => <Tag color={v === 'Teaching Assistant' ? 'purple' : 'blue'}>{v === 'Teaching Assistant' ? 'Trợ giảng' : 'Giáo viên'}</Tag> },
            { title: 'Số buổi', dataIndex: 'sessions', key: 'sessions', width: 90, align: 'center' },
            { title: 'Tổng lương (Gross)', dataIndex: 'totalAmount', key: 'totalAmount', width: 150, align: 'right' as const, render: (v: number) => fmtVND(Math.round(v / 0.9)) },
            {
              title: 'Thuế TNCN (10%)',
              key: 'taxAmount',
              width: 130,
              align: 'right' as const,
              render: (_: any, r: any) => fmtVND(Math.round((r.totalAmount * 0.1) / 0.9))
            },
            {
              title: 'Thực nhận (Net)',
              key: 'netAmount',
              width: 150,
              align: 'right' as const,
              render: (_: any, r: any) => <Text strong style={{ color: '#f59e0b' }}>{fmtVND(r.totalAmount)}</Text>
            },
            {
              title: 'Đã chi (Thực trả)',
              dataIndex: 'paidAmount',
              key: 'paidAmount',
              width: 150,
              align: 'right' as const,
              render: (v: number) => fmtVND(v)
            },
            { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (v: string) => <Tag color={v === 'Paid' ? 'green' : 'orange'}>{v === 'Paid' ? 'Đã chi' : 'Chưa chi'}</Tag> },
          ]}
        />
      </Card>
    </div>
  );
};
