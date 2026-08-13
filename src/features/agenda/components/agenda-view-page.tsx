import PageContainer from '@/components/layout/page-container';
import { AgendaTable } from './agenda-tables';
import NovoAgendamentoDialog from './novo-agendamento-dialog';

export default function AgendaViewPage() {
  return (
    <PageContainer
      pageTitle='Agenda e Horários'
      pageDescription='Acompanhe test-drives, vistorias, entregas e reuniões da sua revenda'
      pageHeaderAction={<NovoAgendamentoDialog />}
    >
      <AgendaTable />
    </PageContainer>
  );
}
