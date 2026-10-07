import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Components & Helpers
───────────────────────────────────────── */
const CalloutBox: React.FC<{
  type: 'tip' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const styles = {
    tip: { bg: '#ecfdf5', border: '#a7f3d0', left: '#10b981', color: '#065f46', icon: '💡' },
    warning: { bg: '#fffbeb', border: '#fde68a', left: '#f59e0b', color: '#92400e', icon: '⚠️' },
    info: { bg: '#eff6ff', border: '#bfdbfe', left: '#3b82f6', color: '#1e40af', icon: 'ℹ️' },
  }[type];

  return (
    <div
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderLeft: `4px solid ${styles.left}`,
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '12px 0',
        fontSize: '13px',
        lineHeight: 1.6,
        color: styles.color,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '15px' }}>{styles.icon}</span>
        <div style={{ flex: 1 }}>
          {title && <div style={{ fontWeight: 700, marginBottom: '4px' }}>{title}</div>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

const GuideImage: React.FC<{ src: string; alt: string; caption?: string }> = ({ src, alt, caption }) => (
  <div style={{ margin: '14px 0', textAlign: 'center' }}>
    <div
      style={{
        display: 'inline-block',
        width: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        background: '#ffffff',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        loading="lazy"
      />
    </div>
    {caption && (
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
        📸 {caption}
      </div>
    )}
  </div>
);

const StepPill: React.FC<{ num: string; label: string; desc: React.ReactNode }> = ({ num, label, desc }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#4f46e5',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '12px',
        flexShrink: 0,
        marginTop: '2px',
      }}
    >
      {num}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>{desc}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Section 1: Tạo Mã & Cấp Tài Khoản
───────────────────────────────────────── */
const CreateStudentCodeContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Trên hệ thống <strong>DAO EDU</strong>, mã học sinh là định danh duy nhất (Unique ID) được <strong>hệ thống tự động cấp phát (Auto generate)</strong>, gắn liền với số điện thoại phụ huynh để đăng nhập Cổng học viên.
    </p>

    <GuideImage
      src="/guides/hdsd_teacher_02_tao_nhanh_hoc_sinh.png"
      alt="Cửa sổ tạo nhanh học sinh mới và tự động sinh mã"
      caption="Hình 1: Cửa sổ tạo nhanh học sinh mới — Tự động sinh mã HS, cấp mật khẩu mặc định 123456"
    />

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <KeyRound size={15} color="#6366f1" /> Cấp Mã tự động (Auto Generate):
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569', fontSize: '12.5px', lineHeight: 1.6 }}>
          <li>Hệ thống tự sinh mã chuẩn (VD: <code>HS00124</code>, <code>HS00125</code>...).</li>
          <li>Thầy cô <strong>không cần tự gõ mã thủ công</strong>, chống trùng lặp 100%.</li>
        </ul>
      </div>

      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={15} color="#16a34a" /> Tài khoản Cổng học viên:
        </div>
        <div style={{ fontSize: '12.5px', color: '#166534', lineHeight: 1.6 }}>
          <div>• <strong>Tên đăng nhập:</strong> Mã HS hoặc Số điện thoại phụ huynh.</div>
          <div>• <strong>Mật khẩu mặc định:</strong> <code>123456</code> (đổi sau khi vào).</div>
        </div>
      </div>
    </div>

    <CalloutBox type="tip" title="Mẫu tin nhắn gửi phụ huynh">
      &ldquo;Tài khoản tra cứu học phí và lịch học của con: Tên đăng nhập: [SĐT_Phụ_Huynh] | Mật khẩu: 123456 | Link: /login&rdquo;
    </CalloutBox>
  </div>
);

/* ─────────────────────────────────────────
   Section 2: Thêm Học Sinh Mới Vào Lớp
───────────────────────────────────────── */
const AddStudentToClassContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Thầy cô có thể thêm học sinh có sẵn từ hệ thống hoặc bấm nút tạo nhanh khi có học sinh đi học thử / đột xuất:
    </p>

    <GuideImage
      src="/guides/hdsd_teacher_01_them_hoc_sinh.png"
      alt="Cửa sổ Thêm Học sinh vào lớp"
      caption="Hình 2: Cửa sổ Thêm Học sinh vào lớp — Chọn học sinh có sẵn hoặc Tạo nhanh học sinh mới"
    />

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
      <StepPill
        num="1"
        label="Chọn hình thức thêm học sinh"
        desc={
          <span>
            <strong>Ô (1):</strong> Tìm theo Tên/SĐT để chọn học sinh có sẵn. Hoặc <strong>Ô (2):</strong> Bấm nút nét đứt <em>&ldquo;+ Tạo học sinh mới & thêm vào lớp&rdquo;</em> (chỉ cần Họ tên + SĐT).
          </span>
        }
      />
      <StepPill
        num="2"
        label="Bấm 'Thêm vào lớp' tại ô (3)"
        desc="Lưu học sinh vào danh sách lớp học."
      />
      <StepPill
        num="3"
        label="BƯỚC QUAN TRỌNG: Đồng bộ buổi học ngay"
        desc="Khi hệ thống hỏi 'Đồng bộ buổi học ngay?', chọn 'Đồng bộ ngay' để học sinh có tên trong ca điểm danh hôm nay và các ca tiếp theo!"
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Section 3: Thêm Buổi Học Đột Xuất Ngoài Lịch
───────────────────────────────────────── */
const ExtraSessionContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Khi lớp học bù nghỉ lễ, thời tiết xấu hoặc ca tăng cường ôn thi, thầy cô tạo buổi học đột xuất theo các ô khoanh đỏ:
    </p>

    <GuideImage
      src="/guides/hdsd_teacher_03_buoi_dot_xuat.png"
      alt="Cửa sổ Thêm buổi học đột xuất"
      caption="Hình 3: Cửa sổ Thêm buổi học đột xuất — Điền Ngày học, Khung giờ, Phòng học và Lý do học bù"
    />

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
      <StepPill
        num="1"
        label="Chọn Ngày học & Khung giờ (Ô 1)"
        desc="Chọn ngày diễn ra ca học bù và khung giờ bắt đầu - kết thúc (VD: 18:00 - 19:30)."
      />
      <StepPill
        num="2"
        label="Chọn Phòng học & Giáo viên (Ô 2)"
        desc="Chọn phòng học trống tại cơ sở và giáo viên/trợ giảng phụ trách ca dạy."
      />
      <StepPill
        num="3"
        label="Ghi chú lý do & Bấm Tạo buổi học (Ô 3 & 4)"
        desc="Nhập lý do (VD: 'Học bù buổi bão thứ Tư') rồi bấm 'Tạo buổi học'. Buổi học sẽ có tag [Đột xuất] và tính thù lao ca dạy bình thường khi hoàn thành."
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Section 4: Sinh Lại & Đồng Bộ Buổi Học
───────────────────────────────────────── */
const RegenerateSessionsContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
      Dùng nút <strong>&ldquo;Sinh lại / Đồng bộ&rdquo;</strong> (icon 🔄) khi cần cập nhật học sinh mới vào ca điểm danh hoặc khi lớp đổi thứ/khung giờ học:
    </p>

    <GuideImage
      src="/guides/hdsd_teacher_04_sinh_lai_dong_bo.png"
      alt="Cửa sổ Sinh lại và đồng bộ lịch học"
      caption="Hình 4: Tùy chọn Sinh lại & Đồng bộ — Đồng bộ học sinh mới hoặc Sinh lại lịch khi đổi ca"
    />

    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
      <StepPill
        num="1"
        label="Tùy chọn 1 (Ô 1) - Đồng bộ danh sách học sinh"
        desc="Giữ nguyên ngày giờ các ca học, chỉ quét và cập nhật học sinh mới vào danh sách điểm danh các buổi chưa diễn ra."
      />
      <StepPill
        num="2"
        label="Tùy chọn 2 (Ô 2) - Sinh lại lịch từ ngày chỉ định"
        desc="Sử dụng khi lớp đổi thứ học hoặc đổi giờ trong tuần, tạo lại lịch tương lai chuẩn xác."
      />
      <StepPill
        num="3"
        label="Bấm 'Xác nhận thực hiện' (Ô 3)"
        desc="Hệ thống làm mới danh sách buổi học. Các buổi đã diễn ra hoặc đã điểm danh được bảo vệ nguyên vẹn 100%!"
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export const TeacherClassActionsGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<string>('all');

  const sections = [
    {
      id: 'create_code',
      emoji: '🆔',
      title: '1. Tạo Mã Học Sinh & Cấp Tài Khoản Mới',
      subtitle: 'Quy tắc sinh mã tự động HS00..., tài khoản SĐT phụ huynh và mật khẩu mặc định 123456.',
      badge: 'Auto Code',
      badgeColor: '#6366f1',
      content: <CreateStudentCodeContent />,
    },
    {
      id: 'add_student',
      emoji: '👥',
      title: '2. Thêm Học Sinh Mới Vào Lớp & Đồng Bộ Ca Học',
      subtitle: 'Chọn học sinh có sẵn, tạo nhanh học sinh mới (Họ tên + SĐT) và đồng bộ ngay vào ca điểm danh.',
      badge: 'Tab Học sinh',
      badgeColor: '#059669',
      content: <AddStudentToClassContent />,
    },
    {
      id: 'extra_session',
      emoji: '📅',
      title: '3. Thêm Buổi Học Đột Xuất Ngoài Lịch Dạy',
      subtitle: 'Tạo ca học bù, học tăng cường trước thi, phân bổ phòng học và tự động liên kết danh sách học sinh.',
      badge: '+ Buổi đột xuất',
      badgeColor: '#d97706',
      content: <ExtraSessionContent />,
    },
    {
      id: 'regenerate',
      emoji: '🔄',
      title: '4. Sinh Lại & Đồng Bộ Danh Sách Buổi Học',
      subtitle: 'Cập nhật sĩ số học sinh mới vào ca học, tính toán lại lịch khi đổi thứ và bảo toàn dữ liệu cũ.',
      badge: 'Sinh lại / Đồng bộ',
      badgeColor: '#2563eb',
      content: <RegenerateSessionsContent />,
    },
  ];

  return (
    <div style={{ color: '#1e293b', fontSize: '14px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          <Sparkles size={13} /> ẢNH CHỤP THỰC TẾ & KHOANH ĐỎ CHỈ DẪN
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
          <span>🎯</span> Hướng Dẫn Giáo Viên: Tạo Mã, Thêm Học Sinh, Học Đột Xuất & Sinh Lại Lịch
        </h1>
        <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
          Tài liệu minh họa 4 nghiệp vụ then chốt kèm <strong>ảnh chụp màn hình thực tế, khoanh vùng đỏ và đánh số thứ tự (1, 2, 3...)</strong> giúp thầy cô thao tác nhanh chóng và chuẩn xác.
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sections.map(sec => {
          const isOpen = openSection === 'all' || openSection === sec.id;
          return (
            <div
              key={sec.id}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div
                onClick={() => setOpenSection(prev => (prev === sec.id ? '' : sec.id))}
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
                      background: `${sec.badgeColor}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    {sec.emoji}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '15.5px', color: '#0f172a' }}>{sec.title}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: sec.badgeColor,
                          background: `${sec.badgeColor}12`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${sec.badgeColor}30`,
                          fontWeight: 700,
                        }}
                      >
                        {sec.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{sec.subtitle}</div>
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

              {isOpen && <div style={{ padding: '20px', background: '#ffffff' }}>{sec.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
