import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CalendarOff, Pencil, Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import axios from 'axios';
import api from '../../services/api';

const { Title, Text } = Typography;

interface Holiday {
  id: string;
  date: string;
  name: string;
  description: string | null;
}

function HolidaySettingsInner() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [items, setItems] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/holidays');
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const showForm = (holiday?: Holiday) => {
    setEditing(holiday || null);
    form.setFieldsValue({
      date: holiday ? dayjs(holiday.date) : null,
      name: holiday?.name,
      description: holiday?.description,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        date: values.date.format('YYYY-MM-DD'),
        name: values.name,
        description: values.description,
      };
      if (editing) await api.put(`/holidays/${editing.id}`, payload);
      else await api.post('/holidays', payload);
      message.success(editing ? 'Đã cập nhật ngày nghỉ' : 'Đã thêm ngày nghỉ');
      setOpen(false);
      form.resetFields();
      await load();
    } catch (error: unknown) {
      message.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Không thể lưu ngày nghỉ'
          : 'Không thể lưu ngày nghỉ',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/holidays/${id}`);
    message.success('Đã xóa ngày nghỉ');
    await load();
  };

  const columns: ColumnsType<Holiday> = [
    { title: 'Ngày nghỉ', dataIndex: 'date', width: 160, render: (value) => <strong>{dayjs(value).format('DD/MM/YYYY')}</strong> },
    { title: 'Tên ngày nghỉ', dataIndex: 'name', width: 260 },
    { title: 'Ghi chú', dataIndex: 'description', render: (value) => value || <Text type="secondary">Không có ghi chú</Text> },
    {
      title: 'Thao tác',
      width: 150,
      render: (_, row) => (
        <Space>
          <Button icon={<Pencil size={15} />} onClick={() => showForm(row)} />
          <Popconfirm title="Xóa ngày nghỉ này?" description="Lịch học đã sinh trước đó không tự động khôi phục." onConfirm={() => remove(row.id)}>
            <Button danger icon={<Trash2 size={15} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <Space>
            <CalendarOff size={28} color="var(--primary)" />
            <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>Cài đặt ngày nghỉ lễ</Title>
          </Space>
          <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
            Lớp bật “Bỏ qua ngày lễ” sẽ không sinh buổi học vào các ngày bên dưới.
          </div>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => showForm()}>Thêm ngày nghỉ</Button>
      </div>
      <Card className="glass-panel">
        <Table rowKey="id" loading={loading} dataSource={items} columns={columns} pagination={{ pageSize: 15 }} scroll={{ x: 760 }} />
      </Card>
      <Modal title={editing ? 'Cập nhật ngày nghỉ' : 'Thêm ngày nghỉ'} open={open} confirmLoading={saving} onOk={submit} onCancel={() => setOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Chọn ngày nghỉ' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="name" label="Tên ngày nghỉ" rules={[{ required: true, message: 'Nhập tên ngày nghỉ' }]}>
            <Input placeholder="Ví dụ: Quốc khánh" />
          </Form.Item>
          <Form.Item name="description" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function HolidaySettings() {
  return <App><HolidaySettingsInner /></App>;
}
