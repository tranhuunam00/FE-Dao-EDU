import React from 'react';
import { Button } from 'antd';
import { Printer } from 'lucide-react';
import type { WeeklyReportData } from '../services/weekly-report.service';
import { ReportCardHeader } from './ReportCard/ReportCardHeader';
import { ReportCardSqiBreakdown } from './ReportCard/ReportCardSqiBreakdown';
import { WeeklyReportSessionsTable } from './WeeklyReportSessionsTable';
import { ReportCardPedagogy } from './ReportCard/ReportCardPedagogy';

interface WeeklyReportCardProps {
  report: WeeklyReportData;
  isMonthly?: boolean;
  classNameTitle?: string;
  onPrint?: () => void;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
  report: rawReport,
  isMonthly = false,
  classNameTitle,
  onPrint,
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
    sqiScore: rawReport?.sqiScore ?? r._sqiScore ?? 0,
    sqiDelta: rawReport?.sqiDelta ?? r._sqiDelta ?? 0,
    sqiBreakdown: rawReport?.sqiBreakdown || r._sqiBreakdown,
    subjectPerformances: rawReport?.subjectPerformances || r._subjectPerformances || [],
    overview: rawReport?.overview || r._overview || '',
    strengths: rawReport?.strengths || r._strengths || '',
    improvements: rawReport?.improvements || r._improvements || '',
    recommendations: rawReport?.recommendations || r._recommendations || [],
    sessions: rawReport?.sessions || r._sessions || [],
  };

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

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    // Check if we are inside an Ant Design modal
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
        /* Zero out modal padding on screen */
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-container,
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-content,
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-body,
        .ant-modal:has(.weekly-report-wrapper) .ant-modal-body > div {
          padding: 0 !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 10mm 6mm 10mm;
          }
          /* Reset root, body, html to pure white background without margins */
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* When inside modal: hide the whole dashboard background (#root) */
          body.is-printing-report-modal #root,
          body:has(.ant-modal .weekly-report-wrapper) #root {
            display: none !important;
          }

          /* Hide app chrome, navigation, headers and buttons */
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

          /* Reset Ant Design modal overlay & wrappers so only the card renders */
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

          /* Reset page layout container when printed directly on page */
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

          /* Clean A4 document card styling - NO SHADOW, NO BORDER, FULL WIDTH */
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

          /* Tighten internal component paddings for standard A4 fit */
          .report-header-section {
            margin-bottom: 8px !important;
          }
          .report-header-branding {
            padding-bottom: 6px !important;
            margin-bottom: 8px !important;
          }
          .report-header-title {
            margin: 6px 0 8px !important;
          }
          .report-header-info {
            padding: 6px 10px !important;
            margin-bottom: 8px !important;
          }
          .report-sqi-hero {
            padding: 6px 10px !important;
            margin-bottom: 6px !important;
          }
          .report-sqi-grid {
            margin-bottom: 8px !important;
          }
          .report-sessions-table {
            margin-top: 6px !important;
            margin-bottom: 6px !important;
          }
          .report-pedagogy-section {
            margin-top: 6px !important;
          }
          .report-pedagogy-box {
            padding: 6px 10px !important;
            margin-bottom: 8px !important;
          }
          .report-signature-section {
            margin-top: 8px !important;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* ACTION BAR (HIDDEN IN PRINT) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <Button
          type="primary"
          icon={<Printer size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
          onClick={handlePrint}
          style={{
            background: '#1e293b',
            borderColor: '#1e293b',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          Xuất file PDF / In phiếu A4
        </Button>
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
          isMonthly={isMonthly}
        />
      </div>
    </div>
  );
};
