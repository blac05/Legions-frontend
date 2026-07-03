import React from "react";
import { Percent } from "lucide-react";
import { C, GRAD } from "../theme.js";
import { Facet, Pill } from "../components/ui.jsx";

export default function SettingsView({ user }) {
  const tiers = [
    { range: "Under $1,000", rate: "2.5%" },
    { range: "$1,000 – $25,000", rate: "1.5%" },
    { range: "Above $25,000", rate: "0.75%" },
  ];
  return (
    <div className="px-6 md:px-9 pb-10 flex flex-col gap-5" style={{ maxWidth: 640 }}>
      <Facet style={{ padding: 22 }}>
        <div className="f-display" style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Profile</div>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: GRAD }} />
          <div>
            <div className="f-body" style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{user?.fullName}</div>
            <div className="f-body" style={{ fontSize: 12, color: C.mutedDim }}>{user?.email} · {user?.phone}</div>
          </div>
          <Pill tone={user?.kycStatus === "verified" ? "good" : "warn"}>
            {user?.kycStatus === "verified" ? "ID Verified" : "KYC " + (user?.kycStatus || "pending")}
          </Pill>
        </div>
      </Facet>

      <Facet style={{ padding: 22 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="f-display" style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Two-factor authentication</div>
          <Pill tone={user?.twoFAEnabled ? "good" : "warn"}>{user?.twoFAEnabled ? "Enabled" : "Not enabled"}</Pill>
        </div>
        <p className="f-body" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
          Required to release funds or change contract terms.
        </p>
      </Facet>

      <Facet style={{ padding: 22 }}>
        <div className="flex items-center gap-2 mb-2">
          <Percent size={16} color={C.teal} />
          <div className="f-display" style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Legion's fee schedule</div>
        </div>
        <p className="f-body" style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
          One disclosed fee per contract, split evenly between both parties. No setup fees, no charges on contracts cancelled before funding.
        </p>
        {tiers.map((t) => (
          <div key={t.range} className="flex justify-between items-center" style={{ padding: "9px 0", borderTop: `1px solid ${C.borderSoft}` }}>
            <span className="f-body" style={{ fontSize: 13, color: C.muted }}>{t.range}</span>
            <span className="f-body" style={{ fontSize: 13, color: C.teal, fontWeight: 700 }}>{t.rate}</span>
          </div>
        ))}
      </Facet>
    </div>
  );
}
