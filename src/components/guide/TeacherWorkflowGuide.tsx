import React from 'react';
import {
  Info,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';
import { EducareClassScheduleScreen } from './teacher/EducareClassScheduleScreen';
import { EducareAttendanceModalScreen } from './teacher/EducareAttendanceModalScreen';
import { EducareEvaluationAiModalScreen } from './teacher/EducareEvaluationAiModalScreen';

export const TeacherWorkflowGuide: React.FC = () => {
  return (
    <div style={{ color: '#1e293b', fontSize: '14px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
      {/* ── DOTB EMS / GITBOOK STYLE HEADER ── */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '-0.02em',
          }}
        >
          <span>🧑‍🏫</span> Hướng Dẫn Giáo Viên: Lịch Dạy → Điểm Danh → Đánh Giá → Dùng AI
        </h1>
        <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
          Tài liệu chuẩn 1-trang hướng dẫn chi tiết quy trình thao tác thực tế trên giao diện <strong>EduCare (DAO EDU)</strong>: từ chọn lớp, mở lịch dạy buổi học, điểm danh chuyên cần đến đánh giá 1-chạm và sinh nhận xét cá nhân hóa bằng <strong>Gemini AI</strong>.
        </p>
      </div>

      {/* QUICK PROCESS TIMELINE (DOTB Flow Tracker) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#047857', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
          <span>Chọn Lớp & Lịch dạy</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#047857', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
          <span>Bấm Điểm danh buổi học</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#047857', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
          <span>Điểm danh Chuyên cần</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#9333ea', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#9333ea', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>4</span>
          <span>Đánh giá 1-Chạm</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#9333ea', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#9333ea', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>5</span>
          <span>Dùng AI & Lưu kết quả</span>
        </div>
      </div>

      {/* ── BƯỚC 1: VÀO LỚP & CHỌN BUỔI HỌC ── */}
      <section style={{ marginBottom: '38px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#047857' }}>Bước 1:</span> Vào Lớp học và Chọn Buổi học cần điểm danh
        </h2>
        <div style={{ color: '#334155', fontSize: '14px', marginBottom: '12px' }}>
          Tại giao diện chi tiết lớp học đang phụ trách (Ví dụ: <strong>Lớp: SINH 8</strong>):
          <ul style={{ margin: '8px 0', paddingLeft: '24px', lineHeight: 1.8 }}>
            <li>
              Tại ô <strong>(1)</strong>: Bấm vào Tab <strong>&ldquo;Lịch dạy & Điểm danh&rdquo;</strong> để hiển thị danh sách các buổi học theo lịch cố định và đột xuất.
            </li>
            <li>
              Tại ô <strong>(2)</strong>: Tìm đến buổi học ngày hôm nay (Ví dụ: <code>02/10/2026</code>) và nhấn nút <strong>&ldquo;Điểm danh / Đổi lịch&rdquo;</strong> màu xanh lá đậm để mở cửa sổ phiên học.
            </li>
          </ul>

          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginTop: '10px',
              fontSize: '13px',
              color: '#065f46',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Info size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>💡 Khi có học sinh mới đi học đột xuất:</strong> Thầy/cô sang tab <strong>Học sinh</strong> → Bấm <strong>Thêm học sinh</strong> → Chọn nút xanh <strong>&ldquo;+ Tạo học sinh mới & thêm vào lớp&rdquo;</strong> (chỉ cần Họ tên + SĐT). Sau khi lưu, hệ thống sẽ hiện popup hỏi <strong>&ldquo;Đồng bộ buổi học ngay?&rdquo;</strong> → Thầy/cô chọn <strong>&ldquo;Đồng bộ ngay&rdquo;</strong>, học sinh mới sẽ lập tức xuất hiện trong danh sách điểm danh buổi học hôm nay và các ca tiếp theo!
            </div>
          </div>
        </div>

        {/* Màn hình 1 thực tế Educare */}
        <EducareClassScheduleScreen />
      </section>

      {/* ── BƯỚC 2: BẮT ĐẦU BUỔI HỌC & ĐIỂM DANH CHUYÊN CẦN ── */}
      <section style={{ marginBottom: '38px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#047857' }}>Bước 2:</span> Bắt đầu buổi học & Điểm danh chuyên cần
        </h2>
        <div style={{ color: '#334155', fontSize: '14px', marginBottom: '12px' }}>
          Cửa sổ <strong>Buổi học ngày: 02/10/2026</strong> mở ra, mặc định ở Tab <strong>1. Điểm danh chuyên cần</strong>:
          <ul style={{ margin: '8px 0', paddingLeft: '24px', lineHeight: 1.8 }}>
            <li>
              Tại ô <strong>(1)</strong>: Nếu buổi học có trạng thái <em>Chưa diễn ra</em>, bấm nút <strong>&ldquo;✓ Bắt đầu học (Điểm danh)&rdquo;</strong> để kích hoạt phiên điểm danh.
            </li>
            <li>
              Tại ô <strong>(2)</strong>: Bấm nút <strong>&ldquo;Có mặt tất cả&rdquo;</strong> để chuyển toàn bộ sĩ số lớp sang trạng thái Có mặt chỉ với 1 thao tác.
            </li>
            <li>
              Tại ô <strong>(3)</strong>: Với học sinh vắng, hệ thống hiển thị badge <code style={{ color: '#ef4444', background: '#fee2e2' }}>Vắng</code>. Giáo viên chọn hình thức vắng tại ô Dropdown (<em>Nghỉ không phép / Nghỉ có phép / Đi muộn</em>) và ghi chú lý do nếu có.
            </li>
          </ul>
        </div>

        {/* Màn hình 2 thực tế Educare */}
        <EducareAttendanceModalScreen />
      </section>

      {/* ── BƯỚC 3: ĐÁNH GIÁ 4 TIÊU CHÍ SƯ PHẠM ── */}
      <section style={{ marginBottom: '38px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#9333ea' }}>Bước 3 & 4:</span> Đánh giá 1-Chạm & Sử dụng Gemini AI sinh nhận xét
        </h2>
        <div style={{ color: '#334155', fontSize: '14px', marginBottom: '12px' }}>
          Sau khi hoàn tất điểm danh, giáo viên thực hiện nhận xét chất lượng học tập:
          <ul style={{ margin: '8px 0', paddingLeft: '24px', lineHeight: 1.8 }}>
            <li>
              Tại ô <strong>(1)</strong>: Bấm chuyển sang Tab <strong>&ldquo;✨ 2. Đánh giá 1-Chạm & AI Nhận xét&rdquo;</strong>.
            </li>
            <li>
              Tại ô <strong>(2)</strong>: Bấm nút <strong>&ldquo;✓ ⚡ Tất cả lớp TỐT (Tự lưu)&rdquo;</strong> trên thanh công cụ. Hệ thống sẽ lập tức đánh dấu Đạt/Tốt cho cả 4 tiêu chí của toàn bộ học sinh và tự động lưu.
            </li>
            <li>
              Tại ô <strong>(3)</strong>: Bấm nút <strong>&ldquo;✨ AI Viết Tất Cả (HS Có Mặt)&rdquo;</strong>. Trợ lý <strong>Gemini AI</strong> tự động phân tích tiêu chí và chuyên cần để tạo ra nhận xét chi tiết, mang tính động viên và chuẩn mực sư phạm cho từng em học sinh.
            </li>
            <li>
              Tại ô <strong>(4)</strong>: Nếu muốn chỉnh sửa riêng cho từng học sinh, giáo viên bấm đổi trực tiếp các nút <strong>Yes / No</strong> của 4 tiêu chí (<em>Chuyên cần, Làm BTVN, Tuân thủ NQ, Tích cực PB</em>) hoặc bấm nút <strong>&ldquo;✓ Tốt hết&rdquo;</strong>.
            </li>
            <li>
              Tại ô <strong>(5)</strong>: Bấm nút <strong>&ldquo;✨ AI Viết Nhận Xét&rdquo;</strong> để AI viết lại riêng cho em đó. Giáo viên cũng có thể gõ thêm nhận xét thủ công vào ô văn bản, sau đó bấm <strong>&ldquo;✓ Duyệt&rdquo;</strong> hoặc <strong>&ldquo;Duyệt tất cả&rdquo;</strong> và bấm <strong>&ldquo;💾 Lưu đánh giá&rdquo;</strong>.
            </li>
          </ul>
        </div>

        {/* Màn hình 3 thực tế Educare */}
        <EducareEvaluationAiModalScreen />
      </section>

      {/* ── BƯỚC 5: KẾT QUẢ ĐỒNG BỘ ── */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#047857' }}>Bước 5:</span> Dữ liệu tự động đồng bộ sang Báo cáo tuần (SQI)
        </h2>
        <div
          style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: '10px',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontWeight: 700, color: '#065f46', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCheck2 size={18} color="#059669" /> Kết quả được lưu trữ an toàn & đồng bộ thời gian thực:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#047857', fontSize: '13.5px', lineHeight: 1.75 }}>
            <li>
              Buổi học hoàn thành sẽ tự động chốt công dạy của Giáo viên và tính điểm <strong>Chỉ số chất lượng SQI (thang 100 điểm)</strong>.
            </li>
            <li>
              Phụ huynh học sinh có thể quét mã <strong>QR Code</strong> trên Phiếu báo cáo tuần hoặc tra cứu online trên Cổng phụ huynh để đọc nhận xét chi tiết của giáo viên.
            </li>
          </ul>
        </div>
      </section>

      {/* ── TIPS ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} color="#0284c7" /> Mẹo thao tác siêu tốc:
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
          Quy trình chuẩn tối ưu thời gian: <strong>[Có mặt tất cả]</strong> → Gạt trạng thái học sinh vắng nếu có → Bấm sang Tab 2 → Bấm <strong>[Tất cả lớp TỐT (Tự lưu)]</strong> → Bấm <strong>[AI Viết Tất Cả (HS Có Mặt)]</strong> → Bấm <strong>[Duyệt tất cả]</strong>. Toàn bộ thao tác chỉ mất <strong>dưới 30 giây</strong> cho 1 buổi học!
        </p>
      </div>
    </div>
  );
};
