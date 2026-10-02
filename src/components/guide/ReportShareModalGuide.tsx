import React, { useState } from 'react';
import { Button, QRCode, message } from 'antd';
import { Copy, Check, QrCode as QrIcon, X, Send } from 'lucide-react';

interface ReportShareModalGuideProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  studentCode?: string;
}

export const ReportShareModalGuide: React.FC<ReportShareModalGuideProps> = ({
  visible,
  onClose,
  studentName = 'Nguyễn Văn An',
  studentCode = 'HS00124',
}) => {
  const [copied, setCopied] = useState(false);
  const sampleUrl = `https://daoedu.vn/public/reports/${studentCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sampleUrl);
    setCopied(true);
    message.success('Đã sao chép link báo cáo gửi phụ huynh!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.2)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <QrIcon size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Link & Mã QR Báo Cáo Phụ Huynh</div>
              <div style={{ fontSize: '12px', color: '#a7f3d0' }}>
                Học sinh: <strong>{studentName}</strong> ({studentCode})
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          {/* QR Code Container */}
          <div
            style={{
              display: 'inline-block',
              padding: '12px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid #cbd5e1',
              marginBottom: '16px',
            }}
          >
            <QRCode value={sampleUrl} size={160} bordered={false} />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              Quét bằng Camera điện thoại hoặc Zalo
            </div>
          </div>

          {/* Copy URL Input Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            <input
              type="text"
              readOnly
              value={sampleUrl}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
              }}
            />
            <Button
              type={copied ? 'default' : 'primary'}
              size="small"
              onClick={handleCopy}
              icon={copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              style={{
                background: copied ? '#ecfdf5' : '#059669',
                borderColor: copied ? '#86efac' : '#059669',
                color: copied ? '#15803d' : '#ffffff',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              {copied ? 'Đã chép' : 'Sao chép link'}
            </Button>
          </div>

          {/* 3 Step Guidance */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px 14px',
              textAlign: 'left',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#1e293b',
            }}
          >
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={14} /> Cách thức gửi báo cáo cho phụ huynh:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              <li>
                <strong>Không cần mật khẩu:</strong> Phụ huynh bấm trực tiếp vào link trên Zalo/SMS hoặc quét mã QR là mở xem ngay phiếu chất lượng.
              </li>
              <li>
                <strong>Link cố định theo học sinh:</strong> Gửi một lần dùng trọn năm học, mỗi tuần giáo viên phê duyệt xong phụ huynh sẽ thấy ngay số liệu mới.
              </li>
              <li>
                <strong>Xem tối ưu trên điện thoại:</strong> Giao diện tự động căn chỉnh hiển thị đẹp như ứng dụng di động.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <Button onClick={onClose}>Đóng</Button>
          <Button
            type="primary"
            style={{ background: '#059669', borderColor: '#059669' }}
            icon={<Copy size={14} />}
            onClick={handleCopy}
          >
            Sao chép gửi Zalo
          </Button>
        </div>
      </div>
    </div>
  );
};
