import React from 'react';
import { Row, Col } from 'antd';

interface ReportCardPedagogyProps {
  strengths?: string;
  improvements?: string;
  recommendations?: string[];
  commendation?: string | null;
  suggestion?: string | null;
  isMonthly?: boolean;
}

export const ReportCardPedagogy: React.FC<ReportCardPedagogyProps> = ({
  strengths,
  improvements,
  recommendations,
  commendation,
  suggestion,
  isMonthly,
}) => {
  const cleanStrengths = (strengths || '')
    .replace(/^(Điểm mạnh nổi bật|Điểm mạnh|Ưu điểm)\s*:\s*/i, '')
    .trim() || 'Học sinh duy trì nề nếp và tham gia học tập nghiêm túc.';

  const cleanImprovements = (improvements || '')
    .replace(/^(Điểm cần cải thiện|Điểm cần lưu ý|Cần cải thiện)\s*:\s*/i, '')
    .trim() || 'Tiếp tục duy trì phong độ và tính chủ động trên lớp.';

  return (
    <div className="report-pedagogy-section" style={{ marginTop: 8 }}>
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
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          Nhận Xét Của Giáo Viên {isMonthly ? 'Trong Tháng' : 'Trong Tuần'}
        </div>

        {/* COMMENDATION / TUYÊN DƯƠNG NẾU CÓ */}
        {commendation && (
          <div
            style={{
              background: '#fefce8',
              border: '1px solid #fde047',
              borderRadius: 4,
              padding: '6px 10px',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#ca8a04', marginBottom: 2 }}>
              🎖️ Tuyên dương & Khen thưởng:
            </div>
            <div style={{ fontSize: 11.5, color: '#854d0e', lineHeight: 1.5, fontWeight: 500 }}>
              {commendation}
            </div>
          </div>
        )}

        <Row gutter={[10, 8]}>
          <Col xs={24} sm={12}>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', height: '100%' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#16a34a', marginBottom: 2 }}>
                Ưu điểm:
              </div>
              <div style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.5 }}>
                {cleanStrengths}
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', height: '100%' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#d97706', marginBottom: 2 }}>
                Cần cải thiện:
              </div>
              <div style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.5 }}>
                {cleanImprovements}
              </div>
            </div>
          </Col>

          {suggestion && (
            <Col span={24}>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
                  Gợi ý rèn luyện cho con:
                </div>
                <div style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.5 }}>
                  {suggestion}
                </div>
              </div>
            </Col>
          )}

          <Col span={24}>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                Gợi ý phối hợp cùng phụ huynh:
              </div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {(recommendations && recommendations.length > 0
                  ? recommendations
                  : ['Gia đình tiếp tục động viên và nhắc nhở con ôn bài trước giờ lên lớp.']
                ).map((rec, idx) => (
                  <li key={idx} style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.45, marginBottom: 2 }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </div>

      {/* SIGNATURE SECTION (STANDARDIZED A4 REPORT CARD) */}
      <div
        className="report-signature-section"
        style={{
          marginTop: 10,
          paddingTop: 2,
          display: 'flex',
          justifyContent: 'space-between',
          textAlign: 'center',
          pageBreakInside: 'avoid',
        }}
      >
        <div style={{ width: '40%' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
            GIÁO VIÊN PHỤ TRÁCH
          </div>
          <div style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic', marginBottom: 24 }}>
            (Ký và ghi rõ họ tên)
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>
            Ban Giảng Viên DAO EDU
          </div>
        </div>

        <div style={{ width: '40%' }}>
          <div style={{ fontSize: 10.5, color: '#64748b', fontStyle: 'italic', marginBottom: 2 }}>
            Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>
            GIÁM ĐỐC ĐÀO TẠO
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', fontStyle: 'italic', marginBottom: 24 }}>
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
