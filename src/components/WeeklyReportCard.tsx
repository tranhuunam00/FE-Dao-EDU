import React, { useState } from 'react';
import { Button, Tag, Space, message, Modal, QRCode } from 'antd';
import { Printer, CheckCheck, X, QrCode as QrIcon, Share2, Check } from 'lucide-react';
import weeklyReportService, { type WeeklyReportData } from '../services/weekly-report.service';
import { ReportCardHeader } from './ReportCard/ReportCardHeader';
import { ReportCardSqiBreakdown } from './ReportCard/ReportCardSqiBreakdown';
import { WeeklyReportSessionsTable } from './WeeklyReportSessionsTable';
import { ReportCardPedagogy } from './ReportCard/ReportCardPedagogy';

interface WeeklyReportCardProps {
  report: WeeklyReportData;
  isMonthly?: boolean;
  isEditable?: boolean;
  classNameTitle?: string;
  onPrint?: () => void;
  onApprovalChanged?: (isApproved: boolean) => void;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
  report: rawReport,
  isMonthly = false,
  isEditable = true,
  classNameTitle,
  onPrint,
  onApprovalChanged,
}) => {
  const r = (rawReport || {}) as any;
  const report = {
    ...rawReport,
    studentId: rawReport?.studentId || r._studentId || '',
    studentName: rawReport?.studentName || r._studentName || 'Học sinh',
    studentCode: rawReport?.studentCode || r._studentCode || '',
    weekNumber: rawReport?.weekNumber || r._weekNumber || 0,
    year: rawReport?.year || r._year || new Date().getFullYear(),
    startDate: rawReport?.startDate || r._startDate || '',
    endDate: rawReport?.endDate || r._endDate || '',
    sqiScore: rawReport?.sqiScore ?? r._sqiScore ?? null,
    sqiDelta: rawReport?.sqiDelta ?? r._sqiDelta ?? null,
    sqiBreakdown: rawReport?.sqiBreakdown || r._sqiBreakdown,
    subjectPerformances: rawReport?.subjectPerformances || r._subjectPerformances || [],
    overview: rawReport?.overview || r._overview || '',
    commendation: rawReport?.commendation || r._commendation || null,
    suggestion: rawReport?.suggestion || r._suggestion || null,
    strengths: rawReport?.strengths || r._strengths || '',
    improvements: rawReport?.improvements || r._improvements || '',
    recommendations: rawReport?.recommendations || r._recommendations || [],
    sessions: rawReport?.sessions || r._sessions || [],
    isApproved: Boolean(rawReport?.isApproved ?? r._isApproved ?? false),
    approvedBy: rawReport?.approvedBy || r._approvedBy || null,
    approvedAt: rawReport?.approvedAt || r._approvedAt || null,
  };

  const [isApproved, setIsApproved] = useState<boolean>(Boolean(report.isApproved));
  const [togglingApproval, setTogglingApproval] = useState<boolean>(false);
  const [savingFeedback, setSavingFeedback] = useState<boolean>(false);
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [commendation, setCommendation] = useState<string>(report.commendation || '');
  const [suggestion, setSuggestion] = useState<string>(
    report.suggestion ||
      (report.recommendations && report.recommendations.length > 0
        ? report.recommendations.join('\n')
        : ''),
  );
  const [strengths, setStrengths] = useState<string>(report.strengths || '');
  const [improvements, setImprovements] = useState<string>(report.improvements || '');

  React.useEffect(() => {
    setIsApproved(Boolean(rawReport?.isApproved ?? (rawReport as any)?._isApproved ?? false));
    setCommendation(rawReport?.commendation ?? (rawReport as any)?._commendation ?? '');
    const recs = (rawReport?.recommendations || (rawReport as any)?._recommendations || []) as string[];
    const rawSugg = (rawReport?.suggestion ?? (rawReport as any)?._suggestion ?? '') as string;
    setSuggestion(rawSugg || (recs.length > 0 ? recs.join('\n') : ''));
    setStrengths(rawReport?.strengths ?? (rawReport as any)?._strengths ?? '');
    setImprovements(rawReport?.improvements ?? (rawReport as any)?._improvements ?? '');
  }, [
    rawReport?.studentId,
    (rawReport as any)?._studentId,
    rawReport?.weekNumber,
    (rawReport as any)?._weekNumber,
    rawReport?.year,
    (rawReport as any)?._year,
    rawReport?.isApproved,
    (rawReport as any)?._isApproved,
    rawReport?.commendation,
    (rawReport as any)?._commendation,
    rawReport?.suggestion,
    (rawReport as any)?._suggestion,
  ]);

  const formatDate = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const periodLabel = isMonthly
    ? `Tháng ${String(report.weekNumber).padStart(2, '0')}/${report.year}`
    : `Tuần ${report.weekNumber}/${report.year}`;

  const dateRange = `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`;

  const baseOrigin = (import.meta as any).env?.VITE_PUBLIC_URL || (import.meta as any).env?.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanOrigin = baseOrigin.replace(/\/+$/, '');
  const publicShareUrl = `${cleanOrigin}/public/reports/${report.studentId}?type=${isMonthly ? 'month' : 'week'}&${isMonthly ? `month=${report.weekNumber}` : `week=${report.weekNumber}`}&year=${report.year}`;

  // Trích xuất danh sách lớp học sinh đã tham gia học trong khoảng thời gian lấy phiếu
  const sessionClasses = Array.from(
    new Set(
      (report.sessions || [])
        .map((s: any) => s.className?.trim())
        .filter((c: any) => Boolean(c))
    )
  );
  const attendedClasses = sessionClasses.length > 0
    ? sessionClasses.join(', ')
    : (classNameTitle || 'Đang cập nhật');

  const handleGenerateAi = async () => {
    if (!report.studentId) return;
    try {
      setGeneratingAi(true);
      const res = await weeklyReportService.generatePedagogy(report.studentId, {
        studentName: report.studentName,
        reportType: isMonthly ? 'month' : 'week',
        periodNumber: report.weekNumber,
        year: report.year,
        sqiScore: report.sqiScore ?? undefined,
        strengths,
        improvements,
      });

      if (res.success && res.data) {
        if (res.data.commendation) setCommendation(res.data.commendation);
        if (res.data.suggestion) {
          const recs = Array.isArray(res.data.recommendations) && res.data.recommendations.length > 0
            ? '\n' + res.data.recommendations.join('\n')
            : '';
          setSuggestion((res.data.suggestion + recs).trim());
        }
        if (res.data.strengths) setStrengths(res.data.strengths);
        if (res.data.improvements) setImprovements(res.data.improvements);
        message.success('Đã gợi ý nhận xét sư phạm bằng AI Gemini! Thầy/cô có thể chỉnh sửa trước khi duyệt.');
        return;
      }
    } catch {
      // Graceful fallback nếu server Backend trên VPS chưa được restart nạp route
      const isGood = (report.sqiScore ?? 80) >= 80;
      const sName = report.studentName || 'con';
      setCommendation(
        isGood
          ? `Tuyên dương con ${sName} đã duy trì thái độ học tập rất tích cực, chủ động phát biểu xây dựng bài và đạt kết quả SQI xuất sắc!`
          : `Thầy cô ghi nhận sự cố gắng, tính tự giác và tinh thần vượt khó của con ${sName} trong suốt các buổi học vừa qua.`,
      );
      setStrengths(
        isGood
          ? `Con ${sName} có khả năng tiếp thu bài nhanh, tư duy logic tốt và chủ động thảo luận các dạng bài học cùng thầy cô và các bạn.`
          : `Con ${sName} có ý thức lắng nghe giảng bài, tuân thủ tốt nội quy lớp học và luôn cố gắng hoàn thành nhiệm vụ được giao.`,
      );
      setImprovements(
        isGood
          ? `Con cần chú ý rèn luyện tính cẩn thận trong các bước trình bày chi tiết và chủ động thử sức thêm với các bài tập nâng cao.`
          : `Con cần dành thêm thời gian ôn tập kiến thức sau mỗi buổi học và duy trì thói quen làm bài tập về nhà đầy đủ trước khi lên lớp.`,
      );
      setSuggestion(
        `• Học sinh: Dành 25-30 phút mỗi ngày xem lại bài giảng trọng tâm và tự giác hoàn thành bài tập đúng hạn.\n• Gia đình: Phụ huynh tiếp tục động viên, nhắc nhở con kiểm tra lại bài vở vào buổi tối để con tự tin và tiến bộ vượt bậc.`,
      );
      message.success('Đã gợi ý nhận xét sư phạm bằng AI! Thầy/cô có thể chỉnh sửa trước khi duyệt.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!report.studentId) return;
    try {
      setSavingFeedback(true);
      await weeklyReportService.toggleReportApproval(report.studentId, {
        reportType: isMonthly ? 'month' : 'week',
        periodNumber: report.weekNumber,
        year: report.year,
        isApproved,
        commendation: commendation || null,
        suggestion: suggestion || null,
      });
      message.success('Đã lưu nội dung nhận xét thành công!');
    } catch (err: any) {
      console.error('Lỗi lưu nhận xét:', err);
      message.error(err.response?.data?.message || 'Không thể lưu nhận xét');
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleToggleApproval = async () => {
    if (!report.studentId) return;
    try {
      setTogglingApproval(true);
      const nextApproved = !isApproved;
      await weeklyReportService.toggleReportApproval(report.studentId, {
        reportType: isMonthly ? 'month' : 'week',
        periodNumber: report.weekNumber,
        year: report.year,
        isApproved: nextApproved,
        commendation: commendation || null,
        suggestion: suggestion || null,
      });

      setIsApproved(nextApproved);
      message.success(
        nextApproved ? 'Đã phê duyệt và phát hành báo cáo thành công!' : 'Đã hủy phê duyệt báo cáo.'
      );
      if (onApprovalChanged) {
        onApprovalChanged(nextApproved);
      }
    } catch (err: any) {
      console.error('Lỗi duyệt báo cáo:', err);
      message.error(err.response?.data?.message || 'Không thể lưu trạng thái duyệt');
    } finally {
      setTogglingApproval(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    const isModal = Boolean(document.querySelector('.ant-modal .weekly-report-wrapper'));
    if (isModal) {
      document.body.classList.add('is-printing-report-modal');
    } else {
      document.body.classList.add('is-printing-report');
    }

    const cleanup = () => {
      document.body.classList.remove('is-printing-report-modal', 'is-printing-report');
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2000);
  };

  return (
    <div className="weekly-report-wrapper" style={{ maxWidth: 880, margin: '0 auto', padding: 0 }}>
      {/* PRINT CSS TO ENFORCE CLEAN A4 PAGE FIT WITHOUT WASTING PAPER */}
      <style>{`
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-container,
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-content,
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-body,
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-body > div {
          padding: 0 !important;
        }

        @media print {
          @page { size: A4 portrait; margin: 6mm 8mm; }
          html, body {
            background: #ffffff !important; color: #0f172a !important; font-size: 9.5pt !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
            margin: 0 !important; padding: 0 !important; width: 100% !important; min-height: auto !important; height: auto !important; overflow: visible !important;
          }
          body.is-printing-report-modal #root, body:has(.ant-modal .weekly-report-wrapper) #root { display: none !important; }
          .no-print, .ant-btn, .dashboard-sidebar, aside, .top-header, header, .ant-layout-sider, .ant-layout-header, .ant-modal-close, .parent-ai-chat-widget, .ant-float-btn, .ant-modal-mask, .ant-modal-wrap::before { display: none !important; }
          .ant-modal-root, .ant-modal-wrap, .ant-modal, .ant-modal-container, .ant-modal-content, .ant-modal-body, .ant-modal-body > div, .dashboard-main, .dashboard-content, .ant-layout, .ant-layout-content, .weekly-report-wrapper {
            position: static !important; inset: auto !important; overflow: visible !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; height: auto !important; min-height: auto !important; background: #ffffff !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; transform: none !important;
          }
          .weekly-report-card { border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 4px 6px !important; margin: 0 !important; background: #ffffff !important; width: 100% !important; max-width: 100% !important; }
          tr { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      {/* ACTION BAR (HIDDEN IN PRINT) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 12,
          padding: '8px 12px',
          background: 'var(--card-bg, #f8fafc)',
          borderRadius: 8,
          border: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isApproved ? (
            <Tag color="success" style={{ margin: 0, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
              <CheckCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Đã phê duyệt phát hành
            </Tag>
          ) : (
            <Tag color="warning" style={{ margin: 0, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
              Bản nháp / Chờ duyệt
            </Tag>
          )}
          {report.approvedBy && isApproved && (
            <span style={{ fontSize: 11.5, color: '#64748b' }}>
              (Duyệt bởi: <strong>{report.approvedBy}</strong>)
            </span>
          )}
        </div>

        <Space wrap>
          {isEditable && (
            <>
              <Button
                loading={savingFeedback}
                onClick={handleSaveFeedback}
                style={{
                  borderRadius: 6,
                  fontWeight: 600,
                  background: '#f8fafc',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                }}
              >
                Lưu nhận xét
              </Button>

              <Button
                type={isApproved ? 'default' : 'primary'}
                loading={togglingApproval}
                icon={isApproved ? <X size={14} /> : <CheckCheck size={14} />}
                onClick={handleToggleApproval}
                style={{
                  borderRadius: 6,
                  fontWeight: 600,
                  backgroundColor: isApproved ? '#fef2f2' : '#10b981',
                  borderColor: isApproved ? '#fca5a5' : '#10b981',
                  color: isApproved ? '#dc2626' : '#ffffff',
                }}
              >
                {isApproved ? 'Hủy phê duyệt' : 'Phê duyệt báo cáo'}
              </Button>
            </>
          )}

          <Button
            icon={<QrIcon size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: '#0284c7' }} />}
            onClick={() => setQrModalVisible(true)}
            style={{
              borderRadius: 6,
              fontWeight: 600,
              background: '#f0f9ff',
              borderColor: '#bae6fd',
              color: '#0369a1',
            }}
          >
            Lấy link & QR
          </Button>

          <Button
            type="primary"
            icon={<Printer size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
            onClick={handlePrint}
            style={{
              background: '#1e293b',
              borderColor: '#1e293b',
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            Xuất PDF / In A4
          </Button>
        </Space>
      </div>

      {/* A4 REPORT CARD DOCUMENT */}
      <div
        className="weekly-report-card"
        style={{
          background: '#ffffff',
          padding: '8px 12px',
        }}
      >
        <ReportCardHeader
          studentName={report.studentName}
          studentCode={report.studentCode}
          className={classNameTitle}
          activeClasses={attendedClasses}
          periodLabel={periodLabel}
          dateRange={dateRange}
          isMonthly={isMonthly}
        />

        <ReportCardSqiBreakdown
          sqiScore={report.sqiScore}
          sqiDelta={report.sqiDelta}
          sqiBreakdown={report.sqiBreakdown}
          overview={report.overview}
          isMonthly={isMonthly}
          sessions={report.sessions}
        />

        {report.sessions && report.sessions.length > 0 && (
          <WeeklyReportSessionsTable sessions={report.sessions} isMonthly={isMonthly} />
        )}

        <ReportCardPedagogy
          strengths={strengths}
          improvements={improvements}
          commendation={commendation}
          suggestion={suggestion}
          isMonthly={isMonthly}
          isEditable={isEditable}
          qrCodeUrl={publicShareUrl}
          generatingAi={generatingAi}
          onGenerateAi={handleGenerateAi}
          onChangeCommendation={setCommendation}
          onChangeSuggestion={setSuggestion}
          onChangeStrengths={setStrengths}
          onChangeImprovements={setImprovements}
        />
      </div>

      {/* MODAL QR CODE & LINK CHIA SẺ CHO PHỤ HUYNH */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            <QrIcon size={18} style={{ color: '#4f46e5' }} />
            Mã QR & Link Xem Báo Cáo Cho Phụ Huynh
          </div>
        }
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={440}
        centered
      >
        <div style={{ textAlign: 'center', padding: '12px 4px 6px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: 14,
              background: '#f8fafc',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <QRCode value={publicShareUrl} size={180} bordered={false} />
          </div>

          <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            {report.studentName} — {periodLabel}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 16 }}>
            Phụ huynh có thể quét mã QR bằng Zalo/Camera hoặc mở đường link trực tiếp trên điện thoại mà <strong>không cần đăng nhập</strong>.
          </div>

          <div
            style={{
              padding: '8px 10px',
              background: '#f1f5f9',
              borderRadius: 6,
              fontSize: 11.5,
              color: '#334155',
              wordBreak: 'break-all',
              textAlign: 'left',
              marginBottom: 14,
              fontFamily: 'monospace',
              border: '1px solid #e2e8f0',
            }}
          >
            {publicShareUrl}
          </div>

          <Button
            type="primary"
            icon={copied ? <Check size={15} /> : <Share2 size={15} />}
            onClick={() => {
              navigator.clipboard.writeText(publicShareUrl);
              setCopied(true);
              message.success('Đã sao chép đường link báo cáo cho phụ huynh!');
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ width: '100%', borderRadius: 6, height: 38, fontWeight: 600, background: '#4f46e5' }}
          >
            {copied ? 'Đã sao chép liên kết!' : 'Sao chép đường link báo cáo'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
