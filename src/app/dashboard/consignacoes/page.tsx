import PageContainer from '@/components/layout/page-container';
import NegociacoesScreen from '@/features/consignacao/components/negociacoes-screen';

export const metadata = { title: 'Consignações | CRM Kalman' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Consignações'
      pageDescription='Acompanhe o veículo, o acordo com o proprietário, os documentos e o acerto da operação.'
    >
      <NegociacoesScreen view='list' somenteConsignacoes />
    </PageContainer>
  );
}
