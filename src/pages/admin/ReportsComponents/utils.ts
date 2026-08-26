export const compareVietnameseNames = (nameA: string, nameB: string) => {
  const getSortKey = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts.pop() || '';
    const lastName = parts.join(' ');
    return { firstName, lastName };
  };
  const a = getSortKey(nameA || '');
  const b = getSortKey(nameB || '');
  const comp = a.firstName.localeCompare(b.firstName, 'vi');
  if (comp !== 0) return comp;
  return a.lastName.localeCompare(b.lastName, 'vi');
};

export const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
export const cardStyle = { border: 'none', background: 'var(--card-bg)' };

export const fmt = (v: number) => v.toLocaleString('vi-VN');
export const fmtVND = (v: number) => `${fmt(v)} ₫`;
