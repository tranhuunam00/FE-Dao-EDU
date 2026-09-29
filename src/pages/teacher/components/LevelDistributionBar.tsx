import React from 'react';

interface LevelDistributionBarProps {
  distribution?: {
    level5?: number;
    level4?: number;
    level3?: number;
    level2?: number;
    level1?: number;
  };
  totalStudents?: number;
}

export const LevelDistributionBar: React.FC<LevelDistributionBarProps> = ({
  distribution,
  totalStudents = 1,
}) => {
  const total = totalStudents || 1;
  const levels = [
    { key: 'level5', label: 'Xuất sắc', count: distribution?.level5 || 0, color: '#16a34a' },
    { key: 'level4', label: 'Giỏi', count: distribution?.level4 || 0, color: '#2563eb' },
    { key: 'level3', label: 'Khá', count: distribution?.level3 || 0, color: '#d97706' },
    { key: 'level2', label: 'TB', count: distribution?.level2 || 0, color: '#ea580c' },
    { key: 'level1', label: 'Yếu', count: distribution?.level1 || 0, color: '#dc2626' },
  ];

  return (
    <>
      <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', background: '#f1f5f9', marginBottom: 8 }}>
        {levels.map((lv) => {
          const pct = (lv.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={lv.key}
              title={`${lv.label}: ${lv.count} HS (${Math.round(pct)}%)`}
              style={{
                width: `${pct}%`,
                background: lv.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                minWidth: pct > 8 ? undefined : 18,
                transition: 'width 0.4s ease',
              }}
            >
              {lv.count}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {levels.map((lv) => (
          <div key={lv.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: lv.color }} />
            <span style={{ color: 'var(--text-secondary, #6b7280)' }}>{lv.label}:</span>
            <strong style={{ color: 'var(--text-primary, #111827)' }}>{lv.count}</strong>
          </div>
        ))}
      </div>
    </>
  );
};
