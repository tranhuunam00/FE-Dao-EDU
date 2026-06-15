import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, DatePicker, Button, Card, Typography, Row, Col, Upload, Tabs, App, Space, Avatar
} from 'antd';
import { CameraOutlined, ArrowLeftOutlined, SaveOutlined, LockOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { PROVINCE_OPTIONS, getDistrictsOrWards } from '../../assets/vietnam_divisions';

const { Title, Text } = Typography;
const { Option } = Select;

const CreateTeacherInner: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
  
  const selectedProvince = Form.useWatch('province', form);
  const [districtOptions, setDistrictOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      setDistrictOptions(getDistrictsOrWards(selectedProvince));
      form.setFieldValue('districtWard', undefined);
    } else {
      setDistrictOptions([]);
    }
  }, [selectedProvince, form]);

  const handleAvatarChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: any = {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        gender: values.gender,
        birthdate: values.birthdate ? values.birthdate.format('YYYY-MM-DD') : undefined,
        mobile: values.mobile?.trim() || undefined,
        email: values.email?.trim() || undefined,
        citizenId: values.citizenId?.trim() || undefined,
        type: values.type,
        country: values.country || 'Việt Nam',
        province: values.province || undefined,
        districtWard: values.districtWard || undefined,
        primaryAddress: values.primaryAddress?.trim() || undefined,
        status: values.status,
        loginEmail: values.loginEmail?.trim() || undefined,
        loginPassword: values.loginPassword || undefined,
      };

      if (avatarBase64) {
        payload.avatar = avatarBase64;
      }

      await api.post('/teachers', payload);
      message.success('Đã thêm nhân sự thành công!');
      navigate('/admin/teachers');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(', '));
      } else {
        message.error(msg || 'Không thể tạo nhân sự.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <Row gutter={24}>
        <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <Avatar
              size={160}
              src={avatarPreview}
              icon={!avatarPreview ? <UserOutlined style={{ fontSize: '64px' }} /> : undefined}
              style={{
                background: avatarPreview ? 'transparent' : 'var(--bg-tertiary)',
                border: '2px dashed var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
          <Upload showUploadList={false} beforeUpload={() => false} onChange={handleAvatarChange} accept="image/*">
            <Button icon={<CameraOutlined />} style={{ background: 'var(--bg-tertiary)', border: 'none' }}>
              Tải ảnh chân dung
            </Button>
          </Upload>
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Định dạng: JPG, PNG. Tối đa 2MB.</Text>
          </div>
        </Col>

        <Col xs={24} md={16}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Họ và tên đệm" name="firstName" rules={[{ required: true }]}>
                <Input placeholder="VD: Nguyễn Văn" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tên" name="lastName" rules={[{ required: true }]}>
                <Input placeholder="VD: A" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Giới tính" name="gender" rules={[{ required: true }]}>
                <Select size="large" placeholder="Chọn giới tính">
                  <Option value="Male">Nam</Option>
                  <Option value="Female">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày sinh" name="birthdate">
                <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Số điện thoại" name="mobile">
                <Input placeholder="Nhập ĐT liên hệ" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                <Input placeholder="Nhập email liên hệ" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="CMND / CCCD" name="citizenId">
                <Input placeholder="Số thẻ định danh" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Loại hình" name="type" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="Teacher">Giáo viên</Option>
                  <Option value="TeachingAssistant">Trợ giảng</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="Active">Đang làm</Option>
                  <Option value="Suspended">Tạm nghỉ</Option>
                  <Option value="Resigned">Đã nghỉ việc</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );

  const renderAddressTab = () => (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item label="Quốc gia" name="country">
            <Select size="large">
              <Option value="Việt Nam">Việt Nam</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Tỉnh / Thành phố" name="province">
            <Select showSearch placeholder="Chọn Tỉnh/Thành phố" size="large" optionFilterProp="children">
              {PROVINCE_OPTIONS.map((p) => (
                <Option key={p.value} value={p.value}>{p.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Quận / Huyện" name="districtWard">
            <Select showSearch placeholder="Chọn Quận/Huyện" size="large" disabled={!selectedProvince} optionFilterProp="children">
              {districtOptions.map((d) => (
                <Option key={d.value} value={d.value}>{d.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item label="Địa chỉ chi tiết (Số nhà, đường...)" name="primaryAddress">
            <Input placeholder="Nhập địa chỉ nhà" size="large" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderLoginTab = () => (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <div style={{ marginBottom: '24px' }}>
        <Text style={{ color: 'var(--text-secondary)' }}>
          Khai báo thông tin dưới đây nếu bạn muốn tạo tài khoản cho nhân sự này đăng nhập vào hệ thống ngay lúc này. 
          Bạn có thể bỏ qua nếu chưa cần cấp tài khoản.
        </Text>
      </div>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label="Email đăng nhập" name="loginEmail" rules={[{ type: 'email' }, { required: true }]}>
            <Input placeholder="VD: nv.a@dao.edu.vn" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Mật khẩu khởi tạo" name="loginPassword" rules={[{ required: true }]}>
            <Input.Password placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ type: 'Teacher', status: 'Active', country: 'Việt Nam' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <Space align="center" size="middle">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/teachers')}
              style={{ color: 'var(--text-secondary)' }}
            />
            <div>
              <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
                Thêm Nhân sự mới
              </Title>
              <Text style={{ color: 'var(--text-secondary)' }}>
                Tạo hồ sơ cho Giáo viên hoặc Trợ giảng
              </Text>
            </div>
          </Space>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button size="large" onClick={() => navigate('/admin/teachers')}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
              disabled={!submittable}
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
            >
              Lưu hồ sơ
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'overview', label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Thông tin chung</span>, children: renderOverviewTab() },
            { key: 'address', label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><EnvironmentOutlined /> Địa chỉ & Liên hệ</span>, children: renderAddressTab() },
            { key: 'login', label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><LockOutlined /> Tài khoản Đăng nhập</span>, children: renderLoginTab() },
          ]}
          className="custom-tabs"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={loading}
            disabled={!submittable}
            style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
          >
            Lưu hồ sơ
          </Button>
        </div>
      </Form>
    </div>
  );
};

const CreateTeacher: React.FC = () => (
  <App>
    <CreateTeacherInner />
  </App>
);

export default CreateTeacher;
