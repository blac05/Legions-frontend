import React, { useState } from "react";
import {
  FileText, User, Mail, TrendingUp, Clock, Plus, Shield, Globe, Trash2,
  Check, ChevronRight, ChevronLeft, ArrowRight,
} from "lucide-react";
import { C, feeRate, FUNDING_METHODS } from "../theme.js";
import { Facet, Field, Input, Select, GradBtn, GhostBtn } from "../components/ui.jsx";
import { api } from "../api/client.js";

const emptyMilestone = () => ({ title: "", amount: "", conditions: [""] });

export default function NewEscrow({ onCreated }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", role: "depositor", counterpartyName: "", counterpartyEmail: "",
    currency: "USD", description: "", deadline: "",
    milestones: [emptyMilestone()],
    fundingMethod: "bank", payoutMethod: "bank", agreed: false,
  });
  const steps = ["Parties", "Milestones", "Funding", "Review"];

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateMilestone = (i, patch) => {
    const next = [...form.milestones];
    next[i] = { ...next[i], ...patch };
    update("milestones", next);
  };
  const updateCondition = (mi, ci, v) => {
    const next = [...form.milestones];
    const conditions = [...next[mi].conditions];
    conditions[ci] = v;
    next[mi] = { ...next[mi], conditions };
    update("milestones", next);
  };
  const addMilestone = () => update("milestones", [...form.milestones, emptyMilestone()]);
  const removeMilestone = (i) => update("milestones", form.milestones.filter((_, idx) => idx !== i));

  const total = form.milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const fee = total * feeRate(total);
  const splitFee = fee / 2;

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const { escrow } = await api.createEscrow({
        ...form,
        milestones: form.milestones.map((m) => ({
          title: m.title, amount: m.amount, conditions: m.conditions.filter(Boolean),
        })),
      });
      onCreated(escrow);
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-9 pb-10 flex justify-center">
      <div style={{ width: 660, maxWidth: "100%" }}>
        <div className="flex gap-2 mb-7">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col gap-1.5">
              <div style={{ height: 4, borderRadius: 4, background: i <= step ? "linear-gradient(135deg,#2fe9c4,#9d6bff)" : C.borderSoft }} />
              <span className="f-body" style={{ fontSize: 11, fontWeight: 600, color: i === step ? C.text : C.mutedDim }}>{s}</span>
            </div>
          ))}
        </div>

        <Facet style={{ padding: 26 }}>
          {step === 0 && (
            <div className="anim-in flex flex-col gap-5">
              <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Who's involved?</div>
              <Field label="Contract title">
                <Input icon={FileText} placeholder="e.g. Website design retainer" value={form.title} onChange={(e) => update("title", e.target.value)} />
              </Field>
              <Field label="Your role in this contract">
                <div className="flex gap-2">
                  {[["depositor", "I'm sending funds"], ["beneficiary", "I'm receiving funds"]].map(([id, label]) => (
                    <button key={id} onClick={() => update("role", id)} className="f-body" style={{
                      flex: 1, padding: "12px 10px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${form.role === id ? "transparent" : C.border}`,
                      background: form.role === id ? "rgba(47,233,196,0.14)" : "transparent",
                      color: form.role === id ? C.teal : C.muted,
                    }}>{label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Counterparty full name">
                <Input icon={User} placeholder="Official name" value={form.counterpartyName} onChange={(e) => update("counterpartyName", e.target.value)} />
              </Field>
              <Field label="Counterparty email">
                <Input icon={Mail} placeholder="them@example.com" value={form.counterpartyEmail} onChange={(e) => update("counterpartyEmail", e.target.value)} />
              </Field>
              <Field label="Overall completion deadline">
                <Input icon={Clock} type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
              </Field>
              <div className="flex items-start gap-2" style={{ background: C.bg2, borderRadius: 10, padding: "10px 12px" }}>
                <Shield size={14} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
                <span className="f-body" style={{ fontSize: 12, color: C.mutedDim, lineHeight: 1.5 }}>
                  Legion acts as the neutral agent on every contract — funds only move when agreed conditions are verifiably met.
                </span>
              </div>
              <GradBtn full icon={ChevronRight} disabled={!form.title || !form.counterpartyEmail} onClick={() => setStep(1)}>Continue</GradBtn>
            </div>
          )}

          {step === 1 && (
            <div className="anim-in flex flex-col gap-5">
              <div>
                <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Break the work into milestones</div>
                <p className="f-body" style={{ fontSize: 12.5, color: C.mutedDim, marginTop: 4 }}>
                  Each milestone releases on its own once its conditions are met — no need to wait for the whole contract to finish.
                </p>
              </div>

              <Field label="Overall description">
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What is this contract for?"
                  className="f-body" rows={2}
                  style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none" }} />
              </Field>

              <div className="flex flex-col gap-4">
                {form.milestones.map((m, mi) => (
                  <Facet key={mi} style={{ padding: 16, background: C.bg2 }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="f-body" style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Milestone {mi + 1}</span>
                      {form.milestones.length > 1 && (
                        <button onClick={() => removeMilestone(mi)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                          <Trash2 size={14} color={C.mutedDim} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3 mb-3">
                      <div style={{ flex: 2 }}>
                        <Input placeholder="e.g. Design mockups approved" value={m.title} onChange={(e) => updateMilestone(mi, { title: e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Input icon={TrendingUp} type="number" placeholder="Amount" value={m.amount} onChange={(e) => updateMilestone(mi, { amount: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: C.mutedDim }}>Conditions to release this milestone</span>
                      {m.conditions.map((c, ci) => (
                        <Input key={ci} placeholder={`Condition ${ci + 1}`} value={c} onChange={(e) => updateCondition(mi, ci, e.target.value)} />
                      ))}
                      <button onClick={() => updateMilestone(mi, { conditions: [...m.conditions, ""] })} className="f-body flex items-center gap-1.5"
                        style={{ background: "none", border: "none", color: C.teal, fontSize: 12, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>
                        <Plus size={12} /> Add condition
                      </button>
                    </div>
                  </Facet>
                ))}
                <button onClick={addMilestone} className="f-body flex items-center justify-center gap-1.5" style={{
                  border: `1.5px dashed ${C.border}`, borderRadius: 12, padding: 12, background: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  <Plus size={14} /> Add another milestone
                </button>
              </div>

              <div className="flex justify-between items-center" style={{ padding: "12px 4px" }}>
                <span className="f-body" style={{ fontSize: 13, color: C.muted }}>Contract total</span>
                <span className="f-display" style={{ fontSize: 17, fontWeight: 700, color: C.text }}>
                  {total.toLocaleString(undefined, { style: "currency", currency: form.currency })}
                </span>
              </div>

              <div className="flex gap-2.5">
                <GhostBtn icon={ChevronLeft} onClick={() => setStep(0)}>Back</GhostBtn>
                <div style={{ flex: 1 }}>
                  <GradBtn full icon={ChevronRight} disabled={total <= 0} onClick={() => setStep(2)}>Continue</GradBtn>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="anim-in flex flex-col gap-5">
              <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Choose deposit & payout methods</div>
              <Field label="Currency">
                <Select value={form.currency} onChange={(e) => update("currency", e.target.value)}>
                  {["USD", "EUR", "GBP", "NGN", "GHS", "AED"].map((c) => <option key={c} style={{ background: C.bg2 }}>{c}</option>)}
                </Select>
              </Field>
              <Field label="How will funds be deposited (by depositor)?">
                <div className="grid grid-cols-3 gap-2">
                  {FUNDING_METHODS.map((m) => (
                    <button key={m.id} onClick={() => update("fundingMethod", m.id)} className="flex flex-col items-center gap-1.5" style={{
                      padding: "16px 8px", borderRadius: 12, cursor: "pointer",
                      border: `1px solid ${form.fundingMethod === m.id ? "transparent" : C.border}`,
                      background: form.fundingMethod === m.id ? "rgba(47,233,196,0.14)" : "transparent",
                    }}>
                      <span className="f-body" style={{ fontSize: 12, fontWeight: 600, color: form.fundingMethod === m.id ? C.teal : C.muted }}>{m.label}</span>
                      <span className="f-body" style={{ fontSize: 10, color: C.mutedDim }}>{m.sub}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="How should the beneficiary be paid out?">
                <div className="grid grid-cols-3 gap-2">
                  {FUNDING_METHODS.map((m) => (
                    <button key={m.id} onClick={() => update("payoutMethod", m.id)} className="flex flex-col items-center gap-1.5" style={{
                      padding: "16px 8px", borderRadius: 12, cursor: "pointer",
                      border: `1px solid ${form.payoutMethod === m.id ? "transparent" : C.border}`,
                      background: form.payoutMethod === m.id ? "rgba(157,107,255,0.14)" : "transparent",
                    }}>
                      <span className="f-body" style={{ fontSize: 12, fontWeight: 600, color: form.payoutMethod === m.id ? C.purple : C.muted }}>{m.label}</span>
                      <span className="f-body" style={{ fontSize: 10, color: C.mutedDim }}>{m.sub}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex items-start gap-2" style={{ background: C.bg2, borderRadius: 10, padding: "10px 12px" }}>
                <Globe size={14} color={C.mutedDim} style={{ marginTop: 2, flexShrink: 0 }} />
                <span className="f-body" style={{ fontSize: 12, color: C.mutedDim, lineHeight: 1.5 }}>
                  Legion settles across borders — deposit and payout methods don't need to match.
                </span>
              </div>
              <div className="flex gap-2.5">
                <GhostBtn icon={ChevronLeft} onClick={() => setStep(1)}>Back</GhostBtn>
                <div style={{ flex: 1 }}><GradBtn full icon={ChevronRight} onClick={() => setStep(3)}>Continue</GradBtn></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="anim-in flex flex-col gap-5">
              <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Review & agree</div>
              <Facet style={{ padding: 16, background: C.bg2 }}>
                <div className="flex justify-between mb-2"><span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Contract</span><span className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{form.title || "Untitled"}</span></div>
                <div className="flex justify-between mb-2"><span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Milestones</span><span className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{form.milestones.length}</span></div>
                <div className="flex justify-between mb-2"><span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Total amount</span><span className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{total.toLocaleString(undefined, { style: "currency", currency: form.currency })}</span></div>
                <div className="flex justify-between mb-2"><span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Deadline</span><span className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{form.deadline || "—"}</span></div>
                <div className="flex justify-between mb-2"><span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Legion fee ({(feeRate(total) * 100).toFixed(2)}%)</span><span className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{fee.toLocaleString(undefined, { style: "currency", currency: form.currency })}</span></div>
                <div className="flex justify-between"><span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Split per party</span><span className="f-body" style={{ fontSize: 12.5, color: C.teal, fontWeight: 700 }}>{splitFee.toLocaleString(undefined, { style: "currency", currency: form.currency })} each</span></div>
              </Facet>

              <div className="flex flex-col gap-2">
                {form.milestones.map((m, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ background: C.bg2, borderRadius: 10, padding: "10px 12px" }}>
                    <span className="f-body" style={{ fontSize: 12.5, color: C.text }}>{m.title || `Milestone ${i + 1}`}</span>
                    <span className="f-body" style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>{(parseFloat(m.amount) || 0).toLocaleString(undefined, { style: "currency", currency: form.currency })}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => update("agreed", !form.agreed)} className="flex items-start gap-3" style={{ background: C.bg2, border: `1px solid ${form.agreed ? C.teal : C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, marginTop: 1, flexShrink: 0, background: form.agreed ? "linear-gradient(135deg,#2fe9c4,#9d6bff)" : "transparent", border: `1.5px solid ${form.agreed ? "transparent" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.agreed && <Check size={12} color="#04140f" strokeWidth={3} />}
                </div>
                <span className="f-body" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                  I agree these terms are final once the counterparty accepts, and I understand breach of contract is monitored and may be escalated to dispute review.
                </span>
              </button>
              {error && <p className="f-body" style={{ color: C.danger, fontSize: 12.5 }}>{error}</p>}
              <div className="flex gap-2.5">
                <GhostBtn icon={ChevronLeft} onClick={() => setStep(2)}>Back</GhostBtn>
                <div style={{ flex: 1 }}>
                  <GradBtn full icon={ArrowRight} disabled={!form.agreed || loading} onClick={submit}>
                    {loading ? "Sending..." : "Send to counterparty"}
                  </GradBtn>
                </div>
              </div>
            </div>
          )}
        </Facet>
      </div>
    </div>
  );
}
