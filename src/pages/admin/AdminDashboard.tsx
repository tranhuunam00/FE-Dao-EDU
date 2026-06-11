import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, Users, Stethoscope, Activity, Settings, RefreshCw } from 'lucide-react';

interface AdminData {
  message: string;
  statistics: {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    systemStatus: string;
  };
  auditLogs: Array<{
    id: number;
    action: string;
    target: string;
    time: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/admin');
      setData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu Admin. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
        <h3 style={{ marginBottom: '12px' }}>Không thể kết nối đến máy chủ</h3>
        <p>{error}</p>
        <button onClick={fetchAdminData} className="btn btn-outline" style={{ marginTop: '16px', gap: '8px' }}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Hệ thống Quản trị</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Giám sát hoạt động và cấu hình phòng khám</p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Users */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng tài khoản</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.statistics.totalUsers}</div>
          </div>
        </div>

        {/* Doctors */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bác sĩ đang hoạt động</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.statistics.totalDoctors}</div>
          </div>
        </div>

        {/* Patients */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bệnh nhân đăng ký</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.statistics.totalPatients}</div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Settings size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái server</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--secondary)', marginTop: '8px' }}>{data?.statistics.systemStatus}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Audit Log Table */}
        <div className="glass-panel" style={{ flex: '2 1 500px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Shield size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Lịch sử hoạt động hệ thống (Audit Logs)</h3>
          </div>
          
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {data?.auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td>{log.target}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(log.time).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions panel */}
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '20px' }}>Thao tác nhanh</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>Thêm mới bác sĩ</button>
            <button className="btn btn-secondary" style={{ width: '100%' }}>Xuất báo cáo định kỳ</button>
            <button className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.08)' }}>Cấu hình tham số khám</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
