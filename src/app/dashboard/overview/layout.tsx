import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer pageTitle='Visão Geral' pageDescription='Resumo executivo da sua revenda'>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Olá, bem-vindo de volta 👋</h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Receita do mês</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                R$ 184.500,00
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp />
                  +12,5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Em alta neste mês <Icons.trendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Comparado aos últimos 6 meses</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Despesas do mês</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                R$ 96.230,00
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp />
                  +4,1%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Alta de 4,1% no período <Icons.trendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Compras, preparação e custos fixos</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Lucro líquido</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                R$ 88.270,00
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp />
                  +18,2%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Forte margem de lucro <Icons.trendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Acima da meta do mês</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Veículos em estoque</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                32
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.car />
                  Ativos
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                5 parados há +60 dias <Icons.clock className='size-4' />
              </div>
              <div className='text-muted-foreground'>Atenção ao giro do estoque</div>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo fiscal e contábil</CardTitle>
            <CardDescription>
              Obrigações do mês e documentos prontos para a contabilidade
            </CardDescription>
            <CardAction>
              <Link
                href='/dashboard/contabilidade'
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Ir para Contabilidade
              </Link>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-2 text-sm sm:flex-row sm:items-center sm:gap-8'>
            <div className='flex items-center gap-2'>
              <Icons.calculator className='text-muted-foreground size-4' />
              <span>
                Impostos a recolher: <strong>R$ 12.840,00</strong>
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Icons.receipt className='text-muted-foreground size-4' />
              <span>
                Notas pendentes: <strong>3</strong>
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Icons.checks className='text-muted-foreground size-4' />
              <span>Relatórios prontos para a contabilidade</span>
            </div>
          </CardFooter>
        </Card>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {/* parallel route de movimentações */}
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 min-h-0 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
