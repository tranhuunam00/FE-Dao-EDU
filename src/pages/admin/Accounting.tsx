import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { App, Tabs } from 'antd';
import {
  TeamOutlined,
  DollarOutlined, CalendarOutlined, WarningOutlined
} from '@ant-design/icons';

import { TuitionTab } from './Accounting/TuitionTab';
import { SalaryTab } from './Accounting/SalaryTab';
import { HistoryTab } from './Accounting/HistoryTab';
import { AnomaliesTab } from './Accounting/AnomaliesTab';

const AccountingInner: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tuition-create');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  const handleSuccess = () => {
    setActiveTab('periods');
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 16 }}></div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
        items={[
          {
            key: 'tuition-create',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Thu học phí tháng</span>,
            children: <TuitionTab onSuccess={handleSuccess} />
          },
          {
            key: 'salary-create',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Chi trả lương tháng</span>,
            children: <SalaryTab onSuccess={handleSuccess} />
          },
          {
            key: 'periods',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><CalendarOutlined /> Lịch sử thanh toán</span>,
            children: <HistoryTab isActive={activeTab === 'periods'} />
          },
          {
            key: 'anomalies',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><WarningOutlined /> Phiếu hủy thanh toán</span>,
            children: <AnomaliesTab isActive={activeTab === 'anomalies'} />
          }
        ]}
      />
    </div>
  );
};

export const Accounting: React.FC = () => (
  <App>
    <AccountingInner />
  </App>
);

export default Accounting;
