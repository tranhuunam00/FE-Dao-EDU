import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, DatePicker, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface AttendanceTabProps {
  studentId: string;
  studentClasses: any[];
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ studentId, studentClasses }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/students/${studentId}/sessions`);
        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching student sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) {
      fetchSessions();
    }
  }, [studentId]);

  // Filter & Format sessions
  const filteredSessions = sessions.filter((session) => {
    // 1. Only from now backwards (date <= today)
    const todayStr = dayjs().format('YYYY-MM-DD');
    if (session.date > todayStr) return false;

    // 2. Ignore Cancelled sessions
    if (session.status === 'Cancelled') return false;

    // 3. Only show:
    // - Absent: completed AND isPresent = false
    // - Unmarked: not completed / locked = false
    const isPresent = (session.attendanceLocked || session.status === 'Completed') && session.attendance?.isPresent === true;
    const isAbsent = (session.attendanceLocked || session.status === 'Completed') && session.attendance?.isPresent === false;
    const isUnmarked = !session.attendanceLocked && session.status !== 'Completed';

    if (!isPresent && !isAbsent && !isUnmarked) return false;

    // 4. Class filter
    if (selectedClassId !== 'all' && session.classId !== selectedClassId) return false;

    // 5. Date Range filter
    const [start, end] = dateRange;
    if (start && dayjs(session.date).isBefore(start, 'day')) return false;
    if (end && dayjs(session.date).isAfter(end, 'day')) return false;

    return true;
  });

  return (
    <Card
      title={
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'Outfit' }}><CalendarOutlined /> Theo dõi Chuyên cần (Từ nay trở về trước)</span>
          <Space wrap>
            <Select
              value={selectedClassId}
              onChange={setSelectedClassId}
              style={{ width: 200 }}
              placeholder="Lọc theo lớp"
            >
              <Option value="all">Tất cả lớp học</Option>
              {studentClasses.map((sc) => (
                <Option key={sc.classId} value={sc.classId}>
                  {sc.classEntity?.className} ({sc.classEntity?.classCode})
                </Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(val) => setDateRange(val || [null, null])}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>
        </div>
      }
      className="glass-panel"
      style={{ border: 'none', background: 'var(--card-bg)' }}
    >
      <Table
        dataSource={filteredSessions}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        columns={[
          {
            title: 'Ngày học',
            dataIndex: 'date',
            key: 'date',
            render: (v) => dayjs(v).format('DD/MM/YYYY'),
            sorter: (a, b) => dayjs(a.date).diff(dayjs(b.date)),
            defaultSortOrder: 'descend',
          },
          {
            title: 'Lớp học',
            dataIndex: ['classEntity', 'className'],
            key: 'className',
            render: (name, record) => (
              <div>
                <strong>{name}</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {record.classEntity?.classCode}
                </div>
              </div>
            )
          },
          {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => `${record.startTime.substring(0, 5)} - ${record.endTime.substring(0, 5)}`,
          },
          {
            title: 'Phòng học',
            dataIndex: ['room', 'name'],
            key: 'roomName',
            render: (v) => v || '-',
          },
          {
            title: 'Lý do vắng mặt / Ghi chú',
            key: 'note',
            render: (_, record) => {
              if (record.attendance?.isPresent === false) {
                return (
                  <div>
                    {record.attendance.reason && (
                      <Tag color="red">{record.attendance.reason}</Tag>
                    )}
                    {record.attendance.note && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.attendance.note}</span>
                    )}
                  </div>
                );
              }
              return '-';
            }
          },
          {
            title: 'Trạng thái Chuyên cần',
            key: 'attendanceStatus',
            render: (_, record) => {
              const isPresent = (record.attendanceLocked || record.status === 'Completed') && record.attendance?.isPresent === true;
              const isAbsent = (record.attendanceLocked || record.status === 'Completed') && record.attendance?.isPresent === false;
              if (isPresent) {
                return <Tag color="green" style={{ fontWeight: 600 }}>Có mặt</Tag>;
              }
              if (isAbsent) {
                return <Tag color="red" style={{ fontWeight: 600 }}>Vắng mặt</Tag>;
              }
              return <Tag color="warning" style={{ fontWeight: 600 }}>Chưa điểm danh</Tag>;
            }
          }
        ]}
      />
    </Card>
  );
};
