import React from 'react';
import { Card, Table, Button, Tag } from 'antd';
import { TeamOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ClassesTabProps {
  studentClasses: any[];
  setIsAddClassVisible: (v: boolean) => void;
  navigate: (url: string) => void;
  handleRemoveClass: (classId: string, className: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({ studentClasses, setIsAddClassVisible, navigate, handleRemoveClass }) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Danh sách Lớp học tham gia</span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddClassVisible(true)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
          >
            Thêm vào lớp
          </Button>
        </div>
      }
      className="glass-panel"
      style={{ border: 'none', background: 'var(--card-bg)' }}
    >
      <Table
        dataSource={studentClasses}
        rowKey="id"
        pagination={false}
        size="small"
        columns={[
          {
            title: 'Mã lớp',
            dataIndex: ['classEntity', 'classCode'],
            key: 'classCode',
            render: (text, record: any) => (
              <Button
                type="link"
                onClick={() => navigate(`/admin/classes/${record.classId}`)}
                style={{ padding: 0, height: 'auto', fontWeight: 600, color: '#818cf8' }}
              >
                {text}
              </Button>
            ),
          },
          {
            title: 'Tên lớp',
            dataIndex: ['classEntity', 'className'],
            key: 'className',
          },
          {
            title: 'Khóa học',
            dataIndex: ['classEntity', 'course', 'name'],
            key: 'courseName',
          },
          {
            title: 'Trung tâm',
            dataIndex: ['classEntity', 'center', 'name'],
            key: 'centerName',
          },
          {
            title: 'Ngày tham gia',
            dataIndex: 'joinedDate',
            key: 'joinedDate',
            render: (v) => dayjs(v).format('DD/MM/YYYY'),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s) => (
              <Tag color={s === 'Active' ? 'green' : 'red'}>
                {s === 'Active' ? 'Đang học' : 'Đã dừng học (Dropped)'}
              </Tag>
            )
          },
          {
            title: 'Hành động',
            key: 'action',
            width: 80,
            render: (_, record) => record.status === 'Active' && (
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveClass(record.classId, record.classEntity.className)}
              />
            )
          }
        ]}
      />
    </Card>
  );
};
