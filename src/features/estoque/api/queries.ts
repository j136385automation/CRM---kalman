import { queryOptions } from '@tanstack/react-query';
import { getVeiculos } from './service';
import type { Veiculo, VeiculoFilters } from './types';

export type { Veiculo };

export const veiculoKeys = {
  all: ['veiculos'] as const,
  list: (filters: VeiculoFilters) => [...veiculoKeys.all, 'list', filters] as const
};

export const veiculosQueryOptions = (filters: VeiculoFilters) =>
  queryOptions({
    queryKey: veiculoKeys.list(filters),
    queryFn: () => getVeiculos(filters)
  });
