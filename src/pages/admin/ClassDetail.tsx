import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Typography, Row, Col, App, ConfigProvider, theme, Tag, Table, Button, Spin,
  Descriptions, Tabs, Modal, Form, Select, DatePicker, TimePicker, Switch, Input, Badge, Divider, List
} from 'antd';
import {
  ArrowLeftOutlined, TeamOutlined, CalendarOutlined, BookOutlined, UserOutlined,
  EnvironmentOutlined, PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CheckCircleOutlined, StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PricingData {
  pricePerSession: number;
}

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
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceLocked: boolean;
  teacher?: { firstName: string; lastName: string };
  room?: { name: string };
}

interface ClassDetailData {
  id: string;
  classCode: string;
  className: string;
  status: string;
  startDate?: string;
  finishDate?: string;
  maxSize?: number;
  skipHolidays: boolean;
  description?: string;
  course?: { name: string };
  courseLevel?: { levelName: string };
  mainTeacher?: { id: string; firstName: string; lastName: string };
  center?: { id: string; name: string };
  schedules: {
    id: string;
    weekday: string;
    startTime: string;
    endTime: string;
    room?: { name: string };
  }[];
  students: {
    id: string;
    studentId: string;
    status: string;
    joinedDate: string;
    student: {
      name: string;
      phone?: string;
      user?: { email: string };
    };
  }[];
}

const ClassDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Modals / Drawer Control
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState<ClassSession | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<StudentAttendance[]>([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Editing Session details
  const [isEditSessionVisible, setIsEditSessionVisible] = useState(false);
  const [sessionForm] = Form.useForm();

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
        api.get(`/rooms?centerId=${classRes.data.center.id}`).then(({ data }) => setRooms(data)).catch(() => {});
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

  const handleAddStudent = async () => {
    if (!selectedStudentId || !id) return;
    try {
      await api.post(`/classes/${id}/students`, { studentId: selectedStudentId });
      message.success('Đã thêm học sinh vào lớp thành công!');
      setIsAddStudentVisible(false);
      setSelectedStudentId(null);
      loadAllData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi thêm học sinh');
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
      // Map class students to attendance record if not exist in attendance response
      const mapped = (classData?.students || [])
        .filter(cs => {
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
        .map(cs => {
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
      // Reload lists
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
          // Auto save first
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
          // Reload all
          loadAllData();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi hoàn thành buổi học');
        }
      }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!classData) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '60px' }}>Không tìm thấy thông tin lớp học.</div>;
  }

  // Columns for students table
  const studentColumns = [
    {
      title: 'Học sinh',
      key: 'name',
      render: (_: any, record: any) => {
        const fullName = record.student ? `${record.student.lastName} ${record.student.firstName}` : '-';
        return (
          <div>
            <Text strong style={{ color: '#fff' }}>{fullName}</Text>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
              {record.student?.email || record.student?.user?.email || '-'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      width: '180px',
      render: (_: any, record: any) => record.student?.mobile || '-',
    },
    {
      title: 'Ngày tham gia lớp',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      width: '180px',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '150px',
      render: (s: string) => {
        const color = s === 'Active' ? 'green' : 'red';
        const label = s === 'Active' ? 'Đang học' : 'Đã kick (Dropped)';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '120px',
      render: (_: any, record: any) => {
        const fullName = record.student ? `${record.student.lastName} ${record.student.firstName}` : '';
        if (record.status === 'Active') {
          return (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleKickStudent(record.studentId, fullName)}
            />
          );
        } else if (record.status === 'Dropped') {
          return (
            <Button
              type="text"
              style={{ color: '#10b981', padding: 0 }}
              icon={<PlusOutlined />}
              onClick={() => handleReAddStudent(record.studentId)}
            >
              Thêm lại
            </Button>
          );
        }
        return null;
      }
    },
  ];

  // Columns for session list
  const sessionColumns = [
    {
      title: 'Ngày học',
      dataIndex: 'date',
      key: 'date',
      width: '150px',
      render: (text: string) => <Text strong style={{ color: '#fff' }}>{dayjs(text).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'Giờ học',
      key: 'time',
      width: '150px',
      render: (_: any, record: ClassSession) => `${record.startTime.substring(0,5)} - ${record.endTime.substring(0,5)}`,
    },
    {
      title: 'Phòng học',
      dataIndex: ['room', 'name'],
      key: 'room',
      render: (text: string) => text || <Text type="secondary">Chưa xếp phòng</Text>,
    },
    {
      title: 'Giáo viên',
      key: 'teacher',
      render: (_: any, record: ClassSession) => {
        return record.teacher
          ? `${record.teacher.firstName} ${record.teacher.lastName}`
          : <Text type="secondary">Chưa xếp gv</Text>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '160px',
      render: (s: string, record: ClassSession) => {
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
      title: 'Hành động',
      key: 'action',
      width: '180px',
      render: (_: any, record: ClassSession) => (
        <Button
          type="primary"
          size="small"
          style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
          onClick={() => openSessionDetail(record)}
        >
          {record.status === 'Completed' ? 'Xem điểm danh' : 'Điểm danh / Đổi lịch'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/classes')}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none' }}
        />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
            <TeamOutlined style={{ marginRight: 10, color: '#6366f1' }} />
            Lớp: {classData.className}
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Mã lớp: {classData.classCode} • {classData.course?.name} ({classData.courseLevel?.levelName})
          </Text>
        </div>
        <Tag color={classData.status === 'Active' ? 'green' : 'blue'} style={{ fontSize: '14px', padding: '4px 16px' }}>
          {classData.status === 'Active' ? 'Hoạt động' : 'Nháp/Lên kế hoạch'}
        </Tag>
      </div>

      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: 'Thông tin chung',
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
                    <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Chi tiết Lớp học</Title>
                    <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: 'rgba(255,255,255,0.5)' }} contentStyle={{ color: '#fff' }}>
                      <Descriptions.Item label="Trung tâm">{classData.center?.name || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Chương trình">{classData.course?.name || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Mức độ (Level)">{classData.courseLevel?.levelName || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Giáo viên chính">
                        {classData.mainTeacher ? `${classData.mainTeacher.firstName} ${classData.mainTeacher.lastName}` : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Khai giảng">{classData.startDate ? dayjs(classData.startDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                      <Descriptions.Item label="Kết thúc dự kiến">{classData.finishDate ? dayjs(classData.finishDate).format('DD/MM/YYYY') : 'Chưa định'}</Descriptions.Item>
                      <Descriptions.Item label="Sĩ số tối đa">{classData.maxSize || 'Không giới hạn'}</Descriptions.Item>
                      <Descriptions.Item label="Bỏ qua ngày lễ">{classData.skipHolidays ? 'Có' : 'Không'}</Descriptions.Item>
                    </Descriptions>
                    {classData.description && (
                      <>
                        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.06)' }} />
                        <div style={{ color: '#fff' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Ghi chú lớp:</div>
                          <div>{classData.description}</div>
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', height: '100%' }}>
                    <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Lịch học cố định</Title>
                    {classData.schedules.length === 0 ? (
                      <Text type="secondary">Chưa xếp lịch cố định.</Text>
                    ) : (
                      <List
                        dataSource={classData.schedules}
                        renderItem={item => (
                          <List.Item style={{ borderColor: 'rgba(255,255,255,0.06)', padding: '12px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <Badge status="processing" />
                              <div>
                                <Text strong style={{ color: '#fff' }}>Thứ: {item.weekday}</Text>
                                <div>
                                  <Text type="secondary" style={{ fontSize: '13px' }}>
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    {item.startTime.substring(0,5)} - {item.endTime.substring(0,5)}
                                  </Text>
                                </div>
                                {item.room && (
                                  <div style={{ fontSize: '12px', color: '#a5b4fc' }}>
                                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                                    {item.room.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'students',
            label: `Học sinh (${classData.students.filter(s => s.status === 'Active').length})`,
            children: (
              <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Title level={5} style={{ color: '#fff', margin: 0 }}>Danh sách Học sinh trong lớp</Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddStudentVisible(true)}
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                  >
                    Thêm Học sinh vào lớp
                  </Button>
                </div>
                <Table
                  columns={studentColumns}
                  dataSource={classData.students}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            )
          },
          {
            key: 'sessions',
            label: `Lịch dạy & Điểm danh (${sessions.length})`,
            children: (
              <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <Title level={5} style={{ color: '#fff', margin: 0 }}>Danh sách các buổi học</Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Các buổi học được sinh tự động dựa trên Lịch học cố định từ ngày Khai giảng.
                    </Text>
                  </div>
                  <Button
                    type="dashed"
                    icon={<CalendarOutlined />}
                    onClick={handleGenerateSessions}
                    style={{ color: '#a5b4fc', borderColor: '#6366f1' }}
                  >
                    {sessions.length === 0 ? 'Sinh các buổi học' : 'Sinh lại / Đồng bộ buổi học tương lai'}
                  </Button>
                </div>
                <Table
                  columns={sessionColumns}
                  dataSource={sessions}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 20 }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* Add Student Modal */}
      <Modal
        title="Thêm Học sinh vào Lớp"
        open={isAddStudentVisible}
        onOk={handleAddStudent}
        onCancel={() => setIsAddStudentVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <div style={{ padding: '12px 0' }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>Chọn học sinh từ hệ thống:</Text>
          <Select
            placeholder="Tìm theo Tên hoặc Email..."
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            onChange={setSelectedStudentId}
            value={selectedStudentId}
          >
            {allStudents
              .filter(s => !classData.students.some(cs => cs.studentId === s.id && cs.status === 'Active'))
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

      {/* Session Details / Attendance Modal */}
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
            </Descriptions>

            {/* Actions for session details */}
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
              {/* Reschedule option for future sessions */}
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
                      scope: 'single',
                    });
                    setIsEditSessionVisible(true);
                  }}
                >
                  Đổi lịch / Giáo viên
                </Button>
              )}
            </div>

            <Divider style={{ margin: '16px 0' }}>Bảng điểm danh học sinh</Divider>

            {currentSession.status === 'Scheduled' ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(0,0,0,0.45)' }}>
                Bấm "Bắt đầu học (Điểm danh)" để tiến hành điểm danh học sinh.
              </div>
            ) : (
              <div>
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
                          disabled={currentSession.attendanceLocked}
                          onChange={(checked) => {
                            setSessionAttendance(prev => prev.map(a => a.studentId === record.studentId ? { ...a, isPresent: checked } : a));
                          }}
                        />
                      ),
                    },
                    {
                      title: 'Lý do vắng mặt / Ghi chú',
                      key: 'reason',
                      render: (_, record) => (
                        <Input
                          placeholder="Nhập lý do vắng..."
                          value={record.reason}
                          disabled={currentSession.attendanceLocked || record.isPresent}
                          onChange={(e) => {
                            setSessionAttendance(prev => prev.map(a => a.studentId === record.studentId ? { ...a, reason: e.target.value } : a));
                          }}
                          size="small"
                        />
                      ),
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Session Modal */}
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
                    <Select placeholder="Chọn giáo viên" allowClear>
                      {teachers.map(t => <Option key={t.id} value={t.id}>{t.firstName} {t.lastName}</Option>)}
                    </Select>
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const ClassDetail: React.FC = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#6366f1',
        colorBgContainer: '#111827',
        colorBorder: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
      },
    }}
  >
    <App>
      <ClassDetailInner />
    </App>
  </ConfigProvider>
);

export default ClassDetail;
