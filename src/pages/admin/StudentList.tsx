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
  
  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('student-list-columns-width');
    return saved ? JSON.parse(saved) : {
      studentId: 120,
      fullName: 250,
      gender: 100,
      birthdate: 120,
      mobile: 150,
      province: 160,
      status: 140,
      primaryAddress: 300,
      createdAt: 120
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
        },
      });
      setStudents(response.data.students);
      setTotal(response.data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách học sinh.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, province, message]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setStatus(undefined);
    setProvince(undefined);
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
      render: (text: string, record: StudentData) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: 'var(--primary)' }}>{text}</Text>
          {record.userId ? (
            <Tooltip title="Đã có tài khoản đăng nhập">
              <CheckCircleFilled style={{ color: '#10b981' }} />
            </Tooltip>
          ) : (
            <Tooltip title="Chưa có tài khoản">
              <CloseCircleFilled style={{ color: '#6b7280' }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Họ và tên',
      key: 'fullName',
      dataIndex: 'fullName',
      width: colWidths.fullName,
      render: (_: any, record: StudentData) => (
        <div>
          <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{`${record.lastName} ${record.firstName}`}</Text>
          {record.nickName && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ({record.nickName})
            </div>
          )}
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
          <Col xs={24} md={8}>
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
          <Col xs={24} md={8} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ background: 'transparent' }}
            >
              Reset bộ lọc
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchStudents}
              style={{ background: 'var(--primary)', border: 'none' }}
            >
              Tìm kiếm
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
              onClick={() => navigate('/admin/students/create')}
            >
              Thêm mới
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
