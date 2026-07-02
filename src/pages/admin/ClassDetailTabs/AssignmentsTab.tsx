import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Space, Typography, App } from 'antd';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Text } = Typography;

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

  return (
    <div style={{ marginTop: 16 }}>
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
            width: 180,
            render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'Không có hạn'
          },
          {
            title: 'Số bài đã nộp',
            width: 140,
            render: (_, r: any) => `${r.submittedCount || 0}/${r.totalStudents || 0}`
          },
          {
            title: 'Chờ chấm',
            dataIndex: 'pendingGradeCount',
            width: 120,
            render: v => <Text type={v > 0 ? 'danger' : 'secondary'}>{v}</Text>
          },
          {
            title: 'Đã chấm',
            dataIndex: 'gradedCount',
            width: 120
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 130,
            render: v => {
              let color = 'gold';
              let text = 'Nháp';
              if (v === 'published') { color = 'green'; text = 'Đang giao'; }
              if (v === 'closed') { color = 'red'; text = 'Đã đóng'; }
              return <Tag color={color}>{text}</Tag>;
            }
          },
          {
            title: 'Thao tác',
            key: 'action',
            width: 140,
            align: 'center',
            render: (_, r: any) => (
              <Button type="primary" size="small" onClick={() => openSubmissions(r)}>
                Xem bài nộp
              </Button>
            )
          }
        ]}
      />

      <Modal
        title={selectedAssignment ? `Bài nộp: ${selectedAssignment.title}` : 'Danh sách bài nộp'}
        open={!!selectedAssignment}
        onCancel={() => setSelectedAssignment(null)}
        footer={null}
        width={950}
      >
        <Table
          dataSource={submissions}
          rowKey="id"
          loading={loadingSubmissions}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'Chưa học sinh nào nộp bài tập này' }}
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
              width: 140,
              render: v => {
                let color = 'gold';
                let text = 'Chờ nộp';
                if (v === 'submitted') { color = 'blue'; text = 'Đã nộp'; }
                if (v === 'late') { color = 'volcano'; text = 'Nộp muộn'; }
                if (v === 'graded') { color = 'green'; text = 'Đã chấm'; }
                return <Tag color={color}>{text}</Tag>;
              }
            },
            {
              title: 'Thời gian nộp',
              dataIndex: 'submittedAt',
              width: 180,
              render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'
            },
            {
              title: 'Điểm số',
              dataIndex: 'score',
              width: 120,
              render: v => v !== null && v !== undefined ? <b style={{ color: '#10b981' }}>{v}</b> : '-'
            },
            {
              title: 'Tệp đính kèm',
              dataIndex: 'attachments',
              render: (files: any[]) => (
                <Space direction="vertical" size={4}>
                  {files?.map(file => (
                    <a key={file.id} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                      {file.fileName}
                    </a>
                  ))}
                  {(!files || files.length === 0) && <Text type="secondary">-</Text>}
                </Space>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};
