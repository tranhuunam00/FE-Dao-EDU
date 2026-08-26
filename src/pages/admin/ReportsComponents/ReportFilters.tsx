import React from 'react';
import { Card, Select, DatePicker, Button, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cardStyle } from './utils';

const { Text } = Typography;

interface FiltersProps {
  startMonth: string | undefined;
  endMonth: string | undefined;
  centerId: string | undefined;
  classIds: string[] | undefined;
  classStatus: string | undefined;
  centers: { id: string; name: string }[];
  classes: { id: string; classCode: string; className: string; status: string }[];
  onMonthRangeChange: (start: string | undefined, end: string | undefined) => void;
  onCenterChange: (v: string | undefined) => void;
  onClassIdsChange: (v: string[] | undefined) => void;
  onClassStatusChange: (v: string | undefined) => void;
  onSearch: () => void;
  loading: boolean;
  showClass?: boolean;
}

const rangePresets = [
  { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: 'Năm này', value: [dayjs().startOf('year'), dayjs().endOf('year')] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: 'Năm trước', value: [dayjs().subtract(1, 'year').startOf('year'), dayjs().subtract(1, 'year').endOf('year')] as [dayjs.Dayjs, dayjs.Dayjs] },
];

export const ReportFilters: React.FC<FiltersProps> = ({
  startMonth,
  endMonth,
  centerId,
  classIds,
  classStatus,
  centers,
  classes,
  onMonthRangeChange,
  onCenterChange,
  onClassIdsChange,
  onClassStatusChange,
  onSearch,
  loading,
  showClass = true,
}) => (
  <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
    <Space size="middle" wrap align="center">
      <div>
        <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Thời gian:</Text>
        <DatePicker.RangePicker
          picker="month"
          value={startMonth && endMonth ? [dayjs(startMonth, 'YYYY-MM'), dayjs(endMonth, 'YYYY-MM')] : null}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              onMonthRangeChange(dates[0].format('YYYY-MM'), dates[1].format('YYYY-MM'));
            } else {
              onMonthRangeChange(undefined, undefined);
            }
          }}
          presets={rangePresets}
          format="MM/YYYY"
          placeholder={['Từ tháng', 'Đến tháng']}
          allowClear
          style={{ minWidth: 220 }}
        />
      </div>
      <div>
        <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Trung tâm:</Text>
        <Select
          value={centerId}
          onChange={(v) => onCenterChange(v || undefined)}
          placeholder="Tất cả"
          allowClear
          style={{ minWidth: 180 }}
          options={centers.map(c => ({ label: c.name, value: c.id }))}
        />
      </div>
      <div>
        <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Trạng thái lớp:</Text>
        <Select
          value={classStatus}
          onChange={(v) => {
            onClassStatusChange(v || undefined);
            if (!v) onClassIdsChange(undefined);
          }}
          placeholder="Tất cả"
          allowClear
          style={{ minWidth: 160 }}
          options={[
            { label: 'Lên kế hoạch', value: 'Planning' },
            { label: 'Đang hoạt động', value: 'Active' },
            { label: 'Đã hoàn thành', value: 'Completed' },
            { label: 'Đã đóng', value: 'Closed' },
          ]}
        />
      </div>
      {showClass && (
        <div>
          <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Lớp:</Text>
          <Select
            mode="multiple"
            maxTagCount="responsive"
            value={classIds && classIds.length > 0 ? classIds : undefined}
            onChange={(v) => onClassIdsChange(v && v.length > 0 ? v : undefined)}
            placeholder="Tất cả"
            allowClear
            style={{ minWidth: 240 }}
            showSearch
            optionFilterProp="label"
            options={classes
              .filter(c => !classStatus || c.status === classStatus)
              .map(c => ({ label: `${c.classCode} - ${c.className}`, value: c.id }))
            }
          />
        </div>
      )}
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={onSearch}
        loading={loading}
        size="large"
        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', padding: '0 24px' }}
      >
        Xem báo cáo
      </Button>
      {(startMonth || endMonth || centerId || classStatus || (classIds && classIds.length > 0)) && (
        <Button
          size="large"
          onClick={() => {
            onMonthRangeChange(undefined, undefined);
            onCenterChange(undefined);
            onClassStatusChange(undefined);
            onClassIdsChange(undefined);
          }}
          style={{ color: 'var(--text-secondary)' }}
        >
          Xóa bộ lọc
        </Button>
      )}
    </Space>
  </Card>
);
