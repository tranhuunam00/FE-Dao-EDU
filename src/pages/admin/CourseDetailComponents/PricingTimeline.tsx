import { Typography } from 'antd';
import dayjs from 'dayjs';
import { sortPricingNewestFirst } from '../../../utils/pricing';

const { Text } = Typography;

export interface PricingData {
  id: string;
  pricePerSession: number;
  teacherWagePerSession: number;
  taWagePerSession: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  type?: 'student' | 'teacher' | 'ta';
  isStudentPriceLocked?: boolean;
  isTeacherWageLocked?: boolean;
  isTaWageLocked?: boolean;
  isDateRangeLocked?: boolean;
  isEffectiveFromLocked?: boolean;
  isEffectiveToLocked?: boolean;
  lastStudentBillDate?: string | null;
  lastTeacherWageDate?: string | null;
  lastAssistantWageDate?: string | null;
}

export interface DisjointSegment {
  rate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  pricingId: string;
}

export const computeDisjointSegments = (
  pricing: PricingData[],
  rateField: 'pricePerSession' | 'teacherWagePerSession' | 'taWagePerSession',
): DisjointSegment[] => {
  const expectedType =
    rateField === 'pricePerSession'
      ? 'student'
      : rateField === 'teacherWagePerSession'
        ? 'teacher'
        : 'ta';
  const activePricing = pricing.filter(
    (p) =>
      (p.type ? p.type === expectedType : Number((p as any)[rateField]) > 0) &&
      Number((p as any)[rateField]) > 0,
  );
  if (activePricing.length === 0) return [];

  // Sort pricing newest first to prioritize the latest configured rules when ranges overlap
  const sortedPricing = sortPricingNewestFirst(activePricing);

  // Collect all boundary dates
  const datesSet = new Set<string>();
  for (const p of activePricing) {
    datesSet.add(p.effectiveFrom);
    if (p.effectiveTo) {
      const nextDay = dayjs(p.effectiveTo).add(1, 'day').format('YYYY-MM-DD');
      datesSet.add(nextDay);
    }
  }

  const sortedDates = Array.from(datesSet).sort();
  if (sortedDates.length === 0) return [];

  const segments: DisjointSegment[] = [];

  for (let i = 0; i < sortedDates.length; i++) {
    const start = sortedDates[i];
    const end =
      i < sortedDates.length - 1
        ? dayjs(sortedDates[i + 1]).subtract(1, 'day').format('YYYY-MM-DD')
        : null;

    // Find the highest priority pricing that covers this range
    const covering = sortedPricing.find((p) => {
      const pFrom = p.effectiveFrom;
      const pTo = p.effectiveTo;
      // Gracefully handle inverted boundaries
      if (pTo !== null && pTo < pFrom) return false;
      return pFrom <= start && (pTo === null || pTo >= start);
    });

    if (covering) {
      segments.push({
        rate: Number((covering as any)[rateField]),
        effectiveFrom: start,
        effectiveTo: end,
        pricingId: covering.id,
      });
    }
  }

  // Merge adjacent segments that have the same rate
  const mergedSegments: DisjointSegment[] = [];
  for (const seg of segments) {
    if (mergedSegments.length === 0) {
      mergedSegments.push(seg);
    } else {
      const last = mergedSegments[mergedSegments.length - 1];
      if (last.rate === seg.rate) {
        last.effectiveTo = seg.effectiveTo;
      } else {
        mergedSegments.push(seg);
      }
    }
  }

  return mergedSegments;
};

export const renderPricingTimeline = (
  pricing: PricingData[],
  type?: 'student' | 'teacher' | 'ta',
) => {
  if (!pricing || pricing.length === 0) return null;

  const timelineColors = [
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#ffffff' }, // Green
    { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', text: '#ffffff' }, // Blue
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#ffffff' }, // Amber
    { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', text: '#ffffff' }, // Violet
    { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', text: '#ffffff' }, // Pink
    { bg: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', text: '#ffffff' }, // Teal
    { bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', text: '#ffffff' }, // Orange
  ];

  const rateField =
    type === 'student'
      ? 'pricePerSession'
      : type === 'teacher'
        ? 'teacherWagePerSession'
        : 'taWagePerSession';
  const segments = computeDisjointSegments(pricing, rateField);

  if (segments.length === 0) {
    return (
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          textAlign: 'center',
          border: '1px dashed var(--card-border)',
          marginBottom: 16,
        }}
      >
        <Text type="secondary">Chưa cấu hình bảng giá khoảng thời gian này</Text>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          padding: '4px',
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Continuous horizontal segmented timeline */}
        <div
          style={{
            display: 'flex',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.15)',
            minHeight: 52,
          }}
        >
          {segments.map((seg, idx) => {
            const color = timelineColors[idx % timelineColors.length];
            const fromLabel = dayjs(seg.effectiveFrom).format('DD/MM/YYYY');
            const toLabel = seg.effectiveTo
              ? dayjs(seg.effectiveTo).format('DD/MM/YYYY')
              : 'Nay';

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: color.bg,
                  color: color.text,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRight:
                    idx < segments.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.25)'
                      : 'none',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {seg.rate.toLocaleString()}đ
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    opacity: 0.9,
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  {fromLabel} - {toLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
