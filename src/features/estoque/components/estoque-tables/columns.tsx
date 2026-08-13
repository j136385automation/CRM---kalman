'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { Veiculo } from '../../api/types';
import { FAIXA_PRECO_OPTIONS, MARCA_OPTIONS, STATUS_OPTIONS } from '../../constants/veiculos';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';

function badgeDiasEmEstoque(dias: number) {
  if (dias > 60) {
    return (
      <Badge variant='destructive' className='tabular-nums'>
        {dias} dias
      </Badge>
    );
  }
  if (dias > 45) {
    return (
      <Badge
        variant='outline'
        className='border-amber-500 bg-amber-500/10 text-amber-600 tabular-nums dark:text-amber-400'
      >
        {dias} dias
      </Badge>
    );
  }
  return (
    <Badge variant='outline' className='tabular-nums'>
      {dias} dias
    </Badge>
  );
}

function badgeStatus(status: Veiculo['status']) {
  switch (status) {
    case 'Disponível':
      return (
        <Badge
          variant='outline'
          className='border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        >
          <Icons.circleCheck />
          {status}
        </Badge>
      );
    case 'Reservado':
      return (
        <Badge
          variant='outline'
          className='border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
        >
          <Icons.clock />
          {status}
        </Badge>
      );
    case 'Vendido':
      return (
        <Badge variant='secondary'>
          <Icons.check />
          {status}
        </Badge>
      );
    case 'Em preparação':
      return (
        <Badge variant='outline'>
          <Icons.spinner />
          {status}
        </Badge>
      );
  }
}

export const columns: ColumnDef<Veiculo>[] = [
  {
    id: 'marca',
    accessorKey: 'marca',
    header: ({ column }: { column: Column<Veiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Marca' />
    ),
    cell: ({ cell }) => <div className='font-medium'>{cell.getValue<Veiculo['marca']>()}</div>,
    meta: {
      label: 'Marca',
      variant: 'multiSelect',
      options: MARCA_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'modelo',
    accessorKey: 'modelo',
    header: ({ column }: { column: Column<Veiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Modelo' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Veiculo['modelo']>()}</div>,
    meta: {
      label: 'Modelo'
    }
  },
  {
    id: 'ano',
    accessorKey: 'ano',
    header: ({ column }: { column: Column<Veiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Ano' />
    ),
    cell: ({ cell }) => <div className='tabular-nums'>{cell.getValue<Veiculo['ano']>()}</div>,
    meta: {
      label: 'Ano'
    }
  },
  {
    id: 'placa',
    accessorKey: 'placa',
    header: 'Placa',
    cell: ({ cell }) => (
      <span className='font-mono text-xs font-medium'>{cell.getValue<Veiculo['placa']>()}</span>
    ),
    meta: {
      label: 'Placa'
    }
  },
  {
    id: 'cor',
    accessorKey: 'cor',
    header: 'Cor',
    meta: {
      label: 'Cor'
    }
  },
  {
    id: 'preco',
    accessorKey: 'preco',
    header: ({ column }: { column: Column<Veiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Preço' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium tabular-nums'>
        {formatCurrency(cell.getValue<Veiculo['preco']>())}
      </div>
    ),
    meta: {
      label: 'Faixa de preço',
      variant: 'multiSelect',
      options: FAIXA_PRECO_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true
  },
  {
    id: 'diasEmEstoque',
    accessorKey: 'diasEmEstoque',
    header: ({ column }: { column: Column<Veiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Dias em estoque' />
    ),
    cell: ({ cell }) => badgeDiasEmEstoque(cell.getValue<Veiculo['diasEmEstoque']>()),
    meta: {
      label: 'Dias em estoque'
    }
  },
  {
    id: 'km',
    accessorKey: 'km',
    header: 'Km',
    cell: ({ cell }) => (
      <div className='tabular-nums'>{formatNumber(cell.getValue<Veiculo['km']>())} km</div>
    ),
    meta: {
      label: 'Km'
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<Veiculo, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => badgeStatus(cell.getValue<Veiculo['status']>()),
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: STATUS_OPTIONS
    },
    enableColumnFilter: true
  }
];
