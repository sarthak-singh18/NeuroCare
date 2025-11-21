# NeuraCare — AI Burnout Detection Platform

NeuraCare is a local-first burnout detection and wellness coaching experience built for therapists, coaches, and overstretched professionals. It combines lightweight AI sentiment analysis with structured self-care routines, giving you actionable insights without shipping any sensitive data off-device.

## ✨ Key Capabilities

- **Real-time sentiment analysis** — Parses journal entries, check-ins, or meeting notes to score stress, exhaustion, and positivity trends.
- **Personalized journeys** — Tailors nudges, micro-goals, and follow-up questions to each user’s coping style and engagement pattern.
- **Privacy-first compliance layer** — Keeps all text locally, supports pseudonymization, and ships with consent + retention boilerplate to help teams meet HIPAA/GDPR best practices.
- **Digital detox & breathing helpers** — Surfaces guided box breathing, mindful pausing, or device-detox timers whenever strain indicators spike.

## ✅ Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** (comes with Node; required for both the server and client)

## 🚀 Getting Started

Inside the project root, install dependencies and launch each service in its own terminal tab:

```bash
cd server && npm install && npm run dev
```

```bash
cd client && npm install && npm run dev
```

> The backend will default to `http://localhost:5000`, and the Vite-powered frontend runs at `http://localhost:5173`.

## 🗂️ Project Structure (planned)

```
NeuraCare/
├── README.md                    # You are here
├── client/                      # React + Vite frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root layout + routing
│       ├── components/
│       │   ├── SentimentGauge.jsx
│       │   ├── BreathCoach.jsx
│       │   └── DetoxCard.jsx
│       └── services/api.js      # REST helpers for server calls
├── server/                      # Node/Express API
│   ├── package.json
│   ├── src/
│   │   ├── index.js             # Express bootstrap + routes
│   │   ├── routes/
│   │   │   └── wellness.routes.js
│   │   ├── controllers/
│   │   │   └── sentiment.controller.js
│   │   ├── services/
│   │   │   └── analyzer.service.js
│   │   └── middleware/privacy.js
│   └── .env.example             # Local-only secrets
└── docs/                        # Future architecture + compliance notes
```

## 🔬 Quick Smoke Tests

1. **Frontend:** once the client dev server is running, open <http://localhost:5173> and ensure the onboarding dashboard renders without console errors.
2. **Backend:** hit <http://localhost:5000/api/health> in a browser or `curl` to validate the Express health route responds with `{ status: "ok" }` (or similar JSON).

## 🔐 Privacy & Local-Only Operation

- All inference, journaling data, and analytics stay on the user’s device; no cloud calls are required for baseline functionality.
- Ship only privacy-safe metrics if you later add telemetry, and gate every outbound network call behind explicit opt-in consent.
- Default `.env` templates are scoped to localhost keys so accidental commits never leak secrets.
- When running outside of local prototyping, lock down `server/data/db.json` with OS file permissions (e.g., `chmod 600`) and place the API behind TLS and encrypted disks/volumes.
- See [`PRIVACY.md`](PRIVACY.md) for retention rules, export/delete details, and operator responsibilities.
- Encourage users to run audits locally (e.g., `npm run lint`, `npm run test`) before packaging any build artifacts for deployment.

## 🧭 Next Steps

- Implement the sentiment scoring microservice inside `server/services/analyzer.service.js`.
- Build React hooks for journaling inputs, breathing timers, and personalization settings.
- Add automated tests (Vitest + Supertest) to keep the wellness logic trustworthy.

## 🧪 Sleek Experience Audit Prompt

Use the following prompt when auditing or extending NeuraCare to keep the experience polished, responsive, and judge-ready:

> **Audit every feature and navigation (menu, privacy panels, profile/preferences, insights) for:**
> - Robust validation with animated error feedback for incomplete/invalid entries
> - Consistent state indicators highlighting the active nav item and visually distinct disabled/enabled buttons
> - Animated menu and modal transitions (fade, slide, or scale) tuned between 250–350ms
> - Loading spinner/progress when running burnout analysis, plus an animated Insights panel update
> - Clear confirmation and feedback (with animation) for privacy/export/delete actions
> - Animated toggle/switch state changes and a smooth scroll-to-insights link
> - Hover/click/focus animations for tactile response across all buttons/inputs
> - Edge case resilience (rapid clicking, long text, empty input, navigation interruptions)
> - Complete keyboard accessibility with visible focus rings and accurate aria-labels
> - Mobile responsiveness from 320px+ in both portrait and landscape orientations

**Goal:** Deliver a visually polished, resourceful hackathon app with smooth, responsive animations and zero friction—so every judge experiences the product’s value instantly.