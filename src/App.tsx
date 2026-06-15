import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RouteGuard } from './router/RouteGuard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Role } from './context/AuthContext';

// Pages — Auth
import Login from './pages/auth/Login';
import Unauthorized from './pages/Unauthorized';

// Pages — Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateStudent from './pages/admin/CreateStudent';
import StudentList from './pages/admin/StudentList';
import StudentDetail from './pages/admin/StudentDetail';
import TeacherList from './pages/admin/TeacherList';
import CreateTeacher from './pages/admin/CreateTeacher';
import TeacherDetail from './pages/admin/TeacherDetail';
import CenterList from './pages/admin/CenterList';
import CreateCenter from './pages/admin/CreateCenter';
import CenterDetail from './pages/admin/CenterDetail';
import CourseList from './pages/admin/CourseList';
import CreateCourse from './pages/admin/CreateCourse';
import CourseDetail from './pages/admin/CourseDetail';
import ClassList from './pages/admin/ClassList';
import CreateClass from './pages/admin/CreateClass';
import ClassDetail from './pages/admin/ClassDetail';
import Accounting from './pages/admin/Accounting';
import AdminAssignments from './pages/admin/AdminAssignments';
import ManagedLeaveRequests from './pages/teacher/ManagedLeaveRequests';

// Pages — Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherSalaryHistory from './pages/teacher/TeacherSalaryHistory';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherAssignments from './pages/teacher/TeacherAssignments';

// Pages — Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentTuition from './pages/student/StudentTuition';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentLeaveRequests from './pages/student/StudentLeaveRequests';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import NotificationLogs from './pages/admin/NotificationLogs';
import HolidaySettings from './pages/admin/HolidaySettings';

// Placeholder component
const Placeholder = ({ title, desc }: { title: string; desc: string }) => (
  <div style={{ color: '#fff' }}>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '12px' }}>{title}</h2>
    <p style={{ color: 'var(--text-secondary)' }}>{desc}</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ===== ADMIN Routes ===== */}
          <Route
            path="/admin/*"
            element={
              <RouteGuard allowedRoles={[Role.ADMIN]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="students/create" element={<CreateStudent />} />
                    <Route path="students/:id" element={<StudentDetail />} />
                    
                    <Route path="teachers" element={<TeacherList />} />
                    <Route path="teachers/create" element={<CreateTeacher />} />
                    <Route path="teachers/:id" element={<TeacherDetail />} />
                    
                    <Route path="centers" element={<CenterList />} />
                    <Route path="centers/create" element={<CreateCenter />} />
                    <Route path="centers/:id" element={<CenterDetail />} />

                    <Route path="courses" element={<CourseList />} />
                    <Route path="courses/create" element={<CreateCourse />} />
                    <Route path="courses/:id" element={<CourseDetail />} />

                    <Route path="classes" element={<ClassList />} />
                    <Route path="classes/create" element={<CreateClass />} />
                    <Route path="classes/:id" element={<ClassDetail />} />
                    <Route path="accounting" element={<Accounting />} />
                    <Route path="assignments" element={<AdminAssignments />} />
                    <Route path="leave-requests" element={<ManagedLeaveRequests />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="logs" element={<NotificationLogs />} />
                    <Route path="holidays" element={<HolidaySettings />} />
                  </Routes>
                </DashboardLayout>
              </RouteGuard>
            }
          />

          {/* ===== TEACHER Routes ===== */}
          <Route
            path="/teacher/*"
            element={
              <RouteGuard allowedRoles={[Role.TEACHER]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<TeacherDashboard />} />
                    <Route path="salary" element={<TeacherSalaryHistory />} />
                    <Route path="students" element={<TeacherClasses />} />
                    <Route path="grades" element={<TeacherAssignments />} />
                    <Route path="leave-requests" element={<ManagedLeaveRequests />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="materials" element={
                      <Placeholder title="Tài liệu học tập" desc="Tải lên và quản lý tài liệu cho các lớp học." />
                    } />
                  </Routes>
                </DashboardLayout>
              </RouteGuard>
            }
          />

          {/* ===== STUDENT Routes ===== */}
          <Route
            path="/student/*"
            element={
              <RouteGuard allowedRoles={[Role.STUDENT]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="profile" element={<Navigate to="/student/settings?tab=profile" replace />} />
                    <Route path="schedule" element={<StudentCalendar />} />
                    <Route path="tuition" element={<StudentTuition />} />
                    <Route path="assignments" element={<StudentAssignments />} />
                    <Route path="leave-requests" element={<StudentLeaveRequests />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                  </Routes>
                </DashboardLayout>
              </RouteGuard>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
