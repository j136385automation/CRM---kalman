import { queryOptions } from '@tanstack/react-query';
import { getNotasFiscais } from './service';
import type { NotaFiscalFilters } from './types';

export type { NotaFiscal } from './types';

export const notaFiscalKeys = {
  all: ['notas-fiscais'] as const,
  list: (filters: NotaFiscalFilters) => [...notaFiscalKeys.all, 'list', filters] as const
};

export const notasFiscaisQueryOptions = (filters: NotaFiscalFilters) =>
  queryOptions({
    queryKey: notaFiscalKeys.list(filters),
    queryFn: () => getNotasFiscais(filters)
  });
