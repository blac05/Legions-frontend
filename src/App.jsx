import React, { useEffect, useState } from "react";
import { C } from "./theme.js";
import { api, hasToken, clearToken } from "./api/client.js";
import { Sidebar, MobileNav, TopBar } from "./components/Shell.jsx";
import Auth from "./pages/Auth.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewEscrow from "./pages/NewEscrow.jsx";
import EscrowDetail from "./pages/EscrowDetail.jsx";
import Disputes from "./pages/Disputes.jsx";
import AdminConsole from "./pages/AdminConsole.jsx";
import SettingsView from "./pages/Settings.jsx";
import Landing from "./pages/Landing.jsx"; // Import your Landing page

export default function App() {
  const [phase, setPhase] = useState("loading"); // possible phases: loading, auth, onboarding, app, landing
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [escrows, setEscrows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const isAdmin = user?.role === "agent_admin";

  // Handle initial auth check with Landing page fallback
  useEffect(() => {
    if (!hasToken()) {
      // Show Landing page immediately if no token
      setPhase("landing");
      return;
    }
    api.me()
      .then(({ user }) => {
        setUser(user);
        setPhase(user.kycStatus === "unverified" ? "onboarding" : "app");
      })
      .catch(() => {
        clearToken();
        setPhase("auth");
      });
  }, []);

  // Load escrows when in app phase
  useEffect(() => {
    if (phase === "app") {
      api.listEscrows().then(({ escrows }) => setEscrows(escrows)).catch(() => {});
    }
  }, [phase]);

  const selected = escrows.find((e) => e._id === selectedId);

  const handleAuthed = (u) => {
    setUser(u);
    setPhase(u.kycStatus === "unverified" ? "onboarding" : "app");
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setPhase("auth");
  };

  // Handler for "Get Started" from Landing page
  const handleGetStarted = () => {
    setPhase("auth");
  };

  // Render based on phase
  if (phase === "loading") {
    return <div style={{ minHeight: "100vh", background: C.bg }} />;
  }
  if (phase === "auth") {
    return <Auth onAuthed={handleAuthed} onNeedsOnboarding={handleAuthed} />;
  }
  if (phase === "onboarding") {
    return (
      <Onboarding
        onComplete={async () => {
          const { user } = await api.me();
          setUser(user);
          setPhase("app");
        }}
      />
    );
  }
  if (phase === "landing") {
    return <Landing onGetStarted={handleGetStarted} onLogin={() => setPhase("auth")} />;
  }
  // Main app view
  return (
    <div className="flex" style={{ minHeight: "100vh", background: C.bg }}>
      <Sidebar view={view} setView={(v) => { setView(v); setSelectedId(null); }} onLogout={handleLogout} isAdmin={isAdmin} />
      <div style={{ flex: 1, minWidth: 0 }} className="overflow-y-auto scrollbar-none">
        {view === "dashboard" && (
          <>
            <TopBar title="Dashboard" sub="Every contract, secured until conditions are met." user={user} />
            <Dashboard
              escrows={escrows}
              setView={setView}
              currentUserId={user.id}
              openEscrow={(id) => { setSelectedId(id); setView("escrowDetail"); }}
            />
          </>
        )}
        {view === "newEscrow" && (
          <>
            <TopBar title="New escrow contract" sub="Both parties must agree before funds move." user={user} />
            <NewEscrow
              onCreated={(escrow) => {
                setEscrows((prev) => [escrow, ...prev]);
                setSelectedId(escrow._id);
                setView("escrowDetail");
              }}
            />
          </>
        )}
        {view === "escrowDetail" && selected && (
          <>
            <TopBar title="Contract detail" sub={selected.legionId} user={user} />
            <EscrowDetail
              escrow={selected}
              currentUserId={user.id}
              onBack={() => setView("dashboard")}
              onUpdated={(updated) => {
                setEscrows((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
              }}
            />
          </>
        )}
        {view === "disputes" && (
          <>
            <TopBar title="Disputes & breach monitoring" sub="Automatically flagged, manually reviewed." user={user} />
            <Disputes />
          </>
        )}
        {view === "admin" && isAdmin && (
          <>
            <TopBar title="Admin Console" sub="Legion's agent-side dispute resolution queue." user={user} />
            <AdminConsole />
          </>
        )}
        {view === "settings" && (
          <>
            <TopBar title="Settings" sub="Profile, security and fees." user={user} />
            <SettingsView user={user} />
          </>
        )}
      </div>
      <MobileNav view={view} setView={(v) => { setView(v); setSelectedId(null); }} isAdmin={isAdmin} />
    </div>
  );
}