import React from 'react';
import {
  Sparkles,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

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

const STUDENT_GUIDE_STEPS: GuideStep[] = [
  {
    id: 'step-student-dashboard',
    badge: '1',
    title: 'Tổng Quan Dashboard & Buổi Học Sắp Tới',
    desc: 'Ngay khi đăng nhập, học sinh nắm bắt toàn bộ trạng thái học tập, buổi học tiếp theo và bài tập cần làm.',
    imageSrc: '/guides/hdsd_student_01_dashboard.png',
    alt: 'Tổng quan Dashboard học sinh',
    points: [
      { num: '❶', label: 'Menu Điều Hướng Học Sinh', detail: 'Truy cập nhanh Dashboard, Báo cáo tuần SQI, Bài tập, Đơn xin nghỉ, Học phí và Tài liệu học tập.' },
      { num: '❷', label: 'Lớp Học Tiếp Theo', detail: 'Hiển thị ca học sắp diễn ra nhất: môn học, mã lớp, thời gian, phòng học và giáo viên phụ trách.' },
      { num: '❸', label: 'Số Lớp Tham Gia & Chuyên Cần', detail: 'Theo dõi tổng số lớp đang đăng ký và tỷ lệ chuyên cần đi học đầy đủ (ví dụ: 75%).' },
      { num: '❹', label: 'Danh Sách Lớp Đang Học', detail: 'Xem tất cả các lớp đang theo học, số buổi đã hoàn thành và tỷ lệ chuyên cần từng môn.' },
      { num: '❺', label: 'Bài Tập & Nhận Xét Của GV', detail: 'Danh sách bài tập chưa hoàn thành kèm hạn chót và nhận xét mới nhất từ thầy cô.' },
    ],
    tip: 'Bấm nút "Bài tập cần làm" ở góc trên cùng bên phải để chuyển nhanh đến danh sách bài tập đang mở.',
  },
  {
    id: 'step-student-schedule',
    badge: '2',
    title: 'Tra Cứu Lịch Học & Ca Học Trong Tháng',
    desc: 'Lịch học dạng lưới trực quan giúp học sinh và phụ huynh chủ động nắm bắt toàn bộ thời khóa biểu.',
    imageSrc: '/guides/hdsd_student_02_schedule.png',
    alt: 'Tra cứu lịch học học sinh',
    points: [
      { num: '❶', label: 'Tháng & Nút Chuyển Tháng', detail: 'Chuyển đổi linh hoạt giữa các tháng hoặc bấm "Hôm nay" để quay lại ngày hiện tại.' },
      { num: '❷', label: 'Hàng Thứ Trong Tuần', detail: 'Bố cục 7 cột từ Thứ 2 đến Chủ Nhật giúp sắp xếp kế hoạch tuần chuẩn xác.' },
      { num: '❸', label: 'Các Ca Học Trong Ngày', detail: 'Mỗi ô ngày hiển thị chi tiết các ca học với mã lớp và khung giờ (ví dụ: 18:00).' },
      { num: '❹', label: 'Chi Tiết Buổi Học Hôm Nay', detail: 'Ô ngày hiện tại được đánh dấu nổi bật với số ngày màu xanh lá cây để dễ nhận biết.' },
    ],
    tip: 'Các ô lớp có nền xanh nhạt biểu thị ca học sắp diễn ra, học sinh nên xem trước bài học và chuẩn bị tài liệu.',
  },
  {
    id: 'step-student-assignments',
    badge: '3',
    title: 'Theo Dõi Danh Sách Bài Tập Của Lớp',
    desc: 'Hệ thống tự động phân loại bài tập giúp học sinh không bao giờ bỏ sót bài về nhà hay quá hạn nộp.',
    imageSrc: '/guides/hdsd_student_03_assignments.png',
    alt: 'Danh sách bài tập học sinh',
    points: [
      { num: '❶', label: 'Thống Kê 3 Nhóm Trạng Thái', detail: 'Phân loại bài tập rõ ràng: Cần làm (chưa nộp), Đã nộp (chờ chấm), Đã chấm (đã có điểm).' },
      { num: '❷', label: 'Tên Bài Tập & Lớp Học', detail: 'Hiển thị tiêu đề bài tập (ví dụ: BTVN Tuần 1 - Ôn tập Từ vựng) và mã lớp học tương ứng.' },
      { num: '❸', label: 'Hướng Dẫn Của GV & Hạn Chót', detail: 'Ghi chú dặn dò của giáo viên bộ môn và thời hạn chót nộp bài (Deadline) chính xác đến từng phút.' },
      { num: '❹', label: 'Nút "Nộp bài"', detail: 'Bấm nút xanh lá cây trên thẻ bài tập để mở hộp thoại gửi bài làm trực tuyến.' },
    ],
    tip: 'Ưu tiên làm các bài tập có nhãn màu cam "cần làm" để hoàn thành trước thời hạn nộp bài.',
  },
  {
    id: 'step-student-submit',
    badge: '4',
    title: 'Hướng Dẫn Nộp Bài Tập & Tải Tệp Đính Kèm',
    desc: 'Học sinh có thể nhập câu trả lời trực tiếp hoặc đính kèm file PDF/ảnh bài viết tay dễ dàng.',
    imageSrc: '/guides/hdsd_student_04_submit_modal.png',
    alt: 'Modal nộp bài tập',
    points: [
      { num: '❶', label: 'Tiêu Đề Bài Tập Đang Nộp', detail: 'Kiểm tra chính xác tên đề bài và lớp học trước khi tiến hành soạn bài làm.' },
      { num: '❷', label: 'Khung Soạn Thảo Văn Bản', detail: 'Nhập trực tiếp câu trả lời, lời giải bài tập hoặc ghi chú gửi đến thầy/cô giảng dạy.' },
      { num: '❸', label: 'Tải Lên Tệp Đính Kèm', detail: 'Bấm nút "Chọn file" để tải lên bài làm chụp từ vở viết hoặc file PDF tài liệu.' },
      { num: '❹', label: 'Bấm "Nộp bài" Hoàn Tất', detail: 'Nhấn nút xanh lá cây để nộp. Bài tập lập tức được lưu vào hệ thống và chuyển sang nhóm Đã nộp.' },
    ],
    tip: 'Nếu cần sửa hoặc bổ sung bài giải, học sinh có thể tiếp tục nộp cập nhật trước khi hết hạn deadline.',
  },
  {
    id: 'step-student-reports',
    badge: '5',
    title: 'Xem Báo Cáo Tuần Chất Lượng SQI & Nhận Xét Của GV',
    desc: 'Phiếu báo cáo học tập tuần toàn diện với chỉ số SQI (thang điểm 100), 4 tiêu chí và biểu đồ phân tích.',
    imageSrc: '/guides/hdsd_student_05_weekly_reports.png',
    alt: 'Báo cáo tuần chất lượng SQI học sinh',
    points: [
      { num: '❶', label: 'Chọn Năm Học & Tuần Báo Cáo', detail: 'Tra cứu nhanh phiếu báo cáo tuần học bất kỳ trong suốt năm học.' },
      { num: '❷', label: 'Xuất PDF / In A4 & QR Link', detail: 'Tải file PDF đạt chuẩn in A4 gửi gia đình hoặc lấy link & mã QR mở xem trên điện thoại.' },
      { num: '❸', label: 'Chỉ Số SQI (91.4/100) & Xếp Loại', detail: 'Chỉ số chất lượng học tập tuần và xếp loại tương ứng (Xuất sắc / Giỏi / Khá / Cần cố gắng).' },
      { num: '❹', label: '4 Tiêu Chí Đánh Giá Toàn Diện', detail: 'Bảng chi tiết: Chuyên cần (30đ), Bài tập (30đ), Nội quy lớp (20đ) và Phát biểu năng động (20đ).' },
      { num: '❺', label: 'Biểu Đồ Cột Phân Tích Tuần', detail: 'Đồ thị trực quan tỷ lệ % từng tiêu chí và điểm trung bình các bài kiểm tra theo môn.' },
    ],
    tip: 'Phụ huynh có thể quét mã QR trên phiếu in để xem chi tiết nhận xét của thầy cô và biểu đồ học tập trên điện thoại.',
  },
];

export const StudentPortalGuide: React.FC = () => {
  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', color: '#172033', fontFamily: 'Inter, sans-serif' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.2)',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Smartphone size={13} /> Dành Cho Học Sinh & Phụ Huynh
          </span>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>• DAO EDU Học Tập</span>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3, color: '#ffffff' }}>
          Cẩm Nang Học Sinh: Xem Lịch Học, Bài Tập, Nộp Bài & Báo Cáo SQI
        </h1>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, opacity: 0.95, maxWidth: '820px' }}>
          Hướng dẫn chi tiết từng bước cho học sinh tra cứu lịch học theo tháng, theo dõi danh sách bài tập được giao,
          thao tác nộp bài làm trực tuyến và tra cứu phiếu báo cáo kết quả tuần chất lượng SQI (thang điểm 100).
        </p>

        {/* Demo Account Badge */}
        <div
          style={{
            marginTop: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 14px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            fontSize: '12.5px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ fontWeight: 700, color: '#a7f3d0' }}>🔑 Tài khoản trải nghiệm:</span>
          <span>
            Email: <code style={{ color: '#fef08a', background: 'transparent' }}>an.nguyen@student.dao.edu.vn</code>
          </span>
          <span>|</span>
          <span>
            Mật khẩu: <code style={{ color: '#fef08a', background: 'transparent' }}>educare123</code>
          </span>
        </div>
      </div>

      {/* Quick Jump Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
          📌 MỤC LỤC NHANH (BẤM ĐỂ XEM HƯỚNG DẪN CHI TIẾT)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {STUDENT_GUIDE_STEPS.map((step) => (
            <a
              key={step.id}
              href={`#${step.id}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e293b',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {step.badge}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {STUDENT_GUIDE_STEPS.map((step) => (
          <section
            key={step.id}
            id={step.id}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {/* Step Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                background: '#fafafa',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#059669',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                    }}
                  >
                    {step.badge}
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{step.title}</h2>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>{step.desc}</p>
              </div>

              <a
                href={step.imageSrc}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                }}
              >
                <ExternalLink size={13} /> Xem ảnh gốc
              </a>
            </div>

            {/* Step Image */}
            <div style={{ padding: '20px 24px', background: '#f8fafc', textAlign: 'center' }}>
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  background: '#ffffff',
                }}
              >
                <img
                  src={step.imageSrc}
                  alt={step.alt}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Step Annotations Guide */}
            <div style={{ padding: '20px 24px' }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#047857',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '14px',
                }}
              >
                🔍 Chú Thích Các Vùng Đánh Số Màu Đỏ:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {step.points.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        lineHeight: 1,
                        color: '#dc2626',
                        fontWeight: 900,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {pt.num}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
                        {pt.label}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45 }}>{pt.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip callout */}
              {step.tip && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '12.5px',
                    color: '#065f46',
                  }}
                >
                  <Sparkles size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#047857' }}>Mẹo hữu ích: </strong>
                    {step.tip}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default StudentPortalGuide;
