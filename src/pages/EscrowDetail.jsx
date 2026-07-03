import React, { useState } from "react";
import {
  ChevronLeft, AlertTriangle, Check, ShieldCheck, ArrowDownRight, ArrowUpRight, X,
} from "lucide-react";
import { C, fmtMoney, feeRate, FUNDING_METHODS } from "../theme.js";
import { Logo, Facet, Field, Input, GradBtn, TwoFactorModal as TwoFAModal } from "../components/ui.jsx";
import { api } from "../api/client.js";

export default function EscrowDetail({ escrow, onBack, onUpdated, currentUserId }) {
  const [releasingMilestoneId, setReleasingMilestoneId] = useState(null);
  const [twoFAError, setTwoFAError] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const [disputeText, setDisputeText] = useState("");
  const [busy, setBusy] = useState(false);

  const total = escrow.milestones.reduce((s, m) => s + m.amount, 0);
  const fee = total * feeRate(total);
  const needsAgreement = escrow.status === "pending_agreement";
  const iAmDepositor = escrow.depositor.user === currentUserId || escrow.depositor.email === currentUserId;
  const myAgreementPending = needsAgreement && (iAmDepositor ? !escrow.depositor.agreed : !escrow.beneficiary.agreed);

  const toggleCondition = async (milestoneId, conditionId) => {
    setBusy(true);
    try {
      const { escrow: updated } = await api.toggleCondition(escrow._id, milestoneId, conditionId);
      onUpdated(updated);
    } finally {
      setBusy(false);
    }
  };

  const agree = async () => {
    setBusy(true);
    try {
      const { escrow: updated } = await api.agreeToEscrow(escrow._id);
      onUpdated(updated);
    } finally {
      setBusy(false);
    }
  };

  const confirmRelease = async (code) => {
    setTwoFAError("");
    try {
      const { escrow: updated } = await api.releaseMilestone(escrow._id, releasingMilestoneId, code);
      onUpdated(updated);
      setReleasingMilestoneId(null);
    } catch (err) {
      setTwoFAError(err.data?.error || err.message);
    }
  };

  const submitDispute = async () => {
    setBusy(true);
    try {
      const { escrow: updated } = await api.flagBreach(escrow._id, disputeText);
      onUpdated(updated);
      setShowDispute(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 md:px-9 pb-10">
      <button onClick={onBack} className="f-body flex items-center gap-1.5 mb-5" style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer" }}>
        <ChevronLeft size={15} /> Back to dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-5">
        <div style={{ flex: 2 }} className="flex flex-col gap-5">
          <Facet style={{ padding: 22 }}>
            <div className="flex items-start justify-between mb-1">
              <span className="f-mono" style={{ fontSize: 11.5, color: C.mutedDim }}>{escrow.legionId}</span>
              {escrow.disputed ? <Pill tone="danger">Under review</Pill> : needsAgreement ? <Pill tone="warn">Awaiting agreement</Pill> : escrow.status === "completed" ? <Pill tone="good">Completed</Pill> : <Pill tone="good">Secure</Pill>}
            </div>
            <div className="f-display" style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 14 }}>{escrow.title}</div>
            <MilestoneBar milestones={escrow.milestones} disputed={escrow.disputed} />

            {needsAgreement && myAgreementPending && (
              <div className="flex items-center justify-between mt-6" style={{ background: C.bg2, borderRadius: 12, padding: 14 }}>
                <span className="f-body" style={{ fontSize: 13, color: C.muted }}>You haven't accepted these terms yet.</span>
                <GradBtn size="sm" icon={Check} disabled={busy} onClick={agree}>Accept terms</GradBtn>
              </div>
            )}

            {escrow.disputed && (
              <div className="flex items-start gap-2.5 mt-6" style={{ background: C.dangerDim, borderRadius: 12, padding: 14 }}>
                <AlertTriangle size={16} color={C.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="f-body" style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>Breach flagged</div>
                  <div className="f-body" style={{ fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{escrow.disputeReason}</div>
                  <div className="f-body" style={{ fontSize: 11.5, color: C.mutedDim, marginTop: 6 }}>Legion is reviewing evidence from both parties. All unreleased milestones remain locked until resolved.</div>
                </div>
              </div>
            )}
          </Facet>

          {escrow.milestones.map((m) => {
            const allMet = m.conditions.length > 0 && m.conditions.every((c) => c.met);
            return (
              <Facet key={m._id} style={{ padding: 22 }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="f-display" style={{ fontSize: 15.5, fontWeight: 700, color: C.text }}>{m.title}</div>
                  <div className="flex items-center gap-2">
                    <span className="f-body" style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{fmtMoney(m.amount, escrow.currency)}</span>
                    {m.released && <Pill tone="good">Released</Pill>}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 mt-4 mb-4">
                  {m.conditions.map((c) => (
                    <button key={c._id} disabled={busy || escrow.disputed || m.released} onClick={() => toggleCondition(m._id, c._id)} className="flex items-center gap-3" style={{
                      background: C.bg2, border: `1px solid ${c.met ? "rgba(47,233,196,0.3)" : C.border}`, borderRadius: 11, padding: 13,
                      cursor: escrow.disputed || m.released ? "not-allowed" : "pointer", textAlign: "left", opacity: m.released ? 0.7 : 1,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        background: c.met ? "linear-gradient(135deg,#2fe9c4,#9d6bff)" : "transparent", border: `1.5px solid ${c.met ? "transparent" : C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {c.met && <Check size={13} color="#04140f" strokeWidth={3} />}
                      </div>
                      <span className="f-body" style={{ fontSize: 13.5, color: c.met ? C.text : C.muted }}>{c.text}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="f-body" style={{ fontSize: 12.5, fontWeight: 600, color: allMet || m.released ? C.teal : C.warn }}>
                    {m.released ? "Funds released" : allMet ? "Ready to release" : "Awaiting conditions"}
                  </span>
                  {!m.released && (
                    <GradBtn size="sm" icon={ShieldCheck} disabled={!allMet || escrow.disputed} onClick={() => setReleasingMilestoneId(m._id)}>
                      Release milestone
                    </GradBtn>
                  )}
                </div>
              </Facet>
            );
          })}

          {!escrow.disputed && escrow.status !== "completed" && (
            <Facet style={{ padding: 18 }}>
              <div className="flex items-center justify-between">
                <span className="f-body" style={{ fontSize: 12.5, color: C.muted }}>Something not delivered as agreed?</span>
                <GhostBtn danger icon={AlertTriangle} onClick={() => setShowDispute(true)}>Flag breach</GhostBtn>
              </div>
            </Facet>
          )}
        </div>

        <div style={{ flex: 1 }} className="flex flex-col gap-5">
          <Facet style={{ padding: 20 }}>
            <div className="f-display" style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 14 }}>Contract summary</div>
            {[
              ["Depositor", escrow.depositor.name],
              ["Beneficiary", escrow.beneficiary.name],
              ["Total amount", fmtMoney(total, escrow.currency)],
              ["Legion fee", `${fmtMoney(fee, escrow.currency)} (split)`],
              ["Created", new Date(escrow.createdAt).toLocaleDateString()],
              ["Deadline", escrow.deadline ? new Date(escrow.deadline).toLocaleDateString() : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between mb-2.5">
                <span className="f-body" style={{ fontSize: 12.5, color: C.mutedDim }}>{k}</span>
                <span className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </Facet>

          <Facet style={{ padding: 20 }}>
            <div className="f-display" style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 12 }}>Payment routes</div>
            <div className="flex items-center gap-2.5 mb-3">
              <ArrowDownRight size={15} color={C.teal} />
              <div>
                <div className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>Funded via {FUNDING_METHODS.find((m) => m.id === escrow.fundingMethod)?.label}</div>
                <div className="f-body" style={{ fontSize: 11, color: C.mutedDim }}>{FUNDING_METHODS.find((m) => m.id === escrow.fundingMethod)?.sub}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ArrowUpRight size={15} color={C.purple} />
              <div>
                <div className="f-body" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>Paid out via {FUNDING_METHODS.find((m) => m.id === escrow.payoutMethod)?.label}</div>
                <div className="f-body" style={{ fontSize: 11, color: C.mutedDim }}>{FUNDING_METHODS.find((m) => m.id === escrow.payoutMethod)?.sub}</div>
              </div>
            </div>
          </Facet>
        </div>
      </div>

      <TwoFAModal open={!!releasingMilestoneId} action="Releasing milestone funds" error={twoFAError} onClose={() => setReleasingMilestoneId(null)} onConfirm={confirmRelease} />

      {showDispute && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(4,6,20,0.72)" }}>
          <div className="anim-in" style={{ width: 420, maxWidth: "90vw" }}>
            <Facet style={{ padding: 26 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="f-display" style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Flag a breach</span>
                <button onClick={() => setShowDispute(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={C.mutedDim} /></button>
              </div>
              <p className="f-body" style={{ fontSize: 12.5, color: C.muted, margin: "6px 0 14px" }}>
                Explain what condition wasn't met. Legion will lock any unreleased milestones and review evidence from both sides.
              </p>
              <textarea value={disputeText} onChange={(e) => setDisputeText(e.target.value)} rows={4} placeholder="Describe what happened..."
                className="f-body" style={{ width: "100%", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: 12, color: C.text, fontSize: 13.5, outline: "none", resize: "none" }} />
              <div className="flex gap-2.5 mt-5">
                <GhostBtn onClick={() => setShowDispute(false)}>Cancel</GhostBtn>
                <div style={{ flex: 1 }}>
                  <GradBtn full disabled={!disputeText.trim() || busy} onClick={submitDispute}>Submit to Legion</GradBtn>
                </div>
              </div>
            </Facet>
          </div>
        </div>
      )}
    </div>
  );
}
