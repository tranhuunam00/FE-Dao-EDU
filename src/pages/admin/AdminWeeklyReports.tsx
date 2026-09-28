import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Select, Row, Col, Typography, Button, Modal, Spin, Empty, Space, Segmented } from 'antd';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import api from '../../services/api';
import { weeklyReportService } from '../../services/weekly-report.service';
import type {
  StudentWeeklySummary,
  WeeklyReportData,
} from '../../services/weekly-report.service';
import { WeeklyReportCard } from '../../components/WeeklyReportCard';

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
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
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
    Promise.all([
      api.get('/centers'),
      api.get('/classes'),
    ])
      .then(([centerRes, classRes]) => {
        const centerList = Array.isArray(centerRes.data) ? centerRes.data : centerRes.data.centers || [];
        setCenters(centerList);

        const classList = Array.isArray(classRes.data) ? classRes.data : classRes.data.classes || [];
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id);
        }
      })
      .catch((err) => console.error('Lỗi lấy danh sách trung tâm/lớp:', err));
  }, []);

  // Lọc danh sách lớp theo trung tâm nếu chọn
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
      if (res.success && res.data) {
        setClassData(res.data);
      } else {
        setClassData(null);
      }
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
      if (res.success && res.data) {
        setModalReport(res.data);
      } else {
        setModalReport(null);
      }
    } catch (err) {
      console.error('Lỗi tải báo cáo chi tiết:', err);
      setModalReport(null);
    } finally {
      setModalLoading(false);
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

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* HEADER CONTROLS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--text-primary, #111827)' }}>
            📊 Quản Trị Báo Cáo Tuần & Chất Lượng SQI
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
            options={filteredClasses.map((c) => ({
              value: c.id,
              label: `${c.className} (${c.classCode})`,
            }))}
          />
          <Segmented
            value={periodMode}
            onChange={(v) => setPeriodMode(v as 'month' | 'week')}
            options={[
              { label: 'Theo Tháng', value: 'month' },
              { label: 'Theo Tuần', value: 'week' },
            ]}
          />
          {periodMode === 'month' ? (
            <Select
              value={selectedMonth}
              onChange={(m) => setSelectedMonth(m)}
              style={{ width: 120 }}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `Tháng ${String(i + 1).padStart(2, '0')}`,
              }))}
            />
          ) : (
            <Select
              value={selectedWeek}
              onChange={(w) => setSelectedWeek(w)}
              style={{ width: 150 }}
              options={weekOptions}
            />
          )}
          <Select
            value={selectedYear}
            onChange={(y) => setSelectedYear(y)}
            style={{ width: 90 }}
            options={[
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
              { value: 2027, label: '2027' },
            ]}
          />
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
              {(() => {
                const dist = classData.levelDistribution;
                const total = classData.totalStudents || 1;
                const levels = [
                  { key: 'level5', label: 'Xuất sắc', count: dist?.level5 || 0, color: '#16a34a', bg: '#dcfce7' },
                  { key: 'level4', label: 'Giỏi', count: dist?.level4 || 0, color: '#2563eb', bg: '#dbeafe' },
                  { key: 'level3', label: 'Khá', count: dist?.level3 || 0, color: '#d97706', bg: '#fef3c7' },
                  { key: 'level2', label: 'TB', count: dist?.level2 || 0, color: '#ea580c', bg: '#ffedd5' },
                  { key: 'level1', label: 'Yếu', count: dist?.level1 || 0, color: '#dc2626', bg: '#fee2e2' },
                ];
                return (
                  <>
                    {/* Stacked Bar */}
                    <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', background: '#f1f5f9', marginBottom: 8 }}>
                      {levels.map((lv) => {
                        const pct = (lv.count / total) * 100;
                        if (pct === 0) return null;
                        return (
                          <div
                            key={lv.key}
                            title={`${lv.label}: ${lv.count} HS (${Math.round(pct)}%)`}
                            style={{
                              width: `${pct}%`,
                              background: lv.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 700,
                              minWidth: pct > 8 ? undefined : 18,
                              transition: 'width 0.4s ease',
                            }}
                          >
                            {pct >= 12 ? `${Math.round(pct)}%` : ''}
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                      {levels.map((lv) => (
                        <div key={lv.key} style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: lv.count > 0 ? 1 : 0.35 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: lv.color, display: 'inline-block' }} />
                          <span style={{ fontSize: 11, color: 'var(--text-primary, #334155)', fontWeight: lv.count > 0 ? 600 : 400 }}>
                            {lv.label}: <strong>{lv.count}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </Card>
          </Col>
        </Row>
      )}

      {/* STUDENTS SQI TABLE */}
      <Card
        className="glass-panel"
        style={{ borderRadius: 14, overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          loading={loading}
          rowKey="studentId"
          pagination={{ pageSize: 15 }}
          scroll={{ x: 750 }}
          dataSource={classData?.students || []}
          columns={[
            {
              title: 'Học sinh',
              key: 'student',
              render: (_, row: StudentWeeklySummary) => (
                <div>
                  <Text strong style={{ color: 'var(--text-primary, #111827)' }}>
                    {row.studentName}
                  </Text>
                  {row.studentCode && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)' }}>
                      Mã: {row.studentCode}
                    </div>
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
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#4f46e5' }}>
                      {row.sqiScore}
                    </span>
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
                  return (
                    <Tag style={{ color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      Chưa có dữ liệu
                    </Tag>
                  );
                }
                return getLevelTag(row.level);
              },
            },
            {
              title: 'Chuyên cần',
              dataIndex: 'attendanceRate',
              width: 120,
              render: (rate: number | null | undefined, row: StudentWeeklySummary) => {
                if (!row.hasSessions || rate === null || rate === undefined) {
                  return <Text style={{ color: '#94a3b8' }}>—</Text>;
                }
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
              width: 120,
              render: (rate: number | null | undefined, row: StudentWeeklySummary) => {
                if (!row.hasSessions || rate === null || rate === undefined) {
                  return <Text style={{ color: '#94a3b8' }}>—</Text>;
                }
                return (
                  <Text style={{ fontWeight: 600, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {rate}%
                  </Text>
                );
              },
            },
            {
              title: 'Hành động',
              key: 'action',
              width: 150,
              align: 'center',
              render: (_, row: StudentWeeklySummary) => (
                <Button
                  size="small"
                  type="link"
                  icon={<Eye size={14} />}
                  onClick={() => handleViewStudentReport(row.studentId)}
                >
                  Xem thiệp báo cáo
                </Button>
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
        styles={{
          container: { padding: 0 },
          body: { background: '#ffffff', padding: 0 }
        }}
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
