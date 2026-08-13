import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import FiscalListingPage from '@/features/fiscal/components/fiscal-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Fiscal e Notas | CRM Kalman'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Notas Fiscais'
      pageDescription='Notas de compra, venda, consignação e devolução da sua revenda.'
      pageHeaderAction={
        <Link href='/dashboard/fiscal/nova' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.add className='mr-2 h-4 w-4' /> Emitir nota
        </Link>
      }
    >
      <FiscalListingPage />
    </PageContainer>
  );
}
