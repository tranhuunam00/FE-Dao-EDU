import React, { useMemo, useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Tag, Popconfirm, Tooltip, Select, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, SyncOutlined, CalendarOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';
import evaluationService from '../../../services/evaluation.service';
import { exportToExcel } from '../../../utils/export';

const { Title, Text } = Typography;

interface ClassSession {
  id: string;
  roomId: string | null;
  teacherId: string | null;
  assistantId: string | null;
  wageId?: string | null;
  assistantWageId?: string | null;
  billedTeacherWage?: number | null;
  billedAssistantWage?: number | null;
  isWageBilled?: boolean;
  hasAttendance?: boolean;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceLocked: boolean;
  teacher?: { firstName: string; lastName: string };
  assistant?: { firstName: string; lastName: string };
  room?: { name: string };
  isBilled?: boolean;
}

interface ScheduleTabProps {
  sessions: ClassSession[];
  openGenerateSessionsModal: () => void;
  openSessionDetail: (session: ClassSession) => void;
  openCreateAdhocModal: () => void;
  handleDeleteSession: (sessionId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ 
  sessions, 
  openGenerateSessionsModal, 
  openSessionDetail,
  openCreateAdhocModal,
  handleDeleteSession,
  isAdmin
}) => {
  // Danh sách các tháng duy nhất có trong dữ liệu buổi học
  const monthOptions = useMemo(() => {
    const monthMap = new Map<string, number>();
    sessions.forEach((s) => {
      if (s.date) {
        const m = dayjs(s.date).format('YYYY-MM');
        monthMap.set(m, (monthMap.get(m) || 0) + 1);
      }
    });

    const sortedMonths = Array.from(monthMap.keys()).sort();
    return sortedMonths.map((m) => {
      const [year, month] = m.split('-');
      return {
        value: m,
        label: `Tháng ${month}/${year} (${monthMap.get(m)} buổi)`,
      };
    });
  }, [sessions]);

  // Mặc định chọn tháng hiện tại, hoặc tháng gần nhất có buổi học
  const defaultMonth = useMemo(() => {
    const currentMonth = dayjs().format('YYYY-MM');
    const hasCurrent = monthOptions.some((opt) => opt.value === currentMonth);
    if (hasCurrent) return currentMonth;
    return monthOptions[0]?.value || 'ALL';
  }, [monthOptions]);

  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  useEffect(() => {
    if (defaultMonth && selectedMonth === 'ALL' && monthOptions.length > 0) {
      setSelectedMonth(defaultMonth);
    }
  }, [defaultMonth, monthOptions]);

  // Lọc danh sách buổi học theo tháng đã chọn
  const filteredSessions = useMemo(() => {
    if (selectedMonth === 'ALL') return sessions;
    return sessions.filter((s) => dayjs(s.date).format('YYYY-MM') === selectedMonth);
  }, [sessions, selectedMonth]);

  const handleExportSchedule = () => {
    if (!filteredSessions || filteredSessions.length === 0) {
      message.warning('Chưa có danh sách buổi học để xuất.');
      return;
    }
    const exportData = filteredSessions.map((s, idx) => ({
      stt: idx + 1,
      date: dayjs(s.date).format('DD/MM/YYYY'),
      time: `${(s.startTime || '').substring(0, 5)} - ${(s.endTime || '').substring(0, 5)}`,
      room: s.room?.name || 'Chưa xếp phòng',
      teacher: s.teacher ? `${s.teacher.lastName} ${s.teacher.firstName}` : 'Chưa xếp GV',
      assistant: s.assistant ? `${s.assistant.lastName} ${s.assistant.firstName}` : '-',
      status: s.status === 'Completed' ? 'Hoàn thành' : s.status === 'Cancelled' ? 'Nghỉ học' : s.status === 'In-Progress' ? 'Đang học' : 'Chưa diễn ra',
      isBilled: s.isBilled ? 'Đã tính tiền' : 'Chưa tính',
      attendance: s.hasAttendance ? 'Đã điểm danh' : 'Chưa điểm danh',
    }));

    const monthLabel = selectedMonth === 'ALL' ? 'Tat_ca_cac_thang' : selectedMonth.replace('-', '_');

    exportToExcel(
      exportData,
      `Lich_day_Diem_danh_${monthLabel}`,
      ['STT', 'Ngày học', 'Giờ học', 'Phòng học', 'Giáo viên', 'Trợ giảng', 'Trạng thái', 'Học phí', 'Điểm danh'],
      ['stt', 'date', 'time', 'room', 'teacher', 'assistant', 'status', 'isBilled', 'attendance'],
      'Lịch dạy & Điểm danh'
    );
  };

  const [exportingSessionId, setExportingSessionId] = useState<string | null>(null);

  const handleExportSessionEvaluations = async (session: ClassSession) => {
    try {
      setExportingSessionId(session.id);
      const [{ data: attData }, evalList] = await Promise.all([
        api.get(`/classes/sessions/${session.id}/attendance`),
        evaluationService.getSessionEvaluations(session.id).catch(() => []),
      ]);

      if (!attData || attData.length === 0) {
        message.warning('Buổi học này chưa có dữ liệu học sinh / điểm danh.');
        return;
      }

      const evalMap = new Map<string, any>();
      (evalList || []).forEach((e: any) => evalMap.set(e.studentId, e));

      const exportData = attData.map((a: any, idx: number) => {
        const ev = evalMap.get(a.studentId) || {};
        const statusLabel = a.isPresent
          ? 'Có mặt'
          : a.reason === 'Excused'
          ? 'Nghỉ có phép'
          : a.reason === 'Late'
          ? 'Đi muộn'
          : 'Nghỉ không phép';

        const hw = ev.criteria?.homework || ev.homeworkStatus;
        const hwText = hw === 'done' || hw === 'completed' ? 'Làm đủ' : hw === 'missing' || hw === 'not_done' ? 'Thiếu BTVN' : hw === 'none' ? 'Không có' : '—';

        const und = ev.criteria?.understanding || ev.understanding;
        const undText = und === 'quick' || und === 'understood' ? 'Hiểu nhanh' : und === 'slow' || und === 'not_understood' ? 'Cần kèm' : und === 'normal' ? 'Hiểu bài' : '—';

        const part = ev.criteria?.participation || ev.participation;
        const partText = part === 'active' ? 'Hăng hái' : part === 'quiet' || part === 'passive' ? 'Ít nói' : part === 'normal' ? 'Bình thường' : '—';

        const beh = ev.criteria?.behavior || (Array.isArray(ev.behaviorTags) ? ev.behaviorTags[0] : null);
        const behText = beh === 'good' ? 'Tốt' : beh === 'talkative' ? 'Nói chuyện' : beh === 'distracted' || beh === 'unfocused' ? 'Mất tập trung' : '—';

        const score = ev.evaluationScore || ev.score || a.evaluationScore || '—';
        const comment = ev.evaluationComment || ev.comment || a.evaluationComment || '';

        const sObj = a.student || {};
        const fullName = sObj.lastName || sObj.firstName ? `${sObj.lastName || ''} ${sObj.firstName || ''}`.trim() : (sObj.name || '-');

        return {
          stt: idx + 1,
          studentId: sObj.studentId || a.studentId || '-',
          studentName: fullName,
          status: statusLabel,
          absenceNote: a.note || '',
          homework: hwText,
          understanding: undText,
          participation: partText,
          behavior: behText,
          score,
          feedback: comment,
        };
      });

      const dateStr = session.date ? dayjs(session.date).format('YYYY-MM-DD') : '';
      exportToExcel(
        exportData,
        `Diem_danh_Danh_gia_${dateStr}`,
        ['STT', 'Mã học sinh', 'Họ và tên', 'Điểm danh', 'Ghi chú vắng', 'BTVN', 'Tiếp thu', 'Tương tác', 'Nề nếp', 'Điểm đánh giá', 'Nhận xét buổi học'],
        ['stt', 'studentId', 'studentName', 'status', 'absenceNote', 'homework', 'understanding', 'participation', 'behavior', 'score', 'feedback'],
        `Đánh giá buổi học ${dayjs(session.date).format('DD/MM/YYYY')}`
      );
      message.success('Đã xuất file Excel đánh giá buổi học!');
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Không thể xuất kết quả đánh giá buổi học.');
    } finally {
      setExportingSessionId(null);
    }
  };

  const sessionColumns = [
    {
      title: 'Ngày học',
      dataIndex: 'date',
      key: 'date',
      width: '140px',
      render: (text: string) => <Text strong style={{ color: 'var(--text-primary)' }}>{dayjs(text).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'Giờ học',
      key: 'time',
      width: '130px',
      render: (_: any, record: ClassSession) => `${(record.startTime || '').substring(0, 5)} - ${(record.endTime || '').substring(0, 5)}`,
    },
    {
      title: 'Phòng học',
      dataIndex: ['room', 'name'],
      key: 'room',
      render: (text: string) => text || <Text type="secondary">Chưa xếp phòng</Text>,
    },
    {
      title: 'Giáo viên & Trợ giảng',
      key: 'teacher',
      render: (_: any, record: ClassSession) => {
        return (
          <div>
            <div>
              {record.teacher
                ? `${record.teacher.lastName} ${record.teacher.firstName}`
                : <Text type="secondary">Chưa xếp gv</Text>}
            </div>
            {record.assistant && (
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                TA: {record.assistant.lastName} {record.assistant.firstName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '140px',
      render: (s: string) => {
        let color = 'blue';
        let label = 'Chưa diễn ra';

        if (s === 'In-Progress') {
          color = 'orange';
          label = 'Đang học';
        } else if (s === 'Completed') {
          color = 'green';
          label = 'Hoàn thành';
        } else if (s === 'Cancelled') {
          color = 'red';
          label = 'Nghỉ học';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Tính học phí',
      key: 'isBilled',
      width: '130px',
      render: (_: any, record: ClassSession) => {
        if (record.isBilled) {
          return <Tag color="success">Đã tính tiền</Tag>;
        }
        return <Tag color="default">Chưa tính</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '300px',
      render: (_: any, record: ClassSession) => {
        const isWageBilled = Boolean(
          record.isWageBilled ||
          record.wageId ||
          record.assistantWageId ||
          (record.billedTeacherWage !== undefined && record.billedTeacherWage !== null && Number(record.billedTeacherWage) > 0) ||
          (record.billedAssistantWage !== undefined && record.billedAssistantWage !== null && Number(record.billedAssistantWage) > 0),
        );
        const hasAttendance = Boolean(record.hasAttendance || record.isBilled);
        const isLocked = Boolean(record.attendanceLocked);
        const isNotScheduled = record.status !== 'Scheduled';

        let deleteDisabledReason = '';
        if (isWageBilled) {
          deleteDisabledReason = 'Không thể xóa: Buổi học đã được tính thù lao giáo viên/trợ giảng.';
        } else if (hasAttendance) {
          deleteDisabledReason = 'Không thể xóa: Buổi học đã phát sinh dữ liệu điểm danh thực tế hoặc đã tính học phí.';
        } else if (isLocked) {
          deleteDisabledReason = 'Không thể xóa: Buổi học đã bị khóa điểm danh.';
        } else if (isNotScheduled) {
          deleteDisabledReason = `Không thể xóa: Buổi học đang ở trạng thái "${record.status}".`;
        }

        const canDelete = isAdmin && !deleteDisabledReason;

        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="small"
              style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
              onClick={() => openSessionDetail(record)}
            >
              {record.status === 'Completed' ? 'Xem điểm danh' : 'Điểm danh / Đổi lịch'}
            </Button>

            <Button
              size="small"
              icon={<DownloadOutlined />}
              loading={exportingSessionId === record.id}
              onClick={() => handleExportSessionEvaluations(record)}
              style={{ color: '#0284c7', borderColor: '#38bdf8' }}
              title="Xuất Excel điểm danh & đánh giá học sinh buổi này"
            >
              Xuất đánh giá
            </Button>

            {isAdmin && (
              canDelete ? (
                <Popconfirm
                  title="Xác nhận xóa buổi học"
                  description="Bạn có chắc chắn muốn xóa buổi học này? Bản ghi điểm danh học sinh cũng sẽ bị xóa."
                  onConfirm={() => handleDeleteSession(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    title="Xóa buổi học"
                  />
                </Popconfirm>
              ) : (
                <Tooltip title={deleteDisabledReason} placement="top">
                  <span>
                    <Button
                      type="text"
                      disabled
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{ opacity: 0.4, cursor: 'not-allowed' }}
                    />
                  </span>
                </Tooltip>
              )
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={5} style={{ color: 'var(--text-primary)', margin: 0 }}>Danh sách các buổi học</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Hiển thị {filteredSessions.length} / {sessions.length} buổi học theo lịch cố định và đột xuất.
          </Text>
        </div>

        {/* BỘ LỌC THÁNG VÀ CÁC THAO TÁC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {monthOptions.length > 0 && (
            <Space>
              <Text strong style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                Lọc theo tháng:
              </Text>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 220 }}
                options={[
                  { value: 'ALL', label: `Tất cả các tháng (${sessions.length} buổi)` },
                  ...monthOptions,
                ]}
              />
            </Space>
          )}

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportSchedule}
            style={{ color: '#38bdf8', borderColor: '#0284c7' }}
          >
            Xuất Excel lịch dạy
          </Button>
          <Button
            type="dashed"
            icon={<SyncOutlined />}
            onClick={openGenerateSessionsModal}
            style={{ color: '#a5b4fc', borderColor: '#6366f1' }}
          >
            {sessions.length === 0 ? 'Sinh danh sách buổi học' : 'Sinh lại / Đồng bộ'}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateAdhocModal}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
          >
            Thêm buổi học đột xuất
          </Button>
        </div>
      </div>

      <Table
        columns={sessionColumns}
        dataSource={filteredSessions}
        rowKey="id"
        size="small"
        pagination={filteredSessions.length > 20 ? { pageSize: 20 } : false}
      />
    </Card>
  );
};
