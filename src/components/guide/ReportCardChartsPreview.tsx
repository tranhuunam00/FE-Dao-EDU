import React from 'react';

export const ReportCardChartsPreview: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '14px',
        marginBottom: '16px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '12px 14px',
        background: '#fafafa',
      }}
    >
      {/* Biểu đồ 1: 4 Chỉ số SQI */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
          📊 Phân tích cơ cấu 4 chỉ số SQI (%)
        </div>
        <svg viewBox="0 0 320 100" style={{ width: '100%', height: '100px', display: 'block' }}>
          <line x1="60" y1="20" x2="310" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1="60" y1="50" x2="310" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1="60" y1="80" x2="310" y2="80" stroke="#cbd5e1" strokeWidth="1" />

          {/* Cột 1: Chuyên cần 100% */}
          <rect x="75" y="20" width="38" height="60" rx="3" fill="#0ea5e9" />
          <text x="94" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0369a1">100%</text>
          <text x="94" y="94" textAnchor="middle" fontSize="8.5" fill="#475569">Ch.Cần</text>

          {/* Cột 2: BTVN 93% */}
          <rect x="135" y="24" width="38" height="56" rx="3" fill="#10b981" />
          <text x="154" y="19" textAnchor="middle" fontSize="9" fontWeight="700" fill="#047857">93%</text>
          <text x="154" y="94" textAnchor="middle" fontSize="8.5" fill="#475569">Bài tập</text>

          {/* Cột 3: Nội quy 100% */}
          <rect x="195" y="20" width="38" height="60" rx="3" fill="#f59e0b" />
          <text x="214" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill="#b45309">100%</text>
          <text x="214" y="94" textAnchor="middle" fontSize="8.5" fill="#475569">Nội quy</text>

          {/* Cột 4: Năng động 70% */}
          <rect x="255" y="38" width="38" height="42" rx="3" fill="#8b5cf6" />
          <text x="274" y="33" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6d28d9">70%</text>
          <text x="274" y="94" textAnchor="middle" fontSize="8.5" fill="#475569">Phát biểu</text>
        </svg>
      </div>

      {/* Biểu đồ 2: Diễn biến điểm số qua 4 buổi */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
          📈 Diễn biến điểm kiểm tra qua 4 buổi (Thang 10)
        </div>
        <svg viewBox="0 0 320 100" style={{ width: '100%', height: '100px', display: 'block' }}>
          <line x1="30" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="22" y="23" fontSize="8" fill="#94a3b8">10</text>
          <line x1="30" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="22" y="53" fontSize="8" fill="#94a3b8">8.0</text>
          <line x1="30" y1="80" x2="300" y2="80" stroke="#cbd5e1" strokeWidth="1" />
          <text x="22" y="83" fontSize="8" fill="#94a3b8">6.0</text>

          {/* Đường tiến độ */}
          <polyline
            points="60,45 130,40 200,30 270,38"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Các điểm nút */}
          {[
            { x: 60, y: 45, val: '8.5', label: 'B1 (05/10)' },
            { x: 130, y: 40, val: '8.8', label: 'B2 (12/10)' },
            { x: 200, y: 30, val: '9.5', label: 'B3 (19/10)' },
            { x: 270, y: 38, val: '9.0', label: 'B4 (26/10)' },
          ].map(({ x, y, val, label }) => (
            <g key={label}>
              <circle cx={x} cy={y} r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fontWeight="800" fill="#4338ca">{val}</text>
              <text x={x} y="94" textAnchor="middle" fontSize="8" fill="#64748b">{label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
