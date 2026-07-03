import React, { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { C } from "../theme.js";
import { Logo, Facet, Field, Input, GradBtn, TwoFactorModal as TwoFAModal } from "../components/ui.jsx";
import { api, saveToken } from "../api/client.js";

export default function Auth({ onAuthed, onNeedsOnboarding }) {
  const [mode, setMode] = useState("signup");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { token, user } = await api.register(form);
        saveToken(token);
        onNeedsOnboarding(user);
      } else {
        const res = await api.login({ email: form.email, password: form.password });
        if (res.requiresTwoFA) {
          setNeeds2FA(true);
          return;
        }
        saveToken(res.token);
        onAuthed(res.user);
      }
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmTwoFA = async (code) => {
    setError("");
    try {
      const res = await api.login({ email: form.email, password: form.password, twoFAToken: code });
      saveToken(res.token);
      setNeeds2FA(false);
      onAuthed(res.user);
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,233,196,0.10), transparent 70%)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", bottom: "-25%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(157,107,255,0.12), transparent 70%)", filter: "blur(10px)" }} />

      <div className="anim-in relative z-10 flex flex-col items-center" style={{ width: 420, maxWidth: "92vw" }}>
        <Logo size={34} />
        <p className="f-body text-center" style={{ color: C.muted, fontSize: 14, margin: "10px 0 28px" }}>
          The neutral third party that holds funds until every condition is met.
        </p>
        <Facet style={{ padding: 26, width: "100%" }}>
          <div className="flex mb-6" style={{ background: C.bg2, borderRadius: 11, padding: 4 }}>
            {["signup", "login"].map((m) => (
              <button key={m} onClick={() => setMode(m)} className="f-body" style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                background: mode === m ? "linear-gradient(135deg,#2fe9c4,#9d6bff)" : "transparent",
                color: mode === m ? "#04140f" : C.muted, fontWeight: 700, fontSize: 13.5,
              }}>
                {m === "signup" ? "Create account" : "Log in"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {mode === "signup" && (
              <Field label="Official full name">
                <Input icon={User} placeholder="As it appears on your ID" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </Field>
            )}
            <Field label="Email address">
              <Input icon={Mail} placeholder="you@example.com" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            {mode === "signup" && (
              <Field label="Phone number">
                <Input icon={Phone} placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
            )}
            <Field label="Password">
              <div className="flex items-center gap-2.5" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 14px" }}>
                <Lock size={16} color={C.mutedDim} />
                <input type={showPw ? "text" : "password"} placeholder="Min. 10 characters" value={form.password} onChange={(e) => update("password", e.target.value)}
                  className="f-body" style={{ background: "transparent", border: "none", outline: "none", color: C.text, width: "100%", fontSize: 14.5 }} />
                <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {showPw ? <EyeOff size={15} color={C.mutedDim} /> : <Eye size={15} color={C.mutedDim} />}
                </button>
              </div>
            </Field>
          </div>

          {error && <p className="f-body" style={{ color: C.danger, fontSize: 12.5, marginTop: 12 }}>{error}</p>}

          <div className="mt-6">
            <GradBtn full disabled={loading} onClick={submit}>
              {loading ? "Please wait..." : mode === "signup" ? "Continue to verification" : "Log in"}
            </GradBtn>
          </div>
          <div className="flex items-center gap-1.5 justify-center mt-5">
            <ShieldCheck size={13} color={C.mutedDim} />
            <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>Bank-grade encryption · Licensed escrow infrastructure</span>
          </div>
        </Facet>
      </div>

      <TwoFAModal open={needs2FA} action="Logging in" error={error} onClose={() => setNeeds2FA(false)} onConfirm={confirmTwoFA} />
    </div>
  );
}
