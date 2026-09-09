import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Coins, Clock, Wallet, TrendingUp } from 'lucide-react';

const { Title, Text } = Typography;

export interface FinancialSummaryProps {
  totalCollectedTuition?: number;
  totalUncollectedTuition?: number;
  totalPaidSalary?: number;
}

interface DashboardFinancialCardsProps {
  summary: FinancialSummaryProps | null;
  cardStyle: React.CSSProperties;
}

export const DashboardFinancialCards: React.FC<DashboardFinancialCardsProps> = ({
  summary,
  cardStyle,
}) => {
  const collected = summary?.totalCollectedTuition || 0;
  const uncollected = summary?.totalUncollectedTuition || 0;
  const paidSalary = summary?.totalPaidSalary || 0;
  const balance = collected - paidSalary;

  return (
    <Row gutter={[16, 16]} className="dashboard-summary-cards" style={{ marginBottom: 16 }}>
      {/* 1. Tổng tiền đã thu */}
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
              <Coins size={28} />
            </div>
            <div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tổng tiền đã thu</Text>
              <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                {collected.toLocaleString('vi-VN')}&nbsp;₫
              </Title>
            </div>
          </div>
        </Card>
      </Col>

      {/* 2. Tổng tiền chưa thu */}
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
              <Clock size={28} />
            </div>
            <div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tổng tiền chưa thu</Text>
              <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                {uncollected.toLocaleString('vi-VN')}&nbsp;₫
              </Title>
            </div>
          </div>
        </Card>
      </Col>

      {/* 3. Tổng lương đã trả */}
      <Col xs={12} sm={12} lg={6}>
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
                {paidSalary.toLocaleString('vi-VN')}&nbsp;₫
              </Title>
            </div>
          </div>
        </Card>
      </Col>

      {/* 4. Hiệu số thu - chi */}
      <Col xs={12} sm={12} lg={6}>
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
                color: balance >= 0 ? '#34d399' : '#f87171', 
                margin: 0, fontFamily: 'Outfit', fontWeight: 700 
              }}>
                {balance.toLocaleString('vi-VN')}&nbsp;₫
              </Title>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
