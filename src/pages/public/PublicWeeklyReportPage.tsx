import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, Spin, Empty, Typography, Button, Space, QRCode, Modal } from 'antd';
import { Printer, QrCode as QrIcon, Share2, BookOpen, Check } from 'lucide-react';
import { weeklyReportService } from '../../services/weekly-report.service';
import type { WeeklyReportData } from '../../services/weekly-report.service';
import { WeeklyReportCard } from '../../components/WeeklyReportCard';

const { Title, Text } = Typography;

export const PublicWeeklyReportPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchParams] = useSearchParams();

  const typeParam = searchParams.get('type') === 'month' ? 'month' : 'week';
  const weekParam = searchParams.get('week') ? parseInt(searchParams.get('week')!, 10) : undefined;
  const monthParam = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;
  const yearParam = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    weeklyReportService
      .getPublicReport(studentId, {
        type: typeParam,
        week: weekParam,
        month: monthParam,
        year: yearParam,
      })
      .then((res) => {
        if (res.success && res.data) {
          setReport(res.data);
        } else {
          setReport(null);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải phiếu báo cáo công khai:', err);
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [studentId, typeParam, weekParam, monthParam, yearParam]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '16px 12px 48px' }}>
      {/* PUBLIC HEADER BAR */}
      <div
        className="no-print"
        style={{
          maxWidth: 880,
          margin: '0 auto 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
              DAO EDU • CỔNG THÔNG TIN PHỤ HUYNH
            </Title>
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              Tra cứu & Xem phiếu báo cáo kết quả học tập trực tuyến
            </Text>
          </div>
        </div>

        <Space wrap>
          <Button
            icon={<QrIcon size={15} />}
            onClick={() => setQrModalVisible(true)}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            Mã QR / Chia sẻ
          </Button>
          <Button
            type="primary"
            icon={<Printer size={15} />}
            onClick={handlePrint}
            style={{ borderRadius: 6, fontWeight: 600, background: '#4f46e5' }}
          >
            In báo cáo
          </Button>
        </Space>
      </div>

      {/* REPORT CONTENT */}
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {loading ? (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 14, color: '#64748b', fontSize: 14 }}>
              Đang tải phiếu báo cáo kết quả học tập của con...
            </div>
          </Card>
        ) : report ? (
          <WeeklyReportCard
            report={report}
            isMonthly={typeParam === 'month'}
            isEditable={false}
          />
        ) : (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: '50px 20px' }}>
            <Empty
              description={
                <div style={{ marginTop: 12 }}>
                  <Text strong style={{ fontSize: 16, color: '#0f172a', display: 'block' }}>
                    Không tìm thấy phiếu báo cáo
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748b', marginTop: 6, display: 'block' }}>
                    Phiếu báo cáo trong khoảng thời gian này chưa được phát hành hoặc đường liên kết chưa chính xác.
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>

      {/* MODAL QR CODE & SHARE LINK */}
      <Modal
        title="Mã QR & Chia Sẻ Báo Cáo"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={420}
        centered
      >
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <div style={{ display: 'inline-block', padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <QRCode value={currentUrl} size={200} bordered={false} />
          </div>
          <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
            Quét mã QR để mở trực tiếp trên điện thoại
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 16 }}>
            Phụ huynh có thể quét mã bằng Camera hoặc Zalo để xem ngay mà không cần tài khoản.
          </div>

          <Button
            type="primary"
            icon={copied ? <Check size={15} /> : <Share2 size={15} />}
            onClick={handleCopyLink}
            style={{ width: '100%', borderRadius: 6, height: 38, fontWeight: 600 }}
          >
            {copied ? 'Đã sao chép liên kết vào bộ nhớ tạm!' : 'Sao chép liên kết báo cáo'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PublicWeeklyReportPage;
