import api from './api';

export interface EvaluationCriteria {
  homework?: 'done' | 'missing' | 'none';
  understanding?: 'quick' | 'normal' | 'slow';
  participation?: 'active' | 'normal' | 'passive';
  behavior?: 'good' | 'talkative' | 'unfocused';
}

export interface StudentSessionEvaluationItem {
  id?: string;
  classSessionId: string;
  studentId: string;
  teacherId?: string | null;
  criteria?: EvaluationCriteria;
  evaluationScore?: string | null;
  evaluationComment?: string | null;
  isAiGenerated?: boolean;
  isApprovedByTeacher?: boolean;
  teacherName?: string | null;
  updatedAt?: string;
}

export interface GenerateCommentPayload {
  studentId: string;
  studentName: string;
  className?: string;
  date?: string;
  criteria?: EvaluationCriteria;
  notes?: string;
  language?: string;
}

export interface GenerateCommentResponse {
  comment: string;
  isAiGenerated: boolean;
  cooldownSeconds: number;
}

export interface SaveEvaluationsPayload {
  evaluations: Array<{
    studentId: string;
    criteria?: EvaluationCriteria;
    evaluationScore?: string | null;
    evaluationComment?: string | null;
    isAiGenerated?: boolean;
    isApprovedByTeacher?: boolean;
  }>;
}

export const evaluationService = {
  async getSessionEvaluations(sessionId: string): Promise<StudentSessionEvaluationItem[]> {
    const res = await api.get<any>(
      `/classes/sessions/${sessionId}/evaluations`
    );
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.evaluations || []);
    return rawList.map((item: any) => ({
      id: item.id,
      classSessionId: item.classSessionId,
      studentId: item.studentId,
      teacherId: item.teacherId,
      evaluationScore: item.score ?? item.evaluationScore ?? null,
      evaluationComment: item.comment ?? item.evaluationComment ?? null,
      isAiGenerated: item.isAiGenerated ?? false,
      isApprovedByTeacher: item.isApproved ?? item.isApprovedByTeacher ?? false,
      criteria: item.criteria || {
        homework:
          item.homeworkStatus === 'not_done' || item.homeworkStatus === 'NotDone'
            ? 'missing'
            : item.homeworkStatus === 'completed' || item.homeworkStatus === 'Completed'
            ? 'done'
            : undefined,
        participation:
          item.participation === 'active' || item.participation === 'Active'
            ? 'active'
            : item.participation === 'passive' || item.participation === 'Passive'
            ? 'passive'
            : 'normal',
        understanding:
          item.understanding === 'understood' || item.understanding === 'Understood' || item.understanding === 'quick'
            ? 'quick'
            : item.understanding === 'not_understood' || item.understanding === 'NotUnderstood' || item.understanding === 'slow'
            ? 'slow'
            : 'normal',
        behavior:
          item.behaviorTags?.includes('distracted') || item.behaviorTags?.includes('Distracted')
            ? 'unfocused'
            : item.behaviorTags?.includes('talkative') || item.behaviorTags?.includes('Talkative')
            ? 'talkative'
            : 'good',
      },
      updatedAt: item.updatedAt,
    }));
  },

  async saveSessionEvaluations(
    sessionId: string,
    payload: SaveEvaluationsPayload
  ): Promise<{ success: boolean; count: number }> {
    const res = await api.post<{ success: boolean; count: number }>(
      `/classes/sessions/${sessionId}/evaluations`,
      payload
    );
    return res.data;
  },

  async generateComment(
    sessionId: string,
    payload: GenerateCommentPayload
  ): Promise<GenerateCommentResponse> {
    const res = await api.post<GenerateCommentResponse>(
      `/classes/sessions/${sessionId}/evaluations/generate-comment`,
      payload
    );
    return res.data;
  },

  async generateBatchComments(
    sessionId: string,
    students: GenerateCommentPayload[]
  ): Promise<{ results: Array<{ studentId: string; comment: string; isAiGenerated: boolean; error?: string }> }> {
    const res = await api.post(
      `/classes/sessions/${sessionId}/evaluations/generate-comment-batch`,
      { items: students }
    );
    const data: any = res.data;
    const results = Array.isArray(data) ? data : (data?.results || []);
    return { results };
  },
};

export default evaluationService;
