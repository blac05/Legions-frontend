import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Shield, Lock, Globe, ShieldCheck, Scale, Wallet, ArrowRight,
  CheckCircle2, Users, Percent, Landmark, CreditCard, Bitcoin, Sparkles,
} from "lucide-react";
import { C, GRAD, GRAD_SOFT, feeRate, fmtMoney } from "../theme.js";
import { Logo, Facet, GradBtn, GhostBtn, Pill } from "../components/ui.jsx";

const STEPS = [
  {
    icon: Users,
    title: "Agree on terms",
    body: "Depositor and beneficiary set the amount, milestones, and conditions together. Nothing is final until both sides accept.",
  },
  {
    icon: Wallet,
    title: "Fund the contract",
    body: "The depositor sends funds by bank, card, or crypto. Legion holds them — neither party can touch them alone.",
  },
  {
    icon: CheckCircle2,
    title: "Conditions get met",
    body: "Each milestone releases on its own once its conditions are confirmed, instead of waiting for the whole contract to finish.",
  },
  {
    icon: ShieldCheck,
    title: "Funds release, or Legion steps in",
    body: "Release requires 2FA confirmation. If something goes wrong, either party can flag a breach and Legion reviews it.",
  },
];

const TRUST_POINTS = [
  { icon: Shield, title: "ID-verified accounts", body: "Every party completes KYC before a contract can be created or accepted." },
  { icon: Lock, title: "Two-factor everywhere", body: "Fund releases and account recovery both require a second factor, not just a password." },
  { icon: Scale, title: "Monitored for breach", body: "Deadlines and conditions are tracked automatically — missed ones get flagged for review, not ignored." },
  { icon: Globe, title: "Works worldwide", body: "Deposit and payout methods don't need to match — pay by card, get paid in crypto, or any mix in between." },
];

const FUNDING_ICONS = [
  { icon: Landmark, label: "Bank transfer" },
  { icon: CreditCard, label: "Card" },
  { icon: Bitcoin, label: "Crypto" },
];

// Shared scroll-reveal animation. `once: true` means it plays the first time a
// section enters the viewport and doesn't replay on scroll-back, which reads as
// intentional rather than distracting on repeat visits.
const revealUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

function Reveal({ children, className, style, once = true, amount = 0.3 }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={revealUp}
    >
      {children}
    </motion.div>
  );
}

export default function Landing({ onGetStarted, onLogin }) {
  const prefersReducedMotion = useReducedMotion();

  // --- Interactive step-through: auto-advances, but a click takes over and
  // resets the timer, so it never fights the person looking at what they picked.
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    timerRef.current = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 4200);
    return () => clearInterval(timerRef.current);
  }, [activeStep, prefersReducedMotion]);

  const pickStep = (i) => {
    clearInterval(timerRef.current);
    setActiveStep(i);
  };

  // --- Interactive fee calculator, using the app's real fee logic so this
  // isn't just decorative - it's an honest preview of what a contract would cost.
  const [amount, setAmount] = useState(2500);
  const rate = feeRate(amount);
  const fee = amount * rate;
  const perParty = fee / 2;

  const ActiveIcon = STEPS[activeStep].icon;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }} className="f-body">
      {/* Nav */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto"
      >
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="f-body" style={{ background: "none", border: "none", color: C.muted, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            Log in
          </button>
          <GradBtn size="sm" icon={ArrowRight} onClick={onGetStarted}>Get started</GradBtn>
        </div>
      </motion.div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={prefersReducedMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-15%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,233,196,0.14), transparent 70%)", filter: "blur(10px)" }}
        />
        <motion.div
          animate={prefersReducedMotion ? undefined : { x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "10%", right: "-15%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(157,107,255,0.16), transparent 70%)", filter: "blur(10px)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-10 pb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex justify-center mb-6">
            <Pill tone="purple">
              <span className="inline-flex items-center gap-1.5">
                <motion.span
                  animate={prefersReducedMotion ? undefined : { opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }}
                />
                Escrow, secured — anywhere in the world
              </span>
            </Pill>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="f-display"
            style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 700, color: C.text, lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            The neutral third party<br />that holds funds until<br />the work is actually done.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="f-body"
            style={{ fontSize: 16, color: C.muted, maxWidth: 560, margin: "20px auto 0", lineHeight: 1.6 }}
          >
            Legion sits between depositor and beneficiary as the agent — verifying both sides,
            holding funds, and only releasing them once agreed conditions are met.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.46 }}
            className="flex items-center justify-center gap-3 mt-9 flex-wrap"
          >
            <motion.div whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.97 }}>
              <GradBtn icon={ArrowRight} onClick={onGetStarted}>Create your first contract</GradBtn>
            </motion.div>
            <motion.div whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.97 }}>
              <GhostBtn onClick={onLogin}>I already have an account</GhostBtn>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-1.5 mt-6"
          >
            <ShieldCheck size={13} color={C.mutedDim} />
            <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>ID-verified parties · 2FA-gated releases · Breach monitoring built in</span>
          </motion.div>
        </div>

        {/* Animated fund-flow strip: depositor -> Legion -> beneficiary */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between" style={{ position: "relative" }}>
            {[
              { label: "Depositor", icon: Wallet },
              { label: "Legion", icon: Shield, isAgent: true },
              { label: "Beneficiary", icon: CheckCircle2 },
            ].map((node, i) => (
              <div key={node.label} className="flex flex-col items-center gap-2" style={{ zIndex: 2 }}>
                <div style={{
                  width: node.isAgent ? 56 : 44, height: node.isAgent ? 56 : 44, borderRadius: 14,
                  background: node.isAgent ? GRAD : C.surface, border: node.isAgent ? "none" : `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <node.icon size={node.isAgent ? 24 : 18} color={node.isAgent ? "#04140f" : C.muted} />
                </div>
                <span className="f-body" style={{ fontSize: 11, color: C.mutedDim, fontWeight: 600 }}>{node.label}</span>
              </div>
            ))}
            <div style={{ position: "absolute", top: 22, left: 44, right: 44, height: 2, background: C.borderSoft, zIndex: 0 }} />
            {!prefersReducedMotion && (
              <motion.div
                animate={{ left: ["10%", "90%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                style={{ position: "absolute", top: 16, width: 14, height: 14, borderRadius: "50%", background: GRAD, boxShadow: `0 0 12px ${C.teal}`, zIndex: 1 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* How it works - interactive step-through */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <Reveal className="text-center mb-10">
          <span className="f-display" style={{ fontSize: 24, fontWeight: 700, color: C.text }}>How a Legion contract works</span>
          <p className="f-body" style={{ fontSize: 13, color: C.mutedDim, marginTop: 8 }}>Tap a step to explore it</p>
        </Reveal>

        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => pickStep(i)}
              className="f-body flex items-center gap-2"
              style={{
                padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${activeStep === i ? "transparent" : C.border}`,
                background: activeStep === i ? GRAD : "transparent",
                color: activeStep === i ? "#04140f" : C.muted,
                fontWeight: 700, fontSize: 12.5, transition: "background 0.2s, color 0.2s",
              }}
            >
              <span className="f-mono">{i + 1}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Facet style={{ padding: 32, maxWidth: 640, margin: "0 auto" }}>
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ width: 52, height: 52, borderRadius: 14, background: GRAD_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <ActiveIcon size={24} color={C.teal} />
                </motion.div>
                <div>
                  <span className="f-mono" style={{ fontSize: 11, color: C.mutedDim }}>Step {activeStep + 1} of {STEPS.length}</span>
                  <div className="f-display" style={{ fontSize: 19, fontWeight: 700, color: C.text }}>{STEPS[activeStep].title}</div>
                </div>
              </div>
              <p className="f-body" style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{STEPS[activeStep].body}</p>
            </Facet>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trust points */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <Reveal className="text-center mb-10">
          <span className="f-display" style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Built to prevent fraud, not just hold money</span>
        </Reveal>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {TRUST_POINTS.map((t) => (
            <motion.div
              key={t.title}
              variants={revealUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-4"
              style={{ padding: 16, borderRadius: 14 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: GRAD_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <t.icon size={18} color={C.teal} />
              </div>
              <div>
                <div className="f-display" style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t.title}</div>
                <p className="f-body" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{t.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Funding methods */}
      <Reveal className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <span className="f-display" style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Deposit and get paid your way</span>
        <p className="f-body" style={{ fontSize: 13, color: C.muted, margin: "10px 0 24px" }}>
          Fund by card, get paid in crypto — or any combination. Methods don't need to match.
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {FUNDING_ICONS.map((f) => (
            <motion.div key={f.label} whileHover={{ scale: 1.08, y: -3 }} className="flex flex-col items-center gap-2" style={{ cursor: "default" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <f.icon size={20} color={C.muted} />
              </div>
              <span className="f-body" style={{ fontSize: 12, color: C.mutedDim }}>{f.label}</span>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* Interactive fee calculator */}
      <Reveal className="max-w-2xl mx-auto px-6 pb-24">
        <Facet style={{ padding: 28 }}>
          <div className="flex items-center gap-2 mb-2">
            <Percent size={16} color={C.teal} />
            <span className="f-display" style={{ fontSize: 16, fontWeight: 700, color: C.text }}>See what your contract would cost</span>
          </div>
          <p className="f-body" style={{ fontSize: 12.5, color: C.muted, marginBottom: 22, lineHeight: 1.6 }}>
            Drag the slider — this is Legion's real fee schedule, tiered by size and split evenly between both parties.
          </p>

          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>Contract amount</span>
              <div className="f-display" style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{fmtMoney(amount)}</div>
            </div>
            <Pill tone="purple">{(rate * 100).toFixed(2)}% tier</Pill>
          </div>

          <input
            type="range" min={100} max={50000} step={50} value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.teal, cursor: "pointer" }}
          />

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div style={{ background: C.bg2, borderRadius: 12, padding: 16 }}>
              <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>Total fee</span>
              <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{fmtMoney(fee)}</div>
            </div>
            <div style={{ background: C.bg2, borderRadius: 12, padding: 16 }}>
              <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>Each party pays</span>
              <div className="f-display" style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>{fmtMoney(perParty)}</div>
            </div>
          </div>
        </Facet>
      </Reveal>

      {/* Final CTA */}
      <Reveal className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <span className="f-display" style={{ fontSize: 26, fontWeight: 700, color: C.text }}>Ready to secure your next deal?</span>
        <p className="f-body" style={{ fontSize: 13.5, color: C.muted, margin: "10px 0 26px" }}>
          Verification takes a couple of minutes. Your first contract can be live right after.
        </p>
        <div className="relative inline-block">
          {!prefersReducedMotion && (
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              style={{ position: "absolute", inset: -8, borderRadius: 16, background: GRAD, filter: "blur(16px)", zIndex: 0 }}
            />
          )}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ position: "relative", zIndex: 1 }}>
            <GradBtn icon={Sparkles} onClick={onGetStarted}>Get started for free</GradBtn>
          </motion.div>
        </div>
      </Reveal>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.borderSoft}` }} className="px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={20} />
          <span className="f-body" style={{ fontSize: 11.5, color: C.mutedDim }}>
            Legion acts as a neutral escrow agent. It is not a bank; funds are held per contract terms until conditions are met.
          </span>
        </div>
      </div>
    </div>
  );
}
