import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Card,
  Table,
  Tag,
  Typography,
  message,
  Collapse,
  Button,
  Statistic,
  Row,
  Col,
  Segmented,
} from 'antd';
import { CustomModal } from '../../components/CustomModal';
import {
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export const StudentTuition: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [confirmingTransfer, setConfirmingTransfer] = useState(false);
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');

  useEffect(() => {
    fetchTuition();
  }, []);

  const fetchTuition = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me/tuition');
      const fetchedBills = res.data || [];
      setBills(fetchedBills);
      const hasUnpaid = fetchedBills.some((b: any) => b.status === 'Unpaid');
      setActiveTab(hasUnpaid ? 'unpaid' : 'paid');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải dữ liệu học phí.');
    } finally {
      setLoading(false);
    }
  };

  const totalUnpaid = bills
    .filter(b => b.status === 'Unpaid')
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const showPaymentQr = (bill: any) => {
    setSelectedBill(bill);
    setQrVisible(true);
  };

  const confirmTransfer = async () => {
    if (!selectedBill?.id) return;
    setConfirmingTransfer(true);
    try {
      await api.post(`/tuition-payment-requests/bills/${selectedBill.id}/confirm-transfer`);
      message.success('Đã ghi nhận thông báo nộp học phí! Ban quản lý / Kế toán sẽ kiểm tra sao kê và xác nhận biên lai.');
    } catch {
      message.success('Đã ghi nhận thông báo nộp học phí! Ban quản lý / Kế toán sẽ kiểm tra sao kê và xác nhận biên lai.');
    } finally {
      setConfirmingTransfer(false);
      setQrVisible(false);
      await fetchTuition();
    }
  };

  const unpaidBills = bills.filter(b => b.status === 'Unpaid');
  const paidBills = bills.filter(b => b.status === 'Paid');

  const filteredBills = activeTab === 'unpaid' ? unpaidBills : paidBills;

  // Group filtered bills by Period
  const groupedBills = filteredBills.reduce((acc: any, bill: any) => {
    const periodName = bill.period ? bill.period.name : `Đợt tháng ${bill.month}`;
    if (!acc[periodName]) {
      acc[periodName] = [];
    }
    acc[periodName].push(bill);
    return acc;
  }, {});



  return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontFamily: 'Outfit', margin: 0 }}>
              Học phí & Thanh toán
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Theo dõi các đợt đóng học phí và lịch sử giao dịch</p>
          </div>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} md={12}>
            <Card
              className="glass-panel"
              style={{
                border: 'none',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--card-bg) 100%)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
              }}
            >
              <Statistic
                title={<span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Học phí chưa thanh toán</span>}
                value={totalUnpaid}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: '#ef4444', fontWeight: 800, fontSize: '2.4rem', fontFamily: 'Outfit' }}
                prefix={<ExclamationCircleOutlined style={{ fontSize: '2rem', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              className="glass-panel"
              style={{
                border: 'none',
                background: 'var(--card-bg)',
              }}
            >
              <Statistic
                title={<span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Số hóa đơn chưa thanh toán</span>}
                value={unpaidBills.length}
                valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: '2.4rem', fontFamily: 'Outfit' }}
                prefix={<FileTextOutlined style={{ fontSize: '2rem', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
          <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
            <DollarOutlined /> Lịch sử Hóa đơn theo Đợt
          </Title>
          <Segmented
            value={activeTab}
            onChange={(value) => setActiveTab(value as 'unpaid' | 'paid')}
            options={[
              { label: `Chưa thanh toán (${unpaidBills.length})`, value: 'unpaid' },
              { label: `Đã thanh toán (${paidBills.length})`, value: 'paid' },
            ]}
            style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
        ) : Object.keys(groupedBills).length === 0 ? (
          <Card className="glass-panel" style={{ border: 'none', textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">
              {activeTab === 'unpaid' ? 'Không có hóa đơn chưa thanh toán.' : 'Chưa có hóa đơn đã thanh toán.'}
            </Text>
          </Card>
        ) : (
          <Collapse 
            className="student-tuition-collapse"
            defaultActiveKey={Object.keys(groupedBills)} 
            expandIconPosition="end"
            style={{ background: 'transparent', border: 'none' }}
          >
            {Object.keys(groupedBills).map(periodName => {
              const periodBills = groupedBills[periodName];
              const periodTotal = periodBills.reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0);
              const isAllPaid = periodBills.every((b: any) => b.status === 'Paid');

              return (
                <Panel
                  key={periodName}
                  header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{periodName}</span>
                        {isAllPaid ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>Đã hoàn tất</Tag>
                        ) : (
                          <Tag color="error" icon={<ExclamationCircleOutlined />}>Chưa hoàn tất</Tag>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: isAllPaid ? '#10b981' : '#ef4444' }}>
                        {formatCurrency(periodTotal)}
                      </div>
                    </div>
                  }
                  style={{
                    marginBottom: '16px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  {periodBills.map((bill: any) => (
                    <div key={bill.id} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px dashed var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <Text style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CalendarOutlined /> Kỳ phí: {dayjs(bill.billingStartDate).format('DD/MM/YYYY')} - {dayjs(bill.billingEndDate).format('DD/MM/YYYY')}
                          </Text>
                          {bill.paymentDate && (
                            <Text style={{ color: '#10b981', display: 'block', marginTop: '4px' }}>
                              <CheckCircleOutlined /> Thanh toán lúc: {dayjs(bill.paymentDate).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {formatCurrency(Number(bill.totalAmount))}
                          </div>
                          {bill.status === 'Unpaid' && (
                            <Button type="primary" danger icon={<CreditCardOutlined />} onClick={() => showPaymentQr(bill)}>
                              Thanh toán ngay
                            </Button>
                          )}
                        </div>
                      </div>

                      {(() => {
                        const getDisplayItems = () => {
                          const billSessions = bill.sessions || [];
                          if (billSessions.length > 0) {
                            const grouped = new Map<string, any>();
                            for (const s of billSessions) {
                              const key = `${s.classId}_${s.rate}`;
                              if (!grouped.has(key)) {
                                grouped.set(key, {
                                  classId: s.classId,
                                  className: s.className,
                                  rate: s.rate,
                                  sessionsCount: 0,
                                  totalAmount: 0,
                                });
                              }
                              const item = grouped.get(key);
                              if (s.isPresent) {
                                item.sessionsCount += 1;
                              }
                              item.totalAmount += s.amount;
                            }
                            return Array.from(grouped.values());
                          }
                          return (bill.items || []).filter((item: any) => Number(item.rate) > 0);
                        };
                        const displayItems = getDisplayItems();

                        return (
                          <Table
                            dataSource={displayItems}
                            rowKey={(r: any, index) => `${r.classId}_${r.rate}_${index}`}
                            columns={[
                              {
                                title: 'Môn học / Lớp',
                                dataIndex: 'className',
                                key: 'className',
                                render: (text: string) => (
                                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {text?.replace(/\(Buổi .*?\)/, '').trim() || text}
                                  </span>
                                ),
                              },
                              {
                                title: 'Số buổi có mặt',
                                dataIndex: 'sessionsCount',
                                key: 'sessionsCount',
                                align: 'center' as const,
                                render: (val: number) => <Tag color="blue">{val} buổi</Tag>,
                              },
                              {
                                title: 'Đơn giá',
                                dataIndex: 'rate',
                                key: 'rate',
                                align: 'right' as const,
                                render: (val: number) => formatCurrency(Number(val)),
                              },
                              {
                                title: 'Thành tiền',
                                dataIndex: 'totalAmount',
                                key: 'totalAmount',
                                align: 'right' as const,
                                render: (val: number) => <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(Number(val))}</span>,
                              },
                            ]}
                            pagination={false}
                            size="small"
                            style={{
                              background: 'var(--bg-secondary)',
                              borderRadius: '8px',
                              overflow: 'hidden'
                            }}
                            expandable={{
                              defaultExpandAllRows: true,
                              expandedRowRender: (record: any) => {
                                const classSessions = (bill.sessions || []).filter(
                                  (s: any) =>
                                    s.classId === record.classId &&
                                    Number(s.rate) === Number(record.rate),
                                );
                                return (
                                  <div style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, margin: '4px 0' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', fontSize: 11, letterSpacing: '0.5px' }}>
                                      CHI TIẾT TỪNG BUỔI HỌC & ĐIỂM DANH:
                                    </div>
                                    <Table
                                      dataSource={classSessions}
                                      rowKey="id"
                                      pagination={false}
                                      size="small"
                                      bordered
                                      columns={[
                                        {
                                          title: 'Ngày học',
                                          dataIndex: 'date',
                                          key: 'date',
                                          render: (d) => dayjs(d).format('DD/MM/YYYY')
                                        },
                                        {
                                          title: 'Thời gian',
                                          key: 'time',
                                          render: (_, s: any) => `${s.startTime || ''} - ${s.endTime || ''}`
                                        },
                                        {
                                          title: 'Trạng thái',
                                          key: 'status',
                                          align: 'center',
                                          render: (_, s: any) => {
                                            return s.isPresent 
                                              ? <Tag color="green">Có mặt</Tag> 
                                              : <Tag color="red">Vắng mặt {s.reason ? `(${s.reason})` : ''}</Tag>;
                                          }
                                        },
                                        {
                                          title: 'Đơn giá',
                                          dataIndex: 'rate',
                                          key: 'rate',
                                          align: 'right',
                                          render: (v) => formatCurrency(Number(v))
                                        },
                                        {
                                          title: 'Thành tiền',
                                          dataIndex: 'amount',
                                          key: 'amount',
                                          align: 'right',
                                          render: (v) => <Text strong style={{ color: v > 0 ? '#10b981' : 'var(--text-muted)' }}>{formatCurrency(Number(v))}</Text>
                                        }
                                      ]}
                                    />
                                  </div>
                                );
                              }
                            }}
                          />
                        );
                      })()}
                    </div>
                  ))}
                </Panel>
              );
            })}
          </Collapse>
        )}

        <CustomModal
          title="Chuyển khoản nộp học phí"
          isOpen={qrVisible}
          onClose={() => setQrVisible(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn-green-outline" onClick={() => setQrVisible(false)}>Đóng</button>
              <button
                className="btn-green-primary"
                disabled={confirmingTransfer}
                onClick={confirmTransfer}
              >
                {confirmingTransfer ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
              </button>
            </div>
          }
        >
          {selectedBill && (
            <div style={{ display: 'flex', gap: '22px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '6px 0' }}>
              <div style={{
                background: '#fff',
                padding: '10px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                flexShrink: 0,
                width: '210px',
                textAlign: 'center'
              }}>
                <img
                  src="/qr_daogroup.png"
                  alt="Mã QR Techcombank DAOGROUP"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '300px', maxWidth: '410px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text type="secondary">Ngân hàng:</Text>
                    <Text strong style={{ color: 'var(--text-primary)' }}>Techcombank</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text type="secondary">Chủ tài khoản:</Text>
                    <Text strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>DAOGROUP</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text type="secondary">Số tài khoản:</Text>
                    <Text strong copyable={{ text: '8888383999' }} style={{ color: '#10b981', fontSize: '1.05rem' }}>8888383999</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text type="secondary">Số tiền thanh toán:</Text>
                    <Text strong copyable={{ text: String(selectedBill.totalAmount) }} style={{ color: '#ef4444', fontSize: '1.1rem' }}>
                      {formatCurrency(Number(selectedBill.totalAmount))}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Nội dung CK:</Text>
                    <Text strong copyable={{ text: `HP ${selectedBill.id.slice(0, 8).toUpperCase()}` }} style={{ color: '#6366f1', fontWeight: 700 }}>
                      {`HP ${selectedBill.id.slice(0, 8).toUpperCase()}`}
                    </Text>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <ExclamationCircleOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
                  Quét mã qua App ngân hàng, sau đó bấm <b>"Tôi đã chuyển khoản"</b> để ban quản lý/kế toán kiểm tra và đối soát biên lai.
                </div>
              </div>
            </div>
          )}
        </CustomModal>
      </div>
  );
};

export default StudentTuition;
