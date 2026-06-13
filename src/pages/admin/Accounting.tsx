import React, { useState } from 'react';
import {
  ConfigProvider, App, theme, Card, DatePicker,
  Button, Table, Tabs, Typography, Space
} from 'antd';
import {
  SearchOutlined, UserOutlined,
  TeamOutlined, DownloadOutlined,
  DollarOutlined, CalendarOutlined
} from '@ant-design/icons';
import api from '../../services/api';

import { TuitionTab } from './Accounting/TuitionTab';
import { SalaryTab } from './Accounting/SalaryTab';
import { HistoryTab } from './Accounting/HistoryTab';

const { Text } = Typography;

const cardStyle = { border: 'none', background: 'rgba(17, 24, 39, 0.75)' };

const exportCSV = (data: any[], filename: string, headers: string[], keys: string[]) => {
  const rows = [headers.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))];
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const AccountingInner: React.FC = () => {
  const { message } = App.useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState('tuition-create');

  // Ad-hoc states for reports
  const [tuitionRange, setTuitionRange] = useState<[any, any]>([null, null]);
  const [tuitionData, setTuitionData] = useState<any>(null);
  const [tuitionLoading, setTuitionLoading] = useState(false);

  const [wagesRange, setWagesRange] = useState<[any, any]>([null, null]);
  const [wagesData, setWagesData] = useState<any>(null);
  const [wagesLoading, setWagesLoading] = useState(false);

  // Load trick for refetching periods in HistoryTab if needed
  // But HistoryTab is smart enough to load when active.
  const handleSuccess = () => {
    setActiveTab('periods');
  };

  const fetchTuitionBulk = async () => {
    if (!tuitionRange[0] || !tuitionRange[1]) {
      message.warning('Vui lòng chọn kỳ tính tiền');
      return;
    }
    setTuitionLoading(true);
    try {
      const start = tuitionRange[0].format('YYYY-MM-DD');
      const end = tuitionRange[1].format('YYYY-MM-DD');
      const { data } = await api.get('/payment-periods/preview/tuition', { params: { startDate: start, endDate: end } });
      setTuitionData(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo học phí');
    } finally {
      setTuitionLoading(false);
    }
  };

  const fetchWagesBulk = async () => {
    if (!wagesRange[0] || !wagesRange[1]) {
      message.warning('Vui lòng chọn kỳ tính lương');
      return;
    }
    setWagesLoading(true);
    try {
      const start = wagesRange[0].format('YYYY-MM-DD');
      const end = wagesRange[1].format('YYYY-MM-DD');
      const { data } = await api.get('/payment-periods/preview/salary', { params: { startDate: start, endDate: end } });
      setWagesData(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo lương');
    } finally {
      setWagesLoading(false);
    }
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
            key: 'tuition-report',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> BC Học phí (Tham khảo)</span>,
            children: (
              <div>
                <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
                  <Space size="middle" wrap align="center">
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.55)', marginRight: 10, fontSize: 13 }}>Kỳ tính tiền:</Text>
                      <DatePicker.RangePicker
                        value={tuitionRange}
                        onChange={(v) => setTuitionRange(v as [any, any])}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ minWidth: 280 }}
                      />
                    </div>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={fetchTuitionBulk}
                      loading={tuitionLoading}
                      size="large"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', padding: '0 24px' }}
                    >
                      Xem báo cáo
                    </Button>
                    {tuitionData && (
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => exportCSV(
                          tuitionData.students,
                          `bao-cao-hoc-phi.csv`,
                          ['Mã HS', 'Họ tên', 'SĐT', 'Trạng thái', 'Buổi có mặt', 'Tổng học phí (₫)'],
                          ['studentCode', 'name', 'mobile', 'status', 'totalSessions', 'totalAmount']
                        )}
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                      >
                        Xuất CSV
                      </Button>
                    )}
                  </Space>
                </Card>

                {tuitionData && (
                  <Card className="glass-panel" style={cardStyle}>
                    <Table
                      dataSource={tuitionData.students || []}
                      rowKey="studentId"
                      pagination={{ pageSize: 15 }}
                      size="small"
                      columns={[
                        { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 100 },
                        { title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220 },
                        { title: 'Buổi có mặt', dataIndex: 'totalSessions', key: 'totalSessions', width: 120, align: 'center' as const },
                        { title: 'Tổng học phí', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right' as const, render: (v: number) => `${v.toLocaleString('vi-VN')} ₫` },
                      ]}
                    />
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: 'wages-report',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> BC Lương (Tham khảo)</span>,
            children: (
              <div>
                <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
                  <Space size="middle" wrap align="center">
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.55)', marginRight: 10, fontSize: 13 }}>Kỳ tính lương:</Text>
                      <DatePicker.RangePicker
                        value={wagesRange}
                        onChange={(v) => setWagesRange(v as [any, any])}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ minWidth: 280 }}
                      />
                    </div>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={fetchWagesBulk}
                      loading={wagesLoading}
                      size="large"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', padding: '0 24px' }}
                    >
                      Xem báo cáo
                    </Button>
                    {wagesData && (
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => exportCSV(
                          wagesData.teachers,
                          `bao-cao-luong.csv`,
                          ['Mã GV', 'Họ tên', 'SĐT', 'Tổng lương (₫)'],
                          ['teacherCode', 'name', 'mobile', 'totalAmount']
                        )}
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                      >
                        Xuất CSV
                      </Button>
                    )}
                  </Space>
                </Card>

                {wagesData && (
                  <Card className="glass-panel" style={cardStyle}>
                    <Table
                      dataSource={wagesData.teachers || []}
                      rowKey="teacherId"
                      pagination={{ pageSize: 15 }}
                      size="small"
                      columns={[
                        { title: 'Mã GV', dataIndex: 'teacherCode', key: 'teacherCode', width: 100 },
                        { title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220 },
                        { title: 'Số buổi dạy', dataIndex: 'totalSessions', key: 'totalSessions', width: 120, align: 'center' as const },
                        { title: 'Tổng lương', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right' as const, render: (v: number) => `${v.toLocaleString('vi-VN')} ₫` },
                      ]}
                    />
                  </Card>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export const Accounting: React.FC = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#6366f1',
        colorBgContainer: '#111827',
        colorBorder: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
      },
    }}
  >
    <App>
      <AccountingInner />
    </App>
  </ConfigProvider>
);

export default Accounting;
