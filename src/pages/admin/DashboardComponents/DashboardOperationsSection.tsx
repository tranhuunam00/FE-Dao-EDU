import React from 'react';
import { Card, Row, Col, Typography, Table, Button, Tag, Space } from 'antd';
import { ClipboardCheck, AlertTriangle } from 'lucide-react';

const { Title, Text } = Typography;

export interface OperationsData {
  tasks: {
    unassignedStudents: number;
    unlockedPastSessions: number;
    openPaymentPeriods: number;
    cancelledReceipts: number;
    paymentAnomalies: number;
  };
  atRiskStudents: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    mobile: string | null;
    level: 'high' | 'medium' | 'low';
    score: number;
    reasons: string[];
    suggestion: string;
  }>;
  classSuggestions?: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    suggestions: Array<{
      classId: string;
      classCode: string;
      className: string;
      courseName: string;
      levelName: string;
      availableSeats: number | null;
      score: number;
      reasons: string[];
    }>;
  }>;
}

interface DashboardOperationsSectionProps {
  operations: OperationsData | null;
  navigate: (path: string) => void;
}

export const DashboardOperationsSection: React.FC<DashboardOperationsSectionProps> = ({
  operations,
  navigate,
}) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
        <ClipboardCheck size={22} color="#818cf8" />
        <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>Vận hành cần chú ý</Title>
      </div>
      <Row gutter={[16, 16]} className="dashboard-operation-cards" style={{ marginBottom: 20 }}>
        {[
          ['Học sinh chưa xếp lớp', operations?.tasks.unassignedStudents || 0, '/admin/students', '#f59e0b'],
          ['Buổi học chưa chốt điểm danh', operations?.tasks.unlockedPastSessions || 0, '/admin/classes?tab=unlocked', '#ef4444'],
          ['Kỳ học phí/lương chưa chốt', operations?.tasks.openPaymentPeriods || 0, '/admin/accounting', '#6366f1'],
          ['Phiếu hủy thanh toán', operations?.tasks.cancelledReceipts || 0, '/admin/accounting?tab=anomalies', '#ec4899'],
        ].map(([label, value, path, color]) => (
          <Col xs={12} sm={12} lg={6} key={String(label)}>
            <Card className="glass-panel" hoverable onClick={() => navigate(String(path))} bodyStyle={{ padding: 16 }}>
              <Text style={{ color: 'var(--text-secondary)' }}>{label}</Text>
              <div className="dashboard-operation-value" style={{ color: String(color), marginTop: 4 }}>{Number(value)}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col span={24}>
          <Card
            className="glass-panel"
            title={<Space><AlertTriangle size={19} color="#f59e0b" /><span>Cảnh báo nguy cơ nghỉ học</span></Space>}
          >
            <Table
              rowKey="studentId"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={operations?.atRiskStudents || []}
              columns={[
                {
                  title: 'Học sinh',
                  render: (_, row) => (
                    <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/admin/students/${row.studentId}`)}>
                      {row.studentCode} - {row.studentName}
                    </Button>
                  ),
                },
                {
                  title: 'Mức độ',
                  width: 110,
                  render: (_, row) => <Tag color={row.level === 'high' ? 'red' : 'orange'}>{row.score} điểm</Tag>,
                },
                {
                  title: 'Nguyên nhân',
                  render: (_, row) => <div>{row.reasons.map((reason) => <div key={reason}>{reason}</div>)}</div>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
