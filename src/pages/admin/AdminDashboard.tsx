/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, Users, BookOpen, Layers, Activity, RefreshCw, AlertTriangle, ClipboardCheck, Coins, Wallet, TrendingUp } from 'lucide-react';
import { Card, Row, Col, Typography, Table, Spin, Button, message, App, Tag, Space, Empty } from 'antd';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/theme-context';

const { Title, Text } = Typography;

interface SummaryData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCourses: number;
  totalCenters: number;
  systemStatus: string;
  totalPaidSalary?: number;
  totalCollectedTuition?: number;
  studentGrowth?: Array<{ month: string; students: number }>;
  courseDistribution?: Array<{ name: string; value: number }>;
}

interface RevenueData {
  month: string;
  expected: number;
  actual: number;
}

interface ActivityData {
  id: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

interface OperationsData {
  tasks: {
    unassignedStudents: number;
    unlockedPastSessions: number;
    openPaymentPeriods: number;
    cancelledReceipts: number;
    paymentAnomalies: number;
  };
  atRiskStudents: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    mobile: string | null;
    level: 'high' | 'medium' | 'low';
    score: number;
    reasons: string[];
    suggestion: string;
  }>;
  classSuggestions: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    suggestions: Array<{
      classId: string;
      classCode: string;
      className: string;
      courseName: string;
      levelName: string;
      availableSeats: number | null;
      score: number;
      reasons: string[];
    }>;
  }>;
}

const AdminDashboardInner: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [operations, setOperations] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, revenueRes, actRes, operationsRes] = await Promise.all([
        api.get('/dashboard/admin/summary'),
        api.get('/dashboard/admin/revenue'),
        api.get('/dashboard/admin/activities'),
        api.get('/dashboard/admin/operations'),
      ]);
      setSummary(summaryRes.data.statistics);
      setRevenue(revenueRes.data.revenue);
      setActivities(actRes.data.activities);
      setOperations(operationsRes.data);
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Lỗi khi tải dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const isDark = resolvedTheme === 'dark';
  const chartText = isDark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const chartGrid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.1)';
  const tooltipBackground = isDark ? 'rgba(17, 24, 39, 0.95)' : '#ffffff';
  const tooltipText = isDark ? '#f8fafc' : '#172033';

  const cardStyle = {
    background: 'var(--card-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--card-border)',
    borderRadius: '20px',
    boxShadow: isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.2)'
      : '0 8px 28px rgba(15, 23, 42, 0.08)',
    color: 'var(--text-primary)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  };

  const activityColumns = [
    { 
      title: 'Hành động', 
      dataIndex: 'action', 
      key: 'action',
      render: (text: string, record: ActivityData) => (
        <span style={{ 
          color: record.type === 'student' ? '#818cf8' : '#34d399', 
          fontWeight: 600,
          textShadow: `0 0 10px ${record.type === 'student' ? 'rgba(129, 140, 248, 0.5)' : 'rgba(52, 211, 153, 0.5)'}`
        }}>
          {text}
        </span>
      )
    },
    { title: 'Đối tượng', dataIndex: 'target', key: 'target', render: (t: string) => <span style={{ color: 'var(--text-primary)' }}>{t}</span> },
    { 
      title: 'Thời gian', 
      dataIndex: 'time', 
      key: 'time',
      render: (v: string) => <span style={{ color: 'var(--text-muted)' }}>{dayjs(v).format('DD/MM/YYYY HH:mm')}</span>
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1400, margin: '0 auto', paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          icon={<BookOpen size={16} />}
          onClick={() => navigate('/admin/assignments')}
          style={{ marginRight: 10 }}
        >
          Theo dõi bài tập
        </Button>
        <Button 
          type="primary" 
          icon={<RefreshCw size={16} />} 
          onClick={fetchDashboardData}
          style={{ 
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.4))', 
            border: '1px solid rgba(99,102,241,0.5)', 
            color: '#c7d2fe',
            borderRadius: 8,
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.2)'
          }}
          className="hover-scale"
        >
          Đồng bộ dữ liệu
        </Button>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="dashboard-summary-cards" style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#818cf8', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.2)'
              }}>
                <Users size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tổng Học Sinh</Text>
                <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalStudents?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#34d399', boxShadow: 'inset 0 0 20px rgba(16,185,129,0.2)'
              }}>
                <Shield size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Giáo Viên</Text>
                <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalTeachers?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#fbbf24', boxShadow: 'inset 0 0 20px rgba(245,158,11,0.2)'
              }}>
                <Layers size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Lớp Học</Text>
                <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalClasses?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(236,72,153,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(219,39,119,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#f472b6', boxShadow: 'inset 0 0 20px rgba(236,72,153,0.2)'
              }}>
                <BookOpen size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Chương Trình</Text>
                <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalCourses?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>



      {/* Financial Stats */}
      <Row gutter={[16, 16]} className="dashboard-summary-cards" style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#34d399', boxShadow: 'inset 0 0 20px rgba(16,185,129,0.2)'
              }}>
                <Coins size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tổng tiền đã thu</Text>
                <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {(summary?.totalCollectedTuition || 0).toLocaleString('vi-VN')}&nbsp;₫
                </Title>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={8}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#f87171', boxShadow: 'inset 0 0 20px rgba(239,68,68,0.2)'
              }}>
                <Wallet size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tổng lương đã trả</Text>
                <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {(summary?.totalPaidSalary || 0).toLocaleString('vi-VN')}&nbsp;₫
                </Title>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="dashboard-stat-icon-box" style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#60a5fa', boxShadow: 'inset 0 0 20px rgba(59,130,246,0.2)'
              }}>
                <TrendingUp size={28} />
              </div>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Hiệu số thu - chi</Text>
                <Title level={2} style={{ 
                  color: ((summary?.totalCollectedTuition || 0) - (summary?.totalPaidSalary || 0)) >= 0 ? '#34d399' : '#f87171', 
                  margin: 0, fontFamily: 'Outfit', fontWeight: 700 
                }}>
                  {((summary?.totalCollectedTuition || 0) - (summary?.totalPaidSalary || 0)).toLocaleString('vi-VN')}&nbsp;₫
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>



      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
        <ClipboardCheck size={22} color="#818cf8" />
        <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>Vận hành cần chú ý</Title>
      </div>
      <Row gutter={[16, 16]} className="dashboard-operation-cards" style={{ marginBottom: 20 }}>
        {[
          ['Học sinh chưa xếp lớp', operations?.tasks.unassignedStudents || 0, '/admin/students', '#f59e0b'],
          ['Buổi học chưa chốt điểm danh', operations?.tasks.unlockedPastSessions || 0, '/admin/classes?tab=unlocked', '#ef4444'],
          ['Kỳ học phí/lương chưa chốt', operations?.tasks.openPaymentPeriods || 0, '/admin/accounting', '#6366f1'],
          ['Phiếu hủy thanh toán', operations?.tasks.cancelledReceipts || 0, '/admin/accounting?tab=anomalies', '#ec4899'],
        ].map(([label, value, path, color]) => (
          <Col xs={12} sm={12} lg={6} key={String(label)}>
            <Card className="glass-panel" hoverable onClick={() => navigate(String(path))} bodyStyle={{ padding: 16 }}>
              <Text style={{ color: 'var(--text-secondary)' }}>{label}</Text>
              <div className="dashboard-operation-value" style={{ color: String(color), marginTop: 4 }}>{Number(value)}</div>
            </Card>
          </Col>
        ))}
      </Row>


      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col span={24}>
          <Card
            className="glass-panel"
            title={<Space><AlertTriangle size={19} color="#f59e0b" /><span>Cảnh báo nguy cơ nghỉ học</span></Space>}
          >
            <Table
              rowKey="studentId"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={operations?.atRiskStudents || []}
              columns={[
                {
                  title: 'Học sinh',
                  render: (_, row) => (
                    <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/admin/students/${row.studentId}`)}>
                      {row.studentCode} - {row.studentName}
                    </Button>
                  ),
                },
                {
                  title: 'Mức độ',
                  width: 110,
                  render: (_, row) => <Tag color={row.level === 'high' ? 'red' : 'orange'}>{row.score} điểm</Tag>,
                },
                {
                  title: 'Nguyên nhân',
                  render: (_, row) => <div>{row.reasons.map((reason) => <div key={reason}>{reason}</div>)}</div>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[32, 32]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={15}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <Activity size={20} color="#818cf8" />
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: 18, fontWeight: 600 }}>Biểu đồ Doanh Thu Phân Tích</span>
              </div>
            } 
            style={{ ...cardStyle, height: '100%' }} 
            headStyle={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <div style={{ height: 380, width: '100%', marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke={chartText}
                    tick={{ fill: chartText }}
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke={chartText}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} 
                    tick={{ fill: chartText }}
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBackground,
                      backdropFilter: 'blur(10px)',
                      borderColor: 'var(--card-border)',
                      color: tooltipText,
                      borderRadius: 12,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: tooltipText, fontWeight: 600 }}
                    formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')} ₫`}
                    labelStyle={{ color: chartText, marginBottom: 8 }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: 20 }} iconType="circle" />
                  <Area 
                    type="monotone" 
                    dataKey="expected" 
                    name="Dự kiến thu" 
                    stroke="#818cf8" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorExpected)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8', style: { filter: 'drop-shadow(0 0 5px rgba(129, 140, 248, 0.8))' } }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    name="Thực thu" 
                    stroke="#34d399" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorActual)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399', style: { filter: 'drop-shadow(0 0 5px rgba(52, 211, 153, 0.8))' } }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={9}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <span style={{ 
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981',
                  boxShadow: '0 0 10px #10b981'
                }}></span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: 16, fontWeight: 600 }}>Log Hệ Thống</span>
              </div>
            } 
            style={{ ...cardStyle, height: '100%' }} 
            headStyle={{ borderBottom: '1px solid var(--card-border)', minHeight: 40 }}
            bodyStyle={{ padding: '0 12px 12px 12px' }}
          >
            <Table 
              dataSource={activities} 
              columns={activityColumns} 
              pagination={false}
              rowKey="id"
              size="middle"
              className="premium-transparent-table"
              style={{ background: 'transparent' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Charts */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ 
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#6366f1',
                  boxShadow: '0 0 10px #6366f1'
                }}></span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: 18, fontWeight: 600 }}>Tăng trưởng Học Sinh</span>
              </div>
            } 
            style={cardStyle} 
            headStyle={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summary?.studentGrowth && summary.studentGrowth.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={summary.studentGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="month" stroke={chartText} tick={{ fill: chartText }} />
                    <YAxis stroke={chartText} tick={{ fill: chartText }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: tooltipBackground, borderColor: 'var(--card-border)', borderRadius: 8, color: tooltipText }}
                      itemStyle={{ color: tooltipText }}
                    />
                    <Bar dataKey="students" name="Số học sinh" fill="url(#colorExpected)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu tăng trưởng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ 
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#34d399',
                  boxShadow: '0 0 10px #34d399'
                }}></span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: 18, fontWeight: 600 }}>Phân bố Học Sinh theo Khóa</span>
              </div>
            } 
            style={cardStyle} 
            headStyle={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summary?.courseDistribution && summary.courseDistribution.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={summary.courseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {[ '#6366f1', '#34d399', '#f59e0b', '#ec4899' ].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: tooltipBackground, borderColor: 'var(--card-border)', borderRadius: 8, color: tooltipText }}
                      itemStyle={{ color: tooltipText }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu phân bố" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <App>
      <AdminDashboardInner />
    </App>
  );
};

export default AdminDashboard;
