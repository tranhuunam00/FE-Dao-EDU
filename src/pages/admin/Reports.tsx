import React, { useCallback, useEffect, useState } from 'react';
import { App, Tabs } from 'antd';
import {
  DollarOutlined, TeamOutlined, CheckCircleOutlined, FileTextOutlined,
  BookOutlined, ShoppingCartOutlined, ContactsOutlined, AuditOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

// Sub-components
import { ReportFilters } from './ReportsComponents/ReportFilters';
import { RevenueTab } from './ReportsComponents/RevenueTab';
import { SalaryTab } from './ReportsComponents/SalaryTab';
import { AttendanceTab } from './ReportsComponents/AttendanceTab';
import { AssignmentTab } from './ReportsComponents/AssignmentTab';
import { StudentsTab } from './ReportsComponents/StudentsTab';
import { ClassStudentsStatsTab } from './ReportsComponents/ClassStudentsStatsTab';
import { SaleOrdersTab } from './ReportsComponents/SaleOrdersTab';
import { ClassAttendanceTab } from './ReportsComponents/ClassAttendanceTab';
import { StudentAttendanceTab } from './ReportsComponents/StudentAttendanceTab';
import { StudentDebtsTab } from './ReportsComponents/StudentDebtsTab';

const ReportsInner: React.FC = () => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('revenue');

  // Filters
  const [startMonth, setStartMonth] = useState<string | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<string | undefined>(undefined);
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [classIds, setClassIds] = useState<string[] | undefined>(undefined);
  const [classStatus, setClassStatus] = useState<string | undefined>(undefined);
  const [centers, setCenters] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; classCode: string; className: string; status: string }[]>([]);

  // Data per tab
  const [revenueData, setRevenueData] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<any>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [studentsData, setStudentsData] = useState<any>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // New reports states
  const [classStudentsStatsData, setClassStudentsStatsData] = useState<any[] | null>(null);
  const [classStudentsStatsLoading, setClassStudentsStatsLoading] = useState(false);
  const [saleOrdersData, setSaleOrdersData] = useState<any[] | null>(null);
  const [saleOrdersLoading, setSaleOrdersLoading] = useState(false);
  const [classAttendanceData, setClassAttendanceData] = useState<any[] | null>(null);
  const [classAttendanceLoading, setClassAttendanceLoading] = useState(false);
  const [studentAttendanceData, setStudentAttendanceData] = useState<any[] | null>(null);
  const [studentAttendanceLoading, setStudentAttendanceLoading] = useState(false);
  const [studentDebtsData, setStudentDebtsData] = useState<any[] | null>(null);
  const [studentDebtsLoading, setStudentDebtsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [centersRes, classesRes] = await Promise.all([
          api.get('/centers'),
          api.get('/classes'),
        ]);
        setCenters(centersRes.data.centers || centersRes.data || []);
        setClasses(classesRes.data.classes || classesRes.data || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (startMonth) params.startMonth = startMonth;
    if (endMonth) params.endMonth = endMonth;
    if (endMonth) params.month = endMonth; // single-month fallback
    if (centerId) params.centerId = centerId;
    if (classIds && classIds.length > 0) params.classIds = classIds.join(',');
    if (classStatus) params.classStatus = classStatus;
    return { params };
  }, [startMonth, endMonth, centerId, classIds, classStatus]);

  const fetchReport = useCallback(async () => {
    const config = buildParams();
    try {
      switch (activeTab) {
        case 'revenue': {
          setRevenueLoading(true);
          const { data } = await api.get('/reports/revenue', config);
          setRevenueData(data);
          setRevenueLoading(false);
          if (data && data.byMonth && data.byMonth.length > 0 && !startMonth && !endMonth) {
            const sorted = [...data.byMonth].map((m: any) => m.month).sort();
            setStartMonth(sorted[0]);
            setEndMonth(sorted[sorted.length - 1]);
          }
          break;
        }
        case 'salary': {
          setSalaryLoading(true);
          const { data } = await api.get('/reports/salary', config);
          setSalaryData(data);
          setSalaryLoading(false);
          if (data && data.byMonth && data.byMonth.length > 0 && !startMonth && !endMonth) {
            const sorted = [...data.byMonth].map((m: any) => m.month).sort();
            setStartMonth(sorted[0]);
            setEndMonth(sorted[sorted.length - 1]);
          }
          break;
        }
        case 'attendance': {
          setAttendanceLoading(true);
          const { data } = await api.get('/reports/attendance', config);
          setAttendanceData(data);
          setAttendanceLoading(false);
          if (data && data.byMonth && data.byMonth.length > 0 && !startMonth && !endMonth) {
            const sorted = [...data.byMonth].map((m: any) => m.month).sort();
            setStartMonth(sorted[0]);
            setEndMonth(sorted[sorted.length - 1]);
          }
          break;
        }
        case 'assignments': {
          setAssignmentLoading(true);
          const { data } = await api.get('/reports/assignments', config);
          setAssignmentData(data);
          setAssignmentLoading(false);
          break;
        }
        case 'students': {
          setStudentsLoading(true);
          const { data } = await api.get('/reports/students', config);
          setStudentsData(data);
          setStudentsLoading(false);
          if (data && data.byMonth && data.byMonth.length > 0 && !startMonth && !endMonth) {
            const sorted = [...data.byMonth].map((m: any) => m.month).sort();
            setStartMonth(sorted[0]);
            setEndMonth(sorted[sorted.length - 1]);
          }
          break;
        }
        case 'class-students-stats': {
          setClassStudentsStatsLoading(true);
          const { data } = await api.get('/reports/class-students-stats', config);
          setClassStudentsStatsData(data);
          setClassStudentsStatsLoading(false);
          break;
        }
        case 'sale-orders': {
          setSaleOrdersLoading(true);
          const { data } = await api.get('/reports/sale-orders', config);
          setSaleOrdersData(data);
          setSaleOrdersLoading(false);
          break;
        }
        case 'class-attendance': {
          setClassAttendanceLoading(true);
          const { data } = await api.get('/reports/class-attendance', config);
          setClassAttendanceData(data);
          setClassAttendanceLoading(false);
          break;
        }
        case 'student-attendance': {
          setStudentAttendanceLoading(true);
          const { data } = await api.get('/reports/student-attendance', config);
          setStudentAttendanceData(data);
          setStudentAttendanceLoading(false);
          break;
        }
        case 'student-debts': {
          setStudentDebtsLoading(true);
          const { data } = await api.get('/reports/student-debts', config);
          setStudentDebtsData(data);
          setStudentDebtsLoading(false);
          break;
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo');
      setRevenueLoading(false);
      setSalaryLoading(false);
      setAttendanceLoading(false);
      setAssignmentLoading(false);
      setStudentsLoading(false);
      setClassStudentsStatsLoading(false);
      setSaleOrdersLoading(false);
      setClassAttendanceLoading(false);
      setStudentAttendanceLoading(false);
      setStudentDebtsLoading(false);
    }
  }, [activeTab, buildParams, startMonth, endMonth, message]);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const currentLoading = activeTab === 'revenue' ? revenueLoading
    : activeTab === 'salary' ? salaryLoading
    : activeTab === 'attendance' ? attendanceLoading
    : activeTab === 'assignments' ? assignmentLoading
    : activeTab === 'students' ? studentsLoading
    : activeTab === 'class-students-stats' ? classStudentsStatsLoading
    : activeTab === 'sale-orders' ? saleOrdersLoading
    : activeTab === 'class-attendance' ? classAttendanceLoading
    : activeTab === 'student-attendance' ? studentAttendanceLoading
    : studentDebtsLoading;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
        items={[
          {
            key: 'revenue',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Doanh thu</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <RevenueTab data={revenueData} loading={revenueLoading} />
              </>
            ),
          },
          {
            key: 'salary',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Chi phí lương</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading} showClass={false}
                />
                <SalaryTab data={salaryData} loading={salaryLoading} />
              </>
            ),
          },
          {
            key: 'attendance',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><CheckCircleOutlined /> Điểm danh</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <AttendanceTab data={attendanceData} loading={attendanceLoading} />
              </>
            ),
          },
          {
            key: 'assignments',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><FileTextOutlined /> Bài tập</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <AssignmentTab data={assignmentData} loading={assignmentLoading} />
              </>
            ),
          },
          {
            key: 'students',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Học viên mới</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <StudentsTab data={studentsData} loading={studentsLoading} />
              </>
            ),
          },
          {
            key: 'class-students-stats',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><BookOutlined /> Học viên theo Lớp</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading} showClass={false}
                />
                <ClassStudentsStatsTab data={classStudentsStatsData} loading={classStudentsStatsLoading} />
              </>
            ),
          },
          {
            key: 'sale-orders',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><ShoppingCartOutlined /> SALE ORDER</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <SaleOrdersTab data={saleOrdersData} loading={saleOrdersLoading} />
              </>
            ),
          },
          {
            key: 'class-attendance',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><ContactsOutlined /> Điểm danh theo lớp</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <ClassAttendanceTab data={classAttendanceData} loading={classAttendanceLoading} />
              </>
            ),
          },
          {
            key: 'student-attendance',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><AuditOutlined /> Điểm danh theo học viên</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <StudentAttendanceTab data={studentAttendanceData} loading={studentAttendanceLoading} />
              </>
            ),
          },
          {
            key: 'student-debts',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Công nợ học viên</span>,
            children: (
              <>
                <ReportFilters
                  startMonth={startMonth} endMonth={endMonth} centerId={centerId} classIds={classIds} classStatus={classStatus}
                  centers={centers} classes={classes}
                  onMonthRangeChange={(start, end) => { setStartMonth(start); setEndMonth(end); }} onCenterChange={setCenterId}
                  onClassIdsChange={setClassIds} onClassStatusChange={setClassStatus}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <StudentDebtsTab data={studentDebtsData} loading={studentDebtsLoading} />
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

const Reports: React.FC = () => (
  <App>
    <ReportsInner />
  </App>
);

export default Reports;
