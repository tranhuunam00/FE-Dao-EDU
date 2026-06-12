import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, Button, Card, Typography, Row, Col, App, ConfigProvider, theme,
  DatePicker, InputNumber, Switch, Table, Space, TimePicker, Modal
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, TeamOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ScheduleRow {
  key: string;
  weekday: string;
  startTime: dayjs.Dayjs | null;
  endTime: dayjs.Dayjs | null;
  roomId: string | null;
}

const CreateClassInner: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const [centers, setCenters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);

  // Selected values to drive other options
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [courseStartDate, setCourseStartDate] = useState<string | null>(null);

  // Quick Room modal states
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(30);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [activeScheduleKey, setActiveScheduleKey] = useState<string | null>(null);

  // Fetch initial option lists
  useEffect(() => {
    api.get('/centers?page=1&limit=100').then(({ data }) => setCenters(data.centers || [])).catch(() => {});
    api.get('/courses?page=1&limit=100').then(({ data }) => setCourses(data.courses || [])).catch(() => {});
    api.get('/teachers?page=1&limit=100').then(({ data }) => setTeachers(data.teachers || [])).catch(() => {});
  }, []);

  // Fetch levels when course changes
  useEffect(() => {
    if (selectedCourseId) {
      api.get(`/courses/${selectedCourseId}`).then(({ data }) => {
        setLevels(data.levels || []);
        setCourseStartDate(data.year || null);
      }).catch(() => {});
    } else {
      setLevels([]);
      setCourseStartDate(null);
    }
  }, [selectedCourseId]);

  // Fetch rooms when center changes
  const fetchRooms = (centerId: string) => {
    api.get(`/rooms?centerId=${centerId}`).then(({ data }) => {
      setRooms(data || []);
    }).catch(() => {});
  };

  useEffect(() => {
    if (selectedCenterId) {
      fetchRooms(selectedCenterId);
    } else {
      setRooms([]);
    }
  }, [selectedCenterId]);

  const addSchedule = () => {
    setSchedules(prev => [...prev, {
      key: Date.now().toString(),
      weekday: 'Mon',
      startTime: dayjs('14:00', 'HH:mm'),
      endTime: dayjs('15:30', 'HH:mm'),
      roomId: null,
    }]);
  };

  const removeSchedule = (key: string) => {
    setSchedules(prev => prev.filter(s => s.key !== key));
  };

  const updateSchedule = (key: string, field: string, value: any) => {
    setSchedules(prev => prev.map(s => s.key === key ? { ...s, [field]: value } : s));
  };

  const handleCreateRoom = async () => {
    if (!selectedCenterId) {
      message.error('Vui lòng chọn Trung tâm trước khi tạo phòng học.');
      return;
    }
    if (!newRoomName.trim()) {
      message.error('Vui lòng nhập Tên phòng học.');
      return;
    }
    setCreatingRoom(true);
    try {
      const { data } = await api.post('/rooms', {
        centerId: selectedCenterId,
        name: newRoomName.trim(),
        capacity: newRoomCapacity,
      });
      message.success('Tạo phòng học mới thành công!');
      setRooms(prev => [...prev, data]);
      if (activeScheduleKey) {
        updateSchedule(activeScheduleKey, 'roomId', data.id);
      }
      setIsAddRoomVisible(false);
      setNewRoomName('');
      setNewRoomCapacity(30);
      setActiveScheduleKey(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo phòng học');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleSubmit = async () => {
    if (schedules.length === 0) {
      message.error('Vui lòng cấu hình ít nhất một lịch học cố định cho lớp học.');
      return;
    }
    for (const s of schedules) {
      if (!s.roomId) {
        message.error('Vui lòng chọn phòng học cố định cho tất cả các lịch học.');
        return;
      }
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
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i];
        const b = schedules[j];
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
    try {
      const values = await form.validateFields();
      if (values.startDate && values.finishDate && values.startDate.isAfter(values.finishDate)) {
        message.error('Ngày kết thúc phải sau ngày khai giảng.');
        return;
      }

      // Front-end check: Class start date vs Course start date
      if (values.startDate && courseStartDate) {
        const classStart = values.startDate;
        const courseStart = dayjs(courseStartDate);
        if (classStart.isBefore(courseStart)) {
          message.error(`Ngày khai giảng của lớp học không được trước ngày bắt đầu của chương trình học (${courseStart.format('DD/MM/YYYY')}).`);
          return;
        }
      }

      setSaving(true);

      const postData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        finishDate: values.finishDate ? values.finishDate.format('YYYY-MM-DD') : null,
        schedules: schedules.map(s => ({
          weekday: s.weekday,
          startTime: s.startTime ? s.startTime.format('HH:mm') : '00:00',
          endTime: s.endTime ? s.endTime.format('HH:mm') : '00:00',
          roomId: s.roomId,
          durationMins: s.startTime && s.endTime ? s.endTime.diff(s.startTime, 'minute') : 90,
        })),
      };

      await api.post('/classes', postData);
      message.success('Tạo lớp học thành công!');
      navigate('/admin/classes');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo lớp học. Hãy kiểm tra các trường bắt buộc.');
    } finally {
      setSaving(false);
    }
  };

  const scheduleColumns = [
    {
      title: 'Thứ',
      dataIndex: 'weekday',
      key: 'weekday',
      width: 150,
      render: (_: any, record: ScheduleRow) => (
        <Select value={record.weekday} onChange={v => updateSchedule(record.key, 'weekday', v)} style={{ width: '100%' }}>
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
      render: (_: any, record: ScheduleRow) => (
        <TimePicker
          format="HH:mm"
          value={record.startTime}
          onChange={v => updateSchedule(record.key, 'startTime', v)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 140,
      render: (_: any, record: ScheduleRow) => (
        <TimePicker
          format="HH:mm"
          value={record.endTime}
          onChange={v => updateSchedule(record.key, 'endTime', v)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Phòng học cố định',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (_: any, record: ScheduleRow) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Select
            placeholder="Chọn phòng học"
            value={record.roomId}
            onChange={v => updateSchedule(record.key, 'roomId', v)}
            style={{ flex: 1 }}
            allowClear
          >
            {rooms.map(r => <Option key={r.id} value={r.id}>{r.name} ({r.capacity} chỗ)</Option>)}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
            onClick={() => {
              setActiveScheduleKey(record.key);
              setIsAddRoomVisible(true);
            }}
            title="Thêm nhanh phòng học"
          />
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: ScheduleRow) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeSchedule(record.key)} />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/classes')}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none' }}
        />
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
            <TeamOutlined style={{ marginRight: 10, color: '#6366f1' }} />
            Tạo Lớp học mới
          </Title>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={{ status: 'Planning', skipHolidays: true }}>
        <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 24 }}>
          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>Thông tin chung</Title>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="centerId" label="Trung tâm" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select
                  placeholder="Chọn trung tâm"
                  onChange={v => {
                    setSelectedCenterId(v);
                    form.setFieldsValue({ roomId: null });
                  }}
                  showSearch
                  optionFilterProp="children"
                >
                  {centers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="courseId" label="Chương trình học" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select
                  placeholder="Chọn chương trình học"
                  onChange={v => {
                    setSelectedCourseId(v);
                    form.setFieldsValue({ courseLevelId: null });
                  }}
                  showSearch
                  optionFilterProp="children"
                >
                  {courses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
              {courseStartDate && (
                <div style={{ marginTop: '-12px', marginBottom: '16px', fontSize: '13px', color: '#818cf8' }}>
                  Ngày bắt đầu chương trình học: <strong>{dayjs(courseStartDate).format('DD/MM/YYYY')}</strong>
                </div>
              )}
            </Col>
            <Col xs={12} md={12}>
              <Form.Item name="courseLevelId" label="Level" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select placeholder="Chọn Level">
                  {levels.map(l => <Option key={l.id} value={l.id}>{l.levelName} ({l.levelCode})</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="classCode" label="Mã lớp" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="VD: TOAN6-1" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="className" label="Tên lớp" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="VD: Toán lớp 6 cơ sở 1" />
              </Form.Item>
            </Col>

            <Col xs={12} md={6}>
              <Form.Item
                name="startDate"
                label="Ngày khai giảng"
                dependencies={['finishDate']}
                rules={[
                  { required: true, message: 'Bắt buộc' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const finish = getFieldValue('finishDate');
                      if (finish && value.isAfter(finish, 'day')) {
                        return Promise.reject(new Error('Ngày khai giảng phải trước hoặc trùng ngày kết thúc.'));
                      }
                      if (courseStartDate) {
                        const courseStart = dayjs(courseStartDate);
                        if (value.isBefore(courseStart, 'day')) {
                          return Promise.reject(
                            new Error(`Ngày khai giảng không được trước ngày bắt đầu chương trình học (${courseStart.format('DD/MM/YYYY')}).`)
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày khai giảng" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                name="finishDate"
                label="Ngày kết thúc"
                dependencies={['startDate']}
                rules={[
                  { required: true, message: 'Bắt buộc' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const start = getFieldValue('startDate');
                      if (start && value.isBefore(start, 'day')) {
                        return Promise.reject(new Error('Ngày kết thúc phải sau hoặc bằng ngày khai giảng.'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày kết thúc" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="maxSize" label="Sĩ số tối đa">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="30" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="status" label="Trạng thái">
                <Select disabled>
                  <Option value="Planning">Lên kế hoạch</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} md={12}>
              <Form.Item name="mainTeacherId" label="Giáo viên chính">
                <Select placeholder="Chọn giáo viên" allowClear showSearch optionFilterProp="children">
                  {teachers.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.email || t.mobile || 'GV'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={12}>
              <Form.Item name="skipHolidays" label="Bỏ qua ngày lễ" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="description" label="Mô tả / Ghi chú">
                <TextArea rows={2} placeholder="Thông tin chi tiết về lớp học..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>Cấu hình Lịch học định kỳ</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Lịch học dùng để tự động sinh danh sách các buổi học khi lớp được kích hoạt hoạt động.
              </Text>
            </div>
            <Button
              icon={<PlusOutlined />}
              onClick={addSchedule}
              disabled={!selectedCenterId}
              style={{
                background: selectedCenterId ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                border: selectedCenterId ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: selectedCenterId ? '#a5b4fc' : 'rgba(255,255,255,0.2)',
              }}
            >
              Thêm giờ học
            </Button>
          </div>
          {!selectedCenterId ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.3)' }}>
              Vui lòng chọn "Trung tâm" trước để tải danh sách phòng học.
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
              Chưa có giờ học nào. Bấm "Thêm giờ học" để lập lịch.
            </div>
          ) : (
            <Table
              columns={scheduleColumns}
              dataSource={schedules}
              rowKey="key"
              pagination={false}
              size="small"
            />
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={() => navigate('/admin/classes')} style={{ background: 'transparent' }}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={saving}
            size="large"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', minWidth: 200 }}
          >
            Lưu Lớp học
          </Button>
        </div>
      </Form>

      {/* Quick Add Room Modal */}
      <Modal
        title={
          <div>
            <EnvironmentOutlined style={{ color: '#6366f1', marginRight: 8 }} />
            Thêm nhanh phòng học mới
          </div>
        }
        open={isAddRoomVisible}
        onOk={handleCreateRoom}
        onCancel={() => {
          setIsAddRoomVisible(false);
          setNewRoomName('');
          setNewRoomCapacity(30);
          setActiveScheduleKey(null);
        }}
        confirmLoading={creatingRoom}
        okText="Tạo phòng"
        cancelText="Hủy"
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>Tên phòng học:</Text>
            <Input
              placeholder="VD: Phòng Lab 202, Phòng A1..."
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
            />
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: 8 }}>Sức chứa (Chỗ ngồi):</Text>
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              value={newRoomCapacity}
              onChange={v => setNewRoomCapacity(v || 30)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CreateClass: React.FC = () => (
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
      <CreateClassInner />
    </App>
  </ConfigProvider>
);

export default CreateClass;
