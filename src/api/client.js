const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("legion_token");
}

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
  submitKyc: (formData) => request("/auth/kyc", { method: "POST", body: formData, isForm: true }),
  setup2FA: () => request("/auth/2fa/setup", { method: "POST" }),
  verify2FA: (token) => request("/auth/2fa/verify", { method: "POST", body: { token } }),
  challenge2FA: (token) => request("/auth/2fa/challenge", { method: "POST", body: { token } }),
  regenerateBackupCodes: (token) => request("/auth/2fa/backup-codes/regenerate", { method: "POST", body: { token } }),
  forgotPassword: (email) => request("/auth/password/forgot", { method: "POST", body: { email } }),
  resetPassword: (payload) => request("/auth/password/reset", { method: "POST", body: payload }),
  verifyEmail: (payload) => request("/auth/email/verify", { method: "POST", body: payload }),
  resendVerificationEmail: () => request("/auth/email/resend", { method: "POST" }),

  // escrows
  createEscrow: (payload) => request("/escrows", { method: "POST", body: payload }),
  listEscrows: () => request("/escrows"),
  getEscrow: (id) => request(`/escrows/${id}`),
  agreeToEscrow: (id) => request(`/escrows/${id}/agree`, { method: "POST" }),
  toggleCondition: (id, milestoneId, conditionId) =>
    request(`/escrows/${id}/milestones/${milestoneId}/conditions/${conditionId}`, { method: "PATCH" }),
  releaseMilestone: (id, milestoneId, twoFAToken) =>
    request(`/escrows/${id}/milestones/${milestoneId}/release`, { method: "POST", body: { twoFAToken } }),
  flagBreach: (id, reason, milestoneId) =>
    request(`/escrows/${id}/dispute`, { method: "POST", body: { reason, milestoneId } }),

  // disputes
  myDisputes: () => request("/disputes/mine"),
  allDisputes: (status) => request(`/disputes${status ? `?status=${status}` : ""}`),
  resolveDispute: (id, resolution, notes, splitPercent) =>
    request(`/disputes/${id}/resolve`, { method: "POST", body: { resolution, notes, splitPercent } }),
};

export function saveToken(token) {
  localStorage.setItem("legion_token", token);
}
export function clearToken() {
  localStorage.removeItem("legion_token");
}
export function hasToken() {
  return !!getToken();
}