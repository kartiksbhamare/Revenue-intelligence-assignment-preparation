/**
 * Configurable "as of" date for quarter calculations.
 * Current quarter = quarter containing this date.
 * Using 2025-02-10 => Q1 2025 (Jan–Mar).
 */
export const AS_OF_DATE = '2025-02-10';

/** Stale deal threshold: no activity in this many days. */
export const STALE_DAYS = 30;

/** Low activity: accounts with open deals and fewer than this many activities in last 30 days. */
export const LOW_ACTIVITY_THRESHOLD = 2;

/** Underperforming rep: win rate below this fraction of team average (e.g. 0.8 = 80%). */
export const UNDERPERFORMING_WIN_RATE_THRESHOLD = 0.8;
