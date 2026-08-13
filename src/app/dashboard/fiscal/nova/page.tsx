import PageContainer from '@/components/layout/page-container';
import NotaFiscalForm from '@/features/fiscal/components/nota-fiscal-form';

export const metadata = {
  title: 'Emitir Nota | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Emitir Nota Fiscal'
      pageDescription='Preencha os dados da nota e simule os impostos antes de emitir.'
    >
      <NotaFiscalForm />
    </PageContainer>
  );
}
