import React from "react";
import { Shield, Clock, AlertTriangle, Plus } from "lucide-react";
import { C, fmtMoney } from "../theme.js";
import { Facet, Pill, MilestoneBar } from "../components/ui.jsx";

export default function Dashboard({ escrows, setView, openEscrow, currentUserId }) {
  const totalOf = (e) => e.milestones.reduce((s, m) => s + m.amount, 0);
  const secured = escrows.reduce((a, e) => a + totalOf(e), 0);
  const active = escrows.filter((e) => e.status === "active" || e.status === "pending_agreement").length;
  const disputed = escrows.filter((e) => e.disputed).length;
  const stats = [
    { label: "Total secured", value: fmtMoney(secured), icon: Shield, tone: "good" },
    { label: "Active contracts", value: active, icon: Clock, tone: "purple" },
    { label: "Flagged disputes", value: disputed, icon: AlertTriangle, tone: disputed ? "danger" : "muted" },
  ];

  const roleOf = (e) => (e.depositor?.user === currentUserId || e.depositor?.email === currentUserId ? "depositor" : "beneficiary");
  const counterpartyOf = (e) => (roleOf(e) === "depositor" ? e.beneficiary : e.depositor);

  return (
    <div className="px-6 md:px-9 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Facet key={s.label} style={{ padding: 18 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="f-body" style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.tone === "danger" ? C.dangerDim : s.tone === "purple" ? C.purpleDim : C.tealDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={15} color={s.tone === "danger" ? C.danger : s.tone === "purple" ? C.purple : C.teal} />
              </div>
            </div>
            <div className="f-display" style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{s.value}</div>
          </Facet>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="f-display" style={{ fontSize: 15.5, fontWeight: 700, color: C.text }}>Your escrow contracts</span>
        <button onClick={() => setView("newEscrow")} className="f-body flex items-center gap-1.5" style={{ background: "none", border: "none", color: C.teal, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> New escrow
        </button>
      </div>

      {escrows.length === 0 && (
        <Facet style={{ padding: 40, textAlign: "center" }}>
          <div className="f-body" style={{ fontSize: 13.5, color: C.muted }}>No contracts yet. Start your first escrow to see it here.</div>
        </Facet>
      )}

      <div className="flex flex-col gap-3">
        {escrows.map((e) => {
          const cp = counterpartyOf(e);
          const total = totalOf(e);
          const releasedCount = e.milestones.filter((m) => m.released || m.refunded).length;
          return (
            <Facet key={e._id} className="cursor-pointer" style={{ padding: 20 }}>
              <div onClick={() => openEscrow(e._id)} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="f-mono" style={{ fontSize: 11.5, color: C.mutedDim }}>{e.legionId}</span>
                      {e.disputed && <Pill tone="danger">Disputed</Pill>}
                      {!e.disputed && e.status === "completed" && <Pill tone="good">Completed</Pill>}
                      {!e.disputed && e.status === "pending_agreement" && <Pill tone="warn">Awaiting agreement</Pill>}
                    </div>
                    <div className="f-display" style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{e.title}</div>
                    <div className="f-body" style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                      with {cp.name} · you are {roleOf(e) === "depositor" ? "the depositor" : "the beneficiary"} · {releasedCount}/{e.milestones.length} milestones settled
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{fmtMoney(total, e.currency)}</div>
                    <div className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>Due {e.deadline ? new Date(e.deadline).toLocaleDateString() : "—"}</div>
                  </div>
                </div>
                <MilestoneBar milestones={e.milestones} disputed={e.disputed} />
              </div>
            </Facet>
          );
        })}
      </div>
    </div>
  );
}
