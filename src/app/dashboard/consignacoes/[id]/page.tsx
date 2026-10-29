import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import NegociacoesScreen from '@/features/consignacao/components/negociacoes-screen';

export const metadata = { title: 'Negociação e contratos | CRM Kalman' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  return (
    <PageContainer
      pageTitle='Negociação e contratos'
      pageDescription='Dados, documentos, recebimentos e histórico desta operação.'
      pageHeaderAction={
        <Button
          variant='outline'
          nativeButton={false}
          render={<Link href='/dashboard/contratos' aria-label='Voltar para contratos' />}
        >
          Voltar
        </Button>
      }
    >
      <NegociacoesScreen view='detail' id={id} />
    </PageContainer>
  );
}
