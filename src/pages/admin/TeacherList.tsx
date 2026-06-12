import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Card, Tag, Typography, Row, Col, Tooltip, App, ConfigProvider, theme
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { PROVINCE_OPTIONS } from '../../assets/vietnam_divisions';

const { Title, Text } = Typography;
const { Option } = Select;

interface TeacherData {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  gender: string;
  mobile?: string;
  email?: string;
  type: string;
  status: string;
  province?: string;
  createdAt: string;
  userId?: string;
}

const TeacherListInner: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers', {
        params: { page, limit, search: search || undefined, status, province, type },
      });
      setTeachers(data.teachers);
      setTotal(data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lấy danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, province, type, message]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus(undefined);
    setProvince(undefined);
    setType(undefined);
    setPage(1);
  };

  const columns = [
    {
      title: 'Mã GV',
      dataIndex: 'teacherId',
      key: 'teacherId',
      width: '120px',
      render: (text: string, record: TeacherData) => (
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
      key: 'name',
      render: (_: any, record: TeacherData) => `${record.lastName} ${record.firstName}`,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: '100px',
    },
    {
      title: 'Loại hình',
      dataIndex: 'type',
      key: 'type',
      width: '120px',
      render: (type: string) => {
        if (type === 'Teacher') return <Tag color="blue">Giáo viên</Tag>;
        if (type === 'TeachingAssistant') return <Tag color="purple">Trợ giảng</Tag>;
        return <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Khu vực',
      dataIndex: 'province',
      key: 'province',
      width: '150px',
      render: (text: string) => {
        const option = PROVINCE_OPTIONS.find(p => p.value === text);
        return option ? option.label : (text || '-');
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status: string) => {
        let color = 'default';
        let label = status;
        if (status === 'Active') {
          color = 'green'; label = 'Đang làm';
        } else if (status === 'Suspended') {
          color = 'orange'; label = 'Tạm nghỉ';
        } else if (status === 'Resigned') {
          color = 'red'; label = 'Đã nghỉ';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '110px',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div>
          <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
            Danh sách Giáo viên / Trợ giảng
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Quản lý và cập nhật thông tin nhân sự giảng dạy toàn hệ thống.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="large"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          onClick={() => navigate('/admin/teachers/create')}
        >
          Thêm nhân sự mới
        </Button>
      </div>

      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm kiếm Họ tên, Mã, ĐT..."
              prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchTeachers}
              allowClear
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc loại hình"
              value={type}
              onChange={setType}
              allowClear
            >
              <Option value="Teacher">Giáo viên</Option>
              <Option value="TeachingAssistant">Trợ giảng</Option>
            </Select>
          </Col>

          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc trạng thái"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="Active">Đang làm</Option>
              <Option value="Suspended">Tạm nghỉ</Option>
              <Option value="Resigned">Đã nghỉ</Option>
            </Select>
          </Col>

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

          <Col xs={24} md={6} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ background: 'transparent' }}
            >
              Làm mới
            </Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchTeachers}>
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p);
              setLimit(s);
            },
            showTotal: (total) => `Tổng số ${total} nhân sự`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/teachers/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

const TeacherList: React.FC = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#6366f1',
        colorBgContainer: '#111827',
        colorBorder: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
      },
    }}
  >
    <App>
      <TeacherListInner />
    </App>
  </ConfigProvider>
);

export default TeacherList;
