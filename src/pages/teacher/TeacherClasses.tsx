import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import api from '../../services/api';

interface Student {
  enrollmentId: string;
  enrollmentStatus: string;
  joinedDate: string;
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nickName?: string | null;
  gender: string;
  birthdate: string;
  mobile: string;
  email?: string | null;
  avatar?: string | null;
  status: string;
}

interface TeacherClass {
  id: string;
  classCode: string;
  className: string;
  status: string;
  startDate?: string | null;
  finishDate?: string | null;
  maxSize?: number | null;
  courseName: string;
  levelName: string;
  centerName: string;
  isMainTeacher: boolean;
  studentCount: number;
  schedules: Array<{
    id: string;
    weekday: string;
    startTime: string;
    endTime: string;
    roomName: string;
  }>;
  students: Student[];
}

interface ClassesResponse {
  summary: {
    totalClasses: number;
    activeClasses: number;
    totalStudents: number;
  };
  classes: TeacherClass[];
}

const emptyData: ClassesResponse = {
  summary: { totalClasses: 0, activeClasses: 0, totalStudents: 0 },
  classes: [],
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
};

const TeacherClasses: React.FC = () => {
  const [data, setData] = useState<ClassesResponse>(emptyData);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classSearch, setClassSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/teacher/classes');
      setData(response.data);
      setSelectedClassId((current) => {
        if (current && response.data.classes.some((item: TeacherClass) => item.id === current)) {
          return current;
        }
        return response.data.classes[0]?.id || null;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách lớp phụ trách.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const keyword = classSearch.trim().toLowerCase();
    if (!keyword) return data.classes;
    return data.classes.filter((item) =>
      [item.classCode, item.className, item.courseName, item.levelName]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [classSearch, data.classes]);

  const selectedClass =
    data.classes.find((item) => item.id === selectedClassId) || filteredClasses[0] || null;

  const filteredStudents = useMemo(() => {
    const keyword = studentSearch.trim().toLowerCase();
    if (!selectedClass) return [];
    if (!keyword) return selectedClass.students;
    return selectedClass.students.filter((student) =>
      [
        student.studentId,
        student.firstName,
        student.lastName,
        student.nickName || '',
        student.mobile,
        student.email || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [selectedClass, studentSearch]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách lớp...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff' }}>Lớp và học sinh</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Theo dõi các lớp được phân công và thông tin học sinh đang theo học.
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchClasses}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {error && (
        <div
          className="glass-panel"
          style={{ padding: 20, color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
        >
          {error}
        </div>
      )}

      {!error && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              { label: 'Tổng số lớp', value: data.summary.totalClasses, icon: BookOpen, color: '#818cf8' },
              { label: 'Lớp đang hoạt động', value: data.summary.activeClasses, icon: CheckCircle2, color: '#34d399' },
              { label: 'Học sinh đang học', value: data.summary.totalStudents, icon: Users, color: '#fbbf24' },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-panel"
                style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <item.icon size={26} color={item.color} />
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.label}</div>
                  <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginTop: 3 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.classes.length === 0 ? (
            <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
              <BookOpen size={44} style={{ margin: '0 auto 14px', color: 'var(--text-muted)' }} />
              <h3 style={{ color: '#fff' }}>Chưa có lớp được phân công</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                Các lớp giáo viên chính hoặc buổi dạy được phân công sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div
              className="teacher-classes-layout"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr)',
                gap: 20,
                alignItems: 'start',
              }}
            >
              <section>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <Search
                    size={17}
                    style={{ position: 'absolute', left: 13, top: 12, color: 'var(--text-muted)' }}
                  />
                  <input
                    className="form-input"
                    value={classSearch}
                    onChange={(event) => setClassSearch(event.target.value)}
                    placeholder="Tìm lớp học"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredClasses.map((item) => {
                    const active = item.id === selectedClass?.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedClassId(item.id);
                          setStudentSearch('');
                        }}
                        className="glass-panel"
                        style={{
                          width: '100%',
                          padding: 16,
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderColor: active ? 'var(--primary)' : 'var(--card-border)',
                          background: active ? 'rgba(99, 102, 241, 0.12)' : 'var(--card-bg)',
                          color: 'inherit',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <strong style={{ color: '#fff' }}>{item.classCode}</strong>
                          <span className={item.status === 'Active' ? 'badge badge-teacher' : 'badge badge-student'}>
                            {item.status === 'Active' ? 'Đang học' : item.status}
                          </span>
                        </div>
                        <div style={{ color: '#fff', marginTop: 8 }}>{item.className}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6 }}>
                          {item.courseName} {item.levelName ? `• ${item.levelName}` : ''}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                          {item.studentCount} học sinh
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {selectedClass && (
                <section className="glass-panel" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: 22, borderBottom: '1px solid var(--card-border)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
                          {selectedClass.className}
                        </div>
                        <div style={{ color: 'var(--primary)', marginTop: 4 }}>
                          {selectedClass.classCode} · {selectedClass.courseName} {selectedClass.levelName}
                        </div>
                      </div>
                      {selectedClass.isMainTeacher && (
                        <span className="badge badge-teacher">Giáo viên chính</span>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: 12,
                        marginTop: 18,
                      }}
                    >
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <Building2 size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                        {selectedClass.centerName || 'Chưa có trung tâm'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <CalendarDays size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                        {formatDate(selectedClass.startDate)} - {formatDate(selectedClass.finishDate)}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <Users size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                        {selectedClass.studentCount}/{selectedClass.maxSize || '-'} học sinh
                      </div>
                    </div>
                    {selectedClass.schedules.length > 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
                        {selectedClass.schedules
                          .map(
                            (schedule) =>
                              `${schedule.weekday} ${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)} · ${schedule.roomName}`,
                          )
                          .join('  |  ')}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 22px 0' }}>
                    <div style={{ position: 'relative', maxWidth: 380 }}>
                      <Search
                        size={17}
                        style={{ position: 'absolute', left: 13, top: 12, color: 'var(--text-muted)' }}
                      />
                      <input
                        className="form-input"
                        value={studentSearch}
                        onChange={(event) => setStudentSearch(event.target.value)}
                        placeholder="Tìm mã, tên, email hoặc số điện thoại"
                        style={{ paddingLeft: 40 }}
                      />
                    </div>
                  </div>

                  <div className="table-container" style={{ padding: '10px 22px 22px' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Học sinh</th>
                          <th>Liên hệ</th>
                          <th>Ngày tham gia</th>
                          <th>Ghi danh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.enrollmentId}>
                            <td>
                              <div style={{ color: '#fff', fontWeight: 600 }}>
                                {student.lastName} {student.firstName}
                                {student.nickName ? ` (${student.nickName})` : ''}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                                {student.studentId} · {student.gender}
                              </div>
                            </td>
                            <td>
                              <div>{student.mobile || '-'}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                                {student.email || '-'}
                              </div>
                            </td>
                            <td>{formatDate(student.joinedDate)}</td>
                            <td>
                              <span
                                className={
                                  student.enrollmentStatus === 'Active'
                                    ? 'badge badge-teacher'
                                    : 'badge badge-student'
                                }
                              >
                                {student.enrollmentStatus === 'Active'
                                  ? 'Đang học'
                                  : student.enrollmentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                      <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Không tìm thấy học sinh phù hợp.
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherClasses;
