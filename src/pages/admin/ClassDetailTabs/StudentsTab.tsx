import React from 'react';
import { Card, Typography, Button, Table, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface StudentsTabProps {
  classData: any;
  setIsAddStudentVisible: (v: boolean) => void;
  handleKickStudent: (id: string, name: string) => void;
  handleReAddStudent: (id: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({ classData, setIsAddStudentVisible, handleKickStudent, handleReAddStudent }) => {
  const studentColumns = [
    {
      title: 'Học sinh',
      key: 'name',
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
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
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
    <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ color: '#fff', margin: 0 }}>Danh sách Học sinh trong lớp</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddStudentVisible(true)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
        >
          Thêm Học sinh vào lớp
        </Button>
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
