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
import { DRE } from '../constants/financeiro';

function valorDre(valor: number) {
  return formatCurrency(valor);
}

export function DreTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DRE simplificado — Demonstrativo de Resultado</CardTitle>
        <CardDescription>
          Regime de competência — comparação entre mês atual, mês anterior e acumulado do ano
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conta</TableHead>
              <TableHead className='text-right'>Mês atual (nov/25)</TableHead>
              <TableHead className='text-right'>Mês anterior (out/25)</TableHead>
              <TableHead className='text-right'>Acumulado no ano</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DRE.map((linha) => (
              <TableRow
                key={linha.label}
                className={cn(linha.destaque && 'bg-muted/50 font-semibold')}
              >
                <TableCell className={cn(linha.detalhe && 'text-muted-foreground pl-8')}>
                  {linha.label}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums',
                    linha.atual < 0 && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {valorDre(linha.atual)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums',
                    linha.anterior < 0 && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {valorDre(linha.anterior)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums',
                    linha.acumulado < 0 && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {valorDre(linha.acumulado)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
