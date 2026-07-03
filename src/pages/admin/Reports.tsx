/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import {
  App, Card, Tabs, Select, DatePicker, Button, Table, Statistic, Row, Col, Space, Spin, Typography, Tag,
} from 'antd';
import {
  DollarOutlined, TeamOutlined, CheckCircleOutlined, FileTextOutlined,
  DownloadOutlined, SearchOutlined, PercentageOutlined, WarningOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Text } = Typography;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const cardStyle = { border: 'none', background: 'var(--card-bg)' };

const exportCSV = (data: any[], filename: string, headers: string[], keys: string[]) => {
  const rows = [headers.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))];
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const fmt = (v: number) => v.toLocaleString('vi-VN');
const fmtVND = (v: number) => `${fmt(v)} ₫`;

// ─── Filters component ────────────────────────────────
interface FiltersProps {
  month: string | undefined;
  centerId: string | undefined;
  classId: string | undefined;
  centers: { id: string; name: string }[];
  classes: { id: string; classCode: string; className: string }[];
  onMonthChange: (v: string | undefined) => void;
  onCenterChange: (v: string | undefined) => void;
  onClassChange: (v: string | undefined) => void;
  onSearch: () => void;
  loading: boolean;
  showClass?: boolean;
}

const ReportFilters: React.FC<FiltersProps> = ({
  month, centerId, classId, centers, classes, onMonthChange, onCenterChange, onClassChange, onSearch, loading, showClass = true,
}) => (
  <Card className="glass-panel" style={{ ...cardStyle, marginBottom: 20 }}>
    <Space size="middle" wrap align="center">
      <div>
        <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Tháng:</Text>
        <DatePicker
          picker="month"
          value={month ? dayjs(month, 'YYYY-MM') : null}
          onChange={(d) => onMonthChange(d ? d.format('YYYY-MM') : undefined)}
          format="MM/YYYY"
          placeholder="Tất cả"
          allowClear
          style={{ minWidth: 140 }}
        />
      </div>
      <div>
        <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Trung tâm:</Text>
        <Select
          value={centerId}
          onChange={onCenterChange}
          placeholder="Tất cả"
          allowClear
          style={{ minWidth: 200 }}
          options={centers.map(c => ({ label: c.name, value: c.id }))}
        />
      </div>
      {showClass && (
        <div>
          <Text style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 13 }}>Lớp:</Text>
          <Select
            value={classId}
            onChange={onClassChange}
            placeholder="Tất cả"
            allowClear
            style={{ minWidth: 200 }}
            showSearch
            optionFilterProp="label"
            options={classes.map(c => ({ label: `${c.classCode} - ${c.className}`, value: c.id }))}
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
    </Space>
  </Card>
);

// ─── Revenue Tab ──────────────────────────────────────
const RevenueTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byMonth, byCenter } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tổng phát sinh" value={summary.totalExpected} formatter={(v) => fmtVND(Number(v))} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Đã thu" value={summary.totalPaid} formatter={(v) => fmtVND(Number(v))} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Còn nợ" value={summary.totalDebt} formatter={(v) => fmtVND(Number(v))} prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tỉ lệ thu" value={summary.collectionRate} suffix="%" prefix={<PercentageOutlined />} valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card className="glass-panel" title="Doanh thu theo tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <RechartsTooltip formatter={(v: any) => fmtVND(Number(v))} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="expected" name="Phát sinh" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Đã thu" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="glass-panel" title="Phân bổ theo trung tâm" style={cardStyle}>
            {byCenter && byCenter.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={byCenter} dataKey="expected" nameKey="centerName" cx="50%" cy="50%" outerRadius={100} label={({ centerName, percent }: any) => `${centerName} (${(percent * 100).toFixed(0)}%)`}>
                    {byCenter.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => fmtVND(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Text style={{ color: 'var(--text-muted)' }}>Không có dữ liệu.</Text>}
          </Card>
        </Col>
      </Row>

      {byCenter && byCenter.length > 0 && (
        <Card className="glass-panel" title="Chi tiết theo trung tâm" style={cardStyle}
          extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportCSV(byCenter, 'bc-doanh-thu-trung-tam.csv', ['Trung tâm', 'Phát sinh', 'Đã thu'], ['centerName', 'expected', 'paid'])} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất CSV</Button>}
        >
          <Table
            dataSource={byCenter} rowKey="centerId" pagination={false} size="small"
            columns={[
              { title: 'Trung tâm', dataIndex: 'centerName', key: 'centerName' },
              { title: 'Phát sinh', dataIndex: 'expected', key: 'expected', align: 'right', render: (v: number) => fmtVND(v) },
              { title: 'Đã thu', dataIndex: 'paid', key: 'paid', align: 'right', render: (v: number) => fmtVND(v) },
              { title: 'Tỉ lệ thu', key: 'rate', align: 'center', render: (_: any, r: any) => `${r.expected > 0 ? ((r.paid / r.expected) * 100).toFixed(1) : 0}%` },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Salary Tab ───────────────────────────────────────
const SalaryTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byTeacher, byMonth } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Lương GV chính" value={summary.totalMainTeacher} formatter={(v) => fmtVND(Number(v))} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Lương Trợ giảng" value={summary.totalTA} formatter={(v) => fmtVND(Number(v))} prefix={<TeamOutlined />} valueStyle={{ color: '#8b5cf6' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tổng chi" value={summary.totalExpense} formatter={(v) => fmtVND(Number(v))} prefix={<DollarOutlined />} valueStyle={{ color: '#ef4444' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Đã chi" value={summary.totalPaid} formatter={(v) => fmtVND(Number(v))} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Chưa chi" value={summary.totalUnpaid} formatter={(v) => fmtVND(Number(v))} prefix={<WarningOutlined />} valueStyle={{ color: '#f59e0b' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="So sánh lương GV chính vs Trợ giảng theo tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <RechartsTooltip formatter={(v: any) => fmtVND(Number(v))} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="mainTeacher" name="GV Chính" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ta" name="Trợ giảng" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel" title="Chi tiết lương từng giáo viên" style={cardStyle}
        extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportCSV(byTeacher, 'bc-luong-giao-vien.csv', ['Mã GV', 'Họ tên', 'Loại', 'Số buổi', 'Tổng lương', 'Đã chi', 'Trạng thái'], ['teacherCode', 'teacherName', 'type', 'sessions', 'totalAmount', 'paidAmount', 'status'])} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất CSV</Button>}
      >
        <Table
          dataSource={byTeacher} rowKey="teacherId" pagination={{ pageSize: 15 }} size="small"
          columns={[
            { title: 'Mã GV', dataIndex: 'teacherCode', key: 'teacherCode', width: 120 },
            { title: 'Họ tên', dataIndex: 'teacherName', key: 'teacherName', width: 200 },
            { title: 'Loại', dataIndex: 'type', key: 'type', width: 150, render: (v: string) => <Tag color={v === 'Teaching Assistant' ? 'purple' : 'blue'}>{v === 'Teaching Assistant' ? 'Trợ giảng' : 'Giáo viên'}</Tag> },
            { title: 'Số buổi', dataIndex: 'sessions', key: 'sessions', width: 90, align: 'center' },
            { title: 'Tổng lương', dataIndex: 'totalAmount', key: 'totalAmount', width: 160, align: 'right', render: (v: number) => fmtVND(v) },
            { title: 'Đã chi', dataIndex: 'paidAmount', key: 'paidAmount', width: 160, align: 'right', render: (v: number) => fmtVND(v) },
            { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (v: string) => <Tag color={v === 'Paid' ? 'green' : 'orange'}>{v === 'Paid' ? 'Đã chi' : 'Chưa chi'}</Tag> },
          ]}
        />
      </Card>
    </div>
  );
};

// ─── Attendance Tab ───────────────────────────────────
const AttendanceTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byClass, byMonth, topAbsent } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tổng lượt chấm" value={summary.totalSessions} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Có mặt" value={summary.totalPresent} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Vắng mặt" value={summary.totalAbsent} prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tỉ lệ chuyên cần" value={summary.attendanceRate} suffix="%" prefix={<PercentageOutlined />} valueStyle={{ color: '#6366f1' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Xu hướng chuyên cần theo tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="rate" name="Tỉ lệ có mặt" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card className="glass-panel" title="Chuyên cần theo lớp" style={cardStyle}
            extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportCSV(byClass, 'bc-diem-danh-lop.csv', ['Mã lớp', 'Tên lớp', 'Có mặt', 'Vắng', 'Tỉ lệ %'], ['classCode', 'className', 'presentCount', 'absentCount', 'rate'])} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>CSV</Button>}
          >
            <Table
              dataSource={byClass} rowKey="classId" pagination={{ pageSize: 10 }} size="small"
              columns={[
                { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 130 },
                { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
                { title: 'Có mặt', dataIndex: 'presentCount', key: 'presentCount', width: 90, align: 'center' },
                { title: 'Vắng', dataIndex: 'absentCount', key: 'absentCount', width: 90, align: 'center' },
                { title: 'Tỉ lệ', dataIndex: 'rate', key: 'rate', width: 90, align: 'center', render: (v: number) => <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}%</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="glass-panel" title="Top học sinh vắng nhiều" style={cardStyle}>
            <Table
              dataSource={topAbsent} rowKey="studentId" pagination={false} size="small"
              columns={[
                { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 110 },
                { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName' },
                { title: 'Vắng', dataIndex: 'absentCount', key: 'absentCount', width: 60, align: 'center' },
                { title: 'Tỉ lệ vắng', dataIndex: 'rate', key: 'rate', width: 90, align: 'center', render: (v: number) => <Tag color={v >= 30 ? 'red' : 'orange'}>{v}%</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ─── Assignment Tab ───────────────────────────────────
const AssignmentTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byClass } = data;

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Tổng bài giao" value={summary.totalAssigned} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Đã nộp" value={summary.totalSubmitted} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Đã chấm" value={summary.totalGraded} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#6366f1' }} /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Chưa nộp" value={summary.totalMissing} prefix={<WarningOutlined />} valueStyle={{ color: '#ef4444' }} /></Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="glass-panel" style={cardStyle}><Statistic title="Điểm TB" value={summary.averageScore} precision={1} prefix={<PercentageOutlined />} valueStyle={{ color: '#f59e0b' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Tỉ lệ hoàn thành bài tập theo lớp" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byClass} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis type="category" dataKey="classCode" width={120} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="submitted" name="Đã nộp" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="missing" name="Chưa nộp" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel" title="Chi tiết bài tập theo lớp" style={cardStyle}
        extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportCSV(byClass, 'bc-bai-tap.csv', ['Mã lớp', 'Tên lớp', 'Tổng giao', 'Đã nộp', 'Đã chấm', 'Chưa nộp', 'Điểm TB'], ['classCode', 'className', 'assigned', 'submitted', 'graded', 'missing', 'averageScore'])} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất CSV</Button>}
      >
        <Table
          dataSource={byClass} rowKey="classId" pagination={{ pageSize: 15 }} size="small"
          columns={[
            { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 130 },
            { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
            { title: 'Tổng giao', dataIndex: 'assigned', key: 'assigned', width: 90, align: 'center' },
            { title: 'Đã nộp', dataIndex: 'submitted', key: 'submitted', width: 90, align: 'center' },
            { title: 'Đã chấm', dataIndex: 'graded', key: 'graded', width: 90, align: 'center' },
            { title: 'Chưa nộp', dataIndex: 'missing', key: 'missing', width: 90, align: 'center', render: (v: number) => <span style={{ color: v > 0 ? '#ef4444' : '#10b981' }}>{v}</span> },
            { title: 'Điểm TB', dataIndex: 'averageScore', key: 'averageScore', width: 90, align: 'center', render: (v: number) => v > 0 ? v.toFixed(1) : '-' },
          ]}
        />
      </Card>
    </div>
  );
};

// ─── Students Tab ───────────────────────────────────
const StudentsTab: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;

  const { summary, byMonth, newList } = data;
  const chartMonths = [...(byMonth || [])].reverse();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Tổng số học sinh" value={summary.totalStudents} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Học sinh đang học (Active)" value={summary.activeStudents} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={cardStyle}>
            <Statistic title="Học sinh mới trong tháng" value={summary.newStudentsThisMonth} prefix={<TeamOutlined />} valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card className="glass-panel" title="Biểu đồ số lượng học sinh mới đăng ký qua các tháng" style={cardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <RechartsTooltip formatter={(v: any) => [`${v} học sinh`, 'Đăng ký mới']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="count" name="Học sinh mới" stroke="#6366f1" fill="rgba(99,102,241,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel" title="Danh sách học sinh mới đăng ký" style={cardStyle}
        extra={<Button icon={<DownloadOutlined />} size="small" onClick={() => exportCSV(newList, 'hoc-sinh-moi.csv', ['Mã HS', 'Họ tên', 'SĐT', 'Trạng thái', 'Ngày đăng ký'], ['studentCode', 'studentName', 'mobile', 'status', 'createdAt'])} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất CSV</Button>}
      >
        <Table
          dataSource={newList} rowKey="studentId" pagination={{ pageSize: 10 }} size="small"
          columns={[
            { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 130 },
            { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName' },
            { title: 'Số điện thoại', dataIndex: 'mobile', key: 'mobile', width: 150 },
            { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 180, render: (v: string) => <Tag color={v === 'Active' ? 'green' : 'orange'}>{v}</Tag> },
            { title: 'Ngày đăng ký', dataIndex: 'createdAt', key: 'createdAt', width: 180, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
          ]}
        />
      </Card>
    </div>
  );
};

// ─── Main Reports Page ────────────────────────────────
const ReportsInner: React.FC = () => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('revenue');

  // Filters
  const [month, setMonth] = useState<string | undefined>(undefined);
  const [centerId, setCenterId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [centers, setCenters] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; classCode: string; className: string }[]>([]);

  // Data per tab
  const [revenueData, setRevenueData] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<any>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [studentsData, setStudentsData] = useState<any>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [centersRes, classesRes] = await Promise.all([
          api.get('/centers'),
          api.get('/classes'),
        ]);
        setCenters(centersRes.data.centers || centersRes.data || []);
        setClasses(classesRes.data.classes || classesRes.data || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (month) params.month = month;
    if (centerId) params.centerId = centerId;
    if (classId) params.classId = classId;
    return { params };
  }, [month, centerId, classId]);

  const fetchReport = useCallback(async () => {
    const config = buildParams();
    try {
      switch (activeTab) {
        case 'revenue': {
          setRevenueLoading(true);
          const { data } = await api.get('/reports/revenue', config);
          setRevenueData(data);
          setRevenueLoading(false);
          break;
        }
        case 'salary': {
          setSalaryLoading(true);
          const { data } = await api.get('/reports/salary', config);
          setSalaryData(data);
          setSalaryLoading(false);
          break;
        }
        case 'attendance': {
          setAttendanceLoading(true);
          const { data } = await api.get('/reports/attendance', config);
          setAttendanceData(data);
          setAttendanceLoading(false);
          break;
        }
        case 'assignments': {
          setAssignmentLoading(true);
          const { data } = await api.get('/reports/assignments', config);
          setAssignmentData(data);
          setAssignmentLoading(false);
          break;
        }
        case 'students': {
          setStudentsLoading(true);
          const { data } = await api.get('/reports/students', config);
          setStudentsData(data);
          setStudentsLoading(false);
          break;
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải báo cáo');
      setRevenueLoading(false);
      setSalaryLoading(false);
      setAttendanceLoading(false);
      setAssignmentLoading(false);
      setStudentsLoading(false);
    }
  }, [activeTab, buildParams, message]);

  const currentLoading = activeTab === 'revenue' ? revenueLoading
    : activeTab === 'salary' ? salaryLoading
    : activeTab === 'attendance' ? attendanceLoading
    : activeTab === 'assignments' ? assignmentLoading
    : studentsLoading;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
        items={[
          {
            key: 'revenue',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><DollarOutlined /> Doanh thu</span>,
            children: (
              <>
                <ReportFilters
                  month={month} centerId={centerId} classId={classId}
                  centers={centers} classes={classes}
                  onMonthChange={setMonth} onCenterChange={setCenterId} onClassChange={setClassId}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <RevenueTab data={revenueData} loading={revenueLoading} />
              </>
            ),
          },
          {
            key: 'salary',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Chi phí lương</span>,
            children: (
              <>
                <ReportFilters
                  month={month} centerId={centerId} classId={classId}
                  centers={centers} classes={classes}
                  onMonthChange={setMonth} onCenterChange={setCenterId} onClassChange={setClassId}
                  onSearch={fetchReport} loading={currentLoading} showClass={false}
                />
                <SalaryTab data={salaryData} loading={salaryLoading} />
              </>
            ),
          },
          {
            key: 'attendance',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><CheckCircleOutlined /> Điểm danh</span>,
            children: (
              <>
                <ReportFilters
                  month={month} centerId={centerId} classId={classId}
                  centers={centers} classes={classes}
                  onMonthChange={setMonth} onCenterChange={setCenterId} onClassChange={setClassId}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <AttendanceTab data={attendanceData} loading={attendanceLoading} />
              </>
            ),
          },
          {
            key: 'assignments',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><FileTextOutlined /> Bài tập</span>,
            children: (
              <>
                <ReportFilters
                  month={month} centerId={centerId} classId={classId}
                  centers={centers} classes={classes}
                  onMonthChange={setMonth} onCenterChange={setCenterId} onClassChange={setClassId}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <AssignmentTab data={assignmentData} loading={assignmentLoading} />
              </>
            ),
          },
          {
            key: 'students',
            label: <span style={{ fontSize: '1rem', fontWeight: 500 }}><TeamOutlined /> Học viên mới</span>,
            children: (
              <>
                <ReportFilters
                  month={month} centerId={centerId} classId={classId}
                  centers={centers} classes={classes}
                  onMonthChange={setMonth} onCenterChange={setCenterId} onClassChange={setClassId}
                  onSearch={fetchReport} loading={currentLoading}
                />
                <StudentsTab data={studentsData} loading={studentsLoading} />
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

const Reports: React.FC = () => (
  <App>
    <ReportsInner />
  </App>
);

export default Reports;
