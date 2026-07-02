import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, DollarSign, RefreshCw } from 'lucide-react';
import api from '../../services/api';

interface WageItem {
  id: string;
  className: string;
  courseName: string;
  levelName: string;
  sessionsCount: number;
  rate: number;
  totalAmount: number;
}

interface Wage {
  id: string;
  month: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  paymentDate: string | null;
  billingStartDate: string | null;
  billingEndDate: string | null;
  note: string | null;
  items: WageItem[];
  period: { id: string; name: string } | null;
}

interface SalaryData {
  summary: {
    totalPaid: number;
    totalPending: number;
    paidPeriods: number;
    totalPeriods: number;
  };
  wages: Wage[];
}

const emptyData: SalaryData = {
  summary: { totalPaid: 0, totalPending: 0, paidPeriods: 0, totalPeriods: 0 },
  wages: [],
};

const currency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);

const date = (value: string | null) =>
  value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : '-';

const TeacherSalaryHistory: React.FC = () => {
  const [data, setData] = useState<SalaryData>(emptyData);
  const [status, setStatus] = useState('All');
  const [month, setMonth] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SalaryData>('/dashboard/teacher/salary-history');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử nhận lương.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const wages = useMemo(
    () =>
      data.wages.filter(
        (wage) =>
          (status === 'All' || wage.status === status) &&
          (!month || wage.month === month),
      ),
    [data.wages, month, status],
  );

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải lịch sử lương...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Lịch sử nhận lương</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Theo dõi các kỳ thanh toán và chi tiết lớp đã giảng dạy.
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchHistory}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: 20, color: '#fca5a5', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Tổng đã nhận', value: currency(data.summary.totalPaid), color: '#34d399' },
          { label: 'Còn chờ thanh toán', value: currency(data.summary.totalPending), color: '#fbbf24' },
          { label: 'Kỳ đã thanh toán', value: `${data.summary.paidPeriods}/${data.summary.totalPeriods}`, color: 'var(--text-primary)' },
        ].map((item) => (
          <div key={item.label} className="glass-panel" style={{ padding: 18 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 23, fontWeight: 700, marginTop: 5 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          aria-label="Lọc theo tháng"
          style={{ width: 180 }}
        />
        <select
          className="form-input form-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Lọc theo trạng thái"
          style={{ width: 210 }}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="Unpaid">Chờ thanh toán</option>
        </select>
      </div>

      {!error && data.wages.length === 0 ? (
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <DollarSign size={44} style={{ margin: '0 auto 14px' }} />
          <h3>Chưa có dữ liệu thanh toán lương</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {wages.map((wage) => {
            const expanded = expandedId === wage.id;
            const paid = wage.status === 'Paid';
            return (
              <section key={wage.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : wage.id)}
                  style={{
                    width: '100%',
                    border: 0,
                    background: expanded ? 'rgba(99,102,241,.06)' : 'transparent',
                    color: 'inherit',
                    padding: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <DollarSign size={26} color={paid ? '#34d399' : '#fbbf24'} />
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 700 }}>
                        Kỳ lương tháng {wage.month}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: 5 }}>
                        {wage.period?.name || 'Kỳ thanh toán tháng'} · {paid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Đã nhận</div>
                      <div style={{ color: '#818cf8', fontSize: 20, fontWeight: 700 }}>{currency(wage.paidAmount)}</div>
                    </div>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {expanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--card-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', margin: '14px 0', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                      <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Ngày nhận: {date(wage.paymentDate)}</span>
                      <span>Tổng lương: {currency(wage.totalAmount)}</span>
                      <span>Trạng thái: {paid ? 'Đã thanh toán đủ' : 'Chờ thanh toán'}</span>
                    </div>
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr><th>Lớp</th><th>Chương trình</th><th style={{ textAlign: 'center' }}>Số buổi</th><th style={{ textAlign: 'right' }}>Đơn giá</th><th style={{ textAlign: 'right' }}>Thành tiền</th></tr>
                        </thead>
                        <tbody>
                          {wage.items.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 600 }}>{item.className}</td>
                              <td>{[item.courseName, item.levelName].filter(Boolean).join(' · ') || '-'}</td>
                              <td style={{ textAlign: 'center' }}>{item.sessionsCount}</td>
                              <td style={{ textAlign: 'right' }}>{currency(item.rate)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{currency(item.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {wage.items.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Không có chi tiết lớp học.</div>}
                    </div>
                    {wage.note && <div style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Ghi chú: {wage.note}</div>}
                  </div>
                )}
              </section>
            );
          })}
          {wages.length === 0 && <div className="glass-panel" style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)' }}>Không có kỳ lương phù hợp với bộ lọc.</div>}
        </div>
      )}
    </div>
  );
};

export default TeacherSalaryHistory;
