import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Select, Row, Col, Typography, Button, Modal, Spin, Empty, Space } from 'antd';
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

  // 2. Tải tổng hợp báo cáo tuần của lớp
  const loadClassReports = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const res = await weeklyReportService.getClassReports(selectedClassId, selectedWeek, selectedYear);
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
  }, [selectedClassId, selectedWeek, selectedYear]);

  useEffect(() => {
    loadClassReports();
  }, [loadClassReports]);

  // 3. Mở xem chi tiết thiệp báo cáo của 1 học sinh
  const handleViewStudentReport = async (studentId: string) => {
    setModalVisible(true);
    setModalLoading(true);
    try {
      const res = await weeklyReportService.getStudentReport(studentId, selectedWeek, selectedYear);
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

  const getLevelTag = (level: string) => {
    if (level.includes('Level 5')) return <Tag color="emerald" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>Level 5 - Xuất sắc</Tag>;
    if (level.includes('Level 4')) return <Tag color="blue" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Level 4 - Giỏi</Tag>;
    if (level.includes('Level 3')) return <Tag color="gold" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>Level 3 - Khá</Tag>;
    if (level.includes('Level 2')) return <Tag color="orange" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>Level 2 - Trung bình</Tag>;
    return <Tag color="red" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Level 1 - Yếu</Tag>;
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
          <Select
            value={selectedWeek}
            onChange={(w) => setSelectedWeek(w)}
            style={{ width: 150 }}
            options={weekOptions}
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
              <Text style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)', display: 'block', marginBottom: 6 }}>
                Phân Bố Chất Lượng (SQI Level)
              </Text>
              <Space wrap size={[6, 6]}>
                <Tag color="success">Level 5 (Xuất sắc): {classData.levelDistribution?.level5 || 0}</Tag>
                <Tag color="blue">Level 4 (Giỏi): {classData.levelDistribution?.level4 || 0}</Tag>
                <Tag color="warning">Level 3 (Khá): {classData.levelDistribution?.level3 || 0}</Tag>
                <Tag color="orange">Level 2 (TB): {classData.levelDistribution?.level2 || 0}</Tag>
                <Tag color="error">Level 1 (Yếu): {classData.levelDistribution?.level1 || 0}</Tag>
              </Space>
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
              render: (_, row: StudentWeeklySummary) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#4f46e5' }}>
                    {row.sqiScore}
                  </span>
                  {row.sqiDelta > 0 ? (
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
                  )}
                </div>
              ),
            },
            {
              title: 'Phân loại',
              key: 'level',
              width: 160,
              render: (_, row: StudentWeeklySummary) => getLevelTag(row.level),
            },
            {
              title: 'Chuyên cần',
              dataIndex: 'attendanceRate',
              width: 120,
              render: (rate: number) => (
                <Text style={{ fontWeight: 600, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {rate}%
                </Text>
              ),
            },
            {
              title: 'Bài tập',
              dataIndex: 'homeworkRate',
              width: 120,
              render: (rate: number) => (
                <Text style={{ fontWeight: 600, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {rate}%
                </Text>
              ),
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
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 12, color: 'var(--text-secondary, #6b7280)' }}>
              Đang tải thiệp báo cáo tuần của học sinh...
            </div>
          </div>
        ) : modalReport ? (
          <div style={{ paddingTop: 16 }}>
            <WeeklyReportCard report={modalReport} />
          </div>
        ) : (
          <Empty description="Không tìm thấy báo cáo cho tuần này." />
        )}
      </Modal>
    </div>
  );
};
