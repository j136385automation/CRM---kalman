'use client';

import { Bar, BarChart, XAxis } from 'recharts';

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
  { mes: 'Jun', compra: 6, venda: 11, consignacao: 2 },
  { mes: 'Jul', compra: 8, venda: 13, consignacao: 3 },
  { mes: 'Ago', compra: 5, venda: 15, consignacao: 2 },
  { mes: 'Set', compra: 7, venda: 12, consignacao: 4 },
  { mes: 'Out', compra: 9, venda: 16, consignacao: 3 },
  { mes: 'Nov', compra: 8, venda: 14, consignacao: 3 }
];

const chartConfig = {
  compra: {
    label: 'Compra',
    color: 'var(--chart-1)'
  },
  venda: {
    label: 'Venda',
    color: 'var(--chart-2)'
  },
  consignacao: {
    label: 'Consignação',
    color: 'var(--chart-3)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Notas emitidas por mês
          <Badge variant='outline'>
            <Icons.trendingUp />
            +8,3%
          </Badge>
        </CardTitle>
        <CardDescription>Compra, venda e consignação — Jun a Nov/2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <rect
              x='0'
              y='0'
              width='100%'
              height='85%'
              fill='url(#default-multiple-pattern-dots)'
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis dataKey='mes' tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dashed' hideLabel />}
            />
            <Bar
              dataKey='compra'
              color='var(--chart-1)'
              fill='var(--color-compra)'
              shape={<CustomHatchedBar isHatched={false} />}
              radius={4}
            />
            <Bar
              dataKey='venda'
              fill='var(--color-venda)'
              shape={<CustomHatchedBar />}
              radius={4}
            />
            <Bar
              dataKey='consignacao'
              fill='var(--color-consignacao)'
              shape={<CustomHatchedBar />}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomHatchedBar = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string;
    isHatched?: boolean;
  }
) => {
  const { fill, x, y, width, height, dataKey } = props;

  const isHatched = props.isHatched ?? true;

  return (
    <>
      <rect
        rx={4}
        x={x}
        y={y}
        width={width}
        height={height}
        stroke='none'
        fill={isHatched ? `url(#hatched-bar-pattern-${dataKey})` : fill}
      />
      <defs>
        <pattern
          key={dataKey}
          id={`hatched-bar-pattern-${dataKey}`}
          x='0'
          y='0'
          width='5'
          height='5'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(-45)'
        >
          <rect width='10' height='10' opacity={0.5} fill={fill}></rect>
          <rect width='1' height='10' fill={fill}></rect>
        </pattern>
      </defs>
    </>
  );
};
const DottedBackgroundPattern = () => {
  return (
    <pattern
      id='default-multiple-pattern-dots'
      x='0'
      y='0'
      width='10'
      height='10'
      patternUnits='userSpaceOnUse'
    >
      <circle className='dark:text-muted/40 text-muted' cx='2' cy='2' r='1' fill='currentColor' />
    </pattern>
  );
};
