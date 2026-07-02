import { useEffect, useState } from 'react';
import { Card, Select, Button, Table, Typography, Space, Input, Modal, Form, Upload, Popconfirm, App } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth, Role } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ClassInfo {
  id: string;
  classCode: string;
  className: string;
}

interface MaterialItem {
  id: string;
  classId: string;
  title: string;
  description: string | null;
  fileName: string;
  objectKey: string;
  mimeType: string;
  fileSize: number;
  uploadedByUserId: string;
  createdAt: string;
  url: string;
}

export const StudyMaterials: React.FC = () => {
  const { user } = useAuth();
  const { message } = App.useApp();
  const isAdmin = user?.role === Role.ADMIN;
  const isTeacher = user?.role === Role.TEACHER;
  const canUpload = isAdmin || isTeacher;

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal State
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/study-materials/my-classes');
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClassId(res.data[0].id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách lớp học');
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchMaterials = async (classId: string) => {
    setLoadingMaterials(true);
    try {
      const res = await api.get(`/study-materials/class/${classId}`);
      setMaterials(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách tài liệu');
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchMaterials(selectedClassId);
    } else {
      setMaterials([]);
    }
  }, [selectedClassId]);

  const handleUploadSubmit = async () => {
    try {
      const values = await uploadForm.validateFields();
      if (fileList.length === 0) {
        message.error('Vui lòng chọn tài liệu để tải lên');
        return;
      }
      setUploading(true);

      const formData = new FormData();
      formData.append('classId', selectedClassId || '');
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
      if (selectedClassId) {
        fetchMaterials(selectedClassId);
      }
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
      if (selectedClassId) {
        fetchMaterials(selectedClassId);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không có quyền xóa hoặc xảy ra lỗi');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>Tài liệu học tập</Title>
          <Paragraph style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Tải lên và tải về tài liệu cho các lớp học</Paragraph>
        </div>
        {canUpload && selectedClassId && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setIsUploadVisible(true)}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none' }}
          >
            Tải tài liệu mới
          </Button>
        )}
      </div>

      <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: 200, flex: 1 }}>
            <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, marginBottom: 6 }}>Chọn lớp học:</span>
            <Select
              placeholder="Chọn lớp học..."
              style={{ width: '100%' }}
              value={selectedClassId}
              onChange={setSelectedClassId}
              loading={loadingClasses}
            >
              {classes.map(c => (
                <Option key={c.id} value={c.id}>
                  {c.className} ({c.classCode})
                </Option>
              ))}
            </Select>
          </div>
          <div style={{ minWidth: 250, flex: 2 }}>
            <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, marginBottom: 6 }}>Tìm kiếm tài liệu:</span>
            <Input
              placeholder="Nhập tên tài liệu hoặc tên file..."
              prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-panel" style={{ border: 'none', background: 'var(--card-bg)' }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredMaterials}
          rowKey="id"
          loading={loadingMaterials}
          locale={{ emptyText: 'Chưa có tài liệu học tập nào cho lớp học này' }}
          columns={[
            {
              title: 'Tên tài liệu',
              dataIndex: 'title',
              key: 'title',
              render: (v: string, r: MaterialItem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileTextOutlined style={{ fontSize: 24, color: '#818cf8' }} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{v}</div>
                    {r.description && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>{r.description}</div>}
                  </div>
                </div>
              )
            },
            {
              title: 'Tên file',
              dataIndex: 'fileName',
              key: 'fileName',
              render: (v: string) => <Text style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</Text>
            },
            {
              title: 'Kích thước',
              dataIndex: 'fileSize',
              key: 'fileSize',
              width: 120,
              render: (v: number) => <Text type="secondary">{formatFileSize(v)}</Text>
            },
            {
              title: 'Ngày tải lên',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 160,
              render: (v: string) => <Text type="secondary">{new Date(v).toLocaleDateString('vi-VN')}</Text>
            },
            {
              title: 'Thao tác',
              key: 'action',
              width: 160,
              align: 'center' as const,
              render: (_, r: MaterialItem) => (
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
                  {(isAdmin || r.uploadedByUserId === user?.id) && (
                    <Popconfirm
                      title="Xóa tài liệu học tập?"
                      description="Hành động này sẽ xóa file vĩnh viễn và không thể khôi phục."
                      onConfirm={() => handleDelete(r.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              )
            }
          ]}
        />
      </Card>

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
            <Input placeholder="Ví dụ: Đề cương ôn tập Học kỳ 1, Bài tập về nhà Tuần 4..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả / Hướng dẫn học sinh">
            <Input.TextArea placeholder="Nhập hướng dẫn sử dụng tài liệu nếu có..." rows={3} />
          </Form.Item>
          <Form.Item label="Chọn tài liệu (Tối đa 30MB)">
            <Upload
              beforeUpload={(file) => {
                setFileList([file]);
                return false; // Prevent auto-upload
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
