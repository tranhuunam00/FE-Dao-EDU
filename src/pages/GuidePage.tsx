import React, { useState } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  KeyRound,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { OverviewSystemDiagram } from '../components/guide/OverviewSystemDiagram';
import { LoginGuideSection } from '../components/guide/LoginGuideSection';
import { ReportPrintAndSqiGuide } from '../components/guide/ReportPrintAndSqiGuide';
import { TeacherWorkflowGuide } from '../components/guide/TeacherWorkflowGuide';
import { TeacherClassFeaturesGuide } from '../components/guide/TeacherClassFeaturesGuide';
import { StudentPortalGuide } from '../components/guide/StudentPortalGuide';

type SectionKey = 'overview' | 'login' | 'sqi' | 'admin' | 'teacher_classes' | 'teacher_workflow' | 'student';

export const GuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [teacherOpen, setTeacherOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const isTeacherActive = activeSection === 'teacher_classes' || activeSection === 'teacher_workflow';

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#172033', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Header */}
      <header
        style={{
          height: '60px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size={36} showText subtitle="by DAOGROUP" />
          </Link>
          <span style={{ height: '20px', width: '1px', background: '#cbd5e1' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={16} /> Trung Tâm Hướng Dẫn
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '6px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Đã sao chép' : 'Copy'}
            <ChevronDown size={12} color="#94a3b8" />
          </button>
          <Link to="/">
            <Button icon={<ArrowLeft size={14} />}>Trang chủ</Button>
          </Link>
          <Link to="/login">
            <Button type="primary" style={{ background: '#059669', borderColor: '#059669' }}>
              Đăng nhập hệ thống
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Two-Column Layout (EduCare Docs Style) */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Left Sidebar */}
        <aside
          style={{
            width: '290px',
            flexShrink: 0,
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            padding: '20px 16px',
            height: 'calc(100vh - 60px)',
            position: 'sticky',
            top: '60px',
            overflowY: 'auto',
          }}
        >
          {/* Selector matching Image 2 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
          >
            <span>EDUCARE</span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {/* Group 1: Overview */}
          <div style={{ marginBottom: '22px' }}>
            <div
              onClick={() => setActiveSection('overview')}
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: activeSection === 'overview' ? '#047857' : '#1e293b',
                textTransform: 'uppercase',
                padding: '6px 10px',
                cursor: 'pointer',
                lineHeight: 1.4,
                marginBottom: '6px',
              }}
            >
              TỔNG QUAN HỆ THỐNG QUẢN LÝ ĐÀO TẠO EDUCARE (DAO EDU)
            </div>
            <div
              onClick={() => setActiveSection('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                color: activeSection === 'student' ? '#007a64' : '#334155',
                background: activeSection === 'student' ? '#e6f7f2' : 'transparent',
                border: activeSection === 'student' ? '1px solid #a7f3d0' : '1px solid transparent',
                cursor: 'pointer',
                margin: '3px 0',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📱</span> CỔNG HỌC VIÊN & PHỤ HUYNH
              </span>
              <ChevronRight size={14} color={activeSection === 'student' ? '#007a64' : '#94a3b8'} />
            </div>
            {/* CỔNG GIÁO VIÊN & ĐIỂM DANH (Có các tab con) */}
            <div style={{ margin: '3px 0' }}>
              <div
                onClick={() => {
                  setTeacherOpen(!teacherOpen);
                  if (!isTeacherActive) {
                    setActiveSection('teacher_classes');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: isTeacherActive ? '#007a64' : '#334155',
                  background: isTeacherActive ? '#e6f7f2' : 'transparent',
                  border: isTeacherActive ? '1px solid #a7f3d0' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧑‍🏫</span> CỔNG GIÁO VIÊN & ĐIỂM DANH
                </span>
                {teacherOpen ? (
                  <ChevronDown size={14} color={isTeacherActive ? '#007a64' : '#94a3b8'} />
                ) : (
                  <ChevronRight size={14} color={isTeacherActive ? '#007a64' : '#94a3b8'} />
                )}
              </div>

              {/* Sub-tabs menu cho Giáo Viên */}
              {teacherOpen && (
                <div style={{ paddingLeft: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div
                    onClick={() => setActiveSection('teacher_classes')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: activeSection === 'teacher_classes' ? 700 : 500,
                      color: activeSection === 'teacher_classes' ? '#047857' : '#475569',
                      background: activeSection === 'teacher_classes' ? '#ecfdf5' : 'transparent',
                      borderLeft: activeSection === 'teacher_classes' ? '3px solid #059669' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>📚 Cẩm nang Lớp học & Bài tập</span>
                  </div>

                  <div
                    onClick={() => setActiveSection('teacher_workflow')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: activeSection === 'teacher_workflow' ? 700 : 500,
                      color: activeSection === 'teacher_workflow' ? '#047857' : '#475569',
                      background: activeSection === 'teacher_workflow' ? '#ecfdf5' : 'transparent',
                      borderLeft: activeSection === 'teacher_workflow' ? '3px solid #059669' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>⚡ Quy trình Buổi học & AI</span>
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => setActiveSection('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#ef4444',
                cursor: 'pointer',
              }}
            >
              <span>🆘 HỖ TRỢ & CSKH (TICKET SUPPORT)</span>
            </div>
          </div>

          {/* Group 2: Getting Started */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', padding: '4px 10px', letterSpacing: '0.05em' }}>
              KHỞI ĐẦU HỆ THỐNG
            </div>
            <div
              onClick={() => setActiveSection('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: activeSection === 'login' ? '#047857' : '#059669',
                background: activeSection === 'login' ? '#ecfdf5' : '#f0fdf4',
                border: '1px solid #bbf7d0',
                margin: '4px 0',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} color="#059669" /> HƯỚNG DẪN ĐĂNG NHẬP
              </span>
            </div>
            <div
              onClick={() => setActiveSection('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <span>📁 XỬ LÍ MASTER DATA</span>
              <ChevronRight size={13} color="#94a3b8" />
            </div>
          </div>

          {/* Group 3: Điểm danh & SQI */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', padding: '4px 10px', letterSpacing: '0.05em' }}>
              NHẬN XÉT & BÁO CÁO SQI
            </div>
            <div
              onClick={() => setActiveSection('sqi')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                color: activeSection === 'sqi' ? '#007a64' : '#334155',
                background: activeSection === 'sqi' ? '#e6f7f2' : 'transparent',
                border: activeSection === 'sqi' ? '1px solid #a7f3d0' : '1px solid transparent',
                cursor: 'pointer',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <FileSpreadsheet size={16} color={activeSection === 'sqi' ? '#007a64' : '#059669'} />
              <span>In Báo Cáo & SQI (100đ)</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main style={{ flex: 1, padding: '32px 44px 80px', maxWidth: '1040px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              EDUCARE {
                activeSection === 'login' ? '> KHỞI ĐẦU HỆ THỐNG > ĐĂNG NHẬP' :
                activeSection === 'teacher_classes' ? '> CỔNG GIÁO VIÊN & ĐIỂM DANH > CẨM NANG LỚP HỌC & BÀI TẬP' :
                activeSection === 'teacher_workflow' ? '> CỔNG GIÁO VIÊN & ĐIỂM DANH > QUY TRÌNH BUỔI HỌC (ĐIỂM DANH & AI)' :
                activeSection === 'student' ? '> CỔNG HỌC VIÊN & PHỤ HUYNH > CẨM NANG HỌC SINH' :
                activeSection === 'sqi' ? '> NHẬN XÉT & BÁO CÁO SQI > IN BÁO CÁO & CÁCH TÍNH ĐIỂM SQI' : ''
              }
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Copy size={13} /> Copy <ChevronDown size={11} color="#94a3b8" />
            </button>
          </div>

          {/* Quick Sub-Tab Bar for Teacher */}
          {isTeacherActive && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px',
                background: '#f1f5f9',
                borderRadius: '10px',
                marginBottom: '24px',
                width: 'fit-content',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveSection('teacher_classes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeSection === 'teacher_classes' ? '#ffffff' : 'transparent',
                  color: activeSection === 'teacher_classes' ? '#047857' : '#64748b',
                  boxShadow: activeSection === 'teacher_classes' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>📚</span> Cẩm Nang Lớp Học & Bài Tập (9 bước)
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('teacher_workflow')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeSection === 'teacher_workflow' ? '#ffffff' : 'transparent',
                  color: activeSection === 'teacher_workflow' ? '#047857' : '#64748b',
                  boxShadow: activeSection === 'teacher_workflow' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>⚡</span> Quy Trình Buổi Học: Điểm Danh & AI
              </button>
            </div>
          )}

          {/* DYNAMIC CONTENT SWITCHING */}
          {activeSection === 'overview' && <OverviewSystemDiagram />}
          {activeSection === 'login' && <LoginGuideSection />}
          {activeSection === 'sqi' && <ReportPrintAndSqiGuide />}
          {activeSection === 'teacher_classes' && <TeacherClassFeaturesGuide />}
          {activeSection === 'teacher_workflow' && <TeacherWorkflowGuide />}
          {activeSection === 'student' && <StudentPortalGuide />}
          {activeSection === 'admin' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                XỬ LÝ MASTER DATA & QUẢN TRỊ VIÊN
              </h2>
              <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
                Quản lý hồ sơ học sinh, giáo viên, phòng học, chương trình học và kế toán học phí theo chu kỳ buổi thực tế.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GuidePage;
