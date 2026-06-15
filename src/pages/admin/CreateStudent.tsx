import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Space,
  message,
  Divider,
  Avatar,
  Upload,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  LockOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { PROVINCE_OPTIONS, DISTRICT_WARD_MAP } from '../../assets/vietnam_divisions';

const { Option } = Select;
const { TextArea } = Input;


const RELATIONSHIP_OPTIONS = ['Bố', 'Mẹ', 'Anh', 'Chị', 'Ông', 'Bà', 'Người giám hộ khác'];

export const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);

  // Watch fields for dynamic changes
  const birthdate = Form.useWatch('birthdate', form);
  const selectedProvince = Form.useWatch('province', form);
  const currentStatus = Form.useWatch('status', form) || 'Waiting for class';

  // Compute age from birthdate
  const age = birthdate
    ? dayjs().diff(dayjs(birthdate), 'year')
    : null;

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
  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        birthdate: values.birthdate ? values.birthdate.format('YYYY-MM-DD') : undefined,
        // Trim standard string fields
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        nickName: values.nickName?.trim() || undefined,
        mobile: values.mobile?.trim(),
        email: values.email?.trim() || undefined,
        parentGuardian1: values.parentGuardian1?.trim() || undefined,
        parentGuardian2: values.parentGuardian2?.trim() || undefined,
        parent1CitizenId: values.parent1CitizenId?.trim() || undefined,
        parent2CitizenId: values.parent2CitizenId?.trim() || undefined,
        studentCitizenId: values.studentCitizenId?.trim() || undefined,
        relationship1: values.relationship1 || undefined,
        relationship2: values.relationship2 || undefined,
        otherPhone1: values.otherPhone1?.trim() || undefined,
        otherPhone2: values.otherPhone2?.trim() || undefined,
        description: values.description?.trim() || undefined,
        country: values.country || 'Việt Nam',
        province: values.province || undefined,
        districtWard: values.districtWard || undefined,
        primaryAddress: values.primaryAddress?.trim(),
        oldAddress: values.oldAddress?.trim() || undefined,
        status: values.status || 'Waiting for class',
        // Optional login account
        loginEmail: values.loginEmail?.trim() || undefined,
        loginPassword: values.loginPassword || undefined,
        avatar: avatarBase64 || undefined,
      };

      const response = await api.post('/students', payload);
      message.success(`Đã tạo thành công học sinh: ${response.data.lastName} ${response.data.firstName} — Mã: ${response.data.studentId}`);
      form.resetFields();
      setActiveTab('overview');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(', '));
      } else {
        message.error(msg || 'Không thể tạo học sinh. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/students');
  };

  // Status tag colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting for class':
        return '#f59e0b';
      case 'Studying':
        return '#10b981';
      case 'Suspended':
        return '#ef4444';
      case 'Graduated':
        return '#6366f1';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'Waiting for class',
            country: 'Việt Nam',
          }}
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
              {/* Avatar Upload */}
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
                  Thêm Học sinh mới
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Mã học sinh:</span>
                  <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.88rem' }}>Auto generate</span>
                  <Divider type="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Trạng thái:</span>
                  <span style={{ color: getStatusColor(currentStatus), fontWeight: 600, fontSize: '0.88rem' }}>
                    {currentStatus === 'Waiting for class' ? 'Chờ xếp lớp' 
                     : currentStatus === 'Studying' ? 'Đang học' 
                     : currentStatus === 'Suspended' ? 'Tạm nghỉ' : 'Đã tốt nghiệp'}
                  </span>
                </div>
              </div>
            </div>

            <Space size="middle">
              <Button icon={<CloseOutlined />} onClick={handleCancel} style={{ background: 'transparent' }}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                disabled={!submittable}
                style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
              >
                Lưu hồ sơ
              </Button>
            </Space>
          </div>

          {/* Form Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: '24px' }}
            items={[
              {
                key: 'overview',
                label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Overview</span>,
                children: (
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={15}>
                      {/* Left: General Information */}
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><UserOutlined /> Thông tin cá nhân</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                      >
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item
                              name="lastName"
                              label="Họ đệm"
                              rules={[{ required: true, message: 'Vui lòng nhập họ đệm học sinh' }]}
                            >
                              <Input placeholder="Nguyễn Bình" prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item
                              name="firstName"
                              label="Tên"
                              rules={[{ required: true, message: 'Vui lòng nhập tên học sinh' }]}
                            >
                              <Input placeholder="Minh" prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="nickName" label="Biệt danh">
                              <Input placeholder="Minh Còi" prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item
                              name="gender"
                              label="Giới tính"
                              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            >
                              <Select placeholder="Chọn giới tính">
                                <Option value="Nam">Nam</Option>
                                <Option value="Nữ">Nữ</Option>
                                <Option value="Khác">Khác</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item
                              name="birthdate"
                              label="Ngày sinh"
                              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                            >
                              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item label="Tuổi">
                              <Input
                                value={age !== null ? `${age} tuổi` : 'Chưa nhập ngày sinh'}
                                disabled
                                style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24}>
                            <Form.Item name="studentCitizenId" label="Số CCCD học sinh">
                              <Input placeholder="046095001234" prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>

                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Thông tin Phụ huynh / Người giám hộ</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                      >
                        <Divider orientation={"left" as any} style={{ margin: '0 0 16px 0', borderColor: 'rgba(255,255,255,0.06)' }}>Người giám hộ 1</Divider>
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="parentGuardian1" label="Họ và tên">
                              <Input placeholder="Tên phụ huynh 1" prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="relationship1" label="Quan hệ">
                              <Select placeholder="Chọn mối quan hệ">
                                {RELATIONSHIP_OPTIONS.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="parent1CitizenId" label="Số CCCD">
                              <Input placeholder="Số CCCD" prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="otherPhone1" label="Số điện thoại phụ">
                              <Input placeholder="Số điện thoại phụ" prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider orientation={"left" as any} style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.06)' }}>Người giám hộ 2</Divider>
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="parentGuardian2" label="Họ và tên">
                              <Input placeholder="Tên phụ huynh 2" prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="relationship2" label="Quan hệ">
                              <Select placeholder="Chọn mối quan hệ">
                                {RELATIONSHIP_OPTIONS.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={12}>
                            <Form.Item name="parent2CitizenId" label="Số CCCD">
                              <Input placeholder="Số CCCD" prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                          <Col xs={12}>
                            <Form.Item name="otherPhone2" label="Số điện thoại phụ">
                              <Input placeholder="Số điện thoại phụ" prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    <Col xs={24} lg={9}>
                      {/* Right: Contact & Address Info */}
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><EnvironmentOutlined /> Liên lạc & Địa chỉ</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                      >
                        <Form.Item
                          name="mobile"
                          label="Số điện thoại chính"
                          rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }
                          ]}
                        >
                          <Input placeholder="0987654321" prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                        </Form.Item>

                        <Form.Item name="email" label="Địa chỉ Email">
                          <Input type="email" placeholder="example@gmail.com" prefix={<MailOutlined style={{ color: '#6b7280' }} />} />
                        </Form.Item>

                        <Form.Item name="country" label="Quốc gia">
                          <Input disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} />
                        </Form.Item>

                        <Form.Item name="province" label="Tỉnh / Thành phố">
                          <Select placeholder="Chọn Tỉnh/Thành phố">
                            {PROVINCE_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                          </Select>
                        </Form.Item>

                        <Form.Item name="districtWard" label="Phường / Xã">
                          <Select placeholder="Chọn Phường/Xã" disabled={!selectedProvince} showSearch>
                            {(DISTRICT_WARD_MAP[selectedProvince] || []).map((opt: string) => (
                              <Option key={opt} value={opt}>{opt}</Option>
                            ))}
                          </Select>
                        </Form.Item>

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
                        title={<span style={{ fontFamily: 'Outfit' }}><CalendarOutlined /> Ghi chú</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                      >
                        <Form.Item name="description" label="Ghi chú thêm về học sinh">
                          <TextArea rows={4} placeholder="Ghi chú về sức khỏe, học lực, năng khiếu..." />
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'login',
                label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><LockOutlined /> Student Login</span>,
                children: (
                  <Card
                    title={<span style={{ fontFamily: 'Outfit' }}><LockOutlined /> Tạo tài khoản đăng nhập học sinh</span>}
                    className="glass-panel"
                    style={{ maxWidth: '600px', margin: '0 auto', border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                  >
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                      Điền email và mật khẩu nếu bạn muốn tạo tài khoản đăng nhập cho học sinh này ngay lập tức. Học sinh có thể dùng tài khoản này để xem điểm, thời khóa biểu và tài liệu.
                    </p>

                    <Form.Item
                      name="loginEmail"
                      label="Email đăng nhập"
                      rules={[
                        { required: true, message: 'Vui lòng điền email đăng nhập' },
                        { type: 'email', message: 'Địa chỉ email không hợp lệ' },
                      ]}
                    >
                      <Input placeholder="student.login@gmail.com" prefix={<MailOutlined style={{ color: '#6b7280' }} />} />
                    </Form.Item>

                    <Form.Item
                      name="loginPassword"
                      label="Mật khẩu đăng nhập"
                      rules={[{ required: true, message: 'Vui lòng điền mật khẩu đăng nhập' }]}
                    >
                      <Input.Password placeholder="Mật khẩu (mặc định: student123)" prefix={<LockOutlined style={{ color: '#6b7280' }} />} />
                    </Form.Item>
                  </Card>
                ),
              },
              {
                key: 'membership',
                label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Membership</span>,
                children: (
                  <Card
                    title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Gán trạng thái và Lớp học</span>}
                    className="glass-panel"
                    style={{ maxWidth: '600px', margin: '0 auto', border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                  >
                    <Form.Item
                      name="status"
                      label="Trạng thái học sinh"
                      rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                      <Select placeholder="Chọn trạng thái">
                        <Option value="Waiting for class">Chờ xếp lớp (Waiting for class)</Option>
                        <Option value="Studying">Đang học (Studying)</Option>
                        <Option value="Suspended">Tạm nghỉ (Suspended)</Option>
                        <Option value="Graduated">Đã tốt nghiệp (Graduated)</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                ),
              },
            ]}
          />

          {/* Bottom Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Button icon={<CloseOutlined />} onClick={handleCancel} size="large" style={{ background: 'transparent' }}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={!submittable}
              size="large"
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none', padding: '0 32px' }}
            >
              Lưu hồ sơ
            </Button>
          </div>
        </Form>
    </div>
  );
};

export default CreateStudent;
