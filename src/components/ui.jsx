import React, { useRef, useState } from "react";
import { Lock, Fingerprint, Check, ChevronDown } from "lucide-react";
import { C, GRAD, GRAD_SOFT, STAGES } from "../theme.js";

export function Logo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center"
        style={{
          width: size, height: size, borderRadius: 8,
          background: GRAD, clipPath: "polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%)",
        }}
      >
        <Lock size={size * 0.52} color="#061313" strokeWidth={2.6} />
      </div>
      <span className="f-display" style={{ fontSize: size * 0.66, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
        Legion
      </span>
    </div>
  );
}

export function Facet({ children, style = {}, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, ...style }}
    >
      {children}
    </div>
  );
}

export function GradBtn({ children, onClick, full, disabled, size = "md", icon: Icon }) {
  const pad = size === "sm" ? "8px 14px" : "13px 22px";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="f-body flex items-center justify-center gap-2"
      style={{
        width: full ? "100%" : "auto", padding: pad, borderRadius: 12, border: "none",
        background: disabled ? C.borderSoft : GRAD, color: disabled ? C.mutedDim : "#04140f",
        fontWeight: 700, fontSize: size === "sm" ? 13 : 14.5, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, transition: "transform 0.15s, opacity 0.15s",
      }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, icon: Icon, danger }) {
  return (
    <button
      onClick={onClick}
      className="f-body flex items-center justify-center gap-2"
      style={{
        padding: "11px 20px", borderRadius: 12,
        border: `1px solid ${danger ? "rgba(255,107,107,0.35)" : C.border}`,
        background: "transparent", color: danger ? C.danger : C.text,
        fontWeight: 600, fontSize: 14, cursor: "pointer",
      }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="f-body" style={{ fontSize: 12.5, fontWeight: 600, color: C.muted, letterSpacing: "0.02em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2.5" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 14px" }}>
      {Icon && <Icon size={16} color={C.mutedDim} />}
      <input {...props} className="f-body" style={{ background: "transparent", border: "none", outline: "none", color: C.text, width: "100%", fontSize: 14.5 }} />
    </div>
  );
}

export function Select({ icon: Icon, children, ...props }) {
  return (
    <div className="flex items-center gap-2.5" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 14px" }}>
      {Icon && <Icon size={16} color={C.mutedDim} />}
      <select {...props} className="f-body" style={{ background: "transparent", border: "none", outline: "none", color: C.text, width: "100%", fontSize: 14.5, appearance: "none" }}>
        {children}
      </select>
      <ChevronDown size={14} color={C.mutedDim} />
    </div>
  );
}

export function Pill({ children, tone = "muted" }) {
  const map = {
    muted: { bg: C.borderSoft, fg: C.muted },
    good: { bg: C.tealDim, fg: C.teal },
    warn: { bg: C.warnDim, fg: C.warn },
    danger: { bg: C.dangerDim, fg: C.danger },
    purple: { bg: C.purpleDim, fg: C.purple },
  };
  const s = map[tone];
  return (
    <span className="f-body" style={{ background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function StageTracker({ stage, disputed }) {
  return (
    <div className="flex items-center w-full">
      {STAGES.map((label, i) => {
        const active = i <= stage;
        const isLast = i === STAGES.length - 1;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 0 }}>
              <div style={{
                width: 18, height: 18,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: disputed && i === stage ? C.danger : active ? GRAD : C.borderSoft,
              }} />
              <span className="f-body" style={{ fontSize: 10.5, fontWeight: 600, color: active ? C.text : C.mutedDim, textAlign: "center", lineHeight: 1.2 }}>
                {label}
              </span>
            </div>
            {!isLast && <div style={{ flex: 1, height: 2, marginBottom: 16, background: i < stage ? GRAD : C.borderSoft }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function MilestoneBar({ milestones, disputed }) {
  const releasedCount = milestones.filter((m) => m.released).length;
  return (
    <div className="flex items-center w-full">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        return (
          <React.Fragment key={m._id || i}>
            <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 0, flex: "0 0 auto" }}>
              <div style={{
                width: 18, height: 18,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: disputed ? C.danger : m.released ? GRAD : C.borderSoft,
              }} />
              <span className="f-body" style={{ fontSize: 10.5, fontWeight: 600, color: m.released ? C.text : C.mutedDim, textAlign: "center", lineHeight: 1.2, maxWidth: 74, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.title}
              </span>
            </div>
            {!isLast && <div style={{ flex: 1, height: 2, marginBottom: 16, background: disputed ? C.borderSoft : i < releasedCount - 1 || (i < releasedCount) ? GRAD : C.borderSoft }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Added the missing Component definition here:
// Ensure the name is exactly TwoFactorModal here
export function TwoFactorModal({ open, action, error, onClose, onConfirm }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef([]);
  
  if (!open) return null;

  const setDigit = (i, v) => {
    if (!/^[0-9]?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const complete = code.every((d) => d !== "");

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(4,6,20,0.72)", backdropFilter: "blur(4px)" }}>
      <div className="anim-in" style={{ width: 380, maxWidth: "90vw" }}>
        <Facet style={{ padding: 28 }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: GRAD_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Fingerprint size={19} color={C.teal} />
            </div>
            <div>
              <div className="f-display" style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Confirm with 2FA</div>
              <div className="f-body" style={{ fontSize: 12.5, color: C.muted }}>{action}</div>
            </div>
          </div>
          <p className="f-body" style={{ fontSize: 13, color: C.muted, margin: "14px 0 10px" }}>
            Enter the 6-digit code from your authenticator app to continue.
          </p>
          {error && <p className="f-body" style={{ fontSize: 12.5, color: C.danger, marginBottom: 10 }}>{error}</p>}
          <div className="flex gap-2 mb-5 justify-center">
            {code.map((d, i) => (
              <input
                key={i} ref={(el) => (refs.current[i] = el)} value={d}
                onChange={(e) => setDigit(i, e.target.value)} maxLength={1} className="f-mono"
                style={{ width: 42, height: 50, textAlign: "center", fontSize: 20, fontWeight: 600, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, outline: "none" }}
              />
            ))}
          </div>
          <div className="flex gap-2.5">
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <div style={{ flex: 1 }}>
              <GradBtn full disabled={!complete} onClick={() => onConfirm(code.join(""))}>Verify & Confirm</GradBtn>
            </div>
          </div>
        </Facet>
      </div>
    </div>
  );
}