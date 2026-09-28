import React from 'react';
import { Row, Col, Input, Button, QRCode } from 'antd';
import { Sparkles } from 'lucide-react';

const { TextArea } = Input;

interface ReportCardPedagogyProps {
  strengths?: string;
  improvements?: string;
  recommendations?: string[];
  commendation?: string | null;
  suggestion?: string | null;
  isMonthly?: boolean;
  isEditable?: boolean;
  generatingAi?: boolean;
  qrCodeUrl?: string;
  onGenerateAi?: () => void;
  onChangeCommendation?: (val: string) => void;
  onChangeSuggestion?: (val: string) => void;
  onChangeStrengths?: (val: string) => void;
  onChangeImprovements?: (val: string) => void;
}

export const ReportCardPedagogy: React.FC<ReportCardPedagogyProps> = ({
  strengths = '',
  improvements = '',
  commendation = '',
  suggestion = '',
  isMonthly,
  isEditable = true,
  generatingAi = false,
  qrCodeUrl,
  onGenerateAi,
  onChangeCommendation,
  onChangeSuggestion,
  onChangeStrengths,
  onChangeImprovements,
}) => {
  return (
    <div className="report-pedagogy-section" style={{ marginTop: 8 }}>
      <style>{`
        .print-only-text { display: none !important; }
        @media print {
          .no-print-pedagogy-edit { display: none !important; }
          .print-only-text {
            display: block !important;
            font-size: 9.5pt !important;
            color: #0f172a !important;
            line-height: 1.45 !important;
            white-space: pre-wrap !important;
          }
        }
      `}</style>

      {/* PEDAGOGICAL BOXES */}
      <div
        className="report-pedagogy-box"
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          background: '#ffffff',
          padding: '8px 10px',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Nhận Xét Của Giáo Viên {isMonthly ? 'Trong Tháng' : 'Trong Tuần'}
          </div>

          {isEditable && onGenerateAi && (
            <Button
              size="small"
              type="dashed"
              loading={generatingAi}
              icon={<Sparkles size={13} style={{ color: '#8b5cf6' }} />}
              onClick={onGenerateAi}
              className="no-print"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#6d28d9',
                borderColor: '#c4b5fd',
                background: '#f5f3ff',
                borderRadius: 4,
              }}
            >
              Gợi ý bằng AI Gemini
            </Button>
          )}
        </div>

        <Row gutter={[8, 8]}>
          {/* COMMENDATION / TUYÊN DƯƠNG */}
          <Col span={24}>
            <div
              style={{
                background: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: 4,
                padding: '6px 8px',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ca8a04', marginBottom: 2 }}>
                Tuyên dương & Khen thưởng:
              </div>
              {isEditable ? (
                <>
                  <div className="no-print-pedagogy-edit">
                    <TextArea
                      rows={3}
                      value={commendation || ''}
                      onChange={(e) => onChangeCommendation?.(e.target.value)}
                      placeholder="Nhập lời khen ngợi khích lệ nỗ lực của học sinh..."
                      style={{
                        fontSize: 11,
                        background: '#fffdf0',
                        borderColor: '#fef08a',
                        color: '#713f12',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div className="print-only-text" style={{ color: '#713f12', fontWeight: 500 }}>
                    {commendation || 'Tuyên dương học sinh có ý thức học tập và nỗ lực tiến bộ.'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11.5, color: '#854d0e', lineHeight: 1.5, fontWeight: 500 }}>
                  {commendation || 'Tuyên dương học sinh có ý thức học tập và nỗ lực tiến bộ.'}
                </div>
              )}
            </div>
          </Col>

          {/* ƯU ĐIỂM */}
          <Col xs={24} sm={12}>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 8px', height: '100%' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 2 }}>
                Ưu điểm:
              </div>
              {isEditable ? (
                <>
                  <div className="no-print-pedagogy-edit">
                    <TextArea
                      rows={3}
                      value={strengths}
                      onChange={(e) => onChangeStrengths?.(e.target.value)}
                      placeholder="Ghi nhận các điểm tốt của con..."
                      style={{ fontSize: 11, color: '#0f172a', borderRadius: 4 }}
                    />
                  </div>
                  <div className="print-only-text">
                    {strengths || 'Học sinh tiếp thu bài tốt và có ý thức học tập nghiêm túc.'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.5 }}>
                  {strengths || 'Học sinh tiếp thu bài tốt và có ý thức học tập nghiêm túc.'}
                </div>
              )}
            </div>
          </Col>

          {/* CẦN CẢI THIỆN */}
          <Col xs={24} sm={12}>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 8px', height: '100%' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', marginBottom: 2 }}>
                Cần cải thiện:
              </div>
              {isEditable ? (
                <>
                  <div className="no-print-pedagogy-edit">
                    <TextArea
                      rows={3}
                      value={improvements}
                      onChange={(e) => onChangeImprovements?.(e.target.value)}
                      placeholder="Các điểm con cần rèn luyện thêm..."
                      style={{ fontSize: 11, color: '#0f172a', borderRadius: 4 }}
                    />
                  </div>
                  <div className="print-only-text">
                    {improvements || 'Cần duy trì đều đặn thói quen làm bài tập về nhà.'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.5 }}>
                  {improvements || 'Cần duy trì đều đặn thói quen làm bài tập về nhà.'}
                </div>
              )}
            </div>
          </Col>

          {/* GỢI Ý RÈN LUYỆN & PHỐI HỢP CÙNG PHỤ HUYNH */}
          <Col span={24}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
                Gợi ý rèn luyện & phối hợp cùng phụ huynh:
              </div>
              {isEditable ? (
                <>
                  <div className="no-print-pedagogy-edit">
                    <TextArea
                      rows={3}
                      value={suggestion || ''}
                      onChange={(e) => onChangeSuggestion?.(e.target.value)}
                      placeholder="Gợi ý phương pháp tự học và cách phối hợp giữa gia đình và trung tâm..."
                      style={{ fontSize: 11, color: '#1e293b', borderRadius: 4 }}
                    />
                  </div>
                  <div className="print-only-text">
                    {suggestion || 'Gia đình tiếp tục động viên, nhắc nhở con ôn bài và chuẩn bị sách vở sớm trước giờ học.'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {suggestion || 'Gia đình tiếp tục động viên, nhắc nhở con ôn bài và chuẩn bị sách vở sớm trước giờ học.'}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* SIGNATURE SECTION (STANDARDIZED A4 REPORT CARD) */}
      <div
        className="report-signature-section"
        style={{
          marginTop: 8,
          paddingTop: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          textAlign: 'center',
          pageBreakInside: 'avoid',
        }}
      >
        <div style={{ width: qrCodeUrl ? '36%' : '45%' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
            GIÁO VIÊN PHỤ TRÁCH
          </div>
          <div style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic', marginBottom: 22 }}>
            (Ký và ghi rõ họ tên)
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>
            Ban Giảng Viên DAO EDU
          </div>
        </div>

        {qrCodeUrl && (
          <div
            style={{
              width: '24%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 4,
            }}
          >
            <div style={{ background: '#ffffff', padding: 2, borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <QRCode value={qrCodeUrl} size={54} bordered={false} style={{ padding: 0 }} />
            </div>
            <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Quét tra cứu online
            </div>
          </div>
        )}

        <div style={{ width: qrCodeUrl ? '36%' : '45%' }}>
          <div style={{ fontSize: 10.5, color: '#64748b', fontStyle: 'italic', marginBottom: 2 }}>
            Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>
            GIÁM ĐỐC ĐÀO TẠO
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', fontStyle: 'italic', marginBottom: 22 }}>
            (Ký và đóng dấu)
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>
            Hệ Thống Giáo Dục DAO EDU
          </div>
        </div>
      </div>
    </div>
  );
};


