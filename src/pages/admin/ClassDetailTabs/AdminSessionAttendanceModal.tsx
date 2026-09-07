import React from 'react';
import {
  Modal, Descriptions, Tag, Button, App,
} from 'antd';
import {
  CalendarOutlined, SaveOutlined, CheckCircleOutlined, StopOutlined, EditOutlined,
} from '@ant-design/icons';
import { UserCheck, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../../services/api';
import { AttendanceTabContent } from '../../teacher/components/AttendanceTabContent';
import { EvaluationsTabContent } from '../../teacher/components/EvaluationsTabContent';
import { useAdminSessionAttendance } from './useAdminSessionAttendance';

interface AdminSessionAttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  currentSession: any;
  setCurrentSession: (session: any) => void;
  classData: any;
  isAdmin: boolean;
  onReload: () => void;
  onOpenEditSession: () => void;
}

export const AdminSessionAttendanceModal: React.FC<AdminSessionAttendanceModalProps> = ({
  visible,
  onClose,
  currentSession,
  setCurrentSession,
  classData,
  isAdmin,
  onReload,
  onOpenEditSession,
}) => {
  const { message } = App.useApp();

  const {
    activeTab,
    setActiveTab,
    sessionAttendance,
    setSessionAttendance,
    sessionEvaluations,
    isOverrideMode,
    setIsOverrideMode,
    savingAttendance,
    savingEvaluations,
    generatingMap,
    cooldownMap,
    batchGenerating,
    handleEvaluationChange,
    handleSingleGenerateAi,
    handleBatchGenerateAi,
    handleApproveAll,
    handleSaveAttendance,
    handleSaveEvaluationsOnly,
    handleCompleteSession,
    handleOverrideAttendance,
    handleCancelSession,
    handleReopenSession,
    handleRevertToScheduled,
  } = useAdminSessionAttendance({
    visible,
    currentSession,
    setCurrentSession,
    classData,
    onReload,
    onClose,
  });

  if (!currentSession) return null;

  const studentsListForEval = sessionAttendance.map((a) => ({
    id: a.studentId,
    studentId: a.student?.studentId || a.studentId,
    firstName: a.student?.firstName || '',
    lastName: a.student?.lastName || '',
    isPresent: a.isPresent,
  }));

  return (
    <Modal
      title={
        <div>
          <CalendarOutlined style={{ color: '#6366f1', marginRight: 8 }} />
          Buổi học ngày: {dayjs(currentSession.date).format('DD/MM/YYYY')}
        </div>
      }
      open={visible}
      width={1350}
      onCancel={onClose}
      footer={null}
    >
      <div style={{ padding: '8px 0' }}>
        <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Thời gian">
            {currentSession.startTime?.substring(0, 5)} - {currentSession.endTime?.substring(0, 5)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {currentSession.status === 'Scheduled' && <Tag color="blue">Chưa diễn ra</Tag>}
            {currentSession.status === 'In-Progress' && <Tag color="orange">Đang học</Tag>}
            {currentSession.status === 'Completed' && <Tag color="green">Hoàn thành</Tag>}
            {currentSession.status === 'Cancelled' && <Tag color="red">Nghỉ học</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Giáo viên">
            {currentSession.teacher ? `${currentSession.teacher.lastName} ${currentSession.teacher.firstName}` : 'Chưa phân công'}
          </Descriptions.Item>
          <Descriptions.Item label="Trợ giảng (TA)">
            {currentSession.assistant ? `${currentSession.assistant.lastName} ${currentSession.assistant.firstName}` : 'Chưa phân công'}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {currentSession.attendanceLocked && currentSession.status !== 'Cancelled' && (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveEvaluationsOnly} loading={savingEvaluations}>
              Cập nhật đánh giá
            </Button>
          )}
          {!currentSession.attendanceLocked && (
            <>
              {currentSession.status === 'Scheduled' && (
                <>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={async () => {
                    try {
                      const { data } = await api.post(`/classes/sessions/${currentSession.id}/start-attendance?bypassTimeCheck=true`);
                      message.success('Bắt đầu điểm danh thành công!');
                      setCurrentSession(data);
                      onReload();
                    } catch (e: any) {
                      message.error(e.response?.data?.message || 'Không thể bắt đầu');
                    }
                  }}>
                    Bắt đầu học (Điểm danh)
                  </Button>
                  <Button danger icon={<StopOutlined />} onClick={handleCancelSession}>
                    Cho nghỉ học
                  </Button>
                </>
              )}
              {currentSession.status === 'Cancelled' && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleReopenSession}>
                  Mở lại buổi học
                </Button>
              )}
              {currentSession.status === 'In-Progress' && (
                <>
                  <Button type="primary" style={{ background: '#34d399', border: 'none' }} icon={<SaveOutlined />} onClick={handleSaveAttendance} loading={savingAttendance}>
                    Lưu điểm danh
                  </Button>
                  <Button danger icon={<StopOutlined />} onClick={handleCompleteSession}>
                    Kết thúc buổi học
                  </Button>
                  <Button type="dashed" danger onClick={handleRevertToScheduled}>
                    Trở lại chưa diễn ra
                  </Button>
                </>
              )}
            </>
          )}
          {dayjs(currentSession.date).isAfter(dayjs().subtract(1, 'day')) && !currentSession.attendanceLocked && currentSession.status !== 'Cancelled' && (
            <Button icon={<EditOutlined />} onClick={onOpenEditSession}>
              Đổi lịch / Giáo viên
            </Button>
          )}
        </div>

        {currentSession.attendanceLocked && isAdmin && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)' }}>
            {!isOverrideMode ? (
              <Button danger size="small" icon={<EditOutlined />} onClick={() => setIsOverrideMode(true)}>
                Sửa điểm danh (Admin)
              </Button>
            ) : (
              <>
                <Button type="primary" danger size="small" icon={<SaveOutlined />} onClick={handleOverrideAttendance} loading={savingAttendance}>
                  Lưu thay đổi
                </Button>
                <Button size="small" onClick={() => setIsOverrideMode(false)}>Hủy sửa</Button>
              </>
            )}
            <span style={{ color: '#ef4444', fontSize: 12 }}>⚠️ Chỉ admin — Áp dụng nếu buổi chưa tính tiền</span>
          </div>
        )}

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === 'attendance' ? '2px solid var(--primary, #10b981)' : '2px solid transparent',
              color: activeTab === 'attendance' ? 'var(--primary, #10b981)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <UserCheck size={16} />
            <span>1. Điểm danh chuyên cần ({sessionAttendance.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evaluations')}
            style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === 'evaluations' ? '2px solid var(--accent, #a855f7)' : '2px solid transparent',
              color: activeTab === 'evaluations' ? 'var(--accent, #a855f7)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Sparkles size={16} />
            <span>2. Đánh giá 1-Chạm & AI Nhận xét</span>
          </button>
        </div>

        {activeTab === 'attendance' ? (
          <AttendanceTabContent
            attendances={sessionAttendance}
            setAttendances={setSessionAttendance}
            disabled={currentSession.attendanceLocked && !isOverrideMode}
          />
        ) : (
          <EvaluationsTabContent
            students={studentsListForEval}
            evaluations={sessionEvaluations}
            onEvaluationChange={handleEvaluationChange}
            onSingleGenerateAi={handleSingleGenerateAi}
            onBatchGenerateAi={handleBatchGenerateAi}
            onApproveAll={handleApproveAll}
            onSaveEvaluations={handleSaveEvaluationsOnly}
            savingEvaluations={savingEvaluations}
            batchGenerating={batchGenerating}
            generatingMap={generatingMap}
            cooldownMap={cooldownMap}
            disabled={currentSession.status === 'Scheduled'}
          />
        )}
      </div>
    </Modal>
  );
};
