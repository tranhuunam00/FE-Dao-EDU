/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Table, Tag, Button, Modal, Space, Typography, App,
  Form, Input, DatePicker, InputNumber, Select, Upload, Row, Col
} from 'antd';
import { PlusOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;
const { TextArea } = Input;

interface AssignmentsTabProps {
  classId: string;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ classId }) => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Create Assignment Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();

  // Grading Modal states
  const [gradeTarget, setGradeTarget] = useState<any>(null);
  const [grading, setGrading] = useState(false);
  const [gradeForm] = Form.useForm();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assignments/class/${classId}`);
      setAssignments(res.data.assignments || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const handleCreateAssignment = async () => {
    try {
      const values = await createForm.validateFields();
      setCreating(true);
      const { data } = await api.post(`/assignments/class/${classId}`, {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        dueAt: values.dueAt ? values.dueAt.toISOString() : null,
        maxScore: values.maxScore || 10,
        status: values.status || 'published',
      });

      if (values.files && values.files.length > 0) {
        const formData = new FormData();
        values.files.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj);
          }
        });
        await api.post(`/assignments/${data.id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      message.success('Giao bài tập thành công!');
      setCreateOpen(false);
      createForm.resetFields();
      fetchAssignments();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || 'Lỗi khi tạo bài tập');
    } finally {
      setCreating(false);
    }
  };

  const changeStatus = async (assignment: any, status: string) => {
    try {
      await api.patch(`/assignments/${assignment.id}`, { status });
      message.success(status === 'published' ? 'Đã giao bài tập' : 'Đã đóng bài tập');
      fetchAssignments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể đổi trạng thái bài tập');
    }
  };

  const removeDraft = async (assignment: any) => {
    try {
      await api.delete(`/assignments/${assignment.id}`);
      message.success('Đã xóa bài tập nháp');
      fetchAssignments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa bài tập');
    }
  };

  const openSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/assignments/${assignment.id}/submissions`);
      setSubmissions(res.data.submissions || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách bài nộp');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGrade = async () => {
    try {
      const values = await gradeForm.validateFields();
      setGrading(true);
      await api.patch(`/assignments/submissions/${gradeTarget.id}/grade`, values);
      message.success('Lưu điểm thành công!');
      setGradeTarget(null);
      gradeForm.resetFields();
      if (selectedAssignment) {
        openSubmissions(selectedAssignment);
      }
      fetchAssignments();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || 'Lỗi khi chấm điểm');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header bar with Action button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Text style={{ color: 'var(--text-secondary)' }}>
          Quản lý bài tập về nhà, theo dõi tiến độ nộp bài và chấm điểm học sinh của lớp.
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          onClick={() => setCreateOpen(true)}
        >
          Giao bài tập
        </Button>
      </div>

      <Table
        dataSource={assignments}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        locale={{ emptyText: 'Chưa có bài tập nào được giao cho lớp này' }}
        columns={[
          {
            title: 'Tiêu đề bài tập',
            render: (_, r: any) => (
              <div>
                <b style={{ color: 'var(--text-primary)' }}>{r.title}</b>
                {r.description && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>{r.description}</div>}
              </div>
            )
          },
          {
            title: 'Hạn nộp',
            dataIndex: 'dueAt',
            width: 170,
            render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Không giới hạn'
          },
          {
            title: 'Đã nộp',
            width: 120,
            render: (_, r: any) => `${r.submittedCount || 0}/${r.totalStudents || 0}`
          },
          {
            title: 'Chờ chấm',
            dataIndex: 'pendingGradeCount',
            width: 100,
            render: v => <Text type={v > 0 ? 'danger' : 'secondary'}>{v || 0}</Text>
          },
          {
            title: 'Đã chấm',
            dataIndex: 'gradedCount',
            width: 100,
            render: v => v || 0
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: v => {
              let color = 'gold';
              let text = 'Nháp';
              if (v === 'published') { color = 'blue'; text = 'Đang giao'; }
              if (v === 'closed') { color = 'purple'; text = 'Đã đóng'; }
              return <Tag color={color}>{text}</Tag>;
            }
          },
          {
            title: 'Thao tác',
            key: 'action',
            width: 220,
            align: 'center',
            render: (_, r: any) => (
              <Space size={8}>
                <Button type="primary" size="small" onClick={() => openSubmissions(r)}>
                  Xem & chấm
                </Button>
                {r.status === 'draft' && (
                  <>
                    <Button size="small" style={{ color: '#10b981', borderColor: '#10b981' }} onClick={() => changeStatus(r, 'published')}>
                      Giao ngay
                    </Button>
                    <Button size="small" danger onClick={() => removeDraft(r)}>
                      Xóa
                    </Button>
                  </>
                )}
                {r.status === 'published' && (
                  <Button size="small" danger onClick={() => changeStatus(r, 'closed')}>
                    Đóng bài
                  </Button>
                )}
              </Space>
            )
          }
        ]}
      />

      {/* Modal: Giao bài tập mới */}
      <Modal
        title="Giao bài tập mới"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        onOk={handleCreateAssignment}
        confirmLoading={creating}
        okText="Giao bài"
        cancelText="Hủy"
        width={600}
      >
        <Form form={createForm} layout="vertical" initialValues={{ maxScore: 10, status: 'published' }}>
          <Form.Item name="title" label="Tiêu đề bài tập" rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
            <Input placeholder="Ví dụ: Bài tập về nhà Unit 5 - Thì quá khứ đơn" />
          </Form.Item>
          <Form.Item name="description" label="Hướng dẫn / Yêu cầu làm bài">
            <TextArea rows={4} placeholder="Nhập chi tiết yêu cầu, bài tập cần hoàn thành..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="dueAt" label="Hạn nộp">
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" disabledDate={d => d.isBefore(dayjs(), 'day')} placeholder="Chọn ngày & giờ" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="maxScore" label="Điểm tối đa">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="Trạng thái">
            <Select options={[{ value: 'published', label: 'Giao ngay cho học sinh' }, { value: 'draft', label: 'Lưu bản nháp' }]} />
          </Form.Item>
          <Form.Item name="files" label="Tệp đính kèm (PDF, Hình ảnh)" valuePropName="fileList" getValueFromEvent={e => e?.fileList}>
            <Upload beforeUpload={() => false} multiple accept=".pdf,image/jpeg,image/png,image/webp" maxCount={10}>
              <Button icon={<UploadOutlined />}>Tải lên file đề bài</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Danh sách bài nộp & chấm điểm */}
      <Modal
        title={selectedAssignment ? `Bài nộp: ${selectedAssignment.title}` : 'Danh sách bài nộp'}
        open={!!selectedAssignment}
        onCancel={() => setSelectedAssignment(null)}
        footer={null}
        width={1000}
      >
        <Table
          dataSource={submissions}
          rowKey="id"
          loading={loadingSubmissions}
          scroll={{ x: 850 }}
          locale={{ emptyText: 'Chưa có học sinh nào nộp bài tập này' }}
          columns={[
            {
              title: 'Mã HS',
              dataIndex: 'studentCode',
              width: 120
            },
            {
              title: 'Học sinh',
              dataIndex: 'studentName',
              render: (v, r) => <b>{v} {r.nickName ? `(${r.nickName})` : ''}</b>
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 130,
              render: v => {
                const map: Record<string, string> = { submitted: 'Đã nộp', late: 'Nộp muộn', graded: 'Đã chấm', not_submitted: 'Chưa nộp' };
                const colorMap: Record<string, string> = { submitted: 'blue', late: 'volcano', graded: 'green', not_submitted: 'default' };
                return <Tag color={colorMap[v] || 'default'}>{map[v] || v}</Tag>;
              }
            },
            {
              title: 'Thời gian nộp',
              dataIndex: 'submittedAt',
              width: 160,
              render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'
            },
            {
              title: 'File đính kèm',
              dataIndex: 'attachments',
              render: (files: any[]) => (
                <Space direction="vertical" size={2}>
                  {files?.map(file => (
                    <a key={file.id} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6366f1' }}>
                      <FileTextOutlined /> {file.fileName}
                    </a>
                  ))}
                  {(!files || files.length === 0) && <Text type="secondary">-</Text>}
                </Space>
              )
            },
            {
              title: 'Điểm số',
              dataIndex: 'score',
              width: 90,
              render: v => v !== null && v !== undefined ? <b style={{ color: '#10b981' }}>{v}</b> : '-'
            },
            {
              title: 'Thao tác',
              key: 'action',
              width: 110,
              align: 'center',
              render: (_, r: any) => (
                <Button
                  size="small"
                  type={r.status === 'graded' ? 'default' : 'primary'}
                  disabled={r.status === 'not_submitted'}
                  onClick={() => {
                    setGradeTarget(r);
                    gradeForm.setFieldsValue({ score: r.score, feedback: r.feedback });
                  }}
                >
                  {r.status === 'graded' ? 'Sửa điểm' : 'Chấm bài'}
                </Button>
              )
            }
          ]}
        />
      </Modal>

      {/* Modal: Chấm điểm bài nộp */}
      <Modal
        title={
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>Chấm bài: {gradeTarget?.studentName || ''}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              {selectedAssignment?.title} &nbsp;·&nbsp; Điểm tối đa: {selectedAssignment?.maxScore ?? 10}
            </div>
          </div>
        }
        open={!!gradeTarget}
        onCancel={() => { setGradeTarget(null); gradeForm.resetFields(); }}
        onOk={handleGrade}
        confirmLoading={grading}
        okText="Lưu điểm"
        cancelText="Hủy"
        width={560}
      >
        {gradeTarget && gradeTarget.answerText && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
              Bài làm của học sinh:
            </div>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{gradeTarget.answerText}</div>
          </div>
        )}
        <Form form={gradeForm} layout="vertical">
          <Form.Item
            name="score"
            label="Điểm số"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm' },
              {
                validator: async (_, val) => {
                  const max = selectedAssignment?.maxScore ?? 10;
                  if (val !== undefined && val !== null && (val < 0 || val > max)) {
                    throw new Error(`Điểm số phải từ 0 đến ${max}`);
                  }
                }
              }
            ]}
          >
            <InputNumber min={0} max={selectedAssignment?.maxScore ?? 10} step={0.25} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="feedback" label="Nhận xét / Lời khuyên">
            <TextArea rows={4} placeholder="Nhận xét ưu điểm, lỗi sai cần khắc phục..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
