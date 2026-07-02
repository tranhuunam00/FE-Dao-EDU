import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import {
  ExternalLink,
  RefreshCw,
  Search as SearchIcon,
  MessageCircle,
  UserCheck,
  FolderOpen,
} from 'lucide-react';
import { FacebookOutlined } from '@ant-design/icons';
import api from '../../services/api';
import FacebookLeadScans from './FacebookLeadScans';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Constants and Mappings
type LeadLevel = 'HOT' | 'WARM' | 'COLD' | 'NONE';

const levelColors: Record<LeadLevel, string> = {
  HOT: 'red',
  WARM: 'orange',
  COLD: 'blue',
  NONE: 'default',
};

const statusOptions = [
  { value: 'NEW', label: 'Mới', color: 'blue' },
  { value: 'CONTACTING', label: 'Đang liên hệ', color: 'gold' },
  { value: 'CONNECTED', label: 'Đã liên hệ', color: 'green' },
  { value: 'LOST', label: 'Sai đối tượng', color: 'red' },
  { value: 'ENROLLED', label: 'Đã đăng ký học', color: 'purple' },
];

const statusLabels: Record<string, string> = {
  NEW: 'Mới',
  CONTACTING: 'Đang liên hệ',
  CONNECTED: 'Đã liên hệ',
  LOST: 'Sai đối tượng',
  ENROLLED: 'Đã đăng ký học',
};

interface LeadDemand {
  id: string;
  postId: string;
  postUrl: string;
  classification: string;
  leadScore: number;
  leadLevel: LeadLevel;
  reasons: string[];
  evidence: {
    authorName: string;
    authorUrl: string;
    text: string;
    depth: number;
    sourceUrl?: string;
    threadPath?: {
      kind: string;
      text: string;
      depth: number;
      authorName: string;
      authorUrl?: string;
      commentId?: string;
      sourceUrl?: string;
    }[];
  }[];
  createdAt: string;
}

interface LeadInteraction {
  id: string;
  actorName: string | null;
  actionType: string;
  statusFrom: string | null;
  statusTo: string | null;
  notes: string;
  createdAt: string;
}

interface Lead {
  id: string;
  platform: string;
  profileKey: string;
  authorName: string;
  authorUrl: string;
  contactStatus: string;
  leadLevel: LeadLevel;
  leadScore: number;
  createdAt: string;
  updatedAt: string;
  demands?: LeadDemand[];
}

const renderEvidenceThread = (ev: any, leadAuthorName: string) => {
  const thread = ev.threadPath;
  if (!thread || !Array.isArray(thread) || thread.length === 0) {
    const author = ev.authorName || (ev.depth === 0 ? leadAuthorName : 'Không rõ tên');
    return (
      <div
        style={{
          paddingLeft: (ev.depth || 0) * 18,
          marginBottom: 6,
          borderLeft: (ev.depth || 0) > 0 ? '1px dashed rgba(255, 255, 255, 0.15)' : 'none',
        }}
      >
        <Text
          strong
          style={{
            color: (ev.depth || 0) === 0 ? 'var(--primary)' : 'var(--text-primary)',
            fontSize: '0.85rem',
          }}
        >
          {author}
        </Text>
        {ev.sourceUrl && (
          <a
            href={ev.sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.75rem',
              marginLeft: 6,
              color: 'var(--text-muted)',
              opacity: 0.8,
            }}
            title="Xem bình luận gốc trên Facebook"
          >
            <ExternalLink size={10} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </a>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>: </span>
        <Paragraph
          style={{
            display: 'inline',
            fontSize: '0.85rem',
            color: '#e5e7eb',
            marginBottom: 0,
          }}
        >
          {ev.text || '(Không có text)'}
        </Paragraph>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
      {thread.map((item: any, index: number) => {
        const isPost = item.kind === 'POST';
        const isTargetComment = index === thread.length - 1;
        const author = item.authorName || 'Ẩn danh';
        const indent = index * 24;
        
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '12px',
              paddingLeft: `${indent}px`,
              position: 'relative',
              alignItems: 'flex-start',
            }}
          >
            {index > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(index - 1) * 24 + 12}px`,
                  top: '-12px',
                  bottom: '14px',
                  width: '12px',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.12)',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0 0 0 8px',
                  pointerEvents: 'none',
                }}
              />
            )}
            
            <div
              style={{
                width: isPost ? '28px' : '24px',
                height: isPost ? '28px' : '24px',
                borderRadius: '50%',
                background: isPost 
                  ? '#1890ff' 
                  : (isTargetComment ? '#52c41a' : '#d9d9d9'),
                color: isPost || isTargetComment ? '#fff' : '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isPost ? '12px' : '10px',
                fontWeight: 'bold',
                flexShrink: 0,
                zIndex: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {isPost ? 'P' : (author.charAt(0).toUpperCase() || '?')}
            </div>

            <div
              style={{
                flex: 1,
                background: isTargetComment 
                  ? 'rgba(82, 196, 26, 0.08)' 
                  : (isPost ? 'rgba(24, 144, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)'),
                border: isTargetComment
                  ? '1px solid rgba(82, 196, 26, 0.25)'
                  : (isPost ? '1px solid rgba(24, 144, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.06)'),
                padding: '8px 12px',
                borderRadius: '12px',
                position: 'relative',
                boxShadow: isTargetComment ? '0 0 10px rgba(82, 196, 26, 0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Space size={6}>
                  {item.authorUrl ? (
                    <a
                      href={item.authorUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      {author}
                    </a>
                  ) : (
                    <Text strong style={{ fontSize: '0.85rem' }}>
                      {author}
                    </Text>
                  )}
                  {isTargetComment && (
                    <Tag color="success" style={{ fontSize: '0.7rem', margin: 0 }}>
                      Lead
                    </Tag>
                  )}
                  {isPost && (
                    <Tag color="processing" style={{ fontSize: '0.7rem', margin: 0 }}>
                      Post
                    </Tag>
                  )}
                </Space>
                
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--text-muted)', opacity: 0.6 }}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              
              <Paragraph style={{ margin: 0, fontSize: '0.85rem', color: '#e5e7eb', lineHeight: 1.4 }}>
                {item.text || '(Không có nội dung)'}
              </Paragraph>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function FacebookLeadsInner() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<string>('crm');

  // Leads CRM State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsPage, setLeadsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>();
  const [excludeAnonymous, setExcludeAnonymous] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string>();

  // Detail Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadDetail, setLeadDetail] = useState<{
    lead: Lead;
    demands: LeadDemand[];
    interactions: LeadInteraction[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [interactionForm] = Form.useForm();
  const [submitInteractionLoading, setSubmitInteractionLoading] = useState(false);

  // Load CRM Leads
  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const { data } = await api.get('/leads', {
        params: {
          page: leadsPage,
          limit: 20,
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          platform: 'facebook', // Currently scoped to Facebook
          excludeAnonymous: excludeAnonymous ? 'true' : undefined,
          leadLevel: levelFilter || undefined,
        },
      });
      setLeads(data.items || []);
      setTotalLeads(data.total || 0);
    } catch {
      message.error('Không thể tải danh sách Lead CRM.');
    } finally {
      setLeadsLoading(false);
    }
  }, [message, leadsPage, searchQuery, statusFilter, excludeAnonymous, levelFilter]);

  useEffect(() => {
    if (activeTab === 'crm') {
      const timer = window.setTimeout(() => void loadLeads(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [loadLeads, activeTab]);

  // Load Lead Details
  const loadLeadDetails = useCallback(
    async (leadId: string) => {
      setDetailLoading(true);
      try {
        const { data } = await api.get(`/leads/${leadId}`);
        setLeadDetail(data);
      } catch {
        message.error('Không thể tải chi tiết Lead.');
      } finally {
        setDetailLoading(false);
      }
    },
    [message],
  );

  useEffect(() => {
    if (selectedLeadId) {
      void loadLeadDetails(selectedLeadId);
    } else {
      setLeadDetail(null);
    }
  }, [selectedLeadId, loadLeadDetails]);

  // Update Status directly from Table
  const handleUpdateStatus = async (leadId: string, nextStatus: string) => {
    try {
      await api.post(`/leads/${leadId}/interactions`, {
        statusTo: nextStatus,
        notes: `Thay đổi trạng thái chăm sóc sang: ${statusLabels[nextStatus] || nextStatus}`,
      });
      message.success('Đã cập nhật trạng thái chăm sóc.');
      void loadLeads();
      if (selectedLeadId === leadId) {
        void loadLeadDetails(leadId);
      }
    } catch (error: unknown) {
      message.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Không thể cập nhật trạng thái.'
          : 'Không thể cập nhật trạng thái.',
      );
    }
  };

  // Submit Care Note / Status Change
  const handleSubmitInteraction = async (values: {
    notes: string;
    statusTo?: string;
  }) => {
    if (!selectedLeadId) return;
    setSubmitInteractionLoading(true);
    try {
      await api.post(`/leads/${selectedLeadId}/interactions`, {
        notes: values.notes || '',
        statusTo: values.statusTo,
      });
      message.success('Đã lưu ghi chú chăm sóc.');
      interactionForm.resetFields();
      void loadLeadDetails(selectedLeadId);
      void loadLeads();
    } catch (error: unknown) {
      message.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Không thể lưu ghi chú.'
          : 'Không thể lưu ghi chú.',
      );
    } finally {
      setSubmitInteractionLoading(false);
    }
  };

  // Main CRM Table Columns
  const crmColumns: ColumnsType<Lead> = [
    {
      title: 'Kênh',
      dataIndex: 'platform',
      width: 100,
      render: (value: string) => {
        if (value === 'facebook') {
          return (
            <Tag icon={<FacebookOutlined style={{ marginRight: 4 }} />} color="blue">
              Facebook
            </Tag>
          );
        }
        return <Tag color="default">{value}</Tag>;
      },
    },
    {
      title: 'Học viên tiềm năng',
      key: 'author',
      width: 200,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: 'var(--text-primary)' }}>
            {row.authorName}
          </Text>
          {row.authorUrl ? (
            <a href={row.authorUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>
              Mở Profile <ExternalLink size={11} style={{ display: 'inline', marginLeft: 2 }} />
            </a>
          ) : (
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              Không có URL
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Đánh giá AI',
      key: 'ai_eval',
      width: 320,
      render: (_, row) => {
        const level = row.leadLevel || 'NONE';
        const score = row.leadScore || 0;
        const latestDemand = row.demands?.[0];

        return (
          <Space direction="vertical" size={2}>
            <Space>
              <Tag color={levelColors[level]}>
                {level}
              </Tag>
              <Text strong>{score}/100đ</Text>
            </Space>
            {latestDemand && (
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2 }}
                style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-muted)' }}
              >
                {latestDemand.reasons.join(' · ') || 'Không có lý do chi tiết'}
              </Paragraph>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái chăm sóc',
      dataIndex: 'contactStatus',
      width: 180,
      render: (value: string, row) => (
        <Select
          value={value}
          style={{ width: 150 }}
          options={statusOptions}
          onChange={(nextStatus) => void handleUpdateStatus(row.id, nextStatus)}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, row) => (
        <Button type="primary" size="small" onClick={() => setSelectedLeadId(row.id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Space>
          <UserCheck size={28} color="var(--primary)" />
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
            Quản lý Lead CRM
          </Title>
        </Space>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Hệ thống lưu trữ, phân tích và chăm sóc khách hàng tiềm năng đa kênh.
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: 'crm',
            label: (
              <span>
                <FolderOpen size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Danh sách Lead (CRM)
              </span>
            ),
            children: (
              <div>
                <Card className="glass-panel" style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Input
                      placeholder="Tìm kiếm họ tên, link, key..."
                      style={{ width: 250 }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onPressEnter={() => {
                        setLeadsPage(1);
                        void loadLeads();
                      }}
                      suffix={
                        <SearchIcon
                          size={16}
                          style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                          onClick={() => {
                            setLeadsPage(1);
                            void loadLeads();
                          }}
                        />
                      }
                    />
                    <Select
                      allowClear
                      placeholder="Trạng thái chăm sóc"
                      style={{ width: 180 }}
                      value={statusFilter}
                      onChange={(value) => {
                        setStatusFilter(value);
                        setLeadsPage(1);
                      }}
                      options={statusOptions}
                    />
                    <Select
                      allowClear
                      placeholder="Cấp độ Lead"
                      style={{ width: 150 }}
                      value={levelFilter}
                      onChange={(value) => {
                        setLevelFilter(value);
                        setLeadsPage(1);
                      }}
                      options={[
                        { value: 'HOT', label: 'HOT (Nóng)' },
                        { value: 'WARM', label: 'WARM (Ấm)' },
                        { value: 'COLD', label: 'COLD (Lạnh)' },
                        { value: 'NONE', label: 'NONE (Không tiềm năng)' },
                      ]}
                    />
                    <Checkbox
                      checked={excludeAnonymous}
                      onChange={(e) => {
                        setExcludeAnonymous(e.target.checked);
                        setLeadsPage(1);
                      }}
                      style={{ color: 'var(--text-primary)', marginLeft: 4 }}
                    >
                      Không lấy ẩn danh
                    </Checkbox>
                    <Button
                      icon={<RefreshCw size={14} />}
                      loading={leadsLoading}
                      onClick={() => void loadLeads()}
                    >
                      Làm mới
                    </Button>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Tìm thấy {totalLeads} lead
                    </Text>
                  </Space>
                </Card>

                <Card className="glass-panel">
                  <Table
                    rowKey="id"
                    loading={leadsLoading}
                    dataSource={leads}
                    columns={crmColumns}
                    scroll={{ x: 900 }}
                    pagination={{
                      current: leadsPage,
                      pageSize: 20,
                      total: totalLeads,
                      showSizeChanger: false,
                      onChange: setLeadsPage,
                    }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'scanner',
            label: (
              <span>
                <FacebookOutlined style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Cào quét Facebook
              </span>
            ),
            children: <FacebookLeadScans />,
          },
          {
            key: 'zalo',
            label: (
              <span>
                <MessageCircle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Quét Zalo
              </span>
            ),
            disabled: true,
            children: <div />,
          },
          {
            key: 'tiktok',
            label: (
              <span>
                <MessageCircle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Quét TikTok
              </span>
            ),
            disabled: true,
            children: <div />,
          },
        ]}
      />

      {/* Leads Detail Timeline Drawer */}
      <Drawer
        title={
          leadDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text strong style={{ fontSize: '1.2rem' }}>
                Hồ sơ Lead: {leadDetail.lead.authorName}
              </Text>
              {leadDetail.lead.authorUrl && (
                <a href={leadDetail.lead.authorUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>
                  Facebook Profile <ExternalLink size={12} style={{ display: 'inline', marginLeft: 2 }} />
                </a>
              )}
            </div>
          ) : (
            'Đang tải chi tiết...'
          )
        }
        open={Boolean(selectedLeadId)}
        width={960}
        onClose={() => setSelectedLeadId(null)}
        destroyOnClose
      >
        {detailLoading && <p>Đang tải dữ liệu hồ sơ...</p>}

        {!detailLoading && leadDetail && (
          <Row gutter={24} style={{ height: '100%', display: 'flex' }}>
            {/* Left Column: Demand / Evidence Comments Tree */}
            <Col span={12} style={{ borderRight: '1px solid var(--card-border)', height: '100%', overflowY: 'auto', paddingRight: 16 }}>
              <Title level={4} style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: 8, color: 'var(--text-primary)' }}>
                Lịch sử Nhu cầu ({leadDetail.demands.length})
              </Title>
              {leadDetail.demands.length === 0 ? (
                <Empty description="Chưa có nhu cầu cào quét nào" />
              ) : (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {leadDetail.demands.map((demand) => (
                    <Card
                      key={demand.id}
                      size="small"
                      style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--card-border)', borderRadius: 8 }}
                    >
                      <Descriptions size="small" column={1} bordered style={{ marginBottom: 12 }}>
                        <Descriptions.Item label="Thời gian">
                          {new Date(demand.createdAt).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bài viết">
                          <a href={demand.postUrl} target="_blank" rel="noreferrer">
                            {demand.postId} <ExternalLink size={12} style={{ display: 'inline', marginLeft: 2 }} />
                          </a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phân loại">
                          <Tag color="cyan" style={{ textTransform: 'capitalize' }}>
                            {demand.classification === 'POTENTIAL_PARENT' ? 'Phụ huynh tiềm năng' : demand.classification}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                          <Space>
                            <Tag color={levelColors[demand.leadLevel]}>
                              {demand.leadLevel}
                            </Tag>
                            <Text strong>{demand.leadScore}/100đ</Text>
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phân tích nhu cầu (AI)">
                          {demand.reasons && demand.reasons.length > 0 ? (
                            <ul style={{ paddingLeft: 16, margin: 0, color: 'var(--text-muted)' }}>
                              {demand.reasons.map((reason, idx) => (
                                <li key={idx} style={{ marginBottom: 4 }}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <Text type="secondary">Không có lý do chi tiết</Text>
                          )}
                        </Descriptions.Item>
                      </Descriptions>

                      <Text type="secondary" strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                        Bằng chứng bình luận (Comment Tree):
                      </Text>

                      <div
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {demand.evidence && demand.evidence.length > 0 ? (
                          demand.evidence.map((ev, idx) => (
                            <div key={idx} style={{ marginBottom: idx < demand.evidence.length - 1 ? 16 : 0 }}>
                              {renderEvidenceThread(ev, leadDetail.lead.authorName)}
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">Không có bằng chứng bình luận</Text>
                        )}
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
            </Col>

            {/* Right Column: Interaction Care Timeline & Form */}
            <Col span={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingLeft: 16 }}>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
                <Title level={4} style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: 8, color: 'var(--text-primary)' }}>
                  Lịch sử Chăm sóc ({leadDetail.interactions.length})
                </Title>

                {leadDetail.interactions.length === 0 ? (
                  <Empty description="Chưa có lịch sử chăm sóc" />
                ) : (
                  <Timeline
                    mode="left"
                    style={{ marginTop: 16 }}
                    items={leadDetail.interactions.map((inter) => ({
                      color: inter.actionType === 'STATUS_CHANGE' ? 'green' : 'blue',
                      children: (
                        <div style={{ marginBottom: 12 }}>
                          <Text type="secondary" style={{ fontSize: '0.78rem', display: 'block' }}>
                            {new Date(inter.createdAt).toLocaleString('vi-VN')} · bởi {inter.actorName || 'Hệ thống'}
                          </Text>
                          {inter.actionType === 'STATUS_CHANGE' && (
                            <div style={{ margin: '4px 0' }}>
                              <Tag color="default">{statusLabels[inter.statusFrom || ''] || inter.statusFrom}</Tag>
                              <span style={{ color: 'var(--text-muted)' }}>→</span>
                              <Tag color="green">{statusLabels[inter.statusTo || ''] || inter.statusTo}</Tag>
                            </div>
                          )}
                          <Paragraph style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                            {inter.notes || '(Không có ghi chú)'}
                          </Paragraph>
                        </div>
                      ),
                    }))}
                  />
                )}
              </div>

              {/* Interaction Input Form */}
              <Card
                title="Ghi nhận chăm sóc mới"
                size="small"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <Form
                  form={interactionForm}
                  layout="vertical"
                  initialValues={{
                    statusTo: leadDetail.lead.contactStatus,
                  }}
                  onFinish={handleSubmitInteraction}
                >
                  <Form.Item
                    name="notes"
                    label="Ghi chú nội dung chăm sóc"
                    rules={[{ required: true, message: 'Vui lòng nhập ghi chú chăm sóc' }]}
                    style={{ marginBottom: 12 }}
                  >
                    <TextArea rows={3} placeholder="Ví dụ: Gọi điện phụ huynh tư vấn, hẹn mai gọi lại..." />
                  </Form.Item>

                  <Form.Item name="statusTo" label="Cập nhật trạng thái chăm sóc" style={{ marginBottom: 16 }}>
                    <Select options={statusOptions} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={submitInteractionLoading}
                    >
                      Lưu thông tin chăm sóc
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        )}
      </Drawer>
    </div>
  );
}

export default function FacebookLeads() {
  return (
    <App>
      <FacebookLeadsInner />
    </App>
  );
}
