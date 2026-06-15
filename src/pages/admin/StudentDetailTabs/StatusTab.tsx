import React from 'react';
import { Form, Select, Card } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

const { Option } = Select;

export const StatusTab: React.FC = () => {
  return (
    <Card
      title={<span style={{ fontFamily: 'Outfit' }}><TeamOutlined /> Trạng thái học sinh</span>}
      className="glass-panel"
      style={{ maxWidth: '600px', margin: '0 auto', border: 'none', background: 'var(--card-bg)' }}
    >
      <Form.Item
        name="status"
        label="Trạng thái học tập"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
      >
        <Select placeholder="Chọn trạng thái">
          <Option value="Waiting for class">Chờ xếp lớp (Waiting for class)</Option>
          <Option value="Studying">Đang học (Studying)</Option>
          <Option value="Suspended">Tạm nghỉ (Suspended)</Option>
          <Option value="Graduated">Đã tốt nghiệp (Graduated)</Option>
        </Select>
      </Form.Item>
    </Card>
  );
};
