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
  UnlockOutlined, DeleteOutlined, FileTextOutlined,
  DollarOutlined, CalendarOutlined, CheckSquareOutlined
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
  const [activeTab, setActiveTab] = useState('tuition-create');

  // Periods list state
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);

  // Period detail state
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periodDetail, setPeriodDetail] = useState<any>(null);
  const [periodDetailLoading, setPeriodDetailLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Preview / Create state (Tuition)
  const [tuitionEndDate, setTuitionEndDate] = useState<any>(dayjs());
  const [tuitionMonth, setTuitionMonth] = useState<any>(dayjs());
  const [tuitionPreviewData, setTuitionPreviewData] = useState<any[]>([]);
  const [tuitionPreviewLoading, setTuitionPreviewLoading] = useState(false);
  const [tuitionSelectedRowKeys, setTuitionSelectedRowKeys] = useState<React.Key[]>([]);
  const [tuitionPreviewSearch, setTuitionPreviewSearch] = useState('');
  const [isTuitionModalVisible, setIsTuitionModalVisible] = useState(false);
  const [tuitionPeriodName, setTuitionPeriodName] = useState('');

  // Preview / Create state (Salary)
  const [salaryEndDate, setSalaryEndDate] = useState<any>(dayjs());
  const [salaryMonth, setSalaryMonth] = useState<any>(dayjs());
  const [salaryPreviewData, setSalaryPreviewData] = useState<any[]>([]);
  const [salaryPreviewLoading, setSalaryPreviewLoading] = useState(false);
  const [salarySelectedRowKeys, setSalarySelectedRowKeys] = useState<React.Key[]>([]);
  const [salaryPreviewSearch, setSalaryPreviewSearch] = useState('');
  const [isSalaryModalVisible, setIsSalaryModalVisible] = useState(false);
  const [salaryPeriodName, setSalaryPeriodName] = useState('');

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

  // Ad-hoc states
  const [tuitionRange, setTuitionRange] = useState<[any, any]>([null, null]);
  const [tuitionData, setTuitionData] = useState<any>(null);
  const [tuitionLoading, setTuitionLoading] = useState(false);

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

  // -- ACTION: Tuition Preview --
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

  // -- ACTION: Create Tuition Period --
  const handleCreateTuitionPeriod = async () => {
    if (!tuitionPeriodName.trim()) {
      message.error('Vui lòng nhập tên đợt thu');
      return;
    }
    try {
      await api.post('/payment-periods', {
        name: tuitionPeriodName,
        type: 'tuition',
        month: tuitionMonth.format('YYYY-MM'),
        startDate: '2000-01-01', // Dummy
        endDate: tuitionEndDate.format('YYYY-MM-DD'),
        studentIds: tuitionSelectedRowKeys
      });
      message.success('Đã tạo đợt thu học phí thành công!');
      setIsTuitionModalVisible(false);
      setTuitionPreviewData([]);
      setTuitionSelectedRowKeys([]);
      setActiveTab('periods');
      setSelectedPeriodId(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo đợt thanh toán');
    }
  };

  // -- ACTION: Salary Preview --
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

  // -- ACTION: Create Salary Period --
  const handleCreateSalaryPeriod = async () => {
    if (!salaryPeriodName.trim()) {
      message.error('Vui lòng nhập tên đợt chi trả');
      return;
    }
    try {
      await api.post('/payment-periods', {
        name: salaryPeriodName,
        type: 'salary',
        month: salaryMonth.format('YYYY-MM'),
        startDate: '2000-01-01', // Dummy
        endDate: salaryEndDate.format('YYYY-MM-DD'),
        teacherIds: salarySelectedRowKeys
      });
      message.success('Đã tạo đợt chi trả lương thành công!');
      setIsSalaryModalVisible(false);
      setSalaryPreviewData([]);
      setSalarySelectedRowKeys([]);
      setActiveTab('periods');
      setSelectedPeriodId(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo đợt thanh toán');
    }
  };

  // -- History Actions --
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
      message.success('Đã xóa đợt thanh toán thành công!');
      if (selectedPeriodId === id) {
        setSelectedPeriodId(null);
        setPeriodDetail(null);
      } else loadPeriods();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa đợt thanh toán');
    }
  };

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

  const handleRemoveOrder = async (orderId: string, type: 'tuition' | 'salary') => {
    try {
      await api.delete(`/payment-periods/orders/${type}/${orderId}`);
      message.success('Đã loại bỏ đơn hàng khỏi đợt và giải phóng các buổi học!');
      if (selectedPeriodId) loadPeriodDetail(selectedPeriodId);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi loại bỏ đơn hàng');
    }
  };

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

  // -- Ad-hoc Calculators --
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

  const showDetailModal = (record: any, type: 'student' | 'teacher') => {
    setDetailTitle(record.name);
    setDetailPeriodText('Kỳ tính sổ');
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

  const filteredTuition = tuitionPreviewData.filter(item => {
    const query = tuitionPreviewSearch.toLowerCase().trim();
    if (!query) return true;
    return (item.studentCode || '').toLowerCase().includes(query) || (item.name || '').toLowerCase().includes(query);
  });

  const filteredSalary = salaryPreviewData.filter(item => {
    const query = salaryPreviewSearch.toLowerCase().trim();
    if (!query) return true;
    return (item.teacherCode || '').toLowerCase().includes(query) || (item.name || '').toLowerCase().includes(query);
  });

  const cardStyle = { border: 'none', background: 'rgba(17, 24, 39, 0.75)' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
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
              Tính học phí và lương hàng loạt cho toàn bộ học sinh / giáo viên
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
            key: 'tuition-create',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Thu học phí tháng</span>,
            children: (
              <div>
                <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
                  <Space size="middle" wrap align="center">
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.55)', marginRight: 10, fontSize: 13 }}>Tháng áp dụng:</Text>
                      <DatePicker
                        picker="month"
                        value={tuitionMonth}
                        onChange={(v) => setTuitionMonth(v)}
                        format="MM/YYYY"
                        style={{ width: 140 }}
                      />
                    </div>
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.55)', marginRight: 10, fontSize: 13 }}>Ngày chốt sổ:</Text>
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
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng học sinh</div>
                          <div style={{ color: '#6366f1', fontSize: 24, fontWeight: 700 }}>{tuitionPreviewData.length}</div>
                        </Card>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tổng học phí dự kiến thu</div>
                          <div style={{ color: '#38bdf8', fontSize: 20, fontWeight: 700 }}>
                            {tuitionPreviewData.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString('vi-VN')} ₫
                          </div>
                        </Card>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card className="glass-panel" style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Học sinh đã chọn tạo đợt</div>
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
                          <span style={{ fontFamily: 'Outfit', color: '#fff' }}>Học phí tháng</span>
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
                              onClick={() => {
                                setTuitionPeriodName(`Đợt thu học phí Tháng ${tuitionMonth.format('MM/YYYY')}`);
                                setIsTuitionModalVisible(true);
                              }}
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
                                <Text style={{ color: '#fff' }}>{v}</Text>
                                {r.nickName && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>({r.nickName})</div>}
                              </div>
                            ),
                          },
                          { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</Text> },
                          { title: 'Trạng thái học', dataIndex: 'status', key: 'status', width: 130, render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag> },
                          { title: 'Số buổi', dataIndex: 'totalSessions', key: 'totalSessions', width: 100, align: 'center', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v}</Text> },
                          { title: 'Số tiền cần thu', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right', render: (v: number) => <Text strong style={{ color: '#f59e0b', fontSize: 14 }}>{v.toLocaleString('vi-VN')} ₫</Text> },
                        ]}
                      />
                    </Card>
                  </>
                )}
              </div>
            )
          },
          {
            key: 'salary-create',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Chi trả lương tháng</span>,
            children: (
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
                          ['Mã GV', 'Họ tên', 'SĐT', 'Loại', 'Tổng lương (₫)'],
                          ['teacherCode', 'name', 'mobile', 'type', 'totalAmount']
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
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>GV đã chọn tạo đợt</div>
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
                          <span style={{ fontFamily: 'Outfit', color: '#fff' }}>Lương tháng</span>
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
                              onClick={() => {
                                setSalaryPeriodName(`Đợt trả lương Tháng ${salaryMonth.format('MM/YYYY')}`);
                                setIsSalaryModalVisible(true);
                              }}
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
                          { title: 'Họ tên', dataIndex: 'name', key: 'name', width: 220, render: (v: string) => <Text style={{ color: '#fff' }}>{v}</Text> },
                          { title: 'SĐT', dataIndex: 'mobile', key: 'mobile', width: 130, render: (v: string) => <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</Text> },
                          { title: 'Loại', dataIndex: 'type', key: 'type', width: 110, render: (v: string) => <Tag color={v === 'Teacher' ? 'blue' : 'cyan'}>{v === 'Teacher' ? 'Giáo viên' : 'Trợ giảng'}</Tag> },
                          { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130, render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag> },
                          { title: 'Số buổi', dataIndex: 'totalSessions', key: 'totalSessions', width: 100, align: 'center', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v}</Text> },
                          { title: 'Số tiền cần chi', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right', render: (v: number) => <Text strong style={{ color: '#f59e0b', fontSize: 14 }}>{v.toLocaleString('vi-VN')} ₫</Text> },
                        ]}
                      />
                    </Card>
                  </>
                )}
              </div>
            )
          },
          {
            key: 'periods',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><FileTextOutlined /> Lịch sử Đợt thanh toán</span>,
            children: (
              <div>
                {!selectedPeriodId ? (
                  <div>
                    <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
                      <Space size="middle" wrap align="center">
                        <Button
                          icon={<SearchOutlined />}
                          onClick={loadPeriods}
                          loading={periodsLoading}
                          size="large"
                          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff' }}
                        >
                          Làm mới danh sách
                        </Button>
                      </Space>
                    </Card>

                    <Card
                      className="glass-panel"
                      style={cardStyle}
                      title={<span style={{ fontFamily: 'Outfit', color: '#fff' }}>Danh sách các đợt đã tạo</span>}
                    >
                      <Table
                        dataSource={periods}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        loading={periodsLoading}
                        size="small"
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
                                  description="Xóa đợt này sẽ hủy toàn bộ số liệu của đợt và giải phóng các buổi học về trạng thái chờ tính. Không thể hoàn tác!"
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

      {/* Breakdown Modal */}
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

      {/* Edit Payment Modal */}
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

      {/* Tuition Create Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 17 }}>Xác nhận Tạo Đợt Thu Học Phí</span>}
        open={isTuitionModalVisible}
        onOk={handleCreateTuitionPeriod}
        onCancel={() => setIsTuitionModalVisible(false)}
        okText="Tạo đợt thu"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            Bạn đang tạo đợt thu học phí cho <strong style={{ color: '#10b981' }}>{tuitionSelectedRowKeys.length} học sinh</strong> đã chọn (chốt sổ đến {tuitionEndDate?.format('DD/MM/YYYY')}).
            Tổng số tiền dự kiến là <strong style={{ color: '#f59e0b' }}>
              {tuitionPreviewData.filter((s:any) => tuitionSelectedRowKeys.includes(s.studentId)).reduce((sum:any, s:any) => sum + s.totalAmount, 0).toLocaleString('vi-VN')} ₫
            </strong>.
          </Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 500 }}>Tên đợt thu (có thể sửa):</Text>
        </div>
        <Input 
          value={tuitionPeriodName}
          onChange={e => setTuitionPeriodName(e.target.value)}
          placeholder="Ví dụ: Đợt thu học phí Tháng 06/2026..."
          size="large"
        />
      </Modal>

      {/* Salary Create Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 17 }}>Xác nhận Tạo Đợt Chi Trả Lương</span>}
        open={isSalaryModalVisible}
        onOk={handleCreateSalaryPeriod}
        onCancel={() => setIsSalaryModalVisible(false)}
        okText="Tạo đợt chi trả"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            Bạn đang tạo đợt lương cho <strong style={{ color: '#10b981' }}>{salarySelectedRowKeys.length} giáo viên</strong> đã chọn (chốt sổ đến {salaryEndDate?.format('DD/MM/YYYY')}).
            Tổng số tiền dự kiến là <strong style={{ color: '#f59e0b' }}>
              {salaryPreviewData.filter((t:any) => salarySelectedRowKeys.includes(t.teacherId)).reduce((sum:any, t:any) => sum + t.totalAmount, 0).toLocaleString('vi-VN')} ₫
            </strong>.
          </Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 500 }}>Tên đợt chi trả (có thể sửa):</Text>
        </div>
        <Input 
          value={salaryPeriodName}
          onChange={e => setSalaryPeriodName(e.target.value)}
          placeholder="Ví dụ: Đợt chi trả lương Tháng 06/2026..."
          size="large"
        />
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
