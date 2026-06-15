import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, Select, Button, Card, Typography, Row, Col, App, Space, Spin,
  Table, Modal, InputNumber
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
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

  // Classroom management states
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomForm] = Form.useForm();
  const [savingRoom, setSavingRoom] = useState(false);

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

  const fetchRooms = async () => {
    try {
      const { data } = await api.get(`/rooms?centerId=${id}`);
      setRooms(data || []);
    } catch (err) {
      console.error('Cannot load rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRooms();
    }
  }, [id]);

  const handleOpenRoomModal = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      roomForm.setFieldsValue({
        name: room.name,
        capacity: room.capacity,
        status: room.status,
      });
    } else {
      setEditingRoom(null);
      roomForm.resetFields();
      roomForm.setFieldsValue({ capacity: 30, status: 'Active' });
    }
    setIsRoomModalVisible(true);
  };

  const handleSaveRoom = async () => {
    try {
      const vals = await roomForm.validateFields();
      setSavingRoom(true);
      if (editingRoom) {
        const { data } = await api.put(`/rooms/${editingRoom.id}`, {
          name: vals.name.trim(),
          capacity: vals.capacity,
          status: vals.status,
        });
        message.success('Cập nhật phòng học thành công!');
        setRooms(prev => prev.map(r => r.id === editingRoom.id ? data : r));
      } else {
        const { data } = await api.post('/rooms', {
          centerId: id,
          name: vals.name.trim(),
          capacity: vals.capacity,
          status: vals.status || 'Active',
        });
        message.success('Tạo phòng học mới thành công!');
        setRooms(prev => [...prev, data]);
      }
      setIsRoomModalVisible(false);
      roomForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu phòng học');
    } finally {
      setSavingRoom(false);
    }
  };

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
              <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
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

        <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }}>
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

      <Card
        className="glass-panel"
        style={{ border: 'none', background: 'var(--card-bg)', marginTop: 24 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'Outfit' }}>
              Danh sách Phòng học
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenRoomModal()}
              style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
            >
              Thêm phòng học
            </Button>
          </div>
        }
      >
        <Table
          dataSource={rooms}
          loading={loadingRooms}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'Chưa có phòng học nào được tạo cho trung tâm này.' }}
          columns={[
            {
              title: 'Tên phòng',
              dataIndex: 'name',
              key: 'name',
              render: (text: string) => <Text style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{text}</Text>
            },
            {
              title: 'Sức chứa',
              dataIndex: 'capacity',
              key: 'capacity',
              render: (cap: number) => <Text style={{ color: 'var(--text-secondary)' }}>{cap} chỗ ngồi</Text>
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <span style={{
                  color: status === 'Active' ? '#10b981' : '#ef4444',
                  background: status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {status === 'Active' ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              )
            },
            {
              title: 'Hành động',
              key: 'actions',
              width: 100,
              render: (_, record) => (
                <Button
                  type="text"
                  onClick={() => handleOpenRoomModal(record)}
                  style={{ color: '#6366f1' }}
                >
                  Sửa
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingRoom ? "Cập nhật phòng học" : "Thêm phòng học mới"}
        open={isRoomModalVisible}
        onOk={handleSaveRoom}
        onCancel={() => {
          setIsRoomModalVisible(false);
          roomForm.resetFields();
        }}
        confirmLoading={savingRoom}
        okText={editingRoom ? "Cập nhật" : "Tạo phòng"}
        cancelText="Hủy"
      >
        <Form form={roomForm} layout="vertical" style={{ paddingTop: '12px' }}>
          <Form.Item
            name="name"
            label="Tên phòng học"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng học' }]}
          >
            <Input placeholder="VD: Phòng Lab 202, Phòng A1..." />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Sức chứa (chỗ ngồi)"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Dừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const CenterDetail: React.FC = () => (
  <App>
    <CenterDetailInner />
  </App>
);

export default CenterDetail;
