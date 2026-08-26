import React from 'react';
import { Card, Button, Table, Statistic, Row, Col, Typography, Spin } from 'antd';
import { DollarOutlined, CheckCircleOutlined, WarningOutlined, PercentageOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { COLORS, cardStyle, fmtVND } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface RevenueTabProps {
  data: any;
  loading: boolean;
}

export const RevenueTab: React.FC<RevenueTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byMonth, byCenter } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tổng phát sinh" value={summary.totalExpected} formatter={(v) => fmtVND(Number(v))} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Đã thu" value={summary.totalPaid} formatter={(v) => fmtVND(Number(v))} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Còn nợ" value={summary.totalDebt} formatter={(v) => fmtVND(Number(v))} prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tỉ lệ thu" value={summary.collectionRate} suffix="%" prefix={<PercentageOutlined />} valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card className="glass-panel" title="Doanh thu theo tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <RechartsTooltip formatter={(v: any) => fmtVND(Number(v))} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="expected" name="Phát sinh" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Đã thu" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="glass-panel" title="Phân bổ theo trung tâm" style={cardStyle}>
            {byCenter && byCenter.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={byCenter} dataKey="expected" nameKey="centerName" cx="50%" cy="50%" outerRadius={100} label={({ centerName, percent }: any) => `${centerName} (${(percent * 100).toFixed(0)}%)`}>
                    {byCenter.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => fmtVND(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Text style={{ color: 'var(--text-muted)' }}>Không có dữ liệu.</Text>}
          </Card>
        </Col>
      </Row>

      {byCenter && byCenter.length > 0 && (
        <Card className="glass-panel" title="Chi tiết theo trung tâm" style={cardStyle}
          extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(byCenter, 'bc-doanh-thu-trung-tam.xlsx', ['Trung tâm', 'Phát sinh (₫)', 'Đã thu (₫)'], ['centerName', 'expected', 'paid'], 'Doanh thu trung tâm')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
        >
          <Table
            dataSource={byCenter} rowKey="centerId" pagination={false} size="small"
            columns={[
              { title: 'Trung tâm', dataIndex: 'centerName', key: 'centerName' },
              { title: 'Phát sinh', dataIndex: 'expected', key: 'expected', align: 'right', render: (v: number) => fmtVND(v) },
              { title: 'Đã thu', dataIndex: 'paid', key: 'paid', align: 'right', render: (v: number) => fmtVND(v) },
              { title: 'Tỉ lệ thu', key: 'rate', align: 'center', render: (_: any, r: any) => `${r.expected > 0 ? ((r.paid / r.expected) * 100).toFixed(1) : 0}%` },
            ]}
          />
        </Card>
      )}
    </div>
  );
};
