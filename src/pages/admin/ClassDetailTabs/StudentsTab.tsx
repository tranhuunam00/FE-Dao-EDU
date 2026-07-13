import React from 'react';
import { Card, Typography, Button, Table, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface StudentsTabProps {
  classData: any;
  setIsAddStudentVisible: (v: boolean) => void;
  handleKickStudent: (id: string, name: string) => void;
  handleReAddStudent: (id: string) => void;
  openCloneModal: () => void;
  handleEditJoinDate: (studentId: string, studentName: string, currentJoinedDate: string) => void;
  handleEditAllJoinDates: () => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  classData,
  setIsAddStudentVisible,
  handleKickStudent,
  handleReAddStudent,
  openCloneModal,
  handleEditJoinDate,
  handleEditAllJoinDates,
}) => {
  const studentColumns = [
    {
      title: 'Học sinh',
      key: 'name',
      sorter: (a: any, b: any) => {
        const aFirst = a.student?.firstName || '';
        const bFirst = b.student?.firstName || '';
        const comp = aFirst.localeCompare(bFirst, 'vi', { sensitivity: 'base' });
        if (comp !== 0) return comp;
        const aLast = a.student?.lastName || '';
        const bLast = b.student?.lastName || '';
        return aLast.localeCompare(bLast, 'vi', { sensitivity: 'base' });
      },
      defaultSortOrder: 'ascend' as const,
      render: (_: any, record: any) => {
        const fullName = record.student ? `${record.student.lastName} ${record.student.firstName}` : '-';
        return (
          <div>
            <Text strong style={{ color: 'var(--text-primary)' }}>{fullName}</Text>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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
      render: (v: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{dayjs(v).format('DD/MM/YYYY')}</span>
          {record.status === 'Active' && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: '12px', color: 'var(--primary)' }} />}
              onClick={() => handleEditJoinDate(record.studentId, record.student ? `${record.student.lastName} ${record.student.firstName}` : '', v)}
              title="Sửa ngày tham gia lớp"
            />
          )}
        </div>
      ),
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

  return (
    <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ color: 'var(--text-primary)', margin: 0 }}>Danh sách Học sinh trong lớp</Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={handleEditAllJoinDates}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
          >
            Sửa nhanh ngày tham gia
          </Button>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={openCloneModal}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
          >
            Sao chép từ lớp khác
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddStudentVisible(true)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          >
            Thêm Học sinh vào lớp
          </Button>
        </div>
      </div>
      <Table
        columns={studentColumns}
        dataSource={classData.students}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};
