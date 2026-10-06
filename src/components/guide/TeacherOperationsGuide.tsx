import React, { useState } from 'react';
import {
  DollarSign,
  CalendarOff,
  Award,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Upload,
  Eye,
  Clock,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Types & Helpers
───────────────────────────────────────── */
interface OpStep {
  id: string;
  emoji: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  content: React.ReactNode;
}

const green = '#059669';
const blue = '#2563eb';
const purple = '#7c3aed';

const Callout: React.FC<{ type: 'tip' | 'warning' | 'note'; text: string }> = ({ type, text }) => {
  const map = {
    tip: { bg: '#ecfdf5', border: '#a7f3d0', icon: '💡', color: '#065f46' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', color: '#92400e' },
    note: { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', color: '#1e40af' },
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
        alignItems: 'flex-start',
        gap: '8px',
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: '15px' }}>{s.icon}</span>
      <span>{text}</span>
    </div>
  );
};

const TagBadge: React.FC<{ color: string; bg: string; text: string }> = ({ color, bg, text }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      color,
      background: bg,
      border: `1px solid ${color}33`,
      marginRight: '6px',
    }}
  >
    {text}
  </span>
);

/* ─────────────────────────────────────────
   Section 1: Xem Lương
───────────────────────────────────────── */
const SalaryGuideContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Mục <strong>&ldquo;Lịch sử nhận lương&rdquo;</strong> giúp thầy/cô minh bạch toàn bộ thu nhập từ các buổi dạy, đối soát số buổi thực tế và theo dõi tiến độ chi trả của trung tâm.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11.5px', color: '#166534', fontWeight: 600 }}>TỔNG ĐÃ THANH TOÁN</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>15.200.000 ₫</div>
        <div style={{ fontSize: '11px', color: '#16a34a' }}>Đã quyết toán về tài khoản</div>
      </div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11.5px', color: '#854d0e', fontWeight: 600 }}>CHỜ QUYẾT TOÁN (PENDING)</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>4.800.000 ₫</div>
        <div style={{ fontSize: '11px', color: '#d97706' }}>Kỳ hiện tại chờ đối soát</div>
      </div>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 600 }}>SỐ KỲ THANH TOÁN</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>4 / 5 kỳ</div>
        <div style={{ fontSize: '11px', color: '#3b82f6' }}>Đã hoàn tất giải ngân</div>
      </div>
    </div>

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={15} color={blue} /> Các bước tra cứu chi tiết lương:
      </div>
      <ol style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '13px', lineHeight: 1.8 }}>
        <li>Truy cập menu bên trái: chọn <strong>&ldquo;Lịch sử nhận lương&rdquo;</strong> (biểu tượng <code>$</code>).</li>
        <li>Sử dụng thanh bộ lọc trên cùng để chọn <strong>Kỳ tháng</strong> hoặc lọc theo trạng thái: <TagBadge color="#15803d" bg="#dcfce7" text="Đã thanh toán (Paid)" /> hoặc <TagBadge color="#b45309" bg="#fef3c7" text="Chờ thanh toán (Pending)" />.</li>
        <li>Bấm vào từng kỳ lương để <strong>mở rộng danh sách lớp học</strong>: xem chi tiết Tên lớp, Khóa học, Số buổi dạy, Thù lao mỗi ca (Rate) và Thành tiền.</li>
      </ol>
    </div>

    <Callout
      type="tip"
      text="Thù lao buổi dạy được tự động ghi nhận khi buổi học đã Hoàn thành và Khóa điểm danh. Thầy/cô nhớ hoàn tất điểm danh đúng hạn để kế toán chốt bảng lương chính xác."
    />
  </div>
);

/* ─────────────────────────────────────────
   Section 2: Báo Cáo Tuần SQI
───────────────────────────────────────── */
const SqiReportsGuideContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Mục <strong>&ldquo;Báo cáo tuần SQI&rdquo;</strong> tổng hợp chỉ số đánh giá học tập tuần/tháng của từng học sinh dựa trên dữ liệu chuyên cần, làm bài tập và nhận xét sư phạm.
    </p>

    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '8px' }}>
        🎯 Bảng 5 Mức Xếp Loại SQI (Thang 100 điểm):
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <TagBadge color="#047857" bg="#ecfdf5" text="Mức 5: Xuất sắc (≥ 90đ)" />
        <TagBadge color="#1d4ed8" bg="#eff6ff" text="Mức 4: Giỏi (80 - 89đ)" />
        <TagBadge color="#b45309" bg="#fffbeb" text="Mức 3: Khá (65 - 79đ)" />
        <TagBadge color="#c2410c" bg="#fff7ed" text="Mức 2: Trung bình (50 - 64đ)" />
        <TagBadge color="#b91c1c" bg="#fef2f2" text="Mức 1: Cần cố gắng (< 50đ)" />
      </div>
    </div>

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Eye size={15} color={purple} /> Quy trình xem thiệp & gửi phụ huynh:
      </div>
      <ol style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '13px', lineHeight: 1.8 }}>
        <li>Truy cập menu <strong>&ldquo;Báo cáo tuần SQI&rdquo;</strong> → Chọn Lớp học phụ trách.</li>
        <li>Chuyển chế độ xem theo <strong>Tuần</strong> hoặc <strong>Tháng</strong> tại thanh công cụ trên cùng.</li>
        <li>Bấm biểu tượng con mắt <TagBadge color="#7c3aed" bg="#f3e8ff" text="👁️ Xem thiệp" /> trên từng học sinh để xem thiệp báo cáo đẹp mắt gửi gia đình.</li>
        <li>Kiểm tra trạng thái duyệt: <TagBadge color="#15803d" bg="#dcfce7" text="Đã duyệt" /> hoặc <TagBadge color="#64748b" bg="#f1f5f9" text="Bản nháp" />.</li>
        <li>Sau khi gửi Zalo/Phụ huynh, tích chọn checkbox <strong>&ldquo;Đã gửi&rdquo;</strong> để đánh dấu hoàn thành.</li>
        <li>Bấm nút <strong>&ldquo;Xuất báo cáo SQI&rdquo;</strong> để tải file Excel tổng hợp kèm mã QR link tra cứu công khai.</li>
      </ol>
    </div>

    <Callout
      type="note"
      text="Thầy/cô có thể dùng trợ lý AI trong cửa sổ điểm danh để tự động sinh lời phê cho từng em trước khi hệ thống tổng hợp thành báo cáo tuần."
    />
  </div>
);

/* ─────────────────────────────────────────
   Section 3: Duyệt Đơn Xin Nghỉ
───────────────────────────────────────── */
const LeaveRequestsGuideContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Mục <strong>&ldquo;Đơn xin nghỉ&rdquo;</strong> cho phép thầy/cô tiếp nhận và phê duyệt đơn xin phép vắng học từ phụ huynh/học sinh.
    </p>

    <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '6px' }}>
        📋 Thông tin hiển thị trên mỗi đơn xin nghỉ:
      </div>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '12.5px', lineHeight: 1.7 }}>
        <li>Họ tên & Mã học sinh nộp đơn</li>
        <li>Tên lớp học & Ngày buổi học xin nghỉ kèm khung giờ (VD: <code>18:00 - 19:30</code>)</li>
        <li>Lý do xin nghỉ từ gia đình (bị ốm, bận việc gia đình, trùng lịch thi...)</li>
        <li>Thời gian nộp đơn & Trạng thái: <TagBadge color="#d97706" bg="#fef3c7" text="Chờ duyệt" /></li>
      </ul>
    </div>

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={15} color={green} /> Thao tác xử lý đơn:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>1. Duyệt đơn (Màu xanh)</span>
          <span>Bấm <strong>&ldquo;Duyệt&rdquo;</strong> → Nhập lời dặn dò (tuỳ chọn) → Xác nhận.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>2. Từ chối (Màu đỏ)</span>
          <span>Bấm <strong>&ldquo;Từ chối&rdquo;</strong> → Nhập lý do từ chối để phụ huynh nhận thông báo.</span>
        </div>
      </div>
    </div>

    <div
      style={{
        background: '#ecfdf5',
        border: '1.5px solid #10b981',
        borderRadius: '8px',
        padding: '12px 14px',
        color: '#065f46',
        fontSize: '13px',
        lineHeight: 1.6,
      }}
    >
      <strong>⭐ Cơ chế tự động đồng bộ điểm danh:</strong> Ngay khi thầy/cô bấm <strong>&ldquo;Duyệt đơn&rdquo;</strong>, hệ thống sẽ tự động cập nhật trạng thái của học sinh trong buổi học đó thành <strong>&ldquo;Vắng có phép&rdquo;</strong>, không bị tính vắng không phép hay ảnh hưởng oan đến điểm SQI!
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Section 4: Upload Tài Liệu Học Tập
───────────────────────────────────────── */
const MaterialsGuideContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Mục <strong>&ldquo;Tài liệu học tập&rdquo;</strong> là kho lưu trữ bài giảng, giáo trình, slide và đề ôn tập được chia sẻ trực tiếp cho học sinh trong lớp.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>📍 Cách 1: Qua Menu chính</div>
        <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
          Vào menu bên trái chọn <strong>&ldquo;Tài liệu học tập&rdquo;</strong> → Chọn lớp cần đăng tải tài liệu tại ô chọn lớp.
        </div>
      </div>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>📍 Cách 2: Trong Chi tiết lớp</div>
        <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
          Vào <strong>Lớp học</strong> → Bấm vào lớp cụ thể → Chọn Tab <strong>&ldquo;Tài liệu học tập&rdquo;</strong>.
        </div>
      </div>
    </div>

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Upload size={15} color={purple} /> Các bước tải lên tài liệu:
      </div>
      <ol style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '13px', lineHeight: 1.8 }}>
        <li>Nhấn nút <strong>&ldquo;Tải tài liệu mới&rdquo;</strong> (màu tím xanh nổi bật ở góc phải).</li>
        <li>Nhập <strong>Tiêu đề tài liệu</strong> (VD: <em>Đề cương ôn tập Giữa kỳ 1 - Sinh học 8</em>).</li>
        <li>Nhập <strong>Mô tả ngắn</strong> (tuỳ chọn): hướng dẫn học sinh cách làm bài hoặc phạm vi kiến thức.</li>
        <li>Bấm <strong>Chọn tệp</strong> để đính kèm file: hỗ trợ PDF, DOCX, PPTX, XLSX, hình ảnh...</li>
        <li>Bấm <strong>&ldquo;Tải lên&rdquo;</strong>: tệp sẽ được lưu an toàn trên máy chủ đám mây.</li>
      </ol>
    </div>

    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px', fontSize: '12.5px', color: '#1e40af' }}>
      <strong>👀 Phía Học sinh & Phụ huynh:</strong> Ngay sau khi thầy/cô tải tài liệu lên, toàn bộ học sinh trong lớp sẽ nhìn thấy tại mục <em>&ldquo;Tài liệu học tập&rdquo;</em> của Cổng học viên và có thể tải về để ôn bài mọi lúc mọi nơi.
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export const TeacherOperationsGuide: React.FC = () => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    salary: true,
    leave: true,
    sqi: false,
    materials: false,
  });

  const toggle = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const steps: OpStep[] = [
    {
      id: 'salary',
      emoji: '💵',
      icon: <DollarSign size={18} color="#15803d" />,
      title: '1. Tra Cứu Lương & Lịch Sử Thu Nhập',
      subtitle: 'Xem bảng kê chi tiết từng ca dạy, thù lao lớp học và trạng thái thanh toán từ trung tâm.',
      badge: '/teacher/salary',
      badgeColor: '#15803d',
      content: <SalaryGuideContent />,
    },
    {
      id: 'leave',
      emoji: '📝',
      icon: <CalendarOff size={18} color="#b45309" />,
      title: '2. Duyệt Đơn Xin Nghỉ Của Học Sinh',
      subtitle: 'Tiếp nhận đơn nghỉ từ phụ huynh, phản hồi lý do và tự động đồng bộ vào ca điểm danh.',
      badge: '/teacher/leave-requests',
      badgeColor: '#b45309',
      content: <LeaveRequestsGuideContent />,
    },
    {
      id: 'sqi',
      emoji: '📊',
      icon: <Award size={18} color="#7c3aed" />,
      title: '3. Xem & Duyệt Báo Cáo Tuần SQI',
      subtitle: 'Theo dõi 5 mức xếp loại chất lượng học tập, mở thiệp báo cáo học sinh và gửi Zalo cho phụ huynh.',
      badge: '/teacher/weekly-reports',
      badgeColor: '#7c3aed',
      content: <SqiReportsGuideContent />,
    },
    {
      id: 'materials',
      emoji: '📁',
      icon: <BookMarked size={18} color="#2563eb" />,
      title: '4. Đăng Tải & Quản Lý Tài Liệu Học Tập',
      subtitle: 'Upload giáo trình, bài tập, slide bài giảng cho lớp học để học sinh tải về ôn luyện.',
      badge: '/teacher/materials',
      badgeColor: '#2563eb',
      content: <MaterialsGuideContent />,
    },
  ];

  return (
    <div style={{ color: '#1e293b', fontSize: '14px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
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
          <span>💼</span> Cẩm Nang Nghiệp Vụ Giáo Viên: Lương, Đơn Nghỉ, Báo Cáo SQI & Tài Liệu
        </h1>
        <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
          Hướng dẫn toàn diện 4 tính năng mở rộng quan trọng dành riêng cho giáo viên trên <strong>EduCare (DAO EDU)</strong>: từ tra cứu thu nhập, phê duyệt đơn xin nghỉ, quản trị báo cáo SQI đến chia sẻ tài liệu bài giảng cho lớp học.
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {steps.map(step => {
          const isOpen = openIds[step.id];
          return (
            <div
              key={step.id}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header clickable */}
              <div
                onClick={() => toggle(step.id)}
                style={{
                  padding: '16px 20px',
                  background: isOpen ? '#f8fafc' : '#ffffff',
                  borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: `${step.badgeColor}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    {step.emoji}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '15.5px', color: '#0f172a' }}>{step.title}</span>
                      <code
                        style={{
                          fontSize: '11px',
                          color: step.badgeColor,
                          background: `${step.badgeColor}12`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${step.badgeColor}30`,
                        }}
                      >
                        {step.badge}
                      </code>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{step.subtitle}</div>
                  </div>
                </div>

                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>

              {/* Body */}
              {isOpen && <div style={{ padding: '20px', background: '#ffffff' }}>{step.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
