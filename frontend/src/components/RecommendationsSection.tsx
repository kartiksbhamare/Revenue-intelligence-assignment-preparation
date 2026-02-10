import { Card, CardContent, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import type { RecommendationsResponse } from '../types';

export default function RecommendationsSection({ data }: { data: RecommendationsResponse | null }) {
  if (!data) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recommendations
        </Typography>
        <List dense>
          {data.recommendations.map((rec, i) => (
            <ListItem key={i}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  mr: 1.5,
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <ListItemText primary={rec.text} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
