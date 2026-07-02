import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Button, Tabs, Space, App, Avatar, Upload, Spin, Tag, Modal, Select, Typography
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, UserOutlined, LockOutlined, TeamOutlined, CameraOutlined, DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

import { OverviewTab } from './StudentDetailTabs/OverviewTab';
import { AccountTab } from './StudentDetailTabs/AccountTab';
import { StatusTab } from './StudentDetailTabs/StatusTab';
import { ClassesTab } from './StudentDetailTabs/ClassesTab';
import { TuitionTab } from './StudentDetailTabs/TuitionTab';

const { Option } = Select;
const { Text } = Typography;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Waiting for class': return '#f59e0b';
    case 'Studying': return '#10b981';
    case 'Suspended': return '#ef4444';
    case 'Graduated': return '#6366f1';
    default: return '#9ca3af';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Waiting for class': return 'Chờ xếp lớp';
    case 'Studying': return 'Đang học';
    case 'Suspended': return 'Tạm nghỉ';
    case 'Graduated': return 'Đã tốt nghiệp';
    default: return status;
  }
};

const StudentDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('overview');

  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [isAddClassVisible, setIsAddClassVisible] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [tuitionReport, setTuitionReport] = useState<any>(null);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [tuitionDateRange, setTuitionDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  const fetchStudentClasses = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/students/${id}/classes`);
      setStudentClasses(data);
    } catch (err) {
      console.error('Error fetching student classes:', err);
    }
  };

  const fetchAllClasses = async () => {
    try {
      const { data } = await api.get('/classes?limit=1000');
      setAllClasses(data.classes || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchTuitionReport = async () => {
    if (!id) return;
    const [start, end] = tuitionDateRange;
    if (!start || !end) {
      message.warning('Vui lòng chọn khoảng thời gian cần tính.');
      return;
    }
    setTuitionLoading(true);
    try {
      const { data } = await api.get(`/students/${id}/tuition-report`, {
        params: { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') },
      });
      setTuitionReport(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo học phí');
    } finally {
      setTuitionLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/students/${id}`);
      const data = res.data;
      setStudent(data);
      setAvatarPreview(data.avatar || undefined);

      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        nickName: data.nickName,
        gender: data.gender,
        mobile: data.mobile,
        email: data.email,
        birthdate: data.birthdate ? dayjs(data.birthdate) : undefined,
        parentGuardian1: data.parentGuardian1,
        parentGuardian2: data.parentGuardian2,
        parent1CitizenId: data.parent1CitizenId,
        parent2CitizenId: data.parent2CitizenId,
        studentCitizenId: data.studentCitizenId,
        relationship1: data.relationship1,
        relationship2: data.relationship2,
        otherPhone1: data.otherPhone1,
        otherPhone2: data.otherPhone2,
        description: data.description,
        country: data.country || 'Việt Nam',
        province: data.province,
        districtWard: data.districtWard,
        primaryAddress: data.primaryAddress,
        oldAddress: data.oldAddress,
        status: data.status,
        loginEmail: data.loginEmail,
      });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin học sinh.');
      navigate('/admin/students');
    }
  };

  const handleAddClass = async () => {
    if (!selectedClassId || !id) return;
    try {
      await api.post(`/classes/${selectedClassId}/students`, { studentId: id });
      message.success('Đã thêm học sinh vào lớp thành công!');
      setIsAddClassVisible(false);
      setSelectedClassId(null);
      await Promise.all([fetchStudentClasses(), fetchStudentProfile()]);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi thêm học sinh vào lớp');
    }
  };

  const handleRemoveClass = (classId: string, className: string) => {
    modal.confirm({
      title: 'Xác nhận xóa học sinh khỏi lớp',
      content: `Bạn có chắc muốn xóa học sinh khỏi lớp "${className}"? Trạng thái sẽ chuyển sang Dropped.`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/classes/${classId}/students/${id}`);
          message.success('Đã xóa học sinh khỏi lớp thành công!');
          await Promise.all([fetchStudentClasses(), fetchStudentProfile()]);
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi xóa học sinh khỏi lớp');
        }
      }
    });
  };

  const selectedProvince = Form.useWatch('province', form);
  const currentStatus = Form.useWatch('status', form);
  const birthdate = Form.useWatch('birthdate', form);
  const age = birthdate ? dayjs().diff(dayjs(birthdate), 'year') : null;

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStudentProfile(), fetchStudentClasses()]);
      setLoading(false);
    };
    if (id) {
      loadAll();
      fetchAllClasses();
    }
  }, [id]);

  const handleAvatarChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const values = Form.useWatch([], form);
  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        nickName: values.nickName?.trim() || undefined,
        gender: values.gender,
        mobile: values.mobile?.trim(),
        email: values.email?.trim() || undefined,
        birthdate: values.birthdate ? values.birthdate.format('YYYY-MM-DD') : undefined,
        parentGuardian1: values.parentGuardian1?.trim() || undefined,
        parentGuardian2: values.parentGuardian2?.trim() || undefined,
        parent1CitizenId: values.parent1CitizenId?.trim() || undefined,
        parent2CitizenId: values.parent2CitizenId?.trim() || undefined,
        studentCitizenId: values.studentCitizenId?.trim() || undefined,
        relationship1: values.relationship1 || undefined,
        relationship2: values.relationship2 || undefined,
        otherPhone1: values.otherPhone1?.trim() || undefined,
        otherPhone2: values.otherPhone2?.trim() || undefined,
        description: values.description?.trim() || undefined,
        country: values.country || 'Việt Nam',
        province: values.province || undefined,
        districtWard: values.districtWard || undefined,
        primaryAddress: values.primaryAddress?.trim(),
        oldAddress: values.oldAddress?.trim() || undefined,
        status: values.status,
        loginEmail: values.loginEmail?.trim() || undefined,
        loginPassword: values.loginPassword || undefined,
      };

      if (avatarBase64) {
        payload.avatar = avatarBase64;
      }

      const res = await api.patch(`/students/${id}`, payload);
      setStudent(res.data);
      message.success('Đã cập nhật thông tin học sinh thành công!');
      setAvatarBase64(undefined);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(', '));
      } else {
        message.error(msg || 'Không thể cập nhật. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin học sinh..." />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Avatar
                size={72}
                src={avatarPreview}
                icon={!avatarPreview ? <UserOutlined /> : undefined}
                style={{
                  background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: '3px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                }}
              />
              <Upload accept="image/*" showUploadList={false} beforeUpload={() => false} onChange={handleAvatarChange}>
                <div
                  style={{
                    position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px',
                    borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  <CameraOutlined style={{ fontSize: '12px', color: 'var(--text-primary)' }} />
                </div>
              </Upload>
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
                {student.lastName} {student.firstName}
                {student.nickName && <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '8px' }}>({student.nickName})</span>}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 10px',
                    borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {student.studentId}
                </span>
                <Tag
                  color={getStatusColor(currentStatus || student.status) === '#f59e0b' ? 'warning'
                    : getStatusColor(currentStatus || student.status) === '#10b981' ? 'success'
                      : getStatusColor(currentStatus || student.status) === '#ef4444' ? 'error'
                        : 'processing'}
                >
                  {getStatusLabel(currentStatus || student.status)}
                </Tag>
                {student.loginEmail && <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>✓ Có tài khoản đăng nhập</span>}
              </div>
            </div>
          </div>

          <Space size="middle">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/students')} style={{ background: 'transparent' }}>
              Quay lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!submittable}
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '24px' }}
          items={[
            {
              key: 'overview',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><UserOutlined /> Thông tin</span>,
              children: <OverviewTab student={student} age={age} selectedProvince={selectedProvince} />
            },
            {
              key: 'login',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><LockOutlined /> Tài khoản</span>,
              children: <AccountTab student={student} />
            },
            {
              key: 'membership',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Trạng thái</span>,
              children: <StatusTab />
            },
            {
              key: 'classes',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Lớp học ({studentClasses.filter(c => c.status === 'Active').length})</span>,
              children: <ClassesTab studentClasses={studentClasses} setIsAddClassVisible={setIsAddClassVisible} navigate={navigate} handleRemoveClass={handleRemoveClass} />
            },
            {
              key: 'tuition',
              label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Tính học phí</span>,
              children: <TuitionTab tuitionDateRange={tuitionDateRange} setTuitionDateRange={setTuitionDateRange} fetchTuitionReport={fetchTuitionReport} tuitionLoading={tuitionLoading} tuitionReport={tuitionReport} />
            },
          ]}
        />

        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--card-border)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            ID: <code style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{id}</code>
          </span>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/students')} style={{ background: 'transparent' }}>
              Quay lại danh sách
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!submittable}
              size="large"
              style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none', padding: '0 32px' }}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Form>

      <Modal
        title="Thêm Học sinh vào Lớp học"
        open={isAddClassVisible}
        onOk={handleAddClass}
        onCancel={() => setIsAddClassVisible(false)}
        okText="Thêm vào lớp"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ padding: '12px 0' }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>Chọn lớp học hoạt động từ hệ thống:</Text>
          <Select
            placeholder="Tìm theo Tên hoặc Mã lớp học..."
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            onChange={setSelectedClassId}
            value={selectedClassId}
          >
            {allClasses
              .filter(c => c.status === 'Active' && !studentClasses.some(sc => sc.classId === c.id && sc.status === 'Active'))
              .map(c => (
                <Option key={c.id} value={c.id}>
                  {c.className} ({c.classCode}) - {c.center?.name || 'Không có trung tâm'}
                </Option>
              ))
            }
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export const StudentDetail: React.FC = () => {
  return (
    <App>
      <StudentDetailInner />
    </App>
  );
};

export default StudentDetail;
