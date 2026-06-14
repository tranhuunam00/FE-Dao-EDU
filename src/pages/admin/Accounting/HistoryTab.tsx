import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Typography, Space, Tag, Spin, App, Modal, Popconfirm, Select, InputNumber, DatePicker, Form, Input } from 'antd';
import { LockOutlined, UnlockOutlined, CheckCircleOutlined, DeleteOutlined, CloseCircleOutlined, ArrowLeftOutlined, DownloadOutlined, QrcodeOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;

const cardStyle = { border: 'none', background: 'rgba(17, 24, 39, 0.75)' };

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
  const [detailType, setDetailType] = useState<'student' | 'teacher'>('student');

  // Payment Edit Modal
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [qrRequest, setQrRequest] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrSending, setQrSending] = useState(false);

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
      await api.patch(`/payment-periods/orders/${type}/${order.id}`, { paidAmount: order.totalAmount, status: 'Paid', paymentDate: dayjs().toISOString(), note: 'Thanh toán đủ' });
      message.success('Xác nhận thanh toán thành công');
      loadPeriodDetail(selectedPeriodId!);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
    }
  };

  const handleRevertPayment = async (order: any, type: string) => {
    try {
      await api.patch(`/payment-periods/orders/${type}/${order.id}`, { paidAmount: 0, status: 'Unpaid', paymentDate: null, note: '' });
      message.success('Đã hủy thanh toán');
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
      paidAmount: order.paidAmount,
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
        paidAmount: values.status === 'Paid' ? (values.paidAmount || currentOrder.totalAmount) : 0,
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

  const sendTuitionQr = async (order: any) => {
    setCurrentOrder(order);
    setQrSending(true);
    try {
      const { data } = await api.post(`/tuition-payment-requests/bills/${order.id}/send`);
      setQrRequest(data);
      setQrVisible(true);
      message.success('Đã gửi QR và thông báo cho học sinh');
      loadPeriodDetail(selectedPeriodId!);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi QR thanh toán');
    } finally {
      setQrSending(false);
    }
  };

  const showTuitionQr = (order: any) => {
    setCurrentOrder(order);
    setQrRequest(order.paymentRequest);
    setQrVisible(true);
  };

  const showDetailModal = (record: any, type: string) => {
    setDetailType(type as 'student' | 'teacher');
    setDetailTitle(`${record.code} - ${record.name}`);
    setDetailItems(record.sessionBreakdown || []);
    setDetailVisible(true);
  };

  if (!selectedPeriodId) {
    return (
      <Card className="glass-panel" style={cardStyle} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={periods}
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
              render: (v: string) => <Text style={{ color: '#fff', fontWeight: 500 }}>{v}</Text>
            },
            {
              title: 'Ngày chốt',
              key: 'range',
              width: 150,
              render: (_, r: any) => {
                const end = dayjs(r.endDate).format('DD/MM/YYYY');
                return <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{end}</Text>;
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
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff' }}
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
                style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'transparent', color: '#fff' }}
              >
                {periodDetail.period.status === 'Active' ? 'Khóa đợt' : 'Mở khóa đợt'}
              </Button>
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
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                    {periodDetail.period.type === 'tuition' ? 'Tổng số học viên' : 'Tổng số giáo viên'}
                  </div>
                  <div style={{ color: '#6366f1', fontSize: 24, fontWeight: 700 }}>{periodDetail.orders.length}</div>
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng tiền trong kỳ</div>
                  <div style={{ color: '#38bdf8', fontSize: 20, fontWeight: 700 }}>
                    {periodDetail.orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0).toLocaleString('vi-VN')} ₫
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                    {periodDetail.period.type === 'tuition' ? 'Đã thu tiền' : 'Đã chi trả'}
                  </div>
                  <div style={{ color: '#10b981', fontSize: 20, fontWeight: 700 }}>
                    {periodDetail.orders.reduce((sum: number, o: any) => sum + o.paidAmount, 0).toLocaleString('vi-VN')} ₫
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                    {periodDetail.period.type === 'tuition' ? 'Còn nợ' : 'Chưa trả'}
                  </div>
                  <div style={{ color: '#f87171', fontSize: 20, fontWeight: 700 }}>
                    {periodDetail.orders.reduce((sum: number, o: any) => sum + Math.max(0, o.totalAmount - o.paidAmount), 0).toLocaleString('vi-VN')} ₫
                  </div>
                </Card>
              </Col>
            </Row>

            <Card
              className="glass-panel"
              style={cardStyle}
              title={
                <div style={{ color: '#fff' }}>
                  <span style={{ fontFamily: 'Outfit' }}>{periodDetail.period.name}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginLeft: 12 }}>
                    (Tháng {periodDetail.period.month} - Từ: {dayjs(periodDetail.period.startDate).format('DD/MM/YYYY')} đến {dayjs(periodDetail.period.endDate).format('DD/MM/YYYY')})
                  </span>
                </div>
              }
              extra={
                <Select
                  value={ordersFilter}
                  onChange={setOrdersFilter}
                  style={{ width: 180 }}
                  options={[
                    { value: 'All', label: 'Tất cả đơn hàng' },
                    { value: 'Paid', label: 'Đã hoàn tất' },
                    { value: 'Unpaid', label: 'Chưa hoàn tất' },
                  ]}
                />
              }
            >
              <Table
                dataSource={periodDetail.orders.filter((o: any) => {
                  if (ordersFilter === 'Paid') return o.status === 'Paid';
                  if (ordersFilter === 'Unpaid') return o.status === 'Unpaid';
                  return true;
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
                        <Text style={{ color: '#fff', fontWeight: 500 }}>{v}</Text>
                        {r.nickName && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>({r.nickName})</span>}
                      </div>
                    )
                  },
                  { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</Text> },
                  {
                    title: 'Tổng số tiền',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    width: 150,
                    align: 'right' as const,
                    render: (v: number) => <Text style={{ color: '#fff', fontWeight: 600 }}>{v.toLocaleString('vi-VN')} ₫</Text>
                  },
                  {
                    title: periodDetail.period.type === 'tuition' ? 'Thực đóng' : 'Thực trả',
                    dataIndex: 'paidAmount',
                    key: 'paidAmount',
                    width: 150,
                    align: 'right' as const,
                    render: (v: number) => <Text style={{ color: v > 0 ? '#10b981' : 'rgba(255,255,255,0.4)' }}>{v.toLocaleString('vi-VN')} ₫</Text>
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    width: 130,
                    align: 'center' as const,
                    render: (v: string) => (
                      <Tag color={v === 'Paid' ? 'green' : 'red'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {v === 'Paid' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} {v === 'Paid' ? 'Thành công' : 'Chờ thu/chi'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Ngày giao dịch',
                    dataIndex: 'paymentDate',
                    key: 'paymentDate',
                    width: 130,
                    render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>—</Text>
                  },
                  {
                    title: 'Ghi chú',
                    dataIndex: 'note',
                    key: 'note',
                    width: 180,
                    ellipsis: true,
                    render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.5)' }}>{v || '—'}</Text>
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
                              Đối soát
                            </Button>
                          )}
                          {!isClosed && (
                            <>
                              {r.status === 'Paid' ? (
                                <Popconfirm
                                  title="Hủy thanh toán?"
                                  onConfirm={() => handleRevertPayment(r, periodDetail.period.type)}
                                  okText="Có, hủy"
                                  cancelText="Không"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button type="link" danger size="small" style={{ padding: 0 }}>Hủy xác nhận</Button>
                                </Popconfirm>
                              ) : (
                                <>
                                  {periodDetail.period.type === 'tuition' && !r.paymentRequest && (
                                      <Button size="small" icon={<SendOutlined />} loading={qrSending} onClick={() => sendTuitionQr(r)}>
                                        Gửi QR
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
              title={<span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 17 }}>Cập nhật giao dịch</span>}
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
                        <Col span={12}>
                          <Form.Item name="paidAmount" label="Số tiền thực tế">
                            <InputNumber style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
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
              title="QR chuyển khoản học phí"
              open={qrVisible}
              onCancel={() => setQrVisible(false)}
              footer={[
                <Button key="resend" icon={<SendOutlined />} loading={qrSending} onClick={() => currentOrder && sendTuitionQr(currentOrder)}>
                  Gửi lại
                </Button>,
                <Button key="close" type="primary" onClick={() => setQrVisible(false)}>Đóng</Button>
              ]}
            >
              {qrRequest && (
                <div style={{ textAlign: 'center' }}>
                  <img src={qrRequest.qrUrl} alt="QR chuyển khoản học phí" style={{ width: '100%', maxWidth: 360, borderRadius: 8 }} />
                  <div style={{ marginTop: 12, color: 'rgba(255,255,255,.75)' }}>
                    <div>{qrRequest.accountName} - {qrRequest.accountNumber}</div>
                    <div style={{ fontWeight: 700, color: '#fff', marginTop: 4 }}>{Number(qrRequest.amount).toLocaleString('vi-VN')} ₫</div>
                    <div>Nội dung: <Text copyable={{ text: qrRequest.transferContent }} style={{ color: '#a78bfa' }}>{qrRequest.transferContent}</Text></div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={qrRequest.status === 'reconciled' ? 'green' : qrRequest.status === 'processing' ? 'gold' : 'blue'}>
                        {qrRequest.status === 'reconciled' ? 'Đã tự động đối soát' : qrRequest.status === 'processing' ? 'Đang chuyển tiền' : 'Chờ học sinh chuyển khoản'}
                      </Tag>
                    </div>
                    {(qrRequest.logs || []).length > 0 && (
                      <div style={{ marginTop: 14, textAlign: 'left' }}>
                        <Text strong style={{ color: '#fff' }}>Nhật ký thanh toán</Text>
                        {[...qrRequest.logs].sort((a: any, b: any) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()).map((log: any) => (
                          <div key={log.id} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'rgba(255,255,255,.05)' }}>
                            <Tag color={log.status === 'success' ? 'green' : 'gold'}>{log.status}</Tag>
                            <Text style={{ color: 'rgba(255,255,255,.75)' }}>{log.message}</Text>
                            <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')} · {log.source}</div>
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
                <div style={{ color: '#fff', fontSize: 18, fontFamily: 'Outfit' }}>
                  {detailType === 'student' ? 'Chi Tiết Học Phí' : 'Chi Tiết Lương'} — {detailTitle}
                </div>
              }
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[<Button key="close" type="primary" onClick={() => setDetailVisible(false)}>Đóng</Button>]}
              width={750}
              styles={{ body: { background: '#111827', color: '#fff' } }}
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
            </Modal>

          </div>
        )
      )}
    </div>
  );
};
