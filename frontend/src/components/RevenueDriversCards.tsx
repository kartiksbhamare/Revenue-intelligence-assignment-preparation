import { Card, CardContent, Typography, Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DriversResponse } from '../types';
import type { RevenueTrendResponse } from '../types';

/** Compact format: use K for thousands, L for lakhs to avoid locale "T" or other ambiguity. */
function formatCurrencyCompact(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
const formatCurrencyFull = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function Sparkline({ data, width = 80, height = 32, color = '#1976d2' }: { data: number[]; width?: number; height?: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || data.length < 2) return;
    const w = width;
    const h = height;
    const scaleX = d3.scaleLinear().domain([0, data.length - 1]).range([0, w]);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const scaleY = d3.scaleLinear().domain([min - range * 0.1, max + range * 0.1]).range([h, 0]);
    const line = d3.line<number>().x((_, i) => scaleX(i)).y((d) => scaleY(d));
    const svg = d3.create('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').style('max-width', `${w}px`);
    svg.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    ref.current.innerHTML = '';
    ref.current.appendChild(svg.node()!);
  }, [data, width, height, color]);
  return <Box ref={ref} sx={{ width, height }} />;
}

export default function RevenueDriversCards({
  drivers,
  trend,
}: {
  drivers: DriversResponse | null;
  trend: RevenueTrendResponse | null;
}) {
  if (!drivers) return null;

  const sparkData = trend && trend.revenue.length >= 2 ? trend.revenue : [0, 1, 2, 3, 4, 5];
  const driverCards = [
    {
      label: 'Pipeline Value',
      value: formatCurrencyCompact(drivers.pipelineSize),
      change: drivers.pipelineChangePercent != null ? `${drivers.pipelineChangePercent >= 0 ? '+' : ''}${drivers.pipelineChangePercent}%` : null,
      spark: sparkData,
    },
    {
      label: 'Win Rate',
      value: `${drivers.winRatePercent}%`,
      change: drivers.winRateChangePercent != null ? `${drivers.winRateChangePercent >= 0 ? '+' : ''}${drivers.winRateChangePercent}%` : null,
      spark: sparkData,
    },
    {
      label: 'Avg Deal Size',
      value: formatCurrencyCompact(drivers.averageDealSize),
      change: drivers.avgDealChangePercent != null ? `${drivers.avgDealChangePercent >= 0 ? '+' : ''}${drivers.avgDealChangePercent}%` : null,
      spark: sparkData,
    },
    {
      label: 'Sales Cycle',
      value: `${drivers.salesCycleDays} Days`,
      change: drivers.salesCycleChangeDays != null ? `${drivers.salesCycleChangeDays >= 0 ? '+' : ''}${drivers.salesCycleChangeDays} Days` : null,
      spark: sparkData,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
        Revenue Drivers
      </Typography>
      {driverCards.map((card, i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {card.value}
                </Typography>
                {card.change != null && (
                  <Typography
                    variant="caption"
                    sx={{ color: card.change.startsWith('+') ? 'success.main' : 'error.main', fontWeight: 500 }}
                  >
                    {card.change}
                  </Typography>
                )}
              </Box>
              <Sparkline data={card.spark} color="#1976d2" />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
