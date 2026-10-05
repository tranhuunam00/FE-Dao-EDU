import React from 'react';
import {
  FileText,
  ChevronDown,
  Download,
  Eye,
  Copy,
} from 'lucide-react';
import { CalloutBadge } from './CalloutBadge';

export const EducareWeeklyReportListScreen: React.FC = () => {
  const students = [
    { id: 'STU-1074', name: 'Bùi Gia Linh', sqi: '83.3', diff: '+0.8', up: true },
    { id: 'STU-1025', name: 'Bùi Nguyễn Bảo An', sqi: '83.3', diff: '-3.4', up: false },
    { id: 'STU-1026', name: 'Chử Thảo Hiền', sqi: '87.5', diff: '-4.2', up: false },
    { id: 'STU-1085', name: 'Hoàng Tuệ Lâm', sqi: '87.5', diff: '-0', up: true },
    { id: 'STU-1039', name: 'Nguyễn Bảo Khánh', sqi: '87.5', diff: '-2.7', up: false },
    { id: 'STU-1029', name: 'Nguyễn Chí Tiến', sqi: '75', diff: '-14.9', up: false },
  ];

  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f8fafc',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        margin: '16px 0 28px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12.5px',
      }}
    >
      {/* ── BROWSER URL BAR SIMULATION ── */}
      <div
        style={{
          background: '#f1f5f9',
          padding: '6px 14px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        </div>
        <span style={{ background: '#ffffff', padding: '2px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '380px' }}>
          🔒 educare.home-care.vn/admin/weekly-reports
        </span>
      </div>

      <div style={{ display: 'flex' }}>
        {/* ── SIDEBAR SIMULATION (Ảnh 1) ── */}
        <div
          style={{
            width: '180px',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            padding: '12px 10px',
            flexShrink: 0,
            fontSize: '11.5px',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '6px' }}>
            CHỨC NĂNG
          </div>
          <div style={{ padding: '6px 8px', color: '#64748b' }}>Tổng quan</div>
          <div style={{ padding: '6px 8px', color: '#64748b' }}>Học sinh</div>
          <div style={{ padding: '6px 8px', color: '#64748b' }}>Giáo viên/Trợ giảng</div>
          <div style={{ padding: '6px 8px', color: '#64748b' }}>Lớp học</div>

          {/* Menu item Báo cáo tuần SQI có Callout đỏ [1] */}
          <div style={{ position: 'relative', margin: '4px 0' }}>
            <CalloutBadge num={1} top="-6px" right="-6px" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 8px',
                borderRadius: '6px',
                background: '#ecfdf5',
                color: '#047857',
                fontWeight: 700,
                border: '2px solid #ef4444',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
              }}
            >
              <FileText size={13} color="#047857" />
              <span>Báo cáo tuần SQI</span>
            </div>
          </div>

          <div style={{ padding: '6px 8px', color: '#64748b' }}>Đơn xin nghỉ</div>
          <div style={{ padding: '6px 8px', color: '#64748b' }}>Kế toán</div>
        </div>

        {/* ── MAIN CONTENT (Ảnh 1) ── */}
        <div style={{ flex: 1, padding: '16px 20px', background: '#f8fafc', overflowX: 'auto' }}>
          {/* Header & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Quản Trị Báo Cáo Tuần & Chất Lượng SQI
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Giám sát chất lượng học tập, chỉ số SQI và phân bổ học sinh theo tuần toàn hệ thống
              </div>
            </div>

            {/* Filter toolbar có Callout đỏ [2] */}
            <div style={{ position: 'relative' }}>
              <CalloutBadge num={2} top="-8px" left="-8px" />
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  background: '#ffffff',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: '2px solid #ef4444',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', background: '#ffffff', color: '#475569', fontSize: '11px' }}>
                  Tất cả cơ sở <ChevronDown size={11} style={{ display: 'inline' }} />
                </div>
                <div style={{ border: '1px solid #059669', padding: '3px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '11px' }}>
                  SINH 8 (SINH8) <ChevronDown size={11} style={{ display: 'inline' }} />
                </div>
                <div style={{ display: 'inline-flex', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', fontSize: '11px' }}>
                  <span style={{ padding: '3px 8px', background: '#047857', color: '#ffffff', fontWeight: 700 }}>Theo Tháng</span>
                  <span style={{ padding: '3px 8px', background: '#ffffff', color: '#64748b' }}>Theo Tuần</span>
                </div>
                <div style={{ border: '1px solid #cbd5e1', padding: '3px 6px', borderRadius: '4px', fontSize: '11px' }}>Tháng 10</div>
                <div style={{ border: '1px solid #cbd5e1', padding: '3px 6px', borderRadius: '4px', fontSize: '11px' }}>2026</div>
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#047857',
                    border: 'none',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <Download size={11} /> Xuất Excel & Link QR
                </button>
              </div>
            </div>
          </div>

          {/* 3 Summary Stat Cards (Ảnh 1) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SQI Trung Bình Lớp</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                85.4 <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>/ 100</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tổng Học Sinh</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                16 <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>bạn</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>Phân Bổ Chất Lượng Học Sinh</div>
              <div style={{ height: '8px', width: '100%', borderRadius: '4px', background: '#2563eb', display: 'flex', overflow: 'hidden' }}>
                <span style={{ width: '8%', background: '#10b981' }} />
                <span style={{ width: '92%', background: '#2563eb' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>● Xuất sắc: 1</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>● Giỏi: 11</span>
                <span>● Khá: 0</span>
              </div>
            </div>
          </div>

          {/* Students SQI Table (Ảnh 1) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Học sinh</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Chỉ số SQI</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Phân loại</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Chuyên cần</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Bài tập</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Trạng thái duyệt</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Đã gửi PH</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => (
                  <tr
                    key={st.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx === 0 ? '#fef2f2' : idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Mã: {st.id}</div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '13px' }}>{st.sqi}</span>{' '}
                      <span style={{ fontSize: '10.5px', color: st.up ? '#16a34a' : '#dc2626' }}>{st.diff}</span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        Giỏi
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>100%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                        Bản nháp
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>
                      Chưa gửi
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        {idx === 0 ? (
                          /* Nút Xem thiệp của Bùi Gia Linh được Callout đỏ [3] */
                          <div style={{ position: 'relative' }}>
                            <CalloutBadge num={3} top="-8px" left="-8px" />
                            <button
                              type="button"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                background: '#ffffff',
                                border: '2px solid #ef4444',
                                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                                color: '#0284c7',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Eye size={12} /> Xem thiệp
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#0284c7',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={12} /> Xem thiệp
                          </button>
                        )}

                        <span style={{ color: '#0284c7', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <Copy size={11} /> Copy link
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
