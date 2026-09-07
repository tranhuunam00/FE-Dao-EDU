import React from 'react';
import { Card, Button, Table, Typography, Tag, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import { cardStyle, compareVietnameseNames, fmtVND } from './utils';

const { Text } = Typography;

interface ClassAttendanceTabProps {
  data: any[] | null;
  loading: boolean;
}

export const ClassAttendanceTab: React.FC<ClassAttendanceTabProps> = ({ data, loading }) => {
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (data === null) return <Text style={{ color: 'var(--text-muted)' }}>Bấm "Xem báo cáo" để hiển thị dữ liệu.</Text>;
  if (data.length === 0) return <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy dữ liệu báo cáo phù hợp với bộ lọc.</Text>;

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    data.forEach(cls => {
      const sheetData: any[][] = [];
      
      // Title
      sheetData.push([`Báo cáo điểm danh lớp ${cls.className} (${cls.classCode})`]);
      sheetData.push([]); // blank row

      // Dynamic session date headers
      const sessionDates = (cls.sessions || []).map((sess: any) => dayjs(sess.date).format('DD/MM/YYYY'));
      const headers = [
        'STT', 'Mã HS', 'Họ tên', 'SĐT liên hệ',
        ...sessionDates,
        'Tổng số buổi', 'Đơn giá/buổi', 'Tổng học phí', 'Điểm ĐG trung bình'
      ];
      sheetData.push(headers);

      // Student rows
      let totalTuitionSum = 0;
      if (cls.students && cls.students.length > 0) {
        // Sort students alphabetically (Vietnamese friendly)
        const sortedStudents = [...cls.students].sort((a, b) => 
          compareVietnameseNames(a.studentName, b.studentName)
        );

        sortedStudents.forEach((s: any, idx: number) => {
          const row: any[] = [
            idx + 1,
            s.studentCode,
            s.studentName,
            s.mobile || '—',
          ];

          (cls.sessions || []).forEach((sess: any) => {
            const sessionData = s.attendance[sess.sessionId];
            if (!sessionData) {
              row.push('—');
            } else if (sessionData.isPresent) {
              const amount = sessionData.rate || 0;
              const isPaid = sessionData.paymentStatus === 'Paid';
              const statusText = isPaid ? 'Đã thu' : 'Chưa thu';
              row.push(`${amount.toLocaleString('vi-VN')} ₫ (${statusText})`);
            } else {
              row.push('0 ₫');
            }
          });

          const evals = (cls.sessions || [])
            .map((sess: any) => {
              const score = s.attendance[sess.sessionId]?.evaluationScore;
              if (score === null || score === undefined || String(score).trim() === '') return null;
              const num = Number(String(score).replace(',', '.'));
              return isNaN(num) ? null : num;
            })
            .filter((score: any) => score !== null);
          const avgScore = evals.length > 0 ? (evals.reduce((sum: number, val: number) => sum + val, 0) / evals.length).toFixed(1) : '—';

          row.push(
            s.presentCount,
            s.pricePerSession,
            s.totalTuition,
            avgScore === '—' ? '—' : Number(avgScore)
          );

          totalTuitionSum += s.totalTuition || 0;
          sheetData.push(row);
        });
      } else {
        sheetData.push(['Không có học viên nào trong lớp này']);
      }

      // Add accounting summary total row
      const blankSessionCells = (cls.sessions || []).map(() => '');
      const totalRow = [
        '', // STT
        '', // Student Code
        'Tổng cộng', // Student Name
        '', // Mobile
        ...blankSessionCells,
        '', // Present Count
        '', // Price Per Session
        totalTuitionSum, // Total Tuition
        '', // Average Score
      ];
      sheetData.push(totalRow);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // --- Styling Configurations for Excel ---
      const totalColumns = 8 + sessionDates.length;
      const numSessions = sessionDates.length;

      // 1. Merges
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } }
      ];

      // 2. Column widths
      const colWidths = Array(totalColumns).fill({ wch: 18 });
      colWidths[0] = { wch: 6 };  // STT
      colWidths[1] = { wch: 12 }; // Student Code
      colWidths[2] = { wch: 22 }; // Student Name
      colWidths[3] = { wch: 14 }; // Mobile
      colWidths[4 + numSessions] = { wch: 12 }; // Present count
      colWidths[4 + numSessions + 1] = { wch: 14 }; // Price per session
      colWidths[4 + numSessions + 2] = { wch: 15 }; // Total tuition
      colWidths[4 + numSessions + 3] = { wch: 18 }; // Avg evaluation
      ws['!cols'] = colWidths;

      // 3. Cells style declaration
      const styleTitle = {
        font: { bold: true, name: 'Arial', size: 13 },
        alignment: { vertical: 'center', horizontal: 'left' }
      };

      const styleHeader = {
        font: { bold: true, name: 'Arial', size: 10 },
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        fill: { fgColor: { rgb: 'F3F4F6' } }, // light gray bg
        border: {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } }
        }
      };

      const styleDataCommon = {
        font: { name: 'Arial', size: 10 },
        border: {
          top: { style: 'thin', color: { rgb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          left: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } }
        }
      };

      const range = XLSX.utils.decode_range(ws['!ref'] || '');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellRef]) continue;

          // Title row styling
          if (R === 0) {
            ws[cellRef].s = styleTitle;
            continue;
          }
          if (R === 1) continue;

          // Table headers styling
          if (R === 2) {
            ws[cellRef].s = styleHeader;
            continue;
          }

          // Total row styling
          if (R === range.e.r) {
            const isTotalTuitionCell = (C === 4 + numSessions + 2);
            ws[cellRef].s = {
              font: { bold: true, name: 'Arial', size: 10 },
              border: {
                top: { style: 'thin', color: { rgb: '999999' } },
                bottom: { style: 'double', color: { rgb: '000000' } }, // accountant double bottom border
                left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                right: { style: 'thin', color: { rgb: 'CCCCCC' } }
              },
              alignment: {
                vertical: 'center',
                horizontal: isTotalTuitionCell ? 'right' : C === 2 ? 'left' : 'center'
              },
              fill: isTotalTuitionCell ? { fgColor: { rgb: 'FEF08A' } } : undefined // yellow highlighted
            };

            if (isTotalTuitionCell && ws[cellRef].v) {
              ws[cellRef].z = '#,##0'; // dynamic number separator formatting
            }
            continue;
          }

          // Data rows styling
          const alignHoriz = 
            C === 2 ? 'left' : 
            C === 1 || C === 3 ? 'center' : 
            (C >= 4 && C <= 4 + numSessions) ? 'right' : 
            C === 4 + numSessions + 1 || C === 4 + numSessions + 2 ? 'right' : 
            'center';

          ws[cellRef].s = {
            ...styleDataCommon,
            alignment: { vertical: 'center', horizontal: alignHoriz }
          };

          // Currency formats
          if ((C === 4 + numSessions + 1 || C === 4 + numSessions + 2) && typeof ws[cellRef].v === 'number') {
            ws[cellRef].z = '#,##0';
          }
          if (C >= 4 && C < 4 + numSessions && typeof ws[cellRef].v === 'number') {
            ws[cellRef].z = '#,##0';
          }
        }
      }

      const safeSheetName = cls.classCode.substring(0, 30).replace(/[\\/?*:[\]]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, safeSheetName || `Sheet ${cls.classId.substring(0, 5)}`);
    });

    XLSX.writeFile(wb, 'bc-diem-danh-theo-lop.xlsx');
  };

  return (
    <Card className="glass-panel" title="Báo cáo điểm danh theo Lớp" style={cardStyle}
      extra={<Button icon={<DownloadOutlined />} size="small" onClick={handleExportExcel} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>Xuất Excel</Button>}
    >
      <Table
        dataSource={data} rowKey="classId" pagination={{ pageSize: 15 }} size="small"
        columns={[
          { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 130 },
          { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
          { title: 'Tổng lượt điểm danh', dataIndex: 'totalSessions', key: 'totalSessions', width: 150, align: 'center' },
          { title: 'Có mặt', dataIndex: 'presentCount', key: 'presentCount', width: 110, align: 'center', render: (v) => <span style={{ color: '#10b981', fontWeight: 600 }}>{v}</span> },
          { title: 'Vắng mặt', dataIndex: 'absentCount', key: 'absentCount', width: 110, align: 'center', render: (v) => v > 0 ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{v}</span> : '0' },
          { title: 'Tỉ lệ chuyên cần', dataIndex: 'rate', key: 'rate', width: 150, align: 'center', render: (v) => <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}%</Tag> },
        ]}
        expandable={{
          expandedRowRender: (record: any) => {
            const sessionColumns = (record.sessions || []).map((sess: any) => ({
              title: dayjs(sess.date).format('DD/MM'),
              dataIndex: ['attendance', sess.sessionId],
              key: sess.sessionId,
              width: 80,
              align: 'center' as const,
              render: (sessionData: any) => {
                if (!sessionData) return '—';
                const score = sessionData.evaluationScore;
                const comment = sessionData.evaluationComment;
                const tooltipText = comment ? `Điểm: ${score ?? '—'} | Nhận xét: ${comment}` : score !== null && score !== undefined ? `Điểm: ${score}` : '';

                const isPaid = sessionData.paymentStatus === 'Paid';
                const paymentStatusText = isPaid ? 'Đã thu' : 'Chưa thu';
                const paymentStatusColor = isPaid ? '#10b981' : '#ef4444';

                return (
                  <div title={tooltipText} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {sessionData.isPresent ? (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{fmtVND(sessionData.rate)}</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>0 ₫</span>
                    )}
                    {sessionData.isPresent && (
                      <span style={{ fontSize: '11px', color: paymentStatusColor, fontWeight: 500, lineHeight: 1.2 }}>
                        ({paymentStatusText})
                      </span>
                    )}
                    {score !== null && score !== undefined && (
                      <span style={{ fontSize: '10px', color: 'var(--primary, #6366f1)', marginTop: 1, background: 'rgba(99,102,241,0.1)', padding: '0px 4px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                        ★ {score}
                      </span>
                    )}
                  </div>
                );
              }
            }));

            const studentColumns = [
              { title: 'STT', key: 'stt', width: 50, render: (_: any, __: any, index: number) => index + 1 },
              { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 100 },
              { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName', width: 180 },
              { title: 'SĐT liên hệ', dataIndex: 'mobile', key: 'mobile', width: 120 },
              ...sessionColumns,
              { title: 'Tổng số buổi', dataIndex: 'presentCount', key: 'presentCount', width: 110, align: 'center' as const, render: (v: number) => <b>{v}</b> },
              { title: 'Đơn giá/buổi', dataIndex: 'pricePerSession', key: 'pricePerSession', width: 110, align: 'right' as const, render: (v: number) => fmtVND(v) },
              { title: 'Tổng học phí', dataIndex: 'totalTuition', key: 'totalTuition', width: 120, align: 'right' as const, render: (v: number) => <b>{fmtVND(v)}</b> },
              { title: 'Điểm ĐG trung bình', key: 'avgEvaluation', width: 110, align: 'center' as const, render: (_: any, s: any) => {
                  const evals = (record.sessions || [])
                    .map((sess: any) => {
                      const score = s.attendance[sess.sessionId]?.evaluationScore;
                      if (score === null || score === undefined || String(score).trim() === '') return null;
                      const num = Number(String(score).replace(',', '.'));
                      return isNaN(num) ? null : num;
                    })
                    .filter((score: any) => score !== null);
                  if (evals.length === 0) return '—';
                  const avg = evals.reduce((sum: number, val: number) => sum + val, 0) / evals.length;
                  return <b>{avg.toFixed(1)}</b>;
                }
              },
            ];

            return (
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.01)', borderRadius: 8, border: '1px solid var(--card-border)', overflowX: 'auto' }}>
                <h4 style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>Danh sách điểm danh lớp {record.className}</h4>
                {(!record.students || record.students.length === 0) ? (
                  <Text type="secondary" style={{ fontSize: 13 }}>Không có học viên nào.</Text>
                ) : (
                  <Table
                    dataSource={[...(record.students || [])].sort((a, b) => compareVietnameseNames(a.studentName, b.studentName))}
                    rowKey="studentId"
                    pagination={false}
                    size="small"
                    columns={studentColumns}
                  />
                )}
              </div>
            );
          },
          rowExpandable: (record: any) => record.students && record.students.length > 0,
        }}
      />
    </Card>
  );
};
