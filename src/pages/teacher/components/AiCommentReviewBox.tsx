import React from 'react';
import { Sparkles, Check, CheckCircle2, Loader2 } from 'lucide-react';

interface AiCommentReviewBoxProps {
  comment: string;
  isAiGenerated: boolean;
  isApproved: boolean;
  onCommentChange: (val: string) => void;
  onApproveChange: (val: boolean) => void;
  onGenerateAi: () => void;
  isGenerating: boolean;
  cooldown: number;
  disabled?: boolean;
}

export const AiCommentReviewBox: React.FC<AiCommentReviewBoxProps> = ({
  comment,
  isAiGenerated,
  isApproved,
  onCommentChange,
  onApproveChange,
  onGenerateAi,
  isGenerating,
  cooldown,
  disabled,
}) => {
  const charCount = (comment || '').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            disabled={disabled || isGenerating || cooldown > 0}
            onClick={onGenerateAi}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: cooldown > 0 ? 'rgba(156, 163, 175, 0.15)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: disabled || isGenerating || cooldown > 0 ? 'not-allowed' : 'pointer',
              boxShadow: cooldown > 0 ? 'none' : '0 2px 6px rgba(99, 102, 241, 0.25)',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Đang viết...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Chờ {cooldown}s</span>
            ) : (
              <>
                <Sparkles size={13} />
                <span>AI Viết Nhận Xét</span>
              </>
            )}
          </button>

          {isAiGenerated && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: 'var(--accent, #a855f7)',
                fontWeight: 600,
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              AI Gợi ý
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            title={isApproved ? 'Click để hủy duyệt nhận xét này' : 'Click để duyệt nhận xét này'}
            disabled={disabled}
            onClick={() => onApproveChange(!isApproved)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: isApproved ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--card-border, rgba(255,255,255,0.15))',
              backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: isApproved ? '#10b981' : 'var(--text-secondary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {isApproved ? <CheckCircle2 size={13} /> : <Check size={13} />}
            <span>{isApproved ? 'Đã duyệt' : 'Duyệt'}</span>
          </button>

          <span
            style={{
              fontSize: '0.72rem',
              color: charCount > 1900 ? 'var(--danger, #ef4444)' : 'var(--text-muted)',
            }}
          >
            {charCount}/2000
          </span>
        </div>
      </div>

      <textarea
        value={comment || ''}
        placeholder="Giáo viên nhập nhận xét hoặc bấm 'AI Viết Nhận Xét' để tạo nhanh..."
        disabled={disabled}
        maxLength={2000}
        rows={3}
        onChange={(e) => onCommentChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          borderRadius: '6px',
          border: isApproved
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid var(--border-color, rgba(255,255,255,0.12))',
          backgroundColor: 'var(--card-bg, rgba(17, 24, 39, 0.5))',
          color: 'var(--text-primary)',
          fontSize: '0.82rem',
          lineHeight: '1.4',
          resize: 'vertical',
          outline: 'none',
        }}
      />
    </div>
  );
};
