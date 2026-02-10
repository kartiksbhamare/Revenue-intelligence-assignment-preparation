# Revenue Intelligence Console

A single-page Revenue Intelligence Console that helps a CRO answer: **"Why are we behind (or ahead) on revenue this quarter, and what should we focus on right now?"**

- **Backend**: TypeScript, Express, SQLite (in-memory), loading data from JSON under `/data`.
- **Frontend**: React, TypeScript, Material UI, D3 (charting only).
- **APIs**: `/api/summary`, `/api/drivers`, `/api/risk-factors`, `/api/recommendations`.

## Prerequisites

- Node.js 18+ (or 20+ recommended)
- npm (or pnpm/yarn)

## Quick start

### 1. Backend

```bash
cd backend
npm install
npm run build
npm start
```

API runs at **http://localhost:3001**. Data is loaded from the `data/` folder at project root (one level up from `backend/`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**. It calls the backend at `http://localhost:3001` by default. Override with:

```bash
VITE_API_URL=http://localhost:3001 npm run dev
```

### 3. Data

Place (or keep) the 5 JSON files in the **`data/`** folder at the repo root:

- `accounts.json`
- `activities.json`
- `deals.json`
- `reps.json`
- `targets.json`

The backend reads them on startup and seeds an in-memory SQLite database.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/summary` | Current quarter revenue, target, gap %, QoQ change |
| GET | `/api/drivers` | Pipeline size, win rate %, average deal size, sales cycle (days) |
| GET | `/api/risk-factors` | Stale deals, underperforming reps, low-activity accounts |
| GET | `/api/recommendations` | 3–5 actionable recommendation strings |

## Repo structure

```
/backend     – TypeScript API (Express + SQLite)
/frontend    – React + TypeScript (Vite, MUI, D3)
/data        – JSON data files
THINKING.md  – Assumptions, data issues, tradeoffs, scale, AI usage
README.md    – This file
```

## Reflection

See **THINKING.md** for assumptions, data issues, tradeoffs, what would break at 10× scale, and how AI was used vs own decisions.
