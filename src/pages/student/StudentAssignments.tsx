/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { App, Button, Card, Col, Form, Input, Modal, Row, Space, Tag, Upload } from 'antd';
import { CheckCircle2, Clock3, FileText, Send, UploadCloud } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../services/api';

const { TextArea } = Input;

const StudentAssignments: React.FC = () => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const { data } = await api.get('/assignments/student');
      setAssignments(data.assignments || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải bài tập');
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    if (values.answerText) formData.append('answerText', values.answerText);
    values.files?.forEach((item: any) => formData.append('files', item.originFileObj));
    try {
      await api.post(`/assignments/${selected.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Đã nộp bài thành công');
      setSelected(null);
      form.resetFields();
      load();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể nộp bài');
    }
  };

  const pending = assignments.filter(a => !a.submission);
  const submitted = assignments.filter(a => a.submission && a.submission.status !== 'graded');
  const graded = assignments.filter(a => a.submission?.status === 'graded');
  const cards = [['Cần làm', pending.length, Clock3, '#fbbf24'], ['Đã nộp', submitted.length, Send, '#38bdf8'], ['Đã chấm', graded.length, CheckCircle2, '#34d399']];

  return <div>
    <h2 style={{ color: '#fff', fontSize: 30 }}>Bài tập của tôi</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Theo dõi hạn nộp, nộp bài và xem kết quả.</p>
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>{cards.map(([label, value, Icon, color]: any) => <Col xs={24} md={8} key={label}><Card className="glass-panel"><Space><Icon color={color} /><div><small>{label}</small><div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div></div></Space></Card></Col>)}</Row>
    <Row gutter={[16, 16]}>{assignments.map(item => <Col xs={24} lg={12} key={item.id}><Card className="glass-panel" title={item.title} extra={<Tag color={item.submission?.status === 'graded' ? 'green' : item.submission ? 'blue' : 'gold'}>{item.submission?.status || 'cần làm'}</Tag>}>
      <div style={{ color: 'var(--text-secondary)' }}>{item.classEntity?.classCode} - {item.classEntity?.className}</div>
      <p style={{ margin: '12px 0' }}>{item.description || 'Không có mô tả'}</p>
      <div>Hạn nộp: <b>{item.dueAt ? dayjs(item.dueAt).format('DD/MM/YYYY HH:mm') : 'Không giới hạn'}</b></div>
      <div style={{ margin: '10px 0' }}>{item.attachments?.map((x: any) => <div key={x.id}><a href={x.url} target="_blank"><FileText size={14} /> {x.fileName}</a></div>)}</div>
      {item.submission?.status === 'graded' && <div style={{ padding: 12, background: 'rgba(52,211,153,.1)', borderRadius: 8 }}>Điểm: <b>{Number(item.submission.score)}/{Number(item.maxScore)}</b><br />Nhận xét: {item.submission.feedback || '-'}</div>}
      {item.status !== 'closed' && <Button type="primary" style={{ marginTop: 12 }} onClick={() => { setSelected(item); form.setFieldsValue({ answerText: item.submission?.answerText }); }}>{item.submission ? 'Nộp lại' : 'Nộp bài'}</Button>}
    </Card></Col>)}</Row>
    <Modal title={`Nộp bài: ${selected?.title || ''}`} open={!!selected} onCancel={() => setSelected(null)} onOk={submit} okText="Nộp bài">
      <Form form={form} layout="vertical"><Form.Item name="answerText" label="Nội dung"><TextArea rows={5} /></Form.Item><Form.Item name="files" label="PDF / hình ảnh" valuePropName="fileList" getValueFromEvent={e => e.fileList}><Upload beforeUpload={() => false} multiple maxCount={10} accept=".pdf,image/jpeg,image/png,image/webp"><Button icon={<UploadCloud size={16} />}>Chọn file</Button></Upload></Form.Item></Form>
    </Modal>
  </div>;
};

export default StudentAssignments;
