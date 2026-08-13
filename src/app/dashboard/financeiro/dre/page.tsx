import PageContainer from '@/components/layout/page-container';
import { DreTable } from '@/features/financeiro/components/dre-table';

export const metadata = {
  title: 'DRE | CRM Kalman'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='DRE simplificado'
      pageDescription='Demonstrativo de resultado da revenda: receita, impostos, custos, despesas e lucro líquido.'
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <DreTable />
      </div>
    </PageContainer>
  );
}
