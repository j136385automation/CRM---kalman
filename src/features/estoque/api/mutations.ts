import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createVeiculo } from './service';
import { veiculoKeys } from './queries';
import type { VeiculoMutationPayload } from './types';

export const createVeiculoMutation = mutationOptions({
  mutationFn: (data: VeiculoMutationPayload) => createVeiculo(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: veiculoKeys.all });
  }
});
