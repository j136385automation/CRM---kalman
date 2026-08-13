'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { insightsMock } from '../../constants/insights';
import { columns } from './columns';

export function InsightsTable() {
  const { table } = useDataTable({
    data: insightsMock,
    columns,
    pageCount: -1,
    shallow: false
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
