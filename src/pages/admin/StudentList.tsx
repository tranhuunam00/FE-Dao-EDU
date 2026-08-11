import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  App,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
} from '@ant-design/icons';
import { Resizable } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import dayjs from 'dayjs';
import api from '../../services/api';
import { PROVINCE_OPTIONS } from '../../assets/vietnam_divisions';

const { Text } = Typography;
const { Option } = Select;

interface StudentData {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  gender: string;
  mobile: string;
  email?: string;
  birthdate: string;
  province?: string;
  districtWard?: string;
  primaryAddress: string;
  status: string;
  createdAt: string;
  userId?: string;
  loginEmail?: string;
  siblings?: string[];
  isSyncedToDevice?: boolean;
}

const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const StudentListInner: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  // State
  const [students, setStudents] = useState<StudentData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncStudent = async (student: StudentData) => {
    setSyncingId(student.id);
    try {
      await api.post(`/timekeeping/sync-student/${student.id}`);
      message.success(`Đã đồng bộ tài khoản học viên ${student.lastName} ${student.firstName} lên thiết bị.`);
      fetchStudents();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đồng bộ học viên thất bại.');
    } finally {
      setSyncingId(null);
    }
  };
  
  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [noClass, setNoClass] = useState<boolean | undefined>(undefined);

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('student-list-columns-width');
    return saved ? JSON.parse(saved) : {
      studentId: 120,
      fullName: 250,
      gender: 100,
      birthdate: 120,
      mobile: 150,
      siblings: 180,
      province: 160,
      status: 140,
      primaryAddress: 300,
      createdAt: 120,
      timekeepingSync: 140
    };
  });

  const handleResize = (key: string) => (_e: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    setColWidths(prev => {
      const next = { ...prev, [key]: size.width };
      localStorage.setItem('student-list-columns-width', JSON.stringify(next));
      return next;
    });
  };

  // Fetch data
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/students', {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          status,
          province,
          noClass: noClass || undefined,
        },
      });
      setStudents(response.data.students);
      setTotal(response.data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách học sinh.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, province, noClass, message]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setStatus(undefined);
    setProvince(undefined);
    setNoClass(undefined);
    setPage(1);
  };

  // Status badges mapping
  const getStatusTag = (studentStatus: string) => {
    switch (studentStatus) {
      case 'Waiting for class':
        return <Tag color="warning">Chờ xếp lớp</Tag>;
      case 'Studying':
        return <Tag color="success">Đang học</Tag>;
      case 'Suspended':
        return <Tag color="error">Tạm nghỉ</Tag>;
      case 'Graduated':
        return <Tag color="processing">Đã tốt nghiệp</Tag>;
      default:
        return <Tag>{studentStatus}</Tag>;
    }
  };

  // Table columns definition
  const columns = [
    {
      title: 'Mã HS',
      dataIndex: 'studentId',
      key: 'studentId',
      width: colWidths.studentId,
      fixed: 'left' as const,
      render: (text: string, record: StudentData) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Text strong style={{ color: 'var(--primary)' }}>{text}</Text>
          {record.userId ? (
            <Tooltip title="Đã có tài khoản đăng nhập"><CheckCircleFilled style={{ color: '#10b981' }} /></Tooltip>
          ) : (
            <Tooltip title="Chưa có tài khoản đăng nhập"><CloseCircleFilled style={{ color: '#6b7280' }} /></Tooltip>
          )}
          {record.isSyncedToDevice ? (
            <Tooltip title="Đã đồng bộ tài khoản lên máy chấm công"><CheckCircleFilled style={{ color: '#3b82f6' }} /></Tooltip>
          ) : (
            <Tooltip title="Chưa đồng bộ tài khoản lên máy chấm công"><CloseCircleFilled style={{ color: '#ef4444' }} /></Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Họ và tên',
      key: 'fullName',
      dataIndex: 'fullName',
      width: colWidths.fullName,
      fixed: 'left' as const,
      render: (_: any, record: StudentData) => (
        <div>
          <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{`${record.lastName} ${record.firstName}`}</Text>
          {record.nickName && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({record.nickName})</div>}
        </div>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: colWidths.gender,
      render: (text: string) => (
        <Tag color={text === 'Nam' ? 'blue' : text === 'Nữ' ? 'magenta' : 'default'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthdate',
      key: 'birthdate',
      width: colWidths.birthdate,
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'mobile',
      key: 'mobile',
      width: colWidths.mobile,
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Cùng tài khoản',
      key: 'siblings',
      width: colWidths.siblings || 180,
      render: (_: any, record: StudentData) => {
        if (record.siblings && record.siblings.length > 0) {
          return (
            <Tooltip title={`Dùng chung tài khoản với: ${record.siblings.join(', ')}`}>
              <Tag color="cyan" style={{ cursor: 'pointer' }}>{record.siblings.join(', ')}</Tag>
            </Tooltip>
          );
        }
        return <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'Tỉnh / Thành',
      dataIndex: 'province',
      key: 'province',
      width: colWidths.province,
      render: (text: string) => text || <Text type="secondary">—</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: colWidths.status,
      render: (statusVal: string) => getStatusTag(statusVal),
    },
    {
      title: 'Địa chỉ chi tiết',
      dataIndex: 'primaryAddress',
      key: 'primaryAddress',
      width: colWidths.primaryAddress,
      ellipsis: {
        showTitle: false,
      },
      render: (address: string) => (
        <Tooltip placement="topLeft" title={address}>
          <Text style={{ color: 'var(--text-secondary)' }}>{address}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: colWidths.createdAt,
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: (
        <Tooltip
          title={
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>📋 Cách tạo ID khớp trên máy chấm công:</div>
              <div>1. Vào giao diện quản trị máy chấm công (IP nội bộ)</div>
              <div>2. Tạo mới nhân viên → nhập <b>Employee No</b> = <b>Phần số</b> của Mã HS (VD: Mã HS là <b>STU-1080</b> thì nhập <b>1080</b>)</div>
              <div>3. Đăng ký khuôn mặt / vân tay cho học sinh đó trên máy</div>
              <div>4. Bật toggle "Đồng bộ" ở đây để hệ thống ghi nhận học sinh sẵn sàng</div>
              <div style={{ marginTop: 4, color: '#fbbf24' }}>⚡ Khi học sinh quét thẻ, webhook từ máy gửi về BE sẽ tự khớp theo Employee No → studentId</div>
            </div>
          }
          placement="topLeft"
          overlayStyle={{ maxWidth: 360 }}
        >
          <span style={{ cursor: 'help', borderBottom: '1px dashed currentColor' }}>
            Máy chấm công ℹ️
          </span>
        </Tooltip>
      ),
      key: 'timekeepingSync',
      width: colWidths.timekeepingSync || 150,
      render: (_: any, record: StudentData) => {
        const numericId = record.studentId.replace(/\D/g, '').replace(/^0+/, '');
        if (record.isSyncedToDevice) {
          return (
            <Tooltip title="Nhấn để bỏ đồng bộ học sinh này khỏi danh sách máy chấm công">
              <Tag
                color="success"
                closable
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                onClose={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSyncingId(record.id);
                  api.post(`/timekeeping/sync-student/${record.id}`, { status: false })
                    .then(res => {
                      message.success(`Đã bỏ đồng bộ học viên ${record.lastName} ${record.firstName}.`);
                      setStudents(prev => prev.map(s => s.id === record.id ? { ...s, isSyncedToDevice: res.data.isSyncedToDevice } : s));
                    })
                    .catch((err: any) => message.error(err.response?.data?.message || 'Thao tác thất bại.'))
                    .finally(() => setSyncingId(null));
                }}
              >
                <CheckCircleFilled /> Đã đồng bộ
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={`Bấm để đánh dấu ${record.lastName} ${record.firstName} đã được tạo trên máy chấm công với Employee No = ${numericId} (phần số của mã ${record.studentId})`}>
            <Button
              type="primary"
              size="small"
              style={{ fontSize: '11px', background: 'var(--primary)', border: 'none' }}
              loading={syncingId === record.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSyncStudent(record);
              }}
            >
              Đồng bộ
            </Button>
          </Tooltip>
        );
      },
    },
  ].map(col => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(column.dataIndex || column.key),
    }),
  }));

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Filters Card */}
      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'var(--card-bg)', marginBottom: '16px' }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Row gutter={[12, 12]} align="middle">
          {/* Search Bar */}
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm kiếm Họ tên, Mã HS, Điện thoại, Email..."
              prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchStudents}
              allowClear
            />
          </Col>

          {/* Status Filter */}
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc trạng thái"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="Waiting for class">Chờ xếp lớp</Option>
              <Option value="Studying">Đang học</Option>
              <Option value="Suspended">Tạm nghỉ</Option>
              <Option value="Graduated">Đã tốt nghiệp</Option>
            </Select>
          </Col>

          {/* Class Filter */}
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc lớp học"
              value={noClass}
              onChange={setNoClass}
              allowClear
            >
              <Option value={true}>Chưa vào lớp</Option>
            </Select>
          </Col>

          {/* Province Filter */}
          <Col xs={12} md={4}>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Lọc Tỉnh / Thành phố"
              value={province}
              onChange={setProvince}
              allowClear
              optionFilterProp="children"
            >
              {PROVINCE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Actions */}
          <Col xs={24} md={6} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ background: 'transparent' }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchStudents}
              style={{ background: 'var(--primary)', border: 'none' }}
            >
              Lọc
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
              onClick={() => navigate('/admin/students/create')}
            >
              Thêm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Students Table */}
      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'var(--card-bg)', padding: 0 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          components={components}
          dataSource={students}
          columns={columns as any}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/students/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (totalVal) => `Tổng số ${totalVal} học sinh`,
            onChange: (p, s) => {
              setPage(p);
              setLimit(s);
            },
            style: { padding: '16px', margin: 0, borderTop: '1px solid var(--card-border)' },
          }}
          scroll={{ x: Object.values(colWidths).reduce((a, b) => a + b, 0) || 1500 }}
          style={{ background: 'transparent' }}
          className="custom-antd-table"
        />
      </Card>
    </div>
  );
};

export const StudentList: React.FC = () => {
  return (
    <App>
      <StudentListInner />
    </App>
  );
};

export default StudentList;
