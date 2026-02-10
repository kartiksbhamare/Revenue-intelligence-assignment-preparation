export interface SummaryResponse {
  currentQuarterRevenue: number;
  target: number;
  gapPercent: number;
  changePercent: number | null;
  changeType: string;
  quarterLabel: string;
}

export interface DriversResponse {
  pipelineSize: number;
  winRatePercent: number;
  averageDealSize: number;
  salesCycleDays: number;
  pipelineChangePercent?: number;
  winRateChangePercent?: number | null;
  avgDealChangePercent?: number | null;
  salesCycleChangeDays?: number;
}

export interface RevenueTrendResponse {
  labels: string[];
  months: string[];
  revenue: number[];
  target: number[];
}

export interface StaleDeal {
  deal_id: string;
  account_id: string;
  rep_id: string;
  rep_name: string;
  amount: number | null;
  days_since_activity: number;
}

export interface UnderperformingRep {
  rep_id: string;
  name: string;
  winRatePercent: number;
  teamAvgPercent: number;
}

export interface LowActivityAccount {
  account_id: string;
  name: string;
  segment: string;
  activity_count: number;
}

export interface RiskFactorsResponse {
  staleDeals: StaleDeal[];
  underperformingReps: UnderperformingRep[];
  lowActivityAccounts: LowActivityAccount[];
}

export interface RecommendationsResponse {
  recommendations: Array<{ text: string }>;
}
