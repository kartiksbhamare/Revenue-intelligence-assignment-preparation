import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box, Alert, Button, Grid } from '@mui/material';
import { api } from './api';
import type { SummaryResponse, DriversResponse, RiskFactorsResponse, RecommendationsResponse, RevenueTrendResponse } from './types';
import Header from './components/Header';
import QtdBanner from './components/QtdBanner';
import RevenueDriversCards from './components/RevenueDriversCards';
import TopRiskFactors from './components/TopRiskFactors';
import RecommendedActionsCompact from './components/RecommendedActionsCompact';
import RevenueTrendChart from './components/RevenueTrendChart';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1976d2' }, secondary: { main: '#9c27b0' } },
  typography: { h4: { fontWeight: 600 }, h6: { fontWeight: 600 } },
});

export default function App() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [drivers, setDrivers] = useState<DriversResponse | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactorsResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, d, r, rec, trend] = await Promise.all([
        api.getSummary(),
        api.getDrivers(),
        api.getRiskFactors(),
        api.getRecommendations(),
        api.getRevenueTrend(),
      ]);
      setSummary(s);
      setDrivers(d);
      setRiskFactors(r);
      setRecommendations(rec);
      setRevenueTrend(trend);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 3 }}>
        {error && (
          <Container maxWidth="lg" sx={{ pt: 2 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={load}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Container>
        )}

        {loading && !summary && (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography color="text.secondary">Loading…</Typography>
          </Container>
        )}

        {!loading && summary && (
          <>
            <Container maxWidth="lg" sx={{ pt: 2 }}>
              <QtdBanner data={summary} />
            </Container>
            <Container maxWidth="lg" sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <RevenueDriversCards drivers={drivers} trend={revenueTrend} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TopRiskFactors data={riskFactors} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <RecommendedActionsCompact data={recommendations} />
                </Grid>
              </Grid>
              <RevenueTrendChart data={revenueTrend} />
            </Container>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}
