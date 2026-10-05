import React from 'react';
import {
  Users,
  GraduationCap,
  HeartHandshake,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  MessageSquare,
  Bot,
  Fingerprint,
  Share2,
  Megaphone,
  CalendarDays,
  Award,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';

export const OverviewSystemDiagram: React.FC = () => {
  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.3 }}>
          TỔNG QUAN HỆ THỐNG QUẢN LÝ ĐÀO TẠO EDUCARE (DAO EDU)
        </h2>
        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: '0 0 16px' }}>
          Hệ thống quản lý đào tạo cung cấp nền tảng toàn diện, chuyên nghiệp, tự động hóa toàn bộ
          hệ thống quản lý. Quá trình từ khâu tiếp thị, tuyển sinh đầu vào, vận hành giáo vụ cho
          đến chăm sóc học viên.
        </p>
        <p style={{ fontSize: '14.5px', fontWeight: 700, color: '#047857', margin: 0 }}>
          Mô hình tổng quan đào tạo hệ thống quản lý đào tạo - EDUCARE
        </p>
      </div>

      {/* MATRIX DIAGRAM EXACTLY LIKE IMAGE 2 */}
      <div
        style={{
          border: '2px solid #99f6e4',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f0fdfa',
          boxShadow: '0 4px 16px rgba(13, 148, 136, 0.08)',
          marginBottom: '8px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <tbody>
            {/* ROW 1: KHÁCH HÀNG */}
            <tr style={{ borderBottom: '1.5px solid #99f6e4' }}>
              <td
                style={{
                  width: '22%',
                  padding: '18px 12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#0f172a',
                  background: '#ccfbf1',
                  borderRight: '1.5px solid #99f6e4',
                  letterSpacing: '0.04em',
                }}
              >
                KHÁCH HÀNG
              </td>
              <td style={{ width: '26%', padding: '16px 12px', borderRight: '1.5px solid #99f6e4' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                    <Users size={22} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>HỌC VIÊN TIỀM NĂNG</span>
                </div>
              </td>
              <td style={{ width: '26%', padding: '16px 12px', borderRight: '1.5px solid #99f6e4' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                    <GraduationCap size={22} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>HỌC VIÊN</span>
                </div>
              </td>
              <td style={{ width: '26%', padding: '16px 12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                    <HeartHandshake size={22} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>PHỤ HUYNH</span>
                </div>
              </td>
            </tr>

            {/* ROW 2: GIAO DIỆN KHÁCH HÀNG */}
            <tr style={{ borderBottom: '1.5px solid #99f6e4' }}>
              <td
                style={{
                  padding: '18px 12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#0f172a',
                  background: '#ccfbf1',
                  borderRight: '1.5px solid #99f6e4',
                  letterSpacing: '0.04em',
                }}
              >
                GIAO DIỆN<br />KHÁCH HÀNG
              </td>
              <td style={{ padding: '16px 12px', borderRight: '1.5px solid #99f6e4' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '9px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                    <Smartphone size={22} />
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>
                    MOBILE APP<br /><small style={{ fontSize: '10px', color: '#0f766e' }}>(IOS - ANDROID)</small>
                  </span>
                </div>
              </td>
              <td style={{ padding: '16px 12px', borderRight: '1.5px solid #99f6e4' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '9px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                    <Globe size={22} />
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>
                    CỔNG THÔNG TIN<br />ĐIỆN TỬ CHO HỌC VIÊN
                  </span>
                </div>
              </td>
              <td style={{ padding: '16px 12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '9px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                    <QrCode size={22} />
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>
                    CỔNG THÔNG TIN<br />ĐIỆN TỬ CHO PHỤ HUYNH
                  </span>
                </div>
              </td>
            </tr>

            {/* ROW 3: TÍCH HỢP */}
            <tr style={{ borderBottom: '1.5px solid #99f6e4' }}>
              <td
                style={{
                  padding: '18px 12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#0f172a',
                  background: '#ccfbf1',
                  borderRight: '1.5px solid #99f6e4',
                  letterSpacing: '0.04em',
                }}
              >
                TÍCH HỢP
              </td>
              <td colSpan={3} style={{ padding: '14px 6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                      <CreditCard size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#134e4a' }}>CALL CENTER</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                      <MessageSquare size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#134e4a' }}>SMS GATEWAY</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                      <Share2 size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#134e4a' }}>EMAIL SEVER</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                      <Bot size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#134e4a' }}>WEBSITE</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#0d9488' }}>
                      <Fingerprint size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#134e4a' }}>3RD PARTY</span>
                  </div>
                </div>
              </td>
            </tr>

            {/* ROW 4: CRM */}
            <tr>
              <td
                style={{
                  padding: '18px 12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#0f172a',
                  background: '#ccfbf1',
                  borderRight: '1.5px solid #99f6e4',
                  letterSpacing: '0.04em',
                }}
              >
                CRM
              </td>
              <td colSpan={3} style={{ padding: '14px 6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#047857' }}>
                      <Megaphone size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#064e3b' }}>1. MARKETING</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#047857' }}>
                      <CalendarDays size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#064e3b' }}>2. QUẢN LÝ TUYỂN SINH</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#047857' }}>
                      <Award size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#064e3b' }}>3. QUẢN LÝ GIÁO VỤ</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#047857' }}>
                      <CircleDollarSign size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#064e3b' }}>4. HỖ TRỢ HỌC VIÊN</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #5eead4', color: '#047857' }}>
                      <TrendingUp size={18} />
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#064e3b' }}>5. BÁO CÁO VÀ PHÂN TÍCH</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', fontStyle: 'italic', marginBottom: '28px' }}>
        Ảnh mô hình tổng quan 1: Kiến trúc luồng vận hành đào tạo DAO EDU (EduCare)
      </div>
    </div>
  );
};
