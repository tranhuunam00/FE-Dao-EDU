import React from 'react';
import { Card, Button, Table, Typography, Tag, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cardStyle, fmtVND } from './utils';
import { exportToExcel } from '../../../utils/export';

const { Text } = Typography;

interface SaleOrdersTabProps {
  data: any[] | null;
  loading: boolean;
}

export const SaleOrdersTab: React.FC<SaleOrdersTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (data === null) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;
  if (data.length === 0) return <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy dữ liệu báo cáo phù hợp với bộ lọc.</Text>;

  const headers = [
    'ID', 'Trạng thái', 'Học sinh', 'Mã Sale Order', 'Mã Receipt',
    'Ngày đóng', 'Phương thức', 'Hạn đóng', 'Chia đợt',
    'Trạng thái Sale Order', 'Ngày nộp', 'Mã HS',
    'Sản phẩm (Lớp)', 'Tổng phải đóng', 'Thành tiền (item)',
    'Đơn giá', 'Ngày tạo', 'Đã đóng', 'Số buổi',
    'Nội dung chuyển khoản', 'Trạng thái thanh toán',
  ];
  
  const fields = [
    'billId', 'billStatus', 'fullName', 'saleOrderId', 'receiptCode',
    'receiptDate', 'paymentMethod', 'dueDate', 'splitPayments',
    'saleOrderStatus', 'submitDate', 'studentCode',
    'productItemName', 'receiptAmount', 'netAmount',
    'netPrice', 'dateCreated', 'paidAmount', 'quantity',
    'transferContent', 'paymentRequestStatus',
  ];

  return (
    <Card className="glass-panel" title="Báo cáo SALE ORDER (Hóa đơn học phí)" style={cardStyle}
      extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(data, 'bc-sale-order.xlsx', headers, fields, 'Sale Orders')} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
    >
      <Table
        dataSource={data} rowKey={(r, i) => `${r.billId}-${i}`} pagination={{ pageSize: 15 }} size="small"
        scroll={{ x: 2200 }}
        columns={[
          { title: 'Receipt ID', dataIndex: 'receiptCode', key: 'receiptCode', width: 140, render: (v) => v || <Text type="secondary">—</Text> },
          { title: 'Tháng', dataIndex: 'month', key: 'month', width: 90, align: 'center' },
          { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 100 },
          { title: 'Học sinh', dataIndex: 'fullName', key: 'fullName', width: 180 },
          { title: 'Sản phẩm (Lớp)', dataIndex: 'productItemName', key: 'productItemName', width: 250, render: (v) => v || '—' },
          { title: 'Số buổi', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
          { title: 'Đơn giá', dataIndex: 'netPrice', key: 'netPrice', width: 120, align: 'right', render: (v) => fmtVND(Number(v || 0)) },
          { title: 'Thành tiền (item)', dataIndex: 'netAmount', key: 'netAmount', width: 130, align: 'right', render: (v) => fmtVND(Number(v || 0)) },
          { title: 'Tổng phải đóng', dataIndex: 'receiptAmount', key: 'receiptAmount', width: 130, align: 'right', render: (v) => fmtVND(Number(v)) },
          { title: 'Đã đóng', dataIndex: 'paidAmount', key: 'paidAmount', width: 120, align: 'right', render: (v) => fmtVND(Number(v)) },
          { title: 'Chia đợt', dataIndex: 'splitPayments', key: 'splitPayments', width: 80, align: 'center', render: (v) => v === 'Yes' ? <Tag color="orange">Có</Tag> : <Tag>Không</Tag> },
          { title: 'Trạng thái', dataIndex: 'billStatus', key: 'billStatus', width: 120, render: (v) => <Tag color={v === 'Paid' ? 'green' : v === 'Unpaid' ? 'red' : 'orange'}>{v === 'Paid' ? 'Đã thu' : v === 'Unpaid' ? 'Chưa thu' : 'Thu một phần'}</Tag> },
          { title: 'Hình thức', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 100, align: 'center', render: (v) => v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">—</Text> },
          { title: 'Ngày đóng', dataIndex: 'receiptDate', key: 'receiptDate', width: 150, render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : <Text type="secondary">—</Text> },
          { title: 'Hạn đóng', dataIndex: 'dueDate', key: 'dueDate', width: 120, render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : <Text type="secondary">—</Text> },
          { title: 'Ngày tạo', dataIndex: 'dateCreated', key: 'dateCreated', width: 150, render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : <Text type="secondary">—</Text> },
          { title: 'Nội dung CK', dataIndex: 'transferContent', key: 'transferContent', width: 180, render: (v) => v || <Text type="secondary">—</Text> },
          { title: 'TT thanh toán', dataIndex: 'paymentRequestStatus', key: 'paymentRequestStatus', width: 130, render: (v) => v ? <Tag color={v === 'reconciled' ? 'green' : v === 'pending' ? 'gold' : v === 'processing' ? 'blue' : 'default'}>{v}</Tag> : <Text type="secondary">—</Text> },
        ]}
      />
    </Card>
  );
};
