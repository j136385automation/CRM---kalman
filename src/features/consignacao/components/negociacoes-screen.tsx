import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getQueryClient } from '@/lib/query-client';
import { getNegociacoesContext } from '../api/service';
import { negociacaoQueryOptions, negociacoesQueryOptions } from '../api/queries';
import type { ModalidadeNegociacao } from '../api/types';
import NegociacoesGate, { NegociacoesSkeleton } from './negociacoes-gate';
import NegociacoesList from './negociacoes-list';
import NegociacaoDetail from './negociacao-detail';
import NegociacaoForm from './negociacao-form';

export default async function NegociacoesScreen({
  view,
  id,
  somenteConsignacoes = false,
  defaultModalidade,
  estoqueId
}: {
  view: 'list' | 'nova' | 'detail';
  id?: string;
  somenteConsignacoes?: boolean;
  defaultModalidade?: ModalidadeNegociacao;
  estoqueId?: number;
}) {
  const { orgId } = await auth();
  if (!orgId)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Escolha a empresa</CardTitle>
          <CardDescription>Contratos e consignações são organizados por empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            nativeButton={false}
            render={<Link href='/dashboard/workspaces' aria-label='Selecionar ou criar empresa' />}
          >
            Selecionar ou criar empresa
          </Button>
        </CardContent>
      </Card>
    );

  const context = await getNegociacoesContext();
  if (context.storageMode === 'unconfigured')
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conclua a configuração de armazenamento</CardTitle>
          <CardDescription>
            O administrador precisa conectar o armazenamento da empresa antes de cadastrar operações
            ou emitir documentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Os modelos e o fluxo de consignação estão disponíveis na aplicação. Depois da
            configuração, os cadastros e o histórico de documentos serão salvos para a equipe.
          </p>
        </CardContent>
      </Card>
    );

  const readyContext = { ...context, storageMode: context.storageMode };
  const queryClient = getQueryClient();
  if (view === 'list') void queryClient.prefetchQuery(negociacoesQueryOptions(orgId));
  if (view === 'detail' && id) void queryClient.prefetchQuery(negociacaoQueryOptions(orgId, id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NegociacoesGate context={readyContext}>
        <Suspense fallback={<NegociacoesSkeleton />}>
          {view === 'list' && (
            <NegociacoesList context={readyContext} somenteConsignacoes={somenteConsignacoes} />
          )}
          {view === 'detail' && id && <NegociacaoDetail context={readyContext} id={id} />}
          {view === 'nova' && (
            <NegociacaoForm
              defaultModalidade={defaultModalidade}
              estoqueId={estoqueId}
              disabled={!context.canManage}
            />
          )}
        </Suspense>
      </NegociacoesGate>
    </HydrationBoundary>
  );
}
