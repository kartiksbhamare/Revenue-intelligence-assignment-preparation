import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import {
  AS_OF_DATE,
  STALE_DAYS,
  LOW_ACTIVITY_THRESHOLD,
  UNDERPERFORMING_WIN_RATE_THRESHOLD,
} from '../config.js';
import { getQuarterMonths, closedAtInQuarter } from '../utils/quarter.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const months = getQuarterMonths(AS_OF_DATE);
  const closedThisQ = closedAtInQuarter('closed_at', AS_OF_DATE);

  const recommendations: Array<{ text: string; priority: number }> = [];

  // 1. Stale Enterprise deals older than STALE_DAYS
  const staleEnterprise = db
    .prepare(
      `
    WITH latest_activity AS (
      SELECT deal_id, MAX(timestamp) as last_ts FROM activities GROUP BY deal_id
    )
    SELECT COUNT(*) as cnt FROM deals d
    JOIN accounts a ON a.account_id = d.account_id
    LEFT JOIN latest_activity la ON d.deal_id = la.deal_id
    WHERE d.stage IN ('Prospecting', 'Negotiation')
      AND a.segment = 'Enterprise'
      AND (julianday(?) - julianday(COALESCE(la.last_ts, d.created_at)) > ?)
  `
    )
    .get(AS_OF_DATE, STALE_DAYS) as { cnt: number };
  if (staleEnterprise.cnt > 0) {
    recommendations.push({
      text: `Focus on ${staleEnterprise.cnt} Enterprise deal(s) with no activity in the last ${STALE_DAYS} days.`,
      priority: 1,
    });
  }

  // 2. Underperforming reps – coach on win rate
  const teamAvg = db
    .prepare(
      `SELECT CAST(SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) AS REAL) / NULLIF(SUM(CASE WHEN stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END), 0) as avgWinRate
       FROM deals WHERE (stage = 'Closed Won' OR stage = 'Closed Lost') AND ${closedThisQ}`
    )
    .get() as { avgWinRate: number | null };
  const teamWinRate = teamAvg?.avgWinRate ?? 0;
  const minWinRate = teamWinRate * UNDERPERFORMING_WIN_RATE_THRESHOLD;
  const repRates = db
    .prepare(
      `SELECT d.rep_id, r.name,
         SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
         SUM(CASE WHEN d.stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
       FROM deals d JOIN reps r ON r.rep_id = d.rep_id
       WHERE (d.stage = 'Closed Won' OR d.stage = 'Closed Lost') AND ${closedThisQ}
       GROUP BY d.rep_id`
    )
    .all() as Array<{ rep_id: string; name: string; won: number; lost: number }>;
  for (const r of repRates) {
    const total = r.won + r.lost;
    if (total > 0) {
      const winRate = r.won / total;
      if (teamWinRate > 0 && winRate < minWinRate) {
        recommendations.push({
          text: `Coach ${r.name} on win rate (below team average).`,
          priority: 2,
        });
        break; // one recommendation per underperformer type
      }
    }
  }

  // 3. Low activity by segment (e.g. Mid-Market)
  const lowBySegment = db
    .prepare(
      `
    WITH open_deals AS (
      SELECT d.account_id, a.segment FROM deals d JOIN accounts a ON a.account_id = d.account_id
      WHERE d.stage IN ('Prospecting', 'Negotiation')
    ),
    recent_count AS (
      SELECT d.account_id, COUNT(act.activity_id) as cnt
      FROM deals d
      JOIN activities act ON act.deal_id = d.deal_id
      WHERE d.stage IN ('Prospecting', 'Negotiation') AND act.timestamp >= date(?, '-30 days')
      GROUP BY d.account_id
    )
    SELECT od.segment, COUNT(*) as accounts_low
    FROM open_deals od
    LEFT JOIN recent_count rc ON rc.account_id = od.account_id
    WHERE COALESCE(rc.cnt, 0) < ?
    GROUP BY od.segment
    ORDER BY accounts_low DESC
    LIMIT 1
  `
    )
    .get(AS_OF_DATE, LOW_ACTIVITY_THRESHOLD) as { segment: string; accounts_low: number } | undefined;
  if (lowBySegment && lowBySegment.accounts_low > 0) {
    recommendations.push({
      text: `Increase activity for ${lowBySegment.segment} segment (${lowBySegment.accounts_low} account(s) with low engagement).`,
      priority: 3,
    });
  }

  // 4. Pipeline vs target – generic push to close Negotiation deals
  const pipelineRow = db
    .prepare(
      `SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total FROM deals WHERE stage IN ('Prospecting', 'Negotiation')`
    )
    .get() as { total: number };
  const targetRow = db
    .prepare(`SELECT COALESCE(SUM(target), 0) as total FROM targets WHERE month IN (?, ?, ?)`)
    .get(...months) as { total: number };
  const currentRev = db
    .prepare(
      `SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total FROM deals WHERE stage = 'Closed Won' AND ${closedThisQ}`
    )
    .get() as { total: number };
  const gap = targetRow.total - currentRev.total;
  if (gap > 0 && pipelineRow.total > 0) {
    recommendations.push({
      text: 'Prioritize closing Negotiation-stage deals to reduce the revenue gap.',
      priority: 4,
    });
  }

  // 5. Stale deals in general (any segment)
  const staleCount = db
    .prepare(
      `
    WITH latest_activity AS (
      SELECT deal_id, MAX(timestamp) as last_ts FROM activities GROUP BY deal_id
    )
    SELECT COUNT(*) as cnt FROM deals d
    LEFT JOIN latest_activity la ON d.deal_id = la.deal_id
    WHERE d.stage IN ('Prospecting', 'Negotiation')
      AND (julianday(?) - julianday(COALESCE(la.last_ts, d.created_at)) > ?)
  `
    )
    .get(AS_OF_DATE, STALE_DAYS) as { cnt: number };
  if (staleCount.cnt > 0 && !recommendations.some((r) => r.text.includes('Enterprise') && r.text.includes('deal'))) {
    recommendations.push({
      text: `Re-engage ${staleCount.cnt} stale deal(s) (no activity in ${STALE_DAYS}+ days).`,
      priority: 5,
    });
  }

  const sorted = recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5);
  res.json({ recommendations: sorted.map(({ text }) => ({ text })) });
});

export default router;
