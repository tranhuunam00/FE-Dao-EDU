import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';

interface Point {
  num: string;
  label: string;
  detail: string;
}

interface Step {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  role: string;
  imageSrc?: string;
  imageAlt?: string;
  points?: Point[];
  secondImageSrc?: string;
  secondImageAlt?: string;
  secondPoints?: Point[];
  tip?: string;
  content?: React.ReactNode;
}

const green = '#059669';
const CalloutBox: React.FC<{ type: 'tip' | 'warning' | 'note'; text: string }> = ({ type, text }) => {
  const map = {
    tip:     { bg: '#ecfdf5', border: '#6ee7b7', icon: '💡', color: '#047857' },
    warning: { bg: '#fefce8', border: '#fde047', icon: '⚠️', color: '#92400e' },
    note:    { bg: '#eff6ff', border: '#93c5fd', icon: 'ℹ️', color: '#1d4ed8' },
  };
  const s = map[type];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.border}`,
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        color: s.color,
        margin: '12px 0',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: '15px', lineHeight: 1.4 }}>{s.icon}</span>
      <span>{text}</span>
    </div>
  );
};

const AnnotationGrid: React.FC<{ points: Point[] }> = ({ points }) => (
  <div style={{ marginTop: '16px' }}>
    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
      🔍 Chú Thích Các Vùng Đánh Số Màu Đỏ:
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
      {points.map((pt, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '18px', lineHeight: 1, color: '#dc2626', fontWeight: 900, flexShrink: 0, marginTop: '2px' }}>
            {pt.num}
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{pt.label}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45 }}>{pt.detail}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ImagePreviewBlock: React.FC<{ src: string; alt: string; title?: string }> = ({ src, alt, title }) => (
  <div style={{ marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', background: '#ffffff' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{title || alt}</span>
      <a href={src} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
        <ExternalLink size={13} /> Xem ảnh gốc
      </a>
    </div>
    <div style={{ padding: '8px', background: '#0f172a08', textAlign: 'center' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }} loading="lazy" />
    </div>
  </div>
);

const STEPS: Step[] = [
  {
    id: 'overview',
    emoji: '🏠',
    title: 'Cổng Phụ Huynh / Học Sinh',
    subtitle: 'Tổng quan các tiện ích tra cứu & thanh toán trực tuyến',
    role: 'Phụ huynh · Học viên',
    content: (
      <div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: 1.7 }}>
          Cổng Phụ Huynh &amp; Học Sinh giúp theo dõi tình hình chuyên cần, tra cứu học phí, nộp tiền qua mã QR Techcombank và chủ động gửi đơn xin nghỉ học thuận tiện.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {[
            { icon: '💰', title: '1. Xem Học Phí', desc: 'Tra cứu hóa đơn từng đợt, số buổi học & điểm danh' },
            { icon: '📲', title: '2. Nộp Tiền Qua QR', desc: 'Quét QR Techcombank DAOGROUP & ấn Đã chuyển' },
            { icon: '📝', title: '3. Đơn Xin Nghỉ Học', desc: 'Gửi đơn buổi học sắp tới & theo dõi phê duyệt' },
            { icon: '📊', title: '4. Báo Cáo SQI', desc: 'Theo dõi xếp loại chuyên cần, bài tập & điểm SQI' },
          ].map(c => (
            <div key={c.title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <CalloutBox type="note" text="Phụ huynh có thể chuyển đổi linh hoạt giữa các hồ sơ con học viên trong tài khoản để xem thông tin tương ứng từng em." />
      </div>
    ),
  },
  {
    id: 'view-tuition',
    emoji: '💰',
    title: 'Xem Học Phí & Hóa Đơn',
    subtitle: 'Tra cứu số tiền chưa thanh toán và chi tiết điểm danh từng buổi',
    role: 'Phụ huynh · Học viên',
    imageSrc: '/guides/hdsd_parent_01_xem_hoc_phi.png',
    imageAlt: 'Giao diện tra cứu học phí và hóa đơn chi tiết',
    points: [
      { num: '❶', label: 'Menu Học Phí Cột Trái', detail: 'Nhấn vào menu Học phí để mở trang quản lý công nợ và các đợt thu phí học kỳ.' },
      { num: '❷', label: 'Tổng Học Phí Chưa Thanh Toán', detail: 'Thẻ thống kê màu đỏ thể hiện chính xác tổng số tiền tất cả hóa đơn chưa nộp.' },
      { num: '❸', label: 'Đợt Thu Học Phí & Hóa Đơn Chi Tiết', detail: 'Hóa đơn được phân loại theo đợt. Thể hiện rõ kỳ phí từ ngày đến ngày và tổng tiền.' },
      { num: '❹', label: 'Bấm Nút "Thanh toán ngay"', detail: 'Bấm nút xanh lá cây trên hóa đơn để mở hộp thoại quét mã QR chuyển khoản.' },
      { num: '❺', label: 'Bảng Kê Chi Tiết Từng Buổi Học Thực Tế', detail: 'Mở rộng dòng lớp để xem ngày học, khung giờ, đơn giá và trạng thái Có mặt / Vắng mặt.' },
    ],
    tip: 'Có thể chuyển đổi giữa 2 tab "Chưa thanh toán" và "Đã thanh toán" để rà soát toàn bộ lịch sử đóng học phí.',
  },
  {
    id: 'pay-tuition',
    emoji: '📲',
    title: 'Nộp Học Phí Qua Mã QR Techcombank',
    subtitle: 'Quét mã chuyển khoản DAOGROUP và ấn "Đã chuyển khoản" để kế toán duyệt',
    role: 'Phụ huynh · Học viên',
    imageSrc: '/guides/hdsd_parent_02_nop_hoc_phi_qr.png',
    imageAlt: 'Modal quét mã QR Techcombank DAOGROUP và xác nhận nộp học phí',
    points: [
      { num: '❶', label: 'Quét Mã QR Techcombank (DAOGROUP)', detail: 'Mở App ngân hàng bất kỳ, quét mã QR thanh toán của CONG TY TNHH DAU TU VA CONG NGHE DAOGROUP.' },
      { num: '❷', label: 'STK 8888383999 & Số Tiền Cần Nộp', detail: 'STK thụ hưởng 8888383999 tại Techcombank. Bấm icon sao chép để chuyển đúng số tiền.' },
      { num: '❸', label: 'Nội Dung CK Bắt Buộc (Mã Hóa Đơn)', detail: 'BẮT BUỘC sao chép đúng cú pháp HP [Mã_HĐ] để kế toán đối chiếu nhanh chóng.' },
      { num: '❹', label: 'Bấm "Tôi đã chuyển khoản" Hoàn Tất', detail: 'Sau khi chuyển khoản thành công trên App ngân hàng, bấm nút này để gửi thông báo cho kế toán kiểm tra đối soát thủ công.' },
    ],
    tip: 'Sau khi phụ huynh bấm "Tôi đã chuyển khoản", kế toán / admin trung tâm sẽ kiểm tra sao kê thực tế và xác nhận biên lai thu tiền.',
  },
  {
    id: 'leave-request',
    emoji: '📝',
    title: 'Gửi Đơn Xin Nghỉ Học & Theo Dõi Trạng Thái',
    subtitle: 'Xin phép vắng buổi học sắp tới kèm lý do, theo dõi giáo viên phê duyệt',
    role: 'Phụ huynh · Học viên',
    imageSrc: '/guides/hdsd_parent_03_danh_sach_don_nghi.png',
    imageAlt: 'Danh sách đơn xin nghỉ học và trạng thái duyệt',
    points: [
      { num: '❶', label: 'Bấm "Gửi đơn xin nghỉ"', detail: 'Nhấn nút xanh lá cây trên cùng bên phải để mở modal tạo đơn xin nghỉ buổi học mới.' },
      { num: '❷', label: 'Đơn Trạng Thái "Chờ duyệt"', detail: 'Đơn đã gửi lên hệ thống, đang chờ giáo viên bộ môn hoặc quản trị viên xét duyệt.' },
      { num: '❸', label: 'Nút Hủy Đơn', detail: 'Phụ huynh/học sinh có thể tự bấm hủy đơn nếu thay đổi kế hoạch (chỉ khả dụng khi đơn còn Chờ duyệt).' },
      { num: '❹', label: 'Đơn "Đã duyệt" & Lời Nhắn Từ Giáo Viên', detail: 'Xem phản hồi, lời dặn dò bài tập hoặc dặn xem lại bài giảng từ giáo viên.' },
      { num: '❺', label: 'Menu Quản Lý Đơn Xin Nghỉ', detail: 'Vào menu Đơn xin nghỉ tại thanh điều hướng bên trái để quản lý toàn bộ các đơn.' },
    ],
    secondImageSrc: '/guides/hdsd_parent_04_tao_don_xin_nghi_modal.png',
    secondImageAlt: 'Hộp thoại điền thông tin gửi đơn xin nghỉ học',
    secondPoints: [
      { num: '❶', label: 'Chọn Buổi Học Sắp Tới Muốn Xin Nghỉ', detail: 'Dropdown danh sách các ca học sắp diễn ra (chỉ chọn được buổi từ hôm nay trở đi).' },
      { num: '❷', label: 'Nhập Rõ Lý Do Xin Nghỉ (Bắt Buộc)', detail: 'Nhập lý do cụ thể (lý do sức khỏe, việc gia đình, trùng lịch thi cử...).' },
      { num: '❸', label: 'Bấm "Gửi đơn" Hoàn Tất', detail: 'Nhấn nút gửi màu xanh để hoàn tất. Đơn lập tức xuất hiện ở danh sách Chờ duyệt.' },
    ],
    tip: 'Chỉ có thể xin nghỉ cho các buổi học trong tương lai (chưa bắt đầu) và chưa bị khóa sổ điểm danh.',
  },
  {
    id: 'sqi-report',
    emoji: '📊',
    title: 'Xem Báo Cáo Tuần Chất Lượng SQI Của Con',
    subtitle: 'Theo dõi tiến độ học tập, điểm chuyên cần, bài tập và nhận xét của thầy cô',
    role: 'Phụ huynh · Học viên',
    imageSrc: '/guides/hdsd_student_05_weekly_reports.png',
    imageAlt: 'Báo cáo tuần đánh giá toàn diện SQI 100 điểm',
    points: [
      { num: '❶', label: 'Chọn Năm Học & Tuần Báo Cáo', detail: 'Tra cứu nhanh phiếu báo cáo tuần học bất kỳ trong suốt năm học.' },
      { num: '❷', label: 'Xuất PDF / In A4 & QR Link', detail: 'Tải file PDF đạt chuẩn in A4 gửi gia đình hoặc quét mã QR mở xem trên điện thoại.' },
      { num: '❸', label: 'Chỉ Số SQI (91.4/100) & Xếp Loại', detail: 'Chỉ số chất lượng học tập tuần và xếp loại tương ứng (Xuất sắc / Giỏi / Khá / Cần cố gắng).' },
      { num: '❹', label: '4 Tiêu Chí Đánh Giá Toàn Diện', detail: 'Bảng chi tiết: Chuyên cần (30đ), Bài tập (30đ), Nội quy lớp (20đ) và Phát biểu (20đ).' },
      { num: '❺', label: 'Biểu Đồ Cột Phân Tích Tuần', detail: 'Đồ thị trực quan tỷ lệ % từng tiêu chí và nhận xét chi tiết của giáo viên.' },
    ],
    tip: 'Phụ huynh có thể quét mã QR trên phiếu in để xem chi tiết nhận xét của thầy cô và biểu đồ học tập trên điện thoại di động.',
  },
];

export const ParentPortalGuide: React.FC = () => {
  const [openId, setOpenId] = useState<string>('view-tuition');

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>👨‍👩‍👧</span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>
            Hướng Dẫn Cổng Phụ Huynh &amp; Học Sinh
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Xem học phí, nộp học phí qua mã QR Techcombank, gửi đơn xin nghỉ và theo dõi báo cáo SQI của con.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {[
            { color: '#7c3aed', label: '👨‍👩‍👧 Phụ Huynh' },
            { color: '#0891b2', label: '🎓 Học Viên' },
          ].map(r => (
            <span key={r.label} style={{ padding: '4px 14px', borderRadius: '99px', background: `${r.color}14`, border: `1px solid ${r.color}33`, color: r.color, fontSize: '12px', fontWeight: 700 }}>
              {r.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === openId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setOpenId(step.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '8px',
                border: isActive ? '1.5px solid #059669' : '1px solid #e2e8f0',
                background: isActive ? '#ecfdf5' : '#f8fafc',
                color: isActive ? '#047857' : '#64748b',
                fontSize: '12.5px', fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span>{step.emoji}</span>
              <span>{idx + 1}. {step.title.split(' ').slice(0, 3).join(' ')}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {STEPS.map((step, idx) => {
          const isOpen = step.id === openId;
          return (
            <div
              key={step.id}
              style={{
                border: isOpen ? '1.5px solid #6ee7b7' : '1px solid #e2e8f0',
                borderRadius: '12px', overflow: 'hidden', background: '#ffffff',
                boxShadow: isOpen ? '0 4px 16px rgba(5, 150, 105, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? '' : step.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 20px',
                  background: isOpen ? 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)' : '#f8fafc',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isOpen ? green : '#e2e8f0',
                  color: isOpen ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800, flexShrink: 0,
                }}>
                  {isOpen ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span style={{ fontSize: '18px' }}>{step.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: isOpen ? '#047857' : '#1e293b' }}>{step.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>{step.subtitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '99px', padding: '2px 8px' }}>
                    {step.role}
                  </span>
                  {isOpen ? <ChevronDown size={16} color={green} /> : <ChevronRight size={16} color="#94a3b8" />}
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '20px 24px 24px', borderTop: '1px solid #d1fae5', background: '#ffffff' }}>
                  {step.imageSrc && (
                    <ImagePreviewBlock src={step.imageSrc} alt={step.imageAlt || step.title} title={step.imageAlt} />
                  )}
                  {step.points && <AnnotationGrid points={step.points} />}
                  {step.secondImageSrc && (
                    <div style={{ marginTop: '24px' }}>
                      <ImagePreviewBlock src={step.secondImageSrc} alt={step.secondImageAlt || ''} title={step.secondImageAlt} />
                      {step.secondPoints && <AnnotationGrid points={step.secondPoints} />}
                    </div>
                  )}
                  {step.tip && <CalloutBox type="tip" text={step.tip} />}
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '28px', padding: '14px 20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={18} color={green} />
        <span style={{ fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
          Cần hỗ trợ thêm? Liên hệ trung tâm qua hotline hoặc gửi ticket hỗ trợ trong hệ thống.
        </span>
      </div>
    </div>
  );
};

export default ParentPortalGuide;
