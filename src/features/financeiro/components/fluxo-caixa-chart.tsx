'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { FLUXO_CAIXA, PROJECAO_FLUXO } from '../constants/financeiro';

const chartConfig = {
  saldo: {
    label: 'Saldo do mês',
    color: 'var(--chart-2)'
  },
  saldoAcumulado: {
    label: 'Saldo acumulado',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

const chartData = [...FLUXO_CAIXA, ...PROJECAO_FLUXO].map((m) => ({
  mes: m.mes,
  saldo: m.saldo,
  saldoAcumulado: m.saldoAcumulado
}));

export function FluxoCaixaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de caixa mensal</CardTitle>
        <CardDescription>
          Saldo do mês e saldo acumulado — últimos 12 meses + projeção de 3 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='mes' tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${Math.round(Number(value) / 1000)} mil`}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey='saldo'
              type='natural'
              fill='var(--color-saldo)'
              fillOpacity={0.3}
              stroke='var(--color-saldo)'
              strokeWidth={1.2}
            />
            <Area
              dataKey='saldoAcumulado'
              type='natural'
              fill='var(--color-saldoAcumulado)'
              fillOpacity={0.15}
              stroke='var(--color-saldoAcumulado)'
              strokeWidth={1.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
