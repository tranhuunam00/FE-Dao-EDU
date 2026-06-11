import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../../context/AuthContext';
import { BookOpen, Shield, KeyRound, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err: any) {
      // AuthContext handles setting error
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setLoading(true);
    setLocalError(null);
    let devEmail = '';
    let devPassword = '';

    switch (role) {
      case Role.ADMIN:
        devEmail = 'admin@class.com';
        devPassword = 'admin123';
        break;
      case Role.TEACHER:
        devEmail = 'teacher@class.com';
        devPassword = 'teacher123';
        break;
      case Role.STUDENT:
        devEmail = 'student@class.com';
        devPassword = 'student123';
        break;
    }

    setEmail(devEmail);
    setPassword(devPassword);

    try {
      const user = await login(devEmail, devPassword);
      redirectUser(user.role);
    } catch (err) {
      // error handled by context
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

  const activeError = localError || authError;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
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

      <div style={{
        display: 'flex', maxWidth: '980px', width: '100%',
        gap: '32px', zIndex: 1, flexWrap: 'wrap'
      }}>
        {/* Main Login Card */}
        <div className="glass-panel" style={{
          flex: '1.2 1 400px', padding: '44px',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>DAO EDU</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cổng học tập trực tuyến</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#fff', fontFamily: 'var(--font-display)' }}>Đăng nhập</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập của bạn.
          </p>

          {activeError && (
            <div className="glass-panel animate-fade-in" style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--border-radius-sm)',
              display: 'flex', alignItems: 'center', gap: '12px',
              color: '#fca5a5', fontSize: '0.9rem', marginBottom: '24px'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>{activeError}</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} /> Email đăng nhập
              </label>
              <input
                type="email"
                placeholder="email@class.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                id="login-email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={14} /> Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                id="login-password"
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', fontSize: '1rem', marginTop: '12px',
                animation: loading ? 'pulse-glow 1.5s infinite' : 'none'
              }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Developer Sandbox Panel */}
        <div className="glass-panel" style={{
          flex: '1 1 300px', padding: '40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: 'rgba(99, 102, 241, 0.03)',
          borderColor: 'rgba(99, 102, 241, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary)' }}>
            <Shield size={22} />
            <h4 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Quick Dev Access</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Bấm để tự động đăng nhập nhanh với từng vai trò trong hệ thống DAO EDU.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Admin */}
            <button
              id="quick-login-admin"
              onClick={() => handleQuickLogin(Role.ADMIN)}
              className="btn btn-outline"
              disabled={loading}
              style={{
                justifyContent: 'flex-start', padding: '14px 16px',
                borderRadius: 'var(--border-radius-sm)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
                background: 'rgba(168, 85, 247, 0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.05)'}
            >
              <UserCheck size={18} style={{ color: 'var(--accent)', marginRight: '8px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>1. Quản trị viên (Admin)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>admin@class.com</div>
              </div>
            </button>

            {/* Teacher */}
            <button
              id="quick-login-teacher"
              onClick={() => handleQuickLogin(Role.TEACHER)}
              className="btn btn-outline"
              disabled={loading}
              style={{
                justifyContent: 'flex-start', padding: '14px 16px',
                borderRadius: 'var(--border-radius-sm)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
            >
              <UserCheck size={18} style={{ color: 'var(--secondary)', marginRight: '8px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>2. Giáo viên (Teacher)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>teacher@class.com</div>
              </div>
            </button>

            {/* Student */}
            <button
              id="quick-login-student"
              onClick={() => handleQuickLogin(Role.STUDENT)}
              className="btn btn-outline"
              disabled={loading}
              style={{
                justifyContent: 'flex-start', padding: '14px 16px',
                borderRadius: 'var(--border-radius-sm)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                background: 'rgba(99, 102, 241, 0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'}
            >
              <UserCheck size={18} style={{ color: 'var(--primary)', marginRight: '8px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>3. Học sinh (Student)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>student@class.com</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
