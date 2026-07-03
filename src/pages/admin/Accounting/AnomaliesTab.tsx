import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Typography, Space, App, Spin, Row, Col } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;

const cardStyle = { border: 'none', background: 'var(--card-bg)' };

interface AnomaliesTabProps {
  isActive: boolean;
}

export const AnomaliesTab: React.FC<AnomaliesTabProps> = ({ isActive }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ cancelledReceipts: any[] }>({
    cancelledReceipts: [],
  });

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/admin/anomalies');
      setData(response.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải nhật ký phiếu hủy.');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (isActive) {
      fetchAnomalies();
    }
  }, [isActive, fetchAnomalies]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Row gutter={[20, 20]}>
        {/* Cancelled Receipts */}
        <Col span={24}>
          <Card
            className="glass-panel"
            style={cardStyle}
            title={
              <Space>
                <CloseCircleOutlined style={{ color: '#ef4444' }} />
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: 16 }}>
                  Nhật ký Phiếu Hủy (30 ngày gần đây)
                </span>
              </Space>
            }
          >
            <Table
              dataSource={data.cancelledReceipts}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: 'Ngày thực hiện',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  width: 170,
                  render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm:ss'),
                },
                {
                  title: 'Loại đợt',
                  key: 'type',
                  width: 140,
                  render: (_, r: any) => {
                    const type = r.metadata?.after?.type;
                    return (
                      <Tag color={type === 'tuition' ? 'blue' : 'orange'}>
                        {type === 'tuition' ? 'Thu Học Phí' : 'Chi Trả Lương'}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Mã số phiếu',
                  key: 'receiptCode',
                  width: 180,
                  render: (_, r: any) => {
                    const code = r.metadata?.after?.receiptCode;
                    return code ? <Text strong copyable>{code}</Text> : <Text type="secondary">—</Text>;
                  },
                },
                {
                  title: 'Số tiền gốc',
                  key: 'totalAmount',
                  width: 150,
                  align: 'right' as const,
                  render: (_, r: any) => {
                    const amt = r.metadata?.after?.totalAmount || 0;
                    return <Text style={{ color: '#38bdf8', fontWeight: 650 }}>{Number(amt).toLocaleString('vi-VN')} ₫</Text>;
                  },
                },
                {
                  title: 'Lý do hủy',
                  key: 'reason',
                  render: (_, r: any) => <Text style={{ color: 'var(--text-secondary)' }}>{r.metadata?.reason || '—'}</Text>,
                },
                {
                  title: 'Người thực hiện',
                  dataIndex: 'actorName',
                  key: 'actorName',
                  width: 180,
                  render: (v: string) => v || 'Hệ thống',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
