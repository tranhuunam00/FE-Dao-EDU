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
        {selected ? <ScanDetail scan={selected} /> : null}
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

function ScanDetail({ scan }: { scan: FacebookLeadScan }) {
  const candidates = scan.detection?.aiCandidates || [];
  const profiles = scan.detection?.leadProfiles || [];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Scan ID">{scan.id}</Descriptions.Item>
        <Descriptions.Item label="Session">
          {scan.scanSessionId}
        </Descriptions.Item>
        <Descriptions.Item label="Bài viết">
          {scan.postUrl ? (
            <a href={scan.postUrl} target="_blank" rel="noreferrer">
              {scan.postUrl}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Detector">
          {scan.detection?.detectorVersion || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Dữ liệu">
          {scan.itemCount} item, {scan.acceptedItems} mới, {scan.duplicateItems}{' '}
          trùng
        </Descriptions.Item>
      </Descriptions>

      <div>
        <Title level={4}>AI candidates</Title>
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
        <Title level={4}>Tất cả profile đã phân loại</Title>
        <Text type="secondary">{profiles.length} hồ sơ</Text>
      </div>
    </Space>
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
          renderItem={(evidence) => (
            <List.Item>
              <Space direction="vertical" size={2}>
                <Text type="secondary">
                  {evidence.kind} cấp {evidence.depth} · {evidence.itemLeadScore}
                  /100
                </Text>
                <Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 3 }}>
                  {evidence.text || '(Không có text)'}
                </Paragraph>
              </Space>
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
