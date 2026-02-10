/**
 * Quarter boundaries: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec.
 * Dates are treated as YYYY-MM-DD; invalid or future closed_at are handled by callers.
 */
export function getQuarterMonths(asOfDate: string): [string, string, string] {
  const [y, m] = asOfDate.split('-').map(Number);
  const quarter = Math.ceil(m / 3);
  const startMonth = (quarter - 1) * 3 + 1;
  return [
    `${y}-${String(startMonth).padStart(2, '0')}`,
    `${y}-${String(startMonth + 1).padStart(2, '0')}`,
    `${y}-${String(startMonth + 2).padStart(2, '0')}`,
  ];
}

export function getPreviousQuarterDateRange(asOfDate: string): { start: string; end: string } {
  const [y, m] = asOfDate.split('-').map(Number);
  const quarter = Math.ceil(m / 3);
  let py = y;
  let pq = quarter - 1;
  if (pq < 1) {
    pq = 4;
    py = y - 1;
  }
  const startMonth = (pq - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const lastDay = new Date(py, endMonth, 0).getDate();
  return {
    start: `${py}-${String(startMonth).padStart(2, '0')}-01`,
    end: `${py}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function getQuarterLabel(asOfDate: string): string {
  const [y, m] = asOfDate.split('-').map(Number);
  const q = Math.ceil(m / 3);
  return `Q${q} ${y}`;
}

/** Previous quarter's months for QoQ. */
export function getPreviousQuarterMonths(asOfDate: string): [string, string, string] {
  const [y, m] = asOfDate.split('-').map(Number);
  const quarter = Math.ceil(m / 3);
  let py = y;
  let pq = quarter - 1;
  if (pq < 1) {
    pq = 4;
    py = y - 1;
  }
  const startMonth = (pq - 1) * 3 + 1;
  return [
    `${py}-${String(startMonth).padStart(2, '0')}`,
    `${py}-${String(startMonth + 1).padStart(2, '0')}`,
    `${py}-${String(startMonth + 2).padStart(2, '0')}`,
  ];
}

/** Start and end date for a quarter (YYYY-MM-DD). */
export function getQuarterDateRange(asOfDate: string): { start: string; end: string } {
  const [y, m] = asOfDate.split('-').map(Number);
  const quarter = Math.ceil(m / 3);
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const lastDay = new Date(y, endMonth, 0).getDate();
  return {
    start: `${y}-${String(startMonth).padStart(2, '0')}-01`,
    end: `${y}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

/** SQL condition: closed_at in quarter (between start and end). */
export function closedAtInQuarter(closedAtCol: string, asOfDate: string): string {
  const { start, end } = getQuarterDateRange(asOfDate);
  return `(${closedAtCol} >= '${start}' AND ${closedAtCol} <= '${end}')`;
}
