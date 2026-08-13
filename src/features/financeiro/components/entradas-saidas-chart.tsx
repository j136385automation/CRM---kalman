'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { ENTRADAS_SAIDAS_6M } from '../constants/financeiro';

const chartConfig = {
  entradas: {
    label: 'Entradas',
    color: 'var(--chart-2)'
  },
  saidas: {
    label: 'Saídas',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

export function EntradasSaidasChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entradas vs saídas</CardTitle>
        <CardDescription>Últimos 6 meses — junho a novembro de 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={ENTRADAS_SAIDAS_6M}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='mes' tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${Math.round(Number(value) / 1000)} mil`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator='dashed'
                  formatter={(value) =>
                    Number(value).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey='entradas' fill='var(--color-entradas)' radius={4} />
            <Bar dataKey='saidas' fill='var(--color-saidas)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
