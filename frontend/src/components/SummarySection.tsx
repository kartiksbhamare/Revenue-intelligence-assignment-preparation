import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import type { SummaryResponse } from '../types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function SummarySection({ data }: { data: SummaryResponse | null }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !chartContainerRef.current) return;
    const revenue = data.currentQuarterRevenue;
    const target = data.target;
    const maxVal = Math.max(revenue, target, 1);
    const width = 280;
    const height = 120;
    const margin = { top: 10, right: 10, bottom: 24, left: 10 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const scale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, innerW]);
    const svg = d3.create('svg').attr('viewBox', `0 0 ${width} ${height}`);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', scale(target))
      .attr('height', innerH / 2 - 4)
      .attr('fill', 'rgba(25, 118, 210, 0.2)')
      .attr('rx', 2);
    g.append('rect')
      .attr('x', 0)
      .attr('y', innerH / 2 + 4)
      .attr('width', scale(revenue))
      .attr('height', innerH / 2 - 4)
      .attr('fill', data.gapPercent >= 0 ? 'rgba(46, 125, 50, 0.6)' : 'rgba(211, 47, 47, 0.6)')
      .attr('rx', 2);
    g.append('text')
      .attr('x', 0)
      .attr('y', innerH / 2 - 6)
      .attr('font-size', 10)
      .attr('fill', '#666')
      .text('Target');
    g.append('text')
      .attr('x', 0)
      .attr('y', innerH + 2)
      .attr('font-size', 10)
      .attr('fill', '#666')
      .text('Revenue');
    chartContainerRef.current.innerHTML = '';
    chartContainerRef.current.appendChild(svg.node()!);
  }, [data]);

  if (!data) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Summary – {data.quarterLabel}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary">Current quarter revenue</Typography>
            <Typography variant="h4">{formatCurrency(data.currentQuarterRevenue)}</Typography>
            <Typography color="text.secondary">Target</Typography>
            <Typography variant="h6">{formatCurrency(data.target)}</Typography>
            <Typography
              sx={{ mt: 1 }}
              color={data.gapPercent >= 0 ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              Gap: {data.gapPercent >= 0 ? '+' : ''}{data.gapPercent}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.changeType} change:{' '}
              {data.changePercent != null
                ? `${data.changePercent >= 0 ? '+' : ''}${data.changePercent}%`
                : 'N/A (no prior quarter data)'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box ref={chartContainerRef} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
