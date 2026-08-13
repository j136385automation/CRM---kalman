import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

// Os filtros usam os ids das colunas da tabela (marca, preco, status),
// pois o useDataTable sincroniza os filtros de coluna com a URL.
export const estoqueSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  marca: parseAsString,
  preco: parseAsString,
  status: parseAsString,
  sort: parseAsString
};

export const estoqueSearchParamsCache = createSearchParamsCache(estoqueSearchParams);
