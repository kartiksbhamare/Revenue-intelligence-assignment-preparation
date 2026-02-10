import { Card, CardContent, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useState } from 'react';
import type { RiskFactorsResponse } from '../types';

const formatCurrency = (n: number | null) =>
  n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : '–';

export default function RiskFactorsSection({ data }: { data: RiskFactorsResponse | null }) {
  const [tab, setTab] = useState(0);

  if (!data) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Risk factors
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label={`Stale deals (${data.staleDeals.length})`} />
          <Tab label={`Underperforming reps (${data.underperformingReps.length})`} />
          <Tab label={`Low activity accounts (${data.lowActivityAccounts.length})`} />
        </Tabs>
        {tab === 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Deal ID</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Rep</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Days since activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.staleDeals.slice(0, 20).map((d) => (
                  <TableRow key={d.deal_id}>
                    <TableCell>{d.deal_id}</TableCell>
                    <TableCell>{d.account_id}</TableCell>
                    <TableCell>{d.rep_name ?? d.rep_id}</TableCell>
                    <TableCell align="right">{formatCurrency(d.amount)}</TableCell>
                    <TableCell align="right">{d.days_since_activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 1 && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Rep</TableCell>
                  <TableCell align="right">Win rate %</TableCell>
                  <TableCell align="right">Team avg %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.underperformingReps.map((r) => (
                  <TableRow key={r.rep_id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell align="right">{r.winRatePercent}</TableCell>
                    <TableCell align="right">{r.teamAvgPercent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 2 && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell align="right">Activities (30d)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.lowActivityAccounts.slice(0, 20).map((a) => (
                  <TableRow key={a.account_id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.segment}</TableCell>
                    <TableCell align="right">{a.activity_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
