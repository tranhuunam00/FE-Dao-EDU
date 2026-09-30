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

const YES_NO_OPTIONS: OptionConfig[] = [
  { key: 'yes', label: 'Yes', activeBg: 'rgba(16, 185, 129, 0.18)', activeColor: '#10b981', activeBorder: 'rgba(16, 185, 129, 0.5)' },
  { key: 'no', label: 'No', activeBg: 'rgba(239, 68, 68, 0.18)', activeColor: '#ef4444', activeBorder: 'rgba(239, 68, 68, 0.5)' },
];

const CRITERIA_CONFIG: Record<
  'attendance' | 'homework' | 'behavior' | 'participation',
  {
    title: string;
    options: OptionConfig[];
  }
> = {
  attendance: {
    title: 'Chuyên cần',
    options: YES_NO_OPTIONS,
  },
  homework: {
    title: 'Làm BTVN',
    options: YES_NO_OPTIONS,
  },
  behavior: {
    title: 'Tuân thủ NQ',
    options: YES_NO_OPTIONS,
  },
  participation: {
    title: 'Tích cực PB',
    options: YES_NO_OPTIONS,
  },
};

export const CriteriaTagGroup: React.FC<CriteriaTagGroupProps> = ({ criteria, onChange, disabled }) => {
  const handleSelect = (category: keyof typeof CRITERIA_CONFIG, val: string) => {
    if (disabled) return;
    const currentVal = (criteria as any)[category];
    onChange({
      ...criteria,
      [category]: currentVal === val ? undefined : val,
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'attendance': return '⏱️';
      case 'homework': return '📚';
      case 'behavior': return '🛡️';
      case 'participation': return '🙋';
      default: return '•';
    }
  };

  const handleSetAllGood = () => {
    if (disabled) return;
    onChange({
      ...criteria,
      attendance: 'yes',
      homework: 'yes',
      behavior: 'yes',
      participation: 'yes',
    });
  };

  const isAllGood =
    criteria?.attendance === 'yes' &&
    criteria?.homework === 'yes' &&
    criteria?.behavior === 'yes' &&
    criteria?.participation === 'yes';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
        <button
          type="button"
          disabled={disabled}
          onClick={handleSetAllGood}
          style={{
            border: isAllGood ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.4)',
            backgroundColor: isAllGood ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
            borderRadius: '4px',
            padding: '1px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.15s ease',
          }}
          title="Đánh giá học sinh này đạt Tốt cả 4 tiêu chí (Yes)"
        >
          ✓ Tốt hết
        </button>
      </div>
      {(Object.keys(CRITERIA_CONFIG) as Array<keyof typeof CRITERIA_CONFIG>).map((cat) => {
        const conf = CRITERIA_CONFIG[cat];
        const selectedVal = (criteria as any)[cat];

        return (
          <div
            key={cat}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '95px',
                minWidth: '95px',
                color: 'var(--text-secondary, #475569)',
                fontWeight: 600,
                fontSize: '0.73rem',
                paddingTop: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{getCategoryIcon(cat)}</span>
              <span>{conf.title}:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {conf.options.map((opt) => {
                const isSelected = selectedVal === opt.key ||
                  (opt.key === 'yes' && ['on_time', 'makeup', 'excellent', 'done', 'completed', 'good', 'attentive', 'active_raise_hand', 'proactive_ask', 'active', 'answer_well'].includes(selectedVal)) ||
                  (opt.key === 'no' && ['absent_unexcused', 'absent_excused', 'not_done', 'missing', 'disruptive', 'cannot_answer'].includes(selectedVal));

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(cat, opt.key)}
                    style={{
                      border: isSelected ? `1.5px solid ${opt.activeBorder}` : '1px solid var(--border-color, rgba(148, 163, 184, 0.28))',
                      backgroundColor: isSelected ? opt.activeBg : 'rgba(248, 250, 252, 0.03)',
                      color: isSelected ? opt.activeColor : 'var(--text-secondary, #475569)',
                      borderRadius: '9999px',
                      padding: '2px 14px',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      lineHeight: '1.4',
                      boxShadow: isSelected ? `0 1px 4px ${opt.activeBorder}` : 'none',
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: opt.activeColor,
                          display: 'inline-block',
                        }}
                      />
                    )}
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
