import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Card, Tag, Typography, Row, Col, App, ConfigProvider, theme,
} from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface ClassData {
  id: string;
  classCode: string;
  className: string;
  status: string;
  startDate?: string;
  finishDate?: string;
  maxSize?: number;
  course?: { name: string };
  courseLevel?: { levelName: string };
  mainTeacher?: { firstName: string; lastName: string };
  center?: { name: string };
  createdAt: string;
}

const ClassListInner: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [centers, setCenters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);

  // Fetch filter options
  useEffect(() => {
    api.get('/centers?page=1&limit=100').then(({ data }) => setCenters(data.centers || [])).catch(() => {});
    api.get('/courses?page=1&limit=100').then(({ data }) => setCourses(data.courses || [])).catch(() => {});
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/classes', {
        params: { page, limit, search: search || undefined, status, centerId, courseId },
      });
      setClasses(data.classes);
      setTotal(data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, centerId, courseId, message]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'classCode',
      key: 'classCode',
      width: '150px',
      render: (text: string) => <Text strong style={{ color: '#6366f1' }}>{text}</Text>,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
      render: (text: string, record: ClassData) => (
        <div>
          <Text strong style={{ color: '#fff' }}>{text}</Text>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
            {record.course?.name} ({record.courseLevel?.levelName})
          </div>
        </div>
      ),
    },
    {
      title: 'Trung tâm',
      dataIndex: ['center', 'name'],
      key: 'centerName',
      width: '150px',
      render: (text: string) => text || '-',
    },
    {
      title: 'Giáo viên',
      key: 'teacherName',
      width: '150px',
      render: (_: any, record: ClassData) => {
        return record.mainTeacher
          ? `${record.mainTeacher.firstName} ${record.mainTeacher.lastName}`
          : <Text type="secondary">Chưa gán</Text>;
      },
    },
    {
      title: 'Thời gian',
      key: 'dates',
      width: '200px',
      render: (_: any, record: ClassData) => {
        const start = record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '?';
        const finish = record.finishDate ? dayjs(record.finishDate).format('DD/MM/YYYY') : 'Chưa xác định';
        return <Text style={{ fontSize: '13px' }}>{start} - {finish}</Text>;
      },
    },
    {
      title: 'Sĩ số',
      dataIndex: 'maxSize',
      key: 'maxSize',
      width: '80px',
      render: (val: number) => val || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (s: string) => {
        let color = 'gold';
        let label = s;
        if (s === 'Active') {
          color = 'green';
          label = 'Hoạt động';
        } else if (s === 'Planning') {
          color = 'blue';
          label = 'Lên kế hoạch';
        } else if (s === 'Completed') {
          color = 'purple';
          label = 'Đã kết thúc';
        } else if (s === 'Closed') {
          color = 'red';
          label = 'Đã đóng';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '110px',
      render: (_: any, record: ClassData) => (
        <Button
          type="primary"
          size="small"
          style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/classes/${record.id}`);
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
            <TeamOutlined style={{ marginRight: 12, color: '#6366f1' }} />
            Lớp học
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Quản lý các lớp học, gán giáo viên và phân bổ lịch học.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          onClick={() => navigate('/admin/classes/create')}
        >
          Thêm Lớp học
        </Button>
      </div>

      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm kiếm Tên lớp, Mã lớp..."
              prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchClasses}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="Planning">Lên kế hoạch</Option>
              <Option value="Active">Hoạt động</Option>
              <Option value="Completed">Đã kết thúc</Option>
              <Option value="Closed">Đã đóng</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trung tâm"
              value={centerId}
              onChange={setCenterId}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {centers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Chương trình học"
              value={courseId}
              onChange={setCourseId}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {courses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={4} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearch('');
                setStatus(undefined);
                setCenterId(undefined);
                setCourseId(undefined);
                setPage(1);
              }}
              style={{ background: 'transparent' }}
            >
              Làm mới
            </Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchClasses}>Tìm</Button>
          </Col>
        </Row>
      </Card>

      <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
        <Table
          columns={columns}
          dataSource={classes}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, s) => { setPage(p); setLimit(s); },
            showTotal: (t) => `Tổng số ${t} lớp học`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/classes/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

const ClassList: React.FC = () => (
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
      <ClassListInner />
    </App>
  </ConfigProvider>
);

export default ClassList;
