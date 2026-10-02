import React from 'react';
import { QRCode } from 'antd';
import { Sparkles, QrCode as QrIcon, Printer, Check } from 'lucide-react';
import { ReportCardChartsPreview } from './ReportCardChartsPreview';

interface ReportCardFullPreviewProps {
  onOpenShareModal: () => void;
  onTriggerAiFill?: () => void;
  aiFilled?: boolean;
}

export const ReportCardFullPreview: React.FC<ReportCardFullPreviewProps> = ({
  onOpenShareModal,
  onTriggerAiFill,
  aiFilled = true,
}) => {
  return (
    <div
      style={{
        border: '2px solid #cbd5e1',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        marginBottom: '24px',
      }}
    >
      {/* ── THANH CÔNG CỤ ĐẦU THIỆP BÁO CÁO ── */}
      <div
        style={{
          background: '#f8fafc',
          padding: '12px 18px',
          borderBottom: '1px solid #cbd5e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              background: '#ecfdf5',
              color: '#047857',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: 700,
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={14} /> Đã phê duyệt phát hành
          </span>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Kỳ: <strong>Tháng 10/2026 (4 buổi)</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* NÚT GỢI Ý AI ĐIỀN 4 Ô (KHOANH ĐỎ CHÚ THÍCH) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={onTriggerAiFill}
              style={{
                border: '2px solid #8b5cf6',
                background: '#f5f3ff',
                color: '#6d28d9',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(139,92,246,0.2)',
              }}
            >
              <Sparkles size={14} color="#7c3aed" /> Gợi ý AI (Gemini)
            </button>
            <span
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-6px',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              ★ ĐIỀN 4 Ô TỰ ĐỘNG
            </span>
          </div>

          <button
            type="button"
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Lưu nhận xét
          </button>

          {/* NÚT LẤY LINK & QR (KHOANH ĐỎ CHÚ THÍCH) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={onOpenShareModal}
              style={{
                border: '2px solid #0284c7',
                background: '#f0f9ff',
                color: '#0369a1',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <QrIcon size={14} /> Lấy link & QR
            </button>
            <span
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-6px',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              GỬI PHỤ HUYNH
            </span>
          </div>

          {/* NÚT XUẤT PDF / IN A4 (KHOANH ĐỎ CHÚ THÍCH) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              style={{
                border: '2px solid #ef4444',
                background: '#0f172a',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={14} /> Xuất PDF / In A4
            </button>
            <span
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-6px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              IN KHỔ A4 CHUẨN
            </span>
          </div>
        </div>
      </div>

      {/* ── TOÀN BỘ PHIẾU BÁO CÁO A4 (MẪU ĐẦY ĐỦ 100%) ── */}
      <div style={{ padding: '24px 28px', background: '#ffffff', color: '#1e293b' }}>
        {/* 1. Header phiếu */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #047857', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '0.04em' }}>
                HỆ THỐNG GIÁO DỤC DAO EDU
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Phân hiệu Đào tạo Trí tuệ & Toán học</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Mã phiếu: <strong>BC-2026-TOAN10-124</strong></div>
              <div style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600 }}>Cổng tra cứu: daoedu.vn</div>
            </div>
          </div>

          <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '8px 0 3px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            PHIẾU ĐÁNH GIÁ CHẤT LƯỢNG HỌC TẬP THÁNG 10/2026
          </h2>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Học sinh: <strong style={{ color: '#0f172a', fontSize: '13px' }}>Nguyễn Văn An</strong> (Mã HS: <strong>HS00124</strong>) | Lớp: <strong>TOAN10_A1</strong> | GVCN: <strong>ThS. Hoàng Đức Minh</strong>
          </div>
        </div>

        {/* 2. Khung SQI Tổng quan */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '16px',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CHỈ SỐ CHẤT LƯỢNG (SQI)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b', marginTop: '2px' }}>
              92 <span style={{ fontSize: '12px', color: '#64748b' }}>/ 100</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>XẾP LOẠI RÈN LUYỆN</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              Xuất sắc
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SO VỚI THÁNG TRƯỚC</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>
              ▲ +4 điểm
            </div>
          </div>
        </div>

        {/* 3. Bảng 4 tiêu chí đánh giá SQI */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', width: '30%' }}>Chỉ số đánh giá</th>
              <th style={{ padding: '6px 10px', textAlign: 'center', width: '18%' }}>Điểm đạt được</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Diễn giải cụ thể trong tháng</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0284c7' }}>1. Điểm chuyên cần (30%)</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800 }}>30 / 30</td>
              <td style={{ padding: '6px 10px', color: '#334155' }}>4/4 buổi tham gia học đầy đủ, đúng giờ, không vắng buổi nào.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#10b981' }}>2. Điểm bài tập (30%)</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800 }}>28 / 30</td>
              <td style={{ padding: '6px 10px', color: '#334155' }}>3 buổi làm đủ 100% bài tập về nhà; 1 buổi hoàn thành 85%.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#f59e0b' }}>3. Điểm nội quy (20%)</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800 }}>20 / 20</td>
              <td style={{ padding: '6px 10px', color: '#334155' }}>Nề nếp lớp học chuẩn mực, không dùng điện thoại, ghi chép cẩn thận.</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#8b5cf6' }}>4. Điểm năng động (20%)</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800 }}>14 / 20</td>
              <td style={{ padding: '6px 10px', color: '#334155' }}>2 buổi tích cực xung phong lên bảng chữa bài; 2 buổi chăm chú lắng nghe.</td>
            </tr>
          </tbody>
        </table>

        {/* 4. BIỂU ĐỒ PHÂN TÍCH (CHARTS) */}
        <ReportCardChartsPreview />

        {/* 5. Bảng chi tiết từng buổi học trong tháng */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px' }}>
            Chi tiết đánh giá từng buổi học trong kỳ
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '5px', textAlign: 'center', width: '35px' }}>Buổi</th>
                <th style={{ padding: '5px 8px', textAlign: 'left', width: '90px' }}>Ngày học</th>
                <th style={{ padding: '5px', textAlign: 'center', width: '70px' }}>Chuyên cần</th>
                <th style={{ padding: '5px', textAlign: 'center', width: '70px' }}>BTVN</th>
                <th style={{ padding: '5px', textAlign: 'center', width: '65px' }}>Nề nếp</th>
                <th style={{ padding: '5px', textAlign: 'center', width: '55px' }}>Điểm</th>
                <th style={{ padding: '5px 8px', textAlign: 'left' }}>Ghi chú của giáo viên buổi học</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>1</td>
                <td style={{ padding: '5px 8px' }}>05/10/2026</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đúng giờ</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đủ 100%</td>
                <td style={{ textAlign: 'center', color: '#16a34a' }}>Tốt</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>8.5</td>
                <td style={{ padding: '5px 8px', color: '#475569' }}>Nắm rất chắc công thức Logarit; giải bài toán nhanh.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>2</td>
                <td style={{ padding: '5px 8px' }}>12/10/2026</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đúng giờ</td>
                <td style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>Thiếu ít</td>
                <td style={{ textAlign: 'center', color: '#16a34a' }}>Tốt</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>8.8</td>
                <td style={{ padding: '5px 8px', color: '#475569' }}>Làm thiếu 2 câu cuối phần nâng cao, đã được chữa tại lớp.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>3</td>
                <td style={{ padding: '5px 8px' }}>19/10/2026</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đúng giờ</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đủ 100%</td>
                <td style={{ textAlign: 'center', color: '#16a34a' }}>Tốt</td>
                <td style={{ textAlign: 'center', fontWeight: 800, color: '#15803d' }}>9.5</td>
                <td style={{ padding: '5px 8px', color: '#475569' }}>Tích cực xung phong lên bảng; cách giải phương trình sáng tạo.</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>4</td>
                <td style={{ padding: '5px 8px' }}>26/10/2026</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đúng giờ</td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>Đủ 100%</td>
                <td style={{ textAlign: 'center', color: '#16a34a' }}>Tốt</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>9.0</td>
                <td style={{ padding: '5px 8px', color: '#475569' }}>Làm bài kiểm tra tổng kết chương đạt kết quả cao.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6. KHUNG 4 Ô NHẬN XÉT SƯ PHẠM ĐƯỢC AI ĐIỀN */}
        <div
          style={{
            border: '2px solid #8b5cf6',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
            background: '#faf5ff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed #d8b4fe', paddingBottom: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              ★ Nhận xét sư phạm 4 tiêu chí (Được AI Gemini tự động sinh & Giáo viên chuẩn hóa)
            </div>
            <span style={{ fontSize: '11px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              AI Powered
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
            {/* Ô 1: Điểm mạnh */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', marginBottom: '3px' }}>
                1. Điểm mạnh nổi bật:
              </div>
              <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
                {aiFilled
                  ? 'An tiếp thu kiến thức toán tư duy nhanh nhạy, đặc biệt là các dạng toán đồ thị và hàm số. Luôn hoàn thành đúng hạn các bài tập trên lớp, tư duy phân tích sắc bén.'
                  : 'Đang tải gợi ý từ AI...'}
              </div>
            </div>

            {/* Ô 2: Cần cải thiện */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', marginBottom: '3px' }}>
                2. Điểm cần khắc phục:
              </div>
              <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
                {aiFilled
                  ? 'Đôi khi còn chủ quan ở các bước tính toán trung gian nên mất điểm số học đáng tiếc. Cần cẩn thận soát lại bài 5 phút trước khi nộp để đạt điểm tuyệt đối.'
                  : 'Đang tải gợi ý từ AI...'}
              </div>
            </div>

            {/* Ô 3: Lời khen & ghi nhận */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '3px' }}>
                3. Lời khen & Ghi nhận nỗ lực:
              </div>
              <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
                {aiFilled
                  ? 'Khen ngợi tinh thần học tập gương mẫu, chăm chỉ và luôn chủ động hỗ trợ giải đáp các bạn cùng bàn trong các buổi học nhóm.'
                  : 'Đang tải gợi ý từ AI...'}
              </div>
            </div>

            {/* Ô 4: Kế hoạch rèn luyện & Phối hợp phụ huynh */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', marginBottom: '3px' }}>
                4. Kế hoạch rèn luyện & Phối hợp phụ huynh:
              </div>
              <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
                {aiFilled
                  ? 'Kính đề nghị gia đình tiếp tục nhắc nhở con làm hết bài tập vào tối thứ Sáu. Giáo viên sẽ giao thêm 2 bài toán tư duy nâng cao mỗi tuần để phát huy tối đa thế mạnh.'
                  : 'Đang tải gợi ý từ AI...'}
              </div>
            </div>
          </div>
        </div>

        {/* 7. CHỮ KÝ, NGÀY THÁNG & MÃ QR TRA CỨU ONLINE */}
        <div
          style={{
            borderTop: '1px solid #cbd5e1',
            paddingTop: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            textAlign: 'center',
          }}
        >
          {/* Giáo viên */}
          <div style={{ width: '35%' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>GIÁO VIÊN PHỤ TRÁCH</div>
            <div style={{ fontSize: '9.5px', color: '#64748b', fontStyle: 'italic', marginBottom: '28px' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>ThS. Hoàng Đức Minh</div>
          </div>

          {/* QR Tra cứu */}
          <div style={{ width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '3px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <QRCode value="https://daoedu.vn/public/reports/HS00124" size={60} bordered={false} />
            </div>
            <div style={{ fontSize: '8.5px', color: '#475569', marginTop: '3px', fontWeight: 700, textTransform: 'uppercase' }}>
              Quét xem online
            </div>
          </div>

          {/* Giám đốc đào tạo */}
          <div style={{ width: '35%' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', marginBottom: '2px' }}>
              Hà Nội, ngày 02 tháng 10 năm 2026
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>GIÁM ĐỐC ĐÀO TẠO</div>
            <div style={{ fontSize: '9.5px', color: '#64748b', fontStyle: 'italic', marginBottom: '28px' }}>(Ký và đóng dấu)</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>DAO EDU GROUP</div>
          </div>
        </div>
      </div>
    </div>
  );
};
