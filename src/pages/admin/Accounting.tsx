import React, { useState, useEffect } from 'react';
import {
  ConfigProvider, App, theme, Card, Row, Col, DatePicker,
  Button, Table, Tabs, Typography, Space, Tag, Spin, Alert,
  Modal, Form, Input, InputNumber, Select, Popconfirm
} from 'antd';
import {
  SearchOutlined, UserOutlined,
  TeamOutlined, DownloadOutlined, CalculatorOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ArrowLeftOutlined, PlusOutlined, LockOutlined,
  UnlockOutlined, DeleteOutlined, FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Text, Title } = Typography;

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

const AccountingInner: React.FC = () => {
  const { message } = App.useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState('periods');

  // Periods list state
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);

  // Period detail state
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periodDetail, setPeriodDetail] = useState<any>(null);
  const [periodDetailLoading, setPeriodDetailLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Create period state
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [createForm] = Form.useForm();
  const formType = Form.useWatch('type', createForm);
  const formMonth = Form.useWatch('month', createForm);
  const formDateRange = Form.useWatch('dateRange', createForm);

  // Preview state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [previewSearch, setPreviewSearch] = useState('');

  // Update payment state
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Session Breakdown Modal state
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailPeriodText, setDetailPeriodText] = useState('');
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [detailType, setDetailType] = useState<'student' | 'teacher'>('student');

  // Tab: Student tuition ad-hoc calculator state
  const [tuitionRange, setTuitionRange] = useState<[any, any]>([null, null]);
  const [tuitionData, setTuitionData] = useState<any>(null);
  const [tuitionLoading, setTuitionLoading] = useState(false);

  // Tab: Teacher wage ad-hoc calculator state
  const [wagesRange, setWagesRange] = useState<[any, any]>([null, null]);
  const [wagesData, setWagesData] = useState<any>(null);
  const [wagesLoading, setWagesLoading] = useState(false);

  // Load periods
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

  // Load single period details
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
    if (activeTab === 'periods') {
      if (selectedPeriodId) {
        loadPeriodDetail(selectedPeriodId);
      } else {
        loadPeriods();
      }
    }
  }, [activeTab, selectedPeriodId]);

  // Handle auto-naming for new periods
  useEffect(() => {
    if (formType && formMonth) {
      const typeLabel = formType === 'tuition' ? 'Thu học phí' : 'Trả lương GV';
      const monthLabel = formMonth.format('MM/YYYY');
      createForm.setFieldsValue({
        name: `Đợt ${typeLabel} Tháng ${monthLabel}`
      });
    }
  }, [formType, formMonth, createForm]);

  // Fetch preview candidates when parameters change
  useEffect(() => {
    const fetchPreviewCandidates = async () => {
      if (!formType || !formDateRange || formDateRange.length < 2) {
        setPreviewData([]);
        setSelectedRowKeys([]);
        return;
      }
      setPreviewLoading(true);
      try {
        const startStr = formDateRange[0].format('YYYY-MM-DD');
        const endStr = formDateRange[1].format('YYYY-MM-DD');
        if (formType === 'tuition') {
          const { data } = await api.get('/students/tuition-bulk', {
            params: { startDate: startStr, endDate: endStr }
          });
          const list = (data.students || []).filter((s: any) => s.totalAmount > 0);
          setPreviewData(list);
          setSelectedRowKeys(list.map((s: any) => s.studentId));
        } else {
          const { data } = await api.get('/teachers/wages-bulk', {
            params: { startDate: startStr, endDate: endStr }
          });
          const list = (data.teachers || []).filter((t: any) => t.totalAmount > 0);
          setPreviewData(list);
          setSelectedRowKeys(list.map((t: any) => t.teacherId));
        }
      } catch (err) {
        console.error('Lỗi khi tải bản xem trước', err);
      } finally {
        setPreviewLoading(false);
      }
    };
    if (isCreateVisible) {
      fetchPreviewCandidates();
    }
  }, [formType, formDateRange, isCreateVisible]);

  // Filter preview candidates locally
  const filteredPreviewData = previewData.filter(item => {
    const query = previewSearch.toLowerCase().trim();
    if (!query) return true;
    const code = (item.studentCode || item.teacherCode || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return code.includes(query) || name.includes(query);
  });

  // Action: Create Period
  const handleCreatePeriod = async () => {
    try {
      const values = await createForm.validateFields();
      const payload: any = {
        name: values.name,
        type: values.type,
        month: values.month.format('YYYY-MM'),
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      if (values.type === 'tuition') {
        payload.studentIds = selectedRowKeys;
      } else {
        payload.teacherIds = selectedRowKeys;
      }
      await api.post('/payment-periods', payload);
      message.success('Đã tạo đợt thanh toán mới thành công!');
      setIsCreateVisible(false);
      createForm.resetFields();
      setPreviewData([]);
      setSelectedRowKeys([]);
      setPreviewSearch('');
      loadPeriods();
    } catch (err: any) {
      if (err.name === 'ValidationError') return;
      message.error(err.response?.data?.message || 'Lỗi khi tạo đợt thanh toán');
    }
  };

  // Action: Toggle period lock status
  const handleTogglePeriodStatus = async (record: any) => {
    const newStatus = record.status === 'Active' ? 'Closed' : 'Active';
    try {
      await api.patch(`/payment-periods/${record.id}/status`, { status: newStatus });
      message.success(newStatus === 'Closed' ? 'Đã khóa đợt thanh toán thành công!' : 'Đã mở khóa đợt thanh toán!');
      if (selectedPeriodId === record.id) {
        loadPeriodDetail(record.id);
      } else {
        loadPeriods();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi đổi trạng thái đợt');
    }
  };

  // Action: Delete Period
  const handleDeletePeriod = async (id: string) => {
    try {
      await api.delete(`/payment-periods/${id}`);
      message.success('Đã xóa đợt thanh toán thành công!');
      if (selectedPeriodId === id) {
        setSelectedPeriodId(null);
        setPeriodDetail(null);
      } else {
        loadPeriods();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa đợt thanh toán');
    }
  };

  // Action: Confirm full payment
  const handleConfirmFullPayment = async (order: any, type: 'tuition' | 'salary') => {
    try {
      await api.patch(`/payment-periods/orders/${type}/${order.id}`, {
        status: 'Paid',
        paidAmount: order.totalAmount,
        paymentDate: new Date().toISOString(),
        note: 'Đã thanh toán đủ qua hệ thống',
      });
      message.success('Xác nhận thanh toán thành công!');
      if (selectedPeriodId) loadPeriodDetail(selectedPeriodId);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật thanh toán');
    }
  };

  // Action: Revert payment status
  const handleRevertPayment = async (order: any, type: 'tuition' | 'salary') => {
    try {
      await api.patch(`/payment-periods/orders/${type}/${order.id}`, {
        status: 'Unpaid',
        paidAmount: 0,
        paymentDate: null,
        note: 'Hủy xác nhận thanh toán',
      });
      message.success('Đã hủy trạng thái thanh toán!');
      if (selectedPeriodId) loadPeriodDetail(selectedPeriodId);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật thanh toán');
    }
  };

  // Action: Remove order from period
  const handleRemoveOrder = async (orderId: string, type: 'tuition' | 'salary') => {
    try {
      await api.delete(`/payment-periods/orders/${type}/${orderId}`);
      message.success('Đã loại bỏ đơn hàng khỏi đợt và giải phóng các buổi học!');
      if (selectedPeriodId) loadPeriodDetail(selectedPeriodId);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi loại bỏ đơn hàng');
    }
  };

  // Action: Open Edit Payment Modal
  const openEditPayment = (order: any) => {
    setCurrentOrder(order);
    paymentForm.setFieldsValue({
      status: order.status,
      paidAmount: order.paidAmount || order.totalAmount,
      paymentDate: order.paymentDate ? dayjs(order.paymentDate) : dayjs(),
      note: order.note || '',
    });
    setIsPaymentModalVisible(true);
  };

  // Action: Save Edit Payment
  const saveEditPayment = async () => {
    if (!currentOrder || !periodDetail) return;
    try {
      const values = await paymentForm.validateFields();
      await api.patch(`/payment-periods/orders/${periodDetail.period.type}/${currentOrder.id}`, {
        status: values.status,
        paidAmount: values.paidAmount,
        paymentDate: values.status === 'Paid' ? values.paymentDate.toISOString() : null,
        note: values.note,
      });
      message.success('Cập nhật thông tin thanh toán thành công!');
      setIsPaymentModalVisible(false);
      loadPeriodDetail(periodDetail.period.id);
    } catch (err: any) {
      if (err.name === 'ValidationError') return;
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật thanh toán');
    }
  };

  // Ad-hoc Student Tuition Calculator
  const fetchTuitionBulk = async () => {
    const [start, end] = tuitionRange;
    if (!start || !end) { message.warning('Vui lòng chọn khoảng thời gian.'); return; }
    setTuitionLoading(true);
    try {
      const { data } = await api.get('/students/tuition-bulk', {
        params: { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') }
      });
      setTuitionData(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải dữ liệu học phí');
    } finally {
      setTuitionLoading(false);
    }
  };

  // Ad-hoc Teacher Wages Calculator
  const fetchWagesBulk = async () => {
    const [start, end] = wagesRange;
    if (!start || !end) { message.warning('Vui lòng chọn khoảng thời gian.'); return; }
    setWagesLoading(true);
    try {
      const { data } = await api.get('/teachers/wages-bulk', {
        params: { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') }
      });
      setWagesData(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải dữ liệu lương');
    } finally {
      setWagesLoading(false);
    }
  };

  // Detail Modal session breakdown display
  const showDetailModal = (record: any, type: 'student' | 'teacher') => {
    setDetailTitle(record.name);
    const startStr = periodDetail?.period?.startDate ? dayjs(periodDetail.period.startDate).format('DD/MM/YYYY') : '—';
    const endStr = periodDetail?.period?.endDate ? dayjs(periodDetail.period.endDate).format('DD/MM/YYYY') : '—';
    setDetailPeriodText(`Kỳ thanh toán: từ ${startStr} đến ${endStr}`);
    setDetailItems(record.items || []);
    setDetailType(type);
    setDetailVisible(true);
  };

  const exportCSV = (data: any[], filename: string, headers: string[], keys: string[]) => {
    const rows = [headers.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = { border: 'none', background: 'rgba(17, 24, 39, 0.75)' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <CalculatorOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: 'Outfit', color: '#fff' }}>Kế Toán</Title>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              Tạo và quản lý các đợt thu học phí học viên và trả lương giáo viên
            </Text>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => {
          setActiveTab(k);
          if (k === 'periods') {
            setSelectedPeriodId(null);
            setPeriodDetail(null);
          }
        }}
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
        items={[
          {
            key: 'periods',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><FileTextOutlined /> Quản lý Đợt thanh toán</span>,
            children: (
              <div>
                {!selectedPeriodId ? (
                  // ================= PERIOD MASTER LIST VIEW =================
                  <div>
                    <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
                      <Space size="middle" wrap align="center">
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            createForm.resetFields();
                            setIsCreateVisible(true);
                          }}
                          size="large"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', padding: '0 24px' }}
                        >
                          Tạo đợt thanh toán mới
                        </Button>
                        <Button
                          icon={<SearchOutlined />}
                          onClick={loadPeriods}
                          loading={periodsLoading}
                          size="large"
                          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff' }}
                        >
                          Làm mới
                        </Button>
                      </Space>
                    </Card>

                    <Card
                      className="glass-panel"
                      style={cardStyle}
                      title={<span style={{ fontFamily: 'Outfit', color: '#fff' }}>Danh sách các đợt thanh toán</span>}
                    >
                      <Table
                        dataSource={periods}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        loading={periodsLoading}
                        size="middle"
                        scroll={{ x: 'max-content' }}
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
                            title: 'Khoảng thời gian',
                            key: 'range',
                            width: 200,
                            render: (_, r: any) => {
                              const start = dayjs(r.startDate).format('DD/MM/YYYY');
                              const end = dayjs(r.endDate).format('DD/MM/YYYY');
                              return <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{start} - {end}</Text>;
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
                            title: 'Đã thu/chi',
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
                            title: 'Đơn hàng (Đã thanh toán)',
                            key: 'ordersProgress',
                            align: 'center' as const,
                            render: (_, r: any) => (
                              <Text style={{ color: '#fff' }}>
                                <Text style={{ color: '#10b981', fontWeight: 600 }}>{r.paidOrders}</Text> / {r.totalOrders}
                              </Text>
                            )
                          },
                          {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            width: 120,
                            render: (v: string) => (
                              <Tag color={v === 'Active' ? 'green' : 'default'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {v === 'Active' ? <UnlockOutlined /> : <LockOutlined />} {v === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                              </Tag>
                            )
                          },
                          {
                            title: 'Thao tác',
                            key: 'action',
                            width: 220,
                            align: 'center' as const,
                            render: (_, r: any) => (
                              <Space size="small">
                                <Button
                                  type="link"
                                  onClick={() => setSelectedPeriodId(r.id)}
                                  style={{ color: '#38bdf8' }}
                                >
                                  Chi tiết
                                </Button>
                                <Button
                                  type="link"
                                  onClick={() => handleTogglePeriodStatus(r)}
                                  style={{ color: r.status === 'Active' ? '#f59e0b' : '#10b981' }}
                                >
                                  {r.status === 'Active' ? 'Khóa' : 'Mở khóa'}
                                </Button>
                                <Popconfirm
                                  title="Xóa đợt thanh toán?"
                                  description="Xóa đợt này sẽ xóa toàn bộ hóa đơn/lương của đợt đó và giải phóng các buổi học về trạng thái chờ tính. Không thể hoàn tác!"
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
                  </div>
                ) : (
                  // ================= PERIOD DETAILED VIEW =================
                  <div>
                    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => {
                          setSelectedPeriodId(null);
                          setPeriodDetail(null);
                        }}
                        style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff' }}
                      >
                        Quay lại danh sách đợt
                      </Button>
                      <Space>
                        {periodDetail?.period && (
                          <>
                            <Tag color={periodDetail.period.status === 'Active' ? 'green' : 'default'} style={{ padding: '4px 12px', fontSize: 13 }}>
                              {periodDetail.period.status === 'Active' ? 'Đang hoạt động' : 'Đã khóa (Closed)'}
                            </Tag>
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
                          {/* Summary stats */}
                          <Row gutter={16} style={{ marginBottom: 20 }}>
                            <Col xs={12} md={6}>
                              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                                  {periodDetail.period.type === 'tuition' ? 'Tổng số học viên' : 'Tổng số giáo viên'}
                                </div>
                                <div style={{ color: '#6366f1', fontSize: 24, fontWeight: 700 }}>
                                  {periodDetail.orders.length}
                                </div>
                              </Card>
                            </Col>
                            <Col xs={12} md={6}>
                              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng tiền trong kỳ</div>
                                <div style={{ color: '#38bdf8', fontSize: 20, fontWeight: 700 }}>
                                  {periodDetail.orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0).toLocaleString('vi-VN')}&nbsp;₫
                                </div>
                              </Card>
                            </Col>
                            <Col xs={12} md={6}>
                              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                                  {periodDetail.period.type === 'tuition' ? 'Đã thu tiền' : 'Đã chi trả'}
                                </div>
                                <div style={{ color: '#10b981', fontSize: 20, fontWeight: 700 }}>
                                  {periodDetail.orders.reduce((sum: number, o: any) => sum + o.paidAmount, 0).toLocaleString('vi-VN')}&nbsp;₫
                                </div>
                              </Card>
                            </Col>
                            <Col xs={12} md={6}>
                              <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                                  {periodDetail.period.type === 'tuition' ? 'Còn nợ' : 'Chưa trả'}
                                </div>
                                <div style={{ color: '#f87171', fontSize: 20, fontWeight: 700 }}>
                                  {periodDetail.orders.reduce((sum: number, o: any) => sum + Math.max(0, o.totalAmount - o.paidAmount), 0).toLocaleString('vi-VN')}&nbsp;₫
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
                                  (Kỳ tính: {dayjs(periodDetail.period.startDate).format('DD/MM/YYYY')} - {dayjs(periodDetail.period.endDate).format('DD/MM/YYYY')})
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
                                  { value: 'Paid', label: 'Đã thanh toán' },
                                  { value: 'Unpaid', label: 'Chưa thanh toán' },
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
                                  width: 250,
                                  align: 'center' as const,
                                  render: (_, r: any) => {
                                    const isClosed = periodDetail.period.status === 'Closed';
                                    return (
                                      <Space size="small">
                                        <Button
                                          type="link"
                                          size="small"
                                          onClick={() => showDetailModal(r, periodDetail.period.type)}
                                          style={{ color: '#38bdf8' }}
                                        >
                                          Chi tiết
                                        </Button>
                                        {!isClosed && (
                                          <>
                                            {r.status === 'Paid' ? (
                                              <Popconfirm
                                                title="Hủy thanh toán?"
                                                description="Bạn có muốn chuyển lại đơn hàng này về trạng thái chưa thanh toán?"
                                                onConfirm={() => handleRevertPayment(r, periodDetail.period.type)}
                                                okText="Có, hủy"
                                                cancelText="Không"
                                                okButtonProps={{ danger: true }}
                                              >
                                                <Button type="link" danger size="small" style={{ padding: 0 }}>Hủy xác nhận</Button>
                                              </Popconfirm>
                                            ) : (
                                              <>
                                                <Popconfirm
                                                  title="Xác nhận thanh toán?"
                                                  description={`Xác nhận đã giao dịch đủ ${r.totalAmount.toLocaleString('vi-VN')} ₫?`}
                                                  onConfirm={() => handleConfirmFullPayment(r, periodDetail.period.type)}
                                                  okText="Đồng ý"
                                                  cancelText="Hủy"
                                                >
                                                  <Button
                                                    type="primary"
                                                    size="small"
                                                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 4 }}
                                                  >
                                                    Xác nhận đủ
                                                  </Button>
                                                </Popconfirm>
                                                <Button
                                                  type="link"
                                                  size="small"
                                                  onClick={() => openEditPayment(r)}
                                                  style={{ color: '#f59e0b', padding: 0 }}
                                                >
                                                  Cập nhật
                                                </Button>
                                              </>
                                            )}
                                            <Popconfirm
                                              title="Loại bỏ đơn hàng?"
                                              description="Đơn hàng sẽ bị xóa khỏi đợt này và các buổi học sẽ trở về trạng thái chờ tính cho đợt sau. Bạn có chắc?"
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
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'tuition-report',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Báo cáo học phí (Khoảng ngày)</span>,
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
                      Tính học phí tất cả
                    </Button>
                    {tuitionData && (
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => exportCSV(
                          tuitionData.students,
                          `hoc-phi-${tuitionRange[0]?.format('YYYYMMDD')}-${tuitionRange[1]?.format('YYYYMMDD')}.csv`,
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
                  <>
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng số học sinh</div>
                          <div style={{ color: '#6366f1', fontSize: 28, fontWeight: 700 }}>{tuitionData.students?.length || 0}</div>
                        </Card>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>HS có buổi tính tiền</div>
                          <div style={{ color: '#10b981', fontSize: 28, fontWeight: 700 }}>
                            {(tuitionData.students || []).filter((s: any) => s.totalSessions > 0).length}
                          </div>
                        </Card>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng học phí kỳ này</div>
                          <div style={{ color: '#f59e0b', fontSize: 22, fontWeight: 700 }}>
                            {(tuitionData.grandTotal || 0).toLocaleString('vi-VN')}&nbsp;₫
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
                          <span style={{ fontFamily: 'Outfit', color: '#fff' }}>
                            Chi tiết học phí — Kỳ {tuitionRange[0]?.format('DD/MM/YYYY')} đến {tuitionRange[1]?.format('DD/MM/YYYY')}
                          </span>
                        </Space>
                      }
                    >
                      <Table
                        dataSource={tuitionData.students || []}
                        rowKey="studentId"
                        pagination={{ pageSize: 15 }}
                        size="small"
                        rowClassName={(r: any) => r.totalAmount > 0 ? '' : 'ant-table-row-muted'}
                        scroll={{ x: 'max-content' }}
                        columns={[
                          {
                            title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 100,
                            render: (v: string) => <Text style={{ color: '#818cf8', fontWeight: 600 }}>{v}</Text>,
                          },
                          {
                            title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220,
                            render: (v: string, r: any) => (
                              <div>
                                <Text style={{ color: '#fff' }}>{v}</Text>
                                {r.nickName && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>({r.nickName})</div>}
                              </div>
                            ),
                          },
                          { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</Text> },
                          {
                            title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
                            render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag>,
                          },
                          {
                            title: 'Buổi có mặt', dataIndex: 'totalSessions', key: 'totalSessions', width: 120, align: 'center' as const,
                            sorter: (a: any, b: any) => a.totalSessions - b.totalSessions,
                            render: (v: number) => <Text style={{ color: v > 0 ? '#10b981' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{v}</Text>,
                          },
                          {
                            title: 'Tổng học phí', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right' as const,
                            sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
                            defaultSortOrder: 'descend' as const,
                            render: (v: number) => (
                              <Text strong style={{ color: v > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontSize: v > 0 ? 14 : 12 }}>
                                {v > 0 ? `${v.toLocaleString('vi-VN')} ₫` : '—'}
                              </Text>
                            ),
                          },
                        ]}
                        summary={() => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5}>
                              <Text strong style={{ color: '#fff' }}>Tổng cộng</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text strong style={{ color: '#f59e0b', fontSize: 16 }}>
                                {(tuitionData.grandTotal || 0).toLocaleString('vi-VN')}&nbsp;₫
                              </Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        )}
                      />
                    </Card>
                  </>
                )}

                {!tuitionData && !tuitionLoading && (
                  <Alert
                    type="info" showIcon
                    message="Hướng dẫn sử dụng"
                    description="Chọn khoảng ngày và bấm 'Tính học phí tất cả'. Công cụ này dùng để tính toán báo cáo nhanh học phí cho toàn bộ học sinh tại các lớp học trong khoảng thời gian đã chọn mà không lưu vào cơ sở dữ liệu."
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                  />
                )}
              </div>
            ),
          },
          {
            key: 'wages-report',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Báo cáo lương GV (Khoảng ngày)</span>,
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
                      Tính lương tất cả
                    </Button>
                    {wagesData && (
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => exportCSV(
                          wagesData.teachers,
                          `luong-gv-${wagesRange[0]?.format('YYYYMMDD')}-${wagesRange[1]?.format('YYYYMMDD')}.csv`,
                          ['Mã GV', 'Họ tên', 'SĐT', 'Loại', 'Trạng thái', 'Số buổi dạy', 'Tổng lương (₫)'],
                          ['teacherCode', 'name', 'mobile', 'type', 'status', 'totalSessions', 'totalAmount']
                        )}
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                      >
                        Xuất CSV
                      </Button>
                    )}
                  </Space>
                </Card>

                {wagesData && (
                  <>
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng số giáo viên</div>
                          <div style={{ color: '#6366f1', fontSize: 28, fontWeight: 700 }}>{wagesData.teachers?.length || 0}</div>
                        </Card>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>GV có buổi dạy</div>
                          <div style={{ color: '#10b981', fontSize: 28, fontWeight: 700 }}>
                            {(wagesData.teachers || []).filter((t: any) => t.totalSessions > 0).length}
                          </div>
                        </Card>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng lương kỳ này</div>
                          <div style={{ color: '#f59e0b', fontSize: 22, fontWeight: 700 }}>
                            {(wagesData.grandTotal || 0).toLocaleString('vi-VN')}&nbsp;₫
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
                          <span style={{ fontFamily: 'Outfit', color: '#fff' }}>
                            Chi tiết lương — Kỳ {wagesRange[0]?.format('DD/MM/YYYY')} đến {wagesRange[1]?.format('DD/MM/YYYY')}
                          </span>
                        </Space>
                      }
                    >
                      <Table
                        dataSource={wagesData.teachers || []}
                        rowKey="teacherId"
                        pagination={{ pageSize: 15 }}
                        size="small"
                        scroll={{ x: 'max-content' }}
                        columns={[
                          {
                            title: 'Mã GV', dataIndex: 'teacherCode', key: 'teacherCode', width: 100,
                            render: (v: string) => <Text style={{ color: '#818cf8', fontWeight: 600 }}>{v}</Text>,
                          },
                          { title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220, render: (v: string) => <Text style={{ color: '#fff' }}>{v}</Text> },
                          { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</Text> },
                          {
                            title: 'Loại', dataIndex: 'type', key: 'type', width: 110,
                            render: (v: string) => <Tag color={v === 'Teacher' ? 'blue' : 'cyan'}>{v === 'Teacher' ? 'Giáo viên' : 'Trợ giảng'}</Tag>,
                          },
                          {
                            title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
                            render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag>,
                          },
                          {
                            title: 'Số buổi dạy', dataIndex: 'totalSessions', key: 'totalSessions', width: 120, align: 'center' as const,
                            sorter: (a: any, b: any) => a.totalSessions - b.totalSessions,
                            render: (v: number) => <Text style={{ color: v > 0 ? '#10b981' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{v}</Text>,
                          },
                          {
                            title: 'Tổng lương', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right' as const,
                            sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
                            defaultSortOrder: 'descend' as const,
                            render: (v: number) => (
                              <Text strong style={{ color: v > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontSize: v > 0 ? 14 : 12 }}>
                                {v > 0 ? `${v.toLocaleString('vi-VN')} ₫` : '—'}
                              </Text>
                            ),
                          },
                        ]}
                        summary={() => (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={6}>
                              <Text strong style={{ color: '#fff' }}>Tổng cộng</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text strong style={{ color: '#f59e0b', fontSize: 16 }}>
                                {(wagesData.grandTotal || 0).toLocaleString('vi-VN')}&nbsp;₫
                              </Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        )}
                      />
                    </Card>
                  </>
                )}

                {!wagesData && !wagesLoading && (
                  <Alert
                    type="info" showIcon
                    message="Hướng dẫn sử dụng"
                    description="Chọn khoảng ngày và bấm 'Tính lương tất cả'. Hệ thống sẽ tự động tính toán báo cáo nhanh tiền lương giáo viên dựa trên số buổi đã dạy và mức lương hiệu lực mà không lưu vào cơ sở dữ liệu."
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                  />
                )}
              </div>
            )
          }
        ]}
      />

      {/* Detailed Breakdown Modal */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontFamily: 'Outfit' }}>
            {detailType === 'student' ? 'Chi Tiết Học Phí Đơn Hàng' : 'Chi Tiết Lương Giáo Viên'} — {detailTitle}
          </div>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>
        ]}
        width={750}
        styles={{
          body: { background: '#111827', color: '#fff' }
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            {detailPeriodText}
          </Text>
        </div>
        <Table
          dataSource={detailItems}
          rowKey={(r, index) => r.classId || String(index)}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Lớp học',
              key: 'classInfo',
              render: (_, item) => (
                <div>
                  <Text style={{ color: '#fff', fontWeight: 600 }}>{item.className}</Text>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {item.courseName} - {item.levelName}
                  </div>
                </div>
              )
            },
            {
              title: detailType === 'student' ? 'Số buổi học tính tiền' : 'Số buổi dạy',
              dataIndex: 'sessionsCount',
              key: 'sessionsCount',
              align: 'center',
              render: (v) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v}</Text>
            },
            {
              title: 'Đơn giá ca',
              dataIndex: 'rate',
              key: 'rate',
              align: 'right',
              render: (v) => <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{Number(v).toLocaleString('vi-VN')} ₫</Text>
            },
            {
              title: 'Thành tiền',
              dataIndex: 'totalAmount',
              key: 'totalAmount',
              align: 'right',
              render: (v) => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{Number(v).toLocaleString('vi-VN')} ₫</Text>
            }
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <Text strong style={{ color: '#fff' }}>Tổng cộng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ color: '#f59e0b', fontSize: 15 }}>
                  {detailItems.reduce((sum, item) => sum + Number(item.totalAmount), 0).toLocaleString('vi-VN')} ₫
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Modal>

      {/* Create Period Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 18 }}>Tạo đợt thanh toán mới</span>}
        open={isCreateVisible}
        onOk={handleCreatePeriod}
        onCancel={() => {
          setIsCreateVisible(false);
          setPreviewData([]);
          setSelectedRowKeys([]);
          setPreviewSearch('');
        }}
        okText="Bắt đầu tạo & chốt"
        cancelText="Hủy"
        width={750}
      >
        <Form form={createForm} layout="vertical" initialValues={{ type: 'tuition' }} style={{ padding: '10px 0' }}>
          <Form.Item name="type" label="Loại đợt thanh toán" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="tuition">Thu học phí học sinh</Select.Option>
              <Select.Option value="salary">Chi trả lương giáo viên</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="month" label="Tháng áp dụng" rules={[{ required: true }]}>
                <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateRange" label="Khoảng ngày tính buổi học/dạy" rules={[{ required: true }]}>
                <DatePicker.RangePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="name" label="Tên đợt thanh toán" rules={[{ required: true, message: 'Nhập tên đợt thanh toán' }]}>
            <Input placeholder="Nhập tên đợt" />
          </Form.Item>
        </Form>

        {/* Dynamic Candidates Preview Section */}
        {previewData.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong style={{ color: '#fff', fontSize: 13 }}>
                Danh sách {formType === 'tuition' ? 'học sinh' : 'giáo viên'} tạm tính (Chọn đối tượng thu/chi)
              </Text>
              <Input
                placeholder="Tìm theo tên hoặc mã..."
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                style={{ width: 220 }}
                size="small"
                allowClear
              />
            </div>
            <Table
              dataSource={filteredPreviewData}
              rowKey={formType === 'tuition' ? 'studentId' : 'teacherId'}
              pagination={{ pageSize: 5, showSizeChanger: false, size: 'small' }}
              size="small"
              loading={previewLoading}
              scroll={{ y: 180 }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              columns={[
                {
                  title: 'Mã',
                  dataIndex: formType === 'tuition' ? 'studentCode' : 'teacherCode',
                  key: 'code',
                  width: 100,
                  render: (v) => <Text style={{ color: '#818cf8', fontWeight: 600 }}>{v}</Text>,
                },
                {
                  title: 'Họ tên',
                  dataIndex: 'name',
                  key: 'name',
                  render: (v) => <Text style={{ color: '#fff' }}>{v}</Text>,
                },
                {
                  title: 'Số buổi',
                  dataIndex: 'totalSessions',
                  key: 'totalSessions',
                  align: 'center',
                  width: 90,
                  render: (v) => <Text style={{ fontWeight: 600 }}>{v}</Text>,
                },
                {
                  title: 'Số tiền tạm tính',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  align: 'right',
                  width: 140,
                  render: (v) => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{Number(v).toLocaleString('vi-VN')} ₫</Text>,
                },
              ]}
              summary={() => {
                const selectedItems = filteredPreviewData.filter((item) =>
                  selectedRowKeys.includes(formType === 'tuition' ? item.studentId : item.teacherId)
                );
                const total = selectedItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Đã chọn: {selectedRowKeys.length} / {previewData.length} đối tượng
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong style={{ color: '#f59e0b', fontSize: 13 }}>
                        {total.toLocaleString('vi-VN')} ₫
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        )}

        {previewData.length === 0 && formDateRange && formDateRange.length >= 2 && !previewLoading && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '20px 0', fontSize: 12 }}>
            Không tìm thấy buổi học/dạy nào chưa tính tiền trong khoảng thời gian đã chọn.
          </div>
        )}
      </Modal>

      {/* Edit Order Payment Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 17 }}>Cập nhật thông tin giao dịch</span>}
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
                    <Form.Item name="paidAmount" label="Số tiền thực tế đóng/trả" rules={[{ required: true, message: 'Nhập số tiền thực tế' }]}>
                      <InputNumber
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(v) => v!.replace(/\$\s?|(, *)/g, '')}
                        style={{ width: '100%' }}
                        addonAfter="₫"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="paymentDate" label="Ngày giao dịch thực tế" rules={[{ required: true }]}>
                      <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              );
            }}
          </Form.Item>

          <Form.Item name="note" label="Ghi chú giao dịch">
            <Input.TextArea placeholder="Nhập ghi chú giao dịch, thông tin chuyển khoản..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
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
