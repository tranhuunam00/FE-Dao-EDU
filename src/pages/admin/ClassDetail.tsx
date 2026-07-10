import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  App, Tag, Button, Spin,
  Tabs, Modal, Form, Select, DatePicker, TimePicker, Switch, Input, Divider, Alert, Typography, Descriptions, Row, Col, Table, InputNumber
} from 'antd';
import {
  ArrowLeftOutlined, TeamOutlined, CalendarOutlined,
  CheckCircleOutlined, StopOutlined, EditOutlined, SaveOutlined,
  PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { useAuth, Role } from '../../context/AuthContext';

import { GeneralTab } from './ClassDetailTabs/GeneralTab';
import { StudentsTab } from './ClassDetailTabs/StudentsTab';
import { ScheduleTab } from './ClassDetailTabs/ScheduleTab';
import { AssignmentsTab } from './ClassDetailTabs/AssignmentsTab';
import { MaterialsTab } from './ClassDetailTabs/MaterialsTab';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentAttendance {
  studentId: string;
  isPresent: boolean;
  reason?: string;
  note?: string;
  student?: {
    name: string;
    user?: { email: string };
  };
}

interface ClassSession {
  id: string;
  roomId: string | null;
  teacherId: string | null;
  assistantId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceLocked: boolean;
  teacher?: { firstName: string; lastName: string };
  assistant?: { firstName: string; lastName: string };
  room?: { name: string };
}

const ClassDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySessionId = searchParams.get('sessionId');
  const { message, modal } = App.useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [levelPricing, setLevelPricing] = useState<any[]>([]);

  // Modals / Drawer Control
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState<ClassSession | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<StudentAttendance[]>([]);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  // Editing Session details
  const [isEditSessionVisible, setIsEditSessionVisible] = useState(false);
  const [sessionForm] = Form.useForm();

  // Editing Class details
  const [isEditClassVisible, setIsEditClassVisible] = useState(false);
  const [classForm] = Form.useForm();
  const [savingClass, setSavingClass] = useState(false);
  const [editSchedules, setEditSchedules] = useState<any[]>([]);

  // Clone Students from other class states
  const [isCloneVisible, setIsCloneVisible] = useState(false);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [selectedSourceClassId, setSelectedSourceClassId] = useState<string | null>(null);
  const [cloneStudentIds, setCloneStudentIds] = useState<string[]>([]);
  const [sourceStudents, setSourceStudents] = useState<any[]>([]);
  const [loadingSourceStudents, setLoadingSourceStudents] = useState(false);
  const [cloning, setCloning] = useState(false);

  const loadAllData = async () => {
    if (!id) return;
    try {
      const [classRes, sessionsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/classes/${id}/sessions`),
      ]);
      setClassData(classRes.data);
      setSessions(sessionsRes.data);

      if (classRes.data.center?.id) {
        api.get(`/rooms?centerId=${classRes.data.center.id}&status=Active`).then(({ data }) => setRooms(data)).catch(() => {});
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin chi tiết lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    api.get('/teachers?page=1&limit=100').then(({ data }) => setTeachers(data.teachers || [])).catch(() => {});
    api.get('/students?page=1&limit=1000').then(({ data }) => setAllStudents(data.students || [])).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (querySessionId && sessions.length > 0 && classData) {
      const found = sessions.find(s => s.id === querySessionId);
      if (found) {
        if (!isSessionModalVisible || currentSession?.id !== querySessionId) {
          openSessionDetail(found);
        }
      }
    }
  }, [querySessionId, sessions, classData]);

  useEffect(() => {
    if (classData?.courseId) {
      api.get(`/courses/${classData.courseId}`).then(({ data }) => {
        const currentLevel = data.levels?.find((l: any) => l.id === classData.courseLevelId);
        if (currentLevel) {
          setLevelPricing(currentLevel.pricing || []);
        }
      }).catch(() => {});
    }
  }, [classData]);

  const openEditClassModal = () => {
    if (!classData) return;
    classForm.setFieldsValue({
      className: classData.className,
      classCode: classData.classCode,
      status: classData.status,
      startDate: classData.startDate ? dayjs(classData.startDate) : null,
      finishDate: classData.finishDate ? dayjs(classData.finishDate) : null,
      maxSize: classData.maxSize,
      mainTeacherId: classData.mainTeacherId,
      assistantId: classData.assistantId,
      skipHolidays: classData.skipHolidays,
      description: classData.description,
    });
    const schedulesList = classData.schedules?.map((s: any) => ({
      key: s.id || `temp-${Math.random()}`,
      weekday: s.weekday,
      startTime: s.startTime ? dayjs(s.startTime, 'HH:mm:ss') : null,
      endTime: s.endTime ? dayjs(s.endTime, 'HH:mm:ss') : null,
      roomId: s.roomId || null,
    })) || [];
    setEditSchedules(schedulesList);
    setIsEditClassVisible(true);
  };

  const addEditSchedule = () => {
    setEditSchedules(prev => [
      ...prev,
      {
        key: `temp-${Math.random()}`,
        weekday: 'Mon',
        startTime: null,
        endTime: null,
        roomId: null,
      }
    ]);
  };

  const removeEditSchedule = (key: string) => {
    setEditSchedules(prev => prev.filter(s => s.key !== key));
  };

  const updateEditSchedule = (key: string, field: string, value: any) => {
    setEditSchedules(prev => prev.map(s => s.key === key ? { ...s, [field]: value } : s));
  };

  const checkTaWageConfiguredDetail = (): boolean => {
    if (!levelPricing || levelPricing.length === 0) return false;
    return levelPricing.some((p: any) => Number(p.taWagePerSession || 0) > 0);
  };

  const handleEditClassSubmit = async () => {
    try {
      const values = await classForm.validateFields();

      if (values.assistantId) {
        const isTaWageConfigured = checkTaWageConfiguredDetail();
        if (!isTaWageConfigured) {
          let proceed = false;
          await new Promise<void>((resolve) => {
            Modal.confirm({
              title: 'Cảnh báo đơn giá trợ giảng',
              content: 'Chương trình học hiện tại của lớp chưa cấu hình đơn giá lương cho Trợ giảng (TA). Bạn có chắc chắn muốn tiếp tục lưu?',
              okText: 'Tiếp tục',
              cancelText: 'Hủy',
              onOk: () => {
                proceed = true;
                resolve();
              },
              onCancel: () => {
                resolve();
              }
            });
          });
          if (!proceed) return;
        }
      }

      // Validate schedules
      for (const s of editSchedules) {
        if (!s.startTime || !s.endTime) {
          message.error('Vui lòng điền đầy đủ thời gian bắt đầu và kết thúc cho lịch học.');
          return;
        }
        if (s.startTime.isAfter(s.endTime) || s.startTime.isSame(s.endTime)) {
          message.error('Thời gian bắt đầu lịch học phải trước thời gian kết thúc.');
          return;
        }
      }

      // Validate overlapping schedules
      for (let i = 0; i < editSchedules.length; i++) {
        for (let j = i + 1; j < editSchedules.length; j++) {
          const a = editSchedules[i];
          const b = editSchedules[j];
          if (a.weekday === b.weekday && a.startTime && a.endTime && b.startTime && b.endTime) {
            const aStart = a.startTime.format('HH:mm');
            const aEnd = a.endTime.format('HH:mm');
            const bStart = b.startTime.format('HH:mm');
            const bEnd = b.endTime.format('HH:mm');
            if (aStart < bEnd && bStart < aEnd) {
              message.error(`Lịch học định kỳ bị trùng thời gian vào thứ ${a.weekday} (${aStart}-${aEnd} và ${bStart}-${bEnd}).`);
              return;
            }
          }
        }
      }

      setSavingClass(true);
      const payload = {
        className: values.className,
        classCode: values.classCode,
        status: values.status,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        finishDate: values.finishDate ? values.finishDate.format('YYYY-MM-DD') : null,
        maxSize: values.maxSize,
        mainTeacherId: values.mainTeacherId || null,
        assistantId: values.assistantId || null,
        skipHolidays: values.skipHolidays,
        description: values.description || null,
        schedules: editSchedules.map(s => ({
          weekday: s.weekday,
          startTime: s.startTime ? s.startTime.format('HH:mm') : '00:00',
          endTime: s.endTime ? s.endTime.format('HH:mm') : '00:00',
          roomId: s.roomId,
          durationMins: s.startTime && s.endTime ? s.endTime.diff(s.startTime, 'minute') : 90,
        })),
      };

      await api.put(`/classes/${id}`, payload);
      message.success('Cập nhật thông tin lớp học thành công!');
      setIsEditClassVisible(false);
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật thông tin lớp học');
    } finally {
      setSavingClass(false);
    }
  };

  const handleAddStudent = async () => {
    if (selectedStudentIds.length === 0 || !id) return;
    try {
      await api.post(`/classes/${id}/students`, { studentIds: selectedStudentIds });
      message.success('Đã thêm học sinh vào lớp thành công!');
      setIsAddStudentVisible(false);
      setSelectedStudentIds([]);
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi thêm học sinh');
    }
  };

  const openCloneModal = async () => {
    setIsCloneVisible(true);
    setSelectedSourceClassId(null);
    setSourceStudents([]);
    setCloneStudentIds([]);
    try {
      const { data } = await api.get('/classes?page=1&limit=1000');
      setAllClasses((data.classes || []).filter((c: any) => c.id !== id));
    } catch (err) {
      message.error('Không thể tải danh sách lớp học');
    }
  };

  const handleSourceClassChange = async (val: string) => {
    setSelectedSourceClassId(val);
    setCloneStudentIds([]);
    setSourceStudents([]);
    if (!val) return;
    setLoadingSourceStudents(true);
    try {
      const { data } = await api.get(`/classes/${val}`);
      const activeStudents = (data.students || [])
        .filter((cs: any) => cs.status === 'Active')
        .map((cs: any) => cs.student);
      setSourceStudents(activeStudents);
      
      // Mặc định chọn tất cả học sinh từ lớp nguồn
      const allSourceStudentIds = activeStudents.map((s: any) => s.id);
      setCloneStudentIds(allSourceStudentIds);
    } catch (err) {
      message.error('Không thể tải danh sách học sinh của lớp đã chọn');
    } finally {
      setLoadingSourceStudents(false);
    }
  };

  const handleCloneStudents = async () => {
    if (cloneStudentIds.length === 0 || !id) {
      message.warning('Vui lòng chọn ít nhất một học sinh để sao chép.');
      return;
    }

    // Lọc ra các học sinh chưa có trong lớp hiện tại
    const targetActiveStudentIds = (classData?.students || [])
      .filter((cs: any) => cs.status === 'Active')
      .map((cs: any) => cs.studentId);
      
    const newStudentIds = cloneStudentIds.filter(sid => !targetActiveStudentIds.includes(sid));
    const duplicateStudentIds = cloneStudentIds.filter(sid => targetActiveStudentIds.includes(sid));
    
    const duplicateStudentsInfo = sourceStudents.filter(s => duplicateStudentIds.includes(s.id));
    const duplicateNames = duplicateStudentsInfo.map(s => `${s.lastName} ${s.firstName}`).join(', ');

    if (newStudentIds.length === 0) {
      modal.warning({
        title: 'Học sinh đã tồn tại',
        content: `Tất cả học sinh bạn chọn (${duplicateNames}) đều đã có sẵn trong lớp hiện tại rồi.`,
      });
      setIsCloneVisible(false);
      return;
    }

    setCloning(true);
    try {
      await api.post(`/classes/${id}/students`, { studentIds: newStudentIds });
      
      if (duplicateStudentIds.length > 0) {
        modal.warning({
          title: 'Sao chép học sinh hoàn tất với cảnh báo',
          content: `Đã thêm thành công ${newStudentIds.length} học sinh mới vào lớp. Lưu ý: có ${duplicateStudentIds.length} học sinh (${duplicateNames}) không được thêm vì đã có sẵn trong lớp hiện tại rồi.`,
        });
      } else {
        message.success(`Đã sao chép thành công ${newStudentIds.length} học sinh vào lớp!`);
      }
      
      setIsCloneVisible(false);
      setSelectedSourceClassId(null);
      setSourceStudents([]);
      setCloneStudentIds([]);
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi sao chép học sinh');
    } finally {
      setCloning(false);
    }
  };

  const handleKickStudent = (studentId: string, studentName: string) => {
    modal.confirm({
      title: 'Xác nhận xóa học sinh',
      content: `Bạn có chắc chắn muốn kick học sinh ${studentName} ra khỏi lớp này? Các buổi điểm danh trong quá khứ vẫn được lưu lại để tính buổi học, các buổi tương lai chưa điểm danh sẽ bị hủy.`,
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/classes/${id}/students/${studentId}`);
          message.success('Đã kick học sinh thành công (trạng thái Dropped)');
          loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi xóa học sinh');
        }
      }
    });
  };

  const handleReAddStudent = async (studentId: string) => {
    if (!id) return;
    try {
      await api.post(`/classes/${id}/students`, { studentId });
      message.success('Đã thêm học sinh quay trở lại lớp học!');
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi thêm lại học sinh');
    }
  };

  const openSessionDetail = async (session: ClassSession) => {
    setCurrentSession(session);
    setIsSessionModalVisible(true);
    try {
      const { data } = await api.get(`/classes/sessions/${session.id}/attendance`);
      const mapped = (classData?.students || [])
        .filter((cs: any) => {
          const joined = dayjs(cs.joinedDate);
          const sess = dayjs(session.date);
          const isJoined = joined.isBefore(sess) || joined.isSame(sess, 'day');
          if (cs.status === 'Active') {
            return isJoined;
          }
          if (cs.status === 'Dropped') {
            const left = dayjs(cs.updatedAt);
            return isJoined && (sess.isBefore(left) || sess.isSame(left, 'day'));
          }
          return false;
        })
        .map((cs: any) => {
          const record = data.find((d: any) => d.studentId === cs.studentId);
          return {
            studentId: cs.studentId,
            isPresent: record ? record.isPresent : false,
            reason: record ? record.reason : '',
            note: record ? record.note : '',
            student: {
              name: cs.student ? `${cs.student.lastName} ${cs.student.firstName}` : '-',
              user: cs.student.user,
            }
          };
        });
      setSessionAttendance(mapped);
    } catch (err: any) {
      message.error('Lỗi khi tải thông tin điểm danh.');
    }
  };

  const handleStartAttendance = async () => {
    if (!currentSession) return;
    try {
      const { data } = await api.post(`/classes/sessions/${currentSession.id}/start-attendance?bypassTimeCheck=true`);
      message.success('Buổi học bắt đầu thành công. Trạng thái chuyển sang Đang học!');
      setCurrentSession(data);
      const sessionsRes = await api.get(`/classes/${id}/sessions`);
      setSessions(sessionsRes.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể bắt đầu điểm danh. Vui lòng kiểm tra thời gian buổi học.');
    }
  };

  const handleSaveAttendance = async () => {
    if (!currentSession) return;
    setSavingAttendance(true);
    try {
      await api.post(`/classes/sessions/${currentSession.id}/attendance`, {
        attendance: sessionAttendance.map(a => ({
          studentId: a.studentId,
          isPresent: a.isPresent,
          reason: a.reason,
          note: a.note,
        })),
      });
      message.success('Lưu điểm danh thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu điểm danh');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!currentSession) return;
    modal.confirm({
      title: 'Xác nhận Kết thúc buổi học',
      content: 'Khi kết thúc, trạng thái sẽ chuyển sang Hoàn thành và KHÓA bảng điểm danh buổi này. Hệ thống sẽ tính buổi học cho học viên có tham gia và buổi dạy cho giáo viên.',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.post(`/classes/sessions/${currentSession.id}/attendance`, {
            attendance: sessionAttendance.map(a => ({
              studentId: a.studentId,
              isPresent: a.isPresent,
              reason: a.reason,
              note: a.note,
            })),
          });
          const { data } = await api.post(`/classes/sessions/${currentSession.id}/complete`);
          message.success('Đã kết thúc buổi học!');
          setCurrentSession(data);
          setIsSessionModalVisible(false);
          loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi hoàn thành buổi học');
        }
      }
    });
  };

  const handleOverrideAttendance = () => {
    if (!currentSession) return;
    modal.confirm({
      title: '⚠️ Xác nhận sửa điểm danh đã chốt',
      content: (
        <div>
          <p>Bạn sắp <strong>sửa bảng điểm danh của buổi học đã kết thúc</strong>.</p>
          <p style={{ color: '#ef4444' }}>Lưu ý: Chỉ được phép với các buổi <strong>chưa được đưa vào hóa đơn tính tiền</strong>. Hệ thống sẽ từ chối nếu bất kỳ học sinh nào đã được tính tiền.</p>
          <p>Bạn có chắc chắn muốn tiếp tục không?</p>
        </div>
      ),
      okText: 'Xác nhận sửa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        setSavingAttendance(true);
        try {
          await api.post(`/classes/sessions/${currentSession.id}/attendance-override`, {
            attendance: sessionAttendance.map(a => ({
              studentId: a.studentId,
              isPresent: a.isPresent,
              reason: a.reason,
              note: a.note,
            })),
          });
          message.success('Đã cập nhật điểm danh thành công!');
          setIsOverrideMode(false);
          setIsSessionModalVisible(false);
          loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Không thể sửa điểm danh.');
        } finally {
          setSavingAttendance(false);
        }
      },
    });
  };

  const handleEditSessionSubmit = async () => {
    if (!currentSession) return;
    try {
      const values = await sessionForm.validateFields();
      const payload = {
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
        startTime: values.startTime ? values.startTime.format('HH:mm') : undefined,
        endTime: values.endTime ? values.endTime.format('HH:mm') : undefined,
        roomId: values.roomId,
        teacherId: values.teacherId,
        assistantId: values.assistantId || null,
        scope: values.scope,
      };

      await api.put(`/classes/sessions/${currentSession.id}`, payload);
      message.success('Cập nhật thông tin buổi học thành công!');
      setIsEditSessionVisible(false);
      setIsSessionModalVisible(false);
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật buổi học. Chú ý không được dời buổi học trong quá khứ.');
    }
  };

  const handleCancelSession = async () => {
    if (!currentSession) return;
    modal.confirm({
      title: 'Xác nhận cho nghỉ học',
      content: 'Bạn có chắc chắn muốn cho lớp nghỉ buổi học này không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.put(`/classes/sessions/${currentSession.id}`, { status: 'Cancelled' });
          message.success('Đã cập nhật trạng thái buổi học thành nghỉ học!');
          setIsSessionModalVisible(false);
          loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi cập nhật buổi học');
        }
      }
    });
  };

  const handleReopenSession = async () => {
    if (!currentSession) return;
    try {
      await api.put(`/classes/sessions/${currentSession.id}`, { status: 'Scheduled' });
      message.success('Đã mở lại buổi học thành công!');
      setIsSessionModalVisible(false);
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi mở lại buổi học');
    }
  };

  const handleGenerateSessions = async () => {
    if (!id) return;
    const isRegenerate = sessions.length > 0;
    modal.confirm({
      title: isRegenerate ? 'Xác nhận sinh lại & đồng bộ buổi học' : 'Xác nhận sinh các buổi học',
      content: isRegenerate 
        ? 'Hệ thống sẽ xóa các buổi học tương lai chưa diễn ra (chưa khóa điểm danh) và sinh lại theo lịch học cố định hiện tại, đồng thời cập nhật giáo viên chính cho các buổi học này. Bạn có chắc chắn muốn tiếp tục?'
        : 'Hệ thống sẽ sinh tự động danh sách các buổi học từ ngày Khai giảng đến ngày Kết thúc dự kiến dựa trên Lịch học cố định. Bạn có chắc chắn muốn tiếp tục?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.post(`/classes/${id}/generate-sessions`);
          message.success(isRegenerate 
            ? 'Đã sinh lại và đồng bộ các buổi học tương lai thành công!' 
            : 'Đã sinh danh sách buổi học thành công!'
          );
          await loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi sinh buổi học');
        }
      }
    });
  };

  const handleGenerateSessionsFromStart = async () => {
    if (!id) return;
    modal.confirm({
      title: 'Xác nhận sinh lại toàn bộ buổi học từ ngày khai giảng',
      content: 'Hệ thống sẽ xóa toàn bộ các buổi học chưa diễn ra (chưa khóa điểm danh, bao gồm cả các buổi trong quá khứ) và sinh lại theo lịch học cố định tính từ ngày Khai giảng lớp học. Bạn có chắc chắn muốn tiếp tục?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.post(`/classes/${id}/generate-sessions?fromStartDate=true`);
          message.success('Đã sinh lại và đồng bộ các buổi học từ ngày khai giảng thành công!');
          await loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi sinh buổi học');
        }
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!classData) {
    return <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '60px' }}>Không tìm thấy thông tin lớp học.</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/classes')}
          style={{ background: 'var(--bg-tertiary)', border: 'none' }}
        />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
            <TeamOutlined style={{ marginRight: 10, color: '#6366f1' }} />
            Lớp: {classData.className}
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Mã lớp: {classData.classCode} • {classData.course?.name} ({classData.courseLevel?.levelName})
          </Text>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={openEditClassModal}
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
        >
          Sửa lớp học
        </Button>
        <Tag color={classData.status === 'Active' ? 'green' : 'blue'} style={{ fontSize: '14px', padding: '4px 16px', margin: 0 }}>
          {classData.status === 'Active' ? 'Hoạt động' : 'Nháp/Lên kế hoạch'}
        </Tag>
      </div>

      {classData.finishDate && classData.status === 'Active' &&
        dayjs(classData.finishDate).diff(dayjs(), 'day') <= 7 &&
        dayjs(classData.finishDate).diff(dayjs(), 'day') >= 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16, border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}
          message={
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>
              ⚠ Lớp học sắp kết thúc trong {dayjs(classData.finishDate).diff(dayjs(), 'day')} ngày
            </span>
          }
          description={
            <span style={{ color: 'var(--text-secondary)' }}>
              Ngày kết thúc dự kiến: <strong style={{ color: '#f59e0b' }}>{dayjs(classData.finishDate).format('DD/MM/YYYY')}</strong>.
              Hãy xác nhận với phụ huynh và học sinh về việc tiếp tục hay kết thúc khóa học.
            </span>
          }
        />
      )}

      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: 'Thông tin chung',
            children: <GeneralTab classData={classData} />
          },
          {
            key: 'students',
            label: `Học sinh (${classData.students.filter((s:any) => s.status === 'Active').length})`,
            children: (
              <StudentsTab
                classData={classData}
                setIsAddStudentVisible={setIsAddStudentVisible}
                handleKickStudent={handleKickStudent}
                handleReAddStudent={handleReAddStudent}
                openCloneModal={openCloneModal}
              />
            )
          },
          {
            key: 'sessions',
            label: `Lịch dạy & Điểm danh (${sessions.length})`,
            children: (
              <ScheduleTab 
                sessions={sessions} 
                handleGenerateSessions={handleGenerateSessions} 
                handleGenerateSessionsFromStart={handleGenerateSessionsFromStart}
                openSessionDetail={openSessionDetail} 
              />
            )
          },
          {
            key: 'assignments',
            label: 'Bài tập',
            children: <AssignmentsTab classId={classData.id} />
          },
          {
            key: 'materials',
            label: 'Tài liệu học tập',
            children: <MaterialsTab classId={classData.id} />
          }
        ]}
      />

      <Modal
        title="Thêm Học sinh vào Lớp"
        open={isAddStudentVisible}
        onOk={handleAddStudent}
        onCancel={() => {
          setIsAddStudentVisible(false);
          setSelectedStudentIds([]);
        }}
        okText="Thêm"
        cancelText="Hủy"
      >
        <div style={{ padding: '12px 0' }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>Chọn học sinh từ hệ thống:</Text>
          <Select
            mode="multiple"
            placeholder="Tìm theo Tên hoặc Email..."
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            onChange={setSelectedStudentIds}
            value={selectedStudentIds}
          >
            {allStudents
              .filter(s => !classData.students.some((cs:any) => cs.studentId === s.id && cs.status === 'Active'))
              .map(s => {
                const fullName = `${s.lastName} ${s.firstName}`;
                const contact = s.email || s.loginEmail || s.mobile || 'Không có liên hệ';
                return (
                  <Option key={s.id} value={s.id}>
                    {fullName} ({contact})
                  </Option>
                );
              })
            }
          </Select>
        </div>
      </Modal>

      {/* Modal Sao Chép Học Sinh Từ Lớp Khác */}
      <Modal
        title="Sao chép Học sinh từ Lớp khác"
        open={isCloneVisible}
        onOk={handleCloneStudents}
        onCancel={() => {
          setIsCloneVisible(false);
          setSelectedSourceClassId(null);
          setSourceStudents([]);
          setCloneStudentIds([]);
        }}
        confirmLoading={cloning}
        okText="Sao chép vào lớp"
        cancelText="Hủy"
        width={700}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>Chọn lớp học nguồn:</Text>
            <Select
              placeholder="Chọn lớp học để lấy danh sách học sinh..."
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
              onChange={handleSourceClassChange}
              value={selectedSourceClassId}
              allowClear
            >
              {allClasses.map(c => (
                <Option key={c.id} value={c.id}>
                  {c.className} ({c.classCode})
                </Option>
              ))}
            </Select>
          </div>

          {selectedSourceClassId && (
            <div>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text strong>Danh sách học sinh có thể sao chép:</Text>
                {sourceStudents.length > 0 && (
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Đã chọn {cloneStudentIds.length}/{sourceStudents.length} học sinh
                  </Text>
                )}
              </div>

              <Table
                dataSource={sourceStudents}
                rowKey="id"
                loading={loadingSourceStudents}
                pagination={false}
                size="small"
                rowSelection={{
                  selectedRowKeys: cloneStudentIds,
                  onChange: (keys: React.Key[]) => {
                    setCloneStudentIds(keys as string[]);
                  },
                  getCheckboxProps: (record: any) => {
                    return {
                      name: record.firstName,
                    };
                  },
                }}
                columns={[
                  {
                    title: 'Học sinh',
                    key: 'name',
                    render: (_: any, record: any) => {
                      const fullName = `${record.lastName} ${record.firstName}`;
                      const isAlreadyInTarget = classData?.students?.some(
                        (cs: any) => cs.studentId === record.id && cs.status === 'Active'
                      );
                      return (
                        <div>
                          <Text strong style={{ color: 'var(--text-primary)' }}>{fullName}</Text>
                          {isAlreadyInTarget && (
                            <Tag color="warning" style={{ marginLeft: 8 }}>⚠️ Đã có trong lớp này rồi</Tag>
                          )}
                        </div>
                      );
                    }
                  },
                  {
                    title: 'Số điện thoại',
                    dataIndex: 'mobile',
                    key: 'mobile',
                    render: (v: string) => v || '-',
                  },
                  {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email',
                    render: (v: string) => v || '-',
                  }
                ]}
                locale={{
                  emptyText: 'Lớp học này chưa có học sinh nào hoặc tất cả học sinh đã có trong lớp hiện tại.'
                }}
              />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title={
          <div>
            <CalendarOutlined style={{ color: '#6366f1', marginRight: 8 }} />
            Buổi học ngày: {currentSession && dayjs(currentSession.date).format('DD/MM/YYYY')}
          </div>
        }
        open={isSessionModalVisible}
        width={750}
        onCancel={() => setIsSessionModalVisible(false)}
        footer={null}
      >
        {currentSession && (
          <div style={{ padding: '8px 0' }}>
            <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Thời gian">{currentSession.startTime.substring(0,5)} - {currentSession.endTime.substring(0,5)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {currentSession.status === 'Scheduled' && <Tag color="blue">Chưa diễn ra</Tag>}
                {currentSession.status === 'In-Progress' && <Tag color="orange">Đang học</Tag>}
                {currentSession.status === 'Completed' && <Tag color="green">Hoàn thành</Tag>}
                {currentSession.status === 'Cancelled' && <Tag color="red">Nghỉ học</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Giáo viên">
                {currentSession.teacher ? `${currentSession.teacher.lastName} ${currentSession.teacher.firstName}` : <span style={{ color: 'var(--text-muted)' }}>Chưa phân công</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Trợ giảng (TA)">
                {currentSession.assistant ? `${currentSession.assistant.lastName} ${currentSession.assistant.firstName}` : <span style={{ color: 'var(--text-muted)' }}>Chưa phân công</span>}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {!currentSession.attendanceLocked && (
                <>
                  {currentSession.status === 'Scheduled' && (
                    <>
                      <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleStartAttendance}>
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
                    <Button type="primary" style={{ background: '#34d399', border: 'none' }} icon={<SaveOutlined />} onClick={handleSaveAttendance} loading={savingAttendance}>
                      Lưu điểm danh
                    </Button>
                  )}
                  {currentSession.status === 'In-Progress' && (
                    <Button danger icon={<StopOutlined />} onClick={handleCompleteSession}>
                      Kết thúc buổi học
                    </Button>
                  )}
                </>
              )}
              {dayjs(currentSession.date).isAfter(dayjs().subtract(1, 'day')) && !currentSession.attendanceLocked && currentSession.status !== 'Cancelled' && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    sessionForm.setFieldsValue({
                      date: dayjs(currentSession.date),
                      startTime: dayjs(currentSession.startTime, 'HH:mm:ss'),
                      endTime: dayjs(currentSession.endTime, 'HH:mm:ss'),
                      roomId: currentSession.roomId,
                      teacherId: currentSession.teacherId,
                      assistantId: currentSession.assistantId,
                      scope: 'single',
                    });
                    setIsEditSessionVisible(true);
                  }}
                >
                  Đổi lịch / Giáo viên
                </Button>
              )}
            </div>

            {/* Admin override section */}
            {currentSession.attendanceLocked && isAdmin && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)' }}>
                {!isOverrideMode ? (
                  <Button
                    danger
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setIsOverrideMode(true)}
                  >
                    Sửa điểm danh (Admin)
                  </Button>
                ) : (
                  <>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<SaveOutlined />}
                      onClick={handleOverrideAttendance}
                      loading={savingAttendance}
                    >
                      Lưu thay đổi
                    </Button>
                    <Button size="small" onClick={() => setIsOverrideMode(false)}>Hủy sửa</Button>
                  </>
                )}
                <span style={{ color: '#ef4444', fontSize: 12 }}>⚠️ Chỉ admin — Chỉ áp dụng nếu buổi chưa tính tiền</span>
              </div>
            )}

            <Divider style={{ margin: '16px 0' }}>Bảng điểm danh học sinh</Divider>

            {currentSession.status === 'Scheduled' ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(0,0,0,0.45)' }}>
                Bấm "Bắt đầu học (Điểm danh)" để tiến hành điểm danh học sinh.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setSessionAttendance(prev => prev.map(a => ({ ...a, isPresent: true })));
                    }}
                    disabled={currentSession.attendanceLocked && !isOverrideMode}
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                  >
                    Có mặt tất cả
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setSessionAttendance(prev => prev.map(a => ({ ...a, isPresent: false })));
                    }}
                    disabled={currentSession.attendanceLocked && !isOverrideMode}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                  >
                    Vắng mặt tất cả
                  </Button>
                </div>
                <Table
                  dataSource={sessionAttendance}
                  rowKey="studentId"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Học sinh',
                      dataIndex: ['student', 'name'],
                      key: 'name',
                    },
                    {
                      title: 'Có mặt?',
                      dataIndex: 'isPresent',
                      key: 'isPresent',
                      width: 120,
                      render: (val, record) => (
                        <Switch
                          checked={val}
                          disabled={currentSession.attendanceLocked && !isOverrideMode}
                          onChange={(checked) => {
                            setSessionAttendance(prev => prev.map(a => 
                              a.studentId === record.studentId 
                                ? { ...a, isPresent: checked, reason: checked ? "" : "Nghỉ có phép" } 
                                : a
                            ));
                          }}
                        />
                      ),
                    },
                    {
                      title: 'Lý do vắng mặt / Ghi chú',
                      key: 'reason',
                      render: (_, record) => {
                        if (record.isPresent) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                        
                        const isExcusedDefault = record.reason === 'Nghỉ có phép';
                        const isUnexcused = !record.reason || record.reason.trim() === '';
                        
                        const selectValue = isExcusedDefault ? 'Nghỉ có phép' : isUnexcused ? 'Nghỉ không phép' : 'custom';

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                            <Select
                              value={selectValue}
                              disabled={currentSession.attendanceLocked && !isOverrideMode}
                              style={{ width: '100%' }}
                              size="small"
                              onChange={(val) => {
                                let newReason = '';
                                if (val === 'Nghỉ có phép') newReason = 'Nghỉ có phép';
                                else if (val === 'Nghỉ không phép') newReason = '';
                                else newReason = 'Lý do khác';
                                
                                setSessionAttendance(prev => prev.map(a => 
                                  a.studentId === record.studentId ? { ...a, reason: newReason } : a
                                ));
                              }}
                              options={[
                                { value: 'Nghỉ có phép', label: 'Nghỉ có phép' },
                                { value: 'Nghỉ không phép', label: 'Nghỉ không phép' },
                                { value: 'custom', label: 'Khác (Nhập lý do)' },
                              ]}
                            />
                            {selectValue === 'custom' && (
                              <Input
                                placeholder="Nhập lý do vắng..."
                                value={record.reason}
                                disabled={currentSession.attendanceLocked && !isOverrideMode}
                                onChange={(e) => {
                                  setSessionAttendance(prev => prev.map(a => 
                                    a.studentId === record.studentId ? { ...a, reason: e.target.value } : a
                                  ));
                                }}
                                size="small"
                              />
                            )}
                          </div>
                        );
                      }
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Thay đổi lịch học hoặc Giáo viên / Phòng học"
        open={isEditSessionVisible}
        onOk={handleEditSessionSubmit}
        onCancel={() => setIsEditSessionVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={sessionForm} layout="vertical" style={{ padding: '12px 0' }}>
          <Form.Item name="scope" label="Phạm vi thay đổi" rules={[{ required: true }]} initialValue="single">
            <Select>
              <Option value="single">Chỉ áp dụng cho riêng buổi học này</Option>
              <Option value="all-future">Áp dụng cho buổi này và TẤT CẢ các buổi tương lai</Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
            {({ getFieldValue }) => {
              const isSingle = getFieldValue('scope') === 'single';
              return (
                <>
                  {isSingle && (
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item name="date" label="Ngày học mới" rules={[{ required: true }]}>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="endTime" label="Giờ kết thúc" rules={[{ required: true }]}>
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  <Form.Item name="roomId" label="Phòng học">
                    <Select placeholder="Chọn phòng học" allowClear>
                      {rooms.map(r => <Option key={r.id} value={r.id}>{r.name} ({r.capacity} chỗ)</Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item name="teacherId" label="Giáo viên đứng lớp">
                    <Select placeholder="Chọn giáo viên" allowClear showSearch optionFilterProp="children">
                      {teachers.map(t => <Option key={t.id} value={t.id}>{t.lastName} {t.firstName}</Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item name="assistantId" label="Trợ giảng (TA)">
                    <Select placeholder="Chọn trợ giảng" allowClear showSearch optionFilterProp="children">
                      {teachers.map(t => <Option key={t.id} value={t.id}>{t.lastName} {t.firstName}{t.type === 'TeachingAssistant' ? ' (TA)' : ''}</Option>)}
                    </Select>
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa Lớp Học */}
      <Modal
        title="Chỉnh sửa thông tin Lớp học"
        open={isEditClassVisible}
        onOk={handleEditClassSubmit}
        onCancel={() => setIsEditClassVisible(false)}
        confirmLoading={savingClass}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={850}
      >
        <Form form={classForm} layout="vertical" style={{ padding: '12px 0' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="classCode" label="Mã lớp" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="className" label="Tên lớp" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select>
                  <Option value="Planning">Lên kế hoạch</Option>
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Completed">Đã kết thúc</Option>
                  <Option value="Closed">Đã đóng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mainTeacherId" label="Giáo viên chính">
                <Select placeholder="Chọn giáo viên" allowClear showSearch optionFilterProp="children">
                  {teachers.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.lastName} {t.firstName} ({t.email || t.mobile || 'GV'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assistantId" label="Trợ giảng (TA)">
                <Select placeholder="Chọn trợ giảng" allowClear showSearch optionFilterProp="children">
                  {teachers.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.lastName} {t.firstName} {t.type === 'TeachingAssistant' ? ' (TA)' : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày khai giảng" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="finishDate" label="Ngày kết thúc dự kiến" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxSize" label="Sĩ số tối đa">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="skipHolidays" label="Bỏ qua ngày lễ" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Ghi chú / Mô tả">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
            <Form.Item shouldUpdate={(prev, curr) => prev.assistantId !== curr.assistantId} noStyle>
              {({ getFieldValue }) => {
                const assistantId = getFieldValue('assistantId');
                if (assistantId) {
                  const isTaWageConfigured = checkTaWageConfiguredDetail();
                  if (!isTaWageConfigured) {
                    return (
                      <Col span={24} style={{ marginBottom: 16 }}>
                        <Alert
                          type="warning"
                          showIcon
                          message="Lưu ý: Cấp độ chương trình học hiện tại của lớp chưa được cài đặt tiền lương trợ giảng. Lương của trợ giảng cho các buổi học thuộc lớp này sẽ tạm tính là 0đ khi kết toán lương."
                        />
                      </Col>
                    );
                  }
                }
                return null;
              }}
            </Form.Item>
          </Row>

          <Divider style={{ margin: '16px 0', borderColor: 'var(--card-border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={5} style={{ color: 'var(--text-primary)', margin: 0 }}>Cấu hình Lịch học định kỳ</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Lịch học dùng để tự động sinh danh sách các buổi học khi lớp được kích hoạt hoạt động.
              </Text>
            </div>
            <Button
              icon={<PlusOutlined />}
              onClick={addEditSchedule}
              style={{
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: 'var(--primary)',
              }}
            >
              Thêm giờ học
            </Button>
          </div>
          {editSchedules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
              Chưa có giờ học nào. Bấm "Thêm giờ học" để lập lịch.
            </div>
          ) : (
            <Table
              columns={[
                {
                  title: 'Thứ',
                  dataIndex: 'weekday',
                  key: 'weekday',
                  width: 150,
                  render: (_: any, record: any) => (
                    <Select value={record.weekday} onChange={v => updateEditSchedule(record.key, 'weekday', v)} style={{ width: '100%' }}>
                      <Option value="Mon">Thứ 2 (Mon)</Option>
                      <Option value="Tue">Thứ 3 (Tue)</Option>
                      <Option value="Wed">Thứ 4 (Wed)</Option>
                      <Option value="Thu">Thứ 5 (Thu)</Option>
                      <Option value="Fri">Thứ 6 (Fri)</Option>
                      <Option value="Sat">Thứ 7 (Sat)</Option>
                      <Option value="Sun">Chủ Nhật (Sun)</Option>
                    </Select>
                  ),
                },
                {
                  title: 'Bắt đầu',
                  dataIndex: 'startTime',
                  key: 'startTime',
                  width: 140,
                  render: (_: any, record: any) => (
                    <TimePicker
                      format="HH:mm"
                      value={record.startTime}
                      onChange={v => updateEditSchedule(record.key, 'startTime', v)}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: 'Kết thúc',
                  dataIndex: 'endTime',
                  key: 'endTime',
                  width: 140,
                  render: (_: any, record: any) => (
                    <TimePicker
                      format="HH:mm"
                      value={record.endTime}
                      onChange={v => updateEditSchedule(record.key, 'endTime', v)}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: 'Phòng học cố định',
                  dataIndex: 'roomId',
                  key: 'roomId',
                  render: (_: any, record: any) => (
                    <Select
                      placeholder="Chọn phòng học"
                      value={record.roomId}
                      onChange={v => updateEditSchedule(record.key, 'roomId', v)}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      {rooms.map(r => <Option key={r.id} value={r.id}>{r.name} ({r.capacity} chỗ)</Option>)}
                    </Select>
                  ),
                },
                {
                  title: '',
                  key: 'action',
                  width: 50,
                  render: (_: any, record: any) => (
                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeEditSchedule(record.key)} />
                  ),
                },
              ]}
              dataSource={editSchedules}
              rowKey="key"
              pagination={false}
              size="small"
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

const ClassDetail: React.FC = () => (
  <App>
    <ClassDetailInner />
  </App>
);

export default ClassDetail;
