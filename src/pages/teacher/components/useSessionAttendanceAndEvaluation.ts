import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { message } from 'antd';
import type { StudentAttendanceItem } from './AttendanceTabContent';
import evaluationService, {
  type StudentSessionEvaluationItem,
} from '../../../services/evaluation.service';

interface UseSessionAttendanceAndEvaluationParams {
  session: any;
  onSuccess: () => void;
  onClose: () => void;
}

export const useSessionAttendanceAndEvaluation = ({
  session,
  onSuccess,
  onClose,
}: UseSessionAttendanceAndEvaluationParams) => {
  const [attendances, setAttendances] = useState<StudentAttendanceItem[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, StudentSessionEvaluationItem>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [attendanceLocked, setAttendanceLocked] = useState(session.attendanceLocked);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attRes, evalList] = await Promise.all([
          api.get(`/classes/sessions/${session.id}/attendance`),
          evaluationService.getSessionEvaluations(session.id).catch(() => []),
        ]);

        const normalizedAtt = (attRes.data || []).map((a: any) => ({
          ...a,
          attendanceType: a.verifyMethod ? a.attendanceType : 'manual',
        }));
        setAttendances(normalizedAtt);

        const evalRecord: Record<string, StudentSessionEvaluationItem> = {};
        for (const ev of evalList) {
          evalRecord[ev.studentId] = ev;
        }

        if (Array.isArray(attRes.data)) {
          for (const a of attRes.data) {
            if (!evalRecord[a.studentId]) {
              evalRecord[a.studentId] = {
                studentId: a.studentId,
                classSessionId: session.id,
                criteria: {},
                evaluationScore: a.evaluationScore || null,
                evaluationComment: a.evaluationComment || null,
                isAiGenerated: false,
                isApprovedByTeacher: false,
              };
            }
          }
        }
        setEvaluations(evalRecord);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu buổi học:', err);
        message.error('Lỗi khi tải dữ liệu buổi học.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session.id]);

  useEffect(() => {
    setSessionStatus(session.status);
    setAttendanceLocked(session.attendanceLocked);
  }, [session.status, session.attendanceLocked]);

  const startSession = async () => {
    try {
      setSubmitting(true);
      await api.post(`/classes/sessions/${session.id}/start-attendance?bypassTimeCheck=true`);
      message.success('Đã bắt đầu điểm danh.');
      setSessionStatus('In-Progress');
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi bắt đầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluationChange = (
    studentId: string,
    patch: Partial<StudentSessionEvaluationItem>
  ) => {
    setEvaluations((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          studentId,
          classSessionId: session.id,
          criteria: {},
        }),
        ...patch,
      },
    }));
  };

  const handleSingleGenerateAi = async (studentId: string, studentName: string) => {
    try {
      setGeneratingMap((prev) => ({ ...prev, [studentId]: true }));
      const currentEval = evaluations[studentId];
      const res = await evaluationService.generateComment(session.id, {
        studentId,
        studentName,
        className: session.className,
        date: session.date,
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
      const candidates = attendances
        .filter((a) => a.isPresent)
        .map((a) => ({
          studentId: a.studentId,
          studentName: `${a.student.lastName} ${a.student.firstName}`,
          className: session.className,
          date: session.date,
          criteria: evaluations[a.studentId]?.criteria,
        }));

      if (candidates.length === 0) {
        message.warning('Không có học sinh có mặt để tạo nhận xét.');
        return;
      }

      const res = await evaluationService.generateBatchComments(session.id, candidates);
      if (res && res.results) {
        setEvaluations((prev) => {
          const next = { ...prev };
          for (const item of res.results) {
            if (item.comment) {
              next[item.studentId] = {
                ...(next[item.studentId] || {
                  studentId: item.studentId,
                  classSessionId: session.id,
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
    const validEntries = Object.entries(evaluations).filter(
      ([, v]) => v.evaluationComment && v.evaluationComment.trim() !== ''
    );
    if (validEntries.length === 0) {
      message.warning('Chưa có nhận xét nào để duyệt.');
      return;
    }

    const isAllApproved = validEntries.every(([, v]) => v.isApprovedByTeacher);

    setEvaluations((prev) => {
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

  const saveAllData = async (shouldComplete: boolean = false) => {
    try {
      setSubmitting(true);
      await api.post(`/classes/sessions/${session.id}/attendance`, {
        attendance: attendances.map((a) => ({
          studentId: a.studentId,
          isPresent: a.isPresent,
          reason: a.reason,
          note: a.note,
        })),
      });

      const evalPayloadList = Object.values(evaluations).map((e) => ({
        studentId: e.studentId,
        criteria: e.criteria,
        evaluationScore: e.evaluationScore || null,
        evaluationComment: e.evaluationComment || null,
        isAiGenerated: !!e.isAiGenerated,
        isApprovedByTeacher: !!e.isApprovedByTeacher,
      }));

      if (evalPayloadList.length > 0) {
        await evaluationService.saveSessionEvaluations(session.id, {
          evaluations: evalPayloadList,
        });
      }

      if (shouldComplete) {
        await api.post(`/classes/sessions/${session.id}/complete`);
        message.success('Đã chốt điểm danh và kết thúc lớp!');
        setSessionStatus('Completed');
        setAttendanceLocked(true);
      } else {
        message.success('Đã lưu thành công!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
};
