'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import {
  STATUS_AGENDAMENTO_LABELS,
  TIPO_AGENDAMENTO_LABELS,
  type Agendamento,
  type StatusAgendamento
} from '../../constants/agendamentos';

const statusVariant: Record<
  StatusAgendamento,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  confirmado: 'default',
  pendente: 'secondary',
  concluido: 'outline',
  cancelado: 'destructive'
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export const columns: ColumnDef<Agendamento>[] = [
  {
    id: 'tipo',
    accessorKey: 'tipo',
    enableSorting: false,
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ cell }) => {
      const tipo = cell.getValue<Agendamento['tipo']>();
      return <Badge variant='outline'>{TIPO_AGENDAMENTO_LABELS[tipo]}</Badge>;
    },
    meta: {
      label: 'Tipo',
      variant: 'multiSelect',
      options: Object.entries(TIPO_AGENDAMENTO_LABELS).map(([value, label]) => ({
        value,
        label
      }))
    },
    enableColumnFilter: true
  },
  {
    id: 'cliente',
    accessorKey: 'cliente',
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Agendamento['cliente']>()}</div>,
    meta: {
      label: 'Cliente',
      placeholder: 'Buscar cliente...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'veiculo',
    accessorKey: 'veiculo',
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Veículo' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Agendamento['veiculo']>()}</div>
  },
  {
    id: 'data',
    accessorKey: 'data',
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ cell }) => (
      <time className='tabular-nums'>{formatarData(cell.getValue<Agendamento['data']>())}</time>
    )
  },
  {
    id: 'horario',
    accessorKey: 'horario',
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Horário' />
    ),
    cell: ({ cell }) => (
      <div className='flex items-center gap-1.5 tabular-nums'>
        <Icons.clock className='text-muted-foreground h-3.5 w-3.5' />
        {cell.getValue<Agendamento['horario']>()}
      </div>
    )
  },
  {
    id: 'responsavel',
    accessorKey: 'responsavel',
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Responsável' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Agendamento['responsavel']>()}</div>
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<Agendamento, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Agendamento['status']>();
      return <Badge variant={statusVariant[status]}>{STATUS_AGENDAMENTO_LABELS[status]}</Badge>;
    },
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: Object.entries(STATUS_AGENDAMENTO_LABELS).map(([value, label]) => ({
        value,
        label
      }))
    },
    enableColumnFilter: true
  }
];
