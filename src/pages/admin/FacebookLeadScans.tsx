import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  List,
  Space,
  Table,
  Tag,
  Typography,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

type LeadClassification =
  | 'POTENTIAL_PARENT'
  | 'TEACHER_AD'
  | 'COMPETITOR_SALE'
  | 'RECOMMENDATION'
  | 'NEUTRAL'
  | 'SPAM';

type LeadLevel = 'HOT' | 'WARM' | 'COLD' | 'NONE';

interface LeadEvidence {
  kind: string;
  text: string;
  sourceUrl: string;
  pageUrl: string;
  postId: string;
  commentId: string;
  depth: number;
  itemLeadScore: number;
  threadPath?: {
    kind: string;
    text: string;
    depth: number;
    authorName: string;
    authorUrl?: string;
    commentId?: string;
    sourceUrl?: string;
  }[];
}

interface LeadProfile {
  profileKey: string;
  authorName: string;
  authorUrl: string;
  classification: LeadClassification;
  leadScore: number;
  leadLevel: LeadLevel;
  promotionScore: number;
  reasons: string[];
  evidence: LeadEvidence[];
}

interface LeadDetection {
  detectorVersion: string;
  generatedAt: string;
  summary: Record<string, number>;
  aiCandidates: LeadProfile[];
  leadProfiles: LeadProfile[];
}

interface FacebookLeadScan {
  id: string;
  scanSessionId: string;
  source: string;
  groupUrl: string;
  postUrl: string;
  postId: string;
  scannedAt: string | null;
  itemCount: number;
  acceptedItems: number;
  duplicateItems: number;
  detection: LeadDetection;
  items?: any[];
  createdAt: string;
}

const classificationLabels: Record<LeadClassification, string> = {
  POTENTIAL_PARENT: 'Phụ huynh tiềm năng',
  TEACHER_AD: 'GV quảng cáo',
  COMPETITOR_SALE: 'Sale đối thủ',
  RECOMMENDATION: 'Giới thiệu',
  NEUTRAL: 'Trung tính',
  SPAM: 'Spam',
};

const classificationColors: Record<LeadClassification, string> = {
  POTENTIAL_PARENT: 'green',
  TEACHER_AD: 'gold',
  COMPETITOR_SALE: 'red',
  RECOMMENDATION: 'blue',
  NEUTRAL: 'default',
  SPAM: 'default',
};

const levelColors: Record<LeadLevel, string> = {
  HOT: 'red',
  WARM: 'orange',
  COLD: 'blue',
  NONE: 'default',
};

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0', width: '100%' }}>
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

function FacebookLeadScansInner() {
  const { message } = App.useApp();
  const [items, setItems] = useState<FacebookLeadScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<FacebookLeadScan | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/facebook-lead-scans', {
        params: { page, limit: 20 },
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      message.error('Không thể tải danh sách lead Facebook.');
    } finally {
      setLoading(false);
    }
  }, [message, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const columns: ColumnsType<FacebookLeadScan> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Bài viết',
      key: 'post',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.postId || 'Không rõ mã bài'}</Text>
          {row.postUrl ? (
            <a href={row.postUrl} target="_blank" rel="noreferrer">
              Mở Facebook <ExternalLink size={13} />
            </a>
          ) : (
            <Text type="secondary">Không có URL</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Dữ liệu',
      key: 'items',
      width: 150,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.itemCount} item</Text>
          <Text type="secondary">
            {row.acceptedItems} mới, {row.duplicateItems} trùng
          </Text>
        </Space>
      ),
    },
    {
      title: 'AI candidates',
      key: 'candidates',
      width: 180,
      render: (_, row) => {
        const summary = row.detection?.summary || {};
        return (
          <Space wrap>
            <Tag color="green">
              {row.detection?.aiCandidates?.length || 0} lead
            </Tag>
            <Tag color="red">{summary.HOT || 0} hot</Tag>
            <Tag color="orange">{summary.WARM || 0} warm</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Phiên',
      dataIndex: 'scanSessionId',
      width: 220,
      ellipsis: true,
    },
    {
      title: '',
      key: 'action',
      width: 110,
      render: (_, row) => (
        <Button size="small" onClick={() => setSelected(row)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Space>
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
            Lead Facebook
          </Title>
          <Button
            icon={<RefreshCw size={16} />}
            loading={loading}
            onClick={() => void load()}
          >
            Làm mới
          </Button>
        </Space>
        <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Dữ liệu extension đã sync về backend và kết quả detect theo text.
        </div>
      </div>

      <Card className="glass-panel">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={items}
          columns={columns}
          scroll={{ x: 1000 }}
          expandable={{ expandedRowRender: renderCandidatePreview }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </Card>

      <Drawer
        title="Chi tiết lead Facebook"
        open={Boolean(selected)}
        width={720}
        onClose={() => setSelected(null)}
      >
        {selected ? <ScanDetail scanId={selected.id} /> : null}
      </Drawer>
    </div>
  );
}

function renderCandidatePreview(scan: FacebookLeadScan) {
  const candidates = scan.detection?.aiCandidates || [];
  if (!candidates.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lead đủ điểm." />;
  }

  return (
    <List
      size="small"
      dataSource={candidates.slice(0, 5)}
      renderItem={(profile) => (
        <List.Item>
          <LeadProfileSummary profile={profile} />
        </List.Item>
      )}
    />
  );
}

function ScanDetail({ scanId }: { scanId: string }) {
  const [detail, setDetail] = useState<FacebookLeadScan | null>(null);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/facebook-lead-scans/${scanId}`);
        if (active) {
          setDetail(data);
        }
      } catch {
        message.error('Không thể tải chi tiết đợt quét.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadDetail();
    return () => {
      active = false;
    };
  }, [scanId, message]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" tip="Đang tải chi tiết..." />
      </div>
    );
  }

  if (!detail) {
    return <Empty description="Không tìm thấy chi tiết đợt quét." />;
  }

  const candidates = detail.detection?.aiCandidates || [];
  const profiles = detail.detection?.leadProfiles || [];
  const items = detail.items || [];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Scan ID">{detail.id}</Descriptions.Item>
        <Descriptions.Item label="Session">
          {detail.scanSessionId}
        </Descriptions.Item>
        <Descriptions.Item label="Bài viết">
          {detail.postUrl ? (
            <a href={detail.postUrl} target="_blank" rel="noreferrer">
              {detail.postUrl}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Detector">
          {detail.detection?.detectorVersion || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Dữ liệu">
          {detail.itemCount} item, {detail.acceptedItems} mới, {detail.duplicateItems}{' '}
          trùng
        </Descriptions.Item>
      </Descriptions>

      <div>
        <Title level={4} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 6 }}>
          1. AI candidates & Chứng minh
        </Title>
        {candidates.length ? (
          <List
            dataSource={candidates}
            renderItem={(profile) => (
              <List.Item>
                <LeadProfileSummary profile={profile} expanded />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa có candidate đủ điểm." />
        )}
      </div>

      <div>
        <Title level={4} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 6 }}>
          Tất cả profile đã phân loại
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {profiles.length} hồ sơ
        </Text>
        {profiles.length ? (
          <List
            dataSource={profiles}
            renderItem={(profile) => (
              <List.Item>
                <LeadProfileSummary profile={profile} expanded={false} />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa có hồ sơ được phân loại." />
        )}
      </div>

      <div>
        <Title level={4} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 6 }}>
          2. Toàn bộ bình luận đã lưu trong DB (theo postId)
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {items.length} bình luận / bài viết
        </Text>
        <AllCommentsList items={items} />
      </div>
    </Space>
  );
}

function AllCommentsList({ items }: { items: any[] }) {
  if (!items || !items.length) {
    return <Empty description="Không có bình luận nào." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0', width: '100%' }}>
      {items.map((item: any, index: number) => {
        const isPost = item.kind === 'POST';
        const author = item.authorName || 'Ẩn danh';
        const depth = item.depth || 0;
        const indent = depth * 24;

        return (
          <div
            key={item.commentId || item.fingerprint || index}
            style={{
              display: 'flex',
              gap: '12px',
              paddingLeft: `${indent}px`,
              position: 'relative',
              alignItems: 'flex-start',
            }}
          >
            {depth > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(depth - 1) * 24 + 12}px`,
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
                background: isPost ? '#1890ff' : '#d9d9d9',
                color: isPost ? '#fff' : '#000',
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
                background: isPost ? 'rgba(24, 144, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                border: isPost ? '1px solid rgba(24, 144, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.06)',
                padding: '8px 12px',
                borderRadius: '12px',
                position: 'relative',
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
}

function LeadProfileSummary({
  profile,
  expanded = false,
}: {
  profile: LeadProfile;
  expanded?: boolean;
}) {
  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space wrap>
        {profile.authorUrl ? (
          <a href={profile.authorUrl} target="_blank" rel="noreferrer">
            <Text strong>{profile.authorName}</Text>
          </a>
        ) : (
          <Text strong>{profile.authorName}</Text>
        )}
        <Tag color={levelColors[profile.leadLevel]}>
          {profile.leadLevel} · {profile.leadScore}/100
        </Tag>
        <Tag color={classificationColors[profile.classification]}>
          {classificationLabels[profile.classification]}
        </Tag>
      </Space>
      <Text type="secondary">{profile.reasons.join(' · ') || '-'}</Text>
      {expanded ? (
        <List
          size="small"
          dataSource={profile.evidence || []}
          renderItem={(evidence, idx) => (
            <List.Item style={{ padding: '4px 0', border: 'none' }}>
              <div style={{ width: '100%', marginBottom: idx < profile.evidence.length - 1 ? 12 : 0 }}>
                {renderEvidenceThread(evidence, profile.authorName)}
              </div>
            </List.Item>
          )}
        />
      ) : null}
    </Space>
  );
}

export default function FacebookLeadScans() {
  return (
    <App>
      <FacebookLeadScansInner />
    </App>
  );
}
