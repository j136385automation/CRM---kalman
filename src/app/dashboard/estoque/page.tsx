import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import EstoqueListingPage from '@/features/estoque/components/estoque-listing';
import { estoqueSearchParamsCache } from '@/features/estoque/searchparams';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Estoque | CRM Kalman'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  estoqueSearchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Estoque de veículos'
      pageDescription='Gerencie os veículos da sua revenda: preços, dias em estoque e status.'
      pageHeaderAction={
        <div className='flex flex-wrap justify-end gap-2'>
          <Link
            href='/dashboard/consignacoes'
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
          >
            <Icons.fileContract className='mr-2 h-4 w-4' /> Consignações
          </Link>
          <Link
            href='/dashboard/estoque/novo'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Icons.add className='mr-2 h-4 w-4' /> Novo veículo
          </Link>
        </div>
      }
    >
      <EstoqueListingPage />
    </PageContainer>
  );
}
