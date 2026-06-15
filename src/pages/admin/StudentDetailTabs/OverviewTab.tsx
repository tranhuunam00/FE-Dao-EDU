import React from 'react';
import { Form, Input, DatePicker, Select, Card, Row, Col, Divider } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, EnvironmentOutlined, IdcardOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PROVINCE_OPTIONS, DISTRICT_WARD_MAP } from '../../../assets/vietnam_divisions';

const { Option } = Select;
const { TextArea } = Input;

const RELATIONSHIP_OPTIONS = ['Bố', 'Mẹ', 'Anh', 'Chị', 'Ông', 'Bà', 'Người giám hộ khác'];

interface OverviewTabProps {
  student: any;
  age: number | null;
  selectedProvince: string | undefined;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ student, age, selectedProvince }) => {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={15}>
        <Card
          title={<span style={{ fontFamily: 'Outfit' }}><UserOutlined /> Thông tin cá nhân</span>}
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)' }}
        >
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="lastName" label="Họ đệm" rules={[{ required: true, message: 'Vui lòng nhập họ đệm' }]}>
                <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="nickName" label="Biệt danh">
                <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="birthdate" label="Ngày sinh" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Tuổi">
                <Input value={age !== null ? `${age} tuổi` : '—'} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="studentCitizenId" label="Số CCCD học sinh">
            <Input prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
          </Form.Item>
        </Card>

        <Card
          title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Phụ huynh / Người giám hộ</span>}
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)', marginTop: '24px' }}
        >
          <Divider style={{ margin: '0 0 16px 0', borderColor: 'var(--card-border)' }}>Người giám hộ 1</Divider>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="parentGuardian1" label="Họ và tên">
                <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="relationship1" label="Quan hệ">
                <Select placeholder="Chọn mối quan hệ" allowClear>
                  {RELATIONSHIP_OPTIONS.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="parent1CitizenId" label="Số CCCD">
                <Input prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="otherPhone1" label="Số điện thoại phụ">
                <Input prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0', borderColor: 'var(--card-border)' }}>Người giám hộ 2</Divider>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="parentGuardian2" label="Họ và tên">
                <Input prefix={<UserOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="relationship2" label="Quan hệ">
                <Select placeholder="Chọn mối quan hệ" allowClear>
                  {RELATIONSHIP_OPTIONS.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="parent2CitizenId" label="Số CCCD">
                <Input prefix={<IdcardOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="otherPhone2" label="Số điện thoại phụ">
                <Input prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={9}>
        <Card
          title={<span style={{ fontFamily: 'Outfit' }}><EnvironmentOutlined /> Liên lạc & Địa chỉ</span>}
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)' }}
        >
          <Form.Item name="mobile" label="Số điện thoại chính" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input prefix={<PhoneOutlined style={{ color: '#6b7280' }} />} />
          </Form.Item>
          <Form.Item name="email" label="Địa chỉ Email">
            <Input type="email" prefix={<MailOutlined style={{ color: '#6b7280' }} />} />
          </Form.Item>
          <Form.Item name="country" label="Quốc gia">
            <Input disabled />
          </Form.Item>
          <Form.Item name="province" label="Tỉnh / Thành phố">
            <Select placeholder="Chọn Tỉnh/Thành phố" allowClear showSearch optionFilterProp="children">
              {PROVINCE_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="districtWard" label="Phường / Xã">
            <Select placeholder="Chọn Phường/Xã" disabled={!selectedProvince} allowClear showSearch>
              {(DISTRICT_WARD_MAP[selectedProvince || ''] || []).map((opt: string) => (
                <Option key={opt} value={opt}>{opt}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="primaryAddress" label="Địa chỉ chi tiết (Thường trú)" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="oldAddress" label="Địa chỉ cũ (nếu có)">
            <TextArea rows={1} />
          </Form.Item>
        </Card>

        <Card
          title={<span style={{ fontFamily: 'Outfit' }}><CalendarOutlined /> Ghi chú</span>}
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)', marginTop: '24px' }}
        >
          <Form.Item name="description" label="Ghi chú về học sinh">
            <TextArea rows={4} placeholder="Sức khỏe, học lực, năng khiếu..." />
          </Form.Item>
        </Card>

        <Card
          className="glass-panel"
          style={{ border: 'none', background: 'var(--card-bg)', marginTop: '24px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ngày tạo:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{dayjs(student.createdAt).format('DD/MM/YYYY HH:mm')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cập nhật lần cuối:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{dayjs(student.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
