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
import { Icons } from '@/components/icons';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { MOVIMENTACOES } from '../constants/financeiro';

export function MovimentacoesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações recentes</CardTitle>
        <CardDescription>Entradas e saídas mais recentes da revenda</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className='text-right'>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOVIMENTACOES.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell className='font-medium'>{mov.descricao}</TableCell>
                <TableCell className='text-muted-foreground'>{mov.categoria}</TableCell>
                <TableCell>
                  <Badge variant='outline' className='gap-1'>
                    {mov.tipo === 'entrada' ? (
                      <Icons.trendingUp className='text-emerald-500' />
                    ) : (
                      <Icons.trendingDown className='text-red-500' />
                    )}
                    {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium tabular-nums',
                    mov.tipo === 'entrada'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {mov.tipo === 'entrada' ? '+' : '-'}
                  {formatCurrency(mov.valor)}
                </TableCell>
                <TableCell className='tabular-nums'>{formatDateBR(mov.data)}</TableCell>
                <TableCell>
                  {mov.status === 'Pago' ? (
                    <Badge
                      variant='outline'
                      className='border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    >
                      <Icons.circleCheck />
                      Pago
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    >
                      <Icons.clock />
                      Pendente
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
