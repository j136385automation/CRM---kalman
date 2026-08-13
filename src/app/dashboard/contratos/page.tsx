import PageContainer from '@/components/layout/page-container';
import ContratosPage from '@/features/contratos/components/contratos-page';
import NovoDocumentoSheet from '@/features/contratos/components/novo-documento-sheet';

export const metadata = {
  title: 'Contratos e Documentos | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Contratos e Documentos'
      pageDescription='Documentos da revenda com assinatura eletrônica e arquivamento.'
      pageHeaderAction={<NovoDocumentoSheet />}
    >
      <ContratosPage />
    </PageContainer>
  );
}
