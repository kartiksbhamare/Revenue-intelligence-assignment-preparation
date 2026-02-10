# SkyGeni – Revenue Intelligence Console

A single-page **Revenue Intelligence Console** that helps a Chief Revenue Officer (CRO) answer:

> *"Why are we behind (or ahead) on revenue this quarter, and what should we focus on right now?"*

Built with **React + TypeScript** (frontend) and **TypeScript** (backend), using **Material UI** and **D3** for the UI and charts.

---

## Features

- **QTD revenue summary** – Current quarter revenue vs target, gap %, and QoQ change in a clear banner
- **Revenue drivers** – Pipeline value, win rate, average deal size, and sales cycle with trend sparklines and period-over-period change
- **Top risk factors** – Stale deals (no activity 30+ days), underperforming reps (win rate below team average), and low-activity accounts
- **Recommended actions** – 3–5 actionable suggestions (e.g. focus on Enterprise deals, coach specific reps, increase activity by segment)
- **Revenue trend (last 6 months)** – Bar chart for monthly revenue and line for monthly target

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Frontend | React 18, TypeScript, Vite, Material UI (MUI), D3 |
| Backend  | Node.js, Express, TypeScript |
| Data     | SQLite (in-memory), seeded from JSON in `/data` |

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (or pnpm / yarn)

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/kartiksbhamare/Revenue-intelligence-assignment-preparation.git
cd Revenue-intelligence-assignment-preparation
```

### 2. Run the backend

```bash
cd backend
npm install
npm run build
npm start
```

The API runs at **http://localhost:3001**. On startup it loads the JSON files from the `data/` folder (at the repo root) into an in-memory SQLite database.

### 3. Run the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173** and uses the backend at `http://localhost:3001` by default.

To point to another API URL:

```bash
VITE_API_URL=http://localhost:3001 npm run dev
```

### 4. Data

The backend expects these 5 JSON files in the **`data/`** folder at the repo root:

| File            | Description                |
|-----------------|----------------------------|
| `accounts.json` | Customer accounts          |
| `activities.json` | Calls, emails, demos     |
| `deals.json`    | Sales deals (stage, amount, dates) |
| `reps.json`     | Sales representatives      |
| `targets.json`  | Monthly revenue targets    |

They are already included in this repo under `data/`.

---

## API reference

All endpoints return JSON. Base URL: `http://localhost:3001`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summary` | Current quarter revenue, target, gap %, QoQ change (or N/A) |
| GET | `/api/drivers` | Pipeline size, win rate %, avg deal size, sales cycle (days), and change vs previous quarter |
| GET | `/api/risk-factors` | Stale deals, underperforming reps, low-activity accounts |
| GET | `/api/recommendations` | 3–5 actionable recommendation strings |
| GET | `/api/revenue-trend` | Last 6 months: labels, revenue per month, target per month (for the trend chart) |

---

## Project structure

```
Revenue-intelligence-assignment-preparation/
├── backend/           # TypeScript API (Express + SQLite)
│   ├── src/
│   │   ├── config.ts
│   │   ├── db.ts
│   │   ├── index.ts
│   │   ├── routes/    # summary, drivers, risk-factors, recommendations, revenue-trend
│   │   └── utils/
│   └── package.json
├── frontend/          # React + TypeScript (Vite, MUI, D3)
│   ├── src/
│   │   ├── components/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   └── types.ts
│   └── package.json
├── data/              # JSON data (accounts, activities, deals, reps, targets)
├── THINKING.md        # Assumptions, data issues, tradeoffs, scale, AI usage
└── README.md          # This file
```

---

## Reflection and design choices

See **THINKING.md** for:

1. Assumptions (e.g. current quarter, stale-deal threshold, underperforming-rep definition)
2. Data issues found (nulls, future dates, etc.)
3. Tradeoffs (in-memory SQLite, rule-based recommendations)
4. What would break at 10× scale
5. What AI helped with vs what was decided manually

---

## License

This project was built as an assignment. Use as needed for evaluation or reference.
