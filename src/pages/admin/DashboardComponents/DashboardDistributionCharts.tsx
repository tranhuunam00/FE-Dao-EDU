import React from 'react';
import { Card, Row, Col, Empty } from 'antd';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardDistributionChartsProps {
  studentGrowth?: Array<{ month: string; students: number }>;
  courseDistribution?: Array<{ name: string; value: number }>;
  cardStyle: React.CSSProperties;
  chartGrid: string;
  chartText: string;
  tooltipBackground: string;
  tooltipText: string;
}

export const DashboardDistributionCharts: React.FC<DashboardDistributionChartsProps> = ({
  studentGrowth,
  courseDistribution,
  cardStyle,
  chartGrid,
  chartText,
  tooltipBackground,
  tooltipText,
}) => {
  return (
    <Row gutter={[24, 24]}>
      {/* Student Growth Bar Chart */}
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
            {studentGrowth && studentGrowth.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={studentGrowth}>
                  <defs>
                    <linearGradient id="colorStudentGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="month" stroke={chartText} tick={{ fill: chartText }} />
                  <YAxis stroke={chartText} tick={{ fill: chartText }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: tooltipBackground, borderColor: 'var(--card-border)', borderRadius: 8, color: tooltipText }}
                    itemStyle={{ color: tooltipText }}
                  />
                  <Bar dataKey="students" name="Số học sinh" fill="url(#colorStudentGrowth)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Chưa có dữ liệu tăng trưởng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Card>
      </Col>

      {/* Course Distribution Pie Chart */}
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
            {courseDistribution && courseDistribution.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={courseDistribution}
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
  );
};
