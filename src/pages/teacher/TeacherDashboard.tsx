import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Users, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';

interface TeacherData {
  message: string;
  teacherInfo: {
    id: string;
    email: string;
    role: string;
  };
  schedules: Array<{
    id: string;
    className: string;
    time: string;
    subject: string;
  }>;
  pendingGradingCount: number;
}

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/teacher');
      setData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu Giáo viên. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
        <h3 style={{ marginBottom: '12px' }}>Không thể kết nối đến máy chủ</h3>
        <p>{error}</p>
        <button onClick={fetchTeacherData} className="btn btn-outline" style={{ marginTop: '16px', gap: '8px' }}>
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
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Khu vực giảng dạy</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Quản lý lớp học và lịch dạy hôm nay</p>
        </div>
        <button onClick={fetchTeacherData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
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
        {/* Total Classes */}
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lịch dạy hôm nay</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.schedules.length} ca dạy</div>
          </div>
        </div>

        {/* Pending grading */}
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
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bài kiểm tra chờ chấm</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{data?.pendingGradingCount} bài</div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Schedules table */}
        <div className="glass-panel" style={{ flex: '2 1 500px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Users size={20} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Lịch lên lớp giảng dạy</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Lớp học</th>
                  <th>Môn học</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data?.schedules.map((sch) => (
                  <tr key={sch.id}>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{sch.time}</td>
                    <td style={{ fontWeight: 500 }}>{sch.className}</td>
                    <td>{sch.subject}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', gap: '4px' }}>
                        <CheckCircle size={14} /> Điểm danh
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
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>Thông tin giảng viên</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Email: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{data?.teacherInfo.email}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mã giáo viên: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{data?.teacherInfo.id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Quyền truy cập: </span>
              <span className="badge badge-doctor" style={{ marginLeft: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>
                {data?.teacherInfo.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeacherDashboard;
