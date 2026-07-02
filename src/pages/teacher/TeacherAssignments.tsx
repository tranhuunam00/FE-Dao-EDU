/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tag, Upload } from 'antd';
import { CheckCircle2, ClipboardList, FileText, Plus, Send, UploadCloud } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../services/api';

const { TextArea } = Input;

const TeacherAssignments: React.FC = () => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradeTarget, setGradeTarget] = useState<any>(null);
  const [createForm] = Form.useForm();
  const [gradeForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [assignmentRes, summaryRes, classRes] = await Promise.all([
        api.get('/assignments/teacher'),
        api.get('/assignments/teacher/summary'),
        api.get('/dashboard/teacher/classes'),
      ]);
      setAssignments(assignmentRes.data.assignments || []);
      setSummary(summaryRes.data);
      setClasses(classRes.data.classes || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAssignment = async () => {
    const values = await createForm.validateFields();
    let createdAssignment: any = null;
    try {
      const { files, dueAt, classId, ...payload } = values;
      const requestedStatus = payload.status;
      const { data } = await api.post(`/assignments/class/${classId}`, {
        ...payload,
        status: 'draft',
        dueAt: dueAt?.toISOString(),
      });
      createdAssignment = data;
      if (files?.length) {
        const formData = new FormData();
        files.forEach((item: any) => formData.append('files', item.originFileObj));
        await api.post(`/assignments/${data.id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      if (requestedStatus === 'published') {
        await api.patch(`/assignments/${data.id}`, { status: 'published' });
      }
      message.success(requestedStatus === 'published' ? 'Đã giao bài cho lớp' : 'Đã lưu bản nháp');
      setCreateOpen(false);
      createForm.resetFields();
      load();
    } catch (error: any) {
      message.error(
        createdAssignment
          ? 'Bài tập đã được giữ ở bản nháp vì chưa thể upload file hoặc giao bài.'
          : error.response?.data?.message || 'Không thể tạo bài tập',
      );
      load();
    }
  };

  const openSubmissions = async (assignment: any) => {
    setSelected(assignment);
    const { data } = await api.get(`/assignments/${assignment.id}/submissions`);
    setSubmissions(data.submissions || []);
  };

  const changeStatus = async (assignment: any, status: string) => {
    try {
      await api.patch(`/assignments/${assignment.id}`, { status });
      message.success(status === 'published' ? 'Đã giao bài và gửi thông báo' : 'Đã đóng bài tập');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể cập nhật bài tập');
    }
  };

  const removeDraft = async (assignment: any) => {
    try {
      await api.delete(`/assignments/${assignment.id}`);
      message.success('Đã xóa bản nháp');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể xóa bản nháp');
    }
  };

  const grade = async () => {
    const values = await gradeForm.validateFields();
    await api.patch(`/assignments/submissions/${gradeTarget.id}/grade`, values);
    message.success('Đã trả điểm và gửi thông báo cho học sinh');
    setGradeTarget(null);
    gradeForm.resetFields();
    await openSubmissions(selected);
    load();
  };

  const cards = [
    ['Bài tập đã giao', summary.totalAssignments || 0, ClipboardList, '#818cf8'],
    ['Lượt đã nộp', summary.submittedCount || 0, Send, '#38bdf8'],
    ['Chờ chấm', summary.pendingGradeCount || 0, FileText, '#fbbf24'],
    ['Đã chấm', summary.gradedCount || 0, CheckCircle2, '#34d399'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h2 style={{ color: '#fff', fontSize: 30 }}>Bài tập & Chấm điểm</h2><p style={{ color: 'var(--text-secondary)' }}>Giao bài theo lớp, theo dõi tiến độ và trả điểm.</p></div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Giao bài</Button>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {cards.map(([label, value, Icon, color]: any) => <Col xs={12} lg={6} key={label}><Card className="glass-panel"><Space><Icon color={color} /><div><small style={{ color: 'var(--text-secondary)' }}>{label}</small><div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{value}</div></div></Space></Card></Col>)}
      </Row>
      <Card className="glass-panel" title="Danh sách bài tập">
        <Table loading={loading} dataSource={assignments} rowKey="id" scroll={{ x: 900 }} columns={[
          { title: 'Bài tập', render: (_, r: any) => <div><b>{r.title}</b><div style={{ opacity: .6 }}>{r.classCode} - {r.className}</div></div> },
          { title: 'Hạn nộp', dataIndex: 'dueAt', render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Không giới hạn' },
          { title: 'Tiến độ', render: (_, r: any) => `${r.submittedCount}/${r.totalStudents} đã nộp · ${r.gradedCount} đã chấm` },
          { title: 'Trạng thái', dataIndex: 'status', render: (v) => <Tag color={v === 'published' ? 'blue' : v === 'closed' ? 'purple' : 'default'}>{v}</Tag> },
          { title: '', render: (_, r: any) => <Space><Button onClick={() => openSubmissions(r)}>Xem & chấm</Button>{r.status === 'draft' && <><Button type="primary" onClick={() => changeStatus(r, 'published')}>Giao bài</Button><Button danger onClick={() => removeDraft(r)}>Xóa nháp</Button></>}{r.status === 'published' && <Button danger onClick={() => changeStatus(r, 'closed')}>Đóng</Button>}</Space> },
        ]} />
      </Card>

      <Modal title="Giao bài tập" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={createAssignment} okText="Giao bài / Lưu nháp">
        <Form form={createForm} layout="vertical" initialValues={{ maxScore: 10, status: 'published' }}>
          <Form.Item name="classId" label="Lớp" rules={[{ required: true }]}><Select options={classes.map(c => ({ value: c.id, label: `${c.classCode} - ${c.className}` }))} /></Form.Item>
          <Form.Item name="title" label="Tên bài tập" rules={[{ required: true }, { max: 255 }]}><Input /></Form.Item>
          <Form.Item name="description" label="Yêu cầu"><TextArea rows={4} /></Form.Item>
          <Row gutter={12}><Col span={14}><Form.Item name="dueAt" label="Hạn nộp"><DatePicker showTime style={{ width: '100%' }} disabledDate={d => d.isBefore(dayjs(), 'day')} /></Form.Item></Col><Col span={10}><Form.Item name="maxScore" label="Điểm tối đa"><InputNumber min={0.01} style={{ width: '100%' }} /></Form.Item></Col></Row>
          <Form.Item name="status" label="Trạng thái"><Select options={[{ value: 'published', label: 'Giao ngay' }, { value: 'draft', label: 'Lưu nháp' }]} /></Form.Item>
          <Form.Item name="files" label="PDF / hình ảnh" valuePropName="fileList" getValueFromEvent={e => e.fileList}>
            <Upload beforeUpload={() => false} multiple accept=".pdf,image/jpeg,image/png,image/webp" maxCount={10}><Button icon={<UploadCloud size={16} />}>Chọn file</Button></Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={selected?.title} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={1050}>
        <Table dataSource={submissions} rowKey="id" scroll={{ x: 900 }} columns={[
          { title: 'Học sinh', render: (_, r: any) => `${r.studentCode} - ${r.studentName}` },
          { title: 'Trạng thái', dataIndex: 'status', render: v => {
              let color = 'gold';
              if (v === 'submitted') color = 'blue';
              if (v === 'late') color = 'volcano';
              if (v === 'graded') color = 'green';
              return <Tag color={color}>{v}</Tag>;
            }
          },
          { title: 'Nộp lúc', dataIndex: 'submittedAt', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-' },
          { title: 'Nội dung', dataIndex: 'answerText', ellipsis: true, render: v => v || '-' },
          { 
            title: 'File', 
            dataIndex: 'attachments', 
            render: (items: any[]) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items?.map(x => (
                  <a key={x.id} href={x.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <FileText size={14} style={{ color: '#818cf8' }} />
                    {x.fileName}
                  </a>
                ))}
                {(!items || items.length === 0) && '-'}
              </div>
            )
          },
          { title: 'Điểm', dataIndex: 'score', render: v => v ?? '-' },
          { title: '', render: (_, r: any) => <Button disabled={r.status === 'not_submitted'} onClick={() => { setGradeTarget(r); gradeForm.setFieldsValue(r); }}>Chấm</Button> },
        ]} />
      </Modal>
      <Modal title={`Chấm bài: ${gradeTarget?.studentName || ''}`} open={!!gradeTarget} onCancel={() => setGradeTarget(null)} onOk={grade}>
        <Form form={gradeForm} layout="vertical"><Form.Item name="score" label="Điểm" rules={[{ required: true }]}><InputNumber min={0} max={selected?.maxScore || 10} style={{ width: '100%' }} /></Form.Item><Form.Item name="feedback" label="Nhận xét"><TextArea rows={4} /></Form.Item></Form>
      </Modal>
    </div>
  );
};

export default TeacherAssignments;
