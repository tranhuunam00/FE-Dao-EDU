import React from 'react';
import { Row, Col, Card, Typography, Tag, Divider, List } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const weekdayMap: Record<string, string> = {
  Sun: 'Chủ nhật',
  Mon: 'Thứ hai',
  Tue: 'Thứ ba',
  Wed: 'Thứ tư',
  Thu: 'Thứ năm',
  Fri: 'Thứ sáu',
  Sat: 'Thứ bảy',
};

interface GeneralTabProps {
  classData: any;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ classData }) => {
  const mainTeacherName = classData.mainTeacher
    ? `${classData.mainTeacher.lastName} ${classData.mainTeacher.firstName}`
    : null;
  const assistantName = classData.assistant
    ? `${classData.assistant.lastName} ${classData.assistant.firstName}`
    : null;

  return (
    <Row gutter={[24, 24]}>
      {/* Chi tiết Lớp học - Chiếm toàn bộ chiều rộng */}
      <Col span={24}>
        <Card
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BookOutlined style={{ fontSize: 20, color: 'var(--primary)' }} />
            <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
              Chi tiết Lớp học
            </Title>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Trung tâm */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HomeOutlined /> Trung tâm
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.center?.name || '-'}
              </div>
            </div>

            {/* Chương trình học */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOutlined /> Chương trình học
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.course?.name || '-'}
              </div>
            </div>

            {/* Trình độ (Level) */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOutlined /> Mức độ (Level)
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.courseLevel?.levelName ? (
                  <Tag color="cyan">{classData.courseLevel.levelName}</Tag>
                ) : (
                  '-'
                )}
              </div>
            </div>

            {/* Sĩ số tối đa */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TeamOutlined /> Sĩ số tối đa
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.maxSize ? `${classData.maxSize} học sinh` : 'Không giới hạn'}
              </div>
            </div>

            {/* Giáo viên chính */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserOutlined /> Giáo viên chính
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {mainTeacherName || <Text type="secondary">Chưa phân công</Text>}
              </div>
            </div>

            {/* Trợ giảng (TA) */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserOutlined /> Trợ giảng (TA)
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {assistantName || <Text type="secondary">Chưa phân công</Text>}
              </div>
            </div>

            {/* Ngày Khai giảng */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined /> Khai giảng
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.startDate ? dayjs(classData.startDate).format('DD/MM/YYYY') : '-'}
              </div>
            </div>

            {/* Kết thúc dự kiến */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined /> Kết thúc dự kiến
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.finishDate ? dayjs(classData.finishDate).format('DD/MM/YYYY') : 'Chưa định'}
              </div>
            </div>

            {/* Bỏ qua ngày lễ */}
            <div
              style={{
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid var(--card-border, #e2e8f0)',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockCircleOutlined /> Bỏ qua ngày lễ
              </Text>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginTop: 4 }}>
                {classData.skipHolidays ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">Có</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="default">Không</Tag>
                )}
              </div>
            </div>
          </div>

          {classData.description && (
            <>
              <Divider style={{ margin: '20px 0 16px', borderColor: 'var(--card-border)' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>Ghi chú lớp học:</Text>
                <div style={{ color: 'var(--text-primary)', marginTop: 6, lineHeight: 1.6, fontSize: 14 }}>
                  {classData.description}
                </div>
              </div>
            </>
          )}
        </Card>
      </Col>

      {/* Lịch học cố định - Chuyển xuống phía dưới */}
      <Col span={24}>
        <Card
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CalendarOutlined style={{ fontSize: 20, color: 'var(--primary)' }} />
            <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
              Lịch học cố định
            </Title>
          </div>

          {classData.schedules.length === 0 ? (
            <Text type="secondary">Chưa xếp lịch học cố định.</Text>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {classData.schedules.map((item: any) => (
                <div
                  key={item.id || item.weekday}
                  style={{
                    borderColor: 'var(--card-border)',
                    padding: '16px',
                    borderRadius: 12,
                    background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                    border: '1px solid var(--card-border, #e2e8f0)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Tag color="blue" style={{ fontWeight: 700, padding: '3px 12px', fontSize: 13, borderRadius: 6 }}>
                      {weekdayMap[item.weekday] || item.weekday}
                    </Tag>
                    {item.room && (
                      <Text style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {item.room.name}
                      </Text>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>
                    <ClockCircleOutlined style={{ marginRight: 6, color: 'var(--text-secondary)' }} />
                    {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};
