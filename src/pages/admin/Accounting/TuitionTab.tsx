import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Button, Table, Typography, Space, Tag, Input, App } from 'antd';
import { SearchOutlined, UserOutlined, DownloadOutlined, CheckSquareOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;

const statusColor: Record<string, string> = {
  Studying: 'green',
  'Waiting for class': 'gold',
  Suspended: 'orange',
  Graduated: 'purple',
  Active: 'green',
  Inactive: 'red',
  'On Leave': 'orange',
};

const statusLabel: Record<string, string> = {
  Studying: 'Đang học',
  'Waiting for class': 'Chờ xếp lớp',
  Suspended: 'Tạm nghỉ',
  Graduated: 'Tốt nghiệp',
  Active: 'Đang dạy',
  Inactive: 'Nghỉ việc',
  'On Leave': 'Tạm nghỉ',
};

const exportCSV = (data: any[], filename: string, headers: string[], keys: string[]) => {
  const rows = [headers.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))];
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const cardStyle = { border: 'none', background: 'var(--card-bg)' };

interface TuitionTabProps {
  onSuccess: () => void;
}

export const TuitionTab: React.FC<TuitionTabProps> = ({ onSuccess }) => {
  const { message } = App.useApp();

  const [tuitionEndDate, setTuitionEndDate] = useState<any>(dayjs());
  const [tuitionMonth, setTuitionMonth] = useState<any>(dayjs());
  const [tuitionPreviewData, setTuitionPreviewData] = useState<any[]>([]);
  const [tuitionPreviewLoading, setTuitionPreviewLoading] = useState(false);
  const [tuitionSelectedRowKeys, setTuitionSelectedRowKeys] = useState<React.Key[]>([]);
  const [tuitionPreviewSearch, setTuitionPreviewSearch] = useState('');

  const handleFetchTuitionPreview = async () => {
    if (!tuitionEndDate) {
      message.warning('Vui lòng chọn ngày chốt sổ');
      return;
    }
    setTuitionPreviewLoading(true);
    try {
      const endStr = tuitionEndDate.format('YYYY-MM-DD');
      const { data } = await api.get('/payment-periods/preview/tuition', {
        params: { endDate: endStr }
      });
      const list = data.students || [];
      setTuitionPreviewData(list);
      setTuitionSelectedRowKeys(list.map((s: any) => s.studentId));
      if (list.length === 0) {
        message.info('Không có học sinh nào phát sinh học phí mới đến ngày này.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách học phí');
    } finally {
      setTuitionPreviewLoading(false);
    }
  };

  const handleCreateTuitionPeriod = async () => {
    try {
      await api.post('/payment-periods', {
        name: `Đợt thu học phí Tháng ${tuitionMonth.format('MM/YYYY')}`,
        type: 'tuition',
        month: tuitionMonth.format('YYYY-MM'),
        startDate: '2000-01-01',
        endDate: tuitionEndDate.format('YYYY-MM-DD'),
        studentIds: tuitionSelectedRowKeys
      });
      message.success('Đã tạo đợt thu học phí thành công!');
      setTuitionPreviewData([]);
      setTuitionSelectedRowKeys([]);
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo đợt thanh toán');
    }
  };

  const filteredTuition = tuitionPreviewData.filter(item => {
    const query = tuitionPreviewSearch.toLowerCase().trim();
    if (!query) return true;
    return (item.studentCode || '').toLowerCase().includes(query) || (item.name || '').toLowerCase().includes(query);
  });

  return (
    <div>
      <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
        <Space size="middle" wrap align="center">
          <div>
            <Text style={{ color: 'var(--text-secondary)', marginRight: 10, fontSize: 13 }}>Tháng áp dụng:</Text>
            <DatePicker
              picker="month"
              value={tuitionMonth}
              onChange={(v) => setTuitionMonth(v)}
              format="MM/YYYY"
              style={{ width: 140 }}
            />
          </div>
          <div>
            <Text style={{ color: 'var(--text-secondary)', marginRight: 10, fontSize: 13 }}>Ngày chốt sổ:</Text>
            <DatePicker
              value={tuitionEndDate}
              onChange={(v) => setTuitionEndDate(v)}
              format="DD/MM/YYYY"
              style={{ width: 140 }}
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleFetchTuitionPreview}
            loading={tuitionPreviewLoading}
            size="large"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          >
            Xem danh sách
          </Button>
          {tuitionPreviewData.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportCSV(
                tuitionPreviewData,
                `Danh_sach_thu_hoc_phi_${tuitionMonth?.format('YYYY_MM')}.csv`,
                ['Mã HS', 'Họ tên', 'SĐT', 'Trạng thái', 'Tổng học phí (₫)'],
                ['studentCode', 'name', 'mobile', 'status', 'totalAmount']
              )}
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
            >
              Xuất CSV
            </Button>
          )}
        </Space>
      </Card>

      {tuitionPreviewData.length > 0 && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Tổng học sinh</div>
                <div style={{ color: '#6366f1', fontSize: 24, fontWeight: 700 }}>{tuitionPreviewData.length}</div>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Tổng học phí dự kiến thu</div>
                <div style={{ color: '#38bdf8', fontSize: 20, fontWeight: 700 }}>
                  {tuitionPreviewData.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString('vi-VN')} ₫
                </div>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Học sinh đã chọn tạo đợt</div>
                <div style={{ color: '#10b981', fontSize: 24, fontWeight: 700 }}>
                  {tuitionSelectedRowKeys.length} / {tuitionPreviewData.length}
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            className="glass-panel"
            style={cardStyle}
            title={
              <Space>
                <UserOutlined style={{ color: '#6366f1' }} />
                <span style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Học phí tháng</span>
              </Space>
            }
            extra={
              <Space>
                <Input
                  placeholder="Tìm kiếm mã, tên..."
                  value={tuitionPreviewSearch}
                  onChange={(e) => setTuitionPreviewSearch(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
                {tuitionSelectedRowKeys.length > 0 && (
                  <Button
                    type="primary"
                    icon={<CheckSquareOutlined />}
                    onClick={handleCreateTuitionPeriod}
                    style={{ background: '#10b981', border: 'none' }}
                  >
                    Tạo đợt thu cho {tuitionSelectedRowKeys.length} HS
                  </Button>
                )}
              </Space>
            }
          >
            <Table
              dataSource={filteredTuition}
              rowKey="studentId"
              pagination={{ pageSize: 20 }}
              size="small"
              rowSelection={{
                selectedRowKeys: tuitionSelectedRowKeys,
                onChange: (keys) => setTuitionSelectedRowKeys(keys),
              }}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 110, render: (v: string) => <Text style={{ color: '#818cf8', fontWeight: 600 }}>{v}</Text> },
                {
                  title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220,
                  render: (v: string, r: any) => (
                    <div>
                      <Text style={{ color: 'var(--text-primary)' }}>{v}</Text>
                      {r.nickName && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>({r.nickName})</div>}
                    </div>
                  ),
                },
                { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text type="secondary">{v}</Text> },
                { title: 'Trạng thái học', dataIndex: 'status', key: 'status', width: 130, render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag> },
                { title: 'Số buổi', dataIndex: 'totalSessions', key: 'totalSessions', width: 100, align: 'center', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v}</Text> },
                { title: 'Số tiền cần thu', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right', render: (v: number) => <Text strong style={{ color: '#f59e0b', fontSize: 14 }}>{v.toLocaleString('vi-VN')} ₫</Text> },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};
