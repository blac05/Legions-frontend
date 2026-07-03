import React, { useEffect, useState } from "react";
import { Scale, CheckCircle2 } from "lucide-react";
import { C, fmtMoney } from "../theme.js";
import { Facet, Pill } from "../components/ui.jsx";
import { api } from "../api/client.js";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myDisputes()
      .then((res) => setDisputes(res.disputes))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 md:px-9 pb-10">
      <Facet style={{ padding: 20, marginBottom: 20, background: C.warnDim, border: "none" }}>
        <div className="flex items-start gap-3">
          <Scale size={18} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="f-body" style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>
            Legion continuously monitors every contract's deadline and conditions. When a party misses a deadline
            or disputes a condition, funds are automatically locked and the case moves here for review — no funds
            move until it's resolved.
          </p>
        </div>
      </Facet>

      {loading && <div className="f-body" style={{ color: C.mutedDim, fontSize: 13 }}>Loading...</div>}

      {!loading && disputes.length === 0 && (
        <Facet style={{ padding: 40, textAlign: "center" }}>
          <CheckCircle2 size={26} color={C.teal} style={{ margin: "0 auto 10px" }} />
          <div className="f-body" style={{ fontSize: 13.5, color: C.muted }}>No active disputes. All your contracts are on track.</div>
        </Facet>
      )}

      {!loading && disputes.length > 0 && (
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
                  </div>
                  <Pill tone={d.status === "resolved" ? "good" : "danger"}>{d.status === "resolved" ? "Resolved" : "Under review"}</Pill>
                </div>
                <p className="f-body" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{d.reason}</p>
                {escrow && (
                  <div className="f-body" style={{ fontSize: 11.5, color: C.mutedDim, marginTop: 8 }}>
                    {fmtMoney(lockedAmount, escrow.currency)} locked · with {escrow.beneficiary?.name || escrow.depositor?.name}
                  </div>
                )}
              </Facet>
            );
          })}
        </div>
      )}
    </div>
  );
}
