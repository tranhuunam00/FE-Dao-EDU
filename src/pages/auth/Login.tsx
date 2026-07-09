import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../../context/AuthContext';
import {
  ConfigProvider,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  theme,
  App,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
  BookOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const quickDevAccounts = {
  [Role.ADMIN]: {
    email: 'admin@dao.edu.vn',
    password: '123456',
    label: 'Quản trị viên (Admin)',
  },
  [Role.TEACHER]: {
    email: 'linh.nguyen@dao.edu.vn',
    password: '123456',
    label: 'Giáo viên (Teacher)',
  },
  [Role.STUDENT]: {
    email: 'an.nguyen@student.dao.edu.vn',
    password: '123456',
    label: 'Học viên (Student)',
  },
};

const LoginInner: React.FC = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp(); // Dùng hook message của App để nhận đúng context theme tối

  const handleLoginSubmit = async (values: any) => {
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      message.success(`Đăng nhập thành công! Chào mừng ${user.name}`);
      redirectUser(user.role);
    } catch (err: any) {
      message.error(err.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại.');
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

  const handleQuickLogin = async (role: Role) => {
    setLoading(true);
    const account = quickDevAccounts[role];

    try {
      const user = await login(account.email, account.password);
      message.success(`Đăng nhập nhanh thành công!`);
      redirectUser(user.role);
    } catch (err: any) {
      message.error(err.message || 'Lỗi đăng nhập nhanh');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        navigate('/admin');
        break;
      case Role.TEACHER:
        navigate('/teacher');
        break;
      case Role.STUDENT:
        navigate('/student');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative ambient glows */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0) 70%)',
        zIndex: 0
      }} />
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 2,
          color: '#c7d2fe',
          fontWeight: 600,
        }}
      >
        Giới thiệu & hướng dẫn sử dụng
      </Link>

      <div style={{
        maxWidth: '980px', width: '100%', zIndex: 1
      }}>
        <Row gutter={[32, 32]} justify="center" align="stretch">
          {/* Main Login Card */}
          <Col xs={24} md={13} style={{ display: 'flex' }}>
            <Card
              className="glass-panel"
              style={{
                width: '100%',
                border: 'none',
                background: 'rgba(17, 24, 39, 0.95)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                padding: '16px'
              }}
            >
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
                }}>
                  <BookOutlined style={{ fontSize: '24px' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, color: '#fff' }}>DAO EDU</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cổng học tập trực tuyến</span>
                </div>
              </div>

              <Title level={3} style={{ color: '#fff', marginBottom: '8px', fontFamily: 'Outfit' }}>Đăng nhập</Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '24px' }}>
                Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập của bạn.
              </Text>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleLoginSubmit}
                requiredMark={false}
              >
                <Form.Item
                  name="email"
                  label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><MailOutlined /> Email đăng nhập</span>}
                  rules={[
                    { required: true, message: 'Vui lòng điền email' },
                    { type: 'email', message: 'Email không đúng định dạng' }
                  ]}
                >
                  <Input
                    id="login-email"
                    placeholder="admin@dao.edu.vn"
                    size="large"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><LockOutlined /> Mật khẩu</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' }
                  ]}
                >
                  <Input.Password
                    id="login-password"
                    placeholder="••••••••"
                    size="large"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '28px', marginBottom: 0 }}>
                  <Button
                    id="login-submit"
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    disabled={!submittable}
                    style={{
                      width: '100%',
                      height: '48px',
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
                    }}
                  >
                    Đăng nhập hệ thống {!loading && <ArrowRightOutlined />}
                  </Button>
                </Form.Item>
              </Form>
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Phiên bản {import.meta.env.VITE_APP_VERSION || 'v1.0.0'}
              </div>
            </Card>
          </Col>

            {/* Developer Sandbox Panel */}
            <Col xs={24} md={11} style={{ display: 'flex' }}>
              <Card
                className="glass-panel"
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'rgba(99, 102, 241, 0.06)',
                  borderColor: 'rgba(99, 102, 241, 0.12)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary)' }}>
                  <SafetyOutlined style={{ fontSize: '22px' }} />
                  <Title level={4} style={{ margin: 0, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 700 }}>Quick Dev Access</Title>
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', display: 'block', marginBottom: '24px' }}>
                  Bấm để tự động đăng nhập nhanh với từng vai trò trong hệ thống DAO EDU.
                </Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Admin */}
                  <Button
                    id="quick-login-admin"
                    onClick={() => handleQuickLogin(Role.ADMIN)}
                    disabled={loading}
                    style={{
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      borderRadius: '8px',
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      background: 'rgba(168, 85, 247, 0.05)',
                      color: '#fff',
                      padding: '0 16px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.05)'}
                  >
                    <UserOutlined style={{ color: 'var(--accent)', fontSize: '18px', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>1. Quản trị viên (Admin)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{quickDevAccounts[Role.ADMIN].email} / 123456</div>
                    </div>
                  </Button>

                  {/* Teacher */}
                  <Button
                    id="quick-login-teacher"
                    onClick={() => handleQuickLogin(Role.TEACHER)}
                    disabled={loading}
                    style={{
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      borderRadius: '8px',
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      background: 'rgba(16, 185, 129, 0.05)',
                      color: '#fff',
                      padding: '0 16px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
                  >
                    <UserOutlined style={{ color: 'var(--secondary)', fontSize: '18px', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>2. Giáo viên (Teacher)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{quickDevAccounts[Role.TEACHER].email} / 123456</div>
                    </div>
                  </Button>

                  {/* Student */}
                  <Button
                    id="quick-login-student"
                    onClick={() => handleQuickLogin(Role.STUDENT)}
                    disabled={loading}
                    style={{
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      borderRadius: '8px',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      background: 'rgba(99, 102, 241, 0.05)',
                      color: '#fff',
                      padding: '0 16px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'}
                  >
                    <UserOutlined style={{ color: 'var(--primary)', fontSize: '18px', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>3. Học sinh (Student)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{quickDevAccounts[Role.STUDENT].email} / 123456</div>
                    </div>
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
  );
};

export const Login: React.FC = () => {
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
        <LoginInner />
      </App>
    </ConfigProvider>
  );
};

export default Login;
