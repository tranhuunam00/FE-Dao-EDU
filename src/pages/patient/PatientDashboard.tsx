import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Heart, FileText, CheckCircle, RefreshCw } from 'lucide-react';

interface PatientData {
  message: string;
  patientInfo: {
    id: string;
    email: string;
    role: string;
  };
  medicalRecords: Array<{
    date: string;
    diagnosis: string;
    doctorName: string;
    prescription: string;
  }>;
  upcomingAppointments: Array<{
    date: string;
    time: string;
    doctorName: string;
    status: string;
  }>;
}

export const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Book appointment states
  const [doctorName, setDoctorName] = useState('BS Nguyễn Văn A');
  const [date, setDate] = useState('2026-06-20');
  const [time, setTime] = useState('09:00 AM');
  const [bookSuccess, setBookSuccess] = useState(false);

  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/patient');
      setData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu Bệnh nhân. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookSuccess(true);
    setTimeout(() => {
      setBookSuccess(false);
    }, 4000);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
        <h3 style={{ marginBottom: '12px' }}>Không thể kết nối đến máy chủ</h3>
        <p>{error}</p>
        <button onClick={fetchPatientData} className="btn btn-outline" style={{ marginTop: '16px', gap: '8px' }}>
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
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Cổng sức khỏe cá nhân</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Tra cứu bệnh án, lịch khám bệnh của bạn</p>
        </div>
        <button onClick={fetchPatientData} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Medical History */}
        <div className="glass-panel" style={{ flex: '2 1 500px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Lịch sử điều trị & Bệnh án</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ngày khám</th>
                  <th>Chẩn đoán</th>
                  <th>Bác sĩ</th>
                  <th>Đơn thuốc chỉ định</th>
                </tr>
              </thead>
              <tbody>
                {data?.medicalRecords.map((record, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{record.date}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{record.diagnosis}</td>
                    <td>{record.doctorName}</td>
                    <td style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>{record.prescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment booking & upcoming */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upcoming Schedule */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Heart size={18} style={{ color: 'var(--danger)' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Lịch khám sắp tới</h3>
            </div>
            
            {data?.upcomingAppointments.map((app, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.date} | {app.time}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginTop: '6px' }}>{app.doctorName}</div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-patient" style={{ fontSize: '0.7rem' }}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Book Appointment Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px' }}>Đăng ký khám nhanh</h3>
            
            {bookSuccess ? (
              <div className="glass-panel animate-fade-in" style={{
                padding: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#a7f3d0',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} />
                Đăng ký đặt lịch khám thành công! Bác sĩ sẽ liên hệ lại.
              </div>
            ) : (
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Chọn Bác sĩ</label>
                  <select 
                    className="form-input form-select" 
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  >
                    <option value="BS Nguyễn Văn A">BS Nguyễn Văn A (Khoa Nội tim mạch)</option>
                    <option value="BS Lê Hoàng Minh">BS Lê Hoàng Minh (Khoa Tai Mũi Họng)</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ngày khám</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Khung giờ</label>
                  <select 
                    className="form-input form-select"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    <option value="09:00 AM">09:00 AM - Sáng</option>
                    <option value="10:30 AM">10:30 AM - Sáng</option>
                    <option value="02:00 PM">02:00 PM - Chiều</option>
                    <option value="03:30 PM">03:30 PM - Chiều</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                  Xác nhận đặt lịch
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PatientDashboard;
