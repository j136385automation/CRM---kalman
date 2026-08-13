import PageContainer from '@/components/layout/page-container';
import { FluxoCaixaChart } from '@/features/financeiro/components/fluxo-caixa-chart';
import { FluxoCaixaTable } from '@/features/financeiro/components/fluxo-caixa-table';

export const metadata = {
  title: 'Fluxo de Caixa | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Fluxo de caixa'
      pageDescription='Acompanhe entradas, saídas e saldo acumulado dos últimos 12 meses, com projeção dos próximos 3 meses.'
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <FluxoCaixaChart />
        <FluxoCaixaTable />
      </div>
    </PageContainer>
  );
}
