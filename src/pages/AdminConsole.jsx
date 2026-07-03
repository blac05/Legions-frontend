import React, { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, X } from "lucide-react";
import { C, fmtMoney } from "../theme.js";
import { Facet, Pill, GradBtn, GhostBtn } from "../components/ui.jsx";
import { api } from "../api/client.js";

export default function AdminConsole() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [resolvingId, setResolvingId] = useState(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.allDisputes(filter === "all" ? undefined : filter)
      .then((res) => setDisputes(res.disputes))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const resolve = async (id, resolution) => {
    setBusy(true);
    try {
      await api.resolveDispute(id, resolution, notes);
      setResolvingId(null);
      setNotes("");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 md:px-9 pb-10">
      <Facet style={{ padding: 20, marginBottom: 20, background: C.purpleDim, border: "none" }}>
        <div className="flex items-start gap-3">
          <ShieldAlert size={18} color={C.purple} style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="f-body" style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>
            As Legion's agent, you review flagged breaches and decide how remaining, unreleased milestone funds
            are handled. Resolutions are final and immediately trigger the corresponding payout or refund flow.
          </p>
        </div>
      </Facet>

      <div className="flex gap-2 mb-5">
        {["open", "under_review", "resolved", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="f-body" style={{
            padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${filter === f ? "transparent" : C.border}`,
            background: filter === f ? "linear-gradient(135deg,#2fe9c4,#9d6bff)" : "transparent",
            color: filter === f ? "#04140f" : C.muted,
          }}>
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading && <div className="f-body" style={{ color: C.mutedDim, fontSize: 13 }}>Loading...</div>}

      {!loading && disputes.length === 0 && (
        <Facet style={{ padding: 40, textAlign: "center" }}>
          <CheckCircle2 size={26} color={C.teal} style={{ margin: "0 auto 10px" }} />
          <div className="f-body" style={{ fontSize: 13.5, color: C.muted }}>Nothing in this queue.</div>
        </Facet>
      )}

      <div className="flex flex-col gap-3">
        {disputes.map((d) => {
          const escrow = d.escrow;
          const unreleased = escrow?.milestones?.filter((m) => !m.released) || [];
          const lockedAmount = unreleased.reduce((s, m) => s + m.amount, 0);
          return (
            <Facet key={d._id} style={{ padding: 20 }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="f-mono" style={{ fontSize: 11, color: C.mutedDim }}>{escrow?.legionId}</span>
                  <div className="f-display" style={{ fontSize: 15.5, fontWeight: 700, color: C.text }}>{escrow?.title}</div>
                  <div className="f-body" style={{ fontSize: 12, color: C.mutedDim, marginTop: 2 }}>
                    {escrow?.depositor?.name} → {escrow?.beneficiary?.name}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Pill tone={d.status === "resolved" ? "good" : "danger"}>{d.status.replace("_", " ")}</Pill>
                  {d.autoFlagged && <Pill tone="warn">Auto-flagged</Pill>}
                </div>
              </div>
              <p className="f-body" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{d.reason}</p>
              <div className="f-body" style={{ fontSize: 11.5, color: C.mutedDim, marginBottom: 12 }}>
                {fmtMoney(lockedAmount, escrow?.currency)} locked across {unreleased.length} unreleased milestone(s)
              </div>

              {d.status === "resolved" ? (
                <div className="f-body" style={{ fontSize: 12, color: C.mutedDim }}>
                  Resolved: <span style={{ color: C.text, fontWeight: 600 }}>{d.resolution?.replace(/_/g, " ")}</span>
                  {d.resolutionNotes && ` — "${d.resolutionNotes}"`}
                </div>
              ) : resolvingId === d._id ? (
                <div className="flex flex-col gap-2.5">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Resolution notes (visible in the audit trail)..."
                    className="f-body" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, color: C.text, fontSize: 12.5, outline: "none", resize: "none" }} />
                  <div className="flex flex-wrap gap-2">
                    <GradBtn size="sm" disabled={busy} onClick={() => resolve(d._id, "release_to_beneficiary")}>Release to beneficiary</GradBtn>
                    <GhostBtn onClick={() => resolve(d._id, "refund_depositor")}>Refund depositor</GhostBtn>
                    <GhostBtn onClick={() => resolve(d._id, "split")}>Mark for split</GhostBtn>
                    <button onClick={() => { setResolvingId(null); setNotes(""); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <X size={16} color={C.mutedDim} />
                    </button>
                  </div>
                </div>
              ) : (
                <GhostBtn onClick={() => setResolvingId(d._id)}>Review & resolve</GhostBtn>
              )}
            </Facet>
          );
        })}
      </div>
    </div>
  );
}
