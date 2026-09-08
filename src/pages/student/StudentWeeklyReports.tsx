import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Select, Empty, Typography, Tag, Card } from 'antd';
import { User } from 'lucide-react';
import api from '../../services/api';
import { weeklyReportService } from '../../services/weekly-report.service';
import type { WeeklyReportData } from '../../services/weekly-report.service';
import { WeeklyReportCard } from '../../components/WeeklyReportCard';

const { Title, Text } = Typography;

interface StudentProfile {
  id: string;
  fullName: string;
  studentId: string;
  gender?: string;
  mobile?: string;
}

export const StudentWeeklyReports: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>(
    localStorage.getItem('activeStudentId') || '',
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string>('');

  // Tuần & Năm
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

  // 1. Tải danh sách con thuộc tài khoản (Child Profiles)
  useEffect(() => {
    api
      .get('/students/me/profiles')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setProfiles(data);
          const stored = localStorage.getItem('activeStudentId');
          const found = data.find((p: any) => p.id === stored);
          if (found) {
            setActiveStudentId(found.id);
          } else {
            setActiveStudentId(data[0].id);
            localStorage.setItem('activeStudentId', data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy danh sách học sinh:', err);
      });
  }, []);

  // 2. Chuyển đổi con (Child Switcher)
  const handleSwitchStudent = (studentId: string) => {
    setActiveStudentId(studentId);
    localStorage.setItem('activeStudentId', studentId);
  };

  // 3. Tải báo cáo tuần của con đang chọn
  const loadReport = useCallback(async () => {
    if (!activeStudentId) return;
    setLoading(true);
    try {
      const res = await weeklyReportService.getMyReport(selectedWeek, selectedYear);
      if (res.success && res.data) {
        setReport(res.data);
        setEmptyMessage('');
      } else {
        setReport(null);
        setEmptyMessage(
          res.message ||
            `Tuần ${selectedWeek}/${selectedYear} học sinh không có buổi học nào hoặc trung tâm nghỉ lễ.`,
        );
      }
    } catch (err: any) {
      setReport(null);
      setEmptyMessage(err.response?.data?.message || 'Chưa có dữ liệu báo cáo cho tuần này.');
    } finally {
      setLoading(false);
    }
  }, [activeStudentId, selectedWeek, selectedYear]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Tạo danh sách 52 tuần trong năm để chọn
  const weekOptions = Array.from({ length: 52 }, (_, i) => {
    const w = 52 - i; // Tuần mới nhất lên trước
    return {
      value: w,
      label: `Tuần ${w} / ${selectedYear}`,
    };
  });

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* HEADER CONTROLS & CHILD SWITCHER */}
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
            📊 Báo Cáo Tuần Chất Lượng Học Tập
          </Title>
          <Text style={{ fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>
            Theo dõi chỉ số SQI và khuyến nghị sư phạm mỗi tuần dành riêng cho phụ huynh
          </Text>
        </div>

        {/* BỘ LỌC CHỌN TUẦN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Select
            value={selectedYear}
            onChange={(y) => setSelectedYear(y)}
            style={{ width: 100 }}
            options={[
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
              { value: 2027, label: '2027' },
            ]}
          />
          <Select
            value={selectedWeek}
            onChange={(w) => setSelectedWeek(w)}
            style={{ width: 160 }}
            options={weekOptions}
          />
        </div>
      </div>

      {/* THANH CHUYỂN ĐỔI CON (CHILD SWITCHER BAR - NẾU CÓ >= 2 BẠN) */}
      {profiles.length > 1 && (
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--border-color, #e5e7eb)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Text strong style={{ fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>
            <User size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Đang xem báo cáo của:
          </Text>
          {profiles.map((p) => {
            const isSelected = p.id === activeStudentId;
            return (
              <button
                key={p.id}
                onClick={() => handleSwitchStudent(p.id)}
                type="button"
                style={{
                  border: isSelected ? '2px solid #6366f1' : '1px solid var(--border-color, #d1d5db)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: isSelected ? '#4f46e5' : 'var(--text-primary, #374151)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 13,
                  padding: '6px 14px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{p.fullName}</span>
                {p.studentId && (
                  <Tag
                    style={{
                      margin: 0,
                      fontSize: 11,
                      borderRadius: 10,
                      background: isSelected ? '#4f46e5' : '#e5e7eb',
                      color: isSelected ? '#fff' : '#4b5563',
                      border: 'none',
                    }}
                  >
                    {p.studentId}
                  </Tag>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* REPORT CONTENT BODY */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: 'var(--text-secondary, #6b7280)', fontSize: 14 }}>
            Đang tổng hợp dữ liệu học tập tuần {selectedWeek}...
          </div>
        </div>
      ) : report ? (
        <WeeklyReportCard report={report} />
      ) : (
        <Card
          className="glass-panel"
          style={{
            maxWidth: 880,
            margin: '0 auto',
            borderRadius: 16,
            textAlign: 'center',
            padding: '48px 24px',
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={5} style={{ color: 'var(--text-primary, #374151)', margin: '8px 0' }}>
                  {emptyMessage}
                </Title>
                <Text style={{ color: 'var(--text-secondary, #6b7280)', fontSize: 13 }}>
                  Vui lòng chọn tuần khác hoặc liên hệ giáo viên phụ trách để biết thêm thông tin.
                </Text>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};
