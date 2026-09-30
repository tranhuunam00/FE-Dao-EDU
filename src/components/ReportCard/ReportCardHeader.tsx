import React from 'react';
import { Typography, Row, Col } from 'antd';
import { Calendar, User, BookOpen } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

const { Text } = Typography;

interface ReportCardHeaderProps {
  studentName?: string;
  studentCode?: string;
  className?: string;
  activeClasses?: string;
  periodLabel: string;
  dateRange: string;
  isMonthly?: boolean;
}

export const ReportCardHeader: React.FC<ReportCardHeaderProps> = ({
  studentName,
  studentCode,
  className,
  activeClasses,
  periodLabel,
  dateRange,
  isMonthly: _isMonthly,
}) => {
  const displayClass = activeClasses || className || 'Đang cập nhật';

  return (
    <div className="report-header-section" style={{ marginBottom: 12 }}>
      {/* BRANDING HEADER WITH LOGO & SLOGAN */}
      <div
        className="report-header-branding"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 8,
          borderBottom: '2px solid #334155',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandLogo size={38} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', lineHeight: 1.2 }}>
              DAO EDU
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              Nền tảng quản lý giáo dục toàn diện • Đồng hành cùng phụ huynh
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
          <div>Hotline: <strong>0961 766 816</strong></div>
          <div>Đơn vị: <strong>DAOGROUP</strong></div>
        </div>
      </div>

      {/* DOCUMENT TITLE */}
      <div className="report-header-title" style={{ textAlign: 'center', margin: '8px 0 10px' }}>
        <div
          style={{
            margin: 0,
            textTransform: 'uppercase',
            color: '#1e1b4b',
            fontFamily: "'Merriweather', 'Times New Roman', 'Playfair Display', Georgia, serif",
            fontWeight: 900,
            fontSize: 19,
            letterSpacing: '0.04em',
            lineHeight: 1.3,
          }}
        >
          PHIẾU BÁO KẾT QUẢ HỌC TẬP
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#4338ca', marginTop: 3 }}>
          {periodLabel} ({dateRange})
        </div>
      </div>

      {/* STUDENT & CLASS INFO (COMPACT SCIENTIFIC BOX) */}
      <div
        className="report-header-info"
        style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 10,
        }}
      >
        <Row gutter={[16, 6]}>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} color="#64748b" />
              <Text style={{ fontSize: 13, color: '#475569' }}>Họ và tên học sinh:</Text>
              <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
                {studentName || 'Học sinh'}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: '#475569' }}>Mã số học sinh:</Text>
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                {studentCode || 'Đang cập nhật'}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} color="#64748b" />
              <Text style={{ fontSize: 13, color: '#475569' }}>Lớp đang học:</Text>
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                {displayClass}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="#64748b" />
              <Text style={{ fontSize: 13, color: '#475569' }}>Ngày xuất phiếu:</Text>
              <Text style={{ fontSize: 13, color: '#0f172a' }}>
                {new Date().toLocaleDateString('vi-VN')}
              </Text>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
