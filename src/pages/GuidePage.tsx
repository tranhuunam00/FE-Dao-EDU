import React, { useState } from 'react';
import { Button, Tabs } from 'antd';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
  UserRound,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { SessionEvaluationAndReportGuide } from '../components/SessionEvaluationAndReportGuide';
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

const ModuleList: React.FC<{ items: string[][] }> = ({ items }) => (
  <div className="public-module-grid" style={{ marginTop: '16px' }}>
    {items.map(([title, description]) => (
      <article className="public-module-card" key={title}>
        <CheckCircle size={20} color="#10b981" />
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </article>
    ))}
  </div>
);

const CheckCircle: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const GuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sqi-guide');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#172033', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header
        style={{
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 max(24px, calc((100vw - 1180px)/2))',
          background: 'rgba(255,255,255,0.95)',
          borderBottom: '1px solid #e2e8f0',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size={38} showText subtitle="by DAOGROUP" />
          </Link>
          <span style={{ height: '20px', width: '1px', background: '#cbd5e1' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={16} /> Trung Tâm Hướng Dẫn
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/">
            <Button icon={<ArrowLeft size={15} />}>Trang chủ</Button>
          </Link>
          <Link to="/login">
            <Button type="primary" style={{ background: '#059669', borderColor: '#059669' }}>
              Đăng nhập hệ thống
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          color: '#ffffff',
          padding: '44px max(24px, calc((100vw - 1180px)/2)) 36px',
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
            <Sparkles size={14} color="#6ee7b7" /> HƯỚNG DẪN SỬ DỤNG HỆ THỐNG DAO EDU
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 10px', color: '#ffffff', lineHeight: 1.2 }}>
            Tài liệu hướng dẫn trực quan & toàn diện
          </h1>
          <p style={{ fontSize: '15px', color: '#d1fae5', margin: 0, lineHeight: 1.6 }}>
            Hướng dẫn đầy đủ quy trình thao tác từ điểm danh, nhận xét 1-chạm, sinh nhận xét bằng AI (Gemini), đến mở và xuất phiếu báo cáo chất lượng SQI gửi phụ huynh qua link & mã QR.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 80px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="large"
          items={[
            {
              key: 'sqi-guide',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ClipboardCheck size={18} color="#059669" /> Nhận xét & In báo cáo SQI
                </span>
              ),
              children: (
                <div style={{ marginTop: '20px' }}>
                  <SessionEvaluationAndReportGuide />
                </div>
              ),
            },
            {
              key: 'teacher',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <UserRound size={18} color="#059669" /> Dành cho Giáo viên
                </span>
              ),
              children: <ModuleList items={teacherModules} />,
            },
            {
              key: 'admin',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ShieldCheck size={18} color="#059669" /> Dành cho Quản trị viên
                </span>
              ),
              children: <ModuleList items={adminModules} />,
            },
            {
              key: 'student',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <BookOpen size={18} color="#059669" /> Dành cho Học sinh
                </span>
              ),
              children: <ModuleList items={studentModules} />,
            },
          ]}
        />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '24px',
          background: '#ffffff',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12.5px',
        }}
      >
        <p style={{ margin: '0 0 6px' }}>© 2026 DAO EDU - Nền tảng quản lý trung tâm giáo dục toàn diện.</p>
        <p style={{ margin: 0 }}>Hỗ trợ kỹ thuật trực tiếp: 0888 888 888 · support@daoedu.vn</p>
      </footer>
    </div>
  );
};

export default GuidePage;
