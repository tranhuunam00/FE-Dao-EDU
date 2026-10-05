import React from 'react';
import {
  FileText,
  Calculator,
  Award,
  Info,
  ChevronRight,
} from 'lucide-react';
import { EducareWeeklyReportListScreen } from './teacher/EducareWeeklyReportListScreen';
import { EducareStudentReportCardScreen } from './teacher/EducareStudentReportCardScreen';

export const ReportPrintAndSqiGuide: React.FC = () => {
  return (
    <div style={{ color: '#1e293b', fontSize: '14px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
      {/* ── HEADER CHUẨN DOTB EMS ── */}
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
          <span>🖨️</span> Hướng Dẫn In Báo Cáo Tuần/Tháng & Cách Tính Điểm SQI (100đ)
        </h1>
        <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
          Tài liệu chuẩn 1-trang hướng dẫn chi tiết cách truy cập trang quản trị báo cáo, mở thiệp học sinh, dùng <strong>AI Gemini điền 4 ô</strong>, lấy link QR Zalo, xuất file in PDF/A4 và công thức tính chỉ số chất lượng học tập <strong>SQI (100 điểm)</strong> trên <strong>EduCare (DAO EDU)</strong>.
        </p>
      </div>

      {/* QUICK PROCESS TIMELINE (DOTB Flow Tracker) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#047857', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
          <span>Vào Báo Cáo Tuần SQI</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#047857', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
          <span>Chọn Lớp & Bấm Xem Thiệp</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#7c3aed', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
          <span>AI Điền 4 Ô Nhận Xét</span>
        </div>
        <ChevronRight size={14} color="#94a3b8" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0284c7', fontSize: '12.5px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>4</span>
          <span>Lấy Link QR & In A4</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PHẦN 1: HƯỚNG DẪN TRUY CẬP & IN BÁO CÁO (A4 / PDF)
      ══════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '42px' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="#047857" />
          <span>Phần 1:</span> Hướng dẫn truy cập trang báo cáo, dùng AI điền 4 ô và in phiếu A4
        </h2>

        {/* BƯỚC 1: TRUY CẬP TRANG BÁO CÁO TUẦN SQI */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: '#334155', marginBottom: '10px', lineHeight: 1.8 }}>
            <strong>Bước 1: Truy cập trang Báo cáo tuần SQI và chọn lớp học:</strong>
            <ul style={{ margin: '6px 0', paddingLeft: '24px' }}>
              <li>
                Tại thanh menu bên trái <strong>(1)</strong>: Bấm vào mục <strong>&ldquo;Báo cáo tuần SQI&rdquo;</strong> (hoặc truy cập đường dẫn trực tiếp: <code style={{ background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>educare.home-care.vn/admin/weekly-reports</code>).
              </li>
              <li>
                Tại thanh bộ lọc phía trên <strong>(2)</strong>: Chọn lớp <strong>SINH 8 (SINH8)</strong>, chọn chế độ <strong>&ldquo;Theo Tháng&rdquo;</strong>, chọn <strong>Tháng 10</strong> năm <strong>2026</strong>. Hệ thống sẽ tự động tổng hợp chỉ số SQI trung bình của lớp và danh sách toàn bộ học sinh.
              </li>
              <li>
                Tại cột Hành động của học sinh cần xuất phiếu (Ví dụ em <strong>Bùi Gia Linh</strong>) <strong>(3)</strong>: Nhấn nút <strong>&ldquo;👁️ Xem thiệp&rdquo;</strong> màu xanh để mở Phiếu báo kết quả học tập chi tiết.
              </li>
            </ul>
          </div>

          {/* Màn hình thật 100% Ảnh 1 */}
          <EducareWeeklyReportListScreen />
        </div>

        {/* BƯỚC 2: MỞ THIỆP & DÙNG AI ĐIỀN 4 Ô NHẬN XÉT, XUẤT IN */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#334155', marginBottom: '10px', lineHeight: 1.8 }}>
            <strong>Bước 2: Sử dụng AI Gemini điền 4 ô nhận xét, lấy link gửi Zalo và in A4:</strong>
            <ul style={{ margin: '6px 0', paddingLeft: '24px' }}>
              <li>
                Tại khung <em>Nhận xét của giáo viên trong tháng</em> <strong>(1)</strong>: Nhấn nút tím <strong>&ldquo;🪄 Gợi ý bằng AI Gemini&rdquo;</strong>. Trợ lý AI tự động quét dữ liệu chuyên cần, nề nếp và bài tập của tất cả các buổi học trong tháng để điền chuẩn mực sư phạm vào 4 ô.
              </li>
              <li>
                Tại <strong>4 ô nhận xét (2)</strong>: Giáo viên kiểm tra lại nội dung do AI đề xuất (*Tuyên dương viền vàng, Ưu điểm viền xanh lá, Cần cải thiện viền cam, Gợi ý rèn luyện viền xanh dương*). Thầy/cô có thể gõ chỉnh sửa trực tiếp nội dung nếu muốn, sau đó bấm <strong>&ldquo;Lưu nhận xét&rdquo;</strong> hoặc <strong>&ldquo;Phê duyệt báo cáo&rdquo;</strong>.
              </li>
              <li>
                Tại nút <strong>(4)</strong>: Nhấn <strong>&ldquo;📲 Lấy link & QR&rdquo;</strong> để copy đường link cố định (ví dụ <code>daoedu.vn/public/reports/STU-1074</code>) gửi vào nhóm Zalo phụ huynh. Phụ huynh mở điện thoại xem tức thì không cần mật khẩu.
              </li>
              <li>
                Tại nút <strong>(5)</strong>: Nhấn <strong>&ldquo;🖨️ Xuất PDF / In A4&rdquo;</strong>. Trình duyệt sẽ mở hộp thoại in chuẩn khổ A4, tỉ lệ vừa trang để in trực tiếp ra giấy hoặc lưu file PDF gửi phụ huynh.
              </li>
            </ul>
          </div>

          {/* Màn hình thật 100% Ảnh 2 & 3 */}
          <EducareStudentReportCardScreen />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PHẦN 2: CÁCH TÍNH ĐIỂM CHỈ SỐ SQI (100 ĐIỂM)
      ══════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={20} color="#047857" />
          <span>Phần 2:</span> Cơ chế & Công thức tính chỉ số chất lượng học tập SQI (100 điểm)
        </h2>

        <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px' }}>
          <div style={{ fontWeight: 800, color: '#065f46', fontSize: '14px', marginBottom: '4px' }}>
            Công thức tổng quát thang điểm 100:
          </div>
          <div style={{ fontSize: '14px', color: '#047857', fontWeight: 700 }}>
            Điểm SQI (100đ) = Chuyên cần (30đ) + Bài tập về nhà (30đ) + Tuân thủ nội quy (20đ) + Năng động phát biểu (20đ)
          </div>
        </div>

        {/* BẢNG CHI TIẾT 4 TIÊU CHÍ */}
        <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', width: '22%' }}>Tiêu chí</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', width: '14%' }}>Trọng số</th>
                <th style={{ padding: '10px 12px' }}>Quy tắc chấm & Điểm quy đổi từng buổi</th>
                <th style={{ padding: '10px 12px', width: '28%' }}>Công thức tính kỳ</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>1. Chuyên cần</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>30 điểm (30%)</td>
                <td style={{ padding: '10px 12px', lineHeight: 1.6 }}>
                  • Đúng giờ / Học bù: <strong>1.0 điểm</strong><br />
                  • Đi muộn / Về sớm: <strong>0.75 điểm</strong><br />
                  • Đi muộn nhiều (&gt;15p): <strong>0.4 điểm</strong><br />
                  • Nghỉ có phép: <strong>0.2 điểm</strong><br />
                  • Nghỉ không phép: <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>
                  (Tổng điểm quy đổi chuyên cần ÷ Tổng số buổi học) × 30
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>2. Làm BTVN</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>30 điểm (30%)</td>
                <td style={{ padding: '10px 12px', lineHeight: 1.6 }}>
                  • Làm đủ, làm tốt 100% (Yes): <strong>1.0 điểm</strong><br />
                  • Làm thiếu ít / Quên vở: <strong>0.7 điểm</strong><br />
                  • Làm chưa xong (&lt;50%): <strong>0.5 điểm</strong><br />
                  • Làm đối phó, sơ sài: <strong>0.4 điểm</strong><br />
                  • Không làm (No): <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>
                  (Tổng điểm quy đổi BTVN ÷ Số buổi có giao bài) × 30
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>3. Tuân thủ nội quy</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>20 điểm (20%)</td>
                <td style={{ padding: '10px 12px', lineHeight: 1.6 }}>
                  • Nề nếp tốt, nghiêm túc (Yes): <strong>1.0 điểm</strong><br />
                  • Mất tập trung / Buồn ngủ: <strong>0.7 điểm</strong><br />
                  • Nói chuyện riêng: <strong>0.5 điểm</strong><br />
                  • Dùng điện thoại / Việc riêng: <strong>0.3 điểm</strong><br />
                  • Chưa nghiêm túc (No): <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>
                  (Tổng điểm quy đổi nội quy ÷ Tổng số buổi học) × 20
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>4. Năng động phát biểu</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#059669' }}>20 điểm (20%)</td>
                <td style={{ padding: '10px 12px', lineHeight: 1.6 }}>
                  • Tích cực phát biểu / Hỏi bài (Yes): <strong>1.0 điểm</strong><br />
                  • Được gọi và trả lời tốt: <strong>0.8 điểm</strong><br />
                  • Chăm chú nghe nhưng ít nói: <strong>0.7 điểm</strong><br />
                  • Không tham gia / Gọi không đáp (No): <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>
                  (Tổng điểm quy đổi năng động ÷ Tổng số buổi học) × 20
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG XẾP LOẠI SQI */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#d97706" /> Bảng phân loại xếp loại chất lượng theo điểm SQI:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
            <div style={{ border: '1.5px solid #a7f3d0', background: '#ecfdf5', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ color: '#047857', fontWeight: 800, fontSize: '13.5px' }}>Xuất sắc</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>90 – 100 điểm</div>
            </div>
            <div style={{ border: '1.5px solid #bfdbfe', background: '#eff6ff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ color: '#1d4ed8', fontWeight: 800, fontSize: '13.5px' }}>Giỏi</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>75 – 89 điểm</div>
            </div>
            <div style={{ border: '1.5px solid #fde68a', background: '#fffbeb', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ color: '#b45309', fontWeight: 800, fontSize: '13.5px' }}>Khá</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>60 – 74 điểm</div>
            </div>
            <div style={{ border: '1.5px solid #fed7aa', background: '#fff7ed', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ color: '#c2410c', fontWeight: 800, fontSize: '13.5px' }}>Trung bình</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>45 – 59 điểm</div>
            </div>
            <div style={{ border: '1.5px solid #fecaca', background: '#fef2f2', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ color: '#b91c1c', fontWeight: 800, fontSize: '13.5px' }}>Cần cố gắng</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>Dưới 45 điểm</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER TIPS ── */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px 18px' }}>
        <h4 style={{ margin: '0 0 6px', fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} color="#0284c7" /> Lưu ý khi in phiếu và gửi phụ huynh:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: '#475569', lineHeight: 1.7 }}>
          <li>
            Phiếu in đã được tối ưu hóa CSS <code>@media print</code> chuẩn khổ giấy <strong>A4 đứng</strong>, không bị vỡ khung hay tràn trang.
          </li>
          <li>
            Mã QR trên phiếu dẫn trực tiếp đến trang tra cứu cá nhân của học sinh, phụ huynh quét là xem được biểu đồ phân tích và lịch sử rèn luyện mà không phải cài thêm ứng dụng nào.
          </li>
        </ul>
      </div>
    </div>
  );
};
