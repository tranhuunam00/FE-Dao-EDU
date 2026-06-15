import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, Button, Card, Typography, Row, Col, App,
  Table, InputNumber, DatePicker
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface LevelRow {
  key: string;
  levelName: string;
  levelCode: string;
  totalHours: number;
}

const CreateCourseInner: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [centers, setCenters] = useState<any[]>([]);

  useEffect(() => {
    api.get('/centers?page=1&limit=100').then(({ data }) => {
      setCenters(data.centers || []);
    }).catch(() => {});
  }, []);

  const addLevel = () => {
    setLevels(prev => [...prev, {
      key: Date.now().toString(),
      levelName: '',
      levelCode: '',
      totalHours: 200,
    }]);
  };

  const removeLevel = (key: string) => {
    setLevels(prev => prev.filter(l => l.key !== key));
  };

  const updateLevel = (key: string, field: string, value: any) => {
    setLevels(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l));
  };

  const handleSubmit = async () => {
    if (levels.length === 0) {
      message.error('Vui lòng thêm ít nhất một Level cấu hình cho chương trình học.');
      return;
    }
    for (const lvl of levels) {
      if (!lvl.levelName.trim() || !lvl.levelCode.trim()) {
        message.error('Vui lòng điền đầy đủ Tên level và Mã level.');
        return;
      }
    }
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        ...values,
        typeOfPeriod: 'By hour', // default internally
        year: values.year ? values.year.format('YYYY-MM-DD') : null, // stores start date as string
        levels: levels.map(l => ({
          levelName: l.levelName,
          levelCode: l.levelCode,
          totalHours: l.totalHours,
          isFixedHour: false, // default internally
          canUpgrade: true, // default internally
        })),
      };

      await api.post('/courses', payload);

      message.success('Tạo chương trình học thành công!');
      navigate('/admin/courses');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo chương trình. Vui lòng kiểm tra lại mã chương trình học.');
    } finally {
      setSaving(false);
    }
  };

  const levelColumns = [
    {
      title: 'Level',
      dataIndex: 'levelName',
      key: 'levelName',
      render: (_: any, record: LevelRow) => (
        <Input
          placeholder="VD: TOÁN 6"
          value={record.levelName}
          onChange={e => updateLevel(record.key, 'levelName', e.target.value)}
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)' }}
        />
      ),
    },
    {
      title: 'Level Code',
      dataIndex: 'levelCode',
      key: 'levelCode',
      width: 250,
      render: (_: any, record: LevelRow) => (
        <Input
          placeholder="VD: TOAN6"
          value={record.levelCode}
          onChange={e => updateLevel(record.key, 'levelCode', e.target.value)}
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)' }}
        />
      ),
    },
    {
      title: 'Tổng giờ',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 150,
      render: (_: any, record: LevelRow) => (
        <InputNumber
          min={0}
          value={record.totalHours}
          onChange={v => updateLevel(record.key, 'totalHours', v || 0)}
          style={{ width: '100%', background: 'var(--bg-tertiary)' }}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: LevelRow) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeLevel(record.key)} />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
          style={{ background: 'var(--bg-tertiary)', border: 'none' }}
        />
        <div>
          <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
            <BookOutlined style={{ marginRight: 10, color: '#6366f1' }} />
            Thêm Chương trình học mới
          </Title>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={{ status: 'Active' }}>
        <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 24 }}>
          <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Thông tin chung</Title>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Tên Chương trình" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="VD: Học phí Lớp Củng cố kiến thức THCS" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="shortName" label="Mã chương trình (viết tắt)" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="VD: BUTPHA" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select placeholder="Chọn danh mục">
                  <Option value="ELEARNING">E-Learning</Option>
                  <Option value="OFFLINE">Lớp Offline</Option>
                  <Option value="BO_TRO">Khóa Bổ trợ</Option>
                  <Option value="CHAT_LUONG_CAO">Chất lượng cao</Option>
                  <Option value="KHOA_LE">Khóa học lẻ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="year" label="Ngày bắt đầu" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="maxSize" label="Sĩ số tối đa">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="30" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Inactive">Ngừng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="centerId" label="Trung tâm">
                <Select placeholder="Chọn trung tâm" allowClear showSearch optionFilterProp="children">
                  {centers.map((c: any) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Ghi chú">
                <TextArea rows={2} placeholder="Mô tả chương trình..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ color: 'var(--text-primary)', margin: 0 }}>Cấu hình Level</Title>
            <Button icon={<PlusOutlined />} onClick={addLevel} style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
              Thêm Level
            </Button>
          </div>
          {levels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Chưa có Level nào. Bấm "Thêm Level" để tạo cấu hình.
            </div>
          ) : (
            <Table
              columns={levelColumns}
              dataSource={levels}
              rowKey="key"
              pagination={false}
              size="small"
            />
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={() => navigate('/admin/courses')} style={{ background: 'transparent' }}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={saving}
            size="large"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', minWidth: 200 }}
          >
            Lưu Chương trình
          </Button>
        </div>
      </Form>
    </div>
  );
};

const CreateCourse: React.FC = () => (
  <App>
    <CreateCourseInner />
  </App>
);

export default CreateCourse;
