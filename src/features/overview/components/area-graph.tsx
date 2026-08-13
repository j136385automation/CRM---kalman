'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import React from 'react';

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);

const chartData = [
  { mes: 'Dez', entradas: 148000, saidas: 82000 },
  { mes: 'Jan', entradas: 162000, saidas: 91000 },
  { mes: 'Fev', entradas: 135000, saidas: 78000 },
  { mes: 'Mar', entradas: 171000, saidas: 95000 },
  { mes: 'Abr', entradas: 158000, saidas: 88400 },
  { mes: 'Mai', entradas: 189000, saidas: 102000 },
  { mes: 'Jun', entradas: 142000, saidas: 79600 },
  { mes: 'Jul', entradas: 176000, saidas: 93200 },
  { mes: 'Ago', entradas: 198000, saidas: 110500 },
  { mes: 'Set', entradas: 167000, saidas: 90800 },
  { mes: 'Out', entradas: 181000, saidas: 97400 },
  { mes: 'Nov', entradas: 184500, saidas: 96230 }
];

const chartConfig = {
  entradas: {
    label: 'Entradas',
    color: 'var(--chart-1)'
  },
  saidas: {
    label: 'Saídas',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const tooltipFormatter: React.ComponentProps<typeof ChartTooltipContent>['formatter'] = (
  value,
  name
) => (
  <div className='flex min-w-[130px] items-center justify-between gap-4'>
    <span className='text-muted-foreground'>
      {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
    </span>
    <span className='font-mono font-medium tabular-nums'>{formatBRL(Number(value))}</span>
  </div>
);

export function AreaGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Fluxo de caixa — últimos 12 meses
          <Badge variant='outline'>
            <Icons.trendingUp />
            +12,5%
          </Badge>
        </CardTitle>
        <CardDescription>Entradas vs saídas em R$ (Dez/2024 — Nov/2025)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='mes' tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(value) => `R$ ${Math.round(value / 1000)} mil`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={tooltipFormatter} />}
            />
            <defs>
              <DottedBackgroundPattern config={chartConfig} />
            </defs>
            <Area
              dataKey='saidas'
              type='natural'
              fill='url(#dotted-background-pattern-saidas)'
              fillOpacity={0.4}
              stroke='var(--color-saidas)'
              stackId='a'
              strokeWidth={0.8}
            />
            <Area
              dataKey='entradas'
              type='natural'
              fill='url(#dotted-background-pattern-entradas)'
              fillOpacity={0.4}
              stroke='var(--color-entradas)'
              stackId='a'
              strokeWidth={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`dotted-background-pattern-${key}`}
          x='0'
          y='0'
          width='7'
          height='7'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='5' cy='5' r='1.5' fill={value} opacity={0.5}></circle>
        </pattern>
      ))}
    </>
  );
};
