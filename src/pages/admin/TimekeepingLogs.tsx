import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Input,
  DatePicker,
  Button,
  Tabs,
  Modal,
  Form,
  Popconfirm,
  App,
  Descriptions,
  Col,
  Row,
  Select,
} from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  FileTextOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

interface StudentInfo {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

interface MatchedSessionInfo {
  id: string;
  className: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface TimekeepingLog {
  id: string;
  studentId: string;
  employeeNo: string;
  eventTime: string;
  verifyMethod: string;
  rawPayload?: any;
  student?: StudentInfo;
  matchedSessions?: MatchedSessionInfo[];
}

interface TimekeepingDevice {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  username: string;
  status: string;
  lastSyncTime?: string;
}

export default function TimekeepingLogs() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('1');

  // Logs States
  const [logs, setLogs] = useState<TimekeepingLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsSearch, setLogsSearch] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [verifyMethod, setVerifyMethod] = useState<string | undefined>(undefined);
  const [matchStatus, setMatchStatus] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [selectedLog, setSelectedLog] = useState<TimekeepingLog | null>(null);

  // Devices States
  const [devices, setDevices] = useState<TimekeepingDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<TimekeepingDevice | null>(null);
  const [deviceForm] = Form.useForm();

  // 1. Fetch Logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const response = await api.get('/timekeeping/logs', {
        params: {
          page: logsPage,
          limit: 10,
          search: logsSearch.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          verifyMethod: verifyMethod || undefined,
          matchStatus: matchStatus !== 'all' ? matchStatus : undefined,
        },
      });
      setLogs(response.data.logs || []);
      setLogsTotal(response.data.total || 0);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải nhật ký quẹt thẻ.');
    } finally {
      setLogsLoading(false);
    }
  }, [logsPage, logsSearch, startDate, endDate, verifyMethod, matchStatus, message]);

  // 2. Fetch Devices
  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const response = await api.get('/timekeeping/devices');
      setDevices(response.data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách máy chấm công.');
    } finally {
      setDevicesLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (activeTab === '1') {
      fetchLogs();
    } else {
      fetchDevices();
    }
  }, [activeTab, fetchLogs, fetchDevices]);



  // Reset filter logs
  const handleResetFilters = () => {
    setLogsSearch('');
    setStartDate(undefined);
    setEndDate(undefined);
    setVerifyMethod(undefined);
    setMatchStatus('all');
    setLogsPage(1);
  };

  // CRUD Devices
  const handleOpenDeviceModal = (device?: TimekeepingDevice) => {
    if (device) {
      setEditingDevice(device);
      deviceForm.setFieldsValue(device);
    } else {
      setEditingDevice(null);
      deviceForm.resetFields();
    }
    setIsDeviceModalOpen(true);
  };

  const handleSaveDevice = async () => {
    try {
      const values = await deviceForm.validateFields();
      if (editingDevice) {
        await api.put(`/timekeeping/devices/${editingDevice.id}`, values);
        message.success('Cập nhật máy chấm công thành công.');
      } else {
        await api.post('/timekeeping/devices', values);
        message.success('Thêm máy chấm công mới thành công.');
      }
      setIsDeviceModalOpen(false);
      fetchDevices();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể lưu thông tin máy chấm công.');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await api.delete(`/timekeeping/devices/${id}`);
      message.success('Đã xóa máy chấm công khỏi danh sách.');
      fetchDevices();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa máy chấm công thất bại.');
    }
  };

  // Mappings
  const getVerifyTag = (method: string) => {
    switch (method) {
      case 'face':
        return <Tag color="blue">Khuôn mặt</Tag>;
      case 'fingerprint':
        return <Tag color="purple">Vân tay</Tag>;
      case 'card':
        return <Tag color="green">Thẻ từ</Tag>;
      case 'pin':
        return <Tag color="orange">Mã PIN</Tag>;
      default:
        return <Tag>{method}</Tag>;
    }
  };

  // Tables Columns
  const logColumns: ColumnsType<TimekeepingLog> = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_, row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>
            {row.student ? `${row.student.lastName} ${row.student.firstName}` : 'Học sinh chưa đồng bộ'}
          </strong>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
            Mã HS: {row.employeeNo}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian quẹt',
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Xác thực bằng',
      dataIndex: 'verifyMethod',
      key: 'verifyMethod',
      render: (val) => getVerifyTag(val),
    },
    {
      title: 'Ca học đối khớp',
      key: 'matchedSessions',
      render: (_, row) => {
        if (!row.matchedSessions || row.matchedSessions.length === 0) {
          return <Text type="secondary" style={{ fontSize: 11 }}>Không khớp ca học</Text>;
        }
        return (
          <Space direction="vertical" size={2} style={{ display: 'flex' }}>
            {row.matchedSessions.map((s) => (
              <Tag color="cyan" key={s.id} style={{ display: 'inline-block', margin: '2px 0' }}>
                <span style={{ fontWeight: 600 }}>{s.className}</span> ({s.startTime} - {s.endTime})
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Nhật ký gốc (Payload)',
      key: 'actions',
      render: (_, row) => (
        <Button 
          size="small" 
          icon={<FileTextOutlined />} 
          onClick={(e) => { e.stopPropagation(); setSelectedLog(row); }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const deviceColumns: ColumnsType<TimekeepingDevice> = [
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong>,
    },
    {
      title: 'Địa chỉ mạng (IP:Port)',
      key: 'address',
      render: (_, row) => <code>{`${row.ipAddress}:${row.port}`}</code>,
    },
    {
      title: 'Kết nối',
      dataIndex: 'status',
      key: 'status',
      render: (val) => (
        <Tag color={val === 'online' ? 'success' : val === 'offline' ? 'error' : 'default'}>
          {val === 'online' ? 'Hoạt động' : val === 'offline' ? 'Ngoại tuyến' : 'Chờ kết nối'}
        </Tag>
      ),
    },
    {
      title: 'Đồng bộ lần cuối',
      dataIndex: 'lastSyncTime',
      key: 'lastSyncTime',
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY HH:mm:ss') : <Text type="secondary">Chưa thực hiện</Text>,
    },
    {
      title: 'Thao tác',
      key: 'operations',
      width: 90,
      render: (_, row) => (
        <Space size="small">
          <Button 
            size="small" 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenDeviceModal(row)} 
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa máy chấm công này?"
            onConfirm={() => handleDeleteDevice(row.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              size="small" 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <Space>
          <ApiOutlined style={{ color: 'var(--primary)', fontSize: 24 }} />
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>Máy chấm công</Title>
        </Space>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Quản lý thiết bị chấm công sinh trắc học, nhật ký quẹt thẻ thô của học sinh và cấu hình webhook tự động.
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: (
              <span>
                <HistoryOutlined />
                Nhật ký quẹt thẻ
              </span>
            ),
            children: (
              <>
                <Card 
                  className="glass-panel" 
                  style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 16 }}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} md={6}>
                      <Input
                        placeholder="Tìm theo Mã HS, Họ và tên..."
                        prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
                        value={logsSearch}
                        onChange={(e) => setLogsSearch(e.target.value)}
                        onPressEnter={fetchLogs}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <DatePicker.RangePicker
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ width: '100%' }}
                        value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
                        onChange={(dates) => {
                          if (dates && dates[0] && dates[1]) {
                            setStartDate(dates[0].format('YYYY-MM-DD'));
                            setEndDate(dates[1].format('YYYY-MM-DD'));
                          } else {
                            setStartDate(undefined);
                            setEndDate(undefined);
                          }
                          setLogsPage(1);
                        }}
                        format="DD/MM/YYYY"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Select
                        placeholder="Hình thức quét"
                        style={{ width: '100%' }}
                        value={verifyMethod}
                        onChange={(val) => {
                          setVerifyMethod(val);
                          setLogsPage(1);
                        }}
                        allowClear
                      >
                        <Select.Option value="face">Khuôn mặt</Select.Option>
                        <Select.Option value="fingerprint">Vân tay</Select.Option>
                        <Select.Option value="card">Thẻ từ</Select.Option>
                        <Select.Option value="pin">Mật khẩu PIN</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={12} md={4}>
                      <Select
                        placeholder="Trạng thái khớp"
                        style={{ width: '100%' }}
                        value={matchStatus}
                        onChange={(val) => {
                          setMatchStatus(val);
                          setLogsPage(1);
                        }}
                      >
                        <Select.Option value="all">Tất cả trạng thái</Select.Option>
                        <Select.Option value="matched">Đã khớp học sinh</Select.Option>
                        <Select.Option value="unmatched">Chưa khớp học sinh</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} md={4} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
                        Reset
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<SearchOutlined />} 
                        onClick={fetchLogs}
                        style={{ background: 'var(--primary)', border: 'none' }}
                      >
                        Lọc
                      </Button>
                    </Col>
                  </Row>

                </Card>

                <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
                  <Table
                    rowKey="id"
                    loading={logsLoading}
                    dataSource={logs}
                    columns={logColumns}
                    pagination={{
                      current: logsPage,
                      pageSize: 10,
                      total: logsTotal,
                      showSizeChanger: false,
                      onChange: setLogsPage,
                    }}
                    scroll={{ x: 800 }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: '2',
            label: (
              <span>
                <SettingOutlined />
                Thiết bị kết nối
              </span>
            ),
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => handleOpenDeviceModal()}
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                  >
                    Thêm thiết bị
                  </Button>
                </div>

                <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
                  <Table
                    rowKey="id"
                    loading={devicesLoading}
                    dataSource={devices}
                    columns={deviceColumns}
                    pagination={false}
                    scroll={{ x: 800 }}
                  />
                </Card>
              </>
            ),
          }
        ]}
      />

      {/* Log Detail Modal */}
      <Modal
        title={<Space><FileTextOutlined style={{ color: 'var(--primary)' }} /><span>Chi tiết Payload sự kiện quẹt thẻ</span></Space>}
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={680}
        destroyOnClose
      >
        {selectedLog && (
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Học sinh">
                <Text strong>
                  {selectedLog.student ? `${selectedLog.student.lastName} ${selectedLog.student.firstName}` : 'Chưa đồng bộ'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã số đăng ký (Employee No)">
                <code>{selectedLog.employeeNo}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian thực tế">
                {dayjs(selectedLog.eventTime).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức xác thực">
                {getVerifyTag(selectedLog.verifyMethod)}
              </Descriptions.Item>
            </Descriptions>

            {selectedLog.rawPayload && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Nội dung JSON nhận từ thiết bị (Raw Event Data):
                </div>
                <pre style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 11,
                  overflowX: 'auto',
                  border: '1px solid var(--card-border)',
                }}>
                  {JSON.stringify(selectedLog.rawPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create / Edit Device Modal */}
      <Modal
        title={editingDevice ? 'Cập nhật thiết bị chấm công' : 'Thêm máy chấm công mới'}
        open={isDeviceModalOpen}
        onCancel={() => setIsDeviceModalOpen(false)}
        onOk={handleSaveDevice}
        destroyOnClose
      >
        <Form 
          form={deviceForm} 
          layout="vertical"
          style={{ marginTop: 12 }}
          initialValues={{ port: 80, username: 'admin' }}
        >
          <Form.Item
            name="name"
            label="Tên thiết bị"
            rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}
          >
            <Input placeholder="Ví dụ: Máy cổng chính, Camera lớp A..." />
          </Form.Item>
          
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item
                name="ipAddress"
                label="Địa chỉ IP"
                rules={[{ required: true, message: 'Vui lòng nhập IP thiết bị' }]}
              >
                <Input placeholder="Ví dụ: 192.168.22.123" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="port"
                label="Cổng kết nối"
                rules={[{ required: true, message: 'Nhập cổng' }]}
              >
                <Input type="number" placeholder="80" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tài khoản đăng nhập"
                rules={[{ required: true, message: 'Nhập tài khoản' }]}
              >
                <Input placeholder="admin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu thiết bị"
                rules={[{ required: true, message: 'Nhập mật khẩu' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu máy chấm công" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
