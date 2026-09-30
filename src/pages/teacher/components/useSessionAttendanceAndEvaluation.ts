import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { message } from 'antd';
import type { StudentAttendanceItem } from './AttendanceTabContent';
import evaluationService, {
  type StudentSessionEvaluationItem,
  type EvaluationCriteria,
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

        const normalizedAtt = (attRes.data || [])
          .map((a: any) => ({
            ...a,
            attendanceType: a.verifyMethod ? a.attendanceType : 'manual',
          }))
          .sort((a: any, b: any) => {
            const aFirst = a.student?.firstName || '';
            const bFirst = b.student?.firstName || '';
            const comp = aFirst.localeCompare(bFirst, 'vi', { sensitivity: 'base' });
            if (comp !== 0) return comp;
            const aLast = a.student?.lastName || '';
            const bLast = b.student?.lastName || '';
            return aLast.localeCompare(bLast, 'vi', { sensitivity: 'base' });
          });
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
    let nextItem: StudentSessionEvaluationItem;
    setEvaluations((prev) => {
      const existing = prev[studentId] || {
        studentId,
        classSessionId: session.id,
        criteria: {},
      };
      nextItem = {
        ...existing,
        ...patch,
      };
      return {
        ...prev,
        [studentId]: nextItem,
      };
    });

    // Nếu người dùng bấm duyệt / hủy duyệt từng học sinh -> lưu thực tế ngay xuống server
    if (patch.isApprovedByTeacher !== undefined && patch.evaluationComment === undefined && session?.id) {
      const existing = evaluations[studentId] || {
        studentId,
        classSessionId: session.id,
        criteria: {},
      };
      const toSave = { ...existing, ...patch };
      evaluationService
        .saveSessionEvaluations(session.id, {
          evaluations: [
            {
              studentId,
              criteria: toSave.criteria || {},
              evaluationScore: toSave.evaluationScore || null,
              evaluationComment: toSave.evaluationComment || null,
              isAiGenerated: !!toSave.isAiGenerated,
              isApprovedByTeacher: !!patch.isApprovedByTeacher,
            },
          ],
        })
        .then(() => {
          message.success(
            patch.isApprovedByTeacher ? 'Đã duyệt đánh giá của học sinh.' : 'Đã hủy duyệt đánh giá.',
          );
        })
        .catch((err) => {
          console.error('Lỗi lưu duyệt:', err);
          message.error('Không thể lưu trạng thái duyệt vào hệ thống.');
        });
    }
  };

  const defaultCriteria: EvaluationCriteria = {
    homework: 'done',
    understanding: 'normal',
    participation: 'active',
    behavior: 'good',
  };

  const handleSingleGenerateAi = async (studentId: string, studentName: string) => {
    try {
      setGeneratingMap((prev) => ({ ...prev, [studentId]: true }));
      const currentEval = evaluations[studentId];
      const hasCriteria = Boolean(
        currentEval?.criteria?.homework ||
        currentEval?.criteria?.understanding ||
        currentEval?.criteria?.participation ||
        currentEval?.criteria?.behavior
      );
      const effectiveCriteria = hasCriteria ? currentEval?.criteria : defaultCriteria;

      const res = await evaluationService.generateComment(session.id, {
        studentId,
        studentName,
        className: session.className,
        date: session.date,
        criteria: effectiveCriteria,
      });

      handleEvaluationChange(studentId, {
        criteria: effectiveCriteria,
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
      const presentStudents = attendances.filter((a) => a.isPresent);
      const targetStudents = presentStudents.length > 0 ? presentStudents : attendances;
      const candidates = targetStudents.map((a) => {
          const currentEval = evaluations[a.studentId];
          const hasCriteria = Boolean(
            currentEval?.criteria?.homework ||
            currentEval?.criteria?.understanding ||
            currentEval?.criteria?.participation ||
            currentEval?.criteria?.behavior
          );
          const effectiveCriteria = hasCriteria ? currentEval?.criteria : defaultCriteria;
          const firstName = a.student?.firstName || '';
          const lastName = a.student?.lastName || '';
          const studentName = `${lastName} ${firstName}`.trim() || 'Học sinh';
          return {
            studentId: a.studentId,
            studentName,
            className: session.className,
            date: session.date,
            criteria: effectiveCriteria,
          };
        });

      if (candidates.length === 0) {
        message.warning('Không có học sinh nào trong danh sách.');
        return;
      }

      const res = await evaluationService.generateBatchComments(session.id, candidates);
      if (res && res.results) {
        setEvaluations((prev) => {
          const next = { ...prev };
          for (const item of res.results) {
            if (item.comment) {
              const currentItem = next[item.studentId] || {
                studentId: item.studentId,
                classSessionId: session.id,
                criteria: {},
              };
              const hasCriteria = Boolean(
                currentItem.criteria?.homework ||
                currentItem.criteria?.understanding ||
                currentItem.criteria?.participation ||
                currentItem.criteria?.behavior
              );
              next[item.studentId] = {
                ...currentItem,
                criteria: hasCriteria ? currentItem.criteria : defaultCriteria,
                evaluationComment: item.comment,
                isAiGenerated: item.isAiGenerated,
                isApprovedByTeacher: false,
              };
            }
          }
          return next;
        });
        message.success(`Đã tạo nhận xét AI & điền tiêu chí đánh giá cho ${res.results.length} học sinh.`);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi sinh nhận xét hàng loạt.');
    } finally {
      setBatchGenerating(false);
    }
  };

  const handleApproveAll = async () => {
    const studentKeys = attendances.map((a) => a.studentId);
    if (studentKeys.length === 0) {
      message.warning('Chưa có học sinh nào trong buổi học này.');
      return;
    }

    const isAllApproved = studentKeys.every(
      (id) => evaluations[id]?.isApprovedByTeacher
    );

    const nextEvaluations = { ...evaluations };
    for (const a of attendances) {
      const existing = nextEvaluations[a.studentId] || {
        studentId: a.studentId,
        classSessionId: session.id,
        criteria: {},
      };
      nextEvaluations[a.studentId] = {
        ...existing,
        isApprovedByTeacher: !isAllApproved,
      };
    }
    setEvaluations(nextEvaluations);

    // Lưu thực tế ngay lập tức xuống backend!
    try {
      const evalPayloadList = Object.values(nextEvaluations).map((e) => ({
        studentId: e.studentId,
        criteria: e.criteria || {},
        evaluationScore: e.evaluationScore || null,
        evaluationComment: e.evaluationComment || null,
        isAiGenerated: !!e.isAiGenerated,
        isApprovedByTeacher: !isAllApproved,
      }));
      if (evalPayloadList.length > 0) {
        await evaluationService.saveSessionEvaluations(session.id, {
          evaluations: evalPayloadList,
        });
      }
      if (isAllApproved) {
        message.info('Đã hủy duyệt tất cả đánh giá.');
      } else {
        message.success('Đã duyệt và lưu thành công tất cả đánh giá!');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu duyệt hàng loạt.');
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

  const handleMarkAllGoodAndSave = async () => {
    if (attendances.length === 0) {
      message.warning('Chưa có học sinh nào trong buổi học này.');
      return;
    }

    const allGoodCriteria: EvaluationCriteria = {
      attendance: 'yes',
      homework: 'yes',
      behavior: 'yes',
      participation: 'yes',
    };

    const nextEvaluations: Record<string, StudentSessionEvaluationItem> = { ...evaluations };
    for (const a of attendances) {
      const existing = nextEvaluations[a.studentId] || {
        studentId: a.studentId,
        classSessionId: session.id,
        criteria: {},
        evaluationScore: null,
        evaluationComment: null,
        isAiGenerated: false,
        isApprovedByTeacher: false,
      };
      nextEvaluations[a.studentId] = {
        ...existing,
        criteria: { ...allGoodCriteria },
      };
    }
    setEvaluations(nextEvaluations);

    // Tự động lưu luôn xuống backend!
    try {
      setSubmitting(true);
      const evalPayloadList = Object.values(nextEvaluations).map((e) => ({
        studentId: e.studentId,
        criteria: e.criteria || {},
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
      message.success('Đã đánh giá 1-chạm TỐT HẾT (YES) cho cả lớp và tự động lưu thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu đánh giá.');
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
    handleMarkAllGoodAndSave,
    saveAllData,
  };
};
