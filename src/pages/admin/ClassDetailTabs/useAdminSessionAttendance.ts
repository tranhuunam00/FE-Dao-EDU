import { useState, useEffect, useRef } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/api';
import evaluationService, {
  type StudentSessionEvaluationItem,
} from '../../../services/evaluation.service';

interface UseAdminSessionAttendanceProps {
  visible: boolean;
  currentSession: any;
  setCurrentSession: (session: any) => void;
  classData: any;
  onReload: () => void;
  onClose: () => void;
}

export const useAdminSessionAttendance = ({
  visible,
  currentSession,
  setCurrentSession,
  classData,
  onReload,
  onClose,
}: UseAdminSessionAttendanceProps) => {
  const { modal, message } = App.useApp();
  const [activeTab, setActiveTab] = useState<'attendance' | 'evaluations'>('attendance');
  const [sessionAttendance, setSessionAttendance] = useState<any[]>([]);
  const [sessionEvaluations, setSessionEvaluations] = useState<Record<string, StudentSessionEvaluationItem>>({});
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingEvaluations, setSavingEvaluations] = useState(false);

  const [generatingMap, setGeneratingMap] = useState<Record<string, boolean>>({});
  const [cooldownMap, setCooldownMap] = useState<Record<string, number>>({});
  const [batchGenerating, setBatchGenerating] = useState(false);
  const cooldownTimerRef = useRef<any>(null);

  useEffect(() => {
    cooldownTimerRef.current = setInterval(() => {
      setCooldownMap((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (v > 1) {
            next[k] = v - 1;
            changed = true;
          } else if (v === 1) {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible || !currentSession) return;
    setIsOverrideMode(false);

    const loadData = async () => {
      try {
        const [{ data: attData }, evalList] = await Promise.all([
          api.get(`/classes/sessions/${currentSession.id}/attendance`),
          evaluationService.getSessionEvaluations(currentSession.id).catch(() => []),
        ]);

        const mapped = (classData?.students || [])
          .filter((cs: any) => {
            const hasRecord = attData.some((d: any) => d.studentId === cs.studentId);
            if (hasRecord) return true;
            const joined = dayjs(cs.joinedDate);
            const sess = dayjs(currentSession.date);
            const isJoined = joined.isBefore(sess) || joined.isSame(sess, 'day');
            if (cs.status === 'Active') return isJoined;
            if (cs.status === 'Dropped') {
              const leftDate = cs.updatedAt ? cs.updatedAt.split('T')[0] : cs.joinedDate;
              return isJoined && currentSession.date < leftDate;
            }
            return false;
          })
          .map((cs: any) => {
            const record = attData.find((d: any) => d.studentId === cs.studentId);
            return {
              studentId: cs.studentId,
              isPresent: record ? record.isPresent : false,
              reason: record ? record.reason : '',
              attendanceType: record
                ? record.verifyMethod
                  ? record.attendanceType
                  : 'manual'
                : 'manual',
              verifyMethod: record ? record.verifyMethod : null,
              student: {
                name: cs.student ? `${cs.student.lastName} ${cs.student.firstName}` : '-',
                user: cs.student?.user,
                firstName: cs.student?.firstName || '',
                lastName: cs.student?.lastName || '',
                studentId: cs.student?.studentId || cs.studentId,
              },
            };
          });
        setSessionAttendance(mapped);

        const evalRecord: Record<string, StudentSessionEvaluationItem> = {};
        for (const ev of evalList) {
          evalRecord[ev.studentId] = ev;
        }
        for (const m of mapped) {
          if (!evalRecord[m.studentId]) {
            evalRecord[m.studentId] = {
              studentId: m.studentId,
              classSessionId: currentSession.id,
              criteria: {},
              evaluationScore: null,
              evaluationComment: null,
              isAiGenerated: false,
              isApprovedByTeacher: false,
            };
          }
        }
        setSessionEvaluations(evalRecord);
      } catch {
        message.error('Lỗi khi tải thông tin buổi học.');
      }
    };

    loadData();
  }, [visible, currentSession?.id]);

  const handleEvaluationChange = (
    studentId: string,
    patch: Partial<StudentSessionEvaluationItem>
  ) => {
    setSessionEvaluations((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          studentId,
          classSessionId: currentSession.id,
          criteria: {},
        }),
        ...patch,
      },
    }));
  };

  const handleSingleGenerateAi = async (studentId: string, studentName: string) => {
    try {
      setGeneratingMap((prev) => ({ ...prev, [studentId]: true }));
      const currentEval = sessionEvaluations[studentId];
      const res = await evaluationService.generateComment(currentSession.id, {
        studentId,
        studentName,
        className: classData?.className,
        date: currentSession.date,
        criteria: currentEval?.criteria,
      });

      handleEvaluationChange(studentId, {
        evaluationComment: res.comment,
        isAiGenerated: res.isAiGenerated,
        isApprovedByTeacher: false,
      });

      if (res.cooldownSeconds > 0) {
        setCooldownMap((prev) => ({ ...prev, [studentId]: res.cooldownSeconds }));
      }
      message.success(`Đã sinh nhận xét cho ${studentName}`);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi sinh nhận xét AI.');
    } finally {
      setGeneratingMap((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handleBatchGenerateAi = async () => {
    try {
      setBatchGenerating(true);
      const candidates = sessionAttendance
        .filter((a) => a.isPresent)
        .map((a) => ({
          studentId: a.studentId,
          studentName: a.student?.name || '',
          className: classData?.className,
          date: currentSession.date,
          criteria: sessionEvaluations[a.studentId]?.criteria,
        }));

      if (candidates.length === 0) {
        message.warning('Không có học sinh có mặt để tạo nhận xét.');
        return;
      }

      const res = await evaluationService.generateBatchComments(currentSession.id, candidates);
      if (res && res.results) {
        setSessionEvaluations((prev) => {
          const next = { ...prev };
          for (const item of res.results) {
            if (item.comment) {
              next[item.studentId] = {
                ...(next[item.studentId] || {
                  studentId: item.studentId,
                  classSessionId: currentSession.id,
                  criteria: {},
                }),
                evaluationComment: item.comment,
                isAiGenerated: item.isAiGenerated,
                isApprovedByTeacher: false,
              };
            }
          }
          return next;
        });
        message.success(`Đã tạo nhận xét AI cho ${res.results.length} học sinh.`);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi sinh nhận xét hàng loạt.');
    } finally {
      setBatchGenerating(false);
    }
  };

  const handleApproveAll = () => {
    const validEntries = Object.entries(sessionEvaluations).filter(
      ([, v]) => v.evaluationComment && v.evaluationComment.trim() !== ''
    );
    if (validEntries.length === 0) {
      message.warning('Chưa có nhận xét nào để duyệt.');
      return;
    }

    const isAllApproved = validEntries.every(([, v]) => v.isApprovedByTeacher);

    setSessionEvaluations((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(next)) {
        if (v.evaluationComment && v.evaluationComment.trim() !== '') {
          next[k] = { ...v, isApprovedByTeacher: !isAllApproved };
        }
      }
      return next;
    });

    if (isAllApproved) {
      message.info('Đã hủy duyệt tất cả nhận xét.');
    } else {
      message.success('Đã duyệt tất cả nhận xét hợp lệ.');
    }
  };

  const saveEvaluationsInternal = async () => {
    const evalPayloadList = Object.values(sessionEvaluations).map((e) => ({
      studentId: e.studentId,
      criteria: e.criteria,
      evaluationScore: e.evaluationScore || null,
      evaluationComment: e.evaluationComment || null,
      isAiGenerated: !!e.isAiGenerated,
      isApprovedByTeacher: !!e.isApprovedByTeacher,
    }));
    if (evalPayloadList.length > 0) {
      await evaluationService.saveSessionEvaluations(currentSession.id, {
        evaluations: evalPayloadList,
      });
    }
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      await api.post(`/classes/sessions/${currentSession.id}/attendance`, {
        attendance: sessionAttendance.map((a) => ({
          studentId: a.studentId,
          isPresent: a.isPresent,
          reason: a.reason,
          note: a.note,
        })),
      });
      await saveEvaluationsInternal();
      message.success('Lưu điểm danh và đánh giá thành công!');
      onReload();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu điểm danh');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveEvaluationsOnly = async () => {
    setSavingEvaluations(true);
    try {
      await saveEvaluationsInternal();
      message.success('Cập nhật đánh giá thành công!');
      onReload();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật đánh giá');
    } finally {
      setSavingEvaluations(false);
    }
  };

  const handleCompleteSession = () => {
    modal.confirm({
      title: 'Xác nhận Kết thúc buổi học',
      content: 'Khi kết thúc, trạng thái sẽ chuyển sang Hoàn thành và KHÓA bảng điểm danh buổi này.',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.post(`/classes/sessions/${currentSession.id}/attendance`, {
            attendance: sessionAttendance.map((a) => ({
              studentId: a.studentId,
              isPresent: a.isPresent,
              reason: a.reason,
              note: a.note,
            })),
          });
          await saveEvaluationsInternal();
          const { data } = await api.post(`/classes/sessions/${currentSession.id}/complete`);
          message.success('Đã kết thúc buổi học!');
          setCurrentSession(data);
          onClose();
          onReload();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi hoàn thành buổi học');
        }
      },
    });
  };

  const handleOverrideAttendance = () => {
    modal.confirm({
      title: '⚠️ Xác nhận sửa điểm danh đã chốt',
      content: 'Bạn sắp sửa bảng điểm danh của buổi học đã kết thúc. Chỉ được phép nếu chưa tính tiền.',
      okText: 'Xác nhận sửa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        setSavingAttendance(true);
        try {
          await api.post(`/classes/sessions/${currentSession.id}/attendance-override`, {
            attendance: sessionAttendance.map((a) => ({
              studentId: a.studentId,
              isPresent: a.isPresent,
              reason: a.reason,
              note: a.note,
            })),
          });
          await saveEvaluationsInternal();
          message.success('Đã cập nhật điểm danh thành công!');
          setIsOverrideMode(false);
          onClose();
          onReload();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi sửa điểm danh');
        } finally {
          setSavingAttendance(false);
        }
      },
    });
  };

  const handleCancelSession = () => {
    modal.confirm({
      title: 'Xác nhận cho nghỉ học',
      content: 'Bạn có chắc chắn muốn hủy buổi học này? Hệ thống sẽ KHÔNG tính buổi học này.',
      okText: 'Cho nghỉ',
      okButtonProps: { danger: true },
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          const { data } = await api.post(`/classes/sessions/${currentSession.id}/cancel`);
          message.success('Đã cập nhật trạng thái nghỉ học!');
          setCurrentSession(data);
          onReload();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi hủy buổi học');
        }
      },
    });
  };

  const handleReopenSession = async () => {
    try {
      const { data } = await api.post(`/classes/sessions/${currentSession.id}/reopen`);
      message.success('Đã mở lại buổi học!');
      setCurrentSession(data);
      onReload();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi mở lại buổi học');
    }
  };

  const handleRevertToScheduled = () => {
    modal.confirm({
      title: 'Xác nhận Trở lại chưa diễn ra',
      content: 'Chuyển buổi học về trạng thái Chưa diễn ra?',
      okText: 'Đồng ý',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const { data } = await api.post(`/classes/sessions/${currentSession.id}/revert`);
          message.success('Đã chuyển về Chưa diễn ra!');
          setCurrentSession(data);
          onReload();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi hoàn tác');
        }
      },
    });
  };

  return {
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
  };
};
