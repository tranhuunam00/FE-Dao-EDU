import { App, Button, Collapse, ConfigProvider, Form, Input, Select, Tabs, theme } from 'antd';
import axios from 'axios';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  MapPin,
  Menu,
  Phone,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BrandLogo } from '../components/common/BrandLogo';
import { SessionEvaluationAndReportGuide } from '../components/SessionEvaluationAndReportGuide';
import './PublicLanding.css';

const contactTypeOptions = [
  { value: 'ENROLLMENT', label: 'Đăng ký học' },
  { value: 'COURSE_CONSULTATION', label: 'Tư vấn khóa học' },
  { value: 'TECHNICAL_SUPPORT', label: 'Hỗ trợ kỹ thuật' },
  { value: 'PARTNERSHIP', label: 'Hợp tác' },
  { value: 'OTHER', label: 'Khác' },
];

const adminModules = [
  ['Tổng quan & cảnh báo vận hành', 'Theo dõi số liệu toàn hệ thống, học sinh có nguy cơ nghỉ học, học sinh chưa xếp lớp, buổi học chưa chốt điểm danh và giao dịch cần kiểm tra.'],
  ['Học sinh', 'Tạo hồ sơ, quản lý phụ huynh, tài khoản đăng nhập, trạng thái học tập, lớp đang học và lịch sử học phí.'],
  ['Giáo viên / Trợ giảng', 'Quản lý hồ sơ, tài khoản, lịch dạy, lớp phụ trách và lịch sử thanh toán lương.'],
  ['Trung tâm & phòng học', 'Quản lý cơ sở, thông tin liên hệ và danh sách phòng học tại từng trung tâm.'],
  ['Chương trình học', 'Tạo khóa học, cấp độ, học phí theo buổi và mức lương giáo viên theo buổi.'],
  ['Lớp học & lịch học', 'Tạo lớp, xếp giáo viên, học sinh, lịch cố định, sinh buổi học, điểm danh và xử lý đổi/hủy buổi.'],
  ['Ngày nghỉ lễ', 'Cài đặt ngày nghỉ để lớp bật “Bỏ qua ngày lễ” không sinh buổi học vào ngày đó.'],
  ['Theo dõi bài tập', 'Theo dõi bài đã giao, số lượng nộp bài và tiến độ chấm điểm toàn hệ thống.'],
  ['Đơn xin nghỉ', 'Tiếp nhận và xử lý đơn nghỉ của học sinh, giáo viên theo từng buổi học.'],
  ['Kế toán', 'Chốt học phí và lương theo số buổi thực tế, điều chỉnh trước khi chốt, thu một lần, biên lai và nhật ký thao tác.'],
  ['Nhật ký hệ thống', 'Theo dõi lịch sử thông báo và các thao tác quan trọng phục vụ kiểm tra vận hành.'],
];

const teacherModules = [
  ['Tổng quan', 'Xem lịch dạy, các buổi học sắp tới và việc cần xử lý.'],
  ['Lớp & học sinh', 'Xem lớp phụ trách, danh sách học sinh, lịch học và thông tin cần thiết để giảng dạy.'],
  ['Điểm danh', 'Bắt đầu điểm danh, ghi nhận có mặt/vắng mặt, lý do và hoàn tất buổi học.'],
  ['Bài tập & chấm điểm', 'Tạo bài tập, đính kèm tài liệu, theo dõi bài nộp, chấm điểm và phản hồi.'],
  ['Đơn xin nghỉ', 'Xem và xử lý các yêu cầu nghỉ liên quan đến lịch dạy.'],
  ['Lịch sử nhận lương', 'Theo dõi số buổi được tính lương, số tiền và trạng thái thanh toán.'],
  ['Thông báo & cài đặt', 'Nhận thông báo nghiệp vụ và cập nhật tài khoản cá nhân.'],
];

const studentModules = [
  ['Tổng quan', 'Xem thông tin học tập, lớp đang học và các nội dung cần chú ý.'],
  ['Lịch học', 'Theo dõi lịch học, phòng học, giáo viên và trạng thái điểm danh.'],
  ['Bài tập', 'Xem bài được giao, hạn nộp, gửi bài và nhận điểm/phản hồi.'],
  ['Đơn xin nghỉ', 'Gửi yêu cầu nghỉ theo buổi học và theo dõi trạng thái xử lý.'],
  ['Học phí', 'Xem kỳ học phí, số tiền, trạng thái thanh toán và lịch sử thu.'],
  ['Hồ sơ, thông báo & cài đặt', 'Xem hồ sơ cá nhân, nhận thông báo và quản lý tài khoản.'],
];

const workflows = [
  ['01', 'Thiết lập nền tảng', 'Tạo trung tâm, phòng học, chương trình, cấp độ và bảng giá.'],
  ['02', 'Tạo đội ngũ & học sinh', 'Nhập hồ sơ, tạo tài khoản và hoàn thiện thông tin liên hệ.'],
  ['03', 'Mở lớp & sinh lịch', 'Tạo lớp, xếp lịch, giáo viên, học sinh và cấu hình bỏ qua ngày lễ.'],
  ['04', 'Vận hành giảng dạy', 'Điểm danh, quản lý nghỉ, giao bài, nộp bài và chấm điểm.'],
  ['05', 'Chốt kỳ & thanh toán', 'Tính theo buổi thực tế, kiểm tra điều chỉnh, chốt và thu/chi một lần.'],
  ['06', 'Theo dõi & cải thiện', 'Dùng dashboard cảnh báo, nhật ký và báo cáo để xử lý việc tồn đọng.'],
];

// ─── Hướng dẫn từng bước: Đánh giá → Báo cáo phụ huynh ─────────────────────
interface GuideStep {
  step: string;
  color: string;
  bg: string;
  title: string;
  desc: string;
  tip: string;
  IllustSvg: React.FC;
}

const IllustAttendance: React.FC = () => (
  <svg viewBox="0 0 200 120" className="guide-illus">
    <rect width="200" height="120" rx="12" fill="#f0f9ff" />
    <rect x="14" y="14" width="172" height="92" rx="8" fill="#fff" stroke="#bae6fd" strokeWidth="1" />
    <rect x="24" y="22" width="60" height="9" rx="4" fill="#0ea5e9" />
    <rect x="24" y="22" width="100" height="9" rx="4" fill="#0ea5e9" opacity=".15" />
    {([0,1,2,3] as const).map((i) => (
      <g key={i}>
        <circle cx="34" cy={44 + i * 17} r="7" fill={i === 1 ? '#fca5a5' : '#bbf7d0'} />
        <rect x="47" y={40 + i * 17} width="72" height="6" rx="3" fill="#e2e8f0" />
        <rect x="130" y={40 + i * 17} width="36" height="6" rx="3" fill={i === 1 ? '#fca5a5' : '#bbf7d0'} />
      </g>
    ))}
    <rect x="122" y="100" width="52" height="12" rx="5" fill="#0ea5e9" />
    <text x="148" y="110" textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="700">✓ Hoàn tất</text>
  </svg>
);

const IllustSqi: React.FC = () => (
  <svg viewBox="0 0 200 120" className="guide-illus">
    <rect width="200" height="120" rx="12" fill="#f5f3ff" />
    <rect x="14" y="14" width="172" height="92" rx="8" fill="#fff" stroke="#ddd6fe" strokeWidth="1" />
    <circle cx="100" cy="48" r="24" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="1.5" />
    <text x="100" y="53" textAnchor="middle" fontSize="22" fontWeight="800" fill="#8b5cf6">87</text>
    <text x="100" y="63" textAnchor="middle" fontSize="7.5" fill="#94a3b8">/100 SQI</text>
    {[
      { label: 'Chuyên cần', w: 78, c: '#0ea5e9', y: 80 },
      { label: 'Bài tập',    w: 62, c: '#10b981', y: 90 },
      { label: 'Nội quy',   w: 52, c: '#f59e0b', y: 100 },
      { label: 'Phát biểu', w: 44, c: '#8b5cf6', y: 110 },
    ].map(({ label, w, c, y }) => (
      <g key={label}>
        <rect x="24" y={y - 6} width="90" height="7" rx="3" fill="#f1f5f9" />
        <rect x="24" y={y - 6} width={w} height="7" rx="3" fill={c} opacity=".8" />
        <text x="120" y={y} fontSize="7.5" fill="#64748b">{label}</text>
      </g>
    ))}
  </svg>
);

const IllustReport: React.FC = () => (
  <svg viewBox="0 0 200 120" className="guide-illus">
    <rect width="200" height="120" rx="12" fill="#f0fdf4" />
    <rect x="14" y="14" width="172" height="92" rx="8" fill="#fff" stroke="#bbf7d0" strokeWidth="1" />
    <rect x="24" y="22" width="152" height="16" rx="4" fill="#f0fdf4" />
    <text x="100" y="34" textAnchor="middle" fontSize="8" fontWeight="700" fill="#059669">PHIẾU NHẬN XÉT TUẦN — HỌC SINH A</text>
    {[
      { h: 42, c: '#0ea5e9', x: 34 },
      { h: 34, c: '#10b981', x: 60 },
      { h: 28, c: '#f59e0b', x: 86 },
      { h: 22, c: '#8b5cf6', x: 112 },
    ].map(({ h, c, x }, i) => (
      <rect key={i} x={x} y={94 - h} width="16" height={h} rx="3" fill={c} opacity=".75" />
    ))}
    <line x1="24" y1="94" x2="140" y2="94" stroke="#e2e8f0" strokeWidth="1" />
    <rect x="144" y="46" width="36" height="5" rx="2" fill="#e2e8f0" />
    <rect x="144" y="56" width="30" height="5" rx="2" fill="#e2e8f0" />
    <rect x="144" y="66" width="34" height="5" rx="2" fill="#e2e8f0" />
    <rect x="144" y="76" width="24" height="5" rx="2" fill="#bbf7d0" />
  </svg>
);

const IllustComment: React.FC = () => (
  <svg viewBox="0 0 200 120" className="guide-illus">
    <rect width="200" height="120" rx="12" fill="#fffbeb" />
    <rect x="14" y="14" width="172" height="92" rx="8" fill="#fff" stroke="#fde68a" strokeWidth="1" />
    <text x="24" y="31" fontSize="8" fontWeight="700" fill="#92400e">Điểm mạnh</text>
    <rect x="24" y="35" width="152" height="18" rx="4" fill="#fefce8" stroke="#fde68a" strokeWidth="1" />
    <rect x="28" y="41" width="90" height="5" rx="2" fill="#e2e8f0" />
    <text x="24" y="67" fontSize="8" fontWeight="700" fill="#92400e">Cần cải thiện</text>
    <rect x="24" y="70" width="152" height="18" rx="4" fill="#fefce8" stroke="#fde68a" strokeWidth="1" />
    <rect x="28" y="76" width="70" height="5" rx="2" fill="#e2e8f0" />
    <rect x="130" y="96" width="50" height="14" rx="5" fill="#f59e0b" />
    <text x="155" y="107" textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="700">✨ Gợi ý AI</text>
  </svg>
);

const IllustApprove: React.FC = () => (
  <svg viewBox="0 0 200 120" className="guide-illus">
    <rect width="200" height="120" rx="12" fill="#f0fdf4" />
    <rect x="14" y="14" width="172" height="92" rx="8" fill="#fff" stroke="#bbf7d0" strokeWidth="1" />
    <circle cx="100" cy="52" r="24" fill="#dcfce7" />
    <path d="M88 52 L96 60 L114 44" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="24" y="22" width="60" height="7" rx="3" fill="#bbf7d0" />
    <rect x="90" y="22" width="50" height="7" rx="3" fill="#e2e8f0" />
    <rect x="50" y="84" width="100" height="16" rx="7" fill="#16a34a" />
    <text x="100" y="96" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">✓ Phê duyệt báo cáo</text>
  </svg>
);

const IllustShare: React.FC = () => (
  <svg viewBox="0 0 200 120" className="guide-illus">
    <rect width="200" height="120" rx="12" fill="#eef2ff" />
    <rect x="14" y="14" width="78" height="92" rx="8" fill="#fff" stroke="#c7d2fe" strokeWidth="1" />
    {[0,1,2,3,4].map((r) => [0,1,2,3,4].map((c) => (
      <rect key={`${r}-${c}`} x={22 + c * 12} y={20 + r * 12} width={10} height={10} rx="2"
        fill={((r === 0 || r === 4 || c === 0 || c === 4) || (r === 1 && c === 1) || (r === 3 && c === 3) || (r === 2 && c === 2)) ? '#4f46e5' : '#f1f5f9'}
        opacity=".9" />
    )))}
    <rect x="22" y="82" width="62" height="16" rx="6" fill="#4f46e5" />
    <text x="53" y="94" textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="700">Sao chép link</text>
    <rect x="106" y="16" width="74" height="88" rx="10" fill="#1e293b" />
    <rect x="111" y="23" width="64" height="74" rx="6" fill="#f8fafc" />
    <rect x="115" y="28" width="28" height="8" rx="3" fill="#4f46e5" />
    <rect x="115" y="28" width="56" height="8" rx="3" fill="#4f46e5" opacity=".12" />
    <rect x="115" y="42" width="56" height="5" rx="2" fill="#e2e8f0" />
    <rect x="115" y="52" width="40" height="5" rx="2" fill="#e2e8f0" />
    <rect x="115" y="62" width="50" height="5" rx="2" fill="#e2e8f0" />
    <rect x="115" y="72" width="34" height="5" rx="2" fill="#bbf7d0" />
    <text x="143" y="90" textAnchor="middle" fontSize="7" fill="#64748b">Xem báo cáo</text>
  </svg>
);

const reportGuideSteps: GuideStep[] = [
  {
    step: '01', color: '#0ea5e9', bg: '#f0f9ff',
    title: 'Điểm danh & ghi nhận buổi học',
    desc: 'Giáo viên vào Lớp học → chọn buổi học → bấm Bắt đầu điểm danh. Ghi nhận từng học sinh: có mặt, vắng mặt, đi muộn, tình trạng bài tập về nhà và thái độ trong lớp.',
    tip: 'Có thể điểm danh trực tiếp trên điện thoại, không cần máy tính.',
    IllustSvg: IllustAttendance,
  },
  {
    step: '02', color: '#8b5cf6', bg: '#f5f3ff',
    title: 'Hệ thống tính điểm SQI tự động',
    desc: 'Sau mỗi buổi, hệ thống tự tổng hợp 4 chỉ số: Chuyên cần (30%), Bài tập (30%), Nội quy (20%), Phát biểu (20%) → ra điểm SQI 0–100 cho từng học sinh.',
    tip: 'Không cần giáo viên tính tay — hệ thống làm hoàn toàn tự động.',
    IllustSvg: IllustSqi,
  },
  {
    step: '03', color: '#10b981', bg: '#f0fdf4',
    title: 'Xem phiếu báo cáo được tổng hợp',
    desc: 'Vào Báo cáo tuần / tháng → chọn học sinh → hệ thống hiển thị bảng chỉ số SQI, biểu đồ phân tích trực quan, bảng chi tiết từng buổi học có điểm số và nhận xét.',
    tip: 'Biểu đồ SQI và điểm kiểm tra xuất hiện ngay bên dưới bảng chỉ số đánh giá.',
    IllustSvg: IllustReport,
  },
  {
    step: '04', color: '#f59e0b', bg: '#fffbeb',
    title: 'Giáo viên nhập nhận xét sư phạm',
    desc: 'Điền vào 4 ô: Điểm mạnh, Cần cải thiện, Lời khen và Đề xuất. Có thể dùng nút Gợi ý AI (Gemini) để tạo nhận xét tự động, rồi chỉnh sửa theo thực tế của học sinh.',
    tip: 'Nhấn "Lưu nhận xét" để lưu nháp trước khi phê duyệt.',
    IllustSvg: IllustComment,
  },
  {
    step: '05', color: '#059669', bg: '#f0fdf4',
    title: 'Phê duyệt và phát hành báo cáo',
    desc: 'Sau khi kiểm tra nội dung, bấm "Phê duyệt báo cáo" → báo cáo được phát hành chính thức. Có thể hủy phê duyệt để chỉnh sửa lại bất kỳ lúc nào nếu cần.',
    tip: 'Chỉ báo cáo đã phê duyệt mới hiển thị cho phụ huynh qua link công khai.',
    IllustSvg: IllustApprove,
  },
  {
    step: '06', color: '#4f46e5', bg: '#eef2ff',
    title: 'Gửi QR / link cho phụ huynh',
    desc: 'Bấm "Lấy link & QR" → sao chép đường link hoặc quét mã QR bằng Zalo/Camera để gửi cho phụ huynh. Phụ huynh xem báo cáo đầy đủ trên điện thoại, không cần đăng nhập.',
    tip: 'Link cố định theo học sinh — gửi một lần, dùng mãi cho cả năm học.',
    IllustSvg: IllustShare,
  },
];

const ModuleList = ({ items }: { items: string[][] }) => (

  <div className="public-module-grid">
    {items.map(([title, description]) => (
      <article className="public-module-card" key={title}>
        <CheckCircle2 size={19} />
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </article>
    ))}
  </div>
);

export default function PublicLanding() {
  const { message } = App.useApp();
  const [contactForm] = Form.useForm();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);

  const submitContact = async (values: {
    fullName: string;
    phone: string;
    type: string;
  }) => {
    setSubmittingContact(true);
    try {
      await api.post('/contact-requests', values);
      message.success('Đã gửi thông tin. Chúng tôi sẽ liên hệ lại sớm.');
      contactForm.resetFields();
      contactForm.setFieldValue('type', 'ENROLLMENT');
    } catch (error: unknown) {
      message.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Không thể gửi thông tin liên hệ.'
          : 'Không thể gửi thông tin liên hệ.',
      );
    } finally {
      setSubmittingContact(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#15803d',
          colorLink: '#15803d',
          colorInfo: '#15803d',
          borderRadius: 12,
          fontFamily: 'Inter, sans-serif',
          /* Force light colors — override dark global CSS variables */
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBgLayout: '#f8fafc',
          colorText: '#172033',
          colorTextSecondary: '#526075',
          colorTextPlaceholder: '#94a3b8',
          colorBorder: '#d1d5db',
          colorBorderSecondary: '#e2e8f0',
        },
      }}
    >
      <div className="public-page">
        <header className="public-header">
          <a className="public-brand" href="#top" style={{ textDecoration: 'none' }}>
            <BrandLogo size={40} showText subtitle="by DAOGROUP" />
          </a>
          <button className="public-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? 'open' : ''}>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              <span className="nav-dot" />Tính năng
            </a>
            <a href="#guide" onClick={() => setMenuOpen(false)}>
              <span className="nav-dot" />Hướng dẫn
            </a>
            <a href="#report-guide" onClick={() => setMenuOpen(false)}>
              <span className="nav-dot" />Đánh giá → Báo cáo
            </a>
            <a href="#workflow" onClick={() => setMenuOpen(false)}>
              <span className="nav-dot" />Quy trình
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              <span className="nav-dot" />Liên hệ
            </a>
            <div className="mobile-nav-divider" />
            <Link to="/login" className="mobile-login-link">
              <Button type="primary" block size="large">Đăng nhập hệ thống</Button>
            </Link>
          </nav>
        </header>

        <main id="top">
          <section className="public-hero">
            <div className="public-hero-copy">
              <div className="public-eyebrow"><Sparkles size={16} /> Nền tảng quản lý giáo dục toàn diện</div>
              <h1>Quản lý trung tâm giáo dục <span>rõ ràng, chính xác và liền mạch.</span></h1>
              <p>
                DAO EDU kết nối quản trị, giáo viên và học sinh trên một hệ thống duy nhất:
                từ xếp lớp, sinh lịch, điểm danh, bài tập đến chốt học phí và lương theo buổi thực tế.
              </p>
              <div className="public-hero-actions">
                <a href="#guide"><Button type="primary" size="large">Xem hướng dẫn <ArrowRight size={17} /></Button></a>
                <Link to="/login"><Button size="large">Đăng nhập hệ thống</Button></Link>
              </div>
              <div className="public-trust">
                <span><ShieldCheck size={17} /> Phân quyền theo vai trò</span>
                <span><ClipboardCheck size={17} /> Nhật ký thao tác</span>
                <span><Headphones size={17} /> Hỗ trợ kỹ thuật trực tiếp</span>
              </div>
            </div>
            <div className="public-hero-panel">
              <div className="public-panel-title"><BarChart3 size={19} /> Trung tâm điều hành</div>
              <div className="public-metrics">
                <div><strong>01</strong><span>Nguồn dữ liệu thống nhất</span></div>
                <div><strong>3</strong><span>Vai trò sử dụng</span></div>
                <div><strong>24/7</strong><span>Theo dõi vận hành</span></div>
              </div>
              <div className="public-preview-list">
                <span><Users /> Quản lý học sinh & giáo viên</span>
                <span><CalendarCheck /> Lịch học & điểm danh thực tế</span>
                <span><ReceiptText /> Học phí, lương & biên lai</span>
                <span><Sparkles /> Cảnh báo nguy cơ & đề xuất lớp</span>
              </div>
            </div>
          </section>

          <section className="public-section" id="features">
            <div className="public-section-heading">
              <span>Giá trị nổi bật</span>
              <h2>Một hệ thống cho toàn bộ hoạt động đào tạo</h2>
              <p>Giảm thao tác thủ công, hạn chế dữ liệu lệch và giúp từng vai trò biết chính xác việc cần làm.</p>
            </div>
            <div className="public-feature-grid">
              {[
                [Building2, 'Quản trị tập trung', 'Trung tâm, chương trình, lớp, con người và tài chính cùng một nguồn dữ liệu.'],
                [CalendarCheck, 'Theo buổi học thực tế', 'Điểm danh là cơ sở tính học phí và lương, giúp số liệu minh bạch.'],
                [WalletCards, 'Thu chi rõ ràng', 'Chốt kỳ, điều chỉnh có lý do, thu một lần, biên lai và lịch sử thao tác.'],
                [Sparkles, 'Hỗ trợ ra quyết định', 'Cảnh báo nguy cơ nghỉ học, đề xuất lớp và danh sách việc cần xử lý.'],
              ].map(([Icon, title, text]) => {
                const FeatureIcon = Icon as typeof Building2;
                return <article key={String(title)}><FeatureIcon /><h3>{String(title)}</h3><p>{String(text)}</p></article>;
              })}
            </div>
          </section>

          <section className="public-section public-guide" id="guide">
            <div className="public-section-heading">
              <span>Hướng dẫn sử dụng</span>
              <h2>Toàn bộ module theo từng vai trò</h2>
              <p>Không cần đăng nhập để đọc hướng dẫn. Chọn vai trò để xem chức năng được cung cấp.</p>
            </div>
            <Tabs
              centered
              items={[
                { key: 'evaluation-guide', label: <span><ClipboardCheck size={16} /> Nhận xét & In báo cáo SQI</span>, children: <SessionEvaluationAndReportGuide /> },
                { key: 'admin', label: <span><ShieldCheck size={16} /> Quản trị viên</span>, children: <ModuleList items={adminModules} /> },
                { key: 'teacher', label: <span><UserRound size={16} /> Giáo viên</span>, children: <ModuleList items={teacherModules} /> },
                { key: 'student', label: <span><BookOpen size={16} /> Học sinh</span>, children: <ModuleList items={studentModules} /> },
              ]}
            />
          </section>

          {/* ── HƯỚNG DẪN TỪNG BƯỚC: ĐÁNH GIÁ → BÁO CÁO PHỤ HUYNH ── */}
          <section className="public-section public-report-guide" id="report-guide">
            <div className="public-section-heading">
              <span>
                <QrCode size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                Hướng dẫn thực hành
              </span>
              <h2>Từ điểm danh đến gửi báo cáo phụ huynh</h2>
              <p>
                6 bước đơn giản — giáo viên thực hiện trên điện thoại hoặc máy tính, phụ huynh
                nhận kết quả ngay qua Zalo/link mà <strong>không cần đăng nhập</strong>.
              </p>
            </div>

            <div className="rg-steps">
              {reportGuideSteps.map(({ step, color, bg, title, desc, tip, IllustSvg }) => (
                <article key={step} className="rg-card">
                  <div className="rg-card-illus" style={{ background: bg }}>
                    <IllustSvg />
                  </div>
                  <div className="rg-card-body">
                    <div className="rg-step-badge" style={{ background: bg, color }}>{step}</div>
                    <h3 className="rg-step-title" style={{ color: '#0f172a' }}>{title}</h3>
                    <p className="rg-step-desc">{desc}</p>
                    <div className="rg-tip" style={{ borderLeftColor: color, background: bg }}>
                      <strong style={{ color }}>💡 Mẹo:</strong> {tip}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="public-section" id="workflow">
            <div className="public-section-heading">
              <span>Quy trình khuyến nghị</span>
              <h2>Từ thiết lập ban đầu đến vận hành hằng ngày</h2>
            </div>
            <div className="public-workflow">
              {workflows.map(([number, title, text]) => (
                <article key={number}><strong>{number}</strong><div><h3>{title}</h3><p>{text}</p></div></article>
              ))}
            </div>
          </section>

          <section className="public-section public-faq">
            <div className="public-section-heading">
              <span>Câu hỏi thường gặp</span>
              <h2>Bắt đầu sử dụng DAO EDU</h2>
            </div>
            <Collapse
              items={[
                { key: '1', label: 'Tôi nên cấu hình dữ liệu nào trước?', children: <p>Hãy tạo trung tâm, phòng học, chương trình, cấp độ và bảng giá trước; sau đó mới tạo lớp và sinh lịch.</p> },
                { key: '2', label: 'Học phí và lương được tính như thế nào?', children: <p>Hệ thống tính từ các buổi học thực tế trong kỳ. Quản trị viên được kiểm tra, điều chỉnh có lý do rồi mới chốt dữ liệu.</p> },
                { key: '3', label: 'Ngày nghỉ lễ ảnh hưởng lịch học ra sao?', children: <p>Khi lớp bật “Bỏ qua ngày lễ”, hệ thống không sinh buổi học vào các ngày đã khai báo trong màn Ngày nghỉ lễ.</p> },
                { key: '4', label: 'Cảnh báo nguy cơ nghỉ học dựa trên dữ liệu nào?', children: <p>Cảnh báo dựa trên tỷ lệ vắng, số buổi vắng liên tiếp và tỷ lệ bài tập chưa nộp, đồng thời hiển thị rõ nguyên nhân.</p> },
              ]}
            />
          </section>

          <section className="public-contact" id="contact">
            <div className="public-contact-copy">
              <span className="public-eyebrow"><Building2 size={16} /> Đơn vị phát triển</span>
              <h2>Công ty TNHH Đầu tư & Công nghệ DAOGROUP</h2>
              <p><MapPin size={18} /> Số nhà 22, đường 3.7/10 KĐT Gamuda Gardens, Hoàng Mai, Hà Nội 100000</p>
              <p><Phone size={18} /> Liên hệ kỹ thuật: <strong>Tran Huu Nam</strong> · <a href="tel:0961766816">0961766816</a></p>
            </div>
            <Form
              className="public-contact-form"
              form={contactForm}
              layout="vertical"
              initialValues={{ type: 'ENROLLMENT' }}
              onFinish={submitContact}
            >
              <h3>Để lại thông tin liên hệ</h3>
              <p>Admin sẽ tiếp nhận và liên hệ lại với bạn.</p>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Nhập họ và tên' },
                  { min: 2, max: 120, message: 'Họ tên từ 2 đến 120 ký tự' },
                ]}
              >
                <Input size="large" placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Nhập số điện thoại' },
                  {
                    pattern: /^(?:\+84|0)[\d\s.-]{9,14}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                ]}
              >
                <Input size="large" inputMode="tel" placeholder="09xxxxxxxx" />
              </Form.Item>
              <Form.Item name="type" label="Loại liên hệ">
                <Select size="large" options={contactTypeOptions} popupClassName="public-contact-form-dropdown" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={submittingContact}
              >
                Gửi thông tin
              </Button>
            </Form>
          </section>
        </main>

        <footer className="public-footer">
          <BrandLogo size={36} showText subtitle="by DAOGROUP" />
          <p>© 2026 Công ty TNHH Đầu tư & Công nghệ DAOGROUP.</p>
          <Link to="/login">Đăng nhập hệ thống</Link>
        </footer>
      </div>
    </ConfigProvider>
  );
}
