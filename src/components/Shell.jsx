import React from "react";
import { Home, Plus, Scale, Settings, LogOut, ShieldAlert } from "lucide-react";
import { C, GRAD } from "../theme.js";
import { Logo, Pill } from "../components/ui.jsx";

export function Sidebar({ view, setView, onLogout, isAdmin }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "newEscrow", label: "New Escrow", icon: Plus },
    { id: "disputes", label: "Disputes", icon: Scale },
    ...(isAdmin ? [{ id: "admin", label: "Admin Console", icon: ShieldAlert }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <div className="hidden md:flex flex-col justify-between" style={{ width: 224, borderRight: `1px solid ${C.borderSoft}`, padding: "22px 16px", flexShrink: 0 }}>
      <div>
        <div className="mb-9 px-1"><Logo size={24} /></div>
        <div className="flex flex-col gap-1">
          {items.map((it) => {
            const active = view === it.id;
            return (
              <button key={it.id} onClick={() => setView(it.id)} className="f-body flex items-center gap-3"
                style={{ padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? C.surfaceHi : "transparent", color: active ? C.text : C.muted, fontWeight: 600, fontSize: 13.5 }}>
                <it.icon size={16} color={active ? C.teal : C.mutedDim} />
                {it.label}
              </button>
            );
          })}
        </div>
      </div>
      <button onClick={onLogout} className="f-body flex items-center gap-3" style={{ padding: "10px 12px", background: "none", border: "none", color: C.mutedDim, fontSize: 13, cursor: "pointer" }}>
        <LogOut size={15} /> Log out
      </button>
    </div>
  );
}

export function MobileNav({ view, setView, isAdmin }) {
  const items = [["dashboard", Home], ["newEscrow", Plus], ["disputes", Scale], ...(isAdmin ? [["admin", ShieldAlert]] : []), ["settings", Settings]];
  return (
    <div className="flex md:hidden fixed bottom-0 left-0 right-0 justify-around items-center" style={{ background: C.surface, borderTop: `1px solid ${C.borderSoft}`, padding: "10px 0" }}>
      {items.map(([id, Icon]) => (
        <button key={id} onClick={() => setView(id)} style={{ background: "none", border: "none" }}>
          <Icon size={20} color={view === id ? C.teal : C.mutedDim} />
        </button>
      ))}
    </div>
  );
}

export function TopBar({ title, sub, user }) {
  return (
    <div className="flex items-center justify-between px-6 md:px-9 pt-7 pb-5">
      <div>
        <div className="f-display" style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{title}</div>
        {sub && <div className="f-body" style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div className="flex items-center gap-2" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 12px 6px 6px" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: GRAD }} />
        <span className="f-body" style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{user?.fullName?.split(" ")[0] || "You"}</span>
        <Pill tone={user?.kycStatus === "verified" ? "good" : "warn"}>{user?.kycStatus === "verified" ? "Verified" : "Pending KYC"}</Pill>
        {user?.role === "agent_admin" && <Pill tone="purple">Agent</Pill>}
      </div>
    </div>
  );
}
