import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0a0f",
  surface: "#111118",
  card: "#16161f",
  border: "#2a2a3a",
  accent: "#00e5ff",
  accent2: "#7c3aed",
  accent3: "#f59e0b",
  text: "#e8e8f0",
  muted: "#6b6b80",
  success: "#10b981",
  danger: "#ef4444",
  warn: "#f59e0b",
};

const ROLES = [
  "Frontend Engineer", "Backend Engineer", "Full Stack Developer",
  "Data Scientist", "ML Engineer", "DevOps / SRE",
  "Product Manager", "UX Designer", "Cloud Architect",
  "Cybersecurity Analyst", "Mobile Developer", "Blockchain Developer"
];

const LEVELS = ["Junior", "Mid-level", "Senior", "Staff / Principal", "Director / VP"];

function RadarChart({ skills }) {
  if (!skills || skills.length === 0) return null;
  const cx = 150, cy = 150, r = 110;
  const n = skills.length;
  const pts = (vals) => vals.map((v, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rad = (v / 10) * r;
    return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)];
  });
  const labels = skills.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rad = r + 22;
    return { x: cx + rad * Math.cos(angle), y: cy + rad * Math.sin(angle), name: s.name };
  });
  const gridLevels = [2, 4, 6, 8, 10];
  const axes = skills.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx, cy, cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  const currentPts = pts(skills.map(s => s.current));
  const targetPts = pts(skills.map(s => s.target));
  const toPath = (p) => p.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0]},${pt[1]}`).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 320 }}>
      {gridLevels.map(lv => {
        const gPts = skills.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          return [cx + (lv / 10) * r * Math.cos(angle), cy + (lv / 10) * r * Math.sin(angle)];
        });
        return <polygon key={lv} points={gPts.map(p => p.join(',')).join(' ')} fill="none" stroke={COLORS.border} strokeWidth="0.8" />;
      })}
      {axes.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.border} strokeWidth="0.8" />)}
      <polygon points={targetPts.map(p => p.join(',')).join(' ')} fill={`${COLORS.accent2}30`} stroke={COLORS.accent2} strokeWidth="1.5" strokeDasharray="4,2" />
      <polygon points={currentPts.map(p => p.join(',')).join(' ')} fill={`${COLORS.accent}25`} stroke={COLORS.accent} strokeWidth="2" />
      {currentPts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={COLORS.accent} />)}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 9, fill: COLORS.muted, fontFamily: "'Space Mono', monospace" }}>
          {l.name.length > 10 ? l.name.slice(0, 9) + '…' : l.name}
        </text>
      ))}
    </svg>
  );
}

function SkillBar({ skill, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(1), delay + 100); return () => clearTimeout(t); }, [delay]);
  const gap = skill.target - skill.current;
  const gapColor = gap > 4 ? COLORS.danger : gap > 2 ? COLORS.warn : COLORS.success;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'Space Mono', monospace" }}>{skill.name}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: COLORS.accent, background: `${COLORS.accent}15`, padding: "2px 7px", borderRadius: 4, fontFamily: "monospace" }}>{skill.current}/10</span>
          {gap > 0 && <span style={{ fontSize: 11, color: gapColor, background: `${gapColor}15`, padding: "2px 7px", borderRadius: 4, fontFamily: "monospace" }}>-{gap}</span>}
        </div>
      </div>
      <div style={{ position: "relative", height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          position: "absolute", height: "100%", borderRadius: 4,
          width: `${(skill.target / 10) * 100}%`, background: `${COLORS.accent2}40`,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)"
        }} />
        <div style={{
          position: "absolute", height: "100%", borderRadius: 4,
          width: width ? `${(skill.current / 10) * 100}%` : "0%",
          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2})`,
          transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
          boxShadow: `0 0 8px ${COLORS.accent}80`
        }} />
      </div>
      <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 5, fontFamily: "sans-serif", lineHeight: 1.4 }}>{skill.insight}</p>
    </div>
  );
}

function GlowBtn({ children, onClick, disabled, secondary }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 28px", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1,
        background: disabled ? COLORS.border : secondary
          ? hover ? `${COLORS.accent2}30` : "transparent"
          : hover ? COLORS.accent : `${COLORS.accent}dd`,
        color: disabled ? COLORS.muted : secondary ? COLORS.accent2 : COLORS.bg,
        border: secondary ? `1px solid ${COLORS.accent2}` : "none",
        boxShadow: !disabled && !secondary && hover ? `0 0 24px ${COLORS.accent}60` : "none",
        transition: "all 0.2s ease", opacity: disabled ? 0.5 : 1
      }}>
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 0" }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: `3px solid ${COLORS.border}`,
        borderTopColor: COLORS.accent,
        animation: "spin 0.8s linear infinite"
      }} />
      <span style={{ color: COLORS.muted, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>ANALYZING GAPS…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Tag({ children, color }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 20,
      background: `${color}20`, color, border: `1px solid ${color}40`,
      fontFamily: "'Space Mono', monospace", fontWeight: 600
    }}>{children}</span>
  );
}

export default function SkillGapAnalyzer() {
  const [step, setStep] = useState("form"); // form | loading | results
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (step === "results" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  async function handleResume(e) {
    const file = e.target.files[0];
    if (!file) return;
    setResumeLoading(true);
    setResumeName(file.name);
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      if (!skills) setSkills(text.slice(0, 800));
    } catch {
      setError("Could not read resume. Try pasting your skills manually.");
    }
    setResumeLoading(false);
  }

  async function extractTextFromFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".docx")) {
      // Use mammoth to extract text from docx
      const mammoth = await import("https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function analyze() {
    if (!role || !level || !skills) { setError("Please fill in role, level, and your current skills."); return; }
    setError("");
    setStep("loading");

    const prompt = `You are an expert tech career coach, ATS specialist, and skill gap analyst.

Analyze the following professional profile and return a detailed skill gap analysis WITH ATS score in valid JSON only.

Profile:
- Target Role: ${role}
- Target Level: ${level}
- Current Skills (self-described): ${skills}
- Years of Experience: ${experience || "not specified"}
- Career Goals: ${goals || "not specified"}

Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "summary": "2-3 sentence overview of the profile and overall readiness",
  "readinessScore": <number 0-100>,
  "readinessLabel": "<one of: Novice | Developing | Proficient | Advanced | Expert>",
  "topStrengths": ["strength1", "strength2", "strength3"],
  "criticalGaps": ["gap1", "gap2", "gap3"],
  "skills": [
    {
      "name": "Skill Name",
      "current": <0-10>,
      "target": <0-10>,
      "priority": "<High|Medium|Low>",
      "insight": "1 sentence specific insight about this skill gap"
    }
  ],
  "learningPath": [
    {
      "phase": "Phase 1: Foundation (0-3 months)",
      "actions": ["action1", "action2"],
      "resources": ["resource1", "resource2"]
    },
    {
      "phase": "Phase 2: Growth (3-6 months)",
      "actions": ["action1", "action2"],
      "resources": ["resource1", "resource2"]
    },
    {
      "phase": "Phase 3: Mastery (6-12 months)",
      "actions": ["action1", "action2"],
      "resources": ["resource1", "resource2"]
    }
  ],
  "timeToReady": "e.g. 8-12 months",
  "salaryImpact": "e.g. Closing these gaps could increase earning potential by 25-40%",
  "atsScore": <number 0-100>,
  "atsLabel": "<one of: Poor | Fair | Good | Excellent>",
  "atsFeedback": [
    {"category": "Keywords", "score": <0-100>, "feedback": "specific feedback"},
    {"category": "Formatting", "score": <0-100>, "feedback": "specific feedback"},
    {"category": "Skills Match", "score": <0-100>, "feedback": "specific feedback"},
    {"category": "Experience", "score": <0-100>, "feedback": "specific feedback"}
  ],
  "atsImprovements": ["improvement1", "improvement2", "improvement3"]
}

${resumeText ? `\nResume Content: ${resumeText.slice(0, 1500)}` : ""}

Include 6-8 skills relevant to the target role. Be specific and realistic in your assessment.`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      console.log("Groq response:", JSON.stringify(data));
      if (data.error) throw new Error(data.error.message);
      const raw = data.choices?.[0]?.message?.content || "";
      console.log("Raw text:", raw);
      const clean = raw.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
      setStep("results");
    } catch (e) {
      setError(`Analysis failed: ${e.message || "Please try again."}`);
      setStep("form");
    }
  }

  const readinessColor = results
    ? results.readinessScore >= 70 ? COLORS.success
      : results.readinessScore >= 40 ? COLORS.warn
        : COLORS.danger
    : COLORS.accent;

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "sans-serif",
      backgroundImage: `radial-gradient(ellipse at 20% 20%, ${COLORS.accent2}18 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 80%, ${COLORS.accent}10 0%, transparent 60%)`
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 16px ${COLORS.accent}50`
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: -0.5 }}>
            SKILL GAP<span style={{ color: COLORS.accent }}> ANALYZER</span>
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace" }}>AI-POWERED CAREER INTELLIGENCE</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* FORM */}
        {(step === "form" || step === "loading") && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1 }}>
                Map your path to<br /><span style={{
                  background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>mastery</span>
              </h2>
              <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
                Tell us where you are and where you want to be. Our AI will map the exact gaps standing between you and your next level.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'Space Mono', monospace", color: COLORS.muted, marginBottom: 8, letterSpacing: 1 }}>TARGET ROLE *</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{
                  width: "100%", padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, color: role ? COLORS.text : COLORS.muted, fontSize: 14, outline: "none",
                  appearance: "none", cursor: "pointer"
                }}>
                  <option value="">Select a role…</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'Space Mono', monospace", color: COLORS.muted, marginBottom: 8, letterSpacing: 1 }}>TARGET LEVEL *</label>
                <select value={level} onChange={e => setLevel(e.target.value)} style={{
                  width: "100%", padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, color: level ? COLORS.text : COLORS.muted, fontSize: 14, outline: "none",
                  appearance: "none", cursor: "pointer"
                }}>
                  <option value="">Select a level…</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Resume Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontFamily: "'Space Mono', monospace", color: COLORS.muted, marginBottom: 8, letterSpacing: 1 }}>UPLOAD RESUME (OPTIONAL)</label>
              <label style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                background: COLORS.card, border: `1px dashed ${resumeName ? COLORS.accent : COLORS.border}`,
                borderRadius: 8, cursor: "pointer", transition: "all 0.2s"
              }}>
                <span style={{ fontSize: 20 }}>{resumeLoading ? "⏳" : resumeName ? "✅" : "📄"}</span>
                <div>
                  <div style={{ fontSize: 13, color: resumeName ? COLORS.accent : COLORS.text, fontWeight: 600 }}>
                    {resumeLoading ? "Reading resume..." : resumeName ? resumeName : "Click to upload your resume"}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Supports .txt, .pdf (text-based)</div>
                </div>
                <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleResume} style={{ display: "none" }} />
              </label>
              {resumeName && (
                <button onClick={() => { setResumeText(""); setResumeName(""); setSkills(""); }}
                  style={{ marginTop: 8, fontSize: 11, color: COLORS.danger, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace" }}>
                  ✕ Remove resume
                </button>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontFamily: "'Space Mono', monospace", color: COLORS.muted, marginBottom: 8, letterSpacing: 1 }}>YOUR CURRENT SKILLS & EXPERIENCE *</label>
              <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. 2 years of React, some Node.js, basic SQL, familiar with Git, built 3 side projects, no cloud experience…"
                rows={4} style={{
                  width: "100%", padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, color: COLORS.text, fontSize: 14, outline: "none", resize: "vertical",
                  fontFamily: "sans-serif", boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'Space Mono', monospace", color: COLORS.muted, marginBottom: 8, letterSpacing: 1 }}>YEARS OF EXPERIENCE</label>
                <input value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 2 years" style={{
                  width: "100%", padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box"
                }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'Space Mono', monospace", color: COLORS.muted, marginBottom: 8, letterSpacing: 1 }}>CAREER GOALS</label>
                <input value={goals} onChange={e => setGoals(e.target.value)} placeholder="e.g. join MAANG, start a startup…" style={{
                  width: "100%", padding: "12px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box"
                }} />
              </div>
            </div>

            {error && <p style={{ color: COLORS.danger, fontSize: 13, marginBottom: 16, fontFamily: "monospace" }}>⚠ {error}</p>}

            {step === "loading" ? <Spinner /> : (
              <GlowBtn onClick={analyze}>ANALYZE MY SKILL GAPS →</GlowBtn>
            )}
          </div>
        )}

        {/* RESULTS */}
        {step === "results" && results && (
          <div ref={resultsRef}>
            {/* Hero Score */}
            <div style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 32, marginBottom: 24,
              display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Tag color={COLORS.accent}>{role}</Tag>
                  <Tag color={COLORS.accent2}>{level}</Tag>
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 10px" }}>
                  Your Analysis is Ready
                </h2>
                <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 500 }}>{results.summary}</p>
                <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>TIME TO READY</div>
                    <div style={{ fontSize: 14, color: COLORS.accent3, fontWeight: 600 }}>{results.timeToReady}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>SALARY IMPACT</div>
                    <div style={{ fontSize: 14, color: COLORS.success, fontWeight: 600 }}>{results.salaryImpact}</div>
                  </div>
                  {results.atsScore && (
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>ATS SCORE</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: results.atsScore >= 70 ? COLORS.success : results.atsScore >= 40 ? COLORS.warn : COLORS.danger }}>
                        {results.atsScore}/100 — {results.atsLabel}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  border: `4px solid ${readinessColor}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 30px ${readinessColor}50`,
                  background: `${readinessColor}10`
                }}>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: readinessColor }}>{results.readinessScore}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "'Space Mono', monospace" }}>/ 100</div>
                </div>
                <div style={{ fontSize: 12, color: readinessColor, fontFamily: "'Space Mono', monospace", marginTop: 8, fontWeight: 700 }}>{results.readinessLabel}</div>
              </div>
            </div>

            {/* Strengths + Gaps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: COLORS.success, letterSpacing: 1 }}>✦ TOP STRENGTHS</h3>
                {results.topStrengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: COLORS.success, marginTop: 2 }}>◆</span>
                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: COLORS.danger, letterSpacing: 1 }}>✦ CRITICAL GAPS</h3>
                {results.criticalGaps?.map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: COLORS.danger, marginTop: 2 }}>◆</span>
                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Score Section */}
            {results.atsScore && (
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 12, fontFamily: "'Space Mono', monospace", color: COLORS.muted, letterSpacing: 1 }}>✦ ATS RESUME SCORE</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      border: `3px solid ${results.atsScore >= 70 ? COLORS.success : results.atsScore >= 40 ? COLORS.warn : COLORS.danger}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 20px ${results.atsScore >= 70 ? COLORS.success : results.atsScore >= 40 ? COLORS.warn : COLORS.danger}40`,
                      background: `${results.atsScore >= 70 ? COLORS.success : results.atsScore >= 40 ? COLORS.warn : COLORS.danger}10`
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: results.atsScore >= 70 ? COLORS.success : results.atsScore >= 40 ? COLORS.warn : COLORS.danger }}>{results.atsScore}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: results.atsScore >= 70 ? COLORS.success : results.atsScore >= 40 ? COLORS.warn : COLORS.danger, fontFamily: "'Syne', sans-serif" }}>{results.atsLabel}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>ATS Compatibility</div>
                    </div>
                  </div>
                </div>

                {/* ATS Category Bars */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {results.atsFeedback?.map((item, i) => (
                    <div key={i} style={{ background: COLORS.surface, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, fontFamily: "'Space Mono', monospace" }}>{item.category}</span>
                        <span style={{ fontSize: 12, color: item.score >= 70 ? COLORS.success : item.score >= 40 ? COLORS.warn : COLORS.danger, fontFamily: "monospace" }}>{item.score}/100</span>
                      </div>
                      <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          width: `${item.score}%`,
                          background: item.score >= 70 ? COLORS.success : item.score >= 40 ? COLORS.warn : COLORS.danger,
                          transition: "width 0.8s ease"
                        }} />
                      </div>
                      <p style={{ fontSize: 11, color: COLORS.muted, margin: 0, lineHeight: 1.4 }}>{item.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* ATS Improvements */}
                {results.atsImprovements?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginBottom: 10, letterSpacing: 1 }}>QUICK WINS TO BOOST ATS SCORE</div>
                    {results.atsImprovements.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                        <span style={{ color: COLORS.accent3, fontSize: 12, marginTop: 1 }}>→</span>
                        <span style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skill Bars + Radar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, marginBottom: 24, alignItems: "start" }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: COLORS.muted, letterSpacing: 1 }}>SKILL BREAKDOWN</h3>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 20, display: "flex", gap: 16 }}>
                  <span><span style={{ color: COLORS.accent }}>━</span> Current</span>
                  <span><span style={{ color: COLORS.accent2 }}>╌</span> Target</span>
                </div>
                {results.skills?.map((s, i) => <SkillBar key={i} skill={s} delay={i * 100} />)}
              </div>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: COLORS.muted, letterSpacing: 1 }}>SKILL RADAR</h3>
                <RadarChart skills={results.skills} />
              </div>
            </div>

            {/* Learning Path */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 24px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: COLORS.muted, letterSpacing: 1 }}>✦ YOUR LEARNING ROADMAP</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {results.learningPath?.map((phase, i) => (
                  <div key={i} style={{
                    background: COLORS.surface, borderRadius: 10, padding: 16,
                    borderTop: `3px solid ${[COLORS.accent, COLORS.accent2, COLORS.accent3][i]}`
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: [COLORS.accent, COLORS.accent2, COLORS.accent3][i], marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
                      {phase.phase}
                    </div>
                    {phase.actions?.map((a, j) => (
                      <div key={j} style={{ fontSize: 12, color: COLORS.text, marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${COLORS.border}`, lineHeight: 1.4 }}>{a}</div>
                    ))}
                    {phase.resources?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "monospace", marginBottom: 6 }}>RESOURCES</div>
                        {phase.resources.map((r, j) => (
                          <div key={j} style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, paddingLeft: 12 }}>→ {r}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <GlowBtn onClick={() => { setStep("form"); setResults(null); }}>← ANALYZE AGAIN</GlowBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
