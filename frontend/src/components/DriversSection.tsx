import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import type { DriversResponse } from '../types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function DriversSection({ data }: { data: DriversResponse | null }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !chartContainerRef.current) return;
    const keys = ['Pipeline size', 'Win rate', 'Avg deal size', 'Sales cycle'];
    // Normalized 0–100 for bar length; value labels shown in right column to avoid overlap
    const refs = {
      pipeline: Math.max(data.pipelineSize, 1e6),
      winRate: 100,
      avgDeal: Math.max(data.averageDealSize, 50000),
      cycle: Math.max(data.salesCycleDays, 30),
    };
    const normalized = [
      Math.min(100, (data.pipelineSize / refs.pipeline) * 100),
      Math.min(100, data.winRatePercent),
      Math.min(100, (data.averageDealSize / refs.avgDeal) * 100),
      Math.min(100, (data.salesCycleDays / refs.cycle) * 100),
    ];
    const width = Math.max(chartContainerRef.current.offsetWidth || 500, 500);
    const height = 180;
    const margin = { top: 12, right: 160, bottom: 12, left: 110 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const scale = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    const svg = d3.create('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', '100%').style('max-width', `${width}px`);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const barH = Math.min(28, (innerH - 12) / 4);
    const gap = (innerH - barH * 4) / 5;
    keys.forEach((k, i) => {
      const y = gap + i * (barH + gap);
      g.append('text')
        .attr('x', 0)
        .attr('y', y + barH / 2 + 4)
        .attr('font-size', 12)
        .attr('fill', '#333')
        .attr('text-anchor', 'start')
        .text(k);
      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', scale(normalized[i]))
        .attr('height', barH)
        .attr('fill', 'rgba(25, 118, 210, 0.5)')
        .attr('rx', 2);
      const valueText =
        i === 0 ? formatCurrency(data.pipelineSize) : i === 1 ? `${data.winRatePercent}%` : i === 2 ? formatCurrency(data.averageDealSize) : `${data.salesCycleDays} days`;
      g.append('text')
        .attr('x', innerW + 8)
        .attr('y', y + barH / 2 + 4)
        .attr('font-size', 12)
        .attr('fill', '#37474f')
        .attr('text-anchor', 'start')
        .text(valueText);
    });
    chartContainerRef.current.innerHTML = '';
    chartContainerRef.current.appendChild(svg.node()!);
  }, [data]);

  if (!data) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenue drivers
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography color="text.secondary">Pipeline size</Typography>
            <Typography variant="h6">{formatCurrency(data.pipelineSize)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography color="text.secondary">Win rate</Typography>
            <Typography variant="h6">{data.winRatePercent}%</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography color="text.secondary">Avg deal size</Typography>
            <Typography variant="h6">{formatCurrency(data.averageDealSize)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography color="text.secondary">Sales cycle</Typography>
            <Typography variant="h6">{data.salesCycleDays} days</Typography>
          </Grid>
          <Grid size={12}>
            <Box ref={chartContainerRef} sx={{ width: '100%', minHeight: 200 }} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
