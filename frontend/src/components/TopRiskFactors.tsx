import { Box, Typography } from '@mui/material';
import type { RiskFactorsResponse } from '../types';

export default function TopRiskFactors({ data }: { data: RiskFactorsResponse | null }) {
  if (!data) return null;

  const bullets: string[] = [];
  if (data.staleDeals.length > 0) {
    bullets.push(`${data.staleDeals.length} deal(s) stuck over 30 days`);
  }
  data.underperformingReps.slice(0, 2).forEach((r) => {
    bullets.push(`${r.name} – Win Rate: ${r.winRatePercent}%`);
  });
  if (data.lowActivityAccounts.length > 0) {
    bullets.push(`${data.lowActivityAccounts.length} account(s) with no recent activity`);
  }
  const topRisks = bullets.slice(0, 3);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
        Top Risk Factors
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'none' }}>
        {topRisks.map((text, i) => (
          <Box
            key={i}
            component="li"
            sx={{
              position: 'relative',
              mb: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -20,
                top: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#FF6B35',
              },
            }}
          >
            <Typography variant="body2">{text}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
