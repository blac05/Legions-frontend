# Legion Frontend

React + Vite + Tailwind client for the Legion escrow app, wired to the backend API.

## Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

## Deploying to Vercel

1. Push this folder to its own GitHub repo (or set the project root to `frontend/`).
2. Import into Vercel, framework preset **Vite**.
3. Add environment variable `VITE_API_URL` pointing at your deployed Render backend,
   e.g. `https://legion-backend.onrender.com/api`.
4. Deploy.

## Structure

```
src/
  api/client.js       fetch wrapper for every backend endpoint
  theme.js             shared design tokens (colors, gradients, fee logic)
  components/ui.jsx    shared UI primitives (buttons, inputs, milestone bar, 2FA modal)
  components/Shell.jsx sidebar + top bar + mobile nav (shows Admin Console if role === agent_admin)
  pages/
    Auth.jsx           login / signup
    Onboarding.jsx      KYC intake + 2FA enrollment
    Dashboard.jsx       escrow list + stats + per-contract milestone progress
    NewEscrow.jsx       4-step wizard: parties → milestones (each with its own amount + conditions) → funding → review
    EscrowDetail.jsx    per-milestone condition checklists, 2FA-gated release per milestone, breach flagging
    Disputes.jsx        a user's own breach/dispute history
    AdminConsole.jsx    agent-side queue to review and resolve disputes (only visible to agent_admin accounts)
    Settings.jsx        profile, 2FA status, fee schedule
  App.jsx              routing between the phases above
```

This talks to the real backend for auth, KYC submission, 2FA, and the full escrow
lifecycle. Actual money movement depends on which payment/crypto/KYC providers you
wire up on the backend — see the backend README for details.

To see the Admin Console, register/log in with an email listed in the backend's
`ADMIN_EMAILS` environment variable.
