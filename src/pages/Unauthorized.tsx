import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth, Role } from '../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Redirect based on role
    switch (user.role) {
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
      backgroundColor: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.15)'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={36} />
        </div>

        <h1 style={{
          fontSize: '1.8rem',
          fontFamily: 'var(--font-display)',
          marginBottom: '12px',
          color: 'var(--text-primary)'
        }}>
          Truy cập bị từ chối
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '32px',
          fontSize: '0.95rem'
        }}>
          Bạn không có quyền truy cập vào trang này. Các quyền yêu cầu không phù hợp với phân quyền tài khoản hiện tại của bạn.
        </p>

        <button 
          onClick={handleGoBack}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <ArrowLeft size={18} />
          Quay lại trang chính
        </button>
      </div>
    </div>
  );
};
export default Unauthorized;
