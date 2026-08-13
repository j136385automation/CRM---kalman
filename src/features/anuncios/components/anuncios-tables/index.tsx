'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { anunciosMock } from '../../constants/anuncios';
import { columns } from './columns';

export function AnunciosTable() {
  const { table } = useDataTable({
    data: anunciosMock,
    columns,
    pageCount: -1,
    shallow: false,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
