import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { DollarSign, ChevronDown, ChevronUp, RefreshCw, Calendar, FileText } from 'lucide-react';

interface WageItem {
  id: string;
  className: string;
  sessionsCount: number;
  rate: number;
  totalAmount: number;
}

interface Wage {
  id: string;
  month: string;
  totalAmount: number;
  status: string;
  paymentDate: string | null;
  items: WageItem[];
  period: {
    id: string;
    name: string;
  } | null;
}

const TeacherSalaryHistory: React.FC = () => {
  const [wages, setWages] = useState<Wage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/teacher/salary-history');
      setWages(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Lỗi khi tải lịch sử nhận lương. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Đang tải lịch sử lương...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Lịch sử nhận lương</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Chi tiết các đợt thanh toán lương giáo viên</p>
        </div>
        <button onClick={fetchHistory} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {error ? (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', color: '#fca5a5' }}>
          <p>{error}</p>
        </div>
      ) : wages.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <DollarSign size={48} style={{ margin: '0 auto', marginBottom: '16px', opacity: 0.5 }} />
          <h3>Chưa có dữ liệu thanh toán lương</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {wages.map(wage => (
            <div key={wage.id} className="glass-panel" style={{ overflow: 'hidden', border: expandedId === wage.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)' }}>
              {/* Header (Summary) */}
              <div 
                onClick={() => toggleExpand(wage.id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '20px 24px',
                  cursor: 'pointer',
                  backgroundColor: expandedId === wage.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    backgroundColor: wage.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: wage.status === 'Paid' ? 'var(--secondary)' : 'var(--warning)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <DollarSign size={24} />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Kỳ nhận lương: {wage.month}</h3>
                      {wage.status === 'Paid' ? (
                        <span className="badge badge-doctor" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>Đã thanh toán</span>
                      ) : (
                        <span className="badge badge-patient" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>Chờ thanh toán</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} /> Mã phiếu: {wage.id.split('-')[0].toUpperCase()}
                      </span>
                      {wage.period && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> Đợt: {wage.period.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tổng thực nhận</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatCurrency(wage.totalAmount)}
                    </div>
                  </div>
                  {expandedId === wage.id ? <ChevronUp size={24} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={24} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>

              {/* Details (Expanded) */}
              {expandedId === wage.id && (
                <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: '#fff', margin: '20px 0 16px 0', fontSize: '1rem' }}>Chi tiết các lớp giảng dạy</h4>
                  
                  {wage.items && wage.items.length > 0 ? (
                    <div className="table-container" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Tên lớp</th>
                            <th style={{ textAlign: 'center' }}>Số buổi</th>
                            <th style={{ textAlign: 'right' }}>Đơn giá/Buổi</th>
                            <th style={{ textAlign: 'right' }}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wage.items.map(item => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 500, color: '#fff' }}>{item.className}</td>
                              <td style={{ textAlign: 'center', color: 'var(--secondary)' }}>{item.sessionsCount} buổi</td>
                              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(item.rate)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Tổng cộng:</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                              {formatCurrency(wage.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Không có dữ liệu chi tiết lớp học.</p>
                  )}
                  
                  {wage.paymentDate && (
                    <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Ngày chi trả: {new Date(wage.paymentDate).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSalaryHistory;
