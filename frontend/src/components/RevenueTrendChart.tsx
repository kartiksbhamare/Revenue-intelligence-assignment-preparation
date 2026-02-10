import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, Typography, Box } from '@mui/material';
import type { RevenueTrendResponse } from '../types';

export default function RevenueTrendChart({ data }: { data: RevenueTrendResponse | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !containerRef.current || data.labels.length === 0) return;

    const width = Math.max(containerRef.current.offsetWidth || 600, 400);
    const height = 220;
    const margin = { top: 24, right: 24, bottom: 32, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.labels).range([0, innerW]).padding(0.3);
    const maxVal = Math.max(...data.revenue, ...data.target, 1);
    const yScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerH, 0]);

    const svg = d3
      .create('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .style('max-width', `${width}px`);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    data.labels.forEach((_, i) => {
      const x = (xScale(data.labels[i]) ?? 0) + (xScale.bandwidth() ?? 0) / 2;
      const barW = (xScale.bandwidth() ?? 0) * 0.35;
      g.append('rect')
        .attr('x', x - barW / 2)
        .attr('y', yScale(data.revenue[i]))
        .attr('width', barW)
        .attr('height', innerH - yScale(data.revenue[i]))
        .attr('fill', 'rgba(25, 118, 210, 0.7)')
        .attr('rx', 2);
    });

    const line = d3
      .line<number>()
      .x((_, i) => (xScale(data.labels[i]) ?? 0) + (xScale.bandwidth() ?? 0) / 2)
      .y((d) => yScale(d));
    g.append('path')
      .attr('d', line(data.target))
      .attr('fill', 'none')
      .attr('stroke', '#FF6B35')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', 11);
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => `${Number(d) / 1000}K`))
      .selectAll('text')
      .attr('font-size', 10);

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(svg.node()!);
  }, [data]);

  if (!data) return null;

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Revenue Trend (Last 6 Months)
        </Typography>
        <Box ref={containerRef} sx={{ width: '100%', minHeight: 220 }} />
        <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: 'rgba(25, 118, 210, 0.7)' }} />
            <Typography variant="caption">Revenue</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 2, bgcolor: '#FF6B35' }} />
            <Typography variant="caption">Target</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
