import React from 'react';
import { Card, Row, Col, Button, Table, Typography, Tag, Spin, Statistic } from 'antd';
import { TeamOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import { cardStyle } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface StudentsTabProps {
  data: any;
  loading: boolean;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byMonth, newList } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  const handleExportNewStudentsExcel = () => {
    const exportData = (newList || []).map((s: any) => ({
      studentCode: s.studentCode || '—',
      studentName: s.studentName || '—',
      birthdate: s.birthdate ? dayjs(s.birthdate).format('DD/MM/YYYY') : '—',
      mobile: s.mobile || '—',
      classNames: s.classNames || '—',
      status: s.status === 'Active' ? 'Active' : (s.status || '—'),
      createdAt: s.createdAt ? dayjs(s.createdAt).format('DD/MM/YYYY') : '—',
    }));

    exportToExcel(
      exportData,
      'hoc-sinh-moi.xlsx',
      ['Mã HS', 'Họ tên', 'Ngày sinh', 'Số điện thoại', 'Lớp học', 'Trạng thái', 'Ngày đăng ký'],
      ['studentCode', 'studentName', 'birthdate', 'mobile', 'classNames', 'status', 'createdAt'],
      'Học viên mới'
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tổng số học sinh" value={summary.totalStudents} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Học sinh đang học (Active)" value={summary.activeStudents} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Học sinh mới trong tháng" value={summary.newStudentsThisMonth} prefix={<TeamOutlined />} valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Biểu đồ số lượng học sinh mới đăng ký qua các tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <RechartsTooltip formatter={(v: any) => [`${v} học sinh`, 'Đăng ký mới']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="count" name="Học sinh mới" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel" title="Danh sách học sinh mới đăng ký" style={cardStyle}
        extra={<Button icon={<DownloadOutlined />} size="small" onClick={handleExportNewStudentsExcel} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
      >
        <Table
          dataSource={newList} rowKey="studentId" pagination={{ pageSize: 10 }} size="small"
          columns={[
            { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 120 },
            { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName', width: 160 },
            { title: 'Ngày sinh', dataIndex: 'birthdate', key: 'birthdate', width: 120, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
            { title: 'Số điện thoại', dataIndex: 'mobile', key: 'mobile', width: 130 },
            { title: 'Lớp học', dataIndex: 'classNames', key: 'classNames', render: (v: string) => v || '—' },
            { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140, render: (v: string) => <Tag color={v === 'Active' ? 'green' : 'orange'}>{v}</Tag> },
            { title: 'Ngày đăng ký', dataIndex: 'createdAt', key: 'createdAt', width: 130, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
          ]}
        />
      </Card>
    </div>
  );
};
