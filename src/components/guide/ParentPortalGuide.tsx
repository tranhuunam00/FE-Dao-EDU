import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Step {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  role: string;
  content: React.ReactNode;
}

/* ─────────────────────────────────────────
   Shared helpers
───────────────────────────────────────── */
const green = '#059669';
const amber = '#d97706';
const red   = '#dc2626';
const blue  = '#3b82f6';
const slate = '#64748b';

const inlineBadge = (color: string, text: string) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: 700,
      background: `${color}18`,
      color,
      border: `1px solid ${color}44`,
      marginLeft: '4px',
    }}
  >
    {text}
  </span>
);

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

const StepRow: React.FC<{ n: number; text: React.ReactNode }> = ({ n, text }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', margin: '8px 0' }}>
    <div
      style={{
        minWidth: '26px',
        height: '26px',
        borderRadius: '50%',
        background: '#ecfdf5',
        border: '2px solid #6ee7b7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 800,
        color: green,
        flexShrink: 0,
      }}
    >
      {n}
    </div>
    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, paddingTop: '3px' }}>{text}</div>
  </div>
);

const StatusTag: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 700,
      background: `${color}18`,
      color,
      border: `1px solid ${color}33`,
    }}
  >
    {children}
  </span>
);

const StatusTable: React.FC<{ rows: [React.ReactNode, React.ReactNode, string][] }> = ({ rows }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '8px' }}>
    <thead>
      <tr style={{ background: '#f1f5f9' }}>
        {['Trạng thái', 'Màu sắc', 'Ý nghĩa'].map(h => (
          <th key={h} style={{ textAlign: 'left', padding: '7px 12px', fontWeight: 700, color: '#475569', border: '1px solid #e2e8f0' }}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map(([a, b, c], i) => (
        <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
          <td style={{ padding: '6px 12px', border: '1px solid #e2e8f0', fontWeight: 600 }}>{a}</td>
          <td style={{ padding: '6px 12px', border: '1px solid #e2e8f0' }}>{b}</td>
          <td style={{ padding: '6px 12px', border: '1px solid #e2e8f0', color: '#475569' }}>{c}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ─────────────────────────────────────────
   Steps data
───────────────────────────────────────── */
const STEPS: Step[] = [
  {
    id: 'overview',
    emoji: '🏠',
    title: 'Cổng Phụ Huynh / Học Sinh',
    subtitle: 'Tổng quan tính năng dành cho Phụ Huynh & Học Viên',
    role: 'Phụ huynh · Học viên',
    content: (
      <div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: 1.7 }}>
          Cổng Phụ Huynh / Học Sinh cho phép theo dõi tình hình học tập, đóng học phí trực tuyến và gửi đơn xin nghỉ học — tất cả trong một giao diện thống nhất.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {[
            { icon: '💰', title: 'Xem Học Phí', desc: 'Tra cứu hóa đơn theo đợt, số tiền còn nợ' },
            { icon: '📲', title: 'Nộp Học Phí', desc: 'Quét mã VietQR, xác nhận chuyển khoản ngay' },
            { icon: '📝', title: 'Xin Nghỉ Học', desc: 'Gửi đơn cho buổi học sắp tới, theo dõi duyệt' },
            { icon: '📊', title: 'Báo Cáo SQI', desc: 'Xem báo cáo nhận xét & điểm SQI của con' },
          ].map(c => (
            <div key={c.title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <CalloutBox type="note" text="Một tài khoản phụ huynh có thể quản lý nhiều hồ sơ học sinh (nhiều con). Chọn hồ sơ học sinh ở phần chuyển đổi để xem thông tin từng học sinh." />
      </div>
    ),
  },

  {
    id: 'view-tuition',
    emoji: '💰',
    title: 'Xem Học Phí & Hóa Đơn',
    subtitle: 'Tra cứu trạng thái đóng tiền theo từng đợt',
    role: 'Phụ huynh · Học viên',
    content: (
      <div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: 1.7 }}>
          Trang <strong>Học phí &amp; Thanh toán</strong> tổng hợp toàn bộ hóa đơn của học sinh theo từng <em>đợt thu phí</em>. Phụ huynh có thể kiểm tra số tiền còn nợ và thực hiện thanh toán ngay tại đây.
        </p>

        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}>📍 Cách vào trang Học phí</div>
        <StepRow n={1} text={<span>Đăng nhập với tài khoản <strong>Phụ huynh / Học viên</strong></span>} />
        <StepRow n={2} text={<span>Chọn menu <strong>Học phí</strong> ở thanh điều hướng bên trái</span>} />
        <StepRow n={3} text="Trang hiển thị 2 ô thống kê: Tổng học phí chưa thanh toán (đỏ) và Số hóa đơn chưa trả" />

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginTop: '16px', marginBottom: '8px' }}>
          <div style={{ fontWeight: 700, color: red, fontSize: '13px', marginBottom: '4px' }}>Ô thống kê "Học phí chưa thanh toán"</div>
          <div style={{ fontSize: '13px', color: '#7f1d1d' }}>Hiển thị tổng số tiền <strong>tất cả hóa đơn Unpaid</strong> — cần thanh toán càng sớm càng tốt.</div>
        </div>

        <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '20px', marginBottom: '8px', fontSize: '14px' }}>📋 Danh sách hóa đơn theo đợt</div>
        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px' }}>
          Hóa đơn được nhóm theo <strong>Đợt thu phí</strong>. Nhấn vào đợt để xem chi tiết từng hóa đơn bên trong.
        </p>

        <StatusTable
          rows={[
            ['Unpaid', inlineBadge(red, 'Chưa trả'), 'Chưa thanh toán — cần nộp ngay'],
            ['Paid', inlineBadge(green, 'Đã trả'), 'Đã thanh toán thành công'],
            ['Pending', inlineBadge(amber, 'Chờ đối soát'), 'Đã chuyển khoản, đang chờ ngân hàng xác nhận'],
          ]}
        />

        <CalloutBox type="tip" text='Dùng tab "Chưa thanh toán" / "Đã thanh toán" để lọc nhanh. Mỗi hóa đơn hiển thị kỳ phí (ngày bắt đầu – ngày kết thúc) và tổng số tiền.' />

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', marginTop: '8px' }}>
          <div style={{ fontWeight: 700, color: green, fontSize: '13px', marginBottom: '6px' }}>Hóa đơn đã thanh toán sẽ hiển thị</div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#166534' }}>
            <li>✓ Thời điểm thanh toán (ngày giờ chính xác)</li>
            <li>✓ Tag <StatusTag color={green}>Đã hoàn tất</StatusTag> màu xanh bên cạnh tên đợt</li>
          </ul>
        </div>
      </div>
    ),
  },

  {
    id: 'pay-tuition',
    emoji: '📲',
    title: 'Nộp Học Phí qua VietQR',
    subtitle: 'Quét mã QR, xác nhận chuyển khoản, hệ thống tự đối soát',
    role: 'Phụ huynh · Học viên',
    content: (
      <div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: 1.7 }}>
          Hệ thống tích hợp <strong>VietQR</strong> — phụ huynh quét mã QR bằng bất kỳ ứng dụng ngân hàng nào hỗ trợ VietQR, sau đó xác nhận đã chuyển khoản để hệ thống ghi nhận.
        </p>

        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '10px', fontSize: '14px' }}>Quy trình nộp học phí (5 bước)</div>
        <StepRow n={1} text={<span>Tại danh sách hóa đơn, tìm hóa đơn có trạng thái {inlineBadge(red, 'Unpaid')} và nhấn nút <strong style={{ color: blue }}>🪙 Thanh toán QR</strong></span>} />
        <StepRow n={2} text={<span>Modal <strong>Thanh toán QR Code</strong> mở ra, hiển thị: mã QR VietQR, số tài khoản thụ hưởng, số tiền cần chuyển, nội dung chuyển khoản</span>} />
        <StepRow n={3} text={<span>Mở ứng dụng ngân hàng → chọn <strong>Chuyển khoản</strong> → quét QR hoặc nhập thủ công → kiểm tra nội dung chuyển khoản khớp mã hóa đơn → xác nhận</span>} />
        <StepRow n={4} text={<span>Sau khi chuyển khoản xong, quay lại hệ thống và nhấn <strong style={{ color: green }}>✓ Tôi đã chuyển khoản</strong> trong modal</span>} />
        <StepRow n={5} text={<span>Hệ thống chờ callback từ VietQR để đối soát tự động. Trạng thái chuyển thành {inlineBadge(green, 'Paid')} sau khi xác nhận</span>} />

        <CalloutBox type="warning" text="BẮT BUỘC nhập đúng NỘI DUNG chuyển khoản (mã hóa đơn) để hệ thống đối soát tự động. Nếu sai nội dung, kế toán sẽ cần đối chiếu thủ công." />

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', marginTop: '12px' }}>
          <div style={{ fontWeight: 700, color: amber, fontSize: '13px', marginBottom: '6px' }}>⏱ Thời gian đối soát</div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#78350f' }}>
            <li>Thông thường: tức thì sau khi callback VietQR về</li>
            <li>Nếu sau 30 phút chưa cập nhật → liên hệ kế toán trung tâm</li>
            <li>Kế toán có thể xác nhận thủ công từ giao diện quản trị</li>
          </ul>
        </div>

        <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '20px', marginBottom: '8px', fontSize: '14px' }}>📌 Thông tin cần khớp khi chuyển khoản</div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px' }}>
            {[
              ['Số tài khoản', 'Hiển thị trong modal QR (tài khoản trung tâm)'],
              ['Ngân hàng', 'Hiển thị trong modal QR'],
              ['Số tiền', 'Đúng với tổng hóa đơn (không được sai)'],
              ['Nội dung CK', 'Mã hóa đơn — BẮT BUỘC điền đúng'],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <span style={{ fontWeight: 700, color: '#475569' }}>{k}:</span>
                <span style={{ color: '#334155' }}>{v}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  {
    id: 'leave-request',
    emoji: '📝',
    title: 'Gửi Đơn Xin Nghỉ Học',
    subtitle: 'Xin nghỉ một buổi học cụ thể, theo dõi trạng thái duyệt',
    role: 'Phụ huynh · Học viên',
    content: (
      <div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: 1.7 }}>
          Tính năng <strong>Đơn xin nghỉ</strong> cho phép phụ huynh hoặc học sinh chủ động gửi đơn cho các <em>buổi học sắp tới</em>. Giáo viên / quản lý sẽ xét duyệt và phản hồi trong hệ thống.
        </p>

        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}>📍 Điều kiện để gửi đơn hợp lệ</div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#166534' }}>
            <li>Buổi học phải có ngày <strong>từ hôm nay trở đi</strong> (không xin nghỉ cho buổi đã qua)</li>
            <li>Buổi học chưa bị khóa điểm danh</li>
            <li>Buổi học chưa có đơn xin nghỉ đang <StatusTag color={amber}>Chờ duyệt</StatusTag> hoặc <StatusTag color={green}>Đã duyệt</StatusTag></li>
          </ul>
        </div>

        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '10px', fontSize: '14px' }}>Quy trình gửi đơn (4 bước)</div>
        <StepRow n={1} text={<span>Chọn menu <strong>Đơn xin nghỉ</strong> ở thanh điều hướng bên trái</span>} />
        <StepRow n={2} text={<span>Nhấn nút <strong style={{ color: blue }}>Gửi đơn xin nghỉ</strong> (góc trên phải)</span>} />
        <StepRow
          n={3}
          text={
            <span>
              Điền form xin nghỉ:
              <ul style={{ marginTop: '6px', marginBottom: 0 }}>
                <li><strong>Chọn buổi học</strong>: Dropdown danh sách buổi sắp tới (hiển thị tên lớp, ngày, giờ)</li>
                <li><strong>Lý do xin nghỉ</strong>: Nhập lý do (bắt buộc)</li>
                <li>Nếu quản lý nhiều con: <strong>Chọn học sinh</strong> cần xin nghỉ</li>
              </ul>
            </span>
          }
        />
        <StepRow n={4} text={<span>Nhấn <strong style={{ color: green }}>Gửi đơn</strong> → hệ thống thông báo cho giáo viên / quản lý</span>} />

        <CalloutBox type="tip" text="Nếu phụ huynh quản lý nhiều học sinh (nhiều con), cần chọn đúng hồ sơ học sinh muốn xin nghỉ trong dropdown trên cùng." />

        <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '20px', marginBottom: '8px', fontSize: '14px' }}>📊 Theo dõi trạng thái đơn</div>
        <StatusTable
          rows={[
            ['Chờ duyệt', inlineBadge(amber, 'Vàng'), 'Đơn đã gửi, đang chờ giáo viên/quản lý xét duyệt'],
            ['Đã duyệt', inlineBadge(green, 'Xanh'), 'Đơn được chấp thuận, buổi học được phép vắng'],
            ['Từ chối', inlineBadge(red, 'Đỏ'), 'Đơn bị từ chối — xem ghi chú phản hồi của giáo viên'],
            ['Đã hủy', inlineBadge(slate, 'Xám'), 'Phụ huynh tự hủy đơn trước khi duyệt'],
          ]}
        />

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginTop: '14px' }}>
          <div style={{ fontWeight: 700, color: red, fontSize: '13px', marginBottom: '6px' }}>Hủy đơn xin nghỉ</div>
          <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d' }}>
            Đơn đang ở trạng thái <StatusTag color={amber}>Chờ duyệt</StatusTag> có thể hủy bằng nút <strong>Hủy đơn</strong> trong danh sách. Đơn đã duyệt hoặc từ chối không thể hủy.
          </p>
        </div>

        <CalloutBox type="note" text="Danh sách đơn hiển thị đầy đủ: tên lớp, ngày buổi học, giờ, lý do xin nghỉ và ghi chú phản hồi của giáo viên." />
      </div>
    ),
  },

  {
    id: 'sqi-report',
    emoji: '📊',
    title: 'Xem Báo Cáo SQI Của Con',
    subtitle: 'Theo dõi tiến độ học tập qua điểm SQI & nhận xét giáo viên',
    role: 'Phụ huynh · Học viên',
    content: (
      <div>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: 1.7 }}>
          Báo cáo <strong>SQI (Student Quality Index)</strong> là đánh giá tổng hợp về chất lượng học tập — bao gồm điểm chuyên cần, điểm bài tập và nhận xét từ giáo viên.
        </p>
        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}>📍 Cách xem báo cáo</div>
        <StepRow n={1} text={<span>Từ menu, chọn <strong>Báo cáo</strong> hoặc <strong>SQI</strong></span>} />
        <StepRow n={2} text="Hệ thống hiển thị điểm SQI tổng thể (thang 100 điểm) và phân tích theo từng tiêu chí" />
        <StepRow n={3} text="Xem nhận xét chi tiết của giáo viên cho từng buổi học" />
        <StepRow n={4} text="Nhấn In Báo cáo để xuất file PDF lưu trữ hoặc gửi cho phụ huynh" />

        <CalloutBox type="tip" text="Xem hướng dẫn đầy đủ về Báo cáo SQI & cách tính điểm tại mục 'In Báo Cáo & SQI (100đ)' trong menu bên trái." />

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginTop: '8px' }}>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px', marginBottom: '8px' }}>Các chỉ số trong báo cáo SQI</div>
          {[
            { icon: '📅', label: 'Điểm chuyên cần', desc: 'Tỷ lệ đi học đúng giờ, có mặt đủ buổi' },
            { icon: '📚', label: 'Điểm bài tập', desc: 'Tỷ lệ nộp bài, chất lượng bài làm được giáo viên chấm' },
            { icon: '⭐', label: 'Điểm nhận xét', desc: 'Giáo viên đánh giá hành vi, thái độ học tập từng buổi' },
            { icon: '🏆', label: 'SQI tổng', desc: 'Điểm tổng hợp theo công thức SQI (thang 100)' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>{row.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>{row.label}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export const ParentPortalGuide: React.FC = () => {
  const [openId, setOpenId] = useState<string>('overview');

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>👨‍👩‍👧</span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'Outfit, Inter, sans-serif' }}>
            Hướng Dẫn Cổng Phụ Huynh &amp; Học Sinh
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Xem học phí, nộp học phí qua VietQR, gửi đơn xin nghỉ và xem báo cáo SQI của con.
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

      {/* Quick-jump tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === openId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setOpenId(step.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '6px',
                border: isActive ? '1.5px solid #059669' : '1px solid #e2e8f0',
                background: isActive ? '#ecfdf5' : '#f8fafc',
                color: isActive ? '#047857' : '#64748b',
                fontSize: '12px', fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span>{step.emoji}</span>
              <span>{idx + 1}. {step.title.split(' ').slice(0, 3).join(' ')}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {STEPS.map((step, idx) => {
          const isOpen = step.id === openId;
          return (
            <div
              key={step.id}
              style={{
                border: isOpen ? '1.5px solid #6ee7b7' : '1px solid #e2e8f0',
                borderRadius: '12px', overflow: 'hidden', background: '#ffffff',
                transition: 'border-color 0.2s ease',
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
                  transition: 'background 0.2s ease',
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
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: isOpen ? '#047857' : '#1e293b' }}>{step.title}</div>
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
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', padding: '14px 20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={18} color={green} />
        <span style={{ fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
          Cần hỗ trợ thêm? Liên hệ trung tâm qua hotline hoặc gửi ticket hỗ trợ trong hệ thống.
        </span>
      </div>
    </div>
  );
};

export default ParentPortalGuide;
