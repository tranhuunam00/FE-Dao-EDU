import api from './api';

export interface SqiBreakdown {
  attendance: number | null;
  homework: number | null;
  behavior: number | null;
  participation: number | null;
  academic?: number | null;
  progress?: number | null;
  competency?: number | null;
  attitude?: number | null;
}

export interface SubjectPerformance {
  subjectName: string;
  score: number;
  trend: 'up' | 'down' | 'stable' | 'new';
  isEstimated?: boolean;
}

export interface WeeklyReportData {
  id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  sqiScore: number;
  sqiDelta: number;
  sqiBreakdown: SqiBreakdown;
  subjectPerformances: SubjectPerformance[];
  overview: string;
  commendation?: string | null;
  suggestion?: string | null;
  strengths: string;
  improvements: string;
  recommendations: string[];
  sessions?: Array<{
    classSessionId: string;
    className?: string;
    subjectName: string;
    date?: string;
    isPresent: boolean;
    isLate?: boolean;
    homeworkStatus?: string;
    participation?: string;
    understanding?: string;
    behaviorTags?: string[];
    score?: string | null;
    teacherComment?: string | null;
  }>;
  isApproved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  sentToZaloAt?: string | null;
}

export interface WeeklyReportResponse {
  success: boolean;
  data: WeeklyReportData | null;
  hasSessions: boolean;
  message?: string;
}

export interface StudentWeeklySummary {
  studentId: string;
  studentName: string;
  studentCode: string;
  sqiScore: number | null;
  sqiDelta: number | null;
  level: string | null;
  trend: 'up' | 'down' | 'stable' | 'new';
  hasSessions: boolean;
  attendanceRate: number | null;
  homeworkRate: number | null;
  isApproved?: boolean;
  sentToZaloAt?: string | null;
}

export interface ClassWeeklyReportsResponse {
  success: boolean;
  data: {
    classId: string;
    className: string;
    weekNumber: number;
    year: number;
    startDate: string;
    endDate: string;
    averageSqi: number;
    totalStudents: number;
    levelDistribution: {
      level5: number;
      level4: number;
      level3: number;
      level2: number;
      level1: number;
    };
    students: StudentWeeklySummary[];
  };
}

export const weeklyReportService = {
  // 1. Phụ huynh / Học sinh: Tự động lấy báo cáo tuần của con
  getMyReport: async (week?: number, year?: number): Promise<WeeklyReportResponse> => {
    const params = new URLSearchParams();
    if (week) params.append('week', String(week));
    if (year) params.append('year', String(year));
    const response = await api.get(`/weekly-reports/my-report?${params.toString()}`);
    return response.data;
  },

  // 2. Giáo viên / Admin: Xem tổng hợp SQI của cả lớp học
  getClassReports: async (classId: string, week?: number, year?: number, month?: number): Promise<ClassWeeklyReportsResponse> => {
    const params = new URLSearchParams();
    if (week) params.append('week', String(week));
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const response = await api.get(`/weekly-reports/class/${classId}?${params.toString()}`);
    return response.data;
  },

  // 3. Giáo viên / Admin: Xem chi tiết báo cáo tuần của 1 học sinh cụ thể
  getStudentReport: async (studentId: string, week?: number, year?: number): Promise<WeeklyReportResponse> => {
    const params = new URLSearchParams();
    if (week) params.append('week', String(week));
    if (year) params.append('year', String(year));
    const response = await api.get(`/weekly-reports/student/${studentId}?${params.toString()}`);
    return response.data;
  },

  // 4. Giáo viên / Admin: Xem chi tiết báo cáo tháng của 1 học sinh
  getStudentMonthlyReport: async (studentId: string, month: number, year: number): Promise<WeeklyReportResponse> => {
    const params = new URLSearchParams();
    params.append('month', String(month));
    params.append('year', String(year));
    const response = await api.get(`/weekly-reports/student/${studentId}/monthly?${params.toString()}`);
    return response.data;
  },

  // 5. Phụ huynh / Học sinh: Tự động lấy báo cáo tháng của con
  getMyMonthlyReport: async (month: number, year: number): Promise<WeeklyReportResponse> => {
    const params = new URLSearchParams();
    params.append('month', String(month));
    params.append('year', String(year));
    const response = await api.get(`/weekly-reports/my-report/monthly?${params.toString()}`);
    return response.data;
  },

  // 6. Giáo viên / Admin: Phê duyệt / Hủy duyệt báo cáo học sinh
  toggleReportApproval: async (
    studentId: string,
    payload: {
      reportType: 'week' | 'month';
      periodNumber: number;
      year: number;
      isApproved: boolean;
      commendation?: string | null;
      suggestion?: string | null;
    },
  ): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await api.post(`/weekly-reports/student/${studentId}/toggle-approval`, payload);
    return response.data;
  },

  // 7. Giáo viên / Admin: Sinh nhận xét sư phạm bằng Gemini AI
  generatePedagogy: async (
    studentId: string,
    payload: {
      studentName?: string;
      reportType: 'week' | 'month';
      periodNumber: number;
      year: number;
      sqiScore?: number;
      strengths?: string;
      improvements?: string;
    },
  ): Promise<{ success: boolean; data: any }> => {
    const response = await api.post(`/weekly-reports/student/${studentId}/generate-pedagogy`, payload);
    return response.data;
  },

  // 8. Giáo viên / Admin: Đánh dấu / Hủy đã gửi báo cáo cho phụ huynh
  toggleZaloSent: async (
    studentId: string,
    payload: {
      reportType: 'week' | 'month';
      periodNumber: number;
      year: number;
      isSent: boolean;
    },
  ): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await api.post(`/weekly-reports/student/${studentId}/toggle-zalo-sent`, payload);
    return response.data;
  },

  // 9. Phụ huynh: Xem báo cáo công khai qua liên kết chia sẻ hoặc quét mã QR
  getPublicReport: async (
    studentId: string,
    params?: { type?: 'week' | 'month'; week?: number; month?: number; year?: number },
  ): Promise<WeeklyReportResponse> => {
    const response = await api.get(`/public/weekly-reports/student/${studentId}`, { params });
    return response.data;
  },
};

export default weeklyReportService;

