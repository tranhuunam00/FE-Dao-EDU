import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ConfigProvider,
  Form,
  Input,
  Select,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  theme,
  message,
  Divider,
  Avatar,
  Upload,
} from 'antd';
import {
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  LockOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { PROVINCE_OPTIONS, DISTRICT_WARD_MAP } from '../../assets/vietnam_divisions';

const { Option } = Select;
const { TextArea } = Input;

export const StudentProfile: React.FC = () => {
  const { } = useAuth();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);

  const selectedProvince = Form.useWatch('province', form);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me');
      const data = res.data;
      setProfile(data);
      setAvatarPreview(data.avatar);
      setAvatarBase64(data.avatar);

      // Điền các trường editable
      form.setFieldsValue({
        email: data.email || '',
        mobile: data.mobile || '',
        otherPhone1: data.otherPhone1 || '',
        otherPhone2: data.otherPhone2 || '',
        country: data.country || 'Việt Nam',
        province: data.province || undefined,
        districtWard: data.districtWard || undefined,
        primaryAddress: data.primaryAddress || '',
        oldAddress: data.oldAddress || '',
        loginPassword: '',
      });
    } catch (err: any) {
      message.error('Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const values = Form.useWatch([], form);
  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const handleSave = async (formValues: any) => {
    try {
      setSaving(true);
      
      const updateData: any = {
        email: formValues.email,
        mobile: formValues.mobile,
        otherPhone1: formValues.otherPhone1,
        otherPhone2: formValues.otherPhone2,
        province: formValues.province,
        districtWard: formValues.districtWard,
        primaryAddress: formValues.primaryAddress,
        oldAddress: formValues.oldAddress,
        avatar: avatarBase64,
      };
      
      if (formValues.loginPassword) {
        updateData.loginPassword = formValues.loginPassword;
      }
      
      await api.put('/students/me', updateData);
      message.success('Cập nhật hồ sơ thành công!');
      fetchProfile();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setSaving(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting for class': return '#f59e0b';
      case 'Studying': return '#10b981';
      case 'Suspended': return '#ef4444';
      case 'Graduated': return '#6366f1';
      default: return '#9ca3af';
    }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>;

  return (
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Header Action Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <Avatar
                  size={72}
                  src={avatarPreview}
                  icon={!avatarPreview ? <UserOutlined /> : undefined}
                  style={{
                    background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: '3px solid rgba(99, 102, 241, 0.4)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                  }}
                />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleAvatarChange}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    <CameraOutlined style={{ fontSize: '12px', color: '#fff' }} />
                  </div>
                </Upload>
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
                  {profile?.lastName} {profile?.firstName} {profile?.nickName ? `(${profile.nickName})` : ''}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Mã học sinh:</span>
                  <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.88rem' }}>{profile?.studentId}</span>
                  <Divider type="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Trạng thái:</span>
                  <span style={{ color: getStatusColor(profile?.status), fontWeight: 600, fontSize: '0.88rem' }}>
                    {profile?.status === 'Waiting for class' ? 'Chờ xếp lớp' 
                     : profile?.status === 'Studying' ? 'Đang học' 
                     : profile?.status === 'Suspended' ? 'Tạm nghỉ' : 'Đã tốt nghiệp'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!submittable}
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
            >
              Cập nhật hồ sơ
            </Button>
          </div>

          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Hồ sơ cơ bản</span>,
                children: (
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><UserOutlined /> Thông tin cá nhân (Đã khóa)</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                      >
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item label="Họ đệm">
                              <Input value={profile?.lastName} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item label="Tên">
                              <Input value={profile?.firstName} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item label="Giới tính">
                              <Input value={profile?.gender} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item label="Ngày sinh">
                              <Input value={profile?.birthdate} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24}>
                            <Form.Item label="Số CCCD / Mã định danh">
                              <Input value={profile?.studentCitizenId || 'Chưa cập nhật'} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                      
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Thông tin Người giám hộ (Đã khóa)</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                      >
                         <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item label={`Người giám hộ 1 (${profile?.relationship1 || 'Không rõ'})`}>
                              <Input value={profile?.parentGuardian1 || 'Chưa cập nhật'} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item label="CCCD Người giám hộ 1">
                              <Input value={profile?.parent1CitizenId || 'Chưa cập nhật'} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item label={`Người giám hộ 2 (${profile?.relationship2 || 'Không rõ'})`}>
                              <Input value={profile?.parentGuardian2 || 'Chưa cập nhật'} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item label="CCCD Người giám hộ 2">
                              <Input value={profile?.parent2CitizenId || 'Chưa cập nhật'} disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><EnvironmentOutlined /> Liên lạc & Địa chỉ (Có thể sửa)</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                      >
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item
                              name="mobile"
                              label="Số điện thoại cá nhân"
                              rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }
                              ]}
                            >
                              <Input placeholder="0987654321" prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="email" label="Địa chỉ Email">
                              <Input type="email" placeholder="example@gmail.com" prefix={<MailOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="otherPhone1" label="SĐT phụ (Người giám hộ 1)">
                              <Input placeholder="SĐT phụ huynh 1" prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="otherPhone2" label="SĐT phụ (Người giám hộ 2)">
                              <Input placeholder="SĐT phụ huynh 2" prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="province" label="Tỉnh / Thành phố">
                              <Select placeholder="Chọn Tỉnh/Thành phố">
                                {PROVINCE_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="districtWard" label="Phường / Xã">
                              <Select placeholder="Chọn Phường/Xã" disabled={!selectedProvince} showSearch>
                                {(DISTRICT_WARD_MAP[selectedProvince] || []).map((opt: string) => (
                                  <Option key={opt} value={opt}>{opt}</Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          name="primaryAddress"
                          label="Địa chỉ chi tiết (Thường trú)"
                          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
                        >
                          <TextArea rows={2} placeholder="Số nhà, Tên đường..." />
                        </Form.Item>

                        <Form.Item name="oldAddress" label="Địa chỉ cũ (nếu có)">
                          <TextArea rows={1} placeholder="Địa chỉ cũ" />
                        </Form.Item>
                      </Card>

                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><LockOutlined /> Bảo mật tài khoản</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                      >
                        <Form.Item
                          name="loginPassword"
                          label="Đổi mật khẩu mới (Bỏ trống nếu không đổi)"
                        >
                          <Input.Password placeholder="Nhập mật khẩu mới..." prefix={<LockOutlined style={{ color: '#6b7280' }} />} />
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                ),
              }
            ]}
          />
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default StudentProfile;
