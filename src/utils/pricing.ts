import dayjs from 'dayjs';

export interface PricingData {
  id: string;
  pricePerSession: number;
  teacherWagePerSession: number;
  taWagePerSession: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isStudentPriceLocked?: boolean;
  isTeacherWageLocked?: boolean;
  isTaWageLocked?: boolean;
  isDateRangeLocked?: boolean;
  lastStudentBillDate?: string | null;
  lastTeacherWageDate?: string | null;
  lastAssistantWageDate?: string | null;
}

/**
 * Sắp xếp các cấu hình giá theo thứ tự ưu tiên: thời gian tạo bản ghi mới nhất lên đầu.
 * Tiêu chí:
 * 1. Thời gian tạo bản ghi (createdAt) giảm dần (DESC)
 * 2. Thời gian cập nhật (updatedAt) giảm dần (DESC)
 * 3. ID giảm dần (DESC) để giải quyết các bản ghi có cùng thời gian
 * 4. Ngày bắt đầu áp dụng (effectiveFrom) giảm dần (DESC)
 */
export const sortPricingNewestFirst = (pricingList: PricingData[]): PricingData[] => {
  return [...pricingList].sort((a, b) => {
    const getTimestamp = (p: PricingData) => {
      if (p.createdAt) return new Date(p.createdAt).getTime();
      if (p.updatedAt) return new Date(p.updatedAt).getTime();
      return 0;
    };
    const tA = getTimestamp(a);
    const tB = getTimestamp(b);
    if (tA !== tB) return tB - tA;
    if (a.id && b.id) return b.id.localeCompare(a.id);
    return dayjs(b.effectiveFrom).diff(dayjs(a.effectiveFrom));
  });
};

/**
 * Lấy đơn giá/lương hoạt động (active rate) tại một ngày cụ thể.
 * Áp dụng giải thuật ưu tiên cấu hình mới nhất nếu có trùng khoảng thời gian.
 */
export const getActiveRate = (
  pricingList: PricingData[] | undefined,
  date: string,
  rateField: 'pricePerSession' | 'teacherWagePerSession' | 'taWagePerSession'
): number => {
  if (!pricingList || pricingList.length === 0) return 0;

  // 1. Lọc các record có giá trị đơn giá/lương lớn hơn 0
  const activePricing = pricingList.filter(p => Number((p as any)[rateField]) > 0);

  // 2. Tìm các record bao phủ ngày được chỉ định
  const covering = activePricing.filter(p => {
    const pFrom = p.effectiveFrom;
    const pTo = p.effectiveTo;
    if (pTo !== null && pTo < pFrom) return false; // bỏ qua nếu ngày kết thúc trước ngày bắt đầu
    return pFrom <= date && (pTo === null || pTo >= date);
  });

  if (covering.length === 0) return 0;

  // 3. Sắp xếp các record bao phủ theo thứ tự ưu tiên mới nhất và lấy record đầu tiên
  const sorted = sortPricingNewestFirst(covering);
  return Number((sorted[0] as any)[rateField]);
};
