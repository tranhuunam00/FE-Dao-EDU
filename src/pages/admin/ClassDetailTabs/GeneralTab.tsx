import React from 'react';
import { Row, Col, Card, Typography, Descriptions, Divider, List, Badge } from 'antd';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface GeneralTabProps {
  classData: any;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ classData }) => {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={16}>
        <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
          <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Chi tiết Lớp học</Title>
          <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: 'var(--text-secondary)' }} contentStyle={{ color: 'var(--text-primary)' }}>
            <Descriptions.Item label="Trung tâm">{classData.center?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Chương trình">{classData.course?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Mức độ (Level)">{classData.courseLevel?.levelName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giáo viên chính">
              {classData.mainTeacher ? `${classData.mainTeacher.lastName} ${classData.mainTeacher.firstName}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Trợ giảng (TA)">
              {classData.assistant ? `${classData.assistant.lastName} ${classData.assistant.firstName}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Khai giảng">{classData.startDate ? dayjs(classData.startDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Kết thúc dự kiến">{classData.finishDate ? dayjs(classData.finishDate).format('DD/MM/YYYY') : 'Chưa định'}</Descriptions.Item>
            <Descriptions.Item label="Sĩ số tối đa">{classData.maxSize || 'Không giới hạn'}</Descriptions.Item>
            <Descriptions.Item label="Bỏ qua ngày lễ">{classData.skipHolidays ? 'Có' : 'Không'}</Descriptions.Item>
          </Descriptions>
          {classData.description && (
            <>
              <Divider style={{ margin: '12px 0', borderColor: 'var(--card-border)' }} />
              <div style={{ color: 'var(--text-primary)' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Ghi chú lớp:</div>
                <div>{classData.description}</div>
              </div>
            </>
          )}
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', height: '100%' }}>
          <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Lịch học cố định</Title>
          {classData.schedules.length === 0 ? (
            <Text type="secondary">Chưa xếp lịch cố định.</Text>
          ) : (
            <List
              dataSource={classData.schedules}
              renderItem={(item: any) => (
                <List.Item style={{ borderColor: 'var(--card-border)', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Badge status="processing" />
                    <div>
                      <Text strong style={{ color: 'var(--text-primary)' }}>Thứ: {item.weekday}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {item.startTime.substring(0,5)} - {item.endTime.substring(0,5)}
                        </Text>
                      </div>
                      {item.room && (
                        <div style={{ fontSize: '12px', color: '#a5b4fc' }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          {item.room.name}
                        </div>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};
