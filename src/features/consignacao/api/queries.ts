import { queryOptions } from '@tanstack/react-query';
import { getNegociacao, listNegociacoes } from './service';

export const negociacaoKeys = {
  all: ['negociacoes'] as const,
  scope: (organizacaoId: string) => ['negociacoes', organizacaoId] as const,
  list: (organizacaoId: string) => ['negociacoes', organizacaoId, 'list'] as const,
  detail: (organizacaoId: string, id: string) =>
    ['negociacoes', organizacaoId, 'detail', id] as const
};

export const negociacoesQueryOptions = (organizacaoId: string) =>
  queryOptions({
    queryKey: negociacaoKeys.list(organizacaoId),
    queryFn: () => listNegociacoes(),
    staleTime: 0
  });

export const negociacaoQueryOptions = (organizacaoId: string, id: string) =>
  queryOptions({
    queryKey: negociacaoKeys.detail(organizacaoId, id),
    queryFn: () => getNegociacao(id),
    staleTime: 0
  });
