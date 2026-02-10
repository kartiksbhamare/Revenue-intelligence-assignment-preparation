import { Box, Typography } from '@mui/material';
import type { RecommendationsResponse } from '../types';

export default function RecommendedActionsCompact({ data }: { data: RecommendationsResponse | null }) {
  if (!data) return null;
  const items = data.recommendations.slice(0, 5);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
        Recommended Actions
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
        {items.map((rec, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              mb: 1,
            }}
          >
            <Typography sx={{ color: '#FF6B35', fontSize: 18, lineHeight: 1.4 }} aria-hidden>
              ✓
            </Typography>
            <Typography variant="body2">{rec.text}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
