import PageContainer from '@/components/layout/page-container';
import { FinanceiroStats } from '@/features/financeiro/components/financeiro-stats';
import { EntradasSaidasChart } from '@/features/financeiro/components/entradas-saidas-chart';
import { MovimentacoesTable } from '@/features/financeiro/components/movimentacoes-table';

export const metadata = {
  title: 'Financeiro | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Visão financeira'
      pageDescription='Receitas, despesas, contas a pagar e a receber da sua revenda.'
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <FinanceiroStats />
        <EntradasSaidasChart />
        <MovimentacoesTable />
      </div>
    </PageContainer>
  );
}
