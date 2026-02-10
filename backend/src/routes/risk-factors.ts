import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { AS_OF_DATE, STALE_DAYS, LOW_ACTIVITY_THRESHOLD, UNDERPERFORMING_WIN_RATE_THRESHOLD } from '../config.js';
import { closedAtInQuarter } from '../utils/quarter.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const closedThisQ = closedAtInQuarter('closed_at', AS_OF_DATE);
  const asOf = AS_OF_DATE;

  // Stale deals: Prospecting or Negotiation, no activity in last STALE_DAYS
  const staleDeals = db
    .prepare(
      `
    WITH latest_activity AS (
      SELECT deal_id, MAX(timestamp) as last_ts
      FROM activities
      GROUP BY deal_id
    )
    SELECT d.deal_id, d.account_id, d.rep_id, r.name as rep_name, d.amount,
           julianday(?) - julianday(COALESCE(la.last_ts, d.created_at)) as days_since_activity
    FROM deals d
    LEFT JOIN latest_activity la ON d.deal_id = la.deal_id
    LEFT JOIN reps r ON r.rep_id = d.rep_id
    WHERE d.stage IN ('Prospecting', 'Negotiation')
      AND (julianday(?) - julianday(COALESCE(la.last_ts, d.created_at)) > ?)
    ORDER BY days_since_activity DESC
    LIMIT 50
  `
    )
    .all(asOf, asOf, STALE_DAYS) as Array<{
    deal_id: string;
    account_id: string;
    rep_id: string;
    rep_name: string | null;
    amount: number | null;
    days_since_activity: number;
  }>;

  // Underperforming reps: win rate in quarter below threshold of team average
  const teamAvg = db
    .prepare(
      `SELECT
         CAST(SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) AS REAL) / NULLIF(SUM(CASE WHEN stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END), 0) as avgWinRate
       FROM deals
       WHERE (stage = 'Closed Won' OR stage = 'Closed Lost') AND ${closedThisQ}`
    )
    .get() as { avgWinRate: number | null };
  const teamWinRate = teamAvg?.avgWinRate ?? 0;
  const minWinRate = teamWinRate * UNDERPERFORMING_WIN_RATE_THRESHOLD;

  const repRates = db
    .prepare(
      `SELECT d.rep_id,
         SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
         SUM(CASE WHEN d.stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
       FROM deals d
       WHERE (d.stage = 'Closed Won' OR d.stage = 'Closed Lost') AND ${closedThisQ}
       GROUP BY d.rep_id`
    )
    .all() as Array<{ rep_id: string; won: number; lost: number }>;

  const underperformingReps: Array<{ rep_id: string; name: string; winRatePercent: number; teamAvgPercent: number }> = [];
  for (const r of repRates) {
    const total = r.won + r.lost;
    if (total === 0) continue;
    const winRate = r.won / total;
    if (teamWinRate > 0 && winRate < minWinRate) {
      const nameRow = db.prepare('SELECT name FROM reps WHERE rep_id = ?').get(r.rep_id) as { name: string } | undefined;
      underperformingReps.push({
        rep_id: r.rep_id,
        name: nameRow?.name ?? r.rep_id,
        winRatePercent: Math.round((winRate * 100) * 100) / 100,
        teamAvgPercent: Math.round((teamWinRate * 100) * 100) / 100,
      });
    }
  }

  // Low activity accounts: have open deals (Prospecting/Negotiation) but < LOW_ACTIVITY_THRESHOLD activities in last 30 days
  const lowActivityAccounts = db
    .prepare(
      `
    WITH open_deals AS (
      SELECT DISTINCT account_id FROM deals WHERE stage IN ('Prospecting', 'Negotiation')
    ),
    recent_activity_by_account AS (
      SELECT a.account_id, COUNT(*) as cnt
      FROM deals d
      JOIN activities act ON act.deal_id = d.deal_id
      JOIN accounts a ON a.account_id = d.account_id
      WHERE d.stage IN ('Prospecting', 'Negotiation')
        AND act.timestamp >= date(?, '-30 days')
      GROUP BY a.account_id
    )
    SELECT od.account_id, a.name, a.segment, COALESCE(ra.cnt, 0) as activity_count
    FROM open_deals od
    JOIN accounts a ON a.account_id = od.account_id
    LEFT JOIN recent_activity_by_account ra ON ra.account_id = od.account_id
    WHERE COALESCE(ra.cnt, 0) < ?
    ORDER BY activity_count ASC
    LIMIT 50
  `
    )
    .all(AS_OF_DATE, LOW_ACTIVITY_THRESHOLD) as Array<{
    account_id: string;
    name: string;
    segment: string;
    activity_count: number;
  }>;

  res.json({
    staleDeals: staleDeals.map((d) => ({
      deal_id: d.deal_id,
      account_id: d.account_id,
      rep_id: d.rep_id,
      rep_name: d.rep_name ?? d.rep_id,
      amount: d.amount,
      days_since_activity: Math.round(d.days_since_activity),
    })),
    underperformingReps,
    lowActivityAccounts,
  });
});

export default router;
