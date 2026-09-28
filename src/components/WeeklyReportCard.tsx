import React, { useState } from 'react';
import { Button, Tag, Space, message } from 'antd';
import { Printer, CheckCheck, X, Share2 } from 'lucide-react';
import weeklyReportService, { type WeeklyReportData } from '../services/weekly-report.service';
import { ReportCardHeader } from './ReportCard/ReportCardHeader';
import { ReportCardSqiBreakdown } from './ReportCard/ReportCardSqiBreakdown';
import { WeeklyReportSessionsTable } from './WeeklyReportSessionsTable';
import { ReportCardPedagogy } from './ReportCard/ReportCardPedagogy';

interface WeeklyReportCardProps {
  report: WeeklyReportData;
  isMonthly?: boolean;
  classNameTitle?: string;
  onPrint?: () => void;
  onApprovalChanged?: (isApproved: boolean) => void;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
  report: rawReport,
  isMonthly = false,
  classNameTitle,
  onPrint,
  onApprovalChanged,
}) => {
  const r = (rawReport || {}) as any;
  const report = {
    ...rawReport,
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
    isApproved: rawReport?.isApproved ?? r._isApproved ?? false,
    approvedBy: rawReport?.approvedBy || r._approvedBy || null,
    approvedAt: rawReport?.approvedAt || r._approvedAt || null,
  };

  const [isApproved, setIsApproved] = useState<boolean>(report.isApproved);
  const [togglingApproval, setTogglingApproval] = useState<boolean>(false);

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
        commendation: report.commendation,
        suggestion: report.suggestion,
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

  const handleSendZalo = () => {
    const textContent = `DAO EDU - KẾT QUẢ HỌC TẬP ${isMonthly ? 'THÁNG' : 'TUẦN'}\n` +
      `Kính gửi Phụ huynh em: ${report.studentName} (${report.studentCode})\n` +
      `Thời gian: ${periodLabel} (${dateRange})\n` +
      `Điểm chất lượng (SQI): ${report.sqiScore !== null ? `${report.sqiScore}/100` : '—'}\n` +
      `Đánh giá chung: ${report.overview || 'Con học tập chăm chỉ và tiến bộ tốt.'}\n` +
      (report.commendation ? `Tuyên dương: ${report.commendation}\n` : '') +
      `Phụ huynh vui lòng xem chi tiết phiếu báo cáo tại cổng học viên DAO EDU.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textContent);
      message.success('Đã sao chép nội dung tóm tắt báo cáo để gửi Zalo cho Phụ huynh!');
    } else {
      message.info('Báo cáo đã sẵn sàng gửi cho Phụ huynh.');
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
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 9.5pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          body.is-printing-report-modal #root,
          body:has(.ant-modal .weekly-report-wrapper) #root {
            display: none !important;
          }

          .no-print,
          .ant-btn,
          .dashboard-sidebar,
          aside,
          .top-header,
          header,
          .ant-layout-sider,
          .ant-layout-header,
          .ant-modal-close,
          .parent-ai-chat-widget,
          .ant-float-btn {
            display: none !important;
          }

          .ant-modal-mask,
          .ant-modal-wrap::before {
            display: none !important;
          }
          .ant-modal-root,
          .ant-modal-wrap {
            position: static !important;
            inset: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
          }
          .ant-modal {
            position: static !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }
          .ant-modal-container,
          .ant-modal-content {
            position: static !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .ant-modal-body,
          .ant-modal-body > div {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            width: 100% !important;
          }

          .dashboard-main,
          .dashboard-content,
          .ant-layout,
          .ant-layout-content {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            min-height: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }

          .weekly-report-wrapper {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .weekly-report-card {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 4px 6px !important;
            margin: 0 !important;
            background: #ffffff !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
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

          <Button
            icon={<Share2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
            onClick={handleSendZalo}
            style={{
              borderRadius: 6,
              fontWeight: 600,
              background: '#0068ff',
              borderColor: '#0068ff',
              color: '#ffffff',
            }}
          >
            Gửi Zalo cho PH
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
        />

        {report.sessions && report.sessions.length > 0 && (
          <WeeklyReportSessionsTable sessions={report.sessions} isMonthly={isMonthly} />
        )}

        <ReportCardPedagogy
          strengths={report.strengths}
          improvements={report.improvements}
          recommendations={report.recommendations}
          commendation={report.commendation}
          suggestion={report.suggestion}
          isMonthly={isMonthly}
        />
      </div>
    </div>
  );
};
