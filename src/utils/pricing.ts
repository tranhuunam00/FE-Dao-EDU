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
 * Format timestamp sang múi giờ Việt Nam (UTC+7 / GMT+7) chuẩn xác.
 * Tự động chuyển đổi UTC sang +7h và hiển thị dạng DD/MM/YYYY HH:mm.
 */
export const formatVietnamDateTime = (dateVal: string | Date | undefined | null): string => {
  if (!dateVal) return '-';
  let d: Date;
  if (typeof dateVal === 'string') {
    let s = dateVal.trim();
    // Nếu chuỗi timestamp không có offset múi giờ (từ PostgreSQL UTC mà thiếu Z), gắn thêm Z
    if (!s.endsWith('Z') && !s.includes('+') && !s.includes('T')) {
      s = s.replace(' ', 'T') + 'Z';
    } else if (!s.endsWith('Z') && !s.includes('+')) {
      s = s + 'Z';
    }
    d = new Date(s);
  } else {
    d = new Date(dateVal);
  }

  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(d)
    .replace(',', '');
};

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
  const targetDate = String(date || '').slice(0, 10);

  // 1. Lọc các record có giá trị đơn giá/lương lớn hơn 0
  const activePricing = pricingList.filter(p => Number((p as any)[rateField]) > 0);

  // 2. Tìm các record bao phủ ngày được chỉ định
  const covering = activePricing.filter(p => {
    const pFrom = String(p.effectiveFrom || '').slice(0, 10);
    const pTo = p.effectiveTo ? String(p.effectiveTo).slice(0, 10) : null;
    if (pTo !== null && pTo < pFrom) return false;
    return pFrom <= targetDate && (pTo === null || pTo >= targetDate);
  });

  if (covering.length === 0) return 0;

  // 3. Sắp xếp các record bao phủ theo thứ tự ưu tiên mới nhất và lấy record đầu tiên
  const sorted = sortPricingNewestFirst(covering);
  return Number((sorted[0] as any)[rateField]);
};

export interface RateDisplayInfo {
  rate: number;
  status: 'active' | 'upcoming' | 'past' | 'none';
  effectiveFrom?: string;
  effectiveTo?: string | null;
}

/**
 * Lấy thông tin hiển thị đơn giá/lương độc lập cho từng đối tượng (Học viên, Giáo viên, Trợ giảng).
 * Ưu tiên:
 * 1. Dải bao phủ ngày hôm nay (active)
 * 2. Dải sắp áp dụng gần nhất trong tương lai (upcoming)
 * 3. Dải đã áp dụng gần nhất trong quá khứ (past)
 * 4. Không có bản ghi nào > 0 (none)
 */
export const getRateDisplayInfo = (
  pricingList: PricingData[] | undefined,
  rateField: 'pricePerSession' | 'teacherWagePerSession' | 'taWagePerSession',
  targetDateStr?: string,
): RateDisplayInfo => {
  if (!pricingList || pricingList.length === 0) {
    return { rate: 0, status: 'none' };
  }
  const today = (targetDateStr || dayjs().format('YYYY-MM-DD')).slice(0, 10);

  // 1. Lọc các bản ghi có giá trị > 0 cho trường này
  const validPricings = pricingList.filter((p) => Number((p as any)[rateField]) > 0);
  if (validPricings.length === 0) {
    return { rate: 0, status: 'none' };
  }

  // 2. Tìm dải bao phủ ngày mục tiêu (active)
  const activeList = validPricings.filter((p) => {
    const from = String(p.effectiveFrom || '').slice(0, 10);
    const to = p.effectiveTo ? String(p.effectiveTo).slice(0, 10) : null;
    return from <= today && (to === null || to >= today);
  });

  if (activeList.length > 0) {
    const sorted = sortPricingNewestFirst(activeList);
    const best = sorted[0];
    return {
      rate: Number((best as any)[rateField]),
      status: 'active',
      effectiveFrom: best.effectiveFrom,
      effectiveTo: best.effectiveTo,
    };
  }

  // 3. Tìm dải sắp tới trong tương lai (upcoming)
  const upcomingList = validPricings
    .filter((p) => String(p.effectiveFrom || '').slice(0, 10) > today)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  if (upcomingList.length > 0) {
    const best = upcomingList[0];
    return {
      rate: Number((best as any)[rateField]),
      status: 'upcoming',
      effectiveFrom: best.effectiveFrom,
      effectiveTo: best.effectiveTo,
    };
  }

  // 4. Tìm dải trong quá khứ gần nhất (past)
  const pastList = validPricings
    .filter((p) => {
      const to = p.effectiveTo ? String(p.effectiveTo).slice(0, 10) : null;
      return to !== null && to < today;
    })
    .sort((a, b) => (b.effectiveTo || '').localeCompare(a.effectiveTo || ''));

  if (pastList.length > 0) {
    const best = pastList[0];
    return {
      rate: Number((best as any)[rateField]),
      status: 'past',
      effectiveFrom: best.effectiveFrom,
      effectiveTo: best.effectiveTo,
    };
  }

  // 5. Fallback nếu có
  const sorted = sortPricingNewestFirst(validPricings);
  const best = sorted[0];
  return {
    rate: Number((best as any)[rateField]),
    status: 'past',
    effectiveFrom: best.effectiveFrom,
    effectiveTo: best.effectiveTo,
  };
};

