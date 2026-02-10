import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { AS_OF_DATE } from '../config.js';
import {
  getQuarterMonths,
  getQuarterLabel,
  getPreviousQuarterDateRange,
  closedAtInQuarter,
} from '../utils/quarter.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const months = getQuarterMonths(AS_OF_DATE);
  const prevRange = getPreviousQuarterDateRange(AS_OF_DATE);
  const closedThisQ = closedAtInQuarter('closed_at', AS_OF_DATE);
  const closedPrevQ = `(closed_at >= '${prevRange.start}' AND closed_at <= '${prevRange.end}')`;

  // Current quarter revenue: Closed Won, closed in this quarter. Treat null amount as 0.
  const currentRev = db
    .prepare(
      `SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total
       FROM deals
       WHERE stage = 'Closed Won' AND ${closedThisQ}`
    )
    .get() as { total: number };
  const currentQuarterRevenue = currentRev.total;

  // Target: sum of targets for the 3 months
  const placeholders = months.map(() => '?').join(',');
  const targetRow = db
    .prepare(`SELECT COALESCE(SUM(target), 0) as total FROM targets WHERE month IN (${placeholders})`)
    .get(...months) as { total: number };
  const target = targetRow.total;

  const gapPercent = target > 0 ? ((currentQuarterRevenue - target) / target) * 100 : 0;

  // QoQ: previous quarter revenue
  const prevRev = db
    .prepare(
      `SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total
       FROM deals
       WHERE stage = 'Closed Won' AND ${closedPrevQ}`
    )
    .get() as { total: number };
  const previousQuarterRevenue = prevRev.total;
  const changePercent =
    previousQuarterRevenue > 0
      ? ((currentQuarterRevenue - previousQuarterRevenue) / previousQuarterRevenue) * 100
      : null;

  res.json({
    currentQuarterRevenue: Math.round(currentQuarterRevenue * 100) / 100,
    target: Math.round(target * 100) / 100,
    gapPercent: Math.round(gapPercent * 100) / 100,
    changePercent: changePercent != null ? Math.round(changePercent * 100) / 100 : null,
    changeType: 'QoQ',
    quarterLabel: getQuarterLabel(AS_OF_DATE),
  });
});

export default router;
