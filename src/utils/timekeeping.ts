export const TIMEKEEPING_STUDENT_PREFIX = '1111';
export const TIMEKEEPING_TEACHER_PREFIX = '2222';

export function getNumericId(id: string): string {
  if (!id) return '';
  return id.replace(/\D/g, '').replace(/^0+/, '');
}

export function getStudentEmployeeNo(studentId: string): string {
  return `${TIMEKEEPING_STUDENT_PREFIX}${getNumericId(studentId)}`;
}

export function getTeacherEmployeeNo(teacherId: string): string {
  return `${TIMEKEEPING_TEACHER_PREFIX}${getNumericId(teacherId)}`;
}
