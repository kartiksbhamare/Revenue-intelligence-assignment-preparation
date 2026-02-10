# THINKING.md – Revenue Intelligence Console

## 1. What assumptions did you make?

- **Current quarter**: The "as of" date is fixed as **2025-02-10**, so the current quarter is **Q1 2025 (Jan–Mar)**. All metrics (revenue, target, win rate, sales cycle) are computed for this quarter. This could be made configurable via env or API query param.
- **Revenue**: Only deals with `stage = 'Closed Won'` and `closed_at` within the current quarter count toward revenue. **Null `amount`** is treated as **0** (so we don't inflate revenue; lost deals with null amount don't affect totals).
- **Target**: Quarterly target is the sum of the three monthly targets from `targets.json` for the quarter.
- **Stale deals**: Deals in Prospecting or Negotiation with **no activity in the last 30 days** (or whose latest activity is older than 30 days). If a deal has no activities at all, we use `created_at` as the reference date.
- **Underperforming reps**: Reps whose **win rate** (Closed Won / (Closed Won + Closed Lost)) in the current quarter is **below 80% of the team average** win rate.
- **Low activity accounts**: Accounts that have at least one open deal (Prospecting/Negotiation) but **fewer than 2 activities** in the last 30 days.
- **Sales cycle**: Average number of days between `created_at` and `closed_at` for **Closed Won** deals in the current quarter; deals with null `closed_at` or `created_at` are excluded.
- **QoQ change**: We use **quarter-over-quarter** (previous quarter vs current quarter) for the summary, not YoY, since the data is one year and QoQ is more actionable.

## 2. What data issues did you find?

- **Null amounts**: Many deals have `amount: null`. We treat them as 0 in sums and exclude them when computing average deal size so the average is not skewed.
- **Null closed_at**: Open deals (Prospecting/Negotiation) have `closed_at: null`; that's expected. For Closed Won/Closed Lost, some rows may have null `closed_at` (data inconsistency); we only include deals with non-null `closed_at` in quarter revenue and win-rate calculations.
- **Future closed_at**: At least one deal (e.g. D8) has `closed_at` in **2026**. We did not filter these out explicitly; if such a date falls in "current quarter" it would be included. For a production system we’d add a sanity check (e.g. `closed_at <= as_of_date`).
- **Orphan activities**: Some `activities` rows may reference `deal_id` that don’t exist in `deals` (if data was merged from multiple systems). Our risk-factor queries join through deals, so orphan activities don’t affect results; they’re just not attributed to any deal.
- **Segment/industry**: We assume `accounts.segment` and `accounts.industry` are consistent; recommendations use segment (e.g. Enterprise, Mid-Market) as provided.

## 3. What tradeoffs did you choose?

- **SQLite in-memory**: We load all JSON into an in-memory SQLite database at startup. Tradeoff: simple, no external DB, reproducible; downside: no persistence, full reload on restart, and not suitable for large data.
- **Rule-based recommendations**: Recommendations are derived from the same risk and driver logic (e.g. "Focus on Enterprise deals older than 30 days" from stale-deal + segment). Tradeoff: transparent and deterministic; we did not use ML or external models.
- **Single "as of" date**: The quarter and all metrics are fixed to one date. Tradeoff: simple and consistent; alternative would be "today" or a query parameter for different report dates.
- **Frontend**: One page, all four sections loaded in parallel. No pagination on risk-factor tables (we cap at 20–50 rows). Tradeoff: fast to build and good for a demo; at scale we’d add pagination and maybe lazy load.

## 4. What would break at 10× scale?

- **Backend**: Loading all JSON into memory and running SQLite in-memory would become slow and memory-heavy. **Mitigation**: Use a real DB (e.g. Postgres), load data via batch jobs, and run queries against indexed tables.
- **Risk-factor lists**: Returning hundreds of stale deals or low-activity accounts in one response would be slow and heavy. **Mitigation**: Paginate (e.g. `?page=1&limit=20`) and add filters.
- **No caching**: Every API call recomputes from the DB. **Mitigation**: Cache summary/drivers (e.g. Redis or in-process) with a short TTL; refresh when data is updated.
- **Frontend**: Rendering very large tables would hurt performance. **Mitigation**: Virtualized tables, pagination, and lazy loading for tabs.

## 5. What did AI help with vs what you decided?

- **AI helped with**: Scaffolding the backend (Express, SQLite schema, route structure), D3 bar chart structure and scaling, and MUI layout (Grid, Card, Tabs). Also phrasing for THINKING.md sections.
- **I decided**: The exact API response shapes, the definitions of "stale" (30 days), "underperforming" (80% of team win rate), and "low activity" (fewer than 2 activities in 30 days). I also chose QoQ over YoY, in-memory SQLite for simplicity, and the rule-based recommendation logic and wording. Data quality handling (nulls, future dates) and the choice of which metrics to expose were also my decisions.
