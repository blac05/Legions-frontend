export const C = {
  bg: "#070a1e",
  bg2: "#0c1030",
  surface: "#11163a",
  surfaceHi: "#171d4a",
  border: "#242b5c",
  borderSoft: "#1a2049",
  teal: "#2fe9c4",
  tealDim: "rgba(47,233,196,0.14)",
  purple: "#9d6bff",
  purpleDim: "rgba(157,107,255,0.14)",
  text: "#eef1ff",
  muted: "#8891c2",
  mutedDim: "#5c6494",
  danger: "#ff6b6b",
  dangerDim: "rgba(255,107,107,0.12)",
  warn: "#ffc15e",
  warnDim: "rgba(255,193,94,0.12)",
  good: "#2fe9c4",
};

export const GRAD = `linear-gradient(135deg, ${C.teal} 0%, ${C.purple} 100%)`;
export const GRAD_SOFT = `linear-gradient(135deg, ${C.tealDim} 0%, ${C.purpleDim} 100%)`;

export const STAGES = ["Created", "Funded", "In Progress", "Conditions Met", "Released"];

export const FUNDING_METHODS = [
  { id: "bank", label: "Bank Transfer", sub: "SWIFT / ACH / SEPA" },
  { id: "card", label: "Debit / Credit Card", sub: "Visa · Mastercard" },
  { id: "crypto", label: "Crypto", sub: "BTC · ETH · USDT" },
];

export const COUNTRIES = [
  "United States", "United Kingdom", "Nigeria", "Ghana", "UAE",
  "Germany", "India", "Singapore", "South Africa", "Brazil",
];

export function fmtMoney(n, cur = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(n || 0);
}

export function feeRate(amount) {
  if (amount < 1000) return 0.025;
  if (amount < 25000) return 0.015;
  return 0.0075;
}
