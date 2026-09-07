import React from 'react';
import { Card, Button, Table, Typography, Tag, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cardStyle } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface ClassStudentsStatsTabProps {
  data: any[] | null;
  loading: boolean;
}

export const ClassStudentsStatsTab: React.FC<ClassStudentsStatsTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (data === null) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;
  if (data.length === 0) return <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy dữ liệu báo cáo phù hợp với bộ lọc.</Text>;

  const handleExportExcel = () => {
    const exportData: any[] = [];
    data.forEach(cls => {
      if (cls.students && cls.students.length > 0) {
        cls.students.forEach((s: any) => {
          exportData.push({
            classCode: cls.classCode,
            className: cls.className,
            centerName: cls.centerName,
            studentCode: s.studentCode,
            studentName: s.studentName,
            mobile: s.mobile || '—',
            birthdate: s.birthdate ? dayjs(s.birthdate).format('DD/MM/YYYY') : '—',
            status: s.status === 'Active' ? 'Đang học' : 'Đã nghỉ',
            joinedDate: s.joinedDate ? dayjs(s.joinedDate).format('DD/MM/YYYY') : '—',
          });
        });
      } else {
        exportData.push({
          classCode: cls.classCode,
          className: cls.className,
          centerName: cls.centerName,
          studentCode: '—',
          studentName: '—',
          mobile: '—',
          birthdate: '—',
          status: '—',
          joinedDate: '—',
        });
      }
    });

    exportToExcel(
      exportData,
      'bc-hoc-vien-theo-lop.xlsx',
      ['Mã lớp', 'Tên lớp', 'Trung tâm', 'Mã HS', 'Họ tên', 'Số điện thoại', 'Ngày sinh', 'Trạng thái học tại lớp', 'Ngày vào lớp'],
      ['classCode', 'className', 'centerName', 'studentCode', 'studentName', 'mobile', 'birthdate', 'status', 'joinedDate'],
      'Học viên theo lớp'
    );
  };

  return (
    <Card className="glass-panel" title="Thống kê Học viên theo Lớp" style={cardStyle}
      extra={<Button icon={<DownloadOutlined />} size="small" onClick={handleExportExcel} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
    >
      <Table
        dataSource={data} rowKey="classId" pagination={{ pageSize: 15 }} size="small"
        columns={[
          { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 130 },
          { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
          { title: 'Trung tâm', dataIndex: 'centerName', key: 'centerName', width: 180 },
          { title: 'Đang học (Active)', dataIndex: 'activeCount', key: 'activeCount', width: 150, align: 'center', render: (v) => <Tag color="green">{v}</Tag> },
          { title: 'Đã nghỉ (Dropped)', dataIndex: 'droppedCount', key: 'droppedCount', width: 150, align: 'center', render: (v) => v > 0 ? <Tag color="red">{v}</Tag> : '0' },
          { title: 'Tổng sĩ số', dataIndex: 'totalCount', key: 'totalCount', width: 120, align: 'center', render: (v) => <b>{v}</b> },
        ]}
        expandable={{
          expandedRowRender: (record: any) => (
            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.01)', borderRadius: 8, border: '1px solid var(--card-border)' }}>
              <h4 style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>Danh sách học viên lớp {record.className}</h4>
              {(!record.students || record.students.length === 0) ? (
                <Text type="secondary" style={{ fontSize: 13 }}>Không có học viên nào trong lớp này theo bộ lọc.</Text>
              ) : (
                <Table
                  dataSource={record.students}
                  rowKey="studentId"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 100 },
                    { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName', width: 180 },
                    { title: 'Số điện thoại', dataIndex: 'mobile', key: 'mobile', width: 120, render: (v) => v || '—' },
                    { title: 'Ngày sinh', dataIndex: 'birthdate', key: 'birthdate', width: 110, render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
                    { title: 'Trạng thái học', dataIndex: 'status', key: 'status', width: 130, render: (v) => <Tag color={v === 'Active' ? 'green' : 'red'}>{v === 'Active' ? 'Đang học' : 'Đã nghỉ'}</Tag> },
                    { title: 'Ngày vào lớp', dataIndex: 'joinedDate', key: 'joinedDate', width: 110, render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
                  ]}
                />
              )}
            </div>
          ),
          rowExpandable: (record: any) => record.students && record.students.length > 0,
        }}
      />
    </Card>
  );
};
