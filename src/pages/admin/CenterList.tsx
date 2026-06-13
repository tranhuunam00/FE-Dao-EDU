import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Input, Select, Button, Card, Tag, Typography, Row, Col, App, ConfigProvider, theme
} from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { PROVINCE_OPTIONS } from '../../assets/vietnam_divisions';

const { Title, Text } = Typography;
const { Option } = Select;

interface CenterData {
  id: string;
  centerId: string;
  name: string;
  phone?: string;
  email?: string;
  province?: string;
  districtWard?: string;
  primaryAddress?: string;
  managerName?: string;
  status: string;
  createdAt: string;
}

const CenterListInner: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [centers, setCenters] = useState<CenterData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/centers', {
        params: { page, limit, search: search || undefined, status, province },
      });
      setCenters(data.centers);
      setTotal(data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lấy danh sách trung tâm');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, province, message]);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus(undefined);
    setProvince(undefined);
    setPage(1);
  };

  const columns = [
    {
      title: 'Mã Trung Tâm',
      dataIndex: 'centerId',
      key: 'centerId',
      width: '130px',
      render: (text: string) => <Text strong style={{ color: 'var(--primary)' }}>{text}</Text>,
    },
    {
      title: 'Tên Trung Tâm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: '120px',
    },
    {
      title: 'Quản lý',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (text: string) => text || '-',
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
          color = 'green';
          label = 'Hoạt động';
        } else if (status === 'Inactive') {
          color = 'red';
          label = 'Dừng hoạt động';
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
            Danh sách Trung tâm
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Quản lý thông tin các cơ sở đào tạo trong hệ thống.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          onClick={() => navigate('/admin/centers/create')}
        >
          Thêm Trung tâm mới
        </Button>
      </div>

      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm Tên, Mã TT, Điện thoại, Email..."
              prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchCenters}
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
              <Option value="Inactive">Dừng hoạt động</Option>
            </Select>
          </Col>

          <Col xs={12} md={5}>
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
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchCenters}>
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
        <Table
          columns={columns}
          dataSource={centers}
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
            showTotal: (total) => `Tổng số ${total} trung tâm`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/centers/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

const CenterList: React.FC = () => (
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
      <CenterListInner />
    </App>
  </ConfigProvider>
);

export default CenterList;
