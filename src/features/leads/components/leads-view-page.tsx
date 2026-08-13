import PageContainer from '@/components/layout/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { LeadsBoard } from './leads-board';
import NovoLeadDialog from './novo-lead-dialog';

export default function LeadsViewPage() {
  return (
    <PageContainer
      pageTitle='Leads'
      pageDescription='Pipeline de vendas: acompanhe cada lead do primeiro contato até o fechamento'
      pageHeaderAction={<NovoLeadDialog />}
    >
      <div className='flex flex-col gap-4'>
        <Alert>
          <Icons.teams className='h-4 w-4' />
          <AlertTitle>Plano Operação IA</AlertTitle>
          <AlertDescription>
            Este módulo faz parte do plano Operação IA (R$ 399/mês), com captura automática de leads
            dos anúncios e distribuição inteligente para a equipe de vendas.
          </AlertDescription>
        </Alert>
        <LeadsBoard />
      </div>
    </PageContainer>
  );
}
