import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface GuideStep {
  id: string;
  badge: string;
  title: string;
  desc: string;
  imageSrc: string;
  alt: string;
  points: { num: string; label: string; detail: string }[];
  tip?: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'step-class-list',
    badge: '1',
    title: 'Danh Sách Lớp Học Được Phân Công',
    desc: 'Giao diện hiển thị toàn bộ các lớp mà thầy/cô đang trực tiếp giảng dạy hoặc làm trợ giảng.',
    imageSrc: '/guides/hdsd_01_danh_sach_lop.png',
    alt: 'Danh sách lớp học giáo viên',
    points: [
      { num: '❶', label: 'Menu Lớp học', detail: 'Truy cập nhanh danh mục lớp học từ thanh điều hướng bên trái.' },
      { num: '❷', label: 'Bộ lọc & Tìm kiếm', detail: 'Tìm kiếm theo tên lớp, lọc theo khóa học hoặc trạng thái hoạt động.' },
      { num: '❸', label: 'Tạo lớp học mới', detail: 'Mở cửa sổ thiết lập lớp mới khi giáo viên được phân quyền.' },
      { num: '❹', label: 'Danh sách thẻ lớp', detail: 'Bấm vào thẻ lớp để xem chi tiết sĩ số, lịch học cố định và phòng học.' },
    ],
    tip: 'Chỉ các lớp học thầy/cô được phân công làm Giáo viên chính hoặc Trợ giảng mới hiển thị tại đây.',
  },
  {
    id: 'step-class-detail',
    badge: '2',
    title: 'Tổng Quan Hồ Sơ Lớp & Hệ Thống Tab',
    desc: 'Trang quản trị toàn diện thông tin lớp học, đội ngũ giảng dạy và lịch biểu cố định.',
    imageSrc: '/guides/hdsd_02_chi_tiet_lop_thong_tin.png',
    alt: 'Chi tiết lớp học - Thông tin chung',
    points: [
      { num: '❶', label: 'Hệ thống Tab điều hướng', detail: 'Chuyển đổi giữa Thông tin chung, Lịch học, Học sinh, Bài tập, Tài liệu.' },
      { num: '❷', label: 'Thông tin cơ sở & Khóa học', detail: 'Mã lớp, trạng thái, học phí niêm yết và cơ sở đào tạo.' },
      { num: '❸', label: 'Đội ngũ giảng dạy', detail: 'Thông tin Giáo viên chính và Trợ giảng phụ trách lớp.' },
      { num: '❹', label: 'Lịch học cố định', detail: 'Lịch dạy định kỳ trong tuần và phòng học được trung tâm phân bổ.' },
    ],
  },
  {
    id: 'step-schedule-mgmt',
    badge: '3',
    title: 'Quản Lý Lịch Dạy & Mở Điểm Danh',
    desc: 'Tab Lịch học hiển thị lộ trình chi tiết các buổi dạy trong tháng và nút mở phiên điểm danh.',
    imageSrc: '/guides/hdsd_03_lich_day_diem_danh.png',
    alt: 'Quản lý lịch dạy và điểm danh',
    points: [
      { num: '❶', label: 'Bộ lọc tháng', detail: 'Tra cứu lịch giảng dạy theo từng tháng trong năm học.' },
      { num: '❷', label: 'Xuất Excel lịch dạy', detail: 'Tải file Excel tiến độ các buổi học để báo cáo hoặc đối soát.' },
      { num: '❸', label: 'Thêm buổi học', detail: 'Tạo buổi học bù hoặc buổi tăng cường phát sinh ngoài lịch cố định.' },
      { num: '❹', label: 'Nút Điểm danh từng ca', detail: 'Bấm trực tiếp trên từng buổi học để mở cửa sổ Điểm danh & Đánh giá.' },
    ],
  },
  {
    id: 'step-students',
    badge: '4',
    title: 'Quản Lý Sĩ Số Học Sinh Trong Lớp',
    desc: 'Theo dõi hồ sơ, số điện thoại phụ huynh và tiếp nhận học sinh mới vào lớp.',
    imageSrc: '/guides/hdsd_04_quan_ly_hoc_sinh.png',
    alt: 'Quản lý học sinh trong lớp',
    points: [
      { num: '❶', label: 'Danh sách học sinh', detail: 'Bảng thông tin học sinh: Mã HS, Họ tên, Ngày sinh, SĐT phụ huynh.' },
      { num: '❷', label: 'Xuất Excel sĩ số', detail: 'Tải danh sách học sinh phục vụ in ấn hoặc liên lạc với gia đình.' },
      { num: '❸', label: 'Thêm học sinh', detail: 'Thêm học viên mới đăng ký hoặc học viên chuyển từ lớp khác sang.' },
    ],
  },
  {
    id: 'step-attendance-modal',
    badge: '5',
    title: 'Điểm Danh Chuyên Cần Buổi Học',
    desc: 'Ghi nhận trạng thái tham dự lớp học chỉ với 1 thao tác và tích hợp máy chấm công.',
    imageSrc: '/guides/hdsd_05_diem_danh_chuyen_can.png',
    alt: 'Điểm danh chuyên cần',
    points: [
      { num: '❶', label: 'Thông tin buổi học', detail: 'Ngày học, ca học, phòng học và thống kê sĩ số có mặt/vắng.' },
      { num: '❷', label: 'Chuyển Tab nghiệp vụ', detail: 'Chuyển giữa Tab 1. Điểm danh chuyên cần và Tab 2. Đánh giá buổi học.' },
      { num: '❸', label: 'Thao tác hàng loạt', detail: 'Nút "Có mặt tất cả" để điểm danh nhanh cả lớp chỉ với 1 click.' },
      { num: '❹', label: 'Công tắc Có mặt/Vắng', detail: 'Bật/tắt trạng thái điểm danh cho từng học sinh riêng lẻ.' },
      { num: '❺', label: 'Máy chấm công', detail: 'Hiển thị dữ liệu điểm danh vân tay/khuôn mặt từ thiết bị trung tâm.' },
    ],
  },
  {
    id: 'step-evaluation-ai',
    badge: '6',
    title: 'Đánh Giá 1-Chạm & Trợ Lý AI Viết Nhận Xét',
    desc: 'Đánh giá thái độ học tập và để Gemini AI tự động viết lời phê sư phạm gửi phụ huynh.',
    imageSrc: '/guides/hdsd_06_danh_gia_1cham_ai.png',
    alt: 'Đánh giá 1-chạm và AI nhận xét',
    points: [
      { num: '❶', label: 'Nhập điểm buổi học', detail: 'Ghi nhận điểm số kiểm tra miệng/15p trên thang điểm 10.' },
      { num: '❷', label: 'Đánh giá 1-Chạm', detail: 'Bấm nhanh 4 tiêu chí: Làm BTVN, Nề nếp, Chuyên cần, Phát biểu.' },
      { num: '❸', label: 'Nút AI viết nhận xét', detail: 'Bấm biểu tượng AI từng em để hệ thống tự động sinh lời phê chuẩn mực.' },
      { num: '❹', label: 'Hộp sửa nhận xét', detail: 'Đọc lại và tùy chỉnh nội dung nhận xét trước khi gửi đi.' },
      { num: '❺', label: 'Nút "Cả lớp TỐT"', detail: 'Đánh dấu đồng loạt tất cả học sinh có mặt đều đạt kết quả tốt.' },
      { num: '❻', label: 'Nút "AI Viết tất cả"', detail: 'AI tự động hoàn thành nhận xét cho cả lớp trong 3 giây.' },
    ],
    tip: 'Nội dung nhận xét sẽ tự động được gửi qua Zalo/App thông báo tới phụ huynh học sinh.',
  },
  {
    id: 'step-assignments-mgmt',
    badge: '7',
    title: 'Quản Trị Bài Tập Về Nhà Của Lớp',
    desc: 'Theo dõi các bài tập đã giao, tiến độ nộp bài và số lượng bài cần chấm điểm.',
    imageSrc: '/guides/hdsd_07_quan_ly_bai_tap.png',
    alt: 'Quản trị bài tập lớp học',
    points: [
      { num: '❶', label: 'Tab Bài tập', detail: 'Khu vực quản lý toàn bộ các bài tập đã giao cho lớp.' },
      { num: '❷', label: 'Nút Giao bài tập', detail: 'Khởi tạo đề bài tập mới cho học sinh làm ở nhà.' },
      { num: '❸', label: 'Thống kê tiến độ', detail: 'Theo dõi số học sinh đã nộp, số bài chờ chấm và đã chấm xong.' },
      { num: '❹', label: 'Nút Xem & Chấm bài', detail: 'Mở danh sách các bài làm của học sinh để chấm điểm.' },
    ],
  },
  {
    id: 'step-create-assignment',
    badge: '8',
    title: 'Quy Trình Giao Bài Tập & Đính Kèm Đề Bài',
    desc: 'Thiết lập yêu cầu đề bài, đặt hạn nộp và tải tệp đề bài đính kèm.',
    imageSrc: '/guides/hdsd_08_modal_giao_bai_tap.png',
    alt: 'Modal giao bài tập mới',
    points: [
      { num: '❶', label: 'Tiêu đề bài tập', detail: 'Đặt tên bài tập rõ ràng (Ví dụ: Bài tập tuần 1 - Ôn tập thì HTHT).' },
      { num: '❷', label: 'Hướng dẫn làm bài', detail: 'Nhập yêu cầu chi tiết hoặc format bài nộp cho học sinh.' },
      { num: '❸', label: 'Hạn nộp & Điểm tối đa', detail: 'Thiết lập ngày giờ hết hạn và thang điểm tối đa (thang 10).' },
      { num: '❹', label: 'Trạng thái giao', detail: 'Chọn Đã giao (HS thấy ngay) hoặc Bản nháp (chuẩn bị trước).' },
      { num: '❺', label: 'Tệp đính kèm', detail: 'Tải lên đề bài dạng file PDF, DOCX, hình ảnh hoặc tệp nén.' },
    ],
  },
  {
    id: 'step-grade-submissions',
    badge: '9',
    title: 'Chấm Điểm Bài Tập & Phản Hồi Học Sinh',
    desc: 'Xem bài làm học sinh gửi lên, tải tệp bài làm và ghi nhận điểm số kèm lời phê.',
    imageSrc: '/guides/hdsd_09_cham_diem_bai_nop.png',
    alt: 'Chấm điểm bài nộp của học sinh',
    points: [
      { num: '❶', label: 'Danh sách bài nộp', detail: 'Xem danh sách các học sinh đã nộp bài tập.' },
      { num: '❷', label: 'Tệp bài làm & Giờ nộp', detail: 'Bấm vào tên file để tải về xem, kiểm tra thời gian nộp đúng hạn.' },
      { num: '❸', label: 'Điểm số & Nhận xét', detail: 'Xem điểm số và lời phê đã lưu trước đó.' },
      { num: '❹', label: 'Nút Chấm bài / Sửa điểm', detail: 'Mở hộp thoại nhập điểm và nhận xét chi tiết cho bài làm của em.' },
    ],
  },
];

export const TeacherClassFeaturesGuide: React.FC = () => {
  return (
    <div style={{ color: '#1e293b', fontSize: '14px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
      {/* ── HEADER GIỚI THIỆU ── */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
          <Sparkles size={13} /> TÀI LIỆU MINH HỌA THỰC TẾ
        </div>
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
          <span>📚</span> Cẩm Nang Quản Lý Lớp Học & Bài Tập Về Nhà Cho Giáo Viên
        </h1>
        <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
          Hướng dẫn trực quan chi tiết toàn bộ tính năng quản trị lớp học của Giáo viên trên hệ thống <strong>DAO EDU</strong>. Mỗi tính năng đều có <strong>ảnh chụp màn hình thực tế, khoanh vùng đỏ và đánh số thứ tự</strong> giúp thầy/cô nắm bắt nhanh chóng.
        </p>
      </div>

      {/* ── QUICK JUMP NAVIGATION ── */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '32px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
          MỤC LỤC TÍNH NĂNG NHANH
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {GUIDE_STEPS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10.5px' }}>
                {s.badge}
              </span>
              <span>{s.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── DANH SÁCH 9 BƯỚC HƯỚNG DẪN CHI TIẾT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '42px' }}>
        {GUIDE_STEPS.map((step) => (
          <section
            key={step.id}
            id={step.id}
            style={{
              scrollMarginTop: '80px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            {/* Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#047857',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                {step.badge}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {step.title}
              </h2>
            </div>

            <p style={{ color: '#475569', fontSize: '13.5px', margin: '0 0 16px', paddingLeft: '38px' }}>
              {step.desc}
            </p>

            {/* Ảnh chụp màn hình khoanh vùng */}
            <div
              style={{
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#0f172a',
                marginBottom: '18px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={step.imageSrc}
                alt={step.alt}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
                loading="lazy"
              />
            </div>

            {/* Bảng chú thích tính năng được khoanh đỏ */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: step.tip ? '12px' : '0' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase' }}>
                📌 Chi tiết các điểm được khoanh vùng trên màn hình:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {step.points.map((p) => (
                  <div key={p.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '14px', lineHeight: 1.2 }}>{p.num}</span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{p.label}: </strong>
                      <span style={{ color: '#475569' }}>{p.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mẹo sư phạm nếu có */}
            {step.tip && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#166534',
                  fontSize: '13px',
                }}
              >
                <CheckCircle2 size={16} color="#16a34a" />
                <span><strong>Mẹo thao tác:</strong> {step.tip}</span>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
