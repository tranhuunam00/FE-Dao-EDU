import React from "react";

interface SessionData {
  classSessionId: string;
  className?: string;
  subjectName: string;
  date?: string;
  isPresent: boolean;
  isLate?: boolean;
  attendanceStatus?: string;
  score?: string | null;
}

interface ReportCardChartsProps {
  sqiScore?: number | null;
  sqiBreakdown?: {
    attendance?: number | null;
    homework?: number | null;
    behavior?: number | null;
    participation?: number | null;
  };
  sessions?: SessionData[];
  isMonthly?: boolean;
}

const CHART_COLORS = {
  sqi: "#4f46e5",
  sqiFill: "rgba(79,70,229,0.10)",
  attendance: "#0ea5e9",
  homework: "#10b981",
  behavior: "#f59e0b",
  participation: "#8b5cf6",
  gridLine: "#f1f5f9",
  axisLine: "#cbd5e1",
  label: "#64748b",
  subjects: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#ec4899"],
};

const fmtDateShort = (dStr?: string): string => {
  if (!dStr) return "";
  const parts = dStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dStr;
};

interface SqiBreakdownChartProps {
  sqiScore?: number | null;
  attendance?: number | null;
  homework?: number | null;
  behavior?: number | null;
  participation?: number | null;
}

const SqiBreakdownChart: React.FC<SqiBreakdownChartProps> = ({
  sqiScore,
  attendance,
  homework,
  behavior,
  participation,
}) => {
  const bars = [
    { label: "Chuyên cần", value: attendance, max: 30, color: CHART_COLORS.attendance },
    { label: "Bài tập", value: homework, max: 30, color: CHART_COLORS.homework },
    { label: "Nội quy", value: behavior, max: 20, color: CHART_COLORS.behavior },
    { label: "Phát biểu", value: participation, max: 20, color: CHART_COLORS.participation },
  ];

  const hasBreakdown = bars.some((b) => b.value !== null && b.value !== undefined);

  const W = 340; const H = 130;
  const padL = 68; const padR = 14; const padT = 16; const padB = 32;
  const chartW = W - padL - padR; const chartH = H - padT - padB;
  const barGap = 10;
  const barW = (chartW - barGap * (bars.length - 1)) / bars.length;

  return (
    <div style={{ flex: "1 1 300px", minWidth: 260 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
        Điểm SQI{sqiScore != null ? ` · ${sqiScore}/100` : ""} — Chi tiết chỉ số
      </div>
      {!hasBreakdown ? (
        <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12, background: "#f8fafc", borderRadius: 6, border: "1px dashed #e2e8f0" }}>
          Chưa có dữ liệu SQI
        </div>
      ) : (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = padT + chartH - (pct / 100) * chartH;
            return (
              <g key={pct}>
                <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke={CHART_COLORS.gridLine} strokeWidth={1} />
                <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill={CHART_COLORS.label}>{pct}%</text>
              </g>
            );
          })}
          {bars.map((bar, i) => {
            const ratio = bar.value != null ? Math.min(bar.value / bar.max, 1) : 0;
            const hasVal = bar.value != null;
            const bH = hasVal ? Math.max(ratio * chartH, 2) : 0;
            const bX = padL + i * (barW + barGap);
            const bY = padT + chartH - bH;
            const pct = hasVal ? Math.round((bar.value! / bar.max) * 100) : null;
            return (
              <g key={bar.label}>
                <rect x={bX} y={padT} width={barW} height={chartH} fill="#f1f5f9" rx={3} />
                {hasVal && <rect x={bX} y={bY} width={barW} height={bH} fill={bar.color} rx={3} opacity={0.85} />}
                {hasVal && <text x={bX + barW / 2} y={bY - 3} textAnchor="middle" fontSize={9} fontWeight={700} fill={bar.color}>{bar.value}</text>}
                {hasVal && bH > 18 && <text x={bX + barW / 2} y={bY + bH / 2 + 4} textAnchor="middle" fontSize={8} fill="#ffffff" fontWeight={600}>{pct}%</text>}
                <text x={bX + barW / 2} y={padT + chartH + 13} textAnchor="middle" fontSize={9} fill={CHART_COLORS.label} fontWeight={600}>{bar.label}</text>
                <text x={bX + barW / 2} y={padT + chartH + 23} textAnchor="middle" fontSize={8} fill="#94a3b8">/{bar.max}đ</text>
              </g>
            );
          })}
          {sqiScore != null && (
            <>
              <line x1={padL} y1={padT + chartH - (sqiScore / 100) * chartH} x2={padL + chartW} y2={padT + chartH - (sqiScore / 100) * chartH} stroke={CHART_COLORS.sqi} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
              <text x={padL + chartW + 4} y={padT + chartH - (sqiScore / 100) * chartH + 4} fontSize={8.5} fill={CHART_COLORS.sqi} fontWeight={700}>SQI</text>
            </>
          )}
        </svg>
      )}
    </div>
  );
};

interface SubjectScoreChartProps {
  sessions?: SessionData[];
  isMonthly?: boolean;
}

const SubjectScoreChart: React.FC<SubjectScoreChartProps> = ({ sessions = [] }) => {
  const subjectMap: Record<string, number[]> = {};
  for (const s of sessions) {
    if (!s.score) continue;
    const num = Number(String(s.score).replace(",", "."));
    if (isNaN(num)) continue;
    const key = s.subjectName || "Chung";
    if (!subjectMap[key]) subjectMap[key] = [];
    subjectMap[key].push(num);
  }

  const subjects = Object.keys(subjectMap);
  const hasData = subjects.length > 0;
  const useLine = subjects.length === 1;

  const W = 340; const H = 130;
  const padL = 34; const padR = 14; const padT = 16; const padB = 38;
  const chartW = W - padL - padR; const chartH = H - padT - padB;

  if (!hasData) {
    return (
      <div style={{ flex: "1 1 300px", minWidth: 260 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Điểm kiểm tra các môn</div>
        <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12, background: "#f8fafc", borderRadius: 6, border: "1px dashed #e2e8f0" }}>Chưa có điểm kiểm tra</div>
      </div>
    );
  }

  if (!useLine) {
    const avgBySubject = subjects.map((s) => {
      const scores = subjectMap[s];
      return { label: s, avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10, count: scores.length };
    });
    const barGap = 8;
    const barW = Math.min(48, (chartW - barGap * (avgBySubject.length - 1)) / avgBySubject.length);
    const totalBarsW = avgBySubject.length * barW + (avgBySubject.length - 1) * barGap;
    const startX = padL + (chartW - totalBarsW) / 2;

    return (
      <div style={{ flex: "1 1 300px", minWidth: 260 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Điểm kiểm tra trung bình theo môn</div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
          {[0, 2.5, 5, 7.5, 10].map((v) => {
            const y = padT + chartH - (v / 10) * chartH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke={CHART_COLORS.gridLine} strokeWidth={1} />
                <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={CHART_COLORS.label}>{v}</text>
              </g>
            );
          })}
          {avgBySubject.map((item, i) => {
            const ratio = Math.min(item.avg / 10, 1);
            const bH = Math.max(ratio * chartH, 2);
            const bX = startX + i * (barW + barGap);
            const bY = padT + chartH - bH;
            const color = CHART_COLORS.subjects[i % CHART_COLORS.subjects.length];
            const lbl = item.label.length > 9 ? item.label.slice(0, 8) + "…" : item.label;
            return (
              <g key={item.label}>
                <rect x={bX} y={padT} width={barW} height={chartH} fill="#f1f5f9" rx={3} />
                <rect x={bX} y={bY} width={barW} height={bH} fill={color} rx={3} opacity={0.85} />
                <text x={bX + barW / 2} y={bY - 3} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>{item.avg}</text>
                {bH > 18 && <text x={bX + barW / 2} y={bY + bH / 2 + 4} textAnchor="middle" fontSize={7.5} fill="#ffffff" fontWeight={600}>{item.count} buổi</text>}
                <text x={bX + barW / 2} y={padT + chartH + 13} textAnchor="middle" fontSize={9} fill={CHART_COLORS.label} fontWeight={600}>{lbl}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Line chart cho 1 môn
  const subjectName = subjects[0];
  const scoreSessions = sessions
    .filter((s) => s.subjectName === subjectName && s.score)
    .map((s, i) => ({ label: fmtDateShort(s.date) || `B${i + 1}`, value: Number(String(s.score).replace(",", ".")) }))
    .filter((p) => !isNaN(p.value));

  if (scoreSessions.length < 2) {
    const avg = scoreSessions.length === 1 ? scoreSessions[0].value : null;
    return (
      <div style={{ flex: "1 1 300px", minWidth: 260 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Điểm kiểm tra — {subjectName}</div>
        <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: CHART_COLORS.sqi, fontSize: 28, fontWeight: 800 }}>
          {avg !== null ? avg : "—"}
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>/ 10</span>
        </div>
      </div>
    );
  }

  const minV = Math.min(...scoreSessions.map((p) => p.value));
  const maxV = Math.max(...scoreSessions.map((p) => p.value));
  const rangeV = maxV - minV || 2;
  const padVert = rangeV * 0.2;
  const domainMin = Math.max(0, minV - padVert);
  const domainMax = Math.min(10, maxV + padVert);
  const domainRange = domainMax - domainMin || 1;
  const xStep = scoreSessions.length > 1 ? chartW / (scoreSessions.length - 1) : chartW;
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + chartH - ((v - domainMin) / domainRange) * chartH;

  const pathD = scoreSessions.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.value).toFixed(1)}`).join(" ");
  const areaD = `M ${toX(0).toFixed(1)} ${toY(scoreSessions[0].value).toFixed(1)} ` + scoreSessions.slice(1).map((p, i) => `L ${toX(i + 1).toFixed(1)} ${toY(p.value).toFixed(1)}`).join(" ") + ` L ${toX(scoreSessions.length - 1).toFixed(1)} ${(padT + chartH).toFixed(1)} L ${toX(0).toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

  return (
    <div style={{ flex: "1 1 300px", minWidth: 260 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Điểm kiểm tra — {subjectName}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
        {[0, 2.5, 5, 7.5, 10].map((v) => {
          if (v < domainMin - 0.5 || v > domainMax + 0.5) return null;
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke={CHART_COLORS.gridLine} strokeWidth={1} />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={CHART_COLORS.label}>{v}</text>
            </g>
          );
        })}
        <path d={areaD} fill={CHART_COLORS.sqiFill} />
        <path d={pathD} fill="none" stroke={CHART_COLORS.sqi} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {scoreSessions.map((p, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(p.value)} r={4} fill={CHART_COLORS.sqi} stroke="#ffffff" strokeWidth={1.5} />
            <text x={toX(i)} y={toY(p.value) - 7} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={CHART_COLORS.sqi}>{p.value}</text>
            <text x={toX(i)} y={padT + chartH + 13} textAnchor="middle" fontSize={8} fill={CHART_COLORS.label}>{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const ReportCardCharts: React.FC<ReportCardChartsProps> = ({
  sqiScore,
  sqiBreakdown,
  sessions = [],
  isMonthly = false,
}) => {
  const hasSqi = sqiScore != null || (sqiBreakdown && Object.values(sqiBreakdown).some((v) => v != null));
  const hasScores = sessions.some((s) => s.score);

  if (!hasSqi && !hasScores) return null;

  return (
    <div style={{ margin: "8px 0", padding: "10px 12px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
        📊 Biểu đồ phân tích — {isMonthly ? "Tháng" : "Tuần"}
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        {hasSqi && (
          <SqiBreakdownChart
            sqiScore={sqiScore}
            attendance={sqiBreakdown?.attendance}
            homework={sqiBreakdown?.homework}
            behavior={sqiBreakdown?.behavior}
            participation={sqiBreakdown?.participation}
          />
        )}
        {hasScores && <SubjectScoreChart sessions={sessions} isMonthly={isMonthly} />}
      </div>
    </div>
  );
};
