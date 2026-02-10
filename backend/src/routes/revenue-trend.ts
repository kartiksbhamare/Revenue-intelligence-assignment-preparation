import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { AS_OF_DATE } from '../config.js';

const router = Router();

/** Last 6 months ending at the month of AS_OF_DATE. Returns revenue (Closed Won) and target per month. */
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const [y, m] = AS_OF_DATE.split('-').map(Number);
  const months: { label: string; month: string }[] = [];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 5; i >= 0; i--) {
    let mm = m - i;
    let yy = y;
    while (mm < 1) {
      mm += 12;
      yy -= 1;
    }
    const monthStr = `${yy}-${String(mm).padStart(2, '0')}`;
    months.push({ label: labels[mm - 1], month: monthStr });
  }

  const revenue: number[] = [];
  const target: number[] = [];

  for (const { month } of months) {
    const [yy, mm] = month.split('-').map(Number);
    const lastDay = new Date(yy, mm, 0).getDate();
    const start = `${month}-01`;
    const end = `${month}-${String(lastDay).padStart(2, '0')}`;
    const revRow = db
      .prepare(
        `SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total
         FROM deals
         WHERE stage = 'Closed Won' AND closed_at >= ? AND closed_at <= ?`
      )
      .get(start, end) as { total: number };
    revenue.push(revRow.total);

    const tRow = db.prepare('SELECT COALESCE(target, 0) as target FROM targets WHERE month = ?').get(month) as { target: number } | undefined;
    target.push(tRow?.target ?? 0);
  }

  res.json({
    labels: months.map((m) => m.label),
    months: months.map((m) => m.month),
    revenue,
    target,
  });
});

export default router;
