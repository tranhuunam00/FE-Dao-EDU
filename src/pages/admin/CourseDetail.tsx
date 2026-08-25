import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Typography, App, Tag, Table, Button, Spin, Descriptions, Space, Popconfirm, Tooltip
} from 'antd';
import { ArrowLeftOutlined, BookOutlined, DollarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import LevelPricingModal, { renderPricingTimeline, type PricingData } from './CourseDetailComponents/LevelPricingModal';
import { getActiveRate } from '../../utils/pricing';
import { AddLevelModal, EditLevelModal } from './CourseDetailComponents/LevelModal';

const { Title, Text } = Typography;

interface LevelData {
  id: string;
  levelName: string;
  levelCode: string;
  totalHours: number;
  isFixedHour: boolean;
  canUpgrade: boolean;
  gradebookSetting?: string;
  pricing: PricingData[];
  classCount?: number;
  sessionCount?: number;
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

  // Modal states for setting new pricing
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  // Modal states for adding new level
  const [levelModalVisible, setLevelModalVisible] = useState(false);

  // Modal states for editing level
  const [editLevelModalVisible, setEditLevelModalVisible] = useState(false);

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

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '60px' }}>Không tìm thấy chương trình học.</div>;
  }

  const handleOpenPricingModal = (level: LevelData) => {
    setSelectedLevel(level);
    setPricingModalVisible(true);
  };

  const handleDeleteLevel = async (levelId: string) => {
    try {
      await api.delete(`/courses/levels/${levelId}`);
      message.success('Xóa Level thành công!');
      fetchCourse();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa Level.');
    }
  };



  const levelColumns = [
    {
      title: 'Level',
      dataIndex: 'levelName',
      key: 'levelName',
      width: 220,
      render: (text: string) => <Text strong style={{ color: '#a5b4fc' }}>{text}</Text>,
    },
    {
      title: 'Level Code',
      dataIndex: 'levelCode',
      key: 'levelCode',
      width: 110,
    },
    {
      title: 'Tổng giờ',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 90,
      render: (v: number) => `${Number(v).toLocaleString()}`,
    },
    {
      title: 'Giá học viên hiện hành',
      key: 'currentPrice',
      width: 160,
      render: (_: any, record: LevelData) => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const rate = getActiveRate(record.pricing, todayStr, 'pricePerSession');
        return rate > 0
          ? <Text strong style={{ color: '#34d399' }}>{rate.toLocaleString()}đ / buổi</Text>
          : <Text type="secondary">Chưa cấu hình</Text>;
      },
    },
    {
      title: 'Lương giáo viên hiện hành',
      key: 'currentWage',
      width: 160,
      render: (_: any, record: LevelData) => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const rate = getActiveRate(record.pricing, todayStr, 'teacherWagePerSession');
        return rate > 0
          ? <Text strong style={{ color: '#fbbf24' }}>{rate.toLocaleString()}đ / buổi</Text>
          : <Text type="secondary">Chưa cấu hình</Text>;
      },
    },
    {
      title: 'Lương trợ giảng hiện hành',
      key: 'currentTaWage',
      width: 160,
      render: (_: any, record: LevelData) => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const rate = getActiveRate(record.pricing, todayStr, 'taWagePerSession');
        return rate > 0
          ? <Text strong style={{ color: '#60a5fa' }}>{rate.toLocaleString()}đ / buổi</Text>
          : <Text type="secondary">Chưa cấu hình</Text>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 260,
      render: (_: any, record: LevelData) => {
        const hasClasses = (record.classCount || 0) > 0;
        const hasSessions = (record.sessionCount || 0) > 0;
        const isUsed = hasClasses || hasSessions;
        const disabledReason = hasClasses
          ? 'Không thể xóa Level vì đã có lớp học sử dụng.'
          : 'Không thể xóa Level vì đã có buổi học/điểm danh liên quan.';

        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenPricingModal(record)}
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', border: 'none' }}
            >
              Cấu hình giá
            </Button>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedLevel(record);
                setEditLevelModalVisible(true);
              }}
            >
              Sửa
            </Button>
            {isUsed ? (
              <Tooltip title={disabledReason}>
                <span>
                  <Button size="small" danger icon={<DeleteOutlined />} disabled>
                    Xóa
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Popconfirm
                title="Xóa Level này?"
                description="Lưu ý: Chỉ xóa được khi chưa có lớp hoặc buổi học nào sử dụng Level này."
                onConfirm={() => handleDeleteLevel(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ width: '100%', padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
          style={{ background: 'var(--bg-tertiary)', border: 'none' }}
        />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
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

      <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 24 }}>
        <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Thông tin chung</Title>
        <Descriptions
          column={{ xs: 1, sm: 2, md: 3 }}
          labelStyle={{ color: 'var(--text-secondary)', fontWeight: 500 }}
          contentStyle={{ color: 'var(--text-primary)' }}
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

      <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={5} style={{ color: 'var(--text-primary)', margin: 0 }}>
            Cấu hình Level ({course.levels?.length || 0})
          </Title>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setLevelModalVisible(true);
            }}
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', border: 'none' }}
          >
            Thêm Level
          </Button>
        </div>
        <Table
          columns={levelColumns}
          dataSource={course.levels || []}
          rowKey="id"
          pagination={false}
          size="small"
          expandable={{
            expandedRowRender: (record: LevelData) => (
              <div style={{ padding: '8px 0' }}>
                <Text strong style={{ color: '#a5b4fc', marginBottom: 12, display: 'block' }}>
                  <DollarOutlined /> 3 Thanh trạng thái & Lịch sử đơn giá
                </Text>
                
                {/* 3 Thanh trạng thái trực quan */}
                {renderPricingTimeline(record.pricing as any)}

                {record.pricing && record.pricing.length > 0 ? (
                  <Table
                    dataSource={record.pricing}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'ID',
                        dataIndex: 'id',
                        key: 'id',
                        width: 120,
                        render: (id: string) => (
                          <Tooltip title={id}>
                            <Text copyable={{ text: id }} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>
                              {id ? (id.length > 8 ? `${id.slice(0, 8)}...` : id) : '-'}
                            </Text>
                          </Tooltip>
                        ),
                      },
                      {
                        title: 'Đơn giá học viên / buổi',
                        dataIndex: 'pricePerSession',
                        render: (v: number) => <Text strong style={{ color: '#34d399' }}>{Number(v).toLocaleString()}đ</Text>,
                      },
                      {
                        title: 'Lương trả giáo viên / buổi',
                        dataIndex: 'teacherWagePerSession',
                        render: (v: number) => <Text strong style={{ color: '#fbbf24' }}>{Number(v).toLocaleString()}đ</Text>,
                      },
                      {
                        title: 'Lương trả trợ giảng / buổi',
                        dataIndex: 'taWagePerSession',
                        render: (v: number) => <Text strong style={{ color: '#60a5fa' }}>{Number(v || 0).toLocaleString()}đ</Text>,
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

      {/* Pricing Modal */}
      <LevelPricingModal
        open={pricingModalVisible}
        onCancel={() => setPricingModalVisible(false)}
        onSuccess={() => {
          setPricingModalVisible(false);
          fetchCourse();
        }}
        selectedLevel={selectedLevel as any}
      />

      {/* Add Level Modal */}
      <AddLevelModal
        open={levelModalVisible}
        onCancel={() => setLevelModalVisible(false)}
        onSuccess={() => {
          setLevelModalVisible(false);
          fetchCourse();
        }}
        courseId={id!}
      />

      {/* Edit Level Modal */}
      <EditLevelModal
        open={editLevelModalVisible}
        onCancel={() => setEditLevelModalVisible(false)}
        onSuccess={() => {
          setEditLevelModalVisible(false);
          fetchCourse();
        }}
        selectedLevel={selectedLevel as any}
      />
    </div>
  );
};

const CourseDetail: React.FC = () => (
  <App>
    <CourseDetailInner />
  </App>
);

export default CourseDetail;
