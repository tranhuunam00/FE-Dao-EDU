import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { ShieldCheck, UserCheck, GraduationCap, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginGuideSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'admin' | 'teacher' | 'student'>('admin');

  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
          HƯỚNG DẪN ĐĂNG NHẬP & PHÂN QUYỀN HỆ THỐNG
        </h2>
        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
          Tài liệu hướng dẫn chi tiết quy trình truy cập, xác thực danh tính và phân quyền truy cập an toàn cho Quản trị viên, Giáo viên và Học sinh/Phụ huynh trên hệ thống DAO EDU (EduCare).
        </p>
      </div>

      {/* Role Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveRole('admin')}
          style={{
            padding: '14px',
            borderRadius: '10px',
            border: activeRole === 'admin' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: activeRole === 'admin' ? '#ecfdf5' : '#ffffff',
            color: activeRole === 'admin' ? '#047857' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '13.5px',
          }}
        >
          <ShieldCheck size={20} style={{ margin: '0 auto 6px', display: 'block', color: activeRole === 'admin' ? '#059669' : '#64748b' }} />
          1. Quản Trị Viên (Admin)
        </button>

        <button
          type="button"
          onClick={() => setActiveRole('teacher')}
          style={{
            padding: '14px',
            borderRadius: '10px',
            border: activeRole === 'teacher' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: activeRole === 'teacher' ? '#ecfdf5' : '#ffffff',
            color: activeRole === 'teacher' ? '#047857' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '13.5px',
          }}
        >
          <UserCheck size={20} style={{ margin: '0 auto 6px', display: 'block', color: activeRole === 'teacher' ? '#059669' : '#64748b' }} />
          2. Giáo Viên & Trợ Giảng
        </button>

        <button
          type="button"
          onClick={() => setActiveRole('student')}
          style={{
            padding: '14px',
            borderRadius: '10px',
            border: activeRole === 'student' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: activeRole === 'student' ? '#ecfdf5' : '#ffffff',
            color: activeRole === 'student' ? '#047857' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '13.5px',
          }}
        >
          <GraduationCap size={20} style={{ margin: '0 auto 6px', display: 'block', color: activeRole === 'student' ? '#059669' : '#64748b' }} />
          3. Học Sinh & Phụ Huynh
        </button>
      </div>

      {/* Role Details */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {activeRole === 'admin' && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={18} color="#059669" /> Hướng dẫn đăng nhập dành cho Quản trị viên & Giáo vụ
            </h3>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: 1.8, fontSize: '14px', margin: 0 }}>
              <li><strong>Địa chỉ URL:</strong> Truy cập cổng đăng nhập tại <code style={{ color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>https://educare.home-care.vn/login</code></li>
              <li><strong>Tên đăng nhập:</strong> Sử dụng Email quản trị đã được cấp (ví dụ: <code>admin@daoedu.vn</code>).</li>
              <li><strong>Mật khẩu:</strong> Nhập mật khẩu quản trị ban đầu và đổi ngay trong lần đầu đăng nhập.</li>
              <li><strong>Phân quyền truy cập:</strong> Có quyền truy cập toàn bộ menu Quản lý học sinh, Giáo viên, Phòng học, Kế toán học phí, Báo cáo và Cài đặt hệ thống.</li>
            </ul>
          </div>
        )}

        {activeRole === 'teacher' && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="#059669" /> Hướng dẫn đăng nhập dành cho Giáo viên
            </h3>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: 1.8, fontSize: '14px', margin: 0 }}>
              <li><strong>Tên đăng nhập:</strong> Sử dụng Mã giáo viên (ví dụ: <code>GV001</code>) hoặc Email cá nhân do trung tâm khai báo.</li>
              <li><strong>Tính năng nhanh:</strong> Khi đăng nhập thành công, hệ thống chuyển thẳng đến Lịch dạy hôm nay.</li>
              <li><strong>Thao tác buổi học:</strong> Bấm vào buổi học để điểm danh chuyên cần, sử dụng nút <em>Tất cả lớp TỐT</em> và <em>AI Viết Nhận Xét</em> để hoàn tất đánh giá trong 30 giây.</li>
            </ul>
          </div>
        )}

        {activeRole === 'student' && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="#059669" /> Hướng dẫn đăng nhập dành cho Học sinh & Phụ huynh
            </h3>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: 1.8, fontSize: '14px', margin: 0 }}>
              <li><strong>Tài khoản học sinh:</strong> Mã học sinh (ví dụ: <code>HS00124</code>) hoặc Số điện thoại phụ huynh đăng ký.</li>
              <li><strong>Tra cứu trực tiếp qua QR:</strong> Phụ huynh không bắt buộc phải nhớ mật khẩu - chỉ cần mở camera điện thoại quét <strong>Mã QR</strong> trên phiếu in tuần để xem kết quả học tập và nhận xét của giáo viên.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Interactive Mockup Box */}
      <div style={{ maxWidth: '440px', margin: '20px auto', border: '1px solid #cbd5e1', borderRadius: '16px', background: '#ffffff', padding: '28px 24px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <Lock size={22} />
          </div>
          <h4 style={{ margin: '10px 0 4px', fontSize: '17px', color: '#0f172a' }}>Đăng nhập DAO EDU (EduCare)</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>Nhập thông tin tài khoản được cấp</p>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Tài khoản / Email / Mã số</label>
          <Input value={activeRole === 'admin' ? 'admin@daoedu.vn' : activeRole === 'teacher' ? 'giaovien.toan@daoedu.vn' : 'HS00124'} readOnly />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mật khẩu</label>
          <Input.Password value="••••••••••••" readOnly />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
          <span><CheckCircle2 size={13} style={{ display: 'inline', color: '#10b981' }} /> Ghi nhớ đăng nhập</span>
          <span style={{ color: '#059669', fontWeight: 600, cursor: 'pointer' }}>Quên mật khẩu?</span>
        </div>

        <a href="/login" style={{ textDecoration: 'none' }}>
          <Button type="primary" block style={{ background: '#059669', borderColor: '#059669', height: '42px', fontWeight: 700 }}>
            Đăng nhập hệ thống <ArrowRight size={16} />
          </Button>
        </a>
      </div>
    </div>
  );
};
