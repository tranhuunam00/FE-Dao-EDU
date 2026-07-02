/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { App, Button, Card, Col, Form, Input, Modal, Row, Space, Tag, Upload, Popconfirm } from 'antd';
import { CheckCircle2, Clock3, FileText, Send, UploadCloud, Trash2, Edit3 } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../services/api';

const { TextArea } = Input;

const StudentAssignments: React.FC = () => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<any[]>([]);
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

  const openEditModal = (item: any) => {
    setSelected(item);
    setIsEditMode(true);
    setCurrentAttachments(item.submission?.attachments || []);
    form.setFieldsValue({
      answerText: item.submission?.answerText,
      files: [],
    });
  };

  const openSubmitModal = (item: any) => {
    setSelected(item);
    setIsEditMode(false);
    setCurrentAttachments([]);
    form.resetFields();
  };

  const submit = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    if (values.answerText) formData.append('answerText', values.answerText);
    values.files?.forEach((item: any) => formData.append('files', item.originFileObj));

    try {
      if (isEditMode && selected.submission?.id) {
        await api.patch(`/assignments/submissions/${selected.submission.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Cập nhật bài nộp thành công');
      } else {
        await api.post(`/assignments/${selected.id}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Đã nộp bài thành công');
      }
      setSelected(null);
      form.resetFields();
      load();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể gửi bài làm');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selected?.submission?.id) return;
    try {
      await api.delete(`/assignments/submissions/${selected.submission.id}/attachments/${attachmentId}`);
      message.success('Đã xóa file đính kèm');
      setCurrentAttachments(prev => prev.filter(att => att.id !== attachmentId));
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa file');
    }
  };

  const pending = assignments.filter(a => !a.submission);
  const submitted = assignments.filter(a => a.submission && a.submission.status !== 'graded');
  const graded = assignments.filter(a => a.submission?.status === 'graded');
  const cards = [['Cần làm', pending.length, Clock3, '#fbbf24'], ['Đã nộp', submitted.length, Send, '#38bdf8'], ['Đã chấm', graded.length, CheckCircle2, '#34d399']];

  return (
    <div>
      <h2 style={{ fontSize: 30, color: 'var(--text-primary)' }}>Bài tập của tôi</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Theo dõi hạn nộp, nộp bài và xem kết quả.</p>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {cards.map(([label, value, Icon, color]: any) => (
          <Col xs={24} md={8} key={label}>
            <Card className="glass-panel">
              <Space>
                <Icon color={color} />
                <div>
                  <small style={{ color: 'var(--text-secondary)' }}>{label}</small>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        {assignments.map(item => (
          <Col xs={24} lg={12} key={item.id}>
            <Card
              className="glass-panel"
              title={item.title}
              extra={
                <Tag color={item.submission?.status === 'graded' ? 'green' : item.submission ? 'blue' : 'gold'}>
                  {item.submission?.status || 'cần làm'}
                </Tag>
              }
            >
              <div style={{ color: 'var(--text-secondary)' }}>{item.classEntity?.classCode} - {item.classEntity?.className}</div>
              <p style={{ margin: '12px 0', color: 'var(--text-primary)' }}>{item.description || 'Không có mô tả'}</p>
              <div style={{ color: 'var(--text-secondary)' }}>Hạn nộp: <b style={{ color: 'var(--text-primary)' }}>{item.dueAt ? dayjs(item.dueAt).format('DD/MM/YYYY HH:mm') : 'Không giới hạn'}</b></div>
              
              <div style={{ margin: '12px 0' }}>
                {item.attachments?.map((x: any) => (
                  <div key={x.id} style={{ margin: '4px 0' }}>
                    <a href={x.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={14} /> {x.fileName}
                    </a>
                  </div>
                ))}
              </div>

              {item.submission && (
                <div style={{ 
                  padding: 12, 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: 8, 
                  marginBottom: 12 
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    Bài làm của bạn:
                  </div>
                  {item.submission.answerText && (
                    <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {item.submission.answerText}
                    </p>
                  )}
                  {item.submission.attachments && item.submission.attachments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {item.submission.attachments.map((att: any) => (
                        <a 
                          key={att.id} 
                          href={att.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#818cf8', fontSize: '0.85rem' }}
                        >
                          <FileText size={14} /> {att.fileName}
                        </a>
                      ))}
                    </div>
                  ) : (
                    !item.submission.answerText && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Không có tệp đính kèm</span>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                    Nộp lúc: {dayjs(item.submission.submittedAt).format('DD/MM/YYYY HH:mm')}
                    {item.submission.status === 'late' && (
                      <span style={{ color: 'var(--danger)', marginLeft: 8 }}>(Nộp muộn)</span>
                    )}
                  </div>
                </div>
              )}

              {item.submission?.status === 'graded' && (
                <div style={{ padding: 12, background: 'rgba(52,211,153,.1)', borderRadius: 8, marginBottom: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Điểm:</span> <b style={{ color: '#10b981' }}>{Number(item.submission.score)}/{Number(item.maxScore)}</b>
                  <br />
                  <span style={{ color: 'var(--text-secondary)' }}>Nhận xét:</span> <span style={{ color: 'var(--text-primary)' }}>{item.submission.feedback || '-'}</span>
                </div>
              )}

              {item.status !== 'closed' && (
                <Space size="middle" style={{ marginTop: 12 }}>
                  {item.submission ? (
                    <>
                      {item.submission.status !== 'graded' && (
                        <Button icon={<Edit3 size={14} />} onClick={() => openEditModal(item)}>
                          Sửa bài đã nộp
                        </Button>
                      )}
                      <Button type="primary" onClick={() => openSubmitModal(item)}>
                        Nộp lần khác
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={() => openSubmitModal(item)}>
                      Nộp bài
                    </Button>
                  )}
                </Space>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={isEditMode ? `Sửa bài đã nộp: ${selected?.title || ''}` : `Nộp bài: ${selected?.title || ''}`}
        open={!!selected}
        onCancel={() => setSelected(null)}
        onOk={submit}
        okText={isEditMode ? "Lưu thay đổi" : "Nộp bài"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="answerText" label="Nội dung">
            <TextArea rows={5} />
          </Form.Item>

          {isEditMode && currentAttachments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Tệp đính kèm đã nộp:</span>
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentAttachments.map(att => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8
                    }}
                  >
                    <a href={att.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} style={{ color: '#818cf8' }} />
                      {att.fileName}
                    </a>
                    <Popconfirm
                      title="Xóa file đính kèm này?"
                      description="Hành động này sẽ xóa file vĩnh viễn khỏi máy chủ."
                      onConfirm={() => handleDeleteAttachment(att.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="link" danger size="small" icon={<Trash2 size={14} />} style={{ padding: 0 }} />
                    </Popconfirm>
                  </div>
                ))}
              </Space>
            </div>
          )}

          <Form.Item
            name="files"
            label={isEditMode ? "Tải lên thêm file mới" : "PDF / hình ảnh"}
            valuePropName="fileList"
            getValueFromEvent={e => e.fileList}
          >
            <Upload beforeUpload={() => false} multiple maxCount={10} accept=".pdf,image/jpeg,image/png,image/webp">
              <Button icon={<UploadCloud size={16} />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
