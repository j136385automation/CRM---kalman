'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatCurrencyBRL, formatDateBR } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { STATUS_NOTA_OPTIONS, TIPO_NOTA_OPTIONS } from '../../constants/notas-fiscais';
import type { NotaFiscal, StatusNota } from '../../api/types';

const statusConfig: Record<
  StatusNota,
  { variant: 'default' | 'secondary' | 'destructive'; icon: keyof typeof Icons }
> = {
  Emitida: { variant: 'default', icon: 'circleCheck' },
  Pendente: { variant: 'secondary', icon: 'clock' },
  Cancelada: { variant: 'destructive', icon: 'xCircle' }
};

export const columns: ColumnDef<NotaFiscal>[] = [
  {
    id: 'numero',
    accessorKey: 'numero',
    header: ({ column }: { column: Column<NotaFiscal, unknown> }) => (
      <DataTableColumnHeader column={column} title='Número' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium whitespace-nowrap'>{cell.getValue<NotaFiscal['numero']>()}</div>
    )
  },
  {
    id: 'tipo',
    accessorKey: 'tipo',
    enableSorting: false,
    header: ({ column }: { column: Column<NotaFiscal, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ cell }) => (
      <Badge variant='outline' className='whitespace-nowrap'>
        {cell.getValue<NotaFiscal['tipo']>()}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Tipo',
      variant: 'multiSelect',
      options: TIPO_NOTA_OPTIONS
    }
  },
  {
    id: 'cliente',
    accessorKey: 'cliente',
    header: ({ column }: { column: Column<NotaFiscal, unknown> }) => (
      <DataTableColumnHeader column={column} title='Cliente / Fornecedor' />
    ),
    cell: ({ cell }) => (
      <div className='whitespace-nowrap'>{cell.getValue<NotaFiscal['cliente']>()}</div>
    )
  },
  {
    id: 'veiculo',
    accessorKey: 'veiculo',
    enableSorting: false,
    header: 'Veículo',
    cell: ({ cell }) => (
      <div className='text-muted-foreground whitespace-nowrap'>
        {cell.getValue<NotaFiscal['veiculo']>()}
      </div>
    )
  },
  {
    id: 'valor',
    accessorKey: 'valor',
    header: ({ column }: { column: Column<NotaFiscal, unknown> }) => (
      <DataTableColumnHeader column={column} title='Valor' />
    ),
    cell: ({ cell }) => (
      <div className='whitespace-nowrap'>
        {formatCurrencyBRL(cell.getValue<NotaFiscal['valor']>())}
      </div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<NotaFiscal, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<NotaFiscal['status']>();
      const config = statusConfig[status];
      const Icon = Icons[config.icon];

      return (
        <Badge variant={config.variant} className='whitespace-nowrap'>
          <Icon />
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: STATUS_NOTA_OPTIONS
    }
  },
  {
    id: 'data',
    accessorKey: 'data',
    header: ({ column }: { column: Column<NotaFiscal, unknown> }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ cell }) => (
      <div className='whitespace-nowrap'>{formatDateBR(cell.getValue<NotaFiscal['data']>())}</div>
    )
  }
];
