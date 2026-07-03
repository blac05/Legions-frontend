import React, { useState } from "react";
import {
  Globe, Upload, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, ChevronRight, ChevronLeft,
} from "lucide-react";
import { C } from "../theme.js";
import { COUNTRIES } from "../theme.js";
import { Logo, Facet, Field, Select, GradBtn, GhostBtn, Pill } from "../components/ui.jsx";
import { api } from "../api/client.js";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [idType, setIdType] = useState("Passport");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [file, setFile] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const steps = ["Identity", "Verification", "Security"];

  const submitKyc = async () => {
    setError(""); setLoading(true);
    try {
      const formData = new FormData();
      formData.append("idType", idType);
      formData.append("country", country);
      if (file) formData.append("document", file);
      await api.submitKyc(formData);
      const { qrCode } = await api.setup2FA();
      setQrCode(qrCode);
      setStep(2);
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishTwoFA = async () => {
    setError(""); setLoading(true);
    try {
      await api.verify2FA(twoFACode);
      onComplete();
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="anim-in" style={{ width: 480, maxWidth: "92vw" }}>
        <div className="flex items-center justify-between mb-6">
          <Logo size={26} />
          <Pill tone="purple">Step {step + 1} of 3</Pill>
        </div>
        <div className="flex gap-2 mb-7">
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? "linear-gradient(135deg,#2fe9c4,#9d6bff)" : C.borderSoft }} />
          ))}
        </div>

        <Facet style={{ padding: 28 }}>
          {step === 0 && (
            <div className="anim-in flex flex-col gap-5">
              <div>
                <div className="f-display" style={{ fontSize: 19, fontWeight: 700, color: C.text }}>Confirm your identity</div>
                <p className="f-body" style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  Legion verifies every party before funds ever move, so counterparties know exactly who they're dealing with.
                </p>
              </div>
              <Field label="Country of residence">
                <Select icon={Globe} value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c} style={{ background: C.bg2 }}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Government ID type">
                <div className="flex gap-2">
                  {["Passport", "National ID", "Driver's License"].map((t) => (
                    <button key={t} onClick={() => setIdType(t)} className="f-body" style={{
                      flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${idType === t ? "transparent" : C.border}`,
                      background: idType === t ? "rgba(47,233,196,0.14)" : "transparent",
                      color: idType === t ? C.teal : C.muted,
                    }}>{t}</button>
                  ))}
                </div>
              </Field>
              <GradBtn full icon={ChevronRight} onClick={() => setStep(1)}>Continue</GradBtn>
            </div>
          )}

          {step === 1 && (
            <div className="anim-in flex flex-col gap-5">
              <div>
                <div className="f-display" style={{ fontSize: 19, fontWeight: 700, color: C.text }}>Upload your {idType}</div>
                <p className="f-body" style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  We match your document against your details and run a liveness check.
                </p>
              </div>
              <label style={{
                border: `1.5px dashed ${file ? C.teal : C.border}`, borderRadius: 14, padding: "30px 16px",
                background: file ? "rgba(47,233,196,0.1)" : C.bg2, cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
              }}>
                <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? <CheckCircle2 size={26} color={C.teal} /> : <Upload size={22} color={C.mutedDim} />}
                <span className="f-body" style={{ fontSize: 13, fontWeight: 600, color: file ? C.teal : C.muted }}>
                  {file ? file.name : "Tap to upload front & back"}
                </span>
                <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>JPG, PNG or PDF · Max 10MB</span>
              </label>
              <div className="flex items-start gap-2" style={{ background: C.bg2, borderRadius: 10, padding: "10px 12px" }}>
                <AlertCircle size={14} color={C.mutedDim} style={{ marginTop: 2, flexShrink: 0 }} />
                <span className="f-body" style={{ fontSize: 12, color: C.mutedDim, lineHeight: 1.5 }}>
                  Your document is encrypted and only used for identity verification, in line with global KYC/AML requirements.
                </span>
              </div>
              {error && <p className="f-body" style={{ color: C.danger, fontSize: 12.5 }}>{error}</p>}
              <div className="flex gap-2.5">
                <GhostBtn icon={ChevronLeft} onClick={() => setStep(0)}>Back</GhostBtn>
                <div style={{ flex: 1 }}>
                  <GradBtn full disabled={!file || loading} onClick={submitKyc}>{loading ? "Submitting..." : "Continue"}</GradBtn>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="anim-in flex flex-col gap-5">
              <div>
                <div className="f-display" style={{ fontSize: 19, fontWeight: 700, color: C.text }}>Turn on two-factor authentication</div>
                <p className="f-body" style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  Required for every Legion account. You'll confirm a 2FA code any time funds are released or terms change.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4" style={{ background: C.bg2, borderRadius: 14, padding: "24px 16px" }}>
                {qrCode ? (
                  <img src={qrCode} alt="2FA QR code" style={{ width: 148, height: 148, borderRadius: 12 }} />
                ) : (
                  <Smartphone size={34} color={C.teal} />
                )}
                <span className="f-body" style={{ fontSize: 12, color: C.mutedDim }}>Scan with Google Authenticator or Authy</span>
              </div>
              <Field label="Enter the 6-digit code to confirm">
                <input value={twoFACode} onChange={(e) => setTwoFACode(e.target.value)} maxLength={6}
                  className="f-mono" placeholder="000000"
                  style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 14px", color: C.text, fontSize: 16, outline: "none", letterSpacing: 4, textAlign: "center" }} />
              </Field>
              {error && <p className="f-body" style={{ color: C.danger, fontSize: 12.5 }}>{error}</p>}
              <GradBtn full icon={ShieldCheck} disabled={twoFACode.length !== 6 || loading} onClick={finishTwoFA}>
                {loading ? "Verifying..." : "Enable & finish setup"}
              </GradBtn>
            </div>
          )}
        </Facet>
      </div>
    </div>
  );
}
