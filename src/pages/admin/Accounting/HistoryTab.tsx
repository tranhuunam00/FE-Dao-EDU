import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Typography, Space, Tag, Spin, App, Modal, Popconfirm, Select, DatePicker, Form, Input, Tooltip, Badge } from 'antd';
import { LockOutlined, UnlockOutlined, CheckCircleOutlined, DeleteOutlined, CloseCircleOutlined, ArrowLeftOutlined, DownloadOutlined, QrcodeOutlined, PrinterOutlined, CopyOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;

const cardStyle = { border: 'none', background: 'var(--card-bg)' };

const exportCSV = (data: any[], filename: string, headers: string[], keys: string[]) => {
  const rows = [headers.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))];
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

interface HistoryTabProps {
  isActive: boolean;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ isActive }) => {
  const { message } = App.useApp();

  const [periods, setPeriods] = useState<any[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periodDetail, setPeriodDetail] = useState<any>(null);
  const [periodDetailLoading, setPeriodDetailLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Breakdown Modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [detailAuditLogs, setDetailAuditLogs] = useState<any[]>([]);
  const [detailType, setDetailType] = useState<'student' | 'teacher'>('student');

  // Payment Edit Modal
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const [cancelVisible, setCancelVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [qrRequest, setQrRequest] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrSending, setQrSending] = useState(false);
  const [qrAllSending, setQrAllSending] = useState(false);

  const [periodsSearch, setPeriodsSearch] = useState('');
  const [periodsTypeFilter, setPeriodsTypeFilter] = useState<'All' | 'tuition' | 'salary'>('All');
  const [studentSearch, setStudentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('All');

  const loadPeriods = async () => {
    setPeriodsLoading(true);
    try {
      const { data } = await api.get('/payment-periods');
      setPeriods(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách đợt thanh toán');
    } finally {
      setPeriodsLoading(false);
    }
  };

  const loadPeriodDetail = async (id: string) => {
    setPeriodDetailLoading(true);
    try {
      const { data } = await api.get(`/payment-periods/${id}`);
      setPeriodDetail(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải chi tiết đợt thanh toán');
      setSelectedPeriodId(null);
    } finally {
      setPeriodDetailLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      if (selectedPeriodId) {
        loadPeriodDetail(selectedPeriodId);
      } else {
        loadPeriods();
      }
    }
  }, [isActive, selectedPeriodId]);

  const handleTogglePeriodStatus = async (record: any) => {
    const newStatus = record.status === 'Active' ? 'Closed' : 'Active';
    try {
      await api.patch(`/payment-periods/${record.id}/status`, { status: newStatus });
      message.success(newStatus === 'Closed' ? 'Đã khóa đợt thanh toán thành công!' : 'Đã mở khóa đợt thanh toán!');
      if (selectedPeriodId === record.id) loadPeriodDetail(record.id);
      else loadPeriods();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi đổi trạng thái đợt');
    }
  };

  const handleDeletePeriod = async (id: string) => {
    try {
      await api.delete(`/payment-periods/${id}`);
      message.success('Xóa đợt thanh toán thành công');
      if (selectedPeriodId === id) {
        setSelectedPeriodId(null);
        setPeriodDetail(null);
      }
      loadPeriods();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa đợt thanh toán');
    }
  };

  const handleConfirmFullPayment = async (order: any, type: string) => {
    try {
      await api.patch(`/payment-periods/orders/${type}/${order.id}`, { paidAmount: order.totalAmount, status: 'Paid', paymentMethod: 'cash', paymentDate: dayjs().toISOString(), note: 'Thanh toán đủ' });
      message.success('Xác nhận thanh toán thành công');
      loadPeriodDetail(selectedPeriodId!);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
    }
  };

  const openCancelPayment = (order: any) => {
    setCurrentOrder(order);
    cancelForm.resetFields();
    setCancelVisible(true);
  };

  const handleRevertPayment = async () => {
    try {
      const values = await cancelForm.validateFields();
      await api.patch(`/payment-periods/orders/${periodDetail.period.type}/${currentOrder.id}`, { paidAmount: 0, status: 'Unpaid', paymentDate: null, note: values.reason });
      message.success('Đã hủy thanh toán');
      setCancelVisible(false);
      loadPeriodDetail(selectedPeriodId!);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi hủy thanh toán');
    }
  };

  const handleRemoveOrder = async (orderId: string, type: string) => {
    try {
      await api.delete(`/payment-periods/orders/${type}/${orderId}`);
      message.success('Đã xóa đơn hàng khỏi đợt thu');
      loadPeriodDetail(selectedPeriodId!);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa đơn hàng');
    }
  };

  const openEditPayment = (order: any) => {
    setCurrentOrder(order);
    paymentForm.setFieldsValue({
      status: order.status,
      paymentMethod: order.paymentMethod || 'cash',
      paymentDate: order.paymentDate ? dayjs(order.paymentDate) : dayjs(),
      note: order.note
    });
    setIsPaymentModalVisible(true);
  };

  const saveEditPayment = async () => {
    try {
      const values = await paymentForm.validateFields();
      await api.patch(`/payment-periods/orders/${periodDetail.period.type}/${currentOrder.id}`, {
        status: values.status,
        paidAmount: values.status === 'Paid' ? currentOrder.totalAmount : 0,
        paymentMethod: values.status === 'Paid' ? values.paymentMethod : undefined,
        paymentDate: values.status === 'Paid' ? (values.paymentDate ? values.paymentDate.toISOString() : dayjs().toISOString()) : null,
        note: values.note
      });
      message.success('Cập nhật giao dịch thành công');
      setIsPaymentModalVisible(false);
      loadPeriodDetail(selectedPeriodId!);
    } catch (err: any) {
      if (err.response) message.error(err.response?.data?.message || 'Lỗi khi cập nhật giao dịch');
    }
  };

  const generateQr = async (order: any, silent = false) => {
    setCurrentOrder(order);
    if (!silent) setQrSending(true);
    try {
      const { data } = await api.post(`/tuition-payment-requests/bills/${order.id}/generate-qr`);
      if (!silent) {
        setQrRequest(data);
        setQrVisible(true);
        message.success(order.hasAccount ? 'Đã tạo QR và gửi thông báo cho học sinh' : 'Đã tạo QR — Sao chép link gửi qua Zalo cho phụ huynh');
      }
      loadPeriodDetail(selectedPeriodId!);
      return data;
    } catch (err: any) {
      if (!silent) message.error(err.response?.data?.message || 'Không thể tạo QR thanh toán');
      return null;
    } finally {
      if (!silent) setQrSending(false);
    }
  };


  const sendQrToAll = async () => {
    if (!periodDetail) return;
    const unpaidOrders = periodDetail.orders.filter((o: any) => o.status !== 'Paid' && !o.paymentRequest);
    if (unpaidOrders.length === 0) {
      message.info('Tất cả học sinh đã có QR hoặc đã thanh toán.');
      return;
    }
    setQrAllSending(true);
    let successCount = 0;
    let failCount = 0;
    for (const order of unpaidOrders) {
      const result = await generateQr(order, true);
      if (result) successCount++; else failCount++;
    }
    setQrAllSending(false);
    if (successCount > 0) message.success(`Đã tạo QR cho ${successCount} học sinh.${failCount > 0 ? ` Lỗi ${failCount} học sinh.` : ''}`);
    else message.error('Không thể tạo QR cho bất kỳ học sinh nào.');
    loadPeriodDetail(selectedPeriodId!);
  };

  const showTuitionQr = (order: any) => {
    setCurrentOrder(order);
    setQrRequest(order.paymentRequest);
    setQrVisible(true);
  };

  const showDetailModal = (record: any, type: string) => {
    setDetailType(type === 'tuition' ? 'student' : 'teacher');
    setDetailTitle(`${record.code} - ${record.name}`);
    setDetailItems(record.items || []);

    setDetailAuditLogs(record.auditLogs || []);

    setDetailVisible(true);
  };

  const showReceipt = (order: any) => {
    setReceiptOrder(order);
    setReceiptVisible(true);
  };

  const printReceipt = () => {
    if (!receiptOrder) return;
    const popup = window.open('', '_blank', 'width=800,height=900');
    if (!popup) {
      message.error('Trình duyệt đang chặn cửa sổ in phiếu thu');
      return;
    }
    popup.document.write(`
      <html><head><title>${receiptOrder.receiptCode}</title>
      <style>body{font-family:Arial;padding:40px;color:#111}h1{text-align:center}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}.amount{font-size:22px;font-weight:700}.footer{margin-top:60px;display:flex;justify-content:space-between;text-align:center}</style>
      </head><body>
      <h1>PHIẾU THU HỌC PHÍ</h1>
      <div class="row"><b>Mã phiếu thu</b><span>${receiptOrder.receiptCode}</span></div>
      <div class="row"><b>Học sinh</b><span>${receiptOrder.code} - ${receiptOrder.name}</span></div>
      <div class="row"><b>Đợt thu</b><span>${periodDetail.period.name}</span></div>
      <div class="row"><b>Ngày thu</b><span>${dayjs(receiptOrder.paymentDate).format('DD/MM/YYYY HH:mm')}</span></div>
      <div class="row"><b>Phương thức</b><span>${receiptOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : receiptOrder.paymentMethod === 'cash' ? 'Tiền mặt' : receiptOrder.paymentMethod || '-'}</span></div>
      <div class="row amount"><b>Số tiền</b><span>${Number(receiptOrder.totalAmount).toLocaleString('vi-VN')} ₫</span></div>
      <div class="row"><b>Người thu</b><span>${receiptOrder.processedBy?.name || 'Hệ thống'}</span></div>
      <div class="footer"><div>Người nộp tiền<br/><br/><br/>(Ký, ghi rõ họ tên)</div><div>Người thu tiền<br/><br/><br/>(Ký, ghi rõ họ tên)</div></div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    popup.document.close();
  };

  if (!selectedPeriodId) {
    const filteredPeriods = periods.filter((p: any) => {
      if (periodsTypeFilter !== 'All' && p.type !== periodsTypeFilter) return false;
      const query = periodsSearch.toLowerCase().trim();
      if (!query) return true;
      return (p.name || '').toLowerCase().includes(query) || (p.month || '').toLowerCase().includes(query);
    });

    return (
      <Card 
        className="glass-panel" 
        style={cardStyle}
        title={
          <span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Danh sách đợt thanh toán</span>
        }
        extra={
          <Space>
            <Input
              placeholder="Tìm tên đợt, tháng..."
              value={periodsSearch}
              onChange={(e) => setPeriodsSearch(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              value={periodsTypeFilter}
              onChange={setPeriodsTypeFilter}
              style={{ width: 160 }}
              options={[
                { value: 'All', label: 'Tất cả loại đợt' },
                { value: 'tuition', label: 'Đợt thu học phí' },
                { value: 'salary', label: 'Đợt chi trả lương' },
              ]}
            />
          </Space>
        }
      >
        <Table
          dataSource={filteredPeriods}
          rowKey="id"
          loading={periodsLoading}
          pagination={{ pageSize: 15 }}
          columns={[
            {
              title: 'Tên đợt thanh toán',
              dataIndex: 'name',
              key: 'name',
              render: (v: string, r: any) => (
                <a onClick={() => setSelectedPeriodId(r.id)} style={{ color: '#818cf8', fontWeight: 600, fontSize: 14 }}>
                  {v}
                </a>
              )
            },
            {
              title: 'Loại đợt',
              dataIndex: 'type',
              key: 'type',
              width: 140,
              render: (v: string) => (
                <Tag color={v === 'tuition' ? 'blue' : 'orange'}>
                  {v === 'tuition' ? 'Thu Học Phí' : 'Chi Trả Lương'}
                </Tag>
              )
            },
            {
              title: 'Tháng',
              dataIndex: 'month',
              key: 'month',
              width: 110,
              render: (v: string) => <Text style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</Text>
            },
            {
              title: 'Ngày chốt',
              key: 'range',
              width: 150,
              render: (_, r: any) => {
                const end = dayjs(r.endDate).format('DD/MM/YYYY');
                return <Text type="secondary">{end}</Text>;
              }
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalExpected',
              key: 'totalExpected',
              align: 'right' as const,
              render: (v: number) => <Text style={{ color: '#38bdf8', fontWeight: 600 }}>{v.toLocaleString('vi-VN')} ₫</Text>
            },
            {
              title: 'Đã hoàn tất',
              dataIndex: 'totalPaid',
              key: 'totalPaid',
              align: 'right' as const,
              render: (v: number, r: any) => (
                <Text style={{ color: '#10b981', fontWeight: 600 }}>
                  {v.toLocaleString('vi-VN')} ₫ ({r.totalExpected > 0 ? Math.round((v / r.totalExpected) * 100) : 0}%)
                </Text>
              )
            },
            {
              title: 'Trạng thái',
              key: 'status',
              width: 140,
              render: (_, r: any) => {
                const isCompleted = r.totalOrders > 0 && r.paidOrders === r.totalOrders;
                if (r.status === 'Closed') {
                  return <Tag color="default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LockOutlined /> Đã khóa</Tag>;
                }
                if (isCompleted) {
                  return <Tag color="green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircleOutlined /> Hoàn thành</Tag>;
                }
                return (
                  <Tag color="blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <UnlockOutlined /> {r.type === 'tuition' ? 'Đang thu' : 'Đang chi trả'}
                  </Tag>
                );
              }
            },
            {
              title: 'Thao tác',
              key: 'action',
              width: 220,
              align: 'center' as const,
              render: (_, r: any) => (
                <Space size="small">
                  <Button type="link" onClick={() => setSelectedPeriodId(r.id)} style={{ color: '#38bdf8' }}>Chi tiết</Button>
                  <Button type="link" onClick={() => handleTogglePeriodStatus(r)} style={{ color: r.status === 'Active' ? '#f59e0b' : '#10b981' }}>
                    {r.status === 'Active' ? 'Khóa' : 'Mở khóa'}
                  </Button>
                  <Popconfirm
                    title="Xóa đợt thanh toán?"
                    description="Không thể hoàn tác!"
                    onConfirm={() => handleDeletePeriod(r.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="link" danger>Xóa</Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => { setSelectedPeriodId(null); setPeriodDetail(null); }}
          style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-primary)' }}
        >
          Quay lại danh sách
        </Button>
        <Space>
          {periodDetail?.period && (
            <>
              {(() => {
                const isCompleted = periodDetail.orders.length > 0 && periodDetail.orders.every((o: any) => o.status === 'Paid');
                if (periodDetail.period.status === 'Closed') {
                  return <Tag color="default" style={{ padding: '4px 12px', fontSize: 13 }}><LockOutlined /> Đã khóa</Tag>;
                }
                if (isCompleted) {
                  return <Tag color="green" style={{ padding: '4px 12px', fontSize: 13 }}><CheckCircleOutlined /> Hoàn thành</Tag>;
                }
                return (
                  <Tag color="blue" style={{ padding: '4px 12px', fontSize: 13 }}>
                    <UnlockOutlined /> {periodDetail.period.type === 'tuition' ? 'Đang thu' : 'Đang chi trả'}
                  </Tag>
                );
              })()}
              <Button
                icon={periodDetail.period.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => handleTogglePeriodStatus(periodDetail.period)}
                style={{ borderColor: 'var(--card-border)', background: 'transparent', color: 'var(--text-primary)' }}
              >
                {periodDetail.period.status === 'Active' ? 'Khóa đợt' : 'Mở khóa đợt'}
              </Button>
              {periodDetail.period.type === 'tuition' && periodDetail.period.status === 'Active' && (
                <Tooltip title={`Tạo QR cho tất cả học sinh chưa thanh toán (${periodDetail.orders.filter((o: any) => o.status !== 'Paid' && !o.paymentRequest).length} học sinh)`}>
                  <Badge count={periodDetail.orders.filter((o: any) => o.status !== 'Paid' && !o.paymentRequest).length} size="small">
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      loading={qrAllSending}
                      onClick={sendQrToAll}
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none' }}
                    >
                      Gửi QR tất cả
                    </Button>
                  </Badge>
                </Tooltip>
              )}
            </>
          )}
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              if (!periodDetail) return;
              const isTuition = periodDetail.period.type === 'tuition';
              exportCSV(
                periodDetail.orders,
                `${periodDetail.period.name}.csv`,
                isTuition
                  ? ['Mã HS', 'Họ tên', 'SĐT', 'Tổng học phí (₫)', 'Thực thu (₫)', 'Trạng thái', 'Ngày thu', 'Ghi chú']
                  : ['Mã GV', 'Họ tên', 'SĐT', 'Loại', 'Tổng lương (₫)', 'Thực chi (₫)', 'Trạng thái', 'Ngày chi', 'Ghi chú'],
                isTuition
                  ? ['code', 'name', 'mobile', 'totalAmount', 'paidAmount', 'status', 'paymentDate', 'note']
                  : ['code', 'name', 'mobile', 'type', 'totalAmount', 'paidAmount', 'status', 'paymentDate', 'note']
              );
            }}
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
          >
            Xuất file báo cáo
          </Button>
        </Space>
      </div>

      {periodDetailLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><Spin size="large" /></div>
      ) : (
        periodDetail && (
          <div>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>
                    {periodDetail.period.type === 'tuition' ? 'Tổng số học viên' : 'Tổng số giáo viên'}
                  </div>
                  <div style={{ color: '#6366f1', fontSize: 24, fontWeight: 700 }}>{periodDetail.orders.length}</div>
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>Tổng tiền trong kỳ</div>
                  <div style={{ color: '#38bdf8', fontSize: 20, fontWeight: 700 }}>
                    {periodDetail.orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0).toLocaleString('vi-VN')} ₫
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>
                    {periodDetail.period.type === 'tuition' ? 'Đã thu tiền' : 'Đã chi trả'}
                  </div>
                  <div style={{ color: '#10b981', fontSize: 20, fontWeight: 700 }}>
                    {periodDetail.orders.reduce((sum: number, o: any) => sum + o.paidAmount, 0).toLocaleString('vi-VN')} ₫
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>
                    {periodDetail.period.type === 'tuition' ? 'Chưa thu' : 'Chưa chi'}
                  </div>
                  <div style={{ color: '#f87171', fontSize: 20, fontWeight: 700 }}>
                    {periodDetail.orders.reduce((sum: number, o: any) => sum + Math.max(0, o.totalAmount - o.paidAmount), 0).toLocaleString('vi-VN')} ₫
                  </div>
                </Card>
              </Col>
            </Row>

            {(periodDetail.period.auditLogs || []).length > 0 && (
              <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }} title="Nhật ký chốt đợt">
                {(periodDetail.period.auditLogs || []).map((log: any) => (
                  <div key={log.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--card-border)' }}>
                    <Tag color={log.event === 'PERIOD_CLOSED' ? 'default' : log.event === 'PERIOD_REOPENED' ? 'blue' : 'green'}>
                      {log.event === 'PERIOD_CLOSED' ? 'Khóa đợt' : log.event === 'PERIOD_REOPENED' ? 'Mở lại đợt' : 'Tạo đợt'}
                    </Tag>
                    <Text style={{ color: 'var(--text-secondary)' }}>
                      {log.actor?.name || 'Hệ thống'} · {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Text>
                  </div>
                ))}
              </Card>
            )}

            <Card
              className="glass-panel"
              style={cardStyle}
              title={
                <div style={{ color: 'var(--text-primary)' }}>
                  <span style={{ fontFamily: 'Outfit' }}>{periodDetail.period.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 12 }}>
                    (Tháng {periodDetail.period.month} - Từ: {dayjs(periodDetail.period.startDate).format('DD/MM/YYYY')} đến {dayjs(periodDetail.period.endDate).format('DD/MM/YYYY')})
                  </span>
                </div>
              }
              extra={
                <Space>
                  <Input
                    placeholder="Tìm mã, tên..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{ width: 180 }}
                    allowClear
                  />
                  <Select
                    value={ordersFilter}
                    onChange={setOrdersFilter}
                    style={{ width: 150 }}
                    options={[
                      { value: 'All', label: 'Tất cả trạng thái' },
                      { value: 'Paid', label: 'Đã hoàn tất' },
                      { value: 'Unpaid', label: 'Chưa hoàn tất' },
                    ]}
                  />
                  {periodDetail.period.type === 'tuition' && (
                    <Select
                      value={paymentMethodFilter}
                      onChange={setPaymentMethodFilter}
                      style={{ width: 180 }}
                      options={[
                        { value: 'All', label: 'Tất cả phương thức' },
                        { value: 'cash', label: 'Tiền mặt' },
                        { value: 'bank_transfer', label: 'CK thủ công' },
                        { value: 'auto_reconciled', label: 'Đối soát tự động' },
                        { value: 'no_qr', label: 'Chưa lấy QR' },
                      ]}
                    />
                  )}
                </Space>
              }
            >
              <Table
                dataSource={periodDetail.orders.filter((o: any) => {
                  // 1. Status Filter
                  if (ordersFilter === 'Paid' && o.status !== 'Paid') return false;
                  if (ordersFilter === 'Unpaid' && o.status !== 'Unpaid') return false;

                  // 2. Method/QR Filter
                  if (paymentMethodFilter !== 'All') {
                    if (paymentMethodFilter === 'cash') {
                      if (o.status !== 'Paid' || o.paymentMethod !== 'cash') return false;
                    } else if (paymentMethodFilter === 'bank_transfer') {
                      if (o.status !== 'Paid' || o.paymentMethod !== 'bank_transfer' || o.paymentRequest) return false;
                    } else if (paymentMethodFilter === 'auto_reconciled') {
                      if (o.status !== 'Paid' || !o.paymentRequest) return false;
                    } else if (paymentMethodFilter === 'no_qr') {
                      if (o.status === 'Paid' || o.paymentRequest) return false;
                    }
                  }

                  // 3. Search query
                  const query = studentSearch.toLowerCase().trim();
                  if (!query) return true;
                  return (o.code || '').toLowerCase().includes(query) || (o.name || '').toLowerCase().includes(query);
                })}
                rowKey="id"
                pagination={{ pageSize: 15 }}
                size="small"
                scroll={{ x: 'max-content' }}
                columns={[
                  {
                    title: periodDetail.period.type === 'tuition' ? 'Mã HS' : 'Mã GV',
                    dataIndex: 'code',
                    key: 'code',
                    width: 110,
                    render: (v: string) => <Text style={{ color: '#818cf8', fontWeight: 600 }}>{v}</Text>
                  },
                  {
                    title: 'Họ tên',
                    dataIndex: 'name',
                    key: 'name',
                    width: 220,
                    render: (v: string, r: any) => (
                      <div>
                        <Text style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</Text>
                        {r.nickName && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>({r.nickName})</span>}
                      </div>
                    )
                  },
                  { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text type="secondary">{v}</Text> },
                  {
                    title: 'Tổng số tiền',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    width: 150,
                    align: 'right' as const,
                    render: (v: number) => <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.toLocaleString('vi-VN')} ₫</Text>
                  },
                  {
                    title: periodDetail.period.type === 'tuition' ? 'Đã thu' : 'Đã chi',
                    dataIndex: 'paidAmount',
                    key: 'paidAmount',
                    width: 150,
                    align: 'right' as const,
                    render: (v: number) => <Text style={{ color: v > 0 ? '#10b981' : 'var(--text-muted)' }}>{v.toLocaleString('vi-VN')} ₫</Text>
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    width: 140,
                    align: 'center' as const,
                    render: (v: string, r: any) => {
                      if (v === 'Paid') {
                        return (
                          <Tag color="green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircleOutlined /> Thành công
                          </Tag>
                        );
                      }
                      if (r.paymentRequest?.claimedAt) {
                        return (
                          <Tag color="gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ClockCircleOutlined /> PH đã báo nộp
                          </Tag>
                        );
                      }
                      return (
                        <Tag color="red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CloseCircleOutlined /> {periodDetail.period.type === 'tuition' ? 'Chờ thanh toán' : 'Chờ chi trả'}
                        </Tag>
                      );
                    }
                  },
                  {
                    title: 'Thời gian PH xác nhận',
                    key: 'claimedAt',
                    width: 180,
                    render: (_, r: any) => {
                      const claimed = r.paymentRequest?.claimedAt;
                      return claimed ? (
                        <Text style={{ color: '#fbbf24', fontWeight: 500 }}>
                          {dayjs(claimed).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      );
                    }
                  },
                  {
                    title: 'Thời gian duyệt/đối soát',
                    key: 'paymentDate',
                    width: 180,
                    render: (_, r: any) => {
                      const paid = r.status === 'Paid' ? r.paymentDate : null;
                      return paid ? (
                        <Text style={{ color: '#10b981', fontWeight: 600 }}>
                          {dayjs(paid).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      );
                    }
                  },
                  {
                    title: 'Phiếu thu',
                    dataIndex: 'receiptCode',
                    key: 'receiptCode',
                    width: 150,
                    render: (v: string) => v ? <Text copyable>{v}</Text> : <Text type="secondary">—</Text>
                  },
                  {
                    title: 'Xử lý thanh toán',
                    key: 'paymentMeta',
                    width: 180,
                    render: (_, r: any) => r.status === 'Paid' ? (
                      <div>
                        <Text style={{ color: 'var(--text-primary)' }}>{r.processedBy?.name || 'Hệ thống'}</Text>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {r.paymentRequest ? (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Đối soát tự động</span>
                          ) : (
                            r.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : r.paymentMethod === 'cash' ? 'Tiền mặt' : r.paymentMethod || '—'
                          )}
                        </div>
                      </div>
                    ) : <Text type="secondary">—</Text>
                  },
                  {
                    title: 'Ghi chú',
                    dataIndex: 'note',
                    key: 'note',
                    width: 180,
                    ellipsis: true,
                    render: (v: string) => <Text type="secondary">{v || '—'}</Text>
                  },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    width: 360,
                    align: 'center' as const,
                    render: (_, r: any) => {
                      const isClosed = periodDetail.period.status === 'Closed';
                      return (
                        <Space size="small">
                          <Button type="link" size="small" onClick={() => showDetailModal(r, periodDetail.period.type)} style={{ color: '#38bdf8' }}>Chi tiết</Button>
                          {periodDetail.period.type === 'tuition' && r.paymentRequest && (
                            <Button type="link" size="small" icon={<QrcodeOutlined />} onClick={() => showTuitionQr(r)} style={{ color: '#a78bfa', padding: 0 }}>
                              Xem QR / Đối soát
                            </Button>
                          )}
                          {periodDetail.period.type === 'tuition' && r.status === 'Paid' && r.receiptCode && (
                            <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => showReceipt(r)} style={{ color: '#10b981', padding: 0 }}>
                              Phiếu thu
                            </Button>
                          )}
                          {!isClosed && (
                            <>
                              {r.status === 'Paid' ? (
                                <Button type="link" danger size="small" onClick={() => openCancelPayment(r)} style={{ padding: 0 }}>Hủy xác nhận</Button>
                              ) : (
                                <>
                                  {periodDetail.period.type === 'tuition' && !r.paymentRequest && (
                                    <Button
                                      size="small"
                                      icon={<QrcodeOutlined />}
                                      loading={qrSending}
                                      onClick={() => generateQr(r)}
                                      style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.4)', color: '#a78bfa' }}
                                    >
                                      Lấy QR
                                    </Button>
                                  )}
                                  <Popconfirm
                                    title="Xác nhận thanh toán?"
                                    onConfirm={() => handleConfirmFullPayment(r, periodDetail.period.type)}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                  >
                                    <Button type="primary" size="small" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 4 }}>Xác nhận đủ</Button>
                                  </Popconfirm>
                                  <Button type="link" size="small" onClick={() => openEditPayment(r)} style={{ color: '#f59e0b', padding: 0 }}>Cập nhật</Button>
                                </>
                              )}
                              <Popconfirm
                                title="Loại bỏ đơn hàng?"
                                onConfirm={() => handleRemoveOrder(r.id, periodDetail.period.type)}
                                okText="Xóa đơn"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button type="link" danger size="small"><DeleteOutlined /></Button>
                              </Popconfirm>
                            </>
                          )}
                        </Space>
                      );
                    }
                  }
                ]}
              />
            </Card>

            <Modal
              title={<span style={{ color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: 17 }}>Cập nhật giao dịch</span>}
              open={isPaymentModalVisible}
              onOk={saveEditPayment}
              onCancel={() => setIsPaymentModalVisible(false)}
              okText="Lưu thông tin"
              cancelText="Hủy"
              width={450}
            >
              <Form form={paymentForm} layout="vertical" style={{ padding: '10px 0' }}>
                <Form.Item name="status" label="Trạng thái giao dịch" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Paid">Đã thanh toán (Thành công)</Select.Option>
                    <Select.Option value="Unpaid">Chưa thanh toán (Chờ giao dịch)</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.status !== curr.status}>
                  {({ getFieldValue }) => {
                    const isPaid = getFieldValue('status') === 'Paid';
                    if (!isPaid) return null;
                    return (
                      <Row gutter={12}>
                        <Col span={24}>
                          <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true, message: 'Chọn phương thức thanh toán' }]}>
                            <Select options={[
                              { value: 'cash', label: 'Tiền mặt' },
                              { value: 'bank_transfer', label: 'Chuyển khoản' },
                              { value: 'other', label: 'Khác' },
                            ]} />
                          </Form.Item>
                          <Form.Item name="paymentDate" label="Ngày giao dịch">
                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  }}
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Hủy xác nhận thanh toán"
              open={cancelVisible}
              onOk={handleRevertPayment}
              onCancel={() => setCancelVisible(false)}
              okText="Xác nhận hủy"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Form form={cancelForm} layout="vertical">
                <Form.Item name="reason" label="Lý do hủy" rules={[{ required: true, message: 'Nhập lý do hủy xác nhận thanh toán' }]}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Phiếu thu học phí"
              open={receiptVisible}
              onCancel={() => setReceiptVisible(false)}
              footer={[
                <Button key="close" onClick={() => setReceiptVisible(false)}>Đóng</Button>,
                <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={printReceipt}>In / Lưu PDF</Button>,
              ]}
            >
              {receiptOrder && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <Text strong style={{ fontSize: 18, textAlign: 'center', color: 'var(--text-primary)' }}>PHIẾU THU HỌC PHÍ</Text>
                  <div><Text type="secondary">Mã phiếu:</Text> <Text copyable>{receiptOrder.receiptCode}</Text></div>
                  <div><Text type="secondary">Học sinh:</Text> <Text>{receiptOrder.code} - {receiptOrder.name}</Text></div>
                  <div><Text type="secondary">Đợt thu:</Text> <Text>{periodDetail?.period?.name}</Text></div>
                  <div><Text type="secondary">Ngày thu:</Text> <Text>{dayjs(receiptOrder.paymentDate).format('DD/MM/YYYY HH:mm')}</Text></div>
                  <div><Text type="secondary">Phương thức:</Text> <Text>{receiptOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : receiptOrder.paymentMethod === 'cash' ? 'Tiền mặt' : receiptOrder.paymentMethod || '—'}</Text></div>
                  <div><Text type="secondary">Người thu:</Text> <Text>{receiptOrder.processedBy?.name || 'Hệ thống'}</Text></div>
                  <div><Text type="secondary">Số tiền:</Text> <Text strong style={{ color: '#10b981', fontSize: 18 }}>{Number(receiptOrder.totalAmount).toLocaleString('vi-VN')} ₫</Text></div>
                </div>
              )}
            </Modal>

            <Modal
              title="QR chuyển khoản học phí"
              open={qrVisible}
              onCancel={() => setQrVisible(false)}
              footer={[
                qrRequest?.qrUrl && (
                  <Button
                    key="copy"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(qrRequest.qrUrl);
                      message.success('Đã sao chép link QR — Dán vào Zalo để gửi phụ huynh!');
                    }}
                  >
                    Sao chép link QR
                  </Button>
                ),
                <Button key="resend" icon={<QrcodeOutlined />} loading={qrSending} onClick={() => currentOrder && generateQr(currentOrder)}>
                  Tạo lại QR
                </Button>,
                <Button key="close" type="primary" onClick={() => setQrVisible(false)}>Đóng</Button>
              ]}
            >
              {qrRequest && (
                <div style={{ textAlign: 'center' }}>
                  <img src={qrRequest.qrUrl} alt="QR chuyển khoản học phí" style={{ width: '100%', maxWidth: 360, borderRadius: 8 }} />
                  <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>
                    <div>{qrRequest.accountName} - {qrRequest.accountNumber}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{Number(qrRequest.amount).toLocaleString('vi-VN')} ₫</div>
                    <div>Nội dung: <Text copyable={{ text: qrRequest.transferContent }} style={{ color: '#a78bfa' }}>{qrRequest.transferContent}</Text></div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={qrRequest.status === 'reconciled' ? 'green' : qrRequest.status === 'processing' ? 'gold' : 'blue'}>
                        {qrRequest.status === 'reconciled' ? 'Đã tự động đối soát' : qrRequest.status === 'processing' ? 'Đang chuyển tiền' : 'Chờ học sinh chuyển khoản'}
                      </Tag>
                    </div>
                    {(qrRequest.logs || []).length > 0 && (
                      <div style={{ marginTop: 14, textAlign: 'left' }}>
                        <Text strong style={{ color: 'var(--text-primary)' }}>Nhật ký thanh toán</Text>
                        {[...qrRequest.logs].sort((a: any, b: any) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()).map((log: any) => (
                          <div key={log.id} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'var(--bg-tertiary)' }}>
                            <Tag color={log.status === 'success' ? 'green' : 'gold'}>{log.status}</Tag>
                            <Text style={{ color: 'var(--text-secondary)' }}>{log.message}</Text>
                            <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')} · {log.source}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal>

            <Modal
              title={
                <div style={{ color: 'var(--text-primary)', fontSize: 18, fontFamily: 'Outfit' }}>
                  {detailType === 'student' ? 'Chi Tiết Học Phí' : 'Chi Tiết Lương'} — {detailTitle}
                </div>
              }
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[<Button key="close" type="primary" onClick={() => setDetailVisible(false)}>Đóng</Button>]}
              width={750}
              styles={{ body: { background: 'var(--bg-secondary)', color: 'var(--text-primary)' } }}
            >
              <Table
                dataSource={detailItems}
                rowKey={(r, index) => r.classId || String(index)}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Ngày học',
                    dataIndex: 'className',
                    key: 'sessionDate',
                    align: 'center',
                    render: (v) => {
                      const match = v?.match(/\(Buổi (.*?)\)/);
                      return match ? match[1] : '-';
                    }
                  },
                  {
                    title: 'Lớp học',
                    dataIndex: 'className',
                    key: 'className',
                    render: (v) => v?.replace(/\(Buổi .*?\)/, '').trim() || v
                  },
                  { title: 'Số buổi', dataIndex: 'sessionsCount', key: 'sessionsCount', align: 'center' },
                  { title: 'Đơn giá', dataIndex: 'rate', key: 'rate', align: 'right', render: (v) => `${Number(v).toLocaleString('vi-VN')} ₫` },
                  { title: 'Thành tiền', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right', render: (v) => `${Number(v).toLocaleString('vi-VN')} ₫` }
                ]}
              />
              {detailAuditLogs.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <Text strong style={{ color: 'var(--text-primary)' }}>Nhật ký kế toán</Text>
                  {detailAuditLogs.map((log: any) => (
                    <div key={log.id} style={{ marginTop: 8, padding: 10, borderRadius: 8, background: 'var(--bg-tertiary)' }}>
                      <Tag color={log.event === 'PAYMENT_CONFIRMED' ? 'green' : 'red'}>
                        {log.event === 'PAYMENT_CONFIRMED' ? 'Xác nhận thanh toán' : 'Hủy xác nhận'}
                      </Tag>
                      <Text style={{ color: 'var(--text-secondary)' }}>
                        {log.actor?.name || 'Hệ thống'} · {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                      </Text>
                      {log.metadata?.reason && (
                        <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>Lý do: {log.metadata.reason}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Modal>

          </div>
        )
      )}
    </div>
  );
};
