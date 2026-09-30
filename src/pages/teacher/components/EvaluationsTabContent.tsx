import React from 'react';
import { Sparkles, CheckCheck, Loader2, X, Save } from 'lucide-react';
import { CriteriaTagGroup } from './CriteriaTagGroup';
import { AiCommentReviewBox } from './AiCommentReviewBox';
import type {
  StudentSessionEvaluationItem,
  EvaluationCriteria,
} from '../../../services/evaluation.service';

interface EvaluationsTabContentProps {
  students: Array<{
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    isPresent?: boolean;
  }>;
  evaluations: Record<string, StudentSessionEvaluationItem>;
  onEvaluationChange: (
    studentId: string,
    patch: Partial<StudentSessionEvaluationItem>
  ) => void;
  onSingleGenerateAi: (studentId: string, studentName: string) => void;
  onBatchGenerateAi: () => void;
  onApproveAll: () => void;
  onSaveEvaluations?: () => void;
  onMarkAllGoodAndSave?: () => void;
  savingEvaluations?: boolean;
  batchGenerating: boolean;
  generatingMap: Record<string, boolean>;
  cooldownMap: Record<string, number>;
  disabled?: boolean;
}

export const EvaluationsTabContent: React.FC<EvaluationsTabContentProps> = ({
  students,
  evaluations,
  onEvaluationChange,
  onSingleGenerateAi,
  onBatchGenerateAi,
  onApproveAll,
  onSaveEvaluations,
  onMarkAllGoodAndSave,
  savingEvaluations,
  batchGenerating,
  generatingMap,
  cooldownMap,
  disabled,
}) => {
  const isAllApproved =
    students.length > 0 &&
    students.every((s) => {
      const item = evaluations[s.id] || evaluations[s.studentId];
      return !!item?.isApprovedByTeacher;
    });

  const handleMarkAllGood = () => {
    if (onMarkAllGoodAndSave) {
      onMarkAllGoodAndSave();
      return;
    }
    const allGoodCriteria = {
      attendance: 'yes',
      homework: 'yes',
      behavior: 'yes',
      participation: 'yes',
    };
    students.forEach((s) => {
      onEvaluationChange(s.id, { criteria: allGoodCriteria as any });
    });
    if (onSaveEvaluations) {
      setTimeout(() => onSaveEvaluations(), 100);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Đánh giá 1-chạm & sinh nhận xét cá nhân hóa bằng AI cho từng học sinh.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={disabled || batchGenerating || savingEvaluations || students.length === 0}
            onClick={handleMarkAllGood}
            title="Đánh giá 1-chạm TỐT HẾT (Chuyên cần, BTVN, Nội quy, Phát biểu đều YES) cho tất cả học sinh và tự lưu ngay"
            style={{
              padding: '5px 13px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              color: '#059669',
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              cursor: disabled || batchGenerating || savingEvaluations ? 'not-allowed' : 'pointer',
            }}
          >
            <CheckCheck size={15} />
            <span>👍 Tất cả lớp TỐT (Tự lưu)</span>
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={disabled || batchGenerating || students.length === 0}
            onClick={onApproveAll}
            title={isAllApproved ? 'Hủy duyệt tất cả nhận xét' : 'Duyệt tất cả nhận xét'}
            style={{
              padding: '5px 12px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: isAllApproved ? '#ef4444' : undefined,
              borderColor: isAllApproved ? 'rgba(239, 68, 68, 0.4)' : undefined,
              backgroundColor: isAllApproved ? 'rgba(239, 68, 68, 0.08)' : undefined,
            }}
          >
            {isAllApproved ? <X size={15} /> : <CheckCheck size={15} />}
            <span>{isAllApproved ? 'Hủy duyệt tất cả' : 'Duyệt tất cả'}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={disabled || batchGenerating}
            onClick={onBatchGenerateAi}
            style={{
              padding: '5px 14px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              borderColor: 'transparent',
            }}
          >
            {batchGenerating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang xử lý hàng loạt...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>✨ AI Viết Tất Cả (HS Có Mặt)</span>
              </>
            )}
          </button>
          {onSaveEvaluations && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={disabled || batchGenerating || savingEvaluations}
              onClick={onSaveEvaluations}
              style={{
                padding: '5px 14px',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#10b981',
                borderColor: '#10b981',
              }}
            >
              {savingEvaluations ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Lưu đánh giá</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table" style={{ width: '100%', minWidth: '880px' }}>
          <thead>
            <tr>
              <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
              <th style={{ width: '150px' }}>Học sinh</th>
              <th style={{ width: '70px', textAlign: 'center' }}>Điểm số</th>
              <th style={{ width: '260px' }}>ĐÁNH GIÁ 1-CHẠM</th>
              <th style={{ minWidth: '350px' }}>NHẬN XÉT BUỔI HỌC (AI / GIÁO VIÊN)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const evalItem = evaluations[student.id] || {
                studentId: student.id,
                classSessionId: '',
                criteria: {},
                evaluationScore: '',
                evaluationComment: '',
                isAiGenerated: false,
                isApprovedByTeacher: false,
              };
              const fullName = `${student.lastName} ${student.firstName}`;
              const isPresent = student.isPresent ?? true;

              return (
                <tr
                  key={student.id}
                  style={{
                    opacity: disabled ? 0.7 : 1,
                    backgroundColor: evalItem.isApprovedByTeacher
                      ? 'rgba(16, 185, 129, 0.03)'
                      : 'transparent',
                  }}
                >
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {student.studentId}
                      {!isPresent && (
                        <span
                          style={{
                            marginLeft: '6px',
                            color: 'var(--danger, #ef4444)',
                            fontSize: '0.72rem',
                          }}
                        >
                          (Vắng)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="—"
                      value={evalItem.evaluationScore || ''}
                      disabled={disabled}
                      maxLength={10}
                      onChange={(e) =>
                        onEvaluationChange(student.id, {
                          evaluationScore: e.target.value.trim() === '' ? null : e.target.value,
                        })
                      }
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                        fontSize: '0.85rem',
                        width: '55px',
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </td>
                  <td>
                    <CriteriaTagGroup
                      criteria={evalItem.criteria || {}}
                      disabled={disabled}
                      onChange={(newCriteria: EvaluationCriteria) =>
                        onEvaluationChange(student.id, { criteria: newCriteria })
                      }
                    />
                  </td>
                  <td>
                    <AiCommentReviewBox
                      comment={evalItem.evaluationComment || ''}
                      isAiGenerated={!!evalItem.isAiGenerated}
                      isApproved={!!evalItem.isApprovedByTeacher}
                      disabled={disabled}
                      isGenerating={!!generatingMap[student.id]}
                      cooldown={cooldownMap[student.id] || 0}
                      onCommentChange={(val) =>
                        onEvaluationChange(student.id, {
                          evaluationComment: val,
                          ...(evalItem.isApprovedByTeacher ? { isApprovedByTeacher: false } : {}),
                        })
                      }
                      onApproveChange={(val) =>
                        onEvaluationChange(student.id, { isApprovedByTeacher: val })
                      }
                      onGenerateAi={() => onSingleGenerateAi(student.id, fullName)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
