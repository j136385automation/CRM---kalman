import PageContainer from '@/components/layout/page-container';
import ContabilidadePage from '@/features/contabilidade/components/contabilidade-page';

export const metadata = {
  title: 'Impostos e Contabilidade | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Impostos e Contabilidade'
      pageDescription='Acompanhe os impostos do mês e os relatórios prontos para o seu contador.'
    >
      <ContabilidadePage />
    </PageContainer>
  );
}
