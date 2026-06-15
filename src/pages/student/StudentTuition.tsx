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
  Modal,
} from 'antd';
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
  const [qrRequest, setQrRequest] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [confirmingTransfer, setConfirmingTransfer] = useState(false);
  const [simulatingTerminal, setSimulatingTerminal] = useState(false);

  useEffect(() => {
    fetchTuition();
  }, []);

  const fetchTuition = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me/tuition');
      setBills(res.data || []);
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
    if (!bill.paymentRequest) {
      message.info('Trung tâm chưa gửi QR thanh toán cho hóa đơn này.');
      return;
    }
    setQrRequest(bill.paymentRequest);
    setQrVisible(true);
  };

  const confirmTransfer = async () => {
    if (!qrRequest?.billId) return;
    setConfirmingTransfer(true);
    try {
      await api.post(`/tuition-payment-requests/bills/${qrRequest.billId}/confirm-transfer`);
      message.success('Đã ghi nhận. Hệ thống đang chờ callback đối soát từ VietQR.');
      setQrVisible(false);
      setQrRequest(null);
      await fetchTuition();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xác nhận chuyển khoản.');
    } finally {
      setConfirmingTransfer(false);
    }
  };

  const simulateTerminalSuccess = async () => {
    if (!qrRequest?.billId) return;
    setSimulatingTerminal(true);
    try {
      await api.post(`/bank/api/demo-terminal/bills/${qrRequest.billId}/success`);
      message.success('Demo terminal đã báo giao dịch thành công và hệ thống đã đối soát.');
      setQrVisible(false);
      setQrRequest(null);
      await fetchTuition();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể kích hoạt demo terminal.');
    } finally {
      setSimulatingTerminal(false);
    }
  };

  // Group bills by Period
  const groupedBills = bills.reduce((acc: any, bill: any) => {
    const periodName = bill.period ? bill.period.name : `Đợt tháng ${bill.month}`;
    if (!acc[periodName]) {
      acc[periodName] = [];
    }
    acc[periodName].push(bill);
    return acc;
  }, {});

  const columns = [
    {
      title: 'Môn học / Lớp',
      dataIndex: 'className',
      key: 'className',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{record.courseName} - {record.levelName}</div>
        </div>
      ),
    },
    {
      title: 'Số buổi',
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
      render: (val: number) => <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(Number(val))}</span>,
    },
  ];

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
                value={bills.filter(b => b.status === 'Unpaid').length}
                valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: '2.4rem', fontFamily: 'Outfit' }}
                prefix={<FileTextOutlined style={{ fontSize: '2rem', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'Outfit' }}>
          <DollarOutlined /> Lịch sử Hóa đơn theo Đợt
        </Title>

        {loading ? (
          <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
        ) : Object.keys(groupedBills).length === 0 ? (
          <Card className="glass-panel" style={{ border: 'none', textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Chưa có dữ liệu học phí nào.</Text>
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

                      <Table
                        dataSource={bill.items || []}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        style={{
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}
                      />
                    </div>
                  ))}
                </Panel>
              );
            })}
          </Collapse>
        )}

        <Modal
          title="Chuyển khoản học phí"
          open={qrVisible}
          onCancel={() => setQrVisible(false)}
          footer={[
            <Button key="close" onClick={() => setQrVisible(false)}>Đóng</Button>,
            qrRequest?.status === 'pending' && (
              <Button key="confirm" type="primary" loading={confirmingTransfer} onClick={confirmTransfer}>
                Tôi đã chuyển khoản
              </Button>
            ),
            qrRequest?.status !== 'reconciled' && (
              <Button key="demo-terminal" type="dashed" loading={simulatingTerminal} onClick={simulateTerminalSuccess}>
                Demo terminal báo thành công
              </Button>
            ),
          ]}
        >
          {qrRequest && (
            <div style={{ textAlign: 'center' }}>
              <img src={qrRequest.qrUrl} alt="QR chuyển khoản học phí" style={{ width: '100%', maxWidth: 360, borderRadius: 8 }} />
              <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>
                <div>{qrRequest.accountName} - {qrRequest.accountNumber}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 18, marginTop: 4 }}>{formatCurrency(Number(qrRequest.amount))}</div>
                <div>
                  Nội dung: <Text copyable={{ text: qrRequest.transferContent }} style={{ color: '#a78bfa' }}>{qrRequest.transferContent}</Text>
                </div>
                <div style={{ marginTop: 10, fontSize: 12 }}>
                  {qrRequest.status === 'reconciled'
                    ? 'Giao dịch đã được tự động đối soát.'
                    : qrRequest.status === 'processing'
                      ? 'Đang chờ VietQR gửi callback biến động số dư để xác nhận.'
                      : 'Sau khi chuyển khoản, bấm "Tôi đã chuyển khoản". Hóa đơn chỉ được xác nhận khi callback VietQR khớp.'}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default StudentTuition;
