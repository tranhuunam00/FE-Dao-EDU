import React from 'react';
import {
  ArrowLeft,
  Users,
  Edit3,
  Calendar,
  Download,
  RotateCw,
  Plus,
  Trash2,
} from 'lucide-react';
import { CalloutBadge } from './CalloutBadge';

export const EducareClassScheduleScreen: React.FC = () => {
  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f8fafc',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        margin: '16px 0 28px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
      }}
    >
      {/* ── HEADER LỚP HỌC (Ảnh 1) ── */}
      <div
        style={{
          background: '#ffffff',
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#8b5cf6" />
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Lớp: SINH 8
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Mã lớp: SINH8 • Học phí Lớp Củng cố kiến thức THCS (SINH 8)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
            }}
          >
            <Edit3 size={14} /> Sửa lớp học
          </button>
          <span
            style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            Hoạt động
          </span>
        </div>
      </div>

      {/* ── TABS THANH ĐIỀU HƯỚNG LỚP HỌC (Ảnh 1) ── */}
      <div
        style={{
          background: '#ffffff',
          padding: '0 20px',
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '13px',
          fontWeight: 600,
          color: '#64748b',
        }}
      >
        <div style={{ padding: '12px 0' }}>Thông tin chung</div>
        <div style={{ padding: '12px 0' }}>Học sinh (16)</div>

        {/* Tab được khoanh đỏ callout [1] */}
        <div style={{ position: 'relative', padding: '12px 0' }}>
          <CalloutBadge num={1} top="-6px" right="-14px" />
          <div
            style={{
              color: '#047857',
              fontWeight: 700,
              borderBottom: '2.5px solid #047857',
              paddingBottom: '10px',
              border: '2px dashed #ef4444',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
          >
            Lịch dạy & Điểm danh (37)
          </div>
        </div>

        <div style={{ padding: '12px 0' }}>Bài tập</div>
        <div style={{ padding: '12px 0' }}>Tài liệu học tập</div>
      </div>

      {/* ── BẢNG LỊCH DẠY BÊN TRONG (Ảnh 1) ── */}
      <div style={{ padding: '18px 20px' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Danh sách các buổi học
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Hiển thị 5 / 37 buổi học theo lịch cố định và đột xuất.
            </div>
          </div>

          {/* Action Toolbar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} /> Lọc theo tháng:
              </span>
              <select
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#1e293b',
                  background: '#ffffff',
                }}
                defaultValue="10/2026"
              >
                <option value="10/2026">Tháng 10/2026 (5 buổi)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #38bdf8',
                  color: '#0284c7',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                <Download size={13} /> Xuất Excel lịch dạy
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px dashed #a855f7',
                  color: '#7c3aed',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                <RotateCw size={13} /> Sinh lại / Đồng bộ
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#047857',
                  border: 'none',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                <Plus size={14} /> Thêm buổi học đột xuất
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '9px 10px' }}>Ngày học</th>
                  <th style={{ padding: '9px 10px' }}>Giờ học</th>
                  <th style={{ padding: '9px 10px' }}>Phòng học</th>
                  <th style={{ padding: '9px 10px' }}>Giáo viên & Trợ giảng</th>
                  <th style={{ padding: '9px 10px' }}>Trạng thái</th>
                  <th style={{ padding: '9px 10px' }}>Tính học phí</th>
                  <th style={{ padding: '9px 10px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {/* DÒNG 1: BUỔI HỌC CẦN ĐIỂM DANH (Có Callout đỏ [2]) */}
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fef2f2' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>02/10/2026</td>
                  <td style={{ padding: '12px 10px', color: '#334155' }}>07:30 - 09:00</td>
                  <td style={{ padding: '12px 10px', color: '#334155' }}>Phòng số 01</td>
                  <td style={{ padding: '12px 10px', color: '#334155' }}>Lý Phương Thảo</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      Chưa diễn ra
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      Chưa tính
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Nút Điểm danh / Đổi lịch có khoanh đỏ số [2] */}
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <CalloutBadge num={2} top="-9px" left="-8px" />
                        <button
                          type="button"
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            border: '2px solid #ef4444',
                            boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Điểm danh / Đổi lịch
                        </button>
                      </div>

                      <button
                        type="button"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #38bdf8',
                          color: '#0284c7',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={12} /> Xuất đánh giá
                      </button>

                      <button
                        type="button"
                        style={{
                          background: '#047857',
                          border: 'none',
                          color: '#ffffff',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Các dòng tiếp theo */}
                {[
                  { date: '09/10/2026' },
                  { date: '16/10/2026' },
                  { date: '23/10/2026' },
                  { date: '30/10/2026' },
                ].map((row) => (
                  <tr key={row.date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#1e293b' }}>{row.date}</td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>07:30 - 09:00</td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>Phòng số 01</td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>Lý Phương Thảo</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        Chưa diễn ra
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        Chưa tính
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        >
                          Điểm danh / Đổi lịch
                        </button>
                        <button
                          type="button"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #38bdf8',
                            color: '#0284c7',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Download size={12} /> Xuất đánh giá
                        </button>
                        <button
                          type="button"
                          style={{
                            background: '#047857',
                            border: 'none',
                            color: '#ffffff',
                            padding: '6px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
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
