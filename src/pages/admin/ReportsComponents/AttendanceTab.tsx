import React from "react";
import { Card, Row, Col, Button, Table, Typography, Tag, Spin, Statistic, Badge } from "antd";
import { FileTextOutlined, CheckCircleOutlined, WarningOutlined, PercentageOutlined, DownloadOutlined } from "@ant-design/icons";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { cardStyle } from "./utils";
import { exportToExcel } from "../../../utils/export";

const { Text } = Typography;

interface TopStudentRow {
  studentId: string;
  studentCode: string;
  fullName: string;
  presentCount: number;
  absentCount: number;
  totalSessions: number;
  attendanceRate: number;
  rank: number;
}

interface AttendanceTabProps {
  data: any;
  loading: boolean;
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: Record<number, string> = { 1: "#f59e0b", 2: "#94a3b8", 3: "#b45309" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700,
      background: colors[rank] ?? "rgba(99,102,241,0.15)",
      color: colors[rank] ? "#fff" : "var(--text-primary)",
    }}>
      {rank}
    </span>
  );
};

const topPresentColumns = [
  { title: "#", dataIndex: "rank", key: "rank", width: 40, render: (v: number) => <RankBadge rank={v} /> },
  { title: "Ma HS", dataIndex: "studentCode", key: "studentCode", width: 90 },
  { title: "Ho ten", dataIndex: "fullName", key: "fullName" },
  { title: "Buoi den", dataIndex: "presentCount", key: "presentCount", width: 80, align: "center" as const },
  { title: "Tong", dataIndex: "totalSessions", key: "totalSessions", width: 60, align: "center" as const },
  {
    title: "Ti le", dataIndex: "attendanceRate", key: "attendanceRate", width: 80, align: "center" as const,
    render: (v: number) => <Tag color={v >= 90 ? "green" : v >= 70 ? "blue" : "orange"}>{v}%</Tag>,
  },
];

const topAbsentColumns = [
  { title: "#", dataIndex: "rank", key: "rank", width: 40, render: (v: number) => <RankBadge rank={v} /> },
  { title: "Ma HS", dataIndex: "studentCode", key: "studentCode", width: 90 },
  { title: "Ho ten", dataIndex: "fullName", key: "fullName" },
  { title: "Buoi vang", dataIndex: "absentCount", key: "absentCount", width: 85, align: "center" as const },
  { title: "Tong", dataIndex: "totalSessions", key: "totalSessions", width: 60, align: "center" as const },
  {
    title: "Ti le den", dataIndex: "attendanceRate", key: "attendanceRate", width: 90, align: "center" as const,
    render: (v: number) => <Tag color={v < 50 ? "red" : v < 70 ? "orange" : "gold"}>{v}%</Tag>,
  },
];

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: "block", margin: "80px auto" }} />;
  if (!data) return <Text style={{ color: "var(--text-muted)" }}>Bam "Xem bao cao" de hien thi du lieu.</Text>;

  const { summary, byClass, byMonth, topAbsent, topPresent, topAbsentRanked } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  const hasTiePresent = (topPresent || []).filter((r: TopStudentRow) => r.rank === 1).length > 1;
  const hasTieAbsent  = (topAbsentRanked || []).filter((r: TopStudentRow) => r.rank === 1).length > 1;

  return (
    <div>
      {/* Tong quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tong luot cham" value={summary.totalSessions} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Co mat" value={summary.totalPresent} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#10b981" }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Vang mat" value={summary.totalAbsent} prefix={<WarningOutlined />} valueStyle={{ color: "#ef4444" }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Ti le chuyen can" value={summary.attendanceRate} suffix="%" prefix={<PercentageOutlined />} valueStyle={{ color: "#6366f1" }} /></Card>
        </Col>
      </Row>

      {/* Bieu do */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Xu huong chuyen can theo thang" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="rate" name="Ti le co mat" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bang theo lop + top vang cu */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card className="glass-panel" title="Chuyen can theo lop" style={cardStyle}
            extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportToExcel(byClass, "bc-diem-danh-lop.xlsx", ["Ma lop", "Ten lop", "Co mat", "Vang mat", "Ti le %"], ["classCode", "className", "presentCount", "absentCount", "rate"], "Diem danh theo lop")} style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>Xuat Excel</Button>}
          >
            <Table
              dataSource={byClass} rowKey="classId" pagination={{ pageSize: 10 }} size="small"
              columns={[
                { title: "Ma lop", dataIndex: "classCode", key: "classCode", width: 130 },
                { title: "Ten lop", dataIndex: "className", key: "className" },
                { title: "Co mat", dataIndex: "presentCount", key: "presentCount", width: 90, align: "center" },
                { title: "Vang", dataIndex: "absentCount", key: "absentCount", width: 90, align: "center" },
                { title: "Ti le", dataIndex: "rate", key: "rate", width: 90, align: "center", render: (v: number) => <Tag color={v >= 80 ? "green" : v >= 50 ? "orange" : "red"}>{v}%</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="glass-panel" title="Top hoc sinh vang nhieu" style={cardStyle}>
            <Table
              dataSource={topAbsent} rowKey="studentId" pagination={false} size="small"
              columns={[
                { title: "Ma HS", dataIndex: "studentCode", key: "studentCode", width: 110 },
                { title: "Ho ten", dataIndex: "studentName", key: "studentName" },
                { title: "Vang", dataIndex: "absentCount", key: "absentCount", width: 60, align: "center" },
                { title: "Ti le vang", dataIndex: "rate", key: "rate", width: 90, align: "center", render: (v: number) => <Tag color={v >= 30 ? "red" : "orange"}>{v}%</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* TOP 5 moi (DENSE_RANK) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            className="glass-panel"
            style={{ ...cardStyle, border: "1px solid rgba(16,185,129,0.25)" }}
            title={
              <span>
                Top di hoc nhieu nhat
                {hasTiePresent && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>Co dong hang</Tag>}
              </span>
            }
            extra={<Badge count={(topPresent || []).length} style={{ backgroundColor: "#10b981" }} />}
          >
            <Table
              dataSource={topPresent || []}
              rowKey={(r: TopStudentRow) => `${r.studentId}-${r.rank}`}
              pagination={false}
              size="small"
              columns={topPresentColumns}
              locale={{ emptyText: "Chua co du lieu" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="glass-panel"
            style={{ ...cardStyle, border: "1px solid rgba(239,68,68,0.25)" }}
            title={
              <span>
                Top di hoc it nhat
                {hasTieAbsent && <Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>Co dong hang</Tag>}
              </span>
            }
            extra={<Badge count={(topAbsentRanked || []).length} style={{ backgroundColor: "#ef4444" }} />}
          >
            <Table
              dataSource={topAbsentRanked || []}
              rowKey={(r: TopStudentRow) => `${r.studentId}-${r.rank}`}
              pagination={false}
              size="small"
              columns={topAbsentColumns}
              locale={{ emptyText: "Chua co du lieu" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
