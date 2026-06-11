import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Users, FileText, CheckCircle, RefreshCw } from 'lucide-react';

interface DoctorData {
  message: string;
  doctorInfo: {
    id: string;
    email: string;
    role: string;
  };
  appointments: Array<{
    id: string;
    patientName: string;
    time: string;
    reason: string;
  }>;
  pendingPrescriptionsCount: number;
}

export const DoctorDashboard: React.FC = () => {
  const [data, setData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/doctor');
      setData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu Bác sĩ. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
        <h3 style={{ marginBottom: '12px' }}>Không thể kết nối đến máy chủ</h3>
        <p>{error}</p>
        <button onClick={fetchDoctorData} className="btn btn-outline" style={{ marginTop: '16px', gap: '8px' }}>
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
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Khu vực chuyên môn</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Quản lý bệnh nhân và lịch hẹn hôm nay</p>
        </div>
        <button onClick={fetchDoctorData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Grid status cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Appointments */}
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
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lịch khám hôm nay</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.appointments.length} ca</div>
          </div>
        </div>

        {/* Pending Prescriptions */}
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
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đơn thuốc chờ duyệt</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.pendingPrescriptionsCount} đơn</div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Appointments table */}
        <div className="glass-panel" style={{ flex: '2 1 500px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Users size={20} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Lịch hẹn của tôi</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Bệnh nhân</th>
                  <th>Lý do khám</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data?.appointments.map((app) => (
                  <tr key={app.id}>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{app.time}</td>
                    <td style={{ fontWeight: 500 }}>{app.patientName}</td>
                    <td>{app.reason}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', gap: '4px' }}>
                        <CheckCircle size={14} /> Khám xong
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick info Card */}
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '24px', background: 'rgba(255,255,255,0.01)' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>Thông tin tài khoản</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Email: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{data?.doctorInfo.email}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mã nhân viên: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{data?.doctorInfo.id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Quyền truy cập: </span>
              <span className="badge badge-doctor" style={{ marginLeft: '4px' }}>{data?.doctorInfo.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DoctorDashboard;
