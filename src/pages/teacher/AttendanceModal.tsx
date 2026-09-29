import React, { useState } from 'react';
import { X, Save, Play, CheckCircle2, UserCheck, Sparkles, Download } from 'lucide-react';
import { AttendanceTabContent } from './components/AttendanceTabContent';
import { EvaluationsTabContent } from './components/EvaluationsTabContent';
import { useSessionAttendanceAndEvaluation } from './components/useSessionAttendanceAndEvaluation';
import { exportToExcel } from '../../utils/export';

interface AttendanceModalProps {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  session,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'evaluations'>('attendance');

  const {
    attendances,
    setAttendances,
    evaluations,
    loading,
    submitting,
    sessionStatus,
    attendanceLocked,
    generatingMap,
    cooldownMap,
    batchGenerating,
    startSession,
    handleEvaluationChange,
    handleSingleGenerateAi,
    handleBatchGenerateAi,
    handleApproveAll,
    saveAllData,
  } = useSessionAttendanceAndEvaluation({ session, onSuccess, onClose });

  const studentsList = attendances.map((a) => ({
    id: a.studentId,
    studentId: a.student?.studentId || a.studentId,
    firstName: a.student?.firstName || '',
    lastName: a.student?.lastName || '',
    isPresent: a.isPresent,
  }));

  const isLocked = attendanceLocked;
  const isScheduled = sessionStatus === 'Scheduled';

  const handleExportSession = () => {
    if (!attendances || attendances.length === 0) {
      alert('Chưa có danh sách học sinh để xuất.');
      return;
    }
    const exportData = attendances.map((a, idx) => {
      const evalItem = evaluations[a.studentId] || ({} as any);
      const statusLabel = a.isPresent
        ? 'Có mặt'
        : a.reason === 'Excused'
        ? 'Nghỉ có phép'
        : a.reason === 'Late'
        ? 'Đi muộn'
        : 'Nghỉ không phép';

      const hwText = evalItem.criteria?.homework === 'done' ? 'Làm đủ' : evalItem.criteria?.homework === 'missing' ? 'Thiếu BTVN' : 'Không có';
      const undText = evalItem.criteria?.understanding === 'quick' ? 'Tiếp thu nhanh' : evalItem.criteria?.understanding === 'slow' ? 'Chậm' : 'Bình thường';
      const behText = evalItem.criteria?.behavior === 'good' ? 'Tốt' : evalItem.criteria?.behavior === 'talkative' ? 'Nói chuyện' : 'Mất tập trung';

      return {
        stt: idx + 1,
        studentId: a.student?.studentId || a.studentId,
        studentName: `${a.student?.lastName || ''} ${a.student?.firstName || ''}`.trim(),
        status: statusLabel,
        absenceNote: a.note || '',
        homework: hwText,
        understanding: undText,
        behavior: behText,
        score: evalItem.evaluationScore || '—',
        feedback: evalItem.evaluationComment || '',
      };
    });

    exportToExcel(
      exportData,
      `Diem_danh_Danh_gia_${(session.className || 'Lop').replace(/\s+/g, '_')}_${session.date || ''}`,
      ['STT', 'Mã học sinh', 'Họ và tên', 'Điểm danh', 'Ghi chú vắng', 'BTVN', 'Tiếp thu', 'Nề nếp', 'Điểm đánh giá', 'Nhận xét buổi học'],
      ['stt', 'studentId', 'studentName', 'status', 'absenceNote', 'homework', 'understanding', 'behavior', 'score', 'feedback'],
      'Đánh giá buổi học'
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1350px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {session.className}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.88rem' }}>
          Ngày: {session.date} | Thời gian: {session.startTime} - {session.endTime} | Phòng: {session.roomName}
        </p>

        {isScheduled && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--secondary)' }}>Buổi học chưa bắt đầu.</span>
            <button
              className="btn btn-primary"
              onClick={startSession}
              disabled={submitting}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <Play size={15} /> Bắt đầu điểm danh
            </button>
          </div>
        )}

        {isLocked && (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              marginBottom: '16px',
              color: 'var(--primary)',
              fontSize: '0.85rem',
            }}
          >
            Buổi học này đã hoàn thành và chốt điểm danh. Bạn vẫn có thể cập nhật đánh giá sư phạm.
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'attendance' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'attendance' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UserCheck size={16} />
            <span>1. Điểm danh chuyên cần ({attendances.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evaluations')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'evaluations' ? '2px solid var(--accent, #a855f7)' : '2px solid transparent',
              color: activeTab === 'evaluations' ? 'var(--accent, #a855f7)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} />
            <span>2. Đánh giá 1-Chạm & AI Nhận xét</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Đang tải dữ liệu buổi học...
            </div>
          ) : attendances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Chưa có học sinh nào trong lớp này.
            </div>
          ) : activeTab === 'attendance' ? (
            <AttendanceTabContent
              attendances={attendances}
              setAttendances={setAttendances}
              disabled={isLocked || isScheduled}
            />
          ) : (
            <EvaluationsTabContent
              students={studentsList}
              evaluations={evaluations}
              onEvaluationChange={handleEvaluationChange}
              onSingleGenerateAi={handleSingleGenerateAi}
              onBatchGenerateAi={handleBatchGenerateAi}
              onApproveAll={handleApproveAll}
              onSaveEvaluations={() => saveAllData(false)}
              savingEvaluations={submitting}
              batchGenerating={batchGenerating}
              generatingMap={generatingMap}
              cooldownMap={cooldownMap}
              disabled={isScheduled}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportSession}
            style={{ display: 'flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            <Download size={15} /> Xuất kết quả buổi học Excel
          </button>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Đóng
            </button>
            {isLocked && !isScheduled && (
              <button
                className="btn btn-primary"
                onClick={() => saveAllData(false)}
                disabled={submitting}
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <Save size={16} /> Cập nhật đánh giá
              </button>
            )}
            {!isLocked && !isScheduled && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => saveAllData(false)}
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'var(--accent, #a855f7)',
                    borderColor: 'var(--accent, #a855f7)',
                  }}
                >
                  <Save size={16} /> Lưu tạm
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => saveAllData(true)}
                  disabled={submitting}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <CheckCircle2 size={16} /> Chốt điểm danh & Kết thúc
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceModal;
