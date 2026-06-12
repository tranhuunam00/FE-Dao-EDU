import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, Select, Button, Card, Typography, Row, Col, App, Space, Spin, ConfigProvider, theme
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { PROVINCE_OPTIONS, getDistrictsOrWards } from '../../assets/vietnam_divisions';

const { Title, Text } = Typography;
const { Option } = Select;

const CenterDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const [center, setCenter] = useState<any>(null);
  
  const selectedProvince = Form.useWatch('province', form);
  const [districtOptions, setDistrictOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        const { data } = await api.get(`/centers/${id}`);
        setCenter(data);
        form.setFieldsValue({
          name: data.name,
          phone: data.phone,
          email: data.email,
          province: data.province,
          districtWard: data.districtWard,
          primaryAddress: data.primaryAddress,
          managerName: data.managerName,
          status: data.status,
        });
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Không thể tải thông tin trung tâm.');
        navigate('/admin/centers');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCenter();
  }, [id, form, message, navigate]);

  useEffect(() => {
    if (selectedProvince) {
      setDistrictOptions(getDistrictsOrWards(selectedProvince));
    } else {
      setDistrictOptions([]);
    }
  }, [selectedProvince]);

  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        name: values.name?.trim(),
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        province: values.province || undefined,
        districtWard: values.districtWard || undefined,
        primaryAddress: values.primaryAddress?.trim() || undefined,
        managerName: values.managerName?.trim() || undefined,
        status: values.status,
      };

      const res = await api.patch(`/centers/${id}`, payload);
      setCenter(res.data);
      message.success('Đã cập nhật trung tâm thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể cập nhật trung tâm.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '12px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Space align="center" size="middle">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/centers')}
              style={{ color: 'var(--text-secondary)' }}
            />
            <div>
              <Title level={3} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
                {center?.centerId} - {center?.name}
              </Title>
              <Text style={{ color: 'var(--text-secondary)' }}>
                Cập nhật thông tin chi tiết trung tâm
              </Text>
            </div>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={saving}
            disabled={!submittable}
            style={{ background: submittable ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : undefined, border: 'none' }}
          >
            Lưu thay đổi
          </Button>
        </div>

        <Card className="glass-panel" style={{ border: 'none', background: 'rgba(17, 24, 39, 0.75)' }}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Tên Trung Tâm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên trung tâm' }]}>
                <Input placeholder="VD: Trung tâm Đống Đa" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số điện thoại hotline" name="phone">
                <Input placeholder="Nhập số điện thoại" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email liên hệ" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="Nhập email" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tên Quản lý" name="managerName">
                <Input placeholder="Nhập tên người quản lý" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tỉnh / Thành phố" name="province">
                <Select showSearch placeholder="Chọn Tỉnh/Thành phố" size="large" optionFilterProp="children">
                  {PROVINCE_OPTIONS.map((p) => (
                    <Option key={p.value} value={p.value}>{p.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Quận / Huyện" name="districtWard">
                <Select showSearch placeholder="Chọn Quận/Huyện" size="large" disabled={!selectedProvince} optionFilterProp="children">
                  {districtOptions.map((d) => (
                    <Option key={d.value} value={d.value}>{d.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Địa chỉ chi tiết (Số nhà, đường)" name="primaryAddress">
                <Input placeholder="Nhập địa chỉ" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Inactive">Dừng hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

const CenterDetail: React.FC = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#6366f1',
        colorBgContainer: '#111827',
        colorBorder: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
      },
    }}
  >
    <App>
      <CenterDetailInner />
    </App>
  </ConfigProvider>
);

export default CenterDetail;
