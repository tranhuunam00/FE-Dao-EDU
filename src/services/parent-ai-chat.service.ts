import api from './api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: Date;
  suggestions?: string[];
  groundedSummary?: {
    sqiScore?: number;
    attendanceRate: number;
    homeworkRate: number;
    sessionCount: number;
  };
}

export interface QuickPromptItem {
  id: string;
  title: string;
  question: string;
  icon: string;
}

export interface StudentAiContext {
  studentId: string;
  studentName: string;
  className?: string;
  currentSqiScore?: number;
  sqiTrend?: 'up' | 'down' | 'stable';
  attendanceRatePercent: number;
  homeworkCompletionPercent: number;
  averageScore?: number | null;
  strengths: string[];
  weaknesses: string[];
  recentSessions: Array<{
    date: string;
    subject: string;
    isPresent: boolean;
    homeworkStatus?: string;
    teacherComment?: string | null;
  }>;
}

export const parentAiChatService = {
  async sendMessage(
    question: string,
    studentId?: string,
    history?: Array<{ role: 'user' | 'model'; text: string }>,
  ) {
    const res = await api.post<any>('/parent-ai/chat', {
      question,
      studentId,
      history,
    });
    return res.data;
  },

  async getQuickPrompts(): Promise<QuickPromptItem[]> {
    const res = await api.get<{ prompts: QuickPromptItem[] }>('/parent-ai/quick-prompts');
    return res.data.prompts || [];
  },

  async getStudentContext(studentId?: string): Promise<StudentAiContext | null> {
    const res = await api.get<{ data: StudentAiContext | null }>('/parent-ai/student-context', {
      params: studentId ? { studentId } : {},
    });
    return res.data.data;
  },
};

export default parentAiChatService;
