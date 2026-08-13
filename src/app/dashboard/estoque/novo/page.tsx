import PageContainer from '@/components/layout/page-container';
import VeiculoForm from '@/features/estoque/components/veiculo-form';

export const metadata = {
  title: 'Novo veículo | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Novo veículo'
      pageDescription='Cadastre um veículo no estoque da revenda.'
    >
      <div className='flex-1 space-y-4'>
        <VeiculoForm />
      </div>
    </PageContainer>
  );
}
