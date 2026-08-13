import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { FLUXO_CAIXA, PROJECAO_FLUXO } from '../constants/financeiro';

function CelulaValor({ valor, sinal }: { valor: number; sinal?: boolean }) {
  return (
    <TableCell
      className={cn(
        'text-right tabular-nums',
        sinal &&
          (valor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')
      )}
    >
      {formatCurrency(valor)}
    </TableCell>
  );
}

export function FluxoCaixaTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de caixa mensal</CardTitle>
        <CardDescription>
          Entradas, saídas, saldo do mês e saldo acumulado — incluindo projeção de 3 meses (média
          dos últimos 3 meses)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead className='text-right'>Entradas</TableHead>
              <TableHead className='text-right'>Saídas</TableHead>
              <TableHead className='text-right'>Saldo</TableHead>
              <TableHead className='text-right'>Saldo acumulado</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FLUXO_CAIXA.map((mes) => (
              <TableRow key={mes.mes}>
                <TableCell className='font-medium'>{mes.mes}</TableCell>
                <CelulaValor valor={mes.entradas} />
                <CelulaValor valor={mes.saidas} />
                <CelulaValor valor={mes.saldo} sinal />
                <CelulaValor valor={mes.saldoAcumulado} sinal />
                <TableCell>
                  <Badge variant='outline'>Realizado</Badge>
                </TableCell>
              </TableRow>
            ))}
            {PROJECAO_FLUXO.map((mes) => (
              <TableRow key={mes.mes} className='bg-muted/40'>
                <TableCell className='font-medium'>{mes.mes}</TableCell>
                <CelulaValor valor={mes.entradas} />
                <CelulaValor valor={mes.saidas} />
                <CelulaValor valor={mes.saldo} sinal />
                <CelulaValor valor={mes.saldoAcumulado} sinal />
                <TableCell>
                  <Badge
                    variant='outline'
                    className='border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  >
                    Projeção
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
