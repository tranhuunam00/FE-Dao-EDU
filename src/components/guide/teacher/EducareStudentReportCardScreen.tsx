import React from 'react';
import {
  Printer,
  QrCode,
  Sparkles,
  Check,
} from 'lucide-react';
import { CalloutBadge } from './CalloutBadge';

export const EducareStudentReportCardScreen: React.FC = () => {
  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        margin: '16px 0 28px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12.5px',
      }}
    >
      {/* ── TOP ACTION TOOLBAR (Ảnh 2) ── */}
      <div
        style={{
          background: '#f8fafc',
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <span
          style={{
            background: '#fef3c7',
            color: '#b45309',
            padding: '5px 12px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            border: '1px solid #fde68a',
          }}
        >
          Bản nháp / Chờ duyệt
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Lưu nhận xét
          </button>
          <button
            type="button"
            style={{
              background: '#047857',
              border: 'none',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={13} /> Phê duyệt báo cáo
          </button>

          {/* Nút Lấy link & QR có Callout đỏ [4] */}
          <div style={{ position: 'relative' }}>
            <CalloutBadge num={4} top="-8px" left="-8px" />
            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '2px solid #ef4444',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
                color: '#0284c7',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <QrCode size={13} color="#0284c7" /> Lấy link & QR
            </button>
          </div>

          {/* Nút Xuất PDF / In A4 có Callout đỏ [5] */}
          <div style={{ position: 'relative' }}>
            <CalloutBadge num={5} top="-8px" left="-8px" />
            <button
              type="button"
              style={{
                background: '#047857',
                border: '2px solid #ef4444',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <Printer size={13} /> Xuất PDF / In A4
            </button>
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG PHIẾU BÁO CÁO (Ảnh 2 & Ảnh 3) ── */}
      <div style={{ padding: '24px 32px' }}>
        {/* Header Phiếu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#047857' }}>DAO EDU</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Nền tảng quản lý giáo dục toàn diện • Đồng hành cùng phụ huynh</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
            <div>Hotline: <strong>0961 766 816</strong></div>
            <div>Đơn vị: <strong>DAOGROUP</strong></div>
          </div>
        </div>

        {/* Title Phiếu */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: '0.02em' }}>
            PHIẾU BÁO KẾT QUẢ HỌC TẬP
          </h2>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
            Tháng 10/2026 (01/10/2026 - 31/10/2026)
          </div>
        </div>

        {/* Thông tin học sinh */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <div>Họ và tên học sinh: <strong style={{ color: '#0f172a' }}>Bùi Gia Linh</strong></div>
          <div>Mã số học sinh: <strong style={{ color: '#0f172a' }}>STU-1074</strong></div>
          <div>Lớp đang học: <strong style={{ color: '#0f172a' }}>LÝ 8, HÓA 8, TOÁN 8.2</strong></div>
          <div>Ngày xuất phiếu: <strong style={{ color: '#0f172a' }}>5/10/2026</strong></div>
        </div>

        {/* 3 Box chỉ số */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>CHỈ SỐ CHẤT LƯỢNG (SQI)</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              83.3 <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ 100</span>
            </div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>XẾP LOẠI HỌC SINH</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
              Giỏi
            </div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>SO VỚI THÁNG TRƯỚC</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              ↗ +0.8 điểm
            </div>
          </div>
        </div>

        {/* ── KHUNG NHẬN XÉT CỦA GIÁO VIÊN TRONG THÁNG (Ảnh 3) ── */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginBottom: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
              NHẬN XÉT CỦA GIÁO VIÊN TRONG THÁNG
            </span>

            {/* Nút Gợi ý bằng AI Gemini có Callout đỏ [1] */}
            <div style={{ position: 'relative' }}>
              <CalloutBadge num={1} top="-8px" right="-8px" />
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f5f3ff',
                  border: '2px solid #ef4444',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                  color: '#7c3aed',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={13} color="#7c3aed" /> 🪄 Gợi ý bằng AI Gemini
              </button>
            </div>
          </div>

          {/* 4 Ô Nhận xét có Callout đỏ [2] */}
          <div style={{ position: 'relative' }}>
            <CalloutBadge num={2} top="-8px" left="-8px" />
            <div style={{ border: '2px dashed #ef4444', borderRadius: '8px', padding: '6px' }}>
              {/* Ô 1: Tuyên dương */}
              <div style={{ border: '1.5px solid #facc15', borderRadius: '6px', background: '#fffbeb', padding: '8px 10px', marginBottom: '8px' }}>
                <div style={{ color: '#854d0e', fontWeight: 800, fontSize: '11.5px', marginBottom: '3px' }}>
                  Tuyên dương & Khen thưởng:
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }}>
                  Nhập lời khen ngợi khích lệ nỗ lực của học sinh...
                </div>
              </div>

              {/* Ô 2 & 3: Ưu điểm & Cần cải thiện */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div style={{ border: '1.5px solid #86efac', borderRadius: '6px', background: '#f0fdf4', padding: '8px 10px' }}>
                  <div style={{ color: '#166534', fontWeight: 800, fontSize: '11.5px', marginBottom: '3px' }}>
                    Ưu điểm:
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '11.5px' }}>
                    Tham gia học tập đầy đủ, đúng giờ.
                  </div>
                </div>

                <div style={{ border: '1.5px solid #fdba74', borderRadius: '6px', background: '#fff7ed', padding: '8px 10px' }}>
                  <div style={{ color: '#9a3412', fontWeight: 800, fontSize: '11.5px', marginBottom: '3px' }}>
                    Cần cải thiện:
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '11.5px' }}>
                    Duy trì phong độ tốt, không có vi phạm nề nếp.
                  </div>
                </div>
              </div>

              {/* Ô 4: Gợi ý rèn luyện */}
              <div style={{ border: '1.5px solid #93c5fd', borderRadius: '6px', background: '#eff6ff', padding: '8px 10px' }}>
                <div style={{ color: '#1e40af', fontWeight: 800, fontSize: '11.5px', marginBottom: '3px' }}>
                  Gợi ý rèn luyện & phối hợp cùng phụ huynh:
                </div>
                <div style={{ color: '#1e293b', fontSize: '11.5px' }}>
                  Động viên con tiếp tục phát huy tinh thần tự giác trong các buổi học tiếp theo.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chân trang chữ ký & QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '11.5px', color: '#0f172a' }}>GIÁO VIÊN PHỤ TRÁCH</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ marginTop: '24px', fontWeight: 700, color: '#475569', fontSize: '11.5px' }}>Ban Giảng Viên DAO EDU</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', border: '1px solid #cbd5e1', borderRadius: '6px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={40} color="#334155" />
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700, marginTop: '4px' }}>QUÉT TRA CỨU ONLINE</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>Hà Nội, ngày 5 tháng 10 năm 2026</div>
            <div style={{ fontWeight: 800, fontSize: '11.5px', color: '#0f172a' }}>GIÁM ĐỐC ĐÀO TẠO</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8', fontStyle: 'italic' }}>(Ký và đóng dấu)</div>
            <div style={{ marginTop: '16px', fontWeight: 700, color: '#047857', fontSize: '11.5px' }}>Hệ Thống Giáo Dục DAO EDU</div>
          </div>
        </div>
      </div>
    </div>
  );
};
