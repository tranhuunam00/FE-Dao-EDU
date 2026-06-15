import React from 'react';
import { Card, Table, Button, Space, DatePicker, Row, Col, Typography, Tag, Alert } from 'antd';
import { DollarOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface TuitionTabProps {
  tuitionDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  setTuitionDateRange: (vals: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => void;
  fetchTuitionReport: () => void;
  tuitionLoading: boolean;
  tuitionReport: any;
}

export const TuitionTab: React.FC<TuitionTabProps> = ({ tuitionDateRange, setTuitionDateRange, fetchTuitionReport, tuitionLoading, tuitionReport }) => {
  return (
    <div>
      <Card
        title={<span style={{ fontFamily: 'Outfit' }}><DollarOutlined /> Tính học phí theo khoảng thời gian</span>}
        className="glass-panel"
        style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 16 }}
      >
        <Space size="middle" wrap>
          <div>
            <span style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: '13px' }}>Khoảng thời gian:</span>
            <DatePicker.RangePicker
              value={tuitionDateRange}
              onChange={(vals) => setTuitionDateRange(vals as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchTuitionReport}
            loading={tuitionLoading}
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          >
            Tính học phí
          </Button>
        </Space>
      </Card>

      {tuitionReport && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: 4 }}>Tổng buổi có mặt (tính tiền)</div>
                <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>{tuitionReport.totalSessions}</div>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: 4 }}>Tổng buổi đã hoàn thành</div>
                <div style={{ color: '#6366f1', fontSize: '24px', fontWeight: 700 }}>{(tuitionReport.sessions || []).length}</div>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: 4 }}>Tổng học phí</div>
                <div style={{ color: '#f59e0b', fontSize: '22px', fontWeight: 700 }}>
                  {(tuitionReport.totalAmount || 0).toLocaleString('vi-VN')}&nbsp;₫
                </div>
              </Card>
            </Col>
          </Row>
          <Card
            title={<span style={{ fontFamily: 'Outfit' }}><DollarOutlined /> Lịch sử đơn giá chương trình học áp dụng trong kỳ</span>}
            className="glass-panel"
            style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 16 }}
          >
            <Table
              dataSource={tuitionReport.pricingHistory || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Level', dataIndex: 'levelName', key: 'levelName' },
                {
                  title: 'Đơn giá học viên',
                  dataIndex: 'pricePerSession',
                  render: (v: number) => <Text strong style={{ color: '#34d399' }}>{Number(v).toLocaleString()}đ</Text>,
                },
                {
                  title: 'Từ ngày',
                  dataIndex: 'effectiveFrom',
                  render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
                },
                {
                  title: 'Đến ngày',
                  dataIndex: 'effectiveTo',
                  render: (v: string | null) => v ? dayjs(v).format('DD/MM/YYYY') : <Tag color="green">Hiện hành</Tag>,
                },
              ]}
            />
          </Card>
          <Card
            title={<span style={{ fontFamily: 'Outfit' }}>Chi tiết từng buổi học</span>}
            className="glass-panel"
            style={{ border: 'none', background: 'var(--card-bg)' }}
          >
            <Table
              dataSource={tuitionReport.sessions || []}
              rowKey="id"
              pagination={{ pageSize: 15 }}
              size="small"
              columns={[
                { title: 'Ngày', dataIndex: 'date', key: 'date', width: 120, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Lớp học', dataIndex: 'className', key: 'className' },
                {
                  title: 'Chương trình & Level', key: 'course',
                  render: (_: any, r: any) => (
                    <div>
                      <Text strong style={{ color: 'var(--text-primary)' }}>{r.courseName || '-'}</Text>
                      <div style={{ fontSize: '11px', color: '#818cf8' }}>Level: {r.levelName || '-'}</div>
                    </div>
                  ),
                },
                {
                  title: 'Trạng thái', dataIndex: 'isPresent', key: 'isPresent', width: 120,
                  render: (v: boolean) => v ? <Tag color="success">✓ Có mặt</Tag> : <Tag color="error">✗ Vắng mặt</Tag>,
                },
                {
                  title: 'Giá/buổi', key: 'rate', width: 180,
                  render: (_: any, r: any) => (
                    <div>
                      <Text style={{ color: '#a5b4fc' }}>{(r.rate || 0).toLocaleString('vi-VN')}&nbsp;₫</Text>
                      {r.pricingEffectiveFrom && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>
                          {`Giá áp dụng: ${dayjs(r.pricingEffectiveFrom).format('DD/MM/YY')}${r.pricingEffectiveTo ? ` - ${dayjs(r.pricingEffectiveTo).format('DD/MM/YY')}` : ' +'}`}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Thành tiền', dataIndex: 'amount', key: 'amount', width: 140,
                  render: (v: number) => <Text strong style={{ color: '#f59e0b' }}>{(v || 0).toLocaleString('vi-VN')}&nbsp;₫</Text>,
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <Text strong style={{ color: 'var(--text-primary)' }}>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ color: '#f59e0b', fontSize: '16px' }}>
                      {(tuitionReport.totalAmount || 0).toLocaleString('vi-VN')}&nbsp;₫
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </>
      )}

      {!tuitionReport && !tuitionLoading && (
        <Alert
          type="info"
          showIcon
          message="Hướng dẫn"
          description="Chọn khoảng thời gian và nhấn 'Tính học phí' để xem báo cáo chi tiết học phí theo từng buổi học có mặt và mức giá hiệu lực tại thời điểm buổi học đó."
          style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
        />
      )}
    </div>
  );
};
