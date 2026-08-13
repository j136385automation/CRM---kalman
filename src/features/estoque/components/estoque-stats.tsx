import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { ESTOQUE_STATS } from '../constants/veiculos';

export function EstoqueStats() {
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total em estoque</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatNumber(ESTOQUE_STATS.totalVeiculos)} veículos
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.product />
              Ativos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>Veículos disponíveis no pátio</div>
          <div className='text-muted-foreground'>
            {ESTOQUE_STATS.paradosMais60Dias} parados há mais de 60 dias
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Valor investido</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(ESTOQUE_STATS.valorInvestido)}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.trendingUp />
              Capital
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>Soma do valor de compra</div>
          <div className='text-muted-foreground'>Capital imobilizado em veículos</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Ticket médio</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(ESTOQUE_STATS.ticketMedio)}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.billing />
              Por veículo
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>Valor médio por veículo</div>
          <div className='text-muted-foreground'>
            Base: {ESTOQUE_STATS.totalVeiculos} veículos em estoque
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Giro médio</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {ESTOQUE_STATS.giroMedioDias} dias
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.clock />
              Tempo médio
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Da entrada no pátio até a venda <Icons.trendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Meta da loja: até 45 dias</div>
        </CardFooter>
      </Card>
    </div>
  );
}
