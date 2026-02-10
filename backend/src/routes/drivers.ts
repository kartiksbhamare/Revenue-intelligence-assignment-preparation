import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { AS_OF_DATE } from '../config.js';
import { closedAtInQuarter, getPreviousQuarterDateRange } from '../utils/quarter.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const closedThisQ = closedAtInQuarter('closed_at', AS_OF_DATE);
  const prevRange = getPreviousQuarterDateRange(AS_OF_DATE);
  const closedPrevQ = `(closed_at >= '${prevRange.start}' AND closed_at <= '${prevRange.end}')`;

  // Current quarter
  const pipelineRow = db
    .prepare(
      `SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total FROM deals WHERE stage IN ('Prospecting', 'Negotiation')`
    )
    .get() as { total: number };
  const pipelineSize = pipelineRow.total;

  const wonLost = db
    .prepare(
      `SELECT SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won, SUM(CASE WHEN stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
       FROM deals WHERE (stage = 'Closed Won' OR stage = 'Closed Lost') AND ${closedThisQ}`
    )
    .get() as { won: number; lost: number };
  const total = (wonLost.won ?? 0) + (wonLost.lost ?? 0);
  const winRatePercent = total > 0 ? ((wonLost.won ?? 0) / total) * 100 : 0;

  const avgDeal = db
    .prepare(
      `SELECT AVG(amount) as avgAmount FROM deals WHERE stage = 'Closed Won' AND amount IS NOT NULL AND amount > 0 AND ${closedThisQ}`
    )
    .get() as { avgAmount: number | null };
  const averageDealSize = avgDeal?.avgAmount ?? 0;

  const cycleRow = db
    .prepare(
      `SELECT AVG(julianday(closed_at) - julianday(created_at)) as avgDays FROM deals
       WHERE stage = 'Closed Won' AND closed_at IS NOT NULL AND created_at IS NOT NULL AND ${closedThisQ}`
    )
    .get() as { avgDays: number | null };
  const salesCycleDays = cycleRow?.avgDays != null ? Math.round(cycleRow.avgDays) : 0;

  // Previous quarter (for change %)
  const prevWonLost = db
    .prepare(
      `SELECT SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won, SUM(CASE WHEN stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
       FROM deals WHERE (stage = 'Closed Won' OR stage = 'Closed Lost') AND ${closedPrevQ}`
    )
    .get() as { won: number; lost: number };
  const prevTotal = (prevWonLost.won ?? 0) + (prevWonLost.lost ?? 0);
  const prevWinRate = prevTotal > 0 ? ((prevWonLost.won ?? 0) / prevTotal) * 100 : 0;

  const prevAvgDeal = db
    .prepare(
      `SELECT AVG(amount) as avgAmount FROM deals WHERE stage = 'Closed Won' AND amount IS NOT NULL AND amount > 0 AND ${closedPrevQ}`
    )
    .get() as { avgAmount: number | null };
  const prevAvgDealSize = prevAvgDeal?.avgAmount ?? 0;

  const prevCycle = db
    .prepare(
      `SELECT AVG(julianday(closed_at) - julianday(created_at)) as avgDays FROM deals
       WHERE stage = 'Closed Won' AND closed_at IS NOT NULL AND created_at IS NOT NULL AND ${closedPrevQ}`
    )
    .get() as { avgDays: number | null };
  const prevCycleDays = prevCycle?.avgDays != null ? Math.round(prevCycle.avgDays) : 0;

  const pipelineChangePercent = 0; // pipeline is point-in-time, not quarter-bound; show 0 or omit
  const winRateChangePercent = prevWinRate > 0 ? winRatePercent - prevWinRate : null;
  const avgDealChangePercent = prevAvgDealSize > 0 ? ((averageDealSize - prevAvgDealSize) / prevAvgDealSize) * 100 : null;
  const salesCycleChangeDays = salesCycleDays - prevCycleDays;

  res.json({
    pipelineSize: Math.round(pipelineSize * 100) / 100,
    winRatePercent: Math.round(winRatePercent * 100) / 100,
    averageDealSize: Math.round(averageDealSize * 100) / 100,
    salesCycleDays,
    pipelineChangePercent,
    winRateChangePercent: winRateChangePercent != null ? Math.round(winRateChangePercent * 100) / 100 : null,
    avgDealChangePercent: avgDealChangePercent != null ? Math.round(avgDealChangePercent * 100) / 100 : null,
    salesCycleChangeDays,
  });
});

export default router;
