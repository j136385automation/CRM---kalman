'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { parseAsString, useQueryStates } from 'nuqs';
import { agendamentosMock } from '../../constants/agendamentos';
import { columns } from './columns';

const diasDisponiveis = [...new Set(agendamentosMock.map((a) => a.data))].toSorted();

function formatarDia(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(ano, mes - 1, dia));
}

export function AgendaTable() {
  const [params, setParams] = useQueryStates({
    dia: parseAsString.withDefault('todos')
  });

  const data = useMemo(
    () =>
      params.dia === 'todos'
        ? agendamentosMock
        : agendamentosMock.filter((a) => a.data === params.dia),
    [params.dia]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: -1,
    shallow: false
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground text-sm'>Filtrar por dia:</span>
        <Select value={params.dia} onValueChange={(value) => setParams({ dia: value as string })}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Todos os dias' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos os dias</SelectItem>
            {diasDisponiveis.map((dia) => (
              <SelectItem key={dia} value={dia}>
                {formatarDia(dia)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
