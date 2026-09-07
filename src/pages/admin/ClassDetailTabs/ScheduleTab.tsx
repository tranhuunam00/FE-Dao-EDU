import React from 'react';
import { Card, Typography, Button, Table, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ClassSession {
  id: string;
  roomId: string | null;
  teacherId: string | null;
  assistantId: string | null;
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
  const sessionColumns = [
    {
      title: 'Ngày học',
      dataIndex: 'date',
      key: 'date',
      width: '150px',
      render: (text: string) => <Text strong style={{ color: 'var(--text-primary)' }}>{dayjs(text).format('DD/MM/YYYY')}</Text>,
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
      width: '160px',
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
      width: '140px',
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
      width: '240px',
      render: (_: any, record: ClassSession) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            type="primary"
            size="small"
            style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
            onClick={() => openSessionDetail(record)}
          >
            {record.status === 'Completed' ? 'Xem điểm danh' : 'Điểm danh / Đổi lịch'}
          </Button>

          {isAdmin && record.status === 'Scheduled' && !record.attendanceLocked && (
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
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={5} style={{ color: 'var(--text-primary)', margin: 0 }}>Danh sách các buổi học</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Các buổi học được sinh tự động dựa trên Lịch học cố định từ ngày Khai giảng.
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="dashed"
            icon={<SyncOutlined />}
            onClick={openGenerateSessionsModal}
            style={{ color: '#a5b4fc', borderColor: '#6366f1' }}
          >
            {sessions.length === 0 ? 'Sinh danh sách buổi học' : 'Sinh lại / Đồng bộ lịch học'}
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
        dataSource={sessions}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );
};
