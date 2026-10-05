import React from 'react';
import {
  Calendar,
  X,
  Download,
  CheckCircle2,
  Ban,
  Users,
  Sparkles,
  Zap,
  Check,
  Save,
  CheckCheck,
} from 'lucide-react';
import { CalloutBadge } from './CalloutBadge';

export const EducareEvaluationAiModalScreen: React.FC = () => {
  const students = [
    { stt: 1, id: 'STU-1025', name: 'Bùi Nguyễn Bảo An' },
    { stt: 2, id: 'STU-1071', name: 'Vũ Hoài An' },
    { stt: 3, id: 'STU-1058', name: 'Nguyễn Phúc Anh' },
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
      {/* ── MODAL HEADER (Ảnh 3) ── */}
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
        {/* ── KHUNG THÔNG TIN BUỔI HỌC (Ảnh 3) ── */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px',
            fontSize: '12.5px',
          }}
        >
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
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px 1fr' }}>
            <div style={{ padding: '8px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Giáo viên</div>
            <div style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600 }}>Lý Phương Thảo</div>
            <div style={{ padding: '8px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Trợ giảng (TA)</div>
            <div style={{ padding: '8px 12px', color: '#64748b' }}>Chưa phân công</div>
          </div>
        </div>

        {/* ── HÀNG NÚT HÀNH ĐỘNG BUỔI HỌC (Ảnh 3) ── */}
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
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#047857',
              border: 'none',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12.5px',
            }}
          >
            <CheckCircle2 size={14} /> Bắt đầu học (Điểm danh)
          </button>
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

        {/* ── TABS CHUYỂN ĐỔI (Ảnh 3: Tab 2 Active) ── */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1.5px solid #e2e8f0', marginBottom: '16px', fontSize: '13px', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', paddingBottom: '8px' }}>
            <Users size={16} /> 1. Điểm danh chuyên cần (16)
          </div>

          {/* Tab 2 có Callout đỏ [1] */}
          <div style={{ position: 'relative' }}>
            <CalloutBadge num={1} top="-8px" right="-14px" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#9333ea',
                borderBottom: '2.5px solid #9333ea',
                paddingBottom: '8px',
                border: '2px dashed #ef4444',
                borderRadius: '4px',
                padding: '2px 8px 8px',
              }}
            >
              <Sparkles size={16} color="#9333ea" /> 2. Đánh giá 1-Chạm & AI Nhận xét
            </div>
          </div>
        </div>

        {/* ── THANH TÁC VỤ NHANH ĐÁNH GIÁ (Ảnh 3) ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Đánh giá 1-chạm & sinh nhận xét cá nhân hóa bằng AI cho từng học sinh.
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Nút 1: Tất cả lớp TỐT (Tự lưu) có Callout đỏ [2] */}
            <div style={{ position: 'relative' }}>
              <CalloutBadge num={2} top="-8px" left="-8px" />
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f1f5f9',
                  border: '2px solid #ef4444',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
                  color: '#334155',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <Check size={12} color="#059669" />
                <Zap size={12} color="#eab308" />
                <span>Tất cả lớp TỐT (Tự lưu)</span>
              </button>
            </div>

            {/* Nút 2: Duyệt tất cả */}
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '5px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '11.5px',
              }}
            >
              <CheckCheck size={13} /> Duyệt tất cả
            </button>

            {/* Nút 3: AI Viết Tất Cả (HS Có Mặt) có Callout đỏ [3] */}
            <div style={{ position: 'relative' }}>
              <CalloutBadge num={3} top="-8px" left="-8px" />
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f1f5f9',
                  border: '2px solid #ef4444',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
                  color: '#334155',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={13} color="#a855f7" /> AI Viết Tất Cả (HS Có Mặt)
              </button>
            </div>

            {/* Nút 4: Lưu đánh giá */}
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '5px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '11.5px',
              }}
            >
              <Save size={13} /> Lưu đánh giá
            </button>
          </div>
        </div>

        {/* ── BẢNG ĐÁNH GIÁ 1-CHẠM & AI NHẬN XÉT (Ảnh 3) ── */}
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '8px 10px', width: '170px' }}>HỌC SINH</th>
                <th style={{ padding: '8px 10px', width: '70px', textAlign: 'center' }}>ĐIỂM SỐ</th>
                <th style={{ padding: '8px 10px', width: '220px' }}>ĐÁNH GIÁ 1-CHẠM</th>
                <th style={{ padding: '8px 10px' }}>NHẬN XÉT BUỔI HỌC (AI / GIÁO VIÊN)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, idx) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: '#64748b' }}>{st.stt}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                    <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
                      {st.id} (Vắng)
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '12px 10px' }}>
                    {/* Khối Đánh giá 1-Chạm có Callout đỏ [4] ở dòng 1 */}
                    <div
                      style={{
                        position: 'relative',
                        border: idx === 0 ? '2px solid #ef4444' : 'none',
                        borderRadius: '6px',
                        padding: idx === 0 ? '4px' : '0',
                      }}
                    >
                      {idx === 0 && <CalloutBadge num={4} top="-10px" left="-8px" />}
                      <div style={{ textAlign: 'right', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: '#475569',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          ✓ Tốt hết
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3px', fontSize: '11px' }}>
                        {[
                          { label: 'Chuyên cần', icon: '🏫' },
                          { label: 'Làm BTVN', icon: '🎒' },
                          { label: 'Tuân thủ NQ', icon: '🛡️' },
                          { label: 'Tích cực PB', icon: '🗣️' },
                        ].map((c) => (
                          <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#475569' }}>{c.icon} {c.label}:</span>
                            <div style={{ display: 'flex', gap: '3px' }}>
                              <span style={{ padding: '1px 8px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                                Yes
                              </span>
                              <span style={{ padding: '1px 8px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                                No
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {/* Header ô nhận xét */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      {/* Nút AI Viết Nhận Xét có Callout đỏ [5] ở dòng 1 */}
                      <div style={{ position: 'relative' }}>
                        {idx === 0 && <CalloutBadge num={5} top="-8px" left="-8px" />}
                        <button
                          type="button"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f8fafc',
                            border: idx === 0 ? '2px solid #ef4444' : '1px solid #cbd5e1',
                            color: '#64748b',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Sparkles size={11} color="#a855f7" /> AI Viết Nhận Xét
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
                        <span style={{ border: '1px solid #cbd5e1', padding: '1px 6px', borderRadius: '4px', color: '#64748b', cursor: 'pointer' }}>
                          ✓ Duyệt
                        </span>
                        <span>0/2000</span>
                      </div>
                    </div>

                    {/* Textarea nhập nhận xét */}
                    <textarea
                      readOnly
                      rows={3}
                      placeholder="Giáo viên nhập nhận xét hoặc bấm 'AI viết Nhận xét' để tạo nhanh..."
                      style={{
                        width: '100%',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '6px 8px',
                        fontSize: '11.5px',
                        color: '#64748b',
                        background: '#fafafa',
                        resize: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
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
