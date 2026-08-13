import PageContainer from '@/components/layout/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Messenger } from './messenger';

export default function RoboViewPage() {
  return (
    <PageContainer
      pageTitle='Robô WhatsApp'
      pageDescription='Atendimento automatizado 24h para seus clientes direto no WhatsApp'
      pageHeaderAction={
        <Badge variant='outline' className='gap-2 px-3 py-1.5'>
          <span className='inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-green-500' />
          Robô ativo — atendendo 24h
        </Badge>
      }
    >
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <Alert>
          <Icons.chat className='h-4 w-4' />
          <AlertTitle>Plano Operação IA</AlertTitle>
          <AlertDescription>
            Este módulo faz parte do plano Operação IA (R$ 399/mês). O robô responde clientes,
            agenda test-drives e transfere negociações para a equipe humana quando necessário.
          </AlertDescription>
        </Alert>
        <Messenger />
      </div>
    </PageContainer>
  );
}
