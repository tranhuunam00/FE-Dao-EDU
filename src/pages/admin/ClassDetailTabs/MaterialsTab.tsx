import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Modal, Form, Input, Upload, Typography, Space, App } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const { Text } = Typography;

interface MaterialsTabProps {
  classId: string;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ classId }) => {
  const { message } = App.useApp();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/study-materials/class/${classId}`);
      setMaterials(res.data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [classId]);

  const handleUploadSubmit = async () => {
    try {
      const values = await uploadForm.validateFields();
      if (fileList.length === 0) {
        message.error('Vui lòng chọn tài liệu để tải lên');
        return;
      }
      setUploading(true);

      const formData = new FormData();
      formData.append('classId', classId);
      formData.append('title', values.title);
      if (values.description) {
        formData.append('description', values.description);
      }
      formData.append('file', fileList[0]);

      await api.post('/study-materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('Tải lên tài liệu học tập thành công!');
      setIsUploadVisible(false);
      uploadForm.resetFields();
      setFileList([]);
      fetchMaterials();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải tài liệu lên');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/study-materials/${id}`);
      message.success('Xóa tài liệu thành công');
      fetchMaterials();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa tài liệu');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setIsUploadVisible(true)}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none' }}
        >
          Tải tài liệu mới
        </Button>
      </div>

      <Table
        dataSource={materials}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: 'Chưa có tài liệu học tập nào cho lớp học này' }}
        columns={[
          {
            title: 'Tên tài liệu',
            render: (_, r: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileTextOutlined style={{ fontSize: 24, color: '#818cf8' }} />
                <div>
                  <b style={{ color: 'var(--text-primary)' }}>{r.title}</b>
                  {r.description && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>{r.description}</div>}
                </div>
              </div>
            )
          },
          {
            title: 'Tên file',
            dataIndex: 'fileName',
            render: v => <Text style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</Text>
          },
          {
            title: 'Kích thước',
            dataIndex: 'fileSize',
            width: 130,
            render: v => <Text type="secondary">{formatFileSize(Number(v))}</Text>
          },
          {
            title: 'Ngày tải lên',
            dataIndex: 'createdAt',
            width: 180,
            render: v => <Text type="secondary">{new Date(v).toLocaleDateString('vi-VN')}</Text>
          },
          {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            align: 'center',
            render: (_, r: any) => (
              <Space size="middle">
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href={r.url}
                  target="_blank"
                  style={{ color: '#34d399', padding: 0 }}
                >
                  Tải về
                </Button>
                <Popconfirm
                  title="Xóa tài liệu học tập?"
                  description="Hành động này sẽ xóa file vĩnh viễn khỏi hệ thống và máy chủ lưu trữ."
                  onConfirm={() => handleDelete(r.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title="Tải lên tài liệu học tập mới"
        open={isUploadVisible}
        onOk={handleUploadSubmit}
        onCancel={() => {
          setIsUploadVisible(false);
          uploadForm.resetFields();
          setFileList([]);
        }}
        confirmLoading={uploading}
        okText="Tải lên"
        cancelText="Hủy"
      >
        <Form form={uploadForm} layout="vertical" style={{ padding: '12px 0' }}>
          <Form.Item
            name="title"
            label="Tiêu đề tài liệu"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề tài liệu' }]}
          >
            <Input placeholder="Ví dụ: Đề cương ôn tập Học kỳ 1..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả / Hướng dẫn học sinh">
            <Input.TextArea placeholder="Nhập hướng dẫn sử dụng tài liệu nếu có..." rows={3} />
          </Form.Item>
          <Form.Item label="Chọn tài liệu (Tối đa 30MB)">
            <Upload
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file tài liệu</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
