import { Box, Typography } from '@mui/material';
import type { SummaryResponse } from '../types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function QtdBanner({ data }: { data: SummaryResponse }) {
  const gapToGoal = data.gapPercent;
  const gapLabel = gapToGoal >= 0 ? `+${gapToGoal}% to Goal` : `${gapToGoal}% to Goal`;

  return (
    <Box
      sx={{
        background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
        color: '#fff',
        px: 3,
        py: 2,
        borderRadius: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        QTD Revenue: {formatCurrency(data.currentQuarterRevenue)}
      </Typography>
      <Typography variant="h6" sx={{ opacity: 0.95 }}>
        Target: {formatCurrency(data.target)}
      </Typography>
      <Typography variant="h6" fontWeight={600}>
        {gapLabel}
      </Typography>
    </Box>
  );
}
