/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, Users, BookOpen, Layers, Activity, RefreshCw } from 'lucide-react';
import { Card, Row, Col, Typography, Table, Spin, Button, message, ConfigProvider, theme, App } from 'antd';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface SummaryData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCourses: number;
  totalCenters: number;
  systemStatus: string;
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

const AdminDashboardInner: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, revenueRes, actRes] = await Promise.all([
        api.get('/dashboard/admin/summary'),
        api.get('/dashboard/admin/revenue'),
        api.get('/dashboard/admin/activities')
      ]);
      setSummary(summaryRes.data.statistics);
      setRevenue(revenueRes.data.revenue);
      setActivities(actRes.data.activities);
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

  const cardStyle = { 
    background: 'rgba(17, 24, 39, 0.65)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    color: '#fff',
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
    { title: 'Đối tượng', dataIndex: 'target', key: 'target', render: (t: string) => <span style={{ color: '#e5e7eb' }}>{t}</span> },
    { 
      title: 'Thời gian', 
      dataIndex: 'time', 
      key: 'time',
      render: (v: string) => <span style={{ color: 'rgba(255,255,255,0.4)' }}>{dayjs(v).format('DD/MM/YYYY HH:mm')}</span>
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
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#818cf8', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.2)'
              }}>
                <Users size={28} />
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tổng Học Sinh</Text>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalStudents?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#34d399', boxShadow: 'inset 0 0 20px rgba(16,185,129,0.2)'
              }}>
                <Shield size={28} />
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Giáo Viên</Text>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalTeachers?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#fbbf24', boxShadow: 'inset 0 0 20px rgba(245,158,11,0.2)'
              }}>
                <Layers size={28} />
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Lớp Học</Text>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalClasses?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bodyStyle={{ padding: '16px' }} 
            style={cardStyle} 
            className="hover-card-glow"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(236,72,153,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(219,39,119,0.1))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#f472b6', boxShadow: 'inset 0 0 20px rgba(236,72,153,0.2)'
              }}>
                <BookOpen size={28} />
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Chương Trình</Text>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                  {summary?.totalCourses?.toLocaleString('vi-VN') || 0}
                </Title>
              </div>
            </div>
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
                <span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 18, fontWeight: 600 }}>Biểu đồ Doanh Thu Phân Tích</span>
              </div>
            } 
            style={{ ...cardStyle, height: '100%' }} 
            headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)' }} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} 
                    tick={{ fill: 'rgba(255,255,255,0.5)' }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      backdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255,255,255,0.1)', 
                      color: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                    formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')} ₫`}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}
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
                <span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 16, fontWeight: 600 }}>Log Hệ Thống</span>
              </div>
            } 
            style={{ ...cardStyle, height: '100%' }} 
            headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 40 }}
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
                <span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 18, fontWeight: 600 }}>Tăng trưởng Học Sinh</span>
              </div>
            } 
            style={cardStyle} 
            headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={[
                  { month: 'T1', students: 120 }, { month: 'T2', students: 135 }, { month: 'T3', students: 150 },
                  { month: 'T4', students: 180 }, { month: 'T5', students: 210 }, { month: 'T6', students: Math.max(summary?.totalStudents || 250, 250) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="students" name="Số học sinh" fill="url(#colorExpected)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                <span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 18, fontWeight: 600 }}>Phân bố Học Sinh theo Khóa</span>
              </div>
            } 
            style={cardStyle} 
            headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Khóa học Tiếng Anh', value: 400 },
                      { name: 'Toán Tư Duy', value: 300 },
                      { name: 'Kỹ Năng Sống', value: 200 },
                      { name: 'Nghệ Thuật', value: 100 }
                    ]}
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
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorBgContainer: 'transparent',
          colorBorder: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',
        },
      }}
    >
      <App>
        <AdminDashboardInner />
      </App>
    </ConfigProvider>
  );
};

export default AdminDashboard;
