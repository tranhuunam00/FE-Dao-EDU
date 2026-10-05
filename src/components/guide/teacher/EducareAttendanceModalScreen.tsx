import React from 'react';
import {
  Calendar,
  X,
  Download,
  CheckCircle2,
  Ban,
  Users,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { CalloutBadge } from './CalloutBadge';

export const EducareAttendanceModalScreen: React.FC = () => {
  const students = [
    { stt: 1, id: 'STU-1025', name: 'Bùi Nguyễn Bảo An' },
    { stt: 2, id: 'STU-1071', name: 'Vũ Hoài An' },
    { stt: 3, id: 'STU-1058', name: 'Nguyễn Phúc Anh' },
    { stt: 4, id: 'STU-1056', name: 'Phạm Quỳnh Anh' },
    { stt: 5, id: 'STU-1052', name: 'Vũ Trần Diệu Anh' },
  ];

  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        margin: '16px 0 28px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
      }}
    >
      {/* ── MODAL HEADER (Ảnh 2) ── */}
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
          <Calendar size={18} color="#6366f1" />
          <span>Buổi học ngày: 02/10/2026</span>
        </div>
        <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* ── KHUNG THÔNG TIN BUỔI HỌC (Ảnh 2) ── */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px',
            fontSize: '12.5px',
          }}
        >
          {/* Hàng 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px 1fr', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ padding: '8px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Thời gian</div>
            <div style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600 }}>07:30 - 09:00</div>
            <div style={{ padding: '8px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Trạng thái</div>
            <div style={{ padding: '8px 12px' }}>
              <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                Chưa diễn ra
              </span>
            </div>
          </div>
          {/* Hàng 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px 1fr' }}>
            <div style={{ padding: '8px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Giáo viên</div>
            <div style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600 }}>Lý Phương Thảo</div>
            <div style={{ padding: '8px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Trợ giảng (TA)</div>
            <div style={{ padding: '8px 12px', color: '#64748b' }}>Chưa phân công</div>
          </div>
        </div>

        {/* ── HÀNG NÚT HÀNH ĐỘNG BUỔI HỌC (Ảnh 2) ── */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #38bdf8',
              color: '#0284c7',
              padding: '7px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12.5px',
            }}
          >
            <Download size={14} /> Xuất Excel đánh giá buổi học
          </button>

          {/* Nút Bắt đầu học (Điểm danh) có Callout đỏ [1] */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <CalloutBadge num={1} top="-9px" left="-8px" />
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#047857',
                border: '2px solid #ef4444',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={14} /> Bắt đầu học (Điểm danh)
            </button>
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: '7px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12.5px',
            }}
          >
            <Ban size={14} /> Cho nghỉ học
          </button>
        </div>

        {/* ── TABS CHUYỂN ĐỔI (Ảnh 2) ── */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1.5px solid #e2e8f0', marginBottom: '14px', fontSize: '13px', fontWeight: 700 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#047857',
              borderBottom: '2.5px solid #047857',
              paddingBottom: '8px',
            }}
          >
            <Users size={16} /> 1. Điểm danh chuyên cần (16)
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748b',
              paddingBottom: '8px',
            }}
          >
            <Sparkles size={16} color="#a855f7" /> 2. Đánh giá 1-Chạm & AI Nhận xét
          </div>
        </div>

        {/* ── NÚT ĐIỂM DANH NHANH (Ảnh 2) ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
          {/* Nút Có mặt tất cả có Callout đỏ [2] */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <CalloutBadge num={2} top="-8px" left="-8px" />
            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '2px solid #ef4444',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
                color: '#334155',
                padding: '5px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Có mặt tất cả
            </button>
          </div>

          <button
            type="button"
            style={{
              background: '#ffffff',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: '5px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Vắng mặt tất cả
          </button>
        </div>

        {/* ── BẢNG DANH SÁCH HỌC SINH (Ảnh 2) ── */}
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '50px', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '8px 10px', width: '100px' }}>MÃ HS</th>
                <th style={{ padding: '8px 10px' }}>HỌ VÀ TÊN</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '130px' }}>ĐIỂM DANH</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '100px' }}>HÌNH THỨC</th>
                <th style={{ padding: '8px 10px', width: '240px' }}>LÝ DO VẮNG MẶT / GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, idx) => (
                <tr
                  key={st.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{st.stt}</td>
                  <td style={{ padding: '10px', color: '#64748b', fontWeight: 600 }}>{st.id}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{st.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {/* Toggle switch mô phỏng Ant Design switch */}
                      <span
                        style={{
                          width: '34px',
                          height: '18px',
                          background: '#cbd5e1',
                          borderRadius: '10px',
                          display: 'inline-block',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                          }}
                        />
                      </span>
                      <span
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Vắng
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '10px' }}>
                    {idx === 0 ? (
                      /* Dòng 1 được Callout đỏ [3] tại ô Dropdown lý do vắng */
                      <div style={{ position: 'relative' }}>
                        <CalloutBadge num={3} top="-8px" right="-8px" />
                        <div
                          style={{
                            border: '2px solid #ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            background: '#ffffff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: '#334155',
                          }}
                        >
                          <span>Nghỉ không phép</span>
                          <ChevronDown size={14} color="#94a3b8" />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          background: '#ffffff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#334155',
                        }}
                      >
                        <span>Nghỉ không phép</span>
                        <ChevronDown size={14} color="#94a3b8" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
