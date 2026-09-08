import api from './api';

export interface SqiBreakdown {
  academic: number;
  progress: number;
  competency: number;
  attendance: number;
  homework: number;
  attitude: number;
  behavior: number;
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
  strengths: string;
  improvements: string;
  recommendations: string[];
  sessions?: Array<{
    classSessionId: string;
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
  sqiScore: number;
  sqiDelta: number;
  level: string;
  trend: 'up' | 'down' | 'stable' | 'new';
  hasSessions: boolean;
  attendanceRate: number;
  homeworkRate: number;
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
  getClassReports: async (classId: string, week?: number, year?: number): Promise<ClassWeeklyReportsResponse> => {
    const params = new URLSearchParams();
    if (week) params.append('week', String(week));
    if (year) params.append('year', String(year));
    const response = await api.get(`/weekly-reports/class/${classId}?${params.toString()}`);
    return response.data;
  },

  // 3. Giáo viên / Admin: Xem chi tiết báo cáo của 1 học sinh cụ thể
  getStudentReport: async (studentId: string, week?: number, year?: number): Promise<WeeklyReportResponse> => {
    const params = new URLSearchParams();
    if (week) params.append('week', String(week));
    if (year) params.append('year', String(year));
    const response = await api.get(`/weekly-reports/student/${studentId}?${params.toString()}`);
    return response.data;
  },
};
