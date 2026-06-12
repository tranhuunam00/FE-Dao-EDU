import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Typography, Row, Col, App, ConfigProvider, theme, Tag, Table, Button, Spin, Descriptions, Divider,
} from 'antd';
import { ArrowLeftOutlined, BookOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

interface PricingData {
  id: string;
  pricePerSession: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

interface LevelData {
  id: string;
  levelName: string;
  levelCode: string;
  totalHours: number;
  isFixedHour: boolean;
  canUpgrade: boolean;
  gradebookSetting?: string;
  pricing: PricingData[];
}

interface CourseDetailData {
  id: string;
  category: string;
  name: string;
  shortName: string;
  typeOfPeriod?: string;
  year?: string;
  maxSize?: number;
  status: string;
  description?: string;
  createdAt: string;
  levels: LevelData[];
}

export const COURSE_CATEGORIES = [
  { value: 'ELEARNING', label: 'E-Learning' },
  { value: 'OFFLINE', label: 'Lớp Offline' },
  { value: 'BO_TRO', label: 'Khóa Bổ trợ' },
  { value: 'CHAT_LUONG_CAO', label: 'Chất lượng cao' },
  { value: 'KHOA_LE', label: 'Khóa học lẻ' },
];

const getCategoryLabel = (val: string) => {
  const found = COURSE_CATEGORIES.find(c => c.value === val);
  return found ? found.label : val;
};

const CourseDetailInner: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Không thể tải thông tin chương trình.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id, message]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '60px' }}>Không tìm thấy chương trình học.</div>;
  }

  const levelColumns = [
    {
      title: 'Level',
      dataIndex: 'levelName',
      key: 'levelName',
      render: (text: string) => <Text strong style={{ color: '#a5b4fc' }}>{text}</Text>,
    },
    {
      title: 'Level Code',
      dataIndex: 'levelCode',
      key: 'levelCode',
      width: 120,
    },
    {
      title: 'Tổng giờ',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 100,
      render: (v: number) => `${Number(v).toLocaleString()}`,
    },
    {
      title: 'Giá hiện hành',
      key: 'currentPrice',
      width: 150,
      render: (_: any, record: LevelData) => {
        const current = record.pricing?.find((p) => !p.effectiveTo || new Date(p.effectiveTo) >= new Date());
        return current
          ? <Text strong style={{ color: '#34d399' }}>{Number(current.pricePerSession).toLocaleString()}đ / buổi</Text>
          : <Text type="secondary">Chưa có giá</Text>;
      },
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none' }}
        />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
            <BookOutlined style={{ marginRight: 10, color: '#6366f1' }} />
            {course.name}
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            {course.shortName} • {getCategoryLabel(course.category)}
          </Text>
        </div>
        <Tag color={course.status === 'Active' ? 'green' : 'red'} style={{ fontSize: '14px', padding: '4px 16px' }}>
          {course.status === 'Active' ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      </div>

      <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 24 }}>
        <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Thông tin chung</Title>
        <Descriptions
          column={{ xs: 1, sm: 2, md: 3 }}
          labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}
          contentStyle={{ color: '#fff' }}
        >
          <Descriptions.Item label="Tên Chương trình">{course.name}</Descriptions.Item>
          <Descriptions.Item label="Mã chương trình">{course.shortName}</Descriptions.Item>
          <Descriptions.Item label="Danh mục"><Tag color="blue">{getCategoryLabel(course.category)}</Tag></Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {course.year ? (dayjs(course.year).isValid() ? dayjs(course.year).format('DD/MM/YYYY') : course.year) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Sĩ số tối đa">{course.maxSize || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{dayjs(course.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
          {course.description && (
            <Descriptions.Item label="Ghi chú" span={3}>{course.description}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 24 }}>
        <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
          Cấu hình Level ({course.levels?.length || 0})
        </Title>
        <Table
          columns={levelColumns}
          dataSource={course.levels || []}
          rowKey="id"
          pagination={false}
          size="small"
          expandable={{
            expandedRowRender: (record: LevelData) => (
              <div style={{ padding: '8px 0' }}>
                <Text strong style={{ color: '#a5b4fc', marginBottom: 8, display: 'block' }}>
                  <DollarOutlined /> Lịch sử Bảng giá
                </Text>
                {record.pricing && record.pricing.length > 0 ? (
                  <Table
                    dataSource={record.pricing}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Đơn giá / buổi',
                        dataIndex: 'pricePerSession',
                        render: (v: number) => <Text strong style={{ color: '#34d399' }}>{Number(v).toLocaleString()}đ</Text>,
                      },
                      {
                        title: 'Từ ngày',
                        dataIndex: 'effectiveFrom',
                        render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Đến ngày',
                        dataIndex: 'effectiveTo',
                        render: (v: string | null) => v ? dayjs(v).format('DD/MM/YYYY') : <Tag color="green">Hiện hành</Tag>,
                      },
                    ]}
                  />
                ) : (
                  <Text type="secondary">Chưa có bảng giá nào. Vui lòng thêm giá cho Level này.</Text>
                )}
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

const CourseDetail: React.FC = () => (
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
      <CourseDetailInner />
    </App>
  </ConfigProvider>
);

export default CourseDetail;
