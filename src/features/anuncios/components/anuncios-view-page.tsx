import PageContainer from '@/components/layout/page-container';
import { AnunciosStats } from './anuncios-stats';
import { AnunciosTable } from './anuncios-tables';

export default function AnunciosViewPage() {
  return (
    <PageContainer
      pageTitle='Anúncios'
      pageDescription='Publique seus veículos na OLX, Webmotors, Mercado Livre, Instagram e Facebook em um só lugar'
    >
      <div className='flex flex-col gap-4'>
        <AnunciosStats />
        <AnunciosTable />
      </div>
    </PageContainer>
  );
}
