import React, { useState } from 'react';

export const SessionEvaluationAndReportGuide: React.FC = () => {
  const [subTab, setSubTab] = useState<'evaluate' | 'print' | 'sqi'>('evaluate');

  return (
    <div style={{ padding: '8px 4px', maxWidth: '1000px', margin: '0 auto', color: '#1e293b' }}>
      {/* Sub Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setSubTab('evaluate')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: subTab === 'evaluate' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: subTab === 'evaluate' ? '#ecfdf5' : '#ffffff',
            color: subTab === 'evaluate' ? '#047857' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          1. Hướng dẫn nhận xét buổi học
        </button>
        <button
          type="button"
          onClick={() => setSubTab('print')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: subTab === 'print' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: subTab === 'print' ? '#ecfdf5' : '#ffffff',
            color: subTab === 'print' ? '#047857' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          2. Hướng dẫn in báo cáo (PDF / A4)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('sqi')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: subTab === 'sqi' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: subTab === 'sqi' ? '#ecfdf5' : '#ffffff',
            color: subTab === 'sqi' ? '#047857' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          3. Cách tính điểm chỉ số SQI (100 điểm)
        </button>
      </div>

      {/* TAB 1: NHẬN XÉT BUỔI HỌC */}
      {subTab === 'evaluate' && (
        <div>
          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>
              Quy trình nhận xét và đánh giá mỗi buổi học
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Giáo viên mở buổi học từ Lịch dạy trên Dashboard. Tại cửa sổ buổi học, chuyển sang tab <strong>2. Đánh giá 1-Chạm & AI Nhận xét</strong> để đánh giá 4 tiêu chí và lưu nhận xét cho từng học sinh.
            </p>
          </div>

          {/* MÔ PHỎNG MÀN HÌNH 1: CỬA SỔ BUỔI HỌC */}
          <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#1e293b', color: '#ffffff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>TOAN10_A1 - Buổi học ngày 02/10/2026 (18:00 - 19:30 | Phòng 201)</span>
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>[X] Đóng</span>
            </div>

            {/* TAB CHUYỂN ĐỔI */}
            <div style={{ background: '#f1f5f9', padding: '8px 16px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ padding: '6px 12px', color: '#64748b', fontSize: '12.5px', fontWeight: 600 }}>
                1. Điểm danh chuyên cần (24)
              </div>
              {/* KHOANH TRÒN Ô ẤN */}
              <div
                style={{
                  position: 'relative',
                  border: '2px solid #dc2626',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  background: '#fef2f2',
                }}
              >
                <div style={{ padding: '4px 12px', background: '#ffffff', color: '#7c3aed', borderRadius: '14px', fontSize: '12.5px', fontWeight: 700, border: '1px solid #c4b5fd' }}>
                  2. Đánh giá 1-Chạm & AI Nhận xét
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '-11px',
                    right: '-8px',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  BẤM VÀO ĐÂY
                </span>
              </div>
            </div>

            {/* THANH THAO TÁC NHANH */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Đánh giá 1-chạm & sinh nhận xét cá nhân hóa bằng AI...</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* KHOANH TRÒN TẤT CẢ LỚP TỐT */}
                <div style={{ border: '2px dashed #059669', borderRadius: '6px', padding: '2px', background: '#ecfdf5' }}>
                  <button type="button" style={{ border: 'none', background: '#10b981', color: '#ffffff', padding: '5px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                    Tất cả lớp TỐT (Tự lưu)
                  </button>
                </div>
                <button type="button" style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', padding: '5px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                  Duyệt tất cả
                </button>
                <button type="button" style={{ border: 'none', background: '#6366f1', color: '#ffffff', padding: '5px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                  AI Viết Tất Cả (HS Có Mặt)
                </button>
              </div>
            </div>

            {/* BẢNG HỌC SINH */}
            <div style={{ overflowX: 'auto', padding: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 6px', textAlign: 'center', width: '40px' }}>STT</th>
                    <th style={{ padding: '8px', textAlign: 'left', width: '140px' }}>Học sinh</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '65px' }}>Điểm</th>
                    <th style={{ padding: '8px', textAlign: 'left', width: '250px' }}>ĐÁNH GIÁ 1-CHẠM</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>NHẬN XÉT BUỔI HỌC (AI / GIÁO VIÊN)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>1</td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Nguyễn Văn An</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>HS00124</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>
                      <input type="text" defaultValue="8.5" style={{ width: '45px', textAlign: 'center', padding: '3px', border: '1px solid #cbd5e1', borderRadius: '4px' }} readOnly />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                        <span style={{ border: '1px solid #10b981', background: '#ecfdf5', color: '#059669', fontSize: '10.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px' }}>
                          ✓ Tốt hết
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: 1.6 }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ width: '75px', color: '#64748b' }}>Chuyên cần:</span>
                          <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '1px 8px', borderRadius: '10px', border: '1px solid #86efac' }}>Yes</span>
                          <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '1px 8px', borderRadius: '10px' }}>No</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ width: '75px', color: '#64748b' }}>Làm BTVN:</span>
                          <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '1px 8px', borderRadius: '10px', border: '1px solid #86efac' }}>Yes</span>
                          <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '1px 8px', borderRadius: '10px' }}>No</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        {/* KHOANH TRÒN NÚT AI VIẾT */}
                        <div style={{ border: '2px solid #ef4444', borderRadius: '6px', padding: '1px', background: '#fef2f2' }}>
                          <button type="button" style={{ border: 'none', background: '#7c3aed', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                            AI Viết Nhận Xét
                          </button>
                        </div>
                        <span style={{ border: '1px solid #10b981', background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                          Đã duyệt
                        </span>
                      </div>
                      <textarea
                        defaultValue="An tiếp thu bài nhanh, làm bài tập đầy đủ và tích cực phát biểu xây dựng bài trong suốt buổi học."
                        rows={2}
                        readOnly
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', background: '#f8fafc', boxSizing: 'border-box' }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CHÂN TRANG CỬA SỔ */}
            <div style={{ background: '#f8fafc', padding: '10px 16px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                Xuất kết quả buổi học Excel
              </button>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button type="button" style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                  Đóng
                </button>
                <button type="button" style={{ border: '1px solid #7c3aed', background: '#ffffff', color: '#7c3aed', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                  Lưu tạm
                </button>
                {/* KHOANH TRÒN NÚT CHỐT */}
                <div style={{ border: '2px solid #dc2626', borderRadius: '6px', padding: '2px', background: '#fef2f2' }}>
                  <button type="button" style={{ border: 'none', background: '#10b981', color: '#ffffff', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Chốt điểm danh & Kết thúc
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px' }}>
            <h4 style={{ margin: '0 0 6px', color: '#166534', fontSize: '13.5px' }}>Các bước thao tác chuẩn:</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: '#1e293b', lineHeight: 1.6 }}>
              <li>Bấm vào <strong>2. Đánh giá 1-Chạm & AI Nhận xét</strong> để chuyển màn hình.</li>
              <li>Nếu cả lớp học tập tốt: Bấm ngay nút <strong>Tất cả lớp TỐT (Tự lưu)</strong> ở góc trên bên phải để xong ngay 4 tiêu chí.</li>
              <li>Tại cột nhận xét: Bấm <strong>AI Viết Nhận Xét</strong> để tự động sinh câu nhận xét đúng với thực tế của học sinh. Có thể gõ thêm sửa chữ trực tiếp.</li>
              <li>Cuối cùng bấm <strong>Chốt điểm danh & Kết thúc</strong> ở góc dưới để khóa buổi học. Dữ liệu sẽ lập tức được tổng hợp vào Báo cáo tuần/tháng.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: IN BÁO CÁO */}
      {subTab === 'print' && (
        <div>
          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>
              Quy trình mở và in báo cáo chất lượng học tập (A4 / PDF)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Vào menu <strong>Báo cáo tuần SQI</strong>. Chọn lớp và kỳ cần xem. Tại bảng danh sách học sinh, bấm nút <strong>Xem thiệp</strong> để mở phiếu cá nhân rồi bấm <strong>Xuất PDF / In A4</strong>.
            </p>
          </div>

          {/* MÔ PHỎNG BẢNG DANH SÁCH LỚP */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', background: '#ffffff' }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #cbd5e1', fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>
              Bảng báo cáo tuần & tháng - Lớp TOAN10_A1
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Học sinh</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Điểm SQI</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Xếp loại</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Chuyên cần</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 700 }}>Nguyễn Văn An</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Mã: HS00124</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#4f46e5' }}>92</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Xuất sắc</span>
                  </td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 600 }}>100%</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>Đã duyệt</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    {/* KHOANH TRÒN NÚT XEM THIỆP */}
                    <div style={{ display: 'inline-block', border: '2px solid #ef4444', borderRadius: '6px', padding: '2px', background: '#fef2f2' }}>
                      <button type="button" style={{ border: 'none', background: '#0284c7', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                        Xem thiệp
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* MÔ PHỎNG THIỆP BÁO CÁO CÁ NHÂN VÀ NÚT IN A4 */}
          <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            {/* THANH ĐẦU THIỆP */}
            <div style={{ background: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                Đã phê duyệt phát hành
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button type="button" style={{ border: '1px solid #cbd5e1', background: '#ffffff', padding: '5px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                  Lưu nhận xét
                </button>
                <button type="button" style={{ border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', padding: '5px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                  Lấy link & QR
                </button>
                {/* KHOANH TRÒN NÚT XUẤT PDF / IN A4 */}
                <div style={{ border: '2px solid #dc2626', borderRadius: '6px', padding: '2px', background: '#fef2f2' }}>
                  <button type="button" style={{ border: 'none', background: '#0f172a', color: '#ffffff', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                    Xuất PDF / In A4
                  </button>
                </div>
              </div>
            </div>

            {/* BẢNG MẪU BÁO CÁO A4 */}
            <div style={{ padding: '20px', background: '#ffffff' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>TRUNG TÂM GIÁO DỤC DAO EDU</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>PHIẾU ĐÁNH GIÁ CHẤT LƯỢNG HỌC TẬP</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Học sinh: <strong>Nguyễn Văn An</strong> (HS00124) | Lớp: <strong>TOAN10_A1</strong></div>
              </div>

              {/* KHUNG SQI */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', textAlign: 'center', marginBottom: '12px', background: '#f8fafc' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>CHỈ SỐ CHẤT LƯỢNG (SQI)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>92 <span style={{ fontSize: '11px', color: '#64748b' }}>/ 100</span></div>
                </div>
                <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>XẾP LOẠI HỌC SINH</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a', marginTop: '3px' }}>Xuất sắc</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>SO VỚI KỲ TRƯỚC</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>+4 điểm</div>
                </div>
              </div>

              {/* BẢNG 4 TIÊU CHÍ */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '5px 8px', textAlign: 'left', width: '35%' }}>Chỉ số đánh giá</th>
                    <th style={{ padding: '5px 8px', textAlign: 'center', width: '20%' }}>Điểm số</th>
                    <th style={{ padding: '5px 8px', textAlign: 'left' }}>Diễn giải</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '5px 8px', fontWeight: 600 }}>Điểm chuyên cần (30%)</td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>30 / 30</td>
                    <td style={{ padding: '5px 8px', color: '#334155' }}>4 buổi đúng giờ</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '5px 8px', fontWeight: 600 }}>Điểm bài tập (30%)</td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>28 / 30</td>
                    <td style={{ padding: '5px 8px', color: '#334155' }}>3 buổi làm tốt, 1 buổi làm thiếu ít</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '5px 8px', fontWeight: 600 }}>Điểm nội quy (20%)</td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>20 / 20</td>
                    <td style={{ padding: '5px 8px', color: '#334155' }}>4 buổi nề nếp tốt, nghiêm túc</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px', fontWeight: 600 }}>Điểm năng động (20%)</td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>14 / 20</td>
                    <td style={{ padding: '5px 8px', color: '#334155' }}>2 buổi hăng hái phát biểu, 2 buổi nghe giảng</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CÁCH TÍNH ĐIỂM CHỈ SỐ SQI */}
      {subTab === 'sqi' && (
        <div>
          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>
              Cách tính điểm chỉ số chất lượng học sinh SQI (Thang 100 điểm)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Điểm SQI = <strong>Điểm chuyên cần (30đ)</strong> + <strong>Điểm bài tập (30đ)</strong> + <strong>Điểm nội quy (20đ)</strong> + <strong>Điểm năng động (20đ)</strong>.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '8px', textAlign: 'left', width: '22%' }}>Tiêu chí</th>
                <th style={{ padding: '8px', textAlign: 'center', width: '12%' }}>Trọng số</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Quy tắc chấm & điểm quy đổi từng buổi</th>
                <th style={{ padding: '8px', textAlign: 'left', width: '28%' }}>Công thức tính</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', fontWeight: 700 }}>1. Chuyên cần</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>30 điểm (30%)</td>
                <td style={{ padding: '8px', lineHeight: 1.5 }}>
                  • Đúng giờ / Học bù: <strong>1.0 điểm</strong><br />
                  • Đi muộn / Về sớm: <strong>0.75 điểm</strong><br />
                  • Đi muộn nhiều (&gt;15p): <strong>0.4 điểm</strong><br />
                  • Nghỉ có phép: <strong>0.2 điểm</strong><br />
                  • Nghỉ không phép / Vắng mặt: <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '8px', color: '#334155' }}>
                  (Tổng điểm quy đổi chuyên cần ÷ Tổng số buổi học) × 30
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', fontWeight: 700 }}>2. Làm BTVN</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>30 điểm (30%)</td>
                <td style={{ padding: '8px', lineHeight: 1.5 }}>
                  • Làm đủ, làm tốt 100% (Yes): <strong>1.0 điểm</strong><br />
                  • Làm thiếu ít / Quên vở: <strong>0.7 điểm</strong><br />
                  • Làm chưa xong (&lt;50%): <strong>0.5 điểm</strong><br />
                  • Làm đối phó, sơ sài: <strong>0.4 điểm</strong><br />
                  • Làm thiếu nhiều: <strong>0.3 điểm</strong><br />
                  • Không làm (No): <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '8px', color: '#334155' }}>
                  (Tổng điểm quy đổi BTVN ÷ Số buổi có giao bài tập) × 30
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', fontWeight: 700 }}>3. Tuân thủ nội quy</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>20 điểm (20%)</td>
                <td style={{ padding: '8px', lineHeight: 1.5 }}>
                  • Nề nếp tốt, nghiêm túc (Yes): <strong>1.0 điểm</strong><br />
                  • Mất tập trung / Buồn ngủ / Thiếu sách: <strong>0.7 điểm</strong><br />
                  • Nói chuyện riêng: <strong>0.5 điểm</strong><br />
                  • Dùng điện thoại / Việc riêng: <strong>0.3 điểm</strong><br />
                  • Đùa nghịch, gián đoạn lớp: <strong>0.1 điểm</strong><br />
                  • Chưa nghiêm túc (No): <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '8px', color: '#334155' }}>
                  (Tổng điểm quy đổi nội quy ÷ Tổng số buổi học) × 20
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 700 }}>4. Năng động phát biểu</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>20 điểm (20%)</td>
                <td style={{ padding: '8px', lineHeight: 1.5 }}>
                  • Tích cực phát biểu / Hỏi bài (Yes): <strong>1.0 điểm</strong><br />
                  • Được gọi và trả lời tốt: <strong>0.8 điểm</strong><br />
                  • Chăm chú nghe nhưng ít nói: <strong>0.7 điểm</strong><br />
                  • Được gọi trả lời còn ấp úng: <strong>0.4 điểm</strong><br />
                  • Không tham gia / Gọi không đáp (No): <strong>0 điểm</strong>
                </td>
                <td style={{ padding: '8px', color: '#334155' }}>
                  (Tổng điểm quy đổi năng động ÷ Tổng số buổi học) × 20
                </td>
              </tr>
            </tbody>
          </table>

          {/* BẢNG XẾP LOẠI */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#0f172a' }}>Bảng xếp loại chất lượng theo tổng điểm SQI:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
              <div style={{ border: '1px solid #a7f3d0', background: '#ecfdf5', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#047857', fontWeight: 800, fontSize: '13px' }}>Xuất sắc</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>90 – 100 điểm</div>
              </div>
              <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#1d4ed8', fontWeight: 800, fontSize: '13px' }}>Giỏi</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>75 – 89 điểm</div>
              </div>
              <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#b45309', fontWeight: 800, fontSize: '13px' }}>Khá</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>60 – 74 điểm</div>
              </div>
              <div style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#c2410c', fontWeight: 800, fontSize: '13px' }}>Trung bình</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>45 – 59 điểm</div>
              </div>
              <div style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#b91c1c', fontWeight: 800, fontSize: '13px' }}>Cần cố gắng</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Dưới 45 điểm</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};