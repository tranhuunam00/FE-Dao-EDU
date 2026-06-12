import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Card, Tag, Typography, Row, Col, App, ConfigProvider, theme,
} from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

export const COURSE_CATEGORIES = [
  { value: 'ELEARNING', label: 'E-Learning' },
  { value: 'OFFLINE', label: 'Lớp Offline' },
  { value: 'BO_TRO', label: 'Khóa Bổ trợ' },
  { value: 'CHAT_LUONG_CAO', label: 'Chất lượng cao' },
  { value: 'KHOA_LE', label: 'Khóa học lẻ' },
];

export const getCategoryLabel = (val: string) => {
  const found = COURSE_CATEGORIES.find(c => c.value === val);
  return found ? found.label : val;
};

interface CourseData {
  id: string;
  category: string;
  name: string;
  shortName: string;
  typeOfPeriod?: string;
  year?: string;
  maxSize?: number;
  status: string;
  createdAt: string;
}

const CourseListInner: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/courses', {
        params: { page, limit, search: search || undefined, status, category },
      });
      setCourses(data.courses);
      setTotal(data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lấy danh sách chương trình');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, category, message]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const columns = [
    {
      title: 'Tên viết tắt',
      dataIndex: 'shortName',
      key: 'shortName',
      width: '120px',
      render: (text: string) => <Text strong style={{ color: '#6366f1' }}>{text}</Text>,
    },
    {
      title: 'Tên Chương trình',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: '140px',
      render: (text: string) => <Tag color="blue">{getCategoryLabel(text)}</Tag>,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'year',
      key: 'year',
      width: '130px',
      render: (text: string) => text ? (dayjs(text).isValid() ? dayjs(text).format('DD/MM/YYYY') : text) : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (s: string) => {
        const color = s === 'Active' ? 'green' : 'red';
        const label = s === 'Active' ? 'Hoạt động' : 'Ngừng';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '110px',
      render: (_: any, record: CourseData) => (
        <Button
          type="primary"
          size="small"
          style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/courses/${record.id}`);
          }}
        >
          Chi tiết
        </Button>
      ),
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
            <BookOutlined style={{ marginRight: 12, color: '#6366f1' }} />
            Chương trình học
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Quản lý các chương trình & bảng giá cho trung tâm.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          onClick={() => navigate('/admin/courses/create')}
        >
          Thêm Chương trình
        </Button>
      </div>

      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm Tên, Mã chương trình..."
              prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchCourses}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc trạng thái"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Ngừng</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc danh mục"
              value={category}
              onChange={setCategory}
              allowClear
            >
              {COURSE_CATEGORIES.map(c => (
                <Option key={c.value} value={c.value}>{c.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setStatus(undefined); setCategory(undefined); setPage(1); }} style={{ background: 'transparent' }}>
              Làm mới
            </Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchCourses}>Tìm kiếm</Button>
          </Col>
        </Row>
      </Card>

      <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, s) => { setPage(p); setLimit(s); },
            showTotal: (t) => `Tổng số ${t} chương trình`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/courses/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

const CourseList: React.FC = () => (
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
      <CourseListInner />
    </App>
  </ConfigProvider>
);

export default CourseList;
