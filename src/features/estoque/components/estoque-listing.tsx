import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { estoqueSearchParamsCache } from '../searchparams';
import { veiculosQueryOptions } from '../api/queries';
import { EstoqueStats } from './estoque-stats';
import { EstoqueTable } from './estoque-tables';

export default function EstoqueListingPage() {
  const page = estoqueSearchParamsCache.get('page');
  const pageLimit = estoqueSearchParamsCache.get('perPage');
  const marca = estoqueSearchParamsCache.get('marca');
  const preco = estoqueSearchParamsCache.get('preco');
  const status = estoqueSearchParamsCache.get('status');
  const sort = estoqueSearchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(marca && { marca }),
    ...(preco && { faixaPreco: preco }),
    ...(status && { status }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(veiculosQueryOptions(filters));

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <EstoqueStats />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EstoqueTable />
      </HydrationBoundary>
    </div>
  );
}
