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
import { formatCurrency } from '@/lib/formatters';
import { FINANCEIRO_STATS } from '../constants/financeiro';

export function FinanceiroStats() {
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Receita do mês</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(FINANCEIRO_STATS.receitaMes)}
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
            Entradas confirmadas e pendentes <Icons.trendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Novembro de 2025</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Despesas do mês</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(FINANCEIRO_STATS.despesasMes)}
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
            Inclui custo dos veículos vendidos <Icons.trendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Novembro de 2025</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Contas a receber</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(FINANCEIRO_STATS.contasAReceber)}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.billing />A receber
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>Parcelas e sinais em aberto</div>
          <div className='text-muted-foreground'>Próximos 30 dias</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Contas a pagar</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(FINANCEIRO_STATS.contasAPagar)}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.warning />A pagar
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Fornecedores e despesas fixas <Icons.warning className='size-4' />
          </div>
          <div className='text-muted-foreground'>Próximos 30 dias</div>
        </CardFooter>
      </Card>
    </div>
  );
}
