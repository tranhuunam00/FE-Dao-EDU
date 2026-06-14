import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, Select, DatePicker, Button, Card, Typography, Row, Col, Upload, Tabs, App, Space, Spin, Alert, ConfigProvider, theme, Avatar, Table, Tag
} from 'antd';
import { CameraOutlined, ArrowLeftOutlined, SaveOutlined, LockOutlined, UserOutlined, EnvironmentOutlined, DollarOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { PROVINCE_OPTIONS, getDistrictsOrWards } from '../../assets/vietnam_divisions';

const { Title, Text } = Typography;
const { Option } = Select;

const TeacherDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [teacher, setTeacher] = useState<any>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);

  // Wages report state
  const [wagesReport, setWagesReport] = useState<any>(null);
  const [wagesLoading, setWagesLoading] = useState(false);
  const [wagesDateRange, setWagesDateRange] = useState<[any, any]>([null, null]);

  const selectedProvince = Form.useWatch('province', form);
  const [districtOptions, setDistrictOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const { data } = await api.get(`/teachers/${id}`);
        setTeacher(data);
        form.setFieldsValue({
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          birthdate: data.birthdate ? dayjs(data.birthdate) : undefined,
          mobile: data.mobile,
          email: data.email,
          citizenId: data.citizenId,
          type: data.type,
          country: data.country || 'Việt Nam',
          province: data.province,
          districtWard: data.districtWard,
          primaryAddress: data.primaryAddress,
          status: data.status,
          loginEmail: data.loginEmail,
        });
        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Không thể tải thông tin nhân sự.');
        navigate('/admin/teachers');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTeacher();
  }, [id, form, message, navigate]);

  useEffect(() => {
    if (selectedProvince) {
      setDistrictOptions(getDistrictsOrWards(selectedProvince));
    } else {
      setDistrictOptions([]);
    }
  }, [selectedProvince]);

  const fetchWagesReport = async () => {
    if (!id) return;
    const [start, end] = wagesDateRange;
    if (!start || !end) {
      message.warning('Vui lòng chọn khoảng thời gian cần tính.');
      return;
    }
    setWagesLoading(true);
    try {
      const { data } = await api.get(`/teachers/${id}/wages-report`, {
        params: { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') },
      });
      setWagesReport(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo lương');
    } finally {
      setWagesLoading(false);
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

  const values = Form.useWatch([], form);
  useEffect(() => {
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
      };

      payload.loginEmail = values.loginEmail?.trim() || undefined;
      if (values.loginPassword) {
        payload.loginPassword = values.loginPassword || undefined;
      }

      if (avatarBase64) {
        payload.avatar = avatarBase64;
      }

      const res = await api.patch(`/teachers/${id}`, payload);
      setTeacher(res.data);
      form.setFieldsValue({
        loginEmail: res.data.loginEmail || values.loginEmail?.trim(),
        loginPassword: undefined,
      });
      message.success('Đã cập nhật thông tin nhân sự thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(', '));
      } else {
        message.error(msg || 'Không thể cập nhật nhân sự.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  const renderOverviewTab = () => (
    <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
      <Row gutter={24}>
        <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <Avatar
              size={160}
              src={avatarPreview}
              icon={!avatarPreview ? <UserOutlined style={{ fontSize: '64px' }} /> : undefined}
              style={{
                background: avatarPreview ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
          <Upload showUploadList={false} beforeUpload={() => false} onChange={handleAvatarChange} accept="image/*">
            <Button icon={<CameraOutlined />} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
              Cập nhật ảnh chân dung
            </Button>
          </Upload>
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
    <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
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
    <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
      <Alert
        message={teacher?.userId ? 'Cập nhật tài khoản đăng nhập' : 'Tạo tài khoản đăng nhập'}
        description={
          teacher?.userId
            ? 'Bỏ trống mật khẩu nếu không muốn thay đổi.'
            : 'Có thể bỏ trống cả hai trường nếu chưa muốn tạo tài khoản.'
        }
        type={teacher?.userId ? 'info' : 'warning'}
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Email đăng nhập"
            name="loginEmail"
            dependencies={['loginPassword']}
            rules={[
              { type: 'email' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (teacher?.userId && !value) {
                    return Promise.reject(new Error('Vui lòng nhập email đăng nhập'));
                  }
                  if (!teacher?.userId && getFieldValue('loginPassword') && !value) {
                    return Promise.reject(new Error('Vui lòng nhập email để tạo tài khoản'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="VD: nv.a@dao.edu.vn" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={teacher?.userId ? 'Mật khẩu mới' : 'Mật khẩu khởi tạo'}
            name="loginPassword"
            dependencies={['loginEmail']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!teacher?.userId && getFieldValue('loginEmail') && !value) {
                    return Promise.reject(new Error('Vui lòng nhập mật khẩu để tạo tài khoản'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={teacher?.userId ? 'Bỏ trống để giữ mật khẩu hiện tại' : 'Nhập mật khẩu'}
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <Space align="center" size="middle">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/teachers')}
              style={{ color: 'var(--text-secondary)' }}
            />
            <div>
              <Title level={3} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
                {teacher?.teacherId} - {teacher?.lastName} {teacher?.firstName}
              </Title>
              <Text style={{ color: 'var(--text-secondary)' }}>
                Cập nhật thông tin chi tiết nhân sự
              </Text>
            </div>
          </Space>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={saving}
              disabled={!submittable}
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'overview', label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Thông tin chung</span>, children: renderOverviewTab() },
            { key: 'address', label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><EnvironmentOutlined /> Địa chỉ & Liên hệ</span>, children: renderAddressTab() },
            { key: 'login', label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><LockOutlined /> Tài khoản Đăng nhập</span>, children: renderLoginTab() },
            {
              key: 'wages',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Tính lương</span>,
              children: (
                <div>
                  <Card
                    title={<span style={{ fontFamily: 'Outfit' }}><DollarOutlined /> Tính lương theo khoảng thời gian</span>}
                    className="glass-panel"
                    style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 16 }}
                  >
                    <Space size="middle" wrap>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: 8, fontSize: '13px' }}>Khoảng thời gian:</span>
                        <DatePicker.RangePicker
                          value={wagesDateRange}
                          onChange={(vals) => setWagesDateRange(vals as [any, any])}
                          format="DD/MM/YYYY"
                          placeholder={['Từ ngày', 'Đến ngày']}
                        />
                      </div>
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={fetchWagesReport}
                        loading={wagesLoading}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                      >
                        Tính lương
                      </Button>
                    </Space>
                  </Card>

                  {wagesReport && (
                    <>
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col xs={12} md={8}>
                          <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: 4 }}>Tổng buổi dạy</div>
                            <div style={{ color: '#6366f1', fontSize: '24px', fontWeight: 700 }}>{wagesReport.totalSessions}</div>
                          </Card>
                        </Col>
                        <Col xs={12} md={8}>
                          <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: 4 }}>Tổng buổi tính lương</div>
                            <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>{wagesReport.totalSessions}</div>
                          </Card>
                        </Col>
                        <Col xs={12} md={8}>
                          <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: 4 }}>Tổng lương</div>
                            <div style={{ color: '#f59e0b', fontSize: '22px', fontWeight: 700 }}>
                              {(wagesReport.totalAmount || 0).toLocaleString('vi-VN')}&nbsp;₫
                            </div>
                          </Card>
                        </Col>
                      </Row>
                      <Card
                        title={<span style={{ fontFamily: 'Outfit' }}><DollarOutlined /> Lịch sử đơn giá lương áp dụng trong kỳ</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 16 }}
                      >
                        <Table
                          dataSource={wagesReport.pricingHistory || []}
                          rowKey="id"
                          pagination={false}
                          size="small"
                          columns={[
                            { title: 'Level', dataIndex: 'levelName', key: 'levelName' },
                            {
                              title: 'Lương giáo viên / buổi',
                              dataIndex: 'teacherWagePerSession',
                              render: (v: number) => <Text strong style={{ color: '#fbbf24' }}>{Number(v).toLocaleString()}đ</Text>,
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
                        title={<span style={{ fontFamily: 'Outfit' }}>Chi tiết từng buổi dạy</span>}
                        className="glass-panel"
                        style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}
                      >
                        <Table
                          dataSource={wagesReport.sessions || []}
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
                              title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
                              render: (v: string) => <Tag color={v === 'Completed' ? 'success' : v === 'Cancelled' ? 'error' : 'blue'}>
                                {v === 'Completed' ? 'Hoàn thành' : v === 'Cancelled' ? 'Nghỉ' : 'Chưa dạy'}
                              </Tag>,
                            },
                            {
                              title: 'Lương/buổi', key: 'rate', width: 180,
                              render: (_: any, r: any) => (
                                <div>
                                  <Text style={{ color: '#a5b4fc' }}>{(r.rate || 0).toLocaleString('vi-VN')}&nbsp;₫</Text>
                                  {r.pricingEffectiveFrom && (
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                      {`Lương áp dụng: ${dayjs(r.pricingEffectiveFrom).format('DD/MM/YY')}${r.pricingEffectiveTo ? ` - ${dayjs(r.pricingEffectiveTo).format('DD/MM/YY')}` : ' +'}`}
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
                                  {(wagesReport.totalAmount || 0).toLocaleString('vi-VN')}&nbsp;₫
                                </Text>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          )}
                        />
                      </Card>
                    </>
                  )}

                  {!wagesReport && !wagesLoading && (
                    <Alert
                      type="info"
                      showIcon
                      message="Hướng dẫn"
                      description="Chọn khoảng thời gian và nhấn 'Tính lương' để xem báo cáo chi tiết lương giáo viên theo từng buổi dạy hoàn thành và mức lương hiệu lực tại thời điểm đó."
                      style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                    />
                  )}
                </div>
              ),
            },
          ]}
          className="custom-tabs"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={saving}
            disabled={!submittable}
            style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </div>
  );
};

const TeacherDetail: React.FC = () => (
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
      <TeacherDetailInner />
    </App>
  </ConfigProvider>
);

export default TeacherDetail;
