import React from 'react';
import { Typography, Tag } from 'antd';
import dayjs from 'dayjs';
import { type RateDisplayInfo } from '../../../utils/pricing';

const { Text } = Typography;

interface RateDisplayCellProps {
  info: RateDisplayInfo;
  color?: string;
  unitLabel?: string;
}

export const RateDisplayCell: React.FC<RateDisplayCellProps> = ({
  info,
  color = '#10b981',
  unitLabel = '/buổi',
}) => {
  if (info.status === 'none' || info.rate <= 0) {
    return <Text type="secondary" italic>Chưa cấu hình</Text>;
  }

  const fromLabel = info.effectiveFrom ? dayjs(info.effectiveFrom).format('DD/MM/YYYY') : '';
  const toLabel = info.effectiveTo ? dayjs(info.effectiveTo).format('DD/MM/YYYY') : 'Nay';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <Text strong style={{ color, fontSize: 13 }}>
          {info.rate.toLocaleString('vi-VN')} ₫
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {unitLabel}
        </Text>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {info.status === 'active' && (
          <Tag color="success" style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
            Hiện hành
          </Tag>
        )}
        {info.status === 'upcoming' && (
          <Tag color="processing" style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
            Sắp áp dụng
          </Tag>
        )}
        {info.status === 'past' && (
          <Tag color="default" style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
            Đợt trước
          </Tag>
        )}

        {fromLabel && (
          <Text type="secondary" style={{ fontSize: 10 }}>
            {info.status === 'upcoming'
              ? `Từ ${fromLabel}`
              : info.status === 'past'
              ? `Hết hạn ${toLabel}`
              : `${fromLabel} - ${toLabel}`}
          </Text>
        )}
      </div>
    </div>
  );
};
