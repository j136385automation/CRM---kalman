'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { formatarData, formatarMoeda, type InsightVeiculo } from '../../constants/insights';

function SugestaoBadge({ sugestao }: { sugestao: string }) {
  if (sugestao.startsWith('Reduzir')) {
    return (
      <Badge variant='destructive' className='gap-1'>
        <Icons.trendingDown className='h-3 w-3' />
        {sugestao}
      </Badge>
    );
  }
  if (sugestao.startsWith('Aumentar')) {
    return (
      <Badge variant='default' className='gap-1'>
        <Icons.trendingUp className='h-3 w-3' />
        {sugestao}
      </Badge>
    );
  }
  return (
    <Badge variant='secondary' className='gap-1'>
      <Icons.check className='h-3 w-3' />
      {sugestao}
    </Badge>
  );
}

export const columns: ColumnDef<InsightVeiculo>[] = [
  {
    id: 'veiculo',
    accessorKey: 'veiculo',
    header: ({ column }: { column: Column<InsightVeiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Veículo' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<InsightVeiculo['veiculo']>()}</div>,
    meta: {
      label: 'Veículo',
      placeholder: 'Buscar veículo...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'custoParadoDia',
    accessorKey: 'custoParadoDia',
    header: ({ column }: { column: Column<InsightVeiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Custo parado/dia' />
    ),
    cell: ({ cell }) => (
      <div className='tabular-nums'>
        {formatarMoeda(cell.getValue<InsightVeiculo['custoParadoDia']>())}
      </div>
    )
  },
  {
    id: 'diasEmEstoque',
    accessorKey: 'diasEmEstoque',
    header: ({ column }: { column: Column<InsightVeiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Dias em estoque' />
    ),
    cell: ({ cell }) => (
      <div className='tabular-nums'>{cell.getValue<InsightVeiculo['diasEmEstoque']>()} dias</div>
    )
  },
  {
    id: 'diaLimiteLucro',
    accessorKey: 'diaLimiteLucro',
    header: ({ column }: { column: Column<InsightVeiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Dia-limite do lucro' />
    ),
    cell: ({ cell }) => (
      <time className='tabular-nums'>
        {formatarData(cell.getValue<InsightVeiculo['diaLimiteLucro']>())}
      </time>
    )
  },
  {
    id: 'desvalorizacaoPrevista',
    accessorKey: 'desvalorizacaoPrevista',
    header: ({ column }: { column: Column<InsightVeiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Desvalorização prevista' />
    ),
    cell: ({ cell }) => (
      <div className='tabular-nums'>
        {cell.getValue<InsightVeiculo['desvalorizacaoPrevista']().toLocaleString('pt-BR', {
          minimumFractionDigits: 1
        })}
        %
      </div>
    )
  },
  {
    id: 'sugestao',
    accessorKey: 'sugestao',
    enableSorting: false,
    header: ({ column }: { column: Column<InsightVeiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Sugestão da IA' />
    ),
    cell: ({ cell }) => <SugestaoBadge sugestao={cell.getValue<InsightVeiculo['sugestao']>()} />
  }
];
