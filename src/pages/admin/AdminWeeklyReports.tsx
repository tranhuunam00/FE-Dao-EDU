import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Select, Row, Col, Typography, Button, Modal, Spin, Empty, Segmented, Checkbox, message, Space } from 'antd';
import { TrendingUp, TrendingDown, Minus, Eye, Share2, Download } from 'lucide-react';
import api from '../../services/api';
import { weeklyReportService } from '../../services/weekly-report.service';
import type { StudentWeeklySummary, WeeklyReportData } from '../../services/weekly-report.service';
import { WeeklyReportCard } from '../../components/WeeklyReportCard';
import { LevelDistributionBar } from '../teacher/components/LevelDistributionBar';
import { exportToExcel } from '../../utils/export';

const { Title, Text } = Typography;

export const AdminWeeklyReports: React.FC = () => {
  const [centers, setCenters] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string | undefined>(undefined);
  const [classes, setClasses] = useState<Array<{ id: string; className: string; classCode: string; centerId?: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const getCurrentWeek = () => {
    const now = new Date();
    const target = new Date(now.valueOf());
    const dayNr = (now.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  const currentYear = new Date().getFullYear();
  const [periodMode, setPeriodMode] = useState<'month' | 'week'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedWeek, setSelectedWeek] = useState<number>(getCurrentWeek());

  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<any>(null);

  // Modal xem chi tiết thiệp báo cáo
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalReport, setModalReport] = useState<WeeklyReportData | null>(null);

  // 1. Tải danh sách Trung tâm & Lớp học
  useEffect(() => {
    Promise.all([api.get('/centers'), api.get('/classes')])
      .then(([centerRes, classRes]) => {
        const centerList = Array.isArray(centerRes.data) ? centerRes.data : centerRes.data.centers || [];
        setCenters(centerList);
        const classList = Array.isArray(classRes.data) ? classRes.data : classRes.data.classes || [];
        setClasses(classList);
        if (classList.length > 0) setSelectedClassId(classList[0].id);
      })
      .catch((err) => console.error('Lỗi lấy danh sách trung tâm/lớp:', err));
  }, []);

  const filteredClasses = selectedCenterId
    ? classes.filter((c) => c.centerId === selectedCenterId)
    : classes;

  // 2. Tải tổng hợp báo cáo tuần / tháng của lớp
  const loadClassReports = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const res = periodMode === 'month'
        ? await weeklyReportService.getClassReports(selectedClassId, undefined, selectedYear, selectedMonth)
        : await weeklyReportService.getClassReports(selectedClassId, selectedWeek, selectedYear);
      setClassData(res.success && res.data ? res.data : null);
    } catch (err) {
      console.error('Lỗi lấy báo cáo SQI của lớp:', err);
      setClassData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedWeek, selectedYear, periodMode, selectedMonth]);

  useEffect(() => {
    loadClassReports();
  }, [loadClassReports]);

  // 3. Mở xem chi tiết thiệp báo cáo của 1 học sinh
  const handleViewStudentReport = async (studentId: string) => {
    setModalVisible(true);
    setModalLoading(true);
    try {
      const res = periodMode === 'month'
        ? await weeklyReportService.getStudentMonthlyReport(studentId, selectedMonth, selectedYear)
        : await weeklyReportService.getStudentReport(studentId, selectedWeek, selectedYear);
      setModalReport(res.success && res.data ? res.data : null);
    } catch (err) {
      console.error('Lỗi tải báo cáo chi tiết:', err);
      setModalReport(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleZaloSent = async (studentId: string, isSent: boolean) => {
    setClassData((prev: any) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map((s: StudentWeeklySummary) =>
          s.studentId === studentId ? { ...s, sentToZaloAt: isSent ? new Date().toISOString() : null } : s
        ),
      };
    });

    try {
      const periodNumber = periodMode === 'month' ? selectedMonth : selectedWeek;
      await weeklyReportService.toggleZaloSent(studentId, {
        reportType: periodMode,
        periodNumber,
        year: selectedYear,
        isSent,
      });
      message.success(isSent ? 'Đã đánh dấu đã gửi phụ huynh' : 'Đã bỏ đánh dấu gửi phụ huynh');
    } catch (err) {
      console.error('Lỗi cập nhật gửi PH:', err);
      message.error('Không thể cập nhật trạng thái gửi phụ huynh');
      loadClassReports();
    }
  };

  const weekOptions = Array.from({ length: 52 }, (_, i) => {
    const w = 52 - i;
    return { value: w, label: `Tuần ${w} / ${selectedYear}` };
  });

  const getLevelTag = (level?: string | null) => {
    if (!level) return <Tag style={{ color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Chưa có dữ liệu</Tag>;
    if (level.includes('Level 5') || level.includes('Mức 5')) return <Tag color="emerald" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>Mức 5 - Xuất sắc</Tag>;
    if (level.includes('Level 4') || level.includes('Mức 4')) return <Tag color="blue" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Mức 4 - Giỏi</Tag>;
    if (level.includes('Level 3') || level.includes('Mức 3')) return <Tag color="gold" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>Mức 3 - Khá</Tag>;
    if (level.includes('Level 2') || level.includes('Mức 2')) return <Tag color="orange" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>Mức 2 - Trung bình</Tag>;
    return <Tag color="red" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Mức 1 - Cần cố gắng</Tag>;
  };

  const handleExportSqiReport = () => {
    if (!classData || !classData.students || classData.students.length === 0) {
      message.warning('Chưa có dữ liệu học sinh để xuất.');
      return;
    }
    const currentClass = classes.find((c) => c.id === selectedClassId);
    const className = currentClass ? currentClass.className : 'Lop';
    const periodLabel = periodMode === 'month' ? `Thang_${selectedMonth}_${selectedYear}` : `Tuan_${selectedWeek}_${selectedYear}`;

    const baseOrigin = (import.meta as any).env?.VITE_PUBLIC_URL || (import.meta as any).env?.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const cleanOrigin = baseOrigin.replace(/\/+$/, '');
    const periodNumber = periodMode === 'month' ? selectedMonth : selectedWeek;

    const exportData = classData.students.map((s: StudentWeeklySummary, idx: number) => {
      const publicLink = `${cleanOrigin}/public/reports/${s.studentId}?type=${periodMode}&${periodMode === 'month' ? `month=${periodNumber}` : `week=${periodNumber}`}&year=${selectedYear}`;
      return {
        stt: idx + 1,
        studentCode: s.studentCode || '',
        studentName: s.studentName,
        sqiScore: s.sqiScore !== null && s.sqiScore !== undefined ? s.sqiScore : '—',
        level: s.level || 'Chưa xếp loại',
        attendanceRate: s.attendanceRate !== null && s.attendanceRate !== undefined ? `${s.attendanceRate}%` : '—',
        homeworkRate: s.homeworkRate !== null && s.homeworkRate !== undefined ? `${s.homeworkRate}%` : '—',
        isApproved: s.isApproved ? 'Đã duyệt' : 'Bản nháp',
        isSent: s.sentToZaloAt ? 'Đã gửi' : 'Chưa gửi',
        qrLink: publicLink,
      };
    });

    exportToExcel(
      exportData,
      `Bao_cao_SQI_${className.replace(/\s+/g, '_')}_${periodLabel}`,
      ['STT', 'Mã HS', 'Họ và tên học sinh', 'Điểm SQI', 'Xếp loại', 'Chuyên cần', 'Bài tập', 'Duyệt', 'Gửi PH', 'Link xem & QR Online'],
      ['stt', 'studentCode', 'studentName', 'sqiScore', 'level', 'attendanceRate', 'homeworkRate', 'isApproved', 'isSent', 'qrLink'],
      `Báo cáo SQI ${className}`
    );
  };

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--text-primary, #111827)' }}>
            Quản Trị Báo Cáo Tuần & Chất Lượng SQI
          </Title>
          <Text style={{ fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>
            Giám sát chất lượng học tập, chỉ số SQI và phân bổ học sinh theo tuần toàn hệ thống
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {centers.length > 0 && (
            <Select
              allowClear
              placeholder="Tất cả cơ sở"
              value={selectedCenterId}
              onChange={(cid) => {
                setSelectedCenterId(cid);
                const first = classes.find((c) => !cid || c.centerId === cid);
                if (first) setSelectedClassId(first.id);
              }}
              style={{ width: 170 }}
              options={centers.map((c) => ({ value: c.id, label: c.name }))}
            />
          )}
          <Select
            placeholder="Chọn lớp học"
            value={selectedClassId}
            onChange={(c) => setSelectedClassId(c)}
            style={{ width: 220 }}
            options={filteredClasses.map((c) => ({ value: c.id, label: `${c.className} (${c.classCode})` }))}
          />
          <Segmented
            value={periodMode}
            onChange={(v) => setPeriodMode(v as 'month' | 'week')}
            options={[{ label: 'Theo Tháng', value: 'month' }, { label: 'Theo Tuần', value: 'week' }]}
          />
          {periodMode === 'month' ? (
            <Select
              value={selectedMonth}
              onChange={(m) => setSelectedMonth(m)}
              style={{ width: 120 }}
              options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${String(i + 1).padStart(2, '0')}` }))}
            />
          ) : (
            <Select value={selectedWeek} onChange={(w) => setSelectedWeek(w)} style={{ width: 150 }} options={weekOptions} />
          )}
          <Select
            value={selectedYear}
            onChange={(y) => setSelectedYear(y)}
            style={{ width: 90 }}
            options={[{ value: 2025, label: '2025' }, { value: 2026, label: '2026' }, { value: 2027, label: '2027' }]}
          />
          <Button
            type="primary"
            icon={<Download size={14} />}
            onClick={handleExportSqiReport}
            style={{ background: '#4f46e5', borderColor: '#4338ca' }}
          >
            Xuất Excel & Link QR
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      {classData && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <Card className="glass-panel" style={{ borderRadius: 12, textAlign: 'center' }}>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)' }}>SQI Trung Bình Lớp</Text>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
                {classData.averageSqi}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}> / 100</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="glass-panel" style={{ borderRadius: 12, textAlign: 'center' }}>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)' }}>Tổng Học Sinh</Text>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary, #111827)', marginTop: 4 }}>
                {classData.totalStudents} <span style={{ fontSize: 13, fontWeight: 500 }}>bạn</span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="glass-panel" style={{ borderRadius: 12 }}>
              <Text style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)', display: 'block', marginBottom: 8 }}>
                Phân Bố Chất Lượng Học Sinh
              </Text>
              <LevelDistributionBar
                distribution={classData.levelDistribution}
                totalStudents={classData.totalStudents}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* STUDENTS SQI TABLE */}
      <Card className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table
          loading={loading}
          rowKey="studentId"
          pagination={{ pageSize: 15 }}
          scroll={{ x: 800 }}
          dataSource={classData?.students || []}
          columns={[
            {
              title: 'Học sinh',
              key: 'student',
              render: (_, row: StudentWeeklySummary) => (
                <div>
                  <Text strong style={{ color: 'var(--text-primary, #111827)' }}>{row.studentName}</Text>
                  {row.studentCode && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)' }}>Mã: {row.studentCode}</div>
                  )}
                </div>
              ),
            },
            {
              title: 'Chỉ số SQI',
              key: 'sqi',
              width: 130,
              render: (_, row: StudentWeeklySummary) => {
                if (!row.hasSessions || row.sqiScore === null || row.sqiScore === undefined) {
                  return <Text style={{ color: '#94a3b8', fontWeight: 600 }}>—</Text>;
                }
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#4f46e5' }}>{row.sqiScore}</span>
                    {row.sqiDelta !== null && row.sqiDelta !== undefined && (
                      row.sqiDelta > 0 ? (
                        <Tag color="success" style={{ margin: 0, padding: '0 4px', fontSize: 11 }}>
                          <TrendingUp size={11} style={{ verticalAlign: 'middle' }} /> +{row.sqiDelta}
                        </Tag>
                      ) : row.sqiDelta < 0 ? (
                        <Tag color="error" style={{ margin: 0, padding: '0 4px', fontSize: 11 }}>
                          <TrendingDown size={11} style={{ verticalAlign: 'middle' }} /> {row.sqiDelta}
                        </Tag>
                      ) : (
                        <Tag style={{ margin: 0, padding: '0 4px', fontSize: 11 }}>
                          <Minus size={11} style={{ verticalAlign: 'middle' }} /> 0
                        </Tag>
                      )
                    )}
                  </div>
                );
              },
            },
            {
              title: 'Phân loại',
              key: 'level',
              width: 160,
              render: (_, row: StudentWeeklySummary) => {
                if (!row.hasSessions || !row.level) {
                  return <Tag style={{ color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Chưa có dữ liệu</Tag>;
                }
                return getLevelTag(row.level);
              },
            },
            {
              title: 'Chuyên cần',
              dataIndex: 'attendanceRate',
              width: 110,
              render: (rate: number | null | undefined, row: StudentWeeklySummary) => {
                if (!row.hasSessions || rate === null || rate === undefined) return <Text style={{ color: '#94a3b8' }}>—</Text>;
                return (
                  <Text style={{ fontWeight: 600, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {rate}%
                  </Text>
                );
              },
            },
            {
              title: 'Bài tập',
              dataIndex: 'homeworkRate',
              width: 100,
              render: (rate: number | null | undefined, row: StudentWeeklySummary) => {
                if (!row.hasSessions || rate === null || rate === undefined) return <Text style={{ color: '#94a3b8' }}>—</Text>;
                return (
                  <Text style={{ fontWeight: 600, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {rate}%
                  </Text>
                );
              },
            },
            {
              title: 'Trạng thái duyệt',
              key: 'isApproved',
              width: 130,
              align: 'center',
              render: (_, row: StudentWeeklySummary) => (
                row.isApproved ? (
                  <Tag color="success" style={{ margin: 0, fontWeight: 600, borderRadius: 4 }}>
                    Đã duyệt
                  </Tag>
                ) : (
                  <Tag color="default" style={{ margin: 0, color: '#64748b', borderRadius: 4 }}>
                    Bản nháp
                  </Tag>
                )
              ),
            },
            {
              title: 'Đã gửi PH',
              key: 'sentToZaloAt',
              width: 130,
              align: 'center',
              render: (_, row: StudentWeeklySummary) => (
                <Checkbox
                  checked={Boolean(row.sentToZaloAt)}
                  onChange={(e) => handleToggleZaloSent(row.studentId, e.target.checked)}
                >
                  {row.sentToZaloAt ? (
                    <span style={{ color: '#0284c7', fontWeight: 600, fontSize: 12 }}>Đã gửi</span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>Chưa gửi</span>
                  )}
                </Checkbox>
              ),
            },
            {
              title: 'Hành động',
              key: 'action',
              width: 190,
              align: 'center',
              render: (_, row: StudentWeeklySummary) => (
                <Space size={2}>
                  <Button
                    size="small"
                    type="link"
                    icon={<Eye size={14} />}
                    onClick={() => handleViewStudentReport(row.studentId)}
                    style={{ padding: '0 4px', fontSize: 12.5 }}
                  >
                    Xem thiệp
                  </Button>
                  <Button
                    size="small"
                    type="text"
                    icon={<Share2 size={13} style={{ color: '#0284c7' }} />}
                    onClick={() => {
                      const baseOrigin = (import.meta as any).env?.VITE_PUBLIC_URL || (import.meta as any).env?.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                      const cleanOrigin = baseOrigin.replace(/\/+$/, '');
                      const periodNumber = periodMode === 'month' ? selectedMonth : selectedWeek;
                      const url = `${cleanOrigin}/public/reports/${row.studentId}?type=${periodMode}&${periodMode === 'month' ? `month=${periodNumber}` : `week=${periodNumber}`}&year=${selectedYear}`;
                      navigator.clipboard.writeText(url);
                      message.success(`Đã copy link báo cáo của ${row.studentName}!`);
                    }}
                    title="Sao chép liên kết cho phụ huynh"
                    style={{ color: '#0284c7', padding: '0 4px', fontSize: 12 }}
                  >
                    Copy link
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* MODAL XEM CHI TIẾT THIỆP BÁO CÁO */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={920}
        destroyOnClose
        style={{ top: 20 }}
        styles={{ container: { padding: 0 }, body: { background: '#ffffff', padding: 0 } }}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 12, color: 'var(--text-secondary, #6b7280)' }}>
              Đang tải phiếu báo cáo kết quả học tập...
            </div>
          </div>
        ) : modalReport ? (
          <div>
            <WeeklyReportCard
              report={modalReport}
              isMonthly={periodMode === 'month'}
              classNameTitle={classData?.className}
              onApprovalChanged={(approved) => {
                setClassData((prev: any) => {
                  if (!prev || !prev.students) return prev;
                  return {
                    ...prev,
                    students: prev.students.map((s: StudentWeeklySummary) =>
                      s.studentId === modalReport.studentId ? { ...s, isApproved: approved } : s
                    ),
                  };
                });
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Empty
              description={
                <div style={{ marginTop: 12 }}>
                  <Text strong style={{ fontSize: 15, display: 'block', color: 'var(--text-primary, #111827)' }}>
                    Chưa có dữ liệu buổi học trong {periodMode === 'month' ? `Tháng ${String(selectedMonth).padStart(2, '0')}/${selectedYear}` : `Tuần ${selectedWeek}/${selectedYear}`}
                  </Text>
                  <Text style={{ fontSize: 13, color: 'var(--text-secondary, #6b7280)', marginTop: 4, display: 'block' }}>
                    Học sinh này chưa có lịch học hoặc chưa được ghi nhận điểm danh trong khoảng thời gian đã chọn.
                  </Text>
                </div>
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
