'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

const chartData = [
  { faixa: 'ate50', veiculos: 9, fill: 'var(--color-ate50)' },
  { faixa: 'de50a90', veiculos: 12, fill: 'var(--color-de50a90)' },
  { faixa: 'de90a150', veiculos: 8, fill: 'var(--color-de90a150)' },
  { faixa: 'acima150', veiculos: 3, fill: 'var(--color-acima150)' }
];

const chartConfig = {
  veiculos: {
    label: 'Veículos'
  },
  ate50: {
    label: 'Até R$50 mil',
    color: 'var(--chart-1)'
  },
  de50a90: {
    label: 'R$50–90 mil',
    color: 'var(--chart-2)'
  },
  de90a150: {
    label: 'R$90–150 mil',
    color: 'var(--chart-3)'
  },
  acima150: {
    label: 'Acima de R$150 mil',
    color: 'var(--chart-4)'
  }
} satisfies ChartConfig;

export function PieGraph() {
  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>
          Estoque por faixa de preço
          <Badge variant='outline'>
            <Icons.car />
            32 veículos
          </Badge>
        </CardTitle>
        <CardDescription>Distribuição atual do estoque</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px] min-h-[250px]'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey='veiculos' hideLabel />} />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey='veiculos'
              nameKey='faixa'
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey='veiculos'
                stroke='none'
                fontSize={12}
                fontWeight={500}
                fill='currentColor'
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
