'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import {
  CANAL_ANUNCIO_LABELS,
  formatarMoeda,
  type Anuncio,
  type CanalAnuncio
} from '../../constants/anuncios';
import { CellAction } from './cell-action';

function StatusCanal({ publicado }: { publicado: boolean }) {
  return publicado ? (
    <Badge variant='outline' className='gap-1'>
      <Icons.circleCheck className='h-3 w-3 text-green-600' />
      Publicado
    </Badge>
  ) : (
    <Badge variant='secondary' className='gap-1'>
      <Icons.xCircle className='h-3 w-3' />
      Não publicado
    </Badge>
  );
}

const canalColumn = (canal: CanalAnuncio): ColumnDef<Anuncio> => ({
  id: canal,
  accessorFn: () => CANAL_ANUNCIO_LABELS[canal],
  enableSorting: false,
  header: CANAL_ANUNCIO_LABELS[canal].toUpperCase(),
  cell: ({ row }) => <StatusCanal publicado={row.original.canais[canal]} />
});

export const columns: ColumnDef<Anuncio>[] = [
  {
    id: 'veiculo',
    accessorKey: 'veiculo',
    header: ({ column }: { column: Column<Anuncio, unknown> }) => (
      <DataTableColumnHeader column={column} title='Veículo' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Anuncio['veiculo']>()}</div>,
    meta: {
      label: 'Veículo',
      placeholder: 'Buscar veículo...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'preco',
    accessorKey: 'preco',
    header: ({ column }: { column: Column<Anuncio, unknown> }) => (
      <DataTableColumnHeader column={column} title='Preço' />
    ),
    cell: ({ cell }) => (
      <div className='tabular-nums'>{formatarMoeda(cell.getValue<Anuncio['preco']>())}</div>
    )
  },
  canalColumn('olx'),
  canalColumn('webmotors'),
  canalColumn('mercadoLivre'),
  canalColumn('instagram'),
  canalColumn('facebook'),
  {
    id: 'visualizacoes',
    accessorKey: 'visualizacoes',
    header: ({ column }: { column: Column<Anuncio, unknown> }) => (
      <DataTableColumnHeader column={column} title='Visualizações' />
    ),
    cell: ({ cell }) => (
      <div className='tabular-nums'>{cell.getValue<Anuncio['visualizacoes']>()}</div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
