const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export const api = {
  getSummary: () => get<import('./types').SummaryResponse>('/api/summary'),
  getDrivers: () => get<import('./types').DriversResponse>('/api/drivers'),
  getRiskFactors: () => get<import('./types').RiskFactorsResponse>('/api/risk-factors'),
  getRecommendations: () => get<import('./types').RecommendationsResponse>('/api/recommendations'),
  getRevenueTrend: () => get<import('./types').RevenueTrendResponse>('/api/revenue-trend'),
};
