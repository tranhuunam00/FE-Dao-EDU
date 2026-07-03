import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Table, Input, Select, Button, Card, Tag, Typography, Row, Col, App, Tabs,
} from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';
import { Resizable } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Text } = Typography;
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
  isEndingSoon?: boolean;
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

interface UnlockedSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceLocked: boolean;
  classId: string;
  classCode: string;
  className: string;
  roomName: string | null;
  teacherName: string | null;
}

const UnlockedSessionsTable: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [sessions, setSessions] = useState<UnlockedSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/admin/unlocked-sessions');
      setSessions(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách buổi học chưa chốt.');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <Table
        dataSource={sessions}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: 'Mã lớp',
            dataIndex: 'classCode',
            key: 'classCode',
            width: 140,
            render: (text: string) => <Text strong style={{ color: '#6366f1' }}>{text}</Text>,
          },
          {
            title: 'Tên lớp',
            dataIndex: 'className',
            key: 'className',
            render: (text: string) => <Text strong style={{ color: 'var(--text-primary)' }}>{text}</Text>,
          },
          {
            title: 'Ngày học',
            dataIndex: 'date',
            key: 'date',
            width: 150,
            render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
          },
          {
            title: 'Giờ học',
            key: 'time',
            width: 150,
            render: (_, r) => `${r.startTime.substring(0, 5)} - ${r.endTime.substring(0, 5)}`,
          },
          {
            title: 'Phòng',
            dataIndex: 'roomName',
            key: 'roomName',
            width: 140,
            render: (v) => v || <Text type="secondary">—</Text>,
          },
          {
            title: 'Giáo viên',
            dataIndex: 'teacherName',
            key: 'teacherName',
            width: 180,
            render: (v) => v || <Text type="secondary">Chưa phân công</Text>,
          },
          {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_, record) => (
              <Button
                type="primary"
                size="small"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none' }}
                onClick={() => navigate(`/admin/classes/${record.classId}?sessionId=${record.id}`)}
              >
                Điểm danh
              </Button>
            ),
          },
        ]}
        locale={{
          emptyText: 'Tất cả các buổi học trong quá khứ đã được chốt điểm danh đầy đủ.'
        }}
      />
    </Card>
  );
};

const ClassListInner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';
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

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('class-list-columns-width');
    return saved ? JSON.parse(saved) : {
      classCode: 150,
      className: 300,
      centerName: 180,
      teacherName: 180,
      dates: 220,
      maxSize: 100,
      status: 160,
      actions: 120
    };
  });

  const handleResize = (key: string) => (_e: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    setColWidths(prev => {
      const next = { ...prev, [key]: size.width };
      localStorage.setItem('class-list-columns-width', JSON.stringify(next));
      return next;
    });
  };

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
      width: colWidths.classCode,
      render: (text: string) => <Text strong style={{ color: '#6366f1' }}>{text}</Text>,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
      width: colWidths.className,
      render: (text: string, record: ClassData) => (
        <div>
          <Text strong style={{ color: 'var(--text-primary)' }}>{text}</Text>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {record.course?.name} ({record.courseLevel?.levelName})
          </div>
        </div>
      ),
    },
    {
      title: 'Trung tâm',
      dataIndex: ['center', 'name'],
      key: 'centerName',
      width: colWidths.centerName,
      render: (text: string) => text || '-',
    },
    {
      title: 'Giáo viên',
      key: 'teacherName',
      width: colWidths.teacherName,
      render: (_: any, record: ClassData) => {
        return record.mainTeacher
          ? `${record.mainTeacher.firstName} ${record.mainTeacher.lastName}`
          : <Text type="secondary">Chưa gán</Text>;
      },
    },
    {
      title: 'Thời gian',
      key: 'dates',
      width: colWidths.dates,
      render: (_: any, record: ClassData) => {
        const start = record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '?';
        const finish = record.finishDate ? dayjs(record.finishDate).format('DD/MM/YYYY') : 'Chưa xác định';
        const isEndingSoon = record.finishDate
          ? dayjs(record.finishDate).diff(dayjs(), 'day') <= 7 && dayjs(record.finishDate).diff(dayjs(), 'day') >= 0 && record.status === 'Active'
          : false;
        return (
          <div>
            <Text style={{ fontSize: '13px' }}>{start} - {finish}</Text>
            {isEndingSoon && (
              <div style={{
                marginTop: 4,
                fontSize: '11px',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '4px',
                padding: '1px 6px',
                display: 'inline-block',
              }}>
                ⚠ Sắp kết thúc
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Sĩ số',
      dataIndex: 'maxSize',
      key: 'maxSize',
      width: colWidths.maxSize,
      render: (val: number) => val || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: colWidths.status,
      render: (s: string, record: ClassData) => {
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
        const isEndingSoon = record.finishDate
          ? dayjs(record.finishDate).diff(dayjs(), 'day') <= 7 && dayjs(record.finishDate).diff(dayjs(), 'day') >= 0 && s === 'Active'
          : false;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Tag color={color}>{label}</Tag>
            {isEndingSoon && <Tag color="warning" style={{ fontSize: '11px' }}>⚠ Sắp kết thúc</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      dataIndex: 'actions',
      width: colWidths.actions,
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

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  return (
    <div style={{ width: '100%' }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'list',
            label: (
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                <TeamOutlined /> Danh sách lớp học
              </span>
            ),
            children: (
              <>
                <Card
                  className="glass-panel"
                  style={{ border: 'none', background: 'var(--card-bg)', marginBottom: '16px' }}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <Row gutter={[12, 12]} align="middle">
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
                    <Col xs={12} md={3}>
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
                    <Col xs={12} md={4}>
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
                    <Col xs={12} md={4}>
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
                    <Col xs={24} md={7} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                        onClick={() => navigate('/admin/classes/create')}
                      >
                        Thêm mới
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
                  <Table
                    components={components}
                    columns={columns as any}
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
                    scroll={{ x: Object.values(colWidths).reduce((a, b) => a + b, 0) || 1500 }}
                  />
                </Card>
              </>
            )
          },
          {
            key: 'unlocked',
            label: (
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                <WarningOutlined style={{ color: '#ef4444' }} /> Buổi học chưa chốt điểm danh
              </span>
            ),
            children: <UnlockedSessionsTable />
          }
        ]}
      />
    </div>
  );
};

const ClassList: React.FC = () => (
  <App>
    <ClassListInner />
  </App>
);

export default ClassList;
