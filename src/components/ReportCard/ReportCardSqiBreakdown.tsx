import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SqiBreakdown } from '../../services/weekly-report.service';

interface ReportCardSqiBreakdownProps {
  sqiScore?: number | null;
  sqiDelta?: number | null;
  sqiBreakdown?: SqiBreakdown;
  overview?: string;
  isMonthly?: boolean;
  sessions?: any[];
}

export const ReportCardSqiBreakdown: React.FC<ReportCardSqiBreakdownProps> = ({
  sqiScore,
  sqiDelta,
  sqiBreakdown,
  isMonthly,
  sessions = [],
}) => {
  const getLevelColor = (score?: number | null) => {
    if (score === null || score === undefined) return { color: '#64748b', label: 'Chưa có dữ liệu' };
    if (score >= 90) return { color: '#16a34a', label: 'Xuất sắc' };
    if (score >= 75) return { color: '#2563eb', label: 'Giỏi' };
    if (score >= 60) return { color: '#d97706', label: 'Khá' };
    if (score >= 45) return { color: '#ea580c', label: 'Trung bình' };
    return { color: '#dc2626', label: 'Cần cố gắng' };
  };

  const level = getLevelColor(sqiScore);

  const getNarrative = (type: 'attendance' | 'homework' | 'behavior' | 'participation'): string => {
    if (sqiBreakdown?.narratives?.[type]) {
      return sqiBreakdown.narratives[type]!;
    }
    if (!sessions || sessions.length === 0) {
      if (type === 'attendance') return sqiBreakdown?.attendance !== null && sqiBreakdown?.attendance !== undefined ? `${sqiBreakdown.attendance}/30đ` : 'Chưa có dữ liệu';
      if (type === 'homework') return sqiBreakdown?.homework !== null && sqiBreakdown?.homework !== undefined ? `${sqiBreakdown.homework}/30đ` : 'Chưa có dữ liệu';
      if (type === 'behavior') return sqiBreakdown?.behavior !== null && sqiBreakdown?.behavior !== undefined ? `${sqiBreakdown.behavior}/20đ` : 'Chưa có dữ liệu';
      if (type === 'participation') return sqiBreakdown?.participation !== null && sqiBreakdown?.participation !== undefined ? `${sqiBreakdown.participation}/20đ` : 'Chưa có dữ liệu';
      return 'Chưa có dữ liệu';
    }

    if (type === 'attendance') {
      const counts: Record<string, number> = {};
      for (const s of sessions) {
        const st = (s.attendanceStatus || '').toLowerCase();
        let lbl = 'buổi đúng giờ';
        if (st === 'yes') lbl = 'buổi đúng giờ';
        else if (st === 'no') lbl = 'buổi vắng mặt';
        else if (st === 'makeup') lbl = 'buổi học bù';
        else if (st === 'late' || (s.isPresent && s.isLate)) lbl = 'buổi đi muộn';
        else if (st === 'early_leave') lbl = 'buổi về sớm';
        else if (st === 'late_much') lbl = 'buổi đi muộn nhiều';
        else if (st === 'absent_excused') lbl = 'buổi vắng có phép';
        else if (st === 'absent_unexcused' || !s.isPresent) lbl = 'buổi vắng không phép';
        counts[lbl] = (counts[lbl] || 0) + 1;
      }
      return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') || 'Chưa có dữ liệu';
    }

    if (type === 'homework') {
      const counts: Record<string, number> = {};
      const valid = sessions.filter(s => {
        const st = (s.homeworkStatus || '').toLowerCase();
        return st && st !== 'no_homework' && st !== 'none';
      });
      if (valid.length === 0) return 'Không giao BTVN';
      for (const s of valid) {
        const st = (s.homeworkStatus || '').toLowerCase();
        let lbl = 'buổi đã làm BTVN';
        if (st === 'yes') lbl = 'buổi đã làm BTVN';
        else if (st === 'no') lbl = 'buổi chưa làm';
        else if (st === 'excellent') lbl = 'buổi làm tốt 100%';
        else if (st === 'done' || st === 'completed') lbl = 'buổi đã làm';
        else if (st === 'missing_few') lbl = 'buổi làm thiếu ít';
        else if (st === 'forgot_notebook') lbl = 'buổi quên mang vở';
        else if (st === 'coping') lbl = 'buổi làm đối phó/sơ sài';
        else if (st === 'missing_many' || st === 'incomplete') lbl = 'buổi làm thiếu nhiều';
        else if (st === 'not_done' || st === 'missing') lbl = 'buổi chưa làm';
        counts[lbl] = (counts[lbl] || 0) + 1;
      }
      return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
    }

    if (type === 'behavior') {
      const counts: Record<string, number> = {};
      const valid = sessions.filter(s => (s.behaviorTags && s.behaviorTags.length > 0) || s.behaviorStatus);
      if (valid.length === 0) return 'Duy trì nề nếp tốt, nghiêm túc';
      for (const s of valid) {
        const tags = (s.behaviorTags || []).map((t: any) => String(t).toLowerCase());
        const st = (s.behaviorStatus || tags[0] || '').toLowerCase();
        let lbl = 'buổi tốt/nghiêm túc';
        if (st === 'yes') lbl = 'buổi tốt/nghiêm túc';
        else if (st === 'no') lbl = 'buổi chưa nghiêm túc';
        else if (st === 'disruptive' || tags.includes('disruptive')) lbl = 'buổi đùa trong lớp';
        else if (st === 'phone_private' || st === 'phone' || tags.includes('phone') || tags.includes('phone_private')) lbl = 'buổi dùng điện thoại/việc riêng';
        else if (st === 'talkative' || tags.includes('talkative')) lbl = 'buổi hay nói chuyện';
        else if (st === 'sleepy' || tags.includes('sleepy')) lbl = 'buổi buồn ngủ/mệt mỏi';
        else if (st === 'missing_tools' || tags.includes('missing_tools')) lbl = 'buổi thiếu sách vở';
        else if (st === 'unfocused' || tags.includes('unfocused') || tags.includes('distracted')) lbl = 'buổi mất tập trung';
        counts[lbl] = (counts[lbl] || 0) + 1;
      }
      return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
    }

    if (type === 'participation') {
      const counts: Record<string, number> = {};
      const valid = sessions.filter(s => s.participation);
      if (valid.length === 0) return 'Tham gia học tập đầy đủ';
      for (const s of valid) {
        const st = String(s.participation).toLowerCase();
        let lbl = 'buổi chăm chú nhưng ít nói';
        if (st === 'yes') lbl = 'buổi tích cực phát biểu';
        else if (st === 'no') lbl = 'buổi chưa phát biểu';
        else if (st === 'active_raise_hand' || st === 'active') lbl = 'buổi chủ động giơ tay';
        else if (st === 'proactive_ask') lbl = 'buổi chủ động hỏi bài';
        else if (st === 'answer_well') lbl = 'buổi gọi trả lời được';
        else if (st === 'attentive_quiet' || st === 'normal') lbl = 'buổi chăm chú nhưng ít nói';
        else if (st === 'answer_hesitant') lbl = 'buổi gọi còn ấp úng';
        else if (st === 'cannot_answer' || st === 'passive') lbl = 'buổi gọi không trả lời được';
        counts[lbl] = (counts[lbl] || 0) + 1;
      }
      return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
    }

    return 'Đang cập nhật';
  };

  const getCriteriaScore = (type: 'attendance' | 'homework' | 'behavior' | 'participation', max: number) => {
    let sc: number | null | undefined = sqiBreakdown?.[type];
    if (sc === null || sc === undefined) {
      if (sessions && sessions.length > 0) {
        if (type === 'attendance') {
          let p = 0;
          for (const s of sessions) {
            const st = (s.attendanceStatus || '').toLowerCase();
            if (st === 'yes' || st === 'on_time' || st === 'makeup') p += 1.0;
            else if (st === 'late' || st === 'early_leave') p += 0.75;
            else if (st === 'late_much') p += 0.4;
            else if (st === 'absent_excused') p += 0.2;
            else if (s.isPresent) p += s.isLate ? 0.75 : 1.0;
          }
          sc = Math.round((p / sessions.length) * 30 * 10) / 10;
        } else if (type === 'homework') {
          const hwSessions = sessions.filter(s => {
            const st = String(s.homeworkStatus || '').toLowerCase();
            return st && st !== 'no_homework' && st !== 'none';
          });
          if (hwSessions.length > 0) {
            let p = 0;
            for (const s of hwSessions) {
              const st = String(s.homeworkStatus || '').toLowerCase();
              if (st === 'yes' || st === 'excellent' || st === 'completed' || st === 'done') p += 1.0;
              else if (st === 'missing_few' || st === 'forgot_notebook') p += 0.7;
              else if (st === 'incomplete') p += 0.5;
              else if (st === 'coping') p += 0.4;
              else if (st === 'missing_many') p += 0.3;
            }
            sc = Math.round((p / hwSessions.length) * 30 * 10) / 10;
          }
        } else if (type === 'behavior') {
          const behSessions = sessions.filter(s => (s.behaviorTags && s.behaviorTags.length > 0) || s.behaviorStatus);
          if (behSessions.length > 0) {
            let p = 0;
            for (const s of behSessions) {
              const tags = (s.behaviorTags || []).map((t: any) => String(t).toLowerCase());
              const st = String(s.behaviorStatus || tags[0] || '').toLowerCase();
              if (st === 'yes' || st === 'good') p += 1.0;
              else if (st === 'no') p += 0.0;
              else if (st === 'disruptive') p += 0.1;
              else if (st === 'phone_private') p += 0.3;
              else if (st === 'talkative') p += 0.5;
              else if (['unfocused', 'sleepy', 'missing_tools'].includes(st)) p += 0.7;
              else {
                const hasVio = tags.some((t: string) => ['disruptive', 'phone', 'talkative', 'sleepy', 'distracted'].includes(t));
                p += hasVio ? 0.3 : 1.0;
              }
            }
            sc = Math.round((p / behSessions.length) * 20 * 10) / 10;
          }
        } else if (type === 'participation') {
          const partSessions = sessions.filter(s => s.participation);
          if (partSessions.length > 0) {
            let p = 0;
            for (const s of partSessions) {
              const pst = String(s.participation).toLowerCase();
              if (pst === 'yes' || pst === 'active_raise_hand' || pst === 'active' || pst === 'proactive_ask') p += 1.0;
              else if (pst === 'answer_well') p += 0.8;
              else if (pst === 'attentive_quiet' || pst === 'normal') p += 0.7;
              else if (pst === 'answer_hesitant') p += 0.4;
              else p += 0.0;
            }
            sc = Math.round((p / partSessions.length) * 20 * 10) / 10;
          }
        }
      }
    }

    if (sc === null || sc === undefined) return <span style={{ color: '#94a3b8' }}>—</span>;
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        <strong style={{ color: '#0f172a', fontSize: '12px' }}>{sc}</strong>
        <span style={{ color: '#64748b', fontSize: '10.5px', fontWeight: 500 }}> / {max}</span>
      </span>
    );
  };

  return (
    <div style={{ marginBottom: 10 }}>
      {/* SQI HERO BAR - CĂN ĐỀU 3 CỘT */}
      <div
        className="report-sqi-hero"
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '10px 12px',
          background: '#ffffff',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            alignItems: 'center',
            gap: 12,
            width: '100%',
          }}
        >
          {/* CỘT 1: CHỈ SỐ CHẤT LƯỢNG (SQI) */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Chỉ số chất lượng (SQI)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: 2 }}>
              {sqiScore !== null && sqiScore !== undefined ? sqiScore : '—'}{' '}
              <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/ 100</span>
            </div>
          </div>

          {/* CỘT 2: XẾP LOẠI HỌC SINH (KHÔNG PHẢI HỌC LỰC) */}
          <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '0 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Xếp loại học sinh
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: level.color, marginTop: 4 }}>
              {level.label}
            </div>
          </div>

          {/* CỘT 3: SO VỚI TUẦN/THÁNG TRƯỚC */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              {isMonthly ? 'So với tháng trước' : 'So với tuần trước'}
            </div>
            <div style={{ marginTop: 4 }}>
              {sqiDelta !== undefined && sqiDelta !== null ? (
                sqiDelta > 0 ? (
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <TrendingUp size={14} /> +{sqiDelta} điểm
                  </span>
                ) : sqiDelta < 0 ? (
                  <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <TrendingDown size={14} /> {sqiDelta} điểm
                  </span>
                ) : (
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Minus size={14} /> Duy trì ổn định
                  </span>
                )
              ) : (
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Chưa có dữ liệu</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 FACTOR TABLE (CHI TIẾT CẢ ĐỢT CÓ CỘT ĐIỂM SỐ & DIỄN GIẢI NỘI DUNG) */}
      {(sqiBreakdown || (sessions && sessions.length > 0)) && (
        <div className="report-sqi-table-container" style={{ marginBottom: 6 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: '11.5px',
              background: '#ffffff',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '6px 4px', color: '#475569', fontWeight: 700, fontSize: 11 }}>STT</th>
                <th style={{ width: '230px', textAlign: 'left', padding: '6px 10px', color: '#475569', fontWeight: 700, fontSize: 11 }}>Chỉ số đánh giá</th>
                <th style={{ width: '90px', textAlign: 'center', padding: '6px 8px', color: '#475569', fontWeight: 700, fontSize: 11 }}>Điểm số</th>
                <th style={{ textAlign: 'left', padding: '6px 10px', color: '#475569', fontWeight: 700, fontSize: 11 }}>Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Điểm chuyên cần */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b', fontWeight: 600 }}>1</td>
                <td style={{ padding: '6px 10px' }}>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 11.5 }}>Điểm chuyên cần (30%)</div>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 400, marginTop: 1 }}>(đủ buổi, đúng giờ)</div>
                </td>
                <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                  {getCriteriaScore('attendance', 30)}
                </td>
                <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                  {getNarrative('attendance')}
                </td>
              </tr>

              {/* 2. Điểm bài tập */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b', fontWeight: 600 }}>2</td>
                <td style={{ padding: '6px 10px' }}>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 11.5 }}>Điểm bài tập (30%)</div>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 400, marginTop: 1 }}>(hoàn thành bài tập về nhà)</div>
                </td>
                <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                  {getCriteriaScore('homework', 30)}
                </td>
                <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                  {getNarrative('homework')}
                </td>
              </tr>

              {/* 3. Điểm nội quy */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b', fontWeight: 600 }}>3</td>
                <td style={{ padding: '6px 10px' }}>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 11.5 }}>Điểm nội quy (20%)</div>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 400, marginTop: 1 }}>(tuân thủ nội quy trong lớp học)</div>
                </td>
                <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                  {getCriteriaScore('behavior', 20)}
                </td>
                <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                  {getNarrative('behavior')}
                </td>
              </tr>

              {/* 4. Điểm năng động */}
              <tr>
                <td style={{ textAlign: 'center', padding: '6px 4px', color: '#64748b', fontWeight: 600 }}>4</td>
                <td style={{ padding: '6px 10px' }}>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 11.5 }}>Điểm năng động (20%)</div>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 400, marginTop: 1 }}>(tham gia phát biểu, hỏi bài thầy cô giáo)</div>
                </td>
                <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                  {getCriteriaScore('participation', 20)}
                </td>
                <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                  {getNarrative('participation')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
