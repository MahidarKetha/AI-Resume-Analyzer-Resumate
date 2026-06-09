import { useState } from "react";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const CheckIcon = ({ color = "#22c55e" }) => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill={color + "22"} />
    <path d="M5 9l3 3 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const WarnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#f9731622" />
    <path d="M9 5v5" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="9" cy="13" r="1" fill="#f97316" />
  </svg>
);

const statusIcon = (s) => s === "pass" ? <CheckIcon /> : <WarnIcon />;

const badgeColor = (b = "") => {
  if (!b) return { bg: "#f3f4f6", color: "#6b7280" };
  const l = b.toLowerCase();
  if (l.includes("excellent") || l.includes("strong")) return { bg: "#dcfce7", color: "#16a34a" };
  if (l.includes("good")) return { bg: "#fef9c3", color: "#ca8a04" };
  return { bg: "#fee2e2", color: "#dc2626" };
};

const scoreColor = (n) => {
  if (n >= 70) return "#16a34a";
  if (n >= 40) return "#f97316";
  return "#dc2626";
};

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score = 0 }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <svg width="138" height="138" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2f7f7" strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="26" fontWeight="700" fill={color}>{score}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="14" fill="#64748b">/100</text>
    </svg>
  );
}

// ── Expandable section ────────────────────────────────────────────────────────
function Section({ title, score, badge, summaryChecks, details, checklist }) {
  const [open, setOpen] = useState(false);
  const bc = badgeColor(badge);

  return (
    <div style={{ borderTop: "1px solid rgba(180,220,220,0.4)", padding: "0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "700", fontSize: "1.08rem", color: "#1e293b" }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: "0.78rem", fontWeight: "700", padding: "3px 10px",
              borderRadius: "20px", background: bc.bg, color: bc.color,
            }}>{badge}</span>
          )}
          {score !== undefined && (
            <span style={{ fontSize: "0.92rem", color: scoreColor(score), fontWeight: "700" }}>
              ⊙ {score}/100
            </span>
          )}
        </div>
        <span style={{ fontSize: "1.2rem", color: "#64748b" }}>{open ? "∧" : "∨"}</span>
      </button>

      {open && (
        <div style={{ paddingBottom: "26px" }}>
          {/* checklist mode */}
          {checklist && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {checklist.map((item, i) => (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked={item.checked}
                    style={{ marginTop: "2px", accentColor: "#38b2ac", width: "17px", height: "17px" }} />
                  <span style={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.6 }}>{item.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* normal section mode */}
          {summaryChecks && (
            <>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
                background: "rgba(200,240,240,0.35)", borderRadius: "12px",
                padding: "16px", marginBottom: "18px",
              }}>
                {summaryChecks.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {statusIcon(c.status)}
                    <span style={{ fontSize: "0.92rem", color: "#334155" }}>{c.label}</span>
                  </div>
                ))}
              </div>

              {details && details.map((d, i) => (
                <div key={i} style={{
                  border: `1.5px solid ${d.status === "pass" ? "#bbf7d0" : "#fed7aa"}`,
                  borderRadius: "12px", padding: "18px", marginBottom: "12px",
                  background: d.status === "pass" ? "#f0fdf4" : "#fff7ed",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    {statusIcon(d.status)}
                    <span style={{
                      fontWeight: "700", fontSize: "0.95rem",
                      color: d.status === "pass" ? "#15803d" : "#c2410c",
                    }}>{d.title}</span>
                  </div>
                  {d.description && (
                    <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 6px 28px", lineHeight: 1.6 }}>
                      {d.description}
                    </p>
                  )}
                  {d.bullets && d.bullets.length > 0 && (
                    <ul style={{ margin: "6px 0 0 28px", paddingLeft: "12px" }}>
                      {d.bullets.map((b, j) => (
                        <li key={j} style={{ fontSize: "0.9rem", color: "#92400e", marginBottom: "4px" }}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {d.skill_tags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px", marginLeft: "28px" }}>
                      {d.skill_tags.map((t, j) => (
                        <span key={j} style={{
                          fontSize: "0.82rem", padding: "4px 12px", borderRadius: "20px",
                          background: "#e0f2fe", color: "#0369a1", fontWeight: "600",
                        }}>✓ {t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewPage({ data, onBack }) {
  if (!data) return null;
  const { overall_score, issues_count, ats_scan,
    tone_and_style, content, structure, skills, checklist } = data;

  const subScores = [
    { key: "Tone & Style", score: tone_and_style?.score, badge: tone_and_style?.badge },
    { key: "Content",      score: content?.score,        badge: content?.badge },
    { key: "Structure",    score: structure?.score,      badge: structure?.badge },
    { key: "Skills",       score: skills?.score,         badge: skills?.badge },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(160deg, #c8eef0 0%, #b2e8ea 40%, #a8e6e8 70%, #c2eff0 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      boxSizing: "border-box",
    }}>
      {/* nav */}
      <nav style={{
        display: "flex", alignItems: "center", padding: "16px 36px",
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(180,220,220,0.4)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#0d9488", fontWeight: "700", fontSize: "1rem",
          display: "flex", alignItems: "center", gap: "6px",
        }}>← Back to homepage</button>
        <span style={{ margin: "0 10px", color: "#94a3b8" }}>›</span>
        <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Resume Review</span>
      </nav>

      {/* body */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "44px 24px 80px" }}>

        <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "30px" }}>
          Resume Review
        </h1>

        {/* score card */}
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)",
          borderRadius: "22px", padding: "30px 34px", marginBottom: "22px",
          boxShadow: "0 4px 28px rgba(0,150,150,0.10)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "26px", marginBottom: "26px" }}>
            <ScoreRing score={overall_score} />
            <div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: "700", margin: "0 0 8px", color: "#0f172a" }}>
                Your Resume Score
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "0 0 8px" }}>
                This score is calculated based on the variables listed below.
              </p>
              {issues_count > 0 && (
                <span style={{ fontSize: "0.88rem", color: "#f97316" }}>⚠ {issues_count} issues found</span>
              )}
            </div>
          </div>

          {subScores.map((s) => {
            const bc = badgeColor(s.badge);
            return (
              <div key={s.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0", borderTop: "1px solid rgba(180,220,220,0.4)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: "600", fontSize: "1rem", color: "#1e293b", minWidth: "100px" }}>{s.key}</span>
                  {s.badge && (
                    <span style={{
                      fontSize: "0.78rem", fontWeight: "700", padding: "3px 10px",
                      borderRadius: "20px", background: bc.bg, color: bc.color,
                    }}>{s.badge}</span>
                  )}
                </div>
                <span style={{ fontWeight: "700", fontSize: "1rem", color: scoreColor(s.score) }}>{s.score}/100</span>
              </div>
            );
          })}
        </div>

        {/* ATS scan card */}
        {ats_scan && (
          <div style={{
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)",
            borderRadius: "22px", padding: "26px 30px", marginBottom: "22px",
            boxShadow: "0 4px 28px rgba(0,150,150,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg,#0d9488,#38b2ac)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckIcon color="#fff" />
              </div>
              <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#0f172a" }}>
                ATS Score – {ats_scan.score}/100
              </span>
            </div>
            <p style={{ fontWeight: "600", color: "#334155", marginBottom: "8px", fontSize: "1rem" }}>
              How well does your resume pass through Applicant Tracking Systems?
            </p>
            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "16px" }}>
              Your resume was scanned like an employer would. Here's how it performed:
            </p>
            {ats_scan.checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                {statusIcon(c.status)}
                <span style={{ fontSize: "0.93rem", color: "#475569" }}>{c.label}</span>
              </div>
            ))}
            <p style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "14px" }}>
              Want a better score? Improve your resume by applying the suggestions listed below.
            </p>
          </div>
        )}

        {/* expandable sections */}
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)",
          borderRadius: "22px", padding: "4px 30px",
          boxShadow: "0 4px 28px rgba(0,150,150,0.10)",
        }}>
          <Section title="Tone & Style" score={tone_and_style?.score} badge={tone_and_style?.badge}
            summaryChecks={tone_and_style?.summary_checks} details={tone_and_style?.details} />
          <Section title="Content" score={content?.score} badge={content?.badge}
            summaryChecks={content?.summary_checks} details={content?.details} />
          <Section title="Structure" score={structure?.score} badge={structure?.badge}
            summaryChecks={structure?.summary_checks} details={structure?.details} />
          <Section title="Skills" score={skills?.score} badge={skills?.badge}
            summaryChecks={skills?.summary_checks} details={skills?.details} />
          <Section title="Resume Improvement Checklist" checklist={checklist} />
        </div>
      </div>
    </div>
  );
}