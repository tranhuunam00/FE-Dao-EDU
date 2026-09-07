import React from 'react';
import type { EvaluationCriteria } from '../../../services/evaluation.service';

interface CriteriaTagGroupProps {
  criteria: EvaluationCriteria;
  onChange: (criteria: EvaluationCriteria) => void;
  disabled?: boolean;
}

interface OptionConfig {
  key: string;
  label: string;
  activeBg: string;
  activeColor: string;
  activeBorder: string;
}

const CRITERIA_CONFIG: Record<
  keyof EvaluationCriteria,
  {
    title: string;
    options: OptionConfig[];
  }
> = {
  homework: {
    title: 'Bài tập',
    options: [
      { key: 'done', label: 'Đã làm', activeBg: 'rgba(16, 185, 129, 0.18)', activeColor: '#10b981', activeBorder: 'rgba(16, 185, 129, 0.4)' },
      { key: 'missing', label: 'Chưa làm', activeBg: 'rgba(239, 68, 68, 0.18)', activeColor: '#ef4444', activeBorder: 'rgba(239, 68, 68, 0.4)' },
      { key: 'none', label: 'Không có', activeBg: 'rgba(156, 163, 175, 0.18)', activeColor: '#9ca3af', activeBorder: 'rgba(156, 163, 175, 0.4)' },
    ],
  },
  understanding: {
    title: 'Tiếp thu',
    options: [
      { key: 'quick', label: 'Hiểu nhanh', activeBg: 'rgba(59, 130, 246, 0.18)', activeColor: '#3b82f6', activeBorder: 'rgba(59, 130, 246, 0.4)' },
      { key: 'normal', label: 'Hiểu bài', activeBg: 'rgba(16, 185, 129, 0.18)', activeColor: '#10b981', activeBorder: 'rgba(16, 185, 129, 0.4)' },
      { key: 'slow', label: 'Cần kèm', activeBg: 'rgba(245, 158, 11, 0.18)', activeColor: '#f59e0b', activeBorder: 'rgba(245, 158, 11, 0.4)' },
    ],
  },
  participation: {
    title: 'Tương tác',
    options: [
      { key: 'active', label: 'Hăng hái', activeBg: 'rgba(16, 185, 129, 0.18)', activeColor: '#10b981', activeBorder: 'rgba(16, 185, 129, 0.4)' },
      { key: 'normal', label: 'Bình thường', activeBg: 'rgba(156, 163, 175, 0.18)', activeColor: '#9ca3af', activeBorder: 'rgba(156, 163, 175, 0.4)' },
      { key: 'passive', label: 'Ít nói', activeBg: 'rgba(245, 158, 11, 0.18)', activeColor: '#f59e0b', activeBorder: 'rgba(245, 158, 11, 0.4)' },
    ],
  },
  behavior: {
    title: 'Nề nếp',
    options: [
      { key: 'good', label: 'Tốt', activeBg: 'rgba(16, 185, 129, 0.18)', activeColor: '#10b981', activeBorder: 'rgba(16, 185, 129, 0.4)' },
      { key: 'talkative', label: 'Nói chuyện', activeBg: 'rgba(245, 158, 11, 0.18)', activeColor: '#f59e0b', activeBorder: 'rgba(245, 158, 11, 0.4)' },
      { key: 'unfocused', label: 'Mất tập trung', activeBg: 'rgba(239, 68, 68, 0.18)', activeColor: '#ef4444', activeBorder: 'rgba(239, 68, 68, 0.4)' },
    ],
  },
};

export const CriteriaTagGroup: React.FC<CriteriaTagGroupProps> = ({ criteria, onChange, disabled }) => {
  const handleSelect = (category: keyof EvaluationCriteria, val: string) => {
    if (disabled) return;
    const currentVal = criteria[category];
    onChange({
      ...criteria,
      [category]: currentVal === val ? undefined : val,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
      {(Object.keys(CRITERIA_CONFIG) as Array<keyof EvaluationCriteria>).map((cat) => {
        const conf = CRITERIA_CONFIG[cat];
        const selectedVal = criteria[cat];

        return (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                minWidth: '55px',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {conf.title}:
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {conf.options.map((opt) => {
                const isSelected = selectedVal === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(cat, opt.key)}
                    style={{
                      border: isSelected ? `1px solid ${opt.activeBorder}` : '1px solid var(--card-border, rgba(255,255,255,0.1))',
                      backgroundColor: isSelected ? opt.activeBg : 'transparent',
                      color: isSelected ? opt.activeColor : 'var(--text-secondary)',
                      borderRadius: '4px',
                      padding: '2px 7px',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      transition: 'all var(--transition-fast, 0.15s ease)',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
