import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Button, Table, Typography, Space, Tag, Input, App } from 'antd';
import { SearchOutlined, TeamOutlined, DownloadOutlined, CheckSquareOutlined } from '@ant-design/icons';
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

const cardStyle = { border: 'none', background: 'rgba(17, 24, 39, 0.75)' };

interface SalaryTabProps {
  onSuccess: () => void;
}

export const SalaryTab: React.FC<SalaryTabProps> = ({ onSuccess }) => {
  const { message } = App.useApp();

  const [salaryEndDate, setSalaryEndDate] = useState<any>(dayjs());
  const [salaryMonth, setSalaryMonth] = useState<any>(dayjs());
  const [salaryPreviewData, setSalaryPreviewData] = useState<any[]>([]);
  const [salaryPreviewLoading, setSalaryPreviewLoading] = useState(false);
  const [salarySelectedRowKeys, setSalarySelectedRowKeys] = useState<React.Key[]>([]);
  const [salaryPreviewSearch, setSalaryPreviewSearch] = useState('');

  const handleFetchSalaryPreview = async () => {
    if (!salaryEndDate) {
      message.warning('Vui lòng chọn ngày chốt sổ');
      return;
    }
    setSalaryPreviewLoading(true);
    try {
      const endStr = salaryEndDate.format('YYYY-MM-DD');
      const { data } = await api.get('/payment-periods/preview/salary', {
        params: { endDate: endStr }
      });
      const list = data.teachers || [];
      setSalaryPreviewData(list);
      setSalarySelectedRowKeys(list.map((t: any) => t.teacherId));
      if (list.length === 0) {
        message.info('Không có giáo viên nào phát sinh lương mới đến ngày này.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách lương');
    } finally {
      setSalaryPreviewLoading(false);
    }
  };

  const handleCreateSalaryPeriod = async () => {
    try {
      await api.post('/payment-periods', {
        name: `Đợt chi trả lương Tháng ${salaryMonth.format('MM/YYYY')}`,
        type: 'salary',
        month: salaryMonth.format('YYYY-MM'),
        startDate: '2000-01-01',
        endDate: salaryEndDate.format('YYYY-MM-DD'),
        teacherIds: salarySelectedRowKeys
      });
      message.success('Đã tạo đợt chi trả lương thành công!');
      setSalaryPreviewData([]);
      setSalarySelectedRowKeys([]);
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo đợt thanh toán');
    }
  };

  const filteredSalary = salaryPreviewData.filter(item => {
    const query = salaryPreviewSearch.toLowerCase().trim();
    if (!query) return true;
    return (item.teacherCode || '').toLowerCase().includes(query) || (item.name || '').toLowerCase().includes(query);
  });

  return (
    <div>
      <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
        <Space size="middle" wrap align="center">
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.55)', marginRight: 10, fontSize: 13 }}>Tháng áp dụng:</Text>
            <DatePicker
              picker="month"
              value={salaryMonth}
              onChange={(v) => setSalaryMonth(v)}
              format="MM/YYYY"
              style={{ width: 140 }}
            />
          </div>
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.55)', marginRight: 10, fontSize: 13 }}>Ngày chốt sổ:</Text>
            <DatePicker
              value={salaryEndDate}
              onChange={(v) => setSalaryEndDate(v)}
              format="DD/MM/YYYY"
              style={{ width: 140 }}
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleFetchSalaryPreview}
            loading={salaryPreviewLoading}
            size="large"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          >
            Xem danh sách
          </Button>
          {salaryPreviewData.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportCSV(
                salaryPreviewData,
                `Danh_sach_luong_gv_${salaryMonth?.format('YYYY_MM')}.csv`,
                ['Mã GV', 'Họ tên', 'SĐT', 'Trạng thái', 'Tổng lương (₫)'],
                ['teacherCode', 'name', 'mobile', 'status', 'totalAmount']
              )}
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
            >
              Xuất CSV
            </Button>
          )}
        </Space>
      </Card>

      {salaryPreviewData.length > 0 && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng giáo viên</div>
                <div style={{ color: '#6366f1', fontSize: 24, fontWeight: 700 }}>{salaryPreviewData.length}</div>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng lương dự kiến chi</div>
                <div style={{ color: '#38bdf8', fontSize: 20, fontWeight: 700 }}>
                  {salaryPreviewData.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString('vi-VN')} ₫
                </div>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Giáo viên đã chọn tạo đợt</div>
                <div style={{ color: '#10b981', fontSize: 24, fontWeight: 700 }}>
                  {salarySelectedRowKeys.length} / {salaryPreviewData.length}
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            className="glass-panel"
            style={cardStyle}
            title={
              <Space>
                <TeamOutlined style={{ color: '#6366f1' }} />
                <span style={{ fontFamily: 'Outfit', color: '#fff' }}>Lương giáo viên tháng</span>
              </Space>
            }
            extra={
              <Space>
                <Input
                  placeholder="Tìm kiếm mã, tên..."
                  value={salaryPreviewSearch}
                  onChange={(e) => setSalaryPreviewSearch(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
                {salarySelectedRowKeys.length > 0 && (
                  <Button
                    type="primary"
                    icon={<CheckSquareOutlined />}
                    onClick={handleCreateSalaryPeriod}
                    style={{ background: '#10b981', border: 'none' }}
                  >
                    Tạo đợt chi trả cho {salarySelectedRowKeys.length} GV
                  </Button>
                )}
              </Space>
            }
          >
            <Table
              dataSource={filteredSalary}
              rowKey="teacherId"
              pagination={{ pageSize: 20 }}
              size="small"
              rowSelection={{
                selectedRowKeys: salarySelectedRowKeys,
                onChange: (keys) => setSalarySelectedRowKeys(keys),
              }}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Mã GV', dataIndex: 'teacherCode', key: 'teacherCode', width: 110, render: (v: string) => <Text style={{ color: '#818cf8', fontWeight: 600 }}>{v}</Text> },
                {
                  title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220,
                  render: (v: string) => <Text style={{ color: '#fff' }}>{v}</Text>,
                },
                { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</Text> },
                { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130, render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag> },
                { title: 'Số buổi', dataIndex: 'totalSessions', key: 'totalSessions', width: 100, align: 'center', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v}</Text> },
                { title: 'Lương cần trả', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right', render: (v: number) => <Text strong style={{ color: '#f59e0b', fontSize: 14 }}>{v.toLocaleString('vi-VN')} ₫</Text> },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};
