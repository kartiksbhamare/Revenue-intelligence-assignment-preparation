import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');

const db = new Database(':memory:');

function loadJson<T>(filename: string): T {
  const raw = readFileSync(join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

export function initDb(): void {
  db.exec(`
    CREATE TABLE accounts (
      account_id TEXT PRIMARY KEY,
      name TEXT,
      industry TEXT,
      segment TEXT
    );

    CREATE TABLE reps (
      rep_id TEXT PRIMARY KEY,
      name TEXT
    );

    CREATE TABLE deals (
      deal_id TEXT PRIMARY KEY,
      account_id TEXT,
      rep_id TEXT,
      stage TEXT,
      amount REAL,
      created_at TEXT,
      closed_at TEXT,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id),
      FOREIGN KEY (rep_id) REFERENCES reps(rep_id)
    );

    CREATE TABLE activities (
      activity_id TEXT PRIMARY KEY,
      deal_id TEXT,
      type TEXT,
      timestamp TEXT,
      FOREIGN KEY (deal_id) REFERENCES deals(deal_id)
    );

    CREATE TABLE targets (
      month TEXT PRIMARY KEY,
      target REAL
    );

    CREATE INDEX idx_deals_stage ON deals(stage);
    CREATE INDEX idx_deals_closed_at ON deals(closed_at);
    CREATE INDEX idx_deals_rep ON deals(rep_id);
    CREATE INDEX idx_deals_account ON deals(account_id);
    CREATE INDEX idx_activities_deal ON activities(deal_id);
    CREATE INDEX idx_activities_timestamp ON activities(timestamp);
  `);

  const accounts = loadJson<Array<{ account_id: string; name: string; industry: string; segment: string }>>('accounts.json');
  const insAccount = db.prepare('INSERT INTO accounts (account_id, name, industry, segment) VALUES (?, ?, ?, ?)');
  for (const a of accounts) insAccount.run(a.account_id, a.name, a.industry, a.segment);

  const reps = loadJson<Array<{ rep_id: string; name: string }>>('reps.json');
  const insRep = db.prepare('INSERT INTO reps (rep_id, name) VALUES (?, ?)');
  for (const r of reps) insRep.run(r.rep_id, r.name);

  const deals = loadJson<Array<{ deal_id: string; account_id: string; rep_id: string; stage: string; amount: number | null; created_at: string; closed_at: string | null }>>('deals.json');
  const insDeal = db.prepare('INSERT INTO deals (deal_id, account_id, rep_id, stage, amount, created_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const d of deals) insDeal.run(d.deal_id, d.account_id, d.rep_id, d.stage, d.amount ?? null, d.created_at, d.closed_at ?? null);

  const activities = loadJson<Array<{ activity_id: string; deal_id: string; type: string; timestamp: string }>>('activities.json');
  const insAct = db.prepare('INSERT INTO activities (activity_id, deal_id, type, timestamp) VALUES (?, ?, ?, ?)');
  for (const a of activities) insAct.run(a.activity_id, a.deal_id, a.type, a.timestamp);

  const targets = loadJson<Array<{ month: string; target: number }>>('targets.json');
  const insTarget = db.prepare('INSERT INTO targets (month, target) VALUES (?, ?)');
  for (const t of targets) insTarget.run(t.month, t.target);
}

export function getDb(): Database.Database {
  return db;
}

export type { Database };
