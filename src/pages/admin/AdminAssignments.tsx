/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { App, Button, Card, Modal, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import api from '../../services/api';

const AdminAssignments: React.FC = () => {
  const { message } = App.useApp();
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  useEffect(() => {
    api.get('/assignments/admin')
      .then(r => setItems(r.data.assignments || []))
      .catch(e => message.error(e.response?.data?.message || 'Không thể tải bài tập'));
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const open = async (assignment: any) => {
    setSelected(assignment);
    const { data } = await api.get(`/assignments/${assignment.id}/submissions`);
    setSubmissions(data.submissions || []);
  };
  return <div><h2 style={{ color: '#fff', fontSize: 30 }}>Theo dõi bài tập</h2><p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Dashboard toàn hệ thống dành cho quản trị viên.</p><Card className="glass-panel"><Table dataSource={items} rowKey="id" scroll={{ x: 900 }} columns={[
    { title: 'Bài tập', render: (_, r: any) => <div><b>{r.title}</b><div style={{ opacity: .6 }}>{r.classCode} - {r.className}</div></div> },
    { title: 'Hạn nộp', dataIndex: 'dueAt', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'Đã nộp', render: (_, r: any) => `${r.submittedCount}/${r.totalStudents}` },
    { title: 'Chờ chấm', dataIndex: 'pendingGradeCount' },
    { title: 'Đã chấm', dataIndex: 'gradedCount' },
    { title: 'Trạng thái', dataIndex: 'status', render: v => <Tag>{v}</Tag> },
    { title: '', render: (_, r: any) => <Button onClick={() => open(r)}>Xem bài nộp</Button> },
  ]} /></Card><Modal title={selected?.title || 'Bài nộp'} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={950}><Table dataSource={submissions} rowKey="id" scroll={{ x: 800 }} columns={[
    { title: 'Học sinh', render: (_, r: any) => `${r.studentCode} - ${r.studentName}` },
    { title: 'Trạng thái', dataIndex: 'status', render: v => <Tag>{v}</Tag> },
    { title: 'Nộp lúc', dataIndex: 'submittedAt', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'Điểm', dataIndex: 'score', render: v => v ?? '-' },
    { title: 'File', dataIndex: 'attachments', render: (files: any[]) => files?.map(file => <div key={file.id}><a href={file.url} target="_blank">{file.fileName}</a></div>) },
  ]} /></Modal></div>;
};
export default AdminAssignments;
