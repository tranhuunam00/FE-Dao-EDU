import { Button, Collapse, ConfigProvider, Tabs, theme } from 'antd';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  MapPin,
  Menu,
  Phone,
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
import './PublicLanding.css';

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#4f46e5', borderRadius: 12, fontFamily: 'Inter, sans-serif' },
      }}
    >
      <div className="public-page">
        <header className="public-header">
          <a className="public-brand" href="#top">
            <span><GraduationCap size={24} /></span>
            <div><strong>DAO EDU</strong><small>by DAOGROUP</small></div>
          </a>
          <button className="public-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? 'open' : ''}>
            <a href="#features">Tính năng</a>
            <a href="#guide">Hướng dẫn</a>
            <a href="#workflow">Quy trình</a>
            <a href="#contact">Liên hệ</a>
            <Link to="/login"><Button type="primary">Đăng nhập</Button></Link>
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
                { key: 'admin', label: <span><ShieldCheck size={16} /> Quản trị viên</span>, children: <ModuleList items={adminModules} /> },
                { key: 'teacher', label: <span><UserRound size={16} /> Giáo viên</span>, children: <ModuleList items={teacherModules} /> },
                { key: 'student', label: <span><BookOpen size={16} /> Học sinh</span>, children: <ModuleList items={studentModules} /> },
              ]}
            />
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
            <div>
              <span className="public-eyebrow"><Building2 size={16} /> Đơn vị phát triển</span>
              <h2>Công ty TNHH Đầu tư & Công nghệ DAOGROUP</h2>
              <p><MapPin size={18} /> Số nhà 22, đường 3.7/10 KĐT Gamuda Gardens, Hoàng Mai, Hà Nội 100000</p>
              <p><Phone size={18} /> Liên hệ kỹ thuật: <strong>Tran Huu Nam</strong> · <a href="tel:0961766816">0961766816</a></p>
            </div>
            <div className="public-contact-actions">
              <a href="tel:0961766816"><Button type="primary" size="large"><Phone size={17} /> Gọi hỗ trợ kỹ thuật</Button></a>
              <a href="https://www.google.com/maps/search/?api=1&query=Số nhà 22 đường 3.7%2F10 KĐT Gamuda Gardens Hoàng Mai Hà Nội" target="_blank" rel="noreferrer">
                <Button size="large"><MapPin size={17} /> Xem bản đồ</Button>
              </a>
            </div>
          </section>
        </main>

        <footer className="public-footer">
          <div className="public-brand"><span><GraduationCap size={21} /></span><div><strong>DAO EDU</strong><small>by DAOGROUP</small></div></div>
          <p>© 2026 Công ty TNHH Đầu tư & Công nghệ DAOGROUP.</p>
          <Link to="/login">Đăng nhập hệ thống</Link>
        </footer>
      </div>
    </ConfigProvider>
  );
}
