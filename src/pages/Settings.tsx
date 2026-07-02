import React from 'react';
import { Card, Col, Row, Segmented, Space, Tabs, Typography } from 'antd';
import { Laptop, Moon, Palette, Sun, UserRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  useTheme,
  type ThemePreference,
} from '../context/theme-context';
import { useAuth, Role } from '../context/AuthContext';
import StudentProfile from './student/StudentProfile';

const { Text, Title } = Typography;

const themeOptions = [
  {
    value: 'light',
    label: (
      <Space>
        <Sun size={16} />
        Sáng
      </Space>
    ),
  },
  {
    value: 'dark',
    label: (
      <Space>
        <Moon size={16} />
        Tối
      </Space>
    ),
  },
  {
    value: 'system',
    label: (
      <Space>
        <Laptop size={16} />
        Hệ thống
      </Space>
    ),
  },
];

const Settings: React.FC = () => {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab =
    requestedTab === 'profile' && user?.role === Role.STUDENT
      ? 'profile'
      : 'appearance';

  const appearance = (
    <Row gutter={[18, 18]}>
      <Col xs={24} md={7}>
        <Card className="glass-panel settings-section-card">
          <Space align="start">
            <Palette size={20} color="var(--primary)" />
            <div>
              <Text strong>Giao diện</Text>
              <div>
                <Text type="secondary">Màu sắc và hiển thị</Text>
              </div>
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24} md={17}>
        <Card className="glass-panel" title="Chế độ màn hình">
          <Text type="secondary">
            Chọn giao diện phù hợp. Thiết lập được lưu trên trình duyệt này.
          </Text>

          <div style={{ marginTop: 20 }}>
            <Segmented
              block
              size="large"
              value={preference}
              options={themeOptions}
              onChange={(value) => setPreference(value as ThemePreference)}
            />
          </div>

          <div className="theme-preview-grid">
            <div className="theme-preview theme-preview-light">
              <Sun size={20} />
              <div>
                <b>Chế độ sáng</b>
                <span>Nền sáng, độ tương phản nhẹ</span>
              </div>
            </div>
            <div className="theme-preview theme-preview-dark">
              <Moon size={20} />
              <div>
                <b>Chế độ tối</b>
                <span>Dịu mắt trong môi trường thiếu sáng</span>
              </div>
            </div>
          </div>

          <Text type="secondary">
            Đang áp dụng: {resolvedTheme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
            {preference === 'system' ? ' theo hệ thống' : ''}.
          </Text>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4, color: 'var(--text-primary)' }}>
          Cài đặt tài khoản
        </Title>
        <Text type="secondary">
          Quản lý giao diện và các tùy chọn cá nhân của bạn.
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(tab) =>
          setSearchParams(tab === 'appearance' ? {} : { tab })
        }
        items={[
          {
            key: 'appearance',
            label: (
              <Space>
                <Palette size={16} />
                Giao diện
              </Space>
            ),
            children: appearance,
          },
          ...(user?.role === Role.STUDENT
            ? [
                {
                  key: 'profile',
                  label: (
                    <Space>
                      <UserRound size={16} />
                      Hồ sơ cá nhân
                    </Space>
                  ),
                  children: <StudentProfile embedded />,
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};

export default Settings;
