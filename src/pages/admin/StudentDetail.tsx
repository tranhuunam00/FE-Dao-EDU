import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ConfigProvider,
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
  theme,
  App,
  Divider,
  Avatar,
  Upload,
  Spin,
  Tag,
  Table,
  Modal,
  Typography,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  LockOutlined,
  CameraOutlined,
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { PROVINCE_OPTIONS, DISTRICT_WARD_MAP } from '../../assets/vietnam_divisions';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const RELATIONSHIP_OPTIONS = ['Bố', 'Mẹ', 'Anh', 'Chị', 'Ông', 'Bà', 'Người giám hộ khác'];

interface StudentDetailData {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  gender: string;
  mobile: string;
  email?: string;
  birthdate: string;
  parentGuardian1?: string;
  parentGuardian2?: string;
  parent1CitizenId?: string;
  parent2CitizenId?: string;
  studentCitizenId?: string;
  relationship1?: string;
  relationship2?: string;
  otherPhone1?: string;
  otherPhone2?: string;
  description?: string;
  country?: string;
  province?: string;
  districtWard?: string;
  primaryAddress: string;
  oldAddress?: string;
  status: string;
  avatar?: string;
  loginEmail?: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Waiting for class': return '#f59e0b';
    case 'Studying': return '#10b981';
    case 'Suspended': return '#ef4444';
    case 'Graduated': return '#6366f1';
    default: return '#9ca3af';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Waiting for class': return 'Chờ xếp lớp';
    case 'Studying': return 'Đang học';
    case 'Suspended': return 'Tạm nghỉ';
    case 'Graduated': return 'Đã tốt nghiệp';
    default: return status;
  }
};

const StudentDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();

  const [student, setStudent] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('overview');

  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [isAddClassVisible, setIsAddClassVisible] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Tuition report state
  const [tuitionReport, setTuitionReport] = useState<any>(null);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [tuitionDateRange, setTuitionDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  const fetchStudentClasses = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/students/${id}/classes`);
      setStudentClasses(data);
    } catch (err) {
      console.error('Error fetching student classes:', err);
    }
  };

  const fetchAllClasses = async () => {
    try {
      const { data } = await api.get('/classes?limit=1000');
      setAllClasses(data.classes || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchTuitionReport = async () => {
    if (!id) return;
    const [start, end] = tuitionDateRange;
    if (!start || !end) {
      message.warning('Vui lòng chọn khoảng thời gian cần tính.');
      return;
    }
    setTuitionLoading(true);
    try {
      const { data } = await api.get(`/students/${id}/tuition-report`, {
        params: { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') },
      });
      setTuitionReport(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo học phí');
    } finally {
      setTuitionLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/students/${id}`);
      const data: StudentDetailData = res.data;
      setStudent(data);
      setAvatarPreview(data.avatar || undefined);

      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        nickName: data.nickName,
        gender: data.gender,
        mobile: data.mobile,
        email: data.email,
        birthdate: data.birthdate ? dayjs(data.birthdate) : undefined,
        parentGuardian1: data.parentGuardian1,
        parentGuardian2: data.parentGuardian2,
        parent1CitizenId: data.parent1CitizenId,
        parent2CitizenId: data.parent2CitizenId,
        studentCitizenId: data.studentCitizenId,
        relationship1: data.relationship1,
        relationship2: data.relationship2,
        otherPhone1: data.otherPhone1,
        otherPhone2: data.otherPhone2,
        description: data.description,
        country: data.country || 'Việt Nam',
        province: data.province,
        districtWard: data.districtWard,
        primaryAddress: data.primaryAddress,
        oldAddress: data.oldAddress,
        status: data.status,
        loginEmail: data.loginEmail,
      });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin học sinh.');
      navigate('/admin/students');
    }
  };

  const handleAddClass = async () => {
    if (!selectedClassId || !id) return;
    try {
      await api.post(`/classes/${selectedClassId}/students`, { studentId: id });
      message.success('Đã thêm học sinh vào lớp thành công!');
      setIsAddClassVisible(false);
      setSelectedClassId(null);
      await Promise.all([fetchStudentClasses(), fetchStudentProfile()]);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi thêm học sinh vào lớp');
    }
  };

  const handleRemoveClass = (classId: string, className: string) => {
    modal.confirm({
      title: 'Xác nhận xóa học sinh khỏi lớp',
      content: `Bạn có chắc muốn xóa học sinh khỏi lớp "${className}"? Trạng thái sẽ chuyển sang Dropped.`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/classes/${classId}/students/${id}`);
          message.success('Đã xóa học sinh khỏi lớp thành công!');
          await Promise.all([fetchStudentClasses(), fetchStudentProfile()]);
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi xóa học sinh khỏi lớp');
        }
      }
    });
  };

  const selectedProvince = Form.useWatch('province', form);
  const currentStatus = Form.useWatch('status', form);
  const birthdate = Form.useWatch('birthdate', form);
  const age = birthdate ? dayjs().diff(dayjs(birthdate), 'year') : null;

  // Fetch student details
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStudentProfile(), fetchStudentClasses()]);
      setLoading(false);
    };
    if (id) {
      loadAll();
      fetchAllClasses();
    }
  }, [id]);

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
    setSaving(true);
    try {
      const payload: any = {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        nickName: values.nickName?.trim() || undefined,
        gender: values.gender,
        mobile: values.mobile?.trim(),
        email: values.email?.trim() || undefined,
        birthdate: values.birthdate ? values.birthdate.format('YYYY-MM-DD') : undefined,
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
        status: values.status,
        loginEmail: values.loginEmail?.trim() || undefined,
        loginPassword: values.loginPassword || undefined,
      };

      if (avatarBase64) {
        payload.avatar = avatarBase64;
      }

      const res = await api.patch(`/students/${id}`, payload);
      setStudent(res.data);
      message.success('Đã cập nhật thông tin học sinh thành công!');
      setAvatarBase64(undefined);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(', '));
      } else {
        message.error(msg || 'Không thể cập nhật. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin học sinh..." />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Avatar with upload */}
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

            {/* Student info header */}
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
                {student.lastName} {student.firstName}
                {student.nickName && (
                  <span style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>
                    ({student.nickName})
                  </span>
                )}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    padding: '2px 10px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {student.studentId}
                </span>
                <Tag
                  color={getStatusColor(currentStatus || student.status) === '#f59e0b' ? 'warning'
                    : getStatusColor(currentStatus || student.status) === '#10b981' ? 'success'
                    : getStatusColor(currentStatus || student.status) === '#ef4444' ? 'error'
                    : 'processing'}
                >
                  {getStatusLabel(currentStatus || student.status)}
                </Tag>
                {student.loginEmail && (
                  <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>
                    ✓ Có tài khoản đăng nhập
                  </span>
                )}
              </div>
            </div>
          </div>

          <Space size="middle">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/students')}
              style={{ background: 'transparent' }}
            >
              Quay lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!submittable}
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '24px' }}
          items={[
            {
              key: 'overview',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Thông tin</span>,
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={15}>
                    {/* Personal Info */}
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
                            rules={[{ required: true, message: 'Vui lòng nhập họ đệm' }]}
                          >
                            <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            name="firstName"
                            label="Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                          >
                            <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Item name="nickName" label="Biệt danh">
                            <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                            <Select>
                              <Option value="Nam">Nam</Option>
                              <Option value="Nữ">Nữ</Option>
                              <Option value="Khác">Khác</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Item name="birthdate" label="Ngày sinh" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item label="Tuổi">
                            <Input
                              value={age !== null ? `${age} tuổi` : '—'}
                              disabled
                              style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="studentCitizenId" label="Số CCCD học sinh">
                        <Input prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                      </Form.Item>
                    </Card>

                    {/* Guardian Info */}
                    <Card
                      title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Phụ huynh / Người giám hộ</span>}
                      className="glass-panel"
                      style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                    >
                      <Divider orientation={'left' as any} style={{ margin: '0 0 16px 0', borderColor: 'rgba(255,255,255,0.06)' }}>Người giám hộ 1</Divider>
                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Item name="parentGuardian1" label="Họ và tên">
                            <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name="relationship1" label="Quan hệ">
                            <Select placeholder="Chọn mối quan hệ" allowClear>
                              {RELATIONSHIP_OPTIONS.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Item name="parent1CitizenId" label="Số CCCD">
                            <Input prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name="otherPhone1" label="Số điện thoại phụ">
                            <Input prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation={'left' as any} style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.06)' }}>Người giám hộ 2</Divider>
                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Item name="parentGuardian2" label="Họ và tên">
                            <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name="relationship2" label="Quan hệ">
                            <Select placeholder="Chọn mối quan hệ" allowClear>
                              {RELATIONSHIP_OPTIONS.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={12}>
                          <Form.Item name="parent2CitizenId" label="Số CCCD">
                            <Input prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name="otherPhone2" label="Số điện thoại phụ">
                            <Input prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  <Col xs={24} lg={9}>
                    {/* Contact & Address */}
                    <Card
                      title={<span style={{ fontFamily: 'Outfit' }}><EnvironmentOutlined /> Liên lạc & Địa chỉ</span>}
                      className="glass-panel"
                      style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                    >
                      <Form.Item
                        name="mobile"
                        label="Số điện thoại chính"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                      >
                        <Input prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
                      </Form.Item>

                      <Form.Item name="email" label="Địa chỉ Email">
                        <Input type="email" prefix={<MailOutlined style={{ color: '#6b7280' }} />} />
                      </Form.Item>

                      <Form.Item name="country" label="Quốc gia">
                        <Input disabled style={{ background: 'rgba(0,0,0,0.2)', color: '#9ca3af' }} />
                      </Form.Item>

                      <Form.Item name="province" label="Tỉnh / Thành phố">
                        <Select placeholder="Chọn Tỉnh/Thành phố" allowClear showSearch optionFilterProp="children">
                          {PROVINCE_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                        </Select>
                      </Form.Item>

                      <Form.Item name="districtWard" label="Phường / Xã">
                        <Select placeholder="Chọn Phường/Xã" disabled={!selectedProvince} allowClear showSearch>
                          {(DISTRICT_WARD_MAP[selectedProvince] || []).map((opt: string) => (
                            <Option key={opt} value={opt}>{opt}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="primaryAddress"
                        label="Địa chỉ chi tiết (Thường trú)"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                      >
                        <TextArea rows={2} />
                      </Form.Item>

                      <Form.Item name="oldAddress" label="Địa chỉ cũ (nếu có)">
                        <TextArea rows={1} />
                      </Form.Item>
                    </Card>

                    {/* Notes */}
                    <Card
                      title={<span style={{ fontFamily: 'Outfit' }}><CalendarOutlined /> Ghi chú</span>}
                      className="glass-panel"
                      style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                    >
                      <Form.Item name="description" label="Ghi chú về học sinh">
                        <TextArea rows={4} placeholder="Sức khỏe, học lực, năng khiếu..." />
                      </Form.Item>
                    </Card>

                    {/* Meta info */}
                    <Card
                      className="glass-panel"
                      style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginTop: '24px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Ngày tạo:</span>
                          <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>
                            {dayjs(student.createdAt).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Cập nhật lần cuối:</span>
                          <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>
                            {dayjs(student.updatedAt).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'login',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><LockOutlined /> Tài khoản</span>,
              children: (
                <Card
                  title={<span style={{ fontFamily: 'Outfit' }}><LockOutlined /> Tài khoản đăng nhập học sinh</span>}
                  className="glass-panel"
                  style={{ maxWidth: '600px', margin: '0 auto', border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                >
                  {student.loginEmail ? (
                    <div
                      style={{
                        background: 'rgba(74, 222, 128, 0.08)',
                        border: '1px solid rgba(74, 222, 128, 0.2)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        color: '#4ade80',
                        fontSize: '0.9rem',
                      }}
                    >
                      ✓ Học sinh này đã có tài khoản đăng nhập: <strong>{student.loginEmail}</strong>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        color: '#f59e0b',
                        fontSize: '0.9rem',
                      }}
                    >
                      ⚠ Học sinh này chưa có tài khoản đăng nhập. Điền email và mật khẩu để tạo tài khoản.
                    </div>
                  )}

                  <Form.Item
                    name="loginEmail"
                    label="Email đăng nhập"
                    rules={[
                      { required: true, message: 'Vui lòng điền email đăng nhập' },
                      { type: 'email', message: 'Địa chỉ email không hợp lệ' }
                    ]}
                  >
                    <Input
                      placeholder="student.login@gmail.com"
                      prefix={<MailOutlined style={{ color: '#6b7280' }} />}
                    />
                  </Form.Item>

                  <Form.Item name="loginPassword" label="Mật khẩu mới (để trống nếu không đổi)">
                    <Input.Password
                      placeholder="Nhập mật khẩu mới..."
                      prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                    />
                  </Form.Item>
                </Card>
              ),
            },
            {
              key: 'membership',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Trạng thái</span>,
              children: (
                <Card
                  title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Trạng thái học sinh</span>}
                  className="glass-panel"
                  style={{ maxWidth: '600px', margin: '0 auto', border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                >
                  <Form.Item
                    name="status"
                    label="Trạng thái học tập"
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
            {
              key: 'classes',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Lớp học ({studentClasses.filter(c => c.status === 'Active').length})</span>,
              children: (
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Danh sách Lớp học tham gia</span>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddClassVisible(true)}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                      >
                        Thêm vào lớp
                      </Button>
                    </div>
                  }
                  className="glass-panel"
                  style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                >
                  <Table
                    dataSource={studentClasses}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Mã lớp',
                        dataIndex: ['classEntity', 'classCode'],
                        key: 'classCode',
                        render: (text, record: any) => (
                          <Button
                            type="link"
                            onClick={() => navigate(`/admin/classes/${record.classId}`)}
                            style={{ padding: 0, height: 'auto', fontWeight: 600, color: '#818cf8' }}
                          >
                            {text}
                          </Button>
                        ),
                      },
                      {
                        title: 'Tên lớp',
                        dataIndex: ['classEntity', 'className'],
                        key: 'className',
                      },
                      {
                        title: 'Khóa học',
                        dataIndex: ['classEntity', 'course', 'name'],
                        key: 'courseName',
                      },
                      {
                        title: 'Trung tâm',
                        dataIndex: ['classEntity', 'center', 'name'],
                        key: 'centerName',
                      },
                      {
                        title: 'Ngày tham gia',
                        dataIndex: 'joinedDate',
                        key: 'joinedDate',
                        render: (v) => dayjs(v).format('DD/MM/YYYY'),
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s) => (
                          <Tag color={s === 'Active' ? 'green' : 'red'}>
                            {s === 'Active' ? 'Đang học' : 'Đã dừng học (Dropped)'}
                          </Tag>
                        )
                      },
                      {
                        title: 'Hành động',
                        key: 'action',
                        width: 80,
                        render: (_, record) => record.status === 'Active' && (
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveClass(record.classId, record.classEntity.className)}
                          />
                        )
                      }
                    ]}
                  />
                </Card>
              )
            },
            {
              key: 'tuition',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Tính học phí</span>,
              children: (
                <div>
                  <Card
                    title={<span style={{ fontFamily: 'Outfit' }}><DollarOutlined /> Tính học phí theo khoảng thời gian</span>}
                    className="glass-panel"
                    style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 16 }}
                  >
                    <Space size="middle" wrap>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: 8, fontSize: '13px' }}>Khoảng thời gian:</span>
                        <DatePicker.RangePicker
                          value={tuitionDateRange}
                          onChange={(vals) => setTuitionDateRange(vals as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                          format="DD/MM/YYYY"
                          placeholder={['Từ ngày', 'Đến ngày']}
                        />
                      </div>
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={fetchTuitionReport}
                        loading={tuitionLoading}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                      >
                        Tính học phí
                      </Button>
                    </Space>
                  </Card>

                  {tuitionReport && (
                    <>
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col xs={12} md={8}>
                          <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: 4 }}>Tổng buổi có mặt (tính tiền)</div>
                            <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>{tuitionReport.totalSessions}</div>
                          </Card>
                        </Col>
                        <Col xs={12} md={8}>
                          <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: 4 }}>Tổng buổi đã hoàn thành</div>
                            <div style={{ color: '#6366f1', fontSize: '24px', fontWeight: 700 }}>{(tuitionReport.sessions || []).length}</div>
                          </Card>
                        </Col>
                        <Col xs={12} md={8}>
                          <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: 4 }}>Tổng học phí</div>
                            <div style={{ color: '#f59e0b', fontSize: '22px', fontWeight: 700 }}>
                              {(tuitionReport.totalAmount || 0).toLocaleString('vi-VN')}&nbsp;₫
                            </div>
                          </Card>
                        </Col>
                      </Row>
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><DollarOutlined /> Lịch sử đơn giá chương trình học áp dụng trong kỳ</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 16 }}
                      >
                        <Table
                          dataSource={tuitionReport.pricingHistory || []}
                          rowKey="id"
                          pagination={false}
                          size="small"
                          columns={[
                            { title: 'Level', dataIndex: 'levelName', key: 'levelName' },
                            {
                              title: 'Đơn giá học viên',
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
                      </Card>
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}>Chi tiết từng buổi học</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                      >
                        <Table
                          dataSource={tuitionReport.sessions || []}
                          rowKey="id"
                          pagination={{ pageSize: 15 }}
                          size="small"
                          columns={[
                            { title: 'Ngày', dataIndex: 'date', key: 'date', width: 120, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                            { title: 'Lớp học', dataIndex: 'className', key: 'className' },
                            {
                              title: 'Chương trình & Level', key: 'course',
                              render: (_: any, r: any) => (
                                <div>
                                  <Text strong style={{ color: '#fff' }}>{r.courseName || '-'}</Text>
                                  <div style={{ fontSize: '11px', color: '#818cf8' }}>Level: {r.levelName || '-'}</div>
                                </div>
                              ),
                            },
                            {
                              title: 'Trạng thái', dataIndex: 'isPresent', key: 'isPresent', width: 120,
                              render: (v: boolean) => v ? <Tag color="success">✓ Có mặt</Tag> : <Tag color="error">✗ Vắng mặt</Tag>,
                            },
                            {
                              title: 'Giá/buổi', key: 'rate', width: 180,
                              render: (_: any, r: any) => (
                                <div>
                                  <Text style={{ color: '#a5b4fc' }}>{(r.rate || 0).toLocaleString('vi-VN')}&nbsp;₫</Text>
                                  {r.pricingEffectiveFrom && (
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                      {`Giá áp dụng: ${dayjs(r.pricingEffectiveFrom).format('DD/MM/YY')}${r.pricingEffectiveTo ? ` - ${dayjs(r.pricingEffectiveTo).format('DD/MM/YY')}` : ' +'}`}
                                    </div>
                                  )}
                                </div>
                              ),
                            },
                            {
                              title: 'Thành tiền', dataIndex: 'amount', key: 'amount', width: 140,
                              render: (v: number) => <Text strong style={{ color: '#f59e0b' }}>{(v || 0).toLocaleString('vi-VN')}&nbsp;₫</Text>,
                            },
                          ]}
                          summary={() => (
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={5}>
                                <Text strong style={{ color: '#fff' }}>Tổng cộng</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1}>
                                <Text strong style={{ color: '#f59e0b', fontSize: '16px' }}>
                                  {(tuitionReport.totalAmount || 0).toLocaleString('vi-VN')}&nbsp;₫
                                </Text>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          )}
                        />
                      </Card>
                    </>
                  )}

                  {!tuitionReport && !tuitionLoading && (
                    <Alert
                      type="info"
                      showIcon
                      message="Hướng dẫn"
                      description="Chọn khoảng thời gian và nhấn 'Tính học phí' để xem báo cáo chi tiết học phí theo từng buổi học có mặt và mức giá hiệu lực tại thời điểm buổi học đó."
                      style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />

        {/* Bottom Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            ID: <code style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{id}</code>
          </span>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/students')} style={{ background: 'transparent' }}>
              Quay lại danh sách
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!submittable}
              size="large"
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none', padding: '0 32px' }}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Form>

      {/* Add Class Modal */}
      <Modal
        title="Thêm Học sinh vào Lớp học"
        open={isAddClassVisible}
        onOk={handleAddClass}
        onCancel={() => setIsAddClassVisible(false)}
        okText="Thêm vào lớp"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ padding: '12px 0' }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>Chọn lớp học hoạt động từ hệ thống:</Text>
          <Select
            placeholder="Tìm theo Tên hoặc Mã lớp học..."
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            onChange={setSelectedClassId}
            value={selectedClassId}
          >
            {allClasses
              .filter(c => c.status === 'Active' && !studentClasses.some(sc => sc.classId === c.id && sc.status === 'Active'))
              .map(c => (
                <Option key={c.id} value={c.id}>
                  {c.className} ({c.classCode}) - {c.center?.name || 'Không có trung tâm'}
                </Option>
              ))
            }
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export const StudentDetail: React.FC = () => {
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
      <App>
        <StudentDetailInner />
      </App>
    </ConfigProvider>
  );
};

export default StudentDetail;
