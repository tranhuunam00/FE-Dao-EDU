import React from 'react';
import { Table, Typography, Button, Space, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatVietnamDateTime } from '../../../utils/pricing';
import type { PricingData } from './PricingTimeline';
import type { EditMode } from './EditPricingModal';

const { Text } = Typography;

interface PricingHistoryTableProps {
  dataSource: PricingData[];
  mode: EditMode;
  rateField: 'pricePerSession' | 'teacherWagePerSession' | 'taWagePerSession';
  rateLabel: string;
  rateColor: string;
  lockField: 'isStudentPriceLocked' | 'isTeacherWageLocked' | 'isTaWageLocked';
  lastBillDate: string | null;
  billTooltip: string;
  onEdit: (record: PricingData) => void;
  onDelete: (id: string) => void;
}

export const PricingHistoryTable: React.FC<PricingHistoryTableProps> = ({
  dataSource,
  rateField,
  rateLabel,
  rateColor,
  lockField,
  lastBillDate,
  billTooltip,
  onEdit,
  onDelete,
}) => {
  return (
    <Table
      dataSource={dataSource}
      rowKey="id"
      pagination={false}
      size="small"
      columns={[
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 110,
          render: (id: string) => (
            <Tooltip title={id}>
              <Text copyable={{ text: id }} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>
                {id ? (id.length > 8 ? `${id.slice(0, 8)}...` : id) : '-'}
              </Text>
            </Tooltip>
          ),
        },
        {
          title: rateLabel,
          dataIndex: rateField,
          render: (v: number, record: PricingData) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ color: rateColor }}>{Number(v).toLocaleString()}đ</Text>
              {record[lockField] && (
                <Text type="secondary" title="Đã có dữ liệu chốt thanh toán, không thể thay đổi">🔒</Text>
              )}
            </div>
          ),
        },
        {
          title: 'Hiệu lực',
          key: 'range',
          render: (_: any, record: PricingData) => (
            <Text style={{ fontSize: '12px' }}>
              {dayjs(record.effectiveFrom).format('DD/MM/YYYY')} - {record.effectiveTo ? dayjs(record.effectiveTo).format('DD/MM/YYYY') : 'Nay'}
            </Text>
          ),
        },
        {
          title: 'Thời gian tạo',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 140,
          render: (v: string) => (
            <Text style={{ fontSize: '12px', color: '#94a3b8' }}>
              {formatVietnamDateTime(v)}
            </Text>
          ),
        },
        {
          title: 'Thao tác',
          key: 'action',
          align: 'right',
          render: (_: any, record: PricingData) => {
            const isLocked = Boolean(record[lockField] || (lastBillDate && record.effectiveFrom <= lastBillDate));
            return (
              <Space size="small">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                >
                  Sửa
                </Button>
                {isLocked ? (
                  <Tooltip title={billTooltip}>
                    <span>
                      <Button size="small" danger icon={<DeleteOutlined />} disabled>
                        Xóa
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Popconfirm
                    title="Xóa bản ghi đơn giá này?"
                    description="Bạn có chắc chắn muốn xóa bản ghi đơn giá này không?"
                    onConfirm={() => onDelete(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            );
          },
        },
      ]}
    />
  );
};
