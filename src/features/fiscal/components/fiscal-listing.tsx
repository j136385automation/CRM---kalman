import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { notasFiscaisQueryOptions } from '../api/queries';
import { NotasFiscaisTable } from './fiscal-tables';

export default function FiscalListingPage() {
  const page = searchParamsCache.get('page');
  const pageLimit = searchParamsCache.get('perPage');
  const tipos = searchParamsCache.get('tipo');
  const status = searchParamsCache.get('status');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(tipos && { tipos }),
    ...(status && { status }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(notasFiscaisQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotasFiscaisTable />
    </HydrationBoundary>
  );
}
